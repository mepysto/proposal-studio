"""Assistant-authored full business case. No API and no external expert impersonation."""
import json,pathlib,datetime
root=pathlib.Path(__file__).resolve().parent.parent
p=json.loads((root/'examples/smartfence-v2.project.json').read_text())
p['id']='smartfence-full';p['title']='천안시 SmartFence AI 시민안전 실증 제안';p['mode']='deep';p['design']['name']='Cheonan Civic Evidence / Full Proposal'
p['planning']['depth']='full';p['qualityTarget']='proposal'
record=root/'references/research/cheonan-full-evidence.json'
now=json.loads(record.read_text())['checkedAt'] if record.exists() else datetime.datetime.now(datetime.timezone.utc).isoformat()
sources=[
 ('C-URC','천안시 도시재생지원센터 · 총괄사업현황','https://www.cheonanurc.or.kr/68','오룡지구 민·관협력형도시재생 리츠사업 / 동남구 원성동 31-70 일원','공개 사업 목록·영역 확인. 현장 공정·출입구·보행량을 확인한 자료가 아님.'),
 ('C-STATION','천안시 도시재생지원센터 · 천안역세권 혁신지구','https://www.cheonanurc.or.kr/75','사업지역 천안시 서북구 와촌동 106-83 일원','주소·복합시설 계획 확인. 게시 기간 2020~2027은 최신 공정 보증으로 사용하지 않음.'),
 ('C-PLAN','건축공간연구원 AURUM · 천안 스마트도시계획','https://www.aurum.re.kr/Legal/LegalSub.aspx?pcode=B07','2029년 천안시 스마트도시계획 / 수립기간 2025 ~ 2029','계획 아카이브의 기간·방향 확인. 개별 서비스 설치·API·예산 확보 증거가 아님.'),
 ('C-MOLIT','국토교통부 · 2024년 스마트도시 선정 발표','https://m.korea.kr/news/policyNewsView.do?newsId=148930651','거점형에 충남 천안시 1곳','2024년 선정 및 역세권·산단·캠퍼스 대상 방향. SmartFence 선정·예산·계약을 의미하지 않음.'),
 ('C-COUNCIL','천안시의회 · 2026.09.29 건설도시위원회','https://www.cheonancouncil.go.kr/cms/mntsMbrSmplViewer.do?schMntsId=5019&schVar08=MBR0162','버스정류장, 횡단보도 등 다중이용시설','해체 관련 조례안 심의에서 시민안전을 다룬 기록. 이 사업의 설치 허가나 현행 법 적용 판단으로 사용하지 않음.'),
 ('C-FENCE','충청뉴스 · 천안 가설울타리 디자인 조사 보도','https://www.ccnnews.co.kr/news/articleView.html?idxno=383654','천안8경 공사장 가설울타리 디자인 만족도 조사','2025년 지역 정책의 언론 보도. 조사 결과·현재 현장·저작물 사용허가를 확인한 것은 아님.'),
]
for id,title,url,excerpt,limit in sources:p['sources'].append({'id':id,'title':title,'url':url,'scope':'local','checkedAt':now,'excerpt':excerpt,'applicability':limit})
p['sources'].append({'id':'P-ASSUME','title':'제안자가 작성한 범위·예산·효과 산식 가정','scope':'project','materialId':'examples/smartfence-full.project.json','applicability':'확정 견적·예산·현장 성과가 아닌 기획 가정. 원본 Markdown 예산 범위를 기준으로 작성.'})
def claim(id,text,status,src,scope='project'):
 d={'id':id,'text':text,'status':status,'scope':scope,'sourceIds':src,'evidenceKind':'document'}
 if status=='externally-verified':d['verifiedAt']=now
 p['claims'].append(d)
