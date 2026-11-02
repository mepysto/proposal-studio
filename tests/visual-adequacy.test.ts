import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Project } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningAudit,
} from "../packages/planning/index.js";
import { render } from "../packages/pptx-renderer/index.js";
import { visualAdequacy } from "../packages/visual-assets/adequacy.js";
const fixture = async () => {
  const p = Project.parse(
    JSON.parse(
      await fs.readFile("examples/smartfence-full.project.json", "utf8"),
    ),
  );
  p.slides = compileStoryboard(p);
  return p;
};
test("explanatory contract cannot be replaced by colored cards or an unrelated icon", async () => {
  const p = await fixture();
  const report = visualAdequacy(p, []);
  assert(report.pages.every((p) => p.missing.length > 0));
  delete p.planning!.story[7].visualPlan!.explanation;
  assert(
    planningAudit(p, false).issues.some(
      (i) => i.code === "missing-visual-explanation",
    ),
  );
  p.planning!.story[7].visualPlan!.explanation = {
    readerTask: "판단에 필요한 위치를 확인",
    howToRead: "실제 투영 지도와 참고 위치를 대조",
    notProven: "설치 출입구를 확인한 지도가 아님",
    requiredMarks: ["map"],
  };
  assert(
    planningAudit(p, false).issues.some(
      (i) => i.code === "explanation-map-missing",
    ),
  );
});
test("all planned marks render; removing the candidate map, package scene or timeline is detected", async () => {
  const p = await fixture(),
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "proposal-adequacy-"));
  try {
    const { elements } = await render(p, path.join(dir, "test.pptx"));
    assert.deepEqual(
      visualAdequacy(p, elements).pages.filter((p) => p.missing.length),
      [],
    );
    for (const [id, kind] of [
      ["sites", "map"],
      ["budget", "scene"],
      ["rollout", "timeline"],
    ]) {
      const stripped = elements.filter(
        (e) =>
          e.slideId !== id ||
          (kind === "map"
            ? !e.geographicAssetId
            : kind === "scene"
              ? e.kind !== "image"
              : !e.timelineRange),
      );
      assert(
        visualAdequacy(p, stripped)
          .pages.find((p) => p.slideId === id)!
          .missing.includes(kind as "map" | "scene" | "timeline"),
      );
    }
    const unrelated = elements.map((e) =>
      e.slideId === "budget" && e.kind === "image"
        ? { ...e, image: { ...e.image!, path: "unrelated-stock-photo.png" } }
        : e,
    );
    assert(
      visualAdequacy(p, unrelated)
        .pages.find((p) => p.slideId === "budget")!
        .missing.includes("scene"),
    );
    assert.equal(visualAdequacy(p, elements).finalApproval, false);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
