import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {Project} from "../packages/core/schema.js";
import {planningAudit} from "../packages/planning/index.js";
import {visualCoverage} from "../packages/quality-assurance/index.js";
const fixture=async()=>Project.parse(JSON.parse(await fs.readFile("examples/smartfence-full.project.json","utf8")));
test("contact ending requires real provided identity and source-linked contact information",async()=>{
 const p=await fixture();assert.equal(p.slides.length,27);assert.equal(p.slides.at(-1)!.id,"contact");
 assert.equal(p.businessCase!.targetSlideCount,27);
 assert(p.claims.find(c=>c.id==="slt-contact")!.sourceIds.includes("U-SLT-CONTACT"));
 delete p.proposer!.contact;
 assert(planningAudit(p).issues.some(i=>i.code==="missing-proposer-contact"));
 assert(visualCoverage(p,[]).some(i=>i.code==="missing-contact-identity"));
});
test("an unrelated picture or placeholder contact cannot satisfy contact visual coverage",async()=>{
 const p=await fixture(),c=p.proposer!.contact!,id="contact";
 p.slides=[p.slides.at(-1)!];
 const marks:any[]=[{slideId:id,kind:"image",image:{path:c.logoPath},x:1,y:3,w:4.88,h:1.61},{slideId:id,kind:"text",text:p.proposer!.legalName,fontSize:32},{slideId:id,kind:"text",text:c.phone,fontSize:24},{slideId:id,kind:"text",text:c.email,fontSize:23}];
 assert.deepEqual(visualCoverage(p,marks),[]);
 marks[0].image.path="unrelated.png";
 assert(visualCoverage(p,marks).some(i=>i.code==="missing-contact-identity"));
});
