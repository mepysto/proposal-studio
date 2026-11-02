/** Assistant-authored editorial revision. All new procedures are proposals, not verified field arrangements. */
export function refineDecisionDesign(raw: any) {
  const beat = (id: string) => raw.planning.story.find((s: any) => s.id === id);
  const b = raw.businessCase;
  // User clarified: problem-first applies to the first BODY page, not the cover.
  const cover = beat("cover");
  cover.title = "천안시 공사장\nSmartFence AI\n시민안전 실증 제안";
  cover.question = "이번 제안으로 어떤 결정을 요청하는가?";
  cover.answer =
    "도시개발 현장의 보행안전을 위해\n접근 알림과 현장 대응을 연결합니다.";
  cover.visualPurpose =
    "표지는 사업 정체성과 제안 방향을 소개하고, 문제 정의는 첫 본문에서 설명한다.";
  cover.limitation = "천안시 협의용 · AI 생성 설치 개념도 · 현장·성능 미확정";
  Object.assign(cover.visualPlan, {
    kind: "existing",
    intent: "structural",
    takeaway: "공공공사 출입구 한 곳에서 먼저 검증합니다",
    encoding:
      "원본 비율을 유지한 설치 개념 이미지와 사업 제목으로 제안 방향을 소개",
    legend: "AI 생성 개념도 · 실제 천안 현장·설치안 아님",
  });
  raw.slides.find((s: any) => s.id === "cover").image = {
    path: "examples/assets/smartfence-gate-v2.png",
    rights: "generated",
    caption: "AI 생성 개념도 · 실제 천안 현장 사진 아님",
  };
  let openingSlide = raw.slides.find((s: any) => s.id === "summary");
  if (!openingSlide) {
    openingSlide = {
      id: "summary",
      layout: "editorial",
      title: "사업의 출발점",
      message: "출입구의 차량·보행 접점을 확인합니다.",
      items: [],
      claimIds: ["scope"],
    };
    raw.slides.push(openingSlide);
  }
  openingSlide.image = {
    path: "examples/assets/cover-crossing-problem-v8.png",
    rights: "generated",
    caption: "AI 생성 문제 개념도 · 실제 현장·사고·설치안 아님",
  };
  const schedule = beat("rollout").visualPlan;
  b.deliveryAssurance = {
    status: "proposed-not-agreed",
    claimIds: [
      "readiness",
      "manual-authority",
      "governance-plan",
      "roadmap-plan",
      "pilot-package",
    ],
    qualification: [
      {
        id: "need",
        criterion: "잔여 위험 수요",
        evidence: "차량·보행 동선과 가려짐 관찰",
        holdWhen: "기본 동선 분리만으로 해소될 때",
      },
      {
        id: "access",
        criterion: "안전한 보행 연속성",
        evidence: "우회·유도원 위치를 도면에 표시",
        holdWhen: "설치가 보행·현장 통제를 방해할 때",
      },
      {
        id: "owner",
        criterion: "현장 운영 책임",
        evidence: "담당자·공정·운영기간 확인서",
        holdWhen: "담당자 또는 관찰기간을 확보 못할 때",
      },
      {
        id: "install",
        criterion: "설치·촬영 적합성",
        evidence: "전원·통신·구조·촬영 범위 점검",
        holdWhen: "필수 승인·설치 조건을 충족 못할 때",
      },
    ],
    stageGates: schedule.nodes.map((n: any, i: number) => ({
      nodeId: n.id,
      deliverable: [
        "후보 조사서·책임 협의안",
        "시험 기록·수용기준 합의서",
        "기준선·경고·조치·부담 기록",
        "성과·비용·후속 적용 검토서",
      ][i],
      acceptance: [
        "남아 있는 위험과 운영 조건 확인",
        "통제 시험과 장애 대응 절차 확인",
        "운영 조건·결측·추가 업무 함께 기록",
        "확대·수정·중단의 근거 확인",
      ][i],
      reviewer: [
        "발주·현장 안전책임자",
        "현장 안전책임자·시험 담당",
        "현장 운영자·검증 담당",
        "발주·현장·공급사",
      ][i],
    })),
    actors: [
      { id: "client", label: "발주 협의 책임자" },
      { id: "field", label: "현장 안전책임자" },
      { id: "slt", label: raw.proposer.legalName },
      { id: "ai", label: raw.proposer.collaborators[0] },
      { id: "sw", label: raw.proposer.collaborators[1] },
    ],
    responsibilityRows: [
      {
        activity: "후보·범위·예산 협의",
        ownerId: "client",
        contributorIds: ["field", "slt"],
        deliverable: "조사·범위·견적 검토서",
      },
      {
        activity: "보행·차량 통제 운영",
        ownerId: "field",
        contributorIds: ["slt"],
        deliverable: "통행 관리·수동 대응 절차",
      },
      {
        activity: "장비 설치·통합 시험",
        ownerId: "slt",
        contributorIds: ["ai", "sw"],
        deliverable: "설치·경고·장애 시험 기록",
      },
      {
        activity: "현장 성과·부담 검토",
        ownerId: "client",
        contributorIds: ["field", "slt", "sw"],
        deliverable: "측정 결과·후속 판단서",
      },
    ],
    fallbacks: [
      {
        id: "offline",
        condition: "전원·통신·장치 장애",
        detection: "상태 신호·작동 점검",
        action: "장애 표시·담당자 연락",
        ownerId: "slt",
        resumeEvidence: "복구·실동작 시험 기록",
      },
      {
        id: "visibility",
        condition: "가려짐·야간 감지 불안정",
        detection: "영상·통제 시험 확인",
        action: "설정·위치 재검토",
        ownerId: "ai",
        resumeEvidence: "해당 조건 재시험 통과",
      },
      {
        id: "overload",
        condition: "과다 경고·대응 누락",
        detection: "경고·조치·업무 대조",
        action: "조건 조정·시범 기능 보류",
        ownerId: "field",
        resumeEvidence: "담당자·처리 절차 재합의",
      },
    ],
    approvalGates: [
      {
        label: "보행·설비 안전",
        document: "동선도·설치 점검서",
        passWhen: "보행 공간·유도원 절차 확보",
        holdWhen: "보행 방해·위험한 설치",
      },
      {
        label: "성능·장애 대응",
        document: "통제 시험·복구 기록",
        passWhen: "수용기준·수동 절차 합의",
        holdWhen: "합의 기준 이탈·복구 미확인",
      },
      {
        label: "촬영·운영 권한",
        document: "촬영 범위·권한 협의서",
        passWhen: "처리 범위·접근·보존·삭제 확정",
        holdWhen: "권한·관리 주체가 미정",
      },
      {
        label: "운영 부담·비용",
        document: "부담 기록·현장 견적",
        passWhen: "업무·민원·유지비 수용 가능",
        holdWhen: "부담 악화·운영 재원 미정",
      },
    ],
    currentRequests: [
      {
        label: "후보 공동조사",
        action: "와촌동 우선·원성동 예비 협의",
        artifact: "출입구·동선·공정 조사서",
      },
      {
        label: "협의 책임자 지정",
        action: "발주·시공·현장 안전책임자 참여",
        artifact: "역할·일정·자료 제공 협의안",
      },
    ],
    laterDecision:
      "현장 조건·견적·시험 기준을 확인한 뒤 제한 실증의 착수 여부를 별도로 판단합니다.",
  };
  const regional = beat("cheonan-context");
  regional.proofClaimIds = [
    ...new Set([...regional.proofClaimIds, "city-smart", "city-plan"]),
  ];
  regional.visualPlan.evidenceIds = regional.proofClaimIds;
  regional.visualPlan.takeaway =
    "천안의 스마트도시·도시재생 방향을 참고하되, 본 실증의 예산·계약은 별도로 협의합니다.";
  regional.answer = regional.visualPlan.takeaway;
  const titles: Record<string, string> = {
    summary: "공사장 출입구,\n차량과 보행자의\n동선이 겹칩니다",
    "cheonan-context": "천안 원도심의 세 후보 권역을 살펴봅니다",
    "policy-fit": "지역 통계와 현장 위험 수요를 구분해 판단합니다",
    problem: "가려진 출입구에서 차량과 보행 동선이 교차합니다",
    journey: "차량 접근부터 조치까지 세 주체의 행동을 잇습니다",
    sites: "와촌동을 우선 조사하고 현장 조건으로 후보를 확정합니다",
    selection: "위험 수요·운영 책임·설치 여건을 함께 확인합니다",
    "site-station": "와촌동에서는 실제 출입구와 공정을 먼저 확인합니다",
    "site-oryong": "원성동에서는 관리 권한과 생활 동선을 확인합니다",
    concept: "기본 안전조치 위에 감지·경고·조치 기록을 더합니다",
    architecture: "현장 감지와 장치 작동, 사람의 조치를 구분합니다",
    operation: "장애 대응과 수동 통제를 운영 절차에 포함합니다",
    rollout: "단계별 산출물을 확인한 뒤 다음 단계로 진행합니다",
    organization: "현장 안전 책임과 공급사의 수행 역할을 구분합니다",
    budget: "현장 견적으로 실증 범위와 기준 예산을 확정합니다",
    benefits: "기대 가치를 시민·현장·행정의 지표로 확인합니다",
    "time-scenario": "기록시간 감소와 추가 업무를 함께 측정합니다",
    kpis: "미탐·경고 지연·조치 완결률로 실증을 평가합니다",
    risks: "보행·성능·촬영·운영 조건을 통과해야 착수합니다",
    decision: "후보 공동조사와 협의 책임자 지정을 요청합니다",
  };
  for (const [id, title] of Object.entries(titles)) beat(id).title = title;
  const newKinds: Record<string, string> = {
    summary: "summary-brief",
    selection: "qualification-gates",
    rollout: "assured-timeline",
    organization: "responsibility-matrix",
    operation: "fallback-flow",
    risks: "approval-gates",
    decision: "decision-brief",
    "time-scenario": "time-balance",
  };
  const encodings: Record<string, string> = {
    "summary-brief":
      "첫 본문에서 가려진 출입구의 문제 장면과 동선 교차·시야·대응 확인의 세 문제를 설명",
    "qualification-gates":
      "판단 기준·확보할 관찰/문서·보류 조건을 같은 행에 놓고 조사/실증 검토 경로로 연결",
    "assured-timeline":
      "실제 단계별 기간 막대와 종료 관문을 배치하고 단계별 산출물·검토 조건을 해당 행에 연결",
    "responsibility-matrix":
      "핵심 업무별 확인 담당·수행 협력·확인 문서를 같은 행에 배치해 책임 경계를 비교",
    "fallback-flow":
      "정상 감지·경고·현장 통제·기록 흐름과 별도의 장애 확인·담당 조치·재개 조건을 함께 표시",
    "approval-gates":
      "착수 관문별 확인 문서·통과·보류 조건을 비교하고 미해결 항목을 책임자 재검토로 환류",
    "decision-brief":
      "현재 공동조사/책임자 지정의 두 요청과 산출물을 묶고, 자료 확보 후 실증 착수 결정을 별도로 연결",
    "time-balance":
      "가정상 기록 업무시간 두 값을 같은 축으로 비교하고, 감소분에서 미측정 추가 업무를 빼야 순절감이 됨을 표현",
  };
  for (const [id, kind] of Object.entries(newKinds)) {
    const s = beat(id);
    s.visualPlan.kind = kind;
    s.visualPlan.encoding = encodings[kind];
    s.visualPurpose = encodings[kind];
    s.proofClaimIds = [
      ...new Set([...s.proofClaimIds, ...b.deliveryAssurance.claimIds]),
    ];
    s.visualPlan.evidenceIds = s.proofClaimIds;
  }
  const revise = (id: string, takeaway: string, legend: string) => {
    beat(id).visualPlan.takeaway = takeaway;
    beat(id).visualPlan.legend = legend;
    beat(id).answer = takeaway;
  };
  revise(
    "summary",
    "울타리로 가려진 출입구에서\n차량과 시민이 서로를 늦게 볼 수 있습니다.",
    "AI 생성 문제 개념도 · 일반 위험 구조 설명 · 실제 천안 현장·사고 자료 아님",
  );
  const opening = beat("summary");
  opening.question = "공사장 출입구에서 무엇이 문제인가?";
  opening.proofClaimIds = [
    ...new Set([
      ...opening.proofClaimIds,
      "separation",
      "public-boundary",
      "blind-area",
      "response-chain",
    ]),
  ];
  opening.visualPlan.evidenceIds = opening.proofClaimIds;
  opening.visualPlan.intent = "spatial";
  opening.visualPlan.nodes = [
    {
      id: "crossing",
      label: "차량·보행 동선의 교차",
      detail: "공사차량 출입로가 보도를 가로지릅니다.",
      icon: "route",
    },
    {
      id: "visibility",
      label: "울타리와 차체에 가려진 시야",
      detail: "접근하는 상대를 알아차릴 시간이 줄어듭니다.",
      icon: "person",
    },
    {
      id: "response",
      label: "알림 이후 조치의 확인 공백",
      detail: "경고 전달과 실제 통행 관리는 다릅니다.",
      icon: "clipboard",
    },
  ];
  opening.visualPlan.edges = [];
  revise(
    "selection",
    "규모가 큰 사업보다 잔여 위험 수요와 실증 운영 조건이 확인되는 현장을 선택합니다.",
    "우선순위는 조사 순서 · 미확인 항목은 통과로 간주하지 않음 · 위험도 점수 미부여",
  );
  revise(
    "operation",
    "정상 경로와 장애 경로를 나누고, 기존 유도원 통제와 현장 안전책임자의 판단을 유지합니다.",
    "장애 때 AI 판단에 의존하지 않음 · 현장 통제 책임은 현장에 유지 · 대응·복구 기준은 협의안",
  );
  revise(
    "rollout",
    "약 8개월 기준안이며, 단계별 자료와 검토 결과에 따라 다음 단계 진입을 조정합니다.",
    "착수 후 일정 가정 · 현장 운영 약 4개월 포함 · 단계 완료·예산 집행 승인 아님",
  );
  revise(
    "organization",
    "현장 통제의 책임과 장비·소프트웨어의 수행 역할을 문서로 합의합니다.",
    "제공 원문의 협력 구조를 토대로 한 역할 협의안 · 계약·법적 책임·조달 방식은 별도 확정",
  );
  revise(
    "time-scenario",
    "기록 업무 감소분에서 검증·오탐 대응 등 추가 업무를 빼야 실제 순절감이 됩니다.",
    "모든 입력은 가정 · 인건비·ROI·확정 성과로 환산하지 않음 · 추가 업무시간은 미측정",
  );
  revise(
    "risks",
    "확인 문서와 통과·보류 조건을 함께 남기고, 미해결 항목은 책임자 재검토로 돌립니다.",
    "초도 설치·운영 착수 전 확인 기준안 · 실제 성능 수치는 기준선 확보 후 합의",
  );
  revise(
    "decision",
    "지금은 조사와 책임 협의를 시작하고, 도입·예산 확정은 검토 자료를 갖춘 뒤 판단합니다.",
    "(주)에스엘티 제안 · 현장 조사·계약·예산 승인 전 · 후속 실증 판단은 별도 절차",
  );
  beat("sites").visualPlan.nodes.forEach(
    (n: any, i: number) =>
      (n.detail = [
        "우선 조사 · 복합 이용 접점 탐색\n출입구·잔여 공정 미확인",
        "예비 후보 · 생활권 접점 검토\n관리 권한·출입 계획 미확인",
        "검토 유보 · 잔여 수요 재확인\n현재 공정·반출입 수요 미확인",
      ][i]),
  );
  beat("policy-fit").visualPlan.takeaway =
    "보행안전은 지역 과제입니다. 실증 필요성은 후보 출입구의 관찰 자료로 추가 확인합니다.";
  b.metrics.find((m: any) => m.id === "miss").measurement =
    "유효 위험사례의 범위와 라벨을 먼저 합의. 사례가 0건이면 0%가 아니라 미산출로 표시. 안전한 통제 시험에서 주야간별 평가하고 실제 시민을 위험에 노출시키지 않음.";
  beat("kpis").visualPlan.legend =
    "기준선 미측정·목표 미설정 · 사례 0건이면 미산출 · 오탐·교차 노출·추가 업무·시민 불편 함께 관찰";
  b.timeScenario.attributionLimit =
    "기록 업무만의 예시 감소분이며 순절감이 아니다. 검증·오탐·운영 추가시간을 함께 측정한다. 사고 감소·인건비 절감·투자 회수로 환산하지 않는다.";
  const polish = (value: any): any =>
    typeof value === "string"
      ? value
          .replaceAll("잔여 위험 수요", "남아 있는 위험")
          .replaceAll("위험 수요", "위험 노출")
      : Array.isArray(value)
        ? value.map(polish)
        : value && typeof value === "object"
          ? Object.fromEntries(
              Object.entries(value).map(([k, v]) => [k, polish(v)]),
            )
          : value;
  raw.planning = polish(raw.planning);
  raw.businessCase = polish(raw.businessCase);
  for (const s of raw.planning.story)
    if (s.id !== "cover") {
      const sourceIds = s.proofClaimIds.flatMap(
        (id: string) =>
          raw.claims.find((c: any) => c.id === id)?.sourceIds || [],
      );
      const labels: Record<string, string> = {
        "G-OSM": "OSM 참고도",
        "C-TRAFFIC-24": "대전일보 2025.02.26",
        "C-TRAFFIC-25": "대전일보 2026.02.08",
        "P-ASSUME": "제안자 기획 가정",
        M1: "제공 사업자료",
        H1: "HSE",
        H2: "HSE",
        N1: "NIOSH",
        "C-URC": "천안 도시재생센터",
        "C-STATION": "천안 도시재생센터",
        "C-PLAN": "AURUM",
        "C-MOLIT": "국토교통부",
        "C-COUNCIL": "천안시의회",
        "C-FENCE": "충청뉴스 보도",
      };
      const visualClaims = s.visualPlan.chart
        ? raw.quantitativeDatasets.find(
            (d: any) => d.id === s.visualPlan.chart.datasetId,
          ).sourceClaimIds
        : s.visualPlan.map
          ? raw.geographicAssets.find(
              (m: any) => m.id === s.visualPlan.map.assetId,
            ).sourceClaimIds
          : [];
      const visualSources = visualClaims.flatMap(
        (id: string) =>
          raw.claims.find((c: any) => c.id === id)?.sourceIds || [],
      );
      const visibleSources = s.visualPlan.chart
        ? visualSources
        : [...visualSources, ...sourceIds];
      s.limitation = `출처: ${[...new Set(visibleSources.map((id: string) => labels[id] || id))].slice(0, 4).join(" · ")} · 상세 근거는 동봉 검토 기록`;
    }
}
