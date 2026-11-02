import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { Project } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningAudit,
} from "../packages/planning/index.js";
import { deliveryAudit } from "../packages/business-case/delivery-audit.js";
import { businessDossier } from "../packages/business-case/index.js";
import { intentRenderingAudit } from "../packages/quality-assurance/index.js";
const fixture = async () => {
  const p = Project.parse(
    JSON.parse(
      await fs.readFile("examples/smartfence-full.project.json", "utf8"),
    ),
  );
  p.slides = compileStoryboard(p);
  return p;
};
test("decision pages cannot omit proposed execution conditions", async () => {
  const p = await fixture();
  assert.deepEqual(deliveryAudit(p), []);
  delete p.businessCase!.deliveryAssurance;
  assert(deliveryAudit(p).some((i) => i.code === "missing-delivery-assurance"));
});
test("stage deliverables and durations must match the actual schedule", async () => {
  const p = await fixture(),
    a = p.businessCase!.deliveryAssurance!;
  a.stageGates[0].nodeId = "absent";
  assert(deliveryAudit(p).some((i) => i.code === "unlinked-stage-gate"));
  const s = p.planning!.story.find(
    (s) => s.visualPlan?.kind === "assured-timeline",
  )!;
  s.visualPlan!.schedule!.ranges[0].length = 99;
  assert(
    planningAudit(p).issues.some((i) => i.code === "invalid-visual-schedule"),
  );
});
test("responsibility and fallback ownership cannot reference missing people or organisations", async () => {
  const p = await fixture(),
    a = p.businessCase!.deliveryAssurance!;
  a.responsibilityRows[0].ownerId = "absent";
  a.fallbacks[0].ownerId = "absent";
  a.claimIds.push("absent");
  const codes = deliveryAudit(p).map((i) => i.code);
  for (const code of [
    "unknown-responsibility-actor",
    "unknown-fallback-owner",
    "unknown-delivery-evidence",
  ])
    assert(codes.includes(code));
});
test("all proposed gates, fallback resumption evidence and decision boundaries survive the dossier", async () => {
  const p = await fixture(),
    a = p.businessCase!.deliveryAssurance!,
    text = businessDossier(p);
  for (const g of a.approvalGates) assert(text.includes(g.holdWhen));
  for (const f of a.fallbacks) assert(text.includes(f.resumeEvidence));
  assert(text.includes(a.laterDecision));
  assert(text.includes("순절감이 아니다"));
});
test("a generic diagram cannot substitute for the four authored execution visuals", async () => {
  const p = await fixture();
  const marks = p.slides.map((s) => ({
    slideId: s.id,
    id: "generic",
    kind: "diagram" as const,
    x: 0.64,
    y: 2.64,
    w: 12,
    h: 3.8,
  }));
  assert.equal(
    intentRenderingAudit(p, marks).filter(
      (i) => i.code === "delivery-visual-not-rendered",
    ).length,
    4,
  );
});
