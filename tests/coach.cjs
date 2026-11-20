// t249 coach: docks clear of dialogs, pauses between lessons, steps finish on the real action, trade text matches the tab.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:813}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};const wait=ms=>new Promise(r=>setTimeout(r,ms));
 coachSave({seen:{}});setLang('en');__sw.cstart();CG.tut=6;if(CG.evQ)CG.evQ.length=0;campUI();
 ok(!/\bsell\b|Xia|tea and silk|buy or sell/i.test(LCO.steps.trade.p.map(p=>p.en).join(' ')),'trade lesson no longer promises selling to the Xia');
 // a lesson runs, then the next waits
 CO.cur=null;CO.lastEnd=-1e9;await wait(400);ok(!!CO.cur,'a coach lesson starts when its feature is visible ('+(CO.cur&&CO.cur.id)+')');const first=CO.cur.id;coachDone(first);await wait(600);
 ok(!CO.cur||CO.cur.id==='fight','the next lesson waits '+COACH_GAP+' s instead of chaining immediately');CO.lastEnd=-1e9;await wait(400);ok(!!CO.cur&&CO.cur.id!==first,'after the pause the queued lesson starts ('+(CO.cur&&CO.cur.id)+')');
 // dock: open a modal and check the bubble does not cover it
 const m=document.createElement('div');m.className='panel modal';m.style.cssText='position:fixed;left:400px;top:200px;width:640px;height:420px;z-index:10';document.body.appendChild(m);await wait(400);
 const b=document.getElementById('coBub').getBoundingClientRect(),r=m.getBoundingClientRect();const ov=Math.max(0,Math.min(b.right,r.right)-Math.max(b.left,r.left))*Math.max(0,Math.min(b.bottom,r.bottom)-Math.max(b.top,r.top));
 ok(ov===0,'the coach bubble docks clear of an open dialog');m.remove();
 // move step completes on the right-click command even when it opens an attack confirm
 const mv=COACH_DEF.find(d=>d.id==='move');coachStart(mv);CO.part=1;CO.acts.move++;ok(mv.parts[1].done(),'issuing a march or attack order completes the Moving armies step');
 const tr=COACH_DEF.find(d=>d.id==='trade');coachStart(tr);CO.part=2;cpUI('trade');CAMP.res.silver-=12;ok(tr.parts[2].done(),'a purchase completes the trade step');
 return checks;});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
