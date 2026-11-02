import { z } from "zod";
export const POSITIONING_KINDS = ["competitive-context", "product-strengths"] as const;
export const ProductPositioning = z.object({
  status:z.literal("supplier-described-capability-with-proposed-integration"),
  claimIds:z.array(z.string()).min(3),
  superiority:z.literal("not-established-by-comparative-test"),
  strengths:z.array(z.object({label:z.string(),mechanism:z.string(),buyerValue:z.string(),proof:z.string()})).length(3),
  comparisons:z.array(z.object({name:z.string(),category:z.string(),confirmed:z.string(),scopeQuestion:z.string(),claimIds:z.array(z.string()).min(1)})).length(2),
  procurement:z.array(z.object({label:z.string(),evidence:z.string(),decision:z.string(),metricIds:z.array(z.string()).min(1)})).length(3),
  opportunities:z.array(z.object({label:z.string(),localAnchor:z.string(),offer:z.string(),condition:z.string(),claimIds:z.array(z.string()).min(1)})).length(3),
  measurements:z.object({npuTops:z.number().positive().nullable(),ledBrightnessNit:z.number().positive().nullable(),readableDistanceM:z.number().positive().nullable()}),
  comparisonMatrix:z.array(z.object({criterion:z.string(),referenceA:z.string(),referenceB:z.string(),proposal:z.string(),advantage:z.string(),claimIds:z.array(z.string()).min(1)})).length(3).optional(),
  platform: z.object({
    products: z.array(z.object({
      id:z.enum(["safety-device","aiot-display"]), name:z.string(), shortName:z.string(),
      functions:z.array(z.string()).min(2), claimIds:z.array(z.string()).min(1),
    })).length(2),
    control:z.object({name:z.string(),provider:z.literal("비트리"),functions:z.array(z.string()).min(2),claimIds:z.array(z.string()).min(1)}),
    displayPolicy:z.object({
      normalContent:z.array(z.string()).min(2),
      priority:z.literal("safety-over-public-content"),
      hazardAction:z.string(),
      aiContentReview:z.literal("operator-review-before-publish"),
      cctvAudience:z.literal("authorized-internal-only"),
    }),
  }).optional(),
});
