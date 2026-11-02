"""Reviewed municipal proposal revision: local problem before solution; technical evaluation outside main pitch."""
LOCAL_SOURCES=[
 ('baekseok-report','CTN 백석5지구 공사장 입구 안전요원 배치 보도','https://m.ctnews.kr/article.php?aid=1766396169435275047&page=4','2025-12-22','공사장 진출입로 신호수 미배치와 입구 안전요원 상주 시정 조치를 보도','언론 2차 보도·검색 색인 본문 열람, 원문 직접 접속 실패. 현재 상태·전체 현장 대표성·사고 원인·실증 대상 증명 아님'),
 ('bongmyeong-report','CTN 봉명동 철거공사 인근 보행 공간 보도','https://m.ctnews.kr/article.php?aid=1791778935461319021','2026-10-12','가설울타리·기존 시설물로 제한된 보행 공간과 보행약자 불편 우려를 보도','언론 2차 보도·검색 색인 본문 열람, 원문 직접 접속 실패. 위법 여부·현장 실측·현재 미조치 상태 단정 불가'),
 ('gwangdeok-report','뉴시스 광덕 공영주차장 스마트 관제 도입 보도','https://mobile.newsis.com/view/NISX20260710_0003703789','2026-07-10','종전 주차 가능 여부 사전 확인 곤란·불법주정차 문제와 CCTV 주차정보 인식·전광판 도입을 보도','천안시 발표를 인용한 언론 2차 보도. 광덕에는 해당 기능이 이미 도입됨; 신규 재구축 수요·성과 수치 증명 아님'),
 ('flood-report','쿠키뉴스 충남지사 호우 피해현장 점검 보도','https://v.daum.net/v/VdYVKoyOjK','2026-07-09','청수지하차도·눈들교 방문과 청수지하차도 빗물 유입에 따른 차량 통행 통제를 보도','언론 2차 보도. 당시 안내 실패·AI 부재·현재 미복구를 증명하지 않음'),
 ('festival-report','충청뉴스 천안 축제 안전관리실무위원회 보도','https://www.ccnnews.co.kr/news/articleView.html?idxno=385011','2025-09-15','피크타임·흥타령춤축제의 순간 최대 관람객 8천~1만 명 예상과 인파 대응 강화 논의','언론 2차 보도·사전 추산. 실제 동시 관람객·밀집 사고·현재 안내 부족을 뜻하지 않음')]

