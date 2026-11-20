// t249: one upkeep ledger, one odds model, one way to count Chapter 1 forces.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};const wait=ms=>new Promise(r=>setTimeout(r,ms));
 coachSave({off:1,seen:{}});setLang('en');__sw.cstart();if(CG.evQ)CG.evQ.length=0;campUI();
 const L=realmLedger();ok(L.upkeep.grain===Math.round(L.troops.grain+L.villages.grain),'upkeep = troop pay + village upkeep');
 const v=document.getElementById('cLedgerUp');ok(v&&v.textContent.includes('-'+L.upkeep.grain)&&v.textContent.includes(String(Math.round(L.net.grain))),'the realm panel quotes the ledger total and the same net as the top bar');
 const tile=[...document.querySelectorAll('.resource-tile')].find(t=>/Grain/.test(t.textContent));ok(tile&&tile.textContent.includes(String(Math.round(L.net.grain))),'the top bar grain delta is the ledger net');
 settleUI(HOME,'over');ok(!!document.getElementById('cUpkeepRealm'),'the village upkeep box says it is one village and gives the realm figure');document.getElementById('cSet')?.remove();
 // odds: autoOdds matches a large Monte Carlo of the auto-resolve rule
 const P=100,E=88;let w=0;for(let i=0;i<20000;i++)if(P*rnd(.85,1.15)>E*1.1*rnd(.85,1.15))w++;ok(Math.abs(autoOdds(P,E)-w/20000)<.02,'quoted odds match the auto-resolve rule');
 const a=CG.armies[0],to=Object.keys(CG.T).find(id=>CG.T[id].own==='xia'&&CADJ[a.loc].includes(id))||Object.keys(CG.T).find(id=>CG.T[id].own==='xia');
 rtsConfirm([a],to);await wait(50);const d=document.getElementById('cAtk');const q={type:'atk',army:a.id,terr:to};const card=Math.round(battleForecast(q).win*100);
 ok(d&&+d.dataset.odds===card,'attack confirm and battle card quote the same odds ('+(d&&d.dataset.odds)+'% / '+card+'%)');d&&d.remove();
 // chapter 1 counts
 showBrief(0);ok(!!document.getElementById('cLesForces')||!lessonOn(),'the Chapter 1 briefing states the lesson forces in figures and men');
 ok(/forty Xia figures/.test(LLS.intro.en)&&/160 men/.test(LLS.intro.en),'scout report counts figures and men like the HUD');
 return checks;});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
