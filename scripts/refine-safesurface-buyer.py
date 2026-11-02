"""Reviewed municipal first-meeting narrative. No research/model calls at compile time."""
import json,pathlib,copy,hashlib,datetime,unicodedata
R=pathlib.Path(__file__).resolve().parent.parent
project=R/'projects/safesurface-cheonan/project.json'
p=json.loads(project.read_text());old=copy.deepcopy(p)
archive=R/'projects/safesurface-cheonan/revisions';archive.mkdir(exist_ok=True)
prior=archive/'v1-technical-26-pages.project.json'
if not prior.exists():prior.write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n')
old=json.loads(prior.read_text())
now=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).isoformat()
features='references/research/ecowayvision-FEATURES-2026-10-26.md'
nano=next(x for x in (R/'references').glob('*.pdf') if '나노' in unicodedata.normalize('NFC',x.name)).relative_to(R).as_posix()
manual='references/research/ecowayvision-user-manual-2026-10-26.md'
new_sources=[
 dict(id='vision-manual',title='사용자 첨부 EcowayVision 사용자 매뉴얼',scope='project',materialId=manual,excerpt='2026-10-26, 소스 f023f1d. 관제 운영자·현장 담당자의 업무 순서, 화면에서 확인할 정보, 5단계 자동제어와 권한을 설명.',applicability='사용자 매뉴얼 직접 확인. screenshots/ 파일은 첨부되지 않아 실제 UI 캡처 대신 기능·업무 설명도 작성'),
 dict(id='vision-features',title='사용자 첨부 EcowayVision 구현 기능 및 솔루션 명세',scope='project',materialId=features,excerpt='2026-10-26, 소스 f023f1d. 실제 라우트·기능 및 완료로 표시하지 않는 범위를 구분.',applicability='첨부 기능명세 직접 확인. 저장소 코드·현재 실행 화면·현장 성능시험 직접 확인 아님'),
 dict(id='nano-rfp',title='사용자 제공 나노히팅필름·AI 원격관제 개발 의뢰서',scope='project',materialId=nano,applicability='10페이지 이미지 PDF 직접 열람. 개발 요구·목표이며 구현·시험 완료 근거 아님'),
 dict(id='nano-product',title='나노일렉트로닉스 ECO WAY 제품 소개',scope='general',url='https://www.nanoelectronics.biz/ECOWAY',checkedAt=now,excerpt='ECO WAY를 스노우멜팅 시스템으로 소개. 제조사의 실험실 비교·설치 사례를 제시.',applicability='제조사 공개 설명. 비교시험의 현장·단위·조건 확인 전 절감률을 천안 성과로 전용하지 않음'),
 dict(id='nano-film',title='나노일렉트로닉스 3D나노히터 소재 설명',scope='general',url='https://www.nanoelectronics.biz/3DNANOHEATER',checkedAt=now,excerpt='구리나노섬유 기반 필름, 섬유의 고른 분포와 면상 발열을 설명.',applicability='제조사 소재 설명. 보행로 단면·시공 두께·전력밀도는 현장 설계에서 별도 확정'),
 dict(id='nano-applications',title='나노일렉트로닉스 생산·납품 사례',scope='general',url='https://www.nanoelectronics.biz/applications',checkedAt=now,excerpt='에코웨이가 나노히팅필름을 기반으로 하는 도로히팅 시스템이며 도로·주차장 테스트와 교내 설치를 소개.',applicability='제조사 공개 적용 유형. 천안시 설치 실적이나 해당 보행시설 적합성 증거 아님')]
for s in new_sources:p['sources']=[x for x in p['sources'] if x['id']!=s['id']]+[s]
def claim(id,text,sources,status='user-provided'):
 c=dict(id=id,text=text,scope='project',evidenceKind='document',status=status,sourceIds=sources,approved=False)
 p['claims']=[x for x in p['claims'] if x['id']!=id]+[c]
