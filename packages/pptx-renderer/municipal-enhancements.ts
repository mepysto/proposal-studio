import sharp from "sharp";
import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";
import { geographicViewport } from "../visual-assets/geography.js";

/** Scene/scope, observation and locality are distinct visual tasks. Header is shared. */
export async function renderMunicipalEnhancement(
  ctx: DrawingContext,
  kit: ReturnType<typeof professionalKit>,
) {
  const T = resolveTokens(ctx.p);
  const { p, spec, slide, pptx, elements } = ctx,
    v = spec.reasoning?.visualPlan;
  if (
    !v ||
    !["pilot-package", "evaluation-plan", "expansion-path"].includes(v.kind)
  )
    return false;
  if (
    (["pilot-package", "evaluation-plan"].includes(v.kind) && !v.scene) ||
    (v.kind === "expansion-path" && !v.map)
  )
    return false;
  const b = p.businessCase!.municipalCase!,
    { tx, shape, line, iconLabel, legend, region } = kit;
  const panel = (x: number, y: number, w: number, h: number, fill = T.white) =>
    shape(pptx.ShapeType.roundRect, x, y, w, h, fill, T.line);
  const scene = async (
    path: string,
    x: number,
    y: number,
    w: number,
    h: number,
    id: string,
  ) => {
    const m = await sharp(path).metadata(),
      ratio = Math.min(w / m.width!, h / m.height!),
      iw = m.width! * ratio,
      ih = m.height! * ratio;
    const xx = x + (w - iw) / 2,
      yy = y + (h - ih) / 2;
    slide.addImage({ path, x: xx, y: yy, w: iw, h: ih });
    elements.push({
      slideId: spec.id,
      id,
      kind: "image",
      x: xx,
      y: yy,
      w: iw,
      h: ih,
      image: { path, width: m.width!, height: m.height!, dpi: m.width! / iw },
    });
    shape(pptx.ShapeType.rect, xx, yy, iw, ih, T.white, T.line, {
      fill: { color: T.white, transparency: 100 },
    });
  };
  if (v.kind === "pilot-package") {
    panel(0.64, 2.64, 5.72, 3.8);
    await scene(v.scene!.path, 0.82, 2.84, 5.36, 2.68, "package-scene");
    tx(
      `대표 출입구 ${b.pilot.gates}개소`,
      0.86,
      5.76,
      5.28,
      0.34,
      21,
      T.accent,
      true,
    );
    tx(
      `전체 ${b.pilot.totalMonths}개월 / 현장 약${b.pilot.fieldMonths}개월`,
      0.86,
      6.15,
      5.28,
      0.26,
      16,
      T.ink,
    );
    for (const [i, r] of b.pilot.scope.entries()) {
      const y = 2.64 + i * 1.06;
      panel(6.72, y, 5.96, 1.04, i === 0 ? T.tealTint : T.white);
      await iconLabel(
        ["cpu", "network", "refresh-cw"][i],
        i === 2 ? "회수·재투입" : r.label,
        6.92,
        y + 0.1,
        5.56,
        0.34,
        18,
        T.accent,
      );
      tx(r.detail, 6.92, y + 0.48, 5.56, 0.56, 16, T.ink);
    }
    panel(6.72, 5.94, 5.96, 0.5, T.tealTint);
    tx(
      "확장안 사업비: 현장조사 후 견적",
      6.92,
      6.04,
      5.56,
      0.32,
      20,
      T.accent,
      true,
    );
  } else if (v.kind === "evaluation-plan") {
    panel(0.64, 2.64, 5.1, 3.8);
    tx("동일 장면으로 끝까지 확인", 0.86, 2.84, 4.66, 0.4, 21, T.accent, true);
    await scene(v.scene!.path, 0.86, 3.49, 4.66, 1.59, "evaluation-scene");
    for (const [i, label] of [
      "입력 영상",
      "알림·표출",
      "현장 확인",
    ].entries()) {
      const x = 0.86 + i * 1.61;
      panel(x, 5.35, 1.44, 0.52, T.tealTint);
      tx(label, x + 0.07, 5.46, 1.3, 0.29, 16, T.accent, true, {
        align: "center",
      });
      if (i < 2) line(x + 1.47, 5.61, x + 1.57, 5.61, T.accent, true);
    }
    tx("영상·시간·조치 이력을 함께 대조", 0.86, 6.04, 4.66, 0.28, 15, T.muted);
    for (const [i, r] of b.evaluation.entries()) {
      const y = 2.64 + i * 1.28;
      panel(6.1, y, 6.58, 1.16, i === 1 ? T.blueTint : T.white);
      tx(r.question, 6.3, y + 0.12, 6.18, 0.33, 19, T.accent, true);
      tx(r.observation, 6.3, y + 0.54, 6.18, 0.59, 16, T.ink);
    }
  } else {
    const m = p.geographicAssets.find((m) => m.id === v.map!.assetId)!,
      x = 0.64,
      y = 2.64,
      w = 6.5,
      h = (w * m.height) / m.width;
    slide.addImage({ path: m.path, x, y, w, h });
    elements.push({
      slideId: spec.id,
      id: "expansion-map",
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
    const view = geographicViewport(m.bounds, w, h);
    for (const pin of v.map!.markers) {
      const [dx, dy] = view.point(pin.lon, pin.lat);
      shape(
        pptx.ShapeType.ellipse,
        x + dx - 0.15,
        y + dy - 0.15,
        0.3,
        0.3,
        T.accent,
        T.white,
      );
      tx(pin.id, x + dx - 0.12, y + dy - 0.105, 0.24, 0.21, 11, T.white, true, {
        align: "center",
      });
    }
    panel(0.64, 5.95, 6.5, 0.49, T.tealTint);
    tx(
      "A 와촌동권 → B 원성권 · 참고 위치, 이동 경로 아님",
      0.8,
      6.065,
      6.18,
      0.26,
      14,
      T.accent,
      true,
    );
    for (const [i, r] of b.expansion.entries()) {
      const yy = 2.64 + i * 1.28;
      panel(7.55, yy, 5.13, 1.16, i === 0 ? T.tealTint : T.white);
      tx(
        `${i + 1}  ${r.label}`,
        7.75,
        yy + 0.12,
        4.73,
        0.37,
        20,
        T.accent,
        true,
      );
      tx(r.decision, 7.75, yy + 0.66, 4.73, 0.4, 15, T.ink);
      if (i < 2) line(7.33, yy + 0.52, 7.33, yy + 1.73, T.accent, true);
    }
  }
  legend(v.legend);
  region();
  elements.at(-1)!.municipalVisualKind = v.kind;
  return true;
}
