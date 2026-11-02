import type { ProjectData } from "../core/schema.js";
export function evidenceVisualAudit(p: ProjectData) {
  const issues: {
    severity: "error";
    code: string;
    message: string;
    path: string;
    returnTo: string;
  }[] = [];
  const add = (code: string, message: string, path: string) =>
    issues.push({
      severity: "error",
      code,
      message,
      path,
      returnTo: "evidence-visual-planning",
    });
  const claims = new Set(p.claims.map((c) => c.id));
  for (const d of p.quantitativeDatasets) {
    if (d.sourceClaimIds.some((id) => !claims.has(id)))
      add(
        "unknown-chart-evidence",
        "데이터의 출처 주장이 없습니다.",
        `datasets.${d.id}`,
      );
    const keys = d.rows.map((r) => r.category + "\0" + r.series);
    if (new Set(keys).size !== keys.length)
      add(
        "duplicate-chart-observation",
        "같은 범주·계열의 값이 중복됩니다.",
        `datasets.${d.id}`,
      );
    const cats = new Set(d.rows.map((r) => r.category)),
      series = new Set(d.rows.map((r) => r.series));
    if (d.rows.length !== cats.size * series.size)
      add(
        "incomplete-chart-series",
        "계열의 결측값을 0으로 그릴 수 없습니다.",
        `datasets.${d.id}`,
      );
  }
  for (const s of p.planning?.story || []) {
    const v = s.visualPlan;
    if (!v) continue;
    if (v.interfaceExample && v.interfaceExample.basisClaimIds.some(id => !claims.has(id) || !v.evidenceIds.includes(id)))
      add("unbound-interface-evidence", "재구성 화면의 기능 근거를 해당 페이지의 출처 주장과 연결하세요.", `story.${s.id}`);
    if (v.scene?.annotations) {
      const anchors = v.scene.annotations.map((a) => a.nodeId);
      if (
        new Set(anchors).size !== anchors.length ||
        anchors.some((id) => !v.nodes.some((n) => n.id === id))
      )
        add(
          "invalid-scene-annotation",
          "장면 주석을 해당 페이지의 실제 설명 노드와 연결하세요.",
          `story.${s.id}`,
        );
    }
    if (!v.intent && p.planning?.visualPolicy)
      add(
        "missing-visual-intent",
        "페이지의 정보 유형을 먼저 지정하세요.",
        `story.${s.id}`,
      );
    if (
      v.intent === "geographic" &&
      (!["geographic-map", "expansion-path"].includes(v.kind) || !v.map)
    )
      add(
        "geography-needs-map",
        "지역 위치는 좌표·투영·출처가 있는 지도로 설명하세요.",
        `story.${s.id}`,
      );
    if (v.map) {
      const m = p.geographicAssets.find((a) => a.id === v.map!.assetId);
      if (!m)
        add(
          "missing-geographic-asset",
          "지리 데이터 자산이 없습니다.",
          `story.${s.id}`,
        );
      else {
        if (!(m.bounds.west < m.bounds.east && m.bounds.south < m.bounds.north))
          add(
            "invalid-map-bounds",
            "지도 범위가 잘못됐습니다.",
            `maps.${m.id}`,
          );
        for (const pin of v.map.markers) {
          if (
            pin.lon < m.bounds.west ||
            pin.lon > m.bounds.east ||
            pin.lat < m.bounds.south ||
            pin.lat > m.bounds.north
          )
            add(
              "marker-outside-map",
              "참고 좌표가 지도 밖입니다.",
              `story.${s.id}`,
            );
          if (
            pin.precision === "surveyed-site" &&
            !pin.sourceClaimIds.some((id) =>
              p.claims.some(
                (c) => c.id === id && c.evidenceKind === "field-observation",
              ),
            )
          )
            add(
              "unproven-map-site",
              "참고 위치를 실사한 출입구로 표시할 수 없습니다.",
              `story.${s.id}`,
            );
          if (pin.sourceClaimIds.some((id) => !s.proofClaimIds.includes(id)))
            add(
              "unlinked-map-marker",
              "지도 위치를 장표 근거에 연결하세요.",
              `story.${s.id}`,
            );
        }
      }
    }
    if (
      v.intent === "quantitative" &&
      !v.chart &&
      !(
        ["existing", "time-balance"].includes(v.kind) &&
        ["budget", "time-scenario"].includes(s.sectionId || "")
      )
    )
      add(
        "numbers-need-chart",
        "수치 비교는 원자료에 연결된 그래프로 작성하세요.",
        `story.${s.id}`,
      );
    if (v.chart) {
      const d = p.quantitativeDatasets.find((d) => d.id === v.chart!.datasetId);
      if (!d)
        add(
          "missing-chart-dataset",
          "그래프에 연결된 데이터가 없습니다.",
          `story.${s.id}`,
        );
      else {
        if (v.chart.stacked && !d.disjointSeries)
          add(
            "overlapping-series-stack",
            "부분집합인 계열을 누적 그래프로 더할 수 없습니다.",
            `story.${s.id}`,
          );
        if (d.sourceClaimIds.some((id) => !s.proofClaimIds.includes(id)))
          add(
            "unlinked-chart-dataset",
            "그래프 근거와 장표 근거를 연결하세요.",
            `story.${s.id}`,
          );
      }
    }
    if (
      v.intent === "causal" &&
      (v.kind !== "causal-flow" || !v.chains?.length)
    )
      add(
        "solution-needs-causal-chain",
        "원인·개입·현장 대응·기대 결과·측정을 연결하세요.",
        `story.${s.id}`,
      );
    for (const c of v.chains || []) {
      const valid =
        c.mechanismIds.every((id) =>
          p.planning!.problem.mechanisms.some((m) => m.id === id),
        ) &&
        c.interventionIds.every((id) =>
          p.planning!.interventions.some((m) => m.id === id),
        ) &&
        c.alternativeIds.every((id) =>
          p.planning!.alternatives.some((m) => m.id === id),
        ) &&
        c.metricIds.every(
          (id) =>
            p.businessCase?.metrics.some((m) => m.id === id) ||
            (!p.businessCase && p.planning?.validation.some((m) => m.id === id)),
        );
      if (
        !valid ||
        !(c.interventionIds.length + c.alternativeIds.length) ||
        c.evidenceIds.some((id) => !s.proofClaimIds.includes(id))
      )
        add(
          "broken-causal-evidence",
          "원인·개입·결과 측정의 참조가 끊겼습니다.",
          `story.${s.id}.${c.id}`,
        );
    }
  }
  return issues;
}
