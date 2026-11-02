import { positioningAudit } from "./positioning-audit.js";
import { municipalAudit } from "./municipal-audit.js";
import { productAudit } from "./product-audit.js";
import { deliveryAudit } from "./delivery-audit.js";
import type { ProjectData } from "../core/schema.js";
import type { BusinessCaseData } from "./schema.js";
export function budgetTotals(b: BusinessCaseData["budget"]) {
  if (b.status === "unquoted") throw Error("Unquoted budget has no numeric totals");
  const sum = (key: "low" | "base" | "high") =>
    b.items.reduce((n, r) => n + r[key], 0);
  const base = sum("base");
  return {
    low: sum("low"),
    base,
    high: sum("high"),
    vat: Math.round(base * b.vatRate),
    gross: Math.round(base * (1 + b.vatRate)),
  };
}
export function scenarioResult(s: NonNullable<BusinessCaseData["timeScenario"]>) {
  const events = s.eventsPerDay * s.daysPerMonth,
    minutesSaved = events * (s.beforeMinutes - s.afterMinutes);
  return {
    eventsPerMonth: events,
    beforeHours: (events * s.beforeMinutes) / 60,
    afterHours: (events * s.afterMinutes) / 60,
    hoursSaved: minutesSaved / 60,
  };
}
export function businessAudit(p: ProjectData, checkSlides = true) {
  const issues: {
    severity: "error";
    code: string;
    message: string;
    path: string;
    returnTo: string;
  }[] = [];
  const add = (
    code: string,
    message: string,
    path: string,
    returnTo = "business-case",
  ) => issues.push({ severity: "error", code, message, path, returnTo });
  issues.push(...deliveryAudit(p), ...productAudit(p), ...municipalAudit(p), ...positioningAudit(p));
  const full = p.planning?.depth === "full";
  const b = p.businessCase;
  if (!b) {
    if (full)
      add(
        "missing-business-case",
        "상세 제안서에는 지역·후보지·예산·효과·분야별 검토가 필요합니다.",
        "businessCase",
      );
    return issues;
  }
  const claims = new Map(p.claims.map((c) => [c.id, c]));
  const refs = (ids: string[], path: string) => {
    for (const id of ids)
      if (!claims.has(id))
        add(
          "unknown-business-evidence",
          `근거 ${id}가 없습니다.`,
          path,
          "research",
        );
  };
  const unique = (rows: { id: string }[], path: string) => {
    if (new Set(rows.map((r) => r.id)).size !== rows.length)
      add("duplicate-business-id", "ID가 중복됩니다.", path);
  };
  for (const [key, rows] of Object.entries({
    expertReviews: b.expertReviews,
    candidates: b.candidates,
    budgetItems: b.budget.items,
    metrics: b.metrics,
    benefits: b.benefits,
    sections: b.sections,
    resolutions: b.resolutions,
  }))
    unique(rows, key);
  if(b.publicSafety)refs(b.publicSafety.claimIds,"publicSafety");
  refs(b.context.factClaimIds, "context");
  const local = b.context.factClaimIds.filter((id) => {
    const c = claims.get(id);
    return c?.scope === "local" && c.status === "externally-verified";
  });
  if (
    full &&
    /municipality|government|smart-city/.test(p.proposalType) &&
    local.length < 3
  )
    add(
      "insufficient-local-context",
      "지역명만 바꾼 기획을 방지하기 위해 검증된 지역 주장 3개 이상이 필요합니다.",
      "context",
      "research",
    );
  for (const discipline of b.requiredDisciplines)
    if (!b.expertReviews.some((r) => r.discipline === discipline))
      add(
        "missing-expert-perspective",
        `${discipline} 관점의 사전 검토가 누락됐습니다.`,
        "expertReviews",
        "expert-review",
      );
  for (const r of b.expertReviews)
    for (const f of r.findings) {
      refs(f.evidenceIds, `expertReviews.${r.id}`);
      for (const id of f.storyBeatIds)
        if (!p.planning?.story.some((s) => s.id === id))
          add(
            "unmapped-expert-finding",
            "검토 결과가 실제 장표에 연결되지 않았습니다.",
            `expertReviews.${r.id}`,
            "expert-review",
          );
      if (
        f.status === "incorporated" &&
        !p.planning?.story.some(
          (s) =>
            f.storyBeatIds.includes(s.id) &&
            s.proofClaimIds.some((id) => f.evidenceIds.includes(id)),
        )
      )
        add(
          "unsubstantiated-expert-resolution",
          "반영 완료로 표시한 검토와 장표 근거가 연결되지 않았습니다.",
          `expertReviews.${r.id}`,
          "expert-review",
        );
    }
  for (const r of b.resolutions)
    for (const id of r.perspectives)
      if (!b.expertReviews.some((e) => e.id === id))
        add(
          "unknown-review-perspective",
          "상충 관점의 검토자가 없습니다.",
          `resolutions.${r.id}`,
        );
  for (const s of b.candidates) {
    refs(s.claimIds, `candidates.${s.id}`);
    refs(s.fieldClaimIds, `candidates.${s.id}.fieldClaimIds`);
    if (
      s.fieldStatus === "surveyed" &&
      (!s.fieldClaimIds.length ||
        s.fieldClaimIds.some(
          (id) => claims.get(id)?.evidenceKind !== "field-observation",
        ))
    )
      add(
        "unproven-site-survey",
        "공개 사업계획은 현장 실사 증거가 아닙니다.",
        `candidates.${s.id}`,
        "site-survey",
      );
  }
  refs(b.budget.sourceClaimIds, "budget");
  for (const item of b.budget.items)
    if (!(item.low <= item.base && item.base <= item.high))
      add(
        "invalid-budget-range",
        "예산의 최소·기준·최대 순서가 맞지 않습니다.",
        `budget.${item.id}`,
        "economics",
      );
  if (!b.timeScenario && p.planning?.story.some(beat =>
    beat.visualPlan?.kind === "time-balance" ||
    b.sections.some(section => section.id === beat.sectionId && section.visual === "scenario")
  )) add("missing-time-scenario", "시간 비교 장표에는 실제 작성한 비교 입력이 필요합니다.", "timeScenario", "impact");
  if (b.timeScenario) refs(b.timeScenario.claimIds, "timeScenario");
  if (b.timeScenario && b.timeScenario.afterMinutes > b.timeScenario.beforeMinutes)
    add(
      "negative-time-saving",
      "시간 절감 예시의 전후 값이 뒤바뀌었습니다.",
      "timeScenario",
      "impact",
    );
  const metricIds = new Set(b.metrics.map((m) => m.id));
  for (const m of b.metrics) {
    refs(m.claimIds, `metrics.${m.id}`);
    if (
      (m.baseline !== null || m.target !== null) &&
      !m.claimIds.some((id) =>
        ["user-provided", "externally-verified"].includes(
          claims.get(id)?.status || "",
        ),
      )
    )
      add(
        "unsupported-metric-number",
        "기준선·목표 수치의 근거가 없습니다.",
        `metrics.${m.id}`,
        "impact",
      );
  }
  for (const benefit of b.benefits) {
    refs(benefit.claimIds, `benefits.${benefit.id}`);
    for (const id of benefit.metricIds)
      if (!metricIds.has(id))
        add(
          "unmeasured-benefit",
          `효과의 측정 지표 ${id}가 없습니다.`,
          `benefits.${benefit.id}`,
          "impact",
        );
  }
  for (const section of b.sections) {
    const image = p.slides.find(
      (slide) => slide.reasoning?.sectionId === section.id,
    )?.image;
    const invalidCapacity =
      (section.visual === "map" &&
        (section.candidateIds.length < 1 || section.candidateIds.length > 3)) ||
      (section.visual === "site-detail" && section.candidateIds.length !== 1) ||
      (["architecture", "timeline"].includes(section.visual) &&
        (section.items.length < 1 || section.items.length > 4)) ||
      (section.visual === "decision" &&
        (section.items.length < 1 || section.items.length > 3)) ||
      (section.visual === "editorial" &&
        (!section.items.length || (image && section.items.length > 3))) ||
      (section.visual === "matrix" &&
        (!section.headers ||
          ![3, 4].includes(section.headers.length) ||
          !section.rows?.length)) ||
      (section.visual === "budget" && b.budget.items.length > 5) ||
      (section.visual === "benefits" && b.benefits.length > 3) ||
      (section.visual === "kpis" &&
        b.metrics.filter((m) => !m.guardrail).length > 3);
    if (invalidCapacity)
      add(
        "business-layout-capacity",
        "내용 수가 해당 구성의 수용 범위를 벗어납니다. 장표를 나누거나 구성을 변경하세요.",
        `sections.${section.id}`,
        "storyboard",
      );
    for (const id of section.candidateIds)
      if (!b.candidates.some((s) => s.id === id))
        add(
          "unknown-site-reference",
          "장표가 없는 후보지를 참조합니다.",
          `sections.${section.id}`,
        );
    if (
      section.rows &&
      section.headers &&
      section.rows.some((r) => r.length !== section.headers!.length)
    )
      add(
        "invalid-case-table",
        "표의 열 수가 맞지 않습니다.",
        `sections.${section.id}`,
      );
  }
  if (full) {
    const used = new Set(p.planning!.story.map((s) => s.sectionId));
    const chapters = new Set(
      b.sections.filter((s) => used.has(s.id)).map((s) => s.chapter),
    );
    for (const ch of [
      "summary",
      "regional",
      "sites",
      "delivery",
      "economics",
      "impact",
      "governance",
      "decision",
    ])
      if (!(ch === "economics" && b.economicsPresentation === "omitted-by-request") && !chapters.has(ch as any))
        add(
          "missing-business-chapter",
          `사업기획의 필수 장 ${ch}가 없습니다.`,
          "sections",
        );
    const story = p.planning!.story;
    if (story.length !== b.targetSlideCount)
      add(
        "incomplete-deck-scope",
        `요청한 ${b.targetSlideCount}장과 기획 장수가 다릅니다.`,
        "story",
        "storyboard",
      );
    for (const beat of story)
      if (
        beat.stage === "business" &&
        (!beat.sectionId || !b.sections.some((s) => s.id === beat.sectionId))
      )
        add(
          "unbound-business-page",
          "사업 장표가 구조화 내용과 연결되지 않았습니다.",
          `story.${beat.id}`,
          "storyboard",
        );
    if (checkSlides && p.slides.length !== b.targetSlideCount)
      add(
        "incomplete-rendered-deck",
        "제작 장수가 기획과 다릅니다.",
        "slides",
        "storyboard",
      );
  }
  return issues;
}
export function businessDossier(p: ProjectData) {
  const b = p.businessCase;
  if (!b) return "사업기획 확장 데이터 없음\n";
  const money = (v: number) => `${(v / 10000).toLocaleString("ko-KR")}만원`;
  const totals = b.budget.status === "unquoted" ? null : budgetTotals(b.budget);
  const scenario = b.timeScenario ? scenarioResult(b.timeScenario) : null;
  return (
    [
      `# ${p.title} — 분야별 검토 및 사업기획 근거`,
      p.proposer
        ? `제안 주관: ${p.proposer.legalName}\n기술 협력: ${p.proposer.collaborators.join(" · ")}\n근거: ${p.proposer.sourceClaimIds.join(", ")} (제공 원문의 제안 구조, 계약 확정 아님)`
        : "제안 주관 미지정",
      "검토 방식: 현 대화의 Codex가 분야별 관점을 적용한 검토. 외부 자격 전문가 또는 독립 모델 여러 개의 실제 검토를 받은 것으로 표시하지 않음.",
      `## 지역 맥락\n\n${b.context.entityName} / 확인 ${b.context.asOf}\n\n필요성 가설: ${b.context.needHypothesis}\n\n미확인: ${b.context.notEstablished.join("; ")}`,
      ...b.expertReviews.map(
        (r) =>
          `## ${r.discipline}\n\n${r.conclusion}\n\n${r.findings.map((f) => `- 검토: ${f.issue}\n  근거: ${f.evidenceIds.join(", ")}\n  반영: ${f.recommendation}\n  반영 장표: ${f.storyBeatIds.join(", ")}\n  확인 기준: ${f.acceptanceCheck}\n  상태: ${f.status}`).join("\n")}`,
      ),
      `## 상충 관점의 조정\n\n${b.resolutions.map((r) => `- ${r.tradeoff}\n  결정: ${r.decision}\n  이유: ${r.rationale}\n  남은 확인: ${r.remainingCheck}`).join("\n")}`,
      `## 후보지\n\n${b.candidates.map((s) => `### ${s.name}\n\n주소·영역: ${s.address}\n공개 확인: ${s.publishedFacts}\n설치 가설: ${s.physicalHypothesis}\n예상 구성: ${s.proposedPackage}\n제약: ${s.constraints.join("; ")}\n실사: ${s.fieldStatus}\n판단: ${s.selection} — ${s.selectionReason}\n확인 과제: ${s.readiness}\n근거: ${s.claimIds.join(", ")}`).join("\n\n")}`,
      totals ? `## ${b.productStrategy ? "기존 축소안 예산 (대형 LED·회수/재설치 제외, 확장안 총액 아님)" : "기획 예산 (확정 견적·시 예산 아님)"}\n\n${b.budget.scope}\n\n${b.budget.items.map((i) => `- ${i.label}: 최소 ${money(i.low)} / 기준 ${money(i.base)} / 최대 ${money(i.high)}`).join("\n")}\n\n합계: ${money(totals.low)} / ${money(totals.base)} / ${money(totals.high)}. VAT ${b.budget.vatRate * 100}% 가정 시 기준 ${money(totals.gross)}.\n제외: ${b.budget.excluded.join("; ")}` : `## 사업비 — 미견적\n\n${b.budget.scope}\n\n금액 입력이 없어 합계를 계산하지 않음.\n범위 조건: ${b.budget.excluded.join("; ")}`,
      `## 기대효과와 측정\n\n${b.benefits.map((i) => `- ${i.beneficiary}: ${i.change} → ${i.expectedBenefit}\n  측정: ${i.metricIds.join(", ")}\n  해석 한계: ${i.attributionLimit}`).join("\n")}\n\n${b.metrics.map((m) => `- ${m.name}: ${m.definition}\n  산식: ${m.formula}\n  기준선: ${m.baseline === null ? "미측정" : m.baseline}\n  목표: ${m.target === null ? "미확정" : m.target}\n  목표 설정: ${m.targetPolicy}\n  수집: ${m.measurement}\n  책임 제안: ${m.owner}`).join("\n")}`,
      b.timeScenario && scenario ? `## ${b.productStrategy ? "이전 기록시간 산식 참고 (이번 재사용 경제성 평가의 근거 아님)" : "시간 절감 계산 예시 (가정·실측 아님)"}\n\n${b.timeScenario.eventsPerDay}건/일 × ${b.timeScenario.daysPerMonth}일/월 × (${b.timeScenario.beforeMinutes}−${b.timeScenario.afterMinutes})분/건 ÷ 60 = ${scenario.hoursSaved}시간/월.\n${b.timeScenario.attributionLimit}` : "## 업무시간 절감\n\n비교 입력이 없으므로 계산하지 않음. 실제 업무시간·추가 운영 부담은 현장 관측 후 평가.",
      b.productPositioning
        ? `## 제품 선택 이유와 공개 기능군 비교\n\n${b.productPositioning.strengths.map(r=>`- ${r.label}: ${r.mechanism} / 구매 가치: ${r.buyerValue} / 후속 증빙: ${r.proof}`).join("\n")}\n\n${b.productPositioning.comparisons.map(r=>`- ${r.name} (${r.category}): ${r.confirmed} / 범위 확인: ${r.scopeQuestion} / 근거: ${r.claimIds.join(", ")}`).join("\n")}\n\n${b.productPositioning.opportunities.map(r=>`- ${r.label}: ${r.localAnchor} / ${r.offer} / ${r.condition}`).join("\n")}\n\n3사 협력 제품을 자체 제작 AI NPU 안전관리 장치·컬러 LED AIoT 전광판으로 소개하고, AI 지능형 안전 관제를 함께 제안. 상세 사양·시험 자료는 정식 제안 시 첨부 예정. 최고 시인성·성능 우위는 비교시험으로 입증 전. 현재 단계에서 공급 역량과 통합 사업안을 설명하며 가격·TOPS·휘도·판독거리 숫자는 미제시.`
        : "",
      b.productPositioning?.platform
        ? `## 자체 기능을 가진 두 제품과 통합관제\n\n${b.productPositioning.platform.products.map(r=>`- ${r.name}: ${r.functions.join(" / ")} / 근거 ${r.claimIds.join(", ")}`).join("\n")}\n\n${b.productPositioning.platform.control.name}: ${b.productPositioning.platform.control.functions.join(" / ")}\n\n평상시: ${b.productPositioning.platform.displayPolicy.normalContent.join(" / ")}\n위험 시: ${b.productPositioning.platform.displayPolicy.hazardAction}\nAI 콘텐츠는 담당자 검토 후 게시. CCTV는 권한 있는 내부 화면으로 제한하며 화면 방향·수신자별 편성을 구분. 표출 우선순위는 제안 운영 설계. 대외 제품 명칭은 3사 협력 제품 관점으로 사용하고 세부 제조 이력은 근거 원장에 보존.`
        : "",
      b.municipalCase
        ? `## 천안시 도입 가치와 추진안 (협의 전 제안)\n\n${b.municipalCase.benefits.map((r) => `- ${r.audience}: ${r.before} → ${r.intervention} → ${r.outcome} / 측정 ${r.metricIds.join(", ")}`).join("\n")}\n\n대표 출입구 ${b.municipalCase.pilot.gates}개소 / 전체 ${b.municipalCase.pilot.totalMonths}개월 / 현장 운영 약${b.municipalCase.pilot.fieldMonths}개월 / 사업비: 견적 전\n\n${b.municipalCase.pilot.scope.map((r) => `- ${r.label}: ${r.detail}`).join("\n")}\n\n${b.municipalCase.evaluation.map((r) => `- 판단: ${r.question} / 관찰: ${r.observation} / 근거: ${r.decision}`).join("\n")}\n\n${b.municipalCase.expansion.map((r) => `- ${r.label}: ${r.scope} / 남길 것: ${r.carry} / 판단: ${r.decision}`).join("\n")}`
        : "",
      b.productStrategy
        ? `## 양방향 안내·반복 활용 사업안 (사용자 요구 기반, 검증·계약 전)\n\n${b.productStrategy.modules.map((m) => `- ${m.name} / 대상: ${m.audience} / 조건: ${m.trigger} / 기능: ${m.action} / 검증: ${m.acceptance} / 지표: ${m.metricIds.join(", ")}`).join("\n")}\n\n${b.productStrategy.displayStates.map((s) => `- 화면 상태: ${s.label} / 의미: ${s.meaning} / 대응: ${s.action}`).join("\n")}\n\n${b.productStrategy.lifecycle.map((s) => `- ${s.label} / 책임 협의: ${s.owner} / 산출물: ${s.deliverable} / 관문: ${s.gate}`).join("\n")}\n\n${b.productStrategy.ownershipOptions.map((o) => `- ${o.label} / ${o.owner} / ${o.custody} / ${o.service} / ${o.decision}`).join("\n")}\n\n${b.productStrategy.costLines.map((c) => `- ${c.label}: ${c.basis} / 금액: 견적 전`).join("\n")}\n\n예산 개정: ${b.productStrategy.budgetRevision.baselineLabel} / 추가 범위: ${b.productStrategy.budgetRevision.addedScope.join("; ")} / ${b.productStrategy.budgetRevision.decision}\n\n${b.productStrategy.reuseDecision}\n\n영상 경계: ${b.productStrategy.privacyBoundary}`
        : "",
      b.deliveryAssurance
        ? `## 실행·검토 조건 (협의 전 제안)\n\n${b.deliveryAssurance.qualification.map((q) => `- 후보 판단: ${q.criterion} / 근거: ${q.evidence} / 보류: ${q.holdWhen}`).join("\n")}\n\n${b.deliveryAssurance.stageGates.map((g) => `- 단계 ${g.nodeId}: ${g.deliverable} / 통과: ${g.acceptance} / 검토: ${g.reviewer}`).join("\n")}\n\n${b.deliveryAssurance.responsibilityRows.map((r) => `- 업무: ${r.activity} / 확인 책임 제안: ${b.deliveryAssurance!.actors.find((a) => a.id === r.ownerId)?.label} / 수행·협력: ${r.contributorIds.map((id) => b.deliveryAssurance!.actors.find((a) => a.id === id)?.label).join(", ")} / 문서: ${r.deliverable}`).join("\n")}\n\n${b.deliveryAssurance.fallbacks.map((f) => `- 장애: ${f.condition} / 확인: ${f.detection} / 조치: ${f.action} / 담당 제안: ${b.deliveryAssurance!.actors.find((a) => a.id === f.ownerId)?.label} / 재개 전: ${f.resumeEvidence}`).join("\n")}\n\n${b.deliveryAssurance.approvalGates.map((g) => `- 착수 관문: ${g.label} / 확인 문서: ${g.document} / 통과: ${g.passWhen} / 보류: ${g.holdWhen}`).join("\n")}\n\n${b.deliveryAssurance.currentRequests.map((r) => `- 현재 요청: ${r.label} / ${r.action} / 산출물: ${r.artifact}`).join("\n")}\n후속 결정: ${b.deliveryAssurance.laterDecision}`
        : "",
      `## 출처 및 주장 원장\n\n${p.sources.map((s) => `- ${s.id} ${s.title} [${s.scope}] ${s.url || s.materialId || ""}\n  확인: ${s.checkedAt || "입력 자료"}\n  확인 구절: ${s.excerpt || "사용자 원문 참조"}\n  한계: ${s.applicability || "제공 자료의 범위"}`).join("\n")}\n\n${p.claims.map((c) => `- ${c.id} [${c.scope}/${c.status}/${c.evidenceKind}] ${c.text} (근거 ${c.sourceIds.join(", ")})`).join("\n")}`,
    ].join("\n\n") + "\n"
  );
}
