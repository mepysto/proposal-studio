import fs from "node:fs/promises";
import { Project } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningAudit,
} from "../packages/planning/index.js";
import {
  colBox,
  splitColumns,
  splitRows,
} from "../packages/art-direction/index.js";

const refInput = JSON.parse(
  await fs.readFile("examples/reference-direction.project.json", "utf8"),
);

const p = structuredClone(refInput);
p.id = "upgraded-showcase";
p.title = "천안시 공사현장 보행안전 — 차세대 구도·시맨틱 프리미티브 실증 예제";
p.designDirection = {
  ...refInput.designDirection,
  concept:
    "물리적 위험 인지부터 인과 가설, 현장 전광판 화면, 주체별 책임 스윔레인까지 페이지마다 질문에 맞는 전용 시각 구조로 설명한다",
  visualThesis:
    "반복되는 3박스 나열을 배제하고, 12컬럼 그리드 위에서 장면·차트·인과사슬·주석화면·스윔레인·지도·일정표를 결합한다",
  deliveryMode: "presented",
};

const baseStory = refInput.planning.story;

// 1. Slide 1 (spatial): 12-col split (col 1..8 scene, col 9..12 orientation header & message)
const s1 = structuredClone(baseStory[0]);
const s1SceneBox = colBox(1, 8, 0.82, 4.86);
const [s1TitleBox, s1MsgBox] = splitRows(colBox(9, 12, 0.85, 3.8), [0.42, 0.58], 0.32);
s1.compositionBrief = {
  ...s1.compositionBrief,
  title: s1TitleBox,
  message: s1MsgBox,
  visualBox: s1SceneBox,
  caption: colBox(1, 12, 5.95, 0.58),
  nodeBoxes: {
    truck: { x: 0.82, y: 1.02, w: 2.25, h: 0.48 },
    walk: { x: 0.82, y: 5.02, w: 2.25, h: 0.48 },
    human: { x: 6.1, y: 5.02, w: 2.35, h: 0.48 },
  },
};

// 2. Slide 2 (evidence): 12-col split (col 1..4 takeaway + direct noteBox, col 5..12 native chart)
const s2 = structuredClone(baseStory[1]);
const s2LeftCol = colBox(1, 4, 0.85, 4.75);
const [s2TitleBox, s2MsgBox, s2NoteBox] = splitRows(
  s2LeftCol,
  [0.36, 0.34, 0.3],
  0.22,
);
s2.compositionBrief = {
  ...s2.compositionBrief,
  title: s2TitleBox,
  message: s2MsgBox,
  visualBox: colBox(5, 12, 0.92, 4.62),
  caption: colBox(1, 12, 5.82, 0.72),
  chartFocus: {
    ...s2.compositionBrief.chartFocus,
    noteBox: s2NoteBox,
  },
};

// 3. Slide 3 (causal): NEW `causal-chain` primitive (2 chains × 4 steps)
const s3 = structuredClone(baseStory[2]);
s3.id = "causal-mechanism";
s3.stage = "intervention";
s3.title = "위험 원인별 개입과 검증 사슬";
s3.question = "설비와 현장 조치가 어떤 메커니즘으로 위험을 줄이고 어떻게 검증하는가?";
s3.answer =
  "시야 가림과 인지 지연이라는 두 가지 원인에 대해 물리 분리·AI 알림·유도원 통제·검증 지표를 사슬로 연결한다.";
