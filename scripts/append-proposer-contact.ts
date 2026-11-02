/** Transcribed from the user's original SLT proposal, page 13, visually checked. */
export function appendProposerContact(raw:any){
  const sourceId="U-SLT-CONTACT",claimId="slt-contact";
  const source={id:sourceId,title:"사용자 제공 에스엘티 원본 제안서 13페이지 · 로고와 연락처",scope:"project",materialId:"references/AI스마트도시정보시스템제안서(에스엘티)_천안.pdf#page=13",excerpt:"(주)에스엘티 / (041) 571-2057/8 / slt888@hanmail.net / 충남 천안시 동남구 청당산업길 143(구룡동)",applicability:"PDF 텍스트의 숫자 CID 누락을 원본 페이지 렌더로 대조해 전사. 로고는 같은 원본 PDF의 실제 표장을 추출. 제공 자료 기준이며 외부 최신성 재확인 아님."};
  const claim={id:claimId,text:"사용자 제공 에스엘티 제안서 13페이지에 실제 로고, 대표전화 (041) 571-2057/8, 이메일 slt888@hanmail.net과 본사 주소가 기재돼 있다.",scope:"project",status:"user-provided",sourceIds:[sourceId],approved:false};
  for(const [list,value] of [[raw.sources,source],[raw.claims,claim]] as const){const i=list.findIndex((v:any)=>v.id===value.id);if(i<0)list.push(value);else list[i]=value;}
  raw.proposer.contact ||= {logoPath:"examples/assets/slt-logo-source.png",phone:"(041) 571-2057/8",email:"slt888@hanmail.net",address:"충남 천안시 동남구\n청당산업길 143(구룡동)",sourceClaimIds:[claimId]};
  const c=raw.proposer.contact;
  const title="제안사 안내 및 사업 문의";
  const message="현장 조사·제품 시연·통합 운영 제안 문의";
  const beat={id:"contact",stage:"business",sectionId:"contact",title,question:"현장 조사와 제품 구성에 관한 제안 문의는 어디로 연락하는가?",answer:"제안 주관 (주)에스엘티의 공식 로고와 사용자 제공 대표전화·이메일·본사 주소로 사업 문의를 연결합니다.",proofClaimIds:[claimId],visualPurpose:"실제 제안사 표장과 연락 수단을 하나의 시각적 명함으로 구성해 후속 협의 경로를 명확히 제시",limitation:"로고·연락처: 사용자 제공 에스엘티 원본 제안서 13페이지 기준",visualPlan:{kind:"contact-card",intent:"structural",takeaway:message,encoding:"왼쪽의 실제 제안사 로고·법인명과 오른쪽의 전화·이메일·본사 주소를 분리한 명함형 종결",evidenceIds:[claimId],nodes:[{id:"identity",label:raw.proposer.legalName,detail:"제안 주관",icon:"city"},{id:"contact",label:"사업 문의",detail:c.email,icon:"document"}],edges:[],legend:"로고·연락처: 사용자 제공 에스엘티 제안서 13페이지",readingGuide:{message,keyPhrase:"제품 시연",focusPhrases:["(주)에스엘티","사업 문의"],tone:"teal"}}};
  raw.planning.story.push(beat);
  raw.businessCase.sections.push({id:"contact",chapter:"decision",kicker:"제안사 안내",visual:"municipal",items:[{label:"전화",detail:c.phone},{label:"이메일",detail:c.email},{label:"본사",detail:c.address}]});
  raw.businessCase.targetSlideCount=raw.planning.story.length;
  raw.slides.push({id:"contact",layout:"editorial",title,message,items:[],claimIds:[claimId],image:{path:c.logoPath,rights:"user-authorized",caption:"제공 원본의 에스엘티 로고"}});
}
