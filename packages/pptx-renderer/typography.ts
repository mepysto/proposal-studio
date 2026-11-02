/** Native, editable inline emphasis; substring selection never changes the source wording. */
export function emphasisRuns(
  text: string,
  phrases: string[],
  baseColor: string,
  accent: string,
  lightAccent?: string,
) {
  const terms = [...new Set(phrases)]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  const runs: { text: string; options: { bold?: boolean; color?: string } }[] =
    [];
  let plain = "",
    offset = 0;
  while (offset < text.length) {
    const match = terms.find((t) => text.startsWith(t, offset));
    if (!match) {
      plain += text[offset++];
      continue;
    }
    if (plain) {
      runs.push({ text: plain, options: {} });
      plain = "";
    }
    // White/light text already belongs to a dark area; keep its contrast.
    const light = /^(FFFFFF|DAE5EC|B1CFD8|B9CFD1|C6D8E3)$/i.test(baseColor);
    runs.push({
      text: match,
      options: { bold: true, color: light ? lightAccent || baseColor : accent },
    });
    offset += match.length;
  }
  if (plain) runs.push({ text: plain, options: {} });
  return runs;
}

/** PptxGenJS 4 otherwise ends EVERY piece of a multi-line run with a paragraph. */
export function toPptxRuns(runs: ReturnType<typeof emphasisRuns>) {
  return runs.flatMap((run) => {
    const lines = run.text.split("\n");
    return lines.map((text, i) => ({
      text,
      options: { ...run.options, breakLine: i < lines.length - 1 },
    }));
  });
}

export function charWidthPt(c: string, pt: number) {
  return pt * (/[\u3000-\uFFFF]/.test(c) ? 1 : 0.55);
}

export function tokenWidthPt(token: string, pt: number) {
  let w = 0;
  for (const c of token) w += charWidthPt(c, pt);
  return w;
}

/**
 * Simulates Korean/ASCII word-wrap (whitespace-delimited eojeol wrapping)
 * within a box of width `w` (in inches) at font size `pt`.
 */
export function wordWrapLines(text: string, w: number, pt: number): string[] {
  const maxWidth = Math.max(1, w * 72);
  const result: string[] = [];
  for (const rawLine of text.split("\n")) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      result.push("");
      continue;
    }
    const words = trimmed.split(/(\s+)/);
    let current = "";
    let currentWidth = 0;
    for (const part of words) {
      if (!part) continue;
      const partWidth = tokenWidthPt(part, pt);
      if (/^\s+$/.test(part)) {
        if (current && currentWidth + partWidth <= maxWidth) {
          current += part;
          currentWidth += partWidth;
        }
        continue;
      }
      if (!current) {
        if (partWidth <= maxWidth) {
          current = part;
          currentWidth = partWidth;
        } else {
          // Single token wider than the box: break by character
          let chunk = "";
          let chunkW = 0;
          for (const ch of part) {
            const cw = charWidthPt(ch, pt);
            if (chunk && chunkW + cw > maxWidth) {
              result.push(chunk);
              chunk = ch;
              chunkW = cw;
            } else {
              chunk += ch;
              chunkW += cw;
            }
          }
          current = chunk;
          currentWidth = chunkW;
        }
      } else if (currentWidth + partWidth <= maxWidth) {
        current += part;
        currentWidth += partWidth;
      } else {
        result.push(current.trimEnd());
        current = part;
        currentWidth = partWidth;
      }
    }
    if (current) result.push(current.trimEnd());
  }
  return result;
}

/**
 * Detects whether automatic word-wrapping of a single paragraph produces
 * a trailing 1-2 character orphan tail on the last wrapped line.
 */
export function hasKoreanOrphanTail(text: string, w: number, pt: number): boolean {
  for (const paragraph of text.split("\n")) {
    const wrapped = wordWrapLines(paragraph, w, pt);
    if (wrapped.length >= 2) {
      const tail = wrapped.at(-1)!.replace(/[.,!?·…)\]]+$/g, "").trim();
      if (tail.length >= 1 && tail.length <= 2 && /[\uAC00-\uD7A3]/.test(tail)) {
        return true;
      }
    }
  }
  return false;
}
