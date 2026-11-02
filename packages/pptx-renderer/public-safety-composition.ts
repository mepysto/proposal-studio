import sharp from "sharp";
import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";
export async function renderPublicSafety(ctx: DrawingContext) {
  const T = resolveTokens(ctx.p);
  const { p, spec, slide, pptx, elements } = ctx,
    v = spec.reasoning?.visualPlan;
  if (!v || !["cctv-extension", "public-safety-spaces"].includes(v.kind))
    return false;
  const b = p.businessCase!.publicSafety!,
    { header, tx, shape, line, legend, region } = professionalKit(ctx);
  const panel = (x: number, y: number, w: number, h: number, fill = T.white) =>
    shape(pptx.ShapeType.roundRect, x, y, w, h, fill, T.line);
  header(
    v.kind === "cctv-extension"
      ? "기존 자산 연계와 차별화"
      : "공공안전 공간 적용 제안",
    v.takeaway,
  );
  if (v.kind === "cctv-extension") {
    const xs = [0.64, 2.1, 5.45, 8.8],
      ws = [1.28, 3.15, 3.15, 3.88];
    [
      "비교 기준",
      "영상 확인·녹화 중심 구성",
      "지능형 CCTV 구성",
      "에스엘티 통합 제안",
    ].forEach((t, i) => {
      panel(xs[i], 2.64, ws[i], 0.68, i === 3 ? T.accent : T.panel);
      tx(
        t,
        xs[i] + 0.12,
        2.69,
        ws[i] - 0.24,
        0.6,
        17,
        i === 3 ? T.white : T.ink,
        true,
        { valign: "mid" },
      );
    });
    b.comparison.forEach((r, i) => {
      const y = 3.52 + i * 0.95;
      panel(0.64, y, 12.04, 0.84);
      tx(
        r.criterion.replace(" ", "\n"),
        0.77,
        y + 0.1,
        1.04,
        0.64,
        17,
        T.accent,
        true,
        { valign: "mid" },
      );
      elements.at(-1)!.comparisonCriterion = r.criterion;
      [r.recording, r.intelligent, r.proposal].forEach((t, j) => {
        if (j === 2) panel(xs[j + 1], y, ws[j + 1], 0.84, T.tealTint);
        tx(
          t,
          xs[j + 1] + 0.12,
          y + 0.12,
          ws[j + 1] - 0.24,
          0.63,
          16,
          T.ink,
          j === 2,
          { valign: "mid" },
        );
      });
    });
  } else {
    tx(
      "기존 장비를 활용하고, 장소별 위험 조건을 새로 설정",
      0.64,
      2.69,
      7.34,
      0.38,
      19,
      T.accent,
      true,
    );
    const m = await sharp(v.scene!.path).metadata(),
      scale = Math.min(7.34 / m.width!, 2.47 / m.height!),
      w = m.width! * scale,
      h = m.height! * scale,
      x = 0.64 + (7.34 - w) / 2,
      y = 3.21 + (2.47 - h) / 2;
    slide.addImage({ path: v.scene!.path, x, y, w, h });
    elements.push({
      slideId: spec.id,
      id: "public-safety-triptych",
      kind: "image",
      x,
      y,
      w,
      h,
      image: {
        path: v.scene!.path,
        width: m.width!,
        height: m.height!,
        dpi: m.width! / w,
      },
    });
    shape(pptx.ShapeType.rect, x, y, w, h, T.white, T.line, {
      fill: { color: T.white, transparency: 100 },
    });
    ["공영주차장", "공원·체육시설", "시장·행사 구간"].forEach((t, i) =>
      tx(t, 0.64 + i * 2.49, 5.76, 2.36, 0.31, 16, T.accent, true, {
        align: "center",
      }),
    );
    const stages = ["위험 조건 확인", "LED·음성 안내", "담당자 조치"];
    stages.forEach((t, i) => {
      const xx = 0.64 + i * 2.49;
      panel(xx, 6.15, 2.24, 0.3, T.tealTint);
      tx(t, xx + 0.06, 6.19, 2.12, 0.22, 12, T.ink, true, { align: "center" });
      if (i < 2) line(xx + 2.24, 6.3, xx + 2.49, 6.3, T.accent, true);
    });
    b.applications.forEach((a, i) => {
      const yy = 2.64 + i * 1.28;
      panel(8.4, yy, 4.28, 1.24, i === 1 ? T.blueTint : T.white);
      tx(a.label, 8.58, yy + 0.1, 3.92, 0.34, 19, T.accent, true);
      tx(a.risk, 8.58, yy + 0.48, 3.92, 0.3, 16, T.ink);
      tx(a.response, 8.58, yy + 0.88, 3.92, 0.3, 16, T.muted);
    });
  }
  legend(v.legend);
  region();
  return true;
}
