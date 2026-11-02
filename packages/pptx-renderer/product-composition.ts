import sharp from "sharp";
import type { DrawingContext } from "./semantic.js";
import { professionalKit, resolveTokens } from "./professional-kit.js";
import { PRODUCT_KINDS } from "../business-case/product-schema.js";
import { budgetTotals } from "../business-case/index.js";
export async function renderProductComposition(ctx: DrawingContext) {
  const T = resolveTokens(ctx.p);
  const { p, spec, pptx, slide, elements } = ctx,
    v = spec.reasoning?.visualPlan;
  if (!v || !PRODUCT_KINDS.includes(v.kind)) return false;
  const product = p.businessCase!.productStrategy!;
  const { tx, shape, line, icon, header, legend, region } =
    professionalKit(ctx);
  const rect = (x: number, y: number, w: number, h: number, fill = T.panel) =>
    shape(pptx.ShapeType.rect, x, y, w, h, fill, fill);
  const photo = async (x: number, y: number, w: number, h: number) => {
    const m = await sharp(spec.image!.path).metadata(),
      s = Math.min(w / m.width!, h / m.height!),
      iw = m.width! * s,
      ih = m.height! * s;
    slide.addImage({
      path: spec.image!.path,
      x,
      y: y + (h - ih) / 2,
      w: iw,
      h: ih,
    });
    elements.push({
      slideId: spec.id,
      id: "product-image",
      kind: "image",
      x,
      y: y + (h - ih) / 2,
      w: iw,
      h: ih,
      image: {
        path: spec.image!.path,
        width: m.width!,
        height: m.height!,
        dpi: m.width! / iw,
      },
    });
  };
  header(
    (
      {
        "product-overview": "제품 구성과 정보 수신자",
        "driver-display": "현장 내부 운전자 화면",
        "pedestrian-warning": "현장 외부 보행자 알림",
        "asset-cycle": "회수·보관·재배치 운영",
        "reuse-economics": "소유·운영 모델 비교",
        "scope-requote": "확장 범위와 견적",
      } as Record<string, string>
    )[v.kind],
    v.takeaway,
  );
  if (v.kind === "product-overview") {
    await photo(0.64, 2.64, 8.0, 3.8);
    product.modules.forEach((m, i) => {
      const y = 2.68 + i * 1.26;
      if (i) line(9.0, y - 0.08, 12.68, y - 0.08, T.line);
      tx(`0${i + 1}`, 9.0, y, 0.38, 0.35, 14, T.accent, true);
      tx(m.name, 9.49, y, 3.18, 0.48, 17, T.ink, true);
      tx(m.audience, 9.0, y + 0.51, 3.65, 0.31, 14, T.accent, true);
      tx(m.action, 9.0, y + 0.85, 3.65, 0.43, 13, T.muted);
    });
  } else if (v.kind === "driver-display") {
    if(product.driverScreen){
      const ui=product.driverScreen;
      // Editable equipment bezel and a fitted CCTV image. Object overlays use
      // normalized source coordinates through the same fitted-image transform.
      shape(pptx.ShapeType.roundRect,.64,2.64,8.1,3.86,"263441","111B24",{line:{color:"111B24",width:1.6}});
      rect(.79,2.79,7.8,3.56,"0B151E");
      for(const x of [.7,8.62])for(const y of [2.71,6.36])shape(pptx.ShapeType.ellipse,x,y,.055,.055,"82919C","82919C");
      tx("SLT  ·  CCTV 01  /  객체인식·통제 화면 예시",.92,2.9,7.45,.28,13,T.white,true);
      const meta=await sharp(spec.image!.path).metadata(),scale=Math.min(5.26/meta.width!,1.81/meta.height!),fw=meta.width!*scale,fh=meta.height!*scale,fx=.92,fy=3.32+(1.81-fh)/2;
      slide.addImage({path:spec.image!.path,x:fx,y:fy,w:fw,h:fh});
      elements.push({slideId:spec.id,id:"driver-cctv-feed",kind:"image",x:fx,y:fy,w:fw,h:fh,image:{path:spec.image!.path,width:meta.width!,height:meta.height!,dpi:meta.width!/fw}});
      ui.objectBoxes.forEach((o,i)=>{
        const x=fx+o.x*fw,y=fy+o.y*fh,w=o.w*fw,h=o.h*fh;
        shape(pptx.ShapeType.rect,x,y,w,h,"FFFFFF","58F5AA",{fill:{color:"FFFFFF",transparency:100},line:{color:"58F5AA",width:1.5}});
        elements.at(-1)!.displayObjectId=o.id;
        const ly=i===0?y-.22:y+h+.03;
        shape(pptx.ShapeType.rect,x,ly,.83,.2,"0D4938","58F5AA");
        tx(o.label,x+.04,ly+.01,.75,.17,9,T.white,true);
      });
      shape(pptx.ShapeType.roundRect,6.38,3.32,2.06,1.81,"243541","3C5667");
      tx("출차 대기",6.5,3.48,1.82,.37,22,"FFCB73",true,{align:"center"});
      await icon("hand",7.05,3.96,.59,"FFCB73");
      tx(ui.controlLabel,6.5,4.58,1.82,.26,14,T.white,true,{align:"center"});
      elements.at(-1)!.fieldSafetyIndicator=true;
      tx("운전자 직접 확인",6.5,4.91,1.82,.2,11,"C1D4DF",false,{align:"center"});
      rect(.92,5.4,7.52,.47,T.amber);
      tx("보행자 감지 · 출차 대기 / 직접 확인 후 유도원 통제",1.08,5.5,7.2,.28,15,T.white,true);
      tx("공사정보·공공광고  /  위험 발생 시 안전 안내 우선",1.08,6.0,7.2,.28,14,T.white);
      tx("제안 화면 예시 · 실제 통제 상태는 담당자 확인",1.08,6.31,7.2,.17,9,"B1C7D5");
      product.displayStates.forEach((s,i)=>{
        const y=2.64+i*1.28;
        shape(pptx.ShapeType.roundRect,9.13,y,3.55,1.2,i===0?"F8EEDA":T.white,T.line);
        tx(s.label,9.3,y+.12,3.21,.32,17,i===0?T.amber:T.ink,true);
        tx(s.meaning,9.3,y+.52,3.21,.35,13,T.muted);
        tx(s.action,9.3,y+.9,3.21,.28,12,T.accent,true);
      });
    }else{
    rect(0.64, 2.64, 7.78, 3.8, T.ink);
    tx(
      p.businessCase?.productPositioning?.platform?"컬러 LED AIoT 전광판 · 내부 화면 예시":"SmartFence · 운전자 화면 예시",
      0.87,
      2.82,
      7.3,
      0.3,
      15,
      T.white,
      true,
    );
    await ctx.image(0.87, 3.22, 7.3, 2.0);
    rect(0.87, 5.22, 7.3, 0.48, T.amber);
    tx(
      "보행자 감지 · 직접 확인 / 유도원 통제",
      1.1,
      5.32,
      6.85,
      0.25,
      15,
      T.white,
      true,
    );
    tx(
      p.businessCase?.productPositioning?.platform?"평상시 공사정보·공공광고\n위험 발생 시 안전 안내 우선 표출":"공사정보  |  금일 작업: 자재 반입 (예시)",
      1.1,
      p.businessCase?.productPositioning?.platform?5.82:5.94,
      6.85,
      p.businessCase?.productPositioning?.platform ? .55 : .32,
      15,
      T.white,
    );
    product.displayStates.forEach((s, i) => {
      const y = 2.68 + i * 1.28;
      if (i) line(8.94, y - 0.09, 12.68, y - 0.09, T.line);
      tx(s.label, 8.94, y, 3.73, 0.38, 18, i === 0 ? T.amber : T.ink, true);
      tx(s.meaning, 8.94, y + 0.46, 3.73, 0.36, 14, T.muted);
      tx(s.action, 8.94, y + 0.85, 3.73, 0.36, 13, T.accent, true);
    });
    }
  } else if (v.kind === "pedestrian-warning") {
    await photo(0.64, 2.64, 6.05, 3.8);
    tx("음성 문구 예시", 7.12, 2.74, 5.48, 0.3, 13, T.accent, true);
    tx(
      "“공사차량 접근 중입니다.\n주변을 확인해 주세요.”",
      7.12,
      3.26,
      5.48,
      0.83,
      24,
      T.ink,
      true,
    );
    const rows = [
      ["누구에게", "출입구 밖 접근 보행자"],
      ["언제", "차량 접근 조건이 성립할 때"],
      ["현장 확인", "소리 도달·인지·소음·야간 가독성"],
    ];
    rows.forEach((r, i) => {
      const y = 4.5 + i * 0.58;
      tx(r[0], 7.12, y, 1.3, 0.3, 13, T.accent, true);
      tx(r[1], 8.55, y, 4.12, 0.37, 14, T.ink);
    });
  } else if (v.kind === "asset-cycle") {
    const labels = [
      "현장 A 설치·운영",
      "준공 후 회수",
      "점검·보수",
      "보관·다음 수요 배정",
      "현장 B 재설치",
    ];
    product.lifecycle.forEach((s, i) => {
      const x = 0.64 + i * 2.44;
      rect(x, 2.76, 0.45, 0.45, T.accent);
      tx(String(i + 1), x, 2.76, 0.45, 0.45, 13, T.white, true, {
        align: "center",
        valign: "mid",
      });
      tx(labels[i], x, 3.54, 2.14, 0.62, 18, T.ink, true);
      if (i < 4) line(x + 0.67, 3.0, x + 2.2, 3.0, T.accent, true);
    });
    line(0.64, 4.42, 12.68, 4.42, T.line);
    tx("옮겨 쓰는 설비", 0.64, 4.76, 2.9, 0.37, 19, T.accent, true);
    tx(p.businessCase?.productPositioning?.platform?"안전관리 장치·AIoT 전광판":"LED·카메라·음성·제어 모듈", 0.64, 5.37, 5.7, 0.47, 20, T.ink, true);
    tx(
      "상태·수명 확인 후 재사용 가능한 장비를 선별",
      0.64,
      6.02,
      5.7,
      0.34,
      14,
      T.muted,
    );
    tx("현장마다 다시 맞출 부분", 7.0, 4.76, 5.68, 0.37, 19, T.blue, true);
    tx(
      "고정 구조물·전기·통신·촬영/알림 설정",
      7.0,
      5.37,
      5.68,
      0.6,
      20,
      T.ink,
      true,
    );
    tx(
      "새 위치의 시야·음성·LED 작동을 다시 검수",
      7.0,
      6.02,
      5.68,
      0.34,
      14,
      T.muted,
    );
  } else if (v.kind === "reuse-economics") {
    const xs = [0.64, 3.13, 7.99],
      ws = [2.17, 4.51, 4.64];
    tx("비교 기준", xs[0], 2.76, ws[0], 0.35, 14, T.accent, true);
    product.ownershipOptions.forEach((o, i) =>
      tx(o.label, xs[i + 1], 2.76, ws[i + 1], 0.4, 19, T.ink, true),
    );
    const fields = ["owner", "custody", "service", "decision"] as const;
    fields.forEach((field, i) => {
      const y = 3.4 + i * 0.62;
      rect(0.64, y - 0.06, 12.04, 0.54, i % 2 ? T.white : T.panel);
      tx(
        ["자산 소유", "보관·재배치", "운영 서비스", "확정 전 확인"][i],
        0.76,
        y + 0.04,
        2,
        0.45,
        15,
        T.ink,
        true,
        { valign: "mid" },
      );
      product.ownershipOptions.forEach((o, j) =>
        tx(o[field], xs[j + 1], y + 0.04, ws[j + 1], 0.45, 14, T.ink, false, {
          valign: "mid",
        }),
      );
    });
    tx(
      "비교: 현장별 신규 구매 총비용 ↔ 모듈 구축·운영·회수·보관·재설치 총비용",
      0.64,
      6.13,
      12.04,
      0.3,
      15,
      T.accent,
      true,
    );
  } else if (v.kind === "scope-requote") {
    const totals = budgetTotals(p.businessCase!.budget);
    tx("확장안 총액: 신규 견적 전", 0.64, 2.73, 4.53, 0.42, 22, T.accent, true);
    tx("기존 축소안 범위만 참고 (만원)", 0.64, 3.42, 4.53, 0.3, 13, T.muted);
    slide.addChart(
      pptx.ChartType.bar,
      [
        {
          name: "과거 기획 범위",
          labels: ["기존 최소", "기존 기준", "기존 상한"],
          values: [
            totals.low / 10000,
            totals.base / 10000,
            totals.high / 10000,
          ],
        },
      ],
      {
        x: 0.64,
        y: 3.98,
        w: 4.3,
        h: 2.1,
        barDir: "col",
        showLegend: false,
        showValue: true,
        dataLabelFormatCode: "#,##0",
        valAxisMinVal: 0,
        catAxisLabelFontFace: p.design.font,
        catAxisLabelFontSize: 10,
        valAxisLabelFontSize: 9,
        chartColors: ["8799A6"],
        showBorder: false,
      },
    );
    elements.push({
      slideId: spec.id,
      id: "legacy-scope-budget",
      kind: "chart",
      x: 0.64,
      y: 3.98,
      w: 4.3,
      h: 2.1,
      dataRef: "businessCase.budget",
    });
    tx(
      "대형 LED·회수·재설치 미포함 · VAT 별도",
      0.64,
      6.19,
      4.53,
      0.26,
      10,
      T.amber,
      true,
    );
    tx(
      "새 견적에서 빠짐없이 확인할 항목",
      5.46,
      2.76,
      7.18,
      0.38,
      18,
      T.ink,
      true,
    );
    product.costLines.forEach((r, i) => {
      const y = 3.4 + i * 0.48;
      line(5.46, y - 0.07, 12.68, y - 0.07, T.line);
      tx(r.label, 5.46, y, 4.12, 0.36, 14, T.ink, true);
      tx(r.basis, 9.77, y, 2.87, 0.4, 12, T.muted);
    });
  }
  legend(
    v.kind === "scope-requote"
      ? "기존 기획금액은 확장안 승인·공급가 아님 · 신규/반복 비용 모두 견적 전 · 절감률·회수기간 미산출"
      : v.kind === "reuse-economics"
        ? "동일 규격·기간·현장 수로 견적 비교 · 회수·운송·보수·보관비 포함 · 절감률·손익분기 미확정"
        : v.kind === "asset-cycle"
          ? v.legend
          : v.kind === "driver-display"
            ? "미검출은 통행 허가 아님 · 지연·장애 시 확인 불가 · 내부 제한 표출·개인정보 보호 검토 · 공사정보는 안전 안내보다 후순위"
            : spec.image!.caption,
  );
  region();
  elements.at(-1)!.productVisualKind = v.kind;
  return true;
}
