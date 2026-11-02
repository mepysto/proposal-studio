import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Project } from "../packages/core/schema.js";
import { planningAudit } from "../packages/planning/index.js";

test("SafeHome keeps a distinct generated scene and explanation contract on every page", () => {
  const p = Project.parse(
    JSON.parse(
      fs.readFileSync("projects/kangmin-safehome/project.json", "utf8"),
    ),
  );
  assert.equal(p.planning!.story.length, 12);
  const pages = p.planning!.story;
  assert.equal(new Set(pages.map((s) => s.visualPlan!.scene!.path)).size, 12);
  assert.equal(p.planning!.visualPolicy!.minVisualAreaRatio, 0.24);
  assert.equal(p.planning!.visualPolicy!.requireExplanationContract, true);
  for (const s of pages) {
    const v = s.visualPlan!;
    assert(v.encoding.startsWith("safehome-image:"));
    assert(v.explanation!.requiredMarks.includes("scene"));
    assert.equal(v.scene!.rights, "generated");
    assert(fs.existsSync(v.scene!.path));
  }
  assert.equal(
    planningAudit(p, false).issues.filter((i) => i.severity === "error").length,
    0,
  );
});

test("SafeHome preserves package price assumptions and clearly illustrative agency records", () => {
  const p = Project.parse(
    JSON.parse(
      fs.readFileSync("projects/kangmin-safehome/project.json", "utf8"),
    ),
  );
  const packagePage = p.planning!.story.find((s) => s.id === "packages")!;
  for (const n of packagePage.visualPlan!.nodes)
    assert(n.detail.includes("HW ") && n.detail.includes("월 "));
  assert(packagePage.limitation.includes("견적 아님"));
  const u = p.planning!.story.find((s) => s.id === "queue")!.visualPlan!
    .interfaceExample!;
  assert.equal(u.dataStatus, "illustrative");
  assert.equal(u.records.length, 3);
  assert.equal(u.image!.origin, "generated-concept");
  assert(
    p
      .planning!.story.find((s) => s.id === "events")!
      .answer.includes("정상 휴식"),
  );
});
