import { z } from "zod";

const Color = z.string().regex(/^[A-Fa-f0-9]{6}$/);
export const Palette = z
  .object({
    ink: Color.optional(),
    muted: Color.optional(),
    accent: Color.optional(),
    blue: Color.optional(),
    amber: Color.optional(),
    red: Color.optional(),
    paper: Color.optional(),
    panel: Color.optional(),
    line: Color.optional(),
    white: Color.optional(),
    tealTint: Color.optional(),
    blueTint: Color.optional(),
  })
  .strict();
export const DesignDirection = z
  .object({
    concept: z.string().min(8),
    visualThesis: z.string().min(12),
    brandConstraints: z.array(z.string().min(3)).min(1),
    avoid: z.array(z.string().min(3)).min(1),
    references: z
      .array(
        z
          .object({
            sourceId: z.string(),
            role: z.enum(["content", "design"]),
            adopt: z.array(z.string()),
            reject: z.array(z.string()),
            reason: z.string().min(8),
          })
          .strict(),
      )
      .default([]),
    palette: Palette.optional(),
    deliveryMode: z.enum(["presented", "read-ahead", "hybrid"]).optional(),
  })
  .strict();
export const Box = z
  .object({
    x: z.number().min(0),
    y: z.number().min(0),
    w: z.number().positive(),
    h: z.number().positive(),
  })
  .strict()
  .refine(
    (b) => b.x + b.w <= 13.333334 && b.y + b.h <= 7.5,
    "Composition box must fit the slide",
  );
export const CompositionBrief = z
  .object({
    engine: z.literal("authored-v1"),
    role: z.enum(["orientation", "explanation", "evidence", "decision"]),
    rationale: z.string().min(12),
    readingPath: z.string().min(12),
    continuity: z.string().min(8),
    repetitionReason: z.string().min(8).optional(),
    visual: z.enum([
      "scene",
      "map",
      "chart",
      "graph",
      "comparison",
      "timeline",
      "causal-chain",
      "annotated-screen",
      "swimlane",
    ]),
    title: Box,
    message: Box,
    visualBox: Box,
    caption: Box,
    titleAlign: z.enum(["left", "center", "right"]).default("left"),
    nodeBoxes: z.record(Box).default({}),
    edgeLabelBoxes: z.record(Box).default({}),
    edgeRoutes: z
      .record(
        z
          .object({
            waypoints: z
              .array(z.tuple([z.number().min(0), z.number().min(0)]))
              .min(2),
          })
          .strict(),
      )
      .optional(),
    swimlaneLayout: z
      .object({
        laneHeaderWidth: z.number().min(0.8).max(2.6).default(1.4),
        lanes: z.record(Box),
        nodeLanes: z.record(z.string()),
      })
      .strict()
      .optional(),
    screenLayout: z
      .object({
        frameBox: Box,
        statusBannerBox: Box.optional(),
        sidePanelBoxes: z.record(Box).default({}),
      })
      .strict()
      .optional(),
    typography: z
      .object({
        titleSize: z.number().min(24).max(48).optional(),
        messageSize: z.number().min(19).max(26).optional(),
        nodeTitleSize: z.number().min(16).max(24).optional(),
        bodySize: z.number().min(16).max(24).optional(),
        captionSize: z.number().min(12).max(16).optional(),
      })
      .strict()
      .optional(),
    chartFocus: z
      .object({
        series: z.string().min(1),
        reason: z.string().min(8),
        claimIds: z.array(z.string()).min(1),
        noteBox: Box.optional(),
      })
      .strict()
      .optional(),
    mapLayout: z
      .object({ image: Box, labels: z.record(Box) })
      .strict()
      .optional(),
    nodeTreatment: z.enum(["panel", "open", "document"]).optional(),
    narrative: z
      .object({
        beliefShift: z.string().min(8),
        evidenceClaimIds: z.array(z.string()).min(1),
        objection: z.string().min(8).optional(),
        nextQuestion: z.string().min(8),
      })
      .strict()
      .optional(),
    referenceApplications: z
      .array(
        z
          .object({
            sourceId: z.string(),
            locator: z.string().min(2),
            principle: z.string().min(8),
            application: z.string().min(8),
            notCopied: z.string().min(8),
            controls: z
              .array(
                z.enum([
                  "typography",
                  "chartFocus",
                  "mapLayout",
                  "nodeTreatment",
                  "edgeRoutes",
                  "swimlaneLayout",
                  "screenLayout",
                ]),
              )
              .min(1),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();
export type BoxData = z.infer<typeof Box>;
export type CompositionData = z.infer<typeof CompositionBrief>;
