/** Reviewed municipal collaboration and purchase-demonstration revision. */
export function refineCollaborationReview(raw: any) {
  const get = (id: string) => raw.planning.story.find((s: any) => s.id === id);
  const service = raw.businessCase.municipalCase.service;
  service.city = [
    "대상·운영 방향 협의",
    "공공정보 편성·결과 확인",
    "실증·다음 활용 판단",
  ];
  service.supplier = [
    "장치·전광판·관제 지원",
    "교육·점검·장애 대응",
    "회수·재설치 지원",
  ];
  service.site = ["유도원 배치·통행 통제", "일일 점검·현장 결과 공유"];
  service.report =
    "공동 확인 기록: 작동·장애·민원·추가 업무·현장 개선과 다음 활용";
  const s = get("time-scenario");
  s.title = "천안시·제안사·현장이 함께 운영하는 협업 체계";
  s.question =
    "천안시·제안사·현장은 어떤 역할과 상호 피드백으로 안전 운영을 유지하는가?";
  s.answer =
    "천안시는 운영 방향과 결과를 확인하고, 에스엘티는 장치·관제·유지관리 지원을 제공하며, 현장 안전책임자는 통행 통제와 일일 점검을 담당합니다. 세 주체는 현장 요구·작동 이력·개선 결과를 양방향으로 공유합니다.";
  const v = s.visualPlan;
  v.takeaway = s.answer;
  v.encoding =
    "상단 천안시, 하단 좌측 에스엘티, 하단 우측 현장 안전책임자. 세 변의 양방향 연결로 방향 협의·현장 요구·운영 지원을 구분";
  v.nodes = [
    {
      id: "city",
      label: "천안시",
      detail: "운영 방향·공공정보·결과 검토",
      icon: "city",
    },
    {
      id: "supplier",
      label: "(주)에스엘티",
      detail: "장치·관제·교육·점검 지원\n장애 대응·회수·재설치",
      icon: "server",
    },
    {
      id: "site",
      label: "현장 안전책임자",
      detail: "유도원 배치·통행 통제\n일일 점검·현장 결과 공유",
      icon: "team",
    },
  ];
  v.edges = [
    {
      from: "city",
      to: "supplier",
      label: "운영 방향 협의 · 결과 보고",
      bidirectional: true,
    },
    {
      from: "city",
      to: "site",
      label: "현장 요구 공유 · 개선 협의",
      bidirectional: true,
    },
    {
      from: "supplier",
      to: "site",
      label: "기술 지원 · 작동/장애 피드백",
      bidirectional: true,
    },
  ];
  v.readingGuide = {
    message: "시의 운영 판단·제안사의 기술 지원·현장의 안전 통제를 상호 연결",
    keyPhrase: "상호 연결",
    focusPhrases: ["천안시", "(주)에스엘티", "현장 안전책임자", "상호 협업"],
    tone: "teal",
  };
  v.explanation = {
    readerTask: s.question,
    howToRead:
      "삼각형의 세 주체별 역할과 세 변의 양방향 협의·지원·피드백을 대조",
    notProven:
      "역할과 협의 경로는 제안이며 현장 안전 책임·기존 보고 체계는 유지",
    requiredMarks: ["connectors"],
  };
  v.legend =
    "협업·지원 체계 제안 · 구체 역할·서비스 수준은 협의 · 현장 안전책임자의 통행 통제 유지";
  const tests = [
    {
      question: "AI 안전 인식·알림",
      observation:
        "보행자와 출차 차량을 같은 조건에서 인식하고 실제 안내까지 대조",
      decision: "미탐·전달 지연과 실제 알림의 일치를 확인",
      demonstration: {
        condition: "보행자 진입·출차 차량 접근",
        output: "내부 LED 출차 대기\n외부 보행자 음성 알림",
        record: "기준 영상·감지/알림 시각\n미탐·현장 반응 대조",
      },
    },
    {
      question: "AIoT 표출 우선순위",
      observation:
        "일반 공공정보 표시 중 위험 조건을 입력해 안전 우선 전환과 판독 확인",
      decision: "안전 우선 전환·직접 판독·권한 분리를 확인",
      demonstration: {
        condition: "공공정보 표출 중 위험 발생",
        output: "안전 안내 우선 표출\n주·야간 실제 판독 확인",
        record: "전환 전후 화면·소요 시간\n시야·눈부심·권한 확인",
      },
    },
    {
      question: "관제·재투입 연속성",
      observation:
        "장애 발생부터 조치·복구와 이동 후 현장 설정·재검수까지 연결",
      decision: "장애 조치 이력과 재설치 기능·인수 기록을 확인",
      demonstration: {
        condition: "장애 입력·다음 현장 재설정",
        output: "이상 상태·담당자 조치\n직접 통제 유지·복구 검수",
        record: "장애·조치·복구 시각\n재설정·재검수 기록",
      },
    },
  ];
  raw.businessCase.municipalCase.evaluation = tests.map((r, i) => ({
    ...r,
    metricIds: raw.businessCase.municipalCase.evaluation[i].metricIds,
  }));
  const e = get("kpis");
  e.title = "구매 판단을 위한 세 가지 현장 확인";
  e.question =
    "제품 인식·안전 표출·장애와 재투입을 어떤 조건과 증거로 확인할 것인가?";
  e.answer =
    "시험 조건을 만들고 예상 장치 반응과 실제 현장 결과를 대조합니다. 인식·알림, 공공정보에서 안전 안내로의 전환, 장애 조치와 재투입의 기록을 구매 판단 근거로 남깁니다.";
  delete e.visualPlan.scene;
  e.visualPlan.takeaway = e.answer;
  e.visualPlan.encoding =
    "시험 조건→장치·현장 반응→기록·판단의 세 행을 연결한 편집 가능한 시연 매트릭스. 무관한 보행 사진은 사용하지 않음";
  e.visualPlan.readingGuide = {
    message: "시험 조건·실제 반응·확인 기록을 한 행에서 끝까지 대조",
    keyPhrase: "실제 반응",
    focusPhrases: [
      "시험 조건",
      "안전 안내 우선",
      "직접 통제 유지",
      "확인 기록",
    ],
    tone: "teal",
  };
  e.visualPlan.explanation = {
    readerTask: e.question,
    howToRead:
      "세 시험 행을 왼쪽 조건에서 가운데 반응, 오른쪽 기록과 판단으로 따라 읽기",
    notProven: "실측 결과가 아닌 시연 계획이며 기준선과 수용 조건은 사전 협의",
    requiredMarks: ["connectors"],
  };
  e.visualPlan.legend =
    "현장 시험 계획 · 기준선 미측정 · 성능·효과 실측 결과 아님 · 미검출은 통행 허가 아님 · 수용 조건 사전 협의";
  // Remove the speculative expansion page; reuse is already explained on benefits and decision.
  raw.planning.story = raw.planning.story.filter((s: any) => s.id !== "risks");
  raw.slides = raw.slides.filter((s: any) => s.id !== "risks");
  raw.businessCase.sections = raw.businessCase.sections.filter(
    (s: any) => s.id !== "risks",
  );
  for (const r of raw.businessCase.expertReviews)
    for (const f of r.findings)
      f.storyBeatIds = [
        ...new Set(
          f.storyBeatIds.map((id: string) =>
            id === "risks" ? "benefits" : id,
          ),
        ),
      ];
  raw.businessCase.targetSlideCount = raw.planning.story.length;
  for (const id of ["time-scenario", "kpis"]) {
    const beat = get(id),
      section = raw.businessCase.sections.find((s: any) => s.id === id);
    section.title = beat.title;
    section.takeaway = beat.answer;
  }
}
