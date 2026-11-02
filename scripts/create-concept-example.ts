import fs from "node:fs/promises";
import { Project } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningAudit,
} from "../packages/planning/index.js";
const base = JSON.parse(
  await fs.readFile("examples/smartfence-v2.project.json", "utf8"),
);
const full = JSON.parse(
  await fs.readFile("examples/smartfence-full.project.json", "utf8"),
);
const p = base;
p.id = "concept-direction";
p.title = "현장안전 대응을 설명하는 기획별 구성";
p.materials = [];
p.proposer = full.proposer;
p.sources = [
  ...new Map(
    [...base.sources, ...full.sources].map((s: any) => [s.id, s]),
  ).values(),
];
p.claims = [
  ...new Map(
    [...base.claims, ...full.claims].map((s: any) => [s.id, s]),
  ).values(),
];
p.geographicAssets = full.geographicAssets;
p.quantitativeDatasets = full.quantitativeDatasets;
p.design = {
  ...full.design,
  name: "SLT field response / authored compositions",
  colors: {
    ink: "242F35",
    paper: "FCFAF4",
    accent: "8A4A25",
    muted: "4A5C62",
    dark: "242F35",
  },
  bodySize: 19,
};
p.designDirection = {
  concept: "공간의 위험과 감지 이후의 현장 대응을 연결한다",
  visualThesis:
    "위험은 큰 현장 장면으로, 한계는 실제 데이터로, 대응은 사람과 기록의 관계로 보여준다",
  brandConstraints: [
    "제안 주관은 (주)에스엘티",
    "실제 제공 명칭·근거·편집 가능 텍스트 유지",
  ],
  avoid: [
    "모든 장표에 같은 높이의 전폭 강조 띠",
    "AI 감지를 물리적 통제 완료처럼 표현",
    "위험도 순위·실증 성과의 임의 시각화",
  ],
  references: [
    {
      sourceId: "M1",
      role: "content",
      adopt: ["물리적 분리와 현장 통제 우선"],
      reject: ["과거 사례의 고정 구도 자동 승계"],
      reason: "제안의 현장 대응 논리를 구도의 기준으로 삼음",
    },
  ],
  palette: { blue: "335C81", amber: "975E19", tealTint: "F3E8DD" },
};
p.slides = [];
p.planning.visualPolicy = {
  mode: "visual-first",
  requireEverySlide: true,
  requireExplanationContract: true,
  minVisualAreaRatio: 0.24,
};
const box = (x: number, y: number, w: number, h: number) => ({ x, y, w, h });
const compose = (
  visual: string,
  title: object,
  message: object,
  visualBox: object,
  caption: object,
  role: string,
  rationale: string,
  readingPath: string,
  nodeBoxes = {},
  edgeLabelBoxes = {},
) => ({
  engine: "authored-v1",
  visual,
  role,
  title,
  message,
  visualBox,
  caption,
  rationale,
  readingPath,
  continuity: "문제의 인지에서 근거와 현장 대응의 검증으로 연결",
  nodeBoxes,
  edgeLabelBoxes,
});
const nodes = [
  { id: "notify", label: "알림 전달", detail: "전달 여부 기록", icon: "bell" },
  {
    id: "control",
    label: "현장 통제",
    detail: "유도원 직접 확인",
    icon: "team",
  },
  {
    id: "verify",
    label: "조치 기록",
    detail: "실제 조치와 시각",
    icon: "clipboard",
  },
];
const evidence = ["response-chain", "manual-authority", "warning-proposal"];
const graph = {
  kind: "flow",
  intent: "structural",
  nodes,
  edges: [
    { from: "notify", to: "control", label: "담당자 확인" },
    { from: "control", to: "verify", label: "조치 결과" },
  ],
  legend: "제안 운영 흐름 · 경고 발송은 실제 통제의 완료를 뜻하지 않음",
  encoding: "현장 대응 주체와 기록을 선언한 영역과 관계로 연결",
  evidenceIds: evidence,
};
const plan = (
  id: string,
  stage: string,
  title: string,
  message: string,
  key: string,
  v: any,
  compositionBrief: any,
  extraClaims: string[] = [],
) => ({
  id,
  stage,
  title,
  question: "이 페이지에서 어떤 현장 관계와 근거를 확인해야 하는가?",
  answer: `${message} 현장 조건과 책임자의 직접 확인을 바탕으로 검토한다.`,
  proofClaimIds: [...new Set([...v.evidenceIds, ...extraClaims])],
  visualPurpose: compositionBrief.rationale,
  limitation: "제안 설명용 구성 · 실제 현장 설치·성능·운영 합의가 아님",
  visualPlan: {
    ...v,
    takeaway: message,
    explanation: {
      readerTask: compositionBrief.rationale,
      howToRead: compositionBrief.readingPath,
      notProven: "현장 수요·장치 성능·조치 이행의 실측 결과를 입증하지 않음",
      requiredMarks: [
        compositionBrief.visual === "graph"
          ? "connectors"
          : compositionBrief.visual,
      ],
    },
    readingGuide: {
      message,
      keyPhrase: key,
      focusPhrases: [key],
      tone: "amber",
    },
  },
  compositionBrief,
});
const scene = structuredClone(
  full.planning.story.find((s: any) => s.id === "problem").visualPlan,
);
scene.kind = "site";
scene.scene.reuseReason =
  "기존 공간 개념 자산을 새 구도에서 설명용으로 활용하며 실제 설치 현장으로 표현하지 않음";