claim('city-smart','천안시는 2024년 거점형 스마트도시 조성사업에 선정됐다. 역세권·산단·캠퍼스를 묶는 실증 방향이 발표됐다.','externally-verified',['C-MOLIT'],'local')
claim('city-plan','AURUM은 천안시 스마트도시계획의 수립기간을 2025~2029로 소개하고 시민체감형 서비스를 기본방향으로 설명한다.','externally-verified',['C-PLAN'],'local')
claim('city-station','천안역세권 혁신지구는 서북구 와촌동 106-83 일원이며 환승·주거·업무·상업 복합시설을 계획한다.','externally-verified',['C-STATION'],'local')
claim('city-oryong','도시재생지원센터의 공개 현황은 오룡지구 리츠사업을 동남구 원성동 31-70 일원으로 소개한다.','externally-verified',['C-URC'],'local')
claim('city-bongmyeong','공개 현황에는 봉명지구 도시재생사업이 동남구 봉명동 39-1 일원으로 기재돼 있다.','externally-verified',['C-URC'],'local')
claim('city-council','2026년 9월 시의회 건설도시위원회는 다중이용시설 주변 해체 안전을 다루는 건축물관리 조례안을 심의했다.','externally-verified',['C-COUNCIL'],'local')
claim('city-fence','2025년 천안시가 천안8경 가설울타리 디자인에 대한 시민 만족도 조사를 실시했다는 지역 보도가 있다.','externally-verified',['C-FENCE'],'local')
claim('candidate-fit','와촌동·원성동 공공·복합개발 현장은 출입구 단위 보행안전 실증의 조사 후보이며 현재 설치 적합성·공정·동의는 미확인이다.','inference',['C-STATION','C-URC','M1'])
claim('pilot-package','출입구 1개소, 울타리 약 10~20m, 카메라 1~2대와 현장 분석·경고·조치 기록을 초도 실증 범위로 제안한다.','user-provided',['M1'])
claim('budget-plan','원본 기획의 4,500만~1억800만원 범위에서 기준안 7,200만원(VAT 별도)을 가정했다. 실제 견적과 시 예산은 미확정이다.','assumption',['M1','P-ASSUME'])
claim('time-example','하루 20건, 월20일, 건당 기록시간 5분에서2분이라는 계산용 가정은 월20시간의 작업시간 차이에 해당하며 실측·목표·예측이 아니다.','assumption',['P-ASSUME'])
claim('impact-hypothesis','접근 알림·현장 통제·조치 이력을 결합하면 대응 확인과 관리 업무를 개선할 가능성이 있으나 효과는 현장 비교로 검증해야 한다.','inference',['M1','P-ASSUME'])
claim('roadmap-plan','현장 협의·통합시험·설치·운영·평가를 착수 후 약8개월로 구성한 일정은 제안 가정이며 공정과 승인에 따라 조정한다.','assumption',['M1','P-ASSUME'])
claim('privacy-boundary','촬영 범위·안내·권한·보존기간·삭제·원본 영상의 사용목적과 공공 안내장치의 설치 적합성을 도입 전에 개별 검토한다.','user-provided',['M1'])
claim('governance-plan','에스엘티·강민코퍼레이션·비트리의 역할은 제공 기획상의 제안 구조이며 고객과의 계약·조달·권한을 확정한 상태가 아니다.','user-provided',['M1'])
# Review perspectives are authored assessments by the same assistant, not outside approvals.
def finding(issue,refs,recommendation,check,status='incorporated'):return {'issue':issue,'evidenceIds':refs,'recommendation':recommendation,'acceptanceCheck':check,'status':status}
def review(id,discipline,conclusion,findings):return {'id':id,'discipline':discipline,'reviewer':'assistant-perspective','conclusion':conclusion,'findings':findings}
experts=[
 review('urban','도시기획','완공 후 시설뿐 아니라 공사 중 생활권의 보행 연속성을 실증 대상으로 삼는다.',[
  finding('지역명만으로는 대상지 필요성을 설명할 수 없음',['city-station','city-oryong','city-bongmyeong'],'복합개발지와 주거재생지를 구분하고 출입구·보도 접점이 있는 곳만 실사','공개 사업 존재와 설치 적합성 구분'),
  finding('공사차량 통제를 위해 보행약자의 통행을 침해할 수 있음',['public-boundary','pilot-package'],'보행 우회·연속성·보행 폭 검토를 AI 설치보다 먼저 수행','현장 실사에서 우회 동선과 관리 책임 확인','open')]),
 review('safety','현장안전','AI 경고는 물리적 분리와 유도원 운영을 대체할 수 없다.',[
  finding('경고 전달과 실제 안전 확보를 동일시하기 쉬움',['manual-authority','response-chain'],'ACK·실동작·유도원 확인을 분리하고 불확실 상태를 숨기지 않음','5단계 운영 도표에 시스템/사람/기록 구분'),
  finding('미탐·오탐·장애가 새로운 위험을 만들 수 있음',['readiness','observation-proposal'],'통제 시험장에서 장애·우천·야간 시나리오를 검증하고 수용기준 합의 후 현장 진입','현장 책임자 기준 합의와 수동 절차 시험','open')]),
 review('design','공공디자인','도시경관의 정적 안내와 현장 담당자의 동적 경고를 분리한다.',[
  finding('공공디자인을 전광 광고 매체로 확장하면 목적과 설치조건이 달라짐',['city-fence','privacy-boundary'],'정적 공사정보·우회 안내를 기본으로 하고 담당자 경고장치를 별도 검토','상업광고·무허가 외부 디스플레이 제외'),
  finding('과도한 경광·소음·작은 문구는 시민 부담을 늘림',['public-boundary','readiness'],'주야간 가독성·눈부심·통행 방해·약자 접근성을 현장 관찰','수용성 관찰과 시민 불편 기록','open')]),
 review('system','시스템설계','현장 독립형 Edge와 이벤트 원장을 먼저 만들고 도시 플랫폼 연계는 후속으로 둔다.',[
  finding('도시 전체 플랫폼 연결부터 시작하면 승인·개발 범위가 커짐',['city-smart','scope'],'현장 영상처리·경고를 독립 운영하고 후속 연계는 비식별 집계부터 협의','초도 범위에 중앙 통합관제 직접 연계 없음'),
  finding('재설치·공정 변경 때 위험구역 설정이 쉽게 어긋남',['pilot-package','readiness'],'출입구 프로파일·경로 변경 이력·장치 상태·시각 동기화를 관리','설정 변경 승인과 재검증 절차','open')]),
 review('smartcity','스마트시티','기존 천안 스마트도시 실증 방향과 연결하되 선정·예산·인터페이스 확보를 주장하지 않는다.',[
  finding('기존 스마트도시 사업과 SmartFence 예산을 혼동할 수 있음',['city-smart','city-plan'],'시민체감 서비스 방향만 연결하고 예산·계약·API는 별도 협의로 명시','제안서에 기존 사업 선정과 본 사업 미확정 구분'),
  finding('단일 현장 장비 납품만으로는 도시 확산의 가치가 작음',['impact-hypothesis','pilot-package'],'위험 시나리오·설치 체크리스트·검증 방식의 재사용 패키지를 성과물로 포함','후속 공사 현장에 재설정 가능한 운영 표준 마련')]),
 review('economics','사업성·평가','사고 감소나 ROI를 보장하지 말고 비용과 운영 개선을 먼저 검증한다.',[
  finding('사고 감소율을 단일 현장 단기간 시험으로 인과 추정하기 어려움',['local-gap','impact-hypothesis'],'현장 대응·경고 전달·작업 부담을 주요 측정으로 두고 사고 감소는 장기 검증','기대효과와 실측·산식 예시의 구분'),
  finding('하드웨어만 계산하면 시공·실증·운영 비용을 누락함',['budget-plan'],'범위별 최소·기준·최대와 VAT·제외 비용을 함께 관리','총액 독립 합산과 실제 견적 확보','open')]),
]
candidates=[
 {'id':'station','name':'천안역세권 혁신지구','address':'서북구 와촌동 106-83 일원','publishedFacts':'환승·주거·업무·상업 복합시설을 계획한 도시재생 사업.','claimIds':['city-station'],'physicalHypothesis':'보도와 차량 출입로가 만나는 대표 출입구 1곳을 탐색. 위치·보행량은 미확인.','proposedPackage':'1개 출입구·카메라 1~2대·분석/경고·유도원 기록을 가정.','constraints':['발주기관·시공사·시설별 관리권한 확인','공정 잔여기간·보행 우회·전기·통신·촬영 범위 확인'],'fieldStatus':'not-surveyed','fieldClaimIds':[],'selection':'priority-survey','selectionReason':'사업 내용과 장소가 공개돼 있고 복합 이용의 접점을 조사할 수 있어 우선 실사를 제안. 위험이 높다고 확정한 순위는 아님.','readiness':'실제 출입구·유도원 위치·보행 흐름·공정 잔여기간을 조사 후 판단.'},
 {'id':'oryong','name':'오룡지구 리츠사업','address':'동남구 원성동 31-70 일원','publishedFacts':'옛 오룡경기장 일원의 민관협력형 복합개발 사업으로 공개돼 있음.','claimIds':['city-oryong'],'physicalHypothesis':'생활권과 맞닿은 차량 반출입 구간을 조사하되 주거·체육시설의 출입 계획과 구분.','proposedPackage':'정적 우회 안내와 담당자 경고를 분리한 1개 출입구 구성을 검토.','constraints':['민관 리츠·시공사·공공시설 측 승인 역할 확인','공사차량과 주민 동선·공정별 이동 경고 조건 점검'],'fieldStatus':'not-surveyed','fieldClaimIds':[],'selection':'reserve','selectionReason':'원도심 생활권과 공공·민간 시설이 만나는 후보. 관리·계약 구조 확인이 선행돼야 함.','readiness':'시설별 공사 구역·출입 통제권·주민 통행 관리 방식을 확인.'},
 {'id':'bongmyeong','name':'봉명지구 도시재생','address':'동남구 봉명동 39-1 일원','publishedFacts':'센터 현황에 2021~2026 도시재생 사업으로 등록된 생활권.','claimIds':['city-bongmyeong'],'physicalHypothesis':'골목·생활SOC 정비처럼 공사가 분산될 경우 대표 출입구 제품과 맞지 않을 수 있음.','proposedPackage':'잔여 공사와 집중 차량 출입이 확인되는 경우에만 소규모 구성을 검토.','constraints':['실제 잔여 공사와 실증기간 확보 확인','분산 작업은 이동식 안내·유도원 개선만으로 충분할 수 있음'],'fieldStatus':'not-surveyed','fieldClaimIds':[],'selection':'defer','selectionReason':'사업 존재만으로 출입구 수요를 가정할 수 없어 후순위 검토.','readiness':'잔여 공사·차량 출입 집중도 확인 전 장비 설치를 제안하지 않음.'},
]
budget={'currency':'KRW','status':'planning-assumption','vatRate':.10,'sourceClaimIds':['budget-plan'],'scope':'출입구 1개소·현장 운영 약4개월을 포함한 실증 기준안','items':[
 {'id':'ai','label':'AI 장비·실외 분석 시험','low':10000000,'base':18000000,'high':22000000},
 {'id':'devices','label':'CCTV·경고장치·통신','low':10000000,'base':16000000,'high':25000000},
 {'id':'software','label':'운영 SW·API·현장 설정','low':12000000,'base':20000000,'high':28000000},
 {'id':'install','label':'구조·전기·보안·설치 지원','low':5000000,'base':8000000,'high':15000000},
 {'id':'operation','label':'현장 운영·교육·성과 검증','low':8000000,'base':10000000,'high':18000000},
 ],'excluded':['울타리 전체 신규 시공·대형 디스플레이','도로 점용·추가 토목·전력 인입 증설','현장 공기 연장·별도 민원 인력','실증 후 연간 유지보수·통신비는 별도 견적']}
