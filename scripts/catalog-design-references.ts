import fs from "node:fs/promises";
import path from "node:path";
import { hash } from "../packages/core/store.js";
const root = "references/research/design-benchmark-2026-10-31";
const records = [
  {
    id: "REF-UBER",
    title: "Uber / Transplace Acquisition",
    kind: "transaction-presentation",
    date: "2021-07",
    url: "https://s23.q4cdn.com/407969754/files/doc_presentations/2021/07/Uber-Transplace-Acquisition.pdf",
    files: ["uber-transplace.pdf"],
    pageCount: 20,
    inspectedPages: [4, 8, 12, 16],
    observations: [
      "장 구분/핵심 논지를 큰 글자로 드러냄",
      "근거 페이지에는 비교 가능한 차트·설명을 배치",
      "고객/수치/조건이 같은 위계가 아니라 역할별로 묶임",
    ],
    adopt: ["페이지 역할에 따른 밀도·글자 위계", "핵심 근거를 선택적으로 강조"],
    reject: [
      "대형 문구만으로 모든 내용 페이지를 대체",
      "브랜드/고객 로고/실적/전망 수치 복제",
    ],
  },
  {
    id: "REF-ATLASSIAN",
    title: "Atlassian FY22 Investor Day — Section 2: Platform",
    kind: "read-ahead-memo",
    date: "2022-04-07",
    url: "https://s206.q4cdn.com/270053503/files/doc_downloads/2022/investor-day/Atlassian-TEAM-FY22-Investor-Day-Section-2-The-Atlassian-platform.pdf",
    files: ["atlassian-platform.pdf"],
    pageCount: 12,
    inspectedPages: [4, 6],
    observations: [
      "연속 문단·부분 강조·사례 삽입으로 읽기용 근거를 설명",
      "사례에서 구조 설명과 수치 근거로 연결",
    ],
    adopt: ["발표용 본문과 읽기용 근거 문서의 역할 분리"],
    reject: [
      "문단 밀도·UI 외곽을 발표 슬라이드에 그대로 복사",
      "타사 고객 추천/비교 수치를 자기 실적으로 사용",
    ],
  },
  {
    id: "REF-AIRBNB",
    title: "Airbnb Q4 2024 Shareholder Letter",
    kind: "shareholder-report",
    date: "2025-02",
    url: "https://s26.q4cdn.com/656283129/files/doc_financials/2024/q4/Airbnb_Q4-2024-Shareholder-Letter_Final.pdf",
    files: ["airbnb-q4-2024.pdf"],
    pageCount: 31,
    inspectedPages: [7, 14],
    observations: [
      "제품 화면과 설명 문구를 같은 사례 안에서 대응",
      "차트 제목/해석 문구/기간·단위/보조 조건을 분리",
    ],
    adopt: [
      "시각물과 설명의 명확한 대응",
      "근거 해석과 조건을 주 시각물 가까이에 유지",
    ],
    reject: [
      "실적 수치·화면·사례 사진 복제",
      "읽기용 세로 지면 밀도를 발표 크기에 그대로 적용",
    ],
  },
  {
    id: "REF-DUARTE",
    title: "Duarte — When presenting data, get to the point fast",
    kind: "data-slide-before-after",
    date: "2018-08-08",
    url: "https://www.duarte.com/blog/when-presenting-data-get-to-the-point-fast/",
    files: ["duarte-before.jpeg", "duarte-after.jpeg"],
    inspectedExamples: ["European Sales table", "Total Europe Sales bar chart"],
    observations: [
      "표의 모든 셀을 동일하게 강조하는 구성과 선택적으로 강조한 막대 차트를 비교",
      "원자료를 삭제하기보다 독자의 질문에 맞는 읽기 경로를 지정",
    ],
    adopt: ["강조 계열과 비교 맥락을 구분", "원자료에 연결한 직접 표기"],
    reject: [
      "원본 수치·문구·이미지 재사용",
      "부분집합 데이터를 임의 누적하거나 인과 효과로 전환",
    ],
  },
];
const enriched = await Promise.all(
  records.map(async (r) => ({
    ...r,
    checkedAt: "2026-10-31",
    reviewScope:
      "listed pages/examples only; not entire document visual review",
    rights:
      "Publicly accessible, rights retained by original publisher; private analysis only. No redistribution license inferred; no source assets copied into customer output.",
    assets: await Promise.all(
      r.files.map(async (file) => ({
        path: path.join(root, file),
        sha256: hash(await fs.readFile(path.join(root, file))),
      })),
    ),
  })),
);
await fs.writeFile(
  "references/design/catalog.json",
  JSON.stringify(
    {
      reviewer: "Codex author",
      finalApproval: false,
      scope: "Design principles, not business evidence",
      records: enriched,
      excluded: [
        {
          candidate: "Atlassian FY26 Investor Forum",
          reason:
            "Download too large in web reader; direct retrieval returned 403. No page-level design observation claimed.",
        },
        {
          candidate: "Spotify Investor Day 2022 media kit",
          reason: "Timed out; no deck visual inspection claimed.",
        },
        {
          candidate: "Airbnb seed deck reposts",
          reason:
            "Original/reproduction provenance ambiguous; official shareholder document used instead.",
        },
      ],
    },
    null,
    2,
  ),
);
console.log(
  "Recorded four source families, hashes, inspected scope and reuse limits",
);
