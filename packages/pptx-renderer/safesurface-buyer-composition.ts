import { renderSafeSurfaceInterface } from "./safesurface-interface-composition.js";
import { facingPorts, type ConnectorBox } from "./connector-anchors.js";
import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";
type FittedPhoto = (
  path: string,
  x: number,
  y: number,
  w: number,
  h: number,
) => Promise<{ x: number; y: number; w: number; h: number }>;
/** First-meeting explanations. Text and relationships are authored in the page brief. */
export async function renderSafeSurfaceBuyer(
  ctx: DrawingContext,
  mode: string,
  photo: FittedPhoto,
  kit: ReturnType<typeof professionalKit>,
) {
  const T = resolveTokens(ctx.p);
  const { spec, p, pptx, elements } = ctx,
    v = spec.reasoning!.visualPlan!,
    N = v.nodes;
  const sec = p.businessCase!.sections.find(
    (s) => s.id === spec.reasoning!.sectionId,
  )!;
  const { tx, panel, line, route, shape, iconLabel } = kit;
  if (await renderSafeSurfaceInterface(ctx, kit, photo)) return true;
  const comparison = (criterion: string) => {
    elements.at(-1)!.comparisonCriterion = criterion;
  };
  const bound = (x: number, y: number, w: number, h: number, fill = T.white) =>
    panel(x, y, w, h, fill, T.line);
  const connect = (from: ConnectorBox, to: ConnectorBox, color = T.accent, dash = false, axis: "horizontal" | "vertical" = "horizontal") => {
    const { start, end } = facingPorts(from, to, axis);
    line(start[0], start[1], end[0], end[1], color, true, dash);
  };
  const seq = async () => {
    const w = 12.04 / N.length;
    N.forEach((n, i) => {
      const x = 0.64 + i * w;
      line(x, 3.14, x + w - 0.36, 3.14, i === N.length - 1 ? T.accent : T.blue);
      tx(String(i + 1).padStart(2, "0"), x, 2.75, 0.5, 0.3, 14, T.accent, true);
      bound(x, 3.35, w - 0.36, 2.21, T.white);
      tx(n.label, x + 0.15, 3.5, w - 0.66, 0.7, 21, T.ink, true);
      tx(n.detail, x + 0.15, 4.48, w - 0.66, 0.9, 18, T.muted);
      if (i < N.length - 1)
        connect({ x, y: 3.35, w: w - 0.36, h: 2.21 }, { x: x + w, y: 3.35, w: w - 0.36, h: 2.21 });
    });
  };
  if (mode === "offer-system") {
    const boxes=[
      {x:.64,y:3.24,w:3.3,h:1.16}, {x:4.98,y:3.24,w:3.3,h:1.16}, {x:9.32,y:3.24,w:3.36,h:1.16},
      {x:4.98,y:5.2,w:3.3,h:1.16}, {x:9.32,y:5.2,w:3.36,h:1.16}, {x:.64,y:5.2,w:3.3,h:1.16},
    ];
    N.forEach((n,i)=>{
      const b=boxes[i];bound(b.x,b.y,b.w,b.h,i===1||i===3?T.tealTint:T.white);
      tx(n.label,b.x+.17,b.y+.15,b.w-.34,.36,20,T.ink,true);
      tx(n.detail,b.x+.17,b.y+.67,b.w-.34,.36,15,T.muted);
    });
    connect(boxes[0],boxes[1]);
    tx("관측",4.08,3.43,.76,.2,11,T.accent,true,{align:"center"});
    line(8.28,3.68,9.32,3.68,T.accent,true);
    tx("가열 요청",8.34,3.39,.92,.2,10,T.accent,true,{align:"center"});
    line(9.32,4.06,8.28,4.06,T.blue,true,true);
    tx("출력 확인",8.34,4.17,.92,.2,10,T.blue,true,{align:"center"});
    connect(boxes[1],boxes[3],T.accent,false,"vertical");
    tx("상태·승인 문구",6.83,4.67,2.3,.27,14,T.accent,true);
    connect(boxes[3],boxes[4]);
    tx("주의 안내",8.34,5.35,.92,.2,10,T.accent,true,{align:"center"});
    route([[11,6.36],[11,6.51],[2.29,6.51],[2.29,6.36]],T.amber);
    connect(boxes[5],boxes[0],T.amber,false,"vertical");
    tx("점검·재관측",2.49,4.67,2.1,.27,14,T.amber,true);
  } else if (mode === "product-difference") {
    const d = p.quantitativeDatasets.find(d => d.id === v.chart!.datasetId)!;
    bound(0.64, 2.76, 6.02, 3.7);
    bound(6.91, 2.76, 5.77, 3.7);
    await photo(v.scene!.path, 0.76, 2.86, 5.78, 3.19);
    tx("구리나노섬유 필름 → 면상 발열 → 노면 융설", 0.8, 6.14, 5.7, 0.28, 14, T.accent, true);
    tx("기존 대비 약 10%", 7.05, 2.91, 5.45, 0.66, 30, T.accent, true);
    tx("소비에너지 · 최대 절감 조건 환산", 7.05, 3.69, 5.45, 0.36, 17, T.ink, true);
    tx("제조사 제시 최대 90% 절감", 7.05, 4.16, 5.45, 0.36, 18, T.ink, true);
    ctx.slide.addChart(pptx.ChartType.bar, [{name:d.rows[0].series,labels:d.rows.map(r=>r.category),values:d.rows.map(r=>r.value)}], {
      x:7.03,y:4.65,w:5.48,h:1.42,barDir:"bar",showLegend:false,
      catAxisLabelFontFace:p.design.font,catAxisLabelFontSize:15,valAxisLabelFontSize:10,
      showValue:true,dataLabelPosition:"outEnd",dataLabelColor:T.ink,dataLabelFormatCode:"0",
      chartColors:[T.accent],showBorder:false,showTitle:false,showCatName:false,
      valAxisMinVal:0,valAxisMaxVal:120,valAxisMajorUnit:50,showShadow:false,
      catAxisMultiLevelLabels:false,
    });
    elements.push({slideId:spec.id,id:"ecoway-energy-comparison",kind:"chart",dataRef:d.id,x:7.03,y:4.65,w:5.48,h:1.42});
    tx("상대 소비에너지 지수 · 기존 도로열선=100",7.05,6.16,5.4,0.28,12,T.muted);
  } else if (mode === "annotated-scene") {
    const f = await photo(v.scene!.path, 0.64, 2.67, 7.5, 3.84);
    for (const [i, n] of N.entries()) {
      const y = 2.76 + i * 1.2;
      panel(8.55, y, 0.38, 0.38, T.accent, T.accent);
      tx(String(i + 1), 8.55, y, 0.38, 0.38, 16, T.white, true, {
        align: "center",
        valign: "mid",
      });
      tx(n.label, 9.1, y, 3.5, 0.45, 20, T.ink, true);
      tx(n.detail, 9.1, y + 0.57, 3.5, 0.65, 17, T.muted);
      const a = v.scene!.annotations?.find((a) => a.nodeId === n.id);
      if (a) {
        const x = f.x + a.x * f.w,
          yy = f.y + a.y * f.h;
        panel(x - 0.17, yy - 0.17, 0.34, 0.34, T.accent, T.accent);
        tx(String(i + 1), x - 0.17, yy - 0.17, 0.34, 0.34, 14, T.white, true, {
          align: "center",
          valign: "mid",
        });
      }
    }
  } else if (mode === "risk-cycle") {
    await seq();
    for (let i = 0; i < 4; i++) {
      const x = 0.64 + i * 3.01;
      shape(
        pptx.ShapeType.rect,
        x,
        5.8,
        2.65,
        0.43,
        i === 1 || i === 3 ? "F0DDC0" : T.tealTint,
        i === 1 || i === 3 ? "F0DDC0" : T.tealTint,
      );
      tx(
        sec.rows![0][i],
        x + 0.13,
        5.86,
        2.39,
        0.28,
        14,
        i === 1 || i === 3 ? T.amber : T.accent,
        true,
      );
    }
  } else if (mode === "access-journey") {
    const xs = [3.0, 6.2, 9.4];
    N.forEach((n, i) => {
      tx(n.label, xs[i], 2.76, 2.93, 0.43, 21, T.ink, true);
      tx(n.detail, xs[i], 3.32, 2.93, 0.64, 16, T.muted);
    });
    for (let r = 0; r < 2; r++) {
      const y = 4.27 + r * 1.0,
        row = sec.rows![r];
      shape(
        pptx.ShapeType.rect,
        0.64,
        y,
        12.04,
        0.79,
        r ? "F6ECD9" : T.tealTint,
        r ? "F6ECD9" : T.tealTint,
      );
      tx(row[0], 0.82, y + 0.2, 1.84, 0.37, 17, r ? T.amber : T.accent, true);
      comparison(row[0]);
      for (let i = 0; i < 3; i++) {
        bound(xs[i] - 0.08, y + 0.09, 2.88, 0.61, r ? "F6ECD9" : T.tealTint);
        tx(
          row[i + 1],
          xs[i],
          y + 0.17,
          2.72,
          0.48,
          17,
          T.ink,
          i === 1 && r === 1,
          { valign: "mid" },
        );
        comparison(row[0]);
        if (i < 2)
          line(
            xs[i] + 2.8,
            y + 0.4,
            xs[i + 1] - 0.08,
            y + 0.4,
            r ? T.amber : T.accent,
            true,
            r === 1 && i === 1,
          );
      }
    }
  } else if (mode === "manager-cycle") {
    await seq();
    route(
      [
        [11.52, 5.56],
        [11.52, 6.12],
        [1.5, 6.12],
        [1.5, 5.56],
      ],
      T.amber,
      true,
    );
    tx(sec.rows![0][0], 3.1, 5.8, 7.2, 0.34, 16, T.amber, true, {
      align: "center",
    });
  } else if (mode === "heat-path" || mode === "alert-journey") {
    await seq();
    const row = sec.rows![0];
    row.forEach((text, i) => {
      const x = 0.64 + i * 3.01;
      bound(x, 5.83, 2.65, 0.52, i === 3 ? T.tealTint : T.panel);
      tx(text, x + 0.12, 5.91, 2.41, 0.33, 14, T.accent, true, {
        align: "center",
      });
    });
  } else if (mode === "vision-hub") {
    const pos = [
      [0.64, 2.72],
      [0.64, 4.03],
      [0.64, 5.34],
      [9.08, 2.72],
      [9.08, 4.03],
      [9.08, 5.34],
    ];
    bound(4.76, 4.09, 3.65, 1.02, T.tealTint);
    tx("EcowayVision", 4.98, 4.35, 3.21, 0.47, 24, T.ink, true, {
      align: "center",
    });
    for (let i = 0; i < 6; i++) {
      const [x, y] = pos[i];
      bound(x, y, 3.6, 1.02);
      tx(N[i].label, x + 0.16, y + 0.13, 3.28, 0.36, 19, T.ink, true);
      tx(N[i].detail, x + 0.16, y + 0.57, 3.28, 0.36, 15, T.muted);
      const isLeft = i < 3,
        xx = isLeft ? 4.76 : 8.41,
        gx = isLeft ? 4.48 : 8.7,
        target = isLeft ? 4.24 : 9.08;
      route(
        [
          [xx, 4.6],
          [gx, 4.6],
          [gx, y + 0.51],
          [target, y + 0.51],
        ],
        T.accent,
      );
    }
  } else if (mode === "vision-dashboard") {
    bound(0.64, 2.73, 8.16, 3.6);
    shape(pptx.ShapeType.rect, 0.64, 2.73, 8.16, 0.48, T.ink, T.ink);
    tx("EcowayVision  /  대시보드", 0.84, 2.82, 7.76, 0.3, 16, T.white, true);
    bound(0.88, 3.42, 2.2, 2.63, T.panel);
    tx(N[0].label, 1.05, 3.63, 1.86, 0.48, 20, T.ink, true);
    tx(N[0].detail, 1.05, 4.37, 1.86, 1.05, 18, T.muted);
    tx(N[1].label, 3.43, 3.51, 4.92, 0.4, 20, T.ink, true);
    tx(N[1].detail, 3.43, 4.02, 4.92, 0.65, 20, T.accent, true);
    line(3.43, 4.8, 8.36, 4.8, T.line);
    tx(N[2].label, 3.43, 5.04, 4.92, 0.4, 19, T.ink, true);
    tx(N[2].detail, 3.43, 5.57, 4.92, 0.4, 17, T.muted);
    bound(9.32, 3.42, 3.36, 2.63, T.tealTint);
    tx(N[3].label, 9.55, 3.66, 2.9, 0.48, 22, T.ink, true);
    tx(N[3].detail, 9.55, 4.46, 2.9, 1.03, 19, T.muted);
    connect({x:0.64,y:3.42,w:8.16,h:2.63},{x:9.32,y:3.42,w:3.36,h:2.63});
  } else if (mode === "vision-detail") {
    shape(pptx.ShapeType.rect, 0.64, 2.73, 12.04, 0.48, T.ink, T.ink);
    tx(
      "EcowayVision  /  선택한 현장 상세",
      0.85,
      2.82,
      11.6,
      0.3,
      16,
      T.white,
      true,
    );
    const xs = [0.64, 6.87],
      ys = [3.46, 5.01];
    for (let i = 0; i < 4; i++) {
      const x = xs[i % 2],
        y = ys[Math.floor(i / 2)];
      bound(x, y, 5.81, 1.16, i % 2 ? T.tealTint : T.white);
      tx(N[i].label, x + 0.21, y + 0.17, 5.39, 0.36, 20, T.ink, true);
      tx(N[i].detail, x + 0.21, y + 0.69, 5.39, 0.4, 18, T.muted);
    }
    connect({x:0.64,y:3.46,w:5.81,h:1.16},{x:6.87,y:3.46,w:5.81,h:1.16});
    connect({x:0.64,y:5.01,w:5.81,h:1.16},{x:6.87,y:5.01,w:5.81,h:1.16});
    connect({x:0.64,y:3.46,w:5.81,h:1.16},{x:0.64,y:5.01,w:5.81,h:1.16},T.accent,false,"vertical");
    connect({x:6.87,y:3.46,w:5.81,h:1.16},{x:6.87,y:5.01,w:5.81,h:1.16},T.accent,false,"vertical");
  } else if (mode === "vision-ai") {
    const xs = [0.64, 3.75, 6.86, 9.97],
      ww = 2.71;
    N.forEach((n, i) => {
      bound(xs[i], 3.21, ww, 2.31, i === 1 ? T.tealTint : T.white);
      tx(n.label, xs[i] + 0.17, 3.43, ww - 0.34, 0.76, 20, T.ink, true);
      tx(n.detail, xs[i] + 0.17, 4.45, ww - 0.34, 0.86, 17, T.muted);
      if (i < 3)
        connect({x:xs[i],y:3.21,w:ww,h:2.31},{x:xs[i+1],y:3.21,w:ww,h:2.31});
    });
    tx(sec.rows![0][0], 0.86, 5.94, 11.6, 0.42, 16, T.accent, true);
  } else if (mode === "control-stages") {
    const w = 3.01;
    route([[11.0,3.08],[11.0,2.9],[1.965,2.9],[1.965,3.08]],T.accent);
    tx("위험 해소 시 정지",3.5,2.62,6.0,.23,13,T.accent,true,{align:"center"});
    N.slice(0, 4).forEach((n, i) => {
      const x = 0.64 + i * w;
      bound(x, 3.08, 2.65, 1.56, i === 2 ? T.tealTint : T.white);
      tx(n.label, x + 0.16, 3.28, 2.33, 0.55, 19, T.ink, true);
      tx(n.detail, x + 0.16, 3.95, 2.33, 0.54, 16, T.muted);
      if (i < 3) connect({x,y:3.08,w:2.65,h:1.56},{x:x+w,y:3.08,w:2.65,h:1.56});
    });
    bound(4.35, 5.37, 4.65, 0.8, "F9E9E5");
    tx(N[4].label, 4.55, 5.52, 4.25, 0.41, 21, T.red, true, {
      align: "center",
    });
    for (let i = 0; i < 4; i++) {
      line(1.96 + i * w, 4.64, 1.96 + i * w, 4.97, T.red);
    }
    line(1.96, 4.97, 11.0, 4.97, T.red);
    line(6.67, 4.97, 6.67, 5.37, T.red, true);
    tx(N[4].detail, 9.38, 5.45, 3.27, 0.72, 17, T.red);
  } else if (mode === "operations-branches") {
    for (let r = 0; r < 2; r++) {
      const y = 3.0 + r * 1.7;
      for (let c = 0; c < 2; c++) {
        const n = N[r * 2 + c],
          x = 0.64 + c * 6.45;
        bound(x, y, 5.59, 1.35, c ? T.tealTint : T.white);
        tx(n.label, x + 0.22, y + 0.2, 5.15, 0.42, 22, T.ink, true);
        tx(n.detail, x + 0.22, y + 0.83, 5.15, 0.39, 18, T.muted);
      }
      connect({x:0.64,y,w:5.59,h:1.35},{x:7.09,y,w:5.59,h:1.35});
    }
  } else if (mode === "integrated-day") {
    const xs = [2.19, 4.86, 7.53, 10.2];
    N.forEach((n, i) => {
      tx(n.label, xs[i], 2.76, 2.43, 0.63, 19, T.ink, true);
    });
    const labels = sec.items.map((i) => i.label);
    sec.rows!.forEach((row, r) => {
      const y = 3.62 + r * 1.1;
      shape(
        pptx.ShapeType.rect,
        0.64,
        y,
        12.04,
        0.94,
        r ? T.tealTint : T.panel,
        r ? T.tealTint : T.panel,
      );
      tx(labels[r], 0.81, y + 0.27, 1.2, 0.38, 16, T.accent, true);
      for (let i = 0; i < 4; i++) {
        bound(xs[i] - 0.08, y + 0.10, 2.46, 0.74, r ? T.tealTint : T.panel);
        tx(row[i], xs[i], y + 0.19, 2.3, 0.64, 16, T.ink);
        if (i < 3)
          line(
            xs[i] + 2.38,
            y + 0.47,
            xs[i + 1] - 0.08,
            y + 0.47,
            T.accent,
            true,
          );
      }
    });
  } else if (mode === "support-model") {
    const xs = [0.64, 4.8, 8.96];
    N.forEach((n, i) => {
      bound(xs[i], 3.1, 3.72, 2.45, i === 1 ? T.tealTint : T.white);
      tx(n.label, xs[i] + 0.22, 3.37, 3.28, 0.66, 22, T.ink, true);
      tx(n.detail, xs[i] + 0.22, 4.39, 3.28, 0.95, 18, T.muted);
      if (i < 2) {
        line(xs[i] + 3.72, 4.12, xs[i + 1], 4.12, T.accent, true);
        line(xs[i + 1], 4.53, xs[i] + 3.72, 4.53, T.accent, true, true);
      }
    });
  } else return false;
  return true;
}
