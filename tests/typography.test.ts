import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  emphasisRuns,
  wordWrapLines,
  hasKoreanOrphanTail,
} from "../packages/pptx-renderer/typography.js";
import { Project } from "../packages/core/schema.js";
import { identityAndAlignment } from "../packages/quality-assurance/index.js";
test("inline emphasis preserves exact wording, prioritizes whole phrases and protects light-text contrast", () => {
  const source = "보행자 감지 · 직접 확인 / 직접 확인";
  const runs = emphasisRuns(source, ["직접", "직접 확인"], "FFFFFF", "875216");
  assert.equal(runs.map((r) => r.text).join(""), source);
  assert.equal(runs.filter((r) => r.options.bold).length, 2);
  assert(
    runs
      .filter((r) => r.options.bold)
      .every((r) => r.text === "직접 확인" && r.options.color === "FFFFFF"),
  );
  const dark = emphasisRuns(
    "설비 재활용",
    ["재활용"],
    "FFFFFF",
    "076875",
    "F3D48C",
  );
  assert.equal(dark.at(-1)!.options.color, "F3D48C");
});
test("a declared reading priority cannot pass without actual rounded background, large bold text and inline emphasis", async () => {
  const p = Project.parse(
    JSON.parse(
      await fs.readFile("examples/smartfence-full.project.json", "utf8"),
    ),
  );
  assert.equal(
    identityAndAlignment(p, []).filter(
      (i) => i.code === "missing-reading-hierarchy",
    ).length,
    27,
  );
  const s = p.slides[2],
    g = s.reasoning!.visualPlan!.readingGuide!;
  const bg = {
    slideId: s.id,
    id: "bg",
    kind: "shape" as const,
    shapeType: "rect",
    emphasisRole: "primary-background" as const,
    x: 0.64,
    y: 1.78,
    w: 12.04,
    h: 0.7,
  };
  const tx = {
    slideId: s.id,
    id: "msg",
    kind: "text" as const,
    emphasisRole: "primary-message" as const,
    x: 0.86,
    y: 1.78,
    w: 11.6,
    h: 0.7,
    fontSize: 21,
    bold: true,
    text: g.message,
    textRuns: emphasisRuns(g.message, [g.keyPhrase], "142C40", "076875"),
  };
  p.slides = [s];
  assert(
    identityAndAlignment(p, [bg, tx]).some(
      (i) => i.code === "missing-reading-hierarchy",
    ),
  );
  bg.shapeType = "roundRect";
  assert(
    !identityAndAlignment(p, [bg, tx]).some(
      (i) => i.code === "missing-reading-hierarchy",
    ),
  );
});

test("emphasis inside a two-line message produces two native paragraphs, without an orphan paragraph before the colored phrase", async () => {
  const { render } = await import("../packages/pptx-renderer/index.js");
  const { default: JSZip } = await import("jszip");
  const os = await import("node:os"),
    path = await import("node:path");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "proposal-typography-"));
  try {
    const p = Project.parse(
      JSON.parse(
        await fs.readFile("examples/smartfence-full.project.json", "utf8"),
      ),
    );
    p.slides[0].reasoning!.visualPlan!.readingGuide={message:"첫 줄의 설명\n둘째 줄의 강조어",keyPhrase:"강조어",focusPhrases:["강조어"],tone:"teal"};
    const f = path.join(dir, "cover.pptx");
    await render(p, f, "cover");
    const zip = await JSZip.loadAsync(await fs.readFile(f));
    const xml = await zip.file("ppt/slides/slide1.xml")!.async("string");
    const body = xml
      .match(/<p:txBody>[\s\S]*?<\/p:txBody>/g)!
      .find((s) => s.includes("첫 줄의 설명"))!;
    assert.equal((body.match(/<a:p>/g) || []).length, 2);
    assert(body.includes('val="F3D48C"'));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("Korean word-wrap simulation and orphan-tail detection identify trailing 1-2 syllable words", () => {
  const lines = wordWrapLines(
    "공사현장 출입구에서 보행자와 차량의 동선을 분리하고 유도원이 직접 확인",
    4.2,
    20,
  );
  assert(lines.length >= 2);
  assert(
    hasKoreanOrphanTail(
      "공사현장 출입구에서 보행자와 차량의 동선을 안전하게 실증",
      7.3,
      20,
    ),
  );
  assert(
    !hasKoreanOrphanTail(
      "공사현장 출입구 안전 관리\n보행자와 차량의 동선 분리 체계",
      8.5,
      20,
    ),
  );
});
