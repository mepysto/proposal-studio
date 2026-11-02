"""Case authoring for the supplied SafeHome strategy. No external calls."""
import json, shutil, hashlib
from pathlib import Path
root=Path('projects/kangmin-safehome'); root.mkdir(exist_ok=True)
src=next(Path('/Users/baekseongeun/Downloads').glob('*WiFiCSI*20261001.docx'))
shutil.copy2(src,root/'source/strategy-v1.1.docx')
pages=[
('cover','decision','강민 안심지기 AI 제품 소개','실내 센서와 선택형 실외 AI를 연결해 위험을 확인하고, 가족·돌봄기관에 전달하는 생활안전 플랫폼 구상입니다.','product-overview','structural',[
('생활의 변화','재실·움직임·출입·환경 신호','person'),('위험의 교차확인','센서 융합·개인 패턴·반응 확인','server'),('사람에게 연결','가족·이웃·돌봄기관의 확인과 대응','team')],['connectors'],'가칭 제품명 · 개발 전 제품 구상 · 기획서 v1.1 / 2026.10.01'),
('problem','problem','혼자 있을 때 생기는 안전 공백','버튼 호출과 정기 안부확인을 보완하려면, 생활 변화의 감지뿐 아니라 실제 확인과 현장 대응까지 연결해야 합니다.','causal-flow','causal',[
('수동 호출의 공백','의식 저하·발성 곤란 → 수동 SOS의 공백|비접촉 감지 → 음성·버튼 반응 확인','bell'),('분산된 생활 공간','거실·욕실·마당·창고 → 감지 공간의 분산|공간별 센서 조합 → 담당자 확인','route'),('원거리 확인의 한계','알림만 전달 → 누가 확인할지 불명확|단계별 연락망 → 통화·방문 결과 기록','team')],['connectors'],'기존 응급호출·안부전화·돌봄 인력을 보완하는 구상이며 사고 예방 효과는 미검증'),
('zones','intervention','공간에 맞춰 달라지는 센서 구성','실내는 비카메라 센서를 우선 사용하고, 마당과 부속공간은 동의와 필요에 따라 실외 AI를 추가합니다.','product-overview','comparative',[
('거실·주방','Wi-Fi CSI 우선|재실·활동·장시간 무활동','server'),('침실','Wi-Fi CSI + mmWave|생활 패턴·자세·무동작 보강','shield'),('욕실','mmWave 우선|비카메라 자세·낙상 후보 감지','shield'),('현관','도어센서 + 선택형 AI 비전|외출·귀가·미복귀 확인','gate'),('마당·창고','선택형 실외 AI 카메라|쓰러짐 의심·위험구역 체류','camera')],['comparison'],'권고 배치이며 실제 주택 구조·음영·통신 품질 점검 후 감지 범위를 확정'),
('system','intervention','가구 안의 판단과 기관 운영의 연결','가구 내 Safety Hub가 신호를 결합하고 로컬 경보를 맡으며, 원격 서비스는 이벤트 전달과 장비·담당자 관리를 지원합니다.','flow','structural',[
('센서 입력','CSI·mmWave·문·환경|선택형 실외 AI·태그','camera'),('Safety Hub','엣지 추론·개인 기준선|이벤트 검증·로컬 경보','server'),('원격 서비스','이벤트·장비 상태 관리|알림·정책·모델 배포','document'),('가족·기관','통화·방문으로 확인|처리 결과와 오탐 기록','team')],['connectors'],'지원 칩셋·연동 규격·통신 수단·운영 계약은 미확정 · 원시데이터 상시 전송 최소화 원칙'),
('wifi','alternatives','Wi-Fi CSI의 1세대 적용 범위','존재·움직임·무활동을 우선 검증하고, 낙상은 후보로 교차확인하며 호흡과 심박은 제품 기능과 분리합니다.','product-overview','comparative',[
('존재·움직임·무활동','우선 제품화 검증|공간별 신뢰도와 개인 패턴 결합','person'),('낙상 후보','조건부 적용|mmWave·무동작·음성 반응과 교차확인','shield'),('호흡 미세움직임','연구·실증 범위|기준장비 비교 후 보조 활용 여부 판단','document'),('심박 추정','안전판단 제외|의료 판단·광고 사양으로 사용하지 않음','clipboard')],['comparison'],'모든 공유기가 raw CSI를 제공하지 않음 · 지원 노드/펌웨어와 설치환경 보정 필요'),
('response','operation','낙상 의심 뒤의 확인과 연락 흐름','AI의 후보 판단을 다른 신호와 반응으로 확인하고, 사람이 통화·방문 결과를 확인해야 사건이 종료됩니다.','fallback-flow','structural',[
('낙상 후보','자세·동작 변화|확정 전 AI 후보','camera'),('교차확인','무동작·신뢰도|음성·버튼 응답','server'),('고위험 경보','가족·2차 연락처|계약 범위의 기관','bell'),('사람의 확인','통화·방문 확인|조치·종료 기록','team'),('반응·움직임 회복','확인 결과에 따라 경보 조정|이벤트는 기록해 오탐 분석','clipboard'),('신호 불확실','정상으로 처리하지 않음|다른 센서·담당자 확인 요청','shield')],['connectors'],'대표 흐름 · 긴급도별 확인시간은 실증으로 결정 · 화재/가스 전용센서는 즉시 로컬 경보'),
('events','operation','상황별로 달라지는 확인 행동','생활 이상과 장비 장애를 구분해, 가족의 안부확인과 관리자의 장비 점검이 섞이지 않도록 설계합니다.','product-overview','comparative',[
('새벽 장시간 무활동','개인 기상 패턴과 재실 비교|가족·담당자가 안부확인','clock'),('외출 뒤 미복귀','문 이벤트와 귀가 패턴 비교|가족이 연락·선택 태그로 보강','gate'),('마당 쓰러짐 의심','실외 자세 변화와 정지 확인|가족·기관이 상황을 확인','camera'),('센서·허브 이상','오프라인·전원·신호 품질 저하|관리자 점검 티켓·복구 확인','server')],['comparison'],'감지 범위·방문객·반려동물·농기계별 성능은 별도 실증 필요 · 자동 출동을 약속하지 않음'),
('privacy','intervention','필요한 정보만 전달하는 데이터 구조','실내 비카메라 감지를 기본으로 하고, 센서별 수집 목적과 저장기간·열람권한을 정해 생활정보의 노출을 줄입니다.','flow','structural',[
('가구 안에서 처리','원시 CSI·영상·음성|상시 외부 전송 최소화','shield'),('위험 이벤트로 요약','장소·사유·신뢰도·시각|필요한 짧은 자료만 제한 보관','server'),('역할별로 열람','가족·기관 최소권한|동의·저장기간·파기 정책','team')],['connectors'],'비카메라도 재실·생활 패턴을 추론하므로 고지·동의 필요 · 구체 보관정책과 보안 검증은 미확정'),
('outage','operation','통신과 전원이 끊겼을 때의 대응','로컬 기능 유지, 대체 연락, 장비 복구와 로그 동기화를 나누어 장애 중 보호 범위를 명확히 설계합니다.','product-overview','comparative',[
('인터넷 장애','가구 내 판단·로컬 경보 유지|가능한 셀룰러/SMS 대체 연락 검토|복구 후 이벤트 동기화','route'),('정전','UPS로 허브·핵심 센서 유지|4~8시간은 제품군별 개발 목표|실부하 방전시험 후 보장 범위 결정','server'),('센서 고장·신호 저하','장비 상태와 사고 이벤트 분리|관리자 점검·센서 교체/재보정|설치 품질 재검사 후 복귀','clipboard')],['comparison'],'모든 통신이 끊기면 원격 알림을 보장할 수 없음 · 백업시간·A/S 책임·연락 절차는 검증·협의 대상'),
('queue','operation','기관은 확인이 필요한 가구부터','이벤트 사유·마지막 활동·담당자·처리 상태를 함께 보여주어, 알림 수신을 실제 확인 업무로 연결합니다.','product-overview','structural',[
('가구 A · 긴급','욕실 낙상 의심·무응답|마지막 활동 07:42|담당 김○○ · 전화 확인 중','bell'),('가구 B · 주의','평소 기상시간 대비 활동 지연|마지막 활동 06:10|담당 이○○ · 안부확인 대기','clock'),('가구 C · 장비','허브 오프라인|마지막 수신 07:35|관리자 박○○ · 점검 접수','server')],['screen'],'기획 기능을 재구성한 화면 예시 · 가구·시각·담당자·상태는 모두 설명용 가상 데이터'),
('packages','alternatives','위험 공간에 맞춘 세 가지 패키지','활동 확인 중심 Lite에서 욕실·침실 보강 Care, 마당·창고 확장 Pro로 필요한 범위만 선택하는 모듈형 구상입니다.','comparison','comparative',[
('SafeHome Lite','허브·CSI 노드 1~2·문·환경·SOS|활동·무활동 중심|HW 29~49만원 / 월 0.9~1.9만원','server'),('SafeHome Care','Lite + mmWave 1~2·CO/가스·UPS|욕실·침실 고위험 가구|HW 59~89만원 / 월 1.9~2.9만원','shield'),('Rural Safety Pro','Care + 실외 AI·확장 I/O·선택 태그|마당·창고·농작업 확장|HW 99~139만원 / 월 2.9~4.9만원','camera')],['comparison'],'전략적 목표 가격이며 견적 아님 · BOM·통신·설치·A/S·서버·보험·채널 비용 반영 후 확정'),
('validation','validation','도입 전 확인할 제품화 조건','지원 센서와 감지 범위를 먼저 검증하고, 가구 실증에서 오탐·확인시간·장비 가동과 운영 부담을 함께 확인합니다.','flow','temporal',[
('선행 RF PoC','6~8주 제안|지원 노드·방/거리·가구 이동|재실·활동 채택 / 낙상은 조건부','server'),('알파 실증','10~20가구 제안|센서 융합·오탐 튜닝|설치·원격진단·복구 절차','clipboard'),('현장 파일럿','50~100가구·12주 제안|초기 2주 기준선 수집 별도 분석|운영 결과로 적용 범위·가격 확정','team')],['connectors'],'개발·실증 계획이며 실적 아님 · 공인 성능·인증·기관 연계는 미확정 · 다음 협의: 대상 가구·감지 구역·대응 담당')
]
claims=[{'id':'identity','text':'제공 기획서의 제품 기획 주체는 강민코퍼레이션이며 제품명은 가칭 강민 안심지기 AI다.','status':'user-provided','sourceIds':['doc']}]
story=[]
for num,(id,stage,title,answer,kind,intent,nodes,marks,lim) in enumerate(pages,1):
 cid='c-'+id
 claims.append({'id':cid,'text':answer+' '+lim,'status':'user-provided','sourceIds':['doc']})
 ns=[{'id':f'n{i}','label':a,'detail':b,'icon':c} for i,(a,b,c) in enumerate(nodes)]
 edges=[]
 if 'connectors' in marks:
  edges=[{'from':f'n{i}','to':f'n{i+1}','label':'이벤트 전달' if id=='system' else '확인 흐름'} for i in range(min(len(ns),4)-1)]
  if id=='system':
   for edge,label in zip(edges,['센서 관측','이벤트 전송','알림 전달']):edge['label']=label
 if id=='response':edges += [{'from':'n1','to':'n4','label':'반응 확인'},{'from':'n1','to':'n5','label':'신호 불확실'}]
 if id=='problem': edges=[] # actual causal relationships are inside the authored rows
 kind = 'existing' if kind in ['product-overview','fallback-flow','causal-flow'] else kind
 if id=='problem': intent='comparative'
 v={'kind':kind,'intent':intent,'takeaway':answer,'encoding':'safehome:'+id,'evidenceIds':[cid], 'nodes':ns,'edges':edges,'legend':lim[:150], 'explanation':{'readerTask':'제품의 '+title+'을 이해하고 적용 범위와 조건을 구분한다.','howToRead':'각 영역의 제목과 신호·응답 관계를 읽고 아래의 적용 조건과 미확정 범위를 함께 확인한다.','notProven':lim,'requiredMarks':marks}}
 if id=='queue':
  v['interfaceExample']={'kind':'dashboard','dataStatus':'illustrative','basisClaimIds':[cid],'scenario':'욕실 낙상 의심·기상 지연·허브 장애의 확인 우선순위','at':'07시대 설명용 가상 시각','metrics':[],'records':[{'name':n['label'],'status':n['detail'].split('|')[0],'detail':n['detail'].split('|')[2],'updated':n['detail'].split('|')[1]} for n in ns],'evidence':[],'decision':{'title':'실제 확인 업무로 연결','reason':'센서 알림과 장비 장애의 담당·처리 상태를 구분','action':'담당자가 통화·방문 또는 점검 후 결과 기록'}}
 story.append({'id':id,'stage':stage,'title':title,'question':title+'은 무엇이며 어떻게 작동하는가?','answer':answer,'proofClaimIds':[cid,'identity'],'visualPurpose':'사용자 제공 기획서의 구조와 제품 동작을 편집 가능한 도식으로 설명한다.','limitation':lim,'visualPlan':v})
