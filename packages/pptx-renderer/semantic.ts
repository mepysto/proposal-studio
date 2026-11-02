import { renderVisualComposition } from "./visual-composition.js";
import { renderBusiness } from "./business.js";
import type { ProjectData, SlideData } from "../core/schema.js";
import type { Element } from "./index.js";

export interface DrawingContext {
  p: ProjectData;
  spec: SlideData;
  slide: any;
  pptx: any;
  elements: Element[];
  text: (
    value: string,
    x: number,
    y: number,
    w: number,
    h: number,
    size?: number,
    color?: string,
    bold?: boolean,
    extra?: Record<string, any>,
  ) => void;
  rect: (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    line?: string,
    overlay?: boolean,
  ) => void;
  image: (x: number, y: number, w: number, h: number) => Promise<boolean>;
}

/** Purpose-specific compositions. Content and geometry relationships come from the planning brief. */
export async function renderSemantic(ctx: DrawingContext) {
  const { p, spec, slide, pptx, text, rect, image, elements } = ctx;
  if (!spec.reasoning || !p.planning) return false;
  if (await renderVisualComposition(ctx)) return true;
  if (spec.reasoning.visualKind === "business-section")
    return renderBusiness(ctx);
  const b = p.planning,
    c = p.design.colors;
  let serial = 0;
  const shape = (
    kind: string,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    extra: Record<string, any> = {},
  ) => {
    slide.addShape(kind, {
      x,
      y,
      w,
      h,
      fill: { color: fill },
      line: { color: fill },
      ...extra,
    });
    elements.push({
      slideId: spec.id,
      id: `semantic-${++serial}`,
      kind: "shape",
      x,
      y,
      w,
      h,
      intentionalOverlay: true,
    });
  };
  const connector = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color = c.accent,
    arrow = true,
    dashed = false,
  ) => {
    const forward = x2 > x1 || (Math.abs(x2 - x1) < 0.01 && y2 >= y1);
    const x = Math.min(x1, x2),
      y = Math.min(y1, y2),
      w = Math.max(0.001, Math.abs(x2 - x1)),
      h = Math.max(0.001, Math.abs(y2 - y1));
    shape(pptx.ShapeType.line, x, y, w, h, color, {
      flipV: (x2 - x1) * (y2 - y1) < 0,
      line: {
        color,
        width: 2,
        ...(dashed ? { dashType: "dash" } : {}),
        ...(arrow
          ? { [forward ? "endArrowType" : "beginArrowType"]: "triangle" }
          : {}),
      },
    });
  };
  const rule = (x: number, y: number, w: number, color = "CED7D2") =>
    rect(x, y, w, 0.015, color, color, true);
  const dot = (n: string, x: number, y: number, color = c.accent) => {
    shape(pptx.ShapeType.ellipse, x, y, 0.32, 0.32, color);
    text(n, x, y + 0.035, 0.32, 0.23, 12, "FFFFFF", true, { align: "center" });
  };
  // Korean labels are presentation vocabulary, not industry-specific content.
  const labels = {
    decision: "실증 제안",
    problem: "문제의 발생 구조",
    scenario: "공간과 동선",
    intervention: "개입과 설치 개념",
    operation: "책임과 확인",
    validation: "검증 설계",
    alternatives: "대안의 비교",
    business: "사업 기획",
  };
  const kind = spec.reasoning.visualKind;
  if (kind === "decision-image") {
    if (spec.image) await image(0, 0, 13.333, 7.5);
    rect(0, 0, 5.6, 7.5, c.dark);
    text(p.title, 0.58, 0.55, 4.45, 0.4, 13, "A4D8D0", true);
    text(spec.title, 0.58, 1.4, 4.6, 2.05, 35, "FFFFFF", true);
    rule(0.6, 3.85, 0.8, "65C4B7");
    text(spec.message, 0.6, 4.16, 4.4, 1.15, 20, "DAE7E1");
    text(b.decision.scope, 0.6, 5.83, 4.4, 0.6, 15, "A4D8D0");
    if (spec.image)
      text(spec.image.caption, 6.0, 6.55, 6.65, 0.45, 11, c.ink, false, {
        fill: { color: c.paper, transparency: 8 },
        margin: 0.05,
      });
    return true;
  }
  text(labels[spec.reasoning.stage], 0.65, 0.3, 10, 0.25, 11, c.accent, true);
  text(spec.title, 0.65, 0.78, 12.05, 0.96, 30, c.ink, true);
  text(spec.message, 0.65, 1.79, 12.0, 0.68, 18, c.muted);
  if (kind === "causal-diagnosis") {
    const n = b.problem.mechanisms.length,
      cell = 12 / n;
    b.problem.mechanisms.forEach((m, i) => {
      const x = 0.65 + i * cell;
      text(
        String(i + 1).padStart(2, "0"),
        x,
        2.84,
        0.6,
        0.4,
        24,
        c.accent,
        true,
      );
      rule(x, 3.4, cell - 0.55, c.accent);
      text(m.cause, x, 3.68, cell - 0.62, 0.8, 23, c.ink, true);
      text(m.effect, x, 4.72, cell - 0.64, 0.75, 17, c.muted);
      connector(x + 0.1, 4.51, x + 0.1, 4.65, c.accent);
    });
    rule(0.65, 5.61, 12.0);
    text("기존 대응", 0.65, 5.9, 1.4, 0.34, 15, c.accent, true);
    text(b.problem.baseline, 2.08, 5.9, 6.0, 0.72, 16, c.ink);
    text(
      b.problem.localEvidence.status === "observed"
        ? "현장 근거 확보"
        : "천안 현장 확인 전",
      8.72,
      5.9,
      3.8,
      0.35,
      16,
      "A46422",
      true,
    );
    text(
      b.problem.localEvidence.required[0],
      8.72,
      6.32,
      3.8,
      0.42,
      13,
      c.muted,
    );
  } else if (kind === "site-map") {
    const site = b.site!;
    const area = { x: 0.65, y: 2.68, w: 8.1, h: 3.75 };
    const tx = (x: number) => area.x + x * area.w,
      ty = (y: number) => area.y + y * area.h;
    const zoneColor = {
      site: "E5E7DE",
      walkway: "EAF0E6",
      road: "D4DDDA",
      occlusion: "C9C1B3",
      conflict: "F1C66D",
    };
    for (const z of site.zones) {
      shape(
        pptx.ShapeType.rect,
        tx(z.x),
        ty(z.y),
        z.w * area.w,
        z.h * area.h,
        zoneColor[z.kind],
        {
          fill: {
            color: zoneColor[z.kind],
            transparency: z.kind === "conflict" ? 12 : 0,
          },
          line: {
            color: z.kind === "conflict" ? "D39733" : zoneColor[z.kind],
            width: 1,
            ...(z.kind === "conflict" ? { dashType: "dash" } : {}),
          },
        },
      );
      if (z.kind !== "conflict" && z.kind !== "occlusion")
        text(
          z.label,
          tx(z.x) + 0.12,
          ty(z.y) + 0.1,
          z.w * area.w - 0.2,
          0.29,
          12,
          c.muted,
          true,
        );
    }
    for (const o of site.objects) {
      const x = tx(o.x),
        y = ty(o.y);
      if (o.kind === "barrier") {
        rect(x, y, (o.w ?? 0.12) * area.w, 0.09, c.ink);
      } else if (o.kind === "vehicle") {
        rect(x - 0.26, y - 0.44, 0.52, 0.67, "B88838");
        rect(x - 0.27, y + 0.15, 0.54, 0.26, "E8B34E");
        rect(x - 0.19, y + 0.22, 0.38, 0.08, "E7EFE7");
        for (const dx of [-0.31, 0.25])
          for (const dy of [-0.3, 0.2]) rect(x + dx, y + dy, 0.07, 0.18, c.ink);
      } else if (o.kind === "person" || o.kind === "operator") {
        const color = o.kind === "operator" ? "D18F2B" : c.accent;
        shape(pptx.ShapeType.ellipse, x - 0.07, y - 0.18, 0.14, 0.14, color);
        shape(pptx.ShapeType.roundRect, x - 0.1, y, 0.2, 0.31, color);
      } else {
        shape(pptx.ShapeType.ellipse, x - 0.12, y - 0.12, 0.24, 0.24, c.accent);
      }
    }
    for (const path of site.paths) {
      const color =
        path.kind === "vehicle"
          ? "B46D22"
          : path.kind === "pedestrian"
            ? c.accent
            : "5F8894";
      for (let i = 1; i < path.points.length; i++) {
        const [x1, y1] = path.points[i - 1],
          [x2, y2] = path.points[i];
        connector(
          tx(x1),
          ty(y1),
          tx(x2),
          ty(y2),
          color,
          i === path.points.length - 1,
          path.kind === "signal",
        );
      }
    }
    site.callouts.forEach((callout, i) => {
      dot(String(i + 1), tx(callout.x) - 0.16, ty(callout.y) - 0.16, "A96826");
      const y = 2.82 + i * 1.17;
      text(`${i + 1}  ${callout.label}`, 9.2, y, 3.4, 0.38, 20, c.ink, true);
      text(callout.detail, 9.2, y + 0.48, 3.4, 0.6, 16, c.muted);
    });
    text(site.disclaimer, 0.65, 6.55, 8.1, 0.26, 11, c.muted);
  } else if (kind === "intervention-overlay") {
    if (spec.image) {
      const box = { x: 4.8, y: 2.67, w: 7.9, h: 3.92 };
      // Anchors refer to normalized source-image coordinates. Use contain to keep correspondence exact.
      const meta = (await import("sharp")).default;
      const size = await meta(spec.image.path).metadata();
      const ratio = size.width! / size.height!;
      const iw = Math.min(box.w, box.h * ratio),
        ih = iw / ratio;
      const ix = box.x + (box.w - iw) / 2,
        iy = box.y + (box.h - ih) / 2;
      // Redraw contained image on paper; source pixel coordinates remain stable.
      rect(box.x, box.y, box.w, box.h, c.paper);
      slide.addImage({ path: spec.image.path, x: ix, y: iy, w: iw, h: ih });
      elements.push({
        slideId: spec.id,
        id: "semantic-contained-image",
        kind: "image",
        x: ix,
        y: iy,
        w: iw,
        h: ih,
        image: {
          path: spec.image.path,
          width: size.width!,
          height: size.height!,
          dpi: Math.min(size.width! / iw, size.height! / ih),
        },
      });
      for (const annotation of spec.image.annotations || []) {
        const i = b.interventions.findIndex(
          (t) => t.id === annotation.interventionId,
        );
        if (i >= 0)
          dot(
            String(i + 1),
            ix + annotation.x * iw - 0.16,
            iy + annotation.y * ih - 0.16,
          );
      }
      text(spec.image.caption, 4.8, 6.64, 7.9, 0.25, 10, c.muted);
    }
    b.interventions.forEach((intervention, i) => {
      const y = 2.78 + i * 1.22;
      dot(String(i + 1), 0.65, y);
      text(intervention.name, 1.16, y - 0.02, 3.38, 0.38, 21, c.ink, true);
      text(intervention.action, 1.16, y + 0.45, 3.38, 0.65, 16, c.muted);
    });
    if (!spec.image) {
      text("개입의 결과물", 5.2, 2.8, 6.5, 0.5, 23, c.accent, true);
      b.interventions.forEach((v, i) =>
        text(v.deliverable, 5.2, 3.55 + i * 0.85, 6.9, 0.68, 20, c.ink),
      );
    }
  } else if (kind === "accountability-swimlane") {
    const startX = 1.82,
      cell = 10.82 / b.workflow.length;
    const rows = [
      { label: "시스템", y: 3.16, bg: "E5ECE7" },
      { label: "책임자", y: 4.18, bg: "F1E4CA" },
      { label: "확인 기록", y: 5.2, bg: "E5ECE7" },
    ];
    for (const row of rows) {
      rect(0.65, row.y - 0.08, 12.0, 0.89, row.bg);
      text(row.label, 0.77, row.y + 0.18, 0.95, 0.33, 14, c.muted, true);
    }
    b.workflow.forEach((w, i) => {
      const x = startX + i * cell;
      text(w.label, x, 2.64, cell - 0.14, 0.38, 19, c.ink, true);
      if (i < b.workflow.length - 1)
        connector(x + cell - 0.32, 2.83, x + cell - 0.1, 2.83);
      text(
        w.owner === "system" ? w.action : "—",
        x,
        3.28,
        cell - 0.2,
        0.58,
        15,
        c.ink,
      );
      text(
        w.owner === "human" ? w.action : "—",
        x,
        4.3,
        cell - 0.2,
        0.58,
        15,
        c.ink,
        w.owner === "human",
      );
      text(w.successSignal, x, 5.32, cell - 0.2, 0.59, 14, c.muted);
    });
    text(b.operatingBoundary, 0.65, 6.4, 12.0, 0.4, 15, "A46422", true);
  } else if (kind === "validation-matrix" || kind === "alternatives-matrix") {
    const validation = kind === "validation-matrix";
    const rows = validation
      ? b.validation.map((v) => [v.question, v.method, v.decisionRule])
      : b.alternatives.map((a) => [a.name, a.addresses, a.limits]);
    const headers = validation
      ? ["검증 질문", "측정 방법", "진행·중단 판단"]
      : ["대안", "해결하는 부분", "한계·선택 조건"];
    headers.forEach((h, i) =>
      text(
        h,
        [0.65, 4.52, 8.67][i],
        2.72,
        [3.5, 3.8, 3.85][i],
        0.4,
        18,
        c.accent,
        true,
      ),
    );
    const compact = rows.length > 3;
    rows.forEach((row, i) => {
      const y = 3.34 + i * (compact ? 0.7 : 0.83);
      rule(0.65, y - 0.1, 12);
      row.forEach((value, j) =>
        text(
          value,
          [0.65, 4.52, 8.67][j],
          y,
          [3.5, 3.8, 3.85][j],
          compact ? 0.62 : 0.67,
          compact ? 15 : 16,
          c.ink,
          j === 0,
        ),
      );
    });
    if (validation) {
      rule(0.65, 6.1, 12.0, c.accent);
      text("협의 요청", 0.65, 6.31, 1.28, 0.35, 15, c.accent, true);
      text(b.decision.request, 2.03, 6.31, 10.6, 0.53, 16, c.ink, true);
    }
  }
  return true;
}
