import { planningAudit, researchBacklog } from "../planning/index.js";
import type { ProjectData } from "../core/schema.js";
import type { Material } from "../content/index.js";
import { visualForStage } from "../planning/index.js";

/** Deterministic handoffs over an authored brief. This is not an LLM or a truth oracle. */
export function analyze(p: ProjectData, materials: Material[]) {
  const content = materials.filter((m) => m.role === "content");
  const b = p.planning;
  const planning = planningAudit(p, false);
  const evidence = {
    general: p.claims.filter((c) => c.scope === "general").map((c) => c.id),
    local: p.claims.filter((c) => c.scope === "local").map((c) => c.id),
    externallyVerified: p.claims
      .filter((c) => c.status === "externally-verified")
      .map((c) => c.id),
    assumptions: p.claims
      .filter((c) => c.status === "assumption")
      .map((c) => c.id),
    localObservationEstablished: b?.problem.localEvidence.status === "observed",
  };
  const sourceGaps = researchBacklog(p);
  return {
    provider: "offline",
    usedExternalAPI: false,
    usedLiveResearch: false,
    method:
      "Authored problem brief → traceable strategy/visual compilation → deterministic critical checks; no LLM reasoning or new research claimed",
    expertReviewMode: p.businessCase
      ? "assistant-authored-perspectives"
      : "not-provided",
    expertPanel: p.businessCase?.expertReviews || [],
    crossDisciplineDecisions: p.businessCase?.resolutions || [],
    contentDocuments: content.length,
    designReferences: materials.filter((m) => m.role === "design-reference")
      .length,
    designDirection: p.designDirection ?? null,
    compositionStory: p.planning?.story.map(s => ({ slideId: s.id, compositionBrief: s.compositionBrief ?? null })) ?? [],
    outline: content.flatMap((m) => m.headings),
    planning,
    researchBacklog: sourceGaps,
    evidence,
    business: b
      ? {
          decision: b.decision,
          problem: b.problem,
          alternatives: b.alternatives,
          interventionLogic: b.interventions.map((i) => ({
            id: i.id,
            intervention: i.name,
            addresses: i.mechanismIds.map((id) =>
              b.problem.mechanisms.find((m) => m.id === id),
            ),
            action: i.action,
            deliverable: i.deliverable,
            tests: i.validationIds.map((id) =>
              b.validation.find((v) => v.id === id),
            ),
          })),
        }
      : {
          status: "not-framed",
          gaps: [
            "영향받는 사람·상황·원인·기존 대응·의사결정·검증계획을 먼저 작성할 것",
          ],
        },
    technical: b
      ? {
          workflow: b.workflow,
          validation: b.validation,
          operatingBoundary: b.operatingBoundary,
          status: "proposed-not-tested",
        }
      : { status: "not-assessed" },
    agents: [
      {
        role: "Research Analyst",
        mode: "evidence-ledger-audit",
        output: { evidence, sourceGaps },
      },
      {
        role: "Business Strategist",
        mode: b ? "provided-brief-analysis" : "missing-input",
        output: b
          ? {
              decision: b.decision,
              baseline: b.problem.baseline,
              causes: b.problem.mechanisms,
              alternatives: b.alternatives,
            }
          : null,
      },
      {
        role: "Technical Architect",
        mode: b ? "proposed-verification-mapping" : "missing-input",
        output: b
          ? { interventions: b.interventions, validation: b.validation }
          : null,
      },
      {
        role: "Proposal Story Director",
        mode: b ? "question-answer-proof-compilation" : "excerpt-draft-only",
        output: b?.story.map((s) => ({
          question: s.question,
          answer: s.answer,
          proof: s.proofClaimIds,
        })),
      },
      {
        role: "Visual Art Director",
        mode: b ? "purpose-driven-visual-selection" : "unplanned",
        output: b?.story.map((s) => ({
          slideId: s.id,
          grammar: visualForStage[s.stage],
          purpose: s.visualPurpose,
        })),
      },
      {
        role: "Critical Reviewer",
        mode: "deterministic-contract-audit",
        output: planning,
      },
    ],
    criticalReview: {
      externalFactsVerified: evidence.externallyVerified.length,
      unverifiedClaims: p.claims
        .filter((c) => c.status !== "externally-verified")
        .map((c) => c.id),
      humanApprovalRequired: true,
    },
    findings: [
      ...content.flatMap((m) => m.warnings),
      ...planning.issues.map((i) => `${i.code}: ${i.message}`),
    ],
  };
}
