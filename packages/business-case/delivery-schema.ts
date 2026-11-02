import { z } from "zod";
const Text = z.string().min(4);
const Refs = z.array(z.string()).min(1);
export const DeliveryAssurance = z.object({
  status: z.literal("proposed-not-agreed"),
  claimIds: Refs,
  qualification: z
    .array(
      z.object({
        id: z.string(),
        criterion: Text,
        evidence: Text,
        holdWhen: Text,
      }),
    )
    .length(4),
  stageGates: z
    .array(
      z.object({
        nodeId: z.string(),
        deliverable: Text,
        acceptance: Text,
        reviewer: Text,
      }),
    )
    .length(4),
  actors: z
    .array(z.object({ id: z.string(), label: z.string().min(1) }))
    .min(4)
    .max(6),
  responsibilityRows: z
    .array(
      z.object({
        activity: Text,
        ownerId: z.string(),
        contributorIds: Refs,
        deliverable: Text,
      }),
    )
    .length(4),
  fallbacks: z
    .array(
      z.object({
        id: z.string(),
        condition: Text,
        detection: Text,
        action: Text,
        ownerId: z.string(),
        resumeEvidence: Text,
      }),
    )
    .length(3),
  approvalGates: z
    .array(
      z.object({ label: Text, document: Text, passWhen: Text, holdWhen: Text }),
    )
    .length(4),
  currentRequests: z
    .array(z.object({ label: Text, action: Text, artifact: Text }))
    .length(2),
  laterDecision: Text,
});

export const DECISION_VISUAL_KINDS: readonly string[] = [
  "summary-brief",
  "qualification-gates",
  "assured-timeline",
  "responsibility-matrix",
  "fallback-flow",
  "approval-gates",
  "decision-brief",
  "time-balance",
];
