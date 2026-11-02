import sharp from "sharp";
import type { DrawingContext } from "./semantic.js";
import {professionalKit,resolveTokens} from "./professional-kit.js";
export async function renderContactComposition(ctx:DrawingContext){
  const T = resolveTokens(ctx.p);
  const {p,spec,pptx,slide,elements}=ctx,v=spec.reasoning?.visualPlan;
  if(v?.kind!=="contact-card")return false;
  const c=p.proposer!.contact!,{header,shape,tx,iconLabel}=professionalKit(ctx);
  header("제안사 안내",v.takeaway);
  shape(pptx.ShapeType.roundRect,.64,2.64,5.82,3.82,T.white,T.line);
  const m=await sharp(c.logoPath).metadata(),w=4.88,h=w*m.height!/m.width!;
  slide.addImage({path:c.logoPath,x:1.1,y:2.98,w,h});
  elements.push({slideId:spec.id,id:"provided-company-logo",kind:"image",x:1.1,y:2.98,w,h,image:{path:c.logoPath,width:m.width!,height:m.height!,dpi:m.width!/w}});
  tx(p.proposer!.legalName,1.1,4.91,4.9,.55,32,T.ink,true);
  tx("천안시 공공사업 공사현장\nSmartFence AI 시민안전 실증 제안",1.1,5.68,4.9,.62,17,T.muted);
  const rows=[{icon:"phone",label:"대표전화",value:c.phone,size:24},{icon:"mail",label:"이메일",value:c.email,size:23},{icon:"map-pin",label:"본사",value:c.address,size:18}];
  for(const [i,r] of rows.entries()){
    const y=2.64+i*1.28;
    shape(pptx.ShapeType.roundRect,6.88,y,5.8,1.2,i===0?T.tealTint:T.white,T.line);
    await iconLabel(r.icon,r.label,7.1,y+.12,5.36,.32,14,T.accent);
    tx(r.value,7.1,y+.54,5.36,i===2?.59:.49,r.size,T.ink,true,{valign:"mid"});
  }
  return true;
}
