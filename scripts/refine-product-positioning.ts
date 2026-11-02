/** Reviewed seller evidence and municipal-fit positioning; all performance inputs remain source-bound. */
export function refineProductPositioning(raw:any){
  const checkedAt="2026-10-28T05:19:37Z";
  const sources=[
    {id:"U-CORE",title:"제안사 제품 역량 추가 설명",scope:"project",materialId:"conversation-product-capabilities-2026-10-28",excerpt:"강민코퍼레이션이 NPU 칩을 탑재한 보드를 제작. 칩 자체 제조 아님. 신제품으로 사양·시험자료는 추후 정식 제안 첨부 예정. 현 제안은 담당자 설득에 집중.",applicability:"제안사 제공 설명. 최고 성능 순위·실측·보드 제작은 강민코퍼레이션이며 NPU 칩 제조를 뜻하지 않음."},
    {id:"V-AXIS",title:"Axis 공식 Object Analytics·D4100-E 기술 문서",scope:"general",url:"https://help.axis.com/en-us/axis-object-analytics",checkedAt,excerpt:"엣지 사람/차량 분석과 영역·선 통과 이벤트, D4100-E MQTT 경광·사이렌 연계 예시.",applicability:"기능군 참고. 천안시 경쟁입찰 참여나 동일 패키지·가격 비교가 아님."},
    {id:"V-SAMSUNG",title:"Samsung XHB-F 공식 Outdoor LED 사양서",scope:"general",url:"https://image-us.samsung.com/SamsungUS/samsungbusiness/displays/direct-view-led/xhb-series/xhb-f-outdoor/XHB-F-Outdoor-Leaflet.pdf",checkedAt,excerpt:"옥외 컬러 LED 제품의 밝기·명암비·시야각·디밍 사양 공개.",applicability:"디스플레이 부품군 참고. SmartFence 성능이나 동일 용도 패키지의 우열을 증명하지 않음."},
    {id:"C-PIPELINE",title:"천안 도시재생 총괄사업현황 (후속 수요 탐색)",scope:"local",url:"https://www.cheonanurc.or.kr/68",checkedAt,excerpt:"와촌동 혁신지구 2020~2027, 오룡 리츠 2021~2029, 문성동 인정 2027~2029, 성정지구 정비 2027~2031 게시.",applicability:"공개 계획에 따른 후속 조사권역. 실제 공정·출입구·장비 수요·발주예산 미확정."},
  ];
  for(const s of sources){const i=raw.sources.findIndex((x:any)=>x.id===s.id);if(i<0)raw.sources.push(s);else raw.sources[i]=s;}
  const claims=[
    {id:"own-npu",text:"강민코퍼레이션이 NPU·AI 인식 기능을 탑재한 보드를 제작한다는 제안사 설명이다. NPU 칩 자체 제조가 아니며 신규 보드의 시험·사양 자료는 추후 정식 제안에 첨부할 예정이다.",scope:"project",status:"user-provided",sourceIds:["U-CORE"],approved:false},
    {id:"own-color-led",text:"제안사는 컬러 LED 전광판의 높은 시인성을 제품 강점으로 제시했다. 최고 성능 순위나 우월성은 동일 조건 비교시험으로 확인되지 않았다.",scope:"project",status:"user-provided",sourceIds:["U-CORE"],approved:false},
    {id:"integrated-control",text:"자체 NPU·AI 하드웨어와 컬러 LED·음성·관제를 연결해 출입구 위험 분석과 현장 대응·운영 지원을 묶는 통합 사업을 제안한다.",scope:"project",status:"assumption",sourceIds:["U-CORE","U-PRODUCT"],approved:false},
    {id:"axis-reference",text:"Axis 공식 문서는 카메라 엣지 AI 분석과 이벤트 기반 D4100-E 경광·사이렌 연계 예시를 공개한다.",scope:"general",status:"externally-verified",sourceIds:["V-AXIS"],verifiedAt:checkedAt,approved:false},
    {id:"led-reference",text:"Samsung XHB-F 공식 문서는 옥외 컬러 LED의 밝기·명암비·시야각·디밍 사양을 공개한다.",scope:"general",status:"externally-verified",sourceIds:["V-SAMSUNG"],verifiedAt:checkedAt,approved:false},
    {id:"city-reuse-opportunity",text:"천안시 도시재생 공개 계획의 와촌·오룡·문성·성정 권역은 후속 현장 수요 조사 대상으로 검토할 수 있다. 실제 공사·발주·설치 수요는 확인 전이다.",scope:"local",status:"inference",sourceIds:["C-PIPELINE"],approved:false},
  ];
  for(const c of claims){const i=raw.claims.findIndex((x:any)=>x.id===c.id);if(i<0)raw.claims.push(c);else raw.claims[i]=c;}
  const b=raw.businessCase;
  b.productPositioning={
    status:"supplier-described-capability-with-proposed-integration",claimIds:["own-npu","own-color-led","integrated-control"],superiority:"not-established-by-comparative-test",
    strengths:[
      {label:"강민 제작 NPU·AI 보드",mechanism:"현장에서 사람·차량 인식과 위험 조건 분석",buyerValue:"출입구 환경에 맞춘 설정·장치 연동·수리 창구",proof:"강민 제작 보드의 구성·추론 부하·작동 지연은 후속 자료로 확인"},
      {label:"고시인성 컬러 LED",mechanism:"보행 상황·위험 상태·공사정보를 색과 영상으로 구분",buyerValue:"운전자 시야에서 먼저 알아볼 수 있는 안전 안내",proof:"주야간 판독·역광·각도·거리·눈부심 시험"},
      {label:"지능형 안전 분석·관제",mechanism:"AI 판단→음성·LED→장치 상태·담당자 조치 기록",buyerValue:"현장 대응과 유지관리를 하나의 운영 흐름으로",proof:"감지·실동작·확인 기록과 장애 복구 시연"},
    ],
    comparisons:[
      {name:"Axis Object Analytics + D4100-E",category:"엣지 분석·현장 경광/음향",confirmed:"사람·차량 분석, 영역/선 통과 이벤트, 사이렌 연계 공개",scopeQuestion:"컬러 LED·현장 관제·회수까지의 공급 범위는 제안별 비교",claimIds:["axis-reference"]},
      {name:"Samsung XHB-F",category:"옥외 컬러 LED",confirmed:"밝기·명암비·시야각·디밍 사양을 공식 공개",scopeQuestion:"출입구 위험 분석·알림·관제 연동은 시스템 구성별 확인",claimIds:["led-reference"]},
    ],
    procurement:[
      {label:"NPU·AI 현장 분석",evidence:"보행자·출차 차량 인식, 위험 조건 분석과 실제 알림 작동",decision:"카메라 인식부터 알림까지 동일 장면으로 시연",metricIds:["miss","latency"]},
      {label:"컬러 LED 판독 성능",evidence:"주간/역광·야간·운전자 거리/각도에서의 문자·상태 판독",decision:"휘도 숫자와 실제 읽힘·눈부심을 함께 확인",metricIds:["burden"]},
      {label:"관제·유지관리·재사용",evidence:"장애 인지·조치 이력·업데이트·회수/이전의 전체 비용",decision:"지원 범위와 재투입 조건까지 같은 계약 범위로 비교",metricIds:["completion","reuse"]},
    ],
    opportunities:[
      {label:"와촌동 대표 현장",localAnchor:"천안역세권 혁신지구 공개 계획",offer:"NPU·컬러 LED·음성·관제의 출입구 패키지",condition:"실제 공정·출입구·보행 교차 수요 조사",claimIds:["city-station","own-npu","own-color-led"]},
      {label:"오룡·원성권 후속 현장",localAnchor:"오룡 리츠·원성권 사업의 잔여 공정 탐색",offer:"회수 장비 재설치 + 운영·유지관리 서비스",condition:"관리 권한·잔여 공기·재설치 총비용 확인",claimIds:["city-oryong","reuse-strategy"]},
      {label:"다음 생활권 사업",localAnchor:"문성·성정 등 공개된 후속 사업 계획",offer:"수요별 장비 배정 + 관제·설정·이전 서비스",condition:"공개 계획은 발주·설치 수요나 매출 확정이 아님",claimIds:["city-reuse-opportunity","reuse-strategy"]},
    ],measurements:{npuTops:null,ledBrightnessNit:null,readableDistanceM:null},
  };
  const revise=(id:string,title:string,kind:string,question:string,answer:string,nodes:string[][],refs:string[],legend:string)=>{
    const beat=raw.planning.story.find((s:any)=>s.id===id);
    beat.title=title;beat.question=question;beat.answer=answer;beat.proofClaimIds=[...new Set([...beat.proofClaimIds,...refs])];
    beat.visualPlan={kind,intent:"comparative",takeaway:answer.slice(0,110),encoding:"공개 기능군과 제안 통합 구성의 범위 또는 제품 역량→현장 작동→구매 가치 연결",evidenceIds:refs,nodes:nodes.map((n,i)=>({id:`p${i+1}`,label:n[0],detail:n[1],icon:["server","document","clipboard"][i]})),edges:[],legend};
    beat.limitation="근거: 제안사 제공 제품 설명·공식 제품자료 · 시범 설치·성능은 현장 확인";
    const sec=b.sections.find((s:any)=>s.id===id);if(sec){sec.visual="municipal";sec.kicker=id==="alternatives"?"제품 선택과 통합 범위":"핵심 제품 역량";sec.items=nodes.map(n=>({label:n[0],detail:n[1]}));}
  };
  revise("alternatives","공개 제품 기능과 SmartFence 통합 제안의 차이","competitive-context","시중 AI·LED 제품 대신 이 제안을 선택할 이유는 무엇인가?","AI 인식과 컬러 표출 자체보다 자체 생산 하드웨어·현장 알림·관제·회수의 통합 범위와 현장 성능을 기준으로 구매 가치를 비교합니다.",[["엣지 AI·경보","Axis 공식 분석·사이렌 연계"],["옥외 컬러 LED","Samsung 공식 표시 사양"],["SmartFence 통합 구성","자체 NPU·컬러 LED·관제·회수"]],["own-npu","own-color-led","integrated-control","axis-reference","led-reference"],"공식 자료의 기능군 참고 · 동일 완제품·가격·천안시 경쟁입찰 비교 아님 · 미공개 기능을 없다고 단정하지 않음");
  revise("scope","강민 제작 NPU·AI 보드와 컬러 LED 플랫폼","product-strengths","우리 제품은 어떤 핵심 역량으로 출입구 문제를 해결하는가?","자체 생산 NPU·AI 하드웨어의 현장 인식과 컬러 LED의 시각 안내, 지능형 안전 분석·관제를 하나의 출입구 운영체계로 제안합니다.",b.productPositioning.strengths.map((s:any)=>[s.label,s.mechanism]),b.productPositioning.claimIds,"제안 제품 구성·현장 배치 예시 · 통행 판단과 현장 안전 통제는 현장 책임자에게 유지");
  const extraRefs=["own-npu","own-color-led","integrated-control"];
  for(const id of ["cover","cheonan-context","integration","organization","budget","time-scenario","kpis","risks","decision"]){
    const beat=raw.planning.story.find((s:any)=>s.id===id);beat.proofClaimIds=[...new Set([...beat.proofClaimIds,...extraRefs])];beat.visualPlan.evidenceIds=[...new Set([...beat.visualPlan.evidenceIds,...extraRefs])];
  }
  const story=(id:string)=>raw.planning.story.find((s:any)=>s.id===id);
  story("cover").answer="강민코퍼레이션의 NPU 탑재 보드와 컬러 LED를 기반으로 현장 인식·안전 안내·관제·재활용을 연결하는 천안시 시민안전 실증 제안입니다.";
  story("cheonan-context").visualPlan.nodes=[{id:"m1",label:"강민 제작 NPU·AI 보드",detail:"현장 인식·위험 조건 분석",icon:"server"},{id:"m2",label:"고시인성 컬러 LED",detail:"보행 상황·위험·공사정보 안내",icon:"document"},{id:"m3",label:"통합 관제·순환 활용",detail:"운영·점검·회수·재투입",icon:"route"}];
  story("integration").title="NPU 현장 분석과 지능형 안전관제의 연결";
  story("integration").visualPlan.nodes[1].label="NPU·AI 분석";
  story("integration").visualPlan.nodes[1].detail="사람·차량 인식\n위험 조건·장치 이상 분석";
  story("integration").visualPlan.nodes[3].label="고시인성 컬러 LED";
  story("integration").visualPlan.nodes[4].label="현장 안전관제";
  story("integration").visualPlan.nodes[4].detail="위험·장치 상태·조치 이력 확인";
  story("integration").answer="강민 제작 NPU·AI 보드가 보행·차량 상황을 현장에서 분석하고 컬러 LED·음성으로 안내하며, 현장 관제에서 위험·장치 상태·담당자 조치를 함께 확인하는 구조를 제안합니다.";
  b.municipalCase.benefits[1].intervention="NPU 위험 분석 + 컬러 LED·관제 확인";
  b.municipalCase.benefits[2].intervention="자체 생산 장비의 유지관리·재배치";
  b.municipalCase.pilot.scope[0].detail="NPU·AI 보드·카메라·컬러 LED·음성 안내";
  b.municipalCase.pilot.scope[1].detail="위험 분석·현장 관제·설정·교육·점검·성과 보고";
  b.municipalCase.service.supplier=["자체 보드 기반 장비 공급·점검","장애·수리·업데이트·관제 지원","설정·이력 인계와 회수·재설치"];
  b.municipalCase.evaluation=b.productPositioning.procurement.map((r:any)=>({question:r.label,observation:r.evidence,decision:r.decision,metricIds:r.metricIds}));
  story("kpis").title="현장 시연으로 확인하는 세 가지 구매 가치";
  story("kpis").visualPlan.nodes=b.municipalCase.evaluation.map((r:any,i:number)=>({id:`m${i+1}`,label:r.question,detail:r.observation,icon:"clipboard"}));
  b.municipalCase.expansion=b.productPositioning.opportunities.map((r:any)=>({label:r.label,scope:r.localAnchor,carry:r.offer,decision:r.condition}));
  story("risks").title="천안의 공사 일정에 맞춘 후속 사업 기회";
  story("risks").proofClaimIds=[...new Set([...story("risks").proofClaimIds,"city-reuse-opportunity"])];
  story("risks").visualPlan.evidenceIds.push("city-reuse-opportunity");
  story("risks").visualPlan.nodes=b.municipalCase.expansion.map((r:any,i:number)=>({id:`m${i+1}`,label:r.label,detail:r.scope,icon:"route"}));
  story("decision").visualPlan.nodes[1].detail="NPU·컬러 LED·관제 시연 / 규격·서비스·견적 비교";
  story("cheonan-context").answer="강민 제작 NPU·AI 보드, 컬러 LED와 안전관제를 천안의 출입구 조건에 맞춰 통합하고, 대표 현장 실증 뒤 회수·재투입으로 연결하는 사업을 제안합니다.";
  story("organization").answer="시민에게는 차량 접근 인지, 현장에는 출차 전 확인과 조치 기록, 천안시에는 유지관리·재배치 가능한 장비와 운영 경험을 남기는 것을 실증 가치로 제안합니다.";
  story("kpis").answer="NPU·AI 현장 분석, 컬러 LED의 실제 판독, 관제·유지관리·재사용을 같은 현장 장면과 서비스 범위로 확인해 구매 가치를 판단하도록 제안합니다.";
  story("risks").answer="와촌동 대표 출입구에서 적합성을 확인한 뒤 오룡·원성권과 문성·성정 등 공개 계획 권역의 실제 공정·수요에 맞춰 회수 장비와 운영서비스의 후속 적용을 검토합니다.";
  for(const id of ["cheonan-context","organization","budget","time-scenario","kpis","risks","decision"]){
    const sec=b.sections.find((s:any)=>s.id===id);
    if(sec)sec.items=story(id).visualPlan.nodes.map((n:any)=>({label:n.label,detail:n.detail}));
  }
  const guides:Record<string,[string,string,string[]]>={
    cover:["NPU 현장 분석 · 컬러 LED 안내\n안전관제와 설비 재활용","NPU 현장 분석",["시민안전 실증","(주)에스엘티"]],
    "cheonan-context":["자체 제작 보드·컬러 LED·관제를 천안 현장에 맞게 통합","자체 제작 보드",["강민 제작","고시인성 컬러 LED","통합 관제·순환 활용"]],
    alternatives:["개별 기능보다 현장 성능·통합 범위·총비용으로 선택","통합 범위",["SmartFence","NPU·AI","컬러 LED","안전관제"]],
    scope:["강민 제작 NPU 보드와 컬러 LED를 하나의 안전체계로","강민 제작 NPU 보드",["강민 제작 NPU·AI 보드","고시인성 컬러 LED","지능형 안전 분석·관제"]],
    integration:["사람·차량 인식 → 위험 분석 → LED·음성 → 안전관제","위험 분석",["NPU·AI 분석","고시인성 컬러 LED","현장 안전관제","천안시 운영 보고"]],
    organization:["현장 AI와 컬러 LED의 결합을 시민의 인지와 조치로 연결","현장 AI와 컬러 LED",["NPU 위험 분석","컬러 LED","자체 생산 장비"]],
    budget:["NPU·컬러 LED·관제와 운영·회수까지 묶어 도입","NPU·컬러 LED·관제",["현장 설비","운영 서비스","종료·다음 활용","현장조사 후 견적"]],
    kpis:["인식·판독·조치·유지관리까지 실제 장면으로 확인","실제 장면으로 확인",["NPU·AI 현장 분석","컬러 LED 판독 성능","관제·유지관리·재사용"]],
    risks:["와촌동에서 시작해 후속 공사 수요에 맞춰 재투입","후속 공사 수요",["와촌동 대표 현장","오룡·원성권","다음 생활권 사업"]],
    decision:["천안의 대표 출입구에 NPU·LED·관제 통합 실증 제안","NPU·LED·관제 통합 실증",["대상 현장 공동조사","사업비 구체화","다음 활용 판단"]],
  };
  for(const [id,g] of Object.entries(guides))story(id).visualPlan.readingGuide={message:g[0],keyPhrase:g[1],focusPhrases:g[2],tone:"teal"};
  // Keep the functional module contract, first-body problem scene and safety responsibilities intact.
}
