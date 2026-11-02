import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Project } from "../packages/core/schema.js";
import {
  planningAudit,
  compileStoryboard,
} from "../packages/planning/index.js";
import { render } from "../packages/pptx-renderer/index.js";
import {
  geometry,
  visualCoverage,
  identityAndAlignment,
  intentRenderingAudit,
} from "../packages/quality-assurance/index.js";
import { briefs } from "../packages/visual-assets/index.js";
const fixture = async () => {
  const p = Project.parse(
    JSON.parse(
      await fs.readFile("examples/smartfence-full.project.json", "utf8"),
    ),
  );
  p.slides = compileStoryboard(p);
  return p;
};
test("visual-first proposals reject a missing page plan, broken relationship and missing map", async () => {
  const p = await fixture();
  delete p.planning!.story[1].visualPlan;
  p.planning!.story[2].visualPlan!.edges.push({
    from: "not-a-node",
    to: "n1",
    label: "",
  });
  p.planning!.story.find(
    (s) => s.id === "site-station",
  )!.visualPlan!.map!.assetId = "absent";
  const codes = planningAudit(p).issues.map((i) => i.code);
  for (const code of [
    "missing-page-visual",
    "invalid-visual-relationship",
    "missing-geographic-asset",
  ])
    assert(codes.includes(code), code);
});
test("diagram evidence and schedule duration must correspond to the authored plan", async () => {
  const p = await fixture();
  p.planning!.story[1].visualPlan!.evidenceIds = ["city-council"];
  const timeline = p.planning!.story.find((s) =>
    ["timeline", "assured-timeline"].includes(s.visualPlan?.kind || ""),
  )!.visualPlan!;
  timeline.schedule!.ranges[0].length = 50;
  const codes = planningAudit(p).issues.map((i) => i.code);
  assert(codes.includes("unlinked-visual-evidence"));
  assert(codes.includes("invalid-visual-schedule"));
});
test("compiled visual substitutions cannot bypass the canonical visual plan", async () => {
  const p = await fixture();
  p.slides[1].reasoning!.visualPlan!.takeaway =
    "장비 판매로 문서의 목적을 바꿉니다";
  assert(
    planningAudit(p).issues.some((i) => i.code === "divergent-storyboard"),
  );
});
test("text, decorative rules and a declared empty diagram do not satisfy rendered visual coverage", async () => {
  const p = await fixture();
  const e = {
    slideId: p.slides[1].id,
    id: "empty",
    kind: "diagram" as const,
    visualRole: "explanation" as const,
    x: 0.65,
    y: 2.68,
    w: 12,
    h: 3.9,
  };
  assert.equal(visualCoverage(p, []).length, 27);
  assert.equal(visualCoverage(p, [e]).length, 27);
});
test("all 27 pages render substantial explanatory visuals without layout errors; briefs identify real asset types", async () => {
  const p = await fixture(),
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "proposal-visual-"));
  try {
    const result = await render(p, path.join(dir, "proposal.pptx"));
    assert.deepEqual(
      geometry(result.elements).filter((i) => i.severity === "error"),
      [],
    );
    assert.deepEqual(visualCoverage(p, result.elements), []);
    assert.deepEqual(identityAndAlignment(p, result.elements), []);
    assert.deepEqual(intentRenderingAudit(p, result.elements), []);
    assert.equal(result.elements.filter((e) => e.geographicAssetId).length, 3);
    assert.equal(result.elements.filter((e) => e.causalChainIds).length, 1);
    assert(
      result.elements
        .filter((e) => e.kind === "icon")
        .every((e) => e.vectorAsset?.library === "Lucide"),
    );
    const cover = result.elements.filter(
      (e) => e.slideId === "cover" && e.kind === "text",
    );
    assert(
      cover.some((e) => e.text === p.proposer!.legalName && e.fontSize! >= 20),
    );
    for (const name of (p.proposer!.coverCollaborators ?? p.proposer!.collaborators))
      assert(cover.some((e) => e.text?.includes(name)));
    assert(!cover.some(e=>e.text?.includes("비트리")));
    assert(p.proposer!.collaborators.includes("비트리"));
    assert.equal(
      result.elements.filter((e) => e.kind === "diagram").length,
      25,
    );
    assert.equal(result.elements.filter((e) => e.kind === "image").length, 15);
    const collaboration=result.elements.filter(e=>e.slideId==="time-scenario"&&e.collaborationEdge);
    assert.equal(collaboration.length,3);
    assert(collaboration.every(e=>e.collaborationEdge!.bidirectional));
    assert(intentRenderingAudit(p,result.elements.filter(e=>e!==collaboration[0])).some(i=>i.code==="collaboration-link-not-rendered"));
    assert.equal(result.elements.filter(e=>e.slideId==="kpis"&&e.demonstrationId).length,3);
    assert(!result.elements.some(e=>e.slideId==="kpis"&&e.kind==="image"));
    assert(!p.slides.some(s=>s.id==="risks"));
    const feed=result.elements.find(e=>e.slideId==="architecture"&&e.id==="driver-cctv-feed")!;
    for(const o of p.businessCase!.productStrategy!.driverScreen!.objectBoxes){
      const box=result.elements.find(e=>e.slideId==="architecture"&&e.displayObjectId===o.id)!;
      assert(Math.abs(box.x-(feed.x+o.x*feed.w))<1e-9);
      assert(Math.abs(box.y-(feed.y+o.y*feed.h))<1e-9);
      assert(Math.abs(box.w-o.w*feed.w)<1e-9);
      assert(Math.abs(box.h-o.h*feed.h)<1e-9);
    }
    assert(result.elements.some(e=>e.slideId==="architecture"&&e.fieldSafetyIndicator));
    assert.equal(result.elements.filter(e=>e.slideId==="organization"&&e.kind==="image").length,3);
    assert.equal(result.elements.filter((e) => e.kind === "chart").length, 1);
    assert.equal(
      briefs(p).filter(
        (b) => b.production === "illustration-with-editable-labels",
      ).length,
      4,
    );
    assert.equal(
      briefs(p).filter((b) => b.production === "editable-native-chart").length,
      1,
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("new full proposals cannot silently fall back to text-only authoring", async () => {
  const p = await fixture();
  delete p.planning!.visualPolicy;
  assert(
    planningAudit(p).issues.some((i) => i.code === "missing-visual-policy"),
  );
});

test("proposer identity and title alignment are required in the actual output", async () => {
  const p = await fixture();
  delete p.proposer;
  assert(planningAudit(p).issues.some((i) => i.code === "missing-proposer"));
  const good = await fixture();
  assert.equal(
    identityAndAlignment(good, []).filter(
      (i) => i.code === "missing-company-on-page",
    ).length,
    27,
  );
  const title = {
    slideId: good.slides[1].id,
    id: "misaligned",
    kind: "text" as const,
    x: 1,
    y: 0.78,
    w: 12,
    h: 1,
    text: good.slides[1].title,
    align: "center",
  };
  assert(
    identityAndAlignment(good, [title]).some(
      (i) => i.code === "title-grid-misalignment",
    ),
  );
});

test("ELK connects declared nodes and produces non-overlapping layout bounds", async () => {
  const { layoutGraph } =
    await import("../packages/pptx-renderer/professional-kit.js");
  const g = await layoutGraph(
    [{ id: "a" }, { id: "b" }, { id: "c" }],
    [
      { from: "a", to: "b" },
      { from: "b", to: "c" },
    ],
  );
  assert.equal(g.edges.length, 2);
  for (const e of g.edges) {
    const a = g.nodes.find((n) => n.id === e.source)!,
      b = g.nodes.find((n) => n.id === e.target)!;
    assert(a.x + a.w <= b.x);
    const first = e.points[0],
      last = e.points.at(-1)!;
    assert(Math.abs(first[0] - a.x - a.w) < 0.001);
    assert(Math.abs(last[0] - b.x) < 0.001);
  }
});

test("editorial titles reject narrated endings without changing ordinary explanatory body copy", async () => {
  const p = await fixture();
  assert(!identityAndAlignment(p, []).some((i) => i.code === "narrated-page-title"));
  p.slides[1].title = "차량과 보행자에게 알립니다";
  p.slides[2].title = "출입구 안전을 확인합니다";
  p.slides[3].message = "출입구 위험은 현장에서 조사합니다.";
  assert.equal(identityAndAlignment(p, []).filter((i) => i.code === "narrated-page-title").length, 2);
});
