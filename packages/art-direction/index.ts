import type { ProjectData } from "../core/schema.js";
import type { Element } from "../pptx-renderer/index.js";
import type { BoxData } from "./schema.js";
import { resolveTokens } from "./tokens.js";
export {
  colBox,
  splitColumns,
  splitRows,
  computeGraphBoxes,
  defaultGrid,
  type GridConfig,
} from "./grid.js";
export const contains = (a: BoxData, b: BoxData, tolerance = 0.02) =>
  b.x >= a.x - tolerance &&
  b.y >= a.y - tolerance &&
  b.x + b.w <= a.x + a.w + tolerance &&
  b.y + b.h <= a.y + a.h + tolerance;
export const overlaps = (a: BoxData, b: BoxData) =>
  Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 0.025 &&
  Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 0.025;
export const sameBox = (a: BoxData, b: BoxData) =>
  ["x", "y", "w", "h"].every(
    (k) => Math.abs(a[k as keyof BoxData] - b[k as keyof BoxData]) < 0.025,
  );

export function directionAudit(p: ProjectData, checkSlides = true) {
  const issues: {
    severity: "error";
    code: string;
    message: string;
    path: string;
    returnTo: string;
  }[] = [];
  const add = (code: string, message: string, path: string) =>
    issues.push({
      severity: "error",
      code,
      message,
      path,
      returnTo: "art-direction",
    });
  for (const ref of p.designDirection?.references || [])
    if (!p.sources.some((s) => s.id === ref.sourceId))
      add(
        "unknown-design-reference",
        "디자인 참고 해석을 실제 출처에 연결하세요.",
        "designDirection.references",
      );
  const pages = p.planning?.story || p.slides;
  for (const s of pages) {
    const b = s.compositionBrief;
    if (!b) continue;
    const at = `composition.${s.id}`;
    const v =
      "visualPlan" in s
        ? s.visualPlan
        : (s as ProjectData["slides"][number]).reasoning?.visualPlan;
    if (!p.designDirection)
      add(
        "missing-design-direction",
        "구도의 근거가 되는 제안별 콘셉트를 작성하세요.",
        at,
      );
    if (!v?.readingGuide || !v.explanation)
      add(
        "missing-composition-explanation",
        "구도에 연결할 핵심 문구와 설명 계약이 필요합니다.",
        at,
      );
    const areas = [b.title, b.message, b.visualBox, b.caption];
    const proof =
      "proofClaimIds" in s
        ? s.proofClaimIds
        : (s as ProjectData["slides"][number]).claimIds;
    if (
      b.narrative?.evidenceClaimIds.some(
        (id) => !proof.includes(id) || !p.claims.some((c) => c.id === id),
      )
    )
      add(
        "unbound-narrative-evidence",
        "독자의 판단 변화는 해당 장표의 실제 근거에 연결하세요.",
        at,
      );
    for (const ref of b.referenceApplications || []) {
      if (
        !p.designDirection?.references.some(
          (r) => r.sourceId === ref.sourceId && r.role === "design",
        ) ||
        !p.sources.some((s) => s.id === ref.sourceId)
      )
        add(
          "unbound-reference-application",
          "디자인 적용 원리를 실제 디자인 참고자료에 연결하세요.",
          at,
        );
      if (
        ref.controls.some(
          (control) =>
            !b[control] ||
            (control === "typography" &&
              !Object.values(b.typography || {}).some((x) => x !== undefined)),
        )
      )
        add(
          "reference-control-not-authored",
          "채택했다고 기록한 표현의 실제 제작 설정이 없습니다.",
          at,
        );
    }
    if (b.nodeTreatment && !(b.nodeTreatment === "document"
      ? ["graph", "swimlane", "scene", "annotated-screen", "causal-chain", "chart"]
      : ["graph", "swimlane"]).includes(b.visual))
      add(
        "node-treatment-needs-graph",
        "노드 표현은 관계도 또는 스윔레인에서만 지정하세요.",
        at,
      );
    if (b.edgeRoutes && Object.keys(b.edgeRoutes).length > 0) {
      if (!["graph", "swimlane"].includes(b.visual))
        add(
          "edge-routes-need-graph",
          "경유 라우팅은 관계도 또는 스윔레인에서만 지정하세요.",
          at,
        );
      const validEdgeKeys = new Set(
        (v?.edges || []).map((e) => `${e.from}:${e.to}`),
      );
      const badRoute = Object.entries(b.edgeRoutes).some(([k, route]) => {
        if (!validEdgeKeys.has(k) || route.waypoints.length < 2) return true;
        return route.waypoints.some(([wx, wy], idx) => {
          const inBounds =
            wx >= b.visualBox.x - 0.025 &&
            wx <= b.visualBox.x + b.visualBox.w + 0.025 &&
            wy >= b.visualBox.y - 0.025 &&
            wy <= b.visualBox.y + b.visualBox.h + 0.025;
          if (!inBounds) return true;
          if (idx === 0) return false;
          const [px, py] = route.waypoints[idx - 1];
          return Math.abs(wx - px) > 0.015 && Math.abs(wy - py) > 0.015;
        });
      });
      if (badRoute)
        add(
          "invalid-edge-route",
          "경유 경로는 실제 관계에 연결되고 시각 영역 내 수평·수직 선분이어야 합니다.",
          at,
        );
    }
    if (b.swimlaneLayout || b.visual === "swimlane") {
      const sl = b.swimlaneLayout;
      const laneEntries = Object.entries(sl?.lanes || {});
      const laneBoxes = laneEntries.map(([, box]) => box);
      const nodeIds = (v?.nodes || []).map((n) => n.id);
      if (
        b.visual !== "swimlane" ||
        !sl ||
        laneEntries.length < 2 ||
        laneBoxes.some((lb) => !contains(b.visualBox, lb)) ||
        laneBoxes.some((lb, i) =>
          laneBoxes.some((other, j) => i < j && overlaps(lb, other)),
        ) ||
        nodeIds.some((id) => {
          const laneId = sl.nodeLanes[id];
          const laneBox = laneId ? sl.lanes[laneId] : undefined;
          const nb = b.nodeBoxes[id];
          return !laneBox || !nb || !contains(laneBox, nb);
        })
      )
        add(
          "invalid-swimlane-layout",
          "스윔레인 행과 소속 노드의 영역을 실제 주체 경계 안에 분리해 배치하세요.",
          at,
        );
    }
    if (b.screenLayout || b.visual === "annotated-screen") {
      const sc = b.screenLayout;
      const sideBoxes = Object.values(sc?.sidePanelBoxes || {});
      if (
        b.visual !== "annotated-screen" ||
        !sc ||
        !contains(b.visualBox, sc.frameBox) ||
        (sc.statusBannerBox &&
          (!contains(b.visualBox, sc.statusBannerBox) ||
            overlaps(sc.frameBox, sc.statusBannerBox))) ||
        sideBoxes.some(
          (sb) =>
            !contains(b.visualBox, sb) ||
            overlaps(sb, sc.frameBox) ||
            (sc.statusBannerBox ? overlaps(sb, sc.statusBannerBox) : false),
        ) ||
        sideBoxes.some((sb, i) =>
          sideBoxes.some((other, j) => i < j && overlaps(sb, other)),
        )
      )
        add(
          "invalid-screen-layout",
          "화면 프레임·상태 배너·보조 패널 영역을 시각물 영역 안에서 서로 분리하세요.",
          at,
        );
    }
    if (b.chartFocus) {
      const d = p.quantitativeDatasets.find(
        (d) => d.id === v?.chart?.datasetId,
      );
      if (
        b.visual !== "chart" ||
        !d?.rows.some((r) => r.series === b.chartFocus!.series) ||
        b.chartFocus.claimIds.some(
          (id) => !d?.sourceClaimIds.includes(id) || !proof.includes(id),
        )
      )
        add(
          "invalid-chart-focus",
          "강조 계열과 근거를 실제 데이터·장표 근거에 연결하세요.",
          at,
        );
      const n = b.chartFocus.noteBox;
      if (
        n &&
        (n.y < 0.65 || n.y + n.h > 6.65 || areas.some((a) => overlaps(a, n)))
      )
        add(
          "chart-focus-note-overlap",
          "강조 계열의 직접 표기 영역을 본문·차트·근거와 분리하세요.",
          at,
        );
    }
    if (b.mapLayout) {
      const l = b.mapLayout,
        pins = v?.map?.markers.map((m) => m.id) || [],
        labels = Object.values(l.labels);
      if (
        b.visual !== "map" ||
        !contains(b.visualBox, l.image) ||
        pins.some((id) => !l.labels[id]) ||
        Object.keys(l.labels).some((id) => !pins.includes(id)) ||
        labels.some((a) => !contains(b.visualBox, a) || overlaps(a, l.image)) ||
        labels.some((a, i) =>
          labels.some((other, j) => i < j && overlaps(a, other)),
        )
      )
        add(
          "invalid-map-layout",
          "지도와 위치 설명 영역을 실제 마커에 연결하고 서로 분리하세요.",
          at,
        );
    }
    if (areas.some((a) => a.y < 0.65 || a.y + a.h > 6.65))
      add(
        "composition-reserved-zone",
        "브랜드/페이지 출처 영역과 겹치지 않게 배치하세요.",
        at,
      );
    if (
      areas.some((a, i) =>
        areas.some((other, j) => i < j && overlaps(a, other)),
      )
    )
      add(
        "composition-zone-overlap",
        "제목·메시지·시각물·조건 영역을 분리하세요.",
        at,
      );
    if (v) {
      if (
        b.visual === "comparison" &&
        !v.comparisonTable &&
        (v.nodes.length !== p.planning?.alternatives.length ||
          v.nodes.some((n, i) => {
            const a = p.planning?.alternatives[i];
            return (
              !a ||
              n.id !== a.id ||
              n.label !== a.name ||
              n.detail !== a.addresses
            );
          }))
      )
        add(
          "comparison-composition-binding",
          "비교 열의 노드를 실제 대안의 이름·대응 범위와 같은 순서로 연결하세요.",
          at,
        );
      const supported =
        b.visual === "scene"
          ? !!v.scene && ["site", "image-detail", "existing"].includes(v.kind)
          : b.visual === "map"
            ? !!v.map && v.kind === "geographic-map"
            : b.visual === "chart"
              ? !!v.chart && v.kind === "data-chart"
              : b.visual === "timeline"
                ? !!v.schedule && v.kind === "timeline"
                : b.visual === "comparison"
                  ? v.kind === "comparison" && (!!v.comparisonTable || !!p.planning?.alternatives.length)
                  : b.visual === "causal-chain"
                    ? !!v.chains?.length && v.kind === "causal-flow"
                    : b.visual === "annotated-screen"
                      ? !!b.screenLayout &&
                        (!!v.interfaceExample ||
                          (v.kind === "driver-display" &&
                            !!p.businessCase?.productStrategy?.driverScreen))
                      : b.visual === "swimlane"
                        ? !!b.swimlaneLayout &&
                          ["swimlane", "system", "flow"].includes(v.kind) &&
                          !v.chains &&
                          !v.map &&
                          !v.chart &&
                          !v.schedule
                        : [
                            "flow",
                            "system",
                            "journey",
                            "context",
                            "boundary",
                            "swimlane",
                          ].includes(v.kind) &&
                          !v.chains &&
                          !v.map &&
                          !v.chart &&
                          !v.schedule;
      if (!supported)
        add(
          "unsupported-composition-binding",
          "이 구도는 해당 의미 시각화를 지원하지 않습니다. 명시적 제작 구현이 필요합니다.",
          at,
        );
      const labeled =
        b.visual === "graph" || b.visual === "swimlane"
          ? v.edges.filter((e) => e.label).map((e) => `${e.from}:${e.to}`)
          : [];
      if (
        labeled.some((id) => !b.edgeLabelBoxes[id]) ||
        Object.keys(b.edgeLabelBoxes).some((id) => !labeled.includes(id))
      )
        add(
          "composition-edge-label-binding",
          "관계 라벨의 별도 배치 영역을 연결하세요.",
          at,
        );
      const nodeIds =
        b.visual === "graph" || b.visual === "swimlane"
          ? v.nodes.map((n) => n.id)
          : b.visual === "scene"
            ? (v.scene?.annotations || []).map((n) => n.nodeId)
            : b.visual === "causal-chain"
              ? (v.chains || []).flatMap((c) => [
                  `${c.id}:cause`,
                  `${c.id}:intervention`,
                  `${c.id}:response`,
                  `${c.id}:result`,
                ])
              : [];
      if (
        nodeIds.some((id) => !b.nodeBoxes[id]) ||
        Object.keys(b.nodeBoxes).some((id) => !nodeIds.includes(id))
      )
        add(
          "composition-node-binding",
          "노드/장면 주석의 실제 배치 영역을 빠짐없이 연결하세요.",
          at,
        );
      const boxes = Object.values(b.nodeBoxes);
      if (
        boxes.some((box) => !contains(b.visualBox, box)) ||
        boxes.some((box, i) =>
          boxes.some((other, j) => i < j && overlaps(box, other)),
        )
      )
        add(
          "composition-node-layout",
          "시각물 영역 안에서 노드/주석을 겹치지 않게 배치하세요.",
          at,
        );
      const labels = Object.values(b.edgeLabelBoxes);
      if (
        labels.some(
          (box) =>
            !contains(b.visualBox, box) ||
            boxes.some((other) => overlaps(box, other)),
        ) ||
        labels.some((box, i) =>
          labels.some((other, j) => i < j && overlaps(box, other)),
        )
      )
        add(
          "composition-edge-label-overlap",
          "관계 라벨은 노드/다른 라벨과 분리하세요.",
          at,
        );
    }
    if (checkSlides && p.planning) {
      const compiled = p.slides.find((c) => c.id === s.id);
      if (
        compiled &&
        JSON.stringify(compiled.compositionBrief) !== JSON.stringify(b)
      )
        add(
          "stale-composition",
          "기획의 구도 변경 후 장표를 다시 컴파일하세요.",
          at,
        );
    }
  }
  // A stale compiled custom composition must not survive removal from the story.
  if (checkSlides && p.planning)
    for (const s of p.slides)
      if (
        s.compositionBrief &&
        !p.planning.story.find((b) => b.id === s.id)?.compositionBrief
      )
        add(
          "orphaned-composition",
          "장표에 초기 기획과 다른 구도가 남아 있습니다.",
          `slides.${s.id}`,
        );
  return issues;
}