const s3HeaderRow = colBox(1, 12, 0.78, 1.12);
const [s3TitleBox, s3MsgBox] = splitColumns(s3HeaderRow, [0.58, 0.42], 0.28);
const s3VisualBox = colBox(1, 12, 2.04, 3.74);
const s3ChainRows = splitRows(
  {
    x: s3VisualBox.x + 0.12,
    y: s3VisualBox.y + 0.14,
    w: s3VisualBox.w - 0.24,
    h: s3VisualBox.h - 0.28,
  },
  [1, 1],
  0.26,
);
const c1Cols = splitColumns(s3ChainRows[0], [1, 1, 1, 1], 0.28);
const c2Cols = splitColumns(s3ChainRows[1], [1, 1, 1, 1], 0.28);
const mechIds = p.planning.problem.mechanisms.map((m: any) => m.id);
const intIds = p.planning.interventions.map((m: any) => m.id);
const metricIds = p.planning.validation.map((m: any) => m.id);

s3.visualPlan = {
  ...s3.visualPlan,
  kind: "causal-flow",
  intent: "causal",
  takeaway: "원인·기본조치·현장대응·측정지표를 사슬로 연결",
  encoding: "2개 핵심 위험 원인별 개입·현장 반응·가설 검증 지표의 4단계 사슬",
  legend:
    "인과 가설 모델 · 실제 사고 감소 효과는 현장 실증 기간의 미탐률·지연·완결률 기록으로 검증",
  explanation: {
    readerTask: "두 가지 현장 위험 원인이 각각 어떤 개입과 현장 행동을 거쳐 측정되는지 대조",
    howToRead: "왼쪽 원인부터 오른쪽 가설 결과·측정까지 화살표 순서대로 두 행을 비교",
    notProven: "사슬의 기대 결과는 실증 가설이며 사전 확정된 사고 감소 수치가 아님",
    requiredMarks: ["connectors"],
  },
  readingGuide: {
    message: "원인부터 현장 대응과\n검증 지표까지 연결",
    keyPhrase: "현장 대응",
    focusPhrases: ["현장 대응", "검증 지표"],
    tone: "amber",
  },
  chains: [
    {
      id: "chain-sight",
      cause: "울타리·출입구 시야 가림으로\n보행자·차량 직전 조우",
      intervention: "물리 동선 분리 및\n자체 제작 AI NPU 안전장치",
      response: "유도원 출차 대기 신호 및\n보행자 음성 안내 작동",
      result: "교차 위험 노출 및\n필수 사례 미탐률 측정",
      mechanismIds: [mechIds[0]],
      interventionIds: [intIds[0]],
      alternativeIds: [],
      metricIds: [metricIds[0]],
      evidenceIds: s3.proofClaimIds,
      resultStatus: "hypothesis",
    },
    {
      id: "chain-delay",
      cause: "작업 소음·야간 환경에서\n차량·보행자 상호 인지 지연",
      intervention: "컬러 LED AIoT 전광판 및\n현장 유도원 확인 절차",
      response: "운전자 정지·서행 확인 및\n담당자 조치 이력 기록",
      result: "경고 전달 지연(p95) 및\n현장 조치 완결률 검증",
      mechanismIds: [mechIds[1] || mechIds[0]],
      interventionIds: [intIds[1] || intIds[0]],
      alternativeIds: [],
      metricIds: [metricIds[1] || metricIds[0]],
      evidenceIds: s3.proofClaimIds,
      resultStatus: "hypothesis",
    },
  ],
};
s3.compositionBrief = {
  engine: "authored-v1",
  role: "explanation",
  visual: "causal-chain",
  rationale: "단순 흐름도 대신 원인→개입→현장반응→측정지표의 4단계 인과 사슬을 명시",
  readingPath: "상단 핵심 문구를 읽은 뒤 두 줄의 인과 사슬을 좌에서 우로 따라가며 검증 지표를 확인",
  continuity: "도시 데이터 한계에서 실제 현장 개입 메커니즘과 화면 작동으로 연결",
  title: s3TitleBox,
  message: s3MsgBox,
  visualBox: s3VisualBox,
  caption: colBox(1, 12, 5.96, 0.56),
  titleAlign: "left",
  nodeBoxes: {
    "chain-sight:cause": c1Cols[0],
    "chain-sight:intervention": c1Cols[1],
    "chain-sight:response": c1Cols[2],
    "chain-sight:result": c1Cols[3],
    "chain-delay:cause": c2Cols[0],
    "chain-delay:intervention": c2Cols[1],
    "chain-delay:response": c2Cols[2],
    "chain-delay:result": c2Cols[3],
  },
  edgeLabelBoxes: {},
  typography: {
    titleSize: 32,
    messageSize: 20,
    nodeTitleSize: 17,
    bodySize: 16,
    captionSize: 14,
  },
  narrative: {
    beliefShift: "개별 장비 도입이 아니라 원인별 현장 대응 사슬과 측정 지표를 함께 설계함을 이해",
    evidenceClaimIds: s3.proofClaimIds,
    nextQuestion: "현장 내부 운전자와 유도원은 실제 화면에서 어떤 상태 정보를 보게 되는가?",
  },
};