claim('vision-ui','FEATURES.md를 직접 확인: 대시보드·현장 상세·AI관제·GIS·NOC·운영일지 화면과 기능이 명시되어 있다. 테스트 경로는 이번 실행 통과를 의미하지 않는다.',['vision-features'])
claim('vision-ai','현장·구역 위험도, KMA 기상, 센서·Vision 융합, 물리기반 예열, 결정 이유·이력, 명령원장·수동 개입이 기능명세에 기재되어 있다.',['vision-features'])
claim('vision-workflow','사용자 매뉴얼의 관제 업무는 현장 검색·NOC 경보 확인과 할당·CCTV/센서 대조·현장조치·해결 메모와 운영일지 저장 순서다. 가열운전은 off/preheat/active/hold/safe_shutdown이며 물리출력은 ON/OFF다.',['vision-manual','vision-features'])
claim('vision-ops','NOC 경보 확인·담당 배정·해결 메모, 에너지·전력 예측·정비·이벤트 보고 기능이 명세에 있다. 추정값·합성자료·고정 건강점수는 실측성과가 아니다.',['vision-features'])
claim('ecoway-product','제조사는 나노히팅필름을 기반으로 하는 ECO WAY 스노우멜팅 시스템과 교내 도로·주차장 등의 적용 유형을 공개한다.',['nano-product','nano-applications'])
claim('ecoway-energy','제조사는 ECO WAY를 기존 도로열선 대비 소비에너지 최대 90% 절감으로 소개한다. 최대 절감 조건의 상대 사용량은 기존 100 대비 약 10으로 환산된다. 정격 소비전력이 항상 10%라는 뜻이 아니며 천안 현장 성과는 미측정이다.',['nano-product'])
claim('ecoway-film','제조사는 구리나노섬유가 고르게 분포하는 필름형 발열체와 면상 발열 방식을 설명한다. 현장 성능·제품 단면은 별도 확인이 필요하다.',['nano-film'])
claim('winter-mechanism','잔설·융설수·그늘과 야간 냉각이 겹치는 짧은 접근로에서 재결빙과 반복점검이 발생할 수 있다는 실증 문제 가설. 천안 특정 시설의 관찰 결과 아님.',['brief','authoring-design'],'assumption')
claim('access-value','필수 진입로의 결빙은 우회·동행 지원과 개관 전 점검을 유발할 수 있다. 이용자·시설별 기록으로 확인할 제안 가설.',['brief','authoring-design'],'assumption')
claim('tech','사용자 첨부 FEATURES.md 원문을 확인했다. 구현 기능의 기재는 코드·시험 통과·실물 연동 완료를 뜻하지 않는다.',['vision-features'])
claim('limits','명세상 물리출력은 Modbus ON/OFF이며 비례출력 구현 증거는 없다. 중앙 두절 후 Edge 신규 완전자율 판단·실물 HIL·장기운전 최종 증적은 완료 범위가 아니다.',['vision-features'])
p['materials']=[x for x in p['materials'] if x['path'] not in [features,nano,manual]]+[dict(path=features,role='content'),dict(path=nano,role='content'),dict(path=manual,role='content')]
# Preserve detailed technical content outside the first-meeting deck.
deferred=['bridge','maturity','fallback','hil','acceptance','metrics','trial','energy','tco','lifecycle','expansion','sources','architecture','roles']
(R/'projects/safesurface-cheonan/supporting-technical-content.json').write_text(json.dumps({'purpose':'후속 기술협의·견적·시험 준비 자료. 첫 면담 PPT에 미포함.','finalApproval':False,'sections':[s for s in old['businessCase']['sections'] if s['id'] in deferred]},ensure_ascii=False,indent=2)+'\n')
S=[];B=[]
def page(id,title,message,chapter,mode,nodes=(),rows=None,headers=None,refs=('design',),note='협의용 제안 · 대상 시설과 운영 조건은 공동 확인',stage='business',question=None,scene=None,anchors=None):
 ns=[dict(id=f'n{i+1}',label=n[0],detail=n[1],icon=n[2] if len(n)>2 else 'document') for i,n in enumerate(nodes)]
 marks=['comparison'] if rows else ['connectors']
 if scene:marks=['scene']
 if mode=='cover':marks=['scene','brand']
 if mode=='contact':marks=['brand']
 if mode=='states':marks=['screen','comparison']
 if mode=='schedule':marks=['timeline']
 if mode=='budget':marks=['chart']
 intent='comparative' if rows else 'spatial' if scene else 'structural'
 if mode=='schedule':intent='temporal'
 if mode=='budget':intent='quantitative'
 v=dict(kind='contact-card' if mode=='contact' else 'existing',intent=intent,takeaway=message,encoding='safesurface:'+mode+'; '+('같은 행의 상황·대응·가치를 좌우로 비교' if rows else '독자 질문에 맞춘 공간·상태·업무 관계를 편집 가능 도식으로 설명'),evidenceIds=list(refs),nodes=ns or [dict(id='n1',label=title,detail=message,icon='document')],edges=[{'from':ns[i]['id'],'to':ns[i+1]['id'],'label':''} for i in range(len(ns)-1)],legend=note,readingGuide=dict(message=message,keyPhrase=' '.join(message.split()[:2]),focusPhrases=[n['label'] for n in ns[:4]] or ['확인 전'],tone='amber' if mode in ['risk-cycle','states'] else 'teal'),explanation=dict(readerTask=question or title+'의 필요성과 역할을 이해',howToRead='상단 핵심 메시지를 읽고 '+('같은 행의 상황과 바뀌는 대응을 비교한다' if rows else '그림의 공간·순서·상태와 담당자 연결을 따라 읽는다'),notProven=note,requiredMarks=marks))
 if scene:v['scene']=dict(path=scene,rights='generated',caption='설명용 개념 장면',reuseReason='각 페이지의 설명 대상에 맞춘 개별 장면이며 다른 페이지에 재사용하지 않음',annotations=[dict(nodeId=f'n{i+1}',x=a[0],y=a[1]) for i,a in enumerate(anchors or [])])
 sec=dict(id=id,chapter=chapter,visual='matrix' if rows else 'editorial',kicker={'problem':'겨울철 필수 접근로의 문제','solution':'ECO WAY와 EcowayVision','regional':'천안시 적용 방향'}.get(chapter,'천안시 보행접근로 실증 제안'),items=[dict(label=n['label'],detail=n['detail']) for n in ns[:4]] or [dict(label='핵심 제안',detail=message)],candidateIds=[],caption=note)
 if rows:sec.update(rows=rows,headers=headers)
 S.append(sec);B.append(dict(id=id,sectionId=id,stage=stage,title=title,question=question or title+'에서 담당자는 무엇을 판단하는가?',answer=message,proofClaimIds=list(refs),visualPurpose=title+'을 문장만 읽지 않고 관계와 사례로 이해하게 한다.',limitation=note,visualPlan=v));return v
