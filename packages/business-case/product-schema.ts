import { z } from "zod";
const text = z.string().min(4);
export const ProductStrategy = z.object({
  status: z.literal("proposed-needs-site-and-contract-validation"),
  claimIds: z.array(z.string()).min(2),
  driverScreen:z.object({
    status:z.literal("proposed-interface-example"),
    objectBoxes:z.array(z.object({id:z.string(),label:z.string(),x:z.number().min(0).max(1),y:z.number().min(0).max(1),w:z.number().positive().max(1),h:z.number().positive().max(1)})).min(1),
    controlLabel:z.string(),
    controlStatus:z.literal("illustrative-not-live-confirmation"),
  }).optional(),
  modules: z
    .array(
      z.object({
        id: z.string(),
        name: text,
        audience: text,
        trigger: text,
        action: text,
        acceptance: text,
        metricIds: z.array(z.string()).min(1),
      }),
    )
    .length(3),
  displayStates: z
    .array(
      z.object({ id: z.string(), label: text, meaning: text, action: text }),
    )
    .length(3),
  lifecycle: z
    .array(
      z.object({
        id: z.string(),
        label: text,
        owner: text,
        deliverable: text,
        gate: text,
      }),
    )
    .length(5),
  ownershipOptions: z
    .array(
      z.object({
        id: z.string(),
        label: text,
        owner: text,
        custody: text,
        service: text,
        decision: text,
      }),
    )
    .length(2),
  costLines: z
    .array(
      z.object({
        id: z.string(),
        label: text,
        basis: text,
        amount: z.number().nonnegative().nullable(),
      }),
    )
    .min(5)
    .max(7),
  budgetRevision: z.object({
    status: z.literal("new-total-not-quoted"),
    baselineLabel: text,
    addedScope: z.array(text).min(3),
    decision: text,
  }),
  reuseDecision: text,
  privacyBoundary: text,
});
export const PRODUCT_KINDS: readonly string[] = [
  "product-overview",
  "driver-display",
  "pedestrian-warning",
  "asset-cycle",
  "reuse-economics",
  "scope-requote",
];
