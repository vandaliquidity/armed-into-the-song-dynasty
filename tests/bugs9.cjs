// t249 smaller bugs: battle cards clear the tactics panel, name tags do not stack, promotions differ, Ch.2 rescue matters, chapter map moves on.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};coachSave({off:1,seen:{}});setLang('both');
 for(const m in PERKS)for(const r in PERKS[m]){const c=PERKS[m][r];ok(c.length<2||c[0].t!==c[1].t,`${m} rank ${r} offers two different abilities`);}
 CAMP=newCampaign();beginBattle(0,{lesson:true});await new Promise(r=>setTimeout(r,1500));const tb=document.querySelector('.tb-header').parentElement.getBoundingClientRect();
 const sp=cardSpot(520);ok(sp.x+520<=tb.left*VW/innerWidth,'the lesson card ends left of the tactics panel');ok(sp.top>VH*.2+20,'the lesson card sits below the centre banner');
 const sq=B.units.filter(u=>u.kind==='squad'&&!u.dead);const c0=sq[2];sq[0].x=sq[1].x=c0.x;sq[0].y=sq[1].y=c0.y;TAG_FRAME=-1;tagLayout();ok(sq[0]._tagDy!==sq[1]._tagDy||(console.log(JSON.stringify(sq.slice(0,2).map(u=>[u.x,u.y,u._tagDy,u.sd?.zh]))),false),'two squads standing together get separate name tags');
 return checks;});
checks.push(...await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};
 __sw.start(1,{fresh:true});await new Promise(r=>setTimeout(r,300));ok(/required/.test(LORE.chapters[1].goal.en)&&!/bonus/.test(LORE.chapters[1].goal.en),'the Ch.2 goal says the rescue is required');
 for(const c of B.carts)if(!c.dead)c.x=130*TS;B.hamlet.done=false;ok(!B.win()&&!!B.lose(),'convoy through without the rescue is a loss, not a win');
 B.hamlet.done=true;ok(B.win()&&!B.lose(),'convoy through with the Shi clan rescued is a win');
 CAMP=newCampaign();CAMP.next=1;MAP_PICKED=1;SEL_CH=1;showMap();CAMP.next=2;showMap();ok(SEL_CH===2,'after a chapter win the map panel shows the next chapter');return checks;}));
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
