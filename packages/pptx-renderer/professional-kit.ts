import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import type { ElkNode } from "elkjs/lib/elk-api.js";
import ELK from "elkjs/lib/elk.bundled.js";
import { estimatedHeight } from "./index.js";
import type { DrawingContext } from "./semantic.js";
const require = createRequire(import.meta.url);
const iconRoot = path.join(
  path.dirname(require.resolve("lucide-static/package.json")),
  "icons",
);
const svgCache = new Map<string, string>();
export { legacyTokens as T, resolveTokens } from "../art-direction/tokens.js";
import { resolveTokens } from "../art-direction/tokens.js";
export const iconNames: Record<string, string> = {
  city: "building-2",
  gate: "traffic-cone",
  person: "footprints",
  camera: "cctv",
  server: "cpu",
  bell: "bell-ring",
  clipboard: "clipboard-check",
  shield: "shield-check",
  clock: "timer",
  team: "users-round",
  route: "route",
  document: "file-text",
};
export function professionalKit(ctx: DrawingContext) {
  const T = resolveTokens(ctx.p);
  const { slide, pptx, elements, spec, text } = ctx;
  let seq = 0;
  const shape = (
    kind: string,
    x: number,
    y: number,
    w: number,
    h: number,
    fill = T.white,
    stroke = T.line,
    extra: any = {},
  ) => {
    const id = `pro-${++seq}`;
    slide.addShape(kind, {
      x,
      y,
      w: Math.max(w, 0.001),
      h: Math.max(h, 0.001),
      rectRadius: 0.09,
      fill: { color: fill },
      line: { color: stroke, width: 0.8 },
      ...extra,
    });
    elements.push({
      slideId: spec.id,
      id,
      kind: "shape",
      shapeType: kind,
      x,
      y,
      w: Math.max(w, 0.001),
      h: Math.max(h, 0.001),
      intentionalOverlay: true,
    });
    return id;
  };
  const panel = (
    x: number,
    y: number,
    w: number,
    h: number,
    fill = T.white,
    stroke = T.line,
  ) =>
    shape(pptx.ShapeType.roundRect, x, y, w, h, fill, stroke, { radius: 0.12 });
  const line = (
    a: number,
    b: number,
    c: number,
    d: number,
    color = T.accent,
    arrow = false,
    dash = false,
  ) => {
    const forward = c > a || (Math.abs(c - a) < 0.001 && d >= b);
    shape(
      pptx.ShapeType.line,
      Math.min(a, c),
      Math.min(b, d),
      Math.abs(c - a),
      Math.abs(d - b),
      color,
      color,
      {
        flipV: (c - a) * (d - b) < 0,
        line: {
          color,
          width: 1.35,
          ...(arrow
            ? { [forward ? "endArrowType" : "beginArrowType"]: "arrow" }
            : {}),
          ...(dash ? { dashType: "dash" } : {}),
        },
      },
    );
    if (arrow) elements.at(-1)!.semanticConnector = true;
  };
  const route = (pts: number[][], color = T.accent, dash = false) =>
    pts
      .slice(1)
      .forEach((p, i) =>
        line(
          pts[i][0],
          pts[i][1],
          p[0],
          p[1],
          color,
          i === pts.length - 2,
          dash,
        ),
      );
  const icon = async (
    name: string,
    x: number,
    y: number,
    size = 0.4,
    color = T.accent,
  ) => {
    const file = iconNames[name] || name;
    const key = `${file}-${color}`;
    let data = svgCache.get(key);
    if (!data) {
      const raw = await fs.readFile(path.join(iconRoot, `${file}.svg`), "utf8");
      data =
        "image/svg+xml;base64," +
        Buffer.from(
          raw
            .replace(/currentColor/g, `#${color}`)
            .replace('width="24"', 'width="256"')
            .replace('height="24"', 'height="256"'),
        ).toString("base64");
      svgCache.set(key, data);
    }
    slide.addImage({ data, x, y, w: size, h: size });
    elements.push({
      slideId: spec.id,
      id: `icon-${++seq}`,
      kind: "icon",
      x,
      y,
      w: size,
      h: size,
      vectorAsset: { library: "Lucide", name: file, license: "ISC" },
    });
  };
  const iconLabel = async(name:string,label:string,x:number,y:number,w:number,h=.5,fontSize=20,color=T.ink) => {
    const size=Math.min(.36,h-.08);
    await icon(name,x,y+(h-size)/2,size,color);
    text(label,x+size+.18,y,w-size-.18,h,fontSize,color,true,{align:"left",valign:"mid"});
  };
  const tx = (
    s: string,
    x: number,
    y: number,
    w: number,
    h = 0.4,
    size = 17,
    color = T.ink,
    bold = false,
    extra: any = {},
  ) => {
    // Enlarge supporting body labels only where the authored box actually fits.
    const readable =
      spec.reasoning?.visualPlan?.readingGuide &&
      y >= 2.64 &&
      y + h <= 6.46 &&
      size >= 13 &&
      size < 16 &&
      estimatedHeight(s, w, 16) <= h
        ? 16
        : size;
    text(s, x, y, w, h, readable, color, bold, { align: "left", ...extra });
  };
  const messageBand = (
    x: number,
    y: number,
    w: number,
    h: number,
    size = 21,
    dark = false,
  ) => {
    const g = spec.reasoning?.visualPlan?.readingGuide;
    if (!g) return false;
    const fill = ctx.p.designDirection ? (dark ? T.ink : g.tone === "blue" ? T.blueTint : T.tealTint) : dark
      ? "24485E"
      : g.tone === "amber"
        ? "F6ECD9"
        : g.tone === "blue"
          ? "E3EDF8"
          : "DFEFEE";
    shape(pptx.ShapeType.roundRect, x, y, w, h, fill, fill, { radius: 0.12 });
    elements.at(-1)!.emphasisRole = "primary-background";
    tx(
      g.message,
      x + 0.22,
      y,
      w - 0.44,
      h,
      size,
      dark ? T.white : T.ink,
      true,
      { valign: "mid", emphasisAccent: dark ? "F3D48C" : undefined },
    );
    elements.at(-1)!.emphasisRole = "primary-message";
    return true;
  };
  const pill = (
    s: string,
    x: number,
    y: number,
    w: number,
    color = T.accent,
  ) => {
    panel(x, y, w, 0.33, color, color);
    tx(s, x + 0.1, y, w - 0.2, 0.33, 11, T.white, true, {
      valign: "mid",
      align: "center",
    });
  };
  const node = async (
    n: { label: string; detail: string; icon: string },
    x: number,
    y: number,
    w: number,
    h = 1.48,
    color = T.accent,
  ) => {
    panel(x, y, w, h, T.white, T.line);
    await icon(n.icon, x + 0.19, y + 0.19, 0.38, color);
    tx(n.label, x + 0.72, y + 0.2, w - 0.91, 0.45, 18, T.ink, true);
    tx(n.detail, x + 0.2, y + 0.82, w - 0.4, h - 0.91, 14, T.muted);
  };
  const header = (kicker: string, takeaway: string) => {
    tx(kicker.toUpperCase(), 0.64, 0.32, 9.0, 0.24, 10, T.accent, true);
    tx(spec.title, 0.64, 0.78, 12.05, 0.7, ctx.p.designDirection ? ctx.p.design.titleSize : 32, T.ink, true);
    line(0.64, 1.57, 1.24, 1.57, T.accent);
    if (!messageBand(0.64, 1.78, 12.04, 0.7))
      tx(takeaway, 0.64, 1.83, 12, 0.52, 17, T.muted);
  };
  const legend = (s: string) => tx(s, 0.64, 6.62, 12, 0.31, 10.5, T.muted);
  const region = (x = 0.64, y = 2.64, w = 12.04, h = 3.82) =>
    elements.push({
      slideId: spec.id,
      id: "professional-composition",
      kind: "diagram",
      visualRole: "explanation",
      x,
      y,
      w,
      h,
    });
  return {
    shape,
    panel,
    line,
    route,
    icon,
    iconLabel,
    tx,
    pill,
    node,
    header,
    messageBand,
    legend,
    region,
  };
}
/** ELK derives node positions and orthogonal bound routes; it does not infer business relationships. */
export async function layoutGraph(
  nodes: { id: string }[],
  edges: { from: string; to: string }[],
  width = 12,
  height = 3.6,
) {
  const graph = await new ELK().layout<ElkNode>({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.spacing.nodeNode": "48",
      "elk.layered.spacing.nodeNodeBetweenLayers": "72",
      "elk.padding": "[top=8,left=8,bottom=8,right=8]",
    },
    children: nodes.map((n) => ({ id: n.id, width: 280, height: 156 })),
    edges: edges.map((e, i) => ({
      id: `e${i}`,
      sources: [e.from],
      targets: [e.to],
    })),
  });
  const scale = Math.min(
    width / (graph.width || 1),
    height / (graph.height || 1),
  );
  return {
    nodes: (graph.children || []).map((n) => ({
      id: n.id,
      x: (n.x || 0) * scale,
      y: (n.y || 0) * scale,
      w: n.width! * scale,
      h: n.height! * scale,
    })),
    edges: (graph.edges || []).map((e) => ({
      source: e.sources[0],
      target: e.targets[0],
      points: (e.sections || [])
        .flatMap((s) => [s.startPoint, ...(s.bendPoints || []), s.endPoint])
        .map((p) => [p.x * scale, p.y * scale]),
    })),
    height: (graph.height || 1) * scale,
  };
}
