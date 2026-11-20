const {chromium}=require('playwright'),fs=require('node:fs');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(()=>{coachSave({off:1,seen:{}});setLang('en');__sw.cstart();if(CG.evQ)CG.evQ.length=0;const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};
 // Village haulage scene: per-row bitmaps, no whole-atlas draws, smooth carriers, parked idle porters.
 LOGI.force=true;LOGI.on=true;logvPush(HOME,'out',{grain:600,timber:300,silver:100},'soldier',901);showCVil(HOME);
 let atlasDraws=0;const atl=new Set();for(const k in SPR)if(SPR[k]&&SPR[k].img)atl.add(SPR[k].img);const D=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(img){if(img&&atl.has(img)&&this.canvas===cv)atlasDraws++;return D.apply(this,arguments);};
 let devSeen=0;const oldU=sprUnit;sprUnit=function(){if(SPR_DEV>0)devSeen++;return oldU.apply(this,arguments);};
 const V=LOGV[HOME];let flips=0,steps=0,teleports=0,prev=new Map();
 for(let i=0;i<60*25;i++){cvilFrame(1/60);for(const r of V.car){const p=prev.get(r);if(p){if(Math.hypot(r.x-p.x,r.y-p.y)>3)teleports++;const df=Math.abs(sprDir(r.f||0)-sprDir(p.f||0));if(df)flips++;}prev.set(r,{x:r.x,y:r.y,f:r.f});}steps++;if(!V.out.length&&!V.car.length&&!V.drops.length&&i>300)break;}
 CanvasRenderingContext2D.prototype.drawImage=D;sprUnit=oldU;
 ok(devSeen>0&&SPR_DEV===0,'village frames draw sprites from screen-scaled rows and restore SPR_DEV afterwards');
 ok(atlasDraws===0,'no whole-atlas drawImage calls in the haulage scene');
 ok(teleports===0,'carriers never jump more than 3 px in a 1/60 s frame');
 ok(flips/(steps/60)<12,'carrier facing changes stay rare (smoothed heading)');
 ok(!V.out.length&&!V.car.some(r=>r.c),'every queued load is carried to a cart');
 ok(V.carts.every(c=>c.go||c.load>0||c.arr),'carts leave or wait loaded, none stall mid-road');
 // Frame-rate independence: the same 4 s at 30 and 120 fps loads the same amount.
 const run=fps=>{LOGV[HOME]=null;logvPush(HOME,'out',{grain:300},'porter',902);const W=LOGV[HOME];const n0=W.out.length;for(let i=0;i<fps*9;i++)logvStep(HOME,1/fps);return n0-W.out.length-W.car.filter(r=>r.c).length;};
 const a=run(30),b=run(120);ok(a>0&&Math.abs(a-b)<=1,'cart loading is frame-rate independent ('+a+' vs '+b+')');
 // Idle porters stand by the cart instead of wandering.
 LOGV[HOME]=null;logvPush(HOME,'out',{grain:200},'porter',903);for(let i=0;i<60*30&&!LOGV[HOME].car.some(r=>r.idle);i++)logvStep(HOME,1/60);const W=LOGV[HOME];for(let i=0;i<240&&!W.car.some(r=>r.idle&&!r.mv);i++)logvStep(HOME,1/60);const idle=W.car.filter(r=>r.idle&&!r.mv);
 if(idle.length){const pos=idle.map(r=>[r.x,r.y]);for(let i=0;i<30;i++)logvStep(HOME,1/60);ok(idle.every((r,i)=>!r.idle||Math.hypot(r.x-pos[i][0],r.y-pos[i][1])<.5),'idle porters stay parked beside their cart ('+idle.length+')');}else ok(true,'no idle porters left over');
 // Campaign camera glides per second and yields to the player.
 showCamp();CC.z=1;CC.x=0;CC.y=0;CC.tx=800;CC.ty=400;campFrame(1/30);const x30=CC.x;CC.x=0;CC.y=0;CC.tx=800;CC.ty=400;campFrame(1/60);campFrame(1/60);
 ok(Math.abs(CC.x-x30)<x30*.02,'camera easing covers the same ground per second at 30 and 60 fps');
 cv.dispatchEvent(new PointerEvent('pointerdown',{clientX:5,clientY:5}));window.dispatchEvent(new PointerEvent('pointerup'));const xs=CC.x;campFrame(1/60);ok(Math.abs(CC.x-xs)<1e-6||CAMT.x==null,'a drag cancels the camera glide');
 // Map base cache: same picture as the uncached path.
 CC.z=1.2;CC.x=1500;CC.y=600;CAMT.x=CAMT.z=null;const grab=()=>{const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;c.getContext('2d').drawImage(cv,0,0);return c.getContext('2d').getImageData(0,0,c.width,c.height).data;};
 for(let i=0;i<40;i++)campFrame(0);const A=grab();window.__noMapCache=1;campFrame(0);const B=grab();window.__noMapCache=0;let diff=0,n=0;for(let i=0;i<A.length;i+=16){diff+=Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2]);n++;}
 ok(diff/n/3<2,'cached map base matches the original parchment, landscape and vignette ('+(diff/n/3).toFixed(2)+')');
 ok(MAPB.tiles.size>0&&MAPB.tiles.size<=MAPB.max,'map tiles are baked lazily and bounded');
 return checks;});
fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/motion.png'});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
