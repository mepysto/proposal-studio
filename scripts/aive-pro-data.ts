import {
  colBox,
  splitColumns,
  splitRows,
} from "../packages/art-direction/index.js";

export const aiveSources = [
  {
    id: "S-README",
    title: "AiVE Pro 2.0 프로젝트 README 및 CHANGELOG",
    scope: "project" as const,
    materialId: "README.md / CHANGELOG.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "RK3588 기반 4채널 AI 카메라 사람·차량 접근 경보 장치(HS-KR-A / HS-KR-C) 상용 2.0 버전. C++ 감시 코어와 화면 분리, YOLO26s AP50 0.753, 출력 임대 200ms, 단일 .run 설치·자동 롤백.",
    applicability: "AiVE Pro 2.0 전체 개발 범위 및 2026-10-31 기준 구현 현황",
  },
  {
    id: "S-DOC01",
    title: "01 제품 기획서 (PRD) — 요구사항 D/Z/A/F/R/U/I/S",
    scope: "project" as const,
    materialId: "docs/01_제품기획서_PRD.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "목표 G1~G5, 하드웨어 HS-KR-A(DC-Ai588S)·HS-KR-C(DC-B588S)·GS 계열, 요구사항 D-1~7, Z-1~6, A-1~8, F-1~9, R-1~6, U-1~8, I-1~5, S-1~6 및 출하 기준(DoD).",
    applicability: "상용 제품 요구사항 명세 및 완료 기준",
  },
  {
    id: "S-DOC02",
    title: "02 아키텍처 설계서 — 프로세스·스레드·안전·영상 파이프라인",
    scope: "project" as const,
    materialId: "docs/02_아키텍처_설계.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "aive-core(C++17, 9종 스레드, SCHED_FIFO)와 aive-ui(PyQt5) 분리, 채널 상태 머신, view_check 영상 이상 감시, 200ms 출력 임대, RGA 1회 무복사 변환 및 위험구역 확대 추론, 3단계 워치독.",
    applicability: "내부 소프트웨어 및 안전 아키텍처 설계 근거",
  },
  {
    id: "S-DOC03",
    title: "03 화면 설계서 — 화면 구성·흐름·다중 해상도·CPU 절감",
    scope: "project" as const,
    materialId: "docs/03_화면설계.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "4분할 감시, 단일 확대(1024×576, 30초 복귀), 8종 오류 안내, 관리자 PIN, 8개 설정·진단 메뉴, 7인치(1024×600)·5인치(800×480 COMPACT)·FHD 자동 배율, UI CPU 57%→27% 최적화.",
    applicability: "운영 화면 UI/UX 및 디스플레이 호환 설계",
  },
  {
    id: "S-DOC04",
    title: "04 인터페이스 명세서 — GPIO·CAN·RS485·IPC·공유메모리·파일 형식",
    scope: "project" as const,
    materialId: "docs/04_인터페이스_명세.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "5종 논리 출력→IO1~6 매핑, GPIO uAPI v1, ALSA 스피커, SocketCAN 0x18FF00A1, RS485 Modbus RTU, /run/aive/core.sock 21종 IPC·10Hz 알림, /dev/shm/aive-frames Seqlock, settings.json v2.",
    applicability: "내·외부 하드웨어 및 프로세스 간 통신 규격",
  },
  {
    id: "S-DOC05",
    title: "05 모델 파이프라인 — YOLO26 변환·정량 평가·모델 선택 근거",
    scope: "project" as const,
    materialId: "docs/05_모델_파이프라인.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "COCO 2017 val 1,000장 INT8 시뮬레이터 평가: YOLO11n(416×234) AP50 0.651 vs YOLO26s(640×384) AP50 0.753, 작은 사람 검출 0.112→0.277(2.5배), split6 출력, rknn_friendly_attention, SHA-256 검증.",
    applicability: "AI 모델 선정, 양자화 보존 및 다클래스 확장 근거",
  },
  {
    id: "S-DOC06",
    title: "06 빌드·설치·운영 — 단일 .run 번들·서명·자동 롤백·현장 서비스",
    scope: "project" as const,
    materialId: "docs/06_빌드_설치_운영.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "build.sh(--sim/--release), make_release.sh 단일 .run 번들, Ed25519 서명, install.sh 14단계 설치, --kiosk, --ship 보안 잠금, 60초 시작 확인 및 자동 롤백, 무화면 콘솔 복구.",
    applicability: "빌드·릴리스·배포 및 현장 유지보수 절차",
  },
  {
    id: "S-DOC07",
    title: "07 시험 계획서 — 단위 58건·화면 19건·보드·현장·출하 시험",
    scope: "project" as const,
    materialId: "docs/07_시험계획서.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "C++ 단위시험 58건, PyQt5 화면 시험 19건(ScreenSizeTest 포함), 시뮬레이터 시험, 실보드 시험(B/A/F/U/M), 현장 시험(S-1~5), 장비별 출하 점검표 9개 항목.",
    applicability: "품질 보증 및 출하 승인 기준",
  },
  {
    id: "S-DOC08",
    title: "08 보드 측정 요청서 — board_survey.sh 및 실보드 확인 항목",
    scope: "project" as const,
    materialId: "docs/08_보드_측정_요청서.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "scripts/board_survey.sh 읽기 전용 조사 및 IO4~IO6 번호, 후진·문열림 입력 핀, CAN 속도·ID, 오디오 코덱, HS-KR-C SD 장치 경로 확인 요청.",
    applicability: "하드웨어 프로필 완성을 위한 보드 확인 과제",
  },
  {
    id: "S-DOC09",
    title: "09 HS-KR-A 보드 시험 결과 (2026-10-30, 1차~10차)",
    scope: "project" as const,
    materialId: "docs/09_보드시험_결과_HS-KR-A_2026-10-30.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "4채널 각 20.1fps(합계 80fps), 추론 지연 27ms, SoC 37~39°C, kill -9 후 0.16초 출력 OFF·3.1초 복귀, kill -STOP 2.0초 감지·5.5초 복귀, 재부팅 13.4초, 커널 패닉 24초 HW 워치독 재부팅, 5·7인치 터치 브리지.",
    applicability: "HS-KR-A 실보드 실측 성능 및 고장 안전성 입증 근거",
  },
  {
    id: "S-DOC10",
    title: "10 기존 소스 대비 변경 내역 — 23건 결함 전수 해결 및 성능 대조",
    scope: "project" as const,
    materialId: "docs/10_기존소스_대비_변경내역.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "기존 AiVE 평가 보고서 지적 사항 C-1~C-5, F-1~F-9, R-1~R-6, A-1~A-4, S-1~S-6 전수 해결. 경보 지연 153ms → 즉시 경보 70ms / 2회 확인 120ms로 단축.",
    applicability: "레거시 대비 개선 효과 및 결함 해소 추적",
  },
  {
    id: "S-DOC11",
    title: "11 개선 제안 및 12 화면 UI/UX 개선 제안",
    scope: "project" as const,
    materialId: "docs/11_개선_제안.md / docs/12_화면_UIUX_개선_제안.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "우선 구현 5대 과제(영상 상태 감시, 즉시 경보, 인식 횟수 설정, 경보 순간 스냅샷, HW 워치독) 완료 및 출력 시험 버튼 결함 수정, 2단계 제안(과열 추론율 조절, 추적, WAV 음성, USB 업데이트).",
    applicability: "완료된 고도화 항목 및 2단계 기능 백로그",
  },
  {
    id: "S-DOC13",
    title: "13 지게차·트럭·랙 감지 확장 계획 — 1단계 다클래스·TTC 및 2단계 거리 센서",
    scope: "project" as const,
    materialId: "docs/13_지게차_트럭_랙_감지_확장_계획.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "1단계(구현): person/forklift/truck/car/motorcycle/cart 6클래스, 1/h 선형 회귀 기반 무지연 TTC 추정, approach_only. 2단계(계획): 초음파(RS485)·밀리미터파 레이더(CAN)·포크 높이 스위치(>50cm) 및 14주 일정.",
    applicability: "다클래스 차량·지게차 감지 및 센서 융합 확장 설계",
  },
  {
    id: "S-DOC14",
    title: "14 문제 기록·재발 방지 — 실보드 설치·시험 중 발생한 33건과 대책",
    scope: "project" as const,
    materialId: "docs/14_문제기록_재발방지.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "실보드 시험 중 발굴한 #1~#33 문제(CRLF, 롤백 인수, V4L2 전환, NPU 3코어 분산, 종료 교착, 전용 터치 브리지, 이중 터치 차단, 패널 불량 분리, 5인치 COMPACT, 중앙 50% 가림, 차량 탑재 모드 등) 원인과 재발 방지.",
    applicability: "실보드 트러블슈팅 이력 및 회귀 시험 근거",
  },
  {
    id: "S-DOC15",
    title: "15 설치 매뉴얼 및 16 운영 매뉴얼",
    scope: "project" as const,
    materialId: "docs/15_설치_매뉴얼.md / docs/16_운영_매뉴얼.md",
    checkedAt: "2026-10-31T00:00:00Z",
    excerpt:
      "단일 .run 설치·키오스크·출하 모드(--kiosk --ship)·자동 롤백·PC→보드 배포(deploy_to_board.sh), 4분할/확대 화면 읽는 법, PIN·구역·카메라·출력·진단·이벤트 설정 및 일일·정기 점검표.",
    applicability: "현장 설치·운영·점검 표준 절차",
  },
  {
    id: "REF-UBER",
    title: "Uber Engineering Architecture Visualization Principles",
    scope: "general" as const,
    url: "https://www.uber.com/blog/engineering/",
    checkedAt: "2026-10-26T00:00:00Z",
    excerpt: "Layered service boundaries and explicit dataflow isolation.",
    applicability: "프로세스·스레드·IPC 경계 도식화 원리 참고",
  },
  {
    id: "REF-DUARTE",
    title: "Duarte Visual Story & Technical Contrast Structure",
    scope: "general" as const,
    url: "https://www.duarte.com/",
    checkedAt: "2026-10-26T00:00:00Z",
    excerpt: "Contrast existing limitations against structural interventions.",
    applicability: "레거시 한계 대비 아키텍처 개입 대조 구도 참고",
  },
  {
    id: "REF-AIRBNB",
    title: "Airbnb Design System Grid & Component Hierarchy",
    scope: "general" as const,
    url: "https://airbnb.design/",
    checkedAt: "2026-10-26T00:00:00Z",
    excerpt: "12-column grid hierarchy and annotated interface inspection.",
    applicability: "12컬럼 그리드 위계 및 실제 UI 캡처 주석 배치 참고",
  },
];

