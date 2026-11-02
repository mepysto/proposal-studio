import { evidenceVisualAudit } from "../visual-assets/evidence-audit.js";
import { directionAudit } from "../art-direction/index.js";
import { createHash } from "node:crypto";
import { businessAudit } from "../business-case/index.js";
import type { ProjectData, SlideData } from "../core/schema.js";
import type { StoryBeatData } from "./schema.js";

export interface PlanningIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  path: string;
  returnTo: string;
}
export const fingerprint = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const visualForStage = {
  decision: "decision-image",
  problem: "causal-diagnosis",
  scenario: "site-map",
  intervention: "intervention-overlay",
  operation: "accountability-swimlane",
  validation: "validation-matrix",
  alternatives: "alternatives-matrix",
  business: "business-section",
} as const;
export const layoutForStage = {
  decision: "hero",
  problem: "editorial",
  scenario: "scenario",
  intervention: "architecture",
  operation: "process",
  validation: "comparison",
  alternatives: "comparison",
  business: "editorial",
} as const;

export const planningFingerprint = (p: ProjectData) =>
  fingerprint({
    ...(p.designDirection ? { designDirection: p.designDirection, design: p.design } : {}),
    planning: p.planning,
    businessCase: p.businessCase || null,
    proposer: p.proposer || null,
    geographicAssets: p.geographicAssets,
    quantitativeDatasets: p.quantitativeDatasets,
  });

