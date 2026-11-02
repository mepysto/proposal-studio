# 구현 기능 및 솔루션 명세

기준일: 2026-10-26 · 소스 `f023f1d` · [문서집](README.md).
‘구현’은 현재 코드에 경로와 동작이 존재한다는 뜻입니다. 테스트 열은 관련 회귀 코드의 위치이며 이번 실행의 통과 결과를 뜻하지 않습니다.

## 1. 중앙 웹 관제

아래 화면은 `central/frontend/src/app/`의 실제 라우트입니다.

| 기능 | 구현 내용 | 근거 / 관련 테스트 |
|---|---|---|
| 로그인·프로필 | 이메일 로그인·로그아웃, 세션 갱신·폐기, 이메일·휴대폰·비밀번호 변경 | `login`, `profile` / `test_session_security.py`, `test_user_self_service.py` |
| 대시보드 `/` | 현장 카드, 검색·도시 필터, 노면 상태·전력·장비·기상 요약, 이력 차트·KPI 추세·최근 경보 | `app/page.tsx`, `endpoints/dashboard.py` / `test_kpi_percentiles.py`, `dashboard.spec.ts` |
| AI 관제 `/ai` | 현장·구역 위험도, 예열 타임라인, XAI 설명, 이벤트·결정·예보·모델·피드백·엣지 탭, 가온 구역 편집 | `app/ai/page.tsx`, `components/ai-control` / `ai-control-page.spec.ts` |
| NOC `/noc` | 경보 확인·담당자 할당·해결 메모, 미확인·미해결 경보 격상 상태 | `app/noc/page.tsx`, `endpoints/alerts.py` / `test_alerts_escalation.py` |
| GIS `/map` | Leaflet 2D·Cesium 3D 지도, 현장·장비 billboard, 클러스터·미니맵, 열지도·시간 탐색, 구역 편집·날씨 효과 | `components/map` / `map-3d.spec.ts`, `test_thermal_uniformity.py` |
| 현장 `/sites` | 검색·도시 필터·페이지 이동, 등록·조회·수정·삭제, 좌표·주소·조직 정보 | `endpoints/sites.py` / `sites.spec.ts`, `site-pagination.spec.ts` |
| 현장 상세 `/sites/[id]` | CCTV, 센서 차트, 제어, 녹화, 제어 감사로그, 장비·가열 구역 매핑, 단면 디지털 트윈, 에너지, 정비 정보 | `components/site-detail`, `components/sites` / `site-detail-tabs.spec.ts`, `test_zone_resolution.py` |
| 운영일지 `/logbook` | 현장·일자별 생성·수정·삭제·조회, 주간 이력 기반 추천 초안 | `endpoints/logbook.py`, `app/logbook/page.tsx` |
| 설정 `/settings` | 브라우저별 언어·주기·알림음, 서버 공통 경보 기준·발송 채널·AI 임계값·보존 기간 | `endpoints/system_settings.py` / `test_system_settings.py` |
| 사용자 관리 | 슈퍼유저의 사용자 생성·수정·비활성·삭제, 역할·조직, 자기 프로필 관리 | `endpoints/users.py`, `organizations.py` / `test_users_management.py`, `test_roles_rbac.py` |
| 사용 도움말 `/manual` | Markdown 원본을 장별로 읽는 내장 매뉴얼, 이미지·Mermaid 렌더링 | `lib/manual.ts`, `app/manual` |
| 공통 UI | 한국어·영어, 반응형 메뉴, SSE 경보·상태 알림, 움직임 줄이기·읽기 접근성, 명령 팔레트 | `contexts`, `hooks`, `components/layout` / `accessibility-motion.spec.ts` |

`/playground`는 실험용 화면입니다. 화면에 보이는 메뉴·버튼과 API 사용 권한은 다를 수 있으며 서버가 최종 권한을 검사합니다.

## 2. 영상·노면 인식

