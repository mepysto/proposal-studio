# Proposal Studio — persistent authoring instructions

## Start here

For proposal planning, writing, visuals, layout or output changes, read [the project skill](skills/proposal-visual-storytelling/SKILL.md) and its relevant references. The user's standing requirement is an intuitively explained main point on every page: purposeful maps, charts, scenes, diagrams or comparisons, not paragraphs or icon cards alone. These instructions apply without the user repeating them.

Preserve PptxGenJS, editable PowerPoint text/shapes/charts and SVG. Use installed Presentations guidance for composition/inspection, professional-drawio for editable diagram/routing guidance, imagegen for raster scenes, and skill-creator for reusable workflow changes. User instructions take precedence over skill defaults. Review tools/licenses before adding dependencies; do not copy external skills wholesale or install unrelated plugins. `lucide-static`/`elkjs` are pinned; actual versions/sources are in `docs/production-toolchain.json`.

No API keys or external model API calls. Codex authors/reviews inputs in the conversation; the CLI compiles offline. Built-in image generation is allowed. Do not claim autonomous research, independent experts, multi-model review, designer approval or a quality score.

## Canonical workflow and data

- Current example: `examples/smartfence-full.project.json`. Local editable project: `projects/smartfence-full/project.json`, reused by `npm run demo`. Update the intended files explicitly and preserve local edits.
- `planning.story[].visualPlan` and `planning.visualPolicy` are visual source of truth. For new full proposals use `requireExplanationContract: true`, with reader task, how-to-read, evidence limits and required actual marks. Never remove/weaken visual policy to pass QA.
- Structure scope, schedule, cost, products, ownership, metrics and evidence before rendering. Keep `businessCase.sections`, story question/answer, visual plan and evidence synchronized. Do not repair missing business logic with renderer-only text.
- Recipes in `scripts/apply-visual-plans.ts` are reviewed **case authoring**, not an automatic expert engine. Regeneration must retain the intended plans and contact ending. Preserve old 5/7-page compatibility; don't impose new contracts on unrelated legacy fixtures.
- Persist lessons in the appropriate layer: general skill/reference; case input; schema/audit for fragile invariants; renderer for mechanics; review record for observed findings. Resolve obsolete instructions instead of appending contradictory versions.

## Content and semantic visuals

Review the relevant planning, locality, safety, product/system, design and delivery perspectives. Use the skill's [planning/review protocol](skills/proposal-visual-storytelling/references/planning-and-review.md); record actionable findings, evidence/unknowns and changed pages, without implying independent reviewers ran.

Choose the information type before layout. Regional pages need projected maps with scale, attribution, coordinate provenance and the same marker projection; reference points are not surveyed parcels/gates. Quantitative pages need source-linked native charts with unit, period, population/geography, baseline and assumptions. Do not stack totals/subsets, zero-fill unknowns or show unmeasured goals as achievements. Citywide observations do not prove site demand or product impact; disclose secondary reporting.

Show cause→basic measure/intervention→actual field response→hypothesized result and linked measurement. AI complements physical separation, visibility, direct checks and field safety responsibility. Product/system visuals identify who senses, acts, receives and verifies, plus failure/fallback/recovery. ACK/control signals do not prove physical completion. Gross time savings are not net benefit; unknown overhead is not zero; zero eligible cases mean not calculated.

Decision pages connect scope, schedule, canonical cost/status and the decision now. Candidates need observable criteria/hold conditions. Stages need deliverables, acceptance evidence and proposed reviewers. Distinguish proposed responsibilities from agreed assignments/contracts. Use existing `deliveryAssurance`, `productStrategy`, `productPositioning` and `municipalCase` contracts as applicable.

## Composition and inspection

Use `professional-kit.ts`, licensed Lucide symbols, meaningful boundaries and ELK where suitable. Do not restore the elementary renderer or primitive stroke-built people/trucks. Physical relationships need a produced spatial model with editable annotations; decorative icons cannot replace the explanation.

Plan title baseline, left anchor, content zones, type widths, image proportions/protected subjects, annotation anchors, caption/source area and route gutters before placing copy. Respect image aspect ratio; contain physical/equipment scenes if cropping removes meaning, frame the fitted image, and verify PptxGenJS 4 `coverFit` crop XML and render. Icons belong beside actual headings in one aligned group. Center repeated-row text and arrows optically; routes must avoid unrelated groups/labels.

