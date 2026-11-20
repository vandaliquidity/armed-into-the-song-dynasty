// t248c: officer, chief and bloc-leader portraits (portraits.js)
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');const fs=require('fs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};coachSave({off:1,seen:{}});__sw.cstart();if(CG.evQ)CG.evQ.length=0;campUI();
 ok(LORE.off.list.every(L=>__pt.ptHas(L.id)),'every officer has a portrait ('+LORE.off.list.length+')');
 const im=new Image();await new Promise(r=>{im.onload=im.onerror=r;im.src=getComputedStyle(__pt.ptEl('wujie',60)).backgroundImage.slice(5,-2)||__pt.ptEl('wujie',60).style.backgroundImage.slice(5,-2);});ok(im.naturalWidth>0,'the portrait atlas loads');
 offUI();const n=document.querySelectorAll('#cOff .wk .sw-port').length;ok(n===LORE.off.list.length,'the officers screen shows a portrait on every card ('+n+')');document.getElementById('cOff').remove();
 const sf=sfPanel();ok(sf.querySelectorAll('.sw-fac .sw-port').length===4,'each Song bloc card shows its leader');
 const bd=bdPanel('longshan');ok(bd.querySelector('.sw-port[data-port="bd_longshan"]'),'a stronghold panel shows its chief');
 CAMP.res.silver=5000;CG.off=CG.off||{};CG.off.wujie={hired:true,loy:60,lvl:1,wins:0};if(typeof offLead==='function')offLead('wujie',HOME);const a=CG.armies.find(x=>x.off==='wujie');
 ok(a&&armyPanel(a).querySelector('.sw-porthead .sw-port'),'an army led by an officer shows his portrait');
 return checks;});
fs.mkdirSync('test-results',{recursive:true});await page.evaluate(()=>{offUI();});await page.waitForTimeout(800);await page.screenshot({path:'/workspace/sw-notes/shots/b3d_t248c_officers.png'});
await page.evaluate(()=>{document.getElementById('cOff')?.remove();CSEL={sf:1};campUI();});await page.waitForTimeout(800);await page.screenshot({path:'/workspace/sw-notes/shots/b3d_t248c_factions.png'});
await page.evaluate(()=>{CSEL={bd:'longshan'};campUI();});await page.waitForTimeout(600);await page.screenshot({path:'/workspace/sw-notes/shots/b3d_t248c_chief.png'});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));}
finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exit(1);});
