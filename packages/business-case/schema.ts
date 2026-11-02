import { PublicSafety } from "./public-safety-schema.js";
import { z } from "zod";
import { ProductPositioning } from "./positioning-schema.js";
import { MunicipalCase } from "./municipal-schema.js";
import { ProductStrategy } from "./product-schema.js";
import { DeliveryAssurance } from "./delivery-schema.js";
const Refs = z.array(z.string()).min(1);
export const CaseSection = z.object({
  id: z.string(),
  chapter: z.enum([
    "summary",
    "regional",
    "problem",
    "sites",
    "solution",
    "delivery",
    "economics",
    "impact",
    "governance",
    "decision",
  ]),
  visual: z.enum([
    "municipal",
    "editorial",
    "matrix",
    "map",
    "site-detail",
    "architecture",
    "timeline",
    "budget",
    "benefits",
    "scenario",
    "kpis",
    "decision",
  ]),
  kicker: z.string(),
  items: z
    .array(z.object({ label: z.string(), detail: z.string() }))
    .max(5)
    .default([]),
  headers: z.array(z.string()).max(4).optional(),
  rows: z.array(z.array(z.string())).max(6).optional(),
  candidateIds: z.array(z.string()).default([]),
  caption: z.string().default(""),
});
export const BusinessCase = z.object({
  version: z.literal(1),
  publicSafety: PublicSafety.optional(),
  productStrategy: ProductStrategy.optional(),
  municipalCase: MunicipalCase.optional(),
  productPositioning: ProductPositioning.optional(),
  deliveryAssurance: DeliveryAssurance.optional(),
  economicsPresentation: z
    .enum(["included", "omitted-by-request"])
    .default("included"),
  targetSlideCount: z.number().int().min(12).max(80),
  context: z.object({
    entityName: z.string(),
    asOf: z.string(),
    factClaimIds: Refs,
    needHypothesis: z.string(),
    notEstablished: z.array(z.string()).min(1),
  }),
  requiredDisciplines: z.array(z.string()).min(3),
  expertReviews: z
    .array(
      z.object({
        id: z.string(),
        discipline: z.string(),
        reviewer: z.literal("assistant-perspective"),
        conclusion: z.string(),
        findings: z
          .array(
            z.object({
              issue: z.string().min(8),
              evidenceIds: Refs,
              storyBeatIds: Refs,
              recommendation: z.string().min(8),
              acceptanceCheck: z.string().min(6),
              status: z.enum(["incorporated", "open"]),
            }),
          )
          .min(2),
      }),
    )
    .min(3),
  resolutions: z
    .array(
      z.object({
        id: z.string(),
        perspectives: z.array(z.string()).min(2),
        tradeoff: z.string(),
        decision: z.string(),
        rationale: z.string(),
        remainingCheck: z.string(),
      }),
    )
    .min(2),
  candidates: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        address: z.string(),
        publishedFacts: z.string(),
        claimIds: Refs,
        physicalHypothesis: z.string(),
        proposedPackage: z.string(),
        constraints: z.array(z.string()).min(2),
        fieldStatus: z.enum(["not-surveyed", "surveyed"]),
        fieldClaimIds: z.array(z.string()).default([]),
        selection: z.enum(["priority-survey", "reserve", "defer"]),
        selectionReason: z.string(),
        readiness: z.string(),
      }),
    )
    .min(2),
  budget: z
    .object({
      currency: z.literal("KRW"),
      status: z.enum(["planning-assumption", "unquoted"]),
      vatRate: z.number().min(0).max(1),
      sourceClaimIds: Refs,
      scope: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          low: z.number().nonnegative(),
          base: z.number().nonnegative(),
          high: z.number().nonnegative(),
        }),
      ),
      excluded: z.array(z.string()).min(1),
    })
    .superRefine((budget, ctx) => {
      if (budget.status === "unquoted" && budget.items.length !== 0)
        ctx.addIssue({
          code: "custom",
          message:
            "Unquoted budgets must not contain invented numeric estimates",
        });
      if (budget.status === "planning-assumption" && budget.items.length < 3)
        ctx.addIssue({
          code: "custom",
          message: "Planning budgets require at least three cost items",
        });
    }),
  timeScenario: z
    .object({
      status: z.literal("illustrative-not-observed"),
      eventsPerDay: z.number().positive(),
      daysPerMonth: z.number().positive(),
      beforeMinutes: z.number().nonnegative(),
      afterMinutes: z.number().nonnegative(),
      claimIds: Refs,
      attributionLimit: z.string(),
    })
    .optional(),
  benefits: z
    .array(
      z.object({
        id: z.string(),
        beneficiary: z.string(),
        change: z.string(),
        expectedBenefit: z.string(),
        metricIds: Refs,
        claimIds: Refs,
        attributionLimit: z.string(),
      }),
    )
    .min(3),
  metrics: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        definition: z.string(),
        formula: z.string(),
        unit: z.string(),
        baseline: z.number().nullable(),
        target: z.number().nullable(),
        targetPolicy: z.string(),
        measurement: z.string(),
        owner: z.string(),
        claimIds: Refs,
        guardrail: z.boolean().default(false),
      }),
    )
    .min(3),
  sections: z.array(CaseSection).min(10),
});
export type BusinessCaseData = z.infer<typeof BusinessCase>;
export type CaseSectionData = z.infer<typeof CaseSection>;
