const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let b;try{b=await chromium.launch(browserOptions());const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(url,{waitUntil:'load'});
 const checks=await p.evaluate(()=>{coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();if(CG.evQ)CG.evQ.length=0;const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};
  const H=__hd.state(),ids=Object.keys(H.nodes);ok(ids.length>=15&&ids.every(id=>/_resettle_\d+$|_district_\d+$/.test(id)),'The filler empty villages become resource nodes');
  ok(CL.terr.filter(t=>CG.T[t.id].own==='free'&&!H.nodes[t.id]).length>0,'Named free villages used by the story are left alone');
  ok(ids.every(id=>H.nodes[id].claimed||CG.T[id].pop===0),'Unclaimed nodes have no villagers');
  ok(new Set(ids.map(id=>H.nodes[id].k)).size>=4,'Nodes carry several resource kinds');
  const near=ids.find(id=>!H.nodes[id].claimed&&CADJ[id].includes(HOME));ok(near,'A node lies next to Qinghe');
  const far=ids.find(id=>!H.nodes[id].claimed&&!CADJ[id].some(owned));if(far)ok(__hd.canOutpost(far),'A node with no held neighbour cannot take an outpost');
  CG.phase=0;CAMP.res.silver=5000;const st=CG.T[HOME].st;st.timber=3000;st.stone=1000;st.ore=1000;
  ok(!__hd.canOutpost(near)&&__hd.outpost(near),'An outpost claims a node from a held neighbour');ok(owned(near)&&H.nodes[near].lv===1&&garrCap(near)===1,'An outpost holds one company');
  const d1=frDef(near).v;ok(__hd.upgrade(near)&&H.nodes[near].lv===2,'An outpost upgrades to a stockade');ok(__hd.upgrade(near)&&H.nodes[near].lv===3&&garrCap(near)===3,'A stockade upgrades to a fort with three garrison slots');
  ok(frDef(near).v>d1,'Each post level adds raid defence');ok(!__hd.upgrade(near),'A fort is the top level');
  const y=__hd.yield(near),k=Object.keys(y)[0];ok(y[k]>0,'A claimed node yields every season');
  const song=CL.terr.find(t=>CG.T[t.id].own==='song').id,bk=sfOf(song),why=__hd.block(song);ok(/Song town/.test(why)&&/declares war/.test(why),'Attacking a Song town is blocked with a reason');
  ok(__hd.block(CL.terr.find(t=>CG.T[t.id].own==='xia').id)==='','Xia towns can still be attacked');
  CSEL={t:song};const panel=terrPanel(song);ok(panel.querySelector('[data-attack-reason]')&&panel.querySelector('#hdDeclare'),'The Song town panel shows the blocked attack and the declare-war option');
  const np=terrPanel(near);ok(np.querySelector('[data-hold]')&&!/Visit the village/.test(np.textContent),'A node panel shows the post, not a village');
  CG.T[HOME].prosp=95;CAMP.res.rep=150;let flipped=null;for(let i=0;i<90&&!flipped;i++){CG.hold.mo=null;CG.month=(CG.month||1)%3+1;if(CG.month===1)CG.turn++;__hd.month([]);flipped=Object.keys(H.trib).find(id=>H.trib[id].on);}
  ok(flipped&&CG.T[flipped].own==='song','A neighbouring Song town becomes a tributary as Qinghe grows');ok(__hd.status(flipped)==='tributary'&&/tributary/.test(mlInfo(flipped,'fac',true)),'Tributary status shows on the Factions layer');
  const g0=CG.T[HOME].st.grain||0;const got=__hd.tribute([]);ok(got.grain>0&&CG.T[HOME].st.grain>g0,'Tributaries send grain and silver');__hd.tribute([]);
  const fk=sfOf(flipped),rep0=CAMP.res.rep;ok(__hd.war(fk),'War can be declared on a bloc');ok(CAMP.res.rep===rep0-__hd.HD.WAR.rep&&stState().wr[fk]===100,'Declaring war costs renown and sets the bloc hostile');
  ok(!H.trib[flipped].on,'Tributaries of the enemy bloc stop paying');ok(__hd.block(flipped)==='','A town of the enemy bloc can be attacked once war is declared');
  ok(__hd.peace(fk)&&!__hd.atWar(fk),'Peace can be bought back');
  // old save: no holdings
  delete CG.hold;for(const id of ids){CG.T[id].own=id===near?'qh':'free';}const H2=__hd.state();ok(Object.keys(H2.nodes).length===ids.length&&H2.nodes[near].claimed&&H2.nodes[near].lv===1,'An old save migrates: held filler villages become outposts');
  saveGame();CAMP=loadGame();campLoad();ok(CG.hold&&CG.hold.nodes[near].claimed,'Holdings survive save and load');
  return out;});
 // claim by army through the battle phase
 checks.push(...await p.evaluate(()=>{const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};const H=__hd.state(),n=Object.keys(H.nodes).find(id=>!H.nodes[id].claimed);const a=journeyLeader();for(const x of CG.armies)x.dest=null;a.loc=CADJ[n][0];a.dest=n;CG.phase=0;beginBattlePhase();ok(H.nodes[n].claimed&&owned(n)&&a.loc===n,'An army on a node claims it without a battle');return out;}));
 await p.evaluate(()=>{showCamp();campUI();});await p.waitForTimeout(800);
 if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,1));}finally{await b?.close();server.close();}})().catch(e=>{console.error(e);process.exit(1);});
