import fs from "node:fs/promises";
import { Project } from "../packages/core/schema.js";
import {
  compileStoryboard,
  planningAudit,
} from "../packages/planning/index.js";
import {
  aiveClaims,
  aiveDatasets,
  aiveSources,
} from "./aive-pro-data.js";
import { slidesPart1 } from "./aive-pro-slides-1.js";
import { slidesPart2 } from "./aive-pro-slides-2.js";
import { refineAiveDocument } from "./aive-pro-editorial.js";

const allStory = [...slidesPart1, ...slidesPart2];

const projectData = {
  schemaVersion: 1 as const,
  id: "aive-pro",
  title: "AiVE Pro 2.0 — RK3588 기반 4채널 AI 사람·차량 접근 경보 장치 전체 개발통합문서",
  proposer: {
    legalName: "강민코퍼레이션",
    role: "제품 개발·품질 주관",
    collaborators: ["하드웨어·임베디드 시스템 개발팀", "AI 모델·현장 검증팀"],
    coverCollaborators: ["하드웨어·임베디드 시스템 개발팀"],
    sourceClaimIds: ["C-OVERVIEW", "C-GOALS-SCOPE"],
  },
  audience: "강민코퍼레이션 경영진·개발·품질·생산·현장 설치 및 A/S 엔지니어",
  proposalType: "engineering-master-dossier",
  mode: "quick" as const,
  materials: [],
  design: {
    name: "AiVE Pro 2.0 Technical Editorial / Authored v1",
    layoutStandard: "technical-editorial-v2",
    font: "Apple SD Gothic Neo",
    colors: {
      ink: "1F2933",
      paper: "FAF9F5",
      accent: "0B6E75",
      muted: "4B5A66",
      dark: "1F2933",
    },
    titleSize: 26,
    bodySize: 16,
    margin: 0.64,
    grid: 12 as const,
    imageRule: "preserve-aspect; real captures and clean concept scenes",
    chartStyle: "native editable chart; verified evaluation and board metrics",
    diagramStyle: "native PowerPoint shapes and orthogonal connectors",
    iconStyle: "minimal line",
    tableRule: "editable rows, units and source required",
  },
  designDirection: {
    concept:
      "제품 기획(PRD)부터 C++17 코어·PyQt5 화면 아키텍처, YOLO26s 정량 평가, 실보드 캡처, 23건 레거시 결함 및 33건 실보드 트러블슈팅, 2단계 센서 확장까지 30장에 걸쳐 전수 시각화한다",
    visualThesis:
      "단순 불릿 나열을 배제하고 12컬럼 그리드 위에서 실보드 캡처 주석화면, 네이티브 차트, 4단계 인과 사슬, 프로세스 스윔레인, 6노드 아키텍처 관계도, 일정표를 교차 배치한다",
    brandConstraints: [
      "개발·품질 주관은 강민코퍼레이션",
      "실제 구현된 소스·시험 결과·편집 가능 네이티브 도형 및 차트 유지",
    ],
    avoid: [
      "문서 일부 누락이나 추상적 요약",
      "검증되지 않은 수치나 가짜 화면 목업",
      "텍스트 잘림이나 연결선 교차",
    ],
    references: [
      {
        sourceId: "S-README",
        role: "content" as const,
        adopt: ["C++ 감시 코어·화면 분리와 200ms 출력 임대 최우선 강조"],
        reject: ["레거시 단일 Python 구조의 암묵적 전제"],
        reason: "상용 2.0 재설계의 핵심 안전 철학을 전체 문서의 중심축으로 삼음",
      },
      {
        sourceId: "REF-UBER",
        role: "design" as const,
        adopt: ["프로세스·스레드·공유메모리 경계의 명시적 계층 분리"],
        reject: ["외부 브랜드 색상 및 아이콘 스타일 복제"],
        reason: "aive-core와 aive-ui 사이의 격리 구조를 직관적으로 전달",
      },
      {
        sourceId: "REF-DUARTE",
        role: "design" as const,
        adopt: ["기존 한계(원인)와 아키텍처 개입·실보드 측정 결과의 대조 구도"],
        reject: ["과장된 마케팅 수식어"],
        reason: "레거시 23건 결함과 실보드 33건 문제 해결을 인과 구조로 명확히 설명",
      },
      {
        sourceId: "REF-AIRBNB",
        role: "design" as const,
        adopt: ["12컬럼 그리드 위계와 실제 화면 캡처+우측 기능 해석 카드 결합"],
        reject: ["소비자 앱 스타일의 장식 요소"],
        reason: "실제 캡처 이미지(1024×600, 800×480)의 가독성과 설명력을 동시에 확보",
      },
    ],
    palette: {
      blue: "28557A",
      amber: "945B16",
      tealTint: "E6F2F2",
    },
    deliveryMode: "hybrid" as const,
  },
  sources: aiveSources,
  claims: aiveClaims,
  geographicAssets: [],
  quantitativeDatasets: aiveDatasets,
  slides: [],
  provider: "offline" as const,
  qualityTarget: "proposal" as const,
  planning: {
    visualPolicy: {
      requireExplanationContract: true,
      mode: "visual-first" as const,
      requireEverySlide: true as const,
      minVisualAreaRatio: 0.24,
    },
    version: 1 as const,
    depth: "concept" as const,
    decision: {
      owner: "강민코퍼레이션 개발·품질·생산 총괄",
      request:
        "AiVE Pro 2.0 전체 개발 산출물(코어·UI·모델·배포·실보드 검증)을 통합 확정하고, 문서 08 잔여 하드웨어 핀/CAN 확인 및 양산 출하(--ship)·2단계 센서 확장을 추진한다.",
      success:
        "전 장비가 9개 출하 점검 관문을 통과하고 현장 장애 시 0.2초 내 안전 출력 전환 및 5초 내 자동 복구를 유지한다.",
      scope:
        "HS-KR-A(DC-Ai588S) 및 HS-KR-C(DC-B588S) 상용 2.0 전 모듈과 지게차·차량 감지 1·2단계 확장",
      outOfScope: [
        "클라우드·다중 장비 중앙 관제 서버",
        "차량 브레이크 직접 제어(자동 급제동 인터록)",
        "얼굴 인식·개인 식별",
      ],
    },
    problem: {
      actors: [
        "지게차·산업차량 운전자 및 주변 작업자",
        "현장 안전관리자",
        "설치·A/S 엔지니어 및 생산·품질 담당자",
      ],
      situation:
        "산업 현장과 물류창고에서 4채널 AI 카메라로 사람·차량 접근을 감시해 경광등·부저·PLC로 즉각 알려야 한다.",
      gap:
        "기존 AiVE 샘플은 단일 Python 구조로 예외 시 무경보 정지(Fail-silent)되고 416×234 미검증 모델과 수동 배포에 머물러 상용 출하가 불가능했다.",
      consequence:
        "감시 정지 시 작업자 접근에도 경보가 울리지 않거나 릴레이가 켜진 채 고착되며, 원거리 작업자 미검출과 현장 설정 오염이 발생할 수 있다.",
      baseline:
        "물리적 안전수칙과 운전자 직접 확인이 최우선이며, AI 경보 장치는 고장 시 즉시 안전 상태(READY OFF·FAULT ON)로 전환되어야 한다.",
      claimIds: [
        "C-LEGACY-LIMITS",
        "C-ARCH-SEPARATION",
        "C-OUTPUT-LEASE",
        "C-MODEL-EVAL",
      ],
      localEvidence: {
        status: "not-yet-observed" as const,
        claimIds: [],
        required: [
          "문서 08: HS-KR-A IO4~IO6 물리 번호 및 외부 입력 핀 실측 확인",
          "문서 08: HS-KR-C 실보드 SD 카드 장치 경로 및 CAN 상세 ID 합의",
          "문서 07: 실제 설치 현장 주간·야간·우천 S-1~S-5 시험 및 72시간 연속 운전",
        ],
      },
      mechanisms: [
        {
          id: "m-failsilent",
          cause: "단일 프로세스 구조 및 출력 임대·워치독 부재",
          effect: "예외 발생이나 코어 멈춤 시 무경보 정지(Fail-silent) 및 출력 고착",
          status: "general-evidence" as const,
          claimIds: ["C-LEGACY-LIMITS", "C-ARCH-SEPARATION", "C-OUTPUT-LEASE"],
        },
        {
          id: "m-blind-model",
          cause: "저해상도(416×234) 미검증 모델 및 단순 사각형 즉시 판정",
          effect: "10~15m 원거리·소형 인물 미검출 및 통로 옆 상체 스침 오경보",
          status: "general-evidence" as const,
          claimIds: ["C-LEGACY-LIMITS", "C-MODEL-EVAL", "C-ZONE-ALARM"],
        },
        {
          id: "m-sec-deploy",
          cause: "root SSH·공통 비밀번호 방치 및 수동 파일 복사 배포",
          effect: "외부 네트워크 침입 위험 및 현장 업데이트 실패 시 장비 불능",
          status: "general-evidence" as const,
          claimIds: ["C-LEGACY-LIMITS", "C-BUILD-DEPLOY", "C-INSTALL-SHIP"],
        },
      ],
    },
    alternatives: [
      {
        id: "alt-legacy",
        name: "기존 AiVE 샘플 유지·패치",
        priority: "baseline" as const,
        addresses: "단일 Python 코드에서 최소한의 스크립트 수정만 적용",
        limits: "Python GIL·예외 정지·416×234 한계·보안 취약점으로 상용 출하 불가",
        mechanismIds: ["m-failsilent", "m-blind-model", "m-sec-deploy"],
        claimIds: ["C-LEGACY-LIMITS"],
      },
      {
        id: "alt-vision-only",
        name: "AiVE Pro 2.0 1단계 (비전+TTC)",
        priority: "option" as const,
        addresses: "C++ 코어 분리·YOLO26s 6클래스·무지연 TTC·200ms 임대·단일 .run 배포",
        limits: "구현·실보드 검증 완료(추가 원가 0원) · 창고 랙 정밀 거리는 2단계 센서 필요",
        mechanismIds: ["m-failsilent", "m-blind-model", "m-sec-deploy"],
        claimIds: ["C-OVERVIEW", "C-BOARD-PERF", "C-MULTICLASS-STAGE2"],
      },
      {
        id: "alt-sensor-fusion",
        name: "AiVE Pro 2.0 2단계 (비전+초음파·레이더)",
        priority: "proposed" as const,
        addresses: "4채널 AI 비전에 초음파(RS485)·밀리미터파 레이더(CAN)·포크 스위치 융합",
        limits: "후진·랙 충돌·연기/역광 완벽 대응 · 대당 센서 원가 및 14주 추가 개발 필요",
        mechanismIds: ["m-blind-model"],
        claimIds: ["C-MULTICLASS-STAGE2"],
      },
    ],
    interventions: [
      {
        id: "i-core-safety",
        name: "C++17 감시 코어 분리 및 3중 안전장치",
        mechanismIds: ["m-failsilent"],
        action: "aive-core와 aive-ui를 분리하고 200ms 출력 임대·3단 워치독·READY/FAULT 분리 적용",
        deliverable: "aive-core 데몬, aive-outputs-off, systemd/HW 워치독, 실보드 고장 복구 검증",
        claimIds: ["C-ARCH-SEPARATION", "C-THREADS-WATCHDOG", "C-OUTPUT-LEASE", "C-BOARD-FAILSAFE"],
        validationIds: ["v-failsafe"],
      },
      {
        id: "i-model-zone",
        name: "YOLO26s 640×384(split6)·RGA 크롭·다각형 판정",
        mechanismIds: ["m-blind-model"],
        action: "RGA 1회 무복사 변환·구역 확대 추론·YOLO26s INT8·다각형 교차율·즉시 경보 결합",
        deliverable: "YOLO26s .rknn/.rknn.json, 4채널 80fps 및 평균 70ms 경보 지연 달성",
        claimIds: ["C-RGA-CROP", "C-ZONE-ALARM", "C-MODEL-EVAL", "C-BOARD-PERF"],
        validationIds: ["v-detection"],
      },
      {
        id: "i-sec-deploy",
        name: "PIN·컴팩트 UI 및 서명된 단일 .run 자동 롤백 배포",
        mechanismIds: ["m-sec-deploy"],
        action: "솔트+SHA-256 PIN·5/7인치 터치 UI·Ed25519 서명 번들·60초 자동 롤백·--ship 보안 잠금",
        deliverable: "aive-ui, aive-touch-bridge, aive-pro.run 번들, deploy_to_board.sh",
        claimIds: ["C-UI-ADMIN", "C-UI-CPU-COMPACT", "C-BUILD-DEPLOY", "C-INSTALL-SHIP"],
        validationIds: ["v-security"],
      },
    ],
    validation: [
      {
        id: "v-failsafe",
        question: "코어 강제 종료·멈춤·커널 패닉·카메라 가림 시 안전 상태로 즉시 전환·복구되는가?",
        method: "HS-KR-A 실보드에서 kill -9, kill -STOP, sysrq c, 렌즈 가림 주입 및 응답 시간 측정",
        measure: "출력 차단 시간(≤0.2s), 자동 재시작 복귀 시간(≤5s), 하드웨어 워치독 재부팅 시간",
        decisionRule: "0.2초 내 출력 차단 또는 5초 내 자동 복귀 미달 시 출하 보류",
        claimIds: ["C-BOARD-FAILSAFE", "C-OUTPUT-LEASE"],
      },
      {
        id: "v-detection",
        question: "4채널 실시간 추론 속도와 원거리·소형 인물 검출률, 경보 지연이 목표를 충족하는가?",
        method: "COCO 1,000장 INT8 정량 평가 및 HS-KR-A 실보드 4채널 동시 추론·지연 실측",
        measure: "AP50, 소형 인물(<64px) 검출률, 채널당 FPS(≥10fps), 진입~출력 지연(≤150ms)",
        decisionRule: "사람 AP50 하락 1%p 초과 또는 채널당 10fps 미달 모델은 채택 거부(관문 X-1)",
        claimIds: ["C-MODEL-EVAL", "C-BOARD-PERF"],
      },
      {
        id: "v-security",
        question: "77건 자동 단위·화면 시험과 출하 모드(--ship) 보안·자동 롤백이 정상 동작하는가?",
        method: "C++ 58건·UI 19건(ScreenSizeTest) 자동 실행, 불량 버전 롤백 시험, ss -tlnp 포트 점검",
        measure: "자동 시험 통과율(100%), 롤백 복구 시간(≤60s), 외부 리스닝 포트 수(0개)",
        decisionRule: "단위·화면 시험 1건이라도 실패하거나 리스닝 포트 발견 시 릴리스 차단",
        claimIds: ["C-TEST-PLAN", "C-INSTALL-SHIP"],
      },
    ],
    operatingBoundary:
      "AI 경보는 운전자·안전관리자의 직접 확인을 보조하며 미검출이 안전을 보장하지 않음 | 고장 시 즉시 READY OFF·FAULT ON 전환",
    workflow: [
      {
        id: "wf-capture",
        label: "4채널 수집·영상감시",
        owner: "system" as const,
        input: "4채널 1080p 카메라 프레임",
        action: "V4L2 수집·view_check 6종 이상 감시·RGA 무복사 변환",
        output: "640×384 RGB 텐서 및 채널 상태",
        successSignal: "MONITORING 상태 유지",
        failureAction: "1초 내 FAULT 전환·READY OFF·재연결",
        claimIds: ["C-STATE-VIEWCHECK", "C-RGA-CROP"],
      },
      {
        id: "wf-infer",
        label: "NPU 추론·다각형 판정",
        owner: "system" as const,
        input: "RGA 변환 텐서 및 다각형 구역 설정",
        action: "NPU 3코어 YOLO26s 추론·하단 15% 교차율·즉시/N-of-M 판정",
        output: "채널별 경고·위험 상태 및 TTC",
        successSignal: "평균 27ms 추론·70ms 경보 판정",
        failureAction: "모델 해시 불일치 시 추론 거부·FAULT",
        claimIds: ["C-MODEL-SPLIT6", "C-ZONE-ALARM"],
      },
      {
        id: "wf-output",
        label: "200ms 임대 출력·녹화",
        owner: "system" as const,
        input: "판정 결과 및 200ms 안전 임대",
        action: "IO1~6·ALSA 스피커·CAN 송신 및 _E.ts 보호 녹화·스냅샷",
        output: "물리 릴레이·음향·이벤트 기록",
        successSignal: "20ms 주기 임대 갱신 유지",
        failureAction: "200ms 내 경보·READY 자동 OFF·FAULT ON",
        claimIds: ["C-OUTPUT-LEASE", "C-IPC-SHM-SPEC"],
      },
      {
        id: "wf-human",
        label: "운전자 확인·관리자 점검",
        owner: "human" as const,
        input: "4분할 화면·경보 배너·진단 메뉴",
        action: "운전자 정지·육안 확인 및 관리자 PIN 구역 보정·출력 시험",
        output: "현장 안전 조치 및 출하·일일 점검 기록",
        successSignal: "정상 감시 초록 표시 및 배선 작동 확인",
        failureAction: "감시 불가 적색 배너 시 즉시 수동 안전절차 전환",
        claimIds: ["C-UI-MONITOR", "C-UI-ADMIN"],
      },
    ],
    site: {
      title: "지게차·산업현장 4채널 카메라 및 2단계 다각형 구역 배치 모델",
      disclaimer: "개념 배치 모델 · 실제 카메라 장착 높이와 다각형 좌표는 현장 터치 화면에서 설정",
      zones: [
        { id: "z-work", label: "작업장 통로", kind: "site" as const, x: 0, y: 0, w: 1, h: 0.5 },
        { id: "z-warn", label: "외곽 경고구역", kind: "walkway" as const, x: 0.1, y: 0.5, w: 0.8, h: 0.25 },
        { id: "z-danger", label: "내측 위험구역", kind: "conflict" as const, x: 0.25, y: 0.6, w: 0.5, h: 0.25 },
      ],
      paths: [
        { id: "p-forklift", label: "지게차 이동 동선", kind: "vehicle" as const, points: [[0.5, 0.2], [0.5, 0.85]] as [number, number][] },
        { id: "p-worker", label: "작업자 보행 동선", kind: "pedestrian" as const, points: [[0.15, 0.68], [0.85, 0.68]] as [number, number][] },
      ],
      objects: [
        { id: "o-forklift", label: "지게차(AiVE Pro)", kind: "vehicle" as const, x: 0.5, y: 0.45 },
        { id: "o-worker", label: "보행 작업자", kind: "person" as const, x: 0.72, y: 0.68 },
      ],
      callouts: [
        {
          id: "c-zone",
          label: "경고·위험 2단계 다각형",
          detail: "채널당 경고 4개+위험 4개+제외 4개 및 하단 15% 발 위치 판정",
          x: 0.5,
          y: 0.7,
          claimIds: ["C-ZONE-ALARM"],
        },
      ],
    },
    story: allStory,
  },
};

