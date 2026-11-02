import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { hash, json, readJSON } from "../core/store.js";
import { Project, type ProjectData } from "../core/schema.js";
import type { Element } from "../pptx-renderer/index.js";
import { hasKoreanOrphanTail } from "../pptx-renderer/typography.js";
import { visualAdequacy } from "../visual-assets/adequacy.js";
import { directionDossier, directionMarkdown } from "../art-direction/index.js";

// Advisory observations only: metadata cannot establish visual comprehension.
export function designDiagnostics(p: ProjectData, elements: Element[]) {
  const adequacy = visualAdequacy(p, elements);
  const frame = (id: string) => {
    const marks = elements.filter((e) => e.slideId === id);
    const title = marks.find(
      (e) =>
        e.kind === "text" &&
        e.text === p.slides.find((s) => s.id === id)?.title,
    );
    const message = marks.find((e) => e.emphasisRole === "primary-background");
    return title && message
      ? JSON.stringify(
          [title, message].map((e) =>
            [e.x, e.y, e.w, e.h].map((v) => Math.round(v * 20) / 20),
          ),
        )
      : null;
  };
  return adequacy.pages.map((page, i) => {
    const slide = p.slides[i];
    const marks = elements.filter((e) => e.slideId === slide.id);
    // Caption/footer zones are excluded; small type is still sometimes justified.
    const small = marks.filter(
      (e) =>
        e.kind === "text" &&
        e.y >= 1.1 &&
        e.y + e.h <= 6.6 &&
        e.fontSize &&
        e.fontSize < 16,
    );
    const findings: { code: string; message: string; elementIds: string[] }[] =
      [];
    if (p.designDirection?.deliveryMode === "presented") {
      const copy = marks
        .filter((e) => e.kind === "text" && e.y >= 0.65 && e.y < 6.65)
        .map((e) => e.text || "")
        .join("");
      if (copy.length > 600)
        findings.push({
          code: "presented-copy-density",
          message: `발표용으로 지정한 페이지에 ${copy.length}자 텍스트가 있습니다. 읽기용 근거로 옮길 수 있는지 검토(휴리스틱, 오류/품질 점수 아님)`,
          elementIds: [],
        });
    }
    if (
      i >= 2 &&
      !slide.compositionBrief?.repetitionReason &&
      frame(slide.id) &&
      p.slides.slice(i - 2, i + 1).every((s) => frame(s.id) === frame(slide.id))
    )
      findings.push({
        code: "repeated-frame",
        message:
          "시각 종류가 달라도 제목·강조 영역의 실제 배치가 세 장 연속 같습니다. 기획상 같은 외곽 구조가 필요한지 확인",
        elementIds: [],
      });
    if (small.length)
      findings.push({
        code: "small-explanation-text",
        message:
          "설명 영역의 16pt 미만 글자: 본문인지 보조 조건인지 확인하고, 중요하면 내용을 줄이거나 공간을 재배치",
        elementIds: small.map((e) => e.id),
      });
    const orphanTargets = marks.filter(
      (e) =>
        e.kind === "text" &&
        e.text &&
        e.fontSize &&
        (e.text === slide.title || e.emphasisRole === "primary-message") &&
        hasKoreanOrphanTail(e.text, e.w, e.fontSize),
    );
    if (orphanTargets.length)
      findings.push({
        code: "korean-orphan-tail",
        message:
          "제목·핵심 문구 자동 줄바꿈 끝에 1~2글자 한글 어절이 남을 수 있습니다. 의미 단위 줄바꿈(\\n) 또는 영역 폭을 검토(휴리스틱 권고)",
        elementIds: orphanTargets.map((e) => e.id),
      });
    if (page.missing.length)
      findings.push({
        code: "missing-marks",
        message: `계획한 요소 누락: ${page.missing.join(", ")}`,
        elementIds: [],
      });
    if (
      i >= 2 &&
      p.slides
        .slice(i - 2, i + 1)
        .every(
          (s) =>
            s.layout === slide.layout &&
            s.reasoning?.visualPlan?.kind === slide.reasoning?.visualPlan?.kind,
        )
    )
      findings.push({
        code: "repeated-composition",
        message:
          "같은 레이아웃·시각 종류가 세 장 연속: 공통 기준 비교에 필요한 반복인지 검토. 다양성만을 위해 바꾸지 않음",
        elementIds: [],
      });
    return {
      ...page,
      layout: slide.layout,
      visualKind: slide.reasoning?.visualPlan?.kind ?? null,
      compositionBrief: slide.compositionBrief ?? null,
      deliveryMode: p.designDirection?.deliveryMode ?? null,
      findings,
    };
  });
}

