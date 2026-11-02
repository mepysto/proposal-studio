# Proposal Studio

자료와 검토된 기획을 편집 가능한 PPTX, PDF, 슬라이드 PNG와 근거·검수 기록으로 만드는 오프라인 CLI입니다. 현재 상세 예제는 **천안시 SmartFence 27장**입니다.

공사장 외 공간 적용과 기존 CCTV 비교 장표 추가는 [공공안전 확장 검토](docs/public-safety-extension-2026-10-30.md)에 기록했습니다.

Codex가 대화에서 조사·기획·집필하고, CLI는 검토된 구조화 입력을 컴파일합니다. API 키·런타임 LLM 호출·자동 전문가 승인은 사용하지 않습니다.

최근 22·23장 협업/시연 구성과 중복 확산 장표 제거는 [검토 기록](docs/municipal-review-2026-10-29.md)을 참고하세요.

현재 기준은 [프로젝트 스킬](skills/proposal-visual-storytelling/SKILL.md), [영속 지침](AGENTS.md), [현재 구조](docs/architecture.md)입니다. [이전 26장 검토](docs/page-review-v13.md)는 재설계 이력입니다. 이전 v0.3~v13 문서는 해당 시점의 기록이며, 명칭·페이지 수·시각 기준은 현재 지침을 따릅니다.

## 설치

Node.js 22 이상, Python 3.10 이상, LibreOffice, Poppler가 필요합니다.

```bash
npm ci
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
export PROPOSAL_PYTHON="$PWD/.venv/bin/python"
# macOS에서 변환 도구가 없는 경우
brew install --cask libreoffice
brew install poppler
export PROPOSAL_SOFFICE=/Applications/LibreOffice.app/Contents/MacOS/soffice
```

Codex의 번들 Python이 있으면 자동으로 탐색합니다. `soffice`, `pdftoppm`은 PATH에서 찾습니다. 시스템 설정이나 폰트를 전역 수정하지 않습니다. macOS headless 변환의 한글 누락을 피하기 위해 실행별 임시 fontconfig를 사용하고 변환 후 제거합니다. 다른 OS는 해당 OS의 폰트 설치와 `project.json`의 `design.font` 설정이 필요합니다.

## SmartFence 수정본 실행

```bash
npm run demo
```

처음 실행하면 예제 설정으로 `smartfence-full` 프로젝트를 생성하고, 이후에는 그 프로젝트를 재사용합니다. 설정 파일에서 새 프로젝트를 직접 만들 수도 있습니다.

```bash
npm run studio -- run --project my-smartfence --config examples/smartfence-full.project.json
npm run studio -- audit --project smartfence-full
```

산출물은 `projects/smartfence-full/output/`에 있습니다.

- `proposal.pptx` / `proposal.pdf`: 지역·사업 모델을 포함한 27장 제안서
- `preview/slide-*.png` / `preview/contact-sheet.png`: 전 장 렌더링과 미리보기
- `visual-plan.json`: 27개 페이지별 시각화 목적·근거·관계·자산 종류
- `business-case.md`: 6개 관점의 검토·상충 의견 조정·후보지·예산·효과·출처와 주장 원장
- `decision-brief.md`: 문제 정의·대안·원인–개입–검증·장표의 질문과 답
- `planning-review.json`: 기획 검사, 오류 위치와 돌아갈 단계
- `research-backlog.json`: 미수행 현장 조사·실험
- `visual-evidence.json`: 지도 좌표·데이터·사업 계약·출처와 주장
- `visual-adequacy.json`: 페이지의 판단 과제·읽는 방법·필요한 시각 요소와 실제 출력의 대조
- `qa.json` / `manifest.json`: 렌더링 검사, 실행·입력·근거 이력

이전 7장 개념 검토는 `npm run demo:concept`로 실행합니다.

이전 5장 Core MVP는 `projects/smartfence/`와 `examples/smartfence.project.json`에 남아 있습니다. `npm run demo:legacy`로 다시 실행합니다.

예제의 생성 장면은 실제 천안 현장·제품 성능의 증빙이 아닙니다. 원본/생성 경위와 사용 목적은 자산 기록에 남기며, 지도는 출처·투영·참고 좌표를 별도로 보존합니다. SLT 로고와 연락처는 제공 원본에서 추출했습니다.

## 새 사업자료를 한 번에 제작

프로젝트 루트에서 실행합니다. ID는 영문·숫자·밑줄·하이픈을 사용합니다.

