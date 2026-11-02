import { renderSafehomeImageComposition } from "./safehome-image-composition.js";
import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";

/** Supplied SafeHome strategy, case-scoped compositions. Copy lives in visualPlan. */
export async function renderSafehomeComposition(ctx: DrawingContext) {
  const T = resolveTokens(ctx.p);
  if (await renderSafehomeImageComposition(ctx)) return true;
  const { p, spec, slide, pptx, elements } = ctx;
  const v = spec.reasoning?.visualPlan;
  if (!v?.encoding.startsWith("safehome:")) return false;
  const k = professionalKit(ctx),
    { tx, panel, line, shape, iconLabel, header, region } = k;
  const mode = v.encoding.split(":")[1],
    N = v.nodes;
  const note = (s: string, y = 6.52) => tx(s, 0.66, y, 12, 0.34, 12, T.muted);
  const mark = (criterion: string) => {
    elements.at(-1)!.comparisonCriterion = criterion;
  };
  const box = async (
    i: number,
    x: number,
    y: number,
    w: number,
    h: number,
    fill = T.white,
  ) => {
    panel(x, y, w, h, fill, T.line);
    await iconLabel(
      N[i].icon,
      N[i].label,
      x + 0.18,
      y + 0.16,
      w - 0.36,
      0.5,
      20,
    );
    tx(
      N[i].detail.replaceAll("|", "\n"),
      x + 0.2,
      y + 0.93,
      w - 0.4,
      h - 1.04,
      18,
      T.muted,
    );
    return { x, y, w, h };
  };
  const join = (
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number },
  ) => line(a.x + a.w, a.y + a.h / 2, b.x, b.y + b.h / 2, T.accent, true);
  const table = (
    heads: string[],
    rows: string[][],
    widths: number[],
    rh: number,
    y = 2.72,
  ) => {
    let xx = 0.65;
    const xs = widths.map((w) => {
      const x = xx;
      xx += w;
      return x;
    });
    shape(pptx.ShapeType.roundRect, 0.65, y, 12.02, 0.49, T.ink, T.ink);
    heads.forEach((h, i) => {
      tx(h, xs[i] + 0.15, y + 0.07, widths[i] - 0.3, 0.32, 16, T.white, true);
      mark(h);
    });
    rows.forEach((r, j) => {
      const yy = y + 0.62 + j * rh;
      if (j % 2 === 0)
        shape(
          pptx.ShapeType.rect,
          0.65,
          yy - 0.02,
          12.02,
          rh - 0.08,
          T.panel,
          T.panel,
        );
      r.forEach((s, i) => {
        tx(
          s,
          xs[i] + 0.15,
          yy + 0.08,
          widths[i] - 0.3,
          rh - 0.2,
          18,
          i === 0 ? T.ink : T.muted,
          i === 0,
        );
        mark(heads[i]);
      });
    });
  };
  if (mode === "cover") {
    slide.background = { color: T.ink };
    tx("강민코퍼레이션", 0.7, 0.65, 8, 0.48, 24, "89CECB", true);
    tx("강민 안심지기 AI", 0.7, 1.45, 11.8, 0.95, 44, T.white, true);
    tx(
      "농촌형 AI 생활안전 통합관제 시스템",
      0.72,
      2.61,
      11.8,
      0.6,
      26,
      T.white,
    );
    tx("제품 설명 · 가칭 / 개발 전 구상", 0.72, 3.37, 11.8, 0.4, 18, "B9CFD1");
    for (let i = 0; i < 3; i++) {
      const x = 0.72 + i * 4.17;
      panel(x, 4.08, 3.51, 2.37, "24485E", "426578");
      tx(N[i].label, x + 0.18, 4.5, 3.15, 0.48, 22, T.white, true);
      tx(N[i].detail, x + 0.18, 5.3, 3.15, 0.95, 18, "B9CFD1");
      if (i < 2) line(x + 3.51, 5.17, x + 4.17, 5.17, "89CECB", true);
    }
    region(0.7, 4.08, 11.92, 2.37);
    return true;
  }
  tx("SAFEHOME AI · 제품 구상", 0.64, 0.32, 9, 0.24, 10, T.accent, true);
  tx(spec.title, 0.64, 0.78, 12.05, 0.7, 32, T.ink, true);
  panel(0.64, 1.76, 12.04, 0.79, T.tealTint, T.tealTint);
  tx(spec.message, 0.84, 1.82, 11.64, 0.69, 21, T.ink, true);
  if (mode === "problem") {
    for (let i = 0; i < 3; i++) {
      const y = 2.79 + i * 1.13;
      await iconLabel(N[i].icon, N[i].label, 0.7, y, 3.48, 0.49, 20);
      const parts = N[i].detail.split("|");
      tx(parts[0], 4.15, y, 4.1, 0.85, 18, T.muted);
      line(8.38, y + 0.29, 8.8, y + 0.29, T.accent, true);
      tx(parts[1], 9.02, y, 3.45, 0.95, 18, T.ink, true);
      if (i < 2) line(0.7, y + 1.01, 12.6, y + 1.01, T.line);
    }
  } else if (mode === "zones") {
    table(
      ["생활 공간", "권고 센서", "확인할 신호"],
      N.map((n) => [n.label, ...n.detail.split("|")]),
      [2.2, 4.6, 5.22],
      0.58,
    );
  } else if (mode === "system") {
    const boxes: { x: number; y: number; w: number; h: number }[] = [];
    for (let i = 0; i < 4; i++)
      boxes.push(
        await box(
          i,
          0.66 + i * 3.14,
          3.23,
          2.57,
          2.55,
          i === 1 ? T.tealTint : T.white,
        ),
      );
    boxes.slice(1).forEach((b, i) => join(boxes[i], b));
    N.slice(0, 3).forEach((_, i) =>
      tx(
        v.edges[i].label,
        0.66 + i * 3.14 + 2.5,
        2.76,
        0.73,
        0.4,
        11,
        T.accent,
        false,
        { align: "center" },
      ),
    );
    note(v.legend);
  } else if (mode === "wifi") {
    table(
      ["기능", "1세대 판단", "적용 조건"],
      N.map((n) => [n.label, ...n.detail.split("|")]),
      [3.1, 3.2, 5.72],
      0.73,
    );
  } else if (mode === "response") {
    const boxes: { x: number; y: number; w: number; h: number }[] = [];
    for (let i = 0; i < 4; i++)
      boxes.push(
        await box(
          i,
          0.66 + i * 3.14,
          2.82,
          2.57,
          1.91,
          i === 2 ? "F9E8E2" : T.white,
        ),
      );
    boxes.slice(1).forEach((b, i) => join(boxes[i], b));
    // Both exits leave the final bounds of the cross-check node; separate gutters.
    const a = boxes[1];
    panel(3.8, 5.38, 4.03, 1.08, T.tealTint, T.line);
    tx(N[4].label, 3.99, 5.47, 3.65, 0.4, 18, T.accent, true);
    tx(N[4].detail.replaceAll("|", " · "), 3.99, 5.89, 3.65, 0.52, 13, T.muted);
    line(a.x + a.w * 0.34, a.y + a.h, a.x + a.w * 0.34, 5.38, T.accent, true);
    panel(8.52, 5.38, 4.03, 1.08, "F6ECD9", T.line);
    tx(N[5].label, 8.71, 5.47, 3.65, 0.4, 18, "875216", true);
    tx(N[5].detail.replaceAll("|", " · "), 8.71, 5.89, 3.65, 0.52, 13, T.muted);
    k.route(
      [
        [a.x + a.w * 0.76, a.y + a.h],
        [a.x + a.w * 0.76, 5.02],
        [10.53, 5.02],
        [10.53, 5.38],
      ],
      "A96E2D",
    );
    note(
      "경보 발송 ≠ 조치 완료 · 신호 불확실은 정상 아님 · 화재·가스 전용센서는 즉시 로컬 경보",
    );
  } else if (mode === "events") {
    table(
      ["상황", "관찰·판단", "사람의 행동"],
      N.map((n) => [n.label, ...n.detail.split("|")]),
      [3.0, 4.6, 4.42],
      0.73,
    );
  } else if (mode === "privacy") {
    const boxes: { x: number; y: number; w: number; h: number }[] = [];
    for (let i = 0; i < 3; i++)
      boxes.push(
        await box(
          i,
          0.66 + i * 4.17,
          3.05,
          3.53,
          2.64,
          i === 0 ? T.tealTint : T.white,
        ),
      );
    boxes.slice(1).forEach((b, i) => join(boxes[i], b));
    note(
      "1세대 얼굴인식 제외 권고 · 선택 영상은 구역·목적·보관·열람 동의에 따라 제한",
      6.15,
    );
  } else if (mode === "outage") {
    table(
      ["장애", "유지·대체 대응", "검증·복구 조건"],
      N.map((n) => {
        const d = n.detail.split("|");
        return [n.label, d[0] + "\n" + d[1], d[2]];
      }),
      [2.5, 5.0, 4.52],
      0.97,
    );
  } else if (mode === "queue") {
    panel(0.67, 2.76, 11.98, 3.62, T.white, T.line);
    shape(pptx.ShapeType.roundRect, 0.67, 2.76, 11.98, 0.5, T.ink, T.ink);
    elements.at(-1)!.displayObjectId = "agency-risk-queue";
    tx(
      "가구별 확인 목록 · 화면 구성 예시",
      0.86,
      2.84,
      10.4,
      0.32,
      16,
      T.white,
      true,
    );
    const xs = [0.88, 3.5, 7.65, 10.05],
      ws = [2.45, 3.98, 2.23, 2.26];
    ["가구·분류", "판단 사유", "최근 정보", "담당·진행"].forEach((s, i) =>
      tx(s, xs[i], 3.49, ws[i], 0.35, 16, T.accent, true),
    );
    N.forEach((n, i) => {
      const d = n.detail.split("|"),
        y = 4.04 + i * 0.71;
      line(0.88, y - 0.08, 12.42, y - 0.08, T.line);
      tx(n.label, xs[0], y, ws[0], 0.47, 18, i === 0 ? T.red : T.ink, true);
      elements.at(-1)!.fieldSafetyIndicator = true;
      tx(d[0], xs[1], y, ws[1], 0.45, 17, T.ink);
      tx(d[1], xs[2], y, ws[2], 0.5, 15, T.muted);
      tx(d[2].replace(" · ", "\n"), xs[3], y, ws[3], 0.61, 15, T.muted);
    });
    note("전송 성공·알림 수신과 실제 통화·방문·조치 결과를 구분해 기록");
  } else if (mode === "packages") {
    table(
      ["상품 구상", "추가 구성", "대상·범위", "목표 가격·미확정"],
      N.map((n) => [
        n.label,
        ...n.detail.split("|").map((s) => s.replace(" / 월", "\n월")),
      ]),
      [2.35, 3.6, 2.45, 3.62],
      0.96,
    );
    note(
      "목표 가격이며 견적 아님 · 기관형 50+는 장비·대시보드·원격관리·SLA 범위별 별도 견적",
      6.41,
    );
  } else if (mode === "validation") {
    const boxes: { x: number; y: number; w: number; h: number }[] = [];
    for (let i = 0; i < 3; i++)
      boxes.push(
        await box(
          i,
          0.66 + i * 4.17,
          2.88,
          3.53,
          2.98,
          i === 2 ? T.tealTint : T.white,
        ),
      );
    boxes.slice(1).forEach((b, i) => join(boxes[i], b));
    panel(0.67, 6.05, 11.98, 0.56, T.tealTint, T.tealTint);
    tx(
      "다음 협의   대상 가구 · 감지 구역 · 대응 담당 · 운영·유지관리 범위",
      0.88,
      6.14,
      11.55,
      0.36,
      19,
      T.ink,
      true,
    );
  }
  if (
    ["problem", "zones", "wifi", "events", "outage", "privacy"].includes(mode)
  )
    note(v.legend);
  if (mode === "validation")
    tx(
      "개발·실증 계획 · 실적 아님 · 성능·인증·긴급기관 연계 미확정",
      0.66,
      6.68,
      12,
      0.24,
      11,
      T.muted,
    );
  region(0.65, 2.72, 12.02, 3.9);
  return true;
}
