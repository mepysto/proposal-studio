import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { Project } from '../packages/core/schema.js';
import { compileStoryboard, planningAudit } from '../packages/planning/index.js';

// A separate authored project. The approved full document is read-only input.
const protectedFiles=['projects/aive-pro/project.json','projects/aive-pro/latest.json','projects/aive-pro/output/proposal.pptx','projects/aive-pro/output/proposal.pdf'];
const sha=async(file:string)=>crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
const before=await Promise.all(protectedFiles.map(sha));
const source=JSON.parse(await fs.readFile(protectedFiles[0],'utf8'));
const p:any=structuredClone(source);
const original=p.planning.story;
p.id='aive-pro-summary';
p.title='AiVE Pro 2.0 쉽게 읽는 핵심 요약';
p.audience='기술 배경이 없는 경영진·현장 관리자·일반 독자';
p.proposalType='plain-language-product-summary';
p.design.name='AiVE Pro 일반 독자용 핵심 요약';
p.design.bodySize=18;
p.designDirection={...p.designDirection,
  concept:'비전문가가 현장 경보 장치의 역할·개선 내용·검증 범위·남은 과제를 8쪽으로 이해하는 별도 요약본',
  visualThesis:'장면·동작 흐름·전후 비교·실제 화면으로 설명하고 구현 명칭과 세부 수치는 덜어낸다',
  avoid:['개발 용어와 약어의 나열','사고 예방 효과나 현장 정확도의 확정','원본 개발 통합문서의 변경'],
  references:p.designDirection.references.filter((r:any)=>r.role==='content'),
};
const box=(x:number,y:number,w:number,h:number)=>({x,y,w,h});
const node=(id:string,label:string,detail:string,icon='document')=>({id,label,detail,icon});
const edge=(from:string,to:string,label='')=>({from,to,label});
function page(index:number,id:string,stage:string,title:string,message:string,answer:string,claims:string[],limitation:string,legend:string) {
 const s=structuredClone(original[index]);
 s.id=id;s.stage=stage;delete s.sectionId;
 s.title=title;s.question=`${title}에서 일반 독자가 알아야 할 핵심은 무엇인가?`;s.answer=answer;
 s.proofClaimIds=claims;s.limitation=limitation;
 s.visualPurpose=answer;
 const v=s.visualPlan,b=s.compositionBrief;
 v.takeaway=message;v.evidenceIds=claims;v.legend=legend;
 v.readingGuide={message,keyPhrase:message,focusPhrases:[message],tone:'teal'};
 v.explanation={readerTask:answer,howToRead:'제목 아래 핵심 설명을 읽고 시각물의 순서와 대응 관계를 확인한다.',notProven:limitation,requiredMarks:v.explanation.requiredMarks};
 b.typography={titleSize:32,messageSize:20,nodeTitleSize:18,bodySize:18,captionSize:12};
 b.narrative={beliefShift:answer,evidenceClaimIds:claims,nextQuestion:'다음 페이지에서 관련 동작과 확인 조건을 살펴본다.'};
 b.rationale=answer;b.readingPath=v.explanation.howToRead;
 return s;
}
function graph(s:any,nodes:any[],edges:any[]) {
 const b=s.compositionBrief,v=s.visualPlan;
 for(const key of ['screenLayout','swimlaneLayout','chartFocus','edgeRoutes']) delete b[key];
 for(const key of ['interfaceExample','scene','chart','schedule','chains','comparisonTable']) delete v[key];
 b.visual='graph';b.nodeTreatment='document';b.visualBox=box(.64,2.02,12.05,4.02);
 v.kind='flow';v.intent='structural';v.nodes=nodes;v.edges=edges;
 v.explanation.requiredMarks=['connectors'];
 v.encoding='번호와 화살표로 읽는 편집 가능한 동작·확인 경로';
 b.nodeBoxes={};b.edgeLabelBoxes={};
 nodes.forEach((n:any,j:number)=>b.nodeBoxes[n.id]=box(.72+(j%2)*6.15,2.30+Math.floor(j/2)*1.98,5.58,1.7));
}
function table(s:any,columns:string[],rows:any[]) {
 const b=s.compositionBrief,v=s.visualPlan;
 for(const key of ['screenLayout','swimlaneLayout','chartFocus','nodeTreatment','edgeRoutes']) delete b[key];
 for(const key of ['interfaceExample','scene','chart','schedule','chains']) delete v[key];
 b.visual='comparison';b.visualBox=box(.64,2.02,12.05,4.02);b.nodeBoxes={};b.edgeLabelBoxes={};
 v.kind='comparison';v.intent='structural';v.edges=[];
 v.nodes=columns.map((label,j)=>node(`column-${j}`,label,`${label}의 같은 기준 비교`));
 v.comparisonTable={columns,rows};v.explanation.requiredMarks=['comparison'];
 v.encoding='같은 행의 기준을 좌우로 비교하는 편집 가능한 표';
}
const a=page(1,'easy-01-product','problem','AiVE Pro 한눈에 보기',
 '작업자와 차량이 가까워질 때 운전자에게 알리는 보조 장치',
 '지게차 주변은 운전자가 모두 보기 어렵다. AiVE Pro는 카메라 영상에서 사람·차량을 찾아 정해 둔 구역에 접근하면 화면·빛·소리로 알린다.',
 ['C-OVERVIEW','C-PRD-DZA','C-ZONE-ALARM'],
 '현장 적용 개념도 · 운전자 직접 확인과 현장 안전수칙을 보조하는 장치',
 '근거: 개발 통합문서 2쪽 · 제품 기획서 · 카메라가 보지 못하거나 놓치는 상황은 남아 있음');