def refine_pages(pages,node):
 b={q['id']:q for q in pages}
 b['cover']['image']='slt-ai-portfolio/cover-led-cctv-v1.png'
 b['cover']['limit']='솔루션 개념 배경 · 실제 천안 설치 현장·확정 제품 사양 아님'
 def change(key,nodes=None,**kw):
  b[key].update(kw)
  if nodes:b[key]['nodes']=[node(*n) for n in nodes]
 change('problem',title='천안의 현장 문제에서 시작하는 AI 제안',message='공사장 보행 안전·주차정보·침수 통제·축제 인파 관리에서 현장 안내의 보완 지점을 찾습니다',nodes=[('공개된 지역 사례','백석5지구·봉명동 보행 문제\n광덕 주차정보·청수 침수','document'),('기존 대책 먼저 확인','신호수·보행 공간·기존 관제\n현재 보완할 범위 현장 조사','clipboard'),('AI·LED 추가 역할','객체·점유 분석과 대상별 안내\n현장 담당자 확인·조치 연결','camera')],caption='사례는 문제 유형의 근거 · 특정 현장의 미조치·구매 수요 또는 AI 효과를 뜻하지 않음',refs=['scope','safety','baekseok-context','walkway-context','parking-context','flood-context','festival-context'])
 change('portfolio',chapter='impact',limit='지역 사례는 문제 유형의 근거 · 개선 효과는 제안 가설 · 기존 도입 범위·현재 수요 확인 필요',headers=['천안의 문제·과제','AI가 보완할 정보','현장 대응','기대변화·조건'],rows=[['공사장 차량·보행 접점','사람·차량 검출·추적','신호수 + 대상별 주의 안내','전달 보완·우선 실증'],['좁아진 보행 공간','확보된 통로의 점유 변화','통로 확보·장애물 확인·정리','통로 유지·물리 개선'],['주차정보 부족·혼잡','미도입 시설의 면별 점유','입구 LED·보행 주의 안내','탐색 완화·중복 제외'],['침수·차량 통행 통제','기존 AI·센서 경보 활용','진입 전 주의·승인 우회 안내','통제 전달·연계 협의'],['축제 인파 관리','구역별 인원·혼잡 변화','운영자 승인·LED 분산 안내','쏠림 완화·현장 확인']],refs=['scope','safety','baekseok-context','walkway-context','parking-context','flood-context','festival-context'])
 change('construction',title='공사장 진출입로의 차량·보행 접점',message='백석5지구 공사장 입구의 신호수 미배치와 상주 조치가 보도됐습니다',nodes=[('AI 검출·추적','사람·차량의 위치·이동 추정\n보도·차량 접근의 동시 점유','camera'),('운전자·보행자 안내','내부 운전자 LED·외부 음성\n상황에 맞는 주의 정보 전달','bell'),('신호수 배치·직접 통제','사람의 확인·현장 조치 유지\n인지·안내·대응 연결 보완','clipboard')],caption='기대변화: 보행자 접근 정보의 현장 전달 보완',limit='출처: CTN 2025.12.22(2차 보도) · 설치 장면은 일반 개념도 · 현재 상태·시범 대상 미확인 · 신호수 대체 아님',refs=['scope','safety','baekseok-context'])
 change('driver-screen',title='출차 전 보행 상황을 전달하는 화면',message='백석5지구 사례의 기본 대책은 신호수 배치이며, AI 화면은 직접 확인을 보조합니다',caption='기대변화: 운전자에게 보행 상황 전달 · 미감지는 통행 허가가 아님',limit='출처: CTN 2025.12.22(2차 보도) · 화면·박스는 개념 예시 · 해당 현장의 실물 화면 아님 · 신호수·직접 통제 유지',refs=['scope','safety','baekseok-context'])
 change('walkway',title='좁아진 보행 공간, 확보와 유지 관리',message='2026년 봉명동 철거현장 인근의 좁아진 보행 공간과 보행약자 불편 우려가 보도됐습니다',nodes=[('먼저 보행 공간 확보','울타리·시설물·대체 동선 점검\n통로 폭 부족은 물리적으로 개선','route'),('AI로 통로 변화 확인','확보된 통로의 객체·점유 추정\n지속 점유 후보를 담당자에게','camera'),('현장 정리·상태 재확인','실제 방해 여부 확인 후 조치\n통로 유지·조치 누락 보완','clipboard')],caption='기대변화: 확보한 보행 통로의 지속 점검 보완',limit='출처: CTN 2026.10.12(2차 보도) · 장면은 일반 개념도 · AI가 통로 폭·고정 시설물 문제를 해결하지 않음 · 실측·현황 확인 필요',refs=['scope','safety','walkway-context'])
 change('parking',title='주차정보 부족에 따른 혼잡의 보완',message='광덕은 주차정보 부족에 대응해 CCTV·전광판 안내를 이미 도입했습니다',nodes=[('천안의 문제와 기존 대응','사전 주차정보 부족·불법주정차\n광덕은 2026년 안내 도입','document'),('AI·LED 추가 적용 후보','미도입 시설의 면별 점유 분석\n입구 안내와 보행 주의 결합','camera'),('중복 확인 후 범위 한정','광덕의 동일 기능 재구축 제외\n미도입 시설·미포함 기능 조사','clipboard')],caption='기대변화: 불필요한 주차 탐색·보행 접점 혼잡의 완화 가능성 확인',limit='출처: 뉴시스 2026.07.10(천안시 발표 인용·2차 보도) · 장면은 일반 개념도 · 다른 시설의 미도입·추가 구매 수요 미확인',refs=['scope','safety','hardware','parking-context'])
 change('disaster',title='침수 통제 정보를 진입 전에 전달',message='2026년 7월 청수지하차도의 빗물 유입과 차량 통행 통제가 보도됐습니다',nodes=[('실제 침수·통제 사례','청수지하차도·눈들교 점검\n2026.07.09 언론 보도','document'),('기존 AI 경보 → 안내','기존 AI·센서의 유효 경보\n승인 문구·진입 전 LED 안내','bell'),('통제·출력 직접 확인','실제 출입 통제·표출 점검\n추가 경보·안내 범위 협의','clipboard')],caption='기대변화: 통제구역 접근 전 주의·우회 정보 전달 / 기존 안내의 공백 여부는 현장 확인',limit='출처: 쿠키뉴스 2026.07.09(2차 보도) · 당시 안내 실패를 뜻하지 않음 · 기존 침수 감지·차단 사업 중복 제외 · ACK는 현장 완료 아님',refs=['scope','safety','ondevice','flood-context'])
 change('festival',title='관람객 쏠림에 대비하는 현장 안내',message='2025년 두 축제는 순간 최대 8천~1만 명을 예상해 인파 안전대책을 논의했습니다',nodes=[('천안 축제의 관리 과제','피크타임·흥타령 안전대책\n출입구·대기구역 쏠림 점검','team'),('AI로 인원·혼잡 추정','검출·추적 또는 밀도추정 검토\n동선 수용력은 운영자가 확인','camera'),('승인 후 LED·요원 안내','구역 변화 확인 후 분산 안내\n대기·쏠림 완화 가능성 검증','bell')],caption='잠재 수요: 순간 인파 변화를 현장 요원·안내판에 연결',limit='출처: 충청뉴스 2025.09.15(2차 보도·사전 추산) · 실제 밀집 사고·안내 부족을 뜻하지 않음 · 장면은 일반 개념도 · 자동 대피 판단 제외',refs=['scope','safety','festival-context'])
 # Preserve engineering detail in a separate reference, while the pitch explains the offer.
 from copy import deepcopy
 engineering=[deepcopy(b[id]) for id in ['edge-deployment','event-interface']]
 for q in engineering:q['id']+='-technical'
 change('edge-deployment',id='field-package',mode='package',title='에스엘티가 제공할 현장 패키지',chapter='delivery',message='에스엘티가 AI 감지·현장 안내·조치 관제·유지관리를 하나의 제안 범위로 묶습니다',nodes=[('AI CCTV 분석','엣지 AI CCTV·구역 설정\n사람·차량·점유 변화 추정','camera'),('LED·음성 안내','안전 경고를 우선 표출\n공공정보는 담당자 승인','bell'),('조치 관제','사건·담당자·확인 이력\n장비 상태·안내 결과 관리','server'),('SLT 현장 지원','조사·시공·교육·장애 접수\n회수·점검·재배치 협의','clipboard')],caption='통합 제공 가치: 현장 배치·안내 대상·장애 대응·인수 창구를 에스엘티 중심으로 연결',limit='제안 패키지 · 제공 기능·수량·사용권·지원 범위·제조 협력 계약은 현장 조사와 실물시험 후 확정',refs=['scope','identity','safety'])
 change('event-interface',id='reuse-options',title='기존 CCTV 활용과 필요한 추가 구축',chapter='delivery',message='기존 카메라와 전광판을 먼저 확인하고, 영상·AI·안내 기능이 부족한 지점만 보완합니다',nodes=[('기존 자산','카메라·전광판 확인'),('추가 구성','필요 지점 보완'),('운영 권한','영상·문구 수신자 분리')],headers=['기존 조건','제안 대응','확인할 사항'],rows=[['영상·장비 재사용 가능','기존 영상과 안내 장비 활용 우선\nAI 처리 장치·연계 기능 필요 여부 확인','화각·야간 영상·지연·출력 상태\n접속 권한·기존 계약 범위'],['NPU 카메라 적용 가능','대상 장비에서 AI 모델 실물시험\n기존 기능과 충돌 없는 구성 협의','모델 호환·열·전원·장애 복구\n장비사 지원·유지관리 책임'],['시야·장비가 부적합','촬영 위치 조정 또는 필요한 장비 보완\n개선이 어려운 지점은 보류','실제 보행·차량 접점의 관측 범위\n과도한 교체·중복 구축 방지'],['내부 영상·공개 문구','원본 영상은 승인된 내부 수신자\n공개 LED는 승인 안내 문구 중심','촬영·열람·보관·접근권한 협의\n시민 안내와 내부 영상 수신자 분리']],caption='',limit='제안 적용 원칙 · 기존 장비의 재사용·추가 장치·망 연계는 현장 조사·제품 지원·기관 승인 후 확정',refs=['scope','hardware','safety'])
 change('timeline',caption='실증 협의안: 3개 현장·출입구 각 1곳·12주 / 사업비 미견적')
 change('decision',title='첫 협의에서 정할 세 가지',message='담당 창구와 조사 후보를 정하면, 현장 조사 결과를 바탕으로 실증안과 견적을 제시합니다',nodes=[('공동 검토 창구','시 수요부서·공사 담당부서\n현장 안전담당자 연결','team'),('후보·기존 자료 확인','동선·시야·기존 장비·계약\n공백 없으면 추가 설치 보류','clipboard'),('SLT 실증안 제시','조사보고·배치도·책임 구분\n3개 현장 협의안·견적','document')],caption='이번 요청: 담당 창구 지정과 후보 현장 조사 협의')
 appendix=engineering+[q for q in pages if q['id'] in ['measurement','model-validation']]
 main=[q for q in pages if q['id'] not in ['measurement','model-validation']]
 return main,appendix

