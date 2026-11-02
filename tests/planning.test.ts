import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Project, type ProjectData } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningAudit,
  researchBacklog,
} from "../packages/planning/index.js";
import { briefs } from "../packages/visual-assets/index.js";
import { analyze } from "../packages/agents/index.js";

const fixture = () => {
  const p = Project.parse(
    JSON.parse(fs.readFileSync("examples/smartfence-v2.project.json", "utf8")),
  );
  p.slides = compileStoryboard(p);
  return Project.parse(p);
};
const codes = (p: ProjectData) => planningAudit(p).issues.map((i) => i.code);

test("authored problem compiles into seven different purpose-specific visual compositions", () => {
  const p = fixture(),
    audit = planningAudit(p);
  assert.equal(audit.status, "ready-for-human-review");
  assert.deepEqual(audit.issues, []);
  assert.equal(p.slides.length, 7);
  assert.equal(new Set(p.slides.map((s) => s.reasoning!.visualKind)).size, 7);
  assert.deepEqual(
    p.slides.map((s) => s.id),
    p.planning!.story.map((s) => s.id),
  );
  assert(
    p.slides.every(
      (s) => s.claimIds.length > 0 && s.reasoning!.question.length > 0,
    ),
  );
});
test("proposal export requires framing; old excerpt path remains explicitly draft-only", () => {
  const p = fixture();
  delete p.planning;
  p.slides = [];
  assert.equal(planningAudit(p).status, "blocked");
  p.qualityTarget = "draft";
  assert.equal(planningAudit(p).status, "draft-only");
});
test("general source cannot establish a local observation", () => {
  const p = fixture();
  p.planning!.problem.localEvidence = {
    status: "observed",
    claimIds: ["separation"],
    required: ["현장 관찰 기록"],
  };
  assert(codes(p).includes("general-to-local-leap"));
  const claim = p.claims.find((c) => c.id === "separation")!;
  claim.scope = "local";
  assert(codes(p).includes("general-to-local-leap"));
});
test("a verified flag alone cannot substitute for an inspected source record", () => {
  const p = fixture();
  delete p.sources.find((s) => s.id === "H1")!.excerpt;
  assert(codes(p).includes("verification-without-record"));
});
test("baseline comparison and causal coverage are necessary before proposing technology", () => {
  const p = fixture();
  p.planning!.alternatives.forEach((a) => (a.priority = "proposed"));
  assert(codes(p).includes("missing-baseline-alternative"));
  const p2 = fixture();
  p2.planning!.interventions.forEach((i) => (i.mechanismIds = ["visibility"]));
  p2.planning!.alternatives.forEach((a) => (a.mechanismIds = []));
  assert(codes(p2).includes("unaddressed-cause"));
});
test("interventions must connect to real causes and measurable validation", () => {
  const p = fixture();
  p.planning!.interventions[0].mechanismIds = ["fake-cause"];
  p.planning!.interventions[0].validationIds = ["fake-test"];
  assert(codes(p).includes("unknown-mechanism"));
  assert(codes(p).includes("unknown-validation"));
});
test("problem precedes intervention; duplicate answers and missing proof are caught", () => {
  const p = fixture(),
    story = p.planning!.story;
  [story[1], story[4]] = [story[4], story[1]];
  assert(codes(p).includes("solution-before-problem"));
  p.planning!.story[1].answer = p.planning!.story[0].answer;
  assert(codes(p).includes("duplicate-slide-answer"));
  p.planning!.story[0].proofClaimIds = ["not-a-claim"];
  assert(codes(p).includes("unknown-planning-evidence"));
});
test("changed brief invalidates existing storyboard and recompilation repairs it", () => {
  const p = fixture();
  p.planning!.decision.request += " 후보 선정 기준을 함께 확인합니다.";
  assert(codes(p).includes("stale-storyboard"));
  p.slides = compileStoryboard(p);
  assert.equal(planningAudit(p).status, "ready-for-human-review");
});
test("spatial explanation needs a spatial model; anchors must map to real interventions", () => {
  const p = fixture();
  delete p.planning!.site;
  assert(codes(p).includes("missing-spatial-model"));
  const p2 = fixture();
  p2.slides.find(
    (s) => s.id === "concept",
  )!.image!.annotations![0].interventionId = "wrong-device";
  assert(codes(p2).includes("unknown-visual-anchor"));
});
test("visual briefs distinguish reasoning diagrams from concept illustrations and real evidence", () => {
  const p = fixture(),
    assets = briefs(p);
  assert.equal(
    assets.find((s) => s.slideId === "risk")!.production,
    "editable-native-diagram",
  );
  assert.equal(
    assets.find((s) => s.slideId === "concept")!.production,
    "illustration-with-editable-labels",
  );
  assert(assets.every((a) => a.imageIsEvidence === false));
  assert(
    !assets.find((s) => s.slideId === "risk")!.diagram!
      .inventedNumericalDataAllowed,
  );
});
test("analysis exposes intervention-to-cause-to-test handoffs and unexecuted field research", () => {
  const p = fixture(),
    result = analyze(p, []);
  assert.equal(result.usedLiveResearch, false);
  assert.equal(result.criticalReview.externalFactsVerified, 3);
  assert("interventionLogic" in result.business);
  assert.equal(result.agents.length, 6);
  const backlog = researchBacklog(p);
  assert(
    backlog.some(
      (t) => t.channel === "field-observation" && t.status === "open",
    ),
  );
  assert(
    backlog.some(
      (t) => t.channel === "experiment" && t.status === "not-executed",
    ),
  );
});

test("manually changed text, limitations or layout cannot bypass the canonical brief", () => {
  const p = fixture();
  p.slides[1].message = "천안 모든 공사장에서 성능 검증을 완료했습니다.";
  assert(codes(p).includes("divergent-storyboard"));
  p.slides[1].layout = "hero";
  assert(codes(p).includes("wrong-visual-grammar"));
  p.slides = compileStoryboard(p);
  assert.equal(planningAudit(p).status, "ready-for-human-review");
});

test("installation illustrations require an anchor for each intervention", () => {
  const p = fixture();
  delete p.slides.find((s) => s.id === "concept")!.image!.annotations;
  assert(codes(p).includes("unmapped-installation-visual"));
});

test("four validation rows leave space for the final decision request", async () => {
  const os = await import("node:os");
  const path = await import("node:path");
  const { render } = await import("../packages/pptx-renderer/index.js");
  const { geometry } = await import("../packages/quality-assurance/index.js");
  const p = fixture();
  p.planning!.validation.push({
    ...p.planning!.validation[0],
    id: "extra-test",
    question: "추가 운영 조건을 확인하는가",
  });
  p.slides = compileStoryboard(p);
  const dir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "studio-matrix-"),
  );
  try {
    const result = await render(p, path.join(dir, "matrix.pptx"), "validation");
    assert.deepEqual(
      geometry(result.elements).filter((i) => i.severity === "error"),
      [],
    );
  } finally {
    await fs.promises.rm(dir, { recursive: true, force: true });
  }
});
