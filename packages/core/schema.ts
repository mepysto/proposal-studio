import { z } from "zod";
import {
  GeographicAsset,
  QuantitativeDataset,
} from "../visual-assets/evidence-schema.js";
import { BusinessCase } from "../business-case/schema.js";
import { PlanningBrief, SlideReasoning } from "../planning/schema.js";
import { DesignDirection, CompositionBrief } from "../art-direction/schema.js";
export const Layout = z.enum([
  "hero",
  "editorial",
  "problem-solution",
  "scenario",
  "architecture",
  "process",
  "kpi",
  "timeline",
  "comparison",
  "budget",
  "closing",
  "full-bleed",
  "before-after",
  "market",
  "business-model",
  "solution",
  "strategy",
  "case-study",
  "team",
]);
export const Claim = z
  .object({
    id: z.string(),
    text: z.string().min(1),
    scope: z.enum(["general", "local", "project"]).default("project"),
    evidenceKind: z.enum(["document", "field-observation"]).default("document"),
    status: z.enum([
      "user-provided",
      "externally-verified",
      "inference",
      "assumption",
    ]),
    sourceIds: z.array(z.string()).default([]),
    verifiedAt: z.string().datetime({ offset: true }).optional(),
    approved: z.boolean().default(false),
  })
  .superRefine((c, ctx) => {
    if (
      c.status === "externally-verified" &&
      (!c.sourceIds.length || !c.verifiedAt)
    )
      ctx.addIssue({
        code: "custom",
        message: "Verified claims need sources and verification time",
      });
  });
export const Source = z.object({
  id: z.string(),
  title: z.string(),
  scope: z.enum(["general", "local", "project"]).default("project"),
  applicability: z.string().optional(),
  url: z.string().url().optional(),
  materialId: z.string().optional(),
  checkedAt: z.string().datetime({ offset: true }).optional(),
  excerpt: z.string().optional(),
});
export const Slide = z.object({
  compositionBrief: CompositionBrief.optional(),
  reasoning: SlideReasoning.optional(),
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  layout: Layout,
  title: z.string().min(1).max(110),
  message: z.string().max(300),
  items: z
    .array(
      z.object({ label: z.string().max(100), detail: z.string().max(400) }),
    )
    .max(6)
    .default([]),
  claimIds: z.array(z.string()).default([]),
  footnote: z.string().max(650).default(""),
  image: z
    .object({
      path: z.string(),
      rights: z.enum(["user-authorized", "generated", "licensed"]),
      caption: z.string(),
      license: z.string().optional(),
      annotations: z
        .array(
          z.object({
            interventionId: z.string(),
            x: z.number().min(0).max(1),
            y: z.number().min(0).max(1),
          }),
        )
        .optional(),
    })
    .optional(),
  chart: z
    .object({
      labels: z.array(z.string()),
      values: z.array(z.number()),
      unit: z.string(),
    })
    .optional(),
});
export const Design = z.object({
  name: z.string(),
  layoutStandard: z.literal("technical-editorial-v2").optional(),
  font: z.string(),
  colors: z.object({
    ink: z.string().regex(/^[A-Fa-f0-9]{6}$/),
    paper: z.string().regex(/^[A-Fa-f0-9]{6}$/),
    accent: z.string().regex(/^[A-Fa-f0-9]{6}$/),
    muted: z.string().regex(/^[A-Fa-f0-9]{6}$/),
    dark: z.string().regex(/^[A-Fa-f0-9]{6}$/),
  }),
  titleSize: z.number().min(24).max(48),
  bodySize: z.number().min(16).max(28),
  margin: z.number().min(0.3).max(1),
  grid: z.number().default(12),
  imageRule: z
    .string()
    .default("preserve-aspect; concept images must be labelled"),
  chartStyle: z.string().default("native editable chart; no unverified data"),
  diagramStyle: z.string().default("native PowerPoint shapes"),
  iconStyle: z.string().default("minimal line"),
  tableRule: z.string().default("editable rows, units and source required"),
});
export const Project = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
    title: z.string().min(1),
    proposer: z
      .object({
        legalName: z.string().min(2),
        role: z.string(),
        collaborators: z.array(z.string()),
        coverCollaborators: z.array(z.string()).optional(),
        sourceClaimIds: z.array(z.string()).min(1),
        contact:z.object({
          logoPath:z.string(),phone:z.string().min(8),email:z.string().email(),address:z.string().min(10),sourceClaimIds:z.array(z.string()).min(1),
        }).optional(),
      })
      .optional(),
    audience: z.string(),
    proposalType: z.string(),
    mode: z.enum(["quick", "deep"]),
    materials: z.array(
      z.object({
        path: z.string(),
        role: z.enum(["content", "design-reference", "asset"]),
      }),
    ),
    design: Design,
    designDirection: DesignDirection.optional(),
    sources: z.array(Source).default([]),
    claims: z.array(Claim).default([]),
    slides: z.array(Slide).default([]),
    provider: z.literal("offline").default("offline"),
    qualityTarget: z.enum(["draft", "proposal"]).default("draft"),
    planning: PlanningBrief.optional(),
    businessCase: BusinessCase.optional(),
    geographicAssets: z.array(GeographicAsset).default([]),
    quantitativeDatasets: z.array(QuantitativeDataset).default([]),
  })
  .superRefine((p, ctx) => {
    for (const [name, records] of [
      ["claims", p.claims],
      ["sources", p.sources],
      ["slides", p.slides],
    ] as const) {
      const ids = records.map((r) => r.id);
      if (new Set(ids).size !== ids.length)
        ctx.addIssue({ code: "custom", message: `Duplicate ${name} IDs` });
    }
    const sourceIds = new Set(p.sources.map((s) => s.id)),
      claimIds = new Set(p.claims.map((c) => c.id));
    for (const c of p.claims)
      for (const id of c.sourceIds)
        if (!sourceIds.has(id))
          ctx.addIssue({ code: "custom", message: `Unknown source ${id}` });
    for (const s of p.slides) {
      const capacity: Record<string, number> = {
        hero: 3,
        scenario: 3,
        architecture: 4,
        process: 5,
        timeline: 5,
        kpi: 4,
        market: 4,
        budget: 4,
        comparison: 2,
        "before-after": 2,
        "problem-solution": 2,
        "full-bleed": 0,
        closing: 3,
      };
      if (s.items.length > (capacity[s.layout] ?? 3))
        ctx.addIssue({
          code: "custom",
          message: `Slide ${s.id} exceeds layout capacity; split into additional slides`,
        });
      for (const id of s.claimIds)
        if (!claimIds.has(id))
          ctx.addIssue({ code: "custom", message: `Unknown claim ${id}` });
      if (
        s.chart &&
        (s.chart.labels.length !== s.chart.values.length ||
          s.chart.values.length === 0)
      )
        ctx.addIssue({
          code: "custom",
          message: "Chart labels/values must match",
        });
      if (s.image?.rights === "licensed" && !s.image.license)
        ctx.addIssue({
          code: "custom",
          message: "Licensed image requires license record",
        });
    }
  });
export type ProjectData = z.infer<typeof Project>;
export type SlideData = z.infer<typeof Slide>;
export type DesignData = z.infer<typeof Design>;