export function planningAudit(p: ProjectData, checkSlides = true) {
  const issues: PlanningIssue[] = [];
  const add = (
    code: string,
    message: string,
    field: string,
    returnTo: PlanningIssue["returnTo"],
    severity: PlanningIssue["severity"] = "error",
  ) =>
    issues.push({
      code,
      message,
      path: field,
      returnTo,
      severity:
        p.qualityTarget === "draft" &&
        severity === "error" &&
        code === "missing-problem-brief"
          ? "warning"
          : severity,
    });
  issues.push(...businessAudit(p, checkSlides), ...evidenceVisualAudit(p), ...directionAudit(p, checkSlides));
  const b = p.planning;
  if(b?.story.some(s=>["cctv-extension","public-safety-spaces"].includes(s.visualPlan?.kind||""))&&!p.businessCase?.publicSafety)
    add("missing-public-safety-contract","공공안전 확장의 비교 기준·공간별 위험·대응·검수 조건을 작성하세요.","businessCase.publicSafety","business-case");
  if(b?.story.some(s=>s.visualPlan?.kind==="contact-card")){
    const contact=p.proposer?.contact,page=b.story.find(s=>s.visualPlan?.kind==="contact-card")!;
    if(!contact)add("missing-proposer-contact","종결 장표의 실제 로고와 연락처를 제공된 자료에 연결하세요.","proposer.contact","storyboard");
    else if(contact.sourceClaimIds.some(id=>!p.claims.some(c=>c.id===id)||!page.proofClaimIds.includes(id)))add("unlinked-proposer-contact","연락처의 근거를 종결 장표에 연결하세요.","proposer.contact.sourceClaimIds","storyboard");
  }
  if (!b) {
    add(
      "missing-problem-brief",
      "문단 발췌만으로는 문제·원인·사업 개입의 타당성을 판단할 수 없습니다. 기획 브리프를 작성하세요.",
      "planning",
      "problem-framing",
    );
    return {
      status: p.qualityTarget === "proposal" ? "blocked" : "draft-only",
      method:
        "deterministic planning contract checks; not semantic expert approval",
      issues,
      checks: {
        problemFramed: false,
        causalCoverage: false,
        baselineCompared: false,
        measurementDefined: false,
        narrativeTraceable: false,
      },
      humanReviewRequired: true,
    };
  }
  if (b.depth === "full" && p.qualityTarget === "proposal") {
    if (!p.proposer)
      add(
        "missing-proposer",
        "제안 주관 회사명과 협력 역할을 명시하세요.",
        "proposer",
        "identity",
      );
    else
      for (const id of p.proposer.sourceClaimIds)
        if (!p.claims.some((c) => c.id === id))
          add(
            "unlinked-proposer",
            "제안 주체의 원문 근거가 없습니다.",
            "proposer",
            "identity",
          );
  }
  if (b.depth === "full" && p.qualityTarget === "proposal" && !b.visualPolicy)
    add(
      "missing-visual-policy",
      "상세 제안서는 페이지별 시각화 정책과 계획을 작성해야 합니다.",
      "planning.visualPolicy",
      "visual-planning",
    );
  if (b.visualPolicy)
    for (const beat of b.story) {
      const v = beat.visualPlan;
      if (!v) {
        add(
          "missing-page-visual",
          "모든 장표에 설명 목적과 연결된 시각화 계획이 필요합니다.",
          `story.${beat.id}`,
          "visual-planning",
        );
        continue;
      }
      if (b.visualPolicy.requireExplanationContract && !v.explanation)
        add("missing-visual-explanation", "독자가 무엇을 보고 판단할지와 필요한 실제 시각 요소를 작성하세요.", `story.${beat.id}`, "visual-planning");
      if(v.explanation?.requiredMarks.includes("map") && !v.map)
        add("explanation-map-missing", "지도 설명에는 좌표 기반 지도 계획이 필요합니다.", `story.${beat.id}`, "visual-planning");
      if(v.explanation?.requiredMarks.includes("chart") && !v.chart)
        add("explanation-chart-missing", "수치 설명에는 데이터셋 기반 차트 계획이 필요합니다.", `story.${beat.id}`, "visual-planning");
      for (const id of v.evidenceIds)
        if (
          !p.claims.some((c) => c.id === id) ||
          !beat.proofClaimIds.includes(id)
        )
          add(
            "unlinked-visual-evidence",
            "시각화의 근거를 장표 근거와 연결하세요.",
            `story.${beat.id}`,
            "visual-planning",
          );
      const ids = new Set(v.nodes.map((n) => n.id));
      if (
        ids.size !== v.nodes.length ||
        v.edges.some(
          (e) => !ids.has(e.from) || !ids.has(e.to) || e.from === e.to,
        )
      )
        add(
          "invalid-visual-relationship",
          "시각화 노드나 연결이 유효하지 않습니다.",
          `story.${beat.id}`,
          "visual-planning",
        );
      const counts: Record<string, [number, number]> = {
        "cctv-extension": [3,3],
        "public-safety-spaces": [3,3],
        "municipal-overview": [3,3],
        "field-information-flow": p.businessCase?.productPositioning?.platform ? [5,5] : [6,6],
        "public-value": [3,3],
        "pilot-package": [3,3],
        "service-model": [3,3],
        "evaluation-plan": [3,3],
        "expansion-path": [3,3],
        "city-proposal": [3,3],
        flow: [3, 4],
        context: [3, 3],
        bridge: [3, 4],
        site: [3, 3],
        journey: [4, 4],
        shortlist: [3, 3],
        gates: [4, 4],
        "image-detail": [3, 3],
        comparison: [3, 3],
        scope: [3, 3],
        system: [6, 6],
        boundary: [3, 3],
        swimlane: [5, 5],
        timeline: [4, 4],
        ownership: [4, 4],
        benefits: [3, 3],
        metrics: [3, 3],
        decision: [3, 3],
      };
      const count = v.kind === "comparison" && v.comparisonTable
        ? [v.comparisonTable.columns.length, v.comparisonTable.columns.length]
        : counts[v.kind];
      if (count && (v.nodes.length < count[0] || v.nodes.length > count[1]))
        add(
          "visual-layout-capacity",
          "해당 시각화의 노드 수를 조정하거나 장표를 나누세요.",
          `story.${beat.id}`,
          "visual-planning",
        );
      if (
        ["flow", "system", "ownership", "decision"].includes(v.kind) &&
        !v.edges.length
      )
        add(
          "missing-visual-relationship",
          "관계를 설명하는 다이어그램에는 연결 정의가 필요합니다.",
          `story.${beat.id}`,
          "visual-planning",
        );
      if (
        ["timeline", "assured-timeline"].includes(v.kind) &&
        (!v.schedule ||
          v.schedule.ranges.length !== v.nodes.length ||
          new Set(v.schedule.ranges.map((r) => r.nodeId)).size !==
            v.nodes.length ||
          v.schedule.ranges.some(
            (r) => !ids.has(r.nodeId) || r.start + r.length > v.schedule!.slots,
          ))
      )
        add(
          "invalid-visual-schedule",
          "일정의 기간과 실제 구간을 정의하세요.",
          `story.${beat.id}`,
          "visual-planning",
        );
      const seed = p.slides.find((s) => s.id === beat.id);
      if (v.kind === "image-detail" && !seed?.image)
        add(
          "missing-explanatory-image",
          "장소 설명 이미지가 필요합니다.",
          `story.${beat.id}`,
          "visual-production",
        );
    }
  const claimMap = new Map(p.claims.map((c) => [c.id, c]));
  const sourceMap = new Map(p.sources.map((s) => [s.id, s]));
  const refClaims = (ids: string[], field: string) => {
    for (const id of ids)
      if (!claimMap.has(id))
        add(
          "unknown-planning-evidence",
          `근거 주장 ${id}가 원장에 없습니다.`,
          field,
          "research",
        );
  };
  const unique = (items: { id: string }[], field: string) => {
    const ids = items.map((i) => i.id);
    if (new Set(ids).size !== ids.length)
      add(
        "duplicate-planning-id",
        "기획 객체 ID는 배열 내에서 고유해야 합니다.",
        field,
        "strategy",
      );
  };
  for (const [name, items] of Object.entries({
    mechanisms: b.problem.mechanisms,
    alternatives: b.alternatives,
    interventions: b.interventions,
    validation: b.validation,
    workflow: b.workflow,
    story: b.story,
  }))
    unique(items, name);
  refClaims(b.problem.claimIds, "problem.claimIds");
  refClaims(b.problem.localEvidence.claimIds, "problem.localEvidence");
  if (b.problem.localEvidence.status === "observed") {
    if (!b.problem.localEvidence.claimIds.length)
      add(
        "missing-local-observation",
        "현장 관찰을 주장하려면 지역 관측 근거가 필요합니다.",
        "problem.localEvidence",
        "research",
      );
    for (const id of b.problem.localEvidence.claimIds) {
      const c = claimMap.get(id);
      if (
        c &&
        (c.scope !== "local" ||
          c.evidenceKind !== "field-observation" ||
          !["user-provided", "externally-verified"].includes(c.status))
      )
        add(
          "general-to-local-leap",
          "일반 지침·추론·가정을 실제 지역 현장 관측으로 사용하지 마세요.",
          "problem.localEvidence",
          "research",
        );
    }
  }
  for (const claim of p.claims)
    if (claim.status === "externally-verified")
      for (const id of claim.sourceIds) {
        const src = sourceMap.get(id);
        if (!src?.checkedAt || !src.excerpt)
          add(
            "verification-without-record",
            `검증 주장 ${claim.id}: 확인일·확인 구절이 필요합니다.`,
            `claims.${claim.id}`,
            "research",
          );
        if (claim.scope === "local" && src?.scope === "general")
          add(
            "general-to-local-leap",
            "일반 근거가 지역 관측을 입증하지 않습니다.",
            `claims.${claim.id}`,
            "research",
          );
      }
  const mechanismIds = new Set(b.problem.mechanisms.map((m) => m.id));
  const validationIds = new Set(b.validation.map((v) => v.id));
  for (const m of b.problem.mechanisms) {
    refClaims(m.claimIds, `mechanisms.${m.id}`);
    if (m.cause === m.effect)
      add(
        "circular-cause",
        "원인과 결과를 같은 문장으로 정의할 수 없습니다.",
        `mechanisms.${m.id}`,
        "problem-framing",
      );
  }
  for (const alt of b.alternatives) {
    refClaims(alt.claimIds, `alternatives.${alt.id}`);
    for (const id of alt.mechanismIds)
      if (!mechanismIds.has(id))
        add(
          "unknown-mechanism",
          `대안의 원인 연결 ${id}가 없습니다.`,
          `alternatives.${alt.id}`,
          "strategy",
        );
  }
  if (!b.alternatives.some((a) => a.priority === "baseline"))
    add(
      "missing-baseline-alternative",
      "기존 대응을 기준선으로 비교해야 합니다. AI 도입을 먼저 결론내리지 마세요.",
      "alternatives",
      "strategy",
    );
  for (const intervention of b.interventions) {
    refClaims(intervention.claimIds, `interventions.${intervention.id}`);
    for (const id of intervention.mechanismIds)
      if (!mechanismIds.has(id))
        add(
          "unknown-mechanism",
          `사업 개입이 연결한 원인 ${id}가 없습니다.`,
          `interventions.${intervention.id}`,
          "strategy",
        );
    for (const id of intervention.validationIds)
      if (!validationIds.has(id))
        add(
          "unknown-validation",
          `개입 검증 ${id}가 없습니다.`,
          `interventions.${intervention.id}`,
          "strategy",
        );
  }
  for (const m of b.problem.mechanisms)
    if (
      !b.interventions.some((i) => i.mechanismIds.includes(m.id)) &&
      !b.alternatives.some(
        (a) => a.priority === "baseline" && a.mechanismIds.includes(m.id),
      )
    )
      add(
        "unaddressed-cause",
        `원인 ${m.id}에 사업 개입 또는 기존 대응이 연결되지 않았습니다.`,
        `mechanisms.${m.id}`,
        "strategy",
      );
  for (const v of b.validation) refClaims(v.claimIds, `validation.${v.id}`);
  for (const w of b.workflow) refClaims(w.claimIds, `workflow.${w.id}`);
  if (!b.workflow.some((w) => w.owner === "human"))
    add(
      "missing-accountable-owner",
      "제안의 의사결정·실행 책임자를 명시해야 합니다.",
      "workflow",
      "strategy",
    );
  if (b.site) {
    unique(
      [...b.site.zones, ...b.site.objects, ...b.site.paths, ...b.site.callouts],
      "site",
    );
    for (const z of b.site.zones)
      if (z.x + z.w > 1.001 || z.y + z.h > 1.001)
        add(
          "invalid-spatial-model",
          "공간 영역이 정규화 도면 경계를 벗어났습니다.",
          `site.zones.${z.id}`,
          "visual-design",
        );
    for (const c of b.site.callouts)
      refClaims(c.claimIds, `site.callouts.${c.id}`);
  }
  const stages = b.story.map((s) => s.stage);
  const problemIndex = stages.indexOf("problem"),
    solutionIndex = stages.indexOf("intervention");
  if (problemIndex < 0)
    add(
      "missing-problem-beat",
      "문제 설명이 없는 제안은 발표용으로 내보낼 수 없습니다.",
      "story",
      "storyboard",
    );
  if (solutionIndex >= 0 && (problemIndex < 0 || solutionIndex < problemIndex))
    add(
      "solution-before-problem",
      "문제의 발생 구조를 설명한 후 개입을 제안하세요.",
      "story",
      "storyboard",
    );
  const answers = b.story.map((s) => s.answer.replace(/\s/g, ""));
  if (new Set(answers).size !== answers.length)
    add(
      "duplicate-slide-answer",
      "서로 다른 장표가 같은 결론을 반복하고 있습니다.",
      "story",
      "storyboard",
    );
  for (const beat of b.story) {
    refClaims(beat.proofClaimIds, `story.${beat.id}`);
    if (beat.stage === "scenario" && !b.site)
      add(
        "missing-spatial-model",
        "동선·배치를 설명하려면 실제 영역·동선·객체 관계가 필요합니다.",
        "site",
        "visual-design",
      );
  }
  if (checkSlides) {
    for (const beat of b.story) {
      const slide = p.slides.find((s) => s.id === beat.id);
      if (!slide?.reasoning)
        add(
          "uncompiled-story-beat",
          `장표 ${beat.id}가 기획에서 생성되지 않았습니다. plan을 실행하세요.`,
          `slides.${beat.id}`,
          "storyboard",
        );
      else {
        if (
          slide.title !== beat.title ||
          slide.message !== beat.answer ||
          slide.footnote !== beat.limitation ||
          slide.reasoning.question !== beat.question ||
          slide.reasoning.answer !== beat.answer ||
          JSON.stringify(slide.reasoning.visualPlan) !==
            JSON.stringify(beat.visualPlan)
        ) {
          add(
            "divergent-storyboard",
            "장표 문구가 기획의 질문·답·해석 한계와 달라졌습니다. 기획을 수정한 뒤 plan을 실행하세요.",
            `slides.${slide.id}`,
            "storyboard",
          );
        }
        if (slide.reasoning.planningFingerprint !== planningFingerprint(p))
          add(
            "stale-storyboard",
            "기획 브리프 변경 이후 plan을 다시 실행해야 합니다.",
            `slides.${slide.id}`,
            "storyboard",
          );
        if (
          slide.reasoning.visualKind !== visualForStage[beat.stage] ||
          slide.layout !== layoutForStage[beat.stage]
        )
          add(
            "wrong-visual-grammar",
            "시각자료 형식이 장표의 설명 목적과 맞지 않습니다.",
            `slides.${slide.id}`,
            "visual-design",
          );
        if (!beat.proofClaimIds.every((id) => slide.claimIds.includes(id)))
          add(
            "missing-slide-proof",
            "장표의 핵심 답을 뒷받침하는 근거 연결이 누락됐습니다.",
            `slides.${slide.id}`,
            "storyboard",
          );
      }
    }
    for (const slide of p.slides) {
      if (
        slide.reasoning?.stage === "intervention" &&
        slide.image &&
        !b.interventions.every((i) =>
          slide.image!.annotations?.some((a) => a.interventionId === i.id),
        )
      ) {
        add(
          "unmapped-installation-visual",
          "설치 개념도의 모든 개입을 이미지 번호와 연결해야 합니다.",
          `slides.${slide.id}`,
          "visual-design",
        );
      }
      if (slide.image?.annotations) {
        for (const anchor of slide.image.annotations)
          if (!b.interventions.some((i) => i.id === anchor.interventionId))
            add(
              "unknown-visual-anchor",
              "설치도 번호가 존재하지 않는 사업 개입에 연결됐습니다.",
              `slides.${slide.id}`,
              "visual-design",
            );
      }
      if (!b.story.some((s) => s.id === slide.id))
        add(
          "unplanned-slide",
          "기획에 없는 장표입니다.",
          `slides.${slide.id}`,
          "storyboard",
        );
      if (
        slide.chart &&
        !slide.claimIds.some(
          (id) =>
            claimMap.get(id)?.status === "externally-verified" ||
            claimMap.get(id)?.status === "user-provided",
        )
      )
        add(
          "unsubstantiated-chart",
          "정량 차트는 입력 또는 검증된 수치 근거가 있어야 합니다.",
          `slides.${slide.id}`,
          "research",
        );
    }
  }
  return {
    status: issues.some((i) => i.severity === "error")
      ? "blocked"
      : p.qualityTarget === "draft"
        ? "draft-only"
        : "ready-for-human-review",
    method:
      "deterministic planning contract checks; not semantic expert approval",
    issues,
    checks: {
      problemFramed: true,
      causalCoverage: !issues.some((i) => i.code === "unaddressed-cause"),
      baselineCompared: b.alternatives.some((a) => a.priority === "baseline"),
      measurementDefined: b.validation.length >= 2,
      narrativeTraceable: !issues.some((i) =>
        ["uncompiled-story-beat", "stale-storyboard"].includes(i.code),
      ),
    },
    humanReviewRequired: true,
  };
}