// 4. Slide 4 (screen): NEW `annotated-screen` primitive
const s4 = structuredClone(baseStory[3]);
s4.id = "driver-screen-view";
s4.stage = "operation";
s4.title = "운전자 전광판 화면과 3단계 통제 상태";
s4.question = "현장 내부 운전자와 유도원은 어떤 화면 표시와 통제 원칙에 따라 행동하는가?";
s4.answer =
  "객체 인식 박스와 출차 대기 경고를 표시하되, 미검출을 통행 허가로 간주하지 않고 유도원 통제를 우선한다.";
const s4HeaderRow = colBox(1, 12, 0.78, 1.12);
const [s4TitleBox, s4MsgBox] = splitColumns(s4HeaderRow, [0.58, 0.42], 0.28);
const s4VisualBox = colBox(1, 12, 2.04, 3.74);
const [s4LeftPane, s4RightPane] = splitColumns(
  {
    x: s4VisualBox.x + 0.1,
    y: s4VisualBox.y + 0.1,
    w: s4VisualBox.w - 0.2,
    h: s4VisualBox.h - 0.2,
  },
  [0.52, 0.48],
  0.26,
);
const [s4FrameBox, s4BannerBox] = splitRows(s4LeftPane, [0.78, 0.22], 0.14);
const s4StateBoxes = splitRows(s4RightPane, [1, 1, 1], 0.14);

