/** Reviewed user-requested product/business expansion; no measured performance or negotiated price is implied. */
export function applyProductStrategy(raw: any) {
  const beat = (id: string) => raw.planning.story.find((s: any) => s.id === id);
  const b = raw.businessCase;
  const source = {
    id: "U-PRODUCT",
    title: "사용자 추가 사업 요구 · 양방향 안내·대형 LED·회수/재배치",
    scope: "project",
    materialId: "docs/product-strategy-v8.md",
    applicability:
      "사용자 제시 기능·운영전략. 제품 규격·현재 성능·인증·시 보관 장소·계약·금액은 확인 전.",
  };
  raw.sources = raw.sources.filter((s: any) => s.id !== source.id);
  raw.sources.push(source);
  const claims = [
    {
      id: "dual-warning",
      text: "차량 출차 시 보행자 음성·주의 알림, 현장 내부 운전자용 LED의 보행도로 영상/감지 상태, 공사정보 표출을 제안한다.",
      status: "user-provided",
    },
    {
      id: "reuse-strategy",
      text: "공사 종료 후 모듈형 설비를 회수·점검하고 다음 현장에 재배치하거나 협의된 보관 장소에서 대기시키는 반복 활용을 제안한다.",
      status: "user-provided",
    },
    {
      id: "scope-requote",
      text: "기존 예산은 대형 LED·회수·보관·재설치를 포함하지 않은 축소안이다. 확장 구성의 신규 총액과 반복 활용 경제성은 별도 견적·운영자료로 판단한다.",
      status: "assumption",
    },
  ];
  for (const c of claims) {
    raw.claims = raw.claims.filter((x: any) => x.id !== c.id);
    raw.claims.push({
      ...c,
      scope: "project",
      sourceIds: [source.id],
      evidenceKind: "document",
    });
  }
  b.productStrategy = {
    status: "proposed-needs-site-and-contract-validation",
    claimIds: claims.map((c) => c.id),
    modules: [
      {
        id: "pedestrian",
        name: "외부 음성·주의 알림",
        audience: "출입구 밖 보행자",
        trigger: "차량 출차 접근이 감지될 때",
        action: "방향성 스피커·경광등·주의 표출",
        acceptance: "현장 소음·도달·인지·민원·오작동 시험",
        metricIds: ["latency", "burden"],
      },
      {
        id: "driver",
        name: "내부 운전자용 대형 LED",
        audience: "출차 대기 차량 운전자",
        trigger: "출차 전 보행도로 상태 확인",
        action: "보호 처리한 보행 영상·감지/확인불가 상태",
        acceptance: "운전자 시야·갱신·가림·주야간 가독성 시험",
        metricIds: ["miss", "latency"],
      },
      {
        id: "information",
        name: "공사정보 동시 표출",
        audience: "현장 운전자·관리자",
        trigger: "승인된 일정·안내가 갱신될 때",
        action: "안전 영역과 분리한 작업·공정·주의 안내",
        acceptance: "게시 책임자·만료·우선순위·오류 복구 확인",
        metricIds: ["completion", "burden"],
      },
    ],
    displayStates: [
      {
        id: "detected",
        label: "보행자 감지 · 주의",
        meaning: "설정 감지영역에서 보행자 관측",
        action: "직접 확인·유도원 통제 우선",
      },
      {
        id: "not-detected",
        label: "감지영역 내 미검출",
        meaning: "미탐·가림 가능성은 남아 있음",
        action: "통행 허가 아님 · 직접 확인",
      },
      {
        id: "unavailable",
        label: "영상·상태 확인 불가",
        meaning: "끊김·오래된 영상·장치 장애",
        action: "정상 표시 해제·담당자 연락",
      },
    ],
    lifecycle: [
      {
        id: "install",
        label: "현장 A 설치·운영",
        owner: "현장·공급사 협의",
        deliverable: "자산 ID·구성·운영 이력",
        gate: "시야·음성·영상·구조 인수시험",
      },
      {
        id: "recover",
        label: "준공 후 회수·정리",
        owner: "회수 수행사 지정",
        deliverable: "회수 목록·영상/계정 정리 기록",
        gate: "전원 분리·원상복구·인계 확인",
      },
      {
        id: "inspect",
        label: "성능 점검·보수",
        owner: "유지관리 수행사",
        deliverable: "부품·검교정·동작 점검표",
        gate: "고장 격리·사용 가능 판정",
      },
      {
        id: "store",
        label: "지정 장소 보관·배정",
        owner: "소유자·보관 책임자",
        deliverable: "입출고·상태·다음 수요 대장",
        gate: "시 보관 공간은 사전 확보·협의",
      },
      {
        id: "redeploy",
        label: "현장 B 재설치·검수",
        owner: "새 현장·공급사",
        deliverable: "새 촬영영역·설정·인수 기록",
        gate: "기존 설정 초기화·현장별 재검증",
      },
    ],
    ownershipOptions: [
      {
        id: "city-owned",
        label: "시 소유 + 유지관리 위탁",
        owner: "물품 소유·관리 주체: 시(협의안)",
        custody: "시 지정 공간 또는 계약 보관",
        service: "기간별 운영·점검 + 이전 시 작업비(견적)",
        decision: "자산 등록·보관비·책임·수요 확인",
      },
      {
        id: "service",
        label: "공급사 보유 + 임대/서비스",
        owner: "물품 소유: 공급사(대안)",
        custody: "공급사 회수·보관·재투입",
        service: "임대·운영료와 회수/이전 포함 범위 계약",
        decision: "동일 범위 총비용·인수·종료조건 비교",
      },
    ],
    costLines: [
      {
        id: "hardware",
        label: "LED·카메라·음성·제어 모듈",
        basis: "최초 구축·교체 수명/규격별",
        amount: null,
      },
      {
        id: "install",
        label: "구조·전기·통신·현장 설정",
        basis: "설치 장소마다 발생",
        amount: null,
      },
      {
        id: "operation",
        label: "SW·통신·콘텐츠·유지관리",
        basis: "실제 운영기간과 지원 범위",
        amount: null,
      },
      {
        id: "recover",
        label: "철거·운송·원상복구",
        basis: "회수/이전 때마다 발생",
        amount: null,
      },
      {
        id: "inspect",
        label: "점검·수리·소모품·재검수",
        basis: "상태·재설치 횟수별",
        amount: null,
      },
      {
        id: "storage",
        label: "보관·관리·보험 등",
        basis: "유휴기간·책임 분담별",
        amount: null,
      },
    ],
    budgetRevision: {
      status: "new-total-not-quoted",
      baselineLabel: "기존 축소안 참고 · 대형 LED·회수/재설치 미포함",
      addedScope: [
        "내부 대형 LED·프레임·전력/통신",
        "외부 방향성 음성·주의 표출",
        "회수·보관·점검·재설치 및 운영지원",
      ],
      decision:
        "동일 규격·운영기간·현장 수로 신규구매안과 반복 활용안을 다시 견적 비교",
    },
    reuseDecision:
      "반복 구매 회피 가능성은 회수·보수·보관·이전비를 포함해 검증한다. 재사용 횟수·수명·가동률이 미확정이므로 절감률·손익분기는 약속하지 않는다.",
    privacyBoundary:
      "영상은 현장 안쪽의 필요한 관찰 범위만 처리·표시하는 설계안. 얼굴/번호판 등 식별정보 보호·접근·촬영/표출 근거를 확인하고, 공개 장소로 영상 재표출하지 않는다. 실제 처리 범위는 개인정보 담당 검토 후 확정.",
  };
  b.metrics = b.metrics.filter((m: any) => m.id !== "reuse");
  b.metrics.push({
    id: "reuse",
    name: "재배치·유휴·이전 비용",
    definition: "자산 ID별 재배치 횟수, 유휴일, 이전/수리비와 가용 상태",
    formula: "자산별 실지출·운영일·보관일·재설치 결과 대조",
    unit: "건·일·원",
    baseline: null,
    target: null,
    targetPolicy: "첫 현장 운영·첫 회수의 실제 기록 후 후속 기준 협의",
    measurement:
      "동일 구성·기간·현장 수 기준 신규구매 견적과 총비용 비교. 재사용 불가·교체·보관비도 기록.",
    owner: "발주 물품관리 담당·유지관리 수행사",
    claimIds: ["reuse-strategy", "scope-requote"],
    guardrail: true,
  });
  const product = b.productStrategy;
  const defs: any = {
    scope: [
      "product-overview",
      "보행자와 운전자에게 서로 다른 안전 정보를 전달합니다",
      "외부는 차량 접근을 알리고, 내부 LED는 보행도로 상황과 공사정보를 구분해 보여줍니다.",
    ],
    architecture: [
      "driver-display",
      "내부 LED는 보행 상황을 먼저, 공사정보를 별도로 보여줍니다",
      "운전자가 출차 전에 보행도로 영상·감지 상태를 확인하도록 배치하고, 안전 정보를 우선합니다.",
    ],
    design: [
      "pedestrian-warning",
      "차량이 출차할 때 보행자에게 소리와 주의 표시로 알립니다",
      "방향성 음성과 경광등을 함께 사용하되, 보행 통행·인지·소음과 야간 가독성을 현장에서 검증합니다.",
    ],
    benefits: [
      "asset-cycle",
      "준공 후 회수한 설비를 다음 공사 현장에 다시 투입합니다",
      "철거·점검·보관·재설치까지를 하나의 운영 서비스로 묶어 유휴 자산과 재구매 부담을 관리합니다.",
    ],
    "time-scenario": [
      "reuse-economics",
      "소유·보관·운영 책임과 반복 활용 총비용을 함께 비교합니다",
      "시 소유·위탁관리안과 공급사 임대/서비스안을 같은 구성·기간·현장 수로 비교합니다.",
    ],
    budget: [
      "scope-requote",
      "대형 LED와 반복 활용을 포함한 확장안은 새 견적이 필요합니다",
      "기존 축소안과 확장안을 구분하고, 추가 장비·운영·이전 비용을 다시 견적합니다.",
    ],
  };
  for (const [id, data] of Object.entries(defs) as any) {
    const s = beat(id);
    s.title = data[1];
    s.answer = data[2];
    s.question = "제품 기능과 반복 활용의 실행·검증 조건은 무엇인가?";
    s.visualPurpose =
      "사용자 제시 기능·운영전략을 실제 장비·대상자·책임·검증자료에 연결";
    Object.assign(s.visualPlan, {
      kind: data[0],
      intent: id === "benefits" ? "temporal" : "structural",
      takeaway: data[2],
      encoding:
        "구체적 제품 기능·수신자·상태와 회수/재사용 책임 및 비용을 분리해 표현",
      legend:
        "사용자 제시 기능·사업전략의 제안 구성 · 규격·성능·계약·시 보관 장소·금액은 확인 전",
    });
    s.proofClaimIds = [...new Set([...s.proofClaimIds, ...product.claimIds])];
    s.visualPlan.evidenceIds = s.proofClaimIds;
    s.limitation =
      "근거: 사용자 추가 요구·제안 설계 · 세부 조건·출처는 동봉 검토 기록";
  }
  for (const [id, path] of [
    ["scope", "examples/assets/product-driver-led-v8.png"],
    ["design", "examples/assets/product-pedestrian-warning-v8.png"],
    ["architecture", "examples/assets/product-sidewalk-feed-v8.png"],
  ]) {
    let s = raw.slides.find((s: any) => s.id === id);
    if (!s) {
      s = {
        id,
        layout: "editorial",
        title: "제품 구성의 제안",
        message: "제품 기능과 현장 운영을 함께 검토합니다.",
        items: [],
        claimIds: ["scope"],
      };
      raw.slides.push(s);
    }
    s.image = {
      path,
      rights: "generated",
      caption: "AI 생성 설치 개념도 · 실제 제품 규격·천안 현장·성능 증거 아님",
    };
  }
  raw.planning.interventions.find((i: any) => i.id === "warn").name =
    "보행자·운전자 양방향 알림";
  Object.assign(
    raw.planning.interventions.find((i: any) => i.id === "warn"),
    {
      action:
        "보행자 음성·주의 알림과 내부 LED 보행도로 상태·공사정보 표출을 분리",
      deliverable: "음성/표출 요청·장치 응답·실동작·상태 최신성·현장 조치 기록",
      claimIds: ["warning-proposal", "dual-warning"],
    },
  );
  for (const w of raw.planning.workflow) {
    if (w.owner === "system" && w.claimIds.includes("warning-proposal")) {
      w.action = "보행자 음성·주의 알림과 내부 운전자 LED 상태를 채널별 전달";
      w.output = "전달 요청·장치 응답·실동작·영상 갱신 기록";
      w.successSignal =
        "채널별 실동작 확인. 수신·표출만으로 인지·통행 안전을 판정하지 않음.";
      w.claimIds = [...new Set([...w.claimIds, "dual-warning"])];
    }
  }
  raw.planning.operatingBoundary =
    "AI·미검출 표시는 통행 허가가 아니다. 운전자의 직접 확인과 유도원 통제를 유지하고 음성·내부 LED 상태를 구분한다.";
  raw.planning.decision.outOfScope = raw.planning.decision.outOfScope.filter(
    (s: string) => !s.includes("대형"),
  );
  for (const c of b.candidates)
    c.proposedPackage =
      "외부 음성·주의 알림 + 내부 운전자 LED·영상/공사정보 + 제어·기록. 규격·위치는 현장 재설계.";
  for (const id of ["site-station", "site-oryong"]) {
    const v = beat(id).visualPlan;
    v.nodes[1].detail =
      "외부 음성·주의 알림 + 내부 LED\n영상·안전 상태·공사정보 구분";
  }
  const chain = beat("concept").visualPlan.chains[1];
  chain.intervention = "보행자 음성·내부 LED";
  chain.response = "작동·영상 갱신·직접 확인";
  chain.evidenceIds = [...new Set([...chain.evidenceIds, "dual-warning"])];
  beat("concept").proofClaimIds = [
    ...new Set([...beat("concept").proofClaimIds, "dual-warning"]),
  ];
  beat("concept").visualPlan.evidenceIds = beat("concept").proofClaimIds;
  beat("concept").title =
    "음성·내부 LED와 현장 통제를 연결해 반응을 확인합니다";
  const oldBudgetClaim = raw.claims.find((c: any) => c.id === "budget-plan");
  if (oldBudgetClaim && !oldBudgetClaim.text.startsWith("기존 축소안"))
    oldBudgetClaim.text =
      "기존 축소안 참고: " +
      oldBudgetClaim.text +
      " 대형 LED·회수·보관·재설치를 포함한 확장안의 금액이 아니다.";
  b.budget.scope =
    "기존 축소안 참고: 출입구 1개소·현장 운영 약4개월, 대형 LED·회수/재설치 제외";
  b.budget.excluded = [
    "확장안의 대형 LED·프레임·추가 전력/통신",
    "회수·운송·보관·수리·재설치 비용",
    "울타리 전체·추가 토목·장기 운영 등 별도 견적",
  ];
  for (const id of Object.keys(defs)) {
    delete beat(id).visualPlan.chains;
    delete beat(id).visualPlan.scene;
    beat(id).visualPlan.edges = [];
  }
  beat("scope").visualPlan.nodes = product.modules.map((m: any) => ({
    id: m.id,
    label: m.name,
    detail: m.audience + " · " + m.action,
    icon: "document",
  }));
  beat("architecture").visualPlan.nodes = product.displayStates.map(
    (s: any) => ({
      id: s.id,
      label: s.label,
      detail: s.meaning + " · " + s.action,
      icon: "document",
    }),
  );
  beat("time-scenario").visualPlan.nodes = product.ownershipOptions.map(
    (o: any) => ({
      id: o.id,
      label: o.label,
      detail: o.owner + " · " + o.custody,
      icon: "document",
    }),
  );
  beat("budget").visualPlan.nodes = product.costLines.map((c: any) => ({
    id: c.id,
    label: c.label,
    detail: c.basis + " · 견적 전",
    icon: "document",
  }));
  const cycle = beat("benefits").visualPlan;
  cycle.nodes = product.lifecycle.map((s: any) => ({
    id: s.id,
    label: s.label,
    detail: s.deliverable,
    icon: "document",
  }));
  cycle.edges = product.lifecycle.slice(1).map((s: any, i: number) => ({
    from: product.lifecycle[i].id,
    to: s.id,
    label: "",
  }));
  const decision = beat("decision");
  decision.visualPlan.takeaway =
    "후보 조사와 함께 LED 배치·양방향 알림·자산 소유/보관·이전 비용의 검토 책임자를 정합니다.";
  decision.answer = decision.visualPlan.takeaway;
  decision.proofClaimIds = [
    ...new Set([...decision.proofClaimIds, ...product.claimIds]),
  ];
  decision.visualPlan.evidenceIds = decision.proofClaimIds;
  b.deliveryAssurance.currentRequests[1].action =
    "발주·현장·영상·물품관리 담당 협의";
  b.deliveryAssurance.currentRequests[1].artifact =
    "기능·소유·보관·견적 책임 협의안";
  b.deliveryAssurance.approvalGates[3] = {
    label: "재사용·운영 총비용",
    document: "확장 견적·자산 운영안",
    passWhen: "소유·보관·이전·유지비 수용 가능",
    holdWhen: "보관 공간·책임·재원 미확정",
  };
  b.deliveryAssurance.stageGates[3].deliverable =
    "기능·운영·이전비·재사용 판단서";
  b.deliveryAssurance.fallbacks[0].resumeEvidence =
    "음성·LED·영상 최신성 재시험";
  const latency = b.metrics.find((m: any) => m.id === "latency");
  const channelNote =
    " 음성과 LED를 채널별로 분리하고 영상 갱신·오래된 상태 노출을 함께 점검.";
  latency.measurement =
    latency.measurement.replaceAll(channelNote, "").trim() + channelNote;
  const burden = b.metrics.find((m: any) => m.id === "burden");
  const burdenNote =
    " 보행자 음성 인지·소음·야간 눈부심, 운전자 가독성·주의 분산을 함께 관찰.";
  burden.measurement =
    burden.measurement.replaceAll(burdenNote, "").trim() + burdenNote;
  beat("concept").limitation =
    "근거: 제공 사업자료·HSE·NIOSH·사용자 추가 요구 · 세부 검증은 동봉 기록";
  beat("decision").limitation =
    "근거: 지역 후보 자료·사용자 추가 요구·제안 설계 · 계약·예산·보관 장소 협의 전";
  // Previous text substitution produced an incorrect Korean particle.
  beat("policy-fit").title = "지역 통계와 현장 위험 노출을 구분해 판단합니다";
}