def metric(id,name,definition,formula,unit,measurement,owner,refs,guard=False):return {'id':id,'name':name,'definition':definition,'formula':formula,'unit':unit,'baseline':None,'target':None,'targetPolicy':'기준선 확보 후 현장 책임자와 수용기준 합의','measurement':measurement,'owner':owner,'claimIds':refs,'guardrail':guard}
metrics=[
 metric('miss','필수 위험사례 미탐률','사전에 정의하고 사람이 확인한 위험 사례를 놓친 비율','놓친 위험 사례 수 ÷ 유효 위험 사례 수 ×100','%','라벨 영상·통제된 시험장 재현으로 주야간별 산출. 실제 시민을 위험에 노출시키는 시험 금지.','현장 안전관리자·시험 담당자',['readiness','observation-proposal']),
 metric('latency','경고 전달 지연 p95','유효 감지 이벤트부터 장치 실제 작동까지 걸린 시간의 95백분위','감지→장치 작동 소요시간의 95백분위','초','시각 동기화된 이벤트·장치 응답·물리 작동 점검 기록을 대조.','장치 공급사·SW 통합 담당',['warning-proposal','readiness']),
 metric('completion','조치 기록 완결률','조치 대상 이벤트 중 확인자·결과·시각이 기록된 비율','필수 조치정보가 있는 건수 ÷ 조치 대상 건수 ×100','%','조치 대상 조건을 먼저 합의. 기록 완료를 위험 해소의 증명으로 사용하지 않음.','현장 관리자·운영 담당',['response-chain','manual-authority']),
 metric('false-alarm','오탐·반복 알림 부담','유효하지 않은 경고로 추가 작업이 발생하는 정도','오탐 경고 수·알림 대응시간을 함께 관찰','건·분','경고별 운영자 판정과 추가 업무 시간 기록.','현장 운영자',['readiness'],True),
 metric('burden','운영자 업무·시민 불편','업무시간·통행 방해·소음·눈부심의 악화 여부','도입 전후 업무시간·불편 관찰 비교','분·관찰','동일 업무 정의와 현장 조건을 기록. 통제그룹 없이 인과 성과로 단정하지 않음.','발주기관·현장 관리자',['impact-hypothesis'],True),
]
benefits=[
 {'id':'citizens','beneficiary':'시민','change':'접근 알림과 현장 통행 유도','expectedBenefit':'위험 상황을 더 일찍 인지할 기회','metricIds':['miss','latency'],'claimIds':['impact-hypothesis'],'attributionLimit':'사고 감소율은 예측·보장하지 않으며 통행·시야 개선과 함께 평가.'},
 {'id':'operators','beneficiary':'현장','change':'경고·조치·장비 상태의 이력 관리','expectedBenefit':'누락 점검과 보고 업무의 일관성','metricIds':['completion','burden'],'claimIds':['response-chain','impact-hypothesis'],'attributionLimit':'업무 절감은 자동화 수준·이벤트 수·사용자 수용성에 따라 달라짐.'},
 {'id':'city','beneficiary':'천안시','change':'출입구 점검·실증 방식의 표준화','expectedBenefit':'다음 공사에 재사용할 검증 자료','metricIds':['completion','false-alarm'],'claimIds':['city-plan','impact-hypothesis'],'attributionLimit':'확산 예산·조달·운영 주체는 최초 실증 결과 후 별도 결정.'},
]
resolutions=[
 {'id':'access-first','perspectives':['urban','safety','design'],'tradeoff':'차량 통제 강화와 시민의 보행 연속성','decision':'보행 동선·우회 안내·유도원 위치를 먼저 점검하고 장비 배치를 종속시킴','rationale':'장치 설치가 새로운 장애물이나 우회 부담이 되면 공공가치가 약해짐','remainingCheck':'현장 폭·접근성·통제 공간 실사'},
 {'id':'local-first','perspectives':['system','smartcity'],'tradeoff':'도시 플랫폼 연계의 확장성과 초도 실증의 실행성','decision':'현장 독립형으로 시작하고 후속 연계는 비식별 집계·운영 표준부터 검토','rationale':'기존 도시 사업과 목적은 연결하되 연계 권한·데이터 범위·개발 부담은 분리','remainingCheck':'시의 시스템 담당자·연계 규격·보안 검토'},
 {'id':'minimal-warning','perspectives':['design','safety'],'tradeoff':'즉시 경고의 인지성과 소음·눈부심·표시 규제','decision':'담당자 경고를 기본으로 하고 시민 안내는 적법성과 수용성이 확인된 방식만 채택','rationale':'공사 울타리를 광고·교통신호로 전용하지 않음','remainingCheck':'소관 부서의 설치·촬영·표시·전기 조건 검토'},
 {'id':'reuse-conditional','perspectives':['system','economics','safety'],'tradeoff':'기존 CCTV 재사용 비용과 감지 품질','decision':'시야·해상도·프레임·야간 품질 기준을 통과할 때만 재사용','rationale':'싼 장비 재사용이 미탐·지연을 늘리면 전체 실증이 무의미','remainingCheck':'벤치·실외 비교 시험과 재견적'},
]
sections=[]
def sec(id,chapter,visual,kicker,items=(),headers=None,rows=None,candidates=(),caption=''):
 d={'id':id,'chapter':chapter,'visual':visual,'kicker':kicker,'items':[{'label':a,'detail':v} for a,v in items],'candidateIds':list(candidates),'caption':caption}
 if headers:d['headers']=headers
 if rows:d['rows']=rows
 sections.append(d)
