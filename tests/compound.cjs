// t250 Qinghe compound view: draws for the home village, rooms follow real buildings, the classic village is one click away, scenes fall back.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};const w=ms=>new Promise(r=>setTimeout(r,ms));coachSave({off:1,seen:{}});
 __sw.cstart();if(CG.evQ)CG.evQ.length=0;CPD.on=true;showCVil(HOME);for(let i=0;i<40&&!(CPD.img.compound3_base&&CPD.img.compound3_rooms&&CPD.img.compound_workers);i++)await w(100);
 ok(CPD.img.compound3_base&&CPD.img.compound3_rooms&&CPD.img.compound_workers,'compound art loads for the current tier');ok(cpdUse(),'the home village shows as the compound');
 const s=CG.T[HOME];s.businesses=s.businesses||{};s.businesses.brewery={...(s.businesses.brewery||{}),level:0};ok(!cpdRooms(s).brewery.on,'an unbuilt brewery shows a bare room');
 s.businesses.brewery.level=1;ok(cpdRooms(s).brewery.on,'building the brewery furnishes its room');CAMP.bld.forge=0;ok(!cpdRooms(s).smithy.on,'no forge, bare smithy');CAMP.bld.forge=1;ok(cpdRooms(s).smithy.on,'forge built, smithy furnished');
 await w(300);ok(CVIL.hot.some(h=>/Brewery/.test(h.t)),'each room has a hover note');
 const t0=performance.now();for(let i=0;i<30;i++)cvil8Frame(1/60);const ms=(performance.now()-t0)/30;ok(ms<12,'compound frame '+ms.toFixed(2)+' ms (budget 12)');
 ok(!!$('cpdToggle'),'the village panel has the view toggle');$('cpdToggle').click();ok(!CPD.on&&!cpdUse(),'the toggle returns to the classic village');$('cpdToggle')?.click();ok(CPD.on,'and back to the compound');
 LOGI.cur={kind:'unload'};ok(!cpdUse(),'a haulage scene plays in the classic village');LOGI.cur=null;
 showCVil(Object.keys(CG.T).find(id=>id!==HOME&&owned(id))||HOME);ok(CVIL.id===HOME||!cpdUse(),'other villages keep the classic view');return checks;});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
