# Production requirements

## Editable construction

Retain PptxGenJS native text, shapes and charts; use SVG where appropriate. Use the pinned licensed Lucide family and ELK for declared graph relationships. Read `~/.codex/skills/professional-drawio/SKILL.md` when producing editable diagram sources; use its anchor, grid and routing guidance. Do not imply all PPTX shapes were produced by Draw.io. Avoid primitive people/vehicle/camera drawings made of a few strokes. Use purposeful spatial scenes for physical situations and functional symbols for small labels.

Use built-in imagegen for requested raster scenes without API keys. Inspect generated content before reuse, store prompt/origin/rights/purpose in asset records, and author authoritative labels as editable text. No visible “AI 생성 이미지” banner is required; preserve origin in metadata/notes. A short concept/screen-example disclosure remains necessary where the picture might imply surveyed conditions or verified readiness. Use a distinct scene asset for each explanatory page, including video panes in reconstructed interfaces. Similar cases need a newly produced angle, composition or field detail; do not repeat the same image or merely recrop it for another page. Real supplied logos may recur. Keep earlier assets and provenance in revision history.

## Layout before copy placement

Plan title baseline, left anchor, content zones, widths, fit, protected subjects, annotation anchors, captions and source area before finalizing text. Keep important type large; use bold/color/size selectively and rounded emphasis bands with adequate inset. Bound related explanation groups with purposeful backgrounds/borders. Do not let those panels substitute for a visual explanation. Use dark supporting text and preserve light-on-dark contrast.

Use `professionalKit.iconLabel` to keep the functional icon and heading in one alignment group. Center repeated-row text vertically and align arrows to the same center. Check actual glyph positions, not just bounding boxes. Short Korean titles should be natural subject phrases or supported messages, without mechanical ~니다 endings. Keep generous line spacing and avoid shrinking the main message to fit dense tables.

Connectors must use the final visible source/target bounds, not a title baseline or an unrelated fixed y coordinate. For adjacent boxes use facing edge ports at their vertical/horizontal centers (`connector-anchors.ts`); keep a dedicated empty gutter wide enough for a readable shaft and arrowhead. Text-only sequence cells need explicit bounds or clearly defined ports before routing. Rounded corners are not ports. Keep the head at the receiving boundary and the tail at the sending boundary; do not leave floating gaps or put the head inside text. Reverse/return paths must preserve their declared direction. Parallel send/return lines use separate ports within the same component and a consistent separation. Fan-in safety paths attach each source to a bus and terminate once on the receiving boundary.

After positioning text, inspect every arrow in the rendered slide at readable scale: identify its source, target, direction, edge attachment, optical center and clearance from all labels. Record defects and repairs per page. Geometry and mark-presence checks cannot approve routing. Re-render after connector repairs; inspect every page touched by a common connector helper. Test bidirectional/vertical port calculations when changing shared geometry. Avoid manual arrow nudges that leave the authored node bounds and renderer out of sync.

Arrow direction must encode an actual data, notification, acknowledgement, physical action or observed-result relationship. A product inventory ordered left-to-right is not a control flow: distinguish outbound commands from independently observed feedback and the field actor’s response. State paths should show the known end-of-risk exit and protective stop; label a representative sequence when it is not an exhaustive transition model. An ACK does not prove physical completion. Functional membership and comparison may use undirected links instead of invented control arrows. Routes must avoid unrelated groups and labels.

## Images and maps

Preserve source aspect ratio. Prefer contain for spatial/equipment images if cropping removes meaning; frame the actual fitted image. Use `coverFit` for PptxGenJS 4 crops: scaled source dimensions are the outer image w/h, destination dimensions are sizing.w/h. Verify crop XML and actual render. Never squeeze an image to fit a frame.

Maps need projection, bounds, scale, attribution and coordinate provenance. Project editable markers with the same transform as the base. Keep downloaded geometry and reproducible cartography in `references/research` and `scripts/build-geographic-assets.ts`; compilation stays offline. A conceptual arrow between candidate regions is not a surveyed road/transport route.

For software sales pages, show the source-backed interface and populated information that explains the buyer's decision: site status, current observation with timestamp, alert, responsible actor, action or result. A rectangle containing module names is not a dashboard. “What to check” instructions belong in a user manual; proposal titles should state the capability and its practical use. Pair the screen with a concrete buyer scenario rather than a second list of features.

Prefer supplied captures; check relative image links before claiming a document contains usable screenshots. If files are unavailable, reconstruct the documented interface with editable elements and clearly label it as a reconstruction with illustrative sites/data. Store example values, source claims and the buyer decision in `visualPlan.interfaceExample`; do not invent live status, map locations, performance curves, software functions or operational evidence. A generated field scene within a reconstructed video pane must be labeled as a concept, not a captured CCTV frame. Preserve source aspect ratios and distinguish stale/unknown data from normal conditions. Use timestamps and state text in addition to colors. Show forecast vs current observation and requested control vs physical feedback separately.

For hardware screen examples, show the hardware frame, source-proportioned imagery, actual functional states and actionable field control. Project recognition boxes through the same source-image transform. Static PPTX/PDF must contain the complete explanation; remove playback/reset controls, disabled stages and empty placeholders.

## Identity and output

Resolve proposer legal identity, lead role and technology collaborators from evidence before writing. Show the lead on the cover, role narrative, body branding and ending. Do not invent a logo, certification, contact or signed partnership. Extract supplied logos faithfully; compare PDF contact numbers to rendered originals when text encoding is unreliable.

Use `technical-editorial-v2` and the professional renderer. After shared typography/shape changes, inspect every page at readable size. Export editable PPTX, PDF, all PNG pages, `visual-evidence.json`, `visual-adequacy.json` and a real review record. Keep original inputs and run history; describe what was actually checked and what remains unknown.