sec('summary','summary','editorial','제안 요약',[
 ('출입구 한 곳부터','천안 공공·복합개발 현장 중 차량과 보행이 만나는 곳을 조사합니다.'),
 ('알림에서 조치까지','접근 감지·담당자 경고·현장 통제·조치 기록을 함께 시험합니다.'),
 ('검증 후 다음 결정','현장 수요·안전·운영 편익이 확인될 때만 확대를 검토합니다.')],caption='이번 요청은 대규모 납품 확약이 아니라 후보지 공동조사와 제한 실증의 협의입니다.')
sec('cheonan-context','regional','editorial','천안의 도시 변화',[
 ('와촌동 역세권','환승·주거·상업·업무가 결합된 혁신지구 사업이 공개돼 있습니다.'),
 ('원성동 생활권','오룡지구 리츠사업과 기존 도시 생활공간의 접점을 살펴볼 수 있습니다.'),
 ('봉명동 재생지','골목·생활시설 중심 재생은 출입구형 수요와 구분해 검토합니다.')],caption='지역 근거: C-STATION·C-URC | 개발 사업의 존재를 확인한 것이며, 위험도·공정·출입구는 실사 전입니다.')
sec('policy-fit','regional','matrix','정책·사업과의 연결',headers=['천안의 공개 방향','이 제안의 연결점','분리해 볼 사항'],rows=[
 ['2025~2029 스마트도시계획','시민체감 서비스와 실증 자료','개별 장비 설치·예산 확보 아님'],
 ['2024 거점형 스마트도시 선정','역세권 등 도시문제 실증 맥락','본 사업의 선정·계약 아님'],
 ['가설울타리 디자인 시민 조사','공사정보·우회 안내·경관 연계','디자인 사용허가 별도'],
 ['다중이용시설 주변 해체 안전 논의','공사와 일상 통행 접점에 주목','현행 법·설치 적합성 개별 검토'],
 ],caption='C-PLAN·C-MOLIT·C-FENCE·C-COUNCIL | 기존 사업과 방향을 연결하며 예산·권한을 전용하지 않습니다.')
