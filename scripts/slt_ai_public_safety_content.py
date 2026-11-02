"""Public-space service planning; no claim of exclusive AI detection or verified pilot demand."""
def extend_pages(pages,page,node):
 new=[
 page('cctv-difference','차별점은 감지 이후의 현장 대응','AI 감지·음성 경고는 이미 제공되고 있어, SLT는 현장 안내와 대응 운영을 묶어 제안합니다','public-comparison',[node('비교 기준','같은 조건으로 비교'),node('상용 기능 인정','공식 공개 기능'),node('SLT 제안','통합 제공 범위')],headers=['비교 기준','영상 중심 구성','상용 AI 공개 기능','SLT 통합 제안'],rows=[['사건 인지','운영자 영상 확인을\n중심으로 구성','사람·차량·구역·체류\n분석 기능 제공 사례','기존 AI·센서 활용과\n현장 조건별 분석 검증'],['현장 안내','별도 안내 장치·\n연계 구성에 따름','음성·LED·이벤트\n연계 지원 사례','대형 LED·음성의\n수신자·문구·위치 설계'],['조치 확인','관제·현장 운영\n절차에 따름','관제 SW·연계 제품의\n실제 기능 확인 필요','담당자 인지·실제 조치·\n종결 기록을 함께 설계'],['제공·지원','납품·유지관리\n계약 범위에 따름','제품·솔루션·지원 계약별\n제공 범위 확인','SLT 중심 조사·시공·운영·\n회수·재인수 범위 협의']],limit='출처: AXIS Object Analytics·한화비전 SPS-A8016 공식 안내(2026.10.30 확인) · 구성 유형 비교 · SLT 독점 기능·성능 우위 주장 아님',refs=['scope','safety','market-ai-capabilities','public-space-plan']),
 page('public-space-fit','공공안전 공간별 적용 조건','같은 장비를 일괄 설치하기보다, 공간의 위험 접점과 안내 대상에 맞춰 구성을 정합니다','public-spaces',[node('공간별 접점','문제·수신자 확인'),node('공통 처리','AI·규칙·승인 안내'),node('현장 인수','담당자·수동 대응')],headers=['공간·접점','분석·입력','안내·실제 대응','적용 전 조건'],rows=[['학교·공공시설\n주차 출입부','사람·차량 검출과\n접근 구역 동시 점유','운전자 LED·보행자 주의\n운전자·관리자 직접 확인','통학·보행 동선·시야\n촬영·설치·운영 권한'],['공원·산책로\n관리차량 접점','지정 통로의 사람·차량\n위치·이동 추정','관리차량 주의·통행 확인\n현장 직원 직접 통제','동선 분리·시야 확보\n직원 배치·안내 도달'],['하천·지하차도\n통제 진입부','기존 AI·센서의\n유효 경보 수신','승인된 주의·우회 안내\n담당자 실제 통제·확인','기존 사업 중복·발령 권한\n통제·해제·만료 정책'],['체육관·행사장\n입장·대기 구역','구역 인원·혼잡 변화\n현장 영상별 모델 검증','운영자 승인 후 분산 안내\n요원 배치·흐름 재확인','실면적·사각·오차\n동선 수용력·지휘체계'],['공영주차장\n보행·차량 접점','관측 가능한 면별 점유\n출입부 보행자 검출','입구 정보·보행 주의 안내\n운영자 상태·장애 확인','기존 주차관제·시야\n미관측·만료 상태 구분']],limit='공간 유형별 기획안 · 특정 천안 시설의 수요·설치 동의·성능 확인 전 · 기존 시스템·물리적 안전조치 우선 · 교통신호·차단기 자동 제어 제외',refs=['scope','safety','public-space-plan']),
 page('park-safety','공원 진입부의 차량·보행 안전 안내','보행자와 관리차량의 접근을 분석해 운전자에게 알리고, 현장 직원이 실제 통행을 확인합니다','public-space',[node('① AI로 접근 분석','CCTV → 사람·차량 위치·이동\n설정 구역의 동시 점유 판단','camera'),node('② 대상별 현장 안내','관리차량 운전자 LED 경고\n필요한 보행자 주의 음성','bell'),node('③ 직원 확인·조치 기록','직원이 현장 상황 확인·통제\n인지·안내·실제 대응 기록','clipboard')],chapter='sites',image='slt-ai-portfolio/park-safety-concept-v1.png',caption='기대변화: 관리차량 접근 정보의 전달과 담당자 대응 연결 보완',limit='일반 공원 설치 개념도 · 실제 천안 시설·발생 사고·확정 배치 아님 · 동선 분리·직접 확인 유지 · 미감지는 통행 허가가 아님',refs=['scope','safety','public-space-plan'])]
 idx=next(i for i,q in enumerate(pages) if q['id']=='portfolio')+1
 pages[idx:idx]=new
 for q in pages:
  if q['id']=='cover':q['title']='CCTV·LED 기반\nAI 공공안전 솔루션';q['message']='사람·차량 분석과 대상별 안내, 담당자 조치까지 연결하는 SLT 공공안전 통합 제안';q['refs']+=['public-space-plan']
  if q['id']=='contact':q['caption']='CCTV·LED 기반\nAI 공공안전 솔루션'
  if q['id']=='portfolio':q['title']='공사장 실증에서 공공안전 공간으로';q['message']='공사장 우선 실증 구상을 유지하고, 공원·공공시설의 위험 접점과 기존 대응 공백을 함께 조사합니다';q['refs']+=['public-space-plan']
  if q['id']=='decision':q['nodes'][0]['detail']='시 수요부서·공사·공원·시설\n현장 운영·안전담당자 연결';q['limit']+=' · 공공공간 확장은 후속 수요 조사·범위 협의'
 return pages

