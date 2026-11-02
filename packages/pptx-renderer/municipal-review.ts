import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";
import { facingPorts } from "./connector-anchors.js";
export async function renderMunicipalReview(
  ctx: DrawingContext,
  kit: ReturnType<typeof professionalKit>,
) {
  const T = resolveTokens(ctx.p);
  const { p, spec, pptx, elements } = ctx,
    v = spec.reasoning?.visualPlan,
    b = p.businessCase?.municipalCase;
  if (!v || !b) return false;
  const { tx, shape, line, legend, region } = kit;
  const panel = (x: number, y: number, w: number, h: number, fill = T.white) =>
    shape(pptx.ShapeType.roundRect, x, y, w, h, fill, T.line);
  if (
    v.kind === "service-model" &&
    v.edges.length === 3 &&
    v.edges.every((e) => e.bidirectional)
  ) {
    const nodes = {
      city: { x: 4.6, y: 2.64, w: 4.13, h: 1.13 },
      supplier: { x: 0.64, y: 4.95, w: 4.5, h: 1.45 },
      site: { x: 8.18, y: 4.95, w: 4.5, h: 1.45 },
    };
    const c = nodes.city,
      l = nodes.supplier,
      r = nodes.site;
    const paths = [
      { start: [c.x, c.y + c.h / 2], end: [l.x + l.w / 2, l.y] },
      { start: [c.x + c.w, c.y + c.h / 2], end: [r.x + r.w / 2, r.y] },
      facingPorts(l, r),
    ];
    for (const [i, path] of paths.entries()) {
      const [x1, y1] = path.start,
        [x2, y2] = path.end;
      shape(
        pptx.ShapeType.line,
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.abs(x2 - x1),
        Math.abs(y2 - y1),
        T.accent,
        T.accent,
        {
          flipV: (x2 - x1) * (y2 - y1) < 0,
          line: {
            color: T.accent,
            width: 1.8,
            beginArrowType: "arrow",
            endArrowType: "arrow",
          },
        },
      );
      elements.at(-1)!.semanticConnector = true;
      elements.at(-1)!.collaborationEdge = {
        from: v.edges[i].from,
        to: v.edges[i].to,
        bidirectional: true,
      };
    }
    // Paint actor boundaries after routes, retaining exact boundary ports.
    for (const [id, n] of Object.entries(nodes))
      panel(
        n.x,
        n.y,
        n.w,
        n.h,
        id === "city" ? T.blueTint : id === "supplier" ? T.tealTint : T.white,
      );
    tx("천안시", c.x + 0.22, c.y + 0.13, c.w - 0.44, 0.4, 24, T.accent, true);
    tx(
      v.nodes.find((n) => n.id === "city")!.detail,
      c.x + 0.22,
      c.y + 0.72,
      c.w - 0.44,
      0.32,
      16,
      T.ink,
    );
    tx(
      b.service.lead,
      l.x + 0.22,
      l.y + 0.14,
      l.w - 0.44,
      0.42,
      24,
      T.accent,
      true,
    );
    tx(
      v.nodes.find((n) => n.id === "supplier")!.detail,
      l.x + 0.22,
      l.y + 0.74,
      l.w - 0.44,
      0.58,
      17,
      T.ink,
    );
    tx(
      "현장 안전책임자",
      r.x + 0.22,
      r.y + 0.14,
      r.w - 0.44,
      0.42,
      24,
      T.accent,
      true,
    );
    tx(
      v.nodes.find((n) => n.id === "site")!.detail,
      r.x + 0.22,
      r.y + 0.74,
      r.w - 0.44,
      0.58,
      17,
      T.ink,
    );
    tx(
      "운영 방향 협의\n작동·운영 결과 보고",
      0.84,
      3.85,
      2.55,
      0.64,
      17,
      T.ink,
      true,
    );
    tx(
      "현장 요구 공유\n안전·개선 협의",
      10.3,
      3.8,
      2.18,
      0.64,
      17,
      T.ink,
      true,
    );
    panel(5.22, 4.05, 2.9, 0.82, T.tealTint);
    tx("상호 협업", 5.4, 4.14, 2.54, 0.34, 21, T.accent, true, {
      align: "center",
    });
    tx("기록 공유·공동 개선", 5.4, 4.6, 2.54, 0.24, 14, T.ink, false, {
      align: "center",
    });
    tx("기술 지원 ↔ 현장 피드백", 5.34, 5.91, 2.64, 0.4, 14, T.accent, true, {
      align: "center",
    });
  } else if (
    v.kind === "evaluation-plan" &&
    b.evaluation.every((r) => r.demonstration)
  ) {
    const cols = [
      { x: 0.64, w: 3.54 },
      { x: 4.61, w: 3.54 },
      { x: 8.58, w: 4.1 },
    ];
    ["01  시험 조건", "02  장치·현장 반응", "03  확인 기록"].forEach((t, i) =>
      tx(t, cols[i].x, 2.71, cols[i].w, 0.34, 17, T.accent, true),
    );
    for (const [i, test] of b.evaluation.entries()) {
      const y = 3.22 + i * 1.08,
        h = 0.97,
        d = test.demonstration!;
      cols.forEach((c, j) =>
        panel(c.x, y, c.w, h, j === 1 ? T.tealTint : T.white),
      );
      for (let j = 0; j < 2; j++) {
        const p = facingPorts({ ...cols[j], y, h }, { ...cols[j + 1], y, h });
        line(p.start[0], p.start[1], p.end[0], p.end[1], T.accent, true);
      }
      tx(
        test.question,
        cols[0].x + 0.17,
        y + 0.1,
        cols[0].w - 0.34,
        0.32,
        18,
        T.accent,
        true,
      );
      tx(
        d.condition,
        cols[0].x + 0.17,
        y + 0.53,
        cols[0].w - 0.34,
        0.34,
        15,
        T.ink,
      );
      tx(
        d.output,
        cols[1].x + 0.17,
        y + 0.17,
        cols[1].w - 0.34,
        0.66,
        18,
        T.ink,
        true,
      );
      tx(
        d.record,
        cols[2].x + 0.17,
        y + 0.17,
        cols[2].w - 0.34,
        0.66,
        17,
        T.ink,
      );
      elements.at(-1)!.demonstrationId = String(i + 1);
    }
  } else return false;
  legend(v.legend);
  region();
  elements.at(-1)!.municipalVisualKind = v.kind;
  return true;
}