export const aiveClaims = [
  {
    id: "C-OVERVIEW",
    text: "AiVE Pro 2.0은 RK3588 기반 4채널 AI 사람·차량 접근 경보 장치(HS-KR-A/C)의 상용 버전으로, 기존 단일 Python 소스를 수정하지 않고 C++17 감시 코어와 PyQt5 화면 분리 구조로 전면 재설계했다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-README", "S-DOC01"],
    approved: false,
  },
  {
    id: "C-LEGACY-LIMITS",
    text: "기존 AiVE는 단일 Python 프로세스에서 예외 1회에 감지가 영구 정지(Fail-silent)되고 워치독이 없으며, YOLO11n 416×234 미검증 모델과 root SSH·공통 비밀번호·수동 배포로 인해 상용 출하가 불가능했다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC01", "S-DOC10"],
    approved: false,
  },
  {
    id: "C-GOALS-SCOPE",
    text: "제품 기획 목표 G1~G5는 무중단 경보(5초 내 복구·0.2초 내 안전 출력 전환), 3~15m 검출 및 150ms 이내 경보 지연, board.json 기반 A/C/GS 단일 코드베이스, 터치 현장 완결성, 단일 파일 설치·자동 롤백이다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC01"],
    approved: false,
  },
  {
    id: "C-PRD-DZA",
    text: "요구사항 D-1~7(4채널 10fps+, 250ms 이내, YOLO26 해시 검증, 다클래스, N-of-M), Z-1~6(경고·위험 각 4개+제외 4개 다각형, 판정 기준 3종, 입력 조건부 활성), A-1~8(논리 출력 5종→IO1~6 매핑, 최소 유지·쿨다운, 출력 시험)을 정의하고 구현했다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC01", "S-DOC04"],
    approved: false,
  },
  {
    id: "C-PRD-FRUIS",
    text: "요구사항 F-1~9(6종 영상 이상 감시, UI 격리, 200ms 임대, 과열 85/95°C), R-1~6(H.264 세그먼트, 85% 순환 삭제, 경보 _E 보호, JSONL 10만 건, 스냅샷 500장), U-1~8, I-1~5(CAN·RS485·외부입력), S-1~6(비특권 계정·SSH 차단·서명 업데이트·롤백)을 명세했다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC01", "S-DOC02"],
    approved: false,
  },
  {
    id: "C-ARCH-SEPARATION",
    text: "aive-core(C++17)는 카메라 수집·NPU 추론·안전 판정·GPIO/스피커/CAN 출력·녹화를 전담하고, aive-ui(PyQt5)는 공유메모리 프레임 표시와 Unix 소켓 설정 제어만 수행해 UI가 정지·재시작되어도 경보는 중단되지 않는다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC02", "S-DOC09"],
    approved: false,
  },
  {
    id: "C-THREADS-WATCHDOG",
    text: "aive-core는 9종 스레드(cap-0..3, npu-0..2, safety SCHED_FIFO 20ms, output SCHED_FIFO 10ms, rec-0..3, storage, ipc, health, input)로 동작하며, 스레드 생존 확인→systemd 2초 워치독→하드웨어 워치독 22초의 3단계 복구 체계를 갖춘다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC02", "S-DOC06", "S-DOC09"],
    approved: false,
  },
  {
    id: "C-STATE-VIEWCHECK",
    text: "채널 상태 머신(STARTING→MONITORING↔DEGRADED→FAULT, DISABLED)과 view_check 모듈은 신호 상실(1초), 검은 화면(Y<8), 정지 화면(diff<0.5), 렌즈 가림(중앙 50% 저분산+가장자리), 방향 틀어짐/차량 급변(고정 설치 vs 차량 탑재 3분 중앙값), 초점 흐려짐(Laplacian<15)을 감시한다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC02", "S-DOC04", "S-DOC14"],
    approved: false,
  },
  {
    id: "C-RGA-CROP",
    text: "1080p NV12 DMA-BUF 프레임을 RGA 하드웨어로 1회 변환(640×384 리사이즈·레터박스·RGB 변환 동시 수행)하여 RKNN에 무복사(rknn_create_mem_from_fd) 전달하고, 위험구역 외접 사각형 확대 추론으로 원거리 인물의 유효 픽셀을 최대 3배(12px→36px) 확대한다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC02", "S-DOC10"],
    approved: false,
  },
  {
    id: "C-ZONE-ALARM",
    text: "Sutherland-Hodgman 다각형 교차율과 3종 판정 기준(하단 15% 띠 bottom_band 기본, 발밑점 foot_point, 전체 박스 bbox_any), 제외 영역 차감, 고신뢰(instant_conf 0.70) 1프레임 즉시 경보 및 일반 N-of-M(2/3) 확인, 해제 지연 0.5초·최소 유지 1.0초로 오경보와 채터링을 동시에 억제한다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC02", "S-DOC04", "S-DOC10"],
    approved: false,
  },
  {
    id: "C-OUTPUT-LEASE",
    text: "5종 논리 출력(warning, danger, common 3초, ready, fault)을 물리 IO1~IO6에 자유 매핑하며, safety 스레드가 20ms마다 갱신하는 200ms 임대(Lease)가 만료되면 output 스레드가 즉시 경보 OFF·READY OFF·FAULT ON으로 전환하고 종료 시 aive-outputs-off가 0.2초 내 모든 출력을 끈다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC02", "S-DOC04", "S-DOC09"],
    approved: false,
  },
  {
    id: "C-MODEL-EVAL",
    text: "COCO 2017 val 1,000장 INT8 평가에서 채택 모델 YOLO26s(640×384)는 기존 YOLO11n(416×234) 대비 사람 AP50이 65.1%에서 75.3%로(+10.2%p), 전체 검출률이 44.3%에서 56.6%로, 64px 미만 작은 사람 검출률이 11.2%에서 27.7%로 2.5배 향상되었고 YOLO26n(AP50 71.1%, 작은 사람 21.0%)보다도 우수하다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC05", "S-DOC10"],
    approved: false,
  },
  {
    id: "C-MODEL-SPLIT6",
    text: "RKNN INT8 양자화 손실을 막기 위해 스트라이드(8/16/32)별 박스 회귀([1,4,H,W])와 시그모이드 점수([1,C,H,W])를 분리한 split6 구조를 적용하고, C2PSA 어텐션의 3D BMM을 4D conv로 치환(rknn_friendly_attention)했으며, .rknn.json의 SHA-256 해시와 텐서 모양을 코어 시작 시 검증한다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC05"],
    approved: false,
  },
  {
    id: "C-UI-MONITOR",
    text: "운영 화면은 부팅 즉시 4분할 감시 화면으로 진입하며 상단 상태줄(정상 감시 초록 점·채널 상태·경보 배지·시각·잠금), 경보·감시불가 배너, 색각 이상 배려(위험 적색 실선·경고 황색 점선·한글 표), 단일 채널 확대(1024×576, 30초 자동 복귀), 8종 한글 오류 안내를 제공한다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC03", "S-DOC11", "S-DOC15"],
    approved: false,
  },
  {
    id: "C-UI-ADMIN",
    text: "관리자 메뉴는 16바이트 솔트+SHA-256 PIN 인증(5회 실패 시 60초 잠금, 60초 무조작 자동 복귀)으로 보호되며, 터치 구역 편집기(2.5배 확대경·영역 칩·3종 프리셋·편집 중 감시 유지), 카메라 기본/고급 설정, 출력 매핑·유지시간 설정, 60초 제한 출력 시험, 진단, 이벤트 스냅샷을 제공한다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC03", "S-DOC15"],
    approved: false,
  },
  {
    id: "C-UI-CPU-COMPACT",
    text: "7인치(1024×600 기본), 5인치(800×480 theme.COMPACT 좁은 배치), Full HD(1.75배 자동 확대) 디스플레이를 단일 UI 코드로 지원하며, linuxfb 소프트웨어 렌더링 환경에서 UI CPU 점유율을 초기 57.0%에서 10Hz 갱신·경량 그리기(35.0%), 4분할 저해상도(320×180) 공유메모리 직접 읽기(27.0%)로 절감했다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC03", "S-DOC09", "S-DOC14"],
    approved: false,
  },
  {
    id: "C-IPC-SHM-SPEC",
    text: "내부 인터페이스는 /run/aive/core.sock(21종 JSON 명령·10Hz 상태 알림), /dev/shm/aive-frames(Seqlock 홀짝 검증, 슬롯당 640×384 원본 + 320×180 축소 RGB24 = 909KB, 총 3.6MB), settings.json v2(fsync+원자적 rename+.bak), events.jsonl(10MB×10개), MPEG-TS 세그먼트(_E.ts 보호)로 구성된다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC04"],
    approved: false,
  },
  {
    id: "C-EXT-HW-SURVEY",
    text: "외부 하드웨어 인터페이스는 GPIO uAPI v1(HS-KR-A IO1=108, IO2=107, IO3=136 확인, gpio3_d5 하드웨어 워치독 확인), ALSA 스피커, SocketCAN(0x18FF00A1 100ms 송신·입력 수신), RS485 Modbus RTU 슬레이브(30001~30007)이며, 문서 08을 통해 IO4~6·외부입력·CAN ID·HS-KR-C SD 장치 확인 절차를 수립했다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC04", "S-DOC08", "S-DOC09"],
    approved: false,
  },
  {
    id: "C-BUILD-DEPLOY",
    text: "scripts/build.sh(--sim/--release)와 make_release.sh는 실행파일·UI·모델·설정·체크섬·Ed25519 서명을 묶어 단일 설치 파일(aive-pro-2.0.0-<커밋>.run)을 생성하며, deploy_to_board.sh가 Git bundle 전송·원격 빌드·단위시험·키오스크 설치·릴리스 정리를 자동 수행한다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC06", "S-DOC15"],
    approved: false,
  },
  {
    id: "C-INSTALL-SHIP",
    text: "install.sh는 14단계 절차로 /opt/aive/releases/<버전> 배치와 current 심볼릭 링크 원자적 교체를 수행한 뒤 60초 내 ready=true 미확인 시 자동 롤백하며, --kiosk(linuxfb·터치 브리지)와 --ship(SSH·Samba·rpcbind·cups·avahi·adb 비활성화 및 리스닝 포트 0개 검증) 옵션을 제공한다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC06", "S-DOC15"],
    approved: false,
  },
  {
    id: "C-TEST-PLAN",
    text: "6단계 시험 체계는 C++ 단위시험 58건(다각형·교차율·N-of-M·200ms 임대·온도·로그·IPC·Seqlock·차량 탑재 감시)과 PyQt5 화면 시험 19건(ScreenSizeTest 1024×600·800×480 포함) 자동 검증, 시뮬레이터 시험, 실보드 시험(36항목), 현장 시험(S-1~5), 출하 점검표(9항목)로 구성된다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC07"],
    approved: false,
  },
  {
    id: "C-BOARD-PERF",
    text: "HS-KR-A 실보드 시험에서 NPU 3코어 분산과 카메라 캡처 스레드 분리로 4채널 합계 추론 속도를 초기 24.0fps에서 50.8fps를 거쳐 80.4fps(채널당 20.1fps, 추론 지연 27ms, SoC 37~39°C)로 높였고, 경보 지연은 기존 평균 153ms에서 즉시 경보 평균 70ms(최대 97ms), 2회 확인 평균 120ms(최대 147ms)로 단축했다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC09", "S-DOC10"],
    approved: false,
  },
  {
    id: "C-BOARD-FAILSAFE",
    text: "HS-KR-A 실보드 고장 주입 시험에서 kill -9 시 0.16초 내 경보 출력 OFF·3.1초 내 자동 복귀, kill -STOP 시 2.0초 내 워치독 감지·5.5초 내 복귀, 재부팅 시 13.4초 내 감시 시작, 커널 패닉(sysrq c) 시 24초 내 하드웨어 워치독 자동 재부팅, Waveshare 5·7인치 전용 터치 브리지 동작을 실측 확인했다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC09"],
    approved: false,
  },
  {
    id: "C-LEGACY-BUGS",
    text: "기존 AiVE 소스 평가에서 지적된 23건의 결함(치명·상 11건: C-1~C-5, F-1~F-5, R-3, A-3 / 중·하 12건: A-1~A-4, R-1~R-6, F-6~F-9, S-4, S-6)을 전수 해결하고 기존 zone_points 설정 자동 변환 등 하위 호환성을 유지했다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC10"],
    approved: false,
  },
  {
    id: "C-ISSUES-33",
    text: "실보드 설치·시험 과정에서 발생한 33건의 문제(#1~#6 빌드·롤백·디스크 정리, #7~#9 V4L2 전환·NPU 3코어·종료 교착, #10~#21 모니터 핫플러그·HID 터치 브리지·이중 터치 차단·패널 불량 분리·5인치 COMPACT·linuxfb 창 고정, #22~#33 중앙 가림·즉시 경보·유지 1초·저해상도 SHM·차량 탑재 모드)를 전수 해결하고 회귀 시험으로 고정했다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC14"],
    approved: false,
  },
  {
    id: "C-MULTICLASS-STAGE2",
    text: "감지 확장 1단계로 6클래스(person/forklift/truck/car/motorcycle/cart), 겉보기 높이 역수(1/h) 선형 회귀 기반 무지연 TTC 추정, approach_only 구역, X-1 사람 성능 보존 관문을 구현 완료했으며, 2단계로 초음파(RS485)·밀리미터파 레이더(CAN)·포크 높이 스위치(>50cm) 융합 및 14주 확장 로드맵을 수립했다.",
    scope: "project" as const,
    evidenceKind: "document" as const,
    status: "user-provided" as const,
    sourceIds: ["S-DOC13", "S-DOC11"],
    approved: false,
  },
];

