# 구현된 콘셉트·페이지 구성 계약

새 제안의 초기 기획을 실제 제작으로 옮기거나 엔진을 수정할 때 읽는다. 개념 저술 방법은 [초기 콘셉트 가이드](concept-to-composition.md), 구현 예제는 `examples/concept-direction.project.json`과 `scripts/create-concept-example.ts`에 있다. 새 사업에서는 예제의 주제·색상·좌표를 자동 복사하지 않는다.

## 입력과 보존 경로

- `project.designDirection`: `concept`, `visualThesis`, `brandConstraints`, `avoid`, `references`, 선택적 `palette`. 참고 해석은 실제 `sourceId`에 연결하고 content/design 역할, 채택/비채택과 이유를 구분한다. CLI는 참고자료를 스스로 미술적으로 해석하거나 외부 모델을 호출하지 않는다.
- `planning.story[].compositionBrief`: `engine: "authored-v1"`, 페이지 역할 `role`, `rationale`, `readingPath`, `continuity`, 선택적 `repetitionReason`, `visual`, `title`, `message`, `visualBox`, `caption`, `titleAlign`, `nodeBoxes`, `edgeLabelBoxes`.
- `role`은 orientation/explanation/evidence/decision 중 하나다. `visual`은 scene/map/chart/graph/comparison/timeline 중 하나다. 의미 구조와 데이터는 기존 `visualPlan`이 기준이다.
- 각 영역은 13⅓×7½ inch 캔버스의 `{x,y,w,h}`다. 위쪽 브랜드와 아래쪽 출처를 위해 y=.65~6.65 안에 놓고, 제목/메시지/시각물/근거 영역을 분리한다. 노드·라벨은 시각물 영역에 포함한다. 이것은 페이지별 좌표이며 전역 고정 템플릿이 아니다.
- compileStoryboard가 페이지 구도를 `slides[].compositionBrief`에 그대로 복사한다. designDirection이 있는 프로젝트는 디자인 설정도 기획 fingerprint에 포함한다. 변경 후 plan을 다시 실행한다. 지원하지 않는 버전/필드/의미 결합은 거부하며 공통 틀로 조용히 대체하지 않는다.

`designDirection`/`compositionBrief`가 없는 기존 입력은 기존 제작 경로·팔레트·검수를 유지한다. 프로젝트 단위 콘셉트만 추가하고 일부 페이지만 새 구도로 이동하는 점진적 적용도 가능하다. 이 경우 기획 문서는 부분 적용으로 표시한다.

## 현재 지원 범위

| 시각물 | 의미 데이터 | 구현/한계 |
|---|---|---|
| scene | scene + site/image-detail/existing | 원본 비율 contain. 정규화 주석을 실제 fitted image로 투영. `nodeBoxes`로 주석 위치 지정. 주석은 편집 가능한 텍스트/도형/연결선 |
| map | map + geographic-map | 기존 투영 자산 contain, 같은 EPSG:3857 transform으로 마커 배치. 위치 이름·출처·투영·한계 표시. 원본 자산의 스케일/좌표 근거 필요 |
| chart | chart + data-chart | source-linked dataset을 네이티브 PowerPoint 막대 차트로 생성. 단위·기간·모집단·집계 한계를 표시. 결측/중첩 누적 검사는 기존 계약 유지 |
| graph | flow/system/journey/context/boundary/swimlane | 실제 노드마다 `nodeBoxes`. 최종 경계의 facing port 연결, 수평/수직/대각 직선과 양방향 관계. 관계 라벨은 `edgeLabelBoxes["from:to"]`. 경로가 다른 노드나 라벨을 관통하면 거부. 장애물 회피 경유점/라벨 자동 재배치는 미지원 |
| comparison | comparison + planning.alternatives | 실제 대안 이름을 열로, 대응 범위/한계·조건을 공통 행으로 표현. 자유 형식 다축 비교/제품 기능표는 기존 전용 의미 계약 또는 추가 구현 필요 |
| timeline | timeline + schedule | 원본 start/length에 비례하는 편집 가능 기간 바와 단계 산출물. 실제 범위 메타데이터를 검사. 복잡한 의존 관계나 미확인 날짜를 만들지 않음 |