```bash
npm run studio -- run --project my-proposal --input ./my-business.md
```

새 ID에만 `--input`/`--config`를 사용합니다. 기존 프로젝트는 설정을 편집한 다음 `run --project <id>`를 실행합니다. 기존 원본 파일은 덮어쓰지 않습니다.

기본 오프라인 플래너는 제목·문단을 발췌해 초안 장표를 만듭니다. 긴 발췌에는 `…`를 표시합니다. 전문 사업기획이나 사실 검증을 자동으로 수행한 결과가 아닙니다. 제안용 문서는 새 예제처럼 **`planning` 브리프를 작성**하고 `qualityTarget`을 `proposal`로 지정합니다. 그러면 원인·기존 대안·개입·검증·장표 근거가 빠진 경우 제작을 차단합니다. `draft`는 발췌 초안 전용이며 기획 완성본으로 표시하지 않습니다.

상세 사업제안서는 `planning.depth = "full"`과 `businessCase`를 작성합니다. 지역형 제안에는 검증된 지역 주장과 후보지, 지정 분야의 사전 검토, 실제 장표로 연결된 실행·비용·효과·거버넌스 장이 필요합니다. `businessCase.sections`가 장표 본문, `planning.story`가 질문·답·제목·근거·한계의 기준입니다. 분야별 발견 사항은 근거와 반영 장표를 연결하고, 남은 현장 확인을 완료로 처리하지 않습니다.

## 단계별 실행과 수정

```bash
npm run studio -- init --project new-plan --input ./input.md --type government --mode quick
npm run studio -- ingest --project new-plan
npm run studio -- analyze --project new-plan
npm run studio -- plan --project new-plan
npm run studio -- build --project new-plan
npm run studio -- review --project new-plan
npm run studio -- export --project new-plan
```

`projects/<id>/project.json`이 편집의 기준입니다. `storyboard.json`, `design.json`, `image-briefs.json`은 `plan`이 만드는 확인용 스냅샷입니다. 디자인과 장표를 수정한 후 `build → review → export` 또는 `run`을 실행합니다. `planning`이 있으면 기획을 기준으로 장표를 다시 생성합니다. 문구는 `planning.story`에서 수정합니다. 기획 없이 `slides`만 있는 구형 프로젝트는 그 구성을 유지합니다. 원문에서 기본 초안을 다시 발췌하려면 `project.json`의 `slides`를 빈 배열로 바꿉니다. 배열 순서를 바꾸면 장표 순서가 바뀝니다.

```bash
# 설정에서 해당 장표를 수정한 후 한 페이지만 제작·검수
npm run studio -- regenerate --project smartfence --slide operation
```

개별 제작물은 별도 `runs/<runId>/`와 `latest-slide-operation.json`에 보관합니다. 기존 5페이지 출력은 유지됩니다. 전체 파일에 수정 내용을 반영하려면 `build → export`를 실행합니다. 기존 PPTX ZIP에 한 장만 패치하는 기능은 아직 없습니다.

`--mode quick`은 기본 발췌에서 최대 4개 섹션(+표지), `deep`은 최대 12개 섹션을 사용합니다. **현재 Deep은 외부 조사·다중 LLM 호출을 수행하지 않습니다.** 구조화된 slides가 이미 있으면 구성은 유지합니다.

## 데이터와 확장