export const aiveDatasets = [
  {
    id: "coco-model-eval",
    title: "COCO 2017 val 1,000장 INT8 양자화 시뮬레이터 사람 검출 성능 비교",
    population: "COCO 2017 val 앞 1,000장 (사람 포함 550장, 정답 박스 2,265개)",
    unit: "%",
    status: "reported-observation" as const,
    period: "2026-10 모델 파이프라인 평가 (model/eval/eval_coco1000.json)",
    sourceClaimIds: ["C-MODEL-EVAL"],
    limitation:
      "RKNN INT8 시뮬레이터(COCO 1,000장) 기준 수치 · 실제 현장 야간·역광 성능은 현장 영상으로 추가 검증 필요",
    disjointSeries: false,
    rows: [
      { category: "AP50 (정확도)", series: "기존 YOLO11n (416×234)", value: 65.1 },
      { category: "AP50 (정확도)", series: "후보 YOLO26n (640×384)", value: 71.1 },
      { category: "AP50 (정확도)", series: "채택 YOLO26s (640×384)", value: 75.3 },
      { category: "전체 검출률 (Recall)", series: "기존 YOLO11n (416×234)", value: 44.3 },
      { category: "전체 검출률 (Recall)", series: "후보 YOLO26n (640×384)", value: 51.3 },
      { category: "전체 검출률 (Recall)", series: "채택 YOLO26s (640×384)", value: 56.6 },
      { category: "소형 인물 (<64px)", series: "기존 YOLO11n (416×234)", value: 11.2 },
      { category: "소형 인물 (<64px)", series: "후보 YOLO26n (640×384)", value: 21.0 },
      { category: "소형 인물 (<64px)", series: "채택 YOLO26s (640×384)", value: 27.7 },
    ],
  },
  {
    id: "ui-cpu-optimization",
    title: "HS-KR-A 키오스크(linuxfb) 단계별 UI 및 시스템 CPU 점유율 실측",
    population: "HS-KR-A 실보드 4채널 동시 감시 및 linuxfb 키오스크 화면 출력 조건",
    unit: "%",
    status: "reported-observation" as const,
    period: "2026-10-30 HS-KR-A 실보드 시험 (문서 03·09·14)",
    sourceClaimIds: ["C-UI-CPU-COMPACT"],
    limitation:
      "HS-KR-A 1024×600/800×480 linuxfb 소프트웨어 렌더링 기준(단일 코어 100% 환산) · HDMI/FHD 배율 시 소폭 변동 가능",
    disjointSeries: false,
    rows: [
      { category: "초기 (15Hz·원본 축소)", series: "aive-ui (화면)", value: 57.0 },
      { category: "초기 (15Hz·원본 축소)", series: "aive-core (감시 코어)", value: 109.0 },
      { category: "1차 (10Hz·경량 그리기)", series: "aive-ui (화면)", value: 35.0 },
      { category: "1차 (10Hz·경량 그리기)", series: "aive-core (감시 코어)", value: 108.0 },
      { category: "최종 (저해상도 SHM)", series: "aive-ui (화면)", value: 27.0 },
      { category: "최종 (저해상도 SHM)", series: "aive-core (감시 코어)", value: 107.0 },
    ],
  },
  {
    id: "board-latency-fps",
    title: "기존 AiVE 대비 AiVE Pro 2.0 실보드 추론 속도 및 경보 지연 시간 비교",
    population: "HS-KR-A 실보드 4채널 1080p 카메라 입력 및 YOLO26s INT8 운영 기준",
    unit: "ms / fps",
    status: "reported-observation" as const,
    period: "2026-10-30 HS-KR-A 보드 시험 (문서 09·10)",
    sourceClaimIds: ["C-BOARD-PERF"],
    limitation:
      "단위: 추론·경보 지연은 ms(낮을수록 우수), 4채널 합계 처리량은 fps(높을수록 우수) · GPIO 배선 응답은 별도",
    disjointSeries: false,
    rows: [
      { category: "4채널 합계 추론 (fps)", series: "기존 AiVE", value: 40.0 },
      { category: "4채널 합계 추론 (fps)", series: "AiVE Pro 2.0", value: 80.4 },
      { category: "평균 경보 지연 (ms)", series: "기존 AiVE", value: 153.0 },
      { category: "평균 경보 지연 (ms)", series: "AiVE Pro 2.0", value: 70.0 },
      { category: "최악 경보 지연 (ms)", series: "기존 AiVE", value: 178.0 },
      { category: "최악 경보 지연 (ms)", series: "AiVE Pro 2.0", value: 97.0 },
    ],
  },
];

