const {chromium}=require('playwright');
const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{
 browser=await chromium.launch(browserOptions());const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.stack));await page.goto(url,{waitUntil:'networkidle'});
 const checks=await page.evaluate(()=>{
  coachSave({off:1,seen:{}});LOGI.on=false;__sw.cstart();CG.supplyAuto=false;
  const checks=[],ok=(v,m)=>{if(!v)throw Error(m);checks.push(m);},tick=()=>{if(CG.month===3){CG.turn++;CG.month=1;}else CG.month++;};
  let F=__fr.frState();frontierBudgetMonth(F);
  const before=Object.fromEntries(Object.keys(CG.T).filter(id=>CG.T[id].own==='xia').map(id=>[id,warMen(id)]));
  const inv=__fr.frPlan(F,'xia',[]);
  ok(inv&&inv.men>0&&inv.men===inv.cols.reduce((n,c)=>n+c.men,0),'An invasion consists of its actual funded columns');
  ok(inv.cols.every(c=>before[c.src]-warMen(c.src)===c.men&&warMen(c.src)>=50),'Every invasion column withdraws soldiers from its occupied source and leaves a guard');
  const c=inv.cols[0],base=warMen(c.src);inv.cols=[c];inv.stage='march';c.step=1;c.state='routed';F.mo=campaignMonth();
  __fr.frInvMonth(F,[]);frontierBudgetMonth(F);
  ok(warMen(c.src)===base&&F.returns.length===1,'Surviving invaders enter a return column instead of instantly refilling their garrison');
  tick();frontierBudgetMonth(F);
  ok(warMen(c.src)===base+Math.floor(c.men*.8)&&!F.returns.length,'Returning survivors cross the actual road before rejoining their source');
  const returned=warMen(c.src);frontierBudgetMonth(F);ok(warMen(c.src)===returned,'A repeated monthly callback cannot return the soldiers twice');
  const camp=F.camps[__fr.FR_CAMPS[0].id],e=camp.economy;tick();e.grain=500;e.timber=100;e.leather=100;e.bow=0;e.silver=100;e.pending=0;
  const pop=e.pop,men=camp.men;frontierBudgetMonth(F);
  ok(e.pending>0&&camp.men===men&&e.pop===pop-e.pending&&e.timber<100&&e.leather<100,'Qiang recruits consume local people and crafted equipment before joining');
  const trained=e.pending;tick();frontierBudgetMonth(F);ok(camp.men===men+trained,'Only completed Qiang training adds to the local garrison');
  const target=Object.keys(CG.T).find(id=>CG.T[id].own==='song'),s=CG.T[target];s.st.grain=7;s.st.silver=3;s.st.horse=1;const loot=frLoot(target,1000,.9);
  ok(loot.grain===7&&loot.silver===3&&loot.horse===1&&s.st.grain===0&&s.st.silver===0&&s.st.horse===0,'Raid loot is limited to the target town’s actual stored goods');
  return checks;
 });console.log(JSON.stringify({checks,errors},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
