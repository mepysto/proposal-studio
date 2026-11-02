import { renderMunicipalReview } from "./municipal-review.js";
import { renderMunicipalEnhancement } from "./municipal-enhancements.js";
import type { DrawingContext } from "./semantic.js";
import sharp from "sharp";
import { professionalKit, resolveTokens } from "./professional-kit.js";
import { MUNICIPAL_KINDS } from "../business-case/municipal-schema.js";
export async function renderMunicipalComposition(ctx: DrawingContext) {
  const T = resolveTokens(ctx.p);
  const { p, spec, pptx, elements } = ctx,
    v = spec.reasoning?.visualPlan;
  if (!v || !(MUNICIPAL_KINDS as readonly string[]).includes(v.kind))
    return false;
  const b = p.businessCase!.municipalCase!,
    N = v.nodes;
  const kit = professionalKit(ctx);
  const { tx, shape, line, route, icon, iconLabel, header, legend, region } =
    kit;
  const rect = (x: number, y: number, w: number, h: number, fill = T.panel) =>
    shape(pptx.ShapeType.roundRect, x, y, w, h, fill, T.line);
  const section = p.businessCase!.sections.find(
    (s) => s.id === spec.reasoning?.sectionId,
  );
  header(section?.kicker || "천안시 사업 제안", v.takeaway);
  if (await renderMunicipalReview(ctx, kit)) return true;
  if (await renderMunicipalEnhancement(ctx, kit)) return true;
  if (v.kind === "municipal-overview") {
    const names = ["cpu", "monitor", "network"];
    // Each product is bounded; the operators share an integrated management offer.
    rect(0.64, 2.64, 3.8, 2.15, T.white);
    rect(4.76, 2.64, 3.8, 2.15, T.white);
    rect(8.88, 2.64, 3.8, 2.15, T.tealTint);
    for (let i = 0; i < 3; i++) {
      const x = [0.84, 4.96, 9.12][i];
      await iconLabel(
        names[i],
        N[i].label,
        x,
        2.95,
        3.4,
        0.78,
        p.businessCase?.productPositioning?.platform ? 19 : 21,
        T.accent,
      );
      tx(N[i].detail, x, 4.12, 3.4, 0.62, 17, T.muted);
      if (i === 0)
        tx("+", 4.48, 3.555, 0.24, 0.32, 17, T.accent, true, {
          align: "center",
          valign: "mid",
        });
      if (i === 1) line(8.62, 3.715, 8.82, 3.715, T.accent, true);
    }
    rect(0.64, 5.13, 12.04, 1.18, T.ink);
    const info = [
      ["출발 규모", `대표 출입구 ${b.pilot.gates}개소`],
      [
        "실증 기획",
        `${b.pilot.totalMonths}개월 · 현장 약${b.pilot.fieldMonths}개월`,
      ],
      ["사업비", "현장조사 후 견적"],
    ];
    info.forEach((r, i) => {
      const x = 0.91 + i * 4.02;
      tx(r[0], x, 5.33, 3.6, 0.26, 12, "B1CFD8");
      tx(r[1], x, 5.77, 3.65, 0.35, 18, T.white, true);
    });
  } else if (v.kind === "field-information-flow") {
    if (p.businessCase?.productPositioning?.platform) {
      // The two field products receive data and perform their own functions.
      // Neither the AIoT display nor Bitree control is drawn as a passive NPU peripheral.
      rect(0.64, 2.64, 2.1, 3.8, T.panel);
      await iconLabel(
        "camera",
        "영상·센서 입력",
        0.82,
        2.85,
        1.74,
        0.8,
        17,
        T.accent,
      );
      tx("CCTV 영상", 0.82, 3.94, 1.74, 0.45, 18, T.ink, true);
      tx("현장 센서 데이터", 0.82, 4.72, 1.74, 0.7, 17, T.ink, true);
      tx("권한·범위에 맞춰 연계", 0.82, 5.72, 1.74, 0.5, 13, T.muted);
      for (const [i, y] of [2.64, 4.66].entries()) {
        rect(
          3.28,
          y,
          4.9,
          i === 0 ? 1.62 : 1.78,
          i === 0 ? T.tealTint : T.blueTint,
        );
        await iconLabel(
          i === 0 ? "cpu" : "monitor",
          N[i + 1].label,
          3.46,
          y + 0.14,
          4.54,
          0.45,
          18,
          T.accent,
        );
        tx(N[i + 1].detail, 3.46, y + 0.77, 4.54, 0.75, 16, T.ink);
        const cy = y + (i === 0 ? 0.8 : 0.9);
        line(2.79, cy, 3.17, cy, T.accent, true);
        line(8.23, cy, 8.65, cy, T.accent, true);
      }
      rect(8.76, 2.64, 3.92, 3.8, T.tealTint);
      await iconLabel(
        "network",
        N[3].label,
        8.94,
        2.83,
        3.56,
        0.55,
        20,
        T.accent,
      );
      tx("두 제품을 한곳에서 관리", 8.94, 3.55, 3.56, 0.4, 17, T.ink, true);
      tx(
        "상태·장애·이벤트 확인\n표출 편성·운영 설정\n담당자 조치 이력",
        8.94,
        4.18,
        3.56,
        1.05,
        17,
        T.ink,
      );
      line(8.94, 5.49, 12.5, 5.49, T.line);
      tx(N[4].label, 8.94, 5.66, 3.56, 0.33, 17, T.accent, true);
      tx("작동·운영 부담·재투입 결과", 8.94, 6.1, 3.56, 0.28, 13, T.muted);
      legend(v.legend);
      region();
      elements.at(-1)!.municipalVisualKind = v.kind;
      return true;
    }
    const box = async (
      i: number,
      x: number,
      y: number,
      w: number,
      h: number,
      name: string,
      fill = T.white,
    ) => {
      rect(x, y, w, h, fill);
      await iconLabel(
        name,
        N[i].label,
        x + 0.17,
        y + 0.12,
        w - 0.34,
        0.48,
        17,
        T.accent,
      );
      tx(N[i].detail, x + 0.17, y + 0.68, w - 0.34, h - 0.76, 14, T.muted);
    };
    await box(0, 0.64, 3.12, 2.65, 1.66, "camera");
    await box(1, 3.72, 3.12, 2.65, 1.66, "server", T.tealTint);
    // Output labels are wider than the input label and do not cross the branch corridor.
    await box(2, 7.14, 2.64, 5.54, 1.2, "bell");
    await box(3, 7.14, 4.12, 5.54, 1.2, "monitor");
    line(3.31, 3.83, 3.63, 3.83, T.accent, true);
    route([
      [6.4, 3.6],
      [6.75, 3.6],
      [6.75, 3.24],
      [7.03, 3.24],
    ]);
    route([
      [6.4, 4.26],
      [6.75, 4.26],
      [6.75, 4.72],
      [7.03, 4.72],
    ]);
    line(5.04, 4.82, 5.04, 5.42, T.accent, true);
    tx(N[4].label, 3.72, 5.56, 2.65, 0.35, 16, T.ink, true);
    tx(N[4].detail, 3.72, 6.0, 2.65, 0.45, 13, T.muted);
    line(6.42, 5.83, 7.03, 5.83, T.accent, true);
    rect(7.14, 5.56, 5.54, 0.89, T.blueTint);
    tx(N[5].label, 7.33, 5.64, 5.16, 0.31, 16, T.ink, true);
    tx(N[5].detail, 7.33, 6.05, 5.16, 0.3, 13, T.muted);
    tx("현장 안에서 처리", 0.64, 2.66, 5.8, 0.3, 14, T.accent, true);
  } else if (v.kind === "public-value") {
    if (b.benefitScenes) {
      for (const [i, s] of b.benefitScenes.entries()) {
        const x = 0.64 + i * 4.12;
        shape(pptx.ShapeType.roundRect, x, 2.64, 3.8, 3.82, T.white, T.line);
        shape(
          pptx.ShapeType.roundRect,
          x + 0.12,
          2.78,
          3.56,
          0.46,
          [T.tealTint, T.blueTint, T.tealTint][i],
          T.white,
        );
        tx(
          ["시민 안전", "현장 대응", "천안시 활용"][i],
          x + 0.25,
          2.85,
          3.3,
          0.32,
          21,
          T.accent,
          true,
        );
        const m = await sharp(s.path).metadata(),
          scale = Math.min(3.44 / m.width!, 1.7 / m.height!),
          w = m.width! * scale,
          h = m.height! * scale;
        const px = x + (3.8 - w) / 2,
          py = 3.34 + (1.7 - h) / 2;
        ctx.slide.addImage({ path: s.path, x: px, y: py, w, h });
        elements.push({
          slideId: spec.id,
          id: `benefit-image-${i}`,
          kind: "image",
          x: px,
          y: py,
          w,
          h,
          image: {
            path: s.path,
            width: m.width!,
            height: m.height!,
            dpi: m.width! / w,
          },
        });
        shape(pptx.ShapeType.rect, px, py, w, h, T.white, T.line, {
          fill: { color: T.white, transparency: 100 },
        });
        tx(s.mechanism, x + 0.18, 5.18, 3.44, 0.56, 16, T.ink);
        line(x + 1.9, 5.79, x + 1.9, 5.93, T.accent, true);
        shape(
          pptx.ShapeType.roundRect,
          x + 0.14,
          6.0,
          3.52,
          0.36,
          T.tealTint,
          T.tealTint,
        );
        tx(s.value, x + 0.26, 6.04, 3.28, 0.27, 17, T.accent, true);
      }
      legend(v.legend);
      region();
      elements.at(-1)!.municipalVisualKind = v.kind;
      return true;
    }
    for (const [i, r] of b.benefits.entries()) {
      const x = 0.64 + i * 4.12;
      line(x, 2.66, x + 3.8, 2.66, T.accent);
      await iconLabel(
        ["person", "hard-hat", "city"][i],
        r.audience,
        x,
        2.8,
        3.8,
        0.55,
        23,
        T.accent,
      );
      tx(r.before, x, 3.47, 3.8, 0.64, 16, T.muted);
      line(x + 0.13, 4.17, x + 0.13, 4.4, T.accent, true);
      tx(r.intervention, x, 4.56, 3.8, 0.66, 18, T.ink, true);
      line(x + 0.13, 5.25, x + 0.13, 5.47, T.accent, true);
      tx(r.outcome, x, 5.64, 3.8, 0.68, 21, T.accent, true);
    }
  } else if (v.kind === "pilot-package") {
    tx(
      `출입구 ${b.pilot.gates}개소 · 전체 ${b.pilot.totalMonths}개월 / 현장 운영 약${b.pilot.fieldMonths}개월`,
      0.64,
      2.69,
      7.5,
      0.45,
      22,
      T.accent,
      true,
    );
    b.pilot.scope.forEach((r, i) => {
      const y = 3.45 + i * 1.0;
      rect(0.64, y - 0.1, 7.51, 0.94, T.white);
      tx(`0${i + 1}`, 0.82, y, 0.32, 0.34, 16, T.accent, true);
      tx(r.label, 1.3, y, 6.85, 0.36, 20, T.ink, true);
      tx(r.detail, 1.3, y + 0.44, 6.64, 0.34, 16, T.muted);
    });
    rect(8.67, 2.64, 4.01, 3.8, T.tealTint);
    tx("확장안 사업비", 8.94, 2.95, 3.47, 0.36, 17, T.accent, true);
    tx("현장조사 후 견적", 8.94, 3.55, 3.47, 0.63, 25, T.ink, true);
    tx("견적을 좌우하는 현장 조건", 8.94, 4.44, 3.47, 0.37, 16, T.ink, true);
    tx(
      "LED 크기·거리와 시야\n전력·통신·구조물 여건\n운영기간·지원 수준\n회수·보관·재설치 범위",
      8.94,
      4.99,
      3.47,
      1.16,
      15,
      T.muted,
    );
  } else if (v.kind === "service-model") {
    rect(0.64, 2.64, 3.0, 2.86, T.white);
    rect(9.1, 2.64, 3.58, 2.86, T.white);
    tx("천안시", 0.82, 2.73, 2.64, 0.4, 23, T.ink, true);
    b.service.city.forEach((s, i) =>
      tx(s, 0.82, 3.4 + i * 0.55, 2.64, 0.44, 16, T.muted),
    );
    line(3.75, 4.07, 4.05, 4.07, T.accent, true);
    rect(4.18, 2.64, 4.23, 2.86, T.tealTint);
    tx(b.service.lead, 4.41, 2.92, 3.77, 0.43, 25, T.ink, true);
    tx("운영서비스 단일 창구 제안", 4.41, 3.56, 3.77, 0.55, 17, T.accent, true);
    b.service.supplier.forEach((s, i) =>
      tx(s, 4.41, 4.12 + i * 0.39, 3.77, 0.34, 14, T.ink),
    );
    line(8.53, 4.07, 8.96, 4.07, T.accent, true);
    tx("현장 안전책임자", 9.28, 2.73, 3.22, 0.4, 23, T.ink, true);
    b.service.site.forEach((s, i) =>
      tx(s, 9.28, 3.4 + i * 0.75, 3.22, 0.65, 16, T.muted),
    );
    tx(b.service.report, 0.64, 5.8, 12.04, 0.36, 16, T.accent, true);
    tx(
      "소유 방식: 시 소유 + 유지관리 위탁 / 공급사 보유 + 임대·서비스  →  동일 범위 총비용으로 비교",
      0.64,
      6.28,
      12.04,
      0.28,
      12,
      T.muted,
    );
  } else if (v.kind === "evaluation-plan") {
    const xs = [0.64, 4.18, 9.37],
      ws = [3.15, 4.75, 3.27];
    ["판단 질문", "확인할 변화와 기록", "시의 판단에 쓸 근거"].forEach((s, i) =>
      tx(s, xs[i], 2.73, ws[i], 0.35, 15, T.accent, true),
    );
    b.evaluation.forEach((r, i) => {
      const y = 3.34 + i * 1.02;
      rect(0.64, y - 0.16, 12.04, 0.96, T.white);
      tx(r.question, xs[0] + 0.18, y, ws[0] - 0.18, 0.72, 19, T.ink, true, {
        valign: "mid",
      });
      line(3.85, y + 0.36, 4.08, y + 0.36, T.accent, true);
      line(9.0, y + 0.36, 9.27, y + 0.36, T.accent, true);
      tx(r.observation, xs[1], y, ws[1], 0.72, 16, T.ink, false, {
        valign: "mid",
      });
      tx(r.decision, xs[2], y, ws[2], 0.72, 15, T.muted, false, {
        valign: "mid",
      });
    });
  } else if (v.kind === "expansion-path") {
    b.expansion.forEach((r, i) => {
      const x = 0.64 + i * 4.12;
      rect(x, 2.64, 3.8, 3.82, T.white);
      tx(`0${i + 1}`, x + 0.18, 2.78, 0.5, 0.36, 18, T.accent, true);
      tx(r.label, x + 0.18, 3.21, 3.44, 0.72, 21, T.ink, true, {
        valign: "mid",
      });
      tx(r.scope, x + 0.18, 4.15, 3.44, 0.66, 17, T.ink);
      tx(r.carry, x + 0.18, 4.98, 3.44, 0.64, 15, T.muted);
      line(x + 0.18, 5.74, x + 3.62, 5.74, T.line);
      tx(r.decision, x + 0.18, 5.95, 3.44, 0.48, 14, T.accent, true);
      if (i < 2) line(x + 3.84, 3.57, x + 4.06, 3.57, T.accent, true);
    });
  } else if (v.kind === "city-proposal") {
    rect(0.64, 2.64, 4.01, 3.8, T.ink);
    tx("제안의 출발점", 0.91, 2.97, 3.47, 0.31, 15, "B1CFD8");
    tx(
      `대표 출입구\n${b.pilot.gates}개소 실증`,
      0.91,
      3.56,
      3.47,
      1.12,
      31,
      T.white,
      true,
    );
    tx(
      "보행자 알림·운전자 안내\n운영서비스·설비 재사용",
      0.91,
      5.13,
      3.47,
      0.8,
      18,
      T.white,
    );
    N.forEach((n, i) => {
      const y = 2.78 + i * 1.18;
      rect(5.13, y - 0.14, 7.55, 1.14, T.white);
      line(4.87, y + 0.4, 5.04, y + 0.4, T.accent, true);
      if (i < 2) line(4.87, y + 0.4, 4.87, y + 1.58, T.accent, true);
      tx(`0${i + 1}`, 5.31, y, 0.32, 0.34, 15, T.accent, true);
      tx(n.label, 5.82, y, 6.86, 0.43, 22, T.ink, true);
      tx(n.detail, 5.82, y + 0.56, 6.86, 0.43, 16, T.muted);
    });
  }
  legend(v.legend);
  region();
  elements.at(-1)!.municipalVisualKind = v.kind;
  return true;
}
