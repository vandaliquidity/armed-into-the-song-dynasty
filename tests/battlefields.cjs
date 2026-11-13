const {chromium}=require('playwright');
const fs=require('node:fs');
const {startServer,browserOptions}=require('./server.cjs');
(async()=>{
 const {server,url}=await startServer();let browser;
 try{
  browser=await chromium.launch(browserOptions());
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.stack));
  await page.goto(url,{waitUntil:'networkidle'});
  const results=await page.evaluate(()=>{
   coachSave({off:1,seen:{}});LOGI.on=false;__sw.cstart();CG.evQ=[];
   const checks=[],maps=[];const ok=(x,m)=>{if(!x)throw Error(m);checks.push(m);};
   const roster={...CAMP.roster};
   function build(id,mission='atk'){
    CAMP.roster={...roster};const s=battleSpec({type:mission,terr:id,army:CG.armies[0].id});
    B=newBattle(-1);B.skirm=s;B.members=s.members;B.eqMul=s.eqMul;B.N=s.N;uidN=1;CAMP.roster={...s.tro};SETUP.skirm();return B;
   }
   function reachable(){
    const u=B.squad[0],x=Math.floor(u.x/TS),y=Math.floor(u.y/TS),seen=new Set([y*B.W+x]),q=[[x,y]];
    for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=ny*B.W+nx;if(inB(nx,ny)&&B.solid[k]===0&&!seen.has(k)){seen.add(k);q.push([nx,ny]);}}}
    return B.frontier.points.every(p=>seen.has(Math.floor(p.y/TS)*B.W+Math.floor(p.x/TS)));
   }
   for(const [type,id] of [['farm','qinghe'],['market','qingshui'],['fort','majia'],['city','lingzhou'],['steppe','tiandu'],['crossing','jinsha'],['quarry','wangjia']]){
    build(id);ok(B.skirm.profile.type===type,type+' chooses its own battlefield');
    ok(reachable(),type+' objectives reachable from deployment');
    const sig=Array.from(B.solid).join('');build(id);ok(Array.from(B.solid).join('')===sig,type+' terrain stable on revisits');
    maps.push({type,id,width:B.W,height:B.H,props:B.props.length,blocked:B.solid.reduce((a,b)=>a+(b?1:0),0),points:B.frontier.points.length});
   }
   ok(new Set(maps.map(x=>x.width+'|'+x.props+'|'+x.blocked)).size===7,'all seven map archetypes have distinct geometry');
   for(const t of CL.terr){build(t.id);if(!reachable())throw Error('Inaccessible objective at '+t.id);}
   ok(true,'all 95 settlements have reachable assault objectives');
   build('qinghe');
   const p=B.frontier.points[0];
   B.units.forEach(u=>{u.x=100;u.y=100;});const ally=B.squad[0];ally.x=p.x;ally.y=p.y;
   const foe=B.units.find(u=>u.team===1);foe.x=p.x;foe.y=p.y;
   battlefieldTick(13);ok(!p.captured,'contested objectives cannot be captured');
   foe.x=100;foe.y=100;battlefieldTick(13);ok(p.captured,'uncontested presence captures a district');
   build('tiandu','raid');
   B.units.forEach(u=>{u.x=100;u.y=100;});
   B.frontier.points.forEach((p,i)=>{const carrier=B.squad[i];carrier.x=p.x;carrier.y=p.y;p.captured=true;p.carrierId=carrier.id;});
   ok(!B.win(),'raids cannot win before supply carriers withdraw');
   B.frontier.points.forEach(p=>{const u=B.units.find(u=>u.id===p.carrierId);u.x=B.frontier.extraction.x;u.y=B.frontier.extraction.y;});
   ok(B.win(),'raid completes after actual supply carriers return');
   const deadCarrier=B.units.find(u=>u.id===B.frontier.points[0].carrierId);deadCarrier.dead=true;battlefieldTick(.1);
   ok(!B.frontier.points[0].captured,'lost supply carrier requires recovering the depot');
   build('qinghe','def');ok(B.waves.length===2,'defence has separated assault columns');
   B.frontier.elapsed=B.frontier.defendTime;ok(B.win(),'intact defence can win by holding out');B.key.dead=true;ok(!B.win(),'destroyed granary cannot win defence');
   B=null;CAMP.roster=roster;showCamp();return{checks,maps};
  });
  fs.mkdirSync('test-results',{recursive:true});
  await page.evaluate(()=>{setLang('en');showCamp();});await page.waitForTimeout(500);
  const layout=await page.evaluate(()=>({font:getComputedStyle(campEl()).fontFamily,grid:getComputedStyle(document.querySelector('.campaign-top')).display}));
  if(!layout.font.includes('Segoe')||layout.grid!=='grid')throw Error('Campaign polish stylesheet not applied');
  await page.screenshot({path:'test-results/campaign-polished.png'});
  for(const [name,id] of [['farm','qinghe'],['fort','majia'],['city','lingzhou'],['river','jinsha']]){
   await page.evaluate(id=>{B=null;showCamp();beginSkirm({type:'atk',terr:id,army:CG.armies[0].id});B.paused=false;SPEED=0;CAM.z=Math.min(VW/(B.W*TS),VH/(B.H*TS))*.9;CAM.x=B.W*TS/2-VW/2/CAM.z;CAM.y=B.H*TS/2-VH/2/CAM.z;},id);
   await page.waitForTimeout(500);await page.screenshot({path:'test-results/battle-'+name+'.png'});
   await page.evaluate(()=>{SPEED=1;for(let i=0;i<90;i++)updateBattle(1/60);SPEED=0;});
  }
  await page.evaluate(()=>{B=null;showCamp();});
  await page.setViewportSize({width:1200,height:800});await page.waitForTimeout(500);await page.screenshot({path:'test-results/campaign-1200.png'});
  const overlap=await page.evaluate(()=>{const a=document.querySelector('.campaign-nav').getBoundingClientRect(),b=document.querySelector('.campaign-log').getBoundingClientRect();return a.bottom>b.top;});
  if(overlap)throw Error('Navigation overlaps dispatches at 1200x800');
  await page.locator('#cSetB').click();await page.waitForTimeout(100);if(!await page.locator('#cSet').count())throw Error('Settlement navigation failed');
  await page.screenshot({path:'test-results/settlement-panel.png'});
  console.log(JSON.stringify({...results,errors},null,2));if(errors.length)throw Error('Browser errors');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
