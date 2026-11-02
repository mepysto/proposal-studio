import { visualAdequacy } from "../visual-assets/adequacy.js";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { Project, type ProjectData } from "./schema.js";
import {
  load,
  save,
  projectDir,
  json,
  readJSON,
  revision,
  hash,
} from "./store.js";
import { defaultDesign } from "../design-system/index.js";
import { ingest } from "../content/index.js";
import { analyze } from "../agents/index.js";
import { plan } from "../storyboard/index.js";
import { briefs } from "../visual-assets/index.js";
import { render } from "../pptx-renderer/index.js";
import { convert } from "../pdf-renderer/index.js";
import {
  planningAudit,
  researchBacklog,
  decisionBriefMarkdown,
} from "../planning/index.js";
import { businessDossier } from "../business-case/index.js";
import { review } from "../quality-assurance/index.js";
import { writeDesignReview } from "../design-review/index.js";
import {
  directionDossier,
  directionPlan,
  directionMarkdown,
  computeGraphBoxes,
} from "../art-direction/index.js";
export async function init(
  id: string,
  options: {
    input?: string;
    config?: string;
    type?: string;
    mode?: string;
  } = {},
) {
  const dir = projectDir(id);
  await fs.mkdir(dir, { recursive: true });
  let p: ProjectData = options.config
    ? Project.parse({ ...(await readJSON(path.resolve(options.config))), id })
    : Project.parse({
        schemaVersion: 1,
        id,
        title: id,
        audience: "제안 검토자",
        proposalType: options.type || "custom",
        mode: options.mode || "quick",
        materials: options.input
          ? [{ path: options.input, role: "content" }]
          : [],
        design: defaultDesign,
      });
  if (options.input && options.config)
    p.materials = [
      { path: options.input, role: "content" },
      ...p.materials.filter((m) => m.role !== "content"),
    ];
  await fs.writeFile(
    path.join(dir, "project.json"),
    JSON.stringify(p, null, 2),
    { flag: "wx" },
  );
  await revision(p, "init");
  return p;
}
export async function stage(
  id: string,
  command: string,
  options: { mode?: string; slide?: string } = {},
) {
  let p = await load(id);
  if (options.mode) p = Project.parse({ ...p, mode: options.mode });
  const dir = projectDir(id);
  if (command === "design-plan") {
    const plan = directionPlan(p);
    await json(path.join(dir, "art-direction-plan.json"), plan);
    await fs.writeFile(path.join(dir, "design-storyboard.md"), directionMarkdown(p));
    return plan;
  }
  if (command === "layout-lock") {
    const targets = p.planning?.story || p.slides;
    for (const s of targets) {
      if (options.slide && s.id !== options.slide) continue;
      const b = s.compositionBrief;
      const v =
        "visualPlan" in s
          ? s.visualPlan
          : (s as ProjectData["slides"][number]).reasoning?.visualPlan;
      if (!b || !v || b.visual !== "graph") continue;
      const computed = await computeGraphBoxes(b.visualBox, v.nodes, v.edges);
      b.nodeBoxes = computed.nodeBoxes;
      b.edgeLabelBoxes = computed.edgeLabelBoxes;
      if (Object.keys(computed.edgeRoutes).length > 0) {
        b.edgeRoutes = computed.edgeRoutes;
      }
    }
    if (p.planning) {
      const m = await ingest(p);
      p.slides = plan(p, m);
    }
    p = Project.parse(p);
    await save(p);
    const dPlan = directionPlan(p);
    await json(path.join(dir, "art-direction-plan.json"), dPlan);
    await fs.writeFile(path.join(dir, "design-storyboard.md"), directionMarkdown(p));
    await revision(p, "layout-lock", { slide: options.slide });
    return dPlan;
  }
  if (command === "audit") {
    const result = planningAudit(p);
    await json(path.join(dir, "planning-review.json"), result);
    await json(path.join(dir, "research-backlog.json"), researchBacklog(p));
    return result;
  }
  if (command === "ingest") {
    const m = await ingest(p);
    await revision(p, "ingest", {
      materials: m.map((d) => ({ id: d.id, hash: d.hash, role: d.role })),
    });
    return m;
  }
  if (command === "analyze") {
    const m = await ingest(p);
    const result = analyze(p, m);
    await json(path.join(dir, "analysis.json"), result);
    await json(path.join(dir, "art-direction-plan.json"), directionPlan(p));
    await fs.writeFile(path.join(dir, "design-storyboard.md"), directionMarkdown(p));
    await json(path.join(dir, "research-backlog.json"), researchBacklog(p));
    await fs.writeFile(
      path.join(dir, "decision-brief.md"),
      decisionBriefMarkdown(p),
    );
    if (p.businessCase)
      await fs.writeFile(
        path.join(dir, "business-case.md"),
        businessDossier(p),
      );
    await revision(p, "analyze");
    return result;
  }
  if (command === "plan") {
    const m = await ingest(p);
    const audit = planningAudit(p, false);
    await json(path.join(dir, "planning-review.json"), audit);
    if (audit.status === "blocked")
      throw Error(`Planning blocked; see ${dir}/planning-review.json`);
    p.slides = plan(p, m);
    p = Project.parse(p);
    await save(p);
    await json(path.join(dir, "storyboard.json"), p.slides);
    await json(path.join(dir, "design.json"), p.design);
    await json(path.join(dir, "image-briefs.json"), briefs(p));
    await revision(p, "plan");
    return p.slides;
  }
  if (command === "build" || command === "regenerate") {
    if (!p.slides.length) {
      await stage(id, "plan", options);
      p = await load(id);
    }
    const planningCheck = planningAudit(p);
    await json(path.join(dir, "planning-review.json"), planningCheck);
    if (planningCheck.status === "blocked")
      throw Error(`Planning blocked; see ${dir}/planning-review.json`);
    if (options.slide && !p.slides.some((s) => s.id === options.slide))
      throw Error("Unknown slide ID");
    const selected = options.slide
      ? Project.parse({
          ...p,
          slides: p.slides.filter((s) => s.id === options.slide),
        })
      : p;
    const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomUUID().slice(0, 6)}`;
    const out = path.join(dir, "runs", runId);
    await fs.mkdir(out, { recursive: true });
    const materials = await ingest(p);
    const file = path.join(out, "proposal.pptx");
    for (const slide of selected.slides)
      if (slide.image) {
        try {
          await fs.access(path.resolve(slide.image.path));
        } catch {
          await json(path.join(out, "qa.json"), {
            status: "failed",
            finalApproval: false,
            issues: [
              {
                severity: "error",
                code: "missing-image",
                slideId: slide.id,
                message: "Configured image file does not exist",
              },
            ],
          });
          throw Error(`Missing image for ${slide.id}; see ${out}/qa.json`);
        }
      }
    const rendered = await render(selected, file);
    await json(path.join(out, "elements.json"), rendered.elements);
    await json(path.join(out, "art-direction.json"), directionDossier(selected, rendered.elements));
    await fs.writeFile(path.join(out, "design-storyboard.md"), directionMarkdown(selected));
    await json(path.join(out, "visual-adequacy.json"), visualAdequacy(selected, rendered.elements));
    await json(path.join(out, "config.json"), selected);
    await json(path.join(out, "planning-review.json"), planningCheck);
    await json(path.join(out, "research-backlog.json"), researchBacklog(p));
    await fs.writeFile(
      path.join(out, "decision-brief.md"),
      decisionBriefMarkdown(p),
    );
    await fs.writeFile(path.join(out, "business-case.md"), businessDossier(p));
    await json(path.join(out, "visual-plan.json"), briefs(selected));
    await json(path.join(out, "visual-evidence.json"), {
      geographicAssets: p.geographicAssets,
      quantitativeDatasets: p.quantitativeDatasets,
      deliveryAssurance: p.businessCase?.deliveryAssurance,
      productStrategy: p.businessCase?.productStrategy,
      municipalCase: p.businessCase?.municipalCase,
      productPositioning: p.businessCase?.productPositioning,
      publicSafety: p.businessCase?.publicSafety,
      pages: selected.slides
        .filter((s) => s.reasoning?.visualPlan)
        .map((s) => ({
          slideId: s.id,
          intent: s.reasoning!.visualPlan!.intent,
          explanation: s.reasoning!.visualPlan!.explanation,
          map: s.reasoning!.visualPlan!.map,
          chart: s.reasoning!.visualPlan!.chart,
          chains: s.reasoning!.visualPlan!.chains,
          interfaceExample: s.reasoning!.visualPlan!.interfaceExample,
        })),
      sources: p.sources,
      claims: p.claims,
    });
    let result: any, conversionError: string | undefined;
    try {
      result = await convert(file, out, selected.slides.length);
    } catch (e: any) {
      conversionError = e.message;
    }
    const qa = review(selected, rendered.elements, result?.report, {
      partial: !!options.slide,
    });
    await json(path.join(out, "qa.json"), qa);
    if (result) await json(path.join(out, "pdf-check.json"), result.report);
    const manifest = {
      runId,
      projectId: id,
      proposer: p.proposer || null,
      createdAt: new Date().toISOString(),
      engine: "proposal-studio@0.8.0",
      node: process.version,
      provider: p.provider,
      models: [],
      externalAPIUsed: false,
      liveResearchUsed: false,
      qualityTarget: p.qualityTarget,
      planningStatus: planningCheck.status,
      evidenceRecords: p.claims
        .filter((c) => c.status === "externally-verified")
        .map((c) => ({
          id: c.id,
          scope: c.scope,
          verifiedAt: c.verifiedAt,
          sourceIds: c.sourceIds,
        })),
      imageOrigins: selected.slides
        .filter((s) => s.image)
        .map((s) => ({ slideId: s.id, ...s.image })),
      benefitSceneOrigins: selected.businessCase?.municipalCase?.benefitScenes || [],
      spatialModelOrigins: selected.slides
        .filter((s) => s.reasoning?.visualPlan?.scene)
        .map((s) => ({ slideId: s.id, ...s.reasoning!.visualPlan!.scene })),
      configHash: hash(JSON.stringify(selected)),
      artDirection: { conceptProvided: !!p.designDirection, authoredPages: selected.slides.filter(s => s.compositionBrief).map(s => s.id), report: "art-direction.json" },
      inputs: materials.map((m) => ({
        id: m.id,
        sha256: m.hash,
        role: m.role,
      })),
      outputs: {
        pptx: "proposal.pptx",
        pdf: result ? "proposal.pdf" : null,
        preview: result ? "preview/contact-sheet.png" : null,
      },
      status: qa.status,
      conversionError,
    };
    await json(path.join(out, "manifest.json"), manifest);
    await writeDesignReview(out);
    await json(
      path.join(
        dir,
        options.slide ? `latest-slide-${options.slide}.json` : "latest.json",
      ),
      { runId, out },
    );
    await revision(p, command, { runId, slide: options.slide });
    if (conversionError)
      throw Error(
        `PPTX saved, conversion failed: ${conversionError}. Set PROPOSAL_SOFFICE/PROPOSAL_PYTHON; see ${out}/qa.json`,
      );
    if (qa.status === "failed")
      throw Error(`QA failed; inspect ${out}/qa.json`);
    return { out, ...manifest };
  }
  if (command === "review") {
    const { out } = await readJSON(path.join(dir, "latest.json"));
    const run = Project.parse(await readJSON(path.join(out, "config.json")));
    const result = review(
      run,
      await readJSON(path.join(out, "elements.json")),
      await readJSON(path.join(out, "pdf-check.json")),
    );
    await json(path.join(out, "qa.json"), result);
    return result;
  }
  if (command === "export") {
    const { out } = await readJSON(path.join(dir, "latest.json"));
    const qa = await readJSON(path.join(out, "qa.json"));
    if (qa.status !== "automated-checks-passed")
      throw Error("Export blocked by failed QA");
    const inspection = await writeDesignReview(out);
    const dest = path.join(dir, "output");
    await fs.mkdir(dest, { recursive: true });
    for (const f of [
      "proposal.pptx",
      "proposal.pdf",
      "qa.json",
      "manifest.json",
      "planning-review.json",
      "research-backlog.json",
      "decision-brief.md",
      "business-case.md",
      "visual-plan.json",
      "visual-evidence.json",
      "visual-adequacy.json",
      "design-review.json",
      "design-review.html",
      "inspection-template.json",
      "inspection-status.json",
      "art-direction.json",
      "design-storyboard.md",
    ])
      await fs.copyFile(path.join(out, f), path.join(dest, f));
    await fs.rm(path.join(dest, "inspection-record.json"), { force: true });
    try {
      await fs.copyFile(path.join(out, "inspection-record.json"), path.join(dest, "inspection-record.json"));
    } catch (e: any) { if (e.code !== "ENOENT") throw e; }
    await fs.rm(path.join(dest, "preview"), { recursive: true, force: true });
    await fs.cp(path.join(out, "preview"), path.join(dest, "preview"), {
      recursive: true,
      force: true,
    });
    return {
      output: dest,
      reviewStatus: "automated checks passed; human approval pending",
      inspectionStatus: inspection.status,
    };
  }
  if (command === "run") {
    for (const s of [
      "ingest",
      "analyze",
      "plan",
      "build",
      "review",
      "export",
    ]) {
      console.log(`[${id}] ${s}`);
      await stage(id, s, options);
    }
    return { output: path.join(dir, "output") };
  }
  throw Error(`Unknown stage ${command}`);
}
