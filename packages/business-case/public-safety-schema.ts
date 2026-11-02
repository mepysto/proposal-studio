import { z } from "zod";
export const PublicSafety = z.object({
  status: z.literal("proposed-extension-not-validated"),
  claimIds: z.array(z.string()).min(2),
  comparison: z
    .array(
      z.object({
        criterion: z.string(),
        recording: z.string(),
        intelligent: z.string(),
        proposal: z.string(),
      }),
    )
    .length(3),
  applications: z
    .array(
      z.object({
        label: z.string(),
        risk: z.string(),
        response: z.string(),
        verification: z.string(),
      }),
    )
    .length(3),
});