export const stdHeader = () => {
  const row = colBox(1, 12, 0.72, 1.1);
  const [title, message] = splitColumns(row, [0.56, 0.44], 0.28);
  const visualBox = colBox(1, 12, 1.94, 4.04);
  const caption = colBox(1, 12, 6.1, 0.5);
  return { title, message, visualBox, caption };
};

export const round3 = (n: number) => Math.round(n * 1000) / 1000;

export function makeHeader(
  colSplit: [number, number] = [0.56, 0.44],
  visualY = 1.94,
  visualH = 4.04,
) {
  const row = colBox(1, 12, 0.72, 1.1);
  const [title, message] = splitColumns(row, colSplit, 0.28);
  const visualBox = colBox(1, 12, visualY, visualH);
  const caption = colBox(1, 12, 6.1, 0.5);
  return { title, message, visualBox, caption };
}

export function makeAnnotatedScreen(opts: {
  id: string;
  stage: "decision" | "problem" | "scenario" | "intervention" | "operation" | "validation" | "alternatives" | "business";
  sectionId?: string;
  role?: "orientation" | "explanation" | "evidence" | "decision";
  title: string;
  question: string;
  answer: string;
  proofClaimIds: string[];
  visualPurpose: string;
  limitation: string;
  takeaway: string;
  encoding: string;
  legend: string;
  readerTask: string;
  howToRead: string;
  notProven: string;
  guideMessage: string;
  keyPhrase: string;
  focusPhrases: string[];
  tone?: "teal" | "blue" | "amber";
  imagePath: string;
  imageCaption: string;
  scenario: string;
  at: string;
  bannerText: string;
  nodes: { id: string; label: string; detail: string; icon: any }[];
  annotations?: { nodeId: string; x: number; y: number }[];
  paneSplit?: [number, number];
  beliefShift: string;
  nextQuestion: string;
  repetitionReason?: string;
}) {
  const { title, message, visualBox, caption } = makeHeader([0.56, 0.44], 1.94, 4.04);
  const inner = {
    x: round3(visualBox.x + 0.08),
    y: round3(visualBox.y + 0.08),
    w: round3(visualBox.w - 0.16),
    h: round3(visualBox.h - 0.16),
  };
  const [leftPane, rightPane] = splitColumns(
    inner,
    opts.paneSplit || [0.46, 0.54],
    0.24,
  );
  const [frameBox, statusBannerBox] = splitRows(leftPane, [0.76, 0.24], 0.12);
  const sideBoxes = splitRows(
    rightPane,
    opts.nodes.map(() => 1),
    0.12,
  );
  const sidePanelBoxes: Record<string, any> = {};
  opts.nodes.forEach((n, idx) => {
    sidePanelBoxes[n.id] = sideBoxes[idx];
  });

  return {
    id: opts.id,
    stage: opts.stage,
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    title: opts.title,
    question: opts.question,
    answer: opts.answer,
    proofClaimIds: opts.proofClaimIds,
    visualPurpose: opts.visualPurpose,
    limitation: opts.limitation,
    visualPlan: {
      kind: "existing" as const,
      intent: "structural" as const,
      takeaway: opts.takeaway,
      encoding: opts.encoding,
      evidenceIds: opts.proofClaimIds,
      legend: opts.legend,
      explanation: {
        readerTask: opts.readerTask,
        howToRead: opts.howToRead,
        notProven: opts.notProven,
        requiredMarks: ["scene", "screen"] as const,
      },
      readingGuide: {
        message: opts.guideMessage,
        keyPhrase: opts.keyPhrase,
        focusPhrases: opts.focusPhrases,
        tone: opts.tone || "teal",
      },
      interfaceExample: {
        kind: "dashboard" as const,
        dataStatus: "illustrative" as const,
        basisClaimIds: opts.proofClaimIds,
        scenario: opts.scenario,
        at: opts.at,
        metrics: [
          { label: "대상", value: opts.at, tone: "neutral" as const },
        ],
        records: [
          {
            name: opts.nodes[0].label,
            status: "구현·검증",
            detail: opts.nodes[0].detail,
            updated: "2026-10-31",
          },
        ],
        evidence: [{ label: "문서 근거", value: opts.proofClaimIds.join(", ") }],
        decision: {
          title: opts.keyPhrase,
          reason: opts.takeaway,
          action: opts.bannerText,
        },
        image: {
          path: opts.imagePath,
          caption: opts.imageCaption,
          origin: "generated-concept" as const,
        },
      },
      scene: {
        path: opts.imagePath,
        rights: "generated" as const,
        caption: opts.imageCaption,
        reuseReason: opts.visualPurpose,
        annotations:
          opts.annotations ||
          opts.nodes.slice(0, 2).map((n, idx) => ({
            nodeId: n.id,
            x: idx === 0 ? 0.32 : 0.68,
            y: idx === 0 ? 0.38 : 0.62,
          })),
      },
      nodes: opts.nodes,
      edges: [],
    },
    compositionBrief: {
      engine: "authored-v1" as const,
      role: opts.role || ("explanation" as const),
      visual: "annotated-screen" as const,
      rationale: opts.visualPurpose,
      readingPath: opts.howToRead,
      continuity: opts.nextQuestion,
      ...(opts.repetitionReason
        ? { repetitionReason: opts.repetitionReason }
        : {}),
      title,
      message,
      visualBox,
      caption,
      titleAlign: "left" as const,
      nodeBoxes: {},
      edgeLabelBoxes: {},
      screenLayout: {
        frameBox,
        statusBannerBox,
        sidePanelBoxes,
      },
      typography: {
        titleSize: 24,
        messageSize: 19,
        nodeTitleSize: 16,
        bodySize: 16,
        captionSize: 12,
      },
      narrative: {
        beliefShift: opts.beliefShift,
        evidenceClaimIds: opts.proofClaimIds,
        nextQuestion: opts.nextQuestion,
      },
    },
  };
}

