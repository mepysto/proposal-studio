import type { ProjectData } from "../core/schema.js";

export function briefs(p: ProjectData) {
  return p.slides.map((s) => {
    const role = s.reasoning?.visualKind;
    const explicitEvidenceVisual = [
      "geographic-map",
      "causal-flow",
      "data-chart",
      "driver-display",
      "contact-card",
    ].includes(s.reasoning?.visualPlan?.kind || "");
    const illustration =
      !explicitEvidenceVisual &&
      (!!s.image ||
        role === "decision-image" ||
        role === "intervention-overlay" ||
        (!role && ["hero", "full-bleed", "solution"].includes(s.layout)));
    return {
      slideId: s.id,
      purpose: s.reasoning?.visualPurpose || s.message,
      question: s.reasoning?.question || null,
      coreAnswer: s.message,
      designDirection: p.designDirection ?? null,
      compositionBrief: s.compositionBrief ?? null,
      visualKind: s.reasoning?.visualPlan?.kind || role || s.layout,
      composition: s.reasoning?.visualPlan || null,
      explanation: s.reasoning?.visualPlan?.explanation || null,
      production:
        s.reasoning?.visualPlan?.kind === "public-safety-spaces" ? "scene-linked-public-safety" :
        s.reasoning?.visualPlan?.kind === "contact-card"
          ? "provided-brand-and-editable-contact"
          : s.reasoning?.visualPlan?.kind === "pilot-package"
            ? "scene-linked-package-boundary"
            : s.reasoning?.visualPlan?.kind === "evaluation-plan"
              ? "scene-linked-evaluation"
              : s.reasoning?.visualPlan?.map
                ? "geographic-map-with-editable-markers"
                : s.reasoning?.visualPlan?.kind === "causal-flow"
                  ? "editable-causal-diagram"
                  : s.reasoning?.visualPlan?.kind === "data-chart"
                    ? "editable-native-chart"
                    : s.reasoning?.visualPlan?.kind === "scope-requote"
                      ? "editable-native-chart"
                      : ["existing", "time-balance"].includes(
                            s.reasoning?.visualPlan?.kind || "",
                          ) &&
                          ["budget", "time-scenario"].includes(
                            s.reasoning?.sectionId || "",
                          )
                        ? "editable-native-chart"
                        : illustration
                          ? "illustration-with-editable-labels"
                          : "editable-native-diagram",
      evidenceClaimIds: s.reasoning?.proofClaimIds || s.claimIds,
      planningRefs: s.reasoning?.planningRefs || [],
      narrativeLimitation: s.reasoning?.limitation || "구조화 기획 미완료",
      imageIsEvidence: false,
      brief: illustration
        ? {
            subject: p.title,
            scene: s.title,
            composition:
              role === "intervention-overlay"
                ? "full visible equipment locations; normalized anchor coordinates; no cropping of annotated objects"
                : "clear physical relationships; leave space for headline",
            style:
              "architectural concept with believable scale and actor positions",
            lighting: "soft natural light",
            palette: p.design.colors,
            aspectRatio: "16:9",
            mustShow:
              role === "intervention-overlay"
                ? p.planning?.interventions.map((i) => ({
                    id: i.id,
                    subject: i.name,
                    purpose: i.action,
                  }))
                : p.planning?.problem.actors,
            avoid: [
              "long embedded labels",
              "invented measured performance",
              "unlicensed reference assets",
              "green safety guarantee",
              "landmarks implying an unverified installation",
            ],
            status: s.image ? "provided" : "pending-generation",
            disclosure: "제안 구성 예시 · 실제 현장·성능 검증자료 아님",
            originStoredInMetadata: true,
          }
        : null,
      diagram: !illustration
        ? {
            semantics: role,
            sourceOfTruth: "project.planning",
            inventedNumericalDataAllowed: false,
            editable: true,
          }
        : null,
    };
  });
}
