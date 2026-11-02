/** PptxGenJS 4 expects the scaled source dimensions outside sizing, and the destination frame inside sizing. */
export function coverFit(
  sourceWidth: number,
  sourceHeight: number,
  frameWidth: number,
  frameHeight: number,
) {
  const scale = Math.max(frameWidth / sourceWidth, frameHeight / sourceHeight);
  const w = sourceWidth * scale,
    h = sourceHeight * scale;
  const horizontal = (1 - frameWidth / w) / 2,
    vertical = (1 - frameHeight / h) / 2;
  return {
    w,
    h,
    sizing: { type: "cover" as const, w: frameWidth, h: frameHeight },
    crop: {
      left: horizontal,
      right: horizontal,
      top: vertical,
      bottom: vertical,
    },
  };
}