| 기능 | 구현 내용 | 근거 / 관련 테스트 |
|---|---|---|
| 스냅샷 | RTSP 캡처·캐시·저장, 인증 API로 제공, OpenCV 네이티브 오류의 프로세스 격리 | `services/cctv.py`, `snapshot.py`, `isolated_capture.py` / `test_snapshot_storage.py` |
| 실시간 영상 | ffmpeg 기반 스트림 경로, 선택적 MediaMTX 중계, 단기 영상 읽기 토큰·권한 확인, HLS 프록시 | `live_stream.py`, `stream_relay.py`, `endpoints/streams.py` / `test_live_stream.py`, `test_stream_relay.py` |
| 녹화·재생 | 카메라 녹화 시작·종료, worker의 ffmpeg 처리·완료 상태, 저장소 업로드, 인증 재생·Range 탐색 | `recorder.py`, `endpoints/devices.py` / `test_recordings.py`, `test_recording_playback.py` |
| 중앙 AI worker | RTSP 순차 예약·동시성 제한, 모델 SHA-256 검사, OpenCV DNN ONNX 분류, 결과·스냅샷·heartbeat 전송 | `central/ai/main.py`, `inference_onnx.py`, `camera_schedule.py` / AI `test_inference_onnx.py`, `test_camera_schedule.py` |
| 추가 분석 경로 | 백엔드 선택적 YOLO 세그멘테이션, ROI 마스크, snow/ice coverage, 영상 품질·정지 프레임 검사 | `services/ai.py`, `vision_quality.py`, `ai/inference_yolo.py` / `test_vision_roi.py`, `test_vision_quality.py` |
| 신뢰도 안전 처리 | 서버 공통 임계값 미달은 `uncertain`, Vision 신뢰 판정과 센서·기상 규칙 분리 | `endpoints/ingest.py`, `control_policy.py` / `test_vision_threshold.py` |

중앙 production 백엔드 이미지에는 `central/ai`가 포함되지 않습니다. 이 경우 내장 스냅샷 분석은 건너뛰며 별도 AI worker가 판정합니다.
중앙 worker가 카메라 목록에서 가져오는 정보는 현재 RTSP 주소·현장·장치 ID이며, ROI 좌표를 별도 전달하지 않습니다.
ROI 처리는 백엔드 선택적 분석과 Edge 카메라 설정 경로에서 확인됩니다. GIS의 위경도 다각형과 CCTV 픽셀 ROI는 서로 다른 좌표계입니다.

## 3. 자동 제어·명령 전달

| 기능 | 구현 내용 | 근거 / 관련 테스트 |
|---|---|---|
| 5단계 판단 | 안전 래치·통신 실패 우선 정지, 신뢰 Vision·저온/습도·기후 위험도 가동, 예보 예열, 위험 잔류 유지, 해소 시 정지 | `control_policy.py`, `control_rules.py` / `test_control_policy.py`, `test_control_state_machine.py` |
| 입력 유효성 | 오래된 센서·비전 입력 배제, 현장·구역 귀속 검사, 불명확한 zone 명령 차단 | `control_rules.py`, `ai_platform.py`, `edge_ingest.py` / `test_control_api_safety.py`, `test_zone_resolution.py` |
| 수동 개입 | 슈퍼유저 ON/OFF, API 기간 1~480분·기본 60분, 감사 주체 기록, 안전 조건 검사 | `endpoints/control.py`, `services/control.py` / `test_device_override.py`, `test_safety_latch.py` |
| 상태 진동 억제 | 단계 하향 시 최소 유지시간, 안전정지·위험 상승은 즉시 처리 | `control_policy.py` / `test_control_policy.py` |
| 피크 부하 제한 | 수동 고정 부하를 고려하고 자동 구역의 단계·위험도에 따라 구역 단위 OFF 선택 | `control_policy.shed_peak_load` / `test_control_policy.py` |
| 영속 명령 원장 | command ID·기한·시도 횟수·상태, desired-state 조회, 명시적 ACK 매칭, 재시도·만료·실패 경보 | `control_ack.py`, `edge_ingest.py`, `edge_reconcile.py` / `test_device_ack_retry.py`, `test_edge_ingest.py` |
| 결정 감사 | 입력 스냅샷·모델/룰 버전·이유, 결정 조회·리플레이·CSV, 수동/자동 Control Logs | `ai_platform_control.py`, `models/control_log.py` / `test_decision_replay_export.py` |

물리 출력은 Modbus ON/OFF입니다. 단계별 `power_level_pct`는 요청 메타데이터이며 비례 출력·PWM 제어의 구현 증거가 아닙니다.
heartbeat 수신이나 HTTP 성공은 출력 적용 성공 ACK를 대신하지 않습니다. 리플레이 API는 저장 당시 결정·입력 조회이며 장비를 다시 가동하지 않습니다.

## 4. 분석·예측·유지보수

