import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import JSZip from "jszip";
import { Project } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningAudit,
} from "../packages/planning/index.js";
import {
  directionAudit,
  compositionRenderingAudit,
  directionDossier,
  colBox,
  splitColumns,
  splitRows,
  computeGraphBoxes,
  contains,
  overlaps,
} from "../packages/art-direction/index.js";
import {
  resolveTokens,
  legacyTokens,
} from "../packages/art-direction/tokens.js";
import { render } from "../packages/pptx-renderer/index.js";
import { review, geometry } from "../packages/quality-assurance/index.js";
import { designDiagnostics } from "../packages/design-review/index.js";
const fixture = async () =>
  Project.parse(
    JSON.parse(
      await fs.readFile("examples/concept-direction.project.json", "utf8"),
    ),
  );

test("authored concept survives parsing, planning and dossier; changes invalidate compiled intent", async () => {
  const p = await fixture();
  assert.equal(planningAudit(p).status, "ready-for-human-review");
  const compiled = compileStoryboard(p);
  assert.deepEqual(
    compiled[0].compositionBrief,
    p.planning!.story[0].compositionBrief,
  );
  assert.equal(
    directionDossier(p).designDirection?.concept,
    p.designDirection!.concept,
  );
  const changed = structuredClone(p);
  changed.designDirection!.concept += " — 현장 확인";
  assert(
    planningAudit(changed).issues.some((i) => i.code === "stale-storyboard"),
  );
  const moved = structuredClone(p);
  moved.planning!.story[0].compositionBrief!.title.x += 0.1;
  assert(directionAudit(moved).some((i) => i.code === "stale-composition"));
  const removed = structuredClone(p);
  delete removed.planning!.story[0].compositionBrief;
  assert(
    directionAudit(removed).some((i) => i.code === "orphaned-composition"),
  );
  const unsupported = structuredClone(p);
  unsupported.planning!.story[1].compositionBrief!.visual = "graph";
  assert(
    directionAudit(unsupported, false).some(
      (i) => i.code === "unsupported-composition-binding",
    ),
  );
  const typo: any = structuredClone(p);
  typo.planning.story[0].compositionBrief.engine = "future-auto-engine";
  assert.throws(() => Project.parse(typo));
  const unknown: any = structuredClone(p);
  unknown.designDirection.inventedStyle = true;
  assert.throws(() => Project.parse(unknown));
  const ref = structuredClone(p);
  ref.designDirection!.references[0].sourceId = "missing";
  assert(
    directionAudit(ref).some((i) => i.code === "unknown-design-reference"),
  );
});

