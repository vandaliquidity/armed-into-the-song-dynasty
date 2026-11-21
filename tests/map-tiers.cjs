// t248a: Blender-rendered campaign-map settlement tiers (map-tiers.js)
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const errors=[];
const open=async q=>{const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.stack));await page.goto(url+q,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
  await page.evaluate(()=>{coachSave({off:1,seen:{}});__sw.cstart();if(CG.evQ)CG.evQ.length=0;campUI();});await page.waitForFunction(()=>window.__mt&&__mt.MT.img,null,{timeout:30000}).catch(()=>{});return page;};
const page=await open('');
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};const M=__mt;
 ok(M.mtReady()&&M.MT.img&&M.MT.img.naturalWidth>0,'the settlement icon atlas loads ('+M.MT.tier+')');
 const keys=Object.keys(M.MT_META.k);ok(keys.length===19&&keys.every(k=>{const r=M.MT_META.t[M.MT.tier].r[k];return r&&r[2]>4&&r[3]>4;}),'all 19 icons have atlas cells');
 const s=CG.T[HOME],p0=s.prosp,seq=[];for(const p of [0,20,40,70,95]){s.prosp=p;seq.push(M.mtKey(HOME));}s.prosp=p0;
 ok(seq.join()==='v0,v1,v2,v3,v3','a village grows from hamlet to walled village with prosperity ('+seq.join()+')');
 const by=k=>Object.keys(CT).filter(i=>CT[i].kind===k);
 ok(by('city').filter(i=>CG.T[i].own==='xia').every(i=>M.mtKey(i)==='xc'),'Xia cities use the Xia city icon');
 ok(by('city').filter(i=>CG.T[i].own==='song').some(i=>M.mtKey(i)==='c1')&&by('city').filter(i=>CG.T[i].own==='song').some(i=>M.mtKey(i)==='c0'),'Song 府 capitals and prefectural cities differ');
 ok(by('fort').every(i=>M.mtKey(i)===(CG.T[i].own==='xia'?'xf':'f0'))&&by('pass').every(i=>M.mtKey(i)==='p0'),'forts and passes map to their icons');
 ok(Object.keys(CT).every(i=>keys.includes(M.mtKey(i))),'every settlement has an icon');
 // draws: the icon really lands on the canvas, and the overlays (flag, label) still draw
 const c=document.createElement('canvas');c.width=VW;c.height=VH;const g=c.getContext('2d');focusOn(HOME);CC.z=CC.tz=2;await new Promise(r=>setTimeout(r,50));
 let draws=0;const di=g.drawImage.bind(g);g.drawImage=function(){if(arguments[0]&&arguments[0].tagName==='CANVAS')draws++;return di.apply(null,arguments);};
 for(const id in CT)drawTerr(g,id);ok(draws>0,'settlements are drawn from the rendered icons ('+draws+')');
 const q=c2s(tPos(HOME).x,tPos(HOME).y),px=g.getImageData(Math.round(q.x)-20,Math.round(q.y)-20,40,40).data;let a=0;for(let i=3;i<px.length;i+=4)a+=px[i]>0;ok(a>400,'Qinghe village is visible on the map');
 ok(Object.keys(M.MT.C).length>0&&Object.keys(M.MT.C).length<=120,'icons are cached as pre-scaled canvases');
 // bandit stronghold art
 let fd=0;g.drawImage=function(){fd++;return di.apply(null,arguments);};const B=__rs.bdState();rsDrawFort(g,200,200,1.2,B.list[0]);ok(fd>0,'mountain strongholds use the rendered 山寨 icon');
 B.list[0].men=0;rsDrawFort(g,200,200,1.2,B.list[0]);B.list[0].men=90;
 return checks;});
const p2=await open('?mt=0');const off=await p2.evaluate(()=>{const c=document.createElement('canvas').getContext('2d');for(const id in CT)drawTerr(c,id);return {img:!!__mt.MT.img,flag:__mt.mtFlag()};});
if(off.img||off.flag)throw Error('?mt=0 should keep the old glyphs');checks.push('?mt=0 restores the old vector glyphs');
await page.screenshot({path:'test-results/map-tiers.png'});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));}
finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exit(1);});
