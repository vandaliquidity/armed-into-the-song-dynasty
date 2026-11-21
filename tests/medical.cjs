const {chromium}=require('playwright'),fs=require('node:fs');
const {startServer,browserOptions}=require('./server.cjs');
(async()=>{
 const {server,url}=await startServer();let browser;
 try{
  browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'networkidle'});
  const result=await page.evaluate(()=>{
   const checks=[];const ok=(x,m)=>{if(!x)throw Error(m);checks.push(m);};
   coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();
   const a=CG.armies[0];CG.U={};a.units=[];
   const wounded=newUnit('mil',60,{wnd:40,arm:1,wq:2,exp:3,loc:{a:a.id},home:HOME});a.units.push(wounded.id);
   const healthy=newUnit('spear',100,{loc:{a:a.id},home:HOME});a.units.push(healthy.id);
   ok(!careNearest(HOME),'no hospital returns no evacuation route');
   const blocked=consolidateWounded();ok(blocked.unreachable===40&&wounded.wnd===40&&!careBatches().length,'no reachable hospital preserves wounded and assignments');
   CG.T.qingshui.own='qh';CG.T.qingshui.bld.hosp=1;campRefresh();
   ok(careNearest(HOME).to==='qingshui','nearest reachable owned hospital is selected');
   // The same route search may cross allied Song settlements, but not free or enemy ones.
   CG.T.qingshui.bld.hosp=0;CG.T.qinzhou.own='qh';CG.T.qinzhou.bld.hosp=1;campRefresh();
   const via=careNearest(HOME);ok(via.to==='qinzhou'&&via.path.every(careFriendly),'hospital route crosses only friendly roads');
   CG.T.qingshui.own='song';CG.T.longcheng.own='xia';
   ok(careNearest(HOME)?.path.includes('qingshui'),'hospital route can cross allied Song territory');
   CG.T.qingshui.own='xia';ok(!careNearest(HOME),'hostile road closures make the hospital unreachable');
   CG.T.qingshui.own='qh';CG.T.qingshui.bld.hosp=1;CG.T.longcheng.own='song';campRefresh();
   CG.T[HOME].bld.hosp=1;ok(careNearest(HOME).to===HOME,'a hospital already at the source is the nearest');CG.T[HOME].bld.hosp=0;
   a.dest='longcheng';a.route=['qinzhou'];const loc=JSON.stringify(wounded.loc),members=[...a.units];
   const sent=consolidateWounded();
   ok(sent.sent===40&&wounded.wnd===0&&wounded.men===60,'only wounded leave the combat unit');
   ok(JSON.stringify(wounded.loc)===loc&&JSON.stringify(a.units)===JSON.stringify(members)&&a.dest==='longcheng'&&a.route[0]==='qinzhou','army membership and movement orders are preserved');
   ok(healthy.men===100&&careBatches().length===1&&woundedAll()===40,'healthy troops remain and total wounded are conserved');
   consolidateWounded();ok(careBatches().length===1&&woundedAll()===40,'repeated evacuation clicks cannot duplicate patients');
   saveGame();CAMP=loadGame();campLoad();ok(careBatches()[0].n===40&&woundedAll()===40,'evacuation survives save/load');
   const uid=careBatches()[0].unitId;
   CG.phase=3;endTurn();ok(careBatches()[0].at==='qingshui'&&careBatches()[0].state==='care'&&careBatches()[0].n===40,'patients travel a road segment at month end without instant healing');
   CG.phase=3;endTurn();ok(careBatches()[0].n===40,'patients do not heal twice before season end');
   CG.phase=3;endTurn();
   ok(CG.U[uid].men===80&&careBatches()[0].n===19&&CG.stats.wrec===20&&CG.stats.wdied===1,'level-one hospital applies existing seasonal healing and mortality rates');
   ok(CG.U[uid].loc.a===CG.armies[0].id,'recovered men rejoin their original army unit');
   // If the original unit is full, men recover into a local reserve instead of overflowing it.
   CG.U[uid].men=100;const batch=careBatches()[0],before=menOf(Object.values(CG.U));careReturn(batch,12);
   ok(CG.U[uid].men===100&&menOf(Object.values(CG.U))===before+12&&unitsAt('qingshui').some(u=>u.type==='mil'&&u.arm===1&&u.wq===2),'full original units send recovered men into an equipped hospital garrison');
   const original=CG.U[uid];delete CG.U[uid];const total=menOf(Object.values(CG.U));careReturn(batch,7);
   ok(menOf(Object.values(CG.U))===total+7,'patients are not lost when their original unit was disbanded');CG.U[uid]=original;
   // A lost destination cannot teleport patients through enemy territory.
   batch.at=HOME;batch.to='qingshui';batch.path=['qingshui'];batch.state='travel';CG.T.qingshui.own='xia';CG.T.qinzhou.bld.hosp=0;
   careAdvance();ok(batch.state==='blocked'&&batch.at===HOME,'destination loss pauses evacuation safely');
   CG.T[HOME].bld.hosp=1;careAdvance();ok(batch.state==='care'&&batch.at===HOME&&batch.to===HOME,'blocked patients reroute when a local hospital becomes available');
   original.wnd=8;const admitted=consolidateWounded();ok(admitted.already>=8&&original.wnd===0,'patients are admitted even when their army is already at a hospital');
   const local=careBatches().find(b=>b.n===8);CG.armies[0].loc='longcheng';careAdvance();ok(local.at===HOME,'admitted patients remain at the hospital when the healthy army marches away');
   const small=newUnit('mil',8,{wnd:20,loc:{v:HOME},home:HOME});consolidateWounded();
   const population=menOf(Object.values(CG.U))+woundedAll(),dead=CG.stats.wdied||0;
   woundTick({lines:[]});
   ok(CG.U[small.id]===small&&small.men===18,'small healthy detachments are not deleted while their wounded are in hospital');
   ok(menOf(Object.values(CG.U))+woundedAll()+(CG.stats.wdied||0)-dead===population,'hospital recovery conserves all soldiers apart from recorded deaths');
   const n=woundedAll();MODE='battle';consolidateWounded();ok(woundedAll()===n,'active tactical combat cannot dispatch patients');B=null;showCamp();
   return{checks};
  });
  await page.locator('#cMedicalB').click();await page.locator('#cMedical').waitFor({state:'visible'});
  fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/medical-quick-action.png'});
  console.log(JSON.stringify({...result,errors},null,2));if(errors.length)throw Error('Browser errors');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
