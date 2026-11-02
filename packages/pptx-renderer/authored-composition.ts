import sharp from "sharp";
import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";
import { facingPorts } from "./connector-anchors.js";
import { geographicViewport } from "../visual-assets/geography.js";
import { estimatedHeight } from "./index.js";
import type { BoxData } from "../art-direction/schema.js";

/** Reusable semantic drawing primitives in authored zones, independent of case names. */
export async function renderAuthoredComposition(ctx: DrawingContext) {
  const { p, spec, slide, pptx, elements } = ctx;
  const b = spec.compositionBrief;
  if (!b) return false;
  const v = spec.reasoning?.visualPlan;
  if (!v || !p.designDirection)
    throw Error(
      `Authored composition needs design direction and visual plan: ${spec.id}`,
    );
  const T = resolveTokens(p);
  const kit = professionalKit(ctx);
  const { panel, line, shape, icon } = kit;
  const editorial = b.nodeTreatment === "document";
  const tx = b.typography ? ctx.text : kit.tx;
  const type = {
    title: b.typography?.titleSize ?? p.design.titleSize,
    message: b.typography?.messageSize ?? 21,
    node: b.typography?.nodeTitleSize ?? p.design.bodySize,
    body: b.typography?.bodySize ?? 16,
    caption: b.typography?.captionSize ?? 14,
  };
  // Open document blocks keep the icon on the heading baseline and reserve
  // an explicit inset for the detail, rather than nesting several headers.
  const documentNode = async (n: { id?: string; label: string; detail: string; icon?: string }, box: BoxData) => {
    panel(box.x, box.y, box.w, box.h, T.white, T.line);
    if (n.id) elements.at(-1)!.compositionNodeId = n.id;
    const headingH = Math.max(0.34, estimatedHeight(n.label, box.w - 0.9, type.node));
    await kit.iconLabel(n.icon || "document", n.label, box.x + 0.18, box.y + 0.14,
      box.w - 0.36, headingH, type.node, T.ink);
    line(box.x + 0.18, box.y + headingH + 0.20, box.x + box.w - 0.18,
      box.y + headingH + 0.20, T.line);
    tx(n.detail, box.x + 0.18, box.y + headingH + 0.27, box.w - 0.36,
      Math.max(0.4, box.h - headingH - 0.33), type.body, T.ink, false,
      { valign: "top", margin: 0, breakLine: false });
  };
  slide.background = { color: T.paper };
  const mark = (part: "title" | "message" | "visual" | "caption") => {
    elements.at(-1)!.compositionPart = part;
  };

  // Left accent bar beside slide title for consistent vertical anchor
  if (b.title.x >= 0.56) {
    shape(
      pptx.ShapeType.roundRect,
      b.title.x - 0.14,
      b.title.y + 0.08,
      0.07,
      Math.max(0.3, b.title.h - 0.16),
      T.accent,
      T.accent,
      { rectRadius: 0.04 },
    );
  }
  tx(
    spec.title,
    b.title.x,
    b.title.y,
    b.title.w,
    b.title.h,
    type.title,
    T.ink,
    true,
    { align: b.titleAlign, valign: "mid" },
  );
  mark("title");

  const g = v.readingGuide;
  if (!g) throw Error(`Authored message missing: ${spec.id}`);
  const m = b.message;
  panel(m.x, m.y, m.w, m.h, T.tealTint, T.accent);
  elements.at(-1)!.emphasisRole = "primary-background";
  mark("message");
  shape(
    pptx.ShapeType.roundRect,
    m.x + 0.02,
    m.y + 0.08,
    0.07,
    Math.max(0.24, m.h - 0.16),
    T.accent,
    T.accent,
    { rectRadius: 0.04 },
  );
  const hasMsgIcon =
    m.h >= 0.8 &&
    m.w >= 4.2 &&
    estimatedHeight(g.message, m.w - 0.72, type.message) <= m.h + 0.04;
  if (hasMsgIcon) {
    shape(
      pptx.ShapeType.roundRect,
      m.x + 0.16,
      m.y + (m.h - 0.36) / 2,
      0.36,
      0.36,
      T.white,
      T.accent,
      { rectRadius: 0.06 },
    );
    await icon("shield", m.x + 0.22, m.y + (m.h - 0.24) / 2, 0.24, T.accent);
  }
  tx(
    g.message,
    m.x + (hasMsgIcon ? 0.58 : 0.22),
    m.y,
    m.w - (hasMsgIcon ? 0.72 : 0.44),
    m.h,
    type.message,
    T.ink,
    true,
    {
      valign: "mid",
      emphasisAccent: T.accent,
    },
  );
  elements.at(-1)!.emphasisRole = "primary-message";

  const area = b.visualBox;
  const fitImage = async (file: string, target = area) => {
    const meta = await sharp(file).metadata();
    if (!meta.width || !meta.height) throw Error(`Invalid image: ${file}`);
    const ratio = Math.min(target.w / meta.width, target.h / meta.height);
    const box = {
      x: target.x + (target.w - meta.width * ratio) / 2,
      y: target.y + (target.h - meta.height * ratio) / 2,
      w: meta.width * ratio,
      h: meta.height * ratio,
    };
    shape(pptx.ShapeType.rect, box.x, box.y, box.w, box.h, T.white, T.line);
    slide.addImage({
      path: file,
      ...box,
      altText: `${v.takeaway}. ${v.explanation?.notProven || v.legend}`,
    });
    elements.push({
      slideId: spec.id,
      id: "authored-image",
      kind: "image",
      ...box,
      image: {
        path: file,
        width: meta.width,
        height: meta.height,
        dpi: meta.width / box.w,
      },
    });
    return box;
  };

  if (b.visual === "scene") {
    if (!v.scene) throw Error(`Missing scene: ${spec.id}`);
    const nodeVals = Object.values(b.nodeBoxes);
    const minNodeX = nodeVals.length
      ? Math.min(...nodeVals.map((nb) => nb.x))
      : area.x + area.w;
    const isSideCallout =
      nodeVals.length > 0 && minNodeX >= area.x + area.w * 0.54;
    const imgTarget = isSideCallout
      ? {
          x: area.x,
          y: area.y,
          w: Math.max(2.0, minNodeX - area.x - 0.24),
          h: area.h,
        }
      : area;
    if (isSideCallout) {
      panel(
        imgTarget.x,
        imgTarget.y,
        imgTarget.w,
        imgTarget.h,
        T.white,
        T.line,
      );
    }
    const box = await fitImage(
      v.scene.path,
      isSideCallout
        ? {
            x: imgTarget.x + 0.1,
            y: imgTarget.y + 0.1,
            w: imgTarget.w - 0.2,
            h: imgTarget.h - 0.2,
          }
        : area,
    );
    for (const [idx, annotation] of (v.scene.annotations || []).entries()) {
      const n = v.nodes.find((n) => n.id === annotation.nodeId)!;
      const label = b.nodeBoxes[n.id];
      if (!label) throw Error(`Missing annotation box: ${n.id}`);
      const px = box.x + box.w * annotation.x,
        py = box.y + box.h * annotation.y;
      if (editorial) {
        // The numbered mark identifies a location without routing a line over
        // the scene or the neighbouring explanatory blocks.
        shape(pptx.ShapeType.ellipse, px - 0.12, py - 0.12, 0.24, 0.24, T.accent, T.white);
        tx(String(idx + 1), px - 0.1, py - 0.09, 0.2, 0.18, 10, T.white, true, { align: "center" });
        await documentNode({ ...n, label: `${idx + 1}. ${n.label}` }, label);
        continue;
      }
      const port = facingPorts(
        label,
        { x: px - 0.02, y: py - 0.02, w: 0.04, h: 0.04 },
        label.x + label.w < px || label.x > px ? "horizontal" : "vertical",
      );
      line(
        port.start[0],
        port.start[1],
        port.end[0],
        port.end[1],
        T.accent,
        true,
      );
      shape(
        pptx.ShapeType.ellipse,
        px - 0.14,
        py - 0.14,
        0.28,
        0.28,
        T.accent,
        T.white,
      );
      panel(label.x, label.y, label.w, label.h, T.white, T.line);
      elements.at(-1)!.compositionNodeId = n.id;
      const richCard =
        label.h >= 0.88 &&
        !!n.detail &&
        estimatedHeight(n.detail, label.w - 0.16, type.body) <=
          label.h - 0.38 + 0.05;
      if (richCard) {
        const hdrH = 0.35;
        shape(
          pptx.ShapeType.roundRect,
          label.x + 0.02,
          label.y + 0.02,
          label.w - 0.04,
          hdrH,
          idx === 0 ? T.tealTint : T.panel,
          idx === 0 ? T.tealTint : T.panel,
          { rectRadius: 0.07 },
        );
        shape(
          pptx.ShapeType.rect,
          label.x + 0.02,
          label.y + 0.05,
          0.06,
          hdrH - 0.06,
          T.accent,
          T.accent,
        );
        shape(
          pptx.ShapeType.roundRect,
          label.x + 0.12,
          label.y + 0.05,
          0.26,
          0.26,
          T.white,
          T.accent,
          { rectRadius: 0.06 },
        );
        await icon(
          n.icon || "camera",
          label.x + 0.16,
          label.y + 0.09,
          0.18,
          T.accent,
        );
        tx(
          n.label,
          label.x + 0.44,
          label.y + 0.02,
          label.w - 0.52,
          hdrH - 0.02,
          type.node,
          T.ink,
          true,
          { valign: "mid" },
        );
        elements.at(-1)!.compositionNodeId = n.id;
        line(
          label.x + 0.1,
          label.y + hdrH + 0.02,
          label.x + label.w - 0.1,
          label.y + hdrH + 0.02,
          T.line,
        );
        tx(
          n.detail,
          label.x + 0.08,
          label.y + hdrH + 0.03,
          label.w - 0.16,
          label.h - hdrH - 0.03,
          type.body,
          T.ink,
          false,
          { valign: "mid", margin: [6, 6, 2, 2] },
        );
      } else {
        shape(
          pptx.ShapeType.rect,
          label.x + 0.02,
          label.y + 0.06,
          0.06,
          Math.max(0.2, label.h - 0.12),
          T.accent,
          T.accent,
        );
        const hasIconSpace =
          estimatedHeight(n.label, label.w - 0.5, type.body) <=
          label.h - 0.12 + 0.05;
        if (hasIconSpace) {
          await icon(
            n.icon || "camera",
            label.x + 0.14,
            label.y + (label.h - 0.22) / 2,
            0.22,
            T.accent,
          );
        }
        tx(
          n.label,
          label.x + (hasIconSpace ? 0.42 : 0.12),
          label.y + 0.06,
          label.w - (hasIconSpace ? 0.5 : 0.24),
          label.h - 0.12,
          type.body,
          T.ink,
          true,
          { valign: "mid" },
        );
        elements.at(-1)!.compositionNodeId = n.id;
      }
    }
  } else if (b.visual === "map") {
    const asset = p.geographicAssets.find((a) => a.id === v.map?.assetId);
    if (!asset || !v.map) throw Error(`Missing projected map: ${spec.id}`);
    const box = await fitImage(
      asset.path,
      b.mapLayout?.image ?? { ...area, w: area.w * 0.7 },
    );
    elements.at(-1)!.geographicAssetId = asset.id;
    const viewport = geographicViewport(asset.bounds, box.w, box.h);
    for (const [i, pin] of v.map.markers.entries()) {
      const [x, y] = viewport.point(pin.lon, pin.lat);
      shape(
        pptx.ShapeType.ellipse,
        box.x + x - 0.14,
        box.y + y - 0.14,
        0.28,
        0.28,
        T.accent,
        T.white,
      );
      tx(
        pin.id,
        box.x + x - 0.12,
        box.y + y - 0.095,
        0.24,
        0.2,
        11,
        T.white,
        true,
        { align: "center" },
      );
      const labelBox = b.mapLayout?.labels[pin.id] ?? {
        x: area.x + area.w * 0.73,
        y: area.y + 0.3 + i * 1.05,
        w: area.w * 0.27,
        h: 0.7,
      };
      panel(labelBox.x, labelBox.y, labelBox.w, labelBox.h, T.white, T.line);
      tx(
        `${pin.id} · ${pin.label}`,
        labelBox.x,
        labelBox.y,
        labelBox.w,
        labelBox.h,
        type.body,
        T.ink,
        true,
        { valign: "mid", margin: [8, 8, 4, 4] },
      );
      if (b.mapLayout) elements.at(-1)!.mapLabelId = pin.id;
    }
  } else if (b.visual === "chart") {
    const dataset = p.quantitativeDatasets.find(
      (d) => d.id === v.chart?.datasetId,
    );
    if (!dataset || !v.chart) throw Error(`Missing chart data: ${spec.id}`);
    panel(area.x, area.y, area.w, area.h, T.white, T.line);
    const categories = [...new Set(dataset.rows.map((r) => r.category))];
    const series = [...new Set(dataset.rows.map((r) => r.series))];
    const values = v.chart.stacked
      ? categories.map((c) =>
          dataset.rows
            .filter((r) => r.category === c)
            .reduce((sum, r) => sum + r.value, 0),
        )
      : dataset.rows.map((r) => r.value);
    const magnitude = Math.max(1, ...values.map(Math.abs));
    const step = 10 ** Math.floor(Math.log10(magnitude));
    slide.addChart(
      pptx.ChartType.bar,
      series.map((name) => ({
        name,
        labels: categories,
        values: categories.map(
          (category) =>
            dataset.rows.find(
              (r) => r.category === category && r.series === name,
            )!.value,
        ),
      })),
      {
        ...area,
        barDir: v.chart.orientation === "horizontal" ? "bar" : "col",
        grouping: v.chart.stacked ? "stacked" : "clustered",
        catAxisLabelFontFace: p.design.font,
        catAxisLabelFontSize: 15,
        valAxisLabelFontSize: 13,
        valAxisMinVal: Math.min(
          0,
          Math.floor(Math.min(...values) / step) * step,
        ),
        valAxisMaxVal: Math.max(
          step,
          Math.ceil(Math.max(...values) / step) * step,
        ),
        valAxisMajorUnit: step,
        chartColors: b.chartFocus
          ? series.map((name, idx) =>
              name === b.chartFocus!.series ? T.accent : editorial ? [T.blue, "AFBDC8", T.amber][idx % 3] : T.line,
            )
          : [T.accent, T.blue, T.amber, T.red],
        showLegend: true,
        legendPos: "b",
        legendFontFace: p.design.font,
        legendFontSize: 13,
        showValue: true,
        dataLabelFormatCode: "0.##",
        showTitle: false,
        showBorder: false,
        valGridLine: { color: T.line, width: 0.5 },
        catAxisLabelColor: T.ink,
        valAxisLabelColor: T.ink,
      },
    );
    elements.push({
      slideId: spec.id,
      id: "authored-chart",
      kind: "chart",
      ...area,
      dataRef: dataset.id,
      ...(b.chartFocus ? { chartFocusSeries: b.chartFocus.series } : {}),
    });
    if (b.chartFocus?.noteBox) {
      const n = b.chartFocus.noteBox;
      if (editorial) {
        panel(n.x, n.y, n.w, n.h, T.white, T.line);
        for (const [idx, node] of v.nodes.entries()) {
          const y = n.y + 0.28 + idx * 1.75;
          await icon(node.icon || "clipboard", n.x + 0.22, y, 0.28, T.accent);
          tx(node.label, n.x + 0.22, y + 0.46, n.w - 0.44, 0.7, 22, T.accent, true);
          tx(node.detail, n.x + 0.22, y + 1.16, n.w - 0.44, 0.6, type.body, T.ink);
          elements.at(-1)!.chartFocusSeries = b.chartFocus.series;
        }
      } else {
      panel(n.x, n.y, n.w, n.h, T.white, T.accent);
      shape(
        pptx.ShapeType.roundRect,
        n.x + 0.02,
        n.y + 0.02,
        n.w - 0.04,
        0.44,
        T.tealTint,
        T.tealTint,
        { rectRadius: 0.07 },
      );
      shape(
        pptx.ShapeType.rect,
        n.x + 0.02,
        n.y + 0.06,
        0.06,
        n.h - 0.12,
        T.accent,
        T.accent,
      );
      shape(
        pptx.ShapeType.roundRect,
        n.x + 0.12,
        n.y + 0.09,
        0.28,
        0.28,
        T.white,
        T.accent,
        { rectRadius: 0.06 },
      );
      await icon("clipboard", n.x + 0.17, n.y + 0.14, 0.18, T.accent);
      line(
        n.x + 0.1,
        n.y + 0.48,
        n.x + n.w - 0.1,
        n.y + 0.48,
        T.line,
      );
      const focusRows = dataset.rows.filter(
        (r) => r.series === b.chartFocus!.series,
      );
      const values = focusRows.map((r) => {
        const hasUnit = /\([^)]+\)/.test(r.category);
        return `• ${r.category}: ${r.value}${hasUnit ? "" : dataset.unit}`;
      });
      const baseSeries = series.find((s) => s !== b.chartFocus!.series);
      const compLines = baseSeries
        ? [
            "",
            `▸ 비교 기준: ${baseSeries}`,
            ...focusRows.map((r) => {
              const baseRow = dataset.rows.find(
                (br) => br.series === baseSeries && br.category === r.category,
              );
              const hasUnit = /\([^)]+\)/.test(r.category);
              const u = hasUnit ? "" : dataset.unit;
              return baseRow
                ? `• ${r.category}: ${baseRow.value}${u} → ${r.value}${u}`
                : `• ${r.category}: ${r.value}${u}`;
            }),
          ]
        : [];
      const richText = [
        `       ${b.chartFocus.series}`,
        "",
        ...values,
        ...compLines,
      ].join("\n");
      const compactText = [`       ${b.chartFocus.series}`, ...values].join(
        "\n",
      );
      const useRich =
        n.h >= 2.6 &&
        compLines.length > 0 &&
        estimatedHeight(richText, n.w - 0.24, type.body) <= n.h - 0.16;
      tx(
        useRich ? richText : compactText,
        n.x,
        n.y,
        n.w,
        n.h,
        type.body,
        T.ink,
        true,
        {
          valign: useRich ? "top" : "mid",
          margin: useRich ? [12, 10, 10, 8] : [12, 10, 6, 6],
        },
      );
      elements.at(-1)!.chartFocusSeries = b.chartFocus.series;
      }
    }
  } else if (b.visual === "graph" || b.visual === "swimlane") {
    const allowed = [
      "flow",
      "system",
      "journey",
      "context",
      "boundary",
      "swimlane",
    ];
    if (!allowed.includes(v.kind))
      throw Error(`Unsupported graph semantics: ${v.kind}`);
    if (b.visual === "swimlane") {
      if (!b.swimlaneLayout) throw Error(`Missing swimlaneLayout: ${spec.id}`);
      const laneEntries = Object.entries(b.swimlaneLayout.lanes);
      for (const [idx, [laneId, laneBox]] of laneEntries.entries()) {
        panel(
          laneBox.x,
          laneBox.y,
          laneBox.w,
          laneBox.h,
          idx % 2 === 0 ? T.panel : T.blueTint,
          T.line,
        );
        const hdrW = Math.min(
          b.swimlaneLayout.laneHeaderWidth,
          laneBox.w - 0.28,
        );
        shape(
          pptx.ShapeType.roundRect,
          laneBox.x + 0.08,
          laneBox.y + 0.1,
          hdrW,
          Math.max(0.4, laneBox.h - 0.2),
          T.white,
          idx % 2 === 0 ? T.accent : T.blue,
          { rectRadius: 0.08 },
        );
        shape(
          pptx.ShapeType.rect,
          laneBox.x + 0.08,
          laneBox.y + 0.16,
          0.06,
          Math.max(0.28, laneBox.h - 0.32),
          idx % 2 === 0 ? T.accent : T.blue,
          idx % 2 === 0 ? T.accent : T.blue,
        );
        await icon(
          idx % 2 === 0 ? "shield" : "server",
          laneBox.x + 0.22,
          laneBox.y + 0.22,
          0.26,
          idx % 2 === 0 ? T.accent : T.blue,
        );
        tx(
          laneId,
          laneBox.x + 0.2,
          laneBox.y + 0.54,
          Math.max(0.6, hdrW - 0.2),
          Math.max(0.38, laneBox.h - 0.66),
          type.body,
          idx % 2 === 0 ? T.accent : T.blue,
          true,
          { valign: "mid" },
        );
      }
    }
    const segmentIntersects = (
      s0: [number, number],
      s1: [number, number],
      box: BoxData,
    ) => {
      let lo = 0,
        hi = 1;
      for (const [origin, delta, min, max] of [
        [s0[0], s1[0] - s0[0], box.x, box.x + box.w],
        [s0[1], s1[1] - s0[1], box.y, box.y + box.h],
      ]) {
        if (Math.abs(delta) < 1e-9) {
          if (origin <= min || origin >= max) return false;
        } else {
          const p = (min - origin) / delta,
            q = (max - origin) / delta;
          lo = Math.max(lo, Math.min(p, q));
          hi = Math.min(hi, Math.max(p, q));
        }
      }
      return lo < hi;
    };
    // Draw connectors first, then nodes. Ports come from final authored bounds.
    for (const edge of v.edges) {
      const a = b.nodeBoxes[edge.from],
        z = b.nodeBoxes[edge.to];
      if (!a || !z) throw Error(`Unbound edge: ${edge.from} -> ${edge.to}`);
      const edgeKey = `${edge.from}:${edge.to}`;
      const authoredRoute = b.edgeRoutes?.[edgeKey];
      const segments: [[number, number], [number, number]][] = [];
      if (authoredRoute && authoredRoute.waypoints.length >= 2) {
        for (let idx = 0; idx < authoredRoute.waypoints.length - 1; idx++) {
          segments.push([
            authoredRoute.waypoints[idx],
            authoredRoute.waypoints[idx + 1],
          ]);
        }
      } else {
        const { start, end } = facingPorts(
          a,
          z,
          a.x + a.w <= z.x || z.x + z.w <= a.x ? "horizontal" : "vertical",
        );
        segments.push([
          [start[0], start[1]],
          [end[0], end[1]],
        ]);
      }
      for (const [segStart, segEnd] of segments) {
        if (
          Object.entries(b.nodeBoxes).some(
            ([id, box]) =>
              id !== edge.from &&
              id !== edge.to &&
              segmentIntersects(segStart, segEnd, box),
          )
        )
          throw Error(
            `Connector crosses unrelated node: ${spec.id} ${edge.from} -> ${edge.to}`,
          );
        if (
          Object.values(b.edgeLabelBoxes).some((box) =>
            segmentIntersects(segStart, segEnd, box),
          )
        )
          throw Error(
            `Connector crosses label: ${spec.id} ${edge.from} -> ${edge.to}`,
          );
      }
      for (const [segIdx, [segStart, segEnd]] of segments.entries()) {
        const isLast = segIdx === segments.length - 1;
        if (edge.directed === false) {
          line(segStart[0], segStart[1], segEnd[0], segEnd[1], T.line, false);
          elements.at(-1)!.semanticConnector = true;
        } else if (edge.bidirectional && segments.length === 1) {
          shape(
            pptx.ShapeType.line,
            Math.min(segStart[0], segEnd[0]),
            Math.min(segStart[1], segEnd[1]),
            Math.max(0.001, Math.abs(segEnd[0] - segStart[0])),
            Math.max(0.001, Math.abs(segEnd[1] - segStart[1])),
            T.accent,
            T.accent,
            {
              x: Math.min(segStart[0], segEnd[0]),
              y: Math.min(segStart[1], segEnd[1]),
              w: Math.max(0.001, Math.abs(segEnd[0] - segStart[0])),
              h: Math.max(0.001, Math.abs(segEnd[1] - segStart[1])),
              flipV: (segEnd[0] - segStart[0]) * (segEnd[1] - segStart[1]) < 0,
              line: {
                color: T.accent,
                width: 1.5,
                beginArrowType: "arrow",
                endArrowType: "arrow",
              },
            },
          );
          elements.at(-1)!.semanticConnector = true;
        } else {
          line(
            segStart[0],
            segStart[1],
            segEnd[0],
            segEnd[1],
            T.accent,
            isLast || (!!edge.bidirectional && segIdx === 0),
          );
        }
        if (isLast) {
          elements.at(-1)!.compositionEdge = {
            from: edge.from,
            to: edge.to,
            bidirectional: !!edge.bidirectional,
          };
        }
      }
    }
    for (const [nIdx, n] of v.nodes.entries()) {
      const box = b.nodeBoxes[n.id];
      if (!box) throw Error(`Missing node box: ${n.id}`);
      const compactNode = b.visual === "swimlane" || box.h < 1.65;
      if (editorial) {
        await documentNode(n, box);
        elements.at(-1)!.compositionNodeId = n.id;
      } else if (b.nodeTreatment === "open") {
        line(box.x, box.y, box.x, box.y + box.h, T.accent);
        elements.at(-1)!.compositionNodeId = n.id;
        tx(n.label, box.x + 0.2, box.y + (compactNode ? 0.12 : 0.16),
          box.w - 0.4, compactNode ? 0.4 : 0.45, type.node, T.ink, true);
        elements.at(-1)!.compositionNodeId = n.id;
        tx(n.detail, box.x + 0.2, box.y + (compactNode ? 0.56 : 0.78),
          box.w - 0.4, Math.max(0.42, box.h - (compactNode ? 0.68 : 0.94)), type.body, T.muted);
        elements.at(-1)!.compositionNodeId = n.id;
      } else {
        panel(box.x, box.y, box.w, box.h, T.white, T.line);
        elements.at(-1)!.compositionNodeId = n.id;
        const iconSize = compactNode ? 0.22 : 0.24;
        const labelX = box.x + iconSize + 0.24;
        const labelW = Math.max(0.8, box.w - (iconSize + 0.3));
        const neededLabelH = estimatedHeight(n.label, labelW, type.node);
        const headerH = Math.max(
          compactNode ? 0.36 : 0.4,
          neededLabelH + 0.02,
        );
        const hdrFill = nIdx % 2 === 0 ? T.tealTint : T.panel;
        const hdrAccent = nIdx % 2 === 0 ? T.accent : T.blue;
        shape(
          pptx.ShapeType.roundRect,
          box.x + 0.02,
          box.y + 0.02,
          box.w - 0.04,
          headerH,
          hdrFill,
          hdrFill,
          { rectRadius: 0.08 },
        );
        shape(
          pptx.ShapeType.rect,
          box.x + 0.02,
          box.y + 0.05,
          0.06,
          headerH - 0.06,
          hdrAccent,
          hdrAccent,
        );
        shape(
          pptx.ShapeType.roundRect,
          box.x + 0.11,
          box.y + (headerH - (iconSize + 0.06)) / 2 + 0.02,
          iconSize + 0.06,
          iconSize + 0.06,
          T.white,
          hdrAccent,
          { rectRadius: 0.06 },
        );
        await icon(
          n.icon || "server",
          box.x + 0.14,
          box.y + (headerH - iconSize) / 2 + 0.02,
          iconSize,
          hdrAccent,
        );
        tx(
          n.label,
          labelX,
          box.y + 0.01,
          labelW,
          headerH - 0.02,
          type.node,
          T.ink,
          true,
          { valign: "mid" },
        );
        line(
          box.x + 0.1,
          box.y + headerH + 0.01,
          box.x + box.w - 0.1,
          box.y + headerH + 0.01,
          T.line,
        );
        tx(
          n.detail,
          box.x + 0.08,
          box.y + headerH + 0.02,
          box.w - 0.16,
          Math.max(0.4, box.h - headerH - 0.03),
          type.body,
          T.ink,
          false,
          { valign: "mid", margin: [6, 6, 2, 2] },
        );
      }
    }
    for (const edge of v.edges.filter((e) => e.label)) {
      const box = b.edgeLabelBoxes[`${edge.from}:${edge.to}`];
      if (!box) throw Error(`Missing edge label box: ${edge.from}:${edge.to}`);
      if (!editorial) panel(box.x, box.y, box.w, box.h, T.tealTint, T.accent);
      tx(edge.label, box.x, box.y, box.w, box.h, 14, T.ink, true, {
        align: "center",
        valign: "mid",
      });
    }
  } else if (b.visual === "causal-chain") {
    if (!v.chains?.length || v.kind !== "causal-flow")
      throw Error(`Unsupported causal-chain: ${spec.id}`);
    const stepKeys = ["cause", "intervention", "response", "result"] as const;
    const stepMeta: Record<
      (typeof stepKeys)[number],
      { label: string; icon: string; fill: string; accent: string }
    > = {
      cause: {
        label: "01 원인 · 한계",
        icon: "bell",
        fill: "F6ECD9",
        accent: T.amber,
      },
      intervention: {
        label: "02 설계 · 핵심 조치",
        icon: "shield",
        fill: T.blueTint,
        accent: T.blue,
      },
      response: {
        label: "03 시스템 · 현장 작동",
        icon: "server",
        fill: T.panel,
        accent: T.ink,
      },
      result: {
        label: "04 검증 결과 · 효과",
        icon: "clipboard",
        fill: T.tealTint,
        accent: T.accent,
      },
    };
    for (const chain of v.chains) {
      const stepBoxes = stepKeys.map((k) => {
        const key = `${chain.id}:${k}`;
        const box = b.nodeBoxes[key];
        if (!box) throw Error(`Missing causal step box: ${key}`);
        return { key, k, box, text: chain[k] };
      });
      for (let idx = 0; idx < stepBoxes.length - 1; idx++) {
        const fromBox = stepBoxes[idx].box;
        const toBox = stepBoxes[idx + 1].box;
        const axis =
          fromBox.x + fromBox.w <= toBox.x || toBox.x + toBox.w <= fromBox.x
            ? "horizontal"
            : "vertical";
        const { start, end } = facingPorts(fromBox, toBox, axis);
        line(start[0], start[1], end[0], end[1], T.accent, true);
      }
      for (const step of stepBoxes) {
        const meta = stepMeta[step.k];
        panel(
          step.box.x,
          step.box.y,
          step.box.w,
          step.box.h,
          step.k === "result" ? "F4FAFA" : T.white,
          step.k === "result" ? T.accent : T.line,
        );
        elements.at(-1)!.compositionNodeId = step.key;
        const hdrH = 0.36;
        shape(
          pptx.ShapeType.roundRect,
          step.box.x + 0.02,
          step.box.y + 0.02,
          step.box.w - 0.04,
          hdrH,
          meta.fill,
          meta.fill,
          { rectRadius: 0.07 },
        );
        shape(
          pptx.ShapeType.rect,
          step.box.x + 0.02,
          step.box.y + 0.06,
          0.06,
          hdrH - 0.08,
          meta.accent,
          meta.accent,
        );
        await icon(
          meta.icon,
          step.box.x + 0.12,
          step.box.y + 0.09,
          0.22,
          meta.accent,
        );
        tx(
          meta.label,
          step.box.x + 0.38,
          step.box.y + 0.04,
          step.box.w - 0.48,
          0.3,
          12,
          meta.accent,
          true,
          { valign: "mid" },
        );
        line(
          step.box.x + 0.1,
          step.box.y + hdrH + 0.02,
          step.box.x + step.box.w - 0.1,
          step.box.y + hdrH + 0.02,
          T.line,
        );
        tx(
          step.text,
          step.box.x + 0.08,
          step.box.y + hdrH + 0.02,
          step.box.w - 0.16,
          Math.max(0.32, step.box.h - hdrH - 0.03),
          type.body,
          T.ink,
          !editorial && (step.k === "intervention" || step.k === "result"),
          { valign: "mid", margin: [6, 6, 2, 2] },
        );
      }
    }
  } else if (b.visual === "annotated-screen") {
    const sc = b.screenLayout;
    if (!sc) throw Error(`Missing screenLayout: ${spec.id}`);
    const f = sc.frameBox;
    panel(f.x, f.y, f.w, f.h, T.white, T.line);
    const driverUi = p.businessCase?.productStrategy?.driverScreen;
    const iface = v.interfaceExample;
    const imgPath = iface?.image?.path || v.scene?.path || spec.image?.path;
    if (imgPath) {
      shape(
        pptx.ShapeType.roundRect,
        f.x + 0.03,
        f.y + 0.03,
        f.w - 0.06,
        0.3,
        T.ink,
        T.ink,
        { rectRadius: 0.06 },
      );
      for (const [dotIdx, dotColor] of [T.red, T.amber, T.accent].entries()) {
        shape(
          pptx.ShapeType.ellipse,
          f.x + 0.14 + dotIdx * 0.16,
          f.y + 0.13,
          0.1,
          0.1,
          dotColor,
          dotColor,
        );
      }
      await icon("camera", f.x + f.w - 0.32, f.y + 0.08, 0.2, "7BD3CA");
      const pad = 0.12;
      const inner = {
        x: f.x + pad,
        y: f.y + 0.37,
        w: Math.max(0.4, f.w - pad * 2),
        h: Math.max(0.4, f.h - 0.47),
      };
      const fitted = await fitImage(imgPath, inner);
      if (driverUi) {
        for (const obj of driverUi.objectBoxes) {
          const ox = fitted.x + obj.x * fitted.w;
          const oy = fitted.y + obj.y * fitted.h;
          const ow = obj.w * fitted.w;
          const oh = obj.h * fitted.h;
          shape(pptx.ShapeType.rect, ox, oy, ow, oh, T.white, T.accent, {
            fill: { color: T.white, transparency: 100 },
            line: { color: T.accent, width: 1.5 },
          });
          elements.at(-1)!.displayObjectId = obj.id;
        }
      } else if (!editorial && v.scene?.annotations?.length) {
        for (const a of v.scene.annotations) {
          const ox = fitted.x + Math.max(0.02, a.x - 0.06) * fitted.w;
          const oy = fitted.y + Math.max(0.02, a.y - 0.08) * fitted.h;
          const ow = 0.12 * fitted.w;
          const oh = 0.16 * fitted.h;
          shape(pptx.ShapeType.rect, ox, oy, ow, oh, T.white, T.amber, {
            fill: { color: T.white, transparency: 100 },
            line: { color: T.amber, width: 1.75 },
          });
          elements.at(-1)!.displayObjectId = a.nodeId;
        }
      } else {
        elements.at(-1)!.displayObjectId = `screen-${iface?.kind || spec.id}`;
      }
    } else if (iface) {
      elements.at(-1)!.displayObjectId = `screen-${iface.kind}`;
      tx(
        `${iface.scenario} (${iface.at})`,
        f.x + 0.2,
        f.y + 0.18,
        f.w - 0.4,
        0.4,
        type.node,
        T.ink,
        true,
      );
      iface.records.slice(0, 3).forEach((rec, idx) => {
        const ry = f.y + 0.72 + idx * 0.62;
        if (ry + 0.52 <= f.y + f.h) {
          tx(
            `${rec.name} · ${rec.status} — ${rec.detail}`,
            f.x + 0.2,
            ry,
            f.w - 0.4,
            0.48,
            type.body,
            T.ink,
          );
        }
      });
    }
    if (sc.statusBannerBox) {
      const sb = sc.statusBannerBox;
      panel(sb.x, sb.y, sb.w, sb.h, T.ink, T.accent);
      shape(
        pptx.ShapeType.rect,
        sb.x + 0.02,
        sb.y + 0.06,
        0.06,
        Math.max(0.2, sb.h - 0.12),
        T.amber,
        T.amber,
      );
      const statusText =
        driverUi?.controlLabel ||
        iface?.decision.action ||
        "현장 통제 및 담당자 직접 확인 우선";
      const hasBannerIconSpace =
        estimatedHeight(statusText, sb.w - 0.66, type.body) <=
        sb.h - 0.1 + 0.05;
      if (hasBannerIconSpace) {
        shape(
          pptx.ShapeType.roundRect,
          sb.x + 0.12,
          sb.y + (sb.h - 0.34) / 2,
          0.34,
          0.34,
          T.amber,
          T.amber,
          { rectRadius: 0.06 },
        );
        await icon("shield", sb.x + 0.17, sb.y + (sb.h - 0.24) / 2, 0.24, T.white);
      }
      tx(
        statusText,
        sb.x + (hasBannerIconSpace ? 0.54 : 0.16),
        sb.y + 0.05,
        sb.w - (hasBannerIconSpace ? 0.66 : 0.32),
        sb.h - 0.1,
        type.body,
        T.white,
        true,
        { valign: "mid" },
      );
      elements.at(-1)!.fieldSafetyIndicator = true;
    }
    const sideEntries = Object.entries(sc.sidePanelBoxes);
    for (const [idx, [panelId, sBox]] of sideEntries.entries()) {
      if (editorial) {
        const node = v.nodes.find((n) => n.id === panelId) || v.nodes[idx];
        await documentNode(node, sBox);
        if (idx === 0) elements.at(-1)!.fieldSafetyIndicator = true;
        continue;
      }
      panel(sBox.x, sBox.y, sBox.w, sBox.h, T.white, T.line);
      const nodeMatch = v.nodes.find((n) => n.id === panelId) || v.nodes[idx];
      const titleText =
        nodeMatch?.label || iface?.decision.title || `판단·검증 ${idx + 1}`;
      const detailText =
        nodeMatch?.detail ||
        iface?.decision.reason ||
        driverUi?.controlLabel ||
        v.takeaway;
      const labelW = Math.max(0.8, sBox.w - 0.56);
      const neededTitleH = estimatedHeight(titleText, labelW, type.node);
      const hdrH = Math.max(0.35, neededTitleH + 0.02);
      const hdrFill = idx === 0 ? T.tealTint : T.panel;
      const hdrAccent = idx === 0 ? T.accent : T.blue;
      shape(
        pptx.ShapeType.roundRect,
        sBox.x + 0.02,
        sBox.y + 0.02,
        sBox.w - 0.04,
        hdrH,
        hdrFill,
        hdrFill,
        { rectRadius: 0.08 },
      );
      shape(
        pptx.ShapeType.rect,
        sBox.x + 0.02,
        sBox.y + 0.05,
        0.06,
        hdrH - 0.06,
        hdrAccent,
        hdrAccent,
      );
      shape(
        pptx.ShapeType.roundRect,
        sBox.x + 0.11,
        sBox.y + (hdrH - 0.28) / 2 + 0.02,
        0.28,
        0.28,
        T.white,
        hdrAccent,
        { rectRadius: 0.06 },
      );
      await icon(
        nodeMatch?.icon || "camera",
        sBox.x + 0.14,
        sBox.y + (hdrH - 0.22) / 2 + 0.02,
        0.22,
        hdrAccent,
      );
      tx(
        titleText,
        sBox.x + 0.44,
        sBox.y + 0.01,
        labelW,
        hdrH - 0.02,
        type.node,
        T.ink,
        true,
        { valign: "mid" },
      );
      line(
        sBox.x + 0.1,
        sBox.y + hdrH + 0.01,
        sBox.x + sBox.w - 0.1,
        sBox.y + hdrH + 0.01,
        T.line,
      );
      tx(
        detailText,
        sBox.x + 0.08,
        sBox.y + hdrH + 0.02,
        sBox.w - 0.16,
        Math.max(0.38, sBox.h - hdrH - 0.03),
        type.body,
        T.ink,
        false,
        { valign: "mid", margin: [6, 6, 2, 2] },
      );
      if (!sc.statusBannerBox && idx === 0) {
        elements.at(-1)!.fieldSafetyIndicator = true;
      }
    }
    if (!sc.statusBannerBox && sideEntries.length === 0) {
      elements.at(-1)!.fieldSafetyIndicator = true;
    }
  } else if (b.visual === "timeline") {
    if (!v.schedule) throw Error(`Missing actual timeline ranges: ${spec.id}`);
    const schedule = v.schedule;
    const rowHeight = area.h / Math.max(1, schedule.ranges.length);
    const left = Math.min(2.8, area.w * 0.3),
      plot = area.w - left;
    for (const [i, r] of schedule.ranges.entries()) {
      const n = v.nodes.find((n) => n.id === r.nodeId)!;
      const y = area.y + i * rowHeight;
      panel(
        area.x,
        y + 0.02,
        area.w,
        rowHeight - 0.06,
        i % 2 === 0 ? T.white : T.panel,
        T.line,
      );
      shape(
        pptx.ShapeType.roundRect,
        area.x + 0.02,
        y + 0.04,
        left - 0.16,
        rowHeight - 0.1,
        T.tealTint,
        T.tealTint,
        { rectRadius: 0.07 },
      );
      shape(
        pptx.ShapeType.rect,
        area.x + 0.02,
        y + 0.08,
        0.06,
        rowHeight - 0.18,
        T.accent,
        T.accent,
      );
      const labelNodeSize = b.typography?.nodeTitleSize ?? 17;
      const hasTimelineIconSpace =
        estimatedHeight(n.label, left - 0.64, labelNodeSize) <=
        rowHeight - 0.14 + 0.05;
      if (hasTimelineIconSpace) {
        await icon(
          n.icon || "clock",
          area.x + 0.14,
          y + (rowHeight - 0.24) / 2,
          0.24,
          T.accent,
        );
      }
      tx(
        n.label,
        area.x + (hasTimelineIconSpace ? 0.44 : 0.12),
        y + 0.06,
        left - (hasTimelineIconSpace ? 0.64 : 0.28),
        rowHeight - 0.14,
        labelNodeSize,
        T.ink,
        true,
        { valign: "mid" },
      );
      shape(
        pptx.ShapeType.roundRect,
        area.x + left,
        y + 0.11,
        plot - 0.16,
        0.2,
        "E2ECEC",
        T.line,
        { rectRadius: 0.05 },
      );
      const x = area.x + left + (r.start / schedule.slots) * (plot - 0.16),
        w = (r.length / schedule.slots) * (plot - 0.16);
      shape(pptx.ShapeType.roundRect, x, y + 0.11, w, 0.2, T.accent, T.accent, {
        rectRadius: 0.05,
      });
      elements.at(-1)!.timelineRange = {
        nodeId: r.nodeId,
        start: r.start,
        length: r.length,
      };
      const period =
        r.length === 1
          ? `${r.start + 1}`
          : `${r.start + 1}–${r.start + r.length}`;
      tx(
        `▸ [${period}${schedule.unitLabel}] ${n.detail}`,
        area.x + left,
        y + 0.36,
        plot - 0.16,
        rowHeight - 0.42,
        type.body,
        T.ink,
        false,
        { valign: "mid" },
      );
    }
  } else if (b.visual === "comparison") {
    const alternatives = p.planning?.alternatives;
    const table = v.comparisonTable;
    if (v.kind !== "comparison" || (!alternatives && !table))
      throw Error(`Unsupported comparison: ${spec.id}`);
    const columns = table?.columns || alternatives!.map(a=>a.name);
    const widths = [
      area.w * 0.16,
      ...columns.map(() => (area.w * 0.84) / columns.length),
    ];
    const rows = table
      ? [["비교 기준", ...columns], ...table.rows.map(r=>[r.criterion,...r.values])]
      : [["공통 기준", ...columns],
        ["대응 범위", ...alternatives!.map((a) => a.addresses)],
        ["한계·조건", ...alternatives!.map((a) => a.limits)]];
    const heights = [0.62, ...rows.slice(1).map(()=>(area.h-0.62)/(rows.length-1))];
    let y = area.y;
    for (let r = 0; r < rows.length; r++) {
      let x = area.x;
      for (let c = 0; c < rows[r].length; c++) {
        const isLastCol = c === rows[r].length - 1;
        const cellFill =
          r === 0
            ? isLastCol
              ? T.accent
              : T.ink
            : c === 0
              ? T.tealTint
              : r % 2
                ? T.white
                : T.panel;
        shape(
          pptx.ShapeType.rect,
          x,
          y,
          widths[c],
          heights[r],
          cellFill,
          T.line,
        );
        if (c === 0 && r > 0) elements.at(-1)!.comparisonCriterion = rows[r][0];
        if (r === 0 && c > 0) {
          const hdrFontSize = b.typography?.nodeTitleSize ?? 17;
          const hasHdrIconSpace =
            estimatedHeight(rows[r][c], widths[c] - 0.6, hdrFontSize) <=
            heights[r] - 0.16 + 0.05;
          if (hasHdrIconSpace) {
            await icon(
              isLastCol ? "shield" : "server",
              x + 0.16,
              y + (heights[r] - 0.24) / 2,
              0.24,
              T.white,
            );
          }
          tx(
            rows[r][c],
            x + (hasHdrIconSpace ? 0.46 : 0.16),
            y + 0.08,
            widths[c] - (hasHdrIconSpace ? 0.58 : 0.32),
            heights[r] - 0.16,
            hdrFontSize,
            T.white,
            true,
            { valign: "mid" },
          );
        } else {
          tx(
            rows[r][c],
            x + 0.16,
            y + 0.08,
            widths[c] - 0.32,
            heights[r] - 0.16,
            r === 0 ? (b.typography?.nodeTitleSize ?? 17) : type.body,
            r === 0 ? T.white : T.ink,
            c === 0 || r === 0,
            {
              valign: "mid",
              align: c === 0 ? "center" : "left",
            },
          );
        }
        x += widths[c];
      }
      y += heights[r];
    }
  } else throw Error(`Unsupported composition: ${b.visual}`);
  // The visual footprint is backed by actual marks and checked again by QA.
  elements.push({
    slideId: spec.id,
    id: "authored-visual",
    kind: "diagram",
    visualRole: "explanation",
    ...area,
    compositionPart: "visual",
    ...(b.visual === "causal-chain" && v.chains
      ? { causalChainIds: v.chains.map((c) => c.id) }
      : {}),
  });
  let caption = v.legend;
  if (b.visual === "chart") {
    const d = p.quantitativeDatasets.find((d) => d.id === v.chart?.datasetId)!;
    caption = `${d.period} · ${d.unit} · ${d.population}\n${d.limitation}`;
  }
  if (b.visual === "map") {
    const a = p.geographicAssets.find((a) => a.id === v.map?.assetId)!;
    caption = `${a.projection} · ${a.attribution}\n${a.disclosure}`;
  }
  panel(b.caption.x, b.caption.y, b.caption.w, b.caption.h, T.panel, T.line);
  shape(
    pptx.ShapeType.rect,
    b.caption.x + 0.02,
    b.caption.y + 0.06,
    0.05,
    Math.max(0.16, b.caption.h - 0.12),
    T.accent,
    T.accent,
  );
  await icon(
    "document",
    b.caption.x + 0.13,
    b.caption.y + (b.caption.h - 0.2) / 2,
    0.2,
    T.accent,
  );
  tx(
    caption,
    b.caption.x,
    b.caption.y,
    b.caption.w,
    b.caption.h,
    type.caption,
    T.muted,
    false,
    { valign: "mid", margin: [30, 8, 2, 2] },
  );
  mark("caption");
  return true;
}
