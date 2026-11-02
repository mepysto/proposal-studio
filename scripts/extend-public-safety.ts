/** Reviewed extension brief; no autonomous research or product certification. */
export function extendPublicSafety(raw: any) {
  const put = (list: any[], row: any) => {
    const i = list.findIndex((r) => r.id === row.id);
    if (i < 0) list.push(row);
    else list[i] = row;
  };
  put(raw.sources, {
    id: "AXIS-PUBLIC-20261030",
    title: "Axis 공식 영상 분석·오디오 연동·관제 기능 안내",
    scope: "general",
    url: "https://help.axis.com/en-us/axis-camera-station-feature-guide",
    checkedAt: "2026-10-30T00:00:00Z",
    excerpt:
      "AXIS Camera Station 5의 action rules / integration: 분석 이벤트로 녹화·오디오 메시지·출력·운영자 알림을 연계. 영상 분석은 카메라 엣지에서도 가능.",
    applicability:
      "일부 지능형 CCTV 생태계의 공개 기능을 확인한 예시. 일반 CCTV 전체 기능·구매 구성·상대 성능을 뜻하지 않음.",
  });
  put(raw.sources, {
    id: "U-PUBLIC-SAFETY",
    title: "공사장 외 공공안전 공간 적용·기존 CCTV 차별화 사용자 요청",
    scope: "project",
    materialId: "conversation-public-safety-2026-10-30",
    excerpt:
      "공사장뿐 아니라 여러 공공 안전이 필요한 공간에 설치 가능성을 기획하고 기존 CCTV와의 차별성을 제안 장표에 추가.",
    applicability:
      "추가 제안 기획의 방향. 신규 설치 수요·성능·사업 확정 근거 아님.",
  });
  put(raw.claims, {
    id: "intelligent-cctv-baseline",
    text: "공식 Axis 자료의 지능형 영상 시스템은 객체/이벤트 분석, 음성 안내·운영자 알림·관제 연동을 지원하므로 AI·경보·관제 자체를 본 제안만의 독점 기능으로 표현할 수 없다.",
    scope: "general",
    status: "externally-verified",
    sourceIds: ["AXIS-PUBLIC-20261030"],
    verifiedAt: "2026-10-30T00:00:00Z",
    approved: false,
  });
  put(raw.claims, {
    id: "public-safety-extension",
    text: "기존 영상 자산과 자체 제작 AI NPU 안전관리 장치·컬러 LED AIoT 전광판·AI 지능형 안전 관제를 결합해 공공시설 위험 지점의 현장 안내·담당자 조치·재배치 운영으로 확장하는 방안을 제안한다. 공간별 설정·연계·검수는 추가 확인 대상이다.",
    scope: "project",
    status: "inference",
    sourceIds: ["U-PUBLIC-SAFETY"],
    approved: false,
  });
  const claimIds = [
    "intelligent-cctv-baseline",
    "public-safety-extension",
    "own-npu",
    "aiot-content",
    "integrated-control",
    "reuse-strategy",
  ];
  const comparison = [
    {
      criterion: "상황 인지",
      recording: "영상 확인·녹화 중심\n현장 상태는 사람이 판단",
      intelligent: "사람·차량·이벤트 분석\n제품·설정에 따라 지원",
      proposal: "AI NPU 현장 분석\n기존 영상 연계는 사전 검증",
    },
    {
      criterion: "현장 안내",
      recording: "별도 안내 설비·운영으로\n구성 범위 확장 가능",
      intelligent: "분석 이벤트·음성·경보\n외부 장치와 연동 가능",
      proposal: "컬러 LED AIoT + 음성\n위험 안내·공공정보 통합",
    },
    {
      criterion: "운영 범위",
      recording: "영상 보관·조회·상태 관리\n제품·서비스에 따라 구성",
      intelligent: "알림·관제·장치 관리\n연계 제품과 서비스로 구성",
      proposal: "현장 안내부터 조치 이력\n운영 지원·회수·재배치까지",
    },
  ];
  const applications = [
    {
      label: "공영주차장·공공청사",
      risk: "차량 출입부의 보행자 교차",
      response: "차량 접근 → 음성·LED 안내",
      verification: "야간 인식·시야·통제 방식 확인",
    },
    {
      label: "공원·체육시설",
      risk: "보수·관리 구역의 접근",
      response: "설정 구역 접근 → 우회 안내",
      verification: "물리적 차단·감지 범위 확인",
    },
    {
      label: "시장·행사 운영 구간",
      risk: "운영·배송 차량과 방문객 접점",
      response: "차량 접근 → 안내·담당자 확인",
      verification: "이동 동선·소음·책임자 확인",
    },
  ];
  raw.businessCase.publicSafety = {
    status: "proposed-extension-not-validated",
    claimIds,
    comparison,
    applications,
  };
  const make = (
    id: string,
    title: string,
    question: string,
    answer: string,
    kind: string,
    nodes: any[],
    legend: string,
    marks: string[],
    message: string,
    keyPhrase: string,
  ) => ({
    id,
    stage: "business",
    sectionId: id,
    title,
    question,
    answer,
    proofClaimIds: claimIds,
    visualPurpose:
      "기존 CCTV 기능을 공정하게 비교하고 공공시설의 위험 조건과 현장 대응으로 연결한 추가 제안",
    limitation:
      "출처: Axis 공식 기능 안내·사용자 제품 설명·제안 기획 · 실제 설치·실측 성능 아님",
    visualPlan: {
      kind,
      intent: kind === "cctv-extension" ? "comparative" : "spatial",
      takeaway: answer,
      encoding:
        kind === "cctv-extension"
          ? "일반 영상 구성·지능형 CCTV·제안 통합 구성의 동일 기준 비교"
          : "세 공공시설 장면과 위험→현장 안내→확인 조건의 대조",
      evidenceIds: claimIds,
      nodes,
      edges: [],
      legend,
      readingGuide: {
        message,
        keyPhrase,
        focusPhrases: ["기존 영상", "현장 안내", "운영 지원", "재배치"],
        tone: "teal",
      },
      explanation: {
        readerTask: question,
        howToRead:
          kind === "cctv-extension"
            ? "같은 기준에서 세 구성의 범위와 통합 제안의 구매 이유를 비교"
            : "왼쪽 세 공간 장면을 오른쪽 장소별 위험·안내·검수 조건과 연결해 읽기",
        notProven:
          "확장 기획이며 기존 CCTV 호환·신규 분석 조건·설치 수요·효과는 미검증",
        requiredMarks: marks,
      },
      ...(kind === "public-safety-spaces"
        ? {
            scene: {
              path: "examples/assets/public-safety-spaces-v1.png",
              rights: "generated",
              caption: "공공안전 공간별 적용 개념",
              reuseReason:
                "세 공간에서 실제 장치·전광판·음성 안내·물리적 통제를 함께 보여주는 신규 장면",
            },
          }
        : {}),
    },
  });
  const pages = [
    make(
      "cctv-extension",
      "기존 CCTV와 결합하는 현장 대응형 안전 구성",
      "기존 CCTV와 무엇이 다르며 기존 영상을 어떻게 활용할 수 있는가?",
      "차별점은 AI 유무가 아니라 사람·차량 분석을 현장 LED·음성 안내, 담당자 조치와 반복 활용까지 묶어 제공하는 범위입니다. 기존 영상의 연계 가능성과 지연·권한·설치 조건을 먼저 확인합니다.",
      "cctv-extension",
      comparison.map((r, i) => ({
        id: `c${i}`,
        label: r.criterion,
        detail: r.proposal,
        icon: "camera",
      })),
      "기능군·구성 범위 비교 · AI CCTV도 분석·음성·관제 지원 · 성능 우열·독점 주장 아님 · 기존 영상 연계 사전 검증",
      ["comparison"],
      "기존 CCTV 자산에 현장 안내·조치·반복 활용을 더하는 제안",
      "현장 안내·조치",
    ),
    make(
      "public-safety-spaces",
      "공사장 밖 공공안전 공간으로 이어지는 적용 모델",
      "어떤 공공 공간의 어떤 위험에 적용하고 무엇을 현장에서 확인해야 하는가?",
      "공영주차장·공공청사의 차량 출입부, 공원·체육시설의 관리구역, 시장·행사의 운영차량 구간을 검토합니다. 같은 장비를 장소별 위험 조건에 맞춰 설정하고 음성·LED 안내와 담당자 대응을 연결합니다.",
      "public-safety-spaces",
      applications.map((r, i) => ({
        id: `p${i}`,
        label: r.label,
        detail: r.response,
        icon: "city",
      })),
      "공간 유형별 적용 개념 · 천안시 설치 대상·수요 미확정 · 공개 화면은 안전 기호·공공정보, CCTV는 권한 있는 내부 화면",
      ["scene", "connectors"],
      "장소별 위험 조건은 다르게, 현장 안내와 운영 체계는 함께",
      "현장 안내와 운영 체계",
    ),
  ];
  raw.planning.story = raw.planning.story.filter(
    (s: any) => !pages.some((p) => p.id === s.id),
  );
  const at = raw.planning.story.findIndex((s: any) => s.id === "decision");
  raw.planning.story.splice(at, 0, ...pages);
  for (const page of pages)
    put(raw.businessCase.sections, {
      id: page.id,
      chapter: "solution",
      kicker:
        page.id === "cctv-extension"
          ? "기존 자산 연계와 차별화"
          : "공공안전 공간 적용 제안",
      visual: "municipal",
      items: page.visualPlan.nodes.map((n: any) => ({
        label: n.label,
        detail: n.detail,
      })),
    });
  raw.businessCase.targetSlideCount = raw.planning.story.length;
}
