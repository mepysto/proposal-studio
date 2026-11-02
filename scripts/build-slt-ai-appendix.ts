/** Build the explicitly deferred technical pages; no external services. */
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import {Project} from "../packages/core/schema.js";
import {compileStoryboard} from "../packages/planning/index.js";
import {render} from "../packages/pptx-renderer/index.js";
import {convert} from "../packages/pdf-renderer/index.js";
import {geometry, visualCoverage, identityAndAlignment} from "../packages/quality-assurance/index.js";
import {visualAdequacy} from "../packages/visual-assets/adequacy.js";
const p=Project.parse(JSON.parse(await fs.readFile("examples/slt-ai-portfolio.project.json","utf8")));
const appendix=JSON.parse(await fs.readFile("examples/slt-ai-portfolio.technical-appendix.json","utf8"));
const ids=new Set<string>(appendix.pages.map((x:any)=>x.story.id));
const at=p.planning!.story.findIndex(s=>s.id==="lifecycle");
p.planning!.story.splice(at,0,...appendix.pages.map((x:any)=>x.story));
p.businessCase!.sections.push(...appendix.pages.map((x:any)=>x.section));
p.slides.push(...appendix.pages.map((x:any)=>x.seed));
p.businessCase!.targetSlideCount=p.planning!.story.length;
for(const [i,x] of appendix.pages.entries()){
 const section=p.businessCase!.sections.find(s=>s.id===x.section.id)!;
 section.kicker=`SLT 기술 참고 · A${i+1} · 제안 본문 제외`;
}
Object.assign(p,Project.parse(p));
p.slides=compileStoryboard(p).filter(s=>ids.has(s.id));
p.title="SLT AI 솔루션 — 기술 검토 참고자료";
const out=path.resolve("projects/slt-ai-portfolio/output/technical-appendix");
await fs.mkdir(out,{recursive:true});
const {elements}=await render(p,path.join(out,"technical-appendix.pptx"));
const issues=[...geometry(elements),...visualCoverage(p,elements),...identityAndAlignment(p,elements)];
// Coverage and adequacy apply only to the extracted appendix pages.
const subset=structuredClone(p);subset.planning!.story=subset.planning!.story.filter(s=>ids.has(s.id));
const adequacy=visualAdequacy(subset,elements);
assert.deepEqual(issues,[]);
assert(adequacy.pages.every(p=>p.missing.length===0));
const result=await convert(path.join(out,"technical-appendix.pptx"),out,appendix.pages.length);
await fs.writeFile(path.join(out,"qa.json"),JSON.stringify({purpose:appendix.purpose,finalApproval:false,checks:"geometry, rendered visual marks, PDF page count; extracted technical reference, not an additional full proposal",issues,pdf:result.report},null,2));
console.log(out);
