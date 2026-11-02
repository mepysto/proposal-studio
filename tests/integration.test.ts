import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { init, stage } from "../packages/core/pipeline.js";
import { load, readJSON, projectDir } from "../packages/core/store.js";
// Explicit opt-in: requires LibreOffice, Poppler and Python PDF dependencies.
const integration = process.env.PROPOSAL_INTEGRATION === "1" ? test : test.skip;
integration(
  "full five-layout pipeline exports five PDF pages; single-slide revision preserves full output",
  async () => {
    const id = `integration-${Date.now()}`;
    try {
      await init(id, { config: "examples/smartfence.project.json" });
      await stage(id, "run");
      const dir = projectDir(id),
        out = path.join(dir, "output");
      const qa = await readJSON(path.join(out, "qa.json"));
      assert.equal(qa.status, "automated-checks-passed");
      assert.equal(qa.checks.renderedPages, 5);
      assert.equal(qa.issues.length, 0);
      const inspection = await readJSON(path.join(out, "inspection-status.json"));
      assert.equal(inspection.status, "inspection-incomplete-or-stale");
      assert.equal(inspection.finalApproval, false);
      const template = await readJSON(path.join(out, "inspection-template.json"));
      assert.equal(template.pages.length, 5);
      assert(template.pages.every((p: any) => p.previewHash && p.decision === "pending"));
      assert((await fs.readFile(path.join(out, "design-review.html"), "utf8")).includes("preview/slide-1.png"));
      assert.equal(
        (await fs.readdir(path.join(out, "preview"))).filter((f) =>
          /^slide-.*png$/.test(f),
        ).length,
        5,
      );
      const original = await fs.readFile(path.join(out, "proposal.pptx"));
      const fullLatest = await readJSON(path.join(dir, "latest.json"));
      await stage(id, "regenerate", { slide: "operation" });
      assert.deepEqual(
        await readJSON(path.join(dir, "latest.json")),
        fullLatest,
      );
      assert.deepEqual(
        await fs.readFile(path.join(out, "proposal.pptx")),
        original,
      );
      const partial = await readJSON(
        path.join(dir, "latest-slide-operation.json"),
      );
      assert.equal(
        (await readJSON(path.join(partial.out, "pdf-check.json"))).pages,
        1,
      );
      assert.equal((await load(id)).slides.length, 5);
    } finally {
      await fs.rm(projectDir(id), { recursive: true, force: true });
    }
  },
);

integration(
  "planning pipeline renders seven semantic slides and preserves diagram text and human authority",
  async () => {
    const id = `integration-v2-${Date.now()}`;
    try {
      await init(id, { config: "examples/smartfence-v2.project.json" });
      await stage(id, "run");
      const dir = projectDir(id),
        { out } = await readJSON(path.join(dir, "latest.json"));
      const qa = await readJSON(path.join(out, "qa.json")),
        pdf = await readJSON(path.join(out, "pdf-check.json"));
      assert.equal(pdf.pages, 7);
      assert.equal(qa.issues.length, 0);
      assert.equal(qa.planning.status, "ready-for-human-review");
      assert.equal(qa.finalApproval, false);
      const config = await load(id);
      const planning = config.planning!;
      // Check critical meaning against authored copy, so editorial revisions do
      // not require keeping obsolete wording in the actual proposal.
      assert(
        pdf.text.includes(
          planning.workflow.find((w) => w.owner === "human")!.action,
        ),
      );
      assert(
        pdf.text.includes(
          planning.alternatives.find((a) => a.priority === "baseline")!.name,
        ),
      );
      assert(pdf.text.includes(planning.operatingBoundary));
      assert(
        (
          await fs.readFile(
            path.join(dir, "output", "decision-brief.md"),
            "utf8",
          )
        ).includes("일반 근거"),
      );
      const original = await fs.readFile(
        path.join(dir, "output", "proposal.pptx"),
      );
      await stage(id, "regenerate", { slide: "risk" });
      assert.deepEqual(
        await fs.readFile(path.join(dir, "output", "proposal.pptx")),
        original,
      );
    } finally {
      await fs.rm(projectDir(id), { recursive: true, force: true });
    }
  },
);

