import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Project } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningAudit,
} from "../packages/planning/index.js";
import {
  budgetTotals,
  businessDossier,
} from "../packages/business-case/index.js";
const fixture = () => {
  const p = Project.parse(
    JSON.parse(
      fs.readFileSync("examples/safesurface-cheonan.project.json", "utf8"),
    ),
  );
  p.slides = compileStoryboard(p);
  return p;
};
test("SafeSurface retains the source budget, 30-page buyer scope and unobserved evidence posture", () => {
  const p = fixture();
  assert.deepEqual(planningAudit(p).issues, []);
  assert.equal(p.slides.length, 30);
  const total = budgetTotals(p.businessCase!.budget);
  assert.equal(total.low, 86000000);
  assert.equal(total.high, 198000000);
  assert.equal(p.planning!.problem.localEvidence.status, "not-yet-observed");
  assert(
    p.businessCase!.metrics.every(
      (m) => m.baseline === null && m.target === null,
    ),
  );
  assert(
    p.planning!.story.every(
      (b) => b.visualPlan?.explanation?.requiredMarks.length,
    ),
  );
  assert.equal(p.proposer!.legalName, "(주)에스엘티");
  assert.equal(p.proposer!.contact!.phone, "(041) 571-2057/8");
});
test("business dossier omits a time-saving calculation when no comparison input exists", () => {
  const p = fixture();
  assert.equal(p.businessCase!.timeScenario, undefined);
  const d = businessDossier(p);
  assert(d.includes("비교 입력이 없으므로 계산하지 않음"));
  assert(!d.includes("시간 절감 계산 예시"));
});
test("SafeSurface preserves two winters and safety stops from every operating state", () => {
  const p = fixture();
  const v = p.planning!.story.find((s) => s.id === "schedule")!.visualPlan!;
  assert.equal(v.schedule!.slots, 17);
  assert.deepEqual(
    v.schedule!.ranges.map((r) => [r.start, r.length]),
    [
      [0, 2],
      [1, 3],
      [2, 6],
      [8, 6],
      [12, 5],
    ],
  );
  const stages = p.planning!.story.find(
    (s) => s.id === "vision-stages",
  )!.visualPlan!;
  assert(stages.edges.some((e) => e.from === "n3" && e.to === "n5"));
  assert(stages.edges.some((e) => e.from === "n1" && e.to === "n5"));
});

test("a selected time comparison cannot silently render absent inputs", () => {
  const p = fixture();
  p.planning!.story.find(
    (s) => s.id === "vision-operations",
  )!.visualPlan!.kind = "time-balance";
  assert(
    planningAudit(p, false).issues.some(
      (i) => i.code === "missing-time-scenario",
    ),
  );
});

test("the first-meeting narrative expands the problem and source-backed products while deferring internal delivery detail", () => {
  const p = fixture(),
    ids = p.planning!.story.map((s) => s.id);
  assert(ids.indexOf("citizen-impact") < ids.indexOf("ecoway-product"));
  assert(ids.indexOf("manager-burden") < ids.indexOf("ecoway-product"));
  for (const id of [
    "ecoway-product",
    "ecoway-operation",
    "vision-overview",
    "vision-dashboard",
    "vision-site",
    "vision-ai",
    "vision-stages",
    "vision-alerts",
    "vision-operations",
  ])
    assert(ids.includes(id));
  for (const id of [
    "hil",
    "acceptance",
    "maturity",
    "tco",
    "lifecycle",
    "bridge",
    "sources",
    "budget",
  ])
    assert(!ids.includes(id));
  assert(p.sources.some((s) => s.id === "vision-manual"));
  for (const s of p.planning!.story.filter((s) => s.id.startsWith("vision-")))
    assert(s.proofClaimIds.includes("vision-workflow"));
});
test("spatial callouts cannot refer to nonexistent or duplicate explanation nodes", () => {
  const p = fixture(),
    v = p.planning!.story.find((s) => s.id === "essential-access")!.visualPlan!;
  v.scene!.annotations![0].nodeId = "not-a-page-node";
  assert(
    planningAudit(p, false).issues.some(
      (i) => i.code === "invalid-scene-annotation",
    ),
  );
});

 test("buyer deck starts product story from road snowmelting and omits commercial amounts", () => {
  const p = fixture(), ids=p.planning!.story.map(s=>s.id);
  assert(ids.indexOf("ecoway-origin") < ids.indexOf("ecoway-product"));
  assert(!ids.includes("budget"));
  const visible=JSON.stringify(p.planning!.story)+JSON.stringify(p.businessCase!.sections);
  assert(!/8,600|19,800|1억|VAT|요금|초기 기획비/.test(visible));
 });
