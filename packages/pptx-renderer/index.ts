import { emphasisRuns, toPptxRuns } from "./typography.js";
import pptxgen from "pptxgenjs";
import { coverFit } from "./image-fit.js";
import { renderSemantic } from "./semantic.js";
import { renderAuthoredComposition } from "./authored-composition.js";
import { resolveTokens } from "../art-direction/tokens.js";
import { directionAudit } from "../art-direction/index.js";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import type { ProjectData, SlideData } from "../core/schema.js";
export interface Element {
  chartFocusSeries?: string;
  mapLabelId?: string;
  compositionPart?: "title" | "message" | "visual" | "caption";
  compositionNodeId?: string;
  compositionEdge?: { from: string; to: string; bidirectional: boolean };
  slideId: string;
  id: string;
  kind: "text" | "shape" | "image" | "chart" | "diagram" | "icon";
  dataRef?: string;
  deliveryVisualKind?: string;
  productVisualKind?: string;
  municipalVisualKind?: string;
  positioningVisualKind?: string;
  emphasisRole?: "primary-background" | "primary-message";
  textRuns?: { text: string; options: { bold?: boolean; color?: string } }[];
  geographicAssetId?: string;
  causalChainIds?: string[];
  vectorAsset?: { library: string; name: string; license: string };
  visualRole?: "explanation";
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  fontSize?: number;
  fontFace?: string;
  align?: string;
  bold?: boolean;
  color?: string;
  shapeType?: string;
  intentionalOverlay?: boolean;
  comparisonCriterion?: string;
  displayObjectId?: string;
  fieldSafetyIndicator?: boolean;
  semanticConnector?: boolean;
  collaborationEdge?: {from:string;to:string;bidirectional:boolean};
  demonstrationId?: string;
  timelineRange?: {nodeId:string;start:number;length:number};
  image?: {
    path: string;
    width: number;
    height: number;
    dpi: number;
    fit?: "cover";
    crop?: { left: number; right: number; top: number; bottom: number };
  };
}
export function estimatedHeight(text: string, w: number, pt: number) {
  const width = w * 72;
  let lines = 0;
  for (const line of text.split("\n")) {
    let lineWidth = 0;
    for (const c of line)
      lineWidth += pt * (/[\u3000-\uFFFF]/.test(c) ? 1 : 0.55);
    lines += Math.max(1, Math.ceil(lineWidth / width));
  }
  return (lines * pt * 1.22) / 72;
}
export async function render(p: ProjectData, file: string, only?: string) {
  const directionIssues = directionAudit(p);
  if (directionIssues.length) throw Error(`Art direction blocked: ${directionIssues.map(i => i.code).join(", ")}`);
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = p.proposer?.legalName || "Proposal Studio";
  pptx.subject = p.title;
  pptx.title = p.title;
  pptx.company = p.proposer?.legalName || "Proposal Studio";
  pptx.theme = { headFontFace: p.design.font, bodyFontFace: p.design.font };
  const elements: Element[] = [];
  const c = p.designDirection ? { ...p.design.colors, ...resolveTokens(p) } : p.design.colors;
  const W = 13.333333,
    H = 7.5;
  const slides = only ? p.slides.filter((s) => s.id === only) : p.slides;
  if (!slides.length) throw Error("No slides to render");
  for (const [i, spec] of slides.entries()) {
    const slide = pptx.addSlide();
    let count = 0;
    const dark = spec.layout === "hero" || spec.layout === "closing";
    slide.background = { color: dark ? c.dark : c.paper };
    const ink = dark ? "FFFFFF" : c.ink;
    const muted = dark ? "B9CFD1" : c.muted;
    const text = (
      value: string,
      x: number,
      y: number,
      w: number,
      h: number,
      size = 19,
      color = ink,
      bold = false,
      extra: Record<string, any> = {},
    ) => {
      value = value.replace(/AI 생성\s*/g, "");
      const guide = spec.reasoning?.visualPlan?.readingGuide;
      const accent = p.designDirection ? resolveTokens(p).accent :
        guide?.tone === "amber"
          ? "875216"
          : guide?.tone === "blue"
            ? "24558C"
            : "076875";
      const phrases =
        guide && size >= 13 && y >= 0.7 && y < 6.5
          ? [guide.keyPhrase, ...guide.focusPhrases]
          : [];
      const { emphasisAccent, ...pptExtra } = extra;
      const runs = emphasisRuns(value, phrases, color, accent, emphasisAccent);
      slide.addText(
        runs.some((r) => r.options.bold) ? toPptxRuns(runs) : value,
        {
          x,
          y,
          w,
          h,
          fontFace: p.design.font,
          fontSize: size,
          color,
          bold,
          margin: 0,
          breakLine: false,
          paraSpaceAfter: 0,
          valign: "top",
          ...pptExtra,
        },
      );
      elements.push({
        slideId: spec.id,
        id: `e${++count}`,
        kind: "text",
        x,
        y,
        w,
        h,
        text: value,
        fontSize: size,
        fontFace: p.design.font,
        align: extra.align || "left",
        bold,
        color,
        ...(runs.some((r) => r.options.bold) ? { textRuns: runs } : {}),
      });
    };
    const rect = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: string,
      line = color,
      overlay = false,
    ) => {
      slide.addShape(pptx.ShapeType.rect, {
        x,
        y,
        w,
        h,
        fill: { color },
        line: { color: line, width: 0.6 },
      });
      elements.push({
        slideId: spec.id,
        id: `e${++count}`,
        kind: "shape",
        x,
        y,
        w,
        h,
        intentionalOverlay: overlay,
      });
    };
    const line = (x: number, y: number, w: number, color = c.accent) =>
      rect(x, y, w, 0.025, color, color, true);
    const arrow = (x: number, y: number, w: number) => {
      slide.addShape(pptx.ShapeType.chevron, {
        x,
        y,
        w,
        h: 0.22,
        line: { color: c.accent },
        fill: { color: c.accent },
      });
      elements.push({
        slideId: spec.id,
        id: `e${++count}`,
        kind: "shape",
        x,
        y,
        w,
        h: 0.22,
      });
    };
    const image = async (x: number, y: number, w: number, h: number) => {
      if (!spec.image) return false;
      const file = path.resolve(spec.image.path);
      const meta = await sharp(file).metadata();
      if (!meta.width || !meta.height) throw Error("Image dimensions missing");
      const fitted = coverFit(meta.width, meta.height, w, h);
      slide.addImage({
        path: file,
        x,
        y,
        w: fitted.w,
        h: fitted.h,
        sizing: fitted.sizing,
      });
      elements.push({
        slideId: spec.id,
        id: `e${++count}`,
        kind: "image",
        x,
        y,
        w,
        h,
        image: {
          path: spec.image.path,
          width: meta.width,
          height: meta.height,
          dpi: meta.width / fitted.w,
          fit: "cover",
          crop: fitted.crop,
        },
      });
      return true;
    };
    const title = () => {
      text(spec.title, 0.64, 0.64, 12.05, 1.1, p.design.titleSize, ink, true);
      line(0.65, 1.96, 0.7);
      text(spec.message, 0.65, 2.17, 12.0, 0.85, 20, muted);
    };
    const items = spec.items;
    const context = {
      p,
      spec,
      slide,
      pptx,
      elements,
      text,
      rect,
      image,
    };
    const semantic = await renderAuthoredComposition(context) || await renderSemantic(context);
    if (!semantic)
      switch (spec.layout) {
        case "hero":
          if (spec.image) {
            await image(7.05, 0, 6.28, 6.95);
            rect(7.05, 6.95, 6.28, 0.55, c.dark);
            text(spec.image.caption, 7.3, 7.08, 5.7, 0.25, 9, "B9CFD1");
          }
          text(
            p.proposalType.toUpperCase(),
            0.65,
            0.6,
            6,
            0.35,
            11,
            "7BD3CA",
            true,
          );
          line(0.65, 1.35, 0.75, "7BD3CA");
          text(
            spec.title,
            0.65,
            1.75,
            spec.image ? 6.05 : 11.8,
            2.15,
            38,
            ink,
            true,
          );
          text(
            spec.message,
            0.65,
            4.32,
            spec.image ? 5.9 : 11.8,
            1.15,
            21,
            "D5E2E0",
          );
          if (items.length)
            text(
              items.map((t) => t.label).join("  /  "),
              0.65,
              6.05,
              6,
              0.48,
              14,
              "B9CFD1",
            );
          break;
        case "scenario": {
          title();
          const x = 0.65,
            y = 3.35;
          rect(x, y, 7.3, 2.7, "E0E8E3");
          rect(x, y + 0.9, 7.3, 0.8, "D0D8D4");
          line(x + 0.15, y + 1.3, 7.0, "FFFFFF");
          text(
            items[0]?.label || "동선 A",
            x + 0.2,
            y + 0.15,
            6.7,
            0.4,
            18,
            c.ink,
            true,
          );
          text(
            items[1]?.label || "동선 B",
            x + 0.2,
            y + 2.0,
            6.7,
            0.4,
            18,
            c.ink,
            true,
          );
          rect(x + 3.2, y + 0.8, 1.35, 1.0, "EDBE68");
          text("접점", x + 3.4, y + 1.1, 1, 0.3, 16, c.ink, true);
          arrow(x + 1.1, y + 1.15, 1.2);
          slide.addShape(pptx.ShapeType.downArrow, {
            x: x + 3.65,
            y: y + 0.05,
            w: 0.4,
            h: 0.7,
            line: { color: c.accent },
            fill: { color: c.accent },
          });
          items.slice(0, 3).forEach((item, j) => {
            text(
              item.label,
              8.6,
              3.35 + j * 1.0,
              4.0,
              0.35,
              19,
              c.accent,
              true,
            );
            text(item.detail, 8.6, 3.77 + j * 1.0, 4.0, 0.55, 16, c.ink);
          });
          break;
        }
        case "architecture": {
          title();
          const n = Math.min(items.length, 4);
          const cell = 11.8 / Math.max(n, 1);
          items.slice(0, 4).forEach((item, j) => {
            const x = 0.65 + j * cell;
            rect(x, 3.55, cell - 0.4, 0.07, c.accent);
            text(`0${j + 1}`, x, 3.07, cell - 0.5, 0.35, 13, c.muted);
            text(item.label, x, 3.92, cell - 0.5, 0.7, 23, c.ink, true);
            text(item.detail, x, 4.85, cell - 0.55, 1.1, 18, c.muted);
            if (j < n - 1) arrow(x + cell - 0.35, 4.17, 0.3);
          });
          line(0.65, 6.27, 11.8);
          text(
            "현장 운영 조건과 검증 항목은 도입 전 확정",
            0.65,
            6.43,
            11.8,
            0.35,
            15,
            c.muted,
          );
          break;
        }
        case "process":
        case "timeline": {
          title();
          const n = Math.min(items.length, 5);
          const cell = 12 / Math.max(n, 1);
          items.slice(0, 5).forEach((item, j) => {
            const x = 0.65 + j * cell;
            rect(x, 3.65, cell - 0.25, 0.035, c.accent);
            text(
              String(j + 1).padStart(2, "0"),
              x,
              3.0,
              cell - 0.3,
              0.5,
              30,
              c.accent,
              true,
            );
            text(item.label, x, 4.03, cell - 0.3, 0.55, 22, c.ink, true);
            text(item.detail, x, 4.92, cell - 0.35, 1.0, 17, c.muted);
            if (j < n - 1) arrow(x + cell - 0.29, 3.55, 0.2);
          });
          break;
        }
        case "kpi":
        case "market":
        case "budget": {
          title();
          if (spec.chart) {
            slide.addChart(
              pptx.ChartType.bar,
              [
                {
                  name: spec.chart.unit,
                  labels: spec.chart.labels,
                  values: spec.chart.values,
                },
              ],
              {
                x: 0.65,
                y: 3.3,
                w: 11.9,
                h: 3.2,
                catAxisLabelFontFace: p.design.font,
                catAxisLabelFontSize: 15,
                valAxisLabelFontSize: 12,
                showLegend: false,
                showValue: true,
                showTitle: false,
                chartColors: [c.accent],
              },
            );
            elements.push({
              slideId: spec.id,
              id: `e${++count}`,
              kind: "chart",
              x: 0.65,
              y: 3.3,
              w: 11.9,
              h: 3.2,
            });
          } else
            items.slice(0, 4).forEach((item, j) => {
              let x = 0.65 + j * 3;
              text(item.label, x, 3.6, 2.7, 1.0, 31, c.accent, true);
              text(item.detail, x, 5, 2.7, 1.1, 18, c.muted);
            });
          break;
        }
        case "comparison":
        case "before-after":
        case "problem-solution": {
          title();
          items.slice(0, 2).forEach((item, j) => {
            const x = 0.65 + j * 6.15;
            line(x, 3.45, 5.5);
            text(
              item.label,
              x,
              3.85,
              5.5,
              0.75,
              27,
              j ? c.accent : c.ink,
              true,
            );
            text(item.detail, x, 5.0, 5.5, 1.1, 20, c.muted);
          });
          break;
        }
        case "full-bleed":
          if (!spec.image)
            throw Error(`Slide ${spec.id}: full-bleed requires image`);
          await image(0, 0, W, H);
          rect(0, 0, 6.6, H, c.dark);
          text(spec.title, 0.65, 1.15, 5.4, 2.0, 34, "FFFFFF", true);
          text(spec.message, 0.65, 4, 5.4, 1.4, 21, "FFFFFF");
          text(spec.image.caption, 7, 6.68, 5.6, 0.35, 12, c.dark);
          break;
        case "closing":
          text(spec.title, 0.65, 1.25, 11.8, 1.7, 38, "FFFFFF", true);
          line(0.65, 3.45, 1.2, "7BD3CA");
          text(spec.message, 0.65, 3.85, 11.8, 1.0, 24, "D5E2E0");
          items
            .slice(0, 3)
            .forEach((it, j) =>
              text(it.label, 0.65, 5.3 + j * 0.45, 11.8, 0.35, 18, "D5E2E0"),
            );
          break;
        default:
          title();
          items.slice(0, 3).forEach((item, j) => {
            const y = 3.35 + j * 0.98;
            text(
              String(j + 1).padStart(2, "0"),
              0.65,
              y,
              0.55,
              0.4,
              15,
              c.accent,
              true,
            );
            text(item.label, 1.5, y, 3.1, 0.65, 21, c.ink, true);
            text(item.detail, 5.0, y, 7.55, 0.72, 18, c.muted);
            if (j < items.length - 1) line(1.5, y + 0.83, 11.0, "D7DFD9");
          });
      }
    if (p.proposer && spec.layout !== "hero")
      text(p.proposer.legalName, 10.4, 0.32, 2.25, 0.26, 10, c.muted, true, {
        align: "right",
      });
    const foot = spec.reasoning?.visualPlan?.encoding.startsWith("safehome")
      ? "출처: 제공 제품·사업 전략 기획서 v1.1 (2026.10.01) · 세부 기능과 조건은 발표자 노트 참조"
      : spec.footnote ||
      "사용자 제공 자료 기반 · 사실·가정 구분은 근거 원장 참조";
    if (!spec.reasoning?.visualPlan?.encoding.startsWith("safesurface:"))
      text(foot, 0.65, 6.99, spec.layout === "hero" ? 6.0 : 11.2, 0.32, 9, muted);
    if (spec.layout !== "hero")
      text(String(i + 1).padStart(2, "0"), 12.2, 6.98, 0.4, 0.3, 10, muted);
    slide.addNotes(
      [
        `Main message: ${spec.message}`,
        ...(p.designDirection ? [`Design direction: ${JSON.stringify(p.designDirection)}`] : []),
        ...(spec.compositionBrief ? [`Authored composition: ${JSON.stringify(spec.compositionBrief)}`] : []),
        spec.reasoning?.visualPlan
          ? `Visual composition: ${JSON.stringify(spec.reasoning.visualPlan)}`
          : "",
        spec.reasoning?.sectionId
          ? `Full business content: ${JSON.stringify(p.businessCase?.sections.find((s) => s.id === spec.reasoning?.sectionId))}`
          : "",

        `Claim IDs: ${spec.claimIds.join(", ")}`,
        spec.reasoning
          ? `Audience question: ${spec.reasoning.question}\nVisual purpose: ${spec.reasoning.visualPurpose}\nLimitation: ${spec.reasoning.limitation}\nPlanning references: ${spec.reasoning.planningRefs.join(", ")}`
          : "Unstructured draft",
        ...spec.claimIds.flatMap((id) => {
          const cl = p.claims.find((c) => c.id === id);
          return cl
            ? [
                `${cl.id}: ${cl.text} [${cl.status}]`,
                ...cl.sourceIds.map((sid) => {
                  const src = p.sources.find((s) => s.id === sid);
                  return `${sid}: ${src?.title} ${src?.url || src?.materialId || ""}; rechecked: ${src?.checkedAt || "no"}`;
                }),
              ]
            : [];
        }),
        spec.image
          ? `Image rights: ${spec.image.rights}; ${spec.image.caption}`
          : "No image",
      ].join("\n"),
    );
  }
  await fs.mkdir(path.dirname(file), { recursive: true });
  await pptx.writeFile({ fileName: file });
  return {
    elements,
    slideIds: slides.map((s) => s.id),
    renderer: "PptxGenJS 4",
    canvas: { w: W, h: H },
  };
}