| 기능 | 구현 내용 | 근거 / 관련 테스트 |
|---|---|---|
| 기상 연동 | KMA 초단기 실황·예보·단기예보, OpenWeatherMap 대체 경로, 기상 ingest·이력 저장 | `weather.py`, `weather_kma.py`, `ai_platform_weather.py` / `test_weather_kma.py` |
| 현장·구역 위험도 | 기상·센서·Vision 융합, ML 및 보수적 규칙 대체, 음영·경사·교량 등 지형 가중치·태양 위치 | `ai_platform_risk.py`, `ai_platform_zone_risk.py` / `test_climate_risk_ml.py`, `test_shadow_map.py` |
| 예열 계산 | 대류·복사·전도·열용량을 이용한 온도 전진 계산과 강설 도달 시각 기반 시작 시점 | `ai_platform_risk.py` / `test_physics_preheat.py`, `test_zone_thermal_profile.py` |
| 전력 예측 | 최근 전력·기상, 시간·lag·rolling 특징, GradientBoostingRegressor의 24시간 재귀 예측 | `prediction.py` / `test_exogenous_prediction.py` |
| 열지도 | 구역·온도 샘플의 IDW 공간 보간, 과거/현재·미래 열지도·시간 탐색 | `thermal_map.py`, `endpoints/thermal_map.py` |
| 단면 디지털 트윈 | 도로·필름·지반 단면, 계측값 표시, 가상 전력 입력 시각화 | `components/sites/road-cross-section.tsx` |
| 예지보전 | 전력 이상, 센서 이상, 온도 균일도, 저항 드리프트, 승온 효율, 전기 열화 진단, RUL 추정 | `maintenance.py` / `test_thermal_uniformity.py`, `test_resistance_drift.py`, `test_physics_maintenance.py`, `test_electrical_degradation.py` |
| 에너지·ESG | 피크 한도·요금제 설정, 시간대별 요금 계산, 이벤트 절감량 합계×0.4781의 CO₂ 환산 | `energy.py`, `ai_platform_kpi.py` / `test_esg_saving.py` |
| 이벤트·리포트 | 적설 이벤트 CRUD, 한글 PDF, KPI 평균·p50/p95/p99·일별 추세, 기간·구역·모델 필터 | `ai_platform_control.py`, `report.py`, `ai_platform_kpi.py` / `test_pdf_report.py`, `test_kpi_trend_filters.py` |
| 피드백·모델 관리 | 피드백 라벨 저장, 위험도 임계값 적응, model registry 단계·생성자와 승인자 분리 | `ai_platform_feedback.py`, `ai_platform_models.py` / `test_active_learning.py`, `test_model_approval.py` |

### 결과를 해석할 때의 제한

- 기상 키가 없거나 API가 실패하면 mock 기상·예보가 사용될 수 있습니다. `source`, `is_stale`, 갱신 시각을 확인해야 합니다.
- 전력 학습 표본이 72개 미만이거나 조회·학습이 실패하면 합성 데이터 학습으로 대체됩니다. 실측 검증된 예측 성능을 보장하지 않습니다.
- 기후 위험도 학습은 부족한 데이터를 합성 데이터로 보강하며 학습 데이터 자체로 산출한 지표를 반환합니다. production의 프로세스 내 학습은 차단됩니다.
- 전력 예측 학습은 전체 전력 이력을 조회합니다. 조직별·현장별 독립 학습 모델이라고 해석하지 않습니다. API도 슈퍼유저 전용입니다.
- 눈 피복률 계산에는 밝기 기반 휴리스틱 경로도 있습니다. 모든 결과가 학습된 픽셀 분할 모델의 출력은 아닙니다.
- `estimated_saving_kwh`와 이벤트 성공률은 저장된 이벤트 데이터에 의존합니다. 공식 청구·공인 절감 성과를 자동 검증하는 기능은 아닙니다.
- 요금표·배출계수는 코드 내 상수입니다. 최신 요율·공시 기준의 자동 갱신은 없습니다.
- RUL·열지도 미래값·도로 단면은 추정·시뮬레이션입니다. 실제 수명 인증이나 모든 지점의 실측 온도를 뜻하지 않습니다.
- `/api/v1/maintenance/health`의 `health_score=95`는 고정값입니다. `/health/ready`의 실제 시스템 점검과 구분합니다.
- 운영일지 추천은 이력을 조합한 규칙 기반 초안입니다. 누적 운전 시간 등은 추정값이며 운영자 검토 후 저장합니다.
- 모델 registry 승인과 실행 파일 배포는 분리되어 있습니다. 승인만으로 worker 모델 파일이 자동 교체되지 않습니다.

## 5. 현장 게이트웨이

