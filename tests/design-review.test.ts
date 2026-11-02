import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Project } from "../packages/core/schema.js";
import {
  designDiagnostics,
  inspectionTemplate,
  validateInspection,
  writeDesignReview,
} from "../packages/design-review/index.js";
import type { Element } from "../packages/pptx-renderer/index.js";

async function fixture() {
  const out = await fs.mkdtemp(path.join(os.tmpdir(), "proposal-design-"));
  const p = Project.parse(
    JSON.parse(await fs.readFile("examples/smartfence.project.json", "utf8")),
  );
  p.slides = p.slides.slice(0, 2);
  await fs.mkdir(path.join(out, "preview"));
  await fs.writeFile(path.join(out, "config.json"), JSON.stringify(p));
  await fs.writeFile(path.join(out, "elements.json"), "[]");
  await fs.writeFile(path.join(out, "proposal.pptx"), "pptx");
  await fs.writeFile(path.join(out, "proposal.pdf"), "pdf");
  for (const i of [1, 2])
    await fs.writeFile(
      path.join(out, `preview/slide-${i}.png`),
      `preview ${i}`,
    );
  return { out, p };
}

test("inspection records require every page and exact rendered artifacts; pending never means inspected", async () => {
  const { out, p } = await fixture();
  try {
    const expected = await inspectionTemplate(out, p);
    assert.equal(expected.pages.length, 2);
    assert.equal(
      validateInspection(expected, expected).status,
      "inspection-incomplete-or-stale",
    );
    const authored = structuredClone(expected);
    for (const page of authored.pages)
      Object.assign(page, {
        decision: "retained",
        finding: "실제 장표에서 대상과 경로를 확인",
        evidenceOrUnknown: "현장 실측 자료는 없음",
        inspectedBy: "test reviewer",
        inspectedAt: "2026-10-29T14:00:00+09:00",
      });
    assert.equal(
      validateInspection(authored, expected).status,
      "inspection-recorded",
    );
    assert(
      validateInspection(authored, {
        ...expected,
        configHash: "changed",
      }).issues.includes("stale-artifacts"),
    );
    assert(
      validateInspection(authored, {
        ...expected,
        pdfHash: "changed",
      }).issues.includes("stale-artifacts"),
    );
    await writeDesignReview(out, authored);
    const saved = await fs.readFile(
      path.join(out, "inspection-record.json"),
      "utf8",
    );
    await writeDesignReview(out);
    assert.equal(
      await fs.readFile(path.join(out, "inspection-record.json"), "utf8"),
      saved,
    );
    const omitted = structuredClone(authored);
    omitted.pages.pop();
    assert(
      validateInspection(omitted, expected).issues.includes(
        "page-set-mismatch",
      ),
    );
    const duplicate = structuredClone(authored);
    duplicate.pages[1] = duplicate.pages[0];
    assert(
      validateInspection(duplicate, expected).issues.includes(
        "page-set-mismatch",
      ),
    );
    const deferred = structuredClone(authored);
    deferred.pages[1].decision = "deferred";
    assert.equal(
      validateInspection(deferred, expected).status,
      "recorded-with-deferred-pages",
    );
    await fs.writeFile(
      path.join(out, "preview/slide-1.png"),
      "repaired render",
    );
    assert(
      validateInspection(
        authored,
        await inspectionTemplate(out, p),
      ).issues.some((i) => i.includes("stale-or-missing-preview")),
    );
    await assert.rejects(
      writeDesignReview(out, authored),
      /Inspection rejected/,
    );
    assert.equal(
      JSON.parse(
        await fs.readFile(path.join(out, "inspection-status.json"), "utf8"),
      ).status,
      "inspection-incomplete-or-stale",
    );
    assert.equal(
      await fs.readFile(path.join(out, "inspection-record.json"), "utf8"),
      saved,
    );
    await fs.writeFile(path.join(out, "proposal.pptx"), "changed deck");
    assert(
      validateInspection(
        authored,
        await inspectionTemplate(out, p),
      ).issues.includes("stale-artifacts"),
    );
    await fs.rm(path.join(out, "proposal.pdf"));
    assert(
      validateInspection(
        authored,
        await inspectionTemplate(out, p),
      ).issues.some((i) => i.includes("missing-preview")),
    );
    assert.throws(() =>
      validateInspection({ ...authored, finalApproval: true }, expected),
    );
  } finally {
    await fs.rm(out, { recursive: true, force: true });
  }
});