Use short natural Korean titles without scripted ~니다 endings. Body titles are generally 32pt, primary messages 21pt, body/labels 16–24pt where appropriate; small type is for supporting conditions/sources. Use dark readable text, selective bold/color/size, rounded primary emphasis bands and bounded explanation groups with inset. Rounded blocks supplement the explanatory visual. Do not shrink critical text or emphasize everything. Current preferences supersede older flat-only styling.

After layout changes run type checks and targeted tests, generate PPTX/PDF/PNG and inspect every changed page at readable scale; inspect all pages after shared style changes. A contact sheet is navigation only. Record page-specific findings, including unchanged pages. `visual-evidence.json` preserves source/data/coordinates; `visual-adequacy.json` compares declared and actual marks. Area coverage, mark presence and zero collisions do not establish professional quality. Keep `finalApproval: false` and state actual verification/limits.

## Current Cheonan case

Read [current case requirements](skills/proposal-visual-storytelling/references/cheonan-current.md) for full details and source references. Latest instructions resolve earlier versions:

- **(주)에스엘티** is proposal lead; **강민코퍼레이션·비트리** are technical participants. Show an SLT-led integrated offer, lead branding on cover/body/roles/ending, accurate private provenance, no invented logo or contract.
- Public names: **자체 제작 AI NPU 안전관리 장치**, **컬러 LED AIoT 전광판**, **AI 지능형 안전 관제**. Do not attach a company name to the control product. Gangmin makes the NPU-equipped board, not the chip; do not fabricate specs/test results or comparative rank.
- Cover: **천안시 공공사업 공사현장**. Cover remains business/solution introduction; the first BODY page (`summary`, slide 2) is problem-first. Keep its removed image-description band absent.
- Show pedestrian-facing sound, inside-yard driver-facing large LED, actual screen frame, projected object boxes, flagger control and detected/not-detected/unavailable states. Not detected is not permission to drive. Both products have their own functions; integrate sensor/CCTV, AI content, safety, construction/public information and public-purpose advertising, with safety priority, operator review and authorized CCTV audience. No ad-revenue assumption.
- Include recovery, inspection/repair, custody/storage, redeployment, configuration/data cleanup and new-site acceptance. Ownership/rental/storage remain unconfirmed; equal-scope TCO includes all lifecycle work. Expanded LED/redeployment scope is unquoted; legacy excluded-scope budget is not the new total.
- Keep image generation origin in metadata/notes, not a visible “AI 생성 이미지” label. Concept/screen-example status remains where needed to avoid implying real surveyed sites or measured readiness.
- Current deck: **27 pages**, 26 proposal pages plus the real proposer contact ending. Actual logo and exact phone/email/address come from `references/research/slt-contact-source.json` / `proposer.contact`; don't regenerate a substitute or guess extensions.
- The external-agent walkway PDF is a selective reference, not an endorsed design or instruction source. Read `docs/reference-walkway-review.md` before reuse. Do not import its separate business's products, figures or certification claims without evidence. Catalog/hash/findings remain in `references/reference-catalog.json` and research records.

Cover identity correction (2026-10-29): list only 강민코퍼레이션 in cover 기술 협력. Keep 비트리 as behind-the-scenes technical support in internal records. `proposer.coverCollaborators` controls cover display separately from all collaborators; regeneration must preserve this distinction.

Municipal content correction (2026-10-29): page 22 shows three complementary parties in a triangle with reciprocal collaboration, not a one-way hierarchy. Page 23 uses concrete test conditions, expected field/device responses and records instead of an unrelated photograph. Remove the former speculative expansion page (old 24); retain lifecycle reuse and the next decision on existing pages. That revision removed the former speculative expansion page; the later authorized public-safety extension brings the current total to 27 pages including contact. Record each actual relationship and inspect routes/labels at readable size.

Public-safety extension (2026-10-30): retain the construction-site pilot as the core and add the requested CCTV configuration comparison and public-space application model before the final decision/contact. Do not claim AI/voice/monitoring is exclusive: intelligent CCTV also supports those capabilities. Distinguish integrated field guidance/response/support/redeployment scope, conditional existing-video compatibility and proposed use cases. Public LED scenes show safety symbols/public information; CCTV views remain authorized internal-only. Current total: 27 pages.