space='projects/safesurface-cheonan/assets/access-spatial-concept-v2.png'
problem='projects/safesurface-cheonan/assets/winter-access-problem-v2.png'
film='projects/safesurface-cheonan/assets/film-mechanism-v2.png'
conditions='projects/safesurface-cheonan/assets/local-refreeze-conditions-v8.png'
deployment='projects/safesurface-cheonan/assets/access-deployment-view-v8.png'
page('cover','천안시 겨울철\n보행접근로 안전 제안','필수 접근로의 결빙 예방과\n시민 안내를 함께 검증','summary','cover',refs=('scope','identity'),note='2026.10.28 천안시 협의용 · 가상 설치 개념 · 대상지와 설치 조건 확인 전',scene=space)
page('essential-access','겨울에도 이어져야 할 필수 접근로','짧은 경사로 한 곳이 막히면 공공시설 이용도 어려워질 수 있음','problem','annotated-scene',[('반드시 지나는 입구','시설 앞 마지막 접근 구간','person'),('남아 있는 수분','잔설·융설수가 다시 유입','route'),('개관 전 현장 확인','제설 뒤에도 상태 확인 필요','clipboard')],refs=('scope','winter-mechanism','access-value'),note='결빙 상황을 설명한 가상 장면 · 천안 특정 시설의 사고·현장 관측 자료 아님',stage='problem',question='짧은 보행접근로의 결빙을 왜 시설 관리 문제로 봐야 하는가?',scene=problem,anchors=[(.5,.62),(.78,.67),(.93,.47)])
page('refreeze','눈이 그친 뒤 다시 생기는 결빙','제설 완료와 다음 이용시간의 노면 상태는 다를 수 있음','problem','risk-cycle',[('눈·비가 지난 뒤','잔설과 물기가 남음'),('밤·새벽의 냉각','그늘·낮은 노면온도'),('개관 전 확인','제설·미끄럼 상태 점검'),('이용시간 재확인','융설수 유입·재결빙 가능')],refs=('winter-mechanism','design'),note='재결빙 가능성 설명 · 실제 발생 시간·지속시간·시설별 조건은 현장조사로 확인',stage='problem',question='눈이 오지 않는 시간에도 왜 결빙 위험을 계속 확인해야 하는가?')
page('local-conditions','같은 시설 안에서도 다른 노면 조건','그늘·배수·경사와 통행이 겹치는 구간을 먼저 살펴볼 필요','problem','annotated-scene',[('그늘과 노면온도','건물 그림자 구간의 냉각'),('물의 유입과 배수','눈이 녹은 물·고인 물 확인'),('경사와 필수 통행','회피하기 어려운 동선 확인')],refs=('winter-mechanism','sites','design'),note='그늘·융설수·배수·경사의 개념 장면 · 실제 대상지 조건은 현장 조사로 확인',scene=conditions,anchors=[(.72,.39),(.81,.83),(.44,.47)])
page('citizen-impact','결빙이 시민의 이동에 미치는 영향','우회하거나 도움을 기다려야 한다면 짧은 구간도 이용 장벽','problem','access-journey',[('시설로 이동','예약·민원·복지서비스 이용'),('입구 접근','경사로·그늘 구간 통과'),('시설 이용','안정적인 접근 동선 필요')],refs=('access-value','design'),note='시민 이용 시나리오 · 실제 불편·민원·동행 지원 빈도는 후보 시설에서 확인',question='시민에게 보행로의 결빙은 어떤 이용상의 문제를 만드는가?')
page('manager-burden','제설 이후에도 이어지는 관리 업무','제설·순찰·재확인을 반복해도 확인 사이의 상태는 바뀔 수 있음','problem','manager-cycle',[('현장 상태 확인','개관 전·민원·기상 변화'),('제설·통행 안내','작업 배치·주의·우회 안내'),('통행 상태 재확인','다시 얼었는지 현장 점검'),('다음 변화 대응','수분 유입·한파·새로운 강설')],refs=('access-value','winter-mechanism','design'),note='관리 업무 가설 · 기존 현장 대응을 유지하며 반복 부담과 관찰 공백을 실측',question='현재 제설 업무를 보완할 수 있는 지점은 무엇인가?')
page('context','천안의 제설 대응과 이번 제안','시 전체 제설 대응에 더해 시설 입구의 짧은 취약구간을 검토','regional','table',rows=[['이전 겨울 시 대응','제설제 1만t·장비 45대·인력 104명','2025.12.04 시 발표 2차 보도'],['취약구간 관리','고지대 급커브·경사도로 집중관리','시설별 보행로 위험은 추가 확인'],['이번 제안의 초점','공공시설 필수 접근로 한 곳','도로 전체 제설을 대체하지 않음']],headers=['맥락','확인 내용·제안','해석 범위'],refs=('local-material','local-equipment','local-priority','scope'),note='R1 뉴시스 2025.12.04 · 시 제설자원이 특정 보행시설의 수요를 입증하는 것은 아님')
page('priority','첫 적용은 필수 보행접근로 한 곳','필요성과 관리 주체가 분명한 작은 구간부터 현장 효과를 확인','sites','table',rows=[['이용 필요','시설 출입에 꼭 필요한 경로','고령자·보행약자 이용도 함께 관찰'],['위험 조건','그늘·경사·배수와 반복 결빙 기록','눈에 띄는 장소보다 실제 기록 우선'],['운영 여건','시설 담당자가 점검·안내를 담당','우회 통행·전력·공사 가능성 확인']],headers=['우선 검토 기준','이유','현장 확인'],refs=('sites','scope','access-value'),note='시설명·위치는 미정 · 후보 1~2곳을 조사한 뒤 적합한 1개소 선정')
v=page('proposal','예방 가열·운영 판단·시민 안내의 결합','관제 판단을 가열 요청·현장 안내와 연결하는 통합 제안','summary','offer-system',[('현장 관측','CCTV·노면 센서·기상'),('EcowayVision','위험 추정·예열 판단'),('ECO WAY','나노필름 가열·출력 확인'),('SLT 현장 안내','운영자 승인 문구·주의 표출'),('시민·시설 담당','주의 확인·현장 대응'),('현장 조치','제설·배수·우회·점검')],refs=('ecoway-product','vision-ai','bridge','scope','safety','design'),note='1개소·20~60㎡ 가정 / LED 안내는 신규 연계 제안 · 실제 출력·노면 및 현장 대응 확인',question='관제의 판단이 어떤 설비와 사람의 행동으로 이어지는가?')
v['edges']=[{'from':'n1','to':'n2','label':'관측'},{'from':'n2','to':'n3','label':'가열 요청'},{'from':'n3','to':'n2','label':'출력 피드백'},{'from':'n2','to':'n4','label':'상태·승인 문구'},{'from':'n4','to':'n5','label':'주의 안내'},{'from':'n5','to':'n6','label':'담당자 현장 대응'},{'from':'n6','to':'n1','label':'점검·재관측'}]
page('ecoway-origin','도로면 융설에서 시작한 ECO WAY','도로 노면을 데우는 융설 기술을 공공시설 보행접근로에 적용 검토','solution','flow',[('기존 도로면 융설','필름으로 도로 노면 가열\n도로·주차장·교내 적용'),('같은 열 전달 원리','발열층에서 포장 표면으로\n열을 전달해 융설을 보조'),('보행접근로 적용 검토','경사·배수·포장 조건 확인\n필수 동선의 가열 구역 설계')],refs=('ecoway-product','ecoway-film','sites'),note='제조사 공개 도로히팅·적용 사례 기반 / 천안 보행시설 설치 실적·적합성 보증 아님',question='기존 도로용 융설 기술이 왜 이번 보행접근로 제안의 출발점인가?')
v=page('ecoway-product','나노기술로 소비에너지를 줄이는 ECO WAY','나노히팅필름으로 노면에 열을 공급하는 저전력 스노우멜팅 설비','solution','product-difference',[('노면 포장','이용자가 걷는 표면에 열 전달'),('나노히팅필름','구리나노섬유 기반 면상 발열체'),('전용 제어와 센서','전력 공급·구역 제어·상태 확인')],refs=('ecoway-product','ecoway-film','ecoway-energy','scope','design'),note='제조사 제시: 도로열선 대비 소비에너지 최대 90% 절감 / 정격전력 10% 의미 아님 · 천안 현장 효과 별도 검증',stage='intervention',scene=film,anchors=[(.42,.25),(.44,.49),(.91,.3)])
v['scene']['annotations']=[]
v['chart']=dict(datasetId='ecoway-relative-energy',type='bar',orientation='horizontal',stacked=False)
v['intent']='comparative'
v['explanation']['requiredMarks']=['scene','chart']
v['explanation']['readerTask']='기존 도로열선과 비교한 나노필름 융설 설비의 차별성과 수치의 적용 한계를 이해'
v['explanation']['howToRead']='왼쪽 필름 발열 개념을 본 뒤 오른쪽 기존 100 대비 약 10의 최대 절감 조건 환산과 제조사 주장을 읽는다'
p['quantitativeDatasets']=[x for x in p['quantitativeDatasets'] if x['id']!='ecoway-relative-energy']+[dict(id='ecoway-relative-energy',title='제조사 최대 에너지 절감 주장 환산',population='제조사 공개 ECO WAY와 기존 도로열선 비교; 천안 현장 실측 아님',unit='상대 소비에너지 지수, 기존 도로열선=100',status='derived-assumption',period='2026.10.29 제조사 공개 페이지 확인; 시험 기간 미공개',sourceClaimIds=['ecoway-energy'],limitation='최대 90% 절감 주장을 100 대비 약 10으로 환산. 동일 정격전력 비율·연간 사용량 보장 아님. 공개 비교표 단위·시험조건의 추가 확인 필요.',rows=[dict(category='기존 도로열선',series='최대 절감 조건 환산',value=100),dict(category='ECO WAY',series='최대 절감 조건 환산',value=10)],disjointSeries=False)]
page('ecoway-operation','ECO WAY의 열이 노면에 닿는 과정','발열체의 가동과 노면의 변화는 순서대로 확인','solution','heat-path',[('전용 제어','가열 구역의 전력 공급'),('면상 발열','필름 영역에서 열 발생'),('포장에 열 전달','포장·기층·기상 조건 영향'),('노면 상태 확인','온도·수분·잔설을 관측')],refs=('ecoway-film','safety','design'),note='원리 설명 · 가열 ON이 통행 안전을 보증하지 않음 · 열전달·융설 효과는 현장에서 확인')
page('spatial','보행접근로에 적용하는 설치 범위','발열 구간·배수·전력·안내 위치를 함께 계획','solution','annotated-scene',[('필수 통행 구간','20~60㎡는 초기 검토 가정'),('전력·제어 설비','보호·차단·센서·배수 확인'),('입구 안내와 통행','이용자에게 보이는 위치·우회 확보')],refs=('scope','sites','safety','design'),note='설치 배치 개념 · 실제 대상지·공법·설비 규격은 현장 조사 후 확정',scene=deployment,anchors=[(.51,.56),(.70,.42),(.79,.31)])
page('ecoway-fit','기존 제설과 ECO WAY의 역할','잔설 처리와 현장 점검을 유지하면서 노면 가열을 보완','solution','table',rows=[['잔설·이물·배수','제설·청소·배수 점검','노면 가열만으로 해결하지 않음'],['저온·재결빙','구역 가열과 노면 계측','설비·전력·포장 조건에 맞춰 적용'],['위험 안내·통행','담당자 확인과 주의·우회 안내','위험이 남으면 안내·현장 대응 유지']],headers=['관리 대상','결합할 수단','현장 운영'],refs=('ecoway-product','safety','sites','design'),note='제조사 도로·주차장·교내 적용 소개와 별개로 보행시설 적합성 확인 필요 · 절감률 사전 보장 없음')
page('vision-overview','EcowayVision의 통합 관제 기능','여러 현장의 노면·장비·기상과 대응 이력을 한 흐름으로 관리','solution','vision-hub',[('대시보드·지도','현장·상태·최근 경보 요약'),('현장 상세','CCTV·센서·구역·제어 이력'),('AI 관제','위험도·예열·판단 이유'),('경보 대응','담당 배정·처리·해결 기록'),('에너지·정비','전력·이상 징후·점검 정보'),('운영 보고','운영일지·이벤트·PDF 보고')],refs=('vision-ui','vision-ai','vision-ops'),note='EcowayVision 기능명세·사용자 매뉴얼(2026.10.26) 기준 · 적용 환경별 연동 검증 필요')
page('vision-dashboard','대시보드에서 먼저 확인할 것','어느 현장을 먼저 살펴야 하는지 상태와 경보로 판단','solution','vision-dashboard',[('현장 찾기','현장 검색·도시 필터'),('상태 요약','노면·전력·장비·기상'),('변화 확인','이력 차트·운영지표 추세'),('우선 확인','최근 경보에서 현장 상세로')],refs=('vision-ui','vision-ops'),note='FEATURES.md의 대시보드 기능을 재구성한 안내도 · 실제 UI 캡처·실측 값·현장 지도 아님')
page('vision-site','현장 상세에서 상태와 조치를 연결','CCTV·센서·가열 구역과 제어 이력을 함께 확인','solution','vision-detail',[('관측','권한 있는 CCTV·센서 차트'),('구역','장비와 가열 구역 매핑'),('제어','권한 있는 수동제어·감사로그'),('운영','에너지·정비·녹화 정보')],refs=('vision-ui','vision-ai','safety'),note='FEATURES.md /sites/[id] 기능 설명도 · 실제 화면 캡처 아님 · 영상은 권한 있는 관리자용')
page('vision-ai','AI 관제가 예열 시점을 판단하는 방식','예보와 현재 노면을 함께 보고 구역별 예열 필요를 검토','solution','vision-ai',[('기상·센서·영상','예보·노면온도·수분·영상 보조'),('구역별 위험 판단','조건 융합·판단 사유 확인'),('예열 시점 계산','열전달·열용량과 강설 도달 검토'),('가열·상태 확인','제어 요청 후 출력·노면 관측')],refs=('vision-ai','limits','safety'),note='FEATURES.md 기재 기능 · 입력 출처·갱신 상태 확인 필요 · 중앙 두절 후 신규 완전자율 판단 미완료')
page('vision-stages','EcowayVision의 다섯 가열 운전 상태','예열·가열·유지·정지를 현장 위험과 보호 조건에 따라 구분','solution','control-stages',[('정지 off','위험 해소·부하 제한 등'),('예열 preheat','예보를 반영한 사전 가열'),('가열 active','신뢰 관측·위험도에 따라 운전'),('유지 hold','잔류 위험과 재결빙 고려'),('안전정지','과열·보호·제어 통신 이상')],refs=('vision-workflow','limits','safety'),note='사용자 매뉴얼 기준 · 다섯 단계는 운전 상태, 실제 출력은 ON/OFF · 안전정지 해제는 현장 확인 필요')
page('vision-alerts','경보를 담당자의 현장 대응으로 연결','미확인 경보에서 담당 배정·조치·해결 기록까지 이어짐','solution','alert-journey',[('경보 발생','강설·결빙·장비·통신 이상'),('확인과 담당 배정','경보 확인·담당자 배정'),('현장 조치','점검·수동 제설·우회 등 대응'),('해결 기록','조치 메모·미해결 경보 격상')],refs=('vision-ui','vision-ops','safety'),note='FEATURES.md NOC 기준 · 담당·대응시간·현장 운영 기준은 시설과 협의')
page('vision-operations','에너지와 정비를 운영 판단에 활용','전력 사용과 이상 징후를 기록해 다음 점검과 운영을 준비','solution','operations-branches',[('에너지 확인','사용 전력·기상 조건'),('운전 검토','가동 기록과 기상 조건 대조'),('정비 확인','센서·온도·전력 이상 징후'),('점검 기록','현장 점검·정비·보고 이력')],refs=('vision-ops','metrics','limits'),note='예측·잔여수명·절감량은 추정/저장 데이터에 의존 · 공인 절감 성과나 실제 수명 보증 아님')
page('integrated-day','새벽 재결빙에 대응하는 운영 예시','예열·노면 확인·시민 안내를 같은 현장 상태로 연결','solution','integrated-day',[('위험 가능성 확인','예보·노면 관측을 검토'),('구역 예열·가열','출력과 장비 상태 확인'),('위험 잔류 안내','가열 중에도 주의 유지'),('현장 확인·기록','필요한 제설·우회와 상태 확인')],refs=('vision-ai','bridge','safety','design'),note='설치 후 검증할 운영 시나리오 · 무인·무정지·사고감소 보장 아님')
page('states','시민에게는 현재의 주의 상태를 안내','가열 중이라는 사실과 노면 위험의 해소를 구분','solution','states',rows=[['위험 감지 / 가열 요청','결빙 주의','노면 위험·최신 관측 확인'],['실제 가열 중 / 위험 잔류','미끄럼 주의','잔설·배수·우회 등 현장 대응'],['노면 개선 관측','노면 상태 확인 중','운영자 현장 확인·해제기준 검토'],['상태 확인 불가 / 장애','상태 확인 불가, 주의','고정 안내·점검·필요시 우회']],headers=['현장·시스템 상태','시민 안내 예시','담당자 대응'],refs=('bridge','safety','design'),note='SLT LED 연계와 승인 문구는 신규 통합 범위 · EcowayVision의 시민 알림 완성 기능으로 주장하지 않음')
page('buyer-value','시민과 담당자에게 기대하는 변화','접근로 이용과 현장 대응을 함께 개선할 수 있는지 실증','impact','table',rows=[['시민','위험 구간에서 우회·도움이 필요할 수 있음','결빙 예방과 이해하기 쉬운 현장 안내'],['시설 담당자','순찰·제설·재확인을 반복','원격 상태 확인과 경보별 현장 조치'],['천안시 관리부서','문제·조치·가동 기록이 흩어질 수 있음','시설별 위험시간·전력·조치 이력 축적']],headers=['대상','현재 확인할 문제','검증할 변화'],refs=('access-value','vision-ui','vision-ops','metrics'),note='기대 가설 · 사고감소·전력 절감 성과는 실증 전이며 수치로 약속하지 않음')
page('pilot','첫 실증에서 확인할 범위','1개소에서 접근로 상태와 운영 가능성을 확인한 뒤 도입 판단','summary','flow',[('필수 접근로 1곳','후보 1~2곳 공동조사\n면적 20~60㎡ 가정'),('설비·관제·안내','ECO WAY·EcowayVision\nSLT LED/CCTV 연계'),('현장 변화 확인','위험 지속시간·실제 전력\n경고·현장 조치·이용 불편')],refs=('scope','metrics','decision'),note='시 전체 도로·교통신호·자동 통행차단은 이번 검토 범위 제외 · 수치 목표는 기준선 조사 후 합의')
page('sites','후보 접근로를 함께 살펴볼 기준','결빙 기록·필수 통행·공사 여건이 맞는 시설부터 검토','sites','table',rows=[['실제 불편·위험','결빙·제설·민원 기록, 그늘·배수','위험·시민 편익 확인이 어려우면 보류'],['관리와 통행','운영 책임자, 이용자·우회 동선','공사 중 접근성 훼손 시 재검토'],['설비·공사 여건','전력 인입, 포장, 배수·점검 공간','전력·공사 여건이 맞지 않으면 재검토'],['측정 가능성','노면·전력·조치·이용 기록 확보','측정을 위해 시민 위험을 방치하지 않음']],headers=['확인 기준','함께 볼 자료','선정 판단'],refs=('sites','scope','design'),note='특정 시설 도입 가능성·소유/공사 권한 미확정 · 담당부서와 현장 조사 후 결정')
v=page('schedule','현장 확인에서 겨울 운영 검증까지','설치 전 연동을 확인하고 겨울 현장에서 실제 상태 변화를 검증','delivery','schedule',[('현장·제품 확인','권리·후보·시공 조건'),('실물 연동 확인','출력·보호·표출 동작'),('현장 설계 검토','전력·접근·포장'),('시공·운영 준비','설치·현장 확인·인계'),('겨울 운영 검증','기상별 노면·전력·조치')],refs=('schedule','design'),note='2026.11~2028.03 제안 일정 · 착수·설치 시점 미확정 · 기상·현장 여건에 따라 조정')
v['schedule']=dict(slots=17,unitLabel='월',ranges=[dict(nodeId=f'n{i+1}',start=s,length=l) for i,(s,l) in enumerate([(0,2),(1,3),(2,6),(8,6),(12,5)])])
page('slt-offer','SLT의 통합 제안과 기술협력','SLT가 현장 설계와 관제·안내 연계를 총괄해 협의','governance','support-model',[('천안시 시설 담당','후보·운영 여건·시민 안내 협의','city'),('SLT 통합 창구','현장 설계·LED/CCTV·연계\n설치·운영 지원 협의','team'),('(주)나노일렉트로닉스','ECO WAY 기술협력\nSW·시공 참여범위 별도 협의','shield')],refs=('identity','rights','bridge','design'),note='제안 역할 구분 · ECO WAY 기술협력: (주)나노일렉트로닉스 / 관제 SW 사용권·시공 참여범위는 별도 협의')
page('decision','후보지 1~2곳 공동 현장조사 제안','후보지와 시설 담당 창구를 정해 실증 가능성을 검토','decision','flow',[('후보 접근로 공유','결빙·민원·제설 기록\n필수 통행 여건 확인'),('시설 담당자 협의','운영·전기·공사 담당\n현장 방문과 자료 범위 협의'),('다음 검토 결정','적합 현장·설치 범위\n겨울 실증 추진 여부 검토')],refs=('decision','sites'),note='첫 협의에서 즉시 납품·대규모 확대를 요청하지 않음 · 조사 결과에 따라 대안·보류 판단')
page('contact','에스엘티 제안·현장 협의 창구','필수 접근로 한 곳에서 시작할 수 있도록 함께 검토','decision','contact',refs=('contact','identity'),note='제공 원본 SLT 로고·연락처 · 대상지·시공·기술 협력 조건은 협의 전')
# User-confirmed proposer/product attribution on the cover.
p['sources']=[x for x in p['sources'] if x['id']!='nano-cooperation-user']+[dict(id='nano-cooperation-user',title='사용자 지정 기술협력 및 제품사 표기',scope='project',excerpt='주관은 SLT, ECO WAY는 (주)나노일렉트로닉스 제품이며 표지에 기술협력으로 명시하도록 요청',applicability='현재 사용자 요청에 따른 역할·제품 귀속 표기. 계약 체결·독점권·인증을 의미하지 않음')]
claim('nano-cooperation','주관은 (주)에스엘티, 기술협력 및 ECO WAY 제품사는 (주)나노일렉트로닉스로 표기한다.',['nano-cooperation-user'])
p['proposer']['collaborators']=['(주)나노일렉트로닉스' if x=='나노일렉트로닉스' else x for x in p['proposer']['collaborators']]
for b in B:
 if b['id']=='cover':
  b['proofClaimIds'].append('nano-cooperation');b['visualPlan']['evidenceIds'].append('nano-cooperation')
  b['visualPlan']['legend']='2026.10.29 천안시 협의용 · 가상 설치 개념 · 대상지와 설치 조건 확인 전'
  b['limitation']=b['visualPlan']['legend']
