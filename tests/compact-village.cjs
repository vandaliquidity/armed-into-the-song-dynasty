const assert=require('node:assert/strict');
const {chromium}=require('playwright'),{startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{
 browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().startsWith('COMPACT_CHECK'))console.log(m.text());});
 await page.goto(process.argv[2]||url,{waitUntil:'load',timeout:90000});await page.waitForFunction(()=>SONG_BUILDINGS.meta&&SONG_REST.poses.size===48);
 await page.evaluate(()=>{coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();CG.evQ=[];const s=CG.T[HOME];s.pop=3600;s.prosp=65;for(const k of Object.keys(s.bld))s.bld[k]=2;for(const k of Object.keys(DY_BUSINESSES))s.businesses[k]={level:1,paused:false};for(const k of RAW)s.st[k]=1200;CAMP.res.silver=9000;CG.turn=2;CG.month=3;showCVil(HOME);});
 await page.waitForFunction(()=>townScene().present.every(r=>!songBuildingSpec(r)||songBuildingReady(songBuildingKey(r))),null,{timeout:90000});
 const checks=await page.evaluate(()=>{
  const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};let sc=townScene();const s=CG.T[HOME],bounds=sc.streets,aw=VW-360;
  cvil8Frame(0);ok(Math.abs(sc.gate.x*CVIL._sc+CVIL._ox-aw/2)<2,'The south gate opens at the horizontal centre of the village viewport.');
  ok(sc.gate.y===bounds.bottom&&bounds.polygon.length===4&&Math.abs((bounds.right-bounds.left)-(bounds.bottom-bounds.top))<40,'The four-sided wall forms a square with its main exit in the south.');
  const left=sc.byKey['dev:market'],right=sc.byKey['biz:restaurant'];ok(left.x<sc.gate.x&&right.x>sc.gate.x&&Math.abs(left.y-right.y)<50,'The market and restaurant form opposite frontages of the main street.');
  ok(sc.width*sc.height<4800*2600*.75,'The developed town occupies substantially less ground than the previous layout.');
  // Keep the full-town layout check separate from the focused resupply scenario.
  for(const k of WK_ORDER)if(k!=='smithy')s.bld[k]=0;for(const [k,b]of Object.entries(s.businesses))b.paused=k!=='restaurant';TOWN.scene=null;showCVil(HOME);sc=townScene();
  const nav=townNav(),baseline=JSON.stringify([s.st,s.eq,s.pop,CG.U,CAMP.res.silver,CG.turn,CG.month]),positions=new Map(),stages=new Set();
  for(let i=0;i<850;i++){
   townEconomy(()=>{},ctx,sc,s,i*.1,.1);townLife(()=>{},ctx,sc,s,i*.1,.1);
   for(const p of sc.people){if(!p._work||p._work.field!=null||p._busy)continue;if(!villageFree(nav,p.x,p.y))throw Error('Worker entered furniture/wall: '+p.resident.id);const key=p.resident.id;positions.set(key,(positions.get(key)||new Set()).add(Math.round(p.x/8)+','+Math.round(p.y/8)));stages.add(p._activity?.stage);}
  }
  ok([...positions.values()].filter(set=>set.size>8).length>=5,'Workers actually travel between interior tools, benches, goods and resting places.');
  ok(stages.has('sit')&&stages.has('work'),'The same working village contains seated idle staff and active artisans.');
  console.log('COMPACT_CHECK travel complete');s.st.ore=0;for(let i=0;i<600;i++){townEconomy(()=>{},ctx,sc,s,i*.1,.1);townLife(()=>{},ctx,sc,s,i*.1,.1);}
  console.log('COMPACT_CHECK shortage complete');const smith=sc.staffAssignments.get('dev:smithy:0');ok(smith?._activity.stage==='sit'&&smith._work.rest,'A smith without raw materials returns his tool and sits down.');
  s.st.ore=JSON.parse(baseline)[0].ore;const resumed=new Set();for(let i=0;i<1400;i++){townEconomy(()=>{},ctx,sc,s,i*.1,.1);townLife(()=>{},ctx,sc,s,i*.1,.1);resumed.add(smith._activity.stage);}
  ok(resumed.has('takeTool')&&resumed.has('work'),'Restocking makes the same smith collect a tool and resume work.');
  ok(JSON.stringify([s.st,s.eq,s.pop,CG.U,CAMP.res.silver,CG.turn,CG.month])===baseline,'Work, seating and restocking display preserve campaign resources and time.');
  return out;
 });
 // Remove only the test's queued objective call-out through its normal button.
 const callout=page.locator('#vwBar');if(await callout.count())await callout.getByText('OK',{exact:true}).click().catch(()=>{});
 await page.evaluate(()=>{VWX.bar?.o.remove();VWX.bar=null;VWX.queue=[];VWX.cam=null;const r=townScene().byKey['dev:market'];CVIL.fx=townScene().gate.x;CVIL.fy=r.y-100;CVIL.z=.95/Math.min((VW-360)/VWW,VH/VWH);cvil8Frame(0);});
 await page.screenshot({path:'test-results/compact-market-street.png'});
 await page.evaluate(()=>{const r=townScene().byKey['dev:smithy'];CVIL.fx=r.x;CVIL.fy=r.y-60;CVIL.z=2.8/Math.min((VW-360)/VWW,VH/VWH);cvil8Frame(0);});await page.screenshot({path:'test-results/compact-working-smithy.png'});
 await page.setViewportSize({width:430,height:900});await page.evaluate(()=>showCVil(HOME));await page.waitForTimeout(150);
 assert(await page.evaluate(()=>Math.abs(townScene().gate.x*CVIL._sc+CVIL._ox-VW/2)<2));checks.push('The south gate also stays centred on phones.');assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,errors},null,2));
}finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