export function makeCausalChain(opts: {
  id: string;
  stage: "problem" | "intervention" | "operation" | "validation" | "business";
  sectionId?: string;
  role?: "orientation" | "explanation" | "evidence" | "decision";
  title: string;
  question: string;
  answer: string;
  proofClaimIds: string[];
  visualPurpose: string;
  limitation: string;
  takeaway: string;
  encoding: string;
  legend: string;
  readerTask: string;
  howToRead: string;
  notProven: string;
  guideMessage: string;
  keyPhrase: string;
  focusPhrases: string[];
  tone?: "teal" | "blue" | "amber";
  chains: {
    id: string;
    cause: string;
    intervention: string;
    response: string;
    result: string;
    mechanismIds: string[];
    interventionIds: string[];
    metricIds: string[];
  }[];
  nodes: { id: string; label: string; detail: string; icon: any }[];
  beliefShift: string;
  nextQuestion: string;
  repetitionReason?: string;
}) {
  const { title, message, visualBox, caption } = makeHeader([0.56, 0.44], 1.94, 4.04);
  const inner = {
    x: round3(visualBox.x + 0.08),
    y: round3(visualBox.y + 0.08),
    w: round3(visualBox.w - 0.16),
    h: round3(visualBox.h - 0.16),
  };
  const rows = splitRows(
    inner,
    opts.chains.map(() => 1),
    0.16,
  );
  const nodeBoxes: Record<string, any> = {};
  opts.chains.forEach((c, rIdx) => {
    const cols = splitColumns(rows[rIdx], [1, 1, 1, 1], 0.24);
    nodeBoxes[`${c.id}:cause`] = cols[0];
    nodeBoxes[`${c.id}:intervention`] = cols[1];
    nodeBoxes[`${c.id}:response`] = cols[2];
    nodeBoxes[`${c.id}:result`] = cols[3];
  });

  return {
    id: opts.id,
    stage: opts.stage,
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    title: opts.title,
    question: opts.question,
    answer: opts.answer,
    proofClaimIds: opts.proofClaimIds,
    visualPurpose: opts.visualPurpose,
    limitation: opts.limitation,
    visualPlan: {
      kind: "causal-flow" as const,
      intent: "causal" as const,
      takeaway: opts.takeaway,
      encoding: opts.encoding,
      evidenceIds: opts.proofClaimIds,
      legend: opts.legend,
      explanation: {
        readerTask: opts.readerTask,
        howToRead: opts.howToRead,
        notProven: opts.notProven,
        requiredMarks: ["connectors"] as const,
      },
      readingGuide: {
        message: opts.guideMessage,
        keyPhrase: opts.keyPhrase,
        focusPhrases: opts.focusPhrases,
        tone: opts.tone || "amber",
      },
      chains: opts.chains.map((c) => ({
        ...c,
        alternativeIds: [],
        evidenceIds: opts.proofClaimIds,
        resultStatus: "hypothesis" as const,
      })),
      nodes: opts.nodes,
      edges: [],
    },
    compositionBrief: {
      engine: "authored-v1" as const,
      role: opts.role || ("explanation" as const),
      visual: "causal-chain" as const,
      rationale: opts.visualPurpose,
      readingPath: opts.howToRead,
      continuity: opts.nextQuestion,
      ...(opts.repetitionReason
        ? { repetitionReason: opts.repetitionReason }
        : {}),
      title,
      message,
      visualBox,
      caption,
      titleAlign: "left" as const,
      nodeBoxes,
      edgeLabelBoxes: {},
      typography: {
        titleSize: 24,
        messageSize: 19,
        nodeTitleSize: 16,
        bodySize: 16,
        captionSize: 12,
      },
      narrative: {
        beliefShift: opts.beliefShift,
        evidenceClaimIds: opts.proofClaimIds,
        nextQuestion: opts.nextQuestion,
      },
    },
  };
}