let nodes=a.visualPlan.nodes;
nodes[0].label='카메라로 주변 확인';nodes[0].detail='앞·뒤·좌·우 영상을 함께 확인\n사람과 차량의 접근을 살펴봄';
nodes[1].label='안쪽 구역은 위험 알림';nodes[1].detail='가까운 구역에 들어오면\n경광등·부저·화면으로 알림';
nodes[2].label='바깥 구역은 미리 주의';nodes[2].detail='주의가 필요한 범위를 구분\n현장에 맞게 화면에서 조정';

const b=page(10,'easy-02-flow','intervention','접근을 알아채고 알리는 과정',
 '장치가 접근을 알리고, 운전자가 주변을 확인해 대응',
 '카메라가 영상을 보내면 AI가 사람·차량의 모습을 찾고, 정해 둔 경고·위험 구역과 비교한다. 접근 알림을 받은 운전자가 주변을 확인해 안전 조치를 한다.',
 ['C-OVERVIEW','C-ZONE-ALARM','C-UI-MONITOR'],
 '차량을 자동으로 제동하는 기능은 현재 범위에 포함되지 않음',
 '근거: 개발 통합문서 2·6·12쪽 · 알림이 없다고 안전이 확인된 것은 아님');
graph(b,[
 node('see','1. 주변 영상 받기','카메라 4대가 주변을 촬영\n앞·뒤·좌·우 영상을 장치에 전달','camera'),
 node('find','2. 접근 여부 살펴보기','AI가 사람·차량의 모습을 찾음\n정해 둔 주의·위험 구역과 비교','server'),
 node('act','4. 운전자가 확인·대응','장비를 멈추고 주변을 직접 확인\n현장 안전수칙에 따라 조치','person'),
 node('alert','3. 운전자에게 알리기','화면 표시·경광등·소리로 알림\n어느 방향에 접근했는지 확인','bell'),
],[edge('see','find'),edge('find','alert'),edge('alert','act')]);

const c=page(3,'easy-03-changes','intervention','기존 제품에서 달라진 점',
 '감시 지속·현장 설정·기록과 복구에 초점을 둔 개선',
 '화면과 감시 기능을 나눠 화면 문제의 영향을 줄이고, 현장별 구역 설정과 점검·기록 기능을 보강했다. 설치가 잘못되면 이전 버전으로 되돌리는 절차도 마련했다.',
 ['C-LEGACY-LIMITS','C-ARCH-SEPARATION','C-UI-ADMIN','C-INSTALL-SHIP'],
 '개발 문서에 기록된 구조·기능 비교이며 사고 감소 효과의 실측 결과는 아님',
 '근거: 개발 통합문서 4·17·18·23쪽 · 설정·동작은 실제 설치 장비에서 확인 필요');
table(c,['기존 AiVE','AiVE Pro'],[
 {criterion:'화면 문제',values:['화면이 멈추면 감시에 영향','화면과 감시 기능을 나눠 영향 축소']},
 {criterion:'감지 구역',values:['단순한 사각형 중심','통로·장애물에 맞게 모양 조정']},
 {criterion:'설정·점검',values:['설정 보호·오류 안내 부족','관리자 비밀번호·상태 안내·경보 시험']},
 {criterion:'기록·복구',values:['문제 추적·수동 설치가 불편','경보 기록·사진 저장·이전 버전 복원']},
]);