export function researchBacklog(p: ProjectData) {
  if (!p.planning)
    return [
      {
        id: "frame-problem",
        channel: "authoring",
        question: "누구에게 어떤 상황에서 어떤 문제가 생기는가?",
        neededFor: "문제 브리프",
        status: "open",
      },
    ];
  const b = p.planning;
  return [
    ...b.problem.localEvidence.required.map((question, i) => ({
      id: `local-${i + 1}`,
      channel: "field-observation",
      question,
      neededFor: "대상 현장 적합성",
      status:
        b.problem.localEvidence.status === "observed"
          ? "recorded-needs-review"
          : "open",
    })),
    ...(p.businessCase?.candidates.map((site) => ({
      id: `site-survey-${site.id}`,
      channel: "field-observation",
      question: `${site.name}: ${site.readiness}`,
      neededFor: "후보지 선정·실제 설치 범위",
      status:
        site.fieldStatus === "surveyed" ? "recorded-needs-review" : "open",
    })) || []),
    ...(p.businessCase?.expertReviews.flatMap((review) =>
      review.findings
        .filter((finding) => finding.status === "open")
        .map((finding, i) => ({
          id: `expert-open-${review.id}-${i + 1}`,
          channel: "expert-review",
          question: finding.acceptanceCheck,
          neededFor: `${review.discipline}: ${finding.issue}`,
          status: "open",
        })),
    ) || []),
    ...(p.businessCase?.metrics
      .filter((metric) => metric.baseline === null)
      .map((metric) => ({
        id: `baseline-${metric.id}`,
        channel: "measurement",
        question: `${metric.name}: ${metric.measurement}`,
        neededFor: "기준선 실측·목표 합의",
        status: "not-executed",
      })) || []),
    ...(p.businessCase
      ? [
          {
            id: "supplier-quotes",
            channel: "procurement",
            question: `${p.businessCase.budget.scope}: 항목별 견적과 제외 비용을 확인하고 범위를 확정한다.`,
            neededFor: "기획 가정에서 실증 예산으로 전환",
            status: "open",
          },
        ]
      : []),
    ...b.validation.map((v) => ({
      id: v.id,
      channel: "experiment",
      question: v.question,
      method: v.method,
      measure: v.measure,
      decisionRule: v.decisionRule,
      neededFor: "사업 개입의 유효성",
      status: "not-executed",
    })),
  ];
}