for sec in S:
 if sec['id']=='cover':
  sec['items']=[dict(label='제안사',detail=p['proposer']['legalName']),dict(label='기술협력',detail='(주)나노일렉트로닉스')]
  sec['caption']='(주)에스엘티 / 기술협력 (주)나노일렉트로닉스'
# Additional rows are authored explanations, not renderer-only business logic.
for sec in S:
 if sec['id']=='refreeze': sec['rows']=[['수분 잔류','재결빙 가능','현장 조치','변화 재확인']]
 if sec['id']=='citizen-impact': sec['rows']=[['통행 유지','예정대로 이동','입구 통과','시설 이용'],['결빙 잔류','시설 입구 도착','우회·도움 필요','이용 지연 가능']]
 if sec['id']=='manager-burden': sec['rows']=[['기상과 노면이 바뀌면 현장 확인을 다시 시작']]
 if sec['id']=='ecoway-operation': sec['rows']=[['전력 공급 확인','가열 구역 확인','현장 조건 반영','제설·안내와 병행']]
 if sec['id']=='vision-alerts': sec['rows']=[['무엇이 문제인가','누가 대응하는가','무엇을 조치했나','무엇을 남길까']]
 if sec['id']=='vision-ai': sec['rows']=[['판단의 이유를 CCTV·센서와 대조하고 필요하면 운영자 피드백을 기록']]
 if sec['id']=='integrated-day':
  sec['items']=[dict(label='관제·설비',detail='관측·가열·잔류위험·기록'),dict(label='현장·시민',detail='주의·현장 확인·제설·통행')]
  sec['rows']=[['관측·예보 대조','가열·출력 확인','위험 잔류 관측','조치·상태 기록'],['주의 대상 확인','접근로 상태 확인','미끄럼 주의 안내','잔설 처리·통행 확인']]
