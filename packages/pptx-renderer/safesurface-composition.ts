import { facingPorts } from "./connector-anchors.js";
import { renderSafeSurfaceBuyer } from "./safesurface-buyer-composition.js";
import sharp from "sharp";
import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";

/** Authored SafeSurface page recipes. All copy/data come from the project brief. */
export async function renderSafeSurfaceComposition(ctx: DrawingContext) {
  const T = resolveTokens(ctx.p);
  const { p, spec, slide, pptx, elements } = ctx,
    v = spec.reasoning?.visualPlan;
  if (!v?.encoding.startsWith("safesurface:")) return false;
  const mode = v.encoding.split(";")[0].split(":")[1],
    section = p.businessCase!.sections.find(
      (s) => s.id === spec.reasoning!.sectionId,
    )!;
  const k = professionalKit(ctx),
    { tx, panel, line, header, messageBand, region, iconLabel } = k;
  slide.background = { color: T.paper };
  const photo = async (
    path: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => {
    const m = await sharp(path).metadata(),
      r = Math.min(w / m.width!, h / m.height!),
      iw = m.width! * r,
      ih = m.height! * r,
      ix = x + (w - iw) / 2,
      iy = y + (h - ih) / 2;
    slide.addImage({ path, x: ix, y: iy, w: iw, h: ih });
    elements.push({
      slideId: spec.id,
      id: "safe-image-" + elements.length,
      kind: "image",
      x: ix,
      y: iy,
      w: iw,
      h: ih,
      image: { path, width: m.width!, height: m.height!, dpi: m.width! / iw },
    });
    return { x: ix, y: iy, w: iw, h: ih };
  };
  const end = () => {
    if (mode !== "flow") tx(v.legend, 0.64, 6.63, 12.04, 0.38, 11, T.muted);
    region();
  };
  const flow = async () => {
    const n = v.nodes.length,
      cell = 12.04 / n,
      w = cell - 0.34,
      y = 3.12;
    // Equal-width process columns use the declared node order and bound edges.
    for (let i = 0; i < n; i++) {
      const x = 0.64 + i * cell,
        nd = v.nodes[i];
      panel(x, y, w, 2.35, i === n - 1 ? T.tealTint : T.white, T.line);
      tx(
        nd.label,
        x + 0.2,
        y + 0.26,
        w - 0.4,
        0.65,
        n > 3 ? 20 : 23,
        T.ink,
        true,
      );
      tx(
        nd.detail,
        x + 0.22,
        y + 1.03,
        w - 0.44,
        1.14,
        n > 3 ? 17 : 19,
        T.muted,
      );
      if (i < n - 1) {
        const {start,end} = facingPorts({x,y,w,h:2.35},{x:x+cell,y,w,h:2.35});
        line(start[0],start[1],end[0],end[1],T.accent,true);
      }
    }
    const cap = section.caption;
    tx(cap, 0.85, 5.76, 11.6, 0.58, 15, T.muted);
  };
  const table = () => {
    const rows = section.rows!,
      heads = section.headers!,
      cols = heads.length;
    const widths = cols === 4 ? [2.05, 3.8, 1.73, 4.46] : [2.34, 4.6, 5.1];
    const y0 = 2.72,
      hh = 0.49,
      rh = Math.min(0.72, 3.2 / rows.length);
    let xx = 0.64;
    k.shape(pptx.ShapeType.rect, 0.64, y0, 12.04, hh, T.ink, T.ink);
    heads.forEach((h, i) => {
      tx(h, xx + 0.14, y0 + 0.06, widths[i] - 0.28, 0.34, 15, T.white, true);
      xx += widths[i];
    });
    rows.forEach((row, r) => {
      const y = y0 + hh + r * rh;
      xx = 0.64;
      k.shape(
        pptx.ShapeType.rect,
        0.64,
        y,
        12.04,
        rh,
        r % 2 ? T.white : T.panel,
        r % 2 ? T.white : T.panel,
      );
      row.forEach((value, c) => {
        tx(
          value,
          xx + 0.14,
          y + 0.09,
          widths[c] - 0.28,
          rh - 0.14,
          cols === 4 ? 15 : 16,
          c === 0 ? T.accent : T.ink,
          c === 0,
          { valign: "mid" },
        );
        elements.at(-1)!.comparisonCriterion = row[0];
        xx += widths[c];
      });
    });
  };
  if (mode === "cover") {
    panel(0.64, 0.62, 3.5, 0.065, T.accent, T.accent);
    if (["주관", "제안사"].includes(section.items[0]?.label) && section.items[1]) {
    tx(section.items[0].detail, 0.64, 0.95, 5.8, 0.5, 25, T.ink, true);
    tx(`${section.items[1].label} ${section.items[1].detail}`, 0.64, 1.68, 6, 0.4, 18, T.accent, true);
    tx(spec.title, 0.64, 2.3, 6.2, 1.7, 36, T.ink, true);
    } else {
      tx(p.proposer!.legalName, 0.64, 0.95, 5.5, 0.5, 25, T.ink, true);
      tx("SLT SafeSurface AI", 0.64, 1.68, 6, 0.36, 17, T.accent, true);
      tx(spec.title, 0.64, 2.3, 6.2, 1.7, 36, T.ink, true);
    }
    messageBand(0.64, 4.42, 5.5, 1.13, 21);
    await photo(v.scene!.path, 6.38, 1.5, 6.5, 4.88);
    await photo(p.proposer!.contact!.logoPath, 0.64, 5.9, 2.4, 0.8);
    tx(
      "ECO WAY · EcowayVision · LED/CCTV 융합",
      3.27,
      6.05,
      9.3,
      0.4,
      15,
      T.muted,
    );
    tx(v.legend, 0.64, 6.8, 11.2, 0.36, 11, T.muted);
    return true;
  }
  header(section.kicker, v.takeaway);
  if (await renderSafeSurfaceBuyer(ctx, mode, photo, k)) {
    end();
    return true;
  }
  if (mode === "contact") {
    await photo(p.proposer!.contact!.logoPath, 0.9, 2.85, 4.8, 1.6);
    tx(p.proposer!.legalName, 0.9, 4.84, 4.8, 0.6, 32, T.ink, true);
    tx(
      "SafeSurface ACCESS\n천안시 겨울철 보행접근로 실증",
      0.9,
      5.56,
      4.8,
      0.66,
      18,
      T.muted,
    );
    const c = p.proposer!.contact!;
    for (const [i, r] of [
      { icon: "phone", label: "대표전화", value: c.phone, size: 26 },
      { icon: "mail", label: "이메일", value: c.email, size: 23 },
      { icon: "map-pin", label: "본사", value: c.address, size: 18 },
    ].entries()) {
      const y = 2.75 + i * 1.18;
      await iconLabel(r.icon, r.label, 6.7, y, 5.7, 0.34, 15, T.accent);
      tx(r.value, 6.7, y + 0.47, 5.7, 0.6, r.size, T.ink, true);
    }
  } else if (["table", "fallback"].includes(mode)) table();
  else if (mode === "scene") {
    const f = await photo(v.scene!.path, 0.64, 2.67, 7.5, 3.84);
    const anchors = [
      [0.53, 0.65],
      [0.68, 0.49],
      [0.24, 0.31],
    ];
    for (let i = 0; i < 3; i++) {
      const nd = v.nodes[i],
        yy = 2.76 + i * 1.19;
      panel(8.55, yy, 0.38, 0.38, T.accent, T.accent);
      tx(String(i + 1), 8.55, yy, 0.38, 0.38, 16, T.white, true, {
        align: "center",
        valign: "mid",
      });
      tx(nd.label, 9.1, yy, 3.5, 0.43, 20, T.ink, true);
      tx(nd.detail, 9.1, yy + 0.57, 3.5, 0.58, 17, T.muted);
      const [ax, ay] = anchors[i],
        px = f.x + ax * f.w,
        py = f.y + ay * f.h;
      panel(px - 0.17, py - 0.17, 0.34, 0.34, T.accent, T.accent);
      tx(String(i + 1), px - 0.17, py - 0.17, 0.34, 0.34, 14, T.white, true, {
        align: "center",
        valign: "mid",
      });
    }
  } else if (mode === "system") {
    const xs = [0.64, 4.8, 8.96],
      ys = [2.92, 5.0],
      w = 3.72,
      h = 1.05;
    const pos = [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
      [0, 1],
    ];
    v.nodes.forEach((n, i) => {
      const [c, r] = pos[i],
        x = xs[c],
        y = ys[r];
      panel(
        x,
        y,
        w,
        h,
        i === 2 ? T.blueTint : i === 5 ? T.tealTint : T.white,
        T.line,
      );
      tx(n.label, x + 0.18, y + 0.12, w - 0.36, 0.34, 19, T.ink, true);
      tx(n.detail, x + 0.18, y + 0.55, w - 0.36, 0.45, 15, T.muted);
    });
    line(4.4, 3.25, 4.75, 3.25, T.accent, true);
    line(8.56, 3.25, 8.91, 3.25, T.blue, true);
    line(8.91, 3.72, 8.56, 3.72, T.blue, true, true);
    line(6.66, 4.01, 6.66, 4.92, T.accent, true);
    tx("상태·승인문구", 6.9, 4.24, 2, 0.36, 13, T.muted);
    line(8.56, 5.25, 8.91, 5.25, T.accent, true);
    line(8.91, 5.75, 8.56, 5.75, T.accent, true, true);
    line(4.75, 5.51, 4.4, 5.51, T.amber, true);
    tx(
      "실선: 관측·요청·안내 / 점선: 물리 출력·장치응답 확인 / 황색: 담당자 조치",
      0.64,
      6.2,
      12,
      0.3,
      12,
      T.muted,
    );
  } else if (mode === "states") {
    const rows = section.rows!;
    rows.forEach((r, i) => {
      const y = 2.7 + i * 0.88;
      tx(r[0], 0.72, y + 0.16, 3.05, 0.52, 17, T.ink, true);
      panel(4.02, y, 4.35, 0.72, T.ink, T.ink);
      tx(r[1], 4.16, y + 0.13, 4.07, 0.47, 20, "F4CD72", true, {
        valign: "mid",
        align: "center",
      });
      elements.at(-1)!.displayObjectId = "safe-display-" + i;
      elements.at(-1)!.comparisonCriterion = r[0];
      tx(r[2], 8.75, y + 0.14, 3.86, 0.56, 16, T.muted);
      elements.at(-1)!.fieldSafetyIndicator = true;
      line(3.77, y + 0.36, 4.02, y + 0.36, T.accent, true);
    });
  } else if (mode === "schedule") {
    const s = v.schedule!,
      x0 = 4.1,
      cw = 8.3 / s.slots;
    tx("26.11", x0, 2.71, 0.75, 0.3, 12, T.muted);
    tx("2027.01", x0 + 2 * cw, 2.71, 1, 0.3, 12, T.muted);
    tx("07", x0 + 8 * cw, 2.71, 0.5, 0.3, 12, T.muted);
    tx("11", x0 + 12 * cw, 2.71, 0.5, 0.3, 12, T.muted);
    tx("28.03", x0 + 16 * cw - 0.25, 2.71, 0.8, 0.3, 12, T.muted);
    for (let j = 0; j <= s.slots; j++)
      line(x0 + j * cw, 3.08, x0 + j * cw, 6.23, T.line);
    v.nodes.forEach((n, i) => {
      const y = 3.17 + i * 0.61,
        r = s.ranges[i];
      tx(n.label, 0.64, y, 3.2, 0.34, 17, T.ink, true);
      panel(
        x0 + r.start * cw,
        y + 0.02,
        r.length * cw - 0.04,
        0.32,
        i % 2 ? T.blue : T.accent,
      );
      elements.at(-1)!.timelineRange = r;
    });
  } else if (mode === "budget") {
    tx("단위: 만 원, VAT 별도", 0.64, 2.5, 8.23, 0.24, 11, T.muted);
    const b = p.businessCase!.budget,
      d = p.quantitativeDatasets.find((d) => d.id === v.chart!.datasetId)!;
    slide.addChart(
      pptx.ChartType.bar,
      ["하한", "상한"].map((name) => ({
        name,
        labels: b.items.map((i) => i.label),
        values: b.items.map((i) => (name === "하한" ? i.low : i.high) / 10000),
      })),
      {
        x: 0.64,
        y: 2.7,
        w: 8.23,
        h: 3.68,
        barDir: "bar",
        catAxisLabelFontFace: p.design.font,
        catAxisLabelFontSize: 14,
        valAxisLabelFontSize: 11,
        showLegend: true,
        legendPos: "b",
        legendFontSize: 12,
        showValue: true,
        dataLabelPosition: "outEnd",
        dataLabelColor: T.ink,
        dataLabelFormatCode: "#,##0",
        dataLabelBkgrdColor: T.paper,
        chartColors: [T.accent, "85B8C4"],
        showCatName: false,
        showBorder: false,
        showTitle: false,
        showCatNameInLabel: false,
        valAxisMinVal: 0,
        valAxisMaxVal: 10000,
        valAxisMajorUnit: 2000,
        catAxisMultiLevelLabels: false,
        showShadow: false,
      },
    );
    elements.push({
      slideId: spec.id,
      id: "safe-budget",
      kind: "chart",
      dataRef: d.id,
      x: 0.64,
      y: 2.7,
      w: 8.23,
      h: 3.68,
    });
    panel(9.25, 2.79, 3.43, 3.48, T.tealTint, T.tealTint);
    tx("초기 합계", 9.5, 3.05, 2.93, 0.4, 19, T.accent, true);
    const lo = b.items.reduce((a, i) => a + i.low, 0) / 10000,
      hi = b.items.reduce((a, i) => a + i.high, 0) / 10000;
    tx(
      lo.toLocaleString() +
        "만~\n" +
        (hi >= 10000
          ? Math.floor(hi / 10000) + "억 " + (hi % 10000).toLocaleString()
          : hi.toLocaleString()) +
        "만 원",
      9.5,
      3.7,
      2.93,
      1.05,
      27,
      T.ink,
      true,
    );
    tx(
      "VAT 별도\n운영·전기료 별도 견적\n면적 20~60㎡ 가정",
      9.5,
      5.03,
      2.93,
      0.91,
      16,
      T.muted,
    );
  } else await flow();
  end();
  return true;
}
