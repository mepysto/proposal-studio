import fs from "node:fs";
import path from "node:path";
const root = "projects/kangmin-safehome";
const file = path.join(root, "project.json");
const p = JSON.parse(fs.readFileSync(file, "utf8"));
const A = path.join(root, "assets/generated-v2");
const meta = JSON.parse(fs.readFileSync(path.join(A, "assets.json"), "utf8"));
const briefs = JSON.parse(
  fs.readFileSync(path.join(A, "author-image-briefs.json"), "utf8"),
);
const copy: Record<
  string,
  { message: string; rows: string[][]; limit: string; read: string }
> = {
  cover: {
    message: "비접촉 감지와 사람의 확인을 잇는 농촌형 생활안전",
    rows: [
      ["생활 감지", "실내 센서·선택형 실외 AI"],
      ["위험 확인", "센서 융합·음성·버튼 반응"],
      ["사람 연결", "가족·이웃·돌봄기관"],
    ],
    limit: "가칭 · 개발 전 제품 구상",
    read: "집 안의 비카메라 감지와 마당의 선택형 AI, 원격 확인 대상의 관계를 본다.",
  },
  problem: {
    message: "버튼을 누르기 어려운 순간의 확인 공백",
    rows: [
      ["도움 요청의 공백", "버튼이 손에 닿지 않는 상황"],
      ["감지 공간의 공백", "실내에서 마당·창고까지"],
      ["대응 연결의 공백", "누가 연락하고 방문할지"],
    ],
    limit: "상황 재현 개념도 · 실제 사고나 설치 현장 아님",
    read: "바닥에 앉은 사람과 멀리 있는 호출 버튼, 열린 문 밖의 분산된 공간을 함께 본다.",
  },
  zones: {
    message: "거실은 CSI, 욕실·침실은 레이더로 보강",
    rows: [
      ["거실·주방", "CSI · 활동/무활동"],
      ["침실", "CSI + mmWave"],
      ["욕실", "mmWave · 비카메라"],
      ["현관", "문센서 · 외출/귀가"],
      ["마당·창고", "선택형 실외 AI"],
    ],
    limit: "권고 배치 개념도 · 주택 구조·음영·통신 품질 확인 후 범위 확정",
    read: "집의 각 공간과 옆의 동일기준 센서 대응표를 비교한다. 도면은 실측 주택이 아니다.",
  },
  system: {
    message: "가구 안에서 판단하고, 필요한 이벤트를 전달",
    rows: [
      ["센서 관측", "CSI·레이더·문·환경"],
      ["Safety Hub", "융합·개인 기준선·로컬 경보"],
      ["원격 서비스", "이벤트·장비 상태·알림"],
      ["가족·기관", "통화·방문 결과 확인"],
    ],
    limit: "제품·연동 구상 · 칩셋·통신·모델·운영 계약 미확정",
    read: "물리 센서, 가구 내 허브, 원격 서비스, 확인하는 사람의 순서를 본다. 관측과 이벤트 및 알림을 구분한다.",
  },
  wifi: {
    message: "Wi-Fi의 생활 감지와 안전 확정을 구분",
    rows: [
      ["우선 검증", "존재·움직임·장시간 무활동"],
      ["교차확인", "낙상은 레이더·반응과 결합"],
      ["연구 범위", "호흡 미세움직임"],
      ["1세대 제외", "심박·의료 판단"],
    ],
    limit:
      "RF 표현은 개념도 · 모든 공유기에서 CSI 제공 불가 · 지원 노드와 보정 필요",
    read: "두 전용 노드 사이의 사람 움직임과 개념 RF 경로를 본 뒤 기능별 적용 상태를 비교한다.",
  },
  response: {
    message: "낙상 후보 → 반응 확인 → 연락 → 사람의 확인",
    rows: [
      ["낙상 후보", "자세·동작 변화"],
      ["교차확인", "무동작·음성·큰 버튼"],
      ["고위험 경보", "가족·기관 연락"],
      ["사람의 확인", "통화·방문·조치"],
    ],
    limit:
      "대표 흐름 · 발송 ≠ 조치 완료 · 기관 연계는 계약 범위 · 화재/가스는 즉시 로컬 경보",
    read: "욕실 안 비카메라 센서와 문 밖 음성/버튼 허브를 보고 오른쪽 흐름 및 회복/불확실 분기를 읽는다.",
  },
  events: {
    message: "정상 휴식과 위험 후보를 구분하고 사람이 확인",
    rows: [
      ["마당의 활동·정지", "휴식·쓰러짐 후보 교차확인"],
      ["외출 뒤 미복귀", "문·생활 패턴 → 연락"],
      ["센서·허브 이상", "장비 티켓 → 점검·복구"],
    ],
    limit:
      "실외 감지 개념도 · 농기계·방문객·가림 조건은 별도 실증 · 자동 출동 아님",
    read: "마당의 사람과 실외 카메라 방향, 현관 문센서를 보면서 생활 사건과 장비 장애의 대응을 비교한다.",
  },
  privacy: {
    message: "집 안의 원시정보를 최소한의 이벤트로 요약",
    rows: [
      ["집 안에서 처리", "원시 CSI·영상·음성 전송 최소화"],
      ["이벤트로 요약", "장소·사유·신뢰도·시각"],
      ["역할별 열람", "동의·최소권한·보관/파기"],
    ],
    limit:
      "비카메라도 생활정보 추론 가능 · 구체 보안·저장정책은 검증·협의 대상",
    read: "사생활 공간의 불투명 경계와 집 밖으로 나가는 사건정보를 보고 데이터의 경계를 구분한다.",
  },
  outage: {
    message: "장애 중 유지할 기능과 복구 절차를 분리",
    rows: [
      ["로컬 기능 유지", "배터리로 허브·핵심센서 지원"],
      ["연락 가능성 확인", "가능한 대체 통신을 검토"],
      ["복구 후 재확인", "로그 동기화·점검·재보정"],
    ],
    limit:
      "백업 4~8시간은 개발 목표 · 실부하 시험 필요 · 모든 통신 단절 시 원격 알림 보장 불가",
    read: "꺼진 실내등과 켜진 허브, 배터리 케이블을 구분해 제한적인 백업을 이해하고 원격 통신 보장과 혼동하지 않는다.",
  },
  queue: {
    message: "알림을 담당자의 통화·방문 업무로 연결",
    rows: [
      ["긴급", "욕실 낙상 의심 · 무응답"],
      ["주의", "평소 기상시간 대비 활동 지연"],
      ["장비", "허브 오프라인"],
    ],
    limit:
      "기관 업무·화면 구성 예시 · 인명·가구·시각·상태는 모두 설명용 가상 데이터",
    read: "통화 중인 담당자의 실제 행동과 가상의 위험목록을 함께 본다. 알림 수신과 확인 결과는 다르다.",
  },
  packages: {
    message: "생활 감지 → 욕실·침실 보강 → 마당 확장",
    rows: [
      ["SafeHome Lite", "활동·무활동 중심"],
      ["SafeHome Care", "레이더·가스·UPS 보강"],
      ["Rural Safety Pro", "실외 AI·I/O·선택 태그"],
    ],
    limit:
      "기기 외형은 개념 · 목표 가격이며 견적 아님 · 통신·설치·A/S·서버·보험 등 반영 후 확정",
    read: "세 장비 묶음의 실제 구성 차이를 동일 기준으로 비교한다. 실제 출시 제품의 외형/스펙은 아니다.",
  },
  validation: {
    message: "설치 품질과 현장 오탐을 확인한 뒤 도입 범위 결정",
    rows: [
      ["RF PoC", "6~8주 · 지원 노드·환경 변화"],
      ["알파 실증", "10~20가구 · 융합·오탐·복구"],
      ["현장 파일럿", "50~100가구·12주 · 운영 검증"],
    ],
    limit: "개발·실증 제안이며 실적 아님 · 성능·인증·기관 연계 미확정",
    read: "설치 기술자·거주자·담당자가 함께 센서 위치와 환경을 확인하는 장면과 오른쪽 단계별 검증 조건을 본다.",
  },
};
for (const s of p.planning.story) {
  const d = copy[s.id],
    asset = meta.assets.find((a: any) => a.id === s.id);
  if (!asset || !fs.existsSync(asset.path))
    throw Error("Missing distinct image: " + s.id);
  const v = s.visualPlan;
  s.answer = d.message;
  s.limitation = d.limit;
  s.visualPurpose =
    "페이지 고유의 생성 개념 장면과 최소한의 편집 가능 주석으로 실제 관계를 설명한다.";
  v.encoding = "safehome-image:" + s.id;
  v.takeaway = d.message;
  v.legend = d.limit;
  v.scene = {
    path: asset.path,
    rights: "generated",
    caption: d.limit,
    reuseReason:
      "이 페이지 설명을 위해 새로 생성한 고유 장면이며 다른 페이지에 반복 사용하지 않음",
  };
  v.explanation = {
    readerTask: d.message + "의 적용 범위를 이해한다.",
    howToRead: d.read,
    notProven: d.limit,
    requiredMarks: [...new Set([...v.explanation.requiredMarks, "scene"])],
  };
  // Labels and brief copy remain in the authoring contract, not hidden in the renderer.
  v.readingGuide = {
    message: d.message,
    keyPhrase: d.message.split(" ").slice(0, 2).join(" "),
    focusPhrases: d.rows.map((r) => r[0]).slice(0, 6),
    tone: "teal",
  };
  if (s.id === "events") s.title = "마당·창고로 넓히는 확인 범위";
  if (s.id === "packages")
    d.rows = d.rows.map((r, i) => [
      r[0],
      r[1] + "|" + v.nodes[i].detail.split("|").at(-1),
    ]);
  if (s.id === "cover")
    v.nodes = d.rows.map((r, i) => ({
      id: "n" + i,
      label: r[0],
      detail: r[1],
      icon: ["person", "server", "team"][i],
    }));
  if (
    [
      "system",
      "wifi",
      "events",
      "privacy",
      "outage",
      "packages",
      "validation",
    ].includes(s.id)
  )
    v.nodes = d.rows.map((r, i) => ({
      id: "n" + i,
      label: r[0],
      detail: r[1],
      icon: v.nodes[i]?.icon || "document",
    }));
  if (s.id === "problem")
    v.nodes = d.rows.map((r, i) => ({
      id: "n" + i,
      label: r[0],
      detail: r[1],
      icon: v.nodes[i]?.icon || "document",
    }));
  if (s.id === "response") {
    v.nodes = [
      ...d.rows.map((r, i) => ({
        id: "n" + i,
        label: r[0],
        detail: r[1],
        icon: v.nodes[i]?.icon || "document",
      })),
      {
        id: "n4",
        label: "反응 회복".replace("反", "반"),
        detail: "확인 결과에 따라 경보 조정·기록",
        icon: "clipboard",
      },
      {
        id: "n5",
        label: "신호 불확실",
        detail: "정상 처리 금지·다른 센서/사람 확인",
        icon: "shield",
      },
    ];
  }
  const anchors: Record<string, number[][]> = {
    zones: [
      [0.28, 0.55],
      [0.25, 0.24],
      [0.53, 0.2],
      [0.54, 0.62],
      [0.8, 0.45],
    ],
    system: [
      [0.14, 0.6],
      [0.38, 0.56],
      [0.6, 0.6],
      [0.85, 0.32],
    ],
    problem: [[0.94, 0.51]],
    response: [
      [0.36, 0.1],
      [0.5, 0.54],
    ],
  };
  if (anchors[s.id])
    v.scene.annotations = anchors[s.id].map((xy, i) => ({
      nodeId: "n" + i,
      x: xy[0],
      y: xy[1],
    }));
  // Retain the full zone inventory, package goal prices and original details in claims and source.
  if (s.id === "zones")
    v.nodes = d.rows.map((r, i) => ({
      id: "n" + i,
      label: r[0],
      detail: r[1],
      icon: "shield",
    }));
  if (s.id === "queue")
    v.interfaceExample.image = {
      path: asset.path,
      caption: "기관 업무 개념 장면",
      origin: "generated-concept",
    };
}
p.materials = p.materials.filter(
  (m: any) => m.role !== "asset" || !m.path.startsWith(A),
);
p.slides = [];
fs.writeFileSync(file, JSON.stringify(p, null, 2) + "\n");
fs.writeFileSync(
  path.join(A, "visual-redesign.json"),
  JSON.stringify(
    {
      version: 2,
      finalApproval: false,
      scope: "12 distinct images; editable labels and arrows",
      briefs: briefs.assets.map((a: any) => ({
        id: a.id,
        prompt: briefs.common + "\n" + a.prompt,
      })),
      rows: copy,
    },
    null,
    2,
  ),
);
console.log(
  "Applied 12 image-first page plans without changing the visual policy.",
);
