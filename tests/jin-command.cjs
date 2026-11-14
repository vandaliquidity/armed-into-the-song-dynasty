const {chromium}=require('playwright'),fs=require('node:fs');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(url,{waitUntil:'networkidle'});
const checks=await p.evaluate(()=>{const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();CG.supplyAuto=false;
 const date=(y,m)=>{CG.turn=(y-historyStartYear())*4+Math.floor((m-1)/3)+1;CG.month=(m-1)%3+1;};
 const leader=journeyLeader(),initial=armyN(leader);ok(fieldState().awards.qinghe&&initial>=450&&armyDuCap(leader)>=7,'first campaign victory grants a real 200-man regular formation and larger field command');
 const cap=armyDuCap(leader),gear=JSON.stringify(CG.T[HOME].eq);CAMP.done.push(1);fieldAwards();const commission=shipsOn().find(s=>s.commission==='qinzhou');
 ok(commission&&armyN(leader)===initial&&armyDuCap(leader)===cap+5,'Qinzhou victory expands command and dispatches 500 regulars as an actual formation convoy');
 shipDeliver(commission,[]);ok(armyN(leader)===initial+500&&JSON.stringify(CG.T[HOME].eq)===gear,'arriving formation joins Lin Feng without duplicating its carried equipment in the stores');
 shipDeliver(commission,[]);fieldAwards();ok(armyN(leader)===initial+500&&JSON.stringify(CG.T[HOME].eq)===gear,'formation reward and delivery are idempotent');
 CAMP.done.push(2);fieldAwards();const west=shipsOn().find(s=>s.commission==='western');shipDeliver(west,[]);ok(armyN(leader)===initial+1500&&fieldState().bonus===17,'Qinghe story victory grants a 1000-man formation and ten more command companies');
 date(1123,1);ok(!fieldAward('imperial'),'imperial relief command does not unlock before its campaign date');date(1124,1);ok(fieldAward('imperial'),'mission campaign unlocks the imperial relief command in 1124');const imperial=shipsOn().find(s=>s.commission==='imperial');shipDeliver(imperial,[]);ok(armyN(leader)===initial+3000&&fieldState().bonus===32,'Lin Feng can command several thousand field troops through mission-earned commissions');
 __sw.cstart();CG.supplyAuto=false;date(1125,10);jinState().last=historyAbsoluteMonth();date(1125,11);jinTick();
 ok(jinState().armies.length===2&&jinState().armies.some(a=>a.state==='taiyuan-siege'),'1125 invasion creates distinct eastern and western Jin columns on the map');
 ok(CG.T.xiangzhou.own==='jin'&&CG.T.taiyuan.own==='song','eastern Jin advance captures towns while Taiyuan holds the western approach');
 const snapshot=JSON.stringify(jinState());jinDraw(ctx);ok(JSON.stringify(jinState())===snapshot,'drawing Jin armies cannot resolve battles or alter their progress');
 date(1125,12);jinTick();date(1126,1);jinTick();ok(jinState().armies.some(a=>a.phase===1&&a.at==='kaifeng'&&a.state==='capital-siege'),'first eastern column physically reaches and besieges Kaifeng');
 date(1126,2);jinTick();ok(jinState().armies.some(a=>a.phase===1&&a.state==='retreat'),'first Kaifeng siege is lifted and the eastern Jin visibly retreat');
 // A player army can fight the western column in the real tactical engine.
 const col=jinState().armies.find(a=>a.state==='taiyuan-siege');journeyLeader().loc='taiyuan';CG.phase=0;
 ok(jinEngage(col.id,journeyLeader().id)&&MODE==='battle'&&B.skirm.enemyFaction==='jin','field army can launch an actual interception against a nearby Jin column');
 B.paused=true;runWave(B.waves[0]);B.wave=0;ok(B.units.some(u=>u.team===1&&u.name?.[1]?.includes('Jin')),'interception identifies Jin troops rather than Xia troops');
 const r=resolveBattle(SK_SNAP.q,true,{frac:()=>0,kills:10,mounted:1,t:180,mkills:{}});ok(col.defeated&&col.state==='retreat'&&r.capturedEquipment,'tactical victory routes the actual strategic Jin column and recovers equipment');B=null;showCamp();
 // No relief: second invasion wins an actual strategic siege and occupies Kaifeng.
 __sw.cstart();CG.supplyAuto=false;date(1125,10);jinState().last=historyAbsoluteMonth();for(let i=0;i<15;i++){const absolute=1125*12+10+i;date(Math.floor(absolute/12),absolute%12+1);jinTick();}
 ok(jinState().second&&jinState().armies.filter(a=>a.phase===2).length===2,'1126 brings a second two-column invasion');
 ok(jinState().outcome==='fallen'&&CG.T.kaifeng.own==='jin','insufficient defence causes the visible siege to capture Kaifeng in early 1127');
 ok(evDef({fall:1,t:HOME}).k!=='averted','event report follows the map defeat instead of overriding it with text');
 const player=journeyLeader();CG.T.henan.own='song';player.loc='henan';campRefresh();CG.phase=2;ok(orderMarch(player,'kaifeng'),'army may order an attack on Jin-occupied Kaifeng');beginBattlePhase();ok(CG.queue.some(q=>q.type==='atk'&&q.terr==='kaifeng')&&player.loc==='henan','Jin territory is hostile and cannot be entered as an unopposed friendly move');
 // Prepared relief has real military weight and changes the siege outcome.
 __sw.cstart();CG.supplyAuto=false;historyAid().troops=500;historyAid().crossbows=300;historyAid().grain=1000;CG.ready=70;CG.T.kaifeng.songGarrison.men+=500;
 date(1125,10);jinState().last=historyAbsoluteMonth();for(let i=0;i<15;i++){const absolute=1125*12+10+i;date(Math.floor(absolute/12),absolute%12+1);jinTick();}
 ok(jinState().outcome==='averted'&&CG.T.kaifeng.own==='song','real relief troops and stores enable Song defenders to repel the second siege');
 ok(jinState().armies.some(a=>a.phase===2&&a.state==='retreat')&&evDef({fall:1,t:HOME}).k==='averted','Jingkang victory is reflected by retreating map armies and the historical report');
 saveGame();const state=JSON.stringify(CG.jin);CAMP=loadGame();campLoad();ok(JSON.stringify(CG.jin)===state,'Jin columns, ownership and siege outcome persist in saves');missionsUI();return out;});
fs.mkdirSync('test-results',{recursive:true});await p.screenshot({path:'test-results/jin-campaign-board.png'});await p.evaluate(()=>{document.querySelector('#cMissions')?.remove();focusOn('kaifeng',1.1);});await p.waitForTimeout(1200);await p.screenshot({path:'test-results/jin-siege-map.png'});console.log(JSON.stringify({checks,errors},null,2));if(errors.length)throw Error('Browser errors');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
