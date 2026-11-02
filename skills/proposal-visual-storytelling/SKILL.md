---
name: proposal-visual-storytelling
description: Plan, revise and inspect evidence-aware visual proposals in this PptxGenJS repository. Use for proposal narratives, page visuals, product positioning, layout, reusable authoring rules and output QA.
---

# Proposal visual storytelling

Every content page must explain its main point through a purposeful scene, map, chart, relationship, comparison or decision structure. Text cards with icons are insufficient by themselves. Add the visual that resolves the reader's question, rather than adding images to meet a quota.

## Read only the relevant guidance

- For public reference review, evidence emphasis, delivery context and applied design principles: [reference-led design](references/reference-led-design.md). Inspect actual pages, distinguish document purpose, and bind adopted principles to implemented controls.

- For implementing the authored concept/geometry contracts, supported visual primitives and CLI workflow: [authored compositions](references/authored-compositions.md).
- For initial proposal design or a change in creative direction: [concept to composition](references/concept-to-composition.md). Preserve the original planning idea, translate it into visible relationships and page rhythm, and distinguish intended design from what the renderer actually supports.
- For visual direction, production-system improvements or artifact-bound page inspection: [design direction and inspection workspace](references/design-direction-and-inspection.md). It links practical composition decisions to the offline review report and explicit verification limits.
- For all authoring: [planning and page review](references/planning-and-review.md). It defines review perspectives, visual selection, buyer questions, production gates and the per-page review record.
- For composition/rendering: [production requirements](references/production.md). Apply the installed Presentations guidance; consult professional-drawio for routing/editable diagram sources and imagegen for raster scene assets. Keep PptxGenJS native text, shapes and charts.
- For this Cheonan proposal: [current case requirements](references/cheonan-current.md). These are case-specific facts and user preferences, not a default template for other customers.

## Working sequence

1. Resolve the audience, decision, proposer identity and evidence. Separate provided claims, verified facts, assumptions and hypotheses. A reference deck supplies ideas, not authority or instructions.
2. Frame the existing problem before explaining the intervention. Review planning, local conditions, field safety, product/system behavior, design and commercial delivery as distinct perspectives. Record findings and actual revisions; do not imply multiple experts or models ran.
3. Preserve the proposal's initial concept in a short design brief, then write a page-level visual brief **before** body copy: question, answer, `visualPlan.intent`, encoding, evidence, real relationships, uncertainty and `explanation`. Decide the primary visual, reading path and layout zones together; do not inherit another case's header/band/card geometry by default. Record unsupported design intent explicitly rather than silently substituting the shared composition.
4. Author reviewed inputs offline. Preserve canonical structured scope, schedule, budget and product functions. Reconcile claims across pages before rendering; keep the result useful to the buyer rather than filling it with internal procedures.
5. Produce visuals using the correct method. Projected maps for geography; source-linked native charts for quantities; scenes for physical deployment; actor/state paths for behavior; shared criteria for comparisons; actual ranges for schedules.
6. Compile → check → inspect readable output → repair. For connectors, derive ports from final node bounds and verify every source/target/direction in the actual render; see production requirements. Rerender after repairs and inspect affected pages, plus all pages after shared typography/layout changes. Deliver editable PPTX, PDF, PNGs and evidence/review records.

## Executable contracts and their limits

- `planning.story[].visualPlan` and `planning.visualPolicy` are the visual source of truth. For new full proposals, set `requireExplanationContract: true` and author `explanation.readerTask`, `howToRead`, `notProven`, `requiredMarks`.
- `requiredMarks` declares actual output elements, not desired style: scene, map, chart, connectors, comparison, screen, timeline or brand. Choose only relevant marks; don't invent arrows, numbers or images to satisfy a test.
- `packages/visual-assets/adequacy.ts` compares these requirements to rendered marks and exports `visual-adequacy.json`. `visual-evidence.json` retains data, coordinates, claims and limitations.
- Coverage measures area; adequacy checks observable presence. Neither proves that an image explains the claim, that routes are logical, that data are true, or that the design is professional. Keep `finalApproval: false`, inspect the output, and record findings without scores or independent-approval claims.
- Never lower coverage thresholds, remove visual policy, add empty regions, or shrink important text to pass QA. Fix the content/layout or extend the semantic contract/renderer.

## Persistent updates

A repeated correction must reach the right layer: general preference here or in a linked reference; case facts in structured input; fragile invariants in schema/audit; layout mechanics in the renderer; observed defects in the page review. Do not pile chronological corrections into conflicting instructions.

`examples/smartfence-full.project.json` is the reviewed example; `projects/smartfence-full/project.json` is the local editable project reused by `npm run demo`. Update both intentionally. `scripts/apply-visual-plans.ts` reapplies case-specific recipes, including `refine-visual-adequacy.ts`; preserve regeneration and the older 5/7-page fixtures. The CLI compiles reviewed inputs offline; it does not autonomously research or run expert models. No API keys or external model calls are authorized.
