import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { Project, type ProjectData } from "./schema.js";
export const root = process.cwd();
export const hash = (s: string | Buffer) =>
  crypto.createHash("sha256").update(s).digest("hex");
export function projectDir(id: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw Error("Invalid project ID");
  return path.join(root, "projects", id);
}
export async function json(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = file + `.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}
export async function readJSON(file: string) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}
export async function load(id: string): Promise<ProjectData> {
  return Project.parse(
    await readJSON(path.join(projectDir(id), "project.json")),
  );
}
export async function save(p: ProjectData) {
  await json(path.join(projectDir(p.id), "project.json"), Project.parse(p));
}
export async function revision(
  p: ProjectData,
  action: string,
  details: unknown = {},
) {
  const dir = path.join(projectDir(p.id), "history");
  await json(path.join(dir, `${Date.now()}-${crypto.randomUUID()}.json`), {
    action,
    at: new Date().toISOString(),
    configHash: hash(JSON.stringify(p)),
    provider: p.provider,
    details,
    config: p,
  });
}