assert len(B)==30,len(B)
for b in B:
 if b['id']=='vision-stages': b['visualPlan']['edges']=[{'from':f'n{i+1}','to':f'n{i+2}','label':'운전 상태 전환'} for i in range(3)]+[{'from':f'n{i+1}','to':'n5','label':'보호 조건 발생'} for i in range(4)]
 if b['id'] in ['vision-overview','vision-dashboard','vision-site']: b['visualPlan']['edges']=[]
 if b['id']=='vision-operations': b['visualPlan']['edges']=[{'from':'n1','to':'n2','label':'에너지 검토'},{'from':'n3','to':'n4','label':'현장 점검'}]
 if b['id']=='slt-offer': b['visualPlan']['edges'] += [{'from':'n2','to':'n1','label':'협의·지원'},{'from':'n3','to':'n2','label':'기술 확인'}]
 if b['id'].startswith('vision-'):
  if 'vision-workflow' not in b['proofClaimIds']: b['proofClaimIds'].append('vision-workflow')
  if 'vision-workflow' not in b['visualPlan']['evidenceIds']: b['visualPlan']['evidenceIds'].append('vision-workflow')
 if b['id']=='citizen-impact': b['visualPlan']['explanation']['requiredMarks']=['comparison','connectors']
p['businessCase']['economicsPresentation']='omitted-by-request'
p['planning']['story']=B;p['businessCase']['sections']=S;p['businessCase']['targetSlideCount']=len(B)
p['planning']['decision']['request']='후보 접근로 1~2곳과 시설 담당 창구를 공유하고 현장 방문 후 실증 검토 가능성을 협의'
p['planning']['decision']['success']='결빙·이용 불편·관리 업무·제품 적용 조건을 공동 확인하고 다음 검토 범위를 정함'
p['planning']['problem'].update(situation='필수 보행접근로에 남은 수분과 그늘·냉각이 겹치면 제설 뒤에도 재결빙이 반복될 수 있다.',gap='시민에게는 우회·도움 대기라는 이용 장벽이 생기고 담당자는 제설·순찰·재확인을 반복할 수 있다.',consequence='짧은 입구 구간의 상태 변화가 공공시설 이용과 개관 전 대응의 부담으로 이어질 수 있다.',claimIds=['winter-mechanism','access-value','scope'])
p['planning']['problem']['mechanisms']=[dict(id='m1',cause='수분·그늘·야간 냉각의 중첩',effect='제설 후에도 재결빙 위험이 남을 가능성',status='hypothesis',claimIds=['winter-mechanism']),dict(id='m2',cause='필수 동선과 점검 사이의 상태 변화',effect='접근 불편과 반복 확인·조치 부담 가능성',status='hypothesis',claimIds=['access-value'])]
p['planning']['operatingBoundary']='ECO WAY는 현장 노면 가열, EcowayVision은 판단·관측·운영 지원, SLT는 안내 연계를 제안한다. 제설·보호·현장 책임을 유지한다.'
# Update review links rather than leaving references to removed technical pages.
reviewmap={'planning':['essential-access','decision'],'local':['context','sites'],'safety':['ecoway-fit','states'],'system':['vision-overview','vision-ai'],'design-review':['local-conditions','ecoway-product'],'delivery':['schedule','slt-offer']}
for rev in p['businessCase']['expertReviews']:
 for i,f in enumerate(rev['findings']):f['storyBeatIds']=[reviewmap[rev['id']][i]];f['status']='open'