const d=page(8,'easy-04-fault','operation','장치에 문제가 생겼을 때',
 '화면 문제와 감시 불가를 구분하고, 사람이 직접 확인',
 '화면 프로그램만 멈춘 경우에는 감지·경보가 계속되도록 분리했다. 카메라나 감시 기능에 문제가 생기면 정상 상태를 해제하고 고장 알림과 복구 절차로 대응한다.',
 ['C-ARCH-SEPARATION','C-STATE-VIEWCHECK','C-OUTPUT-LEASE','C-BOARD-FAILSAFE'],
 '자동 복구에 걸리는 시간은 고장 종류에 따라 다름 · 감시 불가 시 수동 안전절차 적용',
 '근거: 개발 통합문서 8·9·13·26쪽 · 경보가 꺼진 상태를 정상·안전 상태로 판단하지 않음');
graph(d,[
 node('screen-stop','화면 프로그램만 멈춤','영상 표시나 메뉴에 문제가 생김\n감시 기능과는 분리된 실행 구조','server'),
 node('keep-watch','감지·경보 기능은 계속','화면 문제의 영향을 줄이도록 설계\n화면 상태는 별도로 점검·복구','shield'),
 node('watch-fault','카메라·감시 기능 이상','영상이 끊기거나 가려지는 상황\n정상적으로 감시할 수 없는 상태','camera'),
 node('human-check','고장 알림과 현장 확인','정상 표시를 해제하고 복구 시도\n운전자·관리자가 직접 안전 확인','person'),
],[edge('screen-stop','keep-watch'),edge('watch-fault','human-check')]);

const e=page(16,'easy-05-use','operation','현장에서 쓰는 화면과 설정',
 '주변 영상을 보고, 필요한 구역을 터치로 조정',
 '운전자는 주변 영상과 알림을 확인한다. 관리자는 비밀번호로 설정에 들어가 주의·위험 구역을 조정하고 경광등·소리가 실제로 작동하는지 시험할 수 있다.',
 ['C-UI-MONITOR','C-UI-ADMIN'],
 '제공된 프로그램 화면 예시 · 실제 구역과 장비 출력은 설치 현장에서 확인',
 '근거: 개발 통합문서 16~18쪽 · 운영 매뉴얼');
nodes=e.visualPlan.nodes;
nodes[0].label='영상과 알림 확인';nodes[0].detail='어느 방향에 접근했는지 확인\n고장·영상 없음 안내도 함께 확인';
nodes[1].label='현장에 맞게 구역 조정';nodes[1].detail='터치로 구역의 꼭짓점을 이동\n통로·장애물에 맞게 범위 설정';
nodes[2].label='관리자가 설정·점검';nodes[2].detail='비밀번호로 설정 변경을 보호\n경광등·소리의 실제 동작 시험';
e.visualPlan.interfaceExample.decision={title:'현장 설정과 점검',reason:e.answer,action:'구역을 편집해도 감시는 계속'};
e.visualPlan.interfaceExample.records=[{name:'현장 설정',status:'화면 예시',detail:e.answer,updated:'2026-10-31'}];
e.visualPlan.scene.annotations=[];

const f=page(25,'easy-06-evidence','validation','확인된 결과와 남은 검증',
 '개발·장비 시험 기록과 실제 현장 검증을 구분',
 '보드 문서에는 카메라 4대의 동시 처리와 고장 후 복구, 터치 화면 동작이 기록되어 있다. 야간·비·가림 등 실제 현장의 인식 성능과 사고 예방 효과는 추가 확인이 필요하다.',
 ['C-BOARD-PERF','C-BOARD-FAILSAFE','C-TEST-PLAN'],
 '제공된 시험 기록을 요약한 내용 · 이번 문서 작성 과정에서 장비 시험을 새로 실행하지 않음',
 '근거: 개발 통합문서 24~27쪽 · 설치 환경·고장 종류가 달라지면 결과도 달라질 수 있음');
table(f,['개발·시험 기록','이 결과를 읽는 방법'],[
 {criterion:'주변 영상',values:['카메라 4대·각각 초당 약 20회 분석','여러 방향을 함께 살펴보는 처리 기반']},
 {criterion:'고장 복구',values:['프로그램 강제 종료 후 약 3.1초 복귀','모든 고장이 같은 시간에 복구되는 것은 아님']},
 {criterion:'화면 조작',values:['5·7인치 터치 화면 동작 확인','구역 설정과 점검을 화면에서 처리']},
 {criterion:'현장 성능',values:['야간·비·가림 환경은 추가 시험 필요','현장 정확도·사고 감소 효과는 미확정']},
]);