def add_public_evidence(sources,claims):
 checked='2026-10-30T12:28:39+09:00'
 sources.extend([
  dict(id='axis-official',title='AXIS Object Analytics 공식 사용자 매뉴얼',scope='general',url='https://help.axis.com/en-us/axis-object-analytics',checkedAt=checked,excerpt='사람·차량·구역·체류 분석과 녹화·음성 메시지·보안 담당자 알림 연계 공개',applicability='일부 상용 구성의 공개 기능. 모든 기존 CCTV·국내 판매·특정 SLT 장비의 지원이나 성능을 뜻하지 않음'),
  dict(id='hanwha-official',title='한화비전 SPS-A8016 공식 제품 안내',scope='general',url='https://www.hanwhavision.com/us/products/product-details/SPS-A8016',checkedAt=checked,excerpt='AI 영상 분석·내장 스피커·LED 표시 및 이벤트 연계 기능 공개',applicability='지역별 공급 가능성·조건은 별도. LED 링 표시와 대형 전광판은 다르며 비교는 독점성·우위의 증거가 아님'),
  dict(id='public-space-user',title='사용자 공공안전 공간 확장 및 CCTV 차별화 요청',scope='project',materialId='conversation-2026-10-30',excerpt='공사장 외 공공안전 공간 적용 가능성과 기존 CCTV 차별성 기획·장표 추가 요청')])
 claims.extend([
  dict(id='market-ai-capabilities',text='AXIS와 한화비전 공식 자료에는 AI 객체·구역 분석 및 음성·시각 알림 연계 사례가 있어, 감지·알림 자체를 SLT만의 기능으로 주장하지 않는다.',status='externally-verified',sourceIds=['axis-official','hanwha-official'],scope='general',verifiedAt=checked),
  dict(id='public-space-plan',text='공사장 우선 실증과 별도로 공원·학교/공공시설·체육시설 등 공간의 위험 접점·수신자·담당자·운영 조건을 조사하는 현장 대응형 AI 공공안전 구상이다. 확정 수요·독점 기술·효과 입증이 아니다.',status='assumption',sourceIds=['public-space-user'],scope='project')])

def refine_public_project(p):
 p['title']='SLT CCTV·LED 기반 AI 공공안전 솔루션'
 b=p['businessCase'];b['context']['asOf']='2026-10-30';b['context']['needHypothesis']+='; 공원·공공시설 등은 위험 접점·안내 수신자·조치 책임이 확인되는 곳만 후속 조사'
 b['context']['notEstablished'].append('신규 공공공간의 현장 수요·장비 연계·차별화 성과·단독 기능')
 p['planning']['decision']['outOfScope'].append('후속 공공공간 일괄 설치·독점 감지 기술·자동 교통신호 제어 약속')
 return p
