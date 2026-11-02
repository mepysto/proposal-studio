import { visualAdequacy } from "../visual-assets/adequacy.js";
import { compositionRenderingAudit } from "../art-direction/index.js";
import { POSITIONING_KINDS } from "../business-case/positioning-schema.js";
import { MUNICIPAL_KINDS } from "../business-case/municipal-schema.js";
import { PRODUCT_KINDS } from "../business-case/product-schema.js";
import { DECISION_VISUAL_KINDS } from "../business-case/delivery-schema.js";
import { planningAudit } from "../planning/index.js";
import type { ProjectData } from "../core/schema.js";
import { type Element, estimatedHeight } from "../pptx-renderer/index.js";
export interface Issue {
  severity: "error" | "warning";
  code: string;
  slideId?: string;
  elementId?: string;
  message: string;
}
export function geometry(elements: Element[]): Issue[] {
  const issues: Issue[] = [];
  for (const e of elements) {
    const add = (severity: Issue["severity"], code: string, message: string) =>
      issues.push({
        severity,
        code,
        slideId: e.slideId,
        elementId: e.id,
        message,
      });
    if (
      ![e.x, e.y, e.w, e.h].every(Number.isFinite) ||
      e.w <= 0 ||
      e.h <= 0 ||
      e.x < -0.01 ||
      e.y < -0.01 ||
      e.x + e.w > 13.35 ||
      e.y + e.h > 7.51
    )
      add("error", "out-of-bounds", "Element outside slide canvas");
    if (
      e.kind === "text" &&
      e.text &&
      e.fontSize &&
      estimatedHeight(e.text, e.w, e.fontSize) > e.h + 0.06
    )
      add(
        "error",
        "text-overflow",
        "Estimated text height exceeds its box; reflow or shorten before export",
      );
    if (e.kind === "image" && e.image?.fit === "cover" && e.image.crop) {
      const c = e.image.crop;
      const visibleAspect =
        (e.image.width * (1 - c.left - c.right)) /
        (e.image.height * (1 - c.top - c.bottom));
      if (
        !Number.isFinite(visibleAspect) ||
        Math.abs(visibleAspect / (e.w / e.h) - 1) > 0.001
      )
        add(
          "error",
          "image-aspect-distortion",
          "Source crop must preserve the original image proportions",
        );
    }
    if (e.kind === "image" && e.image && e.image.dpi < 120)
      add(
        "warning",
        "low-resolution",
        `Image effective resolution ${Math.round(e.image.dpi)} DPI`,
      );
  }
  for (let i = 0; i < elements.length; i++)
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i],
        b = elements[j];
      if (a.slideId !== b.slideId || a.kind !== "text" || b.kind !== "text")
        continue;
      const x = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x),
        y = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (x > 0.03 && y > 0.03)
        issues.push({
          severity: "error",
          code: "text-overlap",
          slideId: a.slideId,
          message: `Text boxes ${a.id} and ${b.id} intersect`,
        });
    }
  return issues;
}
export function review(
  p: ProjectData,
  elements: Element[],
  pdf?: any,
  options: { partial?: boolean } = {},
) {
  const issues = [
    ...visualAdequacy(p, elements).pages.flatMap(page => page.missing.map(mark => ({
      severity:"error" as const,code:"missing-explanatory-mark",slideId:page.slideId,
      message:`계획한 실제 시각 요소가 없습니다: ${mark}`,
    }))),
    ...geometry(elements),
    ...compositionRenderingAudit(p, elements),
    ...visualCoverage(p, elements),
    ...identityAndAlignment(p, elements),
    ...intentRenderingAudit(p, elements),
  ];
  const planning = planningAudit(p, !options.partial);
  for (const issue of planning.issues.filter((i) => i.severity === "error"))
    issues.push({ ...issue });
  for (const s of p.slides) {
    if (!s.claimIds.length)
      issues.push({
        severity: "warning",
        code: "unlinked-evidence",
        slideId: s.id,
        message: "No structured claim attached; human content review required",
      });
  }
  if (pdf) {
    for (const issue of pdf.issues)
      issues.push({
        severity: "error",
        code: `pdf-${issue}`,
        message: "PDF rendering check failed",
      });
    const normalize = (s: string) =>
      s
        .normalize("NFKC")
        .replace(/[^\p{L}\p{N}]/gu, "")
        .toLowerCase();
    const wanted = normalize(p.design.font);
    const actual = (pdf.fonts || []).map((s: string) => normalize(s));
    if (!actual.some((s: string) => s.includes(wanted)))
      issues.push({
        severity: "error",
        code: "font-substitution",
        message: `Requested ${p.design.font}; PDF fonts: ${pdf.fonts.join(", ")}`,
      });
    for (const e of elements.filter((e) => e.kind === "text")) {
      const index = p.slides.findIndex((s) => s.id === e.slideId);
      const extracted = normalize(pdf.pageTexts?.[index] ?? pdf.text ?? "");
      if (e.text && !extracted.includes(normalize(e.text)))
        issues.push({
          severity: "error",
          code: "pdf-text-mismatch",
          slideId: e.slideId,
          message: `Rendered text requires visual check: ${e.text.slice(0, 70)}`,
        });
    }
  } else
    issues.push({
      severity: "error",
      code: "pdf-not-verified",
      message: "PPTX → PDF → PNG verification has not run",
    });
  return {
    planning,
    qualityTarget: p.qualityTarget,
    readyForProposal: planning.status === "ready-for-human-review",
    status: issues.some((i) => i.severity === "error")
      ? "failed"
      : "automated-checks-passed",
    finalApproval: false,
    requiresHumanVisualApproval: true,
    checkedAt: new Date().toISOString(),
    checks: {
      geometry: true,
      visualCoverage: p.planning?.visualPolicy
        ? "per-page composition footprint and rendered marks; semantic review required"
        : "not-required",
      textFit: "heuristic; rendered PDF text compared when available",
      overlap:
        "text-box collisions; decorative shape overlaps require visual review",
      imageResolution: true,
      imageAspect:
        "Source/crop ratio checked for fitted images; rendered review required",
      fonts:
        "PDF embedded font names checked; per-glyph shape correctness requires visual review",
      renderedPages: pdf?.rendered || 0,
      liveResearch: false,
      visionModel: false,
    },
    issues,
    qualityDimensions: [
      "Visual Hierarchy",
      "Typography",
      "Composition",
      "Readability",
      "Information Density",
      "Image Quality",
      "Narrative Clarity",
      "Design Consistency",
    ].map((name) => ({
      name,
      score: null,
      method: "human visual assessment pending; no subjective score invented",
    })),
    unverifiedClaims: p.claims
      .filter((c) => c.status !== "externally-verified")
      .map((c) => c.id),
  };
}

