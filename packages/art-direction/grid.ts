import type { ElkNode } from "elkjs/lib/elk-api.js";
import ELK from "elkjs/lib/elk.bundled.js";
import type { BoxData } from "./schema.js";

export interface GridConfig {
  slideW: number;
  marginX: number;
  topY: number;
  bottomY: number;
  columns: number;
  gutterX: number;
  gutterY: number;
}

export const defaultGrid: GridConfig = {
  slideW: 13.333333,
  marginX: 0.64,
  topY: 0.68,
  bottomY: 6.62,
  columns: 12,
  gutterX: 0.24,
  gutterY: 0.18,
};

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Maps 1-based column spans (e.g. 1..7 of 12) into an exact slide BoxData. */
export function colBox(
  startCol: number,
  endCol: number,
  y: number,
  h: number,
  config: Partial<GridConfig> = {},
): BoxData {
  const g = { ...defaultGrid, ...config };
  if (
    !Number.isInteger(startCol) ||
    !Number.isInteger(endCol) ||
    startCol < 1 ||
    endCol < startCol ||
    endCol > g.columns
  )
    throw Error(`Invalid column span ${startCol}..${endCol} for ${g.columns}-column grid`);
  if (y < g.topY - 0.031 || y + h > g.bottomY + 0.031 || h <= 0)
    throw Error(`Vertical span y=${y}, h=${h} exceeds safe zone ${g.topY}..${g.bottomY}`);
  const usableW = g.slideW - g.marginX * 2;
  const colW = (usableW - g.gutterX * (g.columns - 1)) / g.columns;
  const span = endCol - startCol + 1;
  const x = g.marginX + (startCol - 1) * (colW + g.gutterX);
  const w = span * colW + (span - 1) * g.gutterX;
  return { x: round(x), y: round(y), w: round(w), h: round(h) };
}

/** Splits a parent Box horizontally by positive weight ratios with an explicit gutter. */
export function splitColumns(
  parent: BoxData,
  ratios: number[],
  gap = defaultGrid.gutterX,
): BoxData[] {
  if (!ratios.length || ratios.some((r) => r <= 0 || !Number.isFinite(r)))
    throw Error("splitColumns requires positive finite ratios");
  const totalGap = gap * (ratios.length - 1);
  const available = parent.w - totalGap;
  if (available <= 0.1 * ratios.length)
    throw Error("Parent box is too narrow for requested column split and gap");
  const sum = ratios.reduce((a, b) => a + b, 0);
  let cursor = parent.x;
  return ratios.map((r, i) => {
    const w = i === ratios.length - 1 ? parent.x + parent.w - cursor : (available * r) / sum;
    const box = { x: round(cursor), y: parent.y, w: round(w), h: parent.h };
    cursor += w + gap;
    return box;
  });
}

/** Splits a parent Box vertically by positive weight ratios with an explicit gutter. */
export function splitRows(
  parent: BoxData,
  ratios: number[],
  gap = defaultGrid.gutterY,
): BoxData[] {
  if (!ratios.length || ratios.some((r) => r <= 0 || !Number.isFinite(r)))
    throw Error("splitRows requires positive finite ratios");
  const totalGap = gap * (ratios.length - 1);
  const available = parent.h - totalGap;
  if (available <= 0.1 * ratios.length)
    throw Error("Parent box is too short for requested row split and gap");
  const sum = ratios.reduce((a, b) => a + b, 0);
  let cursor = parent.y;
  return ratios.map((r, i) => {
    const h = i === ratios.length - 1 ? parent.y + parent.h - cursor : (available * r) / sum;
    const box = { x: parent.x, y: round(cursor), w: parent.w, h: round(h) };
    cursor += h + gap;
    return box;
  });
}

/**
 * Computes deterministic, non-overlapping nodeBoxes, edgeLabelBoxes, and orthogonal
 * edgeRoutes within a target visualBox using ELK, ready to lock into CompositionBrief.
 */
