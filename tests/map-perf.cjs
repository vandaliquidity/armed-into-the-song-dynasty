// campaign-map layer cache (map-perf.js): same picture, static layers painted only when the view changes, live layer every frame
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const errors=[];const shots={};
for(const mp of ['0','1']){const page=await browser.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>errors.push(e.stack));await page.goto(url+'?mp='+mp,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
 await page.evaluate(()=>{coachSave({off:1,seen:{}});setLang('both');__sw.cstart();if(CG.evQ)CG.evQ.length=0;CSEL=null;campUI();});await page.waitForTimeout(2500);
 shots[mp]=await page.evaluate(()=>{const c=document.getElementById('cv');const t=document.createElement('canvas');t.width=320;t.height=200;t.getContext('2d').drawImage(c,0,0,320,200);return Array.from(t.getContext('2d').getImageData(0,0,320,200).data);});
 if(mp==='1')shots.checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};const M=__mp.MP,raf=()=>new Promise(r=>requestAnimationFrame(r));
  for(let i=0;i<10;i++)await raf();const b0=M.builds,f0=M.frames;for(let i=0;i<30;i++)await raf();ok(M.frames-f0>=25&&M.builds-b0<=6,'an idle map repaints its static layers rarely ('+(M.builds-b0)+' of '+(M.frames-f0)+' frames)');
  let n=0;const od=drawArmy;drawArmy=function(){n++;return od.apply(this,arguments);};for(let i=0;i<5;i++)await raf();drawArmy=od;ok(n>=5,'armies are drawn every frame from the live layer');
  const grab=()=>{const c=document.getElementById('cv'),t=document.createElement('canvas');t.width=320;t.height=200;t.getContext('2d').drawImage(c,0,0,320,200);return t.getContext('2d').getImageData(0,0,320,200).data;};
  const cmp=(a,b)=>{let d=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>60)d++;return 100*d/(a.length/4);};
  await raf();await raf();const b1=M.builds;for(let i=0;i<6;i++){CC.x+=4;CC.y+=2;M.last=performance.now();await raf();}ok(M.builds-b1<=1,'a short pan slides the cached layer instead of repainting it ('+(M.builds-b1)+' repaints in 6 pan frames)');
  M.last=performance.now();await raf();const slid=grab();M.on=false;await raf();const direct=grab();M.on=true;const pd=cmp(slid,direct);ok(pd<4,'the slid layer matches a direct render at the new camera ('+pd.toFixed(2)+'% differ)');
  const b1b=M.builds;CC.x+=900/CC.z;await raf();await raf();ok(M.builds>b1b,'a long pan repaints the static layer');
  const b1c=M.builds;CC.z*=1.1;await raf();await raf();ok(M.builds>b1c,'zooming repaints the static layer');
  const b2=M.builds;CSEL={t:HOME};campUI();await raf();await raf();ok(M.builds>b2,'selecting a settlement repaints');CSEL=null;campUI();
  const b3=M.builds;CG.layer='trade';campUI();await raf();await raf();ok(M.builds>b3,'switching a strategic layer repaints');CG.layer=null;campUI();
  return checks;});
 await page.close();}
const a=shots['0'],b=shots['1'];let diff=0;for(let i=0;i<a.length;i+=4){if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>60)diff++;}
const pct=100*diff/(a.length/4);if(pct>4)throw Error('cached map differs from the direct render: '+pct.toFixed(2)+'%');const checks=[...shots.checks,'the cached map matches the direct render ('+pct.toFixed(2)+'% of pixels differ, ambient animation only)'];
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));}
finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exit(1);});