const PageRecord = z.object({
  page: z.number().int().positive(),
  slideId: z.string(),
  preview: z.string(),
  previewHash: z.string().nullable(),
  decision: z.enum(["pending", "retained", "revised", "deferred"]),
  finding: z.string(),
  evidenceOrUnknown: z.string(),
  inspectedBy: z.string(),
  inspectedAt: z.string(),
});
const Inspection = z.object({
  schemaVersion: z.literal(1),
  configHash: z.string(),
  pptxHash: z.string(),
  pdfHash: z.string().nullable(),
  finalApproval: z.literal(false),
  pages: z.array(PageRecord),
});
export type InspectionRecord = z.infer<typeof Inspection>;

export async function inspectionTemplate(
  out: string,
  p: ProjectData,
): Promise<InspectionRecord> {
  const files = await fs
    .readdir(path.join(out, "preview"))
    .catch((e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") return [];
      throw e;
    });
  const byPage = new Map<number, string>();
  for (const file of files) {
    const match = /^slide-(\d+)\.png$/.exec(file);
    if (match) {
      const page = Number(match[1]);
      if (byPage.has(page)) throw Error(`Ambiguous preview for page ${page}`);
      byPage.set(page, file);
    }
  }
  const pdf = await fs
    .readFile(path.join(out, "proposal.pdf"))
    .catch((e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") return null;
      throw e;
    });
  return {
    schemaVersion: 1,
    configHash: hash(JSON.stringify(p)),
    pptxHash: hash(await fs.readFile(path.join(out, "proposal.pptx"))),
    pdfHash: pdf ? hash(pdf) : null,
    finalApproval: false,
    pages: await Promise.all(
      p.slides.map(async (s, i) => {
        const file = byPage.get(i + 1);
        return {
          page: i + 1,
          slideId: s.id,
          preview: file ? `preview/${file}` : "",
          previewHash: file
            ? hash(await fs.readFile(path.join(out, "preview", file)))
            : null,
          decision: "pending" as const,
          finding: "",
          evidenceOrUnknown: "",
          inspectedBy: "",
          inspectedAt: "",
        };
      }),
    ),
  };
}

export function validateInspection(input: unknown, expected: InspectionRecord) {
  const record = Inspection.parse(input);
  const issues: string[] = [];
  if (
    record.configHash !== expected.configHash ||
    record.pptxHash !== expected.pptxHash ||
    record.pdfHash !== expected.pdfHash
  )
    issues.push("stale-artifacts");
  const ids = new Set(record.pages.map((p) => p.slideId));
  if (
    record.pages.length !== expected.pages.length ||
    ids.size !== record.pages.length ||
    record.pages.some(
      (p) => !expected.pages.some((e) => e.slideId === p.slideId),
    )
  )
    issues.push("page-set-mismatch");
  for (const e of expected.pages) {
    const r = record.pages.find((p) => p.slideId === e.slideId);
    if (!r) continue;
    if (
      !e.previewHash ||
      !expected.pdfHash ||
      r.previewHash !== e.previewHash ||
      r.preview !== e.preview ||
      r.page !== e.page
    )
      issues.push(`${e.slideId}:stale-or-missing-preview`);
    if (
      r.decision === "pending" ||
      !r.finding.trim() ||
      !r.evidenceOrUnknown.trim() ||
      !r.inspectedBy.trim() ||
      !z.string().datetime({ offset: true }).safeParse(r.inspectedAt).success
    )
      issues.push(`${e.slideId}:inspection-incomplete`);
  }
  return {
    status: issues.length
      ? "inspection-incomplete-or-stale"
      : record.pages.some((p) => p.decision === "deferred")
        ? "recorded-with-deferred-pages"
        : "inspection-recorded",
    finalApproval: false,
    issues,
  };
}

const escape = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export interface PageDiffInfo {
  changed: boolean;
  previousRunId?: string;
}