/** Composition footprint, not ink area or a semantic quality score. Decorative rules do not count. */
export function visualCoverage(p: ProjectData, elements: Element[]): Issue[] {
  if (!p.planning?.visualPolicy) return [];
  const minimum = p.planning.visualPolicy.minVisualAreaRatio;
  const issues: Issue[] = [];
  for (const s of p.slides) {
    const all = elements.filter((e) => e.slideId === s.id);
    if(s.reasoning?.visualPlan?.kind==="contact-card"){
      const c=p.proposer?.contact;
      const identity=c&&all.some(e=>e.kind==="image"&&e.image?.path===c.logoPath&&e.w>=3&&e.h>=.8)&&all.some(e=>e.kind==="text"&&e.text===p.proposer?.legalName&&(e.fontSize||0)>=24)&&[c.phone,c.email].every(value=>all.some(e=>e.kind==="text"&&e.text===value&&(e.fontSize||0)>=18));
      if(!identity)issues.push({severity:"error",code:"missing-contact-identity",slideId:s.id,message:"종결 장표의 실제 로고·제안사명·연락처를 읽을 수 있는 크기로 배치하세요."});
      continue;
    }
    const candidates = all.filter(
      (e) =>
        e.kind === "image" ||
        e.kind === "chart" ||
        (e.kind === "diagram" && e.visualRole === "explanation"),
    );
    const substantial = candidates.some((e) => {
      if ((e.w * e.h) / (13.333333 * 7.5) < minimum) return false;
      if (e.kind !== "diagram") return true;
      return (
        all.filter(
          (mark) =>
            ["shape", "image", "chart"].includes(mark.kind) &&
            mark.x >= e.x - 0.01 &&
            mark.y >= e.y - 0.01 &&
            mark.x + mark.w <= e.x + e.w + 0.02 &&
            mark.y + mark.h <= e.y + e.h + 0.02,
        ).length >= 3
      );
    });
    if (!substantial)
      issues.push({
        severity: "error",
        code: "missing-rendered-visual",
        slideId: s.id,
        message:
          "설명용 이미지·차트·실제 도형으로 구성한 다이어그램이 충분한 크기로 렌더링되지 않았습니다.",
      });
  }
  return issues;
}

