import type { ProjectData } from "../core/schema.js";
export const legacyTokens = Object.freeze({
  ink: "142C40",
  muted: "40576A",
  accent: "087F8C",
  blue: "3264A2",
  amber: "A96E2D",
  red: "B55645",
  paper: "F7F9FB",
  panel: "EDF2F6",
  line: "CFD9E2",
  white: "FFFFFF",
  tealTint: "E5F2F1",
  blueTint: "EAF0FA",
});
const tint = (color: string, factor: number) =>
  [0, 2, 4]
    .map((i) =>
      Math.round(
        parseInt(color.slice(i, i + 2), 16) * (1 - factor) + 255 * factor,
      )
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase();
/** Fresh per-project values; never mutate the shared legacy palette. */
export function resolveTokens(p: ProjectData) {
  if (!p.designDirection) return { ...legacyTokens };
  const c = p.design.colors;
  return {
    ...legacyTokens,
    ink: c.ink,
    muted: c.muted,
    accent: c.accent,
    paper: c.paper,
    panel: tint(c.ink, 0.94),
    line: tint(c.ink, 0.78),
    tealTint: tint(c.accent, 0.89),
    ...p.designDirection.palette,
  };
}
