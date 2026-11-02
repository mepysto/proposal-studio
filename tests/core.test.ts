import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import JSZip from "jszip";
import { Project, Claim } from "../packages/core/schema.js";
import { defaultDesign } from "../packages/design-system/index.js";
import { projectDir } from "../packages/core/store.js";
import { plan } from "../packages/storyboard/index.js";
import { extract, ingest } from "../packages/content/index.js";
import { render, estimatedHeight } from "../packages/pptx-renderer/index.js";
import { geometry, review } from "../packages/quality-assurance/index.js";
const base = () =>
  Project.parse({
    schemaVersion: 1,
    id: "test-project",
    title: "다른 산업 제안",
    audience: "심사위원",
    proposalType: "investor",
    mode: "quick",
    materials: [],
    design: defaultDesign,
  });
test("verified claims require traceable evidence and verification date", () => {
  assert.equal(
    Claim.safeParse({
      id: "c",
      text: "Market 100",
      status: "externally-verified",
    }).success,
    false,
  );
  assert.equal(
    Claim.safeParse({
      id: "c",
      text: "Market 100",
      status: "externally-verified",
      sourceIds: ["s"],
      verifiedAt: "2026-10-26T00:00:00Z",
    }).success,
    true,
  );
});
test("unknown evidence, duplicate IDs and invalid projects rejected", () => {
  const p = base();
  assert.throws(() =>
    Project.parse({
      ...p,
      claims: [
        { id: "c", text: "x", status: "user-provided", sourceIds: ["missing"] },
      ],
    }),
  );
  assert.throws(() =>
    Project.parse({
      ...p,
      slides: [
        {
          id: "x",
          layout: "hero",
          title: "x",
          message: "",
          claimIds: ["missing"],
        },
      ],
    }),
  );
  assert.throws(() => projectDir("../outside"));
});
test("chart mismatches and unlicensed assets rejected", () => {
  const p = base();
  assert.throws(() =>
    Project.parse({
      ...p,
      slides: [
        {
          id: "x",
          layout: "market",
          title: "x",
          message: "",
          chart: { labels: ["a"], values: [1, 2], unit: "원" },
        },
      ],
    }),
  );
  assert.throws(() =>
    Project.parse({
      ...p,
      slides: [
        {
          id: "x",
          layout: "hero",
          title: "x",
          message: "",
          image: { path: "x", rights: "licensed", caption: "x" },
        },
      ],
    }),
  );
});
test("QA catches overflow, bounds, overlapping text, low resolution", () => {
  const issues = geometry([
    {
      slideId: "s",
      id: "a",
      kind: "text",
      x: -1,
      y: 0,
      w: 1,
      h: 0.1,
      text: "아주 긴 한글 제목입니다",
      fontSize: 32,
    },
    {
      slideId: "s",
      id: "b",
      kind: "text",
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      text: "x",
      fontSize: 20,
    },
    {
      slideId: "s",
      id: "c",
      kind: "image",
      x: 1,
      y: 2,
      w: 4,
      h: 3,
      image: { path: "x", width: 100, height: 100, dpi: 25 },
    },
    {
      slideId: "s",
      id: "d",
      kind: "text",
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      text: "overlap",
      fontSize: 20,
    },
  ]);
  for (const code of [
    "text-overflow",
    "out-of-bounds",
    "text-overlap",
    "low-resolution",
  ])
    assert(issues.some((i) => i.code === code));
  assert(estimatedHeight("한글\n테스트", 3, 20) > 0.5);
});
test("PDF/font/text failures prevent approval", () => {
  const p = base();
  const qa = review(
    p,
    [
      {
        slideId: "s",
        id: "a",
        kind: "text",
        x: 0,
        y: 0,
        w: 4,
        h: 1,
        text: "필수 한글",
        fontSize: 20,
      },
    ],
    { issues: [], fonts: ["WrongFont"], text: "", rendered: 1 },
  );
  assert.equal(qa.status, "failed");
  assert(qa.issues.some((i) => i.code === "font-substitution"));
  assert(qa.issues.some((i) => i.code === "pdf-text-mismatch"));
  assert.equal(qa.finalApproval, false);
});
test("different industry uses the same planner and excludes design reference content", () => {
  const p = base();
  const material = (role: string, text: string) => ({
    id: role,
    originalName: "x",
    role,
    hash: "x",
    text,
    headings: [],
    warnings: [],
    metadata: {},
  });
  const slides = plan(p, [
    material("content", "# 농업\n농산물 유통 개선\n## 실행\n생산자 인터뷰"),
    material("design-reference", "# 군수창고\n비밀 무관 내용"),
  ]);
  assert.equal(slides.length, 3);
  assert(!JSON.stringify(slides).includes("군수"));
  assert(JSON.stringify(slides).includes("농업"));
});
test("PPTX extraction and rendering preserve editable Korean text and native shapes", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-test-"));
  try {
    const p = base();
    p.slides = [
      {
        id: "s",
        layout: "architecture",
        title: "편집 가능한 구성",
        message: "한국어 테스트",
        items: [
          { label: "입력", detail: "사용자 자료" },
          { label: "출력", detail: "제안서" },
        ],
        claimIds: [],
        footnote: "시험자료",
      },
    ];
    const file = path.join(dir, "test.pptx");
    const rendered = await render(p, file);
    const zip = await JSZip.loadAsync(await fs.readFile(file));
    const xml = await zip.file("ppt/slides/slide1.xml")!.async("text");
    assert(xml.includes("편집 가능한 구성"));
    assert(xml.includes("<a:t>"));
    assert(xml.includes("<p:sp>"));
    assert.equal(rendered.slideIds.length, 1);
    assert.equal(
      geometry(rendered.elements).filter((i) => i.severity === "error").length,
      0,
    );
    const result = await extract(file);
    assert(result.text.includes("한국어 테스트"));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
test("content-hash cache and original copies survive repeated ingestion", async () => {
  const p = base();
  p.id = `test-cache-${Date.now()}`;
  p.materials = [
    { path: "examples/Cheonan_SafeSurface_AI.md", role: "content" },
  ];
  try {
    const first = await ingest(p),
      second = await ingest(p);
    assert.deepEqual(first, second);
    const cache = await fs.readdir(path.join(projectDir(p.id), "cache"));
    assert.equal(cache.length, 1);
    const originals = await fs.readdir(
      path.join(projectDir(p.id), "originals"),
    );
    assert.equal(originals.length, 1);
  } finally {
    await fs.rm(projectDir(p.id), { recursive: true, force: true });
  }
});
test("layout capacity rejects content rather than silently dropping it", () => {
  const p = base();
  assert.throws(() =>
    Project.parse({
      ...p,
      slides: [
        {
          id: "x",
          layout: "problem-solution",
          title: "x",
          message: "x",
          items: [1, 2, 3].map((i) => ({
            label: String(i),
            detail: "content",
          })),
        },
      ],
    }),
  );
});
test("chart is a native editable PowerPoint chart", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-chart-"));
  try {
    const p = base();
    p.slides = [
      {
        id: "data",
        layout: "market",
        title: "제공 데이터",
        message: "입력한 값만 표시",
        items: [],
        claimIds: [],
        footnote: "합성 테스트 데이터; 실제 시장규모 아님",
        chart: { labels: ["A", "B"], values: [10, 20], unit: "건" },
      },
    ];
    const file = path.join(dir, "chart.pptx");
    await render(p, file);
    const zip = await JSZip.loadAsync(await fs.readFile(file));
    assert(
      Object.keys(zip.files).some((f) =>
        /^ppt\/charts\/chart\d+\.xml$/.test(f),
      ),
    );
    assert(
      Object.keys(zip.files).some((f) => /^ppt\/embeddings\/.*\.xlsx$/.test(f)),
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