s4.visualPlan = {
  ...s4.visualPlan,
  kind: "boundary",
  intent: "structural",
  interfaceExample: {
    kind: "alerts",
    dataStatus: "illustrative",
    basisClaimIds: s4.proofClaimIds,
    scenario: "천안시 공사현장 내부 출차 대기 및 보행자 접근 경고 예시",
    at: "현장 출입구 내부 전광판",
    metrics: [
      { label: "감지 상태", value: "보행자 접근", tone: "danger" },
      { label: "차량 지시", value: "출차 대기", tone: "caution" },
      { label: "통제 권한", value: "현장 유도원 우선", tone: "neutral" },
    ],
    records: [
      {
        name: "전광판 경고 송출",
        status: "감지됨",
        detail: "운전자 정지·유도원 확인 대기",
        updated: "즉시",
      },
    ],
    evidence: [{ label: "표시 원칙", value: "안전기호·공공안내 중심" }],
    decision: {
      title: "유도원 통제 우선",
      reason: "미검출이 통행 허가를 의미하지 않음",
      action: "유도원 육안 확인 후 출차 지시 (미검출은 통행 허가 아님)",
    },
    image: {
      path: "examples/assets/product-driver-led-v8.png",
      caption: "운전자 방향 컬러 LED AIoT 전광판 개념 예시",
      origin: "generated-concept",
    },
  },
  scene: {
    path: "examples/assets/product-driver-led-v8.png",
    rights: "generated",
    caption: "운전자 방향 컬러 LED AIoT 전광판 개념 예시",
    reuseReason: "내부 출차 대기 화면과 객체 표시 구성을 설명하기 위한 개념 자산",
    annotations: [
      { nodeId: "state-detect", x: 0.78, y: 0.36 },
      { nodeId: "state-clear", x: 0.56, y: 0.54 },
    ],
  },
  nodes: [
    {
      id: "state-detect",
      label: "감지됨 · 출차 대기",
      detail: "보행자 접근 표시 · 유도원 정지 신호 우선",
      icon: "bell",
    },
    {
      id: "state-clear",
      label: "미검출 · 서행 및 직접 확인",
      detail: "통행 허가 아님 · 사각지대 육안 확인 필수",
      icon: "shield",
    },
    {
      id: "state-fault",
      label: "점검 필요 · 수동 통제 전환",
      detail: "센서·통신 이상 시 즉시 현장 수동 통제",
      icon: "clipboard",
    },
  ],
  edges: [],
  takeaway: "미검출은 통행 허가가 아니며 유도원 통제가 우선",
  encoding: "실제 전광판 프레임·객체 인식 박스·통제 배너와 우측 3단계 상태 해석 패널",
  legend:
    "화면 구성 예시 · 실제 CCTV 영상은 권한자 전용이며 전광판은 안전기호·공공안내 중심 표시",
  explanation: {
    readerTask: "화면 내 객체 인식 표시와 하단 통제 배너, 우측 3가지 상태별 행동 원칙을 대조",
    howToRead: "왼쪽 프레임의 객체 박스와 주황색 통제 배너를 본 뒤 오른쪽 3단계 상태 카드를 확인",
    notProven: "개념 화면 예시는 실제 현장 인식률이나 자동 통행 허가 성능을 증명하지 않음",
    requiredMarks: ["scene", "screen"],
  },
  readingGuide: {
    message: "미검출은 통행 허가가 아니며\n유도원 직접 확인이 우선",
    keyPhrase: "유도원 직접 확인",
    focusPhrases: ["유도원 직접 확인", "통행 허가"],
    tone: "amber",
  },
};
s4.compositionBrief = {
  engine: "authored-v1",
  role: "explanation",
  visual: "annotated-screen",
  rationale: "장비 화면의 객체 인식 표시와 유도원 현장 통제 우선 원칙을 한 화면에서 대조",
  readingPath: "왼쪽 전광판 프레임과 하단 통제 배너를 확인한 후 오른쪽 3가지 상태 기준을 읽음",
  continuity: "인과 메커니즘에서 실제 장비 화면과 주체별 책임 스윔레인으로 연결",
  title: s4TitleBox,
  message: s4MsgBox,
  visualBox: s4VisualBox,
  caption: colBox(1, 12, 5.96, 0.56),
  titleAlign: "left",
  nodeBoxes: {},
  edgeLabelBoxes: {},
  screenLayout: {
    frameBox: s4FrameBox,
    statusBannerBox: s4BannerBox,
    sidePanelBoxes: {
      "state-detect": s4StateBoxes[0],
      "state-clear": s4StateBoxes[1],
      "state-fault": s4StateBoxes[2],
    },
  },
  typography: {
    titleSize: 32,
    messageSize: 20,
    nodeTitleSize: 17,
    bodySize: 16,
    captionSize: 14,
  },
  narrative: {
    beliefShift: "AI 화면 표시는 보조 수단이며 미검출 상태에서도 유도원 확인이 필수임을 이해",
    evidenceClaimIds: s4.proofClaimIds,
    nextQuestion: "감지 이후 시스템과 현장 담당자의 책임 경계는 어떻게 나뉘는가?",
  },
};

// 5. Slide 5 (swimlane): NEW `swimlane` primitive + orthogonal `edgeRoutes`
const s5 = structuredClone(baseStory[3]);
s5.id = "responsibility-swimlane";
s5.stage = "operation";
s5.title = "시스템 알림과 현장 통제의 책임 경계";
s5.question = "감지 알림 이후 누가 실제로 통제하고 어떻게 결과를 남기는가?";
s5.answer =
  "시스템은 감지와 경고·로그 저장을 맡고, 실제 출차·보행 통제와 현장 확인은 유도원과 안전관리자가 수행한다.";
