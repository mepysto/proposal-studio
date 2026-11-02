import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { Project } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningAudit,
} from "../packages/planning/index.js";
import { extendPublicSafety } from "../scripts/extend-public-safety.js";
test("public safety extends after field demonstration without duplicating pages or implying unique CCTV analytics", async () => {
  const raw = JSON.parse(
    await fs.readFile("examples/smartfence-full.project.json", "utf8"),
  );
  extendPublicSafety(raw);
  extendPublicSafety(raw);
  const p = Project.parse(raw);
  p.slides = compileStoryboard(p);
  assert.deepEqual(
    p.slides.slice(-4).map((s) => s.id),
    ["cctv-extension", "public-safety-spaces", "decision", "contact"],
  );
  assert.equal(p.slides.length, 27);
  assert.equal(
    p.businessCase!.publicSafety!.status,
    "proposed-extension-not-validated",
  );
  assert(
    p.businessCase!.publicSafety!.comparison.some(
      (r) => r.intelligent.includes("음성"),
    ),
  );
  assert(
    p.claims
      .find((c) => c.id === "intelligent-cctv-baseline")!
      .sourceIds.includes("AXIS-PUBLIC-20261030"),
  );
  assert.deepEqual(
    planningAudit(p).issues.filter((i) => i.severity === "error"),
    [],
  );
  const missing=structuredClone(p);delete missing.businessCase!.publicSafety;
  assert(planningAudit(missing).issues.some(i=>i.code==="missing-public-safety-contract"));
  p.businessCase!.publicSafety!.claimIds.push("invented-source");
  assert(
    planningAudit(p).issues.some((i) => i.code === "unknown-business-evidence"),
  );
});
