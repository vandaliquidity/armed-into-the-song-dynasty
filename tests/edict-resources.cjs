const {chromium}=require('playwright'),fs=require('node:fs');
const {startServer,browserOptions}=require('./server.cjs');
(async()=>{
 const {server,url}=await startServer();let browser;
 try{
  browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));
  const ok=(x,m)=>{if(!x)throw Error(m);checks.push(m);};
  await page.goto(url,{waitUntil:'networkidle'});
  await page.evaluate(()=>{setLang('en');coachSave({off:0,seen:{}});__sw.cstart();issueEdict();issueEdict();edictStart();});
  const before=await page.evaluate(()=>({queue:CG.fav.q.length,silver:CAMP.res.silver,pointer:getComputedStyle($('cEdictB')).pointerEvents}));
  ok(before.pointer==='auto','edict acknowledgement accepts pointer input');
  await page.locator('#cEdictB').click();
  ok(await page.evaluate(()=>!EDICT&&CG.fav.q.length===1),'one real mouse click acknowledges exactly one edict');
  ok(await page.evaluate(silver=>CAMP.res.silver===silver,before.silver),'acknowledgement does not duplicate the already-issued gifts');
  await page.setViewportSize({width:1100,height:720});
  await page.evaluate(()=>{edictStart();EDICT.t=ED_END+30;});await page.waitForTimeout(200);
  ok(await page.evaluate(()=>!!EDICT),'ceremony waits for acknowledgement after the old automatic timeout');
  fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/edict-acknowledgement.png'});
  await page.locator('#cEdictB').click();
  ok(await page.evaluate(()=>!EDICT&&!CG.fav.q.length),'acknowledgement is clickable at 1100 by 720');
  await page.evaluate(()=>{issueEdict();edictStart();});await page.locator('#cEdictB').press('Enter');
  ok(await page.evaluate(()=>!EDICT&&!CG.fav.q.length),'focused acknowledgement also works with Enter');
  await page.evaluate(()=>{issueEdict();edictStart();});await page.keyboard.press('Escape');
  ok(await page.evaluate(()=>MODE==='camp'&&!EDICT&&CG.fav.q.length===1),'leaving the ceremony preserves the unacknowledged edict for later');
  const resource=await page.evaluate(()=>{coachSave({off:1,seen:{}});__sw.cstart();settleUI(HOME,'over');return{silver:CAMP.res.silver,timber:CG.T[HOME].st.timber,node:NODES.find(n=>n.terr===HOME&&n.k==='timber').id};});
  await page.locator('#cResourceSites [data-out="'+resource.node+'"]').click();
  const developed=await page.evaluate(nid=>({silver:CAMP.res.silver,timber:CG.T[HOME].st.timber,working:nodeOk(NODES.find(n=>n.id===nid)),yield:prodBreak(HOME).y.timber}),resource.node);
  ok(developed.silver===resource.silver-40&&developed.timber===resource.timber-60,'outpost development costs exactly 40 silver and 60 timber');
  ok(developed.working,'developed and supplied resource site is active');
  await page.screenshot({path:'test-results/resource-site-help.png'});
  const monthly=await page.evaluate(()=>{const before=CG.T[HOME].st.timber;CG.phase=3;endTurn();const first=CG.T[HOME].st.timber;CG.phase=3;endTurn();const second=CG.T[HOME].st.timber;CG.phase=3;endTurn();const used=Object.entries(CG.report.made||{}).reduce((sum,[k,n])=>sum+Math.ceil((RECIPE[k]?.timber||0)*n/100),0);return{before,first,second,after:CG.T[HOME].st.timber,used};});
  ok(monthly.first===monthly.before&&monthly.second===monthly.before,'resource output is not granted early during months 1 and 2');
  ok(monthly.after+monthly.used===monthly.before+developed.yield,'season end delivers full local output, accounting for workshop consumption');
  ok(await page.evaluate(nid=>{SUPP.delete(HOME);const paused=!nodeOk(NODES.find(n=>n.id===nid));campRefresh();return paused;},resource.node),'cut-off resource sites pause production');
  ok(await page.evaluate(()=>treasuryContents(0,0).length===0&&treasuryContents(5,50).length===2&&treasuryContents(50,500).length>2),'visible treasury trays reflect the actual gold and silver reserves');
  await page.setViewportSize({width:1440,height:900});
  await page.evaluate(()=>{showCVil(HOME);cvilFocus('treasury',2.2);});await page.waitForTimeout(500);await page.screenshot({path:'test-results/treasury-cutaway.png'});
  const audio=await page.evaluate(async()=>{
   const saved={ac:AC,bus:MUS.bus,mode:MUS.mode,timer:MUS.timer};if(MUS.timer)clearInterval(MUS.timer);
   const outputs=[];
   try{for(const mode of ['calm','battle','intense']){
    const seconds=8*16*60/MSTYLE[mode].bpm/4+6,rate=22050,offline=new OfflineAudioContext(1,Math.ceil(seconds*rate),rate);
    AC=offline;MUS.bus=offline.createGain();MUS.bus.gain.value=.35;MUS.bus.connect(offline.destination);MUS.mode=mode;
    for(let bar=0;bar<8;bar++)for(let step=0;step<16;step++)musStep((bar*16+step)*60/MSTYLE[mode].bpm/4,step,bar);
    const result=await offline.startRendering(),samples=result.getChannelData(0);let peak=0,sum=0,finite=true;
    for(const v of samples){if(!Number.isFinite(v))finite=false;peak=Math.max(peak,Math.abs(v));sum+=v*v;}
    outputs.push({mode,peak,rms:Math.sqrt(sum/samples.length),finite});
   }}finally{AC=saved.ac;MUS.bus=saved.bus;MUS.mode=saved.mode;MUS.timer=saved.timer?setInterval(musTick,80):null;}
   return outputs;
  });
  for(const x of audio)ok(x.finite&&x.rms>.0001&&x.peak<.95,x.mode+' score renders audible finite audio without clipping');
  await page.evaluate(()=>showCamp());await page.locator('#cMusicB').click();
  ok(!!await page.locator('#songMusicPanel').count(),'campaign music controls open');
  await page.locator('#songMusicPanel input').fill('0.3');
  ok(await page.evaluate(()=>Math.abs(MUS.vol-.3)<.001),'new music respects volume control');
  console.log(JSON.stringify({checks,audio,errors},null,2));if(errors.length)throw Error('Browser errors');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
