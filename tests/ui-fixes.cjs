// t249 interface fixes: Controls fits and closes with Esc; stale haulage scenes are dropped; Skip all.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:813}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
await page.evaluate(()=>{coachSave({off:1,seen:{}});setLang('en');showTitle();});
await page.locator('#scrTitle .btn',{hasText:'Controls'}).first().click();
const box=await page.locator('#cAlertClose').boundingBox();const checks=[];const ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};
ok(box&&box.y+box.height<=813,'Controls fits a 1440x813 window with Close visible');await page.keyboard.press('Escape');ok(await page.locator('#cAlert').count()===0,'Esc closes the Controls box');
checks.push(...await page.evaluate(()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};__sw.cstart();if(CG.evQ)CG.evQ.length=0;
 LOGI.scenes.push({kind:'unload',id:HOME,sid:-1,m:campaignMonth()-12});LOGI.scenes.push({kind:'unload',id:HOME,sid:-2});LOGI.scenes.push({kind:'unload',id:HOME,sid:-3});LOGI.scenes.push({kind:'unload',id:HOME,sid:-4});
 scenePrune();ok(!LOGI.scenes.some(S=>S.sid===-1),'a scene from a year ago is dropped');ok(LOGI.scenes.length<=SCENE_KEEP,'at most '+SCENE_KEEP+' scenes stay queued');
 LOGI.on=true;LOGI.force=true;logvPush(HOME,'in',{grain:200},'porter',-9);LOGI.scenes=[{kind:'unload',id:HOME,sid:-9}];sceneStart();ok(!!document.getElementById('logiSkipAll'),'the haulage bar offers Skip all');
 LOGI.scenes.push({kind:'unload',id:HOME,sid:-10});sceneSkipAll();ok(!LOGI.cur&&!LOGI.scenes.length,'Skip all clears the current and queued scenes');return checks;}));
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
