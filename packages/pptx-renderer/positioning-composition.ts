import sharp from "sharp";
import type { DrawingContext } from "./semantic.js";
import { professionalKit,resolveTokens } from "./professional-kit.js";
import { POSITIONING_KINDS } from "../business-case/positioning-schema.js";
export async function renderPositioningComposition(ctx:DrawingContext){
  const T = resolveTokens(ctx.p);
 const {p,spec,pptx,slide,elements}=ctx,v=spec.reasoning?.visualPlan;
 if(!v||!(POSITIONING_KINDS as readonly string[]).includes(v.kind))return false;
 const b=p.businessCase!.productPositioning!;
 const {tx,shape,line,iconLabel,header,legend,region}=professionalKit(ctx);
 header(v.kind==="competitive-context"?"제품 선택과 통합 범위":"핵심 제품 역량",v.takeaway);
 if(v.kind==="competitive-context"){
   if(b.comparisonMatrix){
     const xs=[.64,2.36,5.32,8.28],ws=[1.6,2.8,2.8,4.4];
     const heads=["비교 기준","Axis Object Analytics\n+ D4100-E","옥외 LED 전광판\nSamsung XHB-F","에스엘티 통합 제품\nAI 제품·관제·운영 서비스"];
     heads.forEach((s,i)=>{shape(pptx.ShapeType.roundRect,xs[i],2.64,ws[i],.64,i===3?T.accent:T.panel,i===3?T.accent:T.line);tx(s,xs[i]+.08,2.68,ws[i]-.16,.58,i===3?17:16,i===3?T.white:T.ink,true,{valign:"mid"});});
     b.comparisonMatrix.forEach((r,i)=>{
       const y=3.43+i*1.0;
       shape(pptx.ShapeType.roundRect,.64,y,12.04,.92,T.white,T.line);
       elements.at(-1)!.comparisonCriterion=r.criterion;
       shape(pptx.ShapeType.roundRect,8.28,y,4.4,.92,T.tealTint,T.accent);
       tx(r.criterion,.78,y+.28,1.32,.39,17,T.ink,true);
       tx(r.referenceA,2.48,y+.16,2.56,.62,16,T.muted);
       tx(r.referenceB,5.44,y+.16,2.56,.62,16,T.muted);
       tx(r.proposal,8.43,y+.08,4.1,.54,16,T.ink,true);
       tx(r.advantage,8.43,y+.66,4.1,.24,13,T.accent,true);
     });
     legend(v.legend);region();elements.at(-1)!.positioningVisualKind=v.kind;
     return true;
   }
   b.comparisons.forEach((r,i)=>{
     const x=.64+i*6.18;
     tx(r.name,x,2.7,5.86,.45,20,T.ink,true);
     tx(r.category,x,3.24,5.86,.34,15,T.blue,true);
     tx(r.confirmed,x,3.7,5.86,.6,17,T.ink);
     tx(r.scopeQuestion,x,4.37,5.86,.58,14,T.muted);
   });
   shape(pptx.ShapeType.roundRect,.64,5.18,12.04,1.23,T.tealTint,T.tealTint);
   tx("SmartFence 통합 제안",.88,5.37,3.0,.7,22,T.accent,true);
   const xs=[4.08,6.3,8.52,10.74],labels=b.platform?["AI NPU\n안전관리 장치","컬러 LED\nAIoT 전광판","AI 지능형\n안전 관제","회수·재투입"]:["NPU·AI 보드","컬러 LED·음성","안전관제·지원","회수·재투입"];
   labels.forEach((s,i)=>{tx(s,xs[i],5.55,1.92,.52,17,T.ink,true);if(i<3){if(b.platform&&i===0)tx("+",xs[i]+1.92,5.65,.21,.3,16,T.accent,true,{align:"center"});else line(xs[i]+1.92,5.8,xs[i]+2.13,5.8,T.accent,true);}});
 }else{
   const m=await sharp(spec.image!.path).metadata(),s=Math.min((b.platform?5.9:6.68)/m.width!,3.8/m.height!),iw=m.width!*s,ih=m.height!*s,x=.64,y=2.64+(3.8-ih)/2;
   slide.addImage({path:spec.image!.path,x,y,w:iw,h:ih});
   elements.push({slideId:spec.id,id:"positioning-product-scene",kind:"image",x,y,w:iw,h:ih,image:{path:spec.image!.path,width:m.width!,height:m.height!,dpi:m.width!/iw}});
   for(const [i,r] of b.strengths.entries()){
     const yy=b.platform?2.64+i*1.32:2.68+i*1.26;
     const rx=b.platform?6.98:7.72,rw=12.68-rx;
     if(b.platform)shape(pptx.ShapeType.roundRect,rx-.14,yy-.05,rw+.14,1.24,T.white,T.line);
     else if(i)line(rx,yy-.08,12.68,yy-.08,T.line);
     await iconLabel(["cpu","monitor","network"][i],r.label,rx,yy,rw,.5,b.platform?18:19,T.accent);
     tx(r.mechanism,rx,yy+(b.platform ? .56 : .64),rw,.58,16,T.ink);
   }
 }
 legend(v.legend);region();elements.at(-1)!.positioningVisualKind=v.kind;
 return true;
}