export function makeGraph6(opts: {
  id: string;
  stage: "intervention" | "operation" | "validation" | "business";
  sectionId?: string;
  role?: "orientation" | "explanation" | "evidence" | "decision";
  title: string;
  question: string;
  answer: string;
  proofClaimIds: string[];
  visualPurpose: string;
  limitation: string;
  takeaway: string;
  encoding: string;
  legend: string;
  readerTask: string;
  howToRead: string;
  notProven: string;
  guideMessage: string;
  keyPhrase: string;
  focusPhrases: string[];
  tone?: "teal" | "blue" | "amber";
  nodes: [
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
  ];
  edgeLabels: [string, string, string, string, string];
  beliefShift: string;
  nextQuestion: string;
  repetitionReason?: string;
}) {
  const { title, message, visualBox, caption } = makeHeader([0.56, 0.44], 1.94, 4.04);
  const topRowBox = {
    x: round3(visualBox.x + 0.08),
    y: round3(visualBox.y + 0.32),
    w: round3(visualBox.w - 0.16),
    h: 1.65,
  };
  const botRowBox = {
    x: round3(visualBox.x + 0.08),
    y: round3(visualBox.y + 2.31),
    w: round3(visualBox.w - 0.16),
    h: 1.65,
  };
  const topCols = splitColumns(topRowBox, [1, 1, 1], 0.42);
  const botCols = splitColumns(botRowBox, [1, 1, 1], 0.42);
  const boxes = [
    topCols[0],
    topCols[1],
    topCols[2],
    botCols[0],
    botCols[1],
    botCols[2],
  ];
  const nodeBoxes: Record<string, any> = {};
  opts.nodes.forEach((n, idx) => {
    nodeBoxes[n.id] = boxes[idx];
  });

  const n = opts.nodes;
  const edges = [
    { from: n[0].id, to: n[1].id, label: opts.edgeLabels[0] },
    { from: n[1].id, to: n[2].id, label: opts.edgeLabels[1] },
    { from: n[2].id, to: n[5].id, label: opts.edgeLabels[2] },
    { from: n[3].id, to: n[4].id, label: opts.edgeLabels[3] },
    { from: n[4].id, to: n[5].id, label: opts.edgeLabels[4] },
  ];

  const gap01Center = round3(topCols[0].x + topCols[0].w + 0.21);
  const gap12Center = round3(topCols[1].x + topCols[1].w + 0.21);

  const edgeLabelBoxes: Record<string, any> = {
    [`${n[0].id}:${n[1].id}`]: {
      x: round3(gap01Center - 1.05),
      y: round3(visualBox.y + 0.03),
      w: 2.1,
      h: 0.26,
    },
    [`${n[1].id}:${n[2].id}`]: {
      x: round3(gap12Center - 1.05),
      y: round3(visualBox.y + 0.03),
      w: 2.1,
      h: 0.26,
    },
    [`${n[2].id}:${n[5].id}`]: {
      x: round3(topCols[2].x + topCols[2].w / 2 + 0.08),
      y: round3(topRowBox.y + topRowBox.h + 0.04),
      w: 1.82,
      h: 0.26,
    },
    [`${n[3].id}:${n[4].id}`]: {
      x: round3(gap01Center - 1.05),
      y: round3(topRowBox.y + topRowBox.h + 0.04),
      w: 2.1,
      h: 0.26,
    },
    [`${n[4].id}:${n[5].id}`]: {
      x: round3(gap12Center - 1.05),
      y: round3(topRowBox.y + topRowBox.h + 0.04),
      w: 2.1,
      h: 0.26,
    },
  };

  return {
    id: opts.id,
    stage: opts.stage,
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    title: opts.title,
    question: opts.question,
    answer: opts.answer,
    proofClaimIds: opts.proofClaimIds,
    visualPurpose: opts.visualPurpose,
    limitation: opts.limitation,
    visualPlan: {
      kind: "system" as const,
      intent: "structural" as const,
      takeaway: opts.takeaway,
      encoding: opts.encoding,
      evidenceIds: opts.proofClaimIds,
      legend: opts.legend,
      explanation: {
        readerTask: opts.readerTask,
        howToRead: opts.howToRead,
        notProven: opts.notProven,
        requiredMarks: ["connectors"] as const,
      },
      readingGuide: {
        message: opts.guideMessage,
        keyPhrase: opts.keyPhrase,
        focusPhrases: opts.focusPhrases,
        tone: opts.tone || "blue",
      },
      nodes: opts.nodes,
      edges,
    },
    compositionBrief: {
      engine: "authored-v1" as const,
      role: opts.role || ("explanation" as const),
      visual: "graph" as const,
      rationale: opts.visualPurpose,
      readingPath: opts.howToRead,
      continuity: opts.nextQuestion,
      ...(opts.repetitionReason
        ? { repetitionReason: opts.repetitionReason }
        : {}),
      title,
      message,
      visualBox,
      caption,
      titleAlign: "left" as const,
      nodeBoxes,
      edgeLabelBoxes,
      typography: {
        titleSize: 24,
        messageSize: 19,
        nodeTitleSize: 16,
        bodySize: 16,
        captionSize: 12,
      },
      narrative: {
        beliefShift: opts.beliefShift,
        evidenceClaimIds: opts.proofClaimIds,
        nextQuestion: opts.nextQuestion,
      },
    },
  };
}

export function makeGraph4(opts: {
  id: string;
  stage: "intervention" | "operation" | "validation" | "business";
  sectionId?: string;
  role?: "orientation" | "explanation" | "evidence" | "decision";
  title: string;
  question: string;
  answer: string;
  proofClaimIds: string[];
  visualPurpose: string;
  limitation: string;
  takeaway: string;
  encoding: string;
  legend: string;
  readerTask: string;
  howToRead: string;
  notProven: string;
  guideMessage: string;
  keyPhrase: string;
  focusPhrases: string[];
  tone?: "teal" | "blue" | "amber";
  nodes: [
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
  ];
  edgeLabels: [string, string, string];
  beliefShift: string;
  nextQuestion: string;
  repetitionReason?: string;
}) {
  const { title, message, visualBox, caption } = makeHeader([0.56, 0.44], 1.94, 4.04);
  const inner = {
    x: round3(visualBox.x + 0.08),
    y: round3(visualBox.y + 0.08),
    w: round3(visualBox.w - 0.16),
    h: round3(visualBox.h - 0.16),
  };
  const [row0, row1] = splitRows(inner, [1, 1], 0.54);
  const topCols = splitColumns(row0, [1, 1], 0.9);
  const botCols = splitColumns(row1, [1, 1], 0.9);
  const boxes = [topCols[0], topCols[1], botCols[0], botCols[1]];
  const nodeBoxes: Record<string, any> = {};
  opts.nodes.forEach((n, idx) => {
    nodeBoxes[n.id] = boxes[idx];
  });
  const n = opts.nodes;
  const edges = [
    { from: n[0].id, to: n[1].id, label: opts.edgeLabels[0] },
    { from: n[1].id, to: n[3].id, label: opts.edgeLabels[1] },
    { from: n[2].id, to: n[3].id, label: opts.edgeLabels[2] },
  ];
  const gapMidY = round3((topCols[1].y + topCols[1].h + botCols[1].y) / 2);

  const edgeLabelBoxes: Record<string, any> = {
    [`${n[0].id}:${n[1].id}`]: {
      x: round3(topCols[0].x + topCols[0].w + 0.08),
      y: round3(topCols[0].y + 0.12),
      w: 0.74,
      h: 0.54,
    },
    [`${n[1].id}:${n[3].id}`]: {
      x: round3(topCols[1].x + topCols[1].w / 2 + 0.1),
      y: round3(gapMidY - 0.23),
      w: 1.5,
      h: 0.46,
    },
    [`${n[2].id}:${n[3].id}`]: {
      x: round3(botCols[0].x + botCols[0].w + 0.08),
      y: round3(botCols[0].y + 0.12),
      w: 0.74,
      h: 0.54,
    },
  };

  return {
    id: opts.id,
    stage: opts.stage,
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    title: opts.title,
    question: opts.question,
    answer: opts.answer,
    proofClaimIds: opts.proofClaimIds,
    visualPurpose: opts.visualPurpose,
    limitation: opts.limitation,
    visualPlan: {
      kind: "flow" as const,
      intent: "structural" as const,
      takeaway: opts.takeaway,
      encoding: opts.encoding,
      evidenceIds: opts.proofClaimIds,
      legend: opts.legend,
      explanation: {
        readerTask: opts.readerTask,
        howToRead: opts.howToRead,
        notProven: opts.notProven,
        requiredMarks: ["connectors"] as const,
      },
      readingGuide: {
        message: opts.guideMessage,
        keyPhrase: opts.keyPhrase,
        focusPhrases: opts.focusPhrases,
        tone: opts.tone || "teal",
      },
      nodes: opts.nodes,
      edges,
    },
    compositionBrief: {
      engine: "authored-v1" as const,
      role: opts.role || ("explanation" as const),
      visual: "graph" as const,
      rationale: opts.visualPurpose,
      readingPath: opts.howToRead,
      continuity: opts.nextQuestion,
      ...(opts.repetitionReason
        ? { repetitionReason: opts.repetitionReason }
        : {}),
      title,
      message,
      visualBox,
      caption,
      titleAlign: "left" as const,
      nodeBoxes,
      edgeLabelBoxes,
      typography: {
        titleSize: 24,
        messageSize: 19,
        nodeTitleSize: 16,
        bodySize: 16,
        captionSize: 12,
      },
      narrative: {
        beliefShift: opts.beliefShift,
        evidenceClaimIds: opts.proofClaimIds,
        nextQuestion: opts.nextQuestion,
      },
    },
  };
}

