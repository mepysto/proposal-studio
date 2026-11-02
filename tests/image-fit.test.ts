import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";
import { coverFit } from "../packages/pptx-renderer/image-fit.js";
import { Project } from "../packages/core/schema.js";
import { compileStoryboard } from "../packages/planning/index.js";
import { render } from "../packages/pptx-renderer/index.js";
test("wide source in portrait frame crops rather than squeezing the source", () => {
  const f = coverFit(1536, 1024, 7.38, 7.5);
  assert.equal(f.w / f.h, 1536 / 1024);
  assert(f.crop.left > 0.17 && f.crop.right > 0.17);
  const visibleRatio =
    (1536 * (1 - f.crop.left - f.crop.right)) /
    (1024 * (1 - f.crop.top - f.crop.bottom));
  assert(Math.abs(visibleRatio - 7.38 / 7.5) < 1e-10);
  assert.equal(f.sizing.w, 7.38);
  assert.equal(f.sizing.h, 7.5);
});
test("first body page shows the problem scene without an image-caption band", async () => {
  const p = Project.parse(
    JSON.parse(
      await fs.readFile("examples/smartfence-full.project.json", "utf8"),
    ),
  );
  p.slides = compileStoryboard(p);
  const cover = p.slides[1];
  assert.equal(cover.reasoning!.visualPlan!.kind, "summary-brief");
  assert.equal(
    p.slides[0].image!.path,
    "examples/assets/smartfence-gate-v2.png",
  );
  assert(cover.message.includes("가려진"));
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cover-fit-"));
  try {
    const r = await render(p, path.join(dir, "cover.pptx"), "summary");
    const image = r.elements.find((e) => e.kind === "image")!;
    assert(image.image!.fit === "cover");
    assert(image.image!.path.endsWith("cover-crossing-problem-v8.png"));
    assert(
      !r.elements.some(
        (e) => e.kind === "text" && e.text === cover.image!.caption,
      ),
    );
    assert(
      !r.elements.some(
        (e) => e.kind === "text" && e.x > 6.5 && e.y > 0.75 && e.y < 6.45,
      ),
    );
    const zip = await JSZip.loadAsync(
      await fs.readFile(path.join(dir, "cover.pptx")),
    );
    const xml = await zip.file("ppt/slides/slide1.xml")!.async("string");
    const crop = xml.match(
      /<a:srcRect l="(\d+)" r="(\d+)" t="(\d+)" b="(\d+)"/,
    )!;
    assert(
      crop && crop.slice(1).some((value) => Number(value) > 0),
      "Native PPTX must preserve the actual nonzero source crop",
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("geometry audit rejects a fitted image whose crop would squeeze the source", async () => {
  const { geometry } = await import("../packages/quality-assurance/index.js");
  const fit = coverFit(1536, 1024, 7.38, 7.5);
  const e = {
    slideId: "cover",
    id: "image",
    kind: "image" as const,
    x: 0,
    y: 0,
    w: 7.38,
    h: 7.5,
    image: {
      path: "source.png",
      width: 1536,
      height: 1024,
      dpi: 150,
      fit: "cover" as const,
      crop: fit.crop,
    },
  };
  assert(!geometry([e]).some((i) => i.code === "image-aspect-distortion"));
  e.image.crop = { left: 0, right: 0, top: 0, bottom: 0 };
  assert(geometry([e]).some((i) => i.code === "image-aspect-distortion"));
});
