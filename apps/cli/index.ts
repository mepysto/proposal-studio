#!/usr/bin/env -S npx tsx
import fs from "node:fs";
import path from "node:path";
import { projectDir } from "../../packages/core/store.js";
import { Command } from "commander";
import { init, stage } from "../../packages/core/pipeline.js";
import { writeDesignReview } from "../../packages/design-review/index.js";
const cli = new Command()
  .name("proposal-studio")
  .description("Editable, evidence-aware proposal pipeline")
  .version("0.8.0");
cli
  .command("design-review")
  .description(
    "Create offline page review workspace; validate an authored inspection record",
  )
  .requiredOption("--project <id>")
  .option("--slide <id>", "Review latest single-slide revision")
  .option(
    "--record <path>",
    "Import observations bound to this run's artifact hashes",
  )
  .action(async (o) => {
    if (o.slide && !/^[a-zA-Z0-9_-]+$/.test(o.slide))
      throw Error("Invalid slide ID");
    const latest = JSON.parse(
      fs.readFileSync(
        path.join(
          projectDir(o.project),
          o.slide ? `latest-slide-${o.slide}.json` : "latest.json",
        ),
        "utf8",
      ),
    );
    const input = o.record
      ? JSON.parse(fs.readFileSync(path.resolve(o.record), "utf8"))
      : undefined;
    console.log(
      JSON.stringify(await writeDesignReview(latest.out, input), null, 2),
    );
  });
cli
  .command("init")
  .requiredOption("--project <id>")
  .option("--input <path>")
  .option("--config <path>")
  .option("--type <type>")
  .option("--mode <mode>", "quick | deep", "quick")
  .action(async (o) => {
    console.log(JSON.stringify(await init(o.project, o), null, 2));
  });
for (const name of [
  "audit",
  "design-plan",
  "layout-lock",
  "ingest",
  "analyze",
  "plan",
  "build",
  "review",
  "export",
  "run",
  "regenerate",
])
  cli
    .command(name)
    .requiredOption("--project <id>")
    .option("--mode <mode>", "quick | deep")
    .option("--input <path>", "Initialize a new project from a content file")
    .option("--config <path>", "Project configuration for a new run")
    .option("--slide <id>", "Build a single slide as a separate revision")
    .action(async (o) => {
      if (name === "run" && (o.input || o.config)) {
        if (fs.existsSync(path.join(projectDir(o.project), "project.json")))
          throw Error(
            "Project already exists: edit its project.json or choose a new ID",
          );
        await init(o.project, o);
      }
      if (o.slide && !["build", "regenerate", "layout-lock"].includes(name))
        throw Error("--slide is supported by build, regenerate, and layout-lock only");
      if (name === "regenerate" && !o.slide)
        throw Error("regenerate requires --slide");
      console.log(JSON.stringify(await stage(o.project, name, o), null, 2));
    });
cli.parseAsync().catch((e) => {
  console.error(`Proposal Studio: ${e.message}`);
  process.exitCode = 1;
});
