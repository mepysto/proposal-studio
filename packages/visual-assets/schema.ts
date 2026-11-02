import { z } from "zod";
import { MapMarker, CausalChain } from "./evidence-schema.js";
export const VisualPlan = z.object({
  comparisonTable: z.object({
    columns: z.array(z.string().min(1)).min(2).max(4),
    rows: z.array(z.object({criterion:z.string().min(1),values:z.array(z.string()).min(2).max(4)})).min(2).max(8),
  }).refine(t=>t.rows.every(r=>r.values.length===t.columns.length), 'Comparison rows must match columns').optional(),
  interfaceExample: z.object({
    kind: z.enum([
"dashboard", "site", "ai", "alerts", "maintenance"]),
    dataStatus: z.literal("illustrative"),
    basisClaimIds: z.array(z.string()).min(1),
    scenario: z.string(),
    at: z.string(),
    timeline: z.array(z.object({label:z.string(),time:z.string(),minute:z.number().min(0).max(60)})).max(3).optional(),
    metrics: z.array(z.object({label:z.string(), value:z.string(), tone:z.enum(["neutral","caution","danger"])})).max(4),
    records: z.array(z.object({name:z.string(), status:z.string(), detail:z.string(), updated:z.string()})).min(1).max(4),
    evidence: z.array(z.object({label:z.string(),value:z.string()})).max(6),
    decision: z.object({title:z.string(), reason:z.string(), action:z.string()}),
    image: z.object({path:z.string(),caption:z.string(),origin:z.enum(["generated-concept", "user-provided"])}).optional(),
  }).optional(),
  explanation: z
    .object({
      readerTask: z.string().min(8).max(160),
      howToRead: z.string().min(12).max(240),
      notProven: z.string().min(8).max(240),
      requiredMarks: z
        .array(
          z.enum([
            "scene",
            "map",
            "chart",
            "connectors",
            "comparison",
            "screen",
            "brand",
            "timeline",
          ]),
        )
        .min(1),
    })
    .optional(),
  readingGuide: z
    .object({
      message: z.string().min(8).max(70),
      keyPhrase: z.string().min(2),
      focusPhrases: z.array(z.string().min(2)).min(1).max(6),
      tone: z.enum(["teal", "blue", "amber"]),
    })
    .refine(
      (g) => g.message.includes(g.keyPhrase),
      "Key phrase must occur in the message",
    )
    .optional(),
  intent: z
    .enum([
      "geographic",
      "quantitative",
      "causal",
      "spatial",
      "temporal",
      "structural",
      "comparative",
      "decision",
    ])
    .optional(),
  map: z
    .object({ assetId: z.string(), markers: z.array(MapMarker).min(1).max(4) })
    .optional(),
  chart: z
    .object({
      datasetId: z.string(),
      type: z.literal("bar"),
      orientation: z.enum(["column", "horizontal"]),
      stacked: z.boolean().default(false),
    })
    .optional(),
  chains: z.array(CausalChain).min(1).max(3).optional(),

  scene: z
    .object({
      path: z.string(),
      rights: z.enum(["generated", "user-provided"]),
      caption: z.string(),
      reuseReason: z.string().min(12),
      annotations: z
        .array(
          z.object({
            nodeId: z.string(),
            x: z.number().min(0).max(1),
            y: z.number().min(0).max(1),
          }),
        )
        .max(6)
        .optional(),
    })
    .optional(),

  schedule: z
    .object({
      slots: z.number().int().min(2).max(24),
      unitLabel: z.string().max(12),
      ranges: z
        .array(
          z.object({
            nodeId: z.string(),
            start: z.number().int().nonnegative(),
            length: z.number().int().positive(),
          }),
        )
        .max(6),
    })
    .optional(),

  kind: z.enum([
    "cctv-extension",
    "public-safety-spaces",
    "contact-card",
    "existing",
    "competitive-context",
    "product-strengths",
    "municipal-overview",
    "field-information-flow",
    "public-value",
    "pilot-package",
    "service-model",
    "evaluation-plan",
    "expansion-path",
    "city-proposal",
    "product-overview",
    "driver-display",
    "pedestrian-warning",
    "asset-cycle",
    "reuse-economics",
    "scope-requote",
    "summary-brief",
    "qualification-gates",
    "assured-timeline",
    "responsibility-matrix",
    "fallback-flow",
    "approval-gates",
    "decision-brief",
    "time-balance",
    "geographic-map",
    "data-chart",
    "causal-flow",
    "flow",
    "context",
    "bridge",
    "site",
    "journey",
    "shortlist",
    "gates",
    "image-detail",
    "comparison",
    "scope",
    "system",
    "boundary",
    "swimlane",
    "timeline",
    "ownership",
    "benefits",
    "metrics",
    "decision",
  ]),
  takeaway: z.string().min(8).max(120),
  encoding: z.string().min(12),
  evidenceIds: z.array(z.string()).min(1),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1).max(35),
        detail: z.string().max(100),
        icon: z
          .enum([
            "city",
            "gate",
            "person",
            "camera",
            "server",
            "bell",
            "clipboard",
            "shield",
            "clock",
            "team",
            "route",
            "document",
          ])
          .default("document"),
      }),
    )
    .min(1)
    .max(6),
  edges: z
    .array(
      z.object({
        bidirectional: z.boolean().optional(),
        directed: z.boolean().optional(),
        from: z.string(),
        to: z.string(),
        label: z.string().max(35).default(""),
      }),
    )
    .default([]),
  legend: z.string().min(5).max(150),
});
export type VisualPlanData = z.infer<typeof VisualPlan>;
export const VisualPolicy = z.object({
  requireExplanationContract: z.boolean().optional(),
  mode: z.literal("visual-first"),
  requireEverySlide: z.literal(true),
  minVisualAreaRatio: z.number().min(0.15).max(0.6).default(0.24),
});
