# 실제 검증 기록

검증일: 2026-10-27 (Asia/Seoul). macOS arm64, Node.js v23.5.0, PptxGenJS 4.0.1, Codex 번들 LibreOfficeDev 26.8.0.0.alpha0 및 Poppler/Python 환경.

## 결과

- `npm run build`: TypeScript 타입 검사 통과.
- `npm test`: 단위 테스트 10개 통과, 외부 변환 도구를 요구하는 통합 테스트 1개는 기본 실행에서 명시적으로 skip.
- `npm run test:integration`: 별도 실제 실행에서 1개 통합 테스트 통과. 5가지 레이아웃으로 PPTX/PDF/PNG 생성, PDF 5페이지·PNG 5장, QA 오류/경고 0개, 개별 operation 장표 1페이지 재생성, 기존 전체 출력과 장표 설정 보존을 확인.
- SmartFence 최종 전체 실행: `2026-10-26T15-22-33-749Z-bf767a` (UTC run ID). PDF 5페이지, QA `automated-checks-passed`, issues 빈 배열. 각 PNG를 1600px로 확인했고 한글 제목·본문·각주, 이미지 표시, 프로세스와 동선 도형이 잘림 없이 보임을 확인.
- PDF에는 `AppleSDGothicNeo-Regular`, `AppleSDGothicNeo-Bold` 폰트가 포함됨. 실제 Microsoft PowerPoint 앱에서 열어 검증한 것은 아님. 편집 가능한 텍스트와 네이티브 도형은 PPTX XML 검증, 차트는 chart XML·편집용 XLSX 파트 생성으로 확인.
- 별도 사업 `Cheonan_SafeSurface_AI.md`를 `run --input`으로 처리해 동일 엔진으로 5페이지 PDF·PPTX 출력 성공. 이 자동 발췌본은 전문 기획 완료본이 아니며 구조화 근거 미연결 경고를 남김.

## 회귀 검사 범위

검증되지 않은 주장에 검증 상태 부여 거부, 출처/주장 참조 무결성, 중복 ID, 경로 ID 검증, 라이선스 기록, 잘못된 차트 데이터, 장표 수용량 초과, 텍스트 오버플로·상자 충돌·경계 이탈·낮은 이미지 해상도, PDF의 폰트 대체·텍스트 누락, 업종과 무관한 플래너 재사용, 디자인 자료와 내용 분리, PPTX 텍스트 재추출, 내용 해시 캐시·원본 사본 보존, 네이티브 차트 편집 구조를 테스트함.

## 발견 후 수정한 문제

1. headless LibreOffice의 시스템 폰트 접근 실패로 한글이 누락됨. 실행별 fontconfig를 적용하고, 폰트 대체와 PDF 텍스트 누락을 경고가 아닌 오류로 바꿔 내보내기를 차단함.
2. 긴 원문 발췌 제목이 기본 영역을 넘음. 자동 발췌의 길이를 제한하고 줄임표를 표시함. 구조화 원문 슬라이드는 임의로 줄이지 않고 QA 오류로 보고함.
3. 단일 장표 제작이 전체 실행 포인터에 영향을 줄 수 있었음. 별도 latest-slide 파일로 분리해 통합 테스트로 보존 여부 확인.

## 검증하지 않은 사항

실시간 정책·법령·시장 조사, LLM 전략/기술 분석, 프로그램의 이미지 생성 API, OCR, 18개 전용 레이아웃, 비전 모델 QA, 수치의 의미적 모순 탐지, 전체 PPTX의 부분 패치, HTTP API/UI, Windows·Linux 실행은 완료 또는 테스트 통과로 표시하지 않음.

이미지 1종은 개발 과정에서 Codex 내장 이미지 생성으로 제작하고 `examples/assets/`에 보관함. 실제 설치·실증 성능의 증거가 아님. 3개 참고 PDF는 원문·메타데이터와 초기 페이지를 검토했으며 전체 페이지를 시각 평가한 것은 아님. QA의 주관적 점수는 null, 최종 사용 승인 상태는 false로 유지함.
