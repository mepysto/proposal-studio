import fs from "node:fs/promises";
import { Project } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningAudit,
} from "../packages/planning/index.js";
const input = JSON.parse(
  await fs.readFile("examples/concept-direction.project.json", "utf8"),
);
input.id = "reference-direction";
input.title = "현장 대응의 설명과 근거 — 참고 원리 적용 예제";
input.designDirection.deliveryMode = "presented";
const refs = [
  {
    id: "REF-UBER",
    title: "Uber / Transplace Acquisition — design reference",
    url: "https://s23.q4cdn.com/407969754/files/doc_presentations/2021/07/Uber-Transplace-Acquisition.pdf",
  },
  {
    id: "REF-DUARTE",
    title:
      "Duarte / When presenting data, get to the point fast — design reference",
    url: "https://www.duarte.com/blog/when-presenting-data-get-to-the-point-fast/",
  },
  {
    id: "REF-AIRBNB",
    title: "Airbnb / Q4 2024 Shareholder Letter — design reference",
    url: "https://s26.q4cdn.com/656283129/files/doc_financials/2024/q4/Airbnb_Q4-2024-Shareholder-Letter_Final.pdf",
  },
];
for (const ref of refs)
  input.sources.push({
    ...ref,
    scope: "general",
    applicability:
      "디자인 원리만 참고. 해당 회사 수치·로고·실적은 본 제안의 근거가 아님",
  });
input.designDirection.references.push(
  ...refs.map((ref) => ({
    sourceId: ref.id,
    role: "design",
    adopt: ["설명 목적에 맞는 위계와 선택적 강조"],
    reject: ["원문 브랜드·수치·표현·고객 로고의 복제"],
    reason: "공식 공개 자료의 일부 페이지를 직접 읽고 원리를 새 내용에 적용",
  })),
);
const app = (
  sourceId: string,
  locator: string,
  principle: string,
  application: string,
  controls: string[],
) => ({
  sourceId,
  locator,
  principle,
  application,
  controls,
  notCopied: "원본 글자·브랜드·수치·스크린샷은 복사하지 않음",
});
const pages = input.planning.story;
const questions = [
  "차량과 보행자가 어느 지점에서 충돌할 수 있는가?",
  "도시 전체 수치로 공사장 수요를 확정할 수 있는가?",
  "접근 알림 이후 누가 실제 행동을 하는가?",
  "장치 응답과 통제 완료를 어떻게 나눠 확인하는가?",
  "지도상의 참고 위치에서 무엇을 조사해야 하는가?",
  "기존 안전조치에 AI가 더할 보완 범위는 무엇인가?",
  "실증 이후 어떤 근거로 다음 단계를 결정할 것인가?",
];
for (const [i, s] of pages.entries()) s.question = questions[i];
for (const [i, s] of pages.entries()) {
  s.compositionBrief.narrative = {
    beliefShift: [
      "현장의 물리적 관계부터 이해",
      "도시 수치를 현장 성과와 구별",
      "알림과 실제 조치의 경계를 이해",
      "장치 응답과 완료 확인의 차이 이해",
      "위치 참고와 현장 조사 권한을 구별",
      "기존 대응에 더할 보완 범위를 판단",
      "실증 결과와 남은 조건으로 다음 단계 판단",
    ][i],
    evidenceClaimIds: s.proofClaimIds,
    nextQuestion:
      i + 1 < pages.length
        ? pages[i + 1].question
        : "실제 현장 조사와 조건 협의에 착수할 수 있는가?",
  };
}
const spatial = pages[0].compositionBrief;
spatial.typography = { titleSize: 36, messageSize: 22, captionSize: 14 };
spatial.referenceApplications = [
  app(
    "REF-UBER",
    "PDF p.12",
    "전환 시점의 핵심 판단을 큰 글자로 우선 인지",
    "장면 옆 제목을 키우고 현장 통제 원칙과 분리",
    ["typography"],
  ),
];
pages[1].visualPlan.readingGuide.message = "도시 지표와\n현장 수요를 구분";
const chart = pages[1].compositionBrief;
chart.message.h = 1.25;
chart.typography = {
  titleSize: 32,
  messageSize: 21,
  bodySize: 16,
  captionSize: 14,
};
chart.chartFocus = {
  series: "보행자 사망자",
  reason: "전체 집계와 중첩되는 보행자 부분을 구별해 읽음",
  claimIds: ["reported-city-traffic"],
  noteBox: { x: 0.64, y: 4.5, w: 3.1, h: 1.05 },
};
chart.referenceApplications = [
  app(
    "REF-DUARTE",
    "article: before table / after bar",
    "모든 값의 동등한 강조보다 질문에 맞는 계열을 식별",
    "원자료는 유지하며 보행자 계열과 직접 표기를 강조",
    ["chartFocus"],
  ),
];
const handoff = pages[2].compositionBrief;
handoff.nodeTreatment = "open";
handoff.typography = {
  titleSize: 34,
  messageSize: 21,
  nodeTitleSize: 21,
  bodySize: 17,
  captionSize: 14,
};
handoff.referenceApplications = [
  app(
    "REF-UBER",
    "PDF p.16",
    "설명의 묶음을 매번 카드로 감싸지 않고 위계로 구분",
    "세 대응 주체는 열린 경계와 실제 관계로 설명",
    ["nodeTreatment", "typography"],
  ),
];
const map = pages[4].compositionBrief;
map.mapLayout = {
  image: { x: 0.64, y: 1.65, w: 8.1, h: 3.5 },
  labels: {
    A: { x: 9.1, y: 1.92, w: 3.5, h: 0.7 },
    B: { x: 9.1, y: 3.0, w: 3.5, h: 0.7 },
    C: { x: 9.1, y: 4.05, w: 3.5, h: 0.7 },
  },
};
map.referenceApplications = [
  app(
    "REF-AIRBNB",
    "PDF p.7",
    "주 시각물과 그 의미를 설명하는 문구의 대응을 명확히 함",
    "참고 지도와 각 위치 설명의 영역을 직접 지정",
    ["mapLayout"],
  ),
];
// Preserve exact story-to-slide state before rendering.
const parsed = Project.parse(input);
const audit = planningAudit(parsed, false);
if (audit.status === "blocked") throw Error(JSON.stringify(audit.issues));
parsed.slides = compileStoryboard(parsed);
await fs.writeFile(
  "examples/reference-direction.project.json",
  JSON.stringify(Project.parse(parsed), null, 2),
);
console.log(
  "Authored reference applications without copying external slide assets or data",
);
