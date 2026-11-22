const {chromium}=require('playwright'),fs=require('node:fs');
const {startServer,browserOptions}=require('./server.cjs');
(async()=>{
 const {server,url}=await startServer();let browser;
 try{
  browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.stack));await page.goto(url,{waitUntil:'networkidle'});
  await page.evaluate(()=>{coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();CG.month=2;});
  await page.locator('#cMissionsB').click();await page.locator('#missionJourney').click();await page.locator('[data-choice="community"]').click();await page.locator('[data-choice="gorge"]').click();
  fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/journey-promise.png'});
  await page.locator('[data-choice="rescue"]').click();await page.getByText('Escort the convoy',{exact:true}).click();
  await page.waitForTimeout(500);await page.screenshot({path:'test-results/journey-ambush.png'});
  const checks=await page.evaluate(()=>{
   const checks=[],ok=(v,m)=>{if(!v)throw Error(m);checks.push(m);};
   B.paused=true;
   ok(B.journey&&B.W===64&&B.carts.length===3,'UI launches a distinctive gorge escort, not an occupation battle');
   ok(CG.journey.prep==='community'&&CG.journey.priority==='rescue'&&CG.journey.trust===1,'preparation and rescue promise persist');
   const c=B.carts[0];c.x=B.W*.46*TS;const x=c.x;updCart(c,1);ok(c.x===x,'rescue pledge actually holds the convoy at the hamlet');
   for(const c of B.carts)c.x=(B.W-4)*TS;
   ok(!B.win(),'arrival alone cannot fulfil a rescue pledge');B.hamlet.done=true;ok(B.win(),'rescue and arrival satisfy the mission');
   const a=journeyLeader(),u=armyUnits(a)[0],n=u.men;const t=UT[u.type].eng;
   const casualties=B.units.filter(v=>v.team===0&&v.type===t&&!v.cart).slice(0,2);for(const v of casualties)v.dead=true;
   const ammo=CAMP.mod.ammo;B.mod.ammo=Math.max(0,ammo-7);B.used.ammo=7;B.over={win:true};endSkirm();
   ok(CG.journey.stage==='market'&&u.men<n&&u.wnd>0,'escort losses become real campaign casualties and wounded');
   ok(CAMP.mod.ammo===Math.max(0,ammo-7),'spent modern ammunition is retained');
   ok(!CAMP.done.includes(1)&&!CG.trade.qinzhou,'battle alone does not grant chapter completion or open trade');
   return checks;
  });
  await page.waitForSelector('[data-choice="fair"]');await page.screenshot({path:'test-results/journey-market.png'});
  await page.locator('[data-choice="fair"]').click();await page.locator('[data-choice="hospital"]').click();
  checks.push(...await page.evaluate(()=>{
   const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};const j=journeyState();
   ok(j.stage==='complete'&&j.recruited&&CG.off.luwan.hired,'trust recruits Lu Wan into the real officer system');
   ok(hospLv(HOME)===1&&CG.trade.qinzhou&&CAMP.done.includes(1),'homecoming builds an actual hospital and opens story trade');
   const silver=CAMP.res.silver,horse=CG.T[HOME].st.horse,pop=CG.T[HOME].pop;
   ok(!journeyChoice('fair')&&!journeyChoice('hospital')&&CAMP.res.silver===silver&&CG.T[HOME].st.horse===horse&&CG.T[HOME].pop===pop,'repeat choices cannot duplicate rewards');
   saveGame();CAMP=loadGame();campLoad();ok(CG.journey.stage==='complete'&&CG.off.luwan.hired,'journey and recruited character survive save/load');
   journeyUI();return out;
  }));
  await page.screenshot({path:'test-results/journey-homecoming.png'});
  // Different route geometries and convoy stats; a failed expedition cannot create trade.
  for(const route of ['road','pasture']){
   checks.push(...await page.evaluate(async route=>{
    const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};B=null;__sw.cstart();CAMP.res.silver=1000;CG.T[HOME].st.grain=1000;CG.T[HOME].st.timber=1000;
    journeyChoice('convoy');journeyChoice(route);journeyChoice('cargo');journeyStartBattle();B.paused=true;
    ok(B.W===JOURNEY_ROUTES[route].width&&B.H===JOURNEY_ROUTES[route].height&&B.carts[0].maxhp===1100,route+' changes terrain and honours reinforced wagons');
    const c=B.carts[0],x=c.x;rebuildHash();updCart(c,.5);ok(c.x>x,route+' wagons start moving forward without reversing into one another');
    for(const p of B.road)ok(freeTile(Math.round(p.x/TS),Math.round(p.y/TS)),route+' road tile is navigable');
    for(const u of B.units)if(u.team===1)u.dead=true;rebuildHash();
    for(let i=0;i<6000&&!B.win();i++)for(const wagon of B.carts)updCart(wagon,.1);
    ok(B.win()&&B.carts.every(c=>c.x>(B.W-5)*TS),route+' all wagons naturally reach the destination without blocking each other');
    // Pausing does not alter the strategic state; unfinished encounters can be relaunched after load.
    B=null;MODE='camp';saveGame();CAMP=loadGame();campLoad();ok(CG.journey.stage==='ambush'&&journeyStartBattle(),'unfinished '+route+' encounter resumes safely after load');
    B.paused=true;B.over={win:false};endSkirm();await new Promise(r=>setTimeout(r,20));
    ok(CG.journey.stage==='setback'&&!CG.trade.qinzhou&&!CAMP.done.includes(1),'failed '+route+' expedition grants no chapter rewards');
    return out.filter(s=>!s.includes('road tile'));
   },route));
  }
  checks.push(...await page.evaluate(()=>{
   const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};
   B=null;__sw.cstart();delete CG.journey;CAMP.done.push(1);CG.trade.qinzhou=1;CAMP.res.silver=1000;CG.T[HOME].st.grain=1000;CG.T[HOME].st.timber=1000;
   ok(journeyState().legacy,'old chapter-complete saves receive a new expedition without resetting progress');
   const s=CAMP.res.silver,g=CG.T[HOME].st.grain;CG.phase=3;ok(!journeyChoice('convoy')&&CAMP.res.silver===s&&CG.T[HOME].st.grain===g,'departures outside Planning are blocked without charging');CG.phase=0;
   journeyChoice('convoy');journeyChoice('road');journeyChoice('cargo');CG.journey.result={carts:1,saved:0,rescued:false};CG.journey.stage='market';
   journeyChoice('hard');const silver=CAMP.res.silver;journeyChoice('market');
   ok(!CG.off.luwan?.hired&&CG.journey.trust===0&&CG.journey.stage==='complete','a profit-first expedition can finish without recruiting Lu Wan');
   ok(CAMP.done.filter(x=>x===1).length===1&&CAMP.res.silver===silver,'legacy completion neither duplicates chapter flags nor original chapter cash');
   offUI();ok(!!document.querySelector('#cOff [data-o="luwan"]'),'new character renders in the existing officer interface');
   return out;
  }));
  console.log(JSON.stringify({checks,errors},null,2));if(errors.length)throw Error('Browser errors');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