export function identityAndAlignment(
  p: ProjectData,
  elements: Element[],
): Issue[] {
  if (p.design.layoutStandard !== "technical-editorial-v2") return [];
  const issues: Issue[] = [];
  for (const s of p.slides) {
    if (/니다[.!?。]?\s*$/.test(s.title))
      issues.push({
        severity: "error",
        code: "narrated-page-title",
        slideId: s.id,
        message:
          "페이지 제목은 ~니다 서술형 대신 간결한 주제·핵심 메시지로 작성하세요.",
      });
    const texts = elements.filter(
      (e) => e.slideId === s.id && e.kind === "text",
    );
    const brand = texts.find((e) => e.text === p.proposer?.legalName);
    if (!brand)
      issues.push({
        severity: "error",
        code: "missing-company-on-page",
        slideId: s.id,
        message: "제안 주관 회사명이 페이지에 없습니다.",
      });
    const guide = s.reasoning?.visualPlan?.readingGuide;
    if (guide) {
      const message = texts.find(
        (e) => e.emphasisRole === "primary-message" && e.text === guide.message,
      );
      const background = elements.find(
        (e) =>
          e.slideId === s.id &&
          e.emphasisRole === "primary-background" &&
          e.kind === "shape" &&
          e.shapeType === "roundRect",
      );
      if (
        !message ||
        !background ||
        !message.bold ||
        (message.fontSize || 0) < 19 ||
        !message.textRuns?.some(
          (r) => r.text === guide.keyPhrase && r.options.bold,
        ) ||
        message.x < background.x ||
        message.y < background.y ||
        message.x + message.w > background.x + background.w + 0.01 ||
        message.y + message.h > background.y + background.h + 0.01
      )
        issues.push({
          severity: "error",
          code: "missing-reading-hierarchy",
          slideId: s.id,
          message:
            "계획한 핵심 문구의 둥근 배경·크기·볼드·부분 강조가 출력에 없습니다.",
        });
    }
    const title = texts.find((e) => e.text === s.title);
    if (!s.compositionBrief && title && (title.align !== "left" || Math.abs(title.x - 0.64) > 0.02))
      issues.push({
        severity: "error",
        code: "title-grid-misalignment",
        slideId: s.id,
        message: "제목의 공통 왼쪽 정렬 기준이 어긋났습니다.",
      });
    if (s.layout === "hero" && brand && (brand.fontSize || 0) < 20)
      issues.push({
        severity: "error",
        code: "weak-proposer-on-cover",
        slideId: s.id,
        message: "표지의 제안 주관 회사명을 본문보다 명확하게 표시하세요.",
      });
  }
  return issues;
}