scene.nodes = [
  { id: "truck", label: "차량 출입", detail: "", icon: "gate" },
  { id: "walk", label: "보행 동선", detail: "", icon: "person" },
  { id: "human", label: "유도원 확인", detail: "", icon: "team" },
];
scene.scene.annotations = [
  { nodeId: "truck", x: 0.63, y: 0.25 },
  { nodeId: "walk", x: 0.41, y: 0.72 },
  { nodeId: "human", x: 0.79, y: 0.56 },
];
scene.legend =
  "출입구 공간 개념 · 실제 천안 현장 사진·실측 도면 아님 · 동선 분리와 유도원 통제 우선";
const chart = structuredClone(
  full.planning.story.find((s: any) => s.id === "policy-fit").visualPlan,
);
const map = structuredClone(
  full.planning.story.find((s: any) => s.id === "sites").visualPlan,
);
const comparison = {
  ...graph,
  nodes: base.planning.alternatives.map((a: any) => ({
    id: a.id,
    label: a.name,
    detail: a.addresses,
    icon: "document",
  })),
  kind: "comparison",
  intent: "comparative",
  edges: [],
  legend:
    "도입 검토용 비교 · 현행 운영이 미흡하다는 현장 관측 아님 · 추가 기능은 실증 필요",
  evidenceIds: [
    ...new Set(base.planning.alternatives.flatMap((a: any) => a.claimIds)),
  ],
};
const timeline = {
  kind: "timeline",
  intent: "temporal",
  encoding: "기간의 실제 길이와 단계 산출물을 연결하는 제안 일정",
  evidenceIds: ["scope", "readiness"],
  legend: "제안 일정 예시 · 착수·현장 운영 조건과 수용기준은 별도 협의",
  nodes: [
    {
      id: "a",
      label: "조사·협의",
      detail: "위험·설치 조건 확인",
      icon: "document",
    },
    {
      id: "b",
      label: "설치·시험",
      detail: "전달·통제·장애 시험",
      icon: "camera",
    },
    {
      id: "c",
      label: "현장 운영",
      detail: "운영 부담·결측 함께 기록",
      icon: "clipboard",
    },
    {
      id: "d",
      label: "평가·판단",
      detail: "확대·수정·중단 근거 확인",
      icon: "team",
    },
  ],
  edges: [],
  schedule: {
    slots: 8,
    unitLabel: "개월차",
    ranges: [
      { nodeId: "a", start: 0, length: 1 },
      { nodeId: "b", start: 1, length: 2 },
      { nodeId: "c", start: 3, length: 4 },
      { nodeId: "d", start: 7, length: 1 },
    ],
  },
};
p.planning.story = [
  plan(
    "spatial",
    "problem",
    "출입구에서\n만나는 동선",
    "동선 분리와\n현장 통제가 우선",
    "현장 통제",
    scene,
    compose(
      "scene",
      box(9.1, 0.85, 3.55, 1.5),
      box(9.1, 2.75, 3.55, 2),
      box(0.64, 0.8, 8, 4.8),
      box(0.64, 5.95, 12, 0.6),
      "orientation",
      "차량과 시민이 만나는 물리적 접점을 먼저 인지",
      "왼쪽 큰 현장에서 차량·시민·유도원 관계를 보고 오른쪽 통제 원칙으로 이동",
      {
        truck: box(0.8, 1.02, 2.25, 0.48),
        walk: box(0.8, 5.02, 2.25, 0.48),
        human: box(6.1, 5.02, 2.35, 0.48),
      },
    ),
  ),
  plan(
    "evidence",
    "problem",
    "도시 지표와\n현장 근거의 차이",
    "도시 지표는\n현장 수요의 증거와 구분",
    "현장 수요",
    chart,
    compose(
      "chart",
      box(0.64, 0.85, 3.1, 1.8),
      box(0.64, 3.0, 3.1, 2.2),
      box(4.1, 0.95, 8.55, 4.55),
      box(0.64, 5.8, 12.05, 0.8),
      "evidence",
      "도시 전체의 보도 수치와 현장 수요의 차이를 이해",
      "오른쪽 실제 수치 비교와 하단 집계 한계를 확인한 후 왼쪽 판단 문구로 이동",
    ),
  ),
  plan(
    "handoff",
    "intervention",
    "알림 이후의 현장 대응",
    "알림과 실제 조치를 구분",
    "실제 조치",
    graph,
    compose(
      "graph",
      box(0.8, 0.85, 7.9, 0.9),
      box(9.0, 0.8, 3.6, 1.1),
      box(0.8, 2.3, 11.8, 3.3),
      box(0.8, 6.0, 11.8, 0.55),
      "explanation",
      "알림 전달에서 실제 통제와 기록으로 이어지는 책임 경로",
      "가로로 연결한 세 단계의 담당 행동을 읽고 조치 결과가 남는 지점을 확인",
      {
        notify: box(1, 3, 3, 1.9),
        control: box(5.05, 3, 3, 1.9),
        verify: box(9.1, 3, 3, 1.9),
      },
      {
        "notify:control": box(4.05, 3.25, 0.95, 0.6),
        "control:verify": box(8.12, 3.25, 0.9, 0.6),
      },
    ),
  ),
  plan(
    "responsibility",
    "operation",
    "현장 통제와\n조치 확인의 구분",
    "장치 응답만으로\n통제 완료를 판단하지 않음",
    "통제 완료",
    graph,
    compose(
      "graph",
      box(0.64, 0.85, 4.05, 1.5),
      box(0.64, 2.8, 4.05, 2.3),
      box(5.3, 0.8, 7.3, 5.4),
      box(0.64, 6.25, 12, 0.4),
      "explanation",
      "같은 대응 관계를 세로로 놓아 단계별 완료 확인에 집중",
      "왼쪽 확인 원칙을 보고 오른쪽 세 단계에서 장치 응답과 현장 행동을 분리",
      {
        notify: box(6.8, 0.9, 4.4, 1.5),
        control: box(6.8, 2.7, 4.4, 1.5),
        verify: box(6.8, 4.5, 4.4, 1.5),
      },
      {
        "notify:control": box(9.25, 2.42, 2.25, 0.25),
        "control:verify": box(9.25, 4.22, 2.25, 0.25),
      },
    ),
  ),
  plan(
    "geography",
    "scenario",
    "참고 위치에서 현장 조사로",
    "참고 좌표와 확정 출입구를 구분",
    "확정 출입구",
    map,
    compose(
      "map",
      box(0.9, 0.8, 11.6, 0.7),
      box(3.2, 5.35, 9.4, 0.7),
      box(0.64, 1.65, 12.0, 3.5),
      box(0.64, 6.15, 12.0, 0.45),
      "orientation",
      "지역 참고 위치를 먼저 읽고 현장 조사 조건을 확인",
      "지도 A·B·C와 오른쪽 위치 이름을 대조하고 하단의 조사 한계를 확인",
    ),
  ),
  plan(
    "alternatives",
    "alternatives",
    "기존 대응과 AI 보완의 범위",
    "기존 안전조치에\n알림과 기록을 보완",
    "기존 안전조치",
    comparison,
    compose(
      "comparison",
      box(0.64, 0.8, 6.1, 1.1),
      box(7.2, 0.8, 5.4, 1.1),
      box(0.64, 2.35, 12.0, 3.4),
      box(0.64, 6.0, 12, 0.5),
      "decision",
      "기존 동선·유도원과 제안 기능을 공통 기준으로 비교",
      "열마다 대응 범위와 한계를 같은 행에서 비교한 뒤 추가 검증 필요를 판단",
    ),
  ),
  plan(
    "acceptance",
    "validation",
    "실증 기간과 단계별 확인",
    "실증 결과로 다음 단계를 판단",
    "다음 단계",
    timeline,
    compose(
      "timeline",
      box(0.8, 0.8, 11.8, 0.7),
      box(0.8, 1.65, 9.0, 0.65),
      box(0.8, 2.6, 11.8, 3.5),
      box(0.8, 6.2, 11.8, 0.4),
      "decision",
      "기간의 길이와 단계별 확인 내용을 함께 파악",
      "기간 막대의 길이와 단계 산출물을 대조하고 실증 결과에 따라 다음 판단",
    ),
  ),
];
const parsed = Project.parse(p);
const audit = planningAudit(parsed, false);
if (audit.status === "blocked") throw Error(JSON.stringify(audit.issues));
parsed.slides = compileStoryboard(parsed);
await fs.writeFile(
  "examples/concept-direction.project.json",
  JSON.stringify(Project.parse(parsed), null, 2),
);
console.log("Authored 7-page composition example; existing projects unchanged");
