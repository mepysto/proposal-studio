import type { DrawingContext } from "./semantic.js";
import { budgetTotals, scenarioResult } from "../business-case/index.js";
export async function renderBusiness(ctx: DrawingContext) {
  const { p, spec, slide, pptx, elements, text, rect } = ctx;
  const b = p.businessCase;
  const s = b?.sections.find((s) => s.id === spec.reasoning?.sectionId);
  if (!b || !s) throw Error(`Missing business section for ${spec.id}`);
  const c = p.design.colors;
  let serial = 0;
  const rule = (x: number, y: number, w: number, color = "D0DAD4") =>
    rect(x, y, w, 0.018, color, color, true);
  const arrow = (x: number, y: number, w = 0.32) => {
    slide.addShape(pptx.ShapeType.chevron, {
      x,
      y,
      w,
      h: 0.2,
      line: { color: c.accent },
      fill: { color: c.accent },
    });
    elements.push({
      slideId: spec.id,
      id: `business-${++serial}`,
      kind: "shape",
      x,
      y,
      w,
      h: 0.2,
    });
  };
  text(s.kicker, 0.65, 0.3, 9.2, 0.28, 11, c.accent, true);
  text(spec.title, 0.65, 0.78, 12.05, 1.0, 29, c.ink, true);
  text(spec.message, 0.65, 1.91, 12.0, 0.7, 18, c.muted);
  const caption = (value = s.caption) => {
    if (value) text(value, 0.65, 6.47, 12, 0.36, 13, c.muted);
  };
  const rows = s.rows || [];
  if (s.visual === "editorial") {
    if (spec.image) {
      await ctx.image(6.1, 2.88, 6.5, 3.68);
      s.items.slice(0, 3).forEach((v, i) => {
        const y = 3.0 + i * 1.24;
        text(v.label, 0.65, y, 5.0, 0.46, 21, c.accent, true);
        text(v.detail, 0.65, y + 0.56, 5.0, 0.65, 17, c.ink);
      });
      text(spec.image.caption, 6.1, 6.63, 6.5, 0.24, 11, c.muted);
    } else if (s.items.length <= 3) {
      const cw = 12 / Math.max(s.items.length, 1);
      s.items.forEach((v, i) => {
        const x = 0.65 + i * cw;
        rule(x, 3.05, cw - 0.45, c.accent);
        text(v.label, x, 3.45, cw - 0.55, 0.8, 24, c.ink, true);
        text(v.detail, x, 4.65, cw - 0.6, 1.2, 18, c.muted);
      });
    } else
      s.items.forEach((v, i) => {
        const y = 2.93 + i * 0.67;
        text(v.label, 0.65, y, 3.3, 0.5, 18, c.accent, true);
        text(v.detail, 4.25, y, 8.3, 0.52, 17, c.ink);
        rule(0.65, y + 0.56, 12);
      });
    if (!spec.image) caption();
  } else if (s.visual === "matrix") {
    const headers = s.headers || [];
    const widths =
      headers.length === 4 ? [2.25, 3.25, 3.25, 3.25] : [3.2, 4.4, 4.4];
    let x = 0.65;
    headers.forEach((h, i) => {
      text(h, x, 2.85, widths[i] - 0.2, 0.42, 17, c.accent, true);
      x += widths[i];
    });
    const pitch = rows.length > 4 ? 0.52 : 0.7,
      size = rows.length > 4 ? 14 : 16;
    rows.forEach((row, i) => {
      let x = 0.65;
      const y = 3.45 + i * pitch;
      rule(x, y - 0.12, 12);
      row.forEach((v, j) => {
        text(v, x, y, widths[j] - 0.22, pitch - 0.08, size, c.ink, j === 0);
        x += widths[j];
      });
    });
    caption();
  } else if (s.visual === "map") {
    // A relationship diagram; no coordinate, distance or actual gate location is inferred.
    const candidates = s.candidateIds.map((id) =>
      b.candidates.find((x) => x.id === id)!,
    );
    const positions = [
      [0.85, 3.0],
      [6.9, 3.0],
      [3.85, 4.75],
    ];
    candidates.forEach((site, i) => {
      const [x, y] = positions[i];
      rule(x, y, 5.2, c.accent);
      text(
        `${String.fromCharCode(65 + i)}  ${site.name}`,
        x,
        y + 0.18,
        5.15,
        0.55,
        21,
        c.ink,
        true,
      );
      text(site.address, x, y + 0.86, 5.1, 0.4, 16, c.muted);
      text(
        site.selection === "priority-survey"
          ? "우선 현장조사"
          : site.selection === "reserve"
            ? "예비 협의 후보"
            : "조건 확인 후 재검토",
        x,
        y + 1.4,
        5.1,
        0.3,
        14,
        "A46422",
        true,
      );
    });
    caption();
  } else if (s.visual === "site-detail") {
    const site = b.candidates.find((c) => c.id === s.candidateIds[0])!;
    text(site.name, 0.65, 2.9, 6.0, 0.7, 27, c.accent, true);
    text(site.address, 0.65, 3.72, 6.0, 0.55, 18, c.ink);
    text("공개 자료에서 확인", 0.65, 4.55, 6, 0.35, 15, c.muted, true);
    text(site.publishedFacts, 0.65, 5.02, 5.95, 1.12, 17, c.ink);
    const blocks = [
      ["설치할 구간의 가설", site.physicalHypothesis],
      ["예상 장비·운영 구성", site.proposedPackage],
      ["현장조사에서 확정", site.readiness],
    ];
    blocks.forEach(([label, detail], i) => {
      const y = 2.94 + i * 1.16;
      rule(7.1, y, 5.4);
      text(label, 7.1, y + 0.17, 5.4, 0.34, 17, c.accent, true);
      text(detail, 7.1, y + 0.61, 5.35, 0.65, 16, c.ink);
    });
    text(s.caption, 0.65, 6.65, 12, 0.23, 11, c.muted);
  } else if (s.visual === "architecture") {
    const cw = 12 / s.items.length;
    s.items.forEach((v, i) => {
      const x = 0.65 + i * cw;
      text(
        String(i + 1).padStart(2, "0"),
        x,
        3.14,
        cw - 0.35,
        0.4,
        22,
        c.accent,
        true,
      );
      rule(x, 3.75, cw - 0.4, c.accent);
      text(v.label, x, 4.05, cw - 0.48, 0.65, 21, c.ink, true);
      text(v.detail, x, 5.02, cw - 0.48, 1.03, 16, c.muted);
      if (i < s.items.length - 1) arrow(x + cw - 0.36, 4.26, 0.24);
    });
    caption();
  } else if (s.visual === "timeline") {
    const cw = 12 / s.items.length;
    rule(0.65, 3.4, 11.4, c.accent);
    s.items.forEach((v, i) => {
      const x = 0.65 + i * cw;
      text(v.label, x, 2.98, cw - 0.35, 0.38, 20, c.accent, true);
      text(v.detail, x, 3.92, cw - 0.45, 1.78, 18, c.ink);
    });
    caption();
  } else if (s.visual === "budget") {
    const totals = budgetTotals(b.budget);
    text(
      `견적 전 기획 시나리오 · 단위: 만원 · VAT ${b.budget.vatRate * 100}% 가정`,
      0.65,
      2.82,
      12,
      0.34,
      15,
      "A46422",
      true,
    );
    text(
      "기준안 항목별 구성 (만원)",
      0.65,
      3.35,
      6.4,
      0.34,
      16,
      c.accent,
      true,
    );
    slide.addChart(
      pptx.ChartType.bar,
      [
        {
          name: "기준안(만원)",
          labels: b.budget.items.map((i) => i.label),
          values: b.budget.items.map((i) => i.base / 10000),
        },
      ],
      {
        x: 0.64,
        y: 3.79,
        w: 6.5,
        h: 2.3,
        barDir: "bar",
        catAxisLabelFontFace: p.design.font,
        catAxisLabelFontSize: 12,
        valAxisLabelFontSize: 10,
        valAxisMinVal: 0,
        showLegend: false,
        showValue: true,
        dataLabelFormatCode: "#,##0",
        chartColors: [c.accent],
        showTitle: false,
      },
    );
    elements.push({
      slideId: spec.id,
      id: "budget-items-chart",
      kind: "chart",
      x: 0.64,
      y: 3.79,
      w: 6.5,
      h: 2.3,
      dataRef: "businessCase.budget",
    });
    slide.addChart(
      pptx.ChartType.bar,
      [
        {
          name: "기획 예산(만원)",
          labels: ["최소안", "기준안", "상한안"],
          values: [
            totals.low / 10000,
            totals.base / 10000,
            totals.high / 10000,
          ],
        },
      ],
      {
        x: 7.3,
        y: 3.05,
        w: 5.4,
        h: 3.0,
        barDir: "col",
        catAxisLabelFontFace: p.design.font,
        catAxisLabelFontSize: 13,
        valAxisLabelFontSize: 11,
        showLegend: false,
        showValue: true,
        dataLabelFormatCode: "#,##0",
        chartColors: [c.accent],
        showTitle: false,
        valAxisMinVal: 0,
      },
    );
    elements.push({
      slideId: spec.id,
      id: "budget-chart",
      kind: "chart",
      x: 7.3,
      y: 3.05,
      w: 5.4,
      h: 3.0,
    });
    text(
      `기준 ${(totals.base / 10000).toLocaleString()}만원 + VAT ${totals.vat / 10000}만원 = ${(totals.gross / 10000).toLocaleString()}만원`,
      0.65,
      6.17,
      12,
      0.4,
      18,
      c.accent,
      true,
    );
    text(
      `별도: ${b.budget.excluded.join(" / ")}`,
      0.65,
      6.61,
      12,
      0.35,
      10,
      c.muted,
    );
  } else if (s.visual === "benefits") {
    b.benefits.slice(0, 3).forEach((v, i) => {
      const y = 2.98 + i * 1.08;
      text(v.beneficiary, 0.65, y, 2.2, 0.48, 24, c.accent, true);
      text(v.change, 3.0, y, 4.3, 0.64, 19, c.ink, true);
      arrow(7.4, y + 0.13);
      text(v.expectedBenefit, 8.0, y, 4.6, 0.64, 18, c.ink);
    });
    caption();
  } else if (s.visual === "scenario") {
    if (!b.timeScenario) throw Error("scenario layout requires an authored time scenario");
    const input = b.timeScenario,
      result = scenarioResult(input);
    text(
      "시간 절감의 산식 예시 · 모든 입력은 가정",
      0.65,
      2.85,
      12,
      0.36,
      15,
      "A46422",
      true,
    );
    text(
      `월 ${Number(result.hoursSaved.toFixed(1))}시간`,
      0.65,
      3.65,
      5.0,
      1.0,
      42,
      c.accent,
      true,
    );
    text("실측 성과·목표·보장값이 아닙니다", 0.65, 4.87, 5.1, 0.4, 17, c.muted);
    text(
      `${input.eventsPerDay}건/일 × ${input.daysPerMonth}일/월\n× (${input.beforeMinutes}−${input.afterMinutes})분/건 ÷ 60`,
      0.65,
      5.54,
      6.4,
      0.72,
      20,
      c.ink,
    );
    slide.addChart(
      pptx.ChartType.bar,
      [
        {
          name: "월 작업시간(가정)",
          labels: ["수작업 가정", "개선 후 가정"],
          values: [
            Number(result.beforeHours.toFixed(1)),
            Number(result.afterHours.toFixed(1)),
          ],
        },
      ],
      {
        x: 7.3,
        y: 3.1,
        w: 5.2,
        h: 3.3,
        barDir: "col",
        catAxisLabelFontFace: p.design.font,
        catAxisLabelFontSize: 14,
        valAxisLabelFontSize: 12,
        showLegend: false,
        showValue: true,
        dataLabelFormatCode: "0.0",
        showValAxisTitle: true,
        valAxisTitle: "시간/월 (가정)",
        valAxisTitleFontSize: 12,
        valAxisTitleFontFace: p.design.font,
        chartColors: [c.accent],
        showTitle: false,
        valAxisMinVal: 0,
      },
    );
    elements.push({
      slideId: spec.id,
      id: "scenario-chart",
      kind: "chart",
      x: 7.3,
      y: 3.1,
      w: 5.2,
      h: 3.3,
    });
    caption();
  } else if (s.visual === "kpis") {
    const metrics = b.metrics.filter((m) => !m.guardrail).slice(0, 3);
    const headers = ["주요 지표", "정의·산식", "기준선·목표"];
    headers.forEach((h, i) =>
      text(
        h,
        [0.65, 4.1, 9.15][i],
        2.85,
        [3.2, 4.8, 3.5][i],
        0.38,
        17,
        c.accent,
        true,
      ),
    );
    metrics.forEach((m, i) => {
      const y = 3.43 + i * 0.81;
      rule(0.65, y - 0.1, 12);
      text(m.name, 0.65, y, 3.2, 0.65, 18, c.ink, true);
      text(m.formula, 4.1, y, 4.8, 0.65, 15, c.ink);
      text(
        `${m.baseline === null ? "기준선 미측정" : m.baseline + " " + m.unit}\n${m.target === null ? "시험 후 수용기준 합의" : m.target + " " + m.unit}`,
        9.15,
        y,
        3.5,
        0.65,
        15,
        c.muted,
      );
    });
    text(
      `함께 볼 지표: ${b.metrics
        .filter((m) => m.guardrail)
        .map((m) => m.name)
        .join(" · ")}`,
      0.65,
      6.17,
      12,
      0.4,
      16,
      "A46422",
      true,
    );
  } else if (s.visual === "decision") {
    s.items.slice(0, 3).forEach((v, i) => {
      const y = 3.05 + i * 0.95;
      text(`0${i + 1}`, 0.65, y, 0.75, 0.45, 25, c.accent, true);
      text(v.label, 1.65, y, 4.0, 0.52, 23, c.ink, true);
      text(v.detail, 6.0, y, 6.6, 0.64, 18, c.muted);
    });
    caption();
  }
  return true;
}