test("semantic primitives render authored geometry, editable evidence, accurate marks and explicit errors", async () => {
  const p = await fixture();
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "proposal-direction-"));
  try {
    const file = path.join(dir, "authored.pptx");
    const { elements } = await render(p, file);
    assert.deepEqual(geometry(elements), []);
    assert.deepEqual(compositionRenderingAudit(p, elements), []);
    assert.deepEqual(
      review(p, elements).issues.map((i) => i.code),
      ["pdf-not-verified"],
    );
    // Same relationship, different authored task: actual node positions change.
    const a = elements.find(
      (e) => e.slideId === "handoff" && e.text === "현장 통제",
    )!;
    const b = elements.find(
      (e) => e.slideId === "responsibility" && e.text === "현장 통제",
    )!;
    assert.notEqual(a.x, b.x);
    assert.notEqual(a.y, b.y);
    const damaged = elements.filter(
      (e) => !(e.slideId === "evidence" && e.compositionPart === "visual"),
    );
    assert(
      compositionRenderingAudit(p, damaged).some(
        (i) => i.slideId === "evidence",
      ),
    );
    const moved = structuredClone(elements);
    moved.find((e) => e.compositionPart === "title")!.x += 0.5;
    assert(compositionRenderingAudit(p, moved).length);
    const zip = await JSZip.loadAsync(await fs.readFile(file));
    const slide = await zip.file("ppt/slides/slide1.xml")!.async("string");
    assert(slide.includes('val="8A4A25"'));
    assert(slide.includes("출입구에서"));
    const chart = await zip.file("ppt/charts/chart1.xml")!.async("string");
    for (const value of ["34", "27", "17", "13"])
      assert(chart.includes(`<c:v>${value}</c:v>`));
    const absent = structuredClone(p);
    delete absent.planning!.story[0].compositionBrief!.nodeBoxes.truck;
    await assert.rejects(
      render(absent, path.join(dir, "missing.pptx")),
      /composition-node-binding/,
    );
    const unsupported = structuredClone(p);
    unsupported.planning!.story[1].compositionBrief!.visual = "scene";
    await assert.rejects(
      render(unsupported, path.join(dir, "unsupported.pptx")),
      /unsupported-composition-binding/,
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("project palette resolution is isolated under concurrent render and retains legacy defaults", async () => {
  const p = await fixture(),
    q = await fixture();
  q.design.colors.accent = "682C80";
  q.design.colors.ink = "31233B";
  q.slides = compileStoryboard(q);
  const legacy = structuredClone(p);
  delete legacy.designDirection;
  assert.deepEqual(resolveTokens(legacy), legacyTokens);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "proposal-palettes-"));
  try {
    await Promise.all([
      render(p, path.join(dir, "a.pptx")),
      render(q, path.join(dir, "b.pptx")),
    ]);
    const colors = await Promise.all(
      ["a", "b"].map(async (name) => {
        const zip = await JSZip.loadAsync(
          await fs.readFile(path.join(dir, `${name}.pptx`)),
        );
        return zip.file("ppt/slides/slide1.xml")!.async("string");
      }),
    );
    assert(colors[0].includes('val="8A4A25"'));
    assert(!colors[0].includes('val="682C80"'));
    assert(colors[1].includes('val="682C80"'));
    assert(!colors[1].includes('val="8A4A25"'));
    assert.equal(legacyTokens.accent, "087F8C");
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("repetition diagnostics detect shared actual frames across different information kinds", async () => {
  const p = await fixture();
  p.slides = p.slides
    .slice(0, 3)
    .map((s) => ({ ...s, compositionBrief: undefined }));
  const elements = p.slides.flatMap((s) => [
    {
      slideId: s.id,
      id: "title",
      kind: "text" as const,
      text: s.title,
      x: 0.64,
      y: 0.78,
      w: 12.05,
      h: 0.7,
    },
    {
      slideId: s.id,
      id: "band",
      kind: "shape" as const,
      emphasisRole: "primary-background" as const,
      x: 0.64,
      y: 1.78,
      w: 12.04,
      h: 0.7,
    },
  ]);
  assert(
    designDiagnostics(p, elements)[2].findings.some(
      (f) => f.code === "repeated-frame",
    ),
  );
});

test("grid compiler and ELK computeGraphBoxes produce non-overlapping boxes within safe bounds", async () => {
  const full = colBox(1, 12, 2.7, 3.6);
  assert.equal(full.x, 0.64);
  assert(Math.abs(full.w - 12.053) < 0.01);
  const [left, right] = splitColumns(full, [0.6, 0.4], 0.24);
  assert(contains(full, left) && contains(full, right));
  assert(!overlaps(left, right));
  const rows = splitRows(right, [1, 1, 1], 0.18);
  assert.equal(rows.length, 3);
  assert(rows.every((r) => contains(right, r)));
  assert(!overlaps(rows[0], rows[1]) && !overlaps(rows[1], rows[2]));

  const graphLayout = await computeGraphBoxes(
    full,
    [
      { id: "n1", label: "감지" },
      { id: "n2", label: "판단" },
      { id: "n3", label: "통제" },
    ],
    [
      { from: "n1", to: "n2", label: "이벤트" },
      { from: "n2", to: "n3" },
    ],
  );
  assert.equal(Object.keys(graphLayout.nodeBoxes).length, 3);
  assert(
    Object.values(graphLayout.nodeBoxes).every((b) => contains(full, b)),
  );
  assert(!overlaps(graphLayout.nodeBoxes.n1, graphLayout.nodeBoxes.n2));
  assert(graphLayout.edgeLabelBoxes["n1:n2"]);
  assert(graphLayout.edgeRoutes["n1:n2"].waypoints.length >= 2);
});

test("expanded authored primitives (causal-chain, swimlane, annotated-screen, edgeRoutes) audit and render", async () => {
  const p = await fixture();
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "proposal-primitives-"));
  try {
    // 1) Swimlane with orthogonal edgeRoutes on handoff slide
    const handoffBeat = p.planning!.story.find((s) => s.id === "handoff")!;
    const vBox = handoffBeat.compositionBrief!.visualBox;
    const [sysLane, humanLane] = splitRows(vBox, [1, 1], 0.16);
    const sysCols = splitColumns(
      { x: sysLane.x + 1.4, y: sysLane.y + 0.08, w: sysLane.w - 1.52, h: sysLane.h - 0.16 },
      [1, 1],
      0.32,
    );
    const humanCols = splitColumns(
      { x: humanLane.x + 1.4, y: humanLane.y + 0.08, w: humanLane.w - 1.52, h: humanLane.h - 0.16 },
      [1, 1],
      0.32,
    );
    const nodes = handoffBeat.visualPlan!.nodes;
    const nodeBoxes: Record<string, any> = {
      [nodes[0].id]: sysCols[0],
      [nodes[1].id]: sysCols[1],
      [nodes[2].id]: humanCols[0],
    };
    const nodeLanes: Record<string, string> = {
      [nodes[0].id]: "시스템 감지·알림",
      [nodes[1].id]: "시스템 감지·알림",
      [nodes[2].id]: "현장 유도원·책임",
    };
    const edgeRoutes: Record<string, { waypoints: [number, number][] }> = {};
    for (const e of handoffBeat.visualPlan!.edges) {
      const a = nodeBoxes[e.from];
      const z = nodeBoxes[e.to];
      if (Math.abs(a.y - z.y) < 0.01) {
        edgeRoutes[`${e.from}:${e.to}`] = {
          waypoints: [
            [a.x + a.w, a.y + a.h / 2],
            [z.x, z.y + z.h / 2],
          ],
        };
      } else {
        const midY = Math.round(((a.y + a.h + z.y) / 2) * 1000) / 1000;
        edgeRoutes[`${e.from}:${e.to}`] = {
          waypoints: [
            [a.x + a.w / 2, a.y + a.h],
            [a.x + a.w / 2, midY],
            [z.x + z.w / 2, midY],
            [z.x + z.w / 2, z.y],
          ],
        };
      }
    }
    handoffBeat.compositionBrief = {
      ...handoffBeat.compositionBrief!,
      visual: "swimlane",
      visualBox: vBox,
      nodeBoxes,
      edgeLabelBoxes: {},
      edgeRoutes,
      swimlaneLayout: {
        laneHeaderWidth: 1.3,
        lanes: {
          "시스템 감지·알림": sysLane,
          "현장 유도원·책임": humanLane,
        },
        nodeLanes,
      },
    };
    handoffBeat.visualPlan!.edges = handoffBeat.visualPlan!.edges.map((e) => ({
      ...e,
      label: "",
    }));

    // 2) Causal-chain primitive on a causal-flow beat
    const respBeat = p.planning!.story.find((s) => s.id === "responsibility")!;
    respBeat.visualPlan!.kind = "causal-flow";
    respBeat.visualPlan!.intent = "causal";
    respBeat.visualPlan!.chains = [
      {
        id: "c1",
        cause: "공사 출입구 시야 가림",
        intervention: "물리 분리 및 접근 감지 알림",
        response: "유도원 직접 확인 후 통행 통제",
        result: "교차 위험 노출 감소 가설 검증",
        mechanismIds: [p.planning!.problem.mechanisms[0].id],
        interventionIds: [p.planning!.interventions[0].id],
        alternativeIds: [],
        metricIds: [p.planning!.validation[0].id],
        evidenceIds: respBeat.proofClaimIds,
        resultStatus: "hypothesis",
      },
    ];
    const chainArea = respBeat.compositionBrief!.visualBox;
    const stepCols = splitColumns(
      { x: chainArea.x + 0.1, y: chainArea.y + 0.3, w: chainArea.w - 0.2, h: 1.6 },
      [1, 1, 1, 1],
      0.28,
    );
    respBeat.compositionBrief = {
      ...respBeat.compositionBrief!,
      visual: "causal-chain",
      nodeTreatment: undefined,
      edgeLabelBoxes: {},
      nodeBoxes: {
        "c1:cause": stepCols[0],
        "c1:intervention": stepCols[1],
        "c1:response": stepCols[2],
        "c1:result": stepCols[3],
      },
    };

    p.slides = compileStoryboard(p);
    assert.deepEqual(directionAudit(p), []);
    const outPptx = path.join(dir, "primitives.pptx");
    const { elements } = await render(p, outPptx);
    assert.deepEqual(compositionRenderingAudit(p, elements), []);
    assert(
      elements.some(
        (e) => e.slideId === "responsibility" && e.causalChainIds?.includes("c1"),
      ),
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
