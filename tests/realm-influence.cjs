// t256/t257: Song blocs compete through influence (spread, flips, power ranking, rivalry acts, Qinghe's backing) and the four map
// layers draw informative overlays (territory tint, raid heat, supply network, trade flows) with legends and town info.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);},raf=()=>new Promise(r=>requestAnimationFrame(r));coachSave({off:1,seen:{}});setLang('en');
 const fresh=()=>{__sw.cstart();if(CG.evQ)CG.evQ.length=0;CAMP.res.silver=5000;return __si.siState();};
 const month=(n,lines)=>{for(let i=0;i<n;i++){sfAI(lines||[]);CG.month=(CG.month||1)+1;}};
 let S=fresh();
 // seeding keeps t247's circuits
 const reg=id=>{for(const k in SF_DEF)if(SF_DEF[k].reg.includes(CT[id].region))return k;return null;};
 const song=CL.terr.filter(t=>CG.T[t.id].own==='song').map(t=>t.id);
 ok(song.every(id=>!reg(id)||sfOf(id)===reg(id))&&song.every(id=>sfOf(id)),'every Song town starts with the bloc of its circuit ('+song.length+' towns; circuits without a bloc get the nearest one)');
 ok(Object.keys(S.inf).length===CL.terr.filter(t=>['song','free'].includes(CG.T[t.id].own)).length,'every Song-held and unaligned town carries bloc influence');
 // determinism: the same start gives the same 18 months
 const snap=JSON.stringify(CG.sf),snapW=JSON.stringify({T:CG.T,fr:CG.fr||null,xa:CG.xa||[],res:CAMP.res,fac:CG.fac,U:CG.U,uid:CG.uid}),m0=CG.month;const restoreW=()=>{const w=JSON.parse(snapW);CG.T=w.T;if(w.fr)CG.fr=w.fr;else delete CG.fr;CG.xa=w.xa;CAMP.res=w.res;CG.fac=w.fac;CG.U=w.U;CG.uid=w.uid;};const run=()=>{restoreW(),CG.sf=JSON.parse(snap);CG.month=m0;month(18);return JSON.stringify([CG.sf.inf,CG.sf.hold,CG.sf.feud,CG.sf.pow,CG.sf.evlog]);};
 const r1=run(),r2=run();ok(r1===r2,'influence spread, flips and rivalry acts are deterministic (same start, same 18 months)');
 // spread: towns change, influence pushes recorded
 restoreW(),CG.sf=JSON.parse(snap);CG.month=m0;S=__si.siState();const inf0=JSON.stringify(S.inf);const L1=[];month(1,L1);S=CG.sf;
 ok(JSON.stringify(S.inf)!==inf0&&S.push.length>0,'influence spreads monthly along the roads ('+S.push.length+' pushes this month)');
 // flip: a rival that overtakes the holder takes the town, with a news line and a map event
 const tid=song.find(id=>sfOf(id)==='zhong'&&CADJ[id].some(n=>CG.sf.hold[n]==='tong')),o=S.inf[tid];o.tong=Math.min(100,o.zhong+25);o.zhong=Math.max(0,o.zhong-20);
 for(const n of CADJ[tid])if(S.inf[n])S.inf[n].tong=Math.max(S.inf[n].tong,80);
 const L2=[];month(1,L2);S=CG.sf;ok(sfOf(tid)==='tong'&&L2.some(l=>l[1].includes(CT[tid].en)&&/allegiance/.test(l[1]))&&S.ev.some(e=>e.ty==='flip'&&e.t===tid),'a town flips when a rival outgrows its holder: '+CT[tid].en+' Zhong → Tong, news line and map event');
 ok(sfTowns('tong').includes(tid)&&!sfTowns('zhong').includes(tid),'sfOf / sfTowns follow the flip (trade, panels and layers use the new holder)');
 // power ranking
 ok(Object.values(S.rank).sort().join()==='1,2,3,4'&&Object.keys(SF_DEF).every(k=>S.pow[k]>0&&S.powPrev[k]!=null),'each bloc has a power score and a rank, re-ranked monthly with the previous month kept for arrows');
 // rivalry acts move feuds (no random drift)
 restoreW(),CG.sf=JSON.parse(snap);CG.month=m0;S=__si.siState();let acts=0,steady=true;for(let i=0;i<24;i++){const f0={...S.feud},e0=new Set(S.evlog),L=[];month(1,L);S=CG.sf;const evs=S.evlog.filter(e=>!e0.has(e)&&['blockade','poach','impeach','pressure','flip','blame'].includes(e.ty));acts+=evs.length;
   for(const k in S.feud){const fed=evs.some(e=>[e.k,e.o].sort().join('_')===k);if(!fed&&S.feud[k]>f0[k])steady=false;}}
 ok(acts>=10&&steady,'blocs act against rivals (blockade, poaching, accusation, pressure: '+acts+' acts in 24 months) and feuds rise only when fed by acts');
 const kinds=new Set(S.evlog.map(e=>e.ty));ok(['blockade','poach','impeach','pressure'].filter(k=>kinds.has(k)).length>=3,'at least three kinds of rivalry act occur ('+[...kinds].join(', ')+')');
 // Qinghe's backing reshapes the map
 const play=side=>{restoreW(),CG.sf=JSON.parse(snap);CG.month=m0;CAMP.res.silver=5000;const S=__si.siState();if(side)__si.siSide(side);month(24);return {pow:S.pow.liu,towns:sfTowns('liu').length,inf:Object.values(S.inf).reduce((t,o)=>t+o.liu,0)};};
 const a=play(null),b=play('liu');ok(b.inf>a.inf*1.08&&b.pow>a.pow&&b.towns>=a.towns,`backing a bloc speeds its influence and power (Liu after 24 months: influence ${Math.round(a.inf)} → ${Math.round(b.inf)}, power ${a.pow} → ${b.pow}, towns ${a.towns} → ${b.towns})`);
 restoreW(),CG.sf=JSON.parse(snap);CG.month=m0;S=__si.siState();const s0=CAMP.res.silver;__si.siSide('yao');month(1);ok(CAMP.res.silver===s0-__si.SI.SIDE_COST&&S.bk.yao>0,'open backing costs silver each month and builds backing');
 CG.T[HOME].st.grain=500;const bk0=S.bk.liu;ok(__si.siGrain('liu').ok&&S.bk.liu>bk0,'a grain convoy backs a bloc');const bk1=S.bk.zhong;sfGift('zhong');ok(S.bk.zhong>bk1,'gifts count as backing');
 // save migration: a t247 save (no influence data, old feud keys) loads cleanly
 fresh();month(3);saveGame();const raw=JSON.parse(localStorage.getItem(SAVEKEY));const sf=raw.cg.sf;for(const k of ['inf','hold','si','tr','w','cf','bk','ev','evlog','push','blk','side','ver','pow','rank','powPrev','rankPrev','pat'])delete sf[k];sf.feud={zhong_liu:40,tong_zhong:55};
 localStorage.setItem(SAVEKEY,JSON.stringify(raw));CAMP=Object.assign(newCampaign(),loadGame());campLoad();showMap();await raf();await raf();S=__si.siState();
 ok(S.si===1&&song.filter(id=>CG.T[id].own==='song').every(id=>!reg(id)||sfOf(id)===reg(id))&&S.feud.liu_zhong===40&&!('zhong_liu' in S.feud),'a save from before t256 migrates on load: influence seeded, holders = the old circuit blocs, feuds kept');
 const L3=[];month(2,L3);ok(saveGame()&&JSON.parse(localStorage.getItem(SAVEKEY)).cg.sf.hold,'the migrated campaign plays on and saves its dynamic allegiances');
 // UI: ranking strip, factions panel, town panel
 CSEL=null;CG.layer=null;campUI();const strip=document.getElementById('swRank');ok(strip&&strip.querySelectorAll('.sw-rk[data-sf]:not(.qh)').length===4&&strip.querySelectorAll('.sw-rk.qh').length===1&&/[▲▼↑↓–]/.test(strip.textContent),'a compact power ranking strip sits in the layer bar with up/down arrows');
 CSEL={sf:1};campUI();const fp=document.querySelector('.sw-rtab');ok(fp&&fp.querySelectorAll('tr').length===6&&document.querySelectorAll('[data-back]').length===4,'the Factions panel ranks the blocs and has backing actions for each');
 const tt=song.find(id=>CG.T[id].own==='song');CSEL={t:tt};campUI();ok(document.querySelector('[data-inf]'),'a town panel shows every bloc\'s influence there');
 // layers
 for(const L of ['fac','threat','supply','trade']){CG.layer=L;CSEL={t:HOME};campUI();for(let i=0;i<3;i++){__mp.MP.ver++;await raf();}
   const leg=document.getElementById('swLegend');ok(leg&&leg.dataset.layer===L&&leg.children.length>=3,`layer ${L}: legend shown`);ok(document.querySelector('[data-layinfo="'+L+'"]')&&__ml.mlInfo(HOME,L).length>3,`layer ${L}: town info in the panel and hover`);}
 const fac=__ml.mlFacField(),th=__ml.mlThreatField(),sp=__ml.mlSupplyField();const lit=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>20)n++;return n/(d.length/4);};
 ok(lit(fac)>.08&&lit(th)>.01&&lit(sp)>.02,`territory, heat and supply fields are painted (${(lit(fac)*100).toFixed(0)}% / ${(lit(th)*100).toFixed(0)}% / ${(lit(sp)*100).toFixed(0)}% of the map)`);
 const k0=__ml.ML.f.fac.key;CG.layer='fac';campUI();await raf();await raf();ok(__ml.ML.f.fac.key===k0,'the territory field is reused until influence changes');
 for(const mp of [false,true]){__mp.MP.on=mp;for(const L of ['fac','threat','supply','trade',null]){CG.layer=L;campUI();await raf();await raf();}}__mp.MP.on=true;ok(true,'all layers draw with the map cache on and off');
 CG.layer=null;return checks;});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));}finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exit(1);});
