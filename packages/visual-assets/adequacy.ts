import type { ProjectData } from "../core/schema.js";
import type { Element } from "../pptx-renderer/index.js";

/** Checks observable marks, never assigns a design score or human approval. */
export function visualAdequacy(p: ProjectData, elements: Element[]) {
  const pages = p.slides.map((s, index) => {
    const v = s.reasoning?.visualPlan,
      e = elements.filter((m) => m.slideId === s.id);
    const expectedScenes =
      v?.kind === "public-value"
        ? (p.businessCase?.municipalCase?.benefitScenes || []).map(
            (a) => a.path,
          )
        : [v?.scene?.path || s.image?.path].filter(
            (path): path is string => !!path,
          );
    const observed = {
      scene:
        expectedScenes.length > 0 &&
        expectedScenes.every((path) =>
          e.some(
            (m) =>
              m.kind === "image" &&
              !m.geographicAssetId &&
              m.image?.path === path &&
              m.w * m.h >= 1,
          ),
        ),
      map:
        !!v?.map &&
        e.some(
          (m) => m.kind === "image" && m.geographicAssetId === v.map!.assetId,
        ),
      chart:
        !!v?.chart &&
        e.some((m) => m.kind === "chart" && m.dataRef === v.chart!.datasetId),
      connectors: e.filter((m) => m.semanticConnector).length >= 1,
      comparison:
        new Set(e.map((m) => m.comparisonCriterion).filter(Boolean)).size >= 2,
      screen:
        e.some((m) => m.displayObjectId) &&
        e.some((m) => m.fieldSafetyIndicator),
      timeline:
        (v?.schedule?.ranges.length || 0) > 0 &&
        v!.schedule!.ranges.every((r) =>
          e.some(
            (m) =>
              m.timelineRange?.nodeId === r.nodeId &&
              m.timelineRange.start === r.start &&
              m.timelineRange.length === r.length,
          ),
        ),
      brand: e.some(
        (m) =>
          m.kind === "image" && m.image?.path === p.proposer?.contact?.logoPath,
      ),
    };
    const required = v?.explanation?.requiredMarks || [];
    return {
      page: index + 1,
      slideId: s.id,
      title: s.title,
      readerTask: v?.explanation?.readerTask || null,
      howToRead: v?.explanation?.howToRead || null,
      notProven: v?.explanation?.notProven || null,
      required,
      observed,
      missing: required.filter((k) => !observed[k]),
      inspectionStatus: "readable-page-inspection-required" as const,
    };
  });
  return {
    method:
      "deterministic presence of planned explanatory marks; not semantic or professional design approval",
    finalApproval: false,
    pages,
  };
}
