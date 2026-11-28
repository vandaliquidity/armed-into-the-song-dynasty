const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;const checks=[];
 try{
  const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/bld_manifest.json'),'utf8'));
  assert.equal(Object.keys(manifest.buildings).length,49);
  const hashes=new Set();for(const [key,b]of Object.entries(manifest.buildings)){for(const tier of ['hi','md','lo'])for(const layer of b.layers){const file=path.join(root,'assets',tier,'bld_'+key+'__'+layer+'.webp');assert(fs.statSync(file).size>30,key+' '+tier+' '+layer);}hashes.add(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'assets/md','bld_'+key+'__base.webp'))).digest('hex'));}assert.equal(hashes.size,49);checks.push('All 49 variants have distinct base artwork and complete hi/md/lo layers.');
  browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[],webgl=[];
  page.on('pageerror',e=>errors.push(e.stack));page.on('request',r=>{if(/village-3d|\/vendor\/three\//.test(r.url()))webgl.push(r.url());});
  await page.goto(process.argv[2]||url,{waitUntil:'load',timeout:90000});await page.waitForFunction(()=>SONG_BUILDINGS.meta);
  await page.evaluate(()=>{coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();CG.evQ=[];GFX.tier='md';showCVil(HOME);});
  await page.waitForFunction(()=>townScene().present.every(r=>{const key=songBuildingKey(r);return !SONG_BUILDINGS.meta.buildings[key]||songBuildingReady(key);}),null,{timeout:90000});
  checks.push(...await page.evaluate(()=>{
   const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);},s=CG.T[HOME],sc=townScene();
   ok(sc.people.length>0&&sc.people.every(p=>p.resident?.id&&p.resident.name.length===2),'Visible residents have persistent names drawn from the real population.');
   ok(sc.people.length<=s.pop&&new Set(sc.people.map(p=>p.resident.id)).size===sc.people.length,'The resident roster neither grants population nor duplicates people.');
   const homes=sc.housing.map(r=>[r.k,r.x,r.y]),names=sc.people.map(p=>[p.resident.id,p.resident.name]);const newlyBuilt=WK_ORDER.find(k=>!s.bld[k]);if(!newlyBuilt)throw Error('Fixture needs an unbuilt workshop');s.bld[newlyBuilt]=1;TOWN.scene=null;const next=townScene();
   ok(homes.every(([key,x,y])=>next.byKey[key]?.x===x&&next.byKey[key]?.y===y),'Adding a workshop preserves existing residential plots.');
   ok(names.every(([id,name])=>next.people.some(p=>p.resident.id===id&&p.resident.name.join()===name.join())),'Residents keep their identities when the town rebuilds its scene.');
   const baseline=JSON.stringify([s.st,s.eq,s.pop,CG.U,CG.armies,CAMP.res.silver,CG.turn,campaignMonth()]);for(let i=0;i<120;i++)cvil8Frame(1/60);
   ok(JSON.stringify([s.st,s.eq,s.pop,CG.U,CG.armies,CAMP.res.silver,CG.turn,campaignMonth()])===baseline,'Layer rendering and resident movement preserve stocks, money, soldiers, population and time.');
   ok(songBuildingRoofAlpha(.3)===1&&songBuildingRoofAlpha(.85)===0&&Math.abs(songBuildingRoofAlpha(.55)-.5)<.001,'Roofs close at overview zoom and reveal interiors at close zoom.');
   saveGame();const saved=JSON.parse(localStorage.getItem(SAVEKEY));ok(saved.cg.villageResidents[HOME].people[0].id===CG.villageResidents[HOME].people[0].id,'Resident identity is included in the real campaign save.');
   return out;
  }));
  await page.screenshot({path:'test-results/village-cutaway-start.png'});
  // Click an actual person, rather than calling the profile UI directly.
  const target=await page.evaluate(()=>{const p=townScene().people.find(p=>p.resident.role!=='porter'&&p.resident.role!=='child');CVIL.fx=p.x;CVIL.fy=p.y-20;CVIL.z=1.1/Math.min((VW-360)/VWW,VH/VWH);cvil8Frame(0);return {id:p.resident.id,x:p.x*CVIL._sc+CVIL._ox,y:(p.y-14)*CVIL._sc+CVIL._oy};});
  await page.mouse.click(target.x,target.y);await page.locator('#villageResidentCard').waitFor();await page.getByRole('button',{name:'Follow',exact:true}).click();assert(await page.evaluate(id=>CVIL.followResident===id,target.id));checks.push('Clicking a villager opens their own profile and Follow tracks that resident.');
  await page.screenshot({path:'test-results/village-resident-profile.png'});
  await page.getByRole('button',{name:'Home',exact:true}).click();assert(await page.evaluate(()=>!CVIL.followResident));
  await page.evaluate(()=>{const s=CG.T[HOME];s.pop=4800;s.prosp=70;for(const k of Object.keys(s.bld))s.bld[k]=2;for(const k of RAW)s.st[k]=1000;for(const k of EQ)s.eq[k]=200;CAMP.res.silver=10000;for(const k of Object.keys(DY_BUSINESSES))s.businesses[k]={level:2,paused:false};showCVil(HOME);});
  await page.waitForFunction(()=>townScene().present.every(r=>{const key=songBuildingKey(r);return !SONG_BUILDINGS.meta.buildings[key]||songBuildingReady(key);}),null,{timeout:90000});
  checks.push(...await page.evaluate(()=>{
   const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);},sc=townScene(),s=CG.T[HOME],nav=townNav();
   ok(sc.housing.length>=30,'A developed settlement has room for every earned home and its workshops.');
   for(const r of sc.present.filter(r=>songBuildingSpec(r)?.class==='W')){const destination=songBuildingPoint(r,'input'),route=villageRoute(r.door,destination);if(!route?.length)throw Error('No interior approach: '+r.k);for(const [x,y]of route)if(!villageFree(nav,x,y))throw Error('Delivery crosses a wall: '+r.k);}
   ok(true,'Built cutaway workplaces have navigable approaches and interior delivery points.');
   const hospital=sc.byKey.hospital,beds=vlSlots(1),extended=vlSlots(2);ok(beds.length===8&&extended.length===12&&beds.every(p=>p.x>hospital.x-120&&p.x<hospital.x+120&&p.y<hospital.y),'The new hospital retains eight beds and four real level-two care mats.');
   for(const r of sc.records.filter(r=>!r.built&&!r.construction)){let drawn=0;townBuilding(()=>drawn++,ctx,r,s,0);if(drawn)throw Error('Unbuilt model displayed: '+r.k);}ok(true,'Unbuilt buildings remain invisible.');
   const baseline=JSON.stringify([s.st,s.eq,s.pop,CG.U,CG.armies,CAMP.res.silver,CG.turn]);
   for(let i=0;i<800;i++){CVIL.hot=[];townEconomy(()=>{},ctx,sc,s,i*.1,.1);townLife(()=>{},ctx,sc,s,i*.1,.1);const working=sc.jobs.filter(j=>j.worker&&j.state!=='done');if(new Set(working.map(j=>j.worker.resident.id)).size!==working.length)throw Error('A porter appears on two jobs');}
   ok(sc.people.some(p=>p.resident.deliveries>0),'Named porters complete and remember visible deliveries.');
   ok(JSON.stringify([s.st,s.eq,s.pop,CG.U,CG.armies,CAMP.res.silver,CG.turn])===baseline,'A long working-village animation creates no goods, money, troops or campaign turns.');
   const populated=sc.housing.map(r=>[r.k,r.x,r.y]);s.pop=450;TOWN.scene=null;const quiet=townScene();ok(quiet.housing.length===populated.length&&quiet.housing.some(r=>!r.inhabited),'Earned homes remain as vacant homes after a population drop.');
   return out;
  }));
  await page.evaluate(()=>{const s=CG.T[HOME];s.pop=4800;TOWN.scene=null;showCVil(HOME);cvilFocus('wk',3);});await page.waitForTimeout(300);await page.screenshot({path:'test-results/village-cutaway-workshops.png'});
  await page.setViewportSize({width:430,height:900});await page.evaluate(()=>showCVil(HOME));await page.waitForTimeout(250);assert(!await page.locator('.villageSidebar').isVisible());await page.getByRole('button',{name:'Village',exact:true}).click();await page.locator('.villageSidebar').waitFor({state:'visible'});assert(await page.locator('.villageSidebar').isVisible());await page.getByRole('button',{name:'Village',exact:true}).click();await page.screenshot({path:'test-results/village-cutaway-mobile.png'});checks.push('Phone controls leave the village visible and open management on demand.');
  await page.evaluate(()=>showCamp());assert(await page.evaluate(()=>!document.body.classList.contains('songVillageOpen')&&!document.getElementById('villageResidentCard')));assert.deepEqual(webgl,[]);assert.deepEqual(errors,[]);checks.push('Returning to the map restores its UI; no WebGL renderer is loaded.');
  console.log(JSON.stringify({checks,errors},null,2));
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