export function compositionRenderingAudit(p: ProjectData, elements: Element[]) {
  const issues: {
    severity: "error";
    code: string;
    slideId: string;
    message: string;
  }[] = [];
  for (const s of p.slides) {
    const b = s.compositionBrief;
    if (!b) continue;
    for (const [part, box] of Object.entries({
      title: b.title,
      message: b.message,
      visual: b.visualBox,
      caption: b.caption,
    })) {
      const e = elements.find(
        (e) => e.slideId === s.id && e.compositionPart === part,
      );
      if (!e || !sameBox(box, e))
        issues.push({
          severity: "error",
          code: "composition-not-rendered",
          slideId: s.id,
          message: `초기 구도와 실제 출력의 ${part} 영역이 다릅니다.`,
        });
    }
    const title = elements.find(
      (e) => e.slideId === s.id && e.compositionPart === "title",
    );
    if (
      title &&
      (title.align !== b.titleAlign ||
        title.fontSize !== (b.typography?.titleSize ?? p.design.titleSize))
    )
      issues.push({
        severity: "error",
        code: "composition-title-mismatch",
        slideId: s.id,
        message: "선언한 제목 위계/정렬이 실제 출력과 다릅니다.",
      });
    if (b.typography) {
      const message = elements.find(
        (e) => e.slideId === s.id && e.emphasisRole === "primary-message",
      );
      const caption = elements.find(
        (e) => e.slideId === s.id && e.compositionPart === "caption",
      );
      if (
        message?.fontSize !== (b.typography.messageSize ?? 21) ||
        caption?.fontSize !== (b.typography.captionSize ?? 14)
      )
        issues.push({
          severity: "error",
          code: "composition-type-scale-mismatch",
          slideId: s.id,
          message: "선언한 핵심 문구/근거 글자 위계가 출력과 다릅니다.",
        });
    }
    if (b.mapLayout)
      for (const [id, box] of Object.entries(b.mapLayout.labels)) {
        if (
          !elements.some(
            (e) =>
              e.slideId === s.id &&
              e.mapLabelId === id &&
              e.kind === "text" &&
              sameBox(e, box),
          )
        )
          issues.push({
            severity: "error",
            code: "map-label-layout-not-rendered",
            slideId: s.id,
            message: `선언한 지도 ${id} 설명 영역이 출력되지 않았습니다.`,
          });
      }
    if (b.mapLayout) {
      const image = elements.find(
        (e) =>
          e.slideId === s.id &&
          e.kind === "image" &&
          e.geographicAssetId === s.reasoning?.visualPlan?.map?.assetId,
      );
      const a = b.mapLayout.image;
      const ratio = image?.image
        ? Math.min(a.w / image.image.width, a.h / image.image.height)
        : 0;
      const w = (image?.image?.width ?? 0) * ratio,
        h = (image?.image?.height ?? 0) * ratio;
      if (
        !image ||
        !sameBox(image, {
          x: a.x + (a.w - w) / 2,
          y: a.y + (a.h - h) / 2,
          w,
          h,
        })
      )
        issues.push({
          severity: "error",
          code: "map-image-layout-not-rendered",
          slideId: s.id,
          message: "선언한 지도 영역과 비율 유지 배치가 실제 출력과 다릅니다.",
        });
    }
    for (const [id, box] of Object.entries(b.nodeBoxes)) {
      if (b.nodeTreatment === "open") {
        const node = s.reasoning?.visualPlan?.nodes.find((n) => n.id === id);
        const marks = elements.filter(
          (e) => e.slideId === s.id && e.compositionNodeId === id,
        );
        if (
          !node ||
          !marks.some((e) => e.kind === "shape" && e.shapeType === "line") ||
          !marks.some(
            (e) =>
              e.kind === "text" && e.text === node.label && contains(box, e),
          ) ||
          !marks.some(
            (e) =>
              e.kind === "text" && e.text === node.detail && contains(box, e),
          )
        )
          issues.push({
            severity: "error",
            code: "composition-node-not-rendered",
            slideId: s.id,
            message: `열린 구도의 ${id} 경계·제목·설명이 실제 출력되지 않았습니다.`,
          });
        continue;
      }
      if (
        !elements.some(
          (e) =>
            e.slideId === s.id &&
            e.compositionNodeId === id &&
            e.kind === "shape" &&
            sameBox(e, box),
        )
      )
        issues.push({
          severity: "error",
          code: "composition-node-not-rendered",
          slideId: s.id,
          message: `선언한 ${id} 노드/주석의 실제 출력이 없습니다.`,
        });
    }
    if (b.chartFocus) {
      const chart = elements.find(
        (e) =>
          e.slideId === s.id &&
          e.kind === "chart" &&
          e.chartFocusSeries === b.chartFocus!.series,
      );
      if (!chart)
        issues.push({
          severity: "error",
          code: "chart-focus-not-rendered",
          slideId: s.id,
          message: "계획한 강조 계열이 실제 차트에 없습니다.",
        });
      if (
        b.chartFocus.noteBox &&
        !elements.some(
          (e) =>
            e.slideId === s.id &&
            e.chartFocusSeries === b.chartFocus!.series &&
            e.kind === "text" &&
            (b.nodeTreatment === "document"
              ? contains(b.chartFocus!.noteBox!, e)
              : sameBox(e, b.chartFocus!.noteBox!)),
        )
      )
        issues.push({
          severity: "error",
          code: "chart-focus-note-not-rendered",
          slideId: s.id,
          message: "강조 계열의 원자료 직접 표기가 없습니다.",
        });
    }
    if (b.visual === "graph" || b.visual === "swimlane")
      for (const edge of s.reasoning?.visualPlan?.edges || []) {
        if (
          !elements.some(
            (e) =>
              e.slideId === s.id &&
              e.compositionEdge?.from === edge.from &&
              e.compositionEdge.to === edge.to &&
              e.compositionEdge.bidirectional === !!edge.bidirectional,
          )
        )
          issues.push({
            severity: "error",
            code: "composition-edge-not-rendered",
            slideId: s.id,
            message: `선언한 ${edge.from}→${edge.to} 관계가 출력되지 않았습니다.`,
          });
        if (
          edge.label &&
          !elements.some(
            (e) =>
              e.slideId === s.id &&
              e.kind === "text" &&
              e.text === edge.label &&
              !!b.edgeLabelBoxes[`${edge.from}:${edge.to}`] &&
              sameBox(e, b.edgeLabelBoxes[`${edge.from}:${edge.to}`]),
          )
        )
          issues.push({
            severity: "error",
            code: "composition-label-not-rendered",
            slideId: s.id,
            message: "선언한 관계 라벨이 출력되지 않았습니다.",
          });
      }
    if (b.visual === "swimlane" && b.swimlaneLayout) {
      for (const [laneId, laneBox] of Object.entries(b.swimlaneLayout.lanes)) {
        if (
          !elements.some(
            (e) =>
              e.slideId === s.id &&
              e.kind === "shape" &&
              sameBox(e, laneBox),
          )
        )
          issues.push({
            severity: "error",
            code: "swimlane-not-rendered",
            slideId: s.id,
            message: `선언한 ${laneId} 스윔레인 행 영역이 출력되지 않았습니다.`,
          });
      }
    }
    if (b.visual === "causal-chain") {
      const chains = s.reasoning?.visualPlan?.chains || [];
      if (
        !elements.some(
          (e) =>
            e.slideId === s.id &&
            e.kind === "diagram" &&
            chains.every((c) => e.causalChainIds?.includes(c.id)),
        )
      )
        issues.push({
          severity: "error",
          code: "causal-chain-not-rendered",
          slideId: s.id,
          message: "선언한 인과·검증 사슬이 실제 출력되지 않았습니다.",
        });
    }
    if (b.visual === "annotated-screen" && b.screenLayout) {
      if (
        !elements.some(
          (e) =>
            e.slideId === s.id &&
            e.kind === "shape" &&
            sameBox(e, b.screenLayout!.frameBox),
        ) ||
        !elements.some((e) => e.slideId === s.id && e.displayObjectId) ||
        !elements.some((e) => e.slideId === s.id && e.fieldSafetyIndicator)
      )
        issues.push({
          severity: "error",
          code: "annotated-screen-not-rendered",
          slideId: s.id,
          message: "선언한 화면 프레임·객체 표시·통제 상태 표시가 출력되지 않았습니다.",
        });
    }
  }
  return issues;
}

