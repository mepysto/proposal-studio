import { renderSafehomeComposition } from "./safehome-composition.js";
import { renderPublicSafety } from "./public-safety-composition.js";
import { renderSafeSurfaceComposition } from "./safesurface-composition.js";
import { renderSltAiComposition } from "./slt-ai-composition.js";
import { renderMunicipalComposition } from "./municipal-composition.js";
import { renderContactComposition } from "./contact-composition.js";
import { renderPositioningComposition } from "./positioning-composition.js";
import { renderProductComposition } from "./product-composition.js";
import { renderDecisionComposition } from "./decision-composition.js";
import { renderEvidenceComposition } from "./evidence-composition.js";
import sharp from "sharp";
import type { DrawingContext } from "./semantic.js";
import { professionalKit, layoutGraph, resolveTokens } from "./professional-kit.js";

/** Technical editorial layouts. Native text/components with licensed vector symbols and computed graph routes. */
export async function renderVisualComposition(ctx: DrawingContext) {
  const T = resolveTokens(ctx.p);
  const { p, spec, pptx, elements, image } = ctx,
    v = spec.reasoning?.visualPlan;
  if (!v) return false;
  if (await renderSafehomeComposition(ctx)) return true;
  if (await renderPublicSafety(ctx)) return true;
  if (await renderSltAiComposition(ctx)) return true;
  if (await renderSafeSurfaceComposition(ctx)) return true;
  if (await renderContactComposition(ctx)) return true;
  if (await renderPositioningComposition(ctx)) return true;
  if (await renderMunicipalComposition(ctx)) return true;
  if (await renderProductComposition(ctx)) return true;
  if (await renderDecisionComposition(ctx)) return true;
  if (await renderEvidenceComposition(ctx)) return true;
  const k = professionalKit(ctx),
    {
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
    } = k;
  const legal = p.proposer?.legalName || "제안 주관 미확정";
  const section = p.businessCase?.sections.find(
    (s) => s.id === spec.reasoning?.sectionId,
  );
  const N = v.nodes;
  const photo = async (x: number, y: number, w: number, h: number) => {
    if (!spec.image) throw Error(`Image missing: ${spec.id}`);
    const m = await sharp(spec.image.path).metadata(),
      r = Math.min(w / m.width!, h / m.height!);
    const iw = m.width! * r,
      ih = m.height! * r,
      ix = spec.reasoning?.stage === "intervention" ? x + w - iw : x,
      iy = y + (h - ih) / 2;
    panel(ix, iy, iw, ih, T.white, T.line);
    await image(ix, iy, iw, ih);
    return { x: ix, y: iy, w: iw, h: ih };
  };
  const smallNote = (
    s: string,
    x: number,
    y: number,
    w: number,
    color = T.muted,
  ) => tx(s, x, y, w, 0.55, 13, color);
  const titleNode = async (
    i: number,
    x: number,
    y: number,
    w: number,
    h = 1.42,
  ) => node(N[i], x, y, w, h);
  const flatLabel = async (i: number, x: number, y: number, w: number) => {
    await icon(N[i].icon, x, y, 0.38);
    tx(N[i].label, x + 0.6, y, w - 0.6, 0.42, 19, T.ink, true);
    tx(N[i].detail, x + 0.6, y + 0.59, w - 0.6, 0.7, 14, T.muted);
  };
  const mark = (s: string, x: number, y: number) => {
    panel(x, y, 0.36, 0.36, T.accent, T.accent);
    tx(s, x, y, 0.36, 0.36, 11, T.white, true, { align: "center", valign: "mid" });
  };
  const planSite = async (
    x: number,
    y: number,
    w: number,
    h: number,
    mode = "risk",
  ) => {
    if (!v.scene) throw Error(`Missing spatial scene: ${spec.id}`);
    const m = await sharp(v.scene.path).metadata(),
      scale = Math.min(w / m.width!, h / m.height!);
    const iw = m.width! * scale,
      ih = m.height! * scale,
      ix = spec.reasoning?.stage === "intervention" ? x + w - iw : x,
      iy = y + (h - ih) / 2;
    panel(ix, iy, iw, ih, T.white, T.line);
    ctx.slide.addImage({ path: v.scene.path, x: ix, y: iy, w: iw, h: ih });
    elements.push({
      slideId: spec.id,
      id: `spatial-scene-${x}`,
      kind: "image",
      x: ix,
      y: iy,
      w: iw,
      h: ih,
      image: {
        path: v.scene.path,
        width: m.width!,
        height: m.height!,
        dpi: Math.min(m.width! / iw, m.height! / ih),
      },
    });
    if (mode === "risk") {
      line(
        ix + iw * 0.64,
        iy + ih * 0.29,
        ix + iw * 0.64,
        iy + ih * 0.77,
        T.amber,
        true,
        true,
      );
      line(
        ix + iw * 0.12,
        iy + ih * 0.75,
        ix + iw * 0.86,
        iy + ih * 0.75,
        T.accent,
        true,
      );
    } else if (mode === "separate") {
      pill("동선·시야 확보", x + 0.15, y + 0.15, 1.62, T.blue);
      line(
        ix + iw * 0.12,
        iy + ih * 0.76,
        ix + iw * 0.87,
        iy + ih * 0.76,
        T.blue,
        true,
      );
    } else if (mode === "human") {
      pill("유도원 통행 관리", x + 0.15, y + 0.15, 1.83, T.blue);
      shape(
        pptx.ShapeType.ellipse,
        ix + iw * 0.785 - 0.13,
        iy + ih * 0.59 - 0.13,
        0.26,
        0.26,
        T.white,
        T.blue,
        {
          fill: { color: T.white, transparency: 100 },
          line: { color: T.blue, width: 1.3 },
        },
      );
    } else if (mode === "ai") {
      pill("접근 감지·담당자 경고", x + 0.15, y + 0.15, 2.25, T.accent);
      shape(
        pptx.ShapeType.ellipse,
        ix + iw * 0.785 - 0.13,
        iy + ih * 0.34 - 0.13,
        0.26,
        0.26,
        T.white,
        T.accent,
        {
          fill: { color: T.white, transparency: 100 },
          line: { color: T.accent, width: 1.3 },
        },
      );
    }
  };
  if (v.kind === "existing" && spec.reasoning?.stage === "decision") {
    await image(5.95, 0, 7.38, 7.5);
    shape(pptx.ShapeType.rect, 0, 0, 5.96, 7.5, T.ink, T.ink);
    tx("제안 주관", 0.64, 0.5, 4.6, 0.26, 11, "B1CFD8", true);
    tx(legal, 0.64, 0.94, 4.9, 0.5, 25, T.white, true);
    tx(spec.title, 0.64, spec.title.split("\n").length>3?1.82:2.02, 4.95, spec.title.split("\n").length>3?2.4:2.12, 34, T.white, true);
    if(!messageBand(.64,4.44,4.95,1.12,19,true))
      tx(spec.message, 0.64, 4.5, 4.85, 0.93, 18, "DAE5EC");
    tx("기술 협력", 0.64, 5.95, 4.7, 0.24, 11, "B1CFD8", true);
    tx(
      (p.proposer?.coverCollaborators ?? p.proposer?.collaborators)?.join(" · ") || "협의 중",
      0.64,
      6.34,
      4.86,
      0.4,
      16,
      T.white,
    );
    return true;
  }
  if (
    v.kind === "existing" &&
    ["budget", "time-scenario"].includes(section?.id || "")
  )
    return false;
  header(
    section?.kicker ||
      (
        {
          problem: "위험 구조와 기존 조치",
          alternatives: "대안별 대응 범위",
          operation: "시스템과 현장 책임",
        } as any
      )[spec.reasoning?.stage || ""] ||
      "사업 설계",
    v.takeaway,
  );
  if (v.kind === "existing") {
    if (spec.reasoning?.stage === "intervention") {
      const frame = await photo(4.69, 2.62, 7.99, 3.86);
      for (const [i, item] of p.planning!.interventions.entries()) {
        const yy = 2.76 + i * 1.15;
        mark(String(i + 1), 0.66, yy);
        tx(item.name, 1.22, yy, 3.2, 0.41, 18, T.ink, true);
        smallNote(item.action, 1.22, yy + 0.55, 3.2);
        const a = spec.image?.annotations?.find(
          (a) => a.interventionId === item.id,
        );
        if (a)
          mark(
            String(i + 1),
            frame.x + a.x * frame.w - 0.18,
            frame.y + a.y * frame.h - 0.18,
          );
      }
    } else {
      await photo(0.64, 2.62, 5.55, 3.86);
      for (const [i, item] of (section?.items || []).entries()) {
        const y = 2.75 + i * 1.15;
        await icon(["footprints", "signpost", "sun"][i], 6.65, y, 0.38);
        tx(item.label, 7.22, y, 5.35, 0.43, 18, T.ink, true);
        smallNote(item.detail, 7.22, y + 0.55, 5.35);
      }
    }
  } else if (v.kind === "flow" || v.kind === "decision") {
    tx(
      v.kind === "flow"
        ? `${legal}의 제안 범위`
        : `${legal} 제안 · 공동조사와 제한 실증 협의`,
      0.67,
      2.63,
      11.8,
      0.3,
      14,
      T.accent,
      true,
    );
    const graph = await layoutGraph(N, v.edges, 12.04, 2.65),
      ox = 0.64,
      oy = 3.24;
    for (const e of graph.edges)
      route(e.points.map((q) => [q[0] + ox, q[1] + oy]));
    for (const n of graph.nodes) {
      const data = N.find((d) => d.id === n.id)!;
      await node(data, ox + n.x, oy + n.y, n.w, n.h, T.accent);
    }
    const outputs =
      v.kind === "flow"
        ? ["현장 조건과 담당자", "경고·조치 검증 기록", "후속 현장 적용 기준"]
        : [
            "출입구·보행 조건 기록",
            "협의 범위와 책임자",
            "견적·시험 수용 조건",
          ];
    outputs.forEach((s, i) => {
      const x = 0.8 + i * 4.1;
      tx(`산출물 ${i + 1}`, x, 5.85, 3.7, 0.23, 10, T.accent, true);
      tx(s, x, 6.16, 3.7, 0.31, 15, T.ink, true);
    });
  } else if (v.kind === "context") {
    const codes = ["와촌동", "원성동", "봉명동"];
    for (let i = 0; i < 3; i++) {
      const x = 0.64 + i * 4.12;
      panel(x, 2.72, 3.8, 2.15);
      pill(codes[i], x + 0.2, 2.94, 1.12);
      await icon(N[i].icon, x + 2.97, 2.98, 0.47, T.blue);
      tx(N[i].label, x + 0.2, 3.55, 3.4, 0.43, 22, T.ink, true);
      smallNote(N[i].detail, x + 0.2, 4.15, 3.38);
      line(x + 1.9, 4.91, x + 1.9, 5.3, T.accent);
    }
    panel(0.64, 5.36, 12.04, 0.98, T.tealTint, T.tealTint);
    await icon("route", 0.91, 5.61, 0.4);
    tx("공사 구역과 생활권의 접점", 1.57, 5.57, 5.2, 0.4, 21, T.ink, true);
    tx(
      "보행 연속성 · 차량 진출입 · 관리 책임",
      7.0,
      5.71,
      5.3,
      0.35,
      15,
      T.muted,
    );
  } else if (v.kind === "bridge") {
    for (let i = 0; i < 3; i++) {
      const y = 2.73 + i * 1.14;
      await icon(N[i].icon, 0.78, y + 0.17, 0.4, T.blue);
      tx(N[i].label, 1.45, y + 0.08, 4.7, 0.4, 19, T.ink, true);
      smallNote(N[i].detail, 1.45, y + 0.59, 4.8);
      line(6.42, y + 0.39, 7.38, y + 0.39, T.accent, true);
    }
    panel(7.68, 2.72, 4.99, 3.56, T.tealTint, T.tealTint);
    pill("제안의 적용점", 7.97, 3.0, 1.57);
    tx("공사 중\n보행안전 실증", 7.98, 3.72, 4.1, 1.04, 28, T.ink, true);
    tx(
      "기존 사업의 방향과 연결\n승인·예산·API는 별도 협의",
      7.98,
      5.2,
      4.12,
      0.75,
      17,
      T.muted,
    );
  } else if (v.kind === "site" || v.kind === "scope") {
    await planSite(0.64, 2.71, 7.25, 3.64, v.kind === "scope" ? "ai" : "risk");
    for (let i = 0; i < 3; i++) {
      const y = 2.77 + i * 1.18;
      mark(`0${i + 1}`, 8.3, y);
      tx(N[i].label, 8.9, y, 3.7, 0.4, 19, T.ink, true,{valign:"mid"});
      smallNote(N[i].detail, 8.9, y + 0.54, 3.7);
    }
  } else if (v.kind === "journey") {
    const cols = [2.34, 4.99, 7.64, 10.29],
      rn = ["차량", "시민", "현장 대응"],
      cells = [
        ["출입구 접근", "진출입 대기", "유도에 따라 이동", "통과 여부 확인"],
        ["보도 이동", "접점 접근", "유도에 따라 통행", "이동 계속"],
        ["감지·조건 비교", "담당자 경고", "유도원 통행 관리", "조치 이력 저장"],
      ];
    for (let i = 0; i < 4; i++) {
      pill(`0${i + 1}`, cols[i], 2.73, 0.52);
      tx(N[i].label, cols[i] + 0.7, 2.73, 1.87, 0.35, 17, T.ink, true,{valign:"mid"});
    }
    for (let r = 0; r < 3; r++) {
      const y = 3.45 + r * 0.94;
      panel(
        0.64,
        y,
        12.04,
        0.78,
        r % 2 ? T.white : T.panel,
        r % 2 ? T.white : T.panel,
      );
      await iconLabel(["truck","footprints","hard-hat"][r],rn[r],.85,y+.18,1.46,.42,14,r===2?T.accent:T.blue);
      for (let j = 0; j < 4; j++) {
        tx(cells[r][j], cols[j] + 0.05, y + 0.2, 2.08, 0.4, 15, T.ink,false,{valign:"mid"});
        if (j < 3)
          line(
            cols[j] + 2.18,
            y + 0.4,
            cols[j] + 2.54,
            y + 0.4,
            T.accent,
            true,
          );
      }
    }
  } else if (v.kind === "shortlist") {
    const sites = p.businessCase!.candidates,
      status = ["우선 공동조사", "예비 협의", "조건 확인 후 재검토"];
    for (let i = 0; i < 3; i++) {
      const y = 2.72 + i * 1.19;
      panel(0.64, y, 12.04, 1.01);
      tx(
        String.fromCharCode(65 + i),
        0.91,
        y + 0.26,
        0.53,
        0.45,
        26,
        i === 0 ? T.accent : T.muted,
        true,
      );
      tx(sites[i].name, 1.67, y + 0.19, 5.2, 0.4, 22, T.ink, true);
      tx(sites[i].address, 1.67, y + 0.67, 5.2, 0.24, 13, T.muted);
      line(7.8, y + 0.5, 8.59, y + 0.5, T.line, true);
      pill(
        status[i],
        8.93,
        y + 0.31,
        3.43,
        i === 0 ? T.accent : i === 1 ? T.blue : T.muted,
      );
    }
  } else if (v.kind === "gates") {
    const risk = section?.id === "risks";
    tx("확인 항목", 0.78, 2.63, 3.3, 0.24, 11, T.muted, true);
    tx("현장 확인·검토 내용", 4.15, 2.63, 5.3, 0.24, 11, T.muted, true);
    for (let i = 0; i < 4; i++) {
      const y = 3.04 + i * 0.72;
      panel(
        0.64,
        y,
        9.47,
        0.58,
        i % 2 ? T.white : T.panel,
        i % 2 ? T.white : T.panel,
      );
      await icon(N[i].icon, 0.81, y + 0.12, 0.28, T.blue);
      tx(N[i].label, 1.28, y + 0.15, 2.65, 0.3, 16, T.ink, true);
      tx(N[i].detail, 4.15, y + 0.16, 5.32, 0.31, 14, T.muted);
      route(
        [
          [10.15, y + 0.29],
          [10.65, y + 0.29],
          [10.65, 4.43],
          [11.03, 4.43],
        ],
        T.line,
      );
    }
    panel(11.1, 3.75, 1.58, 1.34, T.tealTint, T.tealTint);
    tx("모두 충족 시", 11.28, 3.94, 1.23, 0.36, 13, T.accent, true);
    tx(
      risk ? "다음 단계" : "선정 검토",
      11.28,
      4.44,
      1.23,
      0.4,
      16,
      T.ink,
      true,
    );
    panel(0.64, 6.08, 12.04, 0.33, "F9EEE5", "F9EEE5");
    tx(
      risk
        ? "미충족 시 보류·수정·중단"
        : "수요가 작거나 보행을 악화시키면 보류·대안 검토",
      0.86,
      6.14,
      11.6,
      0.22,
      12,
      T.amber,
      true,
    );
  } else if (v.kind === "image-detail") {
    await photo(0.64, 2.62, 6.03, 3.87);
    for (let i = 0; i < 3; i++) {
      const y = 2.72 + i * 1.16;
      mark(String(i + 1), 7.03, y);
      tx(N[i].label, 7.6, y, 5.0, 0.4, 18, T.ink, true);
      smallNote(N[i].detail, 7.6, y + 0.54, 5.0);
    }
  } else if (v.kind === "comparison") {
    for (let i = 0; i < 3; i++) {
      const x = 0.64 + i * 4.12;
      await planSite(x, 2.72, 3.8, 2.3, ["separate", "human", "ai"][i]);
      pill(
        ["기본 조치", "현장 통제", "보완 기능"][i],
        x,
        5.22,
        1.36,
        i === 2 ? T.accent : T.blue,
      );
      tx(N[i].label, x, 5.77, 3.8, 0.42, 19, T.ink, true);
      tx(
        N[i].detail.split("\n").slice(1).join(" "),
        x,
        6.23,
        3.8,
        0.3,
        13,
        T.muted,
      );
    }
  } else if (v.kind === "system") {
    panel(0.64, 2.65, 8.35, 3.78, T.panel, T.panel);
    tx(
      "현장 감지·경고와 실제 통행 관리",
      0.91,
      2.88,
      7.8,
      0.3,
      14,
      T.ink,
      true,
    );
    panel(9.35, 2.65, 3.33, 3.78, T.blueTint, T.blueTint);
    tx("운영 기록", 9.62, 2.88, 2.78, 0.3, 14, T.ink, true);
    const pos = [
      [0.91, 3.56, 2.3, 1.55],
      [3.67, 3.56, 2.3, 1.55],
      [6.43, 3.56, 2.3, 1.55],
      [9.65, 3.56, 2.72, 1.55],
      [6.43, 5.57, 2.3, 0.65],
      [9.65, 5.57, 2.72, 0.65],
    ];
    for (let i = 0; i < 4; i++)
      await node(
        N[i],
        pos[i][0],
        pos[i][1],
        pos[i][2],
        pos[i][3],
        i === 2 ? T.amber : T.accent,
      );
    for (let i = 4; i < 6; i++) {
      panel(pos[i][0], pos[i][1], pos[i][2], pos[i][3], T.white, T.line);
      await icon(
        N[i].icon,
        pos[i][0] + 0.14,
        pos[i][1] + 0.14,
        0.3,
        i === 4 ? T.amber : T.accent,
      );
      tx(
        N[i].label,
        pos[i][0] + 0.61,
        pos[i][1] + 0.18,
        pos[i][2] - 0.74,
        0.31,
        15,
        T.ink,
        true,
      );
    }
    line(3.23, 4.12, 3.58, 4.12, T.accent, true);
    line(5.99, 4.12, 6.34, 4.12, T.accent, true);
    line(7.58, 5.16, 7.58, 5.49, T.amber, true);
    line(8.76, 5.9, 9.58, 5.9, T.accent, true);
    line(11.01, 5.53, 11.01, 5.16, T.accent, true, true);
  } else if (v.kind === "boundary") {
    panel(0.64, 2.68, 8.15, 3.75, T.panel, T.panel);
    pill("초도 실증", 0.9, 2.92, 1.23);
    tx("현장 독립 운영", 2.38, 2.95, 5.99, 0.4, 20, T.ink, true);
    await node(N[0], 0.92, 4.02, 3.23, 1.77);
    await node(N[1], 5.25, 4.02, 3.23, 1.77);
    line(4.2, 4.65, 5.17, 4.65, T.accent, true);
    panel(9.3, 2.68, 3.38, 3.75, T.white, T.line);
    pill("후속 협의", 9.58, 2.92, 1.23, T.blue);
    await icon("network", 10.6, 3.63, 0.62, T.blue);
    tx(N[2].label, 9.58, 4.68, 2.82, 0.55, 20, T.ink, true);
    tx(N[2].detail, 9.58, 5.46, 2.82, 0.71, 15, T.muted);
    line(8.83, 4.64, 9.23, 4.64, T.blue, true, true);
  } else if (v.kind === "swimlane") {
    const xs = [1.84, 4.0, 6.16, 8.32, 10.48];
    panel(1.79, 2.76, 10.89, 1.71, T.panel, T.panel);
    panel(1.79, 4.87, 10.89, 1.1, "F5EBDD", "F5EBDD");
    tx("시스템", 0.64, 3.42, 1.1, 0.4, 17, T.accent, true);
    tx("현장 담당자", 0.64, 5.25, 1.1, 0.58, 14, T.amber, true);
    for (let i = 0; i < 5; i++) {
      if (i === 3) continue;
      await icon(N[i].icon, xs[i] + 0.64, 3.02, 0.47);
      tx(N[i].label, xs[i] + 0.1, 3.88, 1.91, 0.38, 17, T.ink, true);
      if (i < 2)
        line(xs[i] + 1.65, 3.29, xs[i + 1] + 0.17, 3.29, T.accent, true);
    }
    await icon("hard-hat", 8.91, 5.03, 0.39, T.amber);
    tx(N[3].label, 8.45, 5.57, 1.93, 0.31, 16, T.amber, true);
    route(
      [
        [7.82, 3.29],
        [9.12, 3.29],
        [9.12, 4.8],
      ],
      T.amber,
    );
    route(
      [
        [9.96, 5.38],
        [11.34, 5.38],
        [11.34, 4.55],
      ],
      T.amber,
    );
    tx("검증 기록", 0.64, 6.16, 1.08, 0.3, 13, T.ink, true);
    tx(
      "감지 시각   /   조건·판단 결과   /   장치 실동작   /   담당자·조치 시각   /   이벤트 이력",
      1.93,
      6.16,
      10.69,
      0.3,
      13,
      T.muted,
    );
  } else if (v.kind === "timeline") {
    const s = v.schedule!,
      x0 = 4.12,
      u = 8.28 / s.slots;
    for (let i = 0; i < s.slots; i++) {
      tx(`${i + 1}`, x0 + i * u + 0.35, 2.69, 0.5, 0.29, 13, T.muted);
      shape(
        pptx.ShapeType.line,
        x0 + i * u,
        3.13,
        0.001,
        3.22,
        T.line,
        T.line,
        { line: { color: T.line, width: 0.55 } },
      );
    }
    tx(s.unitLabel, 12.3, 2.69, 0.38, 0.29, 11, T.muted);
    for (let i = 0; i < N.length; i++) {
      const y = 3.24 + i * 0.76,
        r = s.ranges.find((r) => r.nodeId === N[i].id)!;
      tx(N[i].label, 0.65, y, 1.58, 0.36, 18, T.ink, true);
      tx(N[i].detail, 2.32, y, 1.62, 0.61, 12, T.muted);
      panel(
        x0 + r.start * u,
        y + 0.03,
        r.length * u - 0.07,
        0.38,
        i % 2 ? T.blue : T.accent,
        i % 2 ? T.blue : T.accent,
      );
      shape(
        pptx.ShapeType.diamond,
        x0 + (r.start + r.length) * u - 0.15,
        y + 0.12,
        0.21,
        0.21,
        T.amber,
        T.amber,
      );
    }
  } else if (v.kind === "ownership") {
    panel(0.64, 2.66, 12.04, 0.67, T.panel, T.panel);
    tx("발주·현장 승인", 0.9, 2.84, 2.4, 0.34, 18, T.ink, true);
    tx(N[0].detail.replace(/\n/g, " · "), 3.42, 2.88, 8.9, 0.3, 13, T.muted);
    panel(0.64, 3.77, 3.8, 2.58, T.tealTint, T.tealTint);
    tx("제안 주관", 0.9, 4.03, 3.08, 0.27, 11, T.accent, true);
    tx(legal, 0.9, 4.75, 3.28, 0.48, 24, T.ink, true);
    tx("협의·설치·운영 창구", 0.9, 5.48, 3.08, 0.42, 17, T.muted);
    tx(
      N[1].detail.split("\n").slice(1).join(" "),
      0.9,
      6.02,
      3.08,
      0.28,
      11,
      T.muted,
    );
    for (let i = 1; i <= 2; i++) {
      const x = 4.76 + (i - 1) * 4.12;
      panel(x, 3.77, 3.8, 2.58);
      const n = N[i + 1];
      await icon(n.icon, x + 0.22, 4.04, 0.41, T.blue);
      tx(
        (p.proposer?.collaborators || [])[i - 1] || n.detail.split("\n")[0],
        x + 0.22,
        4.75,
        3.36,
        0.48,
        24,
        T.ink,
        true,
      );
      tx(
        n.detail.split("\n").slice(1).join(" "),
        x + 0.22,
        5.48,
        3.48,
        0.64,
        15,
        T.muted,
      );
      line(x + 1.9, 3.69, x + 1.9, 3.37, T.line, true);
    }
    line(2.54, 3.68, 2.54, 3.37, T.line, true);
  } else if (v.kind === "benefits") {
    const b = p.businessCase!,
      actions = [
        "접근 알림과 통행 유도",
        "경고·장치·조치 이력",
        "설치·실증 방식의 표준화",
      ],
      metricText = [
        "위험사례 미탐 · 경고 지연",
        "조치 완결률 · 운영 부담",
        "재설정·검증 기록",
      ];
    tx("수혜자", 0.83, 2.64, 1.35, 0.25, 11, T.muted, true);
    tx("개입", 3.0, 2.64, 3.4, 0.25, 11, T.muted, true);
    tx("기대 변화와 확인 방법", 7.35, 2.64, 5.02, 0.25, 11, T.muted, true);
    for (let i = 0; i < 3; i++) {
      const y = 3.12 + i * 1.08;
      panel(
        0.64,
        y,
        12.04,
        0.91,
        i % 2 ? T.white : T.panel,
        i % 2 ? T.white : T.panel,
      );
      await icon(N[i].icon, 0.86, y + 0.21, 0.38);
      tx(b.benefits[i].beneficiary, 1.5, y + 0.25, 1.25, 0.35, 20, T.ink, true);
      tx(actions[i], 3.0, y + 0.28, 3.58, 0.37, 18, T.ink, true);
      line(6.67, y + 0.43, 7.17, y + 0.43, T.accent, true);
      tx(
        b.benefits[i].expectedBenefit,
        7.35,
        y + 0.14,
        5.01,
        0.39,
        18,
        T.ink,
        true,
      );
      tx(
        `측정·확인: ${metricText[i]}`,
        7.35,
        y + 0.64,
        5.01,
        0.24,
        11,
        T.muted,
      );
    }
  } else if (v.kind === "metrics") {
    for (let i = 0; i < 3; i++) {
      const x = 0.64 + i * 4.12;
      line(x, 2.72, x + 3.8, 2.72, T.accent);
      if (i) line(x - 0.16, 3.08, x - 0.16, 6.3, T.line);
      await icon(N[i].icon, x + 0.2, 2.98, 0.34);
      tx(N[i].label, x + 0.2, 3.65, 3.4, 0.63, 20, T.ink, true);
      if (i === 0) {
        tx("놓친 위험 사례 수", x + 0.2, 4.45, 3.4, 0.35, 18, T.amber, true);
        line(x + 0.2, 4.99, x + 3.6, 4.99, T.line);
        tx("유효 위험 사례 수", x + 0.2, 5.2, 3.4, 0.36, 18, T.ink, true);
        tx(
          "비율 × 100 · 사례 0건이면 미산출",
          x + 0.2,
          5.89,
          3.4,
          0.37,
          13,
          T.muted,
        );
      }
      if (i === 1) {
        line(x + 0.28, 4.84, x + 3.48, 4.84, T.accent, true);
        line(x + 0.28, 4.63, x + 0.28, 5.05);
        line(x + 3.48, 4.63, x + 3.48, 5.05);
        tx("감지", x + 0.2, 5.35, 1.4, 0.3, 16, T.ink, true);
        tx("실제 작동", x + 2.1, 5.35, 1.48, 0.3, 16, T.ink, true);
        tx("수집한 지연값의 95백분위", x + 0.2, 5.91, 3.4, 0.37, 13, T.muted);
      }
      if (i === 2) {
        const fields = ["시각", "담당", "조치", "결과"];
        for (let j = 0; j < 4; j++) {
          panel(
            x + 0.2 + (j % 2) * 1.75,
            4.47 + Math.floor(j / 2) * 0.61,
            1.6,
            0.43,
            T.panel,
            T.panel,
          );
          tx(
            fields[j],
            x + 0.35 + (j % 2) * 1.75,
            4.58 + Math.floor(j / 2) * 0.61,
            1.3,
            0.24,
            12,
            T.ink,
            true,
          );
        }
        tx(
          "필수 정보가 모두 있는 기록의 비율",
          x + 0.2,
          5.91,
          3.4,
          0.37,
          13,
          T.muted,
        );
      }
    }
  }
  legend(v.scene ? `${v.scene.caption} · ${v.legend}` : v.legend);
  region();
  return true;
}