test("diagnostics isolate small explanation type and escape untrusted report text", async () => {
  const { out, p } = await fixture();
  try {
    p.title = '<script>alert("x")</script>';
    p.slides[0].title = '<img src=x onerror="alert(1)">';
    const elements: Element[] = [
      {
        id: "body",
        slideId: p.slides[0].id,
        kind: "text",
        x: 1,
        y: 2,
        w: 4,
        h: 1,
        fontSize: 12,
        text: "핵심 설명",
      },
      {
        id: "source",
        slideId: p.slides[0].id,
        kind: "text",
        x: 1,
        y: 7,
        w: 4,
        h: 0.2,
        fontSize: 10,
        text: "출처",
      },
    ];
    const pages = designDiagnostics(p, elements);
    assert.deepEqual(
      pages[0].findings.find((f) => f.code === "small-explanation-text")
        ?.elementIds,
      ["body"],
    );
    await fs.writeFile(path.join(out, "config.json"), JSON.stringify(p));
    await writeDesignReview(out);
    const html = await fs.readFile(
      path.join(out, "design-review.html"),
      "utf8",
    );
    assert(!html.includes("<script>"));
    assert(!html.includes("<img src=x"));
    assert(html.includes("preview/slide-1.png"));
    assert(html.includes("&lt;script&gt;"));
    assert(html.includes("overlay-svg"));
    assert(html.includes("btn-export-record"));
    assert.equal(
      JSON.parse(
        await fs.readFile(path.join(out, "inspection-status.json"), "utf8"),
      ).finalApproval,
      false,
    );
  } finally {
    await fs.rm(out, { recursive: true, force: true });
  }
});

test("visual diff detects changed vs unchanged slides across consecutive runs", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "proposal-runs-"));
  try {
    const p = Project.parse(
      JSON.parse(await fs.readFile("examples/smartfence.project.json", "utf8")),
    );
    p.slides = p.slides.slice(0, 2);
    const run1 = path.join(root, "2026-10-31T01-00-00Z-aaaa");
    const run2 = path.join(root, "2026-10-31T02-00-00Z-bbbb");
    for (const r of [run1, run2]) {
      await fs.mkdir(path.join(r, "preview"), { recursive: true });
      await fs.writeFile(path.join(r, "config.json"), JSON.stringify(p));
      await fs.writeFile(path.join(r, "elements.json"), "[]");
      await fs.writeFile(path.join(r, "proposal.pptx"), "pptx");
      await fs.writeFile(path.join(r, "proposal.pdf"), "pdf");
      await fs.writeFile(path.join(r, "preview/slide-1.png"), "same-slide-1");
      await fs.writeFile(
        path.join(r, "preview/slide-2.png"),
        r === run1 ? "old-slide-2" : "new-slide-2",
      );
    }
    await writeDesignReview(run1);
    await writeDesignReview(run2);
    const review2 = JSON.parse(
      await fs.readFile(path.join(run2, "design-review.json"), "utf8"),
    );
    assert.equal(review2.diff[p.slides[0].id].changed, false);
    assert.equal(review2.diff[p.slides[1].id].changed, true);
    const html2 = await fs.readFile(
      path.join(run2, "design-review.html"),
      "utf8",
    );
    assert(html2.includes("badge-same"));
    assert(html2.includes("badge-changed"));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
