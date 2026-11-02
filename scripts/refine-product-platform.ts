/** User-authored product naming and two independent devices with Bitree integration. */
export function refineProductPlatform(raw:any){
  const source={id:"U-PLATFORM",title:"사용자 제품 명칭·독립 기능·통합관제 추가 설명",scope:"project",materialId:"conversation-product-platform-2026-10-28",excerpt:"3사 협력 제품의 대외 명칭은 자체 제작 AI NPU 안전관리 장치, 컬러 LED AIoT 전광판. 전광판은 센서 데이터·CCTV·AI 콘텐츠 생성 기능과 공공 목적 광고 표출을 포함. 두 제품 자체 기능과 비트리 통합관제 제품을 함께 제공.",applicability:"사용자 제공 제품 설명. 칩 자체 제조나 실측 사양을 뜻하지 않음. 화면 배치·표출 권한·경보 우선순위는 제안 운영 설계."};
  const put=(list:any[],v:any)=>{const i=list.findIndex(x=>x.id===v.id);if(i<0)list.push(v);else list[i]=v;};
  put(raw.sources,source);
  for(const c of [
    {id:"product-platform",text:"3사 협력 제품을 자체 제작 AI NPU 안전관리 장치와 컬러 LED AIoT 전광판으로 소개한다. 두 제품은 각각 자체 기능을 갖고, 비트리에서 이들을 통합관제하는 제품을 함께 제공한다.",scope:"project",status:"user-provided",sourceIds:["U-PLATFORM"]},
    {id:"aiot-content",text:"컬러 LED AIoT 전광판은 센서 데이터·CCTV 연계, AI 콘텐츠 생성과 안전·공사정보·공공 목적 광고 표출 기능을 포함한다는 사용자 설명이다.",scope:"project",status:"user-provided",sourceIds:["U-PLATFORM"]},
    {id:"display-priority",text:"평상시 공공안내·광고를 편성하되 위험 발생 시 안전 안내가 우선되도록 운영을 설계한다. AI 콘텐츠는 담당자 검토 후 게시하고, CCTV는 권한 있는 내부 화면으로 제한하며 화면 방향·대상별 편성을 구분한다.",scope:"project",status:"assumption",sourceIds:["U-PLATFORM","U-PRODUCT"]},
  ])put(raw.claims,{...c,approved:false});
  const b=raw.businessCase,pos=b.productPositioning,mc=b.municipalCase;
  const platform={
    products:[
      {id:"safety-device",name:"자체 제작 AI NPU 안전관리 장치",shortName:"AI NPU 안전관리 장치",functions:["사람·차량 인식과 위험 조건 분석","현장 음성·주의 알림"],claimIds:["own-npu","product-platform"]},
      {id:"aiot-display",name:"컬러 LED AIoT 전광판",shortName:"컬러 LED AIoT 전광판",functions:["센서 데이터·CCTV 연계","AI 콘텐츠 생성","안전·공사정보·공공광고 표출"],claimIds:["aiot-content","product-platform"]},
    ],
    control:{name:"비트리 통합관제",provider:"비트리",functions:["두 제품의 상태·장애·이벤트 확인","표출 편성·운영 설정과 조치 이력","운영 보고·회수 후 재투입 관리"],claimIds:["product-platform","integrated-control"]},
    displayPolicy:{normalContent:["공사 진행·현장 안내","공공정책·행사 등 공공광고"],priority:"safety-over-public-content",hazardAction:"공공광고보다 보행·차량 위험 안내를 우선 표출",aiContentReview:"operator-review-before-publish",cctvAudience:"authorized-internal-only"},
  };
  pos.platform=platform;
  pos.claimIds=[...new Set([...pos.claimIds,"product-platform","aiot-content","display-priority"])];
  pos.strengths=[
    {label:platform.products[0].name,mechanism:"사람·차량 인식과 위험 분석\n현장 음성·주의 알림",buyerValue:"현장 조건에 맞춘 안전 분석과 즉시 안내",proof:"제품 구성·작동 지연·상황별 알림을 시연·후속 자료로 확인"},
    {label:platform.products[1].name,mechanism:"센서·CCTV 연계, AI 콘텐츠 생성\n안전·공사정보·공공광고 표출",buyerValue:"안전 안내와 공공정보 전달에 함께 쓰는 현장 설비",proof:"수신자별 화면·주야간 판독·안전 우선 전환 시연"},
    {label:platform.control.name,mechanism:"두 제품의 상태·알림·표출 운영\n조치 이력과 재투입 관리",buyerValue:"각 제품의 운영을 한곳에서 확인·관리",proof:"장치별 상태·이벤트·표출 설정·장애 복구 시연"},
  ];
  pos.procurement[0].label="AI NPU 안전관리 기능";
  pos.procurement[1]={label:"AIoT 전광판 활용",evidence:"센서·CCTV 연계와 공공광고 편성, 주야간 판독과 안전 우선 전환",decision:"실제 읽힘·눈부심과 표출 전환을 같은 화면으로 확인",metricIds:["burden","latency"]};
  pos.procurement[2].label="통합관제·재사용";
  pos.procurement[2].evidence="두 제품의 상태·표출·조치 이력과 회수·이전의 전체 비용";
  pos.opportunities[0].offer="안전관리 장치 + AIoT 전광판 + 통합관제";
  pos.opportunities[2].offer="공공안내·광고 활용과 현장별 재배치 서비스";
  const story=(id:string)=>raw.planning.story.find((s:any)=>s.id===id);
  const set=(id:string,fields:any)=>Object.assign(story(id),fields);
  const nodes=(id:string,rows:string[][])=>{story(id).visualPlan.nodes=rows.map((r,i)=>({id:`m${i+1}`,label:r[0],detail:r[1],icon:["server","document","team"][i]}));};
  const guide=(id:string,message:string,keyPhrase:string,focusPhrases:string[])=>{story(id).visualPlan.readingGuide={message,keyPhrase,focusPhrases,tone:"teal"};};
  raw.title="천안시 공공사업 공사현장 SmartFence AI 시민안전 실증 제안";
  set("cover",{title:"천안시 공공사업\n공사현장\nSmartFence AI\n시민안전 실증 제안",answer:"자체 제작 AI NPU 안전관리 장치와 컬러 LED AIoT 전광판, 비트리 통합관제를 결합해 천안시 공공사업 공사현장의 안전과 공공정보 전달을 지원하는 실증 제안입니다."});
  guide("cover","AI NPU 안전관리 · AIoT 전광판\n통합관제와 공공정보 서비스","AI NPU 안전관리",["공공사업","시민안전 실증"]);
  set("cheonan-context",{title:"천안시 공공사업 공사현장을 위한 통합 서비스",answer:"AI NPU 안전관리 장치와 컬러 LED AIoT 전광판의 각 기능을 비트리 통합관제로 연결하고, 안전 안내·공공광고·회수 후 재투입을 함께 운영하는 사업을 제안합니다."});
  nodes("cheonan-context",[["AI NPU 안전관리 장치","사람·차량 인식과 현장 위험 알림"],["컬러 LED AIoT 전광판","센서·CCTV·AI 콘텐츠·공공광고"],["비트리 통합관제","두 제품 운영·점검·회수·재투입"]]);
  story("cheonan-context").visualPlan.edges=[{from:"m1",to:"m3"},{from:"m2",to:"m3"}];
  guide("cheonan-context","두 제품의 자체 기능을 비트리 통합관제로 연결","비트리 통합관제",["AI NPU 안전관리 장치","컬러 LED AIoT 전광판"]);
  set("scope",{title:"안전관리 장치·AIoT 전광판·통합관제",answer:"자체 제작 AI NPU 안전관리 장치는 현장 위험을 분석·알리고, 컬러 LED AIoT 전광판은 센서·CCTV와 AI 콘텐츠를 활용해 안전·공공정보를 표출합니다. 비트리 제품이 둘을 통합관제합니다."});
  nodes("scope",pos.strengths.map((r:any)=>[r.label,r.mechanism]));
  guide("scope","두 제품의 자체 기능과 통합관제를 하나의 사업으로","두 제품의 자체 기능",pos.strengths.map((r:any)=>r.label));
  story("scope").visualPlan.legend="3사 협력 제품 구성·배치 예시 · 화면 방향·수신자별 편성 · 통행 판단과 안전 통제는 현장 책임자에게 유지";
  set("integration",{title:"두 제품의 자체 기능과 비트리 통합관제",answer:"AI NPU 안전관리 장치와 컬러 LED AIoT 전광판은 각각 현장 기능을 수행하고, 비트리 통합관제에서 두 제품의 상태·이벤트·표출 운영을 함께 관리하는 구조입니다."});
  nodes("integration",[["현장 영상·센서","CCTV 영상과 현장 센서 데이터"],[platform.products[0].shortName,"사람·차량 인식\n위험 분석·음성/주의 알림"],[platform.products[1].name,"센서·CCTV 연계, AI 콘텐츠 생성\n안전·공사정보·공공광고 표출"],[platform.control.name,"상태·장애·표출 운영·조치 이력"],["천안시 운영 보고","작동·운영 부담·반복 활용 결과 집계"]]);
  story("integration").visualPlan.edges=[{from:"m1",to:"m2"},{from:"m1",to:"m3"},{from:"m2",to:"m4"},{from:"m3",to:"m4"},{from:"m4",to:"m5"}];
  guide("integration","각 제품의 현장 기능을 살리고 운영은 통합관제로","운영은 통합관제로",["AI NPU 안전관리 장치","컬러 LED AIoT 전광판","비트리 통합관제"]);
  story("integration").visualPlan.legend="제안 연계 구조 · 안전 안내 우선 · AI 콘텐츠는 검토 후 게시 · CCTV는 권한 있는 내부 화면으로 제한";
  guide("alternatives","안전 분석·AIoT 표출·통합관제·회수까지 공급 범위로 비교","AIoT 표출",["SmartFence","통합관제"]);
  story("alternatives").answer="AI 분석이나 LED 표시 기능만으로 비교하지 않고, 두 제품의 자체 기능과 통합관제·공공정보 편성·현장 지원·회수 범위를 함께 판단하도록 제안합니다.";
  set("architecture",{title:"컬러 LED AIoT 전광판의 안전 안내 우선 화면"});
  guide("architecture","센서·CCTV·공공정보를 활용하되 위험 안내를 우선 표출","위험 안내를 우선 표출",["컬러 LED AIoT 전광판","공공광고","보행자 감지"]);
  mc.benefits[1].intervention="안전관리 장치·AIoT 전광판·관제 연계";
  mc.benefits[2].before="안전 안내와 공공정보 전달을 함께 운영할 설비 필요";
  mc.benefits[2].intervention="공공안내·광고 편성과 장비 재배치";
  mc.benefits[2].outcome="안전·공공정보 설비의 지속 활용";
  guide("organization","현장 안전과 공공정보 전달에 함께 쓰는 장비·관제","현장 안전과 공공정보 전달",["AIoT 전광판","공공안내·광고","지속 활용"]);
  mc.pilot.scope[0].detail="AI NPU 안전관리 장치·AIoT 전광판·카메라·음성";
  mc.pilot.scope[1].detail="비트리 통합관제·표출 편성·설정·교육·점검·보고";
  guide("budget","두 제품과 비트리 통합관제, 운영·회수까지 묶어 도입","두 제품과 비트리 통합관제",["현장 설비","운영 서비스","현장조사 후 견적"]);
  mc.service.supplier=["협력 제품 공급·설정·교육·점검","비트리 통합관제 연계·운영 지원","장애 대응·이력 인계·회수·재설치"];
  mc.service.city[1]="공공정보 편성·보고 확인";
  mc.evaluation=pos.procurement.map((r:any)=>({question:r.label,observation:r.evidence,decision:r.decision,metricIds:r.metricIds}));
  nodes("kpis",mc.evaluation.map((r:any)=>[r.question,r.observation]));
  guide("kpis","제품 기능·표출 전환·통합 운영을 실제 장면으로 확인","실제 장면으로 확인",["AI NPU 안전관리 기능","AIoT 전광판 활용","통합관제·재사용"]);
  mc.expansion=pos.opportunities.map((r:any)=>({label:r.label,scope:r.localAnchor,carry:r.offer,decision:r.condition}));
  story("decision").visualPlan.nodes[1].detail="두 제품·통합관제 시연 / 공공정보 편성·서비스·견적";
  guide("decision","공공사업 공사현장에 안전·공공정보 통합 실증 제안","안전·공공정보 통합 실증",["대상 현장 공동조사","사업비 구체화","다음 활용 판단"]);
  for(const id of ["cover","cheonan-context","alternatives","scope","architecture","integration","organization","budget","time-scenario","kpis","risks","decision"]){
    const s=story(id);
    s.proofClaimIds=[...new Set([...s.proofClaimIds,"product-platform","aiot-content","display-priority"])];
    s.visualPlan.evidenceIds=[...new Set([...s.visualPlan.evidenceIds,"product-platform","aiot-content","display-priority"])];
    s.visualPlan.takeaway=s.answer.slice(0,110);
    const sec=b.sections.find((r:any)=>r.id===id);
    if(sec)sec.items=s.visualPlan.nodes.map((n:any)=>({label:n.label,detail:n.detail}));
  }
}
