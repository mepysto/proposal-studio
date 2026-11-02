import { z } from "zod";
export const MUNICIPAL_KINDS = [
  "municipal-overview",
  "field-information-flow",
  "public-value",
  "pilot-package",
  "service-model",
  "evaluation-plan",
  "expansion-path",
  "city-proposal",
] as const;
export const MunicipalCase = z.object({
  status: z.literal("proposed-not-agreed"),
  claimIds: z.array(z.string()).min(2),
  benefitScenes:z.array(z.object({path:z.string(),rights:z.literal("generated"),caption:z.string(),reuseReason:z.string(),mechanism:z.string(),value:z.string()})).length(3).optional(),
  benefits: z
    .array(
      z.object({
        audience: z.string(),
        before: z.string(),
        intervention: z.string(),
        outcome: z.string(),
        metricIds: z.array(z.string()).min(1),
      }),
    )
    .length(3),
  pilot: z.object({
    gates: z.number().int().positive(),
    totalMonths: z.number().int().positive(),
    fieldMonths: z.number().int().positive(),
    price: z.number().nullable(),
    scope: z
      .array(z.object({ label: z.string(), detail: z.string() }))
      .length(3),
  }),
  service: z.object({
    lead: z.string(),
    city: z.array(z.string()).length(3),
    supplier: z.array(z.string()).length(3),
    site: z.array(z.string()).length(2),
    report: z.string(),
  }),
  evaluation: z
    .array(
      z.object({
        demonstration:z.object({condition:z.string(),output:z.string(),record:z.string()}).optional(),
        question: z.string(),
        observation: z.string(),
        decision: z.string(),
        metricIds: z.array(z.string()).min(1),
      }),
    )
    .length(3),
  expansion: z
    .array(
      z.object({
        label: z.string(),
        scope: z.string(),
        carry: z.string(),
        decision: z.string(),
      }),
    )
    .length(3),
});
