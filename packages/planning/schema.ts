import { z } from "zod";
import { VisualPlan, VisualPolicy } from "../visual-assets/schema.js";
import { CompositionBrief } from "../art-direction/schema.js";

const RefIds = z.array(z.string()).min(1);
export const BeatStage = z.enum([
  "decision",
  "problem",
  "scenario",
  "intervention",
  "operation",
  "validation",
  "alternatives",
  "business",
]);
export const StoryBeat = z.object({
  compositionBrief: CompositionBrief.optional(),
  visualPlan: VisualPlan.optional(),
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  stage: BeatStage,
  sectionId: z.string().optional(),
  title: z.string().min(8).max(85),
  question: z.string().min(8),
  answer: z.string().min(15).max(220),
  proofClaimIds: RefIds,
  visualPurpose: z.string().min(12),
  limitation: z.string().min(8),
});
const Zone = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["site", "walkway", "road", "occlusion", "conflict"]),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().positive().max(1),
  h: z.number().positive().max(1),
});
const Path = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["vehicle", "pedestrian", "signal"]),
  points: z
    .array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]))
    .min(2),
});
const SiteObject = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum([
    "vehicle",
    "person",
    "operator",
    "camera",
    "sensor",
    "barrier",
  ]),
  w: z.number().positive().max(1).optional(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});
export const SiteModel = z.object({
  title: z.string(),
  disclaimer: z.string().min(10),
  zones: z.array(Zone).min(3),
  paths: z.array(Path).min(2),
  objects: z.array(SiteObject).min(2),
  callouts: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        detail: z.string(),
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        claimIds: RefIds,
      }),
    )
    .max(3),
});
export const PlanningBrief = z.object({
  visualPolicy: VisualPolicy.optional(),
  version: z.literal(1),
  depth: z.enum(["concept", "full"]).default("concept"),
  decision: z.object({
    owner: z.string().min(2),
    request: z.string().min(15),
    success: z.string().min(10),
    scope: z.string().min(10),
    outOfScope: z.array(z.string()).min(1),
  }),
  problem: z.object({
    actors: z.array(z.string()).min(1),
    situation: z.string().min(15),
    gap: z.string().min(15),
    consequence: z.string().min(15),
    baseline: z.string().min(15),
    claimIds: RefIds,
    localEvidence: z.object({
      status: z.enum(["not-yet-observed", "observed"]),
      claimIds: z.array(z.string()).default([]),
      required: z.array(z.string()).min(1),
    }),
    mechanisms: z
      .array(
        z.object({
          id: z.string(),
          cause: z.string().min(5),
          effect: z.string().min(5),
          status: z.enum([
            "general-evidence",
            "hypothesis",
            "local-observation",
          ]),
          claimIds: RefIds,
        }),
      )
      .min(2)
      .max(3),
  }),
  alternatives: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        priority: z.enum(["baseline", "option", "proposed"]),
        addresses: z.string(),
        limits: z.string(),
        mechanismIds: z.array(z.string()).default([]),
        claimIds: RefIds,
      }),
    )
    .min(2)
    .max(4),
  interventions: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        mechanismIds: RefIds,
        action: z.string().min(10),
        deliverable: z.string(),
        claimIds: RefIds,
        validationIds: RefIds,
      }),
    )
    .min(1)
    .max(3),
  validation: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        method: z.string().min(12),
        measure: z.string(),
        decisionRule: z.string().min(12),
        claimIds: RefIds,
      }),
    )
    .min(2)
    .max(4),
  operatingBoundary: z.string().min(15).max(150),
  workflow: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        owner: z.enum(["system", "human"]),
        input: z.string(),
        action: z.string(),
        output: z.string(),
        successSignal: z.string(),
        failureAction: z.string(),
        claimIds: RefIds,
      }),
    )
    .min(3)
    .max(5),
  site: SiteModel.optional(),
  story: z.array(StoryBeat).min(3),
});
export type PlanningData = z.infer<typeof PlanningBrief>;
export type StoryBeatData = z.infer<typeof StoryBeat>;

export const SlideReasoning = z.object({
  visualPlan: VisualPlan.optional(),
  planningFingerprint: z.string(),
  sectionId: z.string().optional(),
  stage: BeatStage,
  question: z.string(),
  answer: z.string(),
  proofClaimIds: RefIds,
  planningRefs: RefIds,
  visualPurpose: z.string(),
  limitation: z.string(),
  visualKind: z.enum([
    "decision-image",
    "causal-diagnosis",
    "site-map",
    "intervention-overlay",
    "accountability-swimlane",
    "validation-matrix",
    "alternatives-matrix",
    "business-section",
  ]),
});
