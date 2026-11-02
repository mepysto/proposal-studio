import fs from "node:fs/promises";
/** Case-specific reviewed evidence. Runtime compiles it offline; no search or model API is implied. */
export async function enrichEvidenceVisuals(raw: any) {
  const maps = JSON.parse(
    await fs.readFile("examples/geographic-assets.json", "utf8"),
  );
  const { checkedAt: now } = JSON.parse(
    await fs.readFile(
      "references/research/visual-evidence-provenance.json",
      "utf8",
    ),
  );
  const sources = [
    {
      id: "G-OSM",
      title: "OpenStreetMap 지리자료 · 천안 원도심 도로·철도·수계",
      url: "https://www.openstreetmap.org/copyright",
      scope: "local",
      checkedAt: now,
      excerpt: "OSM 도로·철도·수계 geometry 3,391개와 Nominatim 참고 좌표",
      applicability:
        "EPSG:3857로 투영한 참고도. 행정 경계·사업 경계·공사 출입구 실사 아님. © OpenStreetMap contributors / ODbL.",
    },
    {
      id: "C-TRAFFIC-24",
      title: "대전일보 2025-02-26 · 2024년 천안시 교통사고 보도",
      url: "https://v.daum.net/v/20250226112656936",
      scope: "local",
      checkedAt: now,
      excerpt: "사망자 34명 · 보행 교통사고 사망자 17명",
      applicability:
        "천안시·TAAS 수치를 인용한 언론 2차자료. 원자료 직접 조회가 아니며 공사장·후보지별 사고 통계가 아님.",
    },
    {
      id: "C-TRAFFIC-25",
      title: "대전일보 2026-02-08 · 2025년 천안시 교통사고 보도",
      url: "https://v.daum.net/v/bJDjdnrNsK",
      scope: "local",
      checkedAt: now,
      excerpt: "사망자 27명 · 보행 교통사고 사망자 13명",
      applicability:
        "TAAS를 인용한 언론 2차자료. 전체와 보행자는 중첩 집계이며 더할 수 없음. SmartFence 성과·현장 수요의 직접 증거가 아님.",
    },
  ];
  const claims = [
    {
      id: "osm-geography",
      text: "OSM 도로·철도·수계 geometry와 Nominatim의 와촌동·봉명동 참고점 및 원성1동 행정복지센터 좌표를 참고 지도에 사용한다.",
      scope: "local",
      status: "externally-verified",
      sourceIds: ["G-OSM"],
      verifiedAt: now,
      evidenceKind: "document",
      approved: false,
    },
    {
      id: "reported-city-traffic",
      text: "대전일보의 연도별 보도는 천안시 전체 교통사고 사망자를 2024년 34명·2025년 27명, 보행자 사망자를 각각 17명·13명으로 제시한다. 언론에 보고된 시 전체 수치이며 현장 실증 결과가 아니다.",
      scope: "local",
      status: "externally-verified",
      sourceIds: ["C-TRAFFIC-24", "C-TRAFFIC-25"],
      verifiedAt: now,
      evidenceKind: "document",
      approved: false,
    },
  ];
  for (const s of sources)
    raw.sources = [...raw.sources.filter((r: any) => r.id !== s.id), s];
  for (const c of claims)
    raw.claims = [...raw.claims.filter((r: any) => r.id !== c.id), c];
  raw.geographicAssets = maps;
  raw.quantitativeDatasets = [
    {
      id: "cheonan-traffic-fatalities",
      title: "천안시 전체 교통사고 사망자 · 보도 수치",
      population:
        "천안시 전체 도로 교통사고 사망자; 후보 공사장·출입구로 한정하지 않음",
      unit: "명",
      status: "reported-observation",
      period: "2024·2025년 각각 연간",
      sourceClaimIds: ["reported-city-traffic"],
      limitation:
        "TAAS를 인용한 대전일보 2차자료. 전체·보행자는 중첩 집계. 공사장 사고·후보지 위험도·SmartFence 효과를 뜻하지 않음.",
      disjointSeries: false,
      rows: [
        { category: "2024년", series: "전체 사망자", value: 34 },
        { category: "2025년", series: "전체 사망자", value: 27 },
        { category: "2024년", series: "보행자 사망자", value: 17 },
        { category: "2025년", series: "보행자 사망자", value: 13 },
      ],
    },
  ];
  const markers = [
    {
      id: "A",
      label: "와촌동권 참고점",
      lon: 127.1443358,
      lat: 36.8092011,
      precision: "locality-reference",
      basis:
        "Nominatim relation/2515711 와촌동 대표 위치. 실제 사업 필지·출입구가 아님.",
      sourceClaimIds: ["osm-geography"],
    },
    {
      id: "B",
      label: "원성1동 행정복지센터",
      lon: 127.1630194,
      lat: 36.8118367,
      precision: "reference-poi",
      basis:
        "Nominatim way/815678957 시설 좌표. 오룡지구 주변 위치 설명용이며 사업 필지·출입구가 아님.",
      sourceClaimIds: ["osm-geography"],
    },
    {
      id: "C",
      label: "봉명동권 참고점",
      lon: 127.1373904,
      lat: 36.8065649,
      precision: "locality-reference",
      basis:
        "Nominatim relation/2508099 봉명동 대표 위치. 봉명동 39-1 필지·사업 경계가 아님.",
      sourceClaimIds: ["osm-geography"],
    },
  ];
  const beat = (id: string) => raw.planning.story.find((s: any) => s.id === id);
  for (const id of [
    "cheonan-context",
    "sites",
    "site-station",
    "site-oryong",
  ]) {
    const s = beat(id),
      v = s.visualPlan;
    v.kind = "geographic-map";
    v.intent = "geographic";
    v.map = {
      assetId:
        id === "site-station"
          ? "station-context"
          : id === "site-oryong"
            ? "oryong-context"
            : "cheonan-center",
      markers:
        id === "site-station"
          ? [markers[0]]
          : id === "site-oryong"
            ? [markers[1]]
            : markers,
    };
    v.encoding =
      "실제 OSM 도로·철도·수계 geometry를 EPSG:3857로 투영하고, 출처가 있는 참고 좌표를 고정해 표시";
    v.takeaway =
      id === "cheonan-context"
        ? "천안 원도심에서 역세권과 생활권의 상대 위치를 확인합니다"
        : id === "sites"
          ? "같은 지도 위에서 세 후보 권역의 조사 우선순위를 비교합니다"
          : id === "site-station"
            ? "와촌동권 지도로 주변 위치를 살피고 실제 출입구는 공동조사로 확정합니다"
            : "원성1동 행정복지센터를 참고해 오룡지구 주변 생활권을 살핍니다";
    v.legend =
      "좌표는 동·시설 참고점 · 사업 경계·필지·공사 출입구 위치가 아님 · © OpenStreetMap contributors";
    if (id === "sites")
      v.legend =
        "우선순위는 조사 제안 · 위험도 순위 아님 · 동·시설 참고점이며 사업 경계·출입구 아님 · © OpenStreetMap contributors";
    v.evidenceIds = [...new Set([...v.evidenceIds, "osm-geography"])];
    s.proofClaimIds = [...new Set([...s.proofClaimIds, "osm-geography"])];
  }
  raw.businessCase.metrics = raw.businessCase.metrics.filter(
    (m: any) => m.id !== "exposure",
  );
  raw.businessCase.metrics.push({
    id: "exposure",
    name: "교차 접점 노출 빈도",
    definition:
      "사전에 합의한 차량·보행자 동시 점유 조건에 해당하는 관찰 사례 빈도",
    formula: "유효 관찰 사례 수 ÷ 유효 관찰시간",
    unit: "건/시간",
    baseline: null,
    target: null,
    targetPolicy: "기준선 확보 후 현장 책임자와 수용기준 합의",
    measurement:
      "안전한 관찰만 수행. 반출입량·보행량·공정·시간대와 누락을 함께 기록하고 조건이 다른 전후 값을 인과 효과로 단정하지 않음.",
    owner: "현장 안전관리자·관찰 담당자",
    claimIds: ["separation", "public-boundary", "impact-hypothesis"],
    guardrail: true,
  });
  beat("kpis").visualPlan.legend =
    "기준선 미측정·목표 미설정 · 교차 노출 빈도·오탐·운영자 업무·시민 불편도 함께 관찰";
  const traffic = beat("policy-fit");
  traffic.title = "천안시의 보행안전 과제를 연간 사망자 지표로 확인합니다";
  traffic.question = "천안시의 전체 교통사고와 보행자 사망자는 어느 규모인가";
  traffic.answer =
    "2024·2025년 천안시의 연간 교통사고 사망자 수를 비교하고, 지역 전체 통계와 공사장 실증 효과를 구분합니다.";
  traffic.proofClaimIds = [
    ...new Set([...traffic.proofClaimIds, "reported-city-traffic"]),
  ];
  Object.assign(traffic.visualPlan, {
    kind: "data-chart",
    intent: "quantitative",
    chart: {
      datasetId: "cheonan-traffic-fatalities",
      type: "bar",
      orientation: "column",
      stacked: false,
    },
    takeaway:
      "전체와 보행자 사망자 수는 감소했지만, 보행안전은 계속 살펴야 할 지역 과제입니다",
    encoding:
      "연간 사망자 수를 0에서 시작하는 같은 명 단위의 그룹 막대 그래프로 비교",
    legend:
      "천안시 전체 · 2024/2025년 연간 · 대전일보 보도(TAAS 인용) · 전체와 보행자는 더하지 않음",
    evidenceIds: traffic.proofClaimIds,
  });
  const base = raw.planning.alternatives.find(
    (a: any) => a.priority === "baseline",
  ).id;
  const chains = [
    {
      id: "exposure",
      cause: "차량·보행 동선의 교차",
      intervention: "동선 분리·시야 확보",
      response: "유도원이 통행 관리",
      result: "접점 노출 완화 가설",
      mechanismIds: ["crossing"],
      interventionIds: ["confirm"],
      alternativeIds: [base],
      metricIds: ["exposure", "burden"],
      evidenceIds: ["separation", "public-boundary", "manual-authority"],
      resultStatus: "hypothesis",
    },
    {
      id: "awareness",
      cause: "울타리·차체로 늦은 인지",
      intervention: "접근 감지·담당자 경고",
      response: "전달·장치 실동작 확인",
      result: "인지 기회 확대 가설",
      mechanismIds: ["visibility", "response"],
      interventionIds: ["observe", "warn"],
      alternativeIds: [],
      metricIds: ["miss", "latency"],
      evidenceIds: ["blind-area", "observation-proposal", "warning-proposal"],
      resultStatus: "hypothesis",
    },
    {
      id: "response",
      cause: "경고 후 조치가 불명확",
      intervention: "담당자·시각·결과 기록",
      response: "누락 점검·후속 조치",
      result: "운영 일관성 개선 가설",
      mechanismIds: ["response"],
      interventionIds: ["confirm"],
      alternativeIds: [],
      metricIds: ["completion", "burden"],
      evidenceIds: ["response-chain", "manual-authority"],
      resultStatus: "hypothesis",
    },
  ];
  const benefitChains = [
    {
      ...chains[0],
      id: "citizen",
      cause: "시민과 공사 동선의 접점",
      intervention: "동선 분리·우회 안내",
      response: "유도원 안내·불편 확인",
      result: "통행 혼선 완화 가설",
    },
    {
      ...chains[2],
      id: "operator",
      cause: "경고 이후 조치 누락",
      intervention: "담당·조치 결과 기록",
      response: "누락 건 점검·보완",
      result: "조치 누락 완화 가설",
    },
    {
      ...chains[2],
      id: "administration",
      cause: "현장별 검증 자료 분산",
      intervention: "공통 기준의 운영 기록",
      response: "시험·조치 기록 종합",
      result: "후속 현장 판단 지원",
      metricIds: ["completion"],
      evidenceIds: ["response-chain", "readiness"],
    },
  ];
  for (const id of ["concept", "benefits"]) {
    const s = beat(id),
      v = s.visualPlan,
      pageChains = id === "benefits" ? benefitChains : chains;
    s.proofClaimIds = [
      ...new Set([
        ...s.proofClaimIds,
        ...pageChains.flatMap((c) => c.evidenceIds),
      ]),
    ];
    Object.assign(v, {
      kind: "causal-flow",
      intent: "causal",
      chains: pageChains,
      takeaway:
        id === "concept"
          ? "원인별로 기본 안전조치와 AI 보완 기능을 연결하고 실제 현장 대응을 확인합니다"
          : "시민·현장 운영자·행정의 기대 가치를 각각의 원인과 측정 항목에 연결합니다",
      encoding:
        "원인·솔루션·사람/시스템 대응·기대 결과를 같은 행에 배치하고 결과별 실제 측정 지표와 연결",
      legend:
        "원인→개입→현장 대응→기대 결과의 가설 · 사고 감소·성능 향상 실측 아님",
      evidenceIds: s.proofClaimIds,
    });
  }
  for (const s of raw.planning.story) {
    s.visualPlan.intent ||= ["budget", "time-scenario"].includes(s.sectionId)
      ? "quantitative"
      : s.id === "kpis"
        ? "structural"
        : ["rollout", "journey"].includes(s.id)
          ? "temporal"
          : ["problem", "scope"].includes(s.id)
            ? "spatial"
            : ["summary", "decision"].includes(s.id)
              ? "decision"
              : "structural";
    const ids = s.proofClaimIds.flatMap(
      (id: string) => raw.claims.find((c: any) => c.id === id)?.sourceIds || [],
    );
    if (s.id !== "cover")
      s.limitation = `출처: ${[...new Set(ids.filter((x: string) => x.startsWith("G-") || x.startsWith("C-TRAFFIC")))].join("·") || "제공 사업자료·관련 공개자료"} · 상세 출처는 검토 기록 참조`;
  }
}
