const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..');
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,body)=>{if(err){res.writeHead(404);res.end();return;}
   res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(body);});
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const options={headless:true};
 if(process.env.GAME_BROWSER)options.executablePath=process.env.GAME_BROWSER;
 else if(process.platform==='win32')options.channel='msedge';
 let browser;
 try {
  browser=await chromium.launch(options);
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.stack));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'networkidle'});
  const results=await page.evaluate(()=>{
   const checks=[];const ok=(c,m)=>{if(!c)throw Error(m);checks.push(m);};
   coachSave({off:1,seen:{}});LOGI.on=false;__sw.cstart();
   ok(CL.terr.length===121,'121 unique settlements including resettlement sites and mineral markets');
   ok(new Set(CL.terr.map(t=>t.id)).size===121,'settlement IDs unique');
   ok(Object.keys(bfsDist(HOME,100)).length===121,'every settlement reachable by road');
   ok(NODES.every(n=>CT[n.terr]&&NODEK[n.k]),'every resource site has a valid owner and type');
   ok(CL.links.every(([a,b])=>CADJ[a].includes(b)&&CADJ[b].includes(a)),'roads bidirectional');
   ok(garrison('qinzhou')>0&&garrison('qinzhou')<=450&&CG.T.liulin.str>0,'Song and Xia settlements have garrisons');
   ok(CG.T[HOME].st.grain===900&&CG.T[HOME].st.timber===460,'initial supplies increased');
   ok(!STK_BINS.flat().some(k=>k==='gold'||k==='silver'),'no exposed warehouse precious metals');
   const points=stkGrid(8,10,20,100,100,{cw:20,ch:15,ly:2}).pts;
   ok(points[0].x===20&&points[0].y<points[4].y,'stacks begin top left and fill right then down');
   CVIL.id=HOME;const plan=cvilStockPlan(CG.T[HOME]);
   ok(plan.items.filter(x=>x.k==='grain').length===18,'grain visual represents 50 units per pile');
   const state=JSON.stringify(CG.T[HOME].st),silver=CAMP.res.silver;
   frontierMigrate();frontierMigrate();
   ok(JSON.stringify(CG.T[HOME].st)===state&&CAMP.res.silver===silver,'migration cannot duplicate supplies');
   // Simulate a save from before this expansion, already in March.
   for(const t of CL.terr)if(t.id.includes('_district_')||FRONTIER_CENTRES.some(c=>c[0]===t.id))delete CG.T[t.id];
   CG.phase=2;const turn=CG.turn,men=armyN(CG.armies[0]);
   campLoad();
   ok(Object.keys(CG.T).length===121&&CG.phase===0&&CG.turn===turn&&armyN(CG.armies[0])===men,'legacy March save migrates without losing progress');
   ok(JSON.stringify(CG.T[HOME].st)===state&&CAMP.res.silver===silver,'loading migrated save preserves inventory');
   // Exercise actual actions in the same planning stage.
   CG.T[HOME].bld.yard=1;CG.T[HOME].eq.spear+=100;CG.T[HOME].bld.market=1;
   ok(startBuild(HOME,'farm'),'build order accepted during Planning');
   ok(train(HOME,'mil',0),'recruitment accepted during Planning');
   ok(sellRaw(HOME,'timber'),'trade accepted during Planning');
   ok(rtsGo([CG.armies[0]],'qingshui')===1,'movement route accepted during Planning');
   nextPhase();
   ok(CG.phase===3&&CG.turn===turn,'Resolve orders enters Battles without ticking season');
   ok(CG.armies[0].loc==='qingshui','planned march executes');
   ok(!startBuild(HOME,'market')&&!train(HOME,'mil',0),'battle phase blocks new construction and recruitment');
   nextPhase();
   ok(CG.phase===0&&CG.turn===turn&&CG.month===2,'End month advances a month without advancing the season');
   ok(CG.T[HOME].build?.length>0,'construction stays pending before seasonal settlement');
   nextPhase();nextPhase();
   ok(CG.turn===turn&&CG.month===3,'second monthly round preserves seasonal clock');
   nextPhase();nextPhase();
   ok(CG.phase===0&&CG.turn===turn+1&&CG.month===1,'third monthly round settles exactly one season');
   ok(CG.report?.turn===turn,'season report generated');
   saveGame();CAMP=loadGame();campLoad();
   ok(CG.turn===turn+1&&CG.phase===0,'save/load round trip preserves turn');
   // Drain a mixed inbound/outbound logistics batch with fixed simulation time.
   CVIL.id=HOME;delete LOGV[HOME];logvPush(HOME,'out',{grain:650,timber:250,gold:5,silver:80},'soldier',901);
   logvPush(HOME,'in',{ore:420,silk:50},'porter',902);
   let maxCarts=0;
   for(let i=0;i<7200;i++){logvStep(HOME,1/60);maxCarts=Math.max(maxCarts,LOGV[HOME].carts.length);}
   const v=LOGV[HOME];
   ok(!v.out.length&&!v.in.length&&!v.car.length&&!v.carts.length,'mixed cart loading/unloading finishes and carts leave');
   ok(maxCarts<=4,'logistics never spawns more than four carts');
   const sh={eta:3,left:2,_a:.4},a=shipProg(sh);for(let i=0;i<200;i++)shipProg(sh);
   ok(shipProg(sh)===a&&sh._a===.4,'drawing/hit testing cannot advance convoys');
   const beforeMonth=campaignMonth(),oldAI=xiaAI;
   xiaAI=()=>{};
   try{for(let i=0;i<90;i++){CG.phase=3;CG.queue=[];endTurn();}}finally{xiaAI=oldAI;}
   ok(campaignMonth()===beforeMonth+90,'90 further monthly turns advance the calendar exactly');
   ok(CG.turn>20&&!CG.over,'campaign remains playable beyond Jingkang');
   ok(CG.arcDone.fall,'historical crisis still occurs on the seasonal timeline');
   CG.won=1;CG.victoryContinued=0;
   const victory=endBox();ok(victory.id==='cVictory','victory offers a continuation milestone');
   CG.victoryContinued=1;ok(endBox().nodeType===11,'continued victory no longer blocks the campaign');
   CG.won=0;CG.evQ=[];CG.fav.q=[];
   return {checks,settlements:CL.terr.length,sites:NODES.length,maxCarts};
  });
  await page.evaluate(()=>{setLang('en');showCVil(HOME);logvPush(HOME,'out',{grain:600,timber:300},'soldier',910);});
  await page.waitForTimeout(3000);
  fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
  await page.screenshot({path:path.join(root,'test-results/loading.png')});
  const timing=await page.evaluate(()=>new Promise(resolve=>{const gaps=[];let prev=performance.now();function f(t){gaps.push(t-prev);prev=t;if(gaps.length<120)requestAnimationFrame(f);else{gaps.sort((a,b)=>a-b);resolve({median:gaps[60],p95:gaps[114],max:gaps[119]});}}requestAnimationFrame(f);}));
  console.log(JSON.stringify({...results,timing,errors},null,2));
  if(errors.length)throw Error('Browser errors');
 } finally {if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
