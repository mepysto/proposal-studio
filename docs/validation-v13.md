# v13 검증 기록

검토일: 2026-10-28. 최종 전체 run: `2026-10-28T09-35-27-512Z-7d286e`.

| 확인 | 실제 결과 |
|---|---|
| `npm run build` | TypeScript 오류 없음 |
| `npm test` | 74 통과, 통합 전용 3 건너뜀, 실패 0 |
| `npm run test:integration` | 5/7/26장 실제 PPTX→PDF→PNG 3건 통과 |
| `npm run demo` | 26장 PPTX/PDF/PNG 생성·검토·내보내기 완료 |
| 최종 QA | `automated-checks-passed`, issues 0, `finalApproval: false` |
| 새 시각 설명 계약 | 26장 모두 작성, 필요한 실제 표시 누락 0 |
| 실제 자산 | 이미지 16개(지도 4개 포함), 네이티브 차트 1개. 이미지 수는 품질 점수가 아님 |
| 재생성 | `create-smartfence-full.py` 전후 예제 JSON 동일, 예제/로컬 입력 동일, 연락처 중복 없음 |
| 프로젝트 스킬 | skill-creator `quick_validate.py`: 유효 |
| 읽힘 검토 | 26장 각각 1600×900 출력 확인. 최종 출력은 확인한 출력과 PNG 해시 동일 |
| 이전 검토본 대비 | 8·20·23·24·25장 변경, 나머지 21장 PNG 해시 동일 |

로그: `tmp/review-v13-build-final.log`, `tmp/review-v13-tests-final.log`, `tmp/review-v13-integration-final.log`, `tmp/review-v13-render-final.log`, `tmp/review-v13-regeneration.log`. 페이지별 판단: [26장 검토](page-review-v13.md).

누락 검사는 필요한 지도·패키지 장면·일정 바를 제거하는 회귀, 무관한 사진으로 장면을 바꾸는 회귀, 설명 계약을 지우거나 지도 계약 없이 지도 표시를 요구하는 회귀를 포함한다. 기존 비교 행·전광판 객체 표시·기업명·이미지 비율·읽기 위계 검사도 유지한다. 새 지도 1개가 추가되고 후속 생활권 제목이 구체화되어, 이전 3개 지도/옛 제목을 기대하던 통합 테스트를 현재 근거 구조에 맞게 수정했다.

자동 검사는 실제 시각 요소의 존재/좌표/참조와 출력 누락을 다룬다. 그림의 논리와 아름다움을 자동으로 평가하거나 외부 전문가 승인을 부여하지 않는다. 제안된 제품·현장 동작·기대효과는 실제 설치·현장 시험의 증거가 아니다. 외부 모델 API·키 사용과 새로운 이미지 생성은 없었다.