sec('journey','problem','timeline','이용 상황 가설',[
 ('차량 반입','자재 차량이 현장 출입구로 접근'),('보행 접근','시민이 보도를 따라 출입구 앞을 통과'),('현장 통제','유도원이 상황을 보고 차량·보행을 유도'),('조치 확인','경고 전달과 실제 대응 결과를 별도 기록')],caption='설명용 이용 시나리오 | 천안의 관찰 결과·사고 재현이 아닙니다.')
sec('sites','sites','map','천안의 조사 후보',candidates=['station','oryong','bongmyeong'],caption='사업지 관계를 설명하는 개념 배치 · 축척·거리·방향·실제 출입구 위치를 나타내는 지도가 아닙니다.')
sec('selection','sites','matrix','대상지 선정 기준',headers=['확인할 조건','통과 기준의 방향','보류·제외 조건'],rows=[
 ['실제 위험 노출','차량 출입·보행 교차가 관찰됨','접점이 없거나 AI 실익이 작음'],
 ['안전한 보행 동선','우회·통제 공간과 시야 확보','설치가 통행·접근성을 악화'],
 ['실증 운영 가능성','공정·유도원·관리자 참여 확보','잔여 공기 부족·권한 불명'],
 ['설비·법적 조건','전기·통신·촬영·표시 검토 가능','구조·설치·개인정보 부적합'],
 ],caption='숫자로 임의 순위를 매기지 않고 현장 통과·보류 조건으로 판단합니다.')
sec('site-station','sites','site-detail','우선 실사 제안',candidates=['station'],caption='C-STATION | 공개된 사업 내용은 확인, 출입구와 설치 위치·차량·보행량은 미확인입니다.')
sec('site-oryong','sites','site-detail','예비 후보와 적용 한계',candidates=['oryong'],caption='C-URC | 민관 사업의 관리·계약 구조와 실제 잔여 공정을 확인한 뒤 비교합니다.')
sec('scope','solution','editorial','실증 범위',[
 ('출입구 1개소','기존·신규 울타리 약 10~20m와 인접 보도 접점을 가정합니다.'),
 ('카메라 1~2대','시야·야간 품질을 통과하면 기존 장비를 재사용합니다.'),
 ('4가지 운영 기능','위험구역 설정·담당자 경고·상태 관리·조치 기록을 포함합니다.')],caption='범위 가정: M1 | 도시 전체 관제 신설·상업광고·무인 통행 제어는 초도 범위 밖입니다.')
