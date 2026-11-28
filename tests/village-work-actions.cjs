const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let b;try{b=await chromium.launch(browserOptions());const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(process.argv[2]||url,{waitUntil:'load',timeout:90000});await p.waitForFunction(()=>SONG_BUILDINGS.meta?.buildings.field_autumn);
 await p.evaluate(()=>{coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();CG.evQ=[];CG.turn=1;CG.month=3;const s=CG.T[HOME];s.pop=2000;s.bld.farm=1;s.bld.bowyer=1;s.bld.smithy=1;for(const k of RAW)s.st[k]=1200;CAMP.res.silver=9000;showCVil(HOME);});
 await p.waitForFunction(()=>songBuildingReady('field_spring')&&songBuildingReady('field_autumn')&&SONG_PEOPLE.poses.size===360,null,{timeout:90000});
 const checks=await p.evaluate(()=>{
  const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);},s=CG.T[HOME],sc=townScene(),baseline=JSON.stringify([s.st,s.eq,s.pop,CG.U,CG.armies,CAMP.res.silver,CG.turn,CG.month]),stages=new Set();
  for(let i=0;i<1900;i++){CVIL.hot=[];townEconomy(()=>{},ctx,sc,s,i*.1,.1);townLife(()=>{},ctx,sc,s,i*.1,.1);for(const person of sc.people)if(person._activity)stages.add(person._activity.stage);const tools=sc.people.map(p=>p.resident.tool).filter(Boolean).map(t=>t.owner+':'+t.slot);if(new Set(tools).size!==tools.length)throw Error('A tool is held by two residents');}
  ok(['takeTool','takeInput','placeInput','work','takeOutput','placeOutput','returnTool'].every(k=>stages.has(k)),'Workers physically collect tools, carry inputs to benches, place finished goods on racks and return tools.');
  ok(sc.fields.some(f=>f.patch?.planted>.5),'Named farmers visibly plant rows during spring.');
  ok(JSON.stringify([s.st,s.eq,s.pop,CG.U,CG.armies,CAMP.res.silver,CG.turn,CG.month])===baseline,'Tool use, planting and workshop handling neither grant nor spend campaign resources or time.');
  CG.turn=3;CG.month=3;TOWN.scene=null;showCVil(HOME);const autumn=townScene(),field=autumn.fields[0];townCropPatch(autumn,0);field.patch=townCropPatch(autumn,0);
  const picture=()=>{const c=mkCanvas(480,318),g=c.getContext('2d');g.scale(3,3);g.translate(80-field.x,106-field.y);townPaintField(g,field,autumn);return Array.from(g.getImageData(0,0,480,318).data);},before=picture();
  const resources=JSON.stringify([s.st,s.eq,s.pop,CG.U,CG.armies,CAMP.res.silver,CG.turn,CG.month]);
  for(let i=0;i<1600;i++){CVIL.hot=[];townEconomy(()=>{},ctx,autumn,s,i*.1,.1);townLife(()=>{},ctx,autumn,s,i*.1,.1);}
  ok(field.patch.harvested>.5&&field.patch.bundles.length>0,'Autumn workers cut rows and leave finite harvest bundles for the porters.');
  const after=picture();let changed=0;for(let i=0;i<before.length;i+=4)if(Math.abs(before[i]-after[i])+Math.abs(before[i+1]-after[i+1])+Math.abs(before[i+2]-after[i+2])>35)changed++;
  ok(changed>480*318*.12,'The crop image actually loses harvested rows, rather than leaving a full static field.');
  const production=prodBreak(HOME).rows.find(r=>r.k==='farm').amt;ok(autumn.fields.every(f=>!f.patch||f.patch.bundles.reduce((n,b)=>n+b.n,0)<=Math.floor(production/autumn.fields.length)),'Visible harvest bundles stay within the real farm production plan.');
  ok(JSON.stringify([s.st,s.eq,s.pop,CG.U,CG.armies,CAMP.res.silver,CG.turn,CG.month])===resources,'Watching a harvest does not create extra grain or silver.');
  const progress=field.patch.harvested;saveGame();CAMP=JSON.parse(localStorage.getItem(SAVEKEY));CG=CAMP.cg;showCVil(HOME);ok(townCropPatch(townScene(),0).harvested===progress,'Harvested crop rows remain harvested after save/load.');return out;
 });
 if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
 }finally{if(b)await b.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
