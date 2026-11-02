import json,pathlib,unicodedata
p=pathlib.Path('.')
design={'name':'Civic Editorial / SmartFence','font':'Apple SD Gothic Neo','colors':{'ink':'132B36','paper':'F5F3EB','accent':'007C78','muted':'536C75','dark':'102F3A'},'titleSize':32,'bodySize':19,'margin':.62}
refs=json.loads((p/'tmp/references/analysis.json').read_text())
config={'schemaVersion':1,'id':'smartfence','title':'천안시 SmartFence AI','audience':'천안시 및 공공공사 발주기관','proposalType':'municipality-technology','mode':'quick','provider':'offline','design':design,'materials':[{'path':'examples/Cheonan_SmartFence_AI.md','role':'content'}]+[{'path':str(pathlib.Path(r['path']).relative_to(p.resolve())),'role':'design-reference'} for r in refs], 'sources':[{'id':'M1','title':'사용자 제공 Cheonan_SmartFence_AI.md','materialId':'examples/Cheonan_SmartFence_AI.md'}], 'claims':[
 {'id':'scope','text':'공공공사 출입구 1개소와 가설울타리 일부를 대상으로 제안한다.','status':'user-provided','sourceIds':['M1']},
 {'id':'risk','text':'공사차량과 보행자의 동선 혼재 위험은 후보 현장의 관찰로 확인해야 한다.','status':'assumption','sourceIds':['M1']},
 {'id':'policy','text':'원본은 2025년 천안시 가설울타리 공공디자인 사례를 정책 출발점으로 제시한다.','status':'user-provided','sourceIds':['M1']},
 {'id':'process','text':'감지·판단·경고 이후 유도원·안전관리자가 통제하고 실제 조치를 기록한다.','status':'user-provided','sourceIds':['M1']},
 {'id':'readiness','text':'통합제품의 실외 성능과 설치조건은 현장 도입 전 검증해야 한다.','status':'user-provided','sourceIds':['M1']}
], 'slides':[]}
def slide(id,layout,title,message,items,claims,foot):
 return {'id':id,'layout':layout,'title':title,'message':message,'items':[{'label':a,'detail':b} for a,b in items],'claimIds':claims,'footnote':foot}
config['slides']=[
 slide('cover','hero','공사장 경계에서\n시민의 안전을 잇다','천안시 SmartFence AI\n가설울타리·출입구 보행안전 실증 제안',[('출입구 1개소',''),('현장 조치 기록','')],['scope','readiness'],'SLT · 강민코퍼레이션 · 비트리 | 협의용 초안 · 대상지·예산·성능 미확정'),
 slide('problem','editorial','공사장 밖 보행안전까지 살피는 실증','가설울타리의 정보 전달에 위험 인지와 현장 대응을 더하는 제안',[
 ('정책의 출발점','원본은 천안시의 가설울타리 공공디자인 사례를 제시합니다. 최신 적용 현황은 재확인이 필요합니다.'),
 ('현장에서 볼 문제','차량 출입 시 보행동선 교차·시야 가림·경고 공백이 실제로 발생하는지 먼저 관찰합니다.'),
 ('도입의 판단 기준','위험 노출과 관리자의 대응 수요가 확인된 현장만 선정하고, 실익이 낮으면 확대를 보류합니다.')],['policy','risk'],'근거: 제공 원본 §01–02, R1·R2 기재 | 외부 재검증 미실행 · 지역 사고통계 추정 없음'),
 slide('risk','scenario','차량 출입과 보행이 만나는 접점을 확인','위험 접근 시나리오를 정의하고, 경고에서 실제 현장 조치까지 시험',[
 ('공사차량 출입 동선','진출입 방향·차폐 조건 확인'),
 ('시민 보행 동선','보행량·임시 우회 경로 관찰'),
 ('유도원 대응 위치','경고 인지·통제·확인 기록')],['risk','process'],'도식: 위험 시나리오 가정 · 실제 천안 현장 도면 아님 | 제공 원본 §02–03'),
 slide('concept','architecture','출입구 1개소에 집중하는 FenceGate CORE','기존 울타리·CCTV 활용을 우선하고, 장비와 운영 소프트웨어를 연결',[
 ('관측 장비','보행자·차량 관측\n실외 감지 성능 시험'),
 ('Edge · 운영 SW','위험구역 설정\n이벤트·장치 상태 기록'),
 ('현장 경고','담당자 우선 알림\n수동 경고 백업'),
 ('운영자 조치','유도원 동선 통제\n조치 결과·시간 확인')],['scope','process','readiness'],'제공 원본 §03–04 | 시민 안내장치 설치·표시 적합성 사전검토 · 광고 매출은 초도 범위 제외'),
 slide('operation','process','감지·판단·경고 이후 현장 조치까지 기록','경고 송신과 위험 해소를 구분하고, 장애 시 기존 수동 절차를 유지',[
 ('감지','보행자·차량\n카메라 상태 확인'),
 ('판단','승인 위험구역\n방향·거리 조건'),
 ('경고','담당자 알림\n장치 응답 확인'),
 ('현장 조치','유도원 통제\n수동 운영 유지'),
 ('기록·검증','조치 시간·이력\n정탐·오탐 검토')],['process','readiness'],'제공 원본 §03·07 | AI가 운행 허가·교통신호를 자동 제어하지 않음 · 목표 성능은 시험 후 합의')]
config['slides'][0]['image']={'path':'examples/assets/smartfence-concept.png','rights':'generated','caption':'AI 생성 설치 제안 개념도 · 실제 천안 현장 아님'}
(p/'examples/smartfence.project.json').write_text(json.dumps(config,ensure_ascii=False,indent=2))
(p/'examples/assets/provenance.json').write_text(json.dumps({'asset':'smartfence-concept.png','origin':'Codex built-in imagegen','createdAt':'2026-10-26','usage':'proposal concept; not installed-site evidence','promptSummary':'Korean construction gate, static fence, camera, safety marshal and separate pedestrian walkway; no billboard or performance claims','runtimeImageAPIConnected':False},ensure_ascii=False,indent=2))
