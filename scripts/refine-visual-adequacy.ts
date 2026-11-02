/** Reviewed case authoring, not an automatic expert or research engine. */
export function refineVisualAdequacy(raw: any) {
  const story = raw.planning.story,
    get = (id: string) => story.find((s: any) => s.id === id);
  raw.planning.visualPolicy.requireExplanationContract = true;
  const descriptors: Record<string, [string, string, string, string[]]> = {
    cover: [
      "통합 제안의 대상과 제안 주관을 식별",
      "현장 장면과 에스엘티 이름을 한 시선에서 읽기",
      "개념 장면은 설치·성능 증빙이 아님",
      ["scene"],
    ],
    summary: [
      "솔루션에 앞서 기존 출입구의 문제를 이해",
      "차량과 보행자 접점·가림·조치 공백을 장면과 대조",
      "실제 천안 현장 관찰이나 사고 재현이 아님",
      ["scene"],
    ],
    "cheonan-context": [
      "두 제품과 통합 운영의 공급 범위를 판단",
      "독립된 두 제품의 더하기와 관제 연결, 하단 규모·일정 확인",
      "실제 설치 범위와 견적은 현장 조사 후 확정",
      [],
    ],
    "policy-fit": [
      "천안시 지표와 현장 조사 필요를 구분",
      "동일 연도 전체와 부분을 비누적 막대로 비교",
      "도시 전체 수치는 공사장 사고나 제품 성과가 아님",
      ["chart"],
    ],
    problem: [
      "동선 교차와 가려진 시야의 공간적 원인 이해",
      "보도 이동과 출차 방향을 같은 장면의 화살표로 대조",
      "실측 출입구·거리·위험등급을 표시한 도면이 아님",
      ["scene", "connectors"],
    ],
    journey: [
      "차량·시민·현장의 서로 다른 반응을 구분",
      "배우별 행을 따라 접근에서 통제·결과 확인까지 읽기",
      "계획 시나리오이며 실제 관찰 결과가 아님",
      ["connectors"],
    ],
    sites: [
      "어느 권역부터 조사할지 판단",
      "실제 지도 A·B·C와 조사 우선순위 설명을 대조",
      "참고 좌표는 필지·출입구·위험 순위가 아님",
      ["map"],
    ],
    selection: [
      "실증 후보의 통과·보류 조건 판단",
      "네 조건을 차례로 확인하고 오른쪽 보류 조건과 대조",
      "검토 통과는 구매 승인이나 안전 보증이 아님",
      ["connectors"],
    ],
    "site-station": [
      "와촌동에서 확인할 현장 과제 이해",
      "실제 지도 참고점과 출입구·잔여 공정 조사 조건을 함께 보기",
      "동 대표점은 설치 장소나 확정 사업 경계가 아님",
      ["map"],
    ],
    "site-oryong": [
      "원성권 후보의 권한·동선 확인 과제 이해",
      "행정복지센터 참고점과 사업 관리·생활 동선 조건 대조",
      "공개 위치로 설치 권한이나 출입구를 확정하지 않음",
      ["map"],
    ],
    alternatives: [
      "다른 기능군과 통합 제안의 구매 이유 비교",
      "동일 기준 행에서 공개 기능과 에스엘티 통합 범위를 가로 비교",
      "동일 완제품 가격·성능 순위나 타사 기능 부재를 주장하지 않음",
      ["comparison"],
    ],
    scope: [
      "장치·전광판·관제의 서로 다른 자체 기능 이해",
      "운전자 LED 장면을 세 제품 기능 블록과 대조",
      "생산·연계 역량 설명이며 실측 사양이나 시험 성적이 아님",
      ["scene"],
    ],
    concept: [
      "원인이 현장 대응과 측정으로 이어지는지 판단",
      "각 행의 원인→개입→현장 대응→기대 결과·측정 읽기",
      "예상 효과이며 사고 감소 실적을 나타내지 않음",
      ["connectors"],
    ],
    architecture: [
      "운전자가 전광판에서 실제로 무엇을 확인할지 이해",
      "영상 객체 표시·출차 대기·유도원 통제와 세 상태 대조",
      "화면 예시이며 미검출은 통행 허가가 아님",
      ["scene", "screen"],
    ],
    integration: [
      "두 현장 제품과 통합 관제의 관계 이해",
      "영상·센서가 병렬 제품에 들어가 관제와 시 보고로 연결",
      "관제 신호는 물리적 통제 완료의 확인이 아님",
      ["connectors"],
    ],
    operation: [
      "장애 시 현장 통제와 기능 재개 조건 판단",
      "정상 흐름과 실패 감지·조치·담당·재시험 행을 대조",
      "협의 절차이며 현장 안전 책임은 유지",
      ["connectors"],
    ],
    design: [
      "보행자 알림의 대상·시점·전달 방식을 이해",
      "외부 스피커·보행자 장면과 음성 예시·현장 확인 조건 대조",
      "알림 도달·인지·소음은 현장에서 검수할 항목",
      ["scene"],
    ],
    rollout: [
      "기간과 산출물·검수의 대응을 확인",
      "월별 길이와 종료 마일스톤을 산출물·수용 증거와 대조",
      "착수 후 기획안이며 단계 종료는 집행 승인 아님",
      ["timeline"],
    ],
    organization: [
      "시민·현장·천안시에 남는 구매 가치를 판단",
      "세 장면에서 작동 방식→기대 가치로 내려 읽기",
      "미측정 기대효과로 절감액이나 사고 감소율 아님",
      ["scene", "connectors"],
    ],
    budget: [
      "장비 이외 운영·회수까지 포함한 공급 범위를 이해",
      "출입구 장면 아래 설비·운영·종료 범위와 견적 조건을 대조",
      "장비 수량·설치비·확장 총액은 미확정",
      ["scene"],
    ],
    benefits: [
      "장비를 옮겨 쓰는 과정과 새 현장 검수를 이해",
      "다섯 단계 이동과 재사용 설비·현장별 재설정을 분리해 읽기",
      "회수·보관 장소와 비용 절감은 확정하지 않음",
      ["connectors"],
    ],
    "time-scenario": [
      "시의 판단과 공급사 서비스·현장 책임을 구분",
      "주체별 업무 경계와 제안된 전달 관계·월간 보고 확인",
      "현재 협의안이며 업무 위임·계약을 의미하지 않음",
      ["connectors"],
    ],
    kpis: [
      "구매 판단 전에 무엇을 시연해야 하는지 이해",
      "같은 영상→알림·표출→현장 확인과 세 검증 항목 대조",
      "기준선·미탐·추가 업무는 측정 예정, 결과값 없음",
      ["scene", "connectors"],
    ],
    risks: [
      "후속 권역의 조건부 재투입 경로를 이해",
      "지도 A·B 참고 위치와 단계별 현장 재확인 조건을 대조",
      "지도는 운송 경로가 아니며 문성·성정 설치 수요는 미확정",
      ["map", "connectors"],
    ],
    decision: [
      "지금 협의할 범위와 다음 결정을 확인",
      "한 출입구 실증에서 공동 조사·구체화·다음 활용 판단으로 읽기",
      "즉시 계약이나 예산 집행을 요청하는 승인 절차 아님",
      [],
    ],
    contact: [
      "제안 주관과 문의 경로를 확인",
      "제공 원본 로고와 법인명·전화·이메일·주소를 확인",
      "제공 원본 기준이며 연락처 최신성 외부 검증 아님",
      ["brand"],
    ],
  };
  for (const s of story) {
    const [readerTask, howToRead, notProven, marks] = descriptors[s.id];
    s.visualPlan.explanation = {
      readerTask,
      howToRead,
      notProven,
      requiredMarks: marks.length ? marks : ["connectors"],
    };
  }
  raw.businessCase.municipalCase.expansion[2].label = "문성·성정 후속 사업";
  const map = get("sites").visualPlan.map;
  const expansion = get("risks");
  expansion.visualPlan.intent = "geographic";
  expansion.visualPlan.map = {
    assetId: map.assetId,
    markers: map.markers.slice(0, 2),
  };
  expansion.proofClaimIds = [
    ...new Set([...expansion.proofClaimIds, "osm-geography"]),
  ];
  expansion.visualPlan.evidenceIds = [
    ...new Set([...expansion.visualPlan.evidenceIds, "osm-geography"]),
  ];
  expansion.visualPlan.encoding =
    "투영 지도 A·B 참고점과 오른쪽 조건부 재투입 단계. 화살표는 판단 순서이며 운송 경로가 아님.";
  expansion.visualPlan.legend =
    "© OpenStreetMap contributors · 참고 위치, 출입구·운송 경로 아님 · 후속 사업·보관·재원·설치 수요 미확정";
  for (const [id, path, reuseReason] of [
    [
      "budget",
      "examples/assets/product-driver-led-v8.png",
      "제품 설명 장면을 공급 범위의 물리적 기준으로 재사용하며 별도 설치 수량을 암시하지 않음",
    ],
    [
      "kpis",
      "examples/assets/product-sidewalk-feed-v8.png",
      "전광판에 사용한 동일 보행 영상으로 인식·알림·현장 결과의 대조 검증을 설명",
    ],
  ])
    get(id).visualPlan.scene = {
      path,
      rights: "generated",
      caption: "제안 구성·시연 방식 예시",
      reuseReason,
    };
  get("selection").visualPlan.encoding =
    "네 조건의 순차 확인과 각 조건별 보류 분기, 미확인→추가 조사·모두 충족→제한 실증 검토";
}
