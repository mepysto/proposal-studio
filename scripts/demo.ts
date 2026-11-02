import fs from "node:fs";
import path from "node:path";
import { init, stage } from "../packages/core/pipeline.js";
import { projectDir } from "../packages/core/store.js";
const id = process.env.PROPOSAL_DEMO_PROJECT || "smartfence-full";
if (!fs.existsSync(path.join(projectDir(id), "project.json")))
  await init(id, { config: `examples/${id}.project.json` });
console.log(await stage(id, "run"));
