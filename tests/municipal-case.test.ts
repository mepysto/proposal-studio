import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { Project } from "../packages/core/schema.js";
import { municipalAudit } from "../packages/business-case/municipal-audit.js";
import { intentRenderingAudit } from "../packages/quality-assurance/index.js";
const fixture = async () =>
  Project.parse(
    JSON.parse(
      await fs.readFile("examples/smartfence-full.project.json", "utf8"),
    ),
  );
test("municipal value cases retain measurements and cannot fabricate an expanded price or timeline", async () => {
  const p = await fixture();
  assert.deepEqual(municipalAudit(p), []);
  p.businessCase!.municipalCase!.benefits[0].metricIds = ["unknown"];
  p.businessCase!.municipalCase!.pilot.price = 72000000;
  p.businessCase!.municipalCase!.pilot.totalMonths = 2;
  const codes = municipalAudit(p).map((i) => i.code);
  for (const c of [
    "unknown-municipal-metric",
    "unquoted-municipal-price",
    "divergent-pilot-duration",
  ])
    assert(codes.includes(c));
});
test("city-first narratives require their actual diagrams and preserve provenance off-slide", async () => {
  const p = await fixture();
  assert.equal(
    intentRenderingAudit(p, []).filter(
      (i) => i.code === "municipal-visual-not-rendered",
    ).length,
    7,
  );
  delete p.businessCase!.municipalCase;
  assert(municipalAudit(p).some((i) => i.code === "missing-municipal-case"));
  assert(
    p.slides.find((s) => s.id === "summary")!.image!.rights === "generated",
  );
  assert(
    p.slides.find((s) => s.id === "summary")!.image!.caption.includes("예시"),
  );
});