const s5HeaderRow = colBox(1, 12, 0.78, 1.12);
const [s5TitleBox, s5MsgBox] = splitColumns(s5HeaderRow, [0.58, 0.42], 0.28);
const s5VisualBox = colBox(1, 12, 2.04, 3.74);
const [sysLaneBox, humanLaneBox] = splitRows(
  {
    x: s5VisualBox.x + 0.08,
    y: s5VisualBox.y + 0.08,
    w: s5VisualBox.w - 0.16,
    h: s5VisualBox.h - 0.16,
  },
  [1, 1],
  0.22,
);
const sysNodeCols = splitColumns(
  {
    x: sysLaneBox.x + 1.65,
    y: sysLaneBox.y + 0.16,
    w: sysLaneBox.w - 1.85,
    h: sysLaneBox.h - 0.32,
  },
  [1, 1],
  1.2,
);
const humanNodeCols = splitColumns(
  {
    x: humanLaneBox.x + 1.65,
    y: humanLaneBox.y + 0.16,
    w: humanLaneBox.w - 1.85,
    h: humanLaneBox.h - 0.32,
  },
  [1, 1],
  1.2,
);
const nNotify = sysNodeCols[0];
const nVerify = sysNodeCols[1];
const nControl = humanNodeCols[0];
const nAct = humanNodeCols[1];

s5.visualPlan = {
  ...s5.visualPlan,
  kind: "flow",
  intent: "structural",
  nodes: [
    {
      id: "notify",
      label: "접근 감지·전광판 경고",
      detail: "보행자·차량 접근 시 즉시 알림 발송",
      icon: "bell",
    },
    {
      id: "control",
      label: "유도원 현장 육안 확인",
      detail: "사각지대 및 보행자 동선 직접 확인",
      icon: "person",
    },
    {
      id: "act",
      label: "출차 대기·보행 통제 수행",
      detail: "수신호·차단봉으로 물리적 통제 실행",
      icon: "team",
    },
    {
      id: "verify",
      label: "조치 결과·이력 기록",
      detail: "발송 시각과 실제 조치 결과를 구분 저장",
      icon: "clipboard",
    },
  ],
  edges: [
    { from: "notify", to: "control", label: "경고 발송" },
    { from: "control", to: "act", label: "육안 통제" },
    { from: "act", to: "verify", label: "결과 기록" },
  ],
  takeaway: "시스템 경고와 현장 유도원의 실제 통제 책임을 분리",
  encoding: "시스템 행과 현장 담당자 행을 분리한 2×2 스윔레인 및 직교 인계 경로",
  legend: "제안 운영 책임 경계 · 시스템 ACK는 물리적 통제 완료를 의미하지 않음",
  explanation: {
    readerTask: "상단 시스템 행과 하단 현장 담당자 행 사이의 인계 경로와 책임 분리를 확인",
    howToRead: "상단 감지·경고에서 하단 유도원 확인·통제로 내려간 뒤 다시 상단 이력 기록으로 올라가는 직교 화살표를 추적",
    notProven: "현장 인력 배치 기준과 세부 운영 수칙은 발주처·시공사 협의 필요",
    requiredMarks: ["connectors"],
  },
  readingGuide: {
    message: "시스템 경고와 현장 유도원의\n실제 통제 책임을 분리",
    keyPhrase: "실제 통제 책임",
    focusPhrases: ["실제 통제 책임", "시스템 경고"],
    tone: "blue",
  },
};
const laneGapCenterY =
  Math.round(((sysLaneBox.y + sysLaneBox.h + humanLaneBox.y) / 2) * 1000) /
  1000;