export async function computeGraphBoxes(
  visualBox: BoxData,
  nodes: { id: string; label?: string; detail?: string }[],
  edges: { from: string; to: string; label?: string }[],
  options: {
    direction?: "RIGHT" | "DOWN";
    nodeWidth?: number;
    nodeHeight?: number;
  } = {},
): Promise<{
  nodeBoxes: Record<string, BoxData>;
  edgeLabelBoxes: Record<string, BoxData>;
  edgeRoutes: Record<string, { waypoints: [number, number][] }>;
}> {
  const dir = options.direction ?? "RIGHT";
  const baseW = (options.nodeWidth ?? 2.6) * 100;
  const baseH = (options.nodeHeight ?? 1.45) * 100;
  const graph = await new ELK().layout<ElkNode>({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": dir,
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.spacing.nodeNode": "56",
      "elk.layered.spacing.nodeNodeBetweenLayers": "88",
      "elk.padding": "[top=16,left=16,bottom=16,right=16]",
    },
    children: nodes.map((n) => ({ id: n.id, width: baseW, height: baseH })),
    edges: edges.map((e, i) => ({
      id: `${e.from}:${e.to}:${i}`,
      sources: [e.from],
      targets: [e.to],
    })),
  });

  const gw = Math.max(1, graph.width || 1);
  const gh = Math.max(1, graph.height || 1);
  const pad = 0.08;
  const innerW = Math.max(0.5, visualBox.w - pad * 2);
  const innerH = Math.max(0.5, visualBox.h - pad * 2);
  const scaleX = innerW / gw;
  const scaleY = innerH / gh;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = visualBox.x + pad + (innerW - gw * scale) / 2;
  const offsetY = visualBox.y + pad + (innerH - gh * scale) / 2;

  const nodeBoxes: Record<string, BoxData> = {};
  for (const child of graph.children || []) {
    nodeBoxes[child.id] = {
      x: round(offsetX + (child.x || 0) * scale),
      y: round(offsetY + (child.y || 0) * scale),
      w: round((child.width || baseW) * scale),
      h: round((child.height || baseH) * scale),
    };
  }

  const edgeRoutes: Record<string, { waypoints: [number, number][] }> = {};
  const edgeLabelBoxes: Record<string, BoxData> = {};

  for (const [i, edge] of edges.entries()) {
    const key = `${edge.from}:${edge.to}`;
    const elkEdge = (graph.edges || [])[i];
    const pts = (elkEdge?.sections || [])
      .flatMap((s) => [s.startPoint, ...(s.bendPoints || []), s.endPoint])
      .map(
        (p): [number, number] => [
          round(offsetX + p.x * scale),
          round(offsetY + p.y * scale),
        ],
      );
    if (pts.length >= 2) {
      edgeRoutes[key] = { waypoints: pts };
    }
    if (edge.label) {
      const a = nodeBoxes[edge.from];
      const z = nodeBoxes[edge.to];
      const lw = Math.min(1.6, Math.max(0.9, visualBox.w * 0.14));
      const lh = 0.34;
      const midX = a && z ? (a.x + a.w / 2 + z.x + z.w / 2) / 2 : visualBox.x + visualBox.w / 2;
      const midY = a && z ? Math.min(a.y, z.y) - lh - 0.06 : visualBox.y + 0.04;
      const clampedX = Math.max(visualBox.x + 0.04, Math.min(visualBox.x + visualBox.w - lw - 0.04, midX - lw / 2));
      const clampedY = Math.max(visualBox.y + 0.04, Math.min(visualBox.y + visualBox.h - lh - 0.04, midY));
      edgeLabelBoxes[key] = {
        x: round(clampedX),
        y: round(clampedY),
        w: round(lw),
        h: round(lh),
      };
    }
  }

  return { nodeBoxes, edgeLabelBoxes, edgeRoutes };
}
