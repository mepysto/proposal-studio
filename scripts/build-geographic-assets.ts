import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";
import { geographicViewport } from "../packages/visual-assets/geography.js";
const raw = await fs.readFile(
    "references/research/maps/cheonan-osm.json",
    "utf8",
  ),
  osm = JSON.parse(raw);
const out = "examples/assets/maps";
await fs.mkdir(out, { recursive: true });
const variants = [
  {
    id: "cheonan-center",
    bounds: { west: 127.12, south: 36.8, east: 127.18, north: 36.8228 },
  },
  {
    id: "station-context",
    bounds: { west: 127.136, south: 36.804, east: 127.153, north: 36.816 },
  },
  {
    id: "oryong-context",
    bounds: { west: 127.155, south: 36.806, east: 127.171, north: 36.818 },
  },
];
const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const assets = [];
for (const v of variants) {
  const W = 1600,
    H = 760,
    view = geographicViewport(v.bounds, W, H);
  const paths: string[] = [],
    labels: string[] = [];
  const names = new Set<string>();
  for (const e of osm.elements) {
    if (!e.geometry?.length) continue;
    const t = e.tags || {},
      pts = e.geometry.map((g: any) => view.point(g.lon, g.lat));
    if (
      !pts.some(
        ([x, y]: number[]) =>
          x >= -100 && x <= W + 100 && y >= -100 && y <= H + 100,
      )
    )
      continue;
    const d = pts
      .map(
        ([x, y]: number[], i: number) =>
          `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`,
      )
      .join(" ");
    const rail = !!t.railway,
      water = !!t.waterway || t.natural === "water",
      major = /motorway|trunk|primary|secondary/.test(t.highway || "");
    if (water)
      paths.unshift(
        `<path d="${d}" fill="${t.natural === "water" ? "#D6EAF1" : "none"}" stroke="#B8D9E6" stroke-width="${t.waterway === "river" ? 11 : 4}"/>`,
      );
    else if (rail)
      paths.push(
        `<path d="${d}" fill="none" stroke="#627B8D" stroke-width="4" stroke-dasharray="10 5"/>`,
      );
    else
      paths.push(
        `<path d="${d}" fill="none" stroke="${major ? "#A7B9C5" : "#D6DFE5"}" stroke-width="${major ? 7 : t.highway === "tertiary" ? 4.5 : 2.2}" stroke-linecap="round"/>`,
      );
    const name = t["name:ko"] || t.name;
    if (major && name && !names.has(name)) {
      const [x, y] = pts[Math.floor(pts.length / 2)];
      if (x > 100 && x < W - 180 && y > 70 && y < H - 80) {
        labels.push(
          `<text x="${x}" y="${y}" font-size="23" fill="#657C8B" stroke="#F8FAFB" stroke-width="5" paint-order="stroke" font-family="Apple SD Gothic Neo">${esc(name)}</text>`,
        );
        names.add(name);
      }
    }
  }
  const km =
    1000 /
    (view.metersPerPixel *
      Math.cos(
        (((view.bounds.north + view.bounds.south) / 2) * Math.PI) / 180,
      ));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#F2F6F7"/>${paths.join("")}${labels.slice(0, 16).join("")}<g font-family="Apple SD Gothic Neo" fill="#304F63"><text x="1540" y="45" font-size="23">N ↑</text><path d="M55,696h${km.toFixed(1)}" stroke="#304F63" stroke-width="5"/><text x="55" y="681" font-size="20">약 1 km</text><text x="1040" y="733" font-size="19">© OpenStreetMap contributors · ODbL</text></g></svg>`;
  const path = `${out}/${v.id}.png`;
  await sharp(Buffer.from(svg)).png().toFile(path);
  await fs.writeFile(`${out}/${v.id}.svg`, svg);
  assets.push({
    id: v.id,
    path,
    projection: "EPSG:3857",
    bounds: view.bounds,
    width: W,
    height: H,
    attribution: "© OpenStreetMap contributors · ODbL",
    sourceClaimIds: ["osm-geography"],
    dataSha256: crypto.createHash("sha256").update(raw).digest("hex"),
    disclosure:
      "도로·철도·수계 참고도. 사업 경계·공사 출입구·보행 동선 실사가 아님.",
  });
}
await fs.writeFile(
  "examples/geographic-assets.json",
  JSON.stringify(assets, null, 2),
);
console.log(
  "Built",
  assets.length,
  "maps from",
  osm.elements.length,
  "OSM features",
);
