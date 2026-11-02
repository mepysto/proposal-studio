import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";
import { geographicViewport } from "../visual-assets/geography.js";
export async function renderEvidenceComposition(ctx: DrawingContext) {
  const T = resolveTokens(ctx.p);
  const { p, spec, pptx, slide, elements } = ctx,
    v = spec.reasoning?.visualPlan;
  if (!v || !["geographic-map", "data-chart", "causal-flow"].includes(v.kind))
    return false;
  const k = professionalKit(ctx),
    { tx, shape, line, header, legend } = k,
    section = p.businessCase?.sections.find(
      (s) => s.id === spec.reasoning?.sectionId,
    );
  header(
    v.kind === "data-chart"
      ? "천안시 보행안전 지표"
      : section?.kicker || "원인과 개입의 연결",
    v.takeaway,
  );
  if (v.kind === "geographic-map") {
    const m = p.geographicAssets.find((a) => a.id === v.map!.assetId)!;
    const x = 0.64,
      y = 2.64,
      w = 8,
      h = 3.8;
    slide.addImage({ path: m.path, x, y, w, h });
    elements.push({
      slideId: spec.id,
      id: "geographic-base",
      kind: "image",
      x,
      y,
      w,
      h,
      geographicAssetId: m.id,
      image: {
        path: m.path,
        width: m.width,
        height: m.height,
        dpi: m.width / w,
      },
    });
    const viewport = geographicViewport(m.bounds, w, h);
    for (const pin of v.map!.markers) {
      const [px, py] = viewport.point(pin.lon, pin.lat);
      shape(
        pptx.ShapeType.ellipse,
        x + px - 0.16,
        y + py - 0.16,
        0.32,
        0.32,
        T.accent,
        T.white,
        { line: { color: T.white, width: 1.4 } },
      );
      tx(pin.id, x + px - 0.13, y + py - 0.09, 0.26, 0.22, 11, T.white, true, {
        align: "center",
      });
    }
    const overview = v.map!.markers.length > 1;
    const info = overview
      ? v.map!.markers.map((pin, i) => ({
          label: `${pin.id}  ${p.businessCase!.candidates[i].name}`,
          detail:
            spec.id === "sites"
              ? v.nodes[i].detail
              : `${p.businessCase!.candidates[i].address}\n${pin.precision === "locality-reference" ? "동 대표 위치" : "주변 시설 위치"} 참고 · 출입구 아님`,
        }))
      : v.nodes.map((n) => ({ label: n.label, detail: n.detail }));
    info.forEach((n, i) => {
      const yy = 2.81 + i * 1.2;
      tx(n.label, 9.05, yy, 3.58, 0.44, 18, T.ink, true);
      tx(n.detail, 9.05, yy + 0.52, 3.58, 0.67, 14, T.muted);
    });
    if (!overview)
      tx(
        `${v.map!.markers[0].id} ${v.map!.markers[0].label}`,
        0.83,
        2.8,
        4.4,
        0.3,
        13,
        T.ink,
        true,
        { fill: { color: T.white, transparency: 8 }, margin: 0.04 },
      );
  } else if (v.kind === "data-chart") {
    const d = p.quantitativeDatasets.find((d) => d.id === v.chart!.datasetId)!,
      cats = [...new Set(d.rows.map((r) => r.category))],
      series = [...new Set(d.rows.map((r) => r.series))];
    const categoryValues = cats.map((c) =>
      d.rows
        .filter((r) => r.category === c)
        .reduce((sum, r) => sum + r.value, 0),
    );
    const plotted = v.chart!.stacked
      ? categoryValues
      : d.rows.map((r) => r.value);
    const magnitude = Math.max(1, ...plotted.map(Math.abs));
    const step = 10 ** Math.floor(Math.log10(magnitude));
    const axisMin = Math.min(0, Math.floor(Math.min(...plotted) / step) * step);
    const axisMax = Math.max(
      step,
      Math.ceil(Math.max(...plotted) / step) * step,
    );
    tx(
      `${d.period} · 단위: ${d.unit} · ${d.id === "cheonan-traffic-fatalities" ? "천안시 전체" : d.population}`,
      0.66,
      2.7,
      12,
      0.31,
      14,
      T.muted,
    );
    slide.addChart(
      pptx.ChartType.bar,
      series.map((name) => ({
        name,
        labels: cats,
        values: cats.map(
          (c) =>
            d.rows.find((r) => r.category === c && r.series === name)!.value,
        ),
      })),
      {
        x: 0.64,
        y: 3.18,
        w: 8.0,
        h: 3.13,
        barDir: v.chart!.orientation === "horizontal" ? "bar" : "col",
        grouping: v.chart!.stacked ? "stacked" : "clustered",
        catAxisLabelFontFace: p.design.font,
        catAxisLabelFontSize: 15,
        valAxisLabelFontSize: 12,
        valAxisMinVal: axisMin,
        valAxisMaxVal: axisMax,
        valAxisMajorUnit: step,
        chartColors: [T.blue, T.accent],
        showLegend: true,
        legendPos: "b",
        legendFontFace: p.design.font,
        legendFontSize: 13,
        showValue: true,
        dataLabelFormatCode: "0.##",
        showTitle: false,
        showBorder: false,
        valGridLine: { color: "DCE4EA", width: 0.5 },
      },
    );
    elements.push({
      slideId: spec.id,
      id: "evidence-chart",
      kind: "chart",
      x: 0.64,
      y: 3.18,
      w: 8,
      h: 3.13,
      dataRef: d.id,
    });
    if (d.id === "cheonan-traffic-fatalities") {
      tx("2025년 보도 수치", 9.1, 3.14, 3.53, 0.33, 15, T.muted);
      const total = d.rows.find(
          (r) => r.category === "2025년" && r.series === "전체 사망자",
        )!.value,
        ped = d.rows.find(
          (r) => r.category === "2025년" && r.series === "보행자 사망자",
        )!.value;
      tx(`${ped} / ${total}명`, 9.1, 3.79, 3.53, 0.7, 31, T.accent, true);
      tx("전체 사망자 중 보행자", 9.1, 4.62, 3.53, 0.4, 17, T.ink, true);
      tx(
        "출입구 수요는 현장에서 추가 조사\n교차·가려짐·기존 통제를 확인\nSmartFence 실증 성과가 아님",
        9.1,
        5.32,
        3.53,
        0.94,
        15,
        T.muted,
      );
    } else {
      tx(d.title, 9.1, 3.14, 3.53, 0.7, 20, T.ink, true);
      tx(
        d.status === "reported-observation"
          ? "출처에 보고된 관측값"
          : "기획·산식 가정",
        9.1,
        4.1,
        3.53,
        0.6,
        17,
        T.accent,
        true,
      );
      tx(d.limitation, 9.1, 5.0, 3.53, 1.3, 13, T.muted);
    }
  } else {
    const xs = [0.64, 3.72, 6.8, 9.88],
      headers = ["원인", "솔루션·기본 조치", "현장 대응", "기대 결과와 측정"];
    headers.forEach((h, i) =>
      tx(h, xs[i], 2.73, 2.8, 0.36, 15, T.accent, true),
    );
    v.chains!.forEach((c, i) => {
      const y = 3.28 + i * 1.03;
      shape(
        pptx.ShapeType.rect,
        0.64,
        y - 0.09,
        12.04,
        0.92,
        i % 2 ? T.white : T.panel,
        i % 2 ? T.white : T.panel,
      );
      [c.cause, c.intervention, c.response, c.result].forEach((s, j) => {
        tx(
          s,
          xs[j] + 0.08,
          y + 0.03,
          2.53,
          0.55,
          j === 3 ? 16 : 17,
          T.ink,
          j === 1 || j === 3,
          {valign:"mid"},
        );
        if (j < 3)
          line(
            xs[j] + 2.72,
            y + 0.3,
            xs[j + 1] - 0.12,
            y + 0.3,
            T.accent,
            true,
          );
      });
      const shortLabels: Record<string, string> = {
        exposure: "교차 노출 빈도",
        miss: "필수 사례 미탐률",
        latency: "전달 지연 p95",
        completion: "조치 완결률",
        burden: "업무·시민 불편",
      };
      const labels = c.metricIds.map(
        (id) =>
          shortLabels[id] ||
          p.businessCase!.metrics.find((m) => m.id === id)!.name,
      );
      tx(`확인: ${labels.join("·")}`, 9.96, y + 0.6, 2.6, 0.32, 10.5, T.muted);
    });
  }
  legend(v.legend);
  elements.push({
    slideId: spec.id,
    id: `evidence-composition-${v.kind}`,
    kind: "diagram",
    visualRole: "explanation",
    x: 0.64,
    y: 2.64,
    w: 12.04,
    h: 3.8,
    ...(v.chains ? { causalChainIds: v.chains.map((c) => c.id) } : {}),
  });
  return true;
}