refineAiveDocument(allStory, projectData);
const parsed = Project.parse(projectData);
const audit = planningAudit(parsed, false);
if (audit.status === "blocked") {
  console.error("Planning audit blocked:", JSON.stringify(audit.issues, null, 2));
  process.exit(1);
}
parsed.slides = compileStoryboard(parsed);
const finalProject = Project.parse(parsed);
const postAudit = planningAudit(finalProject, true);
if (postAudit.status === "blocked") {
  console.error("Post-compile audit blocked:", JSON.stringify(postAudit.issues, null, 2));
  process.exit(1);
}

await fs.mkdir("projects/aive-pro", { recursive: true });
await fs.writeFile(
  "projects/aive-pro/project.json",
  JSON.stringify(finalProject, null, 2),
);
await fs.writeFile(
  "examples/aive-pro.project.json",
  JSON.stringify(finalProject, null, 2),
);
console.log(
  `Successfully generated AiVE Pro 2.0 integrated deck with ${finalProject.slides.length} slides!`,
);

if (process.argv.includes("--check")) {
  const { render } = await import("../packages/pptx-renderer/index.js");
  const { review: qaAudit } = await import("../packages/quality-assurance/index.js");
  const { elements } = await render(finalProject, "projects/aive-pro/check.pptx");
  await fs.unlink("projects/aive-pro/check.pptx").catch(() => {});
  const qa = qaAudit(finalProject, elements, {
    pages: finalProject.slides.length,
    pageTexts: Array(finalProject.slides.length).fill("강민코퍼레이션"),
    text: "강민코퍼레이션",
    fonts: [],
    issues: [],
  });
  const elMap: Record<string, any> = {};
  for (const e of elements) elMap[`${e.slideId}:${e.id}`] = e;
  const nonPdfIssues = qa.issues.filter((i) => i.code !== "pdf-text-mismatch");
  console.log(`Non-PDF QA issues count: ${nonPdfIssues.length}`);
  for (const i of nonPdfIssues) {
    if (i.code === "text-overflow") {
      const ids = (i as any).elementIds || [(i as any).elementId] || i.message.match(/e\d+/g) || [];
      for (const eid of ids) {
        const e = elMap[`${i.slideId}:${eid}`];
        if (e) {
          console.log(
            `${i.slideId} ${eid} w=${e.w.toFixed(2)} h=${e.h.toFixed(2)} font=${e.fontSize} text=${JSON.stringify(e.text)}`,
          );
        }
      }
    } else {
      console.log(`OTHER: ${i.slideId} ${i.code} ${i.message}`, (i as any).elementIds);
    }
  }
}
