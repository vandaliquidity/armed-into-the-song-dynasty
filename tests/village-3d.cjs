const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {startServer,browserOptions}=require('./server.cjs');
(async()=>{
 const {server,url}=await startServer();let browser;const checks=[];
 try{
  browser=await chromium.launch({...browserOptions(),args:['--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
  page.on('pageerror',e=>{errors.push(e.stack);console.error(e.stack);});page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
  await page.goto(process.argv[2]||url,{waitUntil:'load'});
  await page.evaluate(()=>{coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();CG.evQ=[];CG.T[HOME].bld.stable=1;CG.T[HOME].st.horse=60;showCVil(HOME);});
  await page.waitForFunction(()=>VILLAGE_3D.ready||VILLAGE_3D.failed,null,{timeout:120000});
  assert(await page.evaluate(()=>VILLAGE_3D.ready),'3D starts with locally hosted models');
  await page.waitForFunction(()=>VILLAGE_3D.view.renderer.info.render.frame>4);
  checks.push(await page.evaluate(()=>{
   const v=VILLAGE_3D.view,sc=townScene();if(!v.renderer.getContext()||!v.models.pick.length||!v.actorRoot.children.some(m=>m.isInstancedMesh))throw Error('Missing real WebGL geometry');
   if(v.models.pick.some(p=>!p.r.built))throw Error('An unbuilt building was displayed');
   if(v.renderer.info.render.calls>230)throw Error('Too many draw calls');
   return 'Default village uses solid WebGL buildings and instanced articulated people; unbuilt structures stay hidden.';
  }));
  const before=await page.evaluate(()=>VILLAGE_3D.view.camera.position.toArray());
  await page.mouse.move(670,470);await page.mouse.down();await page.mouse.move(920,510,{steps:14});await page.mouse.up();await page.waitForTimeout(300);
  const after=await page.evaluate(()=>VILLAGE_3D.view.camera.position.toArray());assert(Math.hypot(...after.map((n,i)=>n-before[i]))>5);checks.push('Dragging orbits the actual 3D camera.');
  const distance=await page.evaluate(()=>VILLAGE_3D.view.camera.position.distanceTo(VILLAGE_3D.view.controls.target));await page.mouse.wheel(0,-450);await page.waitForTimeout(350);assert(await page.evaluate(d=>VILLAGE_3D.view.camera.position.distanceTo(VILLAGE_3D.view.controls.target)<d,distance));
  const target=await page.evaluate(()=>VILLAGE_3D.view.controls.target.toArray());await page.mouse.move(600,500);await page.mouse.down({button:'right'});await page.mouse.move(740,540,{steps:10});await page.mouse.up({button:'right'});await page.waitForTimeout(250);assert(await page.evaluate(t=>VILLAGE_3D.view.controls.target.toArray().some((n,i)=>Math.abs(n-t[i])>.3),target));checks.push('Wheel zoom and right-drag pan work through the real controls.');
  await page.getByRole('button',{name:'Roofs',exact:true}).click();assert(await page.evaluate(()=>VILLAGE_3D.view.models.roofMeshes.every(m=>!m.visible)));await page.getByRole('button',{name:'Roofs',exact:true}).click();
  await page.getByRole('button',{name:'Treasury',exact:true}).click();await page.waitForTimeout(150);assert(await page.evaluate(()=>Math.abs(VILLAGE_3D.view.controls.target.x-townScene().byKey.treasury.x*.05)<1));checks.push('Roof cutaway and existing district buttons control the 3D scene.');
  checks.push(await page.evaluate(()=>{const v=VILLAGE_3D.view,s=CG.T[HOME],baseline=JSON.stringify([s.st,s.eq,CG.U,CG.armies,CAMP.res.silver,CG.turn,CG.month]),sc=townScene(),first=sc.horses.map(h=>[h.x,h.y]);for(let i=0;i<35;i++)v.frame(.1);if(JSON.stringify([s.st,s.eq,CG.U,CG.armies,CAMP.res.silver,CG.turn,CG.month])!==baseline)throw Error('Rendering changed the economy');if(!sc.horses.some((h,i)=>Math.hypot(h.x-first[i][0],h.y-first[i][1])>1))throw Error('Horses do not move');return 'Animated horses, workers and cargo do not create/spend stock, troops or campaign time.';}));
  await page.screenshot({path:'test-results/village-3d-treasury.png'});
  await page.getByRole('button',{name:'2D',exact:true}).click();assert(await page.evaluate(()=>getComputedStyle(VILLAGE_3D.view.canvas).display==='none'&&cv.style.pointerEvents!=='none'));await page.getByRole('button',{name:'3D',exact:true}).click();
  await page.evaluate(()=>showCamp());assert(await page.evaluate(()=>getComputedStyle(VILLAGE_3D.view.canvas).display==='none'&&!document.getElementById('village3DTools')&&cv.style.pointerEvents!=='none'));await page.evaluate(()=>showCVil(HOME));await page.waitForFunction(()=>getComputedStyle(VILLAGE_3D.view.canvas).display!=='none',null,{timeout:15000});assert(await page.evaluate(()=>getComputedStyle(VILLAGE_3D.view.canvas).display!=='none'));checks.push('2D fallback and returning to the campaign restore the correct canvas and input.');
  await page.getByRole('button',{name:'Reset',exact:true}).click();await page.screenshot({path:'test-results/village-3d-gate.png'});
  await page.setViewportSize({width:430,height:900});await page.waitForTimeout(300);assert(await page.evaluate(()=>VILLAGE_3D.view.width===VW&&VILLAGE_3D.view.canvas.clientWidth===VW));await page.screenshot({path:'test-results/village-3d-phone.png'});await page.getByRole('button',{name:'Village',exact:true}).click();assert(await page.locator('.village3DSidebar').isVisible());await page.getByRole('button',{name:'Village',exact:true}).click();assert(!await page.locator('.village3DSidebar').isVisible());checks.push('The phone viewport leaves the village visible and its management panel opens on demand.');
  assert.deepEqual(errors,[]);
  const fallback=await browser.newPage();await fallback.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(name,...args){if(name==='webgl2')return null;return old.call(this,name,...args);};});await fallback.goto(process.argv[2]||url,{waitUntil:'load'});await fallback.evaluate(()=>{coachSave({off:1,seen:{}});LOGI.on=false;__sw.cstart();CG.evQ=[];showCVil(HOME);});await fallback.waitForFunction(()=>VILLAGE_3D.failed);assert(await fallback.evaluate(()=>MODE==='cvil'&&cv.style.pointerEvents!=='none'));checks.push('Devices without WebGL2 retain the working 2D village.');
  console.log(JSON.stringify({checks,errors},null,2));
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