export async function detectRunDiff(
  out: string,
  template: InspectionRecord,
): Promise<Record<string, PageDiffInfo>> {
  const parent = path.dirname(out);
  const currentName = path.basename(out);
  const entries = await fs.readdir(parent).catch(() => [] as string[]);
  const others = entries.filter((name) => name !== currentName).sort();
  const prevName = others.filter((n) => n < currentName).at(-1) ?? others.at(-1);
  if (!prevName) return {};
  const prevTemplate = await readJSON(
    path.join(parent, prevName, "inspection-template.json"),
  ).catch(() => null);
  if (!prevTemplate || !Array.isArray(prevTemplate.pages)) return {};
  const result: Record<string, PageDiffInfo> = {};
  for (const page of template.pages) {
    const prevPage = prevTemplate.pages.find(
      (p: any) => p.slideId === page.slideId,
    );
    result[page.slideId] = {
      changed: !prevPage || prevPage.previewHash !== page.previewHash,
      previousRunId: prevName,
    };
  }
  return result;
}

export function reviewHTML(
  p: ProjectData,
  pages: ReturnType<typeof designDiagnostics>,
  template: InspectionRecord,
  elements: Element[] = [],
  diffMap: Record<string, PageDiffInfo> = {},
) {
  const safeJSON = (v: unknown) =>
    JSON.stringify(v).replace(/[<>&]/g, (c) =>
      c === "<" ? "\\u003c" : c === ">" ? "\\u003e" : "\\u0026",
    );
  const hasDiff = Object.keys(diffMap).length > 0;
  return `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(p.title)} — 디자인 검수</title>
<style>body{font-family:system-ui,sans-serif;margin:0;background:#edf1f3;color:#182b37;line-height:1.65}header,main{max-width:1600px;margin:auto;padding:28px}header{background:#fff}nav{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px}a{color:#075b75}article{background:white;margin:28px 0;padding:24px;border:1px solid #c3cdd2}img{display:block;width:100%;height:auto;border:1px solid #c3cdd2}h1{font-size:28px}h2{font-size:23px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}dl{display:grid;grid-template-columns:110px 1fr;gap:8px}dd{margin:0;overflow-wrap:anywhere}li{margin:6px 0}.limit{border-left:4px solid #946013;padding-left:14px}.toolbar{display:flex;gap:16px;flex-wrap:wrap;align-items:center;padding:12px 16px;background:#f4f7f9;border:1px solid #c3cdd2;margin-top:14px}.slide-stage{position:relative}.overlay-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:none}body.show-overlay .overlay-svg{display:block}body.only-changed article[data-changed="false"]{display:none}.badge{font-size:12px;padding:2px 8px;border-radius:4px;font-weight:700}.badge-changed{background:#fce8e6;color:#a50e0e}.badge-same{background:#e6f4ea;color:#137333}.inspect-form{display:grid;grid-template-columns:160px 1fr 1fr;gap:10px;margin-top:14px;padding:12px;background:#f8fafb;border:1px solid #d5dde2}.inspect-form label{display:flex;flex-direction:column;font-size:13px;font-weight:600;gap:4px}.inspect-form select,.inspect-form input,.toolbar input,.toolbar button{padding:6px 8px;font-size:14px;border:1px solid #9aa9b2;border-radius:4px;background:#fff}.toolbar button{background:#075b75;color:#fff;border-color:#075b75;cursor:pointer;font-weight:600}@media(max-width:600px){header,main{padding:14px}article{padding:14px}dl,.inspect-form{display:block}dt{font-weight:700}}</style>
<header><h1>${escape(p.title)} · 페이지별 디자인 검수</h1>${p.designDirection ? `<p><strong>기획 콘셉트:</strong> ${escape(p.designDirection.concept)}</p><p><strong>시각 표현:</strong> ${escape(p.designDirection.visualThesis)}</p>` : ""}<p>자동 관찰과 실제 읽힘 판단을 구분합니다. 이 화면 생성은 검수 완료나 최종 승인이 아닙니다.</p><p>그림을 누르면 원본 PNG를 엽니다. 제목 → 핵심 관계 → 제한 조건 순서로 읽고, 입력 초안에 실제 관찰을 기록하세요.</p><nav><a href="proposal.pdf">전체 PDF</a><a href="design-review.json">디자인 진단</a><a href="inspection-template.json" download>검수 입력 초안</a>${pages.map((p) => `<a href="#page-${p.page}">${p.page}장</a>`).join("")}</nav><div class="toolbar"><label><input type="checkbox" id="toggle-overlay"> SVG 영역·글자크기 오버레이</label>${hasDiff ? `<label><input type="checkbox" id="toggle-changed"> 변경된 슬라이드만 보기</label>` : ""}<label>검수자: <input type="text" id="inspector-name" placeholder="검수자 이름"></label><button type="button" id="btn-export-record">검수 기록 JSON 다운로드</button></div></header><main>
${pages
  .map((page) => {
    const preview = template.pages.find((p) => p.slideId === page.slideId)!;
    const slideElements = elements.filter((e) => e.slideId === page.slideId);
    const diff = diffMap[page.slideId];
    const badge = diff
      ? diff.changed
        ? `<span class="badge badge-changed">CHANGED</span>`
        : `<span class="badge badge-same">UNCHANGED</span>`
      : "";
    const svgMarks = slideElements
      .map((e) => {
        const isZone = !!e.compositionPart;
        const isSmall =
          e.kind === "text" &&
          e.y >= 1.1 &&
          e.y + e.h <= 6.6 &&
          e.fontSize &&
          e.fontSize < 16;
        const stroke = isSmall ? "#d97706" : isZone ? "#075b75" : "#64748b";
        const dash = isZone ? 'stroke-dasharray="0.08 0.05"' : "";
        return `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="none" stroke="${stroke}" stroke-width="${isSmall || isZone ? 0.03 : 0.015}" ${dash}/>`;
      })
      .join("");
    return `<article id="page-${page.page}" data-slide-id="${escape(page.slideId)}" data-changed="${diff ? String(diff.changed) : "true"}"><h2>${page.page}. ${escape(page.title)} ${badge}</h2>${preview.preview ? `<div class="slide-stage"><a href="${escape(preview.preview)}"><img loading="lazy" src="${escape(preview.preview)}" alt="${escape(page.title)} 전체 장표. 아래에 독자 과제와 읽는 방법 제공"></a><svg class="overlay-svg" viewBox="0 0 13.333333 7.5" preserveAspectRatio="none">${svgMarks}</svg></div>` : `<p>PNG 미생성 — 읽힘 검수 불가</p>`}<dl><dt>독자 과제</dt><dd>${escape(page.readerTask || "기존 입력에 설명 계약 없음 — 검토자가 확인")}</dd><dt>읽는 방법</dt><dd>${escape(page.howToRead || "검토자가 기록")}</dd><dt>근거 한계</dt><dd>${escape(page.notProven || "검토자가 확인")}</dd><dt>시각 구성</dt><dd>${escape(page.layout)} / ${escape(page.visualKind || "legacy")}</dd>${page.compositionBrief ? `<dt>구성 의도</dt><dd>${escape(page.compositionBrief.rationale)}</dd><dt>시선 흐름</dt><dd>${escape(page.compositionBrief.readingPath)}</dd><dt>앞뒤 연결</dt><dd>${escape(page.compositionBrief.continuity)}</dd>${page.compositionBrief.narrative ? `<dt>판단 변화</dt><dd>${escape(page.compositionBrief.narrative.beliefShift)}</dd><dt>다음 질문</dt><dd>${escape(page.compositionBrief.narrative.nextQuestion)}</dd>` : ""}${(page.compositionBrief.referenceApplications || []).map((r) => `<dt>참고 원리</dt><dd>${escape(r.sourceId)} · ${escape(r.locator)} · ${escape(r.principle)}</dd><dt>실제 변환</dt><dd>${escape(r.application)} (${escape(r.controls.join(", "))})</dd>`).join("")}` : ""}</dl><p class="limit">직접 확인: 핵심 관계의 즉시 이해 · 중요한 글자의 크기 · 장면 크롭 · 화살표의 실제 대상/방향 · 색 외의 상태 표기 · 출처/가정 · PowerPoint 읽기 순서/대체 텍스트</p><ul>${page.findings.map((f) => `<li>${escape(f.message)}${f.elementIds.length ? ` (${escape(f.elementIds.join(", "))})` : ""}</li>`).join("") || "<li>자동 진단에서 추가 관찰 없음. 전문 디자인 판단은 별도 기록 필요</li>"}</ul><div class="inspect-form"><label>판정 (Decision)<select data-field="decision" data-slide="${escape(page.slideId)}"><option value="pending">pending (미검수)</option><option value="retained">retained (유지)</option><option value="revised">revised (수정 반영)</option><option value="deferred">deferred (보류)</option></select></label><label>관찰 소견 (Finding)<input type="text" data-field="finding" data-slide="${escape(page.slideId)}" placeholder="실제 페이지에서 확인한 읽힘·구도 소견"></label><label>근거 및 미확인 사항 (Evidence / Unknown)<input type="text" data-field="evidenceOrUnknown" data-slide="${escape(page.slideId)}" placeholder="확보된 근거 또는 남은 현장 확인 조건"></label></div></article>`;
  })
  .join("\n")}</main><script type="module">
const template = ${safeJSON(template)};
const overlayToggle = document.getElementById("toggle-overlay");
if (overlayToggle) overlayToggle.addEventListener("change", (e) => document.body.classList.toggle("show-overlay", e.target.checked));
const changedToggle = document.getElementById("toggle-changed");
if (changedToggle) changedToggle.addEventListener("change", (e) => document.body.classList.toggle("only-changed", e.target.checked));
const exportBtn = document.getElementById("btn-export-record");
if (exportBtn) exportBtn.addEventListener("click", () => {
  const inspector = (document.getElementById("inspector-name")?.value || "").trim();
  const now = new Date().toISOString();
  const record = structuredClone(template);
  record.finalApproval = false;
  for (const page of record.pages) {
    const sel = document.querySelector('select[data-field="decision"][data-slide="' + page.slideId + '"]');
    const fnd = document.querySelector('input[data-field="finding"][data-slide="' + page.slideId + '"]');
    const evd = document.querySelector('input[data-field="evidenceOrUnknown"][data-slide="' + page.slideId + '"]');
    if (sel) page.decision = sel.value;
    if (fnd) page.finding = fnd.value.trim();
    if (evd) page.evidenceOrUnknown = evd.value.trim();
    page.inspectedBy = inspector;
    page.inspectedAt = now;
  }
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "inspection-record.json";
  a.click();
});
</script></html>`;
}