def add_evidence(sources,claims,checked):
 texts={
 'baekseok-report':('baekseok-context','CTN은 2025.12.22 천안 백석5지구 공사장 입구 신호수 미배치와 안전요원 상주 시정 조치를 보도했다. 현재 상태는 별도 확인한다.'),
 'bongmyeong-report':('walkway-context','CTN은 2026.10.12 천안 봉명동 철거공사 인근 보행 공간 제한과 보행약자 불편 우려를 보도했다. 위법·실측·현 상태는 미확인이다.'),
 'gwangdeok-report':('parking-context','2026.07.10 뉴시스는 천안시 발표를 인용해 광덕 공영주차장의 종전 주차정보 부족·불법주정차와 CCTV·전광판 안내 도입을 보도했다.'),
 'flood-report':('flood-context','2026.07.09 쿠키뉴스는 청수지하차도·눈들교 호우 현장 점검과 청수지하차도 차량 통행 통제를 보도했다. 안내 실패 여부는 확인하지 않았다.'),
 'festival-report':('festival-context','2025.09.15 충청뉴스는 피크타임·흥타령춤축제의 순간 최대 인파 8천~1만 명 예상에 따른 안전대책 논의를 보도했다. 실제 관측값·사고가 아니다.')}
 for id,title,url,date,excerpt,limit in LOCAL_SOURCES:
  sources.append(dict(id=id,title=title,scope='local',url=url,checkedAt=checked,excerpt=excerpt,applicability=limit))
  cid,ct=texts[id];claims.append(dict(id=cid,text=ct,status='externally-verified',sourceIds=[id],scope='local',verifiedAt=checked))

