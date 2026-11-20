// t249 playtest balance: difficulty at New campaign, Xia pressure scales with the realm, conquests settle slowly.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
await page.evaluate(()=>{coachSave({off:1,seen:{}});setLang('en');showTitle();});
await page.locator('#scrTitle .btn',{hasText:'New campaign'}).first().click();await page.waitForSelector('#cDiffPick');
const opts=await page.locator('#cDiffPick [data-diff]').count();await page.locator('#cDiffPick [data-diff="2"]').click();
const checks=await page.evaluate(opts=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};
 ok(opts===3,'New campaign offers Easy, Normal and Hard');ok(CAMP.diff===2&&!document.getElementById('cDiffPick'),'the chosen difficulty is stored on the new campaign');
 CAMP.done=[0];CAMP.next=1;campStart();ok(CG.diff===2,'the campaign starts at the chosen difficulty');showCamp();
 cpUI('court');const cd=document.getElementById('cDiff');ok(!cd||!cd.querySelector('[data-d]'),'Court & government shows the difficulty but cannot change it');
 // pressure scales with size
 const s1=xiaScale();const ids=Object.keys(CG.T).filter(id=>!owned(id)&&CG.T[id].own!=='xia').slice(0,12);for(const id of ids)claimTerr(id,true);campRefresh();const s2=xiaScale();
 ok(s2>s1+.4,'Xia pressure grows with the realm ('+s1.toFixed(2)+' -> '+s2.toFixed(2)+')');
 // raids sized against the defence
 CG.turn=6;let made=0,ok2=true;for(let i=0;i<40;i++){const rep={lines:[]};const n0=CG.xa.length;xiaAI(rep);for(const x of CG.xa.slice(n0))if(owned(x.to)&&!x.story){made++;if(x.str<defPow(x.to)*.8)ok2=false;}CG.xa.length=0;}
 ok(made>5,'a large realm draws regular raids ('+made+' in 40 months)');ok(ok2,'Hard raids are sized against the target defence, not a fixed share');
 // conquest settles slowly; sites and trade pay more
 const id=ids[0];CG.T[id].conq=campaignMonth();const f0=conqFactor(id);CG.month=1;const m=campaignMonth;campaignMonth=()=>m()+12;const f1=conqFactor(id);campaignMonth=m;
 ok(f0===BAL.conq0&&f1===BAL.conqMax,'a fresh conquest yields '+f0*100+'% and settles to '+f1*100+'%');
 ok(prodBreak(HOME).siteMul===BAL.siteMul,'resource sites are boosted');
 const lv=Object.values(CG.U).filter(u=>u.levy);ok(lv.reduce((a,u)=>a+u.men,0)===ids.length*BAL.levyMen,'each conquest leaves its local levies on the pay roll');
 const u0=upkeep().silver;for(const u of lv)u.levy=0;const u1=upkeep().silver;for(const u of lv)u.levy=1;ok(u0>u1,'levies cost silver upkeep');
 const t=ids[1];CG.T[t].stock={grain:1000};const g=lootStock(t,.5,'__none');ok(!g.grain||g.grain<=260,'capture loot share is halved');
 return checks;},opts);
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
