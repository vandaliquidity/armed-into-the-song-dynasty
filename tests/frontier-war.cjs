const {chromium}=require('playwright'),fs=require('node:fs');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(url,{waitUntil:'networkidle'});
const result=await p.evaluate(()=>{const checks=[],ok=(v,m)=>{if(!v)throw Error(m);checks.push(m);};coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();CG.supplyAuto=false;const w=frontierWar(),player=JSON.stringify(CG.U),home=CG.T[HOME].own;
 const edges=CL.links.filter(([a,b])=>warFaction(a)&&warFaction(b)&&warFaction(a)!==warFaction(b));ok(edges.length>0,'campaign geography has a real Song–Xia frontier');
 const edge=edges[0],from=warFaction(edge[0])==='song'?edge[0]:edge[1],to=from===edge[0]?edge[1]:edge[0];
 const n=warMen(from);const a=warDispatch('song',from,to,Math.min(100,n));ok(a&&warMen(from)===n-a.men,'marching soldiers are deducted from the actual source garrison');
 const destination=warMen(to),snapshot=JSON.stringify(w);warDraw(ctx);ok(JSON.stringify(w)===snapshot&&warMen(to)===destination,'drawing marching armies never advances battles or changes troop counts');
 CG.month=2;warTick();ok(a.state==='fight'&&a.at===to,'an attacking column physically reaches the enemy settlement before fighting');
 const last=w.last,armyState=JSON.stringify(w.armies);warTick();ok(w.last===last&&JSON.stringify(w.armies)===armyState,'war simulation settles only once per campaign month');
 // Force a clear numerical advantage to verify real ownership change and player safety.
 a.men=1000;warSetMen(to,20);CG.month=3;warTick();ok(CG.T[to].own==='song'&&CG.T[to].songGarrison.men>0,'a winning Song attack captures the settlement and installs surviving troops');
 ok(w.reports.some(r=>r.at===to&&r.en.includes('captured')),'battle results are recorded as visible frontier dispatches');
 ok(JSON.stringify(CG.U)===player&&CG.T[HOME].own===home,'NPC war does not consume player troops or auto-capture player territory');
 saveGame();const saved=JSON.stringify(w.armies);CAMP=loadGame();campLoad();ok(JSON.stringify(frontierWar().armies)===saved,'NPC columns and their march progress survive save/load');
 // Both independent factions must continue to move on the unmodified world.
 B=null;__sw.cstart();CG.supplyAuto=false;frontierWar();CG.month=2;warTick();const initial=frontierWar().armies;
 ok(initial.some(a=>a.fac==='song')&&initial.some(a=>a.fac==='xia'),'both Song and Xia issue autonomous marching orders');
 const first=initial[0],position=shipProg;first.anim=0;const at0=JSON.stringify({x:pathAt(first.path,0).x,y:pathAt(first.path,0).y});campFrame(1);
 ok(first.anim>0,'army movement animates using elapsed frame time');
 let max=initial.length;for(let i=0;i<48;i++){CG.month=(CG.month||1)+1;if(CG.month>3){CG.month=1;CG.turn++;}warTick();max=Math.max(max,frontierWar().armies.length);}
 ok(frontierWar().reports.length>0,'independent armies actually fight over time');
 ok(max<=20&&frontierWar().reports.length<=24,'long-running frontier activity keeps bounded armies and report history');
 ok(Object.values(CG.T).every(s=>(s.str||0)>=0&&(s.songGarrison?.men||0)>=0),'army recruitment, casualties and reinforcements never create negative garrisons');
 const before=JSON.stringify(CG.U);const controlled=Object.keys(CG.T).filter(owned);ok(controlled.length===1&&controlled[0]===HOME&&before===JSON.stringify(CG.U),'independent war leaves player settlement ownership unchanged');
 // Isolated settlement tests verify the economy cannot manufacture soldiers.
 const site=Object.keys(CG.T).find(id=>warFaction(id)==='song'),ss=CG.T[site];
 warSetMen(site,0);ss.pop=500;ss.bld.farm=0;ss.bld.smithy=0;ss.bld.market=0;
 for(const k of Object.keys(ss.st))ss.st[k]=0;ss.eq.spear=0;ss.npcEconomy.pending=0;
 CG.month++;npcEconomyTick();ok(warMen(site)===0&&ss.npcEconomy.pending===0,'empty stores and idle workshops cannot create soldiers');
 Object.assign(ss.st,{grain:200,silver:100,ore:100,timber:100});ss.bld.farm=1;ss.bld.smithy=1;
 const civilians=ss.pop;CG.month++;npcEconomyTick();const trainees=ss.npcEconomy.pending;
 ok(trainees>0&&warMen(site)===0&&ss.pop===civilians-trainees,'recruits consume civilian population and wait a month before joining');
 CG.month++;npcEconomyTick();ok(warMen(site)===trainees,'only completed recruits join the garrison');
 const enemy=Object.keys(CG.T).find(id=>warFaction(id)==='xia');warSetMen(enemy,200);
 ok(!npcRaid(enemy,site)&&warMen(enemy)===200,'Xia cannot launch a raid against a non-adjacent settlement');
 ok(!warDispatch('xia',site,enemy,10),'a hostile or unoccupied origin cannot dispatch an army');
 const source=(CADJ[HOME]||[]).find(id=>warFaction(id)==='xia');
 if(source){warSetMen(source,200);const raid=npcRaid(source,HOME);ok(raid&&raid.str===90&&warMen(source)===110,'a player-bound raid pays for every attacking soldier');CG.T[source].own='free';const count=CG.xa.length;ok(!npcRaid(source,HOME)&&CG.xa.length===count,'losing the source settlement prevents new raids');}
 const ownSnapshot=Object.fromEntries(Object.entries(CG.T).map(([id,s])=>[id,s.own]));
 for(const s of Object.values(CG.T))if(s.own==='xia')s.own='free';
 const cart={kind:'buy',path:[HOME,HOME],eta:1,left:1,goods:{grain:100}};
 ok(shipRaid(cart,[])===false&&!cart.state,'convoy raiders cannot appear without a nearby occupied Xia settlement');
 for(const [id,own] of Object.entries(ownSnapshot))CG.T[id].own=own;
 missionsUI();return{checks,borderEdges:edges.length,maxColumns:max,reports:frontierWar().reports.length};});
fs.mkdirSync('test-results',{recursive:true});await p.screenshot({path:'test-results/frontier-war-board.png'});await p.evaluate(()=>{document.querySelector('#cMissions')?.remove();const a=frontierWar().armies[0];if(a)focusOn(a.at,1.1);});await p.waitForTimeout(1500);await p.screenshot({path:'test-results/frontier-war-map.png'});console.log(JSON.stringify({...result,errors},null,2));if(errors.length)throw Error('Browser errors');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