s5.compositionBrief = {
  engine: "authored-v1",
  role: "explanation",
  visual: "swimlane",
  rationale: "시스템 자동 알림과 인간 담당자의 물리적 통제 책임을 행(Lane)으로 명확히 분리",
  readingPath: "상단 시스템 행의 감지에서 하단 유도원 확인·통제를 거쳐 상단 조치 기록으로 이동",
  continuity: "화면 상태 기준에서 현장 운영 책임과 후보지 조사로 연결",
  title: s5TitleBox,
  message: s5MsgBox,
  visualBox: s5VisualBox,
  caption: colBox(1, 12, 5.96, 0.56),
  titleAlign: "left",
  nodeBoxes: {
    notify: nNotify,
    control: nControl,
    act: nAct,
    verify: nVerify,
  },
  edgeLabelBoxes: {
    "notify:control": {
      x: Math.round((nNotify.x + nNotify.w / 2 + 0.12) * 1000) / 1000,
      y: Math.round((laneGapCenterY - 0.14) * 1000) / 1000,
      w: 0.95,
      h: 0.28,
    },
    "control:act": {
      x: Math.round((nControl.x + nControl.w + 0.12) * 1000) / 1000,
      y: Math.round((nControl.y + nControl.h / 2 - 0.36) * 1000) / 1000,
      w: 0.95,
      h: 0.28,
    },
    "act:verify": {
      x: Math.round((nAct.x + nAct.w / 2 + 0.12) * 1000) / 1000,
      y: Math.round((laneGapCenterY - 0.14) * 1000) / 1000,
      w: 0.95,
      h: 0.28,
    },
  },
  edgeRoutes: {
    "notify:control": {
      waypoints: [
        [nNotify.x + nNotify.w / 2, nNotify.y + nNotify.h],
        [nControl.x + nControl.w / 2, nControl.y],
      ],
    },
    "control:act": {
      waypoints: [
        [nControl.x + nControl.w, nControl.y + nControl.h / 2],
        [nAct.x, nAct.y + nAct.h / 2],
      ],
    },
    "act:verify": {
      waypoints: [
        [nAct.x + nAct.w / 2, nAct.y],
        [nVerify.x + nVerify.w / 2, nVerify.y + nVerify.h],
      ],
    },
  },
  swimlaneLayout: {
    laneHeaderWidth: 1.45,
    lanes: {
      "시스템 영역": sysLaneBox,
      "현장 담당자": humanLaneBox,
    },
    nodeLanes: {
      notify: "시스템 영역",
      control: "현장 담당자",
      act: "현장 담당자",
      verify: "시스템 영역",
    },
  },
  typography: {
    titleSize: 32,
    messageSize: 20,
    nodeTitleSize: 18,
    bodySize: 16,
    captionSize: 14,
  },
  narrative: {
    beliefShift: "장치 응답(ACK)과 유도원의 실제 통제 완료가 구조적으로 분리·기록됨을 확인",
    evidenceClaimIds: s5.proofClaimIds,
    nextQuestion: "천안시 내 어떤 참고 위치에서 현장 조사를 시작할 것인가?",
  },
};

// 6. Slide 6 (geography) & 7. Slide 7 (acceptance): keep clean grid-aligned compositions
const s6 = structuredClone(baseStory[4]);
const s7 = structuredClone(baseStory[6]);

p.planning.story = [s1, s2, s3, s4, s5, s6, s7];

const parsed = Project.parse(p);
const audit = planningAudit(parsed, false);
if (audit.status === "blocked") {
  throw Error(`Planning audit blocked: ${JSON.stringify(audit.issues, null, 2)}`);
}
parsed.slides = compileStoryboard(parsed);
const finalProject = Project.parse(parsed);
await fs.writeFile(
  "examples/upgraded-showcase.project.json",
  JSON.stringify(finalProject, null, 2),
);
console.log("Created examples/upgraded-showcase.project.json successfully.");