sec('architecture','solution','architecture','시스템 구성',[
 ('카메라','영상과 장비 상태를 현장에서 수집'),('현장 분석','객체·방향·위험구역 조건을 비교'),('경고·확인','담당자 알림과 장치 작동 확인'),('이력 관리','이벤트·수동 조치·상태 변경 저장')],caption='제안 아키텍처 | 실제 장비 API·처리 지연·감지 성능은 통합 시험 전입니다.')
sec('integration','governance','matrix','데이터·연계 범위',headers=['초도 실증에서 처리','운영 원칙','후속 협의 대상'],rows=[
 ['현장 영상·위험 이벤트','촬영 최소화·권한·보존·삭제 설정','원본 영상 중앙 전송은 별도 검토'],
 ['경고·장치 상태·관리자 확인','명령 성공과 실제 작동을 분리','장치별 API·응답 규격 확정'],
 ['비식별 운영 집계','업무 목적과 기간을 정해 보관','시 데이터·도시 플랫폼 연계 검토'],
 ['모델·위험구역 변경','승인·버전·재검증 이력 기록','임의 학습·새 성능 주장 차단'],
 ],caption='개인정보·보안·연계 권한은 개별 검토 | 기존 천안 플랫폼에 이미 연결된 기능이 아닙니다.')
sec('design','solution','editorial','시민 안내와 공공디자인',[
 ('보행을 방해하지 않기','장비보다 통행 연속성·우회 안내·시야 확보를 우선합니다.'),
 ('안내와 경고 나누기','울타리는 정적 공사정보를 기본으로, 담당자 경고는 별도 검토합니다.'),
 ('현장에서 읽히게 만들기','주야간 가독성·눈부심·소음·보행약자 불편을 함께 관찰합니다.')],caption='C-FENCE의 정책 맥락을 참고한 설계 제안 | 천안8경·캐릭터 원본 사용권과 외부 표시 허가는 별도입니다.')
sec('rollout','delivery','timeline','착수 후 일정 가정',[
 ('1개월차','후보지 공동조사\n권한·설치 조건 협의'),('2~3개월차','통합·장애 시험\n설치 승인·시운전'),('4~7개월차','현장 운영·교육\n기준선·이벤트 관찰'),('8개월차','기술·운영·비용 평가\n확대·개선·중단 판단')],caption='총 약8개월의 기준 일정 가정 | 실제 공정·승인·기상 여건에 따라 조정합니다.')
sec('organization','delivery','matrix','수행·운영 책임 제안',headers=['역할','주체 제안','확정할 책임'],rows=[
 ['발주·현장 승인','천안시 소관 발주부서·현장 시공사','후보지·범위·예산·안전 운영'],
 ['설치·고객 창구','에스엘티','CCTV·경고장치·통신·현장 지원'],
 ['장비·AI 모듈','강민코퍼레이션','울타리·인식장비·실외 성능 시험'],
 ['운영 SW·통합','비트리','이벤트·장치 연동·기록·권한'],
 ],caption='제공 원본의 수행 구조 | 계약·자격·지식재산·조달 방식과 최종 운영 책임자는 별도 확정합니다.')
sec('budget','economics','budget','실증 사업비의 범위',caption='원본 기획 범위 기반 · 업체 견적·천안시 확정 예산 아님')
sec('benefits','impact','benefits','기대효과와 공공가치',caption='기대효과 가설 | 사고 감소율·예산 절감액을 확정 성과로 제시하지 않습니다.')
sec('time-scenario','impact','scenario','운영 효과의 산식 예시',caption='실제 이벤트 수·기록시간은 미측정 | 인력 감축·현금 절감·사고 감소로 환산하지 않습니다.')
sec('kpis','impact','kpis','실증 성과의 판단',caption='실증 목표는 현장 책임자와 합의 · 미측정을 0으로 표시하지 않습니다.')
sec('risks','governance','matrix','진입·중단 조건',headers=['주요 위험','설치 전·운영 중 조치','보류·중단 기준'],rows=[
 ['현장·보행 안전','구조·전기·우회·유도원 절차 확인','기존 안전조치를 약화시키면 보류'],
 ['미탐·지연·장애','통제 시험과 수동 절차 점검','반복 놓침·전달 실패면 중단'],
 ['촬영·표시·개인정보','관계부서 사전 검토·권한 설정','적합성·운영 주체 미확정 시 보류'],
 ['운영 부담·비용','오탐·업무시간·민원·재견적 확인','추가 편익이 없으면 확대 보류'],
 ],caption='운영 게이트 제안 | 이 문서는 개별 현장 설치의 법적 적합성을 확정한 검토서가 아닙니다.')
sec('decision','decision','decision','천안시에 요청하는 다음 결정',[
 ('후보지 공동조사','와촌동 우선·원성동 예비 후보의 출입구·보행 여건을 함께 확인합니다.'),
 ('협의 책임자 지정','발주부서·현장 시공사·안전관리자와 범위와 운영 책임을 정합니다.'),
 ('제한 실증 여부 판단','설치 조건·실제 위험 수요·견적·시험 기준을 확인한 뒤 착수를 결정합니다.')],caption='주요 근거: 천안 도시재생지원센터·AURUM·국토교통부·시의회·제공 원문 | 전체 URL·가정·미확인 사항은 동봉 검토 기록에 있습니다.')