const g=page(28,'easy-07-expansion','intervention','현재 기능과 앞으로의 확장',
 '카메라 감시를 바탕으로, 거리 센서 추가를 검토',
 '현재는 카메라 영상으로 사람·차량 접근을 살펴본다. 향후에는 거리를 직접 재는 센서와 포크 높이 감지를 더하는 계획이 있으며, 사양·비용·현장 검증을 거쳐야 한다.',
 ['C-MULTICLASS-STAGE2','C-UI-ADMIN','C-EXT-HW-SURVEY'],
 '센서 융합 적용 개념도 · 추가 센서는 계획 단계이며 실제 성능·비용은 미확정',
 '근거: 개발 통합문서 21·29·30쪽 · 현재 기능과 향후 개발 계획을 구분');
nodes=g.visualPlan.nodes;
nodes[0].label='현재: 카메라 접근 감시';nodes[0].detail='영상에서 사람·차량을 찾음\n정해 둔 구역 접근 시 운전자 알림';
nodes[1].label='계획: 거리·높이 감지';nodes[1].detail='센서로 물체까지의 거리 확인\n포크 높이를 함께 살피는 방향';
nodes[2].label='확장 전 확인할 조건';nodes[2].detail='센서 사양·설치 위치·비용 합의\n실제 작업 환경에서 동작 검증';
g.visualPlan.interfaceExample.decision={title:'거리 센서 확장',reason:g.answer,action:'적용 개념도 · 추가 센서는 향후 개발·검증 범위'};
g.visualPlan.interfaceExample.records=[{name:'센서 확장',status:'계획',detail:g.answer,updated:'2026-10-31'}];
g.visualPlan.scene.annotations=[];

const h=page(29,'easy-08-next','operation','도입 전에 확인할 일',
 '장비 연결과 현장 시험을 마친 뒤 운영 범위를 확정',
 '남은 장비 연결 항목을 확인하고 실제 작업장에서 낮·밤·가림 조건을 시험한다. 장비별 경보·고장·복구 점검을 마친 뒤 담당자와 점검 방법을 정해 운영한다.',
 ['C-EXT-HW-SURVEY','C-TEST-PLAN','C-INSTALL-SHIP'],
 '아래는 확인 절차의 순서 · 완료된 계약·출하 승인이나 확정 일정의 의미는 아님',
 '근거: 개발 통합문서 21·24·30쪽 · 운전자 직접 확인과 현장 안전수칙은 계속 적용');
graph(h,[
 node('connection','1. 장비 연결 확인','추가 출력·입력 단자와 보드 확인\n실제 경광등·부저의 동작 점검','clipboard'),
 node('field','2. 실제 작업장에서 시험','낮·밤·가림 등 조건을 바꿔 확인\n알림이 빠지거나 잦아지는지 기록','camera'),
 node('operation','4. 운영·점검 방법 확정','담당자·일일 점검·고장 대응 정리\n설치 후에도 설정과 상태를 점검','team'),
 node('shipping','3. 장비별 출하 점검','영상·경보·고장 알림·복구 확인\n정해진 점검표로 결과를 남김','shield'),
],[edge('connection','field'),edge('field','shipping'),edge('shipping','operation')]);

p.planning.story=[a,b,c,d,e,f,g,h];
p.planning.decision.request='장치의 역할과 현재 확인 범위를 이해하고, 도입 전에 필요한 장비·현장 검증 및 운영 책임을 확인한다.';
p.planning.decision.scope='카메라 접근 경보 장치의 핵심 기능·개선 내용·시험 기록과 향후 확장 계획';
p.quantitativeDatasets=[];
p.slides=[];
let parsed=Project.parse(p);
const audit=planningAudit(parsed,false);
if(audit.status==='blocked') throw Error(JSON.stringify(audit.issues,null,2));
parsed.slides=compileStoryboard(parsed);
parsed=Project.parse(parsed);
const post=planningAudit(parsed,true);
if(post.status==='blocked') throw Error(JSON.stringify(post.issues,null,2));
const dir='projects/aive-pro-summary';
await fs.mkdir(dir,{recursive:true});
await fs.writeFile(`${dir}/project.json`,JSON.stringify(parsed,null,2)+'\n');
await fs.writeFile(`${dir}/source-preservation.json`,JSON.stringify({sourceProject:'aive-pro',files:protectedFiles.map((file,i)=>({file,sha256:before[i]})),unchanged:before.every((hash,i)=>hash===before[i])},null,2)+'\n');
for(const [i,file] of protectedFiles.entries()) if(await sha(file)!==before[i]) throw Error(`Source changed: ${file}`);
console.log(`Created separate ${parsed.slides.length}-page plain-language summary; source unchanged.`);
