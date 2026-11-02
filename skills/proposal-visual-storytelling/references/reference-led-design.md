# 공개 자료의 원리를 자기 제안에 적용하기

레퍼런스를 검토하거나 새 제안의 표현을 정할 때 읽는다. [실제 검토 기록](../../../docs/web-design-benchmark-2026-10-31.md)과 `references/design/catalog.json`은 선택 범위/출처/원본 해시를 제공한다. 참고자료의 명성, 투자 유치 금액, 조회수는 자기 디자인의 품질 근거가 아니다.

## 선택과 변환

공식 발행 자료를 우선하고 원본/재디자인/재게시를 구분한다. 실제 페이지를 열어 시각물·주장·조건·읽는 순서를 확인한다. 검색 요약이나 접촉 시트만으로 보지 않은 페이지를 평가하지 않는다. 발표자료, 사전 배포 문서, 실적 보고서와 디자인 전후 예제는 목적이 다르다.

주제별 예쁜 템플릿을 모으는 대신, 자기 페이지의 결손을 해결하는 원리를 고른다. 타사의 문구·로고·사진·화면·수치·사용자 증언을 자기 사업의 근거로 옮기지 않는다. 지리/안전/성과/인과의 기존 제약을 유지한다. 읽기용 세로 문서의 밀도나 대형 문구만 있는 장 구분 페이지를 모든 내용 장표의 기본으로 삼지 않는다.

제작 전에는 청중의 질문, 판단 변화, 근거와 다음 질문을 쓴다. 기획상 반복 축이 필요한 페이지는 유지하고, 디자인 변주 자체를 목적으로 만들지 않는다. 실제 제품 설명은 사용 시나리오와 확인할 결과로 이어져야 하며 기능 명사만 담은 화면/카드로 끝나지 않는다.

## 구현된 입력

- `designDirection.deliveryMode`: presented/read-ahead/hybrid. 현재 열람 조건 기록과 발표용 밀도 권고에 사용한다. 별도 읽기 문서의 자동 레이아웃 생성 기능은 아니다.
- `compositionBrief.typography`: titleSize 24–48, messageSize 19–26, nodeTitleSize 16–24, bodySize 16–24, captionSize 12–16pt. 생략하면 기존 크기 유지. native chart 축/범례 등 보조 요소는 별도 기본을 유지한다. 공간이 부족하면 문구/구도를 고친다.
- `chartFocus`: 실제 dataset의 series, reason, 해당 데이터와 장표에 연결된 claimIds, 선택적 noteBox. 원자료를 유지하고 선택 계열과 맥락 계열의 무게를 나눈다. noteBox는 실제 값에서 생성한 직접 표기이며 다른 영역과 분리한다. 인과·유의성·순위나 새로운 목표 값을 만들지 않는다.
- `nodeTreatment`: graph에서 panel/open. open은 실제 주체/행동을 텍스트·경계·관계로 묶는다. 노드 설명이나 관계를 삭제하는 장식 간소화가 아니다. 경계가 중요하면 panel을 유지한다.
- `mapLayout`: image와 labels `{markerId: Box}`. 시각물 안에서 지도와 모든 마커 설명을 분리한다. 비율·스케일·좌표 출처·동일 투영을 유지한다.
- `narrative`: beliefShift, evidenceClaimIds, 선택적 objection, nextQuestion. 근거는 페이지의 실제 주장에 연결한다. 자동 논리 전문가나 문장 생성기가 아니다.
- `referenceApplications[]`: sourceId, locator(실제 페이지/예제), principle, application, notCopied, controls. sourceId는 designDirection.references의 design 출처와 실제 sources에 연결한다. controls는 typography/chartFocus/mapLayout/nodeTreatment 중 실제로 설정한 것만 기록한다. 설정이 없으면 검사가 거부한다.

콘셉트/구도 fingerprint, run config, visual-plan, notes, art-direction.json, design-storyboard와 검수 기록에 남는다. 증거가 없거나 기능이 미지원이면 명시한다. 원리를 적용했다고 적은 기록과 실제 출력 대조는 시각적 타당성/가독성 승인을 대신하지 않는다.

## 검수 질문

처음 눈에 들어오는 요소가 독자가 판단할 근거인가? 강조한 계열 외의 맥락과 값도 읽히는가? 단위·기간·모집단·가정/출처는 남았는가? 제품 장면과 설명은 직접 대응하는가? 제목/본문/근거의 크기 차이는 실제 역할과 일치하는가? 앞 장이 남긴 질문에 답하고 다음 판단으로 이어지는가?

발표용 600자 초과 권고는 재검토 신호일 뿐 기준 점수/삭제 지시가 아니다. 주관적 전문성 점수와 자동 최종 승인은 부여하지 않는다. 타입/대조/실제 출력 검증과 페이지별 관찰을 함께 기록한다.
