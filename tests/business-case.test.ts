import { researchBacklog } from "../packages/planning/index.js";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Project } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningAudit,
} from "../packages/planning/index.js";
import {
  businessAudit,
  budgetTotals,
  scenarioResult,
  businessDossier,
} from "../packages/business-case/index.js";
import { review } from "../packages/quality-assurance/index.js";

const fixture = () => {
  const p = Project.parse(
    JSON.parse(
      fs.readFileSync("examples/smartfence-full.project.json", "utf8"),
    ),
  );
  p.slides = compileStoryboard(p);
  return p;
};
const codes = (p: ReturnType<typeof fixture>) =>
  businessAudit(p).map((i) => i.code);

test("unquoted budgets preserve unknown amounts and cannot become zero totals", () => {
  const p = fixture();
  p.businessCase!.budget.status = "unquoted";
  p.businessCase!.budget.items = [];
  const parsed = Project.parse(p);
  assert.throws(() => budgetTotals(parsed.businessCase!.budget), /no numeric totals/);
  const dossier = businessDossier(parsed);
  assert(dossier.includes("사업비 — 미견적"));
  assert(!dossier.includes("합계: 0만원"));
  p.businessCase!.budget.status = "planning-assumption";
  assert(!Project.safeParse(p).success);
  p.businessCase!.budget.status = "unquoted";
  p.businessCase!.budget.items = [{id:"fake",label:"미상",low:0,base:0,high:0}];
  assert(!Project.safeParse(p).success);
});

test("full local business case binds 27 pages, six disciplines and three unsurveyed candidates", () => {
  const p = fixture();
  assert.deepEqual(planningAudit(p).issues, []);
  assert.equal(p.slides.length, 27);
  assert.equal(p.businessCase!.expertReviews.length, 6);
  assert(
    p.businessCase!.candidates.every((s) => s.fieldStatus === "not-surveyed"),
  );
  assert(
    p.businessCase!.metrics.every(
      (m) => m.baseline === null && m.target === null,
    ),
  );
});
test("a detailed municipal proposal needs actual local evidence and required perspectives", () => {
  const p = fixture();
  p.businessCase!.context.factClaimIds = ["scope"];
  p.businessCase!.expertReviews.pop();
  assert(codes(p).includes("insufficient-local-context"));
  assert(codes(p).includes("missing-expert-perspective"));
});
test("an expert finding cannot claim incorporation without a real page and shared evidence", () => {
  const p = fixture(),
    f = p.businessCase!.expertReviews[0].findings[0];
  f.storyBeatIds = ["missing-page"];
  assert(codes(p).includes("unmapped-expert-finding"));
  assert(codes(p).includes("unsubstantiated-expert-resolution"));
});
test("public local planning documents cannot prove a site survey", () => {
  const p = fixture(),
    site = p.businessCase!.candidates[0];
  site.fieldStatus = "surveyed";
  site.fieldClaimIds = site.claimIds;
  assert(codes(p).includes("unproven-site-survey"));
});
test("budget totals and time scenarios derive from one canonical model", () => {
  const p = fixture(),
    b = p.businessCase!;
  assert.deepEqual(budgetTotals(b.budget), {
    low: 45000000,
    base: 72000000,
    high: 108000000,
    vat: 7200000,
    gross: 79200000,
  });
  assert(b.timeScenario);
  assert.equal(scenarioResult(b.timeScenario).hoursSaved, 20);
  b.budget.items[0].low = b.budget.items[0].high + 1;
  b.timeScenario.afterMinutes = b.timeScenario.beforeMinutes + 1;
  assert(codes(p).includes("invalid-budget-range"));
  assert(codes(p).includes("negative-time-saving"));
});
test("expected benefits need metrics; numerical targets need evidence", () => {
  const p = fixture(),
    b = p.businessCase!;
  b.benefits[0].metricIds = ["unmeasurable"];
  b.metrics[0].target = 99;
  b.metrics[0].claimIds = ["impact-hypothesis"];
  assert(codes(p).includes("unmeasured-benefit"));
  assert(codes(p).includes("unsupported-metric-number"));
});
test("unreferenced chapter data does not satisfy the actual narrative", () => {
  const p = fixture();
  const section = p.businessCase!.sections.find(
    (s) => s.chapter === "economics",
  )!;
  p.planning!.story.find((s) => s.sectionId === section.id)!.sectionId =
    "summary";
  assert(codes(p).includes("missing-business-chapter"));
  p.businessCase!.targetSlideCount = p.slides.length + 1;
  assert(codes(p).includes("incomplete-deck-scope"));
  assert(codes(p).includes("incomplete-rendered-deck"));
});
test("changing business assumptions invalidates previously compiled slides", () => {
  const p = fixture();
  p.businessCase!.budget.items[0].base += 100;
  assert(planningAudit(p).issues.some((i) => i.code === "stale-storyboard"));
  p.slides = compileStoryboard(p);
  assert.deepEqual(planningAudit(p).issues, []);
});
test("layout capacity prevents silent truncation or a fourth candidate crashing a map", () => {
  const p = fixture();
  p.businessCase!.sections.find((s) => s.visual === "map")!.candidateIds.push(
    p.businessCase!.candidates[0].id,
  );
  assert(codes(p).includes("business-layout-capacity"));
});
test("PDF text must survive on its own page, not merely somewhere in the deck", () => {
  const p = fixture();
  const e = {
    slideId: p.slides[0].id,
    id: "probe",
    kind: "text" as const,
    x: 1,
    y: 1,
    w: 2,
    h: 1,
    fontSize: 16,
    text: "페이지별 검증",
  };
  const pdf = {
    issues: [],
    fonts: [p.design.font],
    text: e.text,
    pageTexts: ["다른 내용", e.text],
    rendered: 27,
  };
  const result = review(p, [e], pdf);
  assert(result.issues.some((i) => i.code === "pdf-text-mismatch"));
  pdf.pageTexts[0] = e.text;
  assert(
    !review(p, [e], pdf).issues.some((i) => i.code === "pdf-text-mismatch"),
  );
});

test("unperformed place, expert, quote and baseline work remains in the research backlog", () => {
  const p = fixture(),
    backlog = researchBacklog(p);
  assert.equal(
    backlog.filter((t) => t.id.startsWith("site-survey-")).length,
    3,
  );
  assert(
    backlog.some((t) => t.channel === "expert-review" && t.status === "open"),
  );
  assert(
    backlog.some((t) => t.channel === "procurement" && t.status === "open"),
  );
  assert.equal(
    backlog.filter(
      (t) => t.channel === "measurement" && t.status === "not-executed",
    ).length,
    p.businessCase!.metrics.length,
  );
});
