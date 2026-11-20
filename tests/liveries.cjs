// t248b: unit-type liveries (unit cards, re-rendered unified soldiers) and army banner liveries (map + army panel)
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};coachSave({off:1,seen:{}});__sw.cstart();if(CG.evQ)CG.evQ.length=0;campUI();const L=__liv;
 const types=['mil','spear','arch','xbow','cav','fire'];ok(new Set(types.map(L.livType)).size===types.length,'each unit type has its own livery colour');
 const u=newUnit('xbow',50,{loc:{v:'nowhere'}});const c=unitCard(u);ok(c.style.borderLeft.includes('rgb(44, 68, 122)')||c.style.borderLeft.includes('#2c447a'),'unit cards carry the type livery stripe');
 ok(['song_xbow','song_archer','song_cav','song_fire'].every(k=>VU_META.units[k]&&VU_META.units[k].t.md.v),'the unified soldier sprites are re-rendered in their liveries');
 const a=CG.armies[0];const d=L.livOf(a);ok(d.c==='#c8901a'&&d.ch==='林','Lin Feng\'s band flies Qinghe gold with 林 by default');
 let seen=null;const ob=banner;banner=function(g,x,y,col,ch){seen=[col,ch];};try{drawArmy(document.createElement('canvas').getContext('2d'),a);}finally{banner=ob;}ok(seen&&seen[0]==='#c8901a'&&seen[1]==='林','the map banner uses the band livery');
 CSEL={a:a.id};campUI();const sw=document.querySelector('.sw-liv .sw-sw[data-c="#2c447a"]');ok(sw,'the army panel offers livery colours');sw.click();ok(a.liv&&a.liv.c==='#2c447a','choosing a colour sets the band livery');
 const sel=document.querySelector('.sw-liv select');sel.value='忠';sel.dispatchEvent(new Event('change'));ok(a.liv.ch==='忠'&&a.liv.c==='#2c447a','choosing an emblem keeps the colour');
 saveGame();CAMP=loadGame();campLoad();ok(L.livOf(CG.armies.find(x=>x.id===a.id)).ch==='忠','the livery is kept in the save');
 CG.off=CG.off||{};CG.off.hansz={hired:true,loy:60,lvl:1,wins:0};offLead('hansz',HOME);const b=CG.armies.find(x=>x.off==='hansz');ok(b&&L.livOf(b).ch==='韩','an officer\'s band takes his surname as emblem');
 return checks;});
await page.evaluate(()=>{CSEL={a:CG.armies[0].id};focusOn(HOME);CC.z=CC.tz=2.2;campUI();});await page.waitForTimeout(1500);await page.screenshot({path:'/workspace/sw-notes/shots/b3d_t248b_army_livery.png'});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));}
finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exit(1);});