export function makeSwimlane4(opts: {
  id: string;
  stage: "intervention" | "operation" | "validation" | "business";
  sectionId?: string;
  role?: "orientation" | "explanation" | "evidence" | "decision";
  title: string;
  question: string;
  answer: string;
  proofClaimIds: string[];
  visualPurpose: string;
  limitation: string;
  takeaway: string;
  encoding: string;
  legend: string;
  readerTask: string;
  howToRead: string;
  notProven: string;
  guideMessage: string;
  keyPhrase: string;
  focusPhrases: string[];
  tone?: "teal" | "blue" | "amber";
  topLaneTitle: string;
  bottomLaneTitle: string;
  nodes: [
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
  ];
  edgeLabels: [string, string, string];
  beliefShift: string;
  nextQuestion: string;
  repetitionReason?: string;
}) {
  const { title, message, visualBox, caption } = makeHeader([0.56, 0.44], 1.94, 4.04);
  const [topLane, botLane] = splitRows(
    {
      x: round3(visualBox.x + 0.08),
      y: round3(visualBox.y + 0.08),
      w: round3(visualBox.w - 0.16),
      h: round3(visualBox.h - 0.16),
    },
    [1, 1],
    0.26,
  );
  const topCols = splitColumns(
    {
      x: round3(topLane.x + 1.85),
      y: round3(topLane.y + 0.12),
      w: round3(topLane.w - 1.98),
      h: round3(topLane.h - 0.24),
    },
    [1, 1],
    0.9,
  );
  const botCols = splitColumns(
    {
      x: round3(botLane.x + 1.85),
      y: round3(botLane.y + 0.12),
      w: round3(botLane.w - 1.98),
      h: round3(botLane.h - 0.24),
    },
    [1, 1],
    0.9,
  );
  const n = opts.nodes;
  const n0 = topCols[0];
  const n1 = botCols[0];
  const n2 = botCols[1];
  const n3 = topCols[1];
  const gapY = round3((topLane.y + topLane.h + botLane.y) / 2);

  return {
    id: opts.id,
    stage: opts.stage,
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    title: opts.title,
    question: opts.question,
    answer: opts.answer,
    proofClaimIds: opts.proofClaimIds,
    visualPurpose: opts.visualPurpose,
    limitation: opts.limitation,
    visualPlan: {
      kind: "flow" as const,
      intent: "structural" as const,
      takeaway: opts.takeaway,
      encoding: opts.encoding,
      evidenceIds: opts.proofClaimIds,
      legend: opts.legend,
      explanation: {
        readerTask: opts.readerTask,
        howToRead: opts.howToRead,
        notProven: opts.notProven,
        requiredMarks: ["connectors"] as const,
      },
      readingGuide: {
        message: opts.guideMessage,
        keyPhrase: opts.keyPhrase,
        focusPhrases: opts.focusPhrases,
        tone: opts.tone || "blue",
      },
      nodes: opts.nodes,
      edges: [
        { from: n[0].id, to: n[1].id, label: opts.edgeLabels[0] },
        { from: n[1].id, to: n[2].id, label: opts.edgeLabels[1] },
        { from: n[2].id, to: n[3].id, label: opts.edgeLabels[2] },
      ],
    },
    compositionBrief: {
      engine: "authored-v1" as const,
      role: opts.role || ("explanation" as const),
      visual: "swimlane" as const,
      rationale: opts.visualPurpose,
      readingPath: opts.howToRead,
      continuity: opts.nextQuestion,
      ...(opts.repetitionReason
        ? { repetitionReason: opts.repetitionReason }
        : {}),
      title,
      message,
      visualBox,
      caption,
      titleAlign: "left" as const,
      nodeBoxes: {
        [n[0].id]: n0,
        [n[1].id]: n1,
        [n[2].id]: n2,
        [n[3].id]: n3,
      },
      edgeLabelBoxes: {
        [`${n[0].id}:${n[1].id}`]: {
          x: round3(n0.x + n0.w / 2 + 0.08),
          y: round3(gapY - 0.13),
          w: 1.85,
          h: 0.26,
        },
        [`${n[1].id}:${n[2].id}`]: {
          x: round3(n1.x + n1.w + 0.06),
          y: round3(n1.y + 0.12),
          w: 0.78,
          h: 0.54,
        },
        [`${n[2].id}:${n[3].id}`]: {
          x: round3(n2.x + n2.w / 2 + 0.08),
          y: round3(gapY - 0.13),
          w: 1.85,
          h: 0.26,
        },
      },
      edgeRoutes: {
        [`${n[0].id}:${n[1].id}`]: {
          waypoints: [
            [round3(n0.x + n0.w / 2), round3(n0.y + n0.h)],
            [round3(n1.x + n1.w / 2), round3(n1.y)],
          ],
        },
        [`${n[1].id}:${n[2].id}`]: {
          waypoints: [
            [round3(n1.x + n1.w), round3(n1.y + n1.h / 2)],
            [round3(n2.x), round3(n2.y + n2.h / 2)],
          ],
        },
        [`${n[2].id}:${n[3].id}`]: {
          waypoints: [
            [round3(n2.x + n2.w / 2), round3(n2.y)],
            [round3(n3.x + n3.w / 2), round3(n3.y + n3.h)],
          ],
        },
      },
      swimlaneLayout: {
        laneHeaderWidth: 1.68,
        lanes: {
          [opts.topLaneTitle]: topLane,
          [opts.bottomLaneTitle]: botLane,
        },
        nodeLanes: {
          [n[0].id]: opts.topLaneTitle,
          [n[1].id]: opts.bottomLaneTitle,
          [n[2].id]: opts.bottomLaneTitle,
          [n[3].id]: opts.topLaneTitle,
        },
      },
      typography: {
        titleSize: 24,
        messageSize: 19,
        nodeTitleSize: 16,
        bodySize: 16,
        captionSize: 12,
      },
      narrative: {
        beliefShift: opts.beliefShift,
        evidenceClaimIds: opts.proofClaimIds,
        nextQuestion: opts.nextQuestion,
      },
    },
  };
}

export function makeChart(opts: {
  id: string;
  stage: "validation" | "problem" | "business";
  sectionId?: string;
  title: string;
  question: string;
  answer: string;
  proofClaimIds: string[];
  visualPurpose: string;
  limitation: string;
  takeaway: string;
  encoding: string;
  legend: string;
  readerTask: string;
  howToRead: string;
  notProven: string;
  guideMessage: string;
  keyPhrase: string;
  focusPhrases: string[];
  tone?: "teal" | "blue" | "amber";
  datasetId: string;
  focusSeries: string;
  focusReason: string;
  nodes: { id: string; label: string; detail: string; icon: any }[];
  beliefShift: string;
  nextQuestion: string;
  repetitionReason?: string;
}) {
  const { title, message, caption } = makeHeader([0.56, 0.44], 1.94, 4.04);
  const noteBox = colBox(1, 5, 1.94, 4.04);
  const visualBox = colBox(6, 12, 1.94, 4.04);

  return {
    id: opts.id,
    stage: opts.stage,
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    title: opts.title,
    question: opts.question,
    answer: opts.answer,
    proofClaimIds: opts.proofClaimIds,
    visualPurpose: opts.visualPurpose,
    limitation: opts.limitation,
    visualPlan: {
      kind: "data-chart" as const,
      intent: "quantitative" as const,
      takeaway: opts.takeaway,
      encoding: opts.encoding,
      evidenceIds: opts.proofClaimIds,
      legend: opts.legend,
      explanation: {
        readerTask: opts.readerTask,
        howToRead: opts.howToRead,
        notProven: opts.notProven,
        requiredMarks: ["chart"] as const,
      },
      readingGuide: {
        message: opts.guideMessage,
        keyPhrase: opts.keyPhrase,
        focusPhrases: opts.focusPhrases,
        tone: opts.tone || "teal",
      },
      chart: {
        datasetId: opts.datasetId,
        type: "bar" as const,
        orientation: "column" as const,
        stacked: false,
      },
      nodes: opts.nodes,
      edges: [],
    },
    compositionBrief: {
      engine: "authored-v1" as const,
      role: "evidence" as const,
      visual: "chart" as const,
      rationale: opts.visualPurpose,
      readingPath: opts.howToRead,
      continuity: opts.nextQuestion,
      ...(opts.repetitionReason
        ? { repetitionReason: opts.repetitionReason }
        : {}),
      title,
      message,
      visualBox,
      caption,
      titleAlign: "left" as const,
      nodeBoxes: {},
      edgeLabelBoxes: {},
      chartFocus: {
        series: opts.focusSeries,
        reason: opts.focusReason,
        claimIds: opts.proofClaimIds,
        noteBox,
      },
      typography: {
        titleSize: 24,
        messageSize: 19,
        nodeTitleSize: 16,
        bodySize: 16,
        captionSize: 12,
      },
      narrative: {
        beliefShift: opts.beliefShift,
        evidenceClaimIds: opts.proofClaimIds,
        nextQuestion: opts.nextQuestion,
      },
    },
  };
}