- 검증: `packages/core/schema.ts`의 Zod 모델. 출처 없는 외부 검증 주장, 알 수 없는 참조 ID, 중복 ID, 장표 수용량 초과, 잘못된 차트 데이터·이미지 권한을 거부합니다.
- 주장: `user-provided`, `externally-verified`, `inference`, `assumption`. `approved`는 사용자 승인 상태입니다. 외부 검증에는 출처와 검증시각이 필요합니다. URL 존재만으로 검증하지 않습니다.
- 내용과 디자인 자료는 `materials[].role`로 분리합니다. 레퍼런스 내용을 사업사실에 혼합하지 않습니다.
- 지원 입력: Markdown/TXT/CSV 텍스트, PDF 텍스트·폰트·색·페이지 메타데이터, PPTX/DOCX 텍스트·미디어 목록. 이미지 PDF는 낮은 텍스트량을 감지해 경고합니다. OCR, XLSX, 문서 내 자산 추출·재사용은 미구현입니다.
- 디자인: 프로젝트별 색·폰트·제목 크기. 기본 좌표 그리드는 현재 고정이며 margin/grid와 스타일 설명은 향후 레이아웃 확장을 위한 메타데이터입니다.
- 구현된 구성: 표지, 에디토리얼, 문제/해결, 위험동선, 아키텍처, 프로세스/타임라인, KPI/시장/예산 차트, 비교, 전체 이미지, 마무리. 카탈로그의 다른 이름은 에디토리얼 구성을 공유하며, 18개 모두의 독립 아트디렉션이 완료된 상태는 아닙니다.
- 차트: `slides[].chart = {labels, values, unit}`는 KPI/시장/예산 장표에서 네이티브 PowerPoint 막대 차트로 생성됩니다. 숫자는 출처나 가정과 함께 구조화해 제공해야 합니다.
- 이미지: `{path, rights, caption, license?}`. `licensed`에는 라이선스 기록이 필요합니다. 비율을 유지해 크롭합니다. 복합 이미지는 비트맵이고 텍스트·프로세스는 편집 가능한 네이티브 요소입니다.
- 확장 API: `packages/core/index.ts`의 `init`, `stage`, `load`, `save`, 스키마를 import할 수 있습니다. LLM·검색·이미지는 `packages/provider-adapters/index.ts`의 계약으로 분리했습니다. HTTP 서버·BusinessOS 연동은 아직 없습니다.

## 검수와 재현성

`design-review.html`은 실제 페이지 PNG·독자 과제·근거 한계·디자인 진단을 함께 보여주는 로컬 검수 화면입니다. 새 build/export에 포함되며, 기존 출력은 `npm run studio -- design-review --project smartfence-full`로 준비할 수 있습니다. `inspection-template.json`을 복사해 페이지별 유지/수정/보류·관찰·검토자·시간을 작성하고 `design-review --project smartfence-full --record /절대/경로/inspection.json`으로 등록합니다. 설정·PPTX·PDF·PNG 해시가 달라지거나 페이지 기록이 빠지면 거부합니다. export는 자동 QA를 기준으로 유지하며 별도 `inspection-status.json`에 미검수·보류 상태를 남깁니다. 기록 등록도 최종 승인을 뜻하지 않습니다. [디자인 판단과 검수 방법](skills/proposal-visual-storytelling/references/design-direction-and-inspection.md)을 참고하세요.

`runs/<runId>`에는 설정 스냅샷, PPTX/PDF, 요소 좌표, PDF 검사, QA, manifest를 보관합니다. `originals`는 원본 사본, `cache`는 입력 내용 해시별 추출 결과, `history`는 단계별 설정 이력입니다. 원본·프로젝트 설정과 캐시는 민감한 사업자료일 수 있으므로 로컬로 관리합니다. API 키는 사용·저장하지 않습니다.

자동 검수는 경계 이탈·텍스트 상자 충돌·휴리스틱 오버플로·이미지 해상도·폰트 대체·PDF의 페이지별 텍스트 누락·전체 페이지 폰트·페이지 수·빈 페이지를 검사합니다. 오류면 export를 차단합니다. 이미지 파일 누락은 QA에 저장합니다. 장표 내 도형 전체의 의미적 충돌, 모든 한글 글리프의 모양, 사업수치의 의미적 모순까지 증명하지는 못합니다. QA 점수를 임의로 만들지 않으며 최종 승인 상태는 자동으로 부여하지 않습니다.

```bash
npm run build             # TypeScript 타입 검사
npm test                  # 외부 도구 없는 단위 테스트, 통합 테스트는 skip
npm run test:integration  # 실제 PPTX→PDF→PNG 전체 및 개별 장표 테스트
```

오류는 해당 run의 `qa.json`에서 확인합니다. `font-substitution` 또는 `pdf-text-mismatch`는 한글 누락 가능성이 있으므로 폰트 접근과 PDF 미리보기를 확인하고 재실행합니다. 변환 실패 시 PPTX와 실패 QA는 남겨 원인을 조사할 수 있습니다.

현재 구성과 검수 계약은 `docs/architecture.md`, 시각 선택·페이지 검토 프로토콜은 프로젝트 스킬의 연결 문서를 참고하세요.

검증 기록은 버전별로 `docs/validation.md`, `docs/validation-v2.md`, `docs/validation-v3.md`, `docs/validation-v4.md`에 보관합니다.

## 페이지별 시각 설명을 반복 적용

이 프로젝트에서 다음 제안서를 만들 때에도 `AGENTS.md`가 `skills/proposal-visual-storytelling/SKILL.md`를 참조합니다. 외부의 설치된 Presentations·imagegen 지침과 프로젝트의 편집 가능한 PptxGenJS 요구를 함께 적용합니다. 전역 계정 메모리나 무인 LLM을 연결한 것은 아닙니다.