b={
 'version':1,'targetSlideCount':25,
 'context':{'entityName':'천안시','asOf':now,'factClaimIds':['city-smart','city-plan','city-station','city-oryong','city-bongmyeong','city-council','city-fence'],'needHypothesis':'진행·계획 중인 도시개발과 기존 생활권의 접점에서, 공사 중 보행 경험을 관리하는 출입구 단위 서비스의 필요성을 조사한다.','notEstablished':['후보 현장의 실제 위험 빈도·사고·민원','공사 출입구·유도원 배치·장비 사용권','잔여 공정·기관 동의·사업 예산·API·현장 성능']},
 'requiredDisciplines':['도시기획','현장안전','공공디자인','시스템설계','스마트시티','사업성·평가'],
 'expertReviews':experts,'resolutions':resolutions,'candidates':candidates,'budget':budget,
 'timeScenario':{'status':'illustrative-not-observed','eventsPerDay':20,'daysPerMonth':20,'beforeMinutes':5,'afterMinutes':2,'claimIds':['time-example'],'attributionLimit':'계산법을 설명하는 임의 입력이며 현재 업무시간·목표·예측값이 아니다. 도입 전후 동일 업무의 기록시간과 이벤트 수를 측정해야 한다.'},
 'benefits':benefits,'metrics':metrics,'sections':sections,
}
p['businessCase']=b
p['slides'].append({'id':'design','layout':'editorial','title':'시민 안내와 공공디자인','message':'설명용 디자인 개념','claimIds':['city-fence'],'items':[],'footnote':'설명용 개념도','image':{'path':'examples/assets/smartfence-public-design.png','rights':'generated','caption':'AI 생성 안내 개념도 · 실제 천안 현장·설치안 아님'}})
old={s['id']:s for s in p['planning']['story']}
old['cover']['title']='천안시 공사장\nSmartFence AI\n시민안전 실증 제안'
old['cover']['answer']='도시개발 현장의 보행안전을 위해\n접근 알림과 현장 대응을 연결합니다.'
old['cover']['proofClaimIds']=['scope','city-plan','manual-authority']
# Keep all content declarations within their source limits; business copy is authored, not factual validation.
story=[]
def case(id,title,answer,refs):
 story.append({'id':id,'stage':'business','sectionId':id,'title':title,'question':title+'에 대해 무엇을 결정할 것인가?','answer':answer,'proofClaimIds':refs,'visualPurpose':next(s['visual'] for s in sections if s['id']==id)+' 형식으로 해당 사업 판단에 필요한 관계와 근거를 설명한다.','limitation':'근거: '+' · '.join(refs)+' | 공개자료·제안·가정 구분, 상세 출처는 검토 기록 참조'})
