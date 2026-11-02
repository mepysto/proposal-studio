import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Project } from "../packages/core/schema.js";
import { compileStoryboard, planningAudit } from "../packages/planning/index.js";
import { render } from "../packages/pptx-renderer/index.js";
import { geometry, visualCoverage, identityAndAlignment } from "../packages/quality-assurance/index.js";
import { visualAdequacy } from "../packages/visual-assets/adequacy.js";

test("SLT portfolio preserves proposed capabilities, unknown costs and human control through rendering", async () => {
  const p=Project.parse(JSON.parse(fs.readFileSync("examples/slt-ai-portfolio.project.json","utf8")));
  p.slides=compileStoryboard(p);
  assert.deepEqual(planningAudit(p).issues,[]);
  assert.equal(p.slides.length,23);
  for (const id of ["ai-pipeline","field-package","reuse-options","cctv-difference","public-space-fit","park-safety"])
    assert(p.planning!.story.some(s=>s.id===id));
  assert(!p.planning!.story.some(s=>["measurement","model-validation"].includes(s.id)));
  for (const id of ["construction","driver-screen","walkway","parking","disaster","festival"]){
    const beat=p.planning!.story.find(s=>s.id===id)!;
    assert(beat.proofClaimIds.some(id=>id.endsWith("-context")), `No local problem evidence: ${id}`);
    assert(beat.visualPlan!.legend.includes("보도") && beat.visualPlan!.legend.includes("출처:"));
    assert(p.businessCase!.sections.find(s=>s.id===id)!.caption.includes("변화") || id==="festival");
  }
  assert.equal(p.businessCase!.budget.status,"unquoted");
  assert.equal(p.businessCase!.budget.items.length,0);
  assert(p.businessCase!.metrics.every(m=>m.baseline===null && m.target===null));
  assert.deepEqual(p.proposer!.coverCollaborators,[]);
  assert(p.planning!.operatingBoundary.includes("미감지를 통행 허가로 쓰지 않고"));
  assert(p.planning!.story.every(s=>s.visualPlan!.explanation!.requiredMarks.length));
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"slt-ai-test-"));
  try {
    const {elements}=await render(p,path.join(dir,"portfolio.pptx"));
    assert.deepEqual(geometry(elements),[]);
    assert.deepEqual(visualCoverage(p,elements),[]);
    assert.deepEqual(identityAndAlignment(p,elements),[]);
    assert(visualAdequacy(p,elements).pages.every(p=>p.missing.length===0));
    const visible=elements.map(e=>e.text||"").join("\n");
    assert(visible.includes("통행 허가가 아님"));
    assert(visible.includes("실제 조치·확인자 기록 필요"));
    assert(visible.includes("사업비 미견적"));
    assert(visible.includes(p.proposer!.contact!.phone));
    for(const term of ["ONNX","INT8","eventId","TP/(TP+FP)"]) assert(!visible.includes(term));
    const appendix=JSON.parse(fs.readFileSync("examples/slt-ai-portfolio.technical-appendix.json","utf8"));
    assert.equal(appendix.pages.length,4);
    assert(visible.includes("상용 AI 공개 기능"));
    assert(visible.includes("SLT 독점 기능·성능 우위 주장 아님"));
    assert(visible.includes("학교·공공시설"));
    assert(visible.includes("공원·산책로"));
    assert(p.businessCase!.context.notEstablished.some(x=>x.includes("신규 공공공간")));
    assert(!visible.includes("시험 영상 학습 유입 금지"));
    for (const term of ["AI 추론", "기존 영상과 안내 장비 활용 우선", "사업비 미견적", "담당 창구 지정", "백석5지구", "봉명동", "광덕", "청수지하차도", "인파", "동일 기능 재구축 제외"])
      assert(visible.includes(term), `Technical content missing from visible slides: ${term}`);
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
