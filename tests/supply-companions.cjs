const {chromium}=require('playwright'),fs=require('node:fs');
const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{
 browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));await page.goto(url,{waitUntil:'load'});
 const checks=await page.evaluate(()=>{
  const checks=[],ok=(v,m)=>{if(!v)throw Error(m);checks.push(m);};coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();CG.supplyAuto=false;
  const home=CG.T[HOME],source=CG.T.qingshui;source.own='qh';source.eq.bow=100;home.eq.bow=0;home.bld.yard=1;home.pop=2000;CAMP.res.silver=1000;campRefresh();
  ok(supplyPath('qingshui',HOME).length===2,'adjacent own villages have a friendly supply route');
  ok(have(HOME,'bow',true)===0,'remote bows cannot be spent instantly');
  ok(!trainCheck(HOME,'arch',0).length,'recruitment can request accessible remote equipment');
  const pop=home.pop,silver=CAMP.res.silver;
  ok(train(HOME,'arch',0)&&supplyJobs().length===1,'archer order queues while equipment is remote');
  ok(home.trn.length===0&&home.pop===pop&&CAMP.res.silver===silver,'waiting for kit does not begin training or consume manpower and wages');
  const cart=shipsOn().find(s=>s.internal);
  cart._a=.2;ok(shipProg(cart)===0,'map cart stays at the loading village before departing');cart._a=.8;ok(shipProg(cart)>0,'loaded map cart animates along the route');cart._a=0;
  ok(cart.goods.bow===100&&source.eq.bow===0&&home.eq.bow===0,'bows leave the producer and remain unavailable in transit');
  ok(LOGV.qingshui.out.some(c=>c.k==='bow'),'dispatch creates visible bow-loading jobs at the source');
  supplyRequest(HOME,{bow:100});ok(shipsOn().filter(s=>s.internal).length===1,'incoming cargo prevents duplicate shipments');
  ok(!train(HOME,'arch',0)&&supplyJobs().length===1,'waiting recruitment reserves its barracks slot');
  saveGame();CAMP=loadGame();campLoad();ok(supplyJobs().length===1&&shipsOn().some(s=>s.internal),'pending training and cargo persist in saves');
  const oldRisk=shipRisk;shipRisk=()=>0;
  try{CG.phase=3;endTurn();}finally{shipRisk=oldRisk;}
  ok(CG.T[HOME].trn.length===1&&supplyJobs().length===0&&CG.T[HOME].eq.bow===0,'arrival starts recruitment and consumes delivered bows');
  ok(CG.T[HOME].pop===pop-100&&CAMP.res.silver<silver,'manpower and pay are charged when training actually starts');
  ok(LOGV[HOME].in.some(c=>c.k==='bow'),'arrival creates visible unloading jobs');
  // A captured destination cannot receive free resources; a restored route resumes.
  CG.T.qingshui.eq.spear=90;CG.T[HOME].eq.spear=0;CG.armies[0].mem=CG.armies[0].mem.filter(x=>x!=='comms');
  supplyRequest(HOME,{spear:90});const paused=shipsOn().find(s=>s.internal);CG.T[HOME].own='xia';
  shipTurn([]);ok(paused.blocked&&CG.T[HOME].eq.spear===0&&paused.goods.spear===90,'captured destination blocks delivery and retains cargo');
  CG.T[HOME].own='qh';shipRisk=()=>0;shipTurn([]);shipRisk=oldRisk;
  ok(CG.T[HOME].eq.spear===90,'retained cargo arrives when the friendly route is restored');
  // Automatic workshop materials respect local reserves and cannot bounce forever.
  CG.T.qingshui.st.timber=500;CG.T[HOME].st.timber=0;CG.T[HOME].bld.bowyer=1;CG.T[HOME].ord.bowyer='bow';CG.supplyAuto=true;
  supplyAuto();const timber=shipsOn().filter(s=>s.internal&&s.to===HOME).reduce((n,s)=>n+(s.goods.timber||0),0);
  ok(timber>0&&CG.T.qingshui.st.timber>=60,'workshops automatically request spare raw materials without draining donor reserves');
  const shipments=shipsOn().length;supplyAuto();ok(shipsOn().length===shipments,'repeated automatic dispatch does not duplicate in-flight needs');
  CG.supplyAuto=false;CG.T.qinzhou.own='qh';CG.T.qinzhou.eq.armI=100;CG.T[HOME].eq.armI=0;
  supplyRequest(HOME,{armI:100});const distant=shipsOn().find(s=>s.internal&&s.goods.armI);ok(distant.path.length>=3,'distant equipment takes a multi-link route');
  const owners=Object.fromEntries(CADJ.qinzhou.map(id=>[id,CG.T[id].own]));for(const id of CADJ.qinzhou)CG.T[id].own='xia';shipTurn([]);
  ok(distant.blocked&&distant.at==='qinzhou'&&CG.T[HOME].eq.armI===0,'hostile intermediate roads pause a convoy without teleporting cargo');
  for(const [id,owner] of Object.entries(owners))CG.T[id].own=owner;shipRisk=()=>0;shipTurn([]);
  ok(distant.at!==HOME&&CG.T[HOME].eq.armI===0,'one month advances only one road link');
  shipTurn([]);shipRisk=oldRisk;ok(CG.T[HOME].eq.armI===100,'a distant convoy delivers only after its final travel month');
  CG.supplyAuto=false;CG.phase=0;CG.armies[0].mem=['lead','marks','eng','medic','comms'];CG.armies[0].loc=HOME;
  ok(SQUAD.every(s=>s.hp>=380),'all five companions have substantially larger health pools');
  ok(companionAt(HOME,'eng')&&companionAt(HOME,'medic'),'stationary army members provide local passives');
  const before=wkPlan(HOME,'bowyer');CG.armies[0].mem=CG.armies[0].mem.filter(x=>x!=='eng');const without=wkPlan(HOME,'bowyer');
  ok(before.cap===Math.ceil(without.cap*1.25),'engineer increases real workshop capacity');CG.armies[0].mem.push('eng');
  ok(companionStation('medic',HOME)&&!CG.armies[0].mem.includes('medic')&&CG.posts.medic===HOME,'medic can stay behind while the army departs');
  CG.armies[0].loc='qingshui';ok(suAt(HOME)&&!companionAt(HOME,'lead')&&companionAt('qingshui','lead'),'posted medic retains care while mobile passives move with the army');
  ok(battleSpec({type:'def',terr:HOME}).members.includes('medic')&&canCommand({type:'def',terr:HOME}),'posted companion can command and participate in local defence');
  ok(!companionRejoin('medic',HOME),'posted companion cannot teleport into an army elsewhere');
  CG.armies[0].loc=HOME;ok(companionRejoin('medic',HOME)&&CG.armies[0].mem.includes('medic'),'companion rejoins an army present at the post');
  CG.T[HOME].trn=[{type:'arch',arm:0,t:2,wq:1}];finishTraining({lines:[]});ok(CG.T[HOME].trn.length===0,'captain shortens two-season local training to one');
  CG.posts={comms:'qingshui'};CG.armies[0].mem=CG.armies[0].mem.filter(x=>x!=='comms');CG.T.qingshui.eq.dao=100;CG.T[HOME].eq.dao=0;
  supplyRequest(HOME,{dao:100});ok(shipsOn().some(s=>s.internal&&s.goods.dao===100&&s.speed===2),'stationed comms gives departures two links of monthly travel');
  // Check every secondary skill against actual battle objects.
  CG.posts={};CG.armies[0].mem=['lead','marks','eng','medic','comms'];beginSkirm({type:'def',terr:HOME,army:CG.armies[0].id});B.paused=false;BOT=false;
  const by=id=>B.squad.find(u=>u.sd.id===id);for(const u of B.squad){u.x=900;u.y=900;}
  const tank=by('lead');tank.hp=100;rebuildHash();const originalHp=tank.hp;damage(tank,80,null,{kind:'melee'});
  ok(tank.guardCharges===0&&tank.hp>originalHp&&tank.inv>0,'low-health companions get one emergency survival window');
  tank.inv=0;const hp=tank.hp;damage(tank,40,null,{kind:'melee'});ok(tank.hp<hp&&tank.guardCharges===0,'emergency survival cannot be reused indefinitely');
  const target=mkUnit('xfoot',1,1000,900);target.hp=10000;target.maxhp=10000;rebuildHash();
  const ammo=B.mod.ammo;ok(companionSecondary(by('marks'),{x:1000,y:900})&&B.mod.ammo===ammo-2&&target.stun===3,'marksman secondary spends two rounds and pins a nearby enemy');
  const damaged=addStruct('juma',27,27);damaged.hp=damaged.maxhp*.5;const oldhp=damaged.hp;
  ok(companionSecondary(by('eng'),{x:900,y:900})&&damaged.hp>oldhp,'engineer secondary repairs actual friendly structures');
  tank.hp=tank.maxhp*.5;const injured=tank.hp;ok(companionSecondary(by('medic'),{x:900,y:900})&&tank.hp>injured&&tank.coverUntil>B.t,'medic secondary heals and applies timed protective cover');
  by('marks').skE=10;ok(companionSecondary(by('comms'),{x:900,y:900})&&by('marks').skE===4,'comms regroup accelerates companion primary skills');
  B.selU=new Set([tank]);ok(companionSecondary(tank,{x:1000,y:900})&&tank.skR>0,'captain retains the leap-and-whirl secondary');
  ok(!companionSecondary(by('medic'),{x:900,y:900}),'secondary skills enforce cooldowns');
  B.paused=true;drawHUD();return checks;
 });
 fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/companions-skills.png'});
 await page.evaluate(()=>{B=null;showCamp();supplyUI();});await page.screenshot({path:'test-results/supply-network.png'});
 await page.locator('#cSupply .btn').last().click();await page.evaluate(()=>settleUI(HOME,'garr'));await page.screenshot({path:'test-results/companion-posts.png'});
 console.log(JSON.stringify({checks,errors},null,2));if(errors.length)throw Error('Browser errors');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