p['businessCase']['expertReviews'][0]['conclusion']='첫 면담은 시민 접근 문제와 제품 이해, 후보지 협의에 집중하고 시험·계약 상세를 본문에서 제외'
p['businessCase']['context']['asOf']='2026-10-28, 첨부 FEATURES 원문 및 제조사 공개 제품 설명 확인'
p['audience']='천안시 시설관리 담당자의 첫 사업 검토·후보지 협의'
p['design']['name']='SafeSurface municipal buyer introduction v3'
p['slides']=[]
# Required actual marks remain enforced on every newly authored page.
project.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
(R/'examples/safesurface-cheonan.project.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
(R/'references/research/safesurface-v2-source-review.json').write_text(json.dumps(dict(checkedAt=now,features=dict(path=features,sha256=hashlib.sha256((R/features).read_bytes()).hexdigest(),provenance='Current user attachment FEATURES (1).md, source f023f1d; exact content copied unchanged',scope='feature document, not code/test/runtime'),manufacturerSources=[x for x in new_sources if x.get('url')],manual=dict(path=manual,sha256=hashlib.sha256((R/manual).read_bytes()).hexdigest(),screenshotFilesAvailable=False),rfp=dict(path=nano,pagesRead=list(range(1,11)),status='Development requirements/targets; not completed capability evidence'),editorialDecision='Front-load citizen and facility problem, then ECO WAY and EcowayVision; defer technical acceptance/licensing/lifecycle internals outside the first-meeting deck',finalApproval=False),ensure_ascii=False,indent=2)+'\n')
print('30-page municipal narrative written; previous input preserved:',prior)
# Reconstruct buyer-facing interfaces from the provided manual after the base narrative.
import subprocess
subprocess.run(['python3',str(R/'scripts/refine-safesurface-interface.py')],check=True)