integration(
  "full Cheonan case exports 27 verified pages, editable charts and the authored evidence dossier",
  async () => {
    const id = `integration-full-${Date.now()}`;
    try {
      await init(id, { config: "examples/smartfence-full.project.json" });
      await stage(id, "run");
      const dir = projectDir(id),
        { out } = await readJSON(path.join(dir, "latest.json"));
      const qa = await readJSON(path.join(out, "qa.json"));
      const pdf = await readJSON(path.join(out, "pdf-check.json"));
      assert.equal(pdf.pages, 27);
      assert(pdf.pageTexts[0].includes("(주)에스엘티"));
      assert(pdf.pageTexts[24].includes("(주)에스엘티"));
      assert(pdf.pageTexts[0].includes("강민코퍼레이션"));
      assert(!pdf.pageTexts[0].includes("비트리"));
      assert.equal(pdf.pageTexts.length, 27);
      assert(pdf.pageTexts.at(-1)!.includes("(주)에스엘티"));
      assert(pdf.pageTexts.at(-1)!.includes("slt888@hanmail.net"));
      assert(pdf.pageTexts.at(-1)!.includes("571-2057/8"));
      const visualPlan = await readJSON(
        path.join(dir, "output", "visual-plan.json"),
      );
      assert.equal(visualPlan.length, 27);
      assert(pdf.pageTexts[23].includes("지능형 CCTV 구성"));
      assert(pdf.pageTexts[24].includes("공영주차장"));
      assert(pdf.pageTexts[24].includes("공원·체육시설"));
      const adequacy=await readJSON(path.join(dir,"output","visual-adequacy.json"));
      assert.equal(adequacy.pages.length,27);
      assert(adequacy.pages.every((p:any)=>p.required.length && p.missing.length===0));
      assert.equal(adequacy.finalApproval,false);
      const evidence = await readJSON(
        path.join(dir, "output", "visual-evidence.json"),
      );
      assert.equal(evidence.pages.filter((p: any) => p.map).length, 3);
      assert.equal(evidence.pages.filter((p: any) => p.chains).length, 1);
      assert.deepEqual(
        evidence.quantitativeDatasets[0].rows
          .map((r: any) => r.value)
          .sort((a: number, b: number) => a - b),
        [13, 17, 27, 34],
      );
      assert(pdf.pageTexts[3].includes("SmartFence 실증 성과가 아님"));
      assert(pdf.pageTexts[3].includes("대전일보 2025.02.26"));
      assert(pdf.pageTexts[3].includes("대전일보 2026.02.08"));
      assert(pdf.pageTexts[13].includes("감지영역 내 미검출"));
      assert(pdf.pageTexts[13].includes("영상·상태 확인 불가"));
      assert(pdf.pageTexts[19].includes("현장조사 후 견적"));
      assert(!pdf.pageTexts[19].includes("7,200"));
      assert(pdf.pageTexts[14].includes("AI NPU 안전관리 장치"));
      assert(pdf.pageTexts[14].includes("천안시 운영 보고"));
      assert(pdf.pageTexts[18].includes("시민"));
      assert(pdf.pageTexts[21].includes("상호 협업"));
      assert(pdf.pageTexts[22].includes("시험 조건"));
      assert(!pdf.text.includes("천안의 공사 일정에 맞춘 후속 사업 기회"));
      assert(pdf.pageTexts[11].includes("자체 제작 AI NPU 안전관리 장치"));
      assert(pdf.pageTexts[11].includes("컬러 LED AIoT 전광판"));
      assert(pdf.pageTexts[11].includes("AI 콘텐츠 생성"));
      assert(pdf.pageTexts[11].includes("공공광고"));
      assert(pdf.pageTexts[14].includes("AI 지능형 안전 관제"));
      assert(!pdf.text.includes("비트리 통합관제"));
      assert(pdf.pageTexts[13].includes("보행자 01"));
      assert(pdf.pageTexts[13].includes("유도원 통제 중"));
      assert(pdf.pageTexts[10].includes("에스엘티 통합 제품"));
      assert(pdf.pageTexts[0].includes("천안시 공공사업"));
      assert(!pdf.text.includes("강민 제작"));
      assert(pdf.pageTexts[10].includes("Axis Object Analytics"));
      assert(pdf.pageTexts[10].includes("Samsung XHB-F"));
      assert(!pdf.text.includes("업계 최고"));
      assert(!pdf.text.includes("AI 생성"));
      assert(pdf.pageTexts[20].includes("보관·다음 수요 배정"));
      assert(pdf.pageTexts[20].includes("옮겨 쓰는 설비"));
      assert(pdf.pageTexts[20].includes("현장마다 다시 맞출 부분"));
      assert(pdf.pageTexts[21].includes("현장 안전책임자"));
      assert(pdf.pageTexts[21].includes("기술 지원 ↔ 현장 피드백"));
      assert(
        visualPlan.every(
          (b: any) => b.composition && b.evidenceClaimIds.length,
        ),
      );
      const elements = await readJSON(path.join(out, "elements.json"));
      const { visualCoverage } =
        await import("../packages/quality-assurance/index.js");
      assert.deepEqual(visualCoverage(await load(id), elements), []);
      assert.equal(qa.issues.length, 0);
      assert.equal(qa.finalApproval, false);
      for (const label of [
        "와촌동",
        "원성동",
        "봉명지구",
        "기준선 미측정",
        "재투입",
      ])
        assert(pdf.text.includes(label), label);
      const dossier = await fs.readFile(
        path.join(dir, "output/business-case.md"),
        "utf8",
      );
      assert(dossier.includes("상충 관점의 조정"));
      assert(dossier.includes("not-surveyed"));
      const { default: JSZip } = await import("jszip");
      const zip = await JSZip.loadAsync(
        await fs.readFile(path.join(out, "proposal.pptx")),
      );
      assert.equal(
        Object.keys(zip.files).filter((n) =>
          /^ppt\/charts\/chart\d+\.xml$/.test(n),
        ).length,
        1,
      );
      assert.equal(
        (await fs.readdir(path.join(out, "preview"))).filter((n) =>
          /^slide-.*png$/.test(n),
        ).length,
        27,
      );
    } finally {
      await fs.rm(projectDir(id), { recursive: true, force: true });
    }
  },
);