export function directionDossier(p: ProjectData, elements: Element[] = []) {
  return {
    finalApproval: false,
    designDirection: p.designDirection ?? null,
    resolvedPalette: resolveTokens(p),
    pages: p.slides.map((s, i) => ({
      page: i + 1,
      slideId: s.id,
      question: s.reasoning?.question ?? null,
      compositionBrief: s.compositionBrief ?? null,
      explanation: s.reasoning?.visualPlan?.explanation ?? null,
      observedZones: elements
        .filter((e) => e.slideId === s.id && e.compositionPart)
        .map((e) => ({
          part: e.compositionPart,
          x: e.x,
          y: e.y,
          w: e.w,
          h: e.h,
        })),
    })),
    limitations:
      "Authored intent and observed geometry, not proof of semantic comprehension or professional approval",
  };
}

/** Available before rendering, so the initial design is reviewable before production. */
export function directionPlan(p: ProjectData) {
  const pages = (p.planning?.story || p.slides).map((s, i) => ({
    page: i + 1,
    slideId: s.id,
    title: s.title,
    compositionBrief: s.compositionBrief ?? null,
  }));
  return {
    finalApproval: false,
    designDirection: p.designDirection ?? null,
    pages,
    status:
      p.designDirection && pages.every((s) => s.compositionBrief)
        ? "authored-plan-ready-for-render-check"
        : "legacy-or-partial-design-plan",
    issues: directionAudit(p, false),
  };
}
export function directionMarkdown(p: ProjectData) {
  const plan = directionPlan(p),
    d = p.designDirection;
  return [
    `# ${p.title} — 초기 디자인 설계`,
    d
      ? `콘셉트: ${d.concept}\n\n시각 표현: ${d.visualThesis}\n\n열람 방식: ${d.deliveryMode ?? "미지정"}\n\n브랜드 고정: ${d.brandConstraints.join(" / ")}\n\n피할 표현: ${d.avoid.join(" / ")}`
      : "별도의 콘셉트 브리프 없음. 기존 구성 경로를 사용합니다.",
    ...(d?.references || []).map(
      (r) =>
        `참고 ${r.sourceId} (${r.role}): ${r.reason}\n\n채택: ${r.adopt.join(" / ")}\n\n비채택: ${r.reject.join(" / ")}`,
    ),
    ...plan.pages.map(
      (s) =>
        `## ${s.page}. ${s.title.replace(/\n/g, " ")}\n\n${s.compositionBrief ? `역할: ${s.compositionBrief.role} / 주 시각물: ${s.compositionBrief.visual}\n\n구성 근거: ${s.compositionBrief.rationale}\n\n시선 흐름: ${s.compositionBrief.readingPath}\n\n앞뒤 연결: ${s.compositionBrief.continuity}\n\n영역 (inch): ${JSON.stringify({ title: s.compositionBrief.title, message: s.compositionBrief.message, visual: s.compositionBrief.visualBox, caption: s.compositionBrief.caption })}` : "페이지별 구도 미저술. 기존 의미 시각화/사례 구성을 유지합니다."}`,
    ),
    ...plan.pages.flatMap((s) =>
      s.compositionBrief
        ? [
            `### ${s.page}장 보완 설계\n\n${s.compositionBrief.narrative ? `독자의 판단 변화: ${s.compositionBrief.narrative.beliefShift}\n\n다음 질문: ${s.compositionBrief.narrative.nextQuestion}` : ""}`,
            ...(s.compositionBrief.referenceApplications || []).map(
              (r) =>
                `참고 적용: ${r.sourceId} / ${r.locator}\n\n관찰 원리: ${r.principle}\n\n실제 적용: ${r.application}\n\n제작 설정: ${r.controls.join(", ")}\n\n복제하지 않은 것: ${r.notCopied}`,
            ),
          ]
        : [],
    ),
    "저술된 의도입니다. 실제 전달력과 읽힘은 렌더 후 별도로 검수하며 최종 승인을 뜻하지 않습니다.",
  ].join("\n\n");
}
