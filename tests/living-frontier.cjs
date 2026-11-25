const {chromium}=require('playwright');
const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let b;try{
 b=await chromium.launch(browserOptions());const p=await b.newPage({viewport:{width:1600,height:1000}}),errors=[];
 p.on('pageerror',e=>errors.push(e.stack));await p.goto(process.argv[2]||url,{waitUntil:'load'});
 await p.evaluate(()=>{coachSave({off:1,seen:{}});LOGI.on=false;setLang('en');__sw.cstart();CG.evQ=[];CG.supplyAuto=false;showCVil(HOME);});
 await p.waitForFunction(()=>SONG_ART.cells.has('goods_grain')&&SONG_ART.cells.has('goods_spear')&&SONG_ART.cells.has('gate_town')&&VU.ready,null,{timeout:90000});
 const checks=await p.evaluate(()=>{
  const checks=[],ok=(v,m)=>{if(!v)throw Error(m);checks.push(m);},s=CG.T[HOME];
  const small=villageExtent(HOME);s.prosp=95;s.pop=9000;const large=villageExtent(HOME);ok(large.w>small.w&&large.h>small.h,'population and prosperity expand the walkable village world');
  s.prosp=0;s.pop=1000;ok(villageExtent(HOME).w===large.w,'built wards persist through a temporary decline');
  ok(villageIdentity('qinghe').seed!==villageIdentity('qingshui').seed&&villageIdentity('qinghe').type!==villageIdentity('jinsha').type,'settlements have stable individual layouts and regional character');
  s.prosp=90;for(const k of WK_ORDER)s.bld[k]=1;for(const k of RAW)s.st[k]=1000;for(const k in DY_BUSINESSES)(s.businesses||(s.businesses={}))[k]={level:1,paused:false};showCVil(HOME);
  cvil8Frame(0);const snapshot=JSON.stringify({st:s.st,eq:s.eq,U:CG.U}),nav=villageNav(),plan=vcPlan(s);ok(plan.legs.some(l=>l.from==='brewery'||l.to==='brewery'),'operating commerce buildings join the real material transport plan');
  for(const l of plan.legs)for(let i=1;i<l.P.length;i++){const a=l.P[i-1],z=l.P[i],n=Math.ceil(Math.hypot(z[0]-a[0],z[1]-a[1])/4);for(let j=0;j<=n;j++)okFree(a[0]+(z[0]-a[0])*j/n,a[1]+(z[1]-a[1])*j/n);}
  function okFree(x,y){if(!villageFree(nav,x,y))throw Error('Carrier crosses a solid building at '+x+','+y);}
  ok(true,'every production, commerce, harvest and treasury route stays clear of building walls along its full length');
  for(let i=0;i<240;i++)cvil8Frame(1/60);ok(JSON.stringify({st:s.st,eq:s.eq,U:CG.U})===snapshot,'resource animation never creates stock or advances recruitment');
  ok(SONG_ART.cells.get('goods_grain').height>50&&SONG_ART.cells.get('goods_spear').height>50,'complete resource and equipment models load into actual storage rendering');
  showCamp();worldState().quests=[];worldState().done=[];worldState().last=-1;worldRefresh();
  const repair=worldState().quests.find(q=>q.type==='repair');ok(worldAccept(repair.id),'optional local story can be accepted');const timber=s.st.timber,stone=s.st.stone,rep=CAMP.res.rep,prosp=s.prosp;
  ok(worldAct(repair.id)&&s.st.timber===timber-50&&s.st.stone===stone-20&&s.prosp===Math.min(100,prosp+4),'well repairs consume exact local resources and improve the settlement');
  ok(!worldAct(repair.id)&&!worldComplete(repair)&&CAMP.res.rep===rep+2,'completed side stories cannot spend or reward twice');
  const patrol=worldState().quests.find(q=>q.type==='patrol');worldAccept(patrol.id);const army=CG.armies.find(a=>armyUnits(a).some(u=>u.men>0)),loc=army.loc;
  for(const stop of patrol.stops){army.loc=stop;worldTick();}army.loc=loc;ok(patrol.state==='done','patrol requires the existing banner to visit each named stop');
  const relief=worldState().quests.find(q=>q.type==='provisions');worldAccept(relief.id);const total=()=>Object.values(CG.T).reduce((n,s)=>n+(s.st.grain||0),0),grain=total();ok(worldAct(relief.id),'relief dispatch finds an actual friendly road and source');const cart=shipsOn().find(c=>c.id===relief.ship),path=[...cart.path];
  ok(total()===grain-80&&cart.at===path[0]&&cart.goods.grain===80,'relief grain is removed once and remains in a physical loading cart');
  const owner=CG.T[cart.to].own;CG.T[cart.to].own='xia';shipTurn([]);ok(cart.blocked&&cart.at===path[0]&&relief.state==='active','hostile destination blocks the relief cart without teleporting cargo');CG.T[cart.to].own=owner;
  const risk=shipRisk;shipRisk=()=>0;try{for(let i=0;i<path.length+2&&relief.state==='active';i++)shipTurn([]);}finally{shipRisk=risk;}
  ok(relief.state==='done'&&cart.state==='done'&&total()===grain-80,'relief travels the road, then the actual grain is consumed by the kitchen');const reward=CAMP.res.rep;shipDeliver(cart,[]);ok(total()===grain-80&&CAMP.res.rep===reward,'repeated delivery cannot consume more grain or duplicate a reward');
  saveGame();const state=JSON.stringify(worldState());CAMP=loadGame();campLoad();ok(JSON.stringify(worldState())===state,'active offers and completed stories survive save/load');
  missionsUI();return checks;
 });
 await p.locator('[data-world-board]').click();await p.locator('#cWorld .world-card').first().waitFor();await p.screenshot({path:'test-results/frontier-opportunities.png'});
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:'test-results/frontier-opportunities-mobile.png'});
 if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
 }finally{if(b)await b.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
