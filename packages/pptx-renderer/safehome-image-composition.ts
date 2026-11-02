import sharp from "sharp";
import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";

/** Image-first case layouts; image origin, copy, labels and limits live in visualPlan. */
export async function renderSafehomeImageComposition(ctx: DrawingContext) {
  const T = resolveTokens(ctx.p);
  const { p, spec, slide, pptx, elements } = ctx,
    v = spec.reasoning?.visualPlan;
  if (!v?.encoding.startsWith("safehome-image:")) return false;
  if (!v.scene) throw Error("Image-first page has no scene: " + spec.id);
  const k = professionalKit(ctx),
    { tx, panel, line, shape, region, messageBand } = k;
  const mode = spec.id,
    N = v.nodes;
  const photo = async (x: number, y: number, w: number, h: number) => {
    const file = v.scene!.path,
      m = await sharp(file).metadata();
    const r = Math.min(w / m.width!, h / m.height!);
    const b = {
      x: x + (w - m.width! * r) / 2,
      y: y + (h - m.height! * r) / 2,
      w: m.width! * r,
      h: m.height! * r,
    };
    slide.addImage({ path: file, ...b });
    elements.push({
      slideId: spec.id,
      id: "scene-" + mode,
      kind: "image",
      ...b,
      image: {
        path: file,
        width: m.width!,
        height: m.height!,
        dpi: m.width! / b.w,
      },
    });
    shape(pptx.ShapeType.rect, b.x, b.y, b.w, b.h, T.white, T.line, {
      fill: { color: T.white, transparency: 100 },
      line: { color: T.line, width: 0.7 },
    });
    return b;
  };
  const qualifier = (s = v.legend) => tx(s, 0.66, 6.68, 12, 0.27, 11, T.muted);
  const criterion = (id: string) => {
    elements.at(-1)!.comparisonCriterion = id;
  };
  const tag = (s: string, x: number, y: number, w: number) => {
    panel(x, y, w, 0.4, T.white, T.line);
    tx(s, x + 0.1, y + 0.04, w - 0.2, 0.31, 15, T.ink, true);
  };
  const sidebar = (rows = N, gap = 1.1, start = 2.52) => {
    rows.forEach((n, i) => {
      const y = start + i * gap;
      tx(
        String(i + 1).padStart(2, "0"),
        9.07,
        y,
        0.34,
        0.35,
        13,
        T.accent,
        true,
      );
      tx(n.label, 9.56, y, 3.04, 0.39, 21, T.ink, true);
      criterion(n.label);
      tx(n.detail, 9.56, y + 0.45, 3.04, gap - 0.5, 17, T.muted);
      if (i < rows.length - 1)
        line(9.08, y + gap - 0.04, 12.58, y + gap - 0.04, T.line);
    });
  };
  const stepColumn = (rows = N, start = 2.5, gap = 1.02) => {
    rows.forEach((n, i) => {
      const y = start + i * gap;
      panel(9.08, y, 0.48, 0.43, T.tealTint, T.tealTint);
      tx(String(i + 1), 9.08, y + 0.02, 0.48, 0.35, 16, T.accent, true, {
        align: "center",
      });
      tx(n.label, 9.77, y - 0.01, 2.8, 0.42, 20, T.ink, true);
      tx(
        n.detail,
        9.77,
        y + (mode === "response" ? 0.4 : 0.43),
        2.8,
        mode === "response" ? 0.34 : 0.55,
        16,
        T.muted,
      );
      if (i < rows.length - 1)
        line(9.32, y + 0.43, 9.32, y + gap, T.accent, true);
    });
  };
  if (mode === "cover") {
    slide.background = { color: T.ink };
    await photo(0, 0, 13.333, 7.5);
    shape(pptx.ShapeType.rect, 0, 0, 5.65, 7.5, T.ink, T.ink, {
      fill: { color: T.ink, transparency: 8 },
      line: { transparency: 100 },
    });
    tx(p.proposer!.legalName, 0.64, 0.62, 4.45, 0.5, 24, "89CECB", true);
    tx("강민 안심지기 AI", 0.64, 1.58, 4.8, 1.6, 40, T.white, true);
    messageBand(0.64, 3.4, 4.53, 1.13, 21, true);
    tx("가칭 · 개발 전 제품 구상", 0.64, 4.72, 4.5, 0.4, 16, "B9CFD1");
    N.forEach((n, i) => {
      const y = 5.54 + i * 0.4;
      tx(n.label, 0.64, y, 1.2, 0.3, 16, "FFFFFF", true);
      tx(n.detail, 2.13, y, 3.0, 0.3, 14, "BDD2D5");
      if (i < 2) line(1.18, y + 0.29, 1.18, y + 0.4, "89CECB", true);
    });
    tx("주거·제품 구성 개념도", 10.52, 6.62, 2.15, 0.28, 11, T.white, false, {
      align: "right",
    });
    region(0.05, 0.05, 13.2, 6.7);
    return true;
  }
  tx("SAFEHOME AI · 제품 구상", 0.64, 0.3, 9, 0.23, 10, T.accent, true);
  tx(spec.title, 0.64, 0.68, 12.04, 0.67, 32, T.ink, true);
  messageBand(0.64, 1.53, 12.04, 0.62, 21);
  if (mode === "queue") {
    const qb = await photo(0.65, 2.35, 5.45, 4.17);
    // Native low-detail event list inside the concept monitor, matching the expanded example.
    panel(
      qb.x + qb.w * 0.327,
      qb.y + qb.h * 0.3,
      qb.w * 0.265,
      qb.h * 0.23,
      T.white,
      T.line,
    );
    ["긴급", "주의", "장비"].forEach((s, i) => {
      const yy = qb.y + qb.h * (0.326 + i * 0.063);
      shape(
        pptx.ShapeType.rect,
        qb.x + qb.w * 0.34,
        yy,
        0.04,
        0.04,
        i === 0 ? T.red : T.accent,
        i === 0 ? T.red : T.accent,
      );
      tx(s, qb.x + qb.w * 0.36, yy - 0.012, 0.33, 0.12, 5, T.ink);
      line(
        qb.x + qb.w * 0.43,
        yy + 0.015,
        qb.x + qb.w * 0.565,
        yy + 0.015,
        T.line,
      );
    });
    tx("기관 담당자의 확인 행동", 0.76, 6.35, 5.2, 0.28, 14, T.ink, true);
    panel(6.36, 2.42, 6.3, 4.03, T.white, T.line);
    elements.at(-1)!.displayObjectId = "safehome-risk-queue-v2";
    shape(pptx.ShapeType.roundRect, 6.36, 2.42, 6.3, 0.48, T.ink, T.ink);
    tx("위험 목록 · 구성 예시", 6.55, 2.5, 5.9, 0.32, 16, T.white, true);
    const records = v.interfaceExample!.records;
    records.forEach((r, i) => {
      const y = 3.12 + i * 1.02;
      tx(r.name, 6.56, y, 1.33, 0.62, 17, i === 0 ? T.red : T.ink, true);
      elements.at(-1)!.fieldSafetyIndicator = true;
      tx(r.status, 8.0, y, 4.36, 0.45, 17, T.ink);
      tx(r.updated + " · " + r.detail, 8.0, y + 0.53, 4.36, 0.5, 14, T.muted);
      if (i < 2) line(6.55, y + 0.87, 12.45, y + 0.87, T.line);
    });
    qualifier();
    region(0.65, 2.3, 12, 4.18);
    return true;
  }
  const b = await photo(0.65, 2.31, 8.12, 4.33);
  tx(
    "주거·제품 구성 개념도",
    b.x + b.w - 2.28,
    b.y + b.h - 0.36,
    2.15,
    0.25,
    10,
    T.muted,
    false,
    { align: "right", fill: { color: T.white, transparency: 8 }, margin: 0.03 },
  );
  if (mode === "response") {
    const anchors = v.scene.annotations!;
    tag("욕실 mmWave", b.x + 0.2, b.y + 0.28, 1.7);
    line(
      b.x + 1.9,
      b.y + 0.48,
      b.x + b.w * anchors[0].x,
      b.y + b.h * anchors[0].y,
      T.accent,
      true,
    );
    tag("음성·큰 버튼 확인", b.x + b.w * 0.62, b.y + b.h * 0.3, 2.3);
    line(
      b.x + b.w * 0.62,
      b.y + b.h * 0.3 + 0.4,
      b.x + b.w * anchors[1].x,
      b.y + b.h * anchors[1].y,
      T.accent,
      true,
    );
    stepColumn(N.slice(0, 4), 2.38, 0.83);
    // Two alternate exits share the cross-check as source, routed in separate empty gutters.
    tag("반응 회복 → 경보 조정", 9.08, 5.73, 3.49);
    tag("신호 불확실 → 추가 확인", 9.08, 6.19, 3.49);
    k.route(
      [
        [9.08, 3.44],
        [8.93, 3.44],
        [8.93, 5.92],
        [9.08, 5.92],
      ],
      T.accent,
    );
    k.route(
      [
        [9.08, 3.56],
        [8.78, 3.56],
        [8.78, 6.38],
        [9.08, 6.38],
      ],
      T.amber,
    );
    qualifier();
  } else if (mode === "system") {
    stepColumn(N, 2.48, 1.0);
    qualifier();
  } else if (mode === "privacy") {
    stepColumn(N, 2.66, 1.14);
    qualifier();
  } else if (mode === "validation") {
    stepColumn(N, 2.5, 1.16);
    tx("다음 협의", 9.1, 6.01, 3.45, 0.35, 18, T.accent, true);
    tx("대상 가구·감지 구역·대응 담당", 9.1, 6.38, 3.45, 0.25, 13, T.muted);
    qualifier();
  } else if (mode === "packages") {
    N.forEach((n, i) => {
      const y = 2.4 + i * 1.35;
      tx(n.label, 9.1, y, 3.48, 0.4, 21, T.ink, true);
      criterion(n.label);
      tx(n.detail.split("|")[0], 9.1, y + 0.48, 3.48, 0.43, 17, T.muted);
      criterion("구성 차이");
      tx(n.detail.split("|")[1], 9.1, y + 0.97, 3.48, 0.36, 13, T.accent);
    });
    qualifier();
  } else if (mode === "zones") {
    for (const [i, a] of (v.scene.annotations || []).entries()) {
      const xx = b.x + b.w * a.x - 0.14,
        yy = b.y + b.h * a.y - 0.14;
      shape(pptx.ShapeType.ellipse, xx, yy, 0.28, 0.28, T.accent, T.white);
      tx(String(i + 1), xx, yy + 0.025, 0.28, 0.22, 12, T.white, true, {
        align: "center",
      });
    }
    sidebar(N, 0.79, 2.45);
    qualifier();
  } else if (mode === "wifi") {
    sidebar(N, 0.97, 2.5);
    qualifier();
  } else if (mode === "problem") {
    sidebar(N, 1.18, 2.58);
    const point = v.scene.annotations![0];
    tag("호출 버튼", b.x + b.w * 0.67, b.y + b.h * 0.13, 1.45);
    line(
      b.x + b.w * 0.67 + 0.72,
      b.y + b.h * 0.13 + 0.4,
      b.x + b.w * point.x,
      b.y + b.h * point.y,
      T.amber,
      true,
    );
    qualifier();
  } else {
    if (mode === "events")
      tag("정상 휴식 예시 · 사고판정 아님", b.x + 0.18, b.y + 0.2, 3.48);
    sidebar(N, 1.19, 2.56);
    qualifier();
  }
  region(0.65, 2.31, 12.02, 4.33);
  return true;
}
