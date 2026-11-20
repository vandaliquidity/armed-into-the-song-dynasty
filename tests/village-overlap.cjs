// t255: no two building/kit footprints (or building click boxes) overlap in the main village view. Fails with the list of offending pairs.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
await page.addScriptTag({path:__dirname+'/lib/village-overlap.js'});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);},w=ms=>new Promise(r=>setTimeout(r,ms));coachSave({off:1,seen:{}});
 const enter=async()=>{__vu.set(true);showCVil(HOME);for(let i=0;i<300;i++){cvil8Frame(1/60);await w(30);if(i>40&&__vu.on()&&SPR.vu_villager&&VL.img.ward)break;}for(let i=0;i<60;i++)cvil8Frame(1/30);CVIL.z=1;cvil8Frame(1/60);};
 const run=async(label,setup)=>{__sw.cstart();if(CG.evQ)CG.evQ.length=0;setup(CG.T[HOME]);await enter();const r=__vOverlap();
   const list=[...r.pairs.map(p=>p.kind+' '+p.area+'px² '+p.a+' x '+p.b),...r.hotPairs.map(p=>'click boxes '+p.area+'px² '+p.a+' x '+p.b)];
   ok(r.checked>40&&!list.length,label+': '+r.checked+' footprints and '+r.hot+' building click boxes, '+(list.length?list.length+' overlaps:\n  '+list.join('\n  '):'no overlaps'));};
 await run('new game home village',s=>{});
 await run('fully built home village (every development, upgrade and business, hospital Lv2)',s=>{for(const k in s.bld)s.bld[k]=Math.max(s.bld[k]||0,(DEV[k]&&DEV[k].max)||2);s.prosp=95;s.pop=Math.max(s.pop,900);for(const k in CAMP.bld)CAMP.bld[k]=2;CAMP.bld.clinic=2;
   s.businesses=s.businesses||{};for(const k in DY_BUSINESSES)s.businesses[k]={level:3,paused:false};s.st.horse=60;});
 await run('market-row and paired businesses only (pottery without kiln, refinery without foundry), no hospital',s=>{s.prosp=70;s.pop=600;s.bld.farm=3;CAMP.bld.clinic=0;s.businesses=s.businesses||{};for(const k of ['brewery','beauty','restaurant','pottery','refinery','weaver','papermill','orchard'])s.businesses[k]={level:2,paused:false};});
 __vu.set(false);return checks;});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
