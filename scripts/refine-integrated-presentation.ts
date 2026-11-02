/** SLT-led integrated offering; explicit comparison, equipment interface and visual value. */
export function refineIntegratedPresentation(raw:any){
  const b=raw.businessCase, pos=b.productPositioning, mc=b.municipalCase;
  const replace=(x:any):any=>typeof x==="string"?x.replaceAll("비트리 통합관제","AI 지능형 안전 관제"):Array.isArray(x)?x.map(replace):x&&typeof x==="object"?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,replace(v)])):x;
  raw.planning.story=replace(raw.planning.story);
  b.sections=replace(b.sections);b.municipalCase=replace(mc);
  const m=b.municipalCase;
  m.service.city[0]="대상 현장·범위 결정";
  m.service.supplier[1]="안전 관제 연계·운영 지원";
  pos.strengths=replace(pos.strengths);pos.platform.control.name="AI 지능형 안전 관제";
  const source={id:"U-INTEGRATED",title:"에스엘티 중심 통합 제품·시각 개선 사용자 지시",scope:"project",materialId:"conversation-integrated-offering-2026-10-28",excerpt:"에스엘티 제안, 강민코퍼레이션·비트리는 기술참여. 업체별 시스템명보다 AI 제품 보유 기업들의 통합 제품으로 소개. 관제명은 AI 지능형 안전 관제. 11 비교 우위, 14 객체인식/유도원 통제/전광판 프레임, 19 이미지·블록·화살표 재구성.",applicability:"제안 브랜드와 대외 표기 지침. 세부 기술 주체의 이력·공급 사실은 기존 원장에 보존."};
  const put=(list:any[],v:any)=>{const i=list.findIndex(x=>x.id===v.id);if(i<0)list.push(v);else list[i]=v;};
  put(raw.sources,source);
  put(raw.claims,{id:"slt-integrated-offering",text:"에스엘티를 제안 주관으로, AI 제품을 보유한 기술참여 기업들의 장치·AIoT 전광판·AI 지능형 안전 관제를 하나의 통합 제품·서비스로 제안한다.",scope:"project",status:"user-provided",sourceIds:[source.id],approved:false});
  pos.claimIds=[...new Set([...pos.claimIds,"slt-integrated-offering"])];
  pos.comparisonMatrix=[
    {criterion:"위험 인식",referenceA:"사람·차량 엣지 분석\n영역·선 통과 이벤트",referenceB:"옥외 표시 기능\n인식·경보 구성별 확인",proposal:"자체 AI NPU 안전관리 장치\n현장 인식·위험 분석·음성 알림",advantage:"현장 조건에 맞춘 안전 구성",claimIds:["axis-reference","led-reference","own-npu","product-platform"]},
    {criterion:"안내·표출",referenceA:"경광·사이렌 이벤트\n장치·SW 연계",referenceB:"옥외 컬러 LED·디밍\n밝기·시야각 사양 공개",proposal:"컬러 LED AIoT 전광판\n센서·CCTV·AI 콘텐츠·공공광고",advantage:"안전과 공공정보를 함께 활용",claimIds:["axis-reference","led-reference","aiot-content"]},
    {criterion:"운영·재사용",referenceA:"관제·회수 범위\n제안 구성별 확인",referenceB:"안전 연동·운영 범위는\n시스템 구성별로 확인",proposal:"AI 지능형 안전 관제\n공급·운영 지원·회수·재투입",advantage:"장비 이후의 운영까지 한 범위로",claimIds:["integrated-control","reuse-strategy","slt-integrated-offering"]},
  ];
  m.benefitScenes=[
    {path:"examples/assets/product-pedestrian-warning-v8.png",rights:"generated",caption:"보행자 차량 접근 알림 구성 예시",reuseReason:"앞서 설명한 보행자 알림 장면을 시민의 인지 가치와 연결해 재사용",mechanism:"차량 접근 음성·주의 알림\n주변 확인을 돕는 현장 안내",value:"접근 인지 기회 확대"},
    {path:"examples/assets/product-driver-led-v8.png",rights:"generated",caption:"운전자 LED·유도원 통제 구성 예시",reuseReason:"제품 구성 장면을 출차 전 직접 확인·유도원 통제 가치와 연결해 재사용",mechanism:"보행 영상·객체인식·통제 표시\n직접 확인과 유도원 통제",value:"출차 전 확인의 일관성"},
    {path:"examples/assets/public-information-value-v11.png",rights:"generated",caption:"공공정보 AIoT 전광판 활용 개념",reuseReason:"공공정보 전달과 회수 가능한 장비의 지속 활용 가치를 설명하는 새 장면",mechanism:"공공안내·광고와 통합관제\n준공 후 회수·다음 현장 재투입",value:"설비·운영 경험의 재사용"},
  ];
  b.productStrategy.driverScreen={status:"proposed-interface-example",objectBoxes:[
    {id:"ped-01",label:"보행자 01",x:.326,y:.165,w:.067,h:.33},
    {id:"ped-02",label:"보행자 02",x:.408,y:.242,w:.078,h:.412},
  ],controlLabel:"유도원 통제 중",controlStatus:"illustrative-not-live-confirmation"};
  const story=(id:string)=>raw.planning.story.find((s:any)=>s.id===id);
  story("alternatives").title="다른 장비 구성과 에스엘티 통합 제품의 차이";
  story("alternatives").answer="AI 카메라·경보장치와 옥외 LED의 공개 기능을 기준으로 비교하고, 에스엘티 제안은 현장 맞춤 안전 구성·공공정보 활용·통합 운영과 재투입까지의 범위를 장점으로 제시합니다.";
  story("alternatives").visualPlan.readingGuide={message:"현장 맞춤 안전·공공정보 활용·통합 운영까지 한 제안으로",keyPhrase:"한 제안으로",focusPhrases:["에스엘티 통합 제품","현장 조건에 맞춘 안전 구성","안전과 공공정보","운영까지"],tone:"teal"};
  story("alternatives").visualPlan.legend="공식 자료의 기능군 비교 · 동일 완제품·가격·성능 우열 비교 아님 · 미공개 기능의 부재를 뜻하지 않음";
  const matrixRefs=pos.comparisonMatrix.flatMap((r:any)=>r.claimIds);
  story("alternatives").proofClaimIds=[...new Set([...story("alternatives").proofClaimIds,...matrixRefs])];
  story("alternatives").visualPlan.evidenceIds=[...new Set([...story("alternatives").visualPlan.evidenceIds,...matrixRefs])];
  story("organization").title="시민·현장·천안시에 남기는 통합 사업의 가치";
  story("organization").visualPlan.legend="제안 구성·기대가치 예시 · 실제 천안 현장·성과 사진 아님 · 사고 감소율·절감액은 미측정 · 기본 안전조치·현장 통제 유지";
  story("organization").visualPlan.readingGuide={message:"시민의 인지·현장의 확인·천안시의 지속 활용을 함께 설계",keyPhrase:"천안시의 지속 활용",focusPhrases:["시민 안전","현장 대응","천안시 활용","기회 확대","재사용"],tone:"teal"};
  m.expansion[2].decision="공개 계획 · 발주·설치 수요 미확정";
  for(const id of ["cover","cheonan-context","alternatives","scope","integration","organization","budget","time-scenario","decision"]){
    const s=story(id);s.proofClaimIds=[...new Set([...s.proofClaimIds,"slt-integrated-offering"])];s.visualPlan.evidenceIds=[...new Set([...s.visualPlan.evidenceIds,"slt-integrated-offering"])];
  }
  story("alternatives").proofClaimIds.sort();
}
