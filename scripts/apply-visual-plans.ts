import { extendPublicSafety } from "./extend-public-safety.js";
import { refineCollaborationReview } from "./refine-collaboration-review.js";
import { refineVisualAdequacy } from "./refine-visual-adequacy.js";
import { refineProductPositioning } from "./refine-product-positioning.js";
import { refineProductPlatform } from "./refine-product-platform.js";
import { refineIntegratedPresentation } from "./refine-integrated-presentation.js";
import { appendProposerContact } from "./append-proposer-contact.js";
import { refineMunicipalCase } from "./refine-municipal-case.js";
import { applyReadingHierarchy } from "./apply-reading-hierarchy.js";
import { refineEditorialDesign } from "./refine-editorial-design.js";
import { applyProductStrategy } from "./apply-product-strategy.js";
import { refineDecisionDesign } from "./refine-decision-design.js";
import { enrichEvidenceVisuals } from "./evidence-visuals.js";
import fs from "node:fs/promises";
import { Project } from "../packages/core/schema.js";
import { compileStoryboard } from "../packages/planning/index.js";
const file = process.argv[2] || "examples/smartfence-full.project.json";
const raw = JSON.parse(await fs.readFile(file, "utf8"));
// Rebuild only the generated contact ending after the content recipes.
raw.planning.story=raw.planning.story.filter((s:any)=>!["contact","cctv-extension","public-safety-spaces"].includes(s.id));
raw.slides=raw.slides.filter((s:any)=>!["contact","cctv-extension","public-safety-spaces"].includes(s.id));
raw.businessCase.sections=raw.businessCase.sections.filter((s:any)=>!["contact","cctv-extension","public-safety-spaces"].includes(s.id));
// Earlier reviewed recipes still author the archived opportunity page, then the final narrative removes it.
if(!raw.planning.story.some((s:any)=>s.id==="risks")){
  const archived=JSON.parse(await fs.readFile("examples/smartfence-expansion-archive.json","utf8"));
  raw.planning.story.push(archived.beat);raw.businessCase.sections.push(archived.section);
}
const plans = JSON.parse(
  await fs.readFile("examples/smartfence-visual-plans.json", "utf8"),
);
raw.proposer = {
  ...(raw.proposer?.contact?{contact:raw.proposer.contact}:{}),
  legalName: "(주)에스엘티",
  role: "제안 주관",
  collaborators: ["강민코퍼레이션", "비트리"],
  coverCollaborators: ["강민코퍼레이션"],
  sourceClaimIds: ["governance-plan"],
};
raw.design.colors = {
  ink: "142C40",
  paper: "F7F9FB",
  accent: "087F8C",
  muted: "5D7181",
  dark: "142C40",
};
raw.design.layoutStandard = "technical-editorial-v2";
raw.design.name = "SLT Civic Engineering / Technical Editorial";
raw.planning.visualPolicy = {
  mode: "visual-first",
  requireEverySlide: true,
  minVisualAreaRatio: 0.16,
};
const sourceLabels: Record<string, string> = {
  M1: "제공 사업자료",
  H1: "HSE",
  H2: "HSE",
  N1: "NIOSH",
  "C-URC": "천안 도시재생센터",
  "C-STATION": "천안 도시재생센터",
  "C-PLAN": "AURUM",
  "C-MOLIT": "국토교통부",
  "C-COUNCIL": "천안시의회",
  "C-FENCE": "충청뉴스 보도",
  "P-ASSUME": "제안자 기획 가정",
};
for (const beat of raw.planning.story) {
  beat.visualPlan = plans[beat.id];
  if (beat.id !== "cover") {
    const sourceIds: string[] = beat.proofClaimIds.flatMap(
      (id: string) => raw.claims.find((c: any) => c.id === id)?.sourceIds || [],
    );
    const labels = [...new Set(sourceIds.map((id) => sourceLabels[id] || id))];
    beat.limitation = `출처: ${labels.join("·")} · 상세 서지와 주장 원장은 검토 기록 참조`;
  }
}
for (const [id, name] of [
  ["site-station", "transit"],
  ["site-oryong", "neighborhood"],
]) {
  let slide = raw.slides.find((s: any) => s.id === id);
  if (!slide) {
    slide = {
      id,
      layout: "editorial",
      title: id,
      message: "",
      items: [],
      claimIds: [],
    };
    raw.slides.push(slide);
  }
  slide.image = {
    path: `examples/assets/${name}-site-concept-v4.png`,
    rights: "generated",
    caption: plans[id].legend,
  };
}
await enrichEvidenceVisuals(raw);
refineDecisionDesign(raw);
applyProductStrategy(raw);
refineEditorialDesign(raw);
refineMunicipalCase(raw);
applyReadingHierarchy(raw);
refineProductPositioning(raw);
refineProductPlatform(raw);
refineIntegratedPresentation(raw);
appendProposerContact(raw);
refineVisualAdequacy(raw);
refineCollaborationReview(raw);
extendPublicSafety(raw);
// Stable evidence ordering prevents repeated enrichment from moving unchanged records.
raw.sources.sort((a:any,b:any)=>a.id.localeCompare(b.id));
raw.claims.sort((a:any,b:any)=>a.id.localeCompare(b.id));
const p = Project.parse(raw);
p.slides = compileStoryboard(p);
await fs.writeFile(file, JSON.stringify(p, null, 2) + "\n");