const planningRefsFor = (p: ProjectData, beat: StoryBeatData) => {
  const b = p.planning!;
  switch (beat.stage) {
    case "business":
      return [`business:${beat.sectionId}`];
    case "decision":
      return ["decision"];
    case "problem":
      return [
        "problem",
        ...b.problem.mechanisms.map((m) => `mechanism:${m.id}`),
      ];
    case "scenario":
      return ["site", "problem"];
    case "intervention":
      return b.interventions.map((i) => `intervention:${i.id}`);
    case "operation":
      return b.workflow.map((w) => `workflow:${w.id}`);
    case "validation":
      return b.validation.map((v) => `validation:${v.id}`);
    case "alternatives":
      return b.alternatives.map((a) => `alternative:${a.id}`);
  }
};
export function compileStoryboard(p: ProjectData): SlideData[] {
  if (!p.planning) throw Error("Planning brief required");
  const audit = planningAudit(p, false);
  if (audit.status === "blocked")
    throw Error(
      `Planning blocked: ${audit.issues
        .filter((i) => i.severity === "error")
        .map((i) => i.code)
        .join(", ")}`,
    );
  const b = p.planning;
  return b.story.map((beat) => {
    const existing = p.slides.find((s) => s.id === beat.id);
    return {
      id: beat.id,
      ...(beat.compositionBrief ? { compositionBrief: structuredClone(beat.compositionBrief) } : {}),
      layout: layoutForStage[beat.stage],
      title: beat.title,
      message: beat.answer,
      items: [],
      claimIds: beat.proofClaimIds,
      footnote: beat.limitation,
      ...(existing?.image ? { image: existing.image } : {}),
      reasoning: {
        ...(beat.visualPlan
          ? { visualPlan: structuredClone(beat.visualPlan) }
          : {}),
        planningFingerprint: planningFingerprint(p),
        sectionId: beat.sectionId,
        stage: beat.stage,
        question: beat.question,
        answer: beat.answer,
        proofClaimIds: beat.proofClaimIds,
        planningRefs: planningRefsFor(p, beat),
        visualPurpose: beat.visualPurpose,
        limitation: beat.limitation,
        visualKind: visualForStage[beat.stage],
      },
    };
  });
}

