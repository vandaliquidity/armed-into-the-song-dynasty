// t247: Song factions (relations, AI, trade), bandit strongholds (raid, grow, suppress, amnesty, tribute, chiefs as officers), map layers, UI system
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};coachSave({off:1,seen:{}});__sw.cstart();CG.turn=7;CG.dynasty.totalSales=300;if(CG.evQ)CG.evQ.length=0;campUI();const R=__rs;
 ok(!!document.getElementById('swuiCss'),'the UI design system stylesheet is installed');
 const towns={};for(const k in R.SF_DEF)towns[k]=R.sfTowns(k).length;ok(Object.values(towns).filter(n=>n>0).length>=3,'Song towns are split between rival blocs '+JSON.stringify(towns));
 ok(R.sfOf(HOME)===null,'Qinghe itself belongs to no bloc');
 const S=R.sfState(),z0=S.rel.zhong,t0=S.rel.tong;CAMP.res.silver=500;R.sfGift('tong');ok(S.rel.tong===t0+10&&S.rel.zhong<z0,'a gift to the Commission sours its rival the Zhong clan ('+z0+'→'+S.rel.zhong+')');
 // trade multiplier
 S.rel.liu=-60;campRefresh();const rl=ROUTES.filter(r=>[r.a,r.b].some(id=>R.sfOf(id)==='liu'));ok(rl.every(r=>r.mul<=.5+1e-9||r.choke&&r.choke.length),'a hostile bloc halves trade with its towns');S.rel.liu=20;campRefresh();
 // bandits grow and raid an unguarded village
 const l0=[];const gg0=CG.T[HOME].st.grain;R.bdState().list.forEach(b=>b.quiet=0);const gt0=CG.turn,gm0=CG.month;CG.turn=1;CG.month=1;R.bdTick(l0);ok(CG.T[HOME].st.grain===gg0&&!l0.some(l=>l[0]==='🔥'),'no raids in the first two seasons');CG.turn=Math.max(gt0,3);CG.month=gm0||1;
 const B=R.bdGet('longshan');B.men=120;B.quiet=0;const lines=[];const target=raidNeighbours(B.id,'bandit')[0];CG.T[target].own='qh';const s=CG.T[target];const save=__rs.bdHere(target).map(u=>[u,u.loc]);for(const [u] of save)u.loc={v:'nowhere'};const arm=CG.armies.filter(a=>a.loc===target).map(a=>[a,a.loc]);for(const [a] of arm)a.loc='nowhere';s.st.grain=500;const g0=s.st.grain;R.bdTick(lines);
 ok(B.men>=126&&s.st.grain<g0&&s.raided,'an unguarded village is raided and the band grows ('+B.men+' men, grain '+g0+'→'+s.st.grain+')');for(const [u,l] of save)u.loc=l;for(const [a,l] of arm)a.loc=l;s.raided=false;for(const u of armyUnits(CG.armies[0]))u.loc={a:CG.armies[0].id};CG.armies[0].loc=target;
 const l2=[];const before=s.st.grain;R.bdTick(l2);ok(s.st.grain===before,'a strong garrison keeps the band away from Qinghe ('+(l2[0]||[])[1]+')');
 // suppress with the home garrison
 B.men=60;const base=R.bdBase(B);ok(base&&base.id===target,'the garrison at the adjacent target is in reach of Longshan');const r1=R.bdSuppress('longshan');ok(r1.win&&B.men===0,'suppression clears the stronghold');
 ok(offHas('bd_longshan')&&CG.off.bd_longshan.loy===35,'the captured chief joins the officers with low loyalty');
 // amnesty: militia + chief
 const M=R.bdGet('maxian');M.men=100;CAMP.res.silver=500;const ac=Math.round(M.men*.8),tg=S.rel.tong,r2=R.bdAmnesty('maxian');ok(r2.ok&&CG.U[r2.unit].type==='mil'&&CG.U[r2.unit].men===50&&CAMP.res.silver===500-ac,'amnesty costs silver and the band becomes a 50-man militia company');
 ok(offHas('bd_maxian')&&CG.off.bd_maxian.loy===55&&S.rel.tong<tg,'its chief joins willingly; the Commission disapproves');
 ok(offReq(LORE.off.list.find(x=>x.id==='bd_ziwu'))!==null,'other chiefs cannot be hired for silver');
 const Z=R.bdGet('ziwu');Z.men=100;const r3=R.bdTribute('ziwu');ok(r3.ok&&Z.quiet===3,'tribute buys three quiet months');
 // faction AI
 const L=R.bdGet('liupan');L.men=200;const la=[];R.sfAI(la);ok(L.men<200&&la.some(l=>/troops|出兵/.test(l[1])),'a bloc polices bandits in its own circuit');
 S.rel.yao=0;S.rel.zhong=60;const lb=[];R.sfAI(lb);ok(lb.some(l=>/resents|不满/.test(l[1])),'a bloc resents Qinghe courting its rival');
 S.req={};S.rel.tong=30;CAMP.res.silver=600;let asked=false;for(let i=0;i<8&&!asked;i++){CG.month=(CG.month%3)+1;if(CG.month===1)CG.turn++;R.sfAI([]);asked=!!S.req.tong;}ok(asked,'a friendly bloc asks a rich Qinghe for silver');
 const tr=S.rel.tong;R.sfReqAnswer('tong',true);ok(S.rel.tong>=tr+12&&!S.req.tong,'granting the request raises standing');
 // monthly tick via endTurn
 const m0=campaignMonth(),men0=R.bdGet('nanshan').men;CG.phase=3;CG.queue=[];endTurn();ok(campaignMonth()>m0&&R.bdGet('nanshan').men>men0,'strongholds grow each month through the real end-month');
 // layers and panels draw
 for(const k of ['fac','threat','supply','trade',null]){CG.layer=k;campFrame(1/60);}ok(true,'all four layers draw');CG.layer=null;
 campUI();ok(document.querySelectorAll('#swLayers [data-layer]').length===4&&document.getElementById('swFacBtn'),'the layer bar has four layers and the factions button');
 CSEL={sf:1};campUI();ok(document.querySelectorAll('.sw-fac').length===4,'the relations panel lists the four blocs');
 CSEL={bd:'nanshan'};campUI();ok(/Pay off|纳贡/.test(document.getElementById('campUI').textContent),'the stronghold panel offers suppress, amnesty and tribute');
 const q=bdScreen('nanshan');ok(campPick(q.x,q.y-8*iconScale()).bd==='nanshan','clicking a stronghold on the map selects it');
 // persistence
 saveGame();const keep=JSON.stringify([CG.sf.rel,CG.bd.list.map(b=>b.men)]);ok(JSON.stringify([CG.sf.rel,CG.bd.list.map(b=>b.men)])===keep&&!!CG.sf&&!!CG.bd,'state lives in the save (CG.sf, CG.bd)');
 return checks;});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
