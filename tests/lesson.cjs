// t249: chapter 1 lesson balance. Forty raiders; hints spaced out; following the lesson wins, idling loses.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};
 const play=pol=>{coachSave({off:1,seen:{}});setLang('en');CAMP=newCampaign();beginBattle(0,{lesson:true,noTut:true});const L=B.les,a={},hints=[];let foes=0;
  const sq=t=>B.squad.find(u=>u.type===t&&!u.dead&&!u.downed);
  for(let i=0;i<30*400&&!B.over;i++){
   if(pol==='lesson'){
    if(L.i===0){B.selU=new Set(groupUnits('xbow'));syncSel();}
    if(L.i===1&&!a.c){a.c=1;cmdMove(groupUnits('xbow'),L.cover.x,L.cover.y,true);}
    if(L.i===2)B.form.xbow=true;
    if(L.i===3&&!a.m){a.m=1;cmdMove(groupUnits('militia'),B.key.x,B.key.y+40,true);}
    if(L.i===4){const e=sq('eng');if(e){if(!a.e){a.e=1;cmdMove([e],L.west.x+30,L.west.y,true);}if(Math.hypot(e.x-L.west.x-30,e.y-L.west.y)<60){e.face=Math.PI;useSkillE(e,{x:L.west.x,y:L.west.y});}}}
    if(L.i>=5&&!a.sq){a.sq=1;cmdMove(B.squad.filter(q=>q.type!=='eng'),L.cover.x,L.cover.y+30,true);}
    if(L.used.comms&&!a.rf&&B.t-(a.ft||(a.ft=B.t))>3){a.rf=1;cmdMove(groupUnits('xbow'),L.cover.x,L.cover.y,true);}
    if(L.hint){const u=sq({deadeye:'marks',cry:'lead',revive:'medic',flare:'comms'}[L.hint]);
     if(u&&u.skE<=0){if(L.hint==='deadeye'&&L.cap&&Math.hypot(u.x-L.cap.x,u.y-L.cap.y)>700){if(!a.mv||B.t-a.mv>1){a.mv=B.t;cmdMove([u],L.cap.x,L.cap.y,true);}}
      else{const m=L.hint==='deadeye'&&L.cap?L.cap:L.hint==='flare'?L.fpt:L.hint==='revive'?(B.squad.find(q=>q.downed)||u):u;useSkillE(u,{x:m.x,y:m.y});}}}}
   if(L.hint&&L.hint!==a.h)hints.push(B.t);a.h=L.hint;if(B.wave>=0&&!foes)foes=B.units.filter(u=>u.team===1&&u.kind!=='struct').length;updateBattle(1/30);}
  const r={win:!!(B.over&&B.over.win),foes,hints,left:B.units.filter(u=>u.team===1&&!u.dead&&u.kind!=='struct').length,keyHp:B.key.dead?0:B.key.hp};B.over=B.over||{win:false};MODE='title';return r;};
 const w=play('lesson');ok(w.foes===40,'the chapter 1 assault has forty raiders in total ('+w.foes+')');
 ok(w.win,'following the lesson (earthwork, volley, cheval-de-frise, skills on cue) wins');
 ok(w.hints.every((t,i)=>!i||t-w.hints[i-1]>=LES_HINT_GAP-.05),'skill hints are at least '+LES_HINT_GAP+' s apart');
 const idle=play('idle');ok(!idle.win,'standing idle still loses the granary');
 ok(CH1_ASSAULT.N.concat(CH1_ASSAULT.W,CH1_ASSAULT.NE).reduce((a,b)=>a+b,0)+1===40,'the non-lesson chapter 1 assault also totals forty');
 ok(/forty Xia figures/.test(LLS.intro.en)&&/四十/.test(LLS.intro.zh),'the scout report says forty Xia figures');
 return checks;});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
