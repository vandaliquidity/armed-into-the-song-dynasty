const {chromium}=require('playwright'),fs=require('node:fs');
const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{
 browser=await chromium.launch(browserOptions());const p=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
 p.on('pageerror',e=>errors.push(e.stack));await p.goto(url,{waitUntil:'networkidle'});
 await p.evaluate(async()=>{await document.fonts.ready;coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();});
 await p.waitForTimeout(1200);fs.mkdirSync('test-results',{recursive:true});await p.screenshot({path:'test-results/campaign-v021.png'});
 const checks=await p.evaluate(()=>{
  const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};
  const state=()=>JSON.stringify({u:CG.U,t:Object.fromEntries(Object.entries(CG.T).map(([id,s])=>[id,[s.own,s.pop,s.str,s.songGarrison?.men]])),war:CG.frontierWar});
  const before=state();drawLinks(ctx);drawNodes(ctx);for(const t of CL.terr)drawTerr(ctx,t.id);
  ok(state()===before,'map artwork does not change armies, population, ownership or frontier simulation');
  ok(campArt().painted&&MAP_GROUND,'painted mountains and cached geographic landscape render');
  const labels=[...MAP_LABELS.values()];
  ok(labels.length>3&&!labels.some((r,i)=>labels.some((b,j)=>i!==j&&r.x<b.x+b.w&&r.x+r.w>b.x&&r.y<b.y+b.h&&r.y+r.h>b.y)),'visible settlement labels do not overlap');
  ok(MAP_LABELS.has(HOME),'Qinghe label retains priority in the crowded starting area');
  ok([...MAP_LABELS].some(([id,r])=>campPick(r.x+r.w/2,r.y+r.h/2)?.t===id),'displaced settlement labels remain clickable');
  const layout=JSON.stringify([...MAP_LABELS]);drawLinks(ctx);ok(JSON.stringify([...MAP_LABELS])===layout,'label placement remains stable between frames');
  const visible=CL.terr.filter(t=>{const q=c2s(tPos(t.id).x,tPos(t.id).y);return q.x>220&&q.x<VW-330&&q.y>220&&q.y<VH-100;});
  ok(visible.some(t=>campPick(c2s(tPos(t.id).x,tPos(t.id).y).x,c2s(tPos(t.id).x,tPos(t.id).y).y)?.t===t.id),'settlement models retain their campaign click targets');
  const samples=[];for(let i=0;i<40;i++){const start=performance.now();campFrame(1/60);samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);
  ok(samples[37]<60,'steady map rendering stays below 60ms at the tested viewport');
  return {checks:out,labels:labels.length,p95:samples[37]};
 });
 await p.evaluate(()=>{CC.z=.53;CC.tx=null;CC.tz=null;const at=tPos('weizhou');CC.x=at.x-VW*.47/CC.z;CC.y=at.y-VH*.48/CC.z;});await p.waitForTimeout(300);await p.screenshot({path:'test-results/campaign-v021-wide.png'});
 await p.setViewportSize({width:1200,height:800});await p.evaluate(()=>{CC.z=1.45;CC.tx=null;CC.tz=null;const at=tPos(HOME);CC.x=at.x-VW*.48/CC.z;CC.y=at.y-VH*.48/CC.z;});await p.waitForTimeout(300);await p.screenshot({path:'test-results/campaign-v021-close.png'});
 console.log(JSON.stringify({...checks,errors},null,2));if(errors.length)throw Error('Browser errors');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
