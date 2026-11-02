import type {ProjectData} from "../core/schema.js";
import {POSITIONING_KINDS} from "./positioning-schema.js";
export function positioningAudit(p:ProjectData){
 const issues:{severity:"error";code:string;message:string;path:string;returnTo:string}[]=[];
 const add=(code:string,message:string,path:string)=>issues.push({severity:"error",code,message,path,returnTo:"product-positioning"});
 const pages=p.planning?.story.filter(s=>(POSITIONING_KINDS as readonly string[]).includes(s.visualPlan?.kind||""))||[];
 const c=p.businessCase?.productPositioning;
 if(pages.length&&!c)add("missing-product-positioning","제품 강점·비교 근거가 없습니다.","productPositioning");
 if(!c)return issues;
 const refs=new Set(p.claims.map(c=>c.id)),metrics=new Set(p.businessCase!.metrics.map(m=>m.id));
 for(const id of [...c.claimIds,...c.comparisons.flatMap(r=>r.claimIds),...c.opportunities.flatMap(r=>r.claimIds)])if(!refs.has(id))add("unknown-positioning-evidence","비교·제품·사업 기회의 근거가 없습니다.",id);
 if(c.procurement.some(r=>r.metricIds.some(id=>!metrics.has(id))))add("unmeasured-purchase-value","구매 판단의 지표가 없습니다.","productPositioning.procurement");
 if(Object.values(c.measurements).some(v=>v!==null))add("unsupported-supplier-spec","현재 모델·시험 자료가 없어 정량 사양을 제시할 수 없습니다.","productPositioning.measurements");
 for(const r of c.comparisonMatrix||[])for(const id of r.claimIds){
   if(!refs.has(id))add("unknown-comparison-evidence","비교 행의 근거가 없습니다.",id);
   const page=pages.find(s=>s.visualPlan?.kind==="competitive-context");
   if(page&&(!page.proofClaimIds.includes(id)||!page.visualPlan?.evidenceIds.includes(id)))add("unlinked-comparison-evidence","비교 행의 근거를 해당 페이지와 연결하세요.",id);
 }
 if(c.platform){
   if(new Set(c.platform.products.map(r=>r.id)).size!==2)add("distinct-field-products","두 현장 제품을 구분해야 합니다.","productPositioning.platform.products");
   const ids=[...c.platform.products.flatMap(r=>r.claimIds),...c.platform.control.claimIds];
   for(const id of ids)if(!refs.has(id))add("unknown-platform-evidence","제품·통합관제 설명의 근거가 없습니다.",id);
 }
 return issues;
}