| 기능 | 구현 내용 | 근거 / 관련 테스트 (`edge/`) |
|---|---|---|
| 입력 | Modbus TCP/RTU, register·자료형·endianness·scale, 로컬 최신값과 중앙 보고주기·deadband 분리 | `field_bus` / `test_modbus_driver.py`, `test_field_bus_service.py` |
| 출력 | local-controller 단독 출력 소유, 실제 write 후 feedback 재확인, OFF 실패 시 반복 차단 시도 | `command_agent/output_executor.py`, `field_bus` / `test_modbus_output.py`, `test_output_supervision.py` |
| 안전 | 온도 stale/invalid, 과열·feedback latch, 연속 가동·휴지 제한, 0.5초 안전 주기, 종료 시 OFF 확인 | `local_controller/service.py`, `local_controller/interlocks.py` / `test_interlocks.py`, `test_interlocked_output_executor.py` |
| 명령 | HTTP desired-state polling → 로컬 큐 → 멱등 처리·기한·장치/구역 검증 → 집행·ACK | `command_agent`, `local_controller` / `test_command_agent_central_http.py`, `test_command_queue.py` |
| 오프라인 전송 | SQLite outbox·retry·배치 reconcile, 중복 event ID 방지, 불량 이벤트 격리, ACK·안전 이벤트 우선 보존 | `common/event_store.py`, `sync_agent` / `test_event_store.py`, `test_sync_agent_service.py` |
| Vision | RTSP·픽셀 ROI·모델 해시·OpenCV DNN ONNX·temperature·불확실 판정 | `vision_agent` / `test_vision_engine.py`, `test_vision_agent_service.py` |
| 감독·배포 | heartbeat·outbox 상태·latch 보고, 보존 정리, Compose 프로파일, systemd·Jetson 패키징 | `supervisor`, `deploy/orin` / `test_supervisor_service.py` |

## 6. 보안·운영 기반

| 기능 | 구현 근거 / 관련 테스트 |
|---|---|
| 조직·현장·장치·구역 데이터 격리, 역할·슈퍼유저 검사 | `api/deps.py` / `test_tenant_isolation.py`, `test_roles_rbac.py` |
| httpOnly 세션, production Secure·SameSite strict, 토큰 버전 폐기, 로그인 잠금 | `core/session.py`, `endpoints/login.py` / `test_login_cookies.py`, `test_session_security.py` |
| 해시 저장 Edge 키, 만료·폐기·현장/게이트웨이/장치 범위, ingest·metrics 키 분리 | `edge_credentials.py`, `deps.py` / `test_secure_config.py`, `test_edge_ingest.py` |
| 비공개 객체·인증된 미디어·presigned URL | `core/media_storage.py`, `storage.py` / `test_private_storage.py`, `test_storage_presign.py` |
| API/worker 분리, advisory lock 리더, DB 경보 브리지·SSE | `worker.py`, `core/leader.py`, `alert_bridge.py` / `test_worker_leadership.py`, `test_alert_bridge.py` |
| 경보 중복 억제·격상, SMTP/SMS 발송·실패 채널 재시도 | `alert_notifier.py`, `maintenance.py` / `test_alert_dedup.py`, `test_alert_notifier.py` |
| 구조화 로그·request ID·인증 metrics·readiness·worker freshness | `main.py`, `core/metrics.py` / `test_observability.py` |
| Alembic, Timescale hypertable·압축·연속 집계·보존 정리 | `backend/alembic/versions`, `ledger_retention.py`, `core/scheduler.py` / `test_ledger_retention.py` |
| 운영 Compose·digest 점검·내부 TLS·비권한 컨테이너·암호화 backup/restore·WAL 전송 | `central/deploy`, `central/scripts` / `test_production_stack.sh`, `test_timescale_migrations.sh` |
| CI 회귀·이미지 빌드·dependency audit·SBOM·비밀정보 및 취약점 검사 | `.github/workflows/quality.yml` |

## 7. 완료로 표시하지 않는 범위

- 중앙 MQTT 저지연 명령 브리지·Edge DIO 출력·TensorRT 최적화·자동 OTA.
- 중앙 연결이 끊긴 뒤 Edge가 독립적으로 새로운 가열 판단을 내리는 완전 자율제어.
- RL/MPC, 연합학습, 시민 위험 알림 서비스, 자연어 관제 어시스턴트 등 초기 혁신 제안의 전체 구현.
- 운영 인프라의 외부 프록시·관측 수집기·경보 규칙·MinIO 복제·완전 PITR 복구 자동화 전체.
- 실제 PLC/SSR HIL, 30일 연속 운전, 목표 2배 부하, 외부 AI 평가·침투시험·DR·법무/SLA·운영자 교육의 최종 증적.

남은 출시 조건은 [구현 및 검증 상태](../central/docs/RELEASE_READINESS_STATUS.md)에서 관리합니다.
