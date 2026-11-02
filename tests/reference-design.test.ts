import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";
import { Project } from "../packages/core/schema.js";
import { render } from "../packages/pptx-renderer/index.js";
import {
  planningAudit,
  compileStoryboard,
} from "../packages/planning/index.js";
import {
  directionAudit,
  compositionRenderingAudit,
} from "../packages/art-direction/index.js";
import { geometry } from "../packages/quality-assurance/index.js";
const fixture = async () =>
  Project.parse(
    JSON.parse(
      await fs.readFile("examples/reference-direction.project.json", "utf8"),
    ),
  );

test("reference principles bind to actual controls and page-level factual evidence", async () => {
  const p = await fixture();
  assert.equal(planningAudit(p).status, "ready-for-human-review");
  const fake = structuredClone(p);
  fake.planning!.story[1].compositionBrief!.chartFocus!.series = "unknown";
  assert(
    directionAudit(fake, false).some((i) => i.code === "invalid-chart-focus"),
  );
  const unbound = structuredClone(p);
  delete unbound.planning!.story[1].compositionBrief!.chartFocus;
  assert(
    directionAudit(unbound, false).some(
      (i) => i.code === "reference-control-not-authored",
    ),
  );
  const source = structuredClone(p);
  source.planning!.story[0].compositionBrief!.referenceApplications![0].sourceId =
    "unknown";
  assert(
    directionAudit(source, false).some(
      (i) => i.code === "unbound-reference-application",
    ),
  );
  const unsupportedClaim = structuredClone(p);
  unsupportedClaim.planning!.story[0].compositionBrief!.narrative!.evidenceClaimIds =
    ["unknown"];
  assert(
    directionAudit(unsupportedClaim, false).some(
      (i) => i.code === "unbound-narrative-evidence",
    ),
  );
  const malformed = structuredClone(p);
  malformed.planning!.story[4].compositionBrief!.mapLayout!.labels.A = {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  };
  assert(
    directionAudit(malformed, false).some(
      (i) => i.code === "invalid-map-layout",
    ),
  );
});

test("reference-led output changes typography/focus/grouping while preserving native data and no third-party assets", async () => {
  const p = await fixture(),
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "reference-design-"));
  try {
    const file = path.join(dir, "proposal.pptx"),
      { elements } = await render(p, file);
    assert.deepEqual(geometry(elements), []);
    assert.deepEqual(compositionRenderingAudit(p, elements), []);
    assert.equal(
      elements.find(
        (e) => e.slideId === "spatial" && e.compositionPart === "title",
      )!.fontSize,
      36,
    );
    assert.equal(
      elements.find(
        (e) => e.slideId === "handoff" && e.compositionNodeId === "notify",
      )!.shapeType,
      "line",
    );
    assert(
      elements.some(
        (e) =>
          e.chartFocusSeries === "보행자 사망자" &&
          e.kind === "text" &&
          e.text!.includes("17명") &&
          e.text!.includes("13명"),
      ),
    );
    assert(elements.filter((e) => e.mapLabelId).length === 3);
    assert(!elements.some((e) => e.image?.path.includes("design-benchmark")));
    const damaged = elements.filter(
      (e) =>
        !(
          e.slideId === "handoff" &&
          e.compositionNodeId === "control" &&
          e.kind === "text"
        ),
    );
    assert(
      compositionRenderingAudit(p, damaged).some(
        (i) => i.code === "composition-node-not-rendered",
      ),
    );
    const missingFocus = elements.filter(
      (e) => !(e.chartFocusSeries && e.kind === "text"),
    );
    assert(
      compositionRenderingAudit(p, missingFocus).some(
        (i) => i.code === "chart-focus-note-not-rendered",
      ),
    );
    const wrongType = structuredClone(elements);
    wrongType.find(
      (e) => e.slideId === "spatial" && e.compositionPart === "caption",
    )!.fontSize = 8;
    assert(
      compositionRenderingAudit(p, wrongType).some(
        (i) => i.code === "composition-type-scale-mismatch",
      ),
    );
    const zip = await JSZip.loadAsync(await fs.readFile(file));
    const xml = await zip.file("ppt/charts/chart1.xml")!.async("string");
    for (const value of ["34", "27", "17", "13"])
      assert(xml.includes(`<c:v>${value}</c:v>`));
    assert(xml.includes('val="8A4A25"')); // Selected series remains native and source values intact.
    p.planning!.story[2].compositionBrief!.typography!.nodeTitleSize = 22;
    assert(planningAudit(p).issues.some((i) => i.code === "stale-storyboard"));
    p.slides = compileStoryboard(p);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
