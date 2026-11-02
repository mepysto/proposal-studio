import sharp from "sharp";
import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";

/** Authored portfolio compositions; data and page intent remain in the project. */
export async function renderSltAiComposition(ctx: DrawingContext) {
  const T = resolveTokens(ctx.p);
  const { p, spec, slide, pptx, elements } = ctx;
  const v = spec.reasoning?.visualPlan;
  if (!v?.encoding.startsWith("slt-ai:")) return false;
  const mode = v.encoding.split(":")[1];
  const section = p.businessCase!.sections.find(
    (s) => s.id === spec.reasoning!.sectionId,
  )!;
  const k = professionalKit(ctx);
  const { tx, shape, panel, line, iconLabel, messageBand, region } = k;
  const N = v.nodes;
  const image = async (
    file: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => {
    const m = await sharp(file).metadata();
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
      id: `portfolio-img-${elements.length}`,
      kind: "image",
      ...b,
      image: {
        path: file,
        width: m.width!,
        height: m.height!,
        dpi: m.width! / b.w,
      },
    });
    return b;
  };
  const box = async (
    i: number,
    x: number,
    y: number,
    w: number,
    h = 1.65,
    fill = T.white,
  ) => {
    panel(x, y, w, h, fill, T.line);
    await iconLabel(
      N[i].icon,
      N[i].label,
      x + 0.18,
      y + 0.15,
      w - 0.36,
      0.5,
      20,
    );
    tx(N[i].detail, x + 0.2, y + 0.88, w - 0.4, h - 0.97, 17, T.muted);
    return { x, y, w, h };
  };
  const join = (
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number },
  ) => line(a.x + a.w, a.y + a.h / 2, b.x, b.y + b.h / 2, T.accent, true);
  const table = (
    headers: string[],
    rows: string[][],
    widths: number[],
    y = 2.72,
    rh = 0.65,
  ) => {
    const xs = [0.64];
    widths.slice(0, -1).forEach((w) => xs.push(xs.at(-1)! + w));
    shape(pptx.ShapeType.roundRect, 0.64, y, 12.04, 0.48, T.ink, T.ink);
    headers.forEach((s, i) =>
      tx(s, xs[i] + 0.16, y + 0.04, widths[i] - 0.3, 0.36, 15, T.white, true),
    );
    rows.forEach((row, j) => {
      const yy = y + 0.6 + j * rh;
      if (j % 2 === 0)
        shape(
          pptx.ShapeType.rect,
          0.64,
          yy - 0.03,
          12.04,
          rh - 0.06,
          T.panel,
          T.panel,
        );
      row.forEach((s, i) => {
        tx(
          s,
          xs[i] + 0.16,
          yy + 0.03,
          widths[i] - 0.32,
          rh - 0.14,
          16,
          i === 0 ? T.accent : T.ink,
          i === 0,
          { valign: "mid" },
        );
        elements.at(-1)!.comparisonCriterion = row[0];
      });
    });
    region(0.64, y, 12.04, Math.min(3.82, 0.6 + rows.length * rh));
  };
  if (mode === "cover") {
    shape(pptx.ShapeType.rect, 0, 0, 13.333, 7.5, T.ink, T.ink);
    await image(spec.image!.path, 0, 0, 13.333, 7.5);
    await image(p.proposer!.contact!.logoPath, 0.65, 0.62, 2.6, 0.8);
    tx(p.proposer!.legalName, 0.64, 1.55, 5.9, 0.48, 24, T.white, true);
    tx(spec.title, 0.64, 2.3, 6.1, 1.75, 38, T.white, true);
    messageBand(0.64, 4.45, 6.1, 1.1, 21, true);
    tx("감지 → 현장 안내 → 조치 확인", .66, 5.88, 5.7, .42, 21, T.white, true);
    tx("천안시 공공안전 공간\n사전 협의용 · 2026.10.30", 0.66, 6.43, 6.1, 0.48, 14, "D0DFE8");
    return true;
  }
  k.header(section.kicker, v.takeaway);
  if (mode === "problem") {
    const a = await box(0, 0.64, 3.05, 3.65, 2.2);
    const b = await box(1, 4.84, 3.05, 3.65, 2.2, T.tealTint);
    const c = await box(2, 9.04, 3.05, 3.64, 2.2);
    join(a, b);
    join(b, c);
    tx(section.caption, 0.86, 5.75, 11.6, 0.56, 20, T.ink, true, {
      align: "center",
    });
    region();
  } else if (
    mode === "public-comparison" ||
    mode === "public-spaces" ||
    mode === "techmatrix" ||
    mode === "policy" ||
    mode === "portfolio" ||
    mode === "roles" ||
    mode === "kpi" ||
    mode === "states"
  ) {
    const widths =
      mode === "public-comparison"
        ? [2.15,3.0,3.15,3.74]
        : mode === "public-spaces"
        ? [2.4,3.0,3.4,3.24]
        : mode === "portfolio"
        ? [2.15, 3.35, 3.35, 3.19]
        : mode === "policy"
          ? [2.5, 4.4, 5.14]
          : mode === "techmatrix"
            ? [2.3, 5.0, 4.74]
            : mode === "roles"
            ? [2.2, 4.6, 5.24]
            : mode === "states"
              ? [2.0, 4.8, 5.24]
              : [2.3, 4.5, 5.24];
    table(
      section.headers!,
      section.rows!,
      widths,
      2.72,
      (mode === "portfolio" || mode === "public-spaces") ? 0.69 : 0.76,
    );
    if (mode === "kpi" && section.caption)
      tx(section.caption, .8, 6.0, 11.72, .5, 17, T.muted);
  } else if (
    ["construction", "walkway", "parking", "festival", "public-space"].includes(mode)
  ) {
    const b = await image(spec.image!.path, 0.64, 2.58, 7.2, 4.02);
    for (const [i, n] of N.entries()) {
      const yy = 2.7 + i * 1.22;
      await iconLabel(n.icon, n.label, 8.2, yy, 4.4, 0.45, 20);
      tx(n.detail, 8.2, yy + 0.5, 4.4, 0.72, 17, T.muted);
    }
    if (mode === "parking") {
      // Inner screen quadrilateral in the 1536×1024 source:
      // (1100,379), (1323,409), (1320,491), (1100,461).
      // Inset text follows the screen's clockwise baseline and is optically centered.
      tx("보행자 주의", b.x+b.w*.7215, b.y+b.h*.396,
        b.w*.134, b.h*.055, 10, T.white, true,
        {valign:"mid",align:"center",margin:0,rotate:7.5});
    } else if (mode === "festival") {
      tx("현장 안내",b.x+b.w*.82,b.y+b.h*.264,b.w*.14,b.h*.065,
        11,T.white,true,{valign:"mid"});
    }
    if(mode === "public-space") {
      // Screen text uses the fitted source transform and the pictured clockwise baseline.
      tx("보행자 주의\n직접 확인",b.x+b.w*.79,b.y+b.h*.23,b.w*.13,b.h*.10,
        10,"FFD47A",true,{align:"center",valign:"mid",margin:0,rotate:4.5});
    }
    if (mode === "construction" || mode === "public-space") {
      // Same source-image transform for area anchors and labels.
      const anchors = v.scene?.annotations || [];
      for (const [i, a] of anchors.entries()) {
        const x = b.x + a.x * b.w,
          y = b.y + a.y * b.h;
        shape(
          pptx.ShapeType.ellipse,
          x - 0.14,
          y - 0.14,
          0.28,
          0.28,
          T.accent,
          T.white,
        );
        tx(String(i + 1), x - 0.14, y - 0.14, 0.28, 0.28, 11, T.white, true, {
          align: "center",
          valign: "mid",
        });
      }
    }
    if(section.caption)
      tx(section.caption, .68, 6.62, 12.0, .31, 15, T.accent, true);
    region();
  } else if (mode === "screen") {
    const b = await image(spec.image!.path, 0.64, 2.7, 8.15, 3.75);
    // Editable boxes track the two pedestrians on the pictured LED screen.
    for (const [i, r] of [
      [0.67, 0.19, 0.035, 0.18],
      [0.78, 0.18, 0.052, 0.23],
    ].entries()) {
      shape(
        pptx.ShapeType.rect,
        b.x + r[0] * b.w,
        b.y + r[1] * b.h,
        r[2] * b.w,
        r[3] * b.h,
        T.white,
        T.accent,
        {
          fill: { color: T.white, transparency: 100 },
          line: { color: T.accent, width: 1.5 },
        },
      );
      elements.at(-1)!.displayObjectId = `person-${i + 1}`;
    }
    N.forEach((n, i) => {
      const yy = 2.8 + i * 1.18;
      panel(9.1, yy, 3.58, 1.12, i === 0 ? "FFF0D7" : T.white, T.line);
      tx(
        n.label,
        9.3,
        yy + 0.1,
        3.18,
        0.32,
        18,
        i === 0 ? T.amber : T.accent,
        true,
      );
      tx(n.detail, 9.3, yy + 0.49, 3.18, 0.57, 16, T.ink);
      elements.at(-1)!.fieldSafetyIndicator = true;
    });
    if(section.caption)
      tx(section.caption, .68, 6.62, 12.0, .31, 15, T.accent, true);
  } else if (mode === "disaster") {
    const a = await box(0, 0.64, 3.2, 3.65, 1.8);
    const b = await box(1, 4.84, 3.2, 3.65, 1.8, T.tealTint);
    const c = await box(2, 9.04, 3.2, 3.64, 1.8);
    join(a, b);
    join(b, c);
    tx(section.caption, 0.9, 5.55, 11.5, 0.65, 20, T.ink, true, {
      align: "center",
    });
    region();
  } else if (mode === "architecture") {
    const boxes = [];
    for (let i = 0; i < 3; i++)
      boxes.push(
        await box(
          i,
          0.64 + i * 4.2,
          2.85,
          3.64,
          1.8,
          i === 1 ? T.tealTint : T.white,
        ),
      );
    join(boxes[0], boxes[1]);
    join(boxes[1], boxes[2]);
    panel(0.64, 5.38, 12.04, 0.9, T.blueTint, T.line);
    tx(section.caption, 0.86, 5.55, 11.6, 0.5, 19, T.ink, true, {
      align: "center",
    });
    // Policy configuration returns down its own corridor, avoiding component labels.
    line(10.86, 4.65, 10.86, 5.0, T.blue, false);
    line(10.86, 5.0, 6.66, 5.0, T.blue, false);
    line(6.66, 5.0, 6.66, 4.65, T.blue, true);
    region();
  } else if (mode === "package") {
    panel(.64, 2.85, 12.04, 1.04, T.tealTint, T.line);
    await iconLabel(N[3].icon,N[3].label,.84,3.05,3.5,.6,21);
    tx(N[3].detail,4.7,3.02,7.65,.7,18,T.ink);
    // Undirected branches encode the shared service scope, not a data/control sequence.
    const association=(x1:number,y1:number,x2:number,y2:number)=>{
      line(x1,y1,x2,y2,T.accent);
      elements.at(-1)!.semanticConnector=true;
    };
    association(6.66,3.89,6.66,4.15);
    association(2.465,4.15,10.86,4.15);
    for(let i=0;i<3;i++){
      const x=.64+i*4.2;
      association(x+1.825,4.15,x+1.825,4.4);
      await box(i,x,4.4,3.65,1.8);
    }
    tx(section.caption,.78,6.5,11.8,.36,16,T.accent,true);
    region();
  } else if (mode === "techflow") {
    const bounds: {x:number;y:number;w:number;h:number}[] = [];
    for (const [i, n] of N.entries()) {
      const x = 0.64 + i * 3.12;
      panel(x, 2.95, 2.68, 2.45, i === 1 ? T.tealTint : T.white, T.line);
      await iconLabel(n.icon, n.label, x + .16, 3.12, 2.36, .64, 18);
      tx(n.detail, x + .18, 3.96, 2.32, 1.19, 17, T.ink);
      bounds.push({ x, y: 2.95, w: 2.68, h: 2.45 });
    }
    bounds.slice(1).forEach((b,i) => join(bounds[i],b));
    panel(.64, 5.73, 12.04, .82, T.blueTint, T.line);
    tx(section.caption, .85, 5.87, 11.62, .53, 18, T.ink, true, {valign: "mid"});
    region();
  } else if (mode === "timeline") {
    const x0 = 3.12,
      uw = 9.5 / 12;
    for (let i = 0; i < 12; i++) {
      tx(String(i + 1), x0 + i * uw, 2.72, uw, 0.3, 13, T.muted, false, {
        align: "center",
      });
      line(x0 + i * uw, 3.12, x0 + i * uw, 6.23, T.line);
    }
    for (const [i, r] of v.schedule!.ranges.entries()) {
      const n = N.find((n) => n.id === r.nodeId)!,
        y = 3.22 + i * 0.73;
      tx(n.label, 0.64, y, 2.25, 0.48, 19, T.ink, true, { valign: "mid" });
      const x = x0 + r.start * uw,
        w = r.length * uw;
      panel(
        x,
        y,
        w - 0.06,
        0.54,
        i === 2 ? T.accent : T.blue,
        i === 2 ? T.accent : T.blue,
      );
      elements.at(-1)!.timelineRange = { ...r };
      tx(n.detail, x + 0.09, y + 0.04, w - 0.24, 0.46, 15, T.white, true, {
        valign: "mid",
      });
    }
    tx(section.caption, 0.66, 6.3, 12, 0.4, 17, T.ink, true);
    region();
  } else if (mode === "lifecycle") {
    const a = await box(0, 0.64, 2.85, 3.65, 1.8);
    const b = await box(1, 4.84, 2.85, 3.65, 1.8, T.tealTint);
    const c = await box(2, 9.04, 2.85, 3.64, 1.8);
    join(a, b);
    join(b, c);
    line(10.86, 4.65, 10.86, 5.2, T.blue, false);
    line(10.86, 5.2, 2.465, 5.2, T.blue, false);
    line(2.465, 5.2, 2.465, 4.65, T.blue, true);
    tx("다음 현장 재설치·재인수", 4.65, 5.32, 4.1, 0.38, 17, T.blue, true, {
      align: "center",
    });
    tx(section.caption, 0.88, 5.91, 11.5, 0.52, 19, T.ink, true, {
      align: "center",
    });
    region();
  } else if (mode === "decision") {
    const a = await box(0, 0.64, 3.0, 3.65, 2.05, T.tealTint);
    const b = await box(1, 4.84, 3.0, 3.65, 2.05);
    const c = await box(2, 9.04, 3.0, 3.64, 2.05);
    join(a, b);
    join(b, c);
    tx(section.caption, 0.85, 5.65, 11.6, 0.62, 21, T.ink, true, {
      align: "center",
    });
    region();
  } else if (mode === "contact") {
    const c = p.proposer!.contact!;
    await image(c.logoPath, 0.85, 2.95, 5.2, 1.65);
    tx(p.proposer!.legalName, 0.9, 5.05, 5.2, 0.6, 32, T.ink, true);
    tx(section.caption, 0.9, 5.78, 5.2, 0.6, 18, T.muted);
    const rows = [
      ["대표전화", c.phone],
      ["이메일", c.email],
      ["본사", c.address],
    ];
    for (const [i, [label, value]] of rows.entries()) {
      const y = 2.85 + i * 1.2;
      tx(label, 6.9, y, 5.5, 0.3, 14, T.accent, true);
      tx(value, 6.9, y + 0.43, 5.5, 0.6, i === 2 ? 19 : 24, T.ink, true);
      line(6.9, y + 1.08, 12.5, y + 1.08, T.line);
    }
  } else throw Error(`Unknown SLT portfolio composition: ${mode}`);
  return true;
}
