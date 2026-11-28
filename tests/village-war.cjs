// t264: the war comes home (village-war.js) and the playtest fixes (t264-fixes.js).
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);},W=ms=>new Promise(r=>setTimeout(r,ms));coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');
 __sw.cstart();if(CG.evQ)CG.evQ.length=0;CAMP.res.silver=5000;const s=CG.T[HOME],v=__vw.state();
 ok(v&&v.autoCare===1&&Array.isArray(v.fallen),'a fresh campaign gets the village-war state with automatic care on');
 ok(buildSlots(HOME)===2,'two build slots at once');
 ok(BLD.clinic.en==='Hospital','the legacy Clinic is the Hospital');CAMP.bld.clinic=1;s.bld.hosp=0;__t264fix.hospSync();ok(s.bld.hosp===1&&hospLv(HOME)===1,'hospital and clinic share one level');s.bld.hosp=0;CAMP.bld.clinic=0;
 ok(/Hamlet|Village|Town/.test(__t264fix.townRankText(HOME))&&__t264fix.townRankText(HOME).includes(CL.tiers[tierOf(s.prosp)][1]),'the village header names the same tier as the side panel');
 const turn=CG.turn,mon=CG.month;CG.turn=4;CG.month=1;ok(__vw.month()===10&&__vw.season()===2,'October paints autumn');CG.turn=1;CG.month=1;ok(__vw.month()===1&&__vw.season()===3,'January paints winter');CG.turn=2;CG.month=3;ok(__vw.month()===6&&__vw.season()===1,'June paints summer');CG.turn=turn;CG.month=mon;
 ok(issueOrder.toString().includes('mHold'),'a right-click order by the granary completes the Mission 1 hold step');
 // drafting
 s.bld.smithy=2;s.bld.hosp=1;s.bld.yard=2;CG.phase=0;ok(train(HOME,'mil'),'train a company');const q=s.trn[s.trn.length-1];ok(q.draftee&&q.draftee.zh&&q.draftee.en,'the company has a named draftee ('+q.draftee.en+')');
 for(const t of s.trn)t.t=1;finishTraining({lines:[]});const fresh=Object.values(CG.U).filter(u=>u.record?.draftee);ok(fresh.length===1&&fresh[0].record.draftee.en===q.draftee.en,'the trained company carries the draftee');ok(v.ev.some(e=>e.k==='muster'&&e.names[0].en===q.draftee.en),'a muster scene is queued for the village');
 ok(fresh[0].wq>=2,'smithy Lv2 gives the new company forged kit (wq '+fresh[0].wq+')');
 // battle: gear, fallen names, homecoming, banners, festival, automatic care
 const a=CG.armies[0];for(const u of fresh){u.loc={a:a.id};a.units.push(u.id);}const bq={type:'atk',terr:'liulin',army:a.id};CG.queue=[bq];
 const r=resolveBattle(bq,true,{frac:u=>u.record?.draftee?0.9:0.3,kills:120,mounted:10,t:200,mkills:{}});
 ok(r.gear&&r.gear.lv===2&&r.gear.better>=1&&r.gear.saved>0,'the battle result names the smithy contribution ('+r.gear.saved+' fewer lost)');
 ok(v.fallen.some(f=>f.en===q.draftee.en)&&__vw.memorial().includes(q.draftee.en),'the fallen draftee is on the memorial wall by name');
 ok(v.ev.some(e=>e.k==='home'&&e.win&&e.wnd>0),'a homecoming with wounded is queued');ok(v.banners.length===1&&v.fest[HOME]>=campaignMonth(),'a captured banner and a victory festival');
 ok((CG.medical||[]).length>0,'the wounded are sent to hospital automatically');
 // village scene: events play, people and key people clickable
 showCVil(HOME);await W(600);ok(document.getElementById('vwBar')&&/comes home/.test(document.getElementById('vwBar').textContent),'entering Qinghe plays the homecoming first');
 await W(1500);ok(__vw.walk().some(w=>w.kind==='col')&&__vw.walk().some(w=>w.kind==='crowd'),'the column walks in past a cheering crowd');
 ok(__vw.people().map(p=>p.k).join()==='su,qm,smith,vet','Sister Su, the quartermaster, the smith and the veteran stand at their posts');
 document.getElementById('vwBar')?.remove();__vw.V.bar=null;__vw.V.queue=[];__vw.V.cam=null;
 const su=__vw.people()[0];CVIL.z=4;CVIL.fx=su.x;CVIL.fy=su.y;await W(300);ok(__vw.click(__vw.pick(su.x*CVIL._sc+CVIL._ox,(su.y-12)*CVIL._sc+CVIL._oy))&&/Sister Su/.test(document.getElementById('vwDlg').textContent),'clicking Sister Su opens her portrait, line and need');document.getElementById('vwDlg').remove();
 const pp=townScene().people[2];CVIL.fx=pp.x;CVIL.fy=pp.y;await W(250);const h=__vw.pick(pp.x*CVIL._sc+CVIL._ox,(pp.y-10)*CVIL._sc+CVIL._oy);ok(h&&(h.k==='villager'||h.k==='person'||h.k==='walker'),'villagers can be clicked');
 // ruins and repair
 v.dmg[HOME+':smithy']={k:'smithy',lv:2,mo:campaignMonth(),src:'raid'};s.bld.smithy=1;TOWN.scene=null;await W(300);ok(__vw.ruins(HOME).length===1,'a burned building is remembered as a ruin');
 const silver=CAMP.res.silver;ok(__vw.repair(HOME,'smithy')&&s.bld.smithy===2&&!__vw.ruins(HOME).length,'repairing restores its level');
 // month end: unveilings, settlers, objectives
 const snap={[HOME]:{b:{...s.bld,market:0},z:{},t:tierOf(s.prosp),f:0}};s.bld.market=1;CAMP.res.rep=(v.prest+1)*10;const pop=s.pop;__vw.monthEnd(snap);
 ok(v.ev.some(e=>e.k==='unveil'&&e.b==='market'),'a finished building is queued for an unveiling');ok(s.pop>pop&&v.ev.some(e=>e.k==='settlers'),'renown brings settlers');ok(v.ms.smithy&&v.ms.hosp,'objectives pay once when met');
 const ms=Object.keys(v.ms).length,sil=CAMP.res.silver;__vw.checkMs();ok(Object.keys(v.ms).length===ms&&CAMP.res.silver===sil,'objectives never pay twice');
 // the frame draws festival, night, weather with no errors
 __vw.V.t=150*.45;for(const wx of ['rain','snow','petals','leaves']){vwWeather=()=>wx;await W(150);}ok(__vw.dark()>.5&&__vw.fest(HOME),'night lamps and the festival draw');ok(!__vw.V.err,'the village layer drew without errors');
 // played haulage scenes do not replay
 showCamp();LOGI.scenes=[{kind:'unload',id:HOME,sid:999,m:campaignMonth()}];CG.vw.scenes['unload:999']=1;sceneStart();ok(!LOGI.cur,'a convoy banner that already played does not replay');
 return checks;});
const mob=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mp=await mob.newPage();mp.on('pageerror',e=>errors.push(e.stack));await mp.goto(url,{waitUntil:'networkidle'});await mp.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const m=await mp.evaluate(async()=>{coachSave({off:1,seen:{}});__sw.cstart();if(CG.evQ)CG.evQ.length=0;CG.fav.q.push(CG.fav.q[0]||{id:'x'});campUI();await new Promise(r=>setTimeout(r,400));const e=document.getElementById('cEdictGo');const r=e?e.getBoundingClientRect():null;return r&&{w:r.width,h:r.height,b:r.bottom};});
if(!m||m.h>120||m.w>370)throw Error('mobile edict button is too large: '+JSON.stringify(m));checks.push(`mobile edict call-out is compact (${Math.round(m.w)}x${Math.round(m.h)})`);
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));}finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exit(1);});
