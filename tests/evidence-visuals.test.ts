import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { Project } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningFingerprint,
} from "../packages/planning/index.js";
import { evidenceVisualAudit } from "../packages/visual-assets/evidence-audit.js";
import {
  mercator,
  unproject,
  geographicViewport,
} from "../packages/visual-assets/geography.js";
import { intentRenderingAudit } from "../packages/quality-assurance/index.js";
const fixture = async () => {
  const p = Project.parse(
    JSON.parse(
      await fs.readFile("examples/smartfence-full.project.json", "utf8"),
    ),
  );
  p.slides = compileStoryboard(p);
  return p;
};
const codes = (p: Awaited<ReturnType<typeof fixture>>) =>
  evidenceVisualAudit(p).map((i) => i.code);
test("map projection roundtrips and preserves projected aspect ratio", () => {
  const lon = 127.14684,
    lat = 36.81028;
  const [a, b] = unproject(...mercator(lon, lat));
  assert(Math.abs(a - lon) < 1e-9 && Math.abs(b - lat) < 1e-9);
  const v = geographicViewport(
    { west: 127.12, east: 127.18, south: 36.79, north: 36.83 },
    1600,
    760,
  );
  const [x, y] = mercator(lon, lat);
  const right = unproject(x + 100, y),
    up = unproject(x, y + 100);
  const p = v.point(lon, lat),
    r = v.point(...right),
    u = v.point(...up);
  assert(Math.abs(r[0] - p[0] - (p[1] - u[1])) < 1e-7);
});
test("regional visuals require real assets and cannot promote reference coordinates to surveyed gates", async () => {
  const p = await fixture();
  assert.deepEqual(codes(p), []);
  const v = p.planning!.story.find((s) => s.visualPlan?.map)!.visualPlan!;
  v.map!.markers[0].precision = "surveyed-site";
  v.map!.markers[1].lon = 130;
  assert(codes(p).includes("unproven-map-site"));
  assert(codes(p).includes("marker-outside-map"));
  v.map!.assetId = "absent";
  assert(codes(p).includes("missing-geographic-asset"));
  v.kind = "context";
  assert(codes(p).includes("geography-needs-map"));
});
test("chart data rejects duplicate or missing observations and overlapping stacked series", async () => {
  const p = await fixture(),
    d = p.quantitativeDatasets[0];
  const v = p.planning!.story.find((s) => s.visualPlan?.chart)!.visualPlan!;
  v.chart!.stacked = true;
  assert(codes(p).includes("overlapping-series-stack"));
  d.rows.pop();
  assert(codes(p).includes("incomplete-chart-series"));
  d.rows.push({ ...d.rows[0] });
  assert(codes(p).includes("duplicate-chart-observation"));
  d.sourceClaimIds.push("absent");
  assert(codes(p).includes("unknown-chart-evidence"));
  v.chart!.datasetId = "absent";
  assert(codes(p).includes("missing-chart-dataset"));
});
test("causal chains require linked interventions and metrics; data edits invalidate planning fingerprints", async () => {
  const p = await fixture();
  const before = planningFingerprint(p);
  p.quantitativeDatasets[0].rows[0].value++;
  assert.notEqual(planningFingerprint(p), before);
  const v = p.planning!.story.find((s) => s.visualPlan?.chains)!.visualPlan!;
  v.chains![0].metricIds = ["absent"];
  assert(codes(p).includes("broken-causal-evidence"));
  delete v.chains;
  assert(codes(p).includes("solution-needs-causal-chain"));
});
test("declaring a generic diagram cannot satisfy map, chart or cause-flow rendering", async () => {
  const p = await fixture();
  const marks = p.slides.map((s) => ({
    slideId: s.id,
    id: "generic",
    kind: "diagram" as const,
    x: 0.64,
    y: 2.64,
    w: 12,
    h: 3.8,
  }));
  const failures = intentRenderingAudit(p, marks);
  assert.equal(
    failures.filter((i) => i.code === "geographic-visual-not-rendered").length,
    3,
  );
  assert.equal(
    failures.filter((i) => i.code === "evidence-chart-not-rendered").length,
    1,
  );
  assert.equal(
    failures.filter((i) => i.code === "causal-flow-not-rendered").length,
    1,
  );
});
