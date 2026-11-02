/** Assistant-authored municipal buyer narrative. No runtime research or expert-model calls. */
export function refineMunicipalCase(raw: any) {
  const b = raw.businessCase;
  b.municipalCase = {
    status: "proposed-not-agreed",
    claimIds: [
      "dual-warning",
      "reuse-strategy",
      "impact-hypothesis",
      "pilot-package",
    ],
    benefits: [
      {
        audience: "시민",
        before: "울타리 밖에서는 출차 차량을 늦게 인지",
        intervention: "차량 접근 시 보행자 음성·주의 알림",
        outcome: "차량 접근을 알아차릴 기회 확대",
        metricIds: ["latency", "burden"],
      },
      {
        audience: "현장",
        before: "운전자가 외부 보행 상황을 확인하기 어려움",
        intervention: "내부 LED 확인 + 유도원 통제",
        outcome: "출차 전 확인 절차의 일관성 확보",
        metricIds: ["miss", "completion"],
      },
      {
        audience: "천안시",
        before: "현장 종료 뒤 장비·운영 경험을 이어 쓸 구조 필요",
        intervention: "설비 재배치 + 현장별 운영 결과 축적",
        outcome: "다음 현장에 활용할 자산·판단 근거 확보",
        metricIds: ["reuse", "burden"],
      },
    ],
    pilot: {
      gates: 1,
      totalMonths: 8,
      fieldMonths: 4,
      price: null,
      scope: [
        {
          label: "현장 설비",
          detail: "카메라·접근 감지·외부 음성/주의 장치·내부 대형 LED",
        },
        {
          label: "운영 서비스",
          detail: "설치·설정·교육·점검·공사정보 갱신·성과 보고",
        },
        {
          label: "종료·다음 활용",
          detail: "철거·회수·점검·보관·다음 현장 재설치 견적",
        },
      ],
    },
    service: {
      lead: "(주)에스엘티",
      city: [
        "대상 현장·사업 범위 결정",
        "운영 보고·이슈 확인",
        "예산·재투입 판단",
      ],
      supplier: [
        "설치·통합·교육과 점검 창구",
        "장애 접수·복구와 운영 보고",
        "회수·보관·재설치 일정 관리",
      ],
      site: [
        "유도원 배치·통행 안전 책임 유지",
        "일일 점검·공사정보 확인·현장 연락",
      ],
      report:
        "월간 운영 보고 제안: 알림 작동·장애/민원·추가 업무·다음 현장 수요",
    },
    evaluation: [
      {
        question: "필요한 순간에 안내가 작동했는가",
        observation: "주야간 위험 사례의 미탐 + 감지부터 장치 작동까지의 지연",
        decision: "재현 시험과 실제 작동 기록으로 기능 적합성 판단",
        metricIds: ["miss", "latency"],
      },
      {
        question: "현장 통행 관리에 도움이 되었는가",
        observation: "출차 전 확인·조치 기록 + 추가 업무·소음·통행 불편",
        decision: "도입 전후 같은 조건을 비교해 운영 개선·부담 함께 판단",
        metricIds: ["completion", "burden", "false-alarm"],
      },
      {
        question: "다음 현장에서도 합리적인가",
        observation: "재사용 가능 설비 + 회수·수리·보관·재설치 비용과 유휴기간",
        decision: "현장별 신규 구매 대비 동일 기간·범위의 총비용 비교",
        metricIds: ["reuse"],
      },
    ],
    expansion: [
      {
        label: "대표 출입구 실증",
        scope: "출입구 1개소에서 기능·운영·비용 확인",
        carry: "설치 기준·운영 기록·전체 비용 명세",
        decision: "기능 적합성과 현장 부담 확인",
      },
      {
        label: "다음 현장 재투입",
        scope: "준공 후 회수한 설비를 다른 현장에 적용",
        carry: "재설치 조건·이전 비용·사용 가능 상태",
        decision: "신규 구매보다 재사용이 적합한지 비교",
      },
      {
        label: "수요에 맞춘 순환 운영",
        scope: "공정 일정과 잔여 장비를 맞춰 현장 배정",
        carry: "자산 이력·유휴기간·현장별 운영 결과",
        decision: "반복 수요와 총비용을 확인한 범위에서 확대",
      },
    ],
  };
  const revised: Record<string, any> = {
    "cheonan-context": {
      kind: "municipal-overview",
      title: "천안시 공사장을 위한 순환형 안전서비스",
      kicker: "사업 제안 개요",
      takeaway:
        "한 현장의 양방향 안전 안내를 시작으로, 준공 후에도 다음 현장에 이어지는 설비 활용",
      question: "천안시는 어떤 사업을 도입하고 무엇을 남길 수 있는가?",
      answer:
        "대표 출입구에서 보행자·운전자 안내와 현장 통제를 함께 검증하고, 회수 가능한 장비와 운영 기준을 다음 현장에 활용하는 사업을 제안합니다.",
      nodes: [
        ["보행자 출차 알림", "현장 밖 음성·주의 표시"],
        ["운전자용 보행 안내", "현장 안 대형 LED·공사정보"],
        ["설비 회수·재투입", "회수·점검·보관·재설치"],
      ],
      legend:
        "제안 범위·일정은 기획안 · 실제 설치 조건과 사업비는 현장조사 후 확정",
      refs: ["dual-warning", "reuse-strategy", "pilot-package", "roadmap-plan"],
    },
    integration: {
      kind: "field-information-flow",
      title: "보행 상황 감지부터 현장 안내·시 보고까지",
      kicker: "현장 정보의 전달",
      takeaway:
        "영상은 현장에서 처리하고, 보행자와 운전자에게 필요한 안내를 각각 전달",
      question: "촬영한 정보는 어디로 가고 누가 무엇을 보게 되는가?",
      answer:
        "현장 카메라의 보행 상황과 차량 접근을 현장 제어기에서 판단해 외부 음성과 내부 LED로 전달하고, 천안시에는 운영 결과를 집계해 보고하는 구조를 제안합니다.",
      nodes: [
        ["카메라 감지", "카메라로 보행 상황과 출입구 접근 확인"],
        ["현장 제어기", "접근 조건·보행자 상태·장치 이상 판단"],
        ["보행자 음성·주의 알림", "출입구 밖 시민에게 차량 접근 안내"],
        ["운전자용 내부 LED", "보행 영상·감지 상태 / 별도 공사정보"],
        ["현장 운영 기록", "장치 작동·장애·조치·민원 기록"],
        ["천안시 운영 보고", "기능 작동·현장 부담·반복 활용 결과 집계"],
      ],
      edges: [
        [0, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [4, 5],
      ],
      legend:
        "현장 처리·제한 표출을 기본으로 한 제안 · 시 보고는 집계 결과 중심 · 원본 영상의 도시 전송·API 연계는 별도 검토",
      refs: [
        "dual-warning",
        "privacy-boundary",
        "readiness",
        "governance-plan",
      ],
    },
    organization: {
      kind: "public-value",
      title: "시민·현장·천안시에 남기는 사업 가치",
      kicker: "기대효과",
      takeaway:
        "시민의 인지 기회, 현장의 확인 절차, 도시의 반복 활용 자산을 함께 개선하는 방향",
      question: "장비 설치 이후 시민과 천안시에 어떤 변화가 남는가?",
      answer:
        "양방향 안내로 시민과 운전자의 인지 기회를 보완하고, 현장 확인 절차와 재사용 자산·운영 경험을 남기는 것을 실증의 기대효과로 제안합니다.",
      nodes: b.municipalCase.benefits.map((r: any) => [r.audience, r.outcome]),
      legend:
        "기대효과는 실증 가설 · 사고 감소율·절감액은 측정 전 · 기본 안전조치와 현장 통제 유지",
      refs: b.municipalCase.claimIds,
    },
    budget: {
      kind: "pilot-package",
      title: "대표 출입구 실증 패키지와 공급 범위",
      kicker: "실증 도입 범위",
      takeaway:
        "장비 납품에 운영·회수까지 묶은 실증안 · 규모와 기간에 맞춰 총비용 산정",
      question: "어느 규모로 시작하며 설비·운영·회수의 공급 범위는 어디까지인가?",
      answer:
        "대표 출입구 1개소, 전체 8개월 중 현장 운영 약4개월을 기획 기준으로 삼고 현장 설비·운영 서비스·종료 및 다음 활용 비용을 구분해 견적을 마련합니다.",
      nodes: b.municipalCase.pilot.scope.map((r: any) => [r.label, r.detail]),
      legend:
        "실증 범위·기간은 현장 협의 후 확정 · 사업비는 장비 규격·운영·회수·재설치 범위에 따라 산정",
      refs: [
        "pilot-package",
        "roadmap-plan",
        "scope-requote",
        "dual-warning",
        "reuse-strategy",
      ],
    },
    "time-scenario": {
      kind: "service-model",
      title: "천안시의 관리 부담을 줄이는 운영서비스안",
      kicker: "운영·계약 제안",
      takeaway:
        "시에는 사업 판단과 보고 창구를, 공급사에는 장비 운영·회수의 실행 창구를 집중",
      question: "천안시가 매일 장비를 관리해야 하는가?",
      answer:
        "천안시는 대상과 사업 범위를 판단하고 운영 결과를 확인하며, 제안 주관사가 설치·장애 대응·점검·회수·재설치의 단일 창구를 맡는 관리서비스안을 협의합니다.",
      nodes: [
        ["천안시", "대상·범위 결정 / 운영 보고 / 다음 활용 판단"],
        ["(주)에스엘티", "설치·통합·지원·회수의 단일 협의 창구"],
        ["현장 안전책임자", "유도원·통행 통제·현장 정보 확인"],
      ],
      legend:
        "역할·서비스 수준·대가는 계약 협의 전 · 현장 통행 안전 책임은 현장에 유지 · 소유·보관 장소는 별도 협의",
      refs: [
        "governance-plan",
        "manual-authority",
        "reuse-strategy",
        "dual-warning",
      ],
    },
    kpis: {
      kind: "evaluation-plan",
      title: "실증 이후 도입 가치를 판단할 세 가지 질문",
      kicker: "성과 확인",
      takeaway: "작동 성능뿐 아니라 현장 변화와 재사용 경제성을 함께 확인",
      question: "실증이 끝나면 무엇을 근거로 계속할지 판단하는가?",
      answer:
        "안내 작동, 현장 운영 개선과 부담, 다음 현장 재사용의 총비용을 확인한 뒤 확대·보완·중단을 판단합니다.",
      nodes: b.municipalCase.evaluation.map((r: any) => [
        r.question,
        r.observation,
      ]),
      legend:
        "기준선 미측정·목표 미설정 · 도입 전후 조건 기록 · 사례 0건이면 비율 미산출 · 사고 감소 성과로 단정하지 않음",
      refs: [
        "readiness",
        "impact-hypothesis",
        "response-chain",
        "reuse-strategy",
      ],
    },
    risks: {
      kind: "expansion-path",
      title: "한 현장의 실증에서 공사장 순환 운영으로",
      kicker: "천안시 확산 전략",
      takeaway:
        "처음부터 일괄 확대하기보다, 기능과 재사용 가치를 확인한 범위에서 다음 현장으로 연결",
      question: "실증이 일회성 설치로 끝나지 않으려면 어떻게 확대하는가?",
      answer:
        "대표 출입구 실증으로 설치·운영 기준을 만들고, 다음 현장 재투입에서 이전 비용과 적합성을 확인한 뒤 공정 일정·보유 장비·후속 수요에 맞춘 순환 운영을 검토합니다.",
      nodes: b.municipalCase.expansion.map((r: any) => [r.label, r.scope]),
      legend:
        "확산 경로 제안 · 시 보관 공간·후속 현장·재원은 미확정 · 현장별 적합성·촬영 조건·총비용 재검토",
      refs: ["reuse-strategy", "city-plan", "readiness", "roadmap-plan"],
    },
    decision: {
      kind: "city-proposal",
      title: "천안시 SmartFence 시범사업 추진 제안",
      kicker: "사업 추진 제안",
      takeaway:
        "대표 출입구의 안전 안내를 실증하고, 다음 공사장에 이어 쓸 운영 모델까지 마련",
      question: "천안시가 이번 제안에서 검토할 구체적인 추진안은 무엇인가?",
      answer:
        "와촌동 우선 후보의 대표 출입구 1개소를 공동조사하고, 양방향 안내·운영서비스·회수 후 활용을 포함한 실증 범위와 비용안을 마련해 사업 착수 여부를 협의할 것을 제안합니다.",
      nodes: [
        ["대상 현장 공동조사", "와촌동 우선 검토 · 원성동 예비 협의"],
        [
          "배치·서비스·사업비 구체화",
          "현장 도면·기능 구성·운영/회수 조건·견적",
        ],
        [
          "실증 실행과 다음 활용 판단",
          "결과 보고를 바탕으로 보완·재투입·확대 검토",
        ],
      ],
      legend:
        "(주)에스엘티 제안 · 강민코퍼레이션·비트리 기술 협력 · 실제 사업·역할·예산은 협의 전",
      refs: [
        "candidate-fit",
        "pilot-package",
        "dual-warning",
        "reuse-strategy",
        "scope-requote",
        "governance-plan",
      ],
    },
  };
  for (const [id, c] of Object.entries(revised)) {
    const beat = raw.planning.story.find((s: any) => s.id === id);
    beat.title = c.title;
    beat.question = c.question;
    beat.answer = c.answer;
    beat.proofClaimIds = [...new Set([...beat.proofClaimIds, ...c.refs])];
    beat.visualPurpose = c.takeaway + ". 관계와 추진 결과를 시각적으로 연결";
    beat.visualPlan = {
      kind: c.kind,
      intent:
        c.kind === "service-model"
          ? "structural"
          : c.kind === "expansion-path"
            ? "temporal"
            : c.kind === "public-value"
              ? "comparative"
              : "decision",
      takeaway: c.takeaway,
      encoding:
        "대상별 개입과 결과 또는 실행 단계를 연결한 편집 가능한 사업 제안 도식",
      evidenceIds: c.refs,
      nodes: c.nodes.map((r: string[], i: number) => ({
        id: `m${i + 1}`,
        label: r[0],
        detail: r[1],
        icon: ["camera", "server", "bell", "document", "clipboard", "city"][
          i % 6
        ],
      })),
      edges: (c.edges || []).map((pair: number[]) => ({
        from: `m${pair[0] + 1}`,
        to: `m${pair[1] + 1}`,
        label: "",
      })),
      legend: c.legend,
    };
    beat.limitation =
      "근거: 제공 사업자료·제안 설계 · 세부 범위와 조건은 협의안";
    const section = b.sections.find((s: any) => s.id === id);
    if (section) {
      section.visual = "municipal";
      section.kicker = c.kicker;
      section.items = (id === "integration" ? [] : c.nodes).map(
        (r: string[]) => ({ label: r[0], detail: r[1] }),
      );
      delete section.headers;
      delete section.rows;
      section.caption = c.legend;
    }
    const slide = raw.slides.find((s: any) => s.id === id);
    if (slide) delete slide.image;
  }
  // Visible copy describes the proposal, provenance remains in notes and asset records.
  for (const beat of raw.planning.story) {
    if (beat.visualPlan?.scene)
      beat.visualPlan.scene.caption = "출입구 공간 구성 예시";
  }
  for (const slide of raw.slides) {
    if (slide.image)
      slide.image.caption =
        slide.id === "summary"
          ? "출입구 문제 상황 예시"
          : "제안 설치 예시 · 현장 조건에 맞춰 조정";
  }
  // City-first visual summary replaces the duplicated regional map, not the problem opening.
  const life = raw.planning.story.find((s: any) => s.id === "benefits");
  life.title = "준공 후 회수와 다음 공사장 재사용";
  life.question = "공사가 끝난 장비를 다음 현장에 어떻게 다시 사용하는가?";
  life.answer =
    "회수 가능한 장비는 점검 후 보관하고 다음 공정에 맞춰 재배치하며, 현장 고정 시설과 설정은 새 현장에 맞춰 다시 시공·검수합니다.";
  life.visualPlan.takeaway =
    "옮겨 쓰는 장비와 현장마다 다시 맞출 공사를 구분한 반복 활용 모델";
  life.visualPlan.legend =
    "운영 제안 · 시 보관 장소·소유·계약은 협의 전 · 회수·보수·보관·재설치 비용 포함";
}
