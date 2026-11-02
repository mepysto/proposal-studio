# 현재 제작 구조

`대화에서 근거·기획 작성 → 구조화 계약 검증 → 스토리보드 컴파일 → 시각 브리프 → PptxGenJS → PDF/PNG → 자동 검사 → 읽을 수 있는 페이지 검토·수정 → 내보내기`

CLI는 검토된 입력을 오프라인으로 재현한다. `agents`라는 패키지 이름이나 검토 관점은 실제 외부 전문가·LLM 호출을 의미하지 않는다. API 키 없이 작동한다. 초기 엔진 설명은 [초기 구조 기록](architecture-initial.md)에 보존했다.

| 책임 | 기준 데이터 / 구현 |
|---|---|
| 사업 사실·제안사 | `sources`, `claims`, `proposer` / core schema |
| 문제·지역·사업성·납품 | `planning`, `businessCase` / planning·business-case audits |
| 장표 질문·핵심 답 | `planning.story` → `compileStoryboard` |
| 시각 목적·관계·근거 | `visualPlan.intent`, map/chart/chains/scene/schedule, nodes/edges |
| 독자의 판단·읽는 법·한계 | `visualPlan.explanation` / visual-assets adequacy |
| 강조 위계 | `readingGuide` / typography·professional-kit |
| 실제 구성 | PptxGenJS native text/shapes/charts, licensed SVG, scene assets |
| 기하·출력·의도 일치 | quality-assurance, PDF font/text/page checks |
| 실제 읽힘·의미·심미성 | 작성자가 읽을 수 있는 페이지 출력으로 검토, 별도 기록 |

## 새 제안서 기획 순서

문제와 독자 결정을 정한 뒤 지역·안전·제품/시스템·디자인·사업 전달 관점의 발견을 근거와 장표에 연결한다. 회사명과 역할, 지역 수요, 실제 제품 기능, 기대효과의 메커니즘, 범위/일정/비용 상태, 운영과 종료 이후를 검토한다. 관련 없는 관점을 억지로 채우거나 전문가 동의를 꾸미지 않는다.

시각자료는 본문 집필 전에 선택한다. 위치는 실제 지도, 수치는 정량 차트, 설치/수신자는 공간 장면, 작동/장애는 흐름·상태, 비교는 동일 기준, 일정은 실제 기간, 가치는 원인과 현장 반응으로 표현한다. 잘 구성된 비교표를 무조건 사진으로 바꾸지 않는다. 익숙한 텍스트 카드에 장식만 추가하는 것도 피한다.

## 새 출력 계약

새 full proposal에는 `visualPolicy.requireExplanationContract: true`와 페이지별 `explanation`을 작성한다. 기존 5/7장 입력에는 강제로 추가하지 않는다.

```json
{
  "readerTask": "후속 권역의 조건부 재투입 경로 이해",
  "howToRead": "지도 참고 위치와 단계별 재확인 조건을 대조",
  "notProven": "지도는 운송 경로가 아니며 설치 수요는 미확정",
  "requiredMarks": ["map", "connectors"]
}
```

`requiredMarks`는 scene/map/chart/connectors/comparison/screen/timeline/brand 중 실제 필요한 것을 선택한다. 계획 감사는 필수 계약과 지도/차트 참조를 검사한다. `visualAdequacy()`는 렌더 요소에서 해당 자산·범위·화살표·비교 행·객체/통제 표시·실제 로고의 존재를 검사한다. 중요한 장면을 삭제해도 색상 카드만으로 통과하는 문제를 방지한다. `review()`에 누락 오류를 연결해 export를 차단한다.

이는 의미 이해나 디자인 평가기가 아니다. 예컨대 한 화살표의 존재는 그 관계의 타당성을 증명하지 못한다. 면적 커버리지와 함께 유지하고 전체/변경 페이지의 읽을 수 있는 검토를 별도로 수행한다. `finalApproval`은 false로 남긴다.

## 재현성과 산출물

`apply-visual-plans.ts`는 사례별 작성 레시피를 순서대로 적용한다. 마지막에 연락처를 추가하고 `refine-visual-adequacy.ts`로 현재 장표의 설명 계약·선정 경로·장면/지도 보완을 반영한다. 재실행 시 연락처는 중복되지 않는다. `create-smartfence-full.py`도 이 경로를 따른다. 이 레시피가 다른 산업/도시에 자동으로 적합한 것은 아니다.

`visual-plan.json`은 제작 브리프, `visual-evidence.json`은 좌표·데이터·계약·출처, `visual-adequacy.json`은 계획과 실제 표시의 대조, `qa.json`은 자동 검사, 페이지 검토 문서는 실제 읽힘에 대한 작성자의 판단이다. 매 실행은 원본·설정·출력과 run 이력을 보존한다. 로컬 편집 프로젝트는 데모가 재사용하므로 예제와 각각 의도적으로 수정한다.

프로덕션 렌더러에는 현재 Cheonan 전용 구성도 있다. 범용 스키마/검사와 사례별 레시피·문구를 구분하고, 새 고객 작업에서 검토 없이 사례 사실을 복사하지 않는다. 자동 시맨틱 디자인 검수, 외부 조사/모델 실행, 모든 레이아웃의 범용 자동 구성은 구현되어 있지 않다.
