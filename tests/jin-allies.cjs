const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');const fs=require('node:fs');
(async()=>{const {server,url}=await startServer();let b;try{b=await chromium.launch(browserOptions());const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(url,{waitUntil:'load'});
 const sim=`const setAbs=M=>{const cm=M-historyStartYear()*12+1;CG.turn=Math.floor((cm-1)/3)+1;CG.month=(cm-1)%3+1;};
 window.__jaSim=(prof)=>{coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();if(CG.evQ)CG.evQ.length=0;CG.supplyAuto=false;
  for(const id of Object.keys(CG.U)){const u=CG.U[id];if(u.tm!==1)u.men=0;}
  for(let i=0;i<prof.companies;i++)newUnit('spear',100,{loc:{v:'kaifeng'}});
  if(prof.diplo){const R=sfState().rel,T=stState(),S=siState();for(const k in SF_DEF){R[k]=prof.diplo;S.bk[k]=60;T.wr[k]=10;T.stance[k]='court';}
   const H=__hd.state();let n=0;for(const t of CL.terr){if(n>=prof.trib)break;if(CG.T[t.id].own==='song'&&sfOf(t.id)&&t.id!=='kaifeng'){H.trib[t.id]={on:true,since:1,paid:0,k:sfOf(t.id)};n++;}}}
  if(prof.hostile)for(const k of prof.hostile){sfState().rel[k]=-80;stState().stance[k]='threat';stState().wr[k]=90;}
  const before=__ja.sources();for(let M=1125*12+8;M<=1127*12+3&&!jinState().outcome;M++){setAbs(M);jinTick();}
  return {outcome:jinState().outcome,before,c:CG.ja.c.length};};`;
 await p.evaluate(sim);
 const checks=await p.evaluate(()=>{const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};
  const mil=__jaSim({companies:17});ok(mil.outcome==='averted'&&mil.c===0,'Sim: a pure military player with a large army at Kaifeng holds the capital alone');
  const weak=__jaSim({companies:9});ok(weak.outcome==='fallen','Sim: the same player with half the army and no friends loses Kaifeng');
  const dip=__jaSim({companies:3,diplo:90,trib:4});ok(dip.outcome==='fallen'&&dip.before.friendly<=dip.before.own,'Sim: a pure diplomat/trader with a token army cannot win; allies never exceed the own army');
  const mix=__jaSim({companies:9,diplo:90,trib:4});ok(mix.outcome==='averted'&&mix.c>=5,'Sim: a strong mix (half the army plus allies and tributaries) holds Kaifeng');
  ok(mix.before.help.some(h=>h.k==='trib')&&mix.before.help.filter(h=>h.k!=='trib').length===4,'Allied blocs and tributaries each pledge a contingent');
  const host=__jaSim({companies:9,hostile:['liu','tong']});ok(host.outcome==='fallen'&&host.before.defect.length===2&&host.before.jin>weak.before.jin,'Hostile blocs defect and swell the Jin host');
  return out;});
 checks.push(...await p.evaluate(()=>{const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();if(CG.evQ)CG.evQ.length=0;
  const s0=__ja.sources();ok(s0.own>0&&s0.friendly===0&&s0.blocs.every(b=>b.tier==='watch'),'At the start Qinghe stands alone: blocs only watch');
  const k='liu';sfState().rel[k]=60;siState().bk[k]=40;stState().stance[k]='court';ok(__ja.standing(k)>=__ja.JA.COMMIT&&__ja.sources().blocs.find(b=>b.k===k).tier==='commit','High standing makes a bloc commit troops');
  __hd.war(k);ok(__ja.standing(k)===-100&&__ja.sources().blocs.find(b=>b.k===k).tier==='defect','War with a bloc turns it into a defector');__hd.peace(k);
  sfState().rel.yao=90;stState().stance.yao='court';__ja.mobilise([]);const c=CG.ja.c.find(c=>c.k==='yao');ok(c&&c.path[c.path.length-1]==='kaifeng'&&c.path.length>2,'A contingent musters at its bloc town and routes to Kaifeng');
  const at0=c.at;__ja.march();ok(c.at!==at0&&c.step===2,'Contingents march two road links a month');const pw=jinPlayerPower(c.at);ok(pw>=__ja.powAt(c.at)&&__ja.powAt(c.at)>0,'A contingent adds to the defence of the town it stands in');
  const col=jinArmy(['测试','Test column'],3000,[c.at,'kaifeng'],1);const q={type:'def',terr:c.at,army:CG.armies[0].id,jin:col.id};const spec=battleSpec(q);ok(spec.allies&&spec.allies.length&&/contingent/.test(spec.hud.en),'Allied contingents fight beside Qinghe in Jin battles');
  __ja.redirect('home');ok(c.path[c.path.length-1]===HOME,'Allies can be told to hold Qinghe instead');
  sfState().rel.yao=-50;stState().stance.yao='threat';stState().wr.yao=90;__ja.march();ok(c.state==='withdrawn','A contingent turns back if its bloc falls out with Qinghe');
  CAMP.res.silver=2000;CG.trade=CG.trade||{};for(const id of sfTowns('zhong').slice(0,3))CG.trade[id]=true;const mm=Math.min(4,Math.floor(__ja.trade()/20));ok(mm>0,'Trade depth allows hiring mercenaries');const u=__ja.hire();ok(u&&u.merc&&__ja.sources().merc>0,'Trade silver hires a real mercenary company');
  const m=__ja.open();ok(m.querySelector('#jaPanel .ja-gauge')&&m.querySelectorAll('.ja-row').length>=6&&/Expected Jin host/.test(m.textContent),'The readiness panel lists every source against the expected Jin host');m.remove();
  showCamp();campUI();const chip=document.getElementById('jaChip');ok(chip&&/Jin readiness/.test(chip.textContent),'A readiness chip shows on the campaign map');chip.click();ok(document.getElementById('jaModal'),'The chip opens the readiness panel');document.getElementById('jaModal').remove();
  missionsUI();ok(document.querySelector('#cMissions #jaPanel'),'The Jin invasion orders include the readiness panel');document.getElementById('cMissions').remove();
  saveGame();CAMP=loadGame();campLoad();ok(CG.ja&&CG.ja.c.length&&CG.ja.mob,'Contingents survive save and load');return out;}));
 await p.waitForTimeout(500);
 const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});m.on('pageerror',e=>errors.push(e.stack));await m.goto(url,{waitUntil:'load'});
 checks.push(...await m.evaluate(()=>{coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();if(CG.evQ)CG.evQ.length=0;showCamp();campUI();const c=document.getElementById('jaChip').getBoundingClientRect();const md=__ja.open().getBoundingClientRect();if(!(c.width>0&&c.right<=390&&md.width<=390))throw Error('phone readiness layout');return ['On a phone the readiness chip and panel fit the screen'];}));
 if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,1));}finally{await b?.close();server.close();}})().catch(e=>{console.error(e);process.exit(1);});
