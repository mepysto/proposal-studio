import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
export function python() {
  if (process.env.PROPOSAL_PYTHON) return process.env.PROPOSAL_PYTHON;
  const bundled = path.join(
    os.homedir(),
    ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3",
  );
  return fs.existsSync(bundled) ? bundled : "python3";
}
export async function convert(pptx: string, out: string, expected: number) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "proposal-lo-"));
  try {
    const fontConfig = path.join(profile, "fonts.conf");
    fs.writeFileSync(
      fontConfig,
      `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><dir>/System/Library/Fonts</dir><dir>/System/Library/Fonts/Supplemental</dir><dir>/Library/Fonts</dir><dir>/usr/share/fonts</dir><dir>${os.homedir()}/Library/Fonts</dir><cachedir>${profile}/font-cache</cachedir></fontconfig>`,
    );
    const env = {
      ...process.env,
      FONTCONFIG_FILE: process.env.FONTCONFIG_FILE || fontConfig,
      SAL_FONTPATH:
        process.env.SAL_FONTPATH ||
        "/System/Library/Fonts;/System/Library/Fonts/Supplemental",
    };
    execFileSync(
      process.env.PROPOSAL_SOFFICE || "soffice",
      [
        `-env:UserInstallation=${new URL("file://" + profile).href}`,
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        out,
        pptx,
      ],
      { timeout: 180000, stdio: "pipe", env },
    );
    const pdf = path.join(out, path.basename(pptx, ".pptx") + ".pdf");
    if (!fs.existsSync(pdf)) throw Error("LibreOffice did not produce PDF");
    const report = JSON.parse(
      execFileSync(
        python(),
        [
          path.resolve("scripts/document.py"),
          "verify",
          pdf,
          path.join(out, "preview"),
          String(expected),
        ],
        { timeout: 180000, maxBuffer: 20 * 1024 * 1024 },
      ).toString(),
    );
    return { pdf, report };
  } finally {
    fs.rmSync(profile, { recursive: true, force: true });
  }
}