특수 제품 화면·실패 상태·인과 사슬·계약 비용 등의 기존 전용 시각화를 범용 graph로 바꿔 의미 계약을 우회하지 않는다. 필요한 표현이 위 범위에 없으면 기존 의미 계약과 제작 구현을 함께 확장한다. 미지원 오류를 피하려고 의미/라벨/근거/visualPolicy를 지우지 않는다.

## 토큰과 위계

새 콘셉트 프로젝트에서는 `design.colors`의 ink/muted/accent/paper와 선택적 `designDirection.palette`를 요청별로 해석한다. panel/line/tint는 기본 파생값 또는 명시적 override를 쓴다. 전문 렌더러의 이름 있는 색상 토큰은 전역 객체를 바꾸지 않고 각 호출에 전달한다. 예전 사례에 직접 지정된 특수 색·좌표까지 모두 자동 재해석하는 CSS 테마 엔진은 아니다.

새 구도는 `design.titleSize`, `titleAlign`과 제목 영역을 그대로 쓴다. 핵심 문구는 기존 선호대로 21pt·둥근 배경·부분 강조를 유지하되 페이지마다 위치/폭/높이를 지정한다. 노드 제목은 bodySize, 설명은 16pt, 근거는 14pt를 기본으로 한다. 영역이 부족하면 내용이나 구도를 고치며 중요 문구를 자동 축소하지 않는다.

## 제작과 검수

```bash
npm run studio -- design-plan --project <id>
npm run studio -- plan --project <id>
npm run studio -- build --project <id>
npm run studio -- design-review --project <id>
npm run studio -- export --project <id>
```

`design-plan`은 렌더 전 `design-storyboard.md`와 `art-direction-plan.json`으로 콘셉트·페이지 역할·읽는 순서·영역을 보여준다. `analyze`도 이를 만든다. `build`는 현재 입력의 새 구도를 렌더하며 기획 변경 후에는 먼저 `plan`을 실행해야 한다.

run/output의 `art-direction.json`은 콘셉트·해석한 팔레트·페이지별 선언 영역과 실제 출력 영역을 대조할 수 있게 보존한다. `design-storyboard.md`, config, visual-plan, notes와 HTML 검수 화면에도 의도를 보존한다. manifest는 적용 페이지를 기록한다. 이전 run도 design-review/export로 검수 파일을 보완할 수 있다.

QA는 기존 의미 mark/근거/기하 검사를 유지하면서 새 구도의 실제 제목·메시지·시각물·근거 영역과 노드·관계·라벨을 대조한다. legacy 제목 정렬 검사는 새 구도에서 선언한 anchor/align 검사로 대체한다. 다른 시각 종류에도 제목·강조 영역이 같은 반복은 실제 geometry로 권고하며, 타당한 반복은 repetitionReason에 기록할 수 있다.

대표 페이지를 원본 크기로 읽고 방향/크롭/주체/조건을 기록한다. 자동 대조는 이해도나 전문성 승인이 아니다. finalApproval은 false다. 새로운 실제 장면 생성이 필요할 때는 별도로 imagegen을 사용하고, 기존 자산 재사용은 출처·목적과 한계를 남긴다.


## 참고 검토에서 추가한 표현 제어

페이지별 typography, chartFocus, nodeTreatment, mapLayout, narrative, referenceApplications와 제안별 deliveryMode를 지원한다. [참고 원리 적용](reference-led-design.md)에 입력 범위·실제 효과·검수 한계가 있다. 기존 입력의 기본 동작을 바꾸지 않으며, 공개 자료의 브랜드/수치를 복제하지 않는다.
