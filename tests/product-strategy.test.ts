import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { Project } from "../packages/core/schema.js";
import { compileStoryboard } from "../packages/planning/index.js";
import { productAudit } from "../packages/business-case/product-audit.js";
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
test("user product strategy preserves all audiences and expanded costs remain unquoted", async () => {
  const p = await fixture(),
    s = p.businessCase!.productStrategy!;
  assert.deepEqual(productAudit(p), []);
  assert.equal(s.modules.length, 3);
  assert(s.costLines.every((c) => c.amount === null));
  assert(s.budgetRevision.addedScope.some((s) => s.includes("대형 LED")));
  assert(
    s.displayStates
      .find((s) => s.id === "not-detected")!
      .action.includes("통행 허가 아님"),
  );
  const text = businessDossier(p);
  for (const stage of s.lifecycle) assert(text.includes(stage.gate));
  assert(text.includes("신규구매안과 반복 활용안"));
});
test("display failures, repeat costs and reuse stages cannot silently disappear", async () => {
  const p = await fixture(),
    s = p.businessCase!.productStrategy!;
  s.displayStates[2].id = "unknown";
  s.lifecycle[3].id = "unknown";
  s.costLines = s.costLines.filter((c) => c.id !== "storage");
  s.costLines[0].amount = 1;
  const codes = productAudit(p).map((i) => i.code);
  for (const code of [
    "incomplete-display-states",
    "incomplete-reuse-cycle",
    "missing-repeat-cost",
    "unquoted-expanded-price",
  ])
    assert(codes.includes(code));
  s.driverScreen!.objectBoxes[0].x=.99;
  assert(productAudit(p).some(i=>i.code==="object-box-outside-source"));
});
test("modules require real metric references and product pages require actual rendering", async () => {
  const p = await fixture();
  p.businessCase!.productStrategy!.modules[0].metricIds = ["absent"];
  assert(productAudit(p).some((i) => i.code === "unmeasured-product-module"));
  assert.equal(
    intentRenderingAudit(p, []).filter(
      (i) => i.code === "product-visual-not-rendered",
    ).length,
    3,
  );
  delete p.businessCase!.productStrategy;
  assert(productAudit(p).some((i) => i.code === "missing-product-strategy"));
});

test("reapplying product authoring does not duplicate measurement conditions or change the proposal", async () => {
  const { applyProductStrategy } =
    await import("../scripts/apply-product-strategy.js");
  const p: any = await fixture();
  applyProductStrategy(p);
  const first = structuredClone(p);
  applyProductStrategy(p);
  assert.deepEqual(p, first);
});