def refine_project(project):
 # Canonical business context preserves that public reporting is not a pilot-site observation.
 b=project['businessCase']; p=project['planning']
 for review in b['expertReviews']:
  for f in review['findings']:
   f['storyBeatIds']=['timeline' if x=='measurement' else x for x in f['storyBeatIds']]
 b['context']['factClaimIds']+=['baekseok-context','walkway-context','parking-context','flood-context','festival-context']
 b['context']['needHypothesis']='천안의 공개 문제 사례와 기존 대응을 출발점으로, 미포함 현장 안내·조치 연계 수요를 조사한다'
 b['context']['notEstablished'].append('언론에 언급된 현장의 현재 미조치 상태·기존 안내 공백·실증 대상 지정')
 p['problem']['situation']='천안 공사장 보행 안전, 주차정보 부족, 침수 통제와 축제 인파 관리가 공개 자료에서 다뤄졌다'
 p['problem']['gap']='기존 조치를 확인한 뒤 남은 영상 분석·현장 안내·담당자 대응 연결 지점을 조사할 필요가 있다'
 p['problem']['claimIds']+=['baekseok-context','walkway-context','parking-context','flood-context','festival-context']
 p['problem']['localEvidence']['required'].insert(0,'언론 사례의 현재 상태와 기존 대응 완료 여부 확인; 2차 보도를 실측·미조치 증거로 사용하지 않음')
 for c in b['candidates']:
  if c['id']=='parking':
   c['publishedFacts']='광덕은 2026.07.10 CCTV·LED 주차정보 안내 도입 보도; 이번 조사는 미도입 시설 또는 미포함 기능에 한정'
   c['claimIds']=['scope','parking-context'];c['constraints'].insert(0,'광덕 동일 기능 재구축 제외·기존 도입 범위 우선 조사')
  elif c['id']=='worksites':
   c['publishedFacts']='백석5지구 입구 신호수 문제·상주 조치와 봉명동 보행 공간 제한 보도; 실제 실증 장소는 미지정'
   c['claimIds']=['scope','baekseok-context','walkway-context']
   c['constraints'].insert(0,'보도 현장을 시범 대상으로 자동 지정하지 않고 현재 대응·추가 수요 확인')
 return project
