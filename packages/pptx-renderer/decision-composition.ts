import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";
import { scenarioResult } from "../business-case/index.js";
import { DECISION_VISUAL_KINDS } from "../business-case/delivery-schema.js";
/** Editorial decision layouts, driven by the proposed delivery contract rather than free-form page text. */
export async function renderDecisionComposition(ctx: DrawingContext) {
  const T = resolveTokens(ctx.p);
  const { p, spec, pptx, slide } = ctx,
    v = spec.reasoning?.visualPlan;
  if (!v || !DECISION_VISUAL_KINDS.includes(v.kind)) return false;
  const b = p.businessCase!,
    a = b.deliveryAssurance!;
  const { tx, shape, line, header, legend, region, messageBand } =
    professionalKit(ctx);
  const rect = (x: number, y: number, w: number, h: number, fill = T.panel) =>
    shape(pptx.ShapeType.rect, x, y, w, h, fill, fill);
  const actor = (id: string) => a.actors.find((x) => x.id === id)!.label;
  const section = b.sections.find((s) => s.id === spec.reasoning?.sectionId);
  if (v.kind !== "summary-brief")
    header(
      (
        {
          "fallback-flow": "정상·장애 운영",
          "qualification-gates": "후보 현장 조사",
          "approval-gates": "착수 전 검토",
          "decision-brief": "현재 요청과 후속 결정",
        } as Record<string, string>
      )[v.kind] ||
        section?.kicker ||
        "실증 의사결정",
      v.takeaway,
    );
  if (v.kind === "summary-brief") {
    tx("사업의 출발점", 0.64, 0.32, 5.2, 0.24, 10, T.accent, true);
    tx(spec.title, 0.64, 0.78, 5.4, 1.55, 32, T.ink, true);
    if (!messageBand(0.64, 2.45, 5.4, 0.94, 22))
      tx(v.takeaway, 0.64, 2.58, 5.4, 0.7, 17, T.muted);
    v.nodes.forEach((n, i) => {
      const y = 3.63 + i * 0.85;
      line(0.64, y + 0.04, 0.64, y + 0.62, T.accent);
      tx(n.label, 0.85, y, 5.25, 0.35, 17, T.ink, true);
      tx(n.detail, 0.85, y + 0.43, 5.25, 0.38, 13.5, T.muted);
    });
    await ctx.image(6.8, 0.78, 5.88, 5.67);
  } else if (v.kind === "qualification-gates") {
    tx(
      "모든 조건 확인 후 실증 검토",
      0.64,
      2.69,
      7.28,
      0.35,
      18,
      T.accent,
      true,
    );
    shape(pptx.ShapeType.roundRect, 8.4, 2.64, 4.28, 3.12, T.blueTint, T.line);
    tx(
      "해당 조건이면 보류·대안 검토",
      8.58,
      2.78,
      3.92,
      0.35,
      17,
      T.accent,
      true,
    );
    a.qualification.forEach((r, i) => {
      const y = 3.32 + i * 0.62;
      shape(
        pptx.ShapeType.roundRect,
        1.22,
        y - 0.06,
        6.52,
        0.53,
        T.white,
        T.line,
      );
      shape(
        pptx.ShapeType.diamond,
        0.66,
        y + 0.02,
        0.32,
        0.32,
        T.tealTint,
        T.accent,
      );
      tx(String(i + 1), 0.715, y + 0.065, 0.21, 0.22, 10, T.accent, true, {
        align: "center",
      });
      if (i < 3) line(0.82, y + 0.36, 0.82, y + 0.58, T.accent, true);
      tx(r.criterion, 1.38, y + 0.035, 2.3, 0.35, 16, T.accent, true, {
        valign: "mid",
      });
      tx(r.evidence, 3.88, y + 0.035, 3.67, 0.35, 14, T.ink, false, {
        valign: "mid",
      });
      line(7.8, y + 0.19, 8.28, y + 0.19, T.amber, true);
      tx(r.holdWhen, 8.58, y + 0.01, 3.92, 0.49, 14, T.ink, false, {
        valign: "mid",
      });
    });
    for (const [i, r] of [
      ["미확인 항목", "추가 조사"],
      ["모든 조건 충족", "제한 실증 검토"],
    ].entries()) {
      const x = 0.64 + i * 6.18;
      shape(pptx.ShapeType.roundRect, x, 5.96, 5.86, 0.47, T.tealTint, T.line);
      tx(r[0], x + 0.16, 6.035, 2.1, 0.3, 15, T.ink, true, { valign: "mid" });
      line(x + 2.44, 6.185, x + 2.89, 6.185, T.accent, true);
      tx(r[1], x + 3.1, 6.035, 2.6, 0.3, 15, T.accent, true, { valign: "mid" });
    }
  } else if (v.kind === "assured-timeline") {
    const sch = v.schedule!,
      startX = 3.22,
      width = 9.2;
    for (let i = 0; i <= sch.slots; i++) {
      const x = startX + (width * i) / sch.slots;
      line(x, 3.08, x, 6.34, T.line);
      if (i < sch.slots)
        tx(String(i + 1), x + 0.08, 2.72, 0.35, 0.25, 11, T.muted);
    }
    tx(sch.unitLabel, startX + width - 0.3, 2.72, 0.55, 0.25, 10, T.muted);
    a.stageGates.forEach((g, i) => {
      const range = sch.ranges.find((r) => r.nodeId === g.nodeId)!,
        n = v.nodes.find((n) => n.id === g.nodeId)!;
      const y = 3.22 + i * 0.77,
        x = startX + (width * range.start) / sch.slots,
        w = (width * range.length) / sch.slots;
      tx(n.label, 0.64, y, 2.3, 0.3, 17, T.ink, true);
      tx(g.deliverable, 0.64, y + 0.33, 2.45, 0.36, 11.5, T.muted);
      rect(x, y + 0.02, w, 0.16, i % 2 ? T.blue : T.accent);
      ctx.elements.at(-1)!.timelineRange = { ...range };
      shape(
        pptx.ShapeType.diamond,
        x + w - 0.06,
        y - 0.01,
        0.13,
        0.22,
        T.amber,
        T.amber,
      );
      tx(g.acceptance, startX + 0.08, y + 0.31, width - 0.2, 0.34, 14, T.ink);
    });
  } else if (v.kind === "responsibility-matrix") {
    const xs = [0.64, 3.17, 5.95, 9.56],
      ws = [2.27, 2.52, 3.33, 3.1];
    [
      "핵심 업무",
      "확인 담당(협의안)",
      "수행·협력(협의안)",
      "남겨야 할 문서",
    ].forEach((s, i) => tx(s, xs[i], 2.75, ws[i], 0.3, 14, T.accent, true));
    a.responsibilityRows.forEach((r, i) => {
      const y = 3.3 + i * 0.67;
      line(0.64, y - 0.12, 12.68, y - 0.12, T.line);
      tx(r.activity, xs[0], y, ws[0], 0.47, 16, T.ink, true);
      tx(actor(r.ownerId), xs[1], y, ws[1], 0.47, 15, T.ink, true);
      tx(
        r.contributorIds
          .map(actor)
          .reduce((lines: string[], name: string) => {
            const last = lines.at(-1);
            if (!last || `${last} · ${name}`.length > 19) lines.push(name);
            else lines[lines.length - 1] += ` · ${name}`;
            return lines;
          }, [])
          .join("\n"),
        xs[2],
        y,
        ws[2],
        0.56,
        13,
        T.muted,
      );
      tx(r.deliverable, xs[3], y, ws[3], 0.5, 14, T.ink);
    });
    rect(0.64, 6.12, 12.04, 0.31, T.tealTint);
    tx(
      "현장 안전책임자는 통행을 관리하고, 공급사는 장비·통합·지원 책임을 협의합니다.",
      0.8,
      6.17,
      11.7,
      0.21,
      11.5,
      T.accent,
      true,
    );
  } else if (v.kind === "fallback-flow") {
    tx("정상 경로", 0.64, 2.73, 1.3, 0.28, 14, T.accent, true);
    const normal = [
      "접근 감지",
      p.businessCase?.productStrategy ? "음성·LED 알림" : "담당자 경고",
      "유도원 통제",
      "조치 기록",
    ];
    normal.forEach((s, i) => {
      const x = 2.17 + i * 2.58;
      tx(s, x, 2.73, 2, 0.32, 17, T.ink, true);
      if (i < 3) line(x + 1.89, 2.91, x + 2.31, 2.91, T.accent, true);
    });
    rect(0.64, 3.31, 12.04, 0.46, T.ink);
    tx(
      "장애·부담이 생기면  →  기존 유도원 통제 유지  →  안전책임자 판단 아래 기능 보류·복구",
      0.85,
      3.42,
      11.6,
      0.25,
      13.5,
      T.white,
      true,
    );
    ["이상 징후", "감지·확인", "조치·담당", "재개 전 확인"].forEach((s, i) =>
      tx(
        s,
        [0.64, 3.78, 6.43, 9.65][i],
        4.02,
        [2.85, 2.4, 2.96, 3.02][i],
        0.27,
        12,
        T.accent,
        true,
      ),
    );
    a.fallbacks.forEach((f, i) => {
      const y = 4.5 + i * 0.61;
      rect(0.64, y - 0.08, 12.04, 0.53, i % 2 ? T.white : T.panel);
      tx(f.condition, 0.76, y, 2.79, 0.38, 14, T.ink, true);
      tx(f.detection, 3.78, y, 2.38, 0.38, 13, T.muted);
      tx(`${f.action}\n${actor(f.ownerId)}`, 6.43, y, 2.95, 0.46, 11.5, T.ink);
      tx(f.resumeEvidence, 9.65, y, 2.98, 0.38, 13, T.ink);
    });
  } else if (v.kind === "approval-gates") {
    const xs = [0.64, 3.18, 6.31, 9.58],
      ws = [2.28, 2.86, 3.0, 3.05];
    ["착수 전 관문", "확인 문서", "통과 조건", "보류 조건"].forEach((s, i) =>
      tx(s, xs[i], 2.73, ws[i], 0.3, 14, i === 3 ? T.amber : T.accent, true),
    );
    a.approvalGates.forEach((g, i) => {
      const y = 3.27 + i * 0.65;
      rect(0.64, y - 0.07, 12.04, 0.57, i % 2 ? T.white : T.panel);
      [g.label, g.document, g.passWhen, g.holdWhen].forEach((s, j) =>
        tx(
          s,
          xs[j] + (j === 0 ? 0.1 : 0),
          y + 0.04,
          ws[j] - (j === 0 ? 0.1 : 0),
          0.46,
          j === 0 ? 16 : 13.5,
          j === 3 ? T.amber : T.ink,
          j === 0,
        ),
      );
    });
    line(0.8, 6.09, 6.1, 6.09, T.accent, true);
    tx(
      "미해결 항목은 책임자 재검토·보완 후 재판단",
      6.33,
      5.98,
      6.26,
      0.35,
      15,
      T.accent,
      true,
    );
  } else if (v.kind === "decision-brief") {
    rect(0.64, 2.64, 7.72, 0.55, T.ink);
    tx("오늘 협의할 두 가지", 0.88, 2.77, 7.12, 0.29, 17, T.white, true);
    a.currentRequests.forEach((r, i) => {
      const y = 3.55 + i * 1.34;
      tx(`0${i + 1}`, 0.64, y, 0.6, 0.4, 24, T.accent, true);
      tx(r.label, 1.45, y, 6.61, 0.38, 21, T.ink, true);
      tx(r.action, 1.45, y + 0.54, 6.58, 0.36, 15, T.ink);
      tx(`산출물: ${r.artifact}`, 1.45, y + 1.0, 6.57, 0.25, 11.5, T.muted);
    });
    line(8.63, 4.48, 9.0, 4.48, T.accent, true);
    rect(9.22, 2.64, 3.46, 3.75, T.tealTint);
    tx("자료 확보 후 별도 판단", 9.46, 2.91, 2.98, 0.54, 18, T.accent, true);
    tx("제한 실증 착수", 9.46, 3.83, 2.98, 0.42, 22, T.ink, true);
    tx(a.laterDecision, 9.46, 4.63, 2.98, 1.28, 15, T.ink);
  } else if (v.kind === "time-balance") {
    if (!b.timeScenario) throw Error("time-balance requires an authored time scenario");
    const s = b.timeScenario,
      r = scenarioResult(s),
      before = (s.eventsPerDay * s.daysPerMonth * s.beforeMinutes) / 60,
      after = (s.eventsPerDay * s.daysPerMonth * s.afterMinutes) / 60;
    tx(
      "기록 업무만 비교한 예시 · 단위: 시간/월",
      0.64,
      2.72,
      6.12,
      0.32,
      14,
      T.amber,
      true,
    );
    slide.addChart(
      pptx.ChartType.bar,
      [
        {
          name: "기록 업무시간",
          labels: ["수기 기록 가정", "개선 후 기록 가정"],
          values: [before, after],
        },
      ],
      {
        x: 0.64,
        y: 3.26,
        w: 6.1,
        h: 2.71,
        barDir: "col",
        showLegend: false,
        showValue: true,
        dataLabelFormatCode: "0.0",
        valAxisMinVal: 0,
        valAxisMaxVal: Math.ceil(Math.max(before, after) / 10) * 10,
        valAxisMajorUnit: 10,
        catAxisLabelFontFace: p.design.font,
        catAxisLabelFontSize: 12,
        valAxisLabelFontSize: 11,
        chartColors: [T.accent],
        showBorder: false,
        valGridLine: { color: T.line, width: 0.5 },
      },
    );
    ctx.elements.push({
      slideId: spec.id,
      id: "time-comparison",
      kind: "chart",
      x: 0.64,
      y: 3.26,
      w: 6.1,
      h: 2.71,
      dataRef: "businessCase.timeScenario",
    });
    tx(
      `${s.eventsPerDay}건/일 × ${s.daysPerMonth}일 × (${s.beforeMinutes}−${s.afterMinutes})분 ÷ 60`,
      0.64,
      6.12,
      6.25,
      0.28,
      13,
      T.muted,
    );
    rect(7.18, 2.64, 5.5, 1.42, T.ink);
    tx("기록시간 감소분", 7.43, 2.87, 5, 0.3, 14, "C6D8E3");
    tx(
      `${r.hoursSaved}시간 − 추가 업무`,
      7.43,
      3.36,
      5,
      0.4,
      25,
      T.white,
      true,
    );
    tx("검증·오탐 대응·운영 점검", 7.4, 4.39, 5.07, 0.38, 18, T.ink, true);
    tx(
      "이 업무에 든 시간을 함께 기록해야 합니다.",
      7.4,
      4.99,
      5.07,
      0.55,
      15,
      T.muted,
    );
    tx("순절감은 아직 미측정", 7.4, 5.85, 5.07, 0.4, 22, T.accent, true);
  }
  legend(v.legend);
  if (v.kind !== "time-balance") region();
  const mark = [...ctx.elements]
    .reverse()
    .find(
      (e) =>
        e.slideId === spec.id &&
        e.kind === (v.kind === "time-balance" ? "chart" : "diagram"),
    )!;
  mark.deliveryVisualKind = v.kind;
  return true;
}