integration("authored concept exports 7 distinct page compositions and artifact-bound design records", async () => {
  const id = `integration-direction-${Date.now()}`;
  try {
    await init(id, { config: "examples/concept-direction.project.json" });
    await stage(id, "run");
    const out = path.join(projectDir(id), "output");
    const qa = await readJSON(path.join(out, "qa.json"));
    assert.equal(qa.issues.length, 0);
    assert.equal(qa.checks.renderedPages, 7);
    assert.equal(qa.finalApproval, false);
    const dossier = await readJSON(path.join(out, "art-direction.json"));
    assert(dossier.designDirection.concept.includes("현장 대응"));
    assert.equal(dossier.pages.length, 7);
    assert(dossier.pages.every((p: any) => p.compositionBrief && p.observedZones.length === 4));
    const review = await fs.readFile(path.join(out, "design-review.html"), "utf8");
    assert(review.includes("기획 콘셉트:"));
    assert(review.includes("시선 흐름"));
    const config = await readJSON(path.join(projectDir(id), "project.json"));
    assert.equal(config.planning.story[0].compositionBrief.visual, "scene");
    assert.equal(config.slides[0].compositionBrief.visual, "scene");
    const manifest = await readJSON(path.join(out, "manifest.json"));
    assert.equal(manifest.artDirection.authoredPages.length, 7);
  } finally { await fs.rm(projectDir(id), { recursive: true, force: true }); }
});

integration("reference-led pages retain source-bound emphasis and typed hierarchy through PDF export", async () => {
  const id=`integration-reference-${Date.now()}`;
  try {
    await init(id,{config:"examples/reference-direction.project.json"});
    await stage(id,"run");
    const out=path.join(projectDir(id),"output");
    const qa=await readJSON(path.join(out,"qa.json"));
    assert.equal(qa.issues.length,0);
    assert.equal(qa.checks.renderedPages,7);
    assert.equal(qa.finalApproval,false);
    const dossier=await readJSON(path.join(out,"art-direction.json"));
    assert.equal(dossier.designDirection.deliveryMode,"presented");
    assert.equal(dossier.pages[1].compositionBrief.chartFocus.series,"보행자 사망자");
    assert.equal(dossier.pages[2].compositionBrief.nodeTreatment,"open");
    const {out:run}=await readJSON(path.join(projectDir(id),"latest.json"));
    const pdf=await readJSON(path.join(run,"pdf-check.json"));
    assert(pdf.pageTexts[1].includes("17명"));
    assert(pdf.pageTexts[1].includes("13명"));
    const html=await fs.readFile(path.join(out,"design-review.html"),"utf8");
    assert(html.includes("참고 원리"));
    assert(html.includes("판단 변화"));
  } finally {await fs.rm(projectDir(id),{recursive:true,force:true});}
});