export async function writeDesignReview(out: string, input?: unknown) {
  const p = Project.parse(await readJSON(path.join(out, "config.json")));
  const elements: Element[] = await readJSON(path.join(out, "elements.json"));
  const template = await inspectionTemplate(out, p);
  const pages = designDiagnostics(p, elements);
  const diffMap = await detectRunDiff(out, template);
  // A repeat never overwrites authored records or promotes pending pages.
  await json(path.join(out, "design-review.json"), {
    finalApproval: false,
    method: "advisory metadata observations; readable-page review required",
    pages,
    designDirection: p.designDirection ?? null,
    diff: diffMap,
  });
  await json(
    path.join(out, "art-direction.json"),
    directionDossier(p, elements),
  );
  await fs.writeFile(
    path.join(out, "design-storyboard.md"),
    directionMarkdown(p),
  );
  await json(path.join(out, "inspection-template.json"), template);
  await fs.writeFile(
    path.join(out, "design-review.html"),
    reviewHTML(p, pages, template, elements, diffMap),
  );
  const saved = await readJSON(path.join(out, "inspection-record.json")).catch(
    (e: NodeJS.ErrnoException) => {
      if (e.code === "ENOENT") return undefined;
      throw e;
    },
  );
  // Refresh saved status even if a replacement is rejected after files changed.
  await json(
    path.join(out, "inspection-status.json"),
    validateInspection(saved ?? template, template),
  );
  const status = validateInspection(input ?? saved ?? template, template);
  if (input !== undefined) {
    if (status.issues.length)
      throw Error(`Inspection rejected: ${status.issues.join(", ")}`);
    await json(
      path.join(out, "inspection-record.json"),
      Inspection.parse(input),
    );
  }
  await json(path.join(out, "inspection-status.json"), status);
  return { out, report: path.join(out, "design-review.html"), ...status };
}
