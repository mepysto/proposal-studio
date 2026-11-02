import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {Project} from "../packages/core/schema.js";
import {positioningAudit} from "../packages/business-case/positioning-audit.js";
import {intentRenderingAudit} from "../packages/quality-assurance/index.js";
const fixture=async()=>Project.parse(JSON.parse(await fs.readFile("examples/smartfence-full.project.json","utf8")));
test("supplier-described board capability stays distinct from chip manufacturing and verified competitor facts",async()=>{
 const p=await fixture(),s=p.businessCase!.productPositioning!;
 assert.deepEqual(positioningAudit(p),[]);
 const own=p.claims.find(c=>c.id==="own-npu")!;
 assert.equal(own.status,"user-provided");
 assert(own.text.includes("NPU 칩 자체 제조가 아니며"));
 assert(p.claims.find(c=>c.id==="axis-reference")!.status==="externally-verified");
 assert.equal(s.superiority,"not-established-by-comparative-test");
 s.measurements.ledBrightnessNit=8000;
 s.comparisons[0].claimIds=["absent"];
 const codes=positioningAudit(p).map(i=>i.code);
 assert(codes.includes("unsupported-supplier-spec"));assert(codes.includes("unknown-positioning-evidence"));
});
test("product-strength and competitive comparisons require actual diagrams rather than a generic placeholder",async()=>{
 const p=await fixture();assert.equal(intentRenderingAudit(p,[]).filter(i=>i.code==="positioning-not-rendered").length,2);
 delete p.businessCase!.productPositioning;
 assert(positioningAudit(p).some(i=>i.code==="missing-product-positioning"));
});
test("two field products remain distinct and safety preempts public content",async()=>{
 const p=await fixture(),c=p.businessCase!.productPositioning!,v=c.platform!;
 assert.equal(new Set(v.products.map(r=>r.id)).size,2);
 assert.equal(v.control.provider,"비트리");
 assert.equal(v.displayPolicy.priority,"safety-over-public-content");
 assert.equal(v.displayPolicy.aiContentReview,"operator-review-before-publish");
 assert.equal(v.displayPolicy.cctvAudience,"authorized-internal-only");
 const flow=p.planning!.story.find(s=>s.id==="integration")!.visualPlan!;
 assert(flow.edges.some(e=>e.from==="m1"&&e.to==="m3"));
 assert(!flow.edges.some(e=>e.from==="m2"&&e.to==="m3"));
 v.products[1].id=v.products[0].id;
 assert(positioningAudit(p).some(i=>i.code==="distinct-field-products"));
});
test("comparison rows and value images cannot fall back to generic text blocks",async()=>{
 const p=await fixture(),issues=intentRenderingAudit(p,[]);
 assert.equal(issues.filter(i=>i.code==="comparison-row-not-rendered").length,3);
 assert.equal(issues.filter(i=>i.code==="benefit-image-not-rendered").length,3);
 assert.equal(issues.filter(i=>i.code==="recognition-overlay-not-rendered").length,2);
 assert(issues.some(i=>i.code==="field-control-not-rendered"));
 p.businessCase!.productPositioning!.comparisonMatrix![0].claimIds=["absent"];
 assert(positioningAudit(p).some(i=>i.code==="unknown-comparison-evidence"));
});