export function makeScene(opts: {
  id: string;
  stage: "scenario" | "decision" | "intervention" | "business";
  sectionId?: string;
  role?: "orientation" | "explanation" | "evidence" | "decision";
  title: string;
  question: string;
  answer: string;
  proofClaimIds: string[];
  visualPurpose: string;
  limitation: string;
  takeaway: string;
  encoding: string;
  legend: string;
  readerTask: string;
  howToRead: string;
  notProven: string;
  guideMessage: string;
  keyPhrase: string;
  focusPhrases: string[];
  tone?: "teal" | "blue" | "amber";
  imagePath: string;
  imageCaption: string;
  nodes: [
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
    { id: string; label: string; detail: string; icon: any },
  ];
  annotations: [
    { nodeId: string; x: number; y: number },
    { nodeId: string; x: number; y: number },
    { nodeId: string; x: number; y: number },
  ];
  beliefShift: string;
  nextQuestion: string;
  repetitionReason?: string;
}) {
  const { title, message, visualBox, caption } = makeHeader([0.56, 0.44], 1.94, 4.04);
  const rightCards = splitRows(
    { x: 8.16, y: 2.0, w: 4.45, h: 3.9 },
    [1, 1, 1],
    0.14,
  );
  const n = opts.nodes;

  return {
    id: opts.id,
    stage: opts.stage,
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    title: opts.title,
    question: opts.question,
    answer: opts.answer,
    proofClaimIds: opts.proofClaimIds,
    visualPurpose: opts.visualPurpose,
    limitation: opts.limitation,
    visualPlan: {
      kind: "site" as const,
      intent: "spatial" as const,
      takeaway: opts.takeaway,
      encoding: opts.encoding,
      evidenceIds: opts.proofClaimIds,
      legend: opts.legend,
      explanation: {
        readerTask: opts.readerTask,
        howToRead: opts.howToRead,
        notProven: opts.notProven,
        requiredMarks: ["scene"] as const,
      },
      readingGuide: {
        message: opts.guideMessage,
        keyPhrase: opts.keyPhrase,
        focusPhrases: opts.focusPhrases,
        tone: opts.tone || "amber",
      },
      scene: {
        path: opts.imagePath,
        rights: "generated" as const,
        caption: opts.imageCaption,
        reuseReason: opts.visualPurpose,
        annotations: opts.annotations,
      },
      nodes: opts.nodes,
      edges: [],
    },
    compositionBrief: {
      engine: "authored-v1" as const,
      role: opts.role || ("orientation" as const),
      visual: "scene" as const,
      rationale: opts.visualPurpose,
      readingPath: opts.howToRead,
      continuity: opts.nextQuestion,
      ...(opts.repetitionReason
        ? { repetitionReason: opts.repetitionReason }
        : {}),
      title,
      message,
      visualBox,
      caption,
      titleAlign: "left" as const,
      nodeBoxes: {
        [n[0].id]: rightCards[0],
        [n[1].id]: rightCards[1],
        [n[2].id]: rightCards[2],
      },
      edgeLabelBoxes: {},
      typography: {
        titleSize: 24,
        messageSize: 19,
        nodeTitleSize: 16,
        bodySize: 16,
        captionSize: 12,
      },
      narrative: {
        beliefShift: opts.beliefShift,
        evidenceClaimIds: opts.proofClaimIds,
        nextQuestion: opts.nextQuestion,
      },
    },
  };
}

export function makeTimeline(opts: {
  id: string;
  stage: "validation" | "operation" | "business";
  sectionId?: string;
  role?: "orientation" | "explanation" | "evidence" | "decision";
  title: string;
  question: string;
  answer: string;
  proofClaimIds: string[];
  visualPurpose: string;
  limitation: string;
  takeaway: string;
  encoding: string;
  legend: string;
  readerTask: string;
  howToRead: string;
  notProven: string;
  guideMessage: string;
  keyPhrase: string;
  focusPhrases: string[];
  tone?: "teal" | "blue" | "amber";
  slots: number;
  unitLabel: string;
  nodes: [
    { id: string; label: string; detail: string; icon: any; start: number; length: number },
    { id: string; label: string; detail: string; icon: any; start: number; length: number },
    { id: string; label: string; detail: string; icon: any; start: number; length: number },
    { id: string; label: string; detail: string; icon: any; start: number; length: number },
  ];
  beliefShift: string;
  nextQuestion: string;
  repetitionReason?: string;
}) {
  const { title, message, visualBox, caption } = makeHeader([0.56, 0.44], 1.94, 4.04);

  return {
    id: opts.id,
    stage: opts.stage,
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    title: opts.title,
    question: opts.question,
    answer: opts.answer,
    proofClaimIds: opts.proofClaimIds,
    visualPurpose: opts.visualPurpose,
    limitation: opts.limitation,
    visualPlan: {
      kind: "timeline" as const,
      intent: "temporal" as const,
      takeaway: opts.takeaway,
      encoding: opts.encoding,
      evidenceIds: opts.proofClaimIds,
      legend: opts.legend,
      explanation: {
        readerTask: opts.readerTask,
        howToRead: opts.howToRead,
        notProven: opts.notProven,
        requiredMarks: ["timeline"] as const,
      },
      readingGuide: {
        message: opts.guideMessage,
        keyPhrase: opts.keyPhrase,
        focusPhrases: opts.focusPhrases,
        tone: opts.tone || "teal",
      },
      schedule: {
        slots: opts.slots,
        unitLabel: opts.unitLabel,
        ranges: opts.nodes.map((n) => ({
          nodeId: n.id,
          start: n.start,
          length: n.length,
        })),
      },
      nodes: opts.nodes.map(({ id, label, detail, icon }) => ({
        id,
        label,
        detail,
        icon,
      })),
      edges: [],
    },
    compositionBrief: {
      engine: "authored-v1" as const,
      role: opts.role || ("decision" as const),
      visual: "timeline" as const,
      rationale: opts.visualPurpose,
      readingPath: opts.howToRead,
      continuity: opts.nextQuestion,
      ...(opts.repetitionReason
        ? { repetitionReason: opts.repetitionReason }
        : {}),
      title,
      message,
      visualBox,
      caption,
      titleAlign: "left" as const,
      nodeBoxes: {},
      edgeLabelBoxes: {},
      typography: {
        titleSize: 24,
        messageSize: 19,
        nodeTitleSize: 16,
        bodySize: 16,
        captionSize: 12,
      },
      narrative: {
        beliefShift: opts.beliefShift,
        evidenceClaimIds: opts.proofClaimIds,
        nextQuestion: opts.nextQuestion,
      },
    },
  };
}
