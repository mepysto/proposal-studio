import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { hash, json, projectDir } from "../core/store.js";
import type { ProjectData } from "../core/schema.js";
import { python } from "../pdf-renderer/index.js";
export interface Material {
  id: string;
  originalName: string;
  role: string;
  hash: string;
  text: string;
  headings: string[];
  warnings: string[];
  metadata: unknown;
}
function texts(node: any): string[] {
  if (!node || typeof node !== "object") return [];
  let out: string[] = [];
  for (const [k, v] of Object.entries(node)) {
    if (k === "a:t" || k === "w:t")
      out.push(
        typeof v === "object" ? String((v as any)["#text"] ?? "") : String(v),
      );
    else if (typeof v === "object")
      out.push(...(Array.isArray(v) ? v.flatMap(texts) : texts(v)));
  }
  return out;
}
export async function extract(
  file: string,
): Promise<{ text: string; warnings: string[]; metadata: unknown }> {
  const ext = path.extname(file).toLowerCase();
  const warnings: string[] = [];
  if ([".md", ".txt", ".csv"].includes(ext))
    return {
      text: await fs.readFile(file, "utf8"),
      warnings,
      metadata: { format: ext },
    };
  if (ext === ".pdf") {
    const d = JSON.parse(
      execFileSync(
        python(),
        [path.resolve("scripts/document.py"), "extract", file],
        { maxBuffer: 30 * 1024 * 1024 },
      ).toString(),
    );
    if (d.imageBased)
      warnings.push(
        `${d.imageBased} page(s) have little extractable text; OCR/visual review required`,
      );
    return { text: d.text, warnings, metadata: { ...d, text: undefined } };
  }
  if ([".pptx", ".docx"].includes(ext)) {
    const zip = await JSZip.loadAsync(await fs.readFile(file));
    const names = Object.keys(zip.files)
      .filter((n) =>
        ext === ".pptx"
          ? /^ppt\/slides\/slide\d+\.xml$/.test(n)
          : n === "word/document.xml",
      )
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const parser = new XMLParser({ ignoreAttributes: false });
    let content = [];
    for (const n of names)
      content.push(
        texts(parser.parse(await zip.files[n].async("text"))).join("\n"),
      );
    return {
      text: content.join("\n\n"),
      warnings: [
        "Embedded visual assets are inventoried, not automatically licensed for reuse",
      ],
      metadata: {
        parts: names,
        media: Object.keys(zip.files).filter((n) => /\/media\//.test(n)),
      },
    };
  }
  throw Error(
    `Unsupported input ${ext}. MVP: MD, TXT, CSV, PDF, PPTX, DOCX. XLSX and images require a future adapter.`,
  );
}
export async function ingest(p: ProjectData) {
  const dir = projectDir(p.id);
  const materials: Material[] = [];
  for (const m of p.materials) {
    const file = path.resolve(m.path);
    const data = await fs.readFile(file);
    const digest = hash(data);
    const id = digest.slice(0, 16);
    const cache = path.join(dir, "cache", `${digest}.json`);
    let d;
    try {
      d = JSON.parse(await fs.readFile(cache, "utf8"));
    } catch {
      d = await extract(file);
      await json(cache, d);
    }
    const original = path.join(dir, "originals", `${id}${path.extname(file)}`);
    await fs.mkdir(path.dirname(original), { recursive: true });
    try {
      await fs.writeFile(original, data, { flag: "wx" });
    } catch (e: any) {
      if (e.code !== "EEXIST") throw e;
    }
    materials.push({
      id,
      originalName: path.basename(file),
      role: m.role,
      hash: digest,
      ...d,
      headings: d.text.split("\n").filter((l: string) => /^#{1,6} /.test(l)),
    });
  }
  await json(path.join(dir, "materials.json"), materials);
  return materials;
}
