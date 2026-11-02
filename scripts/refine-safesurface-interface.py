"""Authored manual-based interface examples; never claims live captures or field data."""
import json,pathlib
R=pathlib.Path(__file__).resolve().parent.parent
p=json.loads((R/'projects/safesurface-cheonan/project.json').read_text())
source=['vision-ui','vision-workflow','vision-ops']
p['claims']=[c for c in p['claims'] if c['id']!='vision-example']+[dict(id='vision-example',text='제안서의 관제 화면은 첨부 매뉴얼·기능명세 기반 재구성이며 시설 A/B/C, 시각·센서값·경보·조치는 설명용 가상 사례다. 실제 UI 캡처·천안 실측·완료 실증이 아니다.',scope='project',evidenceKind='document',status='assumption',sourceIds=['vision-manual','vision-features'],approved=False)]
base=dict(dataStatus='illustrative',basisClaimIds=source,scenario='개관 전 겨울철 관제 예시',at='06:30',image=dict(path='projects/safesurface-cheonan/assets/winter-access-problem-v2.png',caption='영상 확인 영역 · 가상 결빙 장면',origin='generated-concept'))
def metric(label,value,tone='neutral'):return dict(label=label,value=value,tone=tone)
def record(name,status,detail,updated):return dict(name=name,status=status,detail=detail,updated=updated)
def evidence(label,value):return dict(label=label,value=value)
def decision(title,reason,action):return dict(title=title,reason=reason,action=action)
examples={
'vision-dashboard':dict(kind='dashboard',metrics=[metric('관리 현장','3곳'),metric('결빙 주의','1곳','caution'),metric('정보 지연','1곳','danger')],records=[record('시설 A · 주출입구','결빙 주의','노면 -2.1℃ · 수분 감지','06:29 갱신'),record('시설 B · 경사로','관측 지연','최신 노면 상태 확인 필요','06:10 갱신'),record('시설 C · 진입로','가열 유지','노면 +1.2℃ · 상태 관찰','06:29 갱신')],evidence=[evidence('최근 경보','06:28  시설 A · 결빙 위험'),evidence('최근 경보','06:27  시설 B · 센서 갱신 지연')],decision=decision('우선 대응 현장 식별','A는 결빙 주의, B는 관측 지연으로 구분됩니다.','A의 영상·노면을 대조하고 B는 현장 확인으로 보완합니다.')),
'vision-site':dict(kind='site',metrics=[metric('노면 온도','-2.1℃','caution'),metric('노면 수분','감지','caution'),metric('가열 상태','예열 중')],records=[record('A-01 · 출입구','예열 중','출력 피드백 ON · 06:29','노면 상태 관찰'),record('A-02 · 경사부','관측 확인','센서·영상 갱신 대조','현장 점검 검토')],evidence=[evidence('선택 현장','시설 A · 주출입구'),evidence('영상·센서 시각','06:29 / 06:29'),evidence('Vision 보조','젖음(wet) · 수분과 대조'),evidence('제어 이력','06:25  자동 예열 요청')],decision=decision('가열과 통행을 구분','가열 ON만으로 노면 위험이 해소됐다고 판단하지 않습니다.','영상·수분·온도를 보고 잔설 처리와 우회 여부를 현장에서 확인합니다.')),
'vision-ai':dict(kind='ai',timeline=[dict(label='예열 시작',time='06:25',minute=25),dict(label='현재 관측',time='06:30',minute=30),dict(label='강설 예보',time='07:00',minute=60)],metrics=[metric('강설 예상 시각','07:00'),metric('예열 시작','06:25'),metric('요청 상태','예열')],records=[record('판단 근거','저온·수분','노면 -2.1℃ · 수분 감지','최신 관측 확인'),record('예열 판단','강설 전 준비','예보·포장 열특성을 반영','출력·노면 재확인')],evidence=[evidence('예보','강설 가능성 · 07:00'),evidence('위험 추정 입력','영상 젖음·노면 -2.1℃·수분'),evidence('판단 사유','재결빙 위험을 고려한 예열'),evidence('운영자 확인','현장 영상·센서와 대조')],decision=decision('강설 전 예열 판단','예보·영상·센서로 위험을 추정하고 근거를 보여줍니다.','실제 출력과 노면 반응을 확인하고 잘못된 판단에는 피드백을 남깁니다.')),
'vision-alerts':dict(kind='alerts',metrics=[metric('미확인','1건','danger'),metric('조치 중','1건','caution'),metric('해결 기록','1건')],records=[record('시설 A · 결빙 위험','미확인','담당 미배정','06:28'),record('시설 B · 센서 지연','조치 중','시설 담당자 배정','06:27'),record('시설 C · 점검 완료','해결','점검 결과 메모 저장','06:20')],evidence=[evidence('선택 경보','시설 B · 센서 갱신 지연'),evidence('담당자','시설 담당자 B'),evidence('현장 조치','센서 배선·상태 점검'),evidence('기록할 내용','관측 재개 시각·조치 결과')],decision=decision('담당과 결과가 남음','미확인 경보와 조치 중인 경보가 구분됩니다.','담당자를 배정하고 실제 조치를 마친 뒤 결과를 메모로 남깁니다.')),
'vision-operations':dict(kind='maintenance',metrics=[metric('금일 사용전력량','12.4 kWh'),metric('구역 A-02 노면','-1.8℃','caution'),metric('정비 경보','1건','caution')],records=[record('구역 A-01','가열 중','노면 -3.4→-2.1℃ · 상승','06:29'),record('구역 A-02','점검 필요','노면 -1.8℃ 유지 · 승온 부족','06:29'),record('운영일지','작성 중','센서·전기 연결 점검 배정','06:30')],evidence=[evidence('선택 경보','구역 A-02 · 승온 부족'),evidence('함께 볼 자료','전력·기상·센서 이력'),evidence('현장 점검','배수·잔설·전기 연결·센서'),evidence('남길 기록','점검 원인·조치·재확인 결과')],decision=decision('점검 대상과 사유 확인','A-02는 가열 중 승온 부족 경보가 남아 있습니다.','전력·기상 이력을 대조하고 현장에서 원인을 확인해 조치 결과를 기록합니다.')),
}
copy={
'vision-overview':('EcowayVision으로 겨울철 대응을 연결','현장 관측을 예열 판단·담당자 대응·조치 기록으로 연결'),
'vision-dashboard':('여러 현장의 결빙 상태를 한눈에','결빙 주의와 관측 지연을 구분해 먼저 대응할 현장을 파악'),
'vision-site':('현장에 가기 전 영상과 노면 상태 확인','CCTV·센서·가열 상태를 함께 보고 현장 조치를 준비'),
'vision-ai':('강설 전에 예열할 수 있도록 판단 지원','예보와 노면 상태를 함께 반영하고 판단 사유를 제공'),
'vision-stages':('필요할 때 가열하고 이상 시 안전정지','예열·가열·유지를 구분하고 보호 조건이 생기면 운전 중단'),
'vision-alerts':('경보가 현장 조치와 기록으로 이어짐','발생·담당 배정·조치·해결을 구분해 대응 누락을 확인'),
'vision-operations':('가동 이력을 다음 점검에 활용','전력·노면 반응·조치 기록을 함께 보며 유지관리를 준비'),
}
for b in p['planning']['story']:
 id=b['id'];v=b['visualPlan'];sec=next(s for s in p['businessCase']['sections'] if s['id']==id)
 if id in copy:
  title,msg=copy[id];b.update(title=title,answer=msg,question=msg+'을 어떤 정보로 판단할 수 있는가?');v['takeaway']=msg;v['readingGuide'].update(message=msg,keyPhrase=' '.join(msg.split()[:2]));v['explanation']['readerTask']=msg+'의 실제 정보와 담당자의 대응을 이해'
 if id in examples:
  ui=base|examples[id]
  if ui['kind']=='dashboard':ui['image']=dict(path='projects/safesurface-cheonan/assets/dashboard-camera-view-v8.png',caption='접근로 전경 · 가상 영상 장면',origin='generated-concept')
  elif ui['kind']=='site':ui['image']=dict(path='projects/safesurface-cheonan/assets/detail-surface-view-v8.png',caption='노면·센서·배수구 · 가상 장면',origin='generated-concept')
  else:ui.pop('image',None)
  v['interfaceExample']=ui;v['encoding']='safesurface:interface-'+ui['kind'];v['edges']=[]
  b['proofClaimIds']=list(dict.fromkeys(b['proofClaimIds']+['vision-example']+source));v['evidenceIds']=b['proofClaimIds'][:]
  v['explanation']['requiredMarks']=['screen'];v['legend']='기능명세·사용자 매뉴얼 기반 재구성 화면 · 시설·수치·시각은 예시, 천안 실측 아님'
  b['limitation']=v['legend'];sec['caption']=v['legend'];v['explanation']['notProven']=v['legend'];v['explanation']['howToRead']='재구성 화면의 현장별 상태·관측·기록을 읽고 오른쪽의 사례 해석과 담당자 대응을 연결한다'
  sec['items']=[dict(label=ui['decision']['title'],detail=ui['decision']['reason']),dict(label='현장 대응',detail=ui['decision']['action'])]
 if id=='vision-overview':
  v['encoding']='safesurface:flow';v['nodes']=[dict(id='n1',label='현장 상태 수집',detail='CCTV·센서·기상·장비\n노면 변화와 갱신 상태 확인',icon='camera'),dict(id='n2',label='예열·대응 판단',detail='구역별 위험과 판단 이유\n가열·현장 조치 검토',icon='server'),dict(id='n3',label='담당과 결과 기록',detail='경보 확인·담당 배정\n조치·운영일지 보관',icon='clipboard')]
  v['edges']=[{'from':'n1','to':'n2','label':'관측·예보'},{'from':'n2','to':'n3','label':'경보·조치'}];v['explanation']['requiredMarks']=['connectors'];sec['items']=[dict(label=n['label'],detail=n['detail']) for n in v['nodes']]
 if id=='vision-stages':
  for n,label in zip(v['nodes'],['정지','예열','가열','유지','안전정지']):n['label']=label
  v['legend']='대표 운전 흐름 · 실제 출력은 ON/OFF · 조건에 따라 상태 선택, 안전정지 후 현장 확인·보호조건 해소 필요'
  v['edges'].append({'from':'n4','to':'n1','label':'위험 해소 시 정지'})
  sec['items']=[dict(label=n['label'],detail=n['detail']) for n in v['nodes']]
  sec['caption']=v['legend'];b['limitation']=v['legend'];v['explanation']['notProven']=v['legend']
p['slides']=[]
for name in ['projects/safesurface-cheonan/project.json','examples/safesurface-cheonan.project.json']:(R/name).write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
print('5 source-backed reconstructed screens and 2 buyer explanations updated')