`planning.visualPolicy`를 활성화한 제안서는 모든 스토리 장표에 `visualPlan`이 있어야 합니다. 종류·시각화 논리·근거·노드·관계·범례를 작성하고, 실제 이미지·차트·다이어그램이 렌더링돼야 합니다. 계획만 있고 출력이 없거나 장식선만 추가한 페이지는 거부합니다. 상세 자료는 발표자 노트와 검토 문서에 보존합니다.

현재 샘플의 시각 계획은 `examples/smartfence-visual-plans.json`에 있습니다. `scripts/author-visual-plans.py`는 이번 사례에 작성한 계획을 재구성하며, `scripts/apply-visual-plans.ts <project.json>`이 해당 SmartFence 입력에 적용합니다. 새 사업에 이 사례의 장소·주체·수치·일정을 그대로 복사하는 범용 생성기는 아닙니다. 전체 샘플 생성 스크립트도 검토된 시각 계획을 다시 적용합니다.

## 전문 도식과 제안 주체

`project.proposer`가 제안 주관 법인명·협력사·근거의 기준이다. 현재 원문은 (주)에스엘티를 주관으로, 강민코퍼레이션·비트리를 기술 협력으로 명시한다. 표지·본문·역할·마지막 요청 및 PPTX 메타데이터에 반영한다.

수작업 픽토그램을 제거하고 `professional-kit.ts`에서 Lucide SVG·ELK·일관된 조판 토큰을 사용한다. 공간 장면은 생성 입체 모델에 별도 주석을 붙인다. 장면의 비율·보호 대상·실제 이미지 경계를 먼저 정한 뒤 옆 설명 폭을 맞춘다. 회사명·표지 크기·제목 정렬 검사도 출력 검수에 포함한다.

외부 Draw.io 스킬은 `~/.codex/skills/professional-drawio`에 설치했다. 주어진 시스템 관계의 별도 원본은 `examples/diagrams/smartfence-architecture.drawio`다. `npm run diagrams:source`로 재생성한다. 필요한 버전과 실제 적용 범위는 `docs/production-toolchain.json`에 기록돼 있다.


## 기획 콘셉트를 실제 구도로 제작

`designDirection`에 핵심 아이디어와 시각 번역·브랜드 제약·참고자료 해석을, `planning.story[].compositionBrief`에 페이지 역할과 실제 영역·노드 배치를 저술합니다. 같은 정보도 독자의 판단 과제에 따라 다른 크기·위치·읽는 순서로 구성할 수 있습니다. 기존 입력은 기존 경로를 유지하며, 미지원 의미 결합은 명시적으로 거부합니다.

```bash
npm run studio -- design-plan --project <id>  # 렌더 전 콘셉트/장표 흐름 확인
npm run studio -- plan --project <id>         # 새 구도를 장표에 컴파일
npm run demo:direction                       # 별도 7장 예제: PPTX/PDF/PNG
```

예제는 `examples/concept-direction.project.json`이며 기존 SmartFence 27장·SafeSurface·SLT 자료를 덮어쓰지 않습니다. `design-storyboard.md`와 `art-direction.json`에 저술 의도·해석한 팔레트·실제 영역이 보존됩니다. [지원 범위와 작성 방법](skills/proposal-visual-storytelling/references/authored-compositions.md)을 참고하세요. 콘셉트의 미적 해석은 작성자가 수행하며 CLI는 외부 모델 없이 해당 설계를 제작·대조합니다.


## 공개 자료 대조에서 보완한 표현

[웹 레퍼런스 대조와 결손 분석](docs/web-design-benchmark-2026-10-31.md)에 공식 자료의 실제 검토 페이지와 채택/비채택 원리를 기록했다. 새 `typography`, `chartFocus`, `nodeTreatment`, `mapLayout`은 그 원리를 실제 출력에 적용한다. `referenceApplications`와 `narrative`는 출처·적용 설정·독자의 판단 변화를 보존한다. 별도 예제는 `examples/reference-direction.project.json`, 재현 저술 스크립트는 `scripts/create-reference-example.ts`다.

```bash
npm run demo:reference
```

기존 SmartFence 27장·concept-direction 출력은 보존한다. 자세한 입력과 지원 한계는 [참고 원리 적용 가이드](skills/proposal-visual-storytelling/references/reference-led-design.md)에 있다.