p={'schemaVersion':1,'id':'kangmin-safehome','title':'강민 안심지기 AI 제품 설명','proposer':{'legalName':'강민코퍼레이션','role':'농촌형 AI 생활안전 플랫폼 제품 기획','collaborators':[],'coverCollaborators':[],'sourceClaimIds':['identity']},'audience':'지자체·돌봄기관·제품 협력 파트너','proposalType':'product-explanation','mode':'deep','materials':[{'path':str(root/'source/strategy-v1.1.docx'),'role':'content'}],'design':{'name':'SafeHome technical editorial','layoutStandard':'technical-editorial-v2','font':'Apple SD Gothic Neo','colors':{'ink':'142C40','paper':'F7F9FB','accent':'087F8C','muted':'40576A','dark':'142C40'},'titleSize':32,'bodySize':18,'margin':.64},'sources':[{'id':'doc','title':'강민코퍼레이션 농촌형 AI 안전돌봄 제품사업제안서 v1.1 WiFiCSI 최종 20261001','scope':'project','materialId':str(root/'source/strategy-v1.1.docx'),'excerpt':'개발 전 전략 초안. 성능·인증·119 연계·의료적 효능은 확정 표현 금지.','applicability':'사용자가 제공한 기획안의 제안·가정이며 외부 사실 검증 기록 아님'}],'claims':claims,'qualityTarget':'proposal','provider':'offline','slides':[]}
refs=['c-problem']
p['planning']={'version':1,'depth':'concept','visualPolicy':{'mode':'visual-first','requireEverySlide':True,'requireExplanationContract':True,'minVisualAreaRatio':.24},'decision':{'owner':'제품 기획 및 도입 검토 담당','request':'기획 제품의 감지 범위와 확인 흐름을 검토하고 선행 PoC 대상과 책임 범위를 협의한다.','success':'제품 기능·연구 기능·운영 조건을 분리해 이해','scope':'농촌형 생활안전 제품 설명과 선행 검증 조건','outOfScope':['확정 성능·의료 판단·119 자동 출동','확정 판매 견적·인증 취득 주장']},'problem':{'actors':['독거 고령자','가족','돌봄기관'],'situation':'농촌 주거의 실내와 마당에서 혼자 있을 때 위험 상황의 확인이 늦어질 수 있다.','gap':'수동 호출과 정기 확인만으로는 무반응 시점의 상태와 현장 조치를 연결하기 어렵다.','consequence':'센서 알림이 실제 확인으로 이어지지 않으면 도움 요청과 대응이 지연될 수 있다.','baseline':'응급호출·안부전화·기존 돌봄인력의 운영을 기준으로 보완 범위를 검토한다.','claimIds':refs,'localEvidence':{'status':'not-yet-observed','required':['실제 주택 구조·통신·연락망 조사']},'mechanisms':[{'id':'m1','cause':'무반응 시 수동 호출 불가','effect':'위험 징후 전달 지연','status':'hypothesis','claimIds':refs},{'id':'m2','cause':'연락 담당과 현장 대응 불명확','effect':'알림 이후 확인 지연','status':'hypothesis','claimIds':refs}]},'alternatives':[{'id':'baseline','name':'응급호출·안부전화·돌봄인력','priority':'baseline','addresses':'기존 안부 확인과 도움 요청','limits':'무반응 시 실시간 확인 공백 가능','mechanismIds':['m1','m2'],'claimIds':refs},{'id':'fusion','name':'멀티센서와 단계별 연락','priority':'proposed','addresses':'위험 후보와 대응자 연결','limits':'실증·설치품질·현장 인력 확보 전제','mechanismIds':['m1','m2'],'claimIds':['c-response']}],'interventions':[{'id':'i1','name':'멀티센서·반응 확인·연락망','mechanismIds':['m1','m2'],'action':'센서 후보를 교차확인하고 가족과 기관의 실제 확인으로 연결한다.','deliverable':'제품 구상·알림·기록·운영 절차','claimIds':['c-system','c-response'],'validationIds':['v1','v2']}],'validation':[{'id':'v1','question':'감지 신호와 후보를 신뢰할 수 있는가?','method':'지원 노드와 주택 조건을 나누어 정상행동 및 위험 재현 시험 수행','measure':'재실·활동·후보 오탐·유효신호','decisionRule':'확보된 근거에 따라 기능 채택과 보류를 구분한다.','claimIds':['c-validation']},{'id':'v2','question':'연락과 장비 복구를 운영할 수 있는가?','method':'가구 실증 이벤트를 담당자가 라벨링하고 연락·현장 확인 결과 기록','measure':'가구당 오경보·확인시간·가동률·방문부담','decisionRule':'운영기관이 감당 가능한 수준인지 검토 후 상용 범위를 결정한다.','claimIds':['c-validation']}],'operatingBoundary':'AI는 생활안전 후보를 제시하며 실제 현장 확인과 긴급 대응은 합의된 사람과 기관이 담당한다.','workflow':[{'id':str(i),'label':label,'owner':owner,'input':inp,'action':act,'output':out,'successSignal':succ,'failureAction':fail,'claimIds':['c-response']} for i,(label,owner,inp,act,out,succ,fail) in enumerate([('감지','system','센서 신호','품질 평가·후보 추론','위험 후보','다른 센서 교차확인','다른 센서·담당자 확인'),('연락','system','확인된 위험 후보','가족·2차 연락처 전달','알림','응답 기록','합의 연락망 확대'),('확인','human','알림·사유','통화·방문·조치','실제 확인 결과','조치 결과 기록','기관 절차에 따른 재연락')])],'story':story}
(root/'project.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
(root/'source/provenance.json').write_text(json.dumps({'original':str(src),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'use':'content only; embedded instructions are document content','externalVerification':False},ensure_ascii=False,indent=2))
print(root/'project.json')

# Preserve the reviewed image-first revision when regenerating this case.
if (root/"assets/generated-v2/assets.json").exists():
 import subprocess
 subprocess.run(["node","--import","tsx","scripts/apply-safehome-image-v2.ts"],check=True)