test('omitting economics needs an explicit presentation scope decision', () => {
  const p=fixture();
  p.businessCase!.economicsPresentation='included';
  assert(planningAudit(p,false).issues.some(i=>i.code==='missing-business-chapter'));
});

test("ECO WAY energy comparison is a source-linked maximum-claim conversion, not a field measurement", () => {
  const p=fixture(),d=p.quantitativeDatasets.find(d=>d.id==='ecoway-relative-energy')!;
  assert.equal(d.status,'derived-assumption');
  assert.deepEqual(d.rows.map(r=>r.value),[100,10]);
  assert(Math.abs(d.rows[1].value-d.rows[0].value*(1-0.9))<0.0001);
  assert(d.sourceClaimIds.includes('ecoway-energy'));
  const v=p.planning!.story.find(s=>s.id==='ecoway-product')!.visualPlan!;
  assert.equal(v.chart!.datasetId,d.id);
  assert(v.explanation!.requiredMarks.includes('chart'));
  assert(p.claims.find(c=>c.id==='ecoway-energy')!.sourceIds.includes('nano-product'));
});
test('manual-derived screens bind illustrative values to source claims and buyer decisions', () => {
 const p=fixture();
 const screens=p.planning!.story.filter(b=>b.visualPlan!.interfaceExample);
 assert.equal(screens.length,5);
 for(const b of screens){
  const u=b.visualPlan!.interfaceExample!;
  assert.equal(u.dataStatus,'illustrative');
  assert(u.basisClaimIds.includes('vision-workflow'));
  assert(u.records.length>0 && u.decision.action.length>10);
  assert(b.visualPlan!.explanation!.requiredMarks.includes('screen'));
 }
 const dashboard=p.planning!.story.find(b=>b.id==='vision-dashboard')!.visualPlan!;
 assert(dashboard.interfaceExample!.records.some(r=>r.status==='관측 지연'));
 dashboard.interfaceExample!.basisClaimIds.push('invented-source');
 assert(planningAudit(p,false).issues.some(i=>i.code==='unbound-interface-evidence'));
});
test('SafeSurface uses distinct visual scenes across explanatory pages and interface panes', () => {
 const p=fixture(),seen=new Map<string,string>();
 for(const b of p.planning!.story){
  const path=b.visualPlan!.scene?.path || b.visualPlan!.interfaceExample?.image?.path;
  if(!path)continue;
  const bytes=fs.readFileSync(path).toString('base64');
  assert(!seen.has(bytes),`${b.id} repeats the image used by ${seen.get(bytes)}`);
  seen.set(bytes,b.id);
 }
 assert(seen.size>=7);
});
test('system overview separates command, feedback, public notice and end-of-risk transitions', () => {
 const p=fixture(),overview=p.planning!.story.find(b=>b.id==='proposal')!.visualPlan!;
 assert(overview.edges.some(e=>e.from==='n2'&&e.to==='n3'));
 assert(overview.edges.some(e=>e.from==='n3'&&e.to==='n2'));
 assert(overview.edges.some(e=>e.from==='n2'&&e.to==='n4'));
 assert(overview.edges.some(e=>e.from==='n5'&&e.to==='n6'));
 const stages=p.planning!.story.find(b=>b.id==='vision-stages')!.visualPlan!;
 assert(stages.edges.some(e=>e.from==='n4'&&e.to==='n1'));
 const ui=p.planning!.story.find(b=>b.id==='vision-ai')!.visualPlan!.interfaceExample!;
 assert.equal(ui.metrics[0].value,ui.timeline![2].time);
});
