# Design direction and inspection workspace

Read when advancing the production system or choosing/reviewing a deck's visual direction. Preserve the project's editable PptxGenJS output. This is author guidance, not an autonomous designer or approval system.

## Design decisions before rendering

Define the reader's decision and the visible relationship first. Select a useful composition: a field scene with anchored annotations, a source-backed comparison, a geographic overview/detail pair, actor lanes, a real timeline, or a state/recovery path. Choose the structure that explains the information; do not rotate templates for novelty.

For a sequence of pages, distinguish orientation, explanation, evidence and decision. Move from geographic overview to site detail only when detail changes the decision. Reuse the same comparison axes and actor positions when continuity helps understanding. Three repeated compositions can be appropriate for comparing sites; repeated noun cards that conceal different causal relationships should be redesigned.

Set a dominant visual, the viewer's entry point, the next eye movement and the evidence boundary. A primary message should identify the visible relationship, not repeat every label. Use a restrained emphasis hierarchy. If the explanation needs small type, first move supporting detail to the dossier, shorten copy, or allocate another content zone. Preserve material limitations and sources.

For physical scenes, protect the actual audience/equipment/visibility relationship during image fitting. For routes, inspect source, target, direction and intervening labels. For screenshots, distinguish observed state, example values and control intent. Use matching terms, units and state labels across pages.

## Offline workspace

New build/export runs emit `design-review.html`, `design-review.json`, `inspection-template.json` and `inspection-status.json`. Existing runs can be upgraded without rerendering:

```bash
npm run studio -- design-review --project smartfence-full
npm run studio -- design-review --project smartfence-full --slide operation
```

Open the returned HTML from its run directory, keeping the adjacent `preview/` files. It shows each full page, authored explanation contract and advisory findings. Click the image to read the original PNG. The HTML is private production material; do not insert it into buyer slides.

The small-text diagnostic considers the explanation zone (y >= 1.1, bottom <= 6.6 inches) and flags text below 16pt. It cannot tell whether a label is a critical action or a supporting condition. The repeated-composition diagnostic compares layout and visual kind across three consecutive pages. Neither diagnostic is a quality score or a reason to change a sound visual automatically. No finding does not mean good design.

## Record actual observations

Copy `inspection-template.json` to a separate authored record. For every page, preserve page/id/path/hashes and fill:

- `decision`: `retained`, `revised` or `deferred`.
- `finding`: concrete observation and disposition, including unchanged pages.
- `evidenceOrUnknown`: supporting output detail or material uncertainty.
- `inspectedBy`: actual author/reviewer identity or role; never invent an expert.
- `inspectedAt`: actual ISO 8601 time including timezone.

After a repair, rerender and use the new run's template. Do not reuse an old PNG hash. A `revised` entry describes the inspected final revision; it is not a promise of a future edit. Shared style/route helper changes require reading all affected pages.

```bash
npm run studio -- design-review --project smartfence-full --record /absolute/path/inspection.json
npm run studio -- export --project smartfence-full
```

The importer rejects missing/duplicate pages, missing observations, pending entries and stale config/PPTX/PDF/PNG hashes. Repeated generation preserves the authored record. This verifies record completeness and artifact binding, not that somebody truly read the page or that the judgment is right. Deferred pages remain explicitly deferred. Export remains available after automated QA for compatibility and carries the separate inspection status. `finalApproval` always remains false. Do not claim a historical markdown review has been imported or reread unless it actually has.

## Accessibility and delivery boundaries

Use state words, symbols or patterns alongside color. Test actual adjacent foreground/background colors, including emphasis runs and image overlays. W3C's contrast guidance uses 4.5:1 for normal text and 3:1 for large text (18pt regular or 14pt bold); this is a useful design reference, not evidence that this PPTX/PDF is WCAG compliant. Current element metadata does not establish every composited background, so do not calculate a misleading deck-wide contrast pass.

Check reading order, meaningful image descriptions and decorative objects in PowerPoint's Accessibility Checker/Reading Order pane when available. Editable text and zero overlaps do not prove accessible reading order, tagged PDF structure or screen-reader usability. Record that limitation if those checks were not performed.

Primary references, checked 2026-10-29:

- [W3C: Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Microsoft: Make PowerPoint presentations accessible](https://support.microsoft.com/en-us/accessibility/powerpoint/make-your-powerpoint-presentations-accessible-to-people-with-disabilities)
- [Microsoft: Reading Order pane](https://support.microsoft.com/en-us/powerpoint/make-slides-easier-to-read-by-using-the-reading-order-pane)

## Capability selection

Keep composition/inspection in installed Presentations, editable diagram routing in professional-drawio, raster scenes in built-in imagegen and workflow maintenance in skill-creator. Use connected Figma for an explicitly requested editable design exploration, or Drive for requested native document collaboration. These are optional authoring tools; the offline CLI must not depend on them. Do not send proposal assets to an external service merely to evaluate a plugin.

Add a plugin only for a concrete missing capability after checking installation/connection state, output editability, upload scope and account/credit requirements. Do not add a second general design generator to compensate for an unreviewed visual brief. Review source/version/license before adding a code dependency. Never copy an external skill wholesale.
