# v0.6 — 정보 유형에 맞는 시각화

지역은 지도, 수치는 그래프, 솔루션은 원인부터 결과·측정까지 연결하는 제작 규칙을 구현했다. 설명 카드의 면적이나 아이콘 수만으로는 요구를 충족하지 않는다.

25장 중 3·7·9·10페이지는 OSM 도로·철도·수계 3,391개 geometry를 EPSG:3857로 투영한 지도다. 범위는 천안 원도심이며 천안시 전체 경계도가 아니다. 원자료와 Nominatim 응답은 `references/research/maps/`에 보존했다. `scripts/build-geographic-assets.ts`가 오프라인으로 SVG·PNG를 만들고, PPTX의 편집 가능한 표식도 같은 투영을 사용한다. 동 대표점·주변 시설 참고점이며 사업 필지나 공사 출입구 실사가 아니다. © OpenStreetMap contributors, ODbL.

4페이지는 2024·2025년 천안시 연간 전체·보행자 교통사고 사망자 비교다. 대전일보의 두 보도(도시/TAAS 인용)를 확인한 2차자료이며 TAAS 원자료 직접 조회가 아니다. 전체/보행자 값은 34/17명, 27/13명이다. 보행자는 전체의 부분집합이므로 누적하지 않는다. 지역 맥락이며 공사장 통계나 SmartFence 성과가 아니다. 출처: [2024년 보도](https://v.daum.net/v/20250226112656936), [2025년 보도](https://v.daum.net/v/bJDjdnrNsK).

13·21페이지는 원인→기본 안전조치·AI 보완→현장 대응→기대 결과와 측정의 3개 경로를 표시한다. 결과는 검증 전 가설이다. 20페이지는 예산 항목 구성과 최소·기준·상한의 native 차트 2개로 바꾸었다. 기존 업무시간 시나리오를 포함해 native 차트는 총 4개다. KPI는 미측정 상태를 유지한다.

`visualPlan.intent`, `map`, `chart`, `chains`와 프로젝트 `geographicAssets`, `quantitativeDatasets`가 계약이다. 출처/좌표/중복·결측/중첩 누적/원인·개입·측정 참조를 계획 단계에서 검사하고, 실제 지도·데이터 차트·인과 도식이 렌더링됐는지도 검사한다. 수치 자료 변경은 계획 fingerprint를 무효화한다. `visual-evidence.json`은 지도 메타데이터, 표식, 원자료 행, 인과 경로와 출처·주장을 함께 보존한다.

기본 시각 계획을 다시 적용할 때 `scripts/evidence-visuals.ts`가 검토된 지역 자료를 재적용한다. CLI 자체가 실시간 조사하거나 모델을 호출하는 기능은 아니다. 이번 제작은 API 키 없이 작성했다. 지속 지침은 `AGENTS.md`와 `skills/proposal-visual-storytelling/SKILL.md`에 저장했다.