story.append(old['cover'])
case('summary','한 곳의 실증으로 천안형 출입구 안전관리 모델을 만듭니다','지역의 후보 현장을 조사하고 감지·경고·조치 확인을 시험해, 다음 공사에 재사용할 운영 기준을 제안합니다.',['scope','city-plan','impact-hypothesis'])
case('cheonan-context','도시를 바꾸는 공사와 시민의 일상은 같은 공간에 있습니다','와촌동·원성동·봉명동의 공개 사업을 출발점으로, 공사 중 차량 출입과 생활 동선의 접점을 조사합니다.',['city-station','city-oryong','city-bongmyeong'])
case('policy-fit','천안의 시민체감형 스마트도시 방향을 공사 중 안전으로 잇습니다','기존 도시재생·스마트도시·공공디자인의 방향과 연결하되, 본 실증의 승인·예산·연계 권한은 별도로 확보합니다.',['city-smart','city-plan','city-council','city-fence'])
story.append(old['problem'])
case('journey','차량 반입부터 현장 조치까지 시민의 이동을 함께 봅니다','장비의 감지 순간만 보지 않고 보행자의 접근, 유도원의 통제, 실제 조치 기록까지 한 흐름으로 설계합니다.',['public-boundary','manual-authority','response-chain'])
case('sites','천안의 실제 사업지 세 곳을 조사 후보로 비교합니다','공개 자료에 있는 사업지와 실사로 확인해야 할 출입구 조건을 분리해, 후보 선정부터 근거를 남깁니다.',['city-station','city-oryong','city-bongmyeong','candidate-fit'])
case('selection','사업 규모보다 출입구의 위험 수요와 운영 가능성이 중요합니다','대형 개발이라는 이유로 선정하지 않고 동선·공정·책임자·설치 조건을 통과한 현장을 고릅니다.',['candidate-fit','readiness','public-boundary'])
case('site-station','와촌동 혁신지구의 대표 출입구를 우선 조사합니다','복합 시설의 공사 동선과 보행 접점을 함께 볼 수 있는 후보이며, 실제 공정과 설치 위치는 현장에서 확인합니다.',['city-station','candidate-fit','local-gap'])
case('site-oryong','원성동 오룡지구는 관리 주체와 생활 동선을 함께 확인합니다','공공·민간 복합개발의 생활권 접점을 살피되, 승인 권한과 공정별 출입 계획이 맞아야 실증 후보가 됩니다.',['city-oryong','candidate-fit','local-gap'])
story.append(old['alternatives'])
case('scope','초도 실증은 한 출입구의 안전 운영에 집중합니다','작은 범위에서 설치·성능·운영 부담을 검증하고 도시 전체 관제나 광고 사업으로 범위를 넓히지 않습니다.',['pilot-package','scope','readiness'])
story.append(old['concept'])
case('architecture','현장에서 감지하고 알리며, 사람의 조치를 기록합니다','현장 독립형 분석·경고·기록을 먼저 통합하고 실제 성능과 장치 응답을 단계별로 시험합니다.',['observation-proposal','warning-proposal','response-chain'])
case('integration','영상은 필요한 범위에서 처리하고 도시 연계는 후속으로 둡니다','초도 실증은 현장 운영과 개인정보 보호에 집중하며, 후속 연계는 비식별 집계와 권한 검토부터 시작합니다.',['privacy-boundary','city-smart','readiness'])
story.append(old['operation'])
case('design','안전한 이동과 읽기 쉬운 안내가 장비보다 먼저입니다','정적 공사정보·우회 안내와 현장 담당자 경고를 나누고, 장비가 새로운 통행 불편을 만들지 않도록 설계합니다.',['city-fence','public-boundary','privacy-boundary'])
case('rollout','조사·시험·현장 운영을 통과하며 단계적으로 진행합니다','착수 후 약8개월 기준안을 제안하되 공정·승인·시험 결과에 따라 다음 단계 진입을 조정합니다.',['roadmap-plan','readiness'])
case('organization','설치 책임과 매일의 안전 운영 책임을 함께 정합니다','제안사의 공급 역할과 현장 관리자의 안전 책임을 구분하고, 계약과 장애 창구를 설치 전에 확정합니다.',['governance-plan','manual-authority'])
case('budget','실증 예산은 장비·설치·운영 범위에 따라 달라집니다','하드웨어뿐 아니라 통합 시험·설치 지원·교육·성과검증을 포함한 기획 범위이며 실제 견적으로 확정해야 합니다.',['budget-plan','pilot-package'])
case('benefits','시민의 위험 인지, 현장의 대응, 행정의 재사용 가치를 높입니다','사고 감소를 보장하기보다 접근 알림과 조치 확인, 운영 자료 축적을 실제 측정 가능한 효과로 연결합니다.',['impact-hypothesis','response-chain','city-plan'])
case('time-scenario','업무시간 절감은 가정 산식과 실측을 구분해 판단합니다','이벤트 수와 건당 기록시간을 측정하면 시간 차이를 계산할 수 있습니다. 아래 수치는 계산법을 설명하는 가정입니다.',['time-example'])
case('kpis','놓친 위험·경고 지연·조치 기록으로 실증의 질을 판단합니다','오탐과 업무 부담도 함께 보며, 현장 기준선이 없다는 이유로 임의의 성능 수치를 약속하지 않습니다.',['readiness','response-chain','impact-hypothesis'])
case('risks','설치와 운영의 필수 조건을 통과해야 다음 단계로 갑니다','안전·설비·촬영·표시·운영 부담을 검토하고 조건을 충족하지 못하면 보류·수정·중단합니다.',['privacy-boundary','readiness','manual-authority'])
case('decision','후보 현장과 협의 책임자를 정해 공동조사를 시작합니다','현장 조건·실제 위험 수요·견적·시험 기준을 함께 확인한 뒤 제한 실증의 착수 여부를 결정해 주시기 바랍니다.',['candidate-fit','scope','budget-plan','readiness'])
mapping={'urban':[['sites','selection','site-station'],['journey','design']], 'safety':[['operation'],['kpis','risks']], 'design':[['design','integration'],['design','risks']], 'system':[['architecture','integration'],['scope','rollout']], 'smartcity':[['policy-fit','cheonan-context'],['benefits','decision']], 'economics':[['benefits','kpis','time-scenario'],['budget','organization']]}
for r in experts:
 for i,f in enumerate(r['findings']):f['storyBeatIds']=mapping[r['id']][i]
p['planning']['story']=story
assert len(story)==25
(root/'examples/smartfence-full.project.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
(root/'references/research/cheonan-full-evidence.json').write_text(json.dumps({'checkedAt':now,'method':'manual public web reads by assistant; no runtime search API','sources':p['sources'][4:],'claims':p['claims'][10:],'failedReads':['URC /73 and /72 direct fetch forbidden; used verified /68 public directory','National smartcity presentation PDF unavailable; used policybriefing primary text','privacy guide PDF timeout; no new legal conclusion claimed'],'localFieldSurvey':False},ensure_ascii=False,indent=2)+'\n')
print('Authored 25-page business case with',len(experts),'review perspectives and',len(candidates),'candidate sites.')

# Reapply reviewed visual plans. Regenerating the full sample must not erase its visual workflow.
if (root/'examples/smartfence-visual-plans.json').exists():
 import subprocess
 subprocess.run(['node','--import','tsx','scripts/apply-visual-plans.ts'],cwd=root,check=True)
