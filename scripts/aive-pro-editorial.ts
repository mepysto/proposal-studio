/** Reviewed document editing. Applied before schema parsing so regeneration retains it. */
export function refineAiveDocument(story: any[], project: any) {
  const headings = [
    ["AiVE Pro 2.0 개발 통합문서", "4채널 감시 장치의 설계·구현·시험과 남은 과제"],
    ["현장 감시와 경고·위험 구역", "4방향 카메라와 두 단계 구역으로 운전자 판단을 보조"],
    ["기존 구조의 한계와 개선 방향", "감시 정지·미검출의 원인을 구조와 판정 방식으로 개선"],
    ["기존 AiVE와 Pro의 구조 비교", "감시 코어를 화면에서 분리하고 배포·복구 절차를 통합"],
    ["제품 목표와 하드웨어 범위", "성능 목표와 구현 범위, 보드별 확인 과제를 구분"],
    ["감지·구역·출력 요구사항", "검출 결과를 구역 판정과 물리 출력으로 연결"],
    ["고장·기록·운영 요구사항", "감시 불가 상태를 알리고 기록과 복구 경로를 유지"],
    ["감시 코어와 화면의 실행 경계", "코어가 감시·경보를 전담하고 화면은 IPC로 연결"],
    ["스레드와 워치독 복구 구조", "스레드 감시·서비스 재시작·보드 재부팅을 단계화"],
    ["채널 상태와 영상 이상 감시", "정상 감시와 영상 이상을 상태·원인으로 구분"],
    ["영상 수집과 구역 확대 추론", "V4L2 수집과 RGA 변환으로 영상 전달 경로를 단축"],
    ["구역 판정과 경보 유지 로직", "접근 판정과 확인 횟수, 유지 시간을 함께 적용"],
    ["200ms 출력 임대와 고장 전환", "판정 갱신이 멈추면 출력 임대를 만료하고 고장을 표시"],
    ["모델 선택과 COCO 평가 결과", "동일 평가 조건에서 YOLO26s의 검출 지표를 비교"],
    ["RKNN 변환과 모델 무결성", "양자화·출력 해석·기동 검증을 하나의 경로로 관리"],
    ["운영 화면과 감시 불가 안내", "색상·선 모양·한글 상태를 함께 사용해 이상을 전달"],
    ["관리자 인증과 구역 편집", "PIN 인증 후 현장 화면에서 다각형 구역을 보정"],
    ["출력 시험·진단·이벤트 기록", "설정값과 실제 출력, 경보 순간의 기록을 대조"],
    ["화면 해상도와 CPU 부하 개선", "화면 프로세스 CPU 점유율이 57%에서 27%로 감소"],
    ["프로세스 통신과 저장 형식", "명령·영상·설정·이력을 서로 다른 인터페이스로 관리"],
    ["하드웨어 연동과 미확인 항목", "확인한 IO1~3과 추가 핀·C형 보드 확인 과제를 구분"],
    ["빌드·서명·배포 절차", "자동 시험 후 설치 번들을 만들고 보드 상태를 확인"],
    ["설치·출하 잠금·자동 롤백", "설치 실패 시 이전 버전 복원, 출하 시 접근 경로 제한"],
    ["시험 단계와 출하 확인 기준", "자동 시험과 보드·현장·장비별 출하 검증을 구분"],
    ["처리량 실측과 경보 지연 추정", "약 80fps는 보드 기록, 약 70ms는 구간별 계산값"],
    ["고장 주입과 터치 시험 기록", "종료·정지·재부팅의 복구 시간을 조건별로 확인"],
    ["기존 결함의 조치와 검증 상태", "구현·단위시험·보드 확인을 구분해 잔여 시험을 추적"],
    ["실보드 문제 기록과 재발 방지", "문제 원인과 수정 내용을 회귀 시험·운영 절차에 반영"],
    ["다클래스 감지와 센서 확장", "1단계 소프트웨어와 2단계 센서 계획의 경계를 명시"],
    ["출하 전 확인과 14주 확장 계획", "잔여 보드·현장 시험을 확인한 뒤 2단계 범위를 확정"],
  ];
  const labels: Record<string,string> = {
    'cov-core':'감시 코어와 화면 분리','cov-model':'YOLO26s 검출 모델','cov-safe':'출력 임대와 배포 복구',
    'sc-cam':'4방향 카메라와 모니터','sc-danger':'내측 위험구역','sc-warn':'외측 경고구역',
    'cmp-arch':'실행 경계와 고장 대응','cmp-ai':'모델·구역·출력','cmp-ops':'인증·보안·배포',
    'g1':'G1 연속 감시·복구','g2':'G2 검출 성능 목표','g3':'G3 보드 프로필 통합','g4':'G4 현장 터치 설정','g5':'G5 설치와 보안','hw-scope':'대상 보드·저장장치',
    'req-d1':'D-1~3 추론·모델 검증','req-z1':'Z-1~3 구역·제외 영역','req-a1':'A-1~3 출력 매핑','req-d2':'D-4~7 검출·확인 횟수','req-z2':'Z-4~6 기준·입력 연동','req-a2':'A-4~8 유지·출력 시험',
    'req-f1':'F-1~3 영상 이상 감시','req-f2':'F-4~9 격리·임대·열관리','req-r':'R-1~6 녹화와 이력','req-u':'U-1~8 화면과 관리자','req-i':'I-1~5 외부 인터페이스','req-s':'S-1~6 보안과 복원',
    'core-cap-npu':'수집과 추론','ui-shm-view':'영상 표시','ui-ipc-admin':'설정과 명령','core-safe-out':'판정과 출력·녹화',
    'vc-state':'상태 전환과 재연결','vc-six':'영상 이상 감시','vc-mount':'탑재·고정 모드',
    'vp-v4l2':'V4L2 직접 수집','vp-rga':'RGA 변환과 NPU 전달','vp-crop':'구역 확대와 좌표 역변환',
    'ls-renew':'safety: 20ms 갱신','ls-drive':'output: 10ms 구동','ls-expire':'200ms 임대 만료','ls-hook':'종료 후 출력 해제',
    'mp-attn':'1. 어텐션 연산 변환','mp-split6':'2. 박스·점수 분리','mp-decode':'3. C++ 후처리','mp-verify':'4. 해시·텐서 검증',
    'ui-top':'상태줄과 경보 배너','ui-color':'색상·선·문자 구분','ui-err':'확대 보기와 오류 안내',
    'adm-pin':'PIN 인증과 자동 잠금','adm-mag':'확대경과 꼭짓점 편집','adm-pre':'구역 프리셋과 필터',
    'od-out':'출력 매핑과 시험','od-diag':'자가진단과 기준 영상','od-evt':'이벤트와 경보 스냅샷',
    'sp-ipc':'명령: Unix 소켓','sp-shm':'영상: Seqlock SHM','sp-cfg':'설정: settings.json','sp-evt':'이력: JSONL·JPEG','sp-ref':'기준: view_ref.pgm','sp-rec':'녹화: MPEG-TS',
    'hw-gpio':'GPIO: IO1~3 확인','hw-alsa':'음향: ALSA 패턴음','hw-wdt':'워치독: GPIO 125','hw-can':'CAN: 상태 송수신 명세','hw-485':'RS485: 2단계 계획','hw-survey':'추가 확인: 핀·C형 SD',
    'bd-sim':'시뮬레이터 빌드·시험','bd-rel':'보드 빌드','bd-run':'설치 번들과 서명','bd-ver':'설치 후 상태 확인',
    'tp-unit':'1. C++ 단위시험','tp-ui':'2. PyQt5 화면 시험','tp-sim':'3. 시뮬레이터 통합','tp-board':'4. 실보드 시험','tp-field':'5. 현장 시험 목표','tp-ship':'6. 장비별 출하 점검',
    'bt-fail':'조건별 고장 복구','bt-touch':'5·7인치 터치 브리지','bt-occ':'가림과 다클래스 확인',
    'is-1':'빌드·롤백·디스크','is-2':'영상 수집·NPU·교착','is-3':'핫플러그·터치','is-4':'5인치 화면·linuxfb','is-5':'가림·즉시 경보·유지','is-6':'공유메모리·차량 모드',
    'mc-s1':'1단계: 다클래스·TTC','mc-s2':'2단계: 거리 센서','mc-gate':'追加 비용과 학습 조건'.replace('追加','추가'),
    'rm-1':'보드 확인·출하 준비','rm-2':'재학습·소프트웨어','rm-3':'초음파·포크 연동','rm-4':'레이더·통합 검증',
  };
  const details: Record<string,string> = {
    'hw-alsa':'plughw:0,0(es8388) 비동기 스레드\n경고 880Hz·위험 1200/880Hz',
    'is-5':'중앙 가림 판정(#16)·즉시 경보(#23)\n유지시간 1.0초로 조정(#27)',
    'cmp-ai':'640×384 INT8 · 다각형 구역\n논리 출력 5종을 IO1~6에 매핑',
    'req-z1':'경고·위험·제외 각 4개\n3~12점 다각형 · 즉시 반영',
    'req-f2':'UI 분리 · 출력 임대 200ms\n과열 85°C 경고·95°C 보호',
    'vc-state':'시작·감시·저하·고장 상태 구분\n1초 무프레임 감지 · 10초 재연결',
    'vc-six':'신호 상실·검정·정지·가림 감지\n방향 급변·흐려짐 확인',
    'vc-mount':'차량: 최근 3분 중앙값과 비교\n고정: 저장한 기준 영상과 비교',
    'vp-v4l2':'채널별 캡처 스레드·4버퍼 수집\n최신 프레임 교체로 복사 축소',
    'vp-rga':'크롭·축소·RGB 변환을 1회 처리\n파일 디스크립터로 NPU 전달',
    'vp-crop':'활성 구역 외접 범위 +15% 확대\n검출 좌표를 원본 0~1로 역변환',
    'ui-top':'정상 상태·채널 점·경보 배지 표시\n경보·채널 이상은 적색·황색 배너',
    'ui-color':'위험: 적색 실선과 한글 표기\n경고: 황색 점선과 한글 표기',
    'ui-err':'타일 터치 시 확대·30초 후 복귀\n오류 8종의 원인·조치를 한글 안내',
    'adm-pin':'16B 솔트·SHA-256 PIN 저장\n5회 실패 60초 잠금·무조작 복귀',
    'adm-mag':'꼭짓점 이동 시 2.5배 확대경 표시\n겹친 구역은 영역 칩으로 선택',
    'adm-pre':'초기화·기울기·좁은 통로 프리셋\n구역별 대상·접근 방향 필터',
    'od-out':'논리 출력 5종을 IO1~6에 매핑\n출력별 2초 시험·60초 자동 해제',
    'od-diag':'모델·온도·NPU·디스크 상태 확인\n고정 모드 기준 영상 다시 저장',
    'od-evt':'최근 200건을 종류별로 조회\n경보 JPEG 최대 500장 열람',
    'bd-ver':'aivectl로 ready·FPS 확인\n직전 버전 보존·구버전 정리',
    'cov-core':'C++17 코어가 감지·판정·출력·녹화 전담\nPyQt5 화면은 공유메모리·소켓으로 연결',
    'cov-model':'640×384 INT8 · COCO 사람 AP50 0.753\n현장 정확도는 별도 시험 필요',
    'cov-safe':'200ms 임대 · 3단계 워치독\n단일 .run 설치 · 60초 기동 확인·롤백',
    'sc-danger':'경광등·부저·교번음으로 위험 알림\n고신뢰 검출 지연 약 70ms는 추정값',
    'g1':'72시간 연속 운전·5초 복구 목표\n강제 종료 출력 해제: 기록값 0.16초',
    'g2':'목표: 주간 3~15m 재현율 ≥95%\n오경보 ≤1회/8h · 현장시험 필요',
    'req-a1':'경고·위험·공통·정상·고장 5종\nIO1~6과 출력 극성에 매핑',
    'req-d1':'4채널 추론 · 모델 SHA-256 확인\n요구 지연 ≤250ms · 실측 확정 필요',
    'core-cap-npu':'V4L2 수집 · RGA 1회 변환\nYOLO26s · NPU 3코어 분산',
    'core-safe-out':'20ms 판정 · 200ms 임대 갱신\nGPIO·스피커·CAN · 보호 녹화',
    'ui-shm-view':'Seqlock 공유메모리 영상 읽기\n320×180 타일 · 640×384 확대',
    'ui-ipc-admin':'core.sock에 설정 명령 21종 전송\n10Hz 상태 알림 수신',
    'ls-drive':'논리 출력 5종을 IO1~6에 매핑\n극성·공통 3초·음향·CAN 구동',
    'ls-renew':'4채널 구역·상태로 논리 출력 계산\n정상 판정마다 200ms 임대 갱신',
    'ls-expire':'갱신 중단 시 경보·READY OFF\n채널 고장 시 FAULT ON',
    'ls-hook':'ExecStopPost에서 출력 해제 실행\nkill -9 기록: 전체 GPIO OFF 0.16초',
    'mp-attn':'변환 불가 3D BMM 연산을 치환\n4D Conv·MatMul로 RKNN 호환',
    'mp-split6':'stride 8/16/32별 박스·점수 분리\n좌표와 확률의 양자화 범위 분리',
    'mp-decode':'INT8 텐서 6개 역양자화·NMS\n레터박스 역변환 후 0~1 좌표 산출',
    'mp-verify':'기동 시 모델 SHA-256 일치 확인\n640×384 입력·텐서·클래스 확인',
    'sp-shm':'640×384 원본 + 320×180 축소\n총 3.6MB · 홀짝 검증·3회 재시도',
    'sp-cfg':'.tmp 기록·fsync 후 원자적 rename\n손상 시 .bak 복구·구버전 변환',
    'sp-evt':'JSONL 10MB × 10개 순환\n경보 JPEG 최대 500장',
    'hw-485':'Modbus RTU 9600 8N1 명세\n초음파 센서 폴링은 2단계',
    'hw-survey':'IO4~6·외부 입력 단자 확인 필요\nHS-KR-C SD 경로·실보드 확인',
    'bt-fail':'kill -9: OFF 0.16초·복귀 3.1초\nSTOP 5.5초·재부팅 13.4초·패닉 24초',
    'bt-touch':'7인치 0705·5인치 0704 패킷 변환\nuinput 표준 터치 · 이중 입력 차단',
    'bt-occ':'손바닥 가림 후 약 1초 내 FAULT\n6클래스 모델 약 20fps/채널 기록',
    'mc-s1':'6클래스 검출 · 1/h 회귀 TTC\n경고 3.0초·위험 1.5초 설정',
    'mc-s2':'초음파 0.3~3.5m · 포크 스위치\nCAN 레이더 0.2~15m는 계획 범위',
    'mc-gate':'센서 추정 4.5~11만원 · 견적 미확정\n현장 영상 1,000장 확보 후 재학습',
    'rm-1':'IO4~6·입력·CAN·C형 SD 확인, 현장시험 후 장비별 출하 점검',
    'rm-2':'현장 영상 확보·모델 재학습, 과열 제어·WAV·USB 업데이트 검토',
    'rm-3':'RS485 초음파·포크 높이 스위치 연동, 장착·현장 검증',
    'rm-4':'CAN 레이더와 카메라 융합, 72시간 운전·통합 검증 후 승인',
  };
  const box = (x:number,y:number,w:number,h:number) => ({x,y,w,h});
  for (const [i,s] of story.entries()) {
    const v=s.visualPlan, b=s.compositionBrief;
    s.title=headings[i][0];
    v.readingGuide.message=headings[i][1];
    v.readingGuide.keyPhrase=headings[i][1];
    v.readingGuide.focusPhrases=[headings[i][1]];
    v.takeaway=headings[i][1];
    if(b.visual!=='timeline') b.nodeTreatment='document';
    b.title=box(.66,.65,12,.6);
    b.message=box(.64,1.4,12.05,.55);
    b.caption=box(.64,6.17,12.05,.47);
    b.typography={titleSize:32,messageSize:20,nodeTitleSize:18,bodySize:16,captionSize:12};
    // Preserve a restrained palette; weight, spacing and position carry hierarchy.
    v.nodes.forEach((n:any)=>{
      n.label=labels[n.id] || n.label;
      n.detail=details[n.id] || n.detail.replace(/•\s*/g,'');
    });
    if(v.chains) for(const c of v.chains) for(const key of ['cause','intervention','response','result']) c[key]=c[key].replace(/•\s*/g,'');
    if(b.visual==='annotated-screen') {
      b.visualBox=box(.64,2.02,12.05,4.02);
      b.screenLayout.frameBox=box(.64,2.02,7.12,3.23);
      b.screenLayout.statusBannerBox=box(.64,5.40,7.12,.58);
      v.nodes.forEach((n:any,j:number)=>b.screenLayout.sidePanelBoxes[n.id]=box(8.02,2.02+j*1.36,4.67,1.24));
      // These marks are interface examples, not object detections. Leave the
      // supplied capture intact instead of drawing invented orange boxes over it.
      v.scene.annotations=[];
      const image=v.interfaceExample?.image;
      if(image) { image.origin=image.path.includes('scene_')?'generated-concept':'user-provided'; }
      if(v.scene) v.scene.rights=v.scene.path.includes('scene_')?'generated':'user-provided';
      if(v.interfaceExample) {
        v.interfaceExample.decision.action = [
          '구현·보드 시험 기록과 추가 검증 과제를 구분해 수록',
          '', '', '구조 비교도 · 상세 명세는 해당 원문 문서 참조',
        ][i] || v.interfaceExample.decision.action.replaceAll('\n',' · ');
        // Keep a useful sentence in the banner without duplicating the page title.
        if(v.interfaceExample.decision.action.length>50) v.interfaceExample.decision.action='실제 화면과 기술 설명 · 시험 조건은 해당 원문 참조';
      }
    } else if(b.visual==='scene') {
      b.visualBox=box(.64,2.02,12.05,4.02);
      v.nodes.forEach((n:any,j:number)=>b.nodeBoxes[n.id]=box(8.02,2.02+j*1.36,4.67,1.24));
    } else if(b.visual==='graph') {
      b.visualBox=box(.64,2.02,12.05,4.02);
      const six=v.nodes.length===6;
      v.nodes.forEach((n:any,j:number)=>{
        const col=j%(six?3:2), row=Math.floor(j/(six?3:2));
        b.nodeBoxes[n.id]=box(.72+col*(six?4.08:6.15),2.30+row*1.98,six?3.69:5.58,1.7);
      });
      // Inventories and requirements have membership, not a serial control path.
      if(['s05','s07','s20','s21','s28'].some(prefix=>s.id.startsWith(prefix))) {
        v.edges.forEach((e:any)=>{e.directed=false; e.label='';});
        b.edgeLabelBoxes={};
        b.edgeRoutes={};
        for(const e of v.edges) {
          const a=b.nodeBoxes[e.from],z=b.nodeBoxes[e.to];
          const port=(n:any)=>[n.x+n.w/2,n.y<4?n.y+n.h:n.y];
          const ap=port(a),zp=port(z);
          b.edgeRoutes[`${e.from}:${e.to}`]={waypoints:[ap,[ap[0],4.14],[zp[0],4.14],zp]};
        }
        s.visualPurpose='제품 공통 경계에 속한 기능·인터페이스를 공통 버스로 묶는 소속 구조도';
        v.encoding='제품 소속을 나타내는 방향 없는 공통 버스와 기능별 명세';
      } else {
        v.edges.forEach((e:any)=>{
          const from=b.nodeBoxes[e.from],to=b.nodeBoxes[e.to];
          const key=`${e.from}:${e.to}`;
          if(Math.abs(from.y-to.y)<.01) b.edgeLabelBoxes[key]=box(from.x+from.w-.98,from.y-.27,2.35,.23);
          else b.edgeLabelBoxes[key]=box(from.x+from.w/2+.1,from.y+from.h+.04,1.66,.20);
        });
      }
    } else if(b.visual==='causal-chain') {
      b.visualBox=box(.64,2.02,12.05,4.02);
      for(const [row,c] of v.chains.entries()) ['cause','intervention','response','result'].forEach((k,col)=>b.nodeBoxes[`${c.id}:${k}`]=box(.72+col*3.04,2.06+row*2.00,2.8,1.88));
    } else if(b.visual==='chart') {
      b.visualBox=box(4.12,2.02,8.57,4.02);
      b.chartFocus.noteBox=box(.64,2.02,3.2,4.02);
    } else if(b.visual==='timeline') {
      b.visualBox=box(.64,2.02,12.05,4.02);
    }
  }
  // Never promote goals, estimates or mixed verification states to achievements.
  const perf=project.quantitativeDatasets.find((d:any)=>d.id==='board-latency-fps');
  perf.title='기존·Pro 경보 지연 구간별 계산 비교'; perf.unit='ms';
  perf.population='문서 10 §2.4 구간별 지연 계산 · 즉시/2회 확인 설정 구분';
  perf.limitation='계산값이며 종단 실측 아님 · 문서 07 A-3: 240fps 촬영 20회로 확정 필요';
  perf.rows=[
    {category:'평균',series:'기존 AiVE (추정)',value:150}, {category:'최대',series:'기존 AiVE (추정)',value:300},
    {category:'평균',series:'Pro 즉시 경보 (추정)',value:70}, {category:'최대',series:'Pro 즉시 경보 (추정)',value:140},
    {category:'평균',series:'Pro 2회 확인 (추정)',value:120}, {category:'최대',series:'Pro 2회 확인 (추정)',value:190},
  ];
  const s25=story[24];
  s25.compositionBrief.chartFocus.series='Pro 즉시 경보 (추정)';
  s25.visualPlan.nodes=[{id:'bp-fps',label:'보드 기록: 약 80fps',detail:'4채널 합계 약 80fps\n추론 1회 약 27ms',icon:'camera'},{id:'bp-lat',label:'계산: 약 70ms',detail:'即시 경보 평균 추정\n종단 실측은 별도 필요'.replace('即','즉'),icon:'clock'}];
  s25.answer='HS-KR-A 보드 문서에는 4채널 합계 약 80fps와 추론 약 27ms가 기록되어 있다. 경보 지연은 즉시 검출 평균 약 70ms·최대 약 140ms의 구간별 계산값이며 종단 실측은 별도 필요하다.';
  const setClaim=(id:string,text:string)=>{const c=project.claims.find((c:any)=>c.id===id);if(c)c.text=text;};
  setClaim('C-BOARD-PERF',s25.answer);
  setClaim('C-ISSUES-33','문서 14는 보드 설치·시험에서 생긴 문제 #1~33의 원인·조치·재발 방지를 기록한다. 자동 회귀시험 반영과 운영 절차·하드웨어 조치를 구분하며 모든 항목의 자동 시험화를 뜻하지 않는다.');
  const source10=project.sources.find((s:any)=>s.id==='S-DOC10');
  source10.excerpt='기존 구조와 Pro의 변경, 결함별 조치·검증 상태를 추적한다. 경보 지연은 즉시 검출 평균 약 70ms·최대 약 140ms의 구간별 계산값이며 A-3 종단 실측이 남아 있다.';
  source10.title='10 기존 소스 대비 변경 내역 — 구조 개선과 결함별 조치·검증 상태';
  s25.visualPlan.explanation.notProven='경보 지연은 구간별 계산값이다. 240fps 촬영 20회로 종단 지연을 실측해 확정해야 한다.';
  s25.compositionBrief.chartFocus.reason='지연 계산을 기존·즉시 경보·2회 확인 설정별로 같은 ms 단위에서 비교';
  const legends: Record<number,string> = {
    3:'문서 01·10 · 구조 개선과 고장 주입 기록 대조 · 현장 검출 성능은 별도 확인',
    6:'문서 01 §4.1~4.3 · 요구사항·구현 명세 · 출력 배선과 종단 경보 지연은 추가 실측 필요',
    7:'문서 01 §4.4~4.8 · 고장·기록·운영 명세 · RS485·읽기 전용 루트FS는 2단계',
    8:'문서 02 §1~2 · 코어와 화면의 프로세스 경계 · 화면은 장치 직접 접근 없이 IPC 사용',
    9:'문서 02·09 · 강제 종료·STOP·패닉의 조건별 기록 · 모든 고장에 동일 복구 시간을 보장하지 않음',
    12:'문서 02 §4·문서 10 §2.4 · 구역 판정·경보 유지 설계 · 지연은 구간별 계산값',
    20:'문서 04 §2~4 · 명령·영상·파일 형식 · 원자적 저장과 백업 복원 절차',
    24:'문서 07·09·14 · 자동 시험과 보드 기록을 대조 · 현장시험과 장비별 출하 검증은 별도',
    25:'문서 09·문서 10 §2.3~2.4 · 처리량은 보드 기록, 경보 지연은 계산값',
    28:'문서 14 #1~33 · 원인·조치·재발 방지 기록 · 하드웨어 교체와 소프트웨어 수정을 구분',
  };
  for (const [page,legend] of Object.entries(legends)) story[Number(page)-1].visualPlan.legend=legend;
  story[2].visualPlan.chains[1].response='구역 확대·좌표 역변환\n발 위치 기반 진입 판정\n고신뢰 경보는 즉시 처리';
  story[8].visualPlan.chains[1].result='STOP 복귀 기록 5.5초\n패닉 재부팅 기록 24초\n조건별 복구 결과 대조';
  story[11].visualPlan.chains[0].result='스침 오경보 억제 설계\n발 위치로 구역 진입 판정\n현장 조건별 시험 필요';
  story[11].visualPlan.chains[1].cause='프레임 확인에 따른 지연\n경계선 반복 진입·해제\n릴레이 채터링 우려';
  story[11].visualPlan.chains[1].result='즉시 경보 평균 약 70ms\n최대 약 140ms 계산값\n유지시간으로 떨림 억제';
  story[22].visualPlan.chains[0].result='미준비 시 이전 버전 복원\n복원 후 READY 확인\n현장 상태 직접 점검';
  story[0].limitation='2026-10-31 기준 문서·보드 시험 기록 · C형 보드·현장시험·추가 센서 범위는 별도 확인';
  setClaim('C-LEGACY-BUGS','문서 10은 기존 결함의 조치와 상태를 단위시험·보드 확인·추가 시험으로 나누어 기록한다. 일부 현장·실화면·배선·서명 검증이 남아 있어 전 항목 실보드 검증 완료를 뜻하지 않는다.');
  const s27=story[26];
  s27.answer='기존 결함에 대한 조치는 문서 10에 구현·단위시험·보드 확인·추가 시험으로 구분되어 있다. 조치 완료와 실제 장비별 검증 완료는 별도 관리한다.';
  s27.visualPlan.legend='문서 10 §5·§8 · 단위시험·보드 확인·미결 시험을 구분 · 전 항목 실보드 검증 완료를 뜻하지 않음';
  s27.visualPlan.chains[0].cause='추론 예외·출력 고착\n감시 중단·접근권한 문제';
  s27.visualPlan.chains[0].intervention='코어 분리·출력 임대\n서비스 계정·접근 제한';
  s27.visualPlan.chains[0].response='단위시험으로 동작 확인\n보드 고장 주입 기록 대조';
  s27.visualPlan.chains[0].result='상태별 근거를 구분\n배선·실화면 추가 확인';
  s27.visualPlan.chains[1].cause='화면 종속 판정·설정 손상\n카메라 순서·서명 문제';
  s27.visualPlan.chains[1].intervention='전용 판정·원자적 저장\n채널 순서·해시 검증';
  s27.visualPlan.chains[1].response='구현·시험 결과 추적\n문서 07·09와 연결';
  s27.visualPlan.chains[1].result='현장·C형·서명 등\n남은 검증 후 출하 판단';
  story[29].answer='개발·보드 시험 기록을 기준으로 IO4~6·입력·CAN·C형 보드·현장시험과 장비별 출하 점검을 먼저 확인한다. 2단계 센서 확장은 14주 계획이며 착수·범위는 의뢰사 확인이 필요하다.';
  project.planning.decision.success='장비별 출하 점검과 현장 성능·고장 복구 시험의 조건 및 결과를 기록하고 승인한다. 일반적인 5초 이내 복구를 모든 고장에 대해 보장하지 않는다.';
  project.design.titleSize=32;
  project.design.name='AiVE Pro Technical Document / Editorial v2';
  project.design.colors.paper='F7F9FA';
  project.designDirection.concept='제품·요구사항, 감시·안전 구조, 모델·화면, 인터페이스·배포, 시험·출하 순서로 읽는 30쪽 개발 통합문서';
  project.designDirection.visualThesis='짧은 제목과 한 줄 핵심 설명, 확대 화면·편집 가능한 기술 도식·단위가 일치하는 차트로 구성';
  // Replace the two tiny raster diagrams with native evidence structures.
  const contrast=story[3], cv=contrast.visualPlan, cb=contrast.compositionBrief;
  cb.visual='comparison'; cb.visualBox=box(.64,2.02,12.05,4.02);
  delete cb.screenLayout; delete cb.nodeTreatment;
  cv.kind='comparison'; delete cv.interfaceExample; delete cv.scene;
  cv.nodes=[{id:'compare-legacy',label:'기존 AiVE',detail:'단일 프로세스·고정 출력·수동 설치',icon:'server'},
    {id:'compare-pro',label:'AiVE Pro 2.0',detail:'코어 분리·출력 임대·자동 설치·복구',icon:'shield'}];
  cv.edges=[];
  cv.explanation.requiredMarks=['comparison'];
  cv.explanation.howToRead='행마다 같은 기준으로 기존 AiVE와 Pro의 구현 차이를 좌우 대조한다.';
  contrast.visualPurpose='동일한 여덟 기준의 편집 가능한 표로 기존과 Pro를 대조';
  cb.rationale=contrast.visualPurpose;
  cv.encoding='구조·안전·모델·구역·출력·화면·보안·배포의 동일 기준 비교';
  cv.comparisonTable={columns:['기존 AiVE','AiVE Pro 2.0'],rows:[
    {criterion:'실행 구조',values:['Python 단일 프로세스','C++ 감시 코어와 PyQt5 화면 분리']},
    {criterion:'고장 대응',values:['예외 시 무경보 정지·워치독 부재','200ms 출력 임대·3단계 워치독']},
    {criterion:'검출 모델',values:['YOLO11n · 416×234','YOLO26s · 640×384 · 해시 검증']},
    {criterion:'구역 판정',values:['단일 사각형·박스 접촉','다각형·제외 영역·N-of-M 확인']},
    {criterion:'출력 제어',values:['IO1~3 고정 용도','논리 출력 5종을 IO1~6에 매핑']},
    {criterion:'운영 화면',values:['설정 보호·오류 안내 부족','PIN·터치 편집·진단·이벤트']},
    {criterion:'접근 보안',values:['root SSH·공통 비밀번호','전용 계정·SSH 제한·서명 절차']},
    {criterion:'설치·복구',values:['수동 파일 복사','단일 .run 설치·자동 롤백']},
  ]};
  const pipe=story[10], pv=pipe.visualPlan, pb=pipe.compositionBrief;
  pb.visual='graph'; delete pb.screenLayout;
  pv.kind='flow'; delete pv.interfaceExample; delete pv.scene;
  pv.explanation.requiredMarks=['connectors'];
  pv.explanation.howToRead='왼쪽 위 수집에서 오른쪽 위 범위 선택, 오른쪽 아래 RGA 변환을 거쳐 왼쪽 아래 추론·좌표 복원으로 읽는다.';
  pipe.visualPurpose='영상 수집·범위 선택·변환·추론을 편집 가능한 처리 순서로 설명';
  pb.rationale=pipe.visualPurpose;
  pv.nodes=[
    {id:'vp-v4l2',label:'1. V4L2 직접 수집',detail:'채널별 캡처 스레드·4버퍼 비블로킹 수집\n최신 프레임으로 교체해 대기·복사를 축소',icon:'camera'},
    {id:'vp-crop',label:'2. 구역 범위 선택',detail:'활성 구역 외접 사각형에 15% 여백 추가\n전체 화면 85% 이상이면 전체 영상 사용',icon:'route'},
    {id:'vp-npu',label:'4. NPU 추론과 좌표 복원',detail:'RKNN 무복사 전달·YOLO26s 추론\n검출 박스를 원본 정규화 좌표 0~1로 복원',icon:'server'},
    {id:'vp-rga',label:'3. RGA 1회 변환',detail:'크롭·640×384 축소·레터박스·RGB 변환\n구역 확대 정도에 따라 대상의 유효 픽셀 증가',icon:'clipboard'},
  ];
  const cap=(from:string,to:string,label:string)=>({from,to,label});
  pv.edges=[cap('vp-v4l2','vp-crop','최신 프레임'),cap('vp-crop','vp-rga','선택 범위'),cap('vp-rga','vp-npu','DMA-BUF 전달')];
  pb.nodeBoxes={};pv.nodes.forEach((n:any,j:number)=>pb.nodeBoxes[n.id]=box(.72+(j%2)*6.15,2.30+Math.floor(j/2)*1.98,5.58,1.7));
  pb.edgeLabelBoxes={
    'vp-v4l2:vp-crop':box(5.32,2.03,2.35,.23),
    'vp-crop:vp-rga':box(9.76,4.04,1.66,.20),
    'vp-rga:vp-npu':box(5.32,4.01,2.35,.23),
  };
  pv.legend='문서 02 §6·문서 10 §2.2~2.3 · 범위 선택·변환·추론과 좌표 복원의 순서';
  pv.encoding='수집·구역 선택·RGA 변환·NPU 추론의 시계방향 경로';
  const model=story[14];
  model.visualPlan.nodes[2].label='4. C++ 후처리';
  model.visualPlan.nodes[3].label='3. 해시·텐서 검증';
  model.visualPlan.edges=[cap('mp-attn','mp-split6','ONNX 내보내기'),cap('mp-split6','mp-verify','RKNN INT8 변환'),cap('mp-verify','mp-decode','런타임 디코딩')];
  delete model.compositionBrief.edgeLabelBoxes['mp-decode:mp-verify'];
  model.compositionBrief.edgeLabelBoxes['mp-verify:mp-decode']=box(5.32,4.01,2.35,.23);
  story[6].visualPlan.nodes.find((n:any)=>n.id==='req-f2').label='F-4~9 고장·열관리';
  story[6].visualPlan.nodes.find((n:any)=>n.id==='req-i').label='I-1~5 외부 연동';
  const intervention=project.planning.interventions.find((i:any)=>i.id==='i-model-zone');
  intervention.deliverable='YOLO26s .rknn/.rknn.json, 4채널 약 80fps 보드 기록 및 경보 종단 지연 실측 과제';
  story[28].visualPlan.interfaceExample.decision.action='센서 융합 적용 개념도 · 2단계 센서 구성은 계획';
}