export function decisionBriefMarkdown(p: ProjectData) {
  const b = p.planning;
  if (!b)
    return "# 기획 미완료\n\n원문 발췌는 발표 기획이 아닙니다. 영향받는 사람, 상황, 원인, 기존 대응과 검증계획을 작성하세요.\n";
  const claims = (ids: string[]) =>
    ids
      .map((id) => {
        const c = p.claims.find((c) => c.id === id);
        return c ? `${id} [${c.scope}/${c.status}] ${c.text}` : `MISSING ${id}`;
      })
      .join("\n");
  return (
    [
      `# ${p.title} — 의사결정 브리프`,
      `## 요청할 결정\n\n${b.decision.request}\n\n결정 주체: ${b.decision.owner}\n범위: ${b.decision.scope}\n성공 판단: ${b.decision.success}`,
      `## 문제 정의\n\n대상: ${b.problem.actors.join(", ")}\n\n상황: ${b.problem.situation}\n\n남는 과제: ${b.problem.gap}\n\n영향: ${b.problem.consequence}\n\n기존 대응: ${b.problem.baseline}`,
      `## 원인과 개입의 연결\n\n${b.problem.mechanisms.map((m) => `- ${m.id}: ${m.cause} → ${m.effect.replace(/\n/g, " ")} [${m.status}]\n  근거: ${m.claimIds.join(", ")}`).join("\n")}\n\n${b.interventions.map((i) => `- ${i.name}: ${i.action}\n  대응 원인: ${i.mechanismIds.join(", ")} / 결과물: ${i.deliverable} / 검증: ${i.validationIds.join(", ")}`).join("\n")}`,
      `## 현장 근거의 상태\n\n${b.problem.localEvidence.status}\n\n${b.problem.localEvidence.required.map((s) => `- ${s}`).join("\n")}`,
      `## 기존 대안과 비교\n\n${b.alternatives.map((a) => `- ${a.name} [${a.priority}]: ${a.addresses}\n  한계·조건: ${a.limits}`).join("\n")}`,
      `## 검증과 중단 판단\n\n${b.validation.map((v) => `- ${v.question}\n  방법: ${v.method}\n  측정: ${v.measure}\n  결정: ${v.decisionRule}`).join("\n")}`,
      `## 장표의 논리와 시각자료\n\n${b.story.map((s, i) => `### ${i + 1}. ${s.title.replace(/\n/g, " ")}\n\n청중 질문: ${s.question}\n\n핵심 답: ${s.answer.replace(/\n/g, " ")}\n\n시각자료 역할: ${s.visualPurpose}${s.visualPlan?.explanation ? `\n\n판단 과제: ${s.visualPlan.explanation.readerTask}\n읽는 방법: ${s.visualPlan.explanation.howToRead}\n필요한 실제 요소: ${s.visualPlan.explanation.requiredMarks.join(", ")}\n시각 근거의 한계: ${s.visualPlan.explanation.notProven}` : ""}\n\n근거:\n${claims(s.proofClaimIds)}\n\n해석 한계: ${s.limitation}`).join("\n\n")}`,
      `## 출처\n\n${p.sources.map((s) => `- ${s.id}: ${s.title}${s.url ? ` — ${s.url}` : ""}\n  범위: ${s.scope} / 확인: ${s.checkedAt || "외부 재확인 안 함"}\n  적용 한계: ${s.applicability || "프로젝트 입력 근거"}`).join("\n")}`,
      "## 검수의 범위\n\n이 브리프는 제공된 기획 데이터의 구조화·추적 결과입니다. 계약 검사 통과가 사실의 진실성, 사업 타당성, 전문가 승인 또는 실험 완료를 뜻하지 않습니다.",
    ].join("\n\n") + "\n"
  );
}