export function intentRenderingAudit(
  p: ProjectData,
  elements: Element[],
): Issue[] {
  const issues: Issue[] = [];
  for (const s of p.slides) {
    const v = s.reasoning?.visualPlan;
    if (!v) continue;
    const marks = elements.filter((e) => e.slideId === s.id);
    if(v.kind==="service-model")for(const edge of v.edges.filter(e=>e.bidirectional)){
      if(!marks.some(m=>m.collaborationEdge?.from===edge.from&&m.collaborationEdge.to===edge.to&&m.collaborationEdge.bidirectional))
        issues.push({severity:"error",code:"collaboration-link-not-rendered",slideId:s.id,message:"삼각 협업 관계의 양방향 연결이 빠졌습니다."});
    }
    if(v.kind==="evaluation-plan")for(const [i,r]of (p.businessCase?.municipalCase?.evaluation||[]).entries()){
      if(r.demonstration&&!marks.some(m=>m.demonstrationId===String(i+1)))
        issues.push({severity:"error",code:"demonstration-not-rendered",slideId:s.id,message:"시험 조건·반응·확인 기록의 행이 빠졌습니다."});
    }

    if(v.kind==="competitive-context")for(const r of p.businessCase?.productPositioning?.comparisonMatrix||[])if(!marks.some(e=>e.comparisonCriterion===r.criterion))issues.push({severity:"error",code:"comparison-row-not-rendered",slideId:s.id,message:"대안·제안 비교 행이 실제 출력되지 않았습니다."});
    if(v.kind==="driver-display"&&p.businessCase?.productStrategy?.driverScreen){
      for(const o of p.businessCase.productStrategy.driverScreen.objectBoxes)if(!marks.some(e=>e.displayObjectId===o.id))issues.push({severity:"error",code:"recognition-overlay-not-rendered",slideId:s.id,message:"계획한 객체 인식 표시가 없습니다."});
      if(!marks.some(e=>e.fieldSafetyIndicator))issues.push({severity:"error",code:"field-control-not-rendered",slideId:s.id,message:"유도원 통제 상태의 실제 표시가 없습니다."});
    }
    if(v.kind==="public-value")for(const scene of p.businessCase?.municipalCase?.benefitScenes||[])if(!marks.some(e=>e.kind==="image"&&e.image?.path===scene.path))issues.push({severity:"error",code:"benefit-image-not-rendered",slideId:s.id,message:"사업가치를 설명할 이미지가 없습니다."});
    if((POSITIONING_KINDS as readonly string[]).includes(v.kind) && !marks.some(e=>e.kind==="diagram" && e.positioningVisualKind===v.kind))
      issues.push({severity:"error",code:"positioning-not-rendered",slideId:s.id,message:"제품 강점·비교의 실제 도식이 없습니다."});
    if (
      (MUNICIPAL_KINDS as readonly string[]).includes(v.kind) &&
      !marks.some(
        (e) => e.kind === "diagram" && e.municipalVisualKind === v.kind,
      )
    )
      issues.push({
        severity: "error",
        code: "municipal-visual-not-rendered",
        slideId: s.id,
        message: "계획한 천안시 사업 제안 도식이 렌더링되지 않았습니다.",
      });
    if (
      PRODUCT_KINDS.includes(v.kind) &&
      !marks.some((e) => e.kind === "diagram" && e.productVisualKind === v.kind)
    )
      issues.push({
        severity: "error",
        code: "product-visual-not-rendered",
        slideId: s.id,
        message: "계획한 제품·재사용 구성이 렌더링되지 않았습니다.",
      });
    if (
      DECISION_VISUAL_KINDS.includes(v.kind) &&
      !marks.some(
        (e) =>
          ["diagram", "chart"].includes(e.kind) &&
          e.deliveryVisualKind === v.kind,
      )
    )
      issues.push({
        severity: "error",
        code: "delivery-visual-not-rendered",
        slideId: s.id,
        message: "실행·의사결정 구성이 실제 렌더링되지 않았습니다.",
      });
    if (
      v.intent === "geographic" &&
      !marks.some(
        (e) => e.kind === "image" && e.geographicAssetId === v.map?.assetId,
      )
    )
      issues.push({
        severity: "error",
        code: "geographic-visual-not-rendered",
        slideId: s.id,
        message: "계획한 실제 지도가 렌더링되지 않았습니다.",
      });
    if (
      v.chart &&
      !marks.some((e) => e.kind === "chart" && e.dataRef === v.chart?.datasetId)
    )
      issues.push({
        severity: "error",
        code: "evidence-chart-not-rendered",
        slideId: s.id,
        message: "데이터에 연결된 차트가 렌더링되지 않았습니다.",
      });
    if (
      v.intent === "causal" &&
      !marks.some(
        (e) =>
          e.kind === "diagram" &&
          v.chains?.every((c) => e.causalChainIds?.includes(c.id)),
      )
    )
      issues.push({
        severity: "error",
        code: "causal-flow-not-rendered",
        slideId: s.id,
        message: "원인부터 결과·측정까지의 흐름이 렌더링되지 않았습니다.",
      });
  }
  return issues;
}
