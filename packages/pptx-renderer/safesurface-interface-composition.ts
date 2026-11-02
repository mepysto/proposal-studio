import type { DrawingContext } from './semantic.js';
import { professionalKit,resolveTokens } from './professional-kit.js';
type Photo = (path:string,x:number,y:number,w:number,h:number)=>Promise<unknown>;
/** Editable manual-derived screen examples. Values and buyer interpretation live in the authored input. */
export async function renderSafeSurfaceInterface(ctx:DrawingContext,kit:ReturnType<typeof professionalKit>,photo:Photo){
  const T = resolveTokens(ctx.p);
 const u=ctx.spec.reasoning?.visualPlan?.interfaceExample;
 if(!u)return false;
 const {tx,panel,shape}=kit,{elements,spec,pptx}=ctx;
 const frame=(x:number,y:number,w:number,h:number,fill=T.white)=>panel(x,y,w,h,fill,T.line);
 frame(.64,2.76,9.2,3.7);
 elements.at(-1)!.displayObjectId='ecowayvision-'+u.kind;
 shape(pptx.ShapeType.rect,.64,2.76,9.2,.4,T.ink,T.ink);
 const names={dashboard:'대시보드',site:'현장 상세',ai:'AI 관제',alerts:'경보 관리',maintenance:'에너지·정비'};
 tx('EcowayVision  /  '+names[u.kind],.83,2.84,5.4,.25,15,T.white,true);
 tx('재구성 · 예시 데이터',7.18,2.86,2.46,.21,11,T.white,false,{align:'right'});
 shape(pptx.ShapeType.rect,.66,3.18,1.23,3.24,T.panel,T.panel);
 const menus=['대시보드','AI 관제','경보 관리','GIS 지도','현장 관리','운영일지'];
 menus.forEach((m,i)=>{
  const active=(u.kind==='dashboard'&&i===0)||(u.kind==='ai'&&i===1)||(u.kind==='alerts'&&i===2)||(['site','maintenance'].includes(u.kind)&&i===4);
  if(active)panel(.76,3.41+i*.41,1.02,.33,T.tealTint,T.tealTint);
  tx(m,.83,3.48+i*.41,.93,.22,12,active?T.accent:T.muted,active);
 });
 tx(u.at+' 예시',.82,6.13,.95,.22,11,T.muted);
 const x=2.1,w=7.5;
 u.metrics.forEach((m,i)=>{
  const ww=w/u.metrics.length-.12,xx=x+i*(w/u.metrics.length);
  frame(xx,3.34,ww,.65,m.tone==='danger'?'F9E9E5':m.tone==='caution'?'F6ECD9':T.panel);
  tx(m.label,xx+.12,3.43,ww-.24,.21,11,T.muted);
  tx(m.value,xx+.12,3.68,ww-.24,.25,16,m.tone==='danger'?T.red:m.tone==='caution'?T.amber:T.ink,true);
 });
 const tinyLabel=(s:string,xx:number,yy:number,ww:number)=>tx(s,xx,yy,ww,.21,11,T.muted);
 if(u.kind==='dashboard'){
  tinyLabel('도시  전체   /   현장 검색',x,4.04,w);
  u.records.forEach((r,i)=>{
   const xx=x+i*2.54;
   frame(xx,4.31,2.42,1.06);
   tx(r.name,xx+.12,4.38,2.18,.22,13,T.ink,true);
   tx(r.status,xx+.12,4.66,2.18,.24,16,i===0?T.amber:i===1?T.red:T.accent,true);
   tx(r.detail,xx+.12,4.99,2.18,.23,11,T.muted);
   tx(r.updated,xx+.12,5.23,2.18,.16,9,T.muted);
  });
  if(u.image){
   await photo(u.image.path,x,5.51,2.17,.66);
   tinyLabel('A시설 영상 · 가상 장면',x,6.19,2.34);
  }
  tx('최근 경보',4.52,5.5,4.95,.23,13,T.ink,true);
  u.evidence.forEach((e,i)=>tx(e.value,4.52,5.86+i*.31,4.95,.24,13,i===0?T.amber:T.red));
 } else if(u.kind==='site'){
  tx(u.evidence[0].value,x,4.13,3.25,.26,15,T.ink,true);
  if(u.image){
   await photo(u.image.path,x,4.52,3.35,1.37);
   tinyLabel(u.image.caption,x,5.96,3.35);
  }
  const xx=5.69;
  u.evidence.slice(1).forEach((e,i)=>{
   const yy=4.15+i*.65;
   tinyLabel(e.label,xx,yy,3.74);
   tx(e.value,xx,yy+.27,3.74,.25,14,T.ink,true);
  });
  frame(x,6.14,7.5,.26,T.tealTint);
  tx(u.records[0].name+'  |  '+u.records[0].detail,x+.1,6.16,7.3,.21,11,T.accent,true);
 } else if(u.kind==='ai'){
  tx('예열 타임라인  /  06:00–07:00 예시',x,4.12,w,.25,13,T.accent,true);
  const x0=2.36, span=6.75, yy=4.87;
  kit.line(x0,yy,x0+span,yy,T.line);
  tinyLabel('06:00',x0-.15,5.02,.7);
  u.timeline!.forEach((m,i)=>{
    const xx=x0+span*m.minute/60;
    shape(pptx.ShapeType.ellipse,xx-.045,yy-.045,.09,.09,i===1?T.amber:T.accent,i===1?T.amber:T.accent);
    const below=i===1,labelY=below?5.06:4.43;
    kit.line(xx,below?yy+.06:yy-.06,xx,below?5.0:4.78,T.accent);
    tx(m.label+' '+m.time,xx-(i===2?1.3:.75),labelY,1.6,.24,12,T.accent,true);
  });
  u.evidence.slice(1,3).forEach((e,i)=>{
    tx(e.label,x+.1,5.63+i*.43,1.36,.24,12,T.muted,true);
    tx(e.value,x+1.66,5.63+i*.43,5.69,.25,14,T.ink,true);
  });
 } else if(u.kind==='alerts'||u.kind==='maintenance'){
  const widths=[1.94,1.14,3.14,1.28],heads=u.kind==='alerts'?['현장·경보','상태','담당·조치','시각']:['대상','상태','관측·기록','시각'];
  heads[0]=u.kind==='alerts'?'현장·경보':'대상';
  shape(pptx.ShapeType.rect,x,4.15,w,.34,T.panel,T.panel);
  let xx=x;heads.forEach((h,i)=>{tx(h,xx+.08,4.21,widths[i]-.16,.22,11,T.muted,true);xx+=widths[i];});
  u.records.forEach((r,i)=>{
   const yy=4.53+i*.48;
   if(i%2===0)shape(pptx.ShapeType.rect,x,yy,w,.47,'F6F8FA','F6F8FA');
   let xx=x;[r.name,r.status,r.detail,r.updated].forEach((t,c)=>{
    tx(t,xx+.08,yy+.1,widths[c]-.16,.28,c===2?12:11,c===1?(/미확인|점검 필요/.test(r.status)?T.red:/조치 중/.test(r.status)?T.amber:T.accent):T.ink,c===1);
    xx+=widths[c];
   });
  });
  const e=u.evidence[0];
  frame(x,6.08,w,.31,T.tealTint);
  tx(e.label+'  |  '+e.value,x+.1,6.13,w-.2,.21,12,T.accent,true);
 }
 // A buyer can see both the information and the field decision it supports.
 frame(10.15,2.76,2.53,3.7,T.tealTint);
 tx(u.decision.title,10.33,3.01,2.17,.73,21,T.ink,true);
 tx(u.decision.reason,10.33,4.02,2.17,.92,16,T.muted);
 tx(u.decision.action,10.33,5.14,2.17,1.03,16,T.ink,true);
 elements.at(-1)!.fieldSafetyIndicator=true;
 return true;
}
