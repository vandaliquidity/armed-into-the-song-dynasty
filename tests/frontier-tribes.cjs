// t258: Qinghe joins the power ranking and the blocs take stances toward it (threat, courting, protection, overbearing demands,
// tribute both ways); the Xia and the unsubmitted Qiang clans raid the border and launch multi-column invasions with warnings,
// and raids/invasions ripple through bloc relations and the court.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);},raf=()=>new Promise(r=>requestAnimationFrame(r));coachSave({off:1,seen:{}});setLang('en');
 const month=(n,lines)=>{for(let i=0;i<n;i++){sfAI(lines||[]);CG.month=(CG.month||1)+1;}};
 __sw.cstart();if(CG.evQ)CG.evQ.length=0;CAMP.res.silver=3000;CG.T[HOME].st.grain=2000;let S=__si.siState();month(1);
 const W=()=>JSON.stringify({sf:CG.sf,T:CG.T,fr:CG.fr||null,xa:CG.xa||[],res:CAMP.res,fac:CG.fac,U:CG.U,uid:CG.uid,m:CG.month,fav:CG.fav||null});
 const R=s=>{const w=JSON.parse(s);CG.sf=w.sf;CG.T=w.T;if(w.fr)CG.fr=w.fr;else delete CG.fr;CG.xa=w.xa;CAMP.res=w.res;CG.fac=w.fac;CG.U=w.U;CG.uid=w.uid;CG.month=w.m;if(w.fav)CG.fav=w.fav;};
 const snap=W();S=CG.sf;
 ok(S.qpow>0&&Object.values(S.rank5).sort().join()==='1,2,3,4,5'&&S.rank5.qh>=1,`Qinghe has its own power score (${S.qpow}) and a place in a five-way ranking (#${S.rank5.qh})`);
 // stance determinism
 const run=n=>{R(snap);const L=[];month(n,L);return JSON.stringify([CG.sf.st.stance,CG.sf.st.wr,CG.sf.st.env.map(e=>[e.k,e.kind]),CG.fr.stats,CG.fr.log,CG.fr.str]);};
 const r1=run(14),r2=run(14);ok(r1===r2,'stances, envoys, raids and invasions are deterministic (same start, same 14 months)');
 // weak Qinghe: overbearing blocs send demands
 R(snap);CG.month=25;CG.dynasty.totalSales=300;CAMP.res.silver=300;let dem=null;for(let i=0;i<10&&!dem;i++){month(1);dem=CG.sf.st.env.find(e=>e.kind==='demand');}
 ok(dem&&CG.sf.st.stance[dem.k]==='over'&&dem.goods.silver>0,`a far stronger bloc demands tribute from a weak Qinghe (${dem&&dem.k}: ${dem&&dem.goods.silver} silver, ${dem&&dem.goods.grain} grain)`);
 const before=W();const rel0=sfState().rel[dem.k],s0=CAMP.res.silver,g0=CG.T[HOME].st.grain,mo=campaignMonth();
 ok(__st.stAnswer(dem.id,true).ok&&CAMP.res.silver===s0-dem.goods.silver&&CG.T[HOME].st.grain===g0-dem.goods.grain&&sfState().rel[dem.k]>rel0&&CG.sf.st.peace[dem.k]>mo,'accepting a demand pays it, raises standing and buys peace');
 R(before);const T=CG.sf.st;ok(__st.stAnswer(dem.id,false).ok&&CAMP.res.silver===s0&&sfState().rel[dem.k]===Math.max(-100,rel0-5)&&T.har[dem.k]>mo&&!T.env.some(e=>e.id===dem.id),'refusing a demand keeps the goods but drops standing and starts harassment');
 const h0=CG.sf.evlog.length;month(4);ok(CG.sf.evlog.some(e=>e.k===dem.k&&['qblock','qimpeach','qpress','coalition'].includes(e.ty)),'a refused bloc harasses Qinghe (blockade, accusation or pressure on its towns)');
 // strong Qinghe: courting, protection, threat; tribute; Qinghe's own demands
 R(snap);CG.sf.st.qren=900;CAMP.res.silver=6000;const seen=new Set(),kinds=new Set();let trib=null;for(let i=0;i<12;i++){month(1);for(const k in CG.sf.st.stance)seen.add(CG.sf.st.stance[k]);for(const e of CG.sf.st.env){kinds.add(e.kind);if(e.kind==='tribute'&&!trib)trib=e;}}
 ok(CG.sf.rank5.qh<=2&&['court','threat'].some(s=>seen.has(s)),`a powerful Qinghe (rank ${CG.sf.rank5.qh}) is courted or seen as a threat (stances seen: ${[...seen].join(', ')})`);
 ok(trib||kinds.has('protect'),'blocs send tribute or ask for protection ('+[...kinds].join(', ')+')');
 if(trib&&CG.sf.st.env.some(e=>e.id===trib.id)){const s1=CAMP.res.silver,g1=CG.T[HOME].st.grain,hz=CG.T[HOME].st.horse||0,u1=Object.keys(CG.U).length;__st.stAnswer(trib.id,true);const g=trib.goods;
   ok((g.silver?CAMP.res.silver>s1:1)&&(g.grain?CG.T[HOME].st.grain>g1:1)&&(g.horse?(CG.T[HOME].st.horse||0)>hz:1)&&(g.loan?Object.keys(CG.U).length>u1:1),'accepting tribute brings the goods (silver, grain, horses or a loaned company)');}
 const weak=Object.keys(SF_DEF).find(k=>__st.stCanDemand(k));ok(weak,'Qinghe can demand tribute from a bloc it overpowers 1.3 : 1');
 const sx=CAMP.res.silver,rr=__st.stDemand(weak);ok(rr.ok&&(rr.paid?CAMP.res.silver>sx:CAMP.res.silver===sx)&&!__st.stCanDemand(weak)&&CG.sf.evlog.some(e=>e.ty==='qdemand'&&e.k===weak),`Qinghe's demand on ${weak}: ${rr.paid?'paid':'refused'} (chance ${Math.round(rr.p*100)}%), then a cooldown`);
 // raids and invasions
 R(snap);const lines=[],stages=new Set();let warnSeen=false,maxCols=0;for(let i=0;i<24;i++){month(1,lines);const inv=CG.fr.inv;if(inv){stages.add(inv.stage);if(inv.warn&&inv.warn.length)warnSeen=true;maxCols=Math.max(maxCols,inv.cols.length);}}
 const F=CG.fr;ok(F.stats.raids>=15&&F.stats.looted>=6,`raiders hit the border often (${F.stats.raids} raids in 24 months, ${F.stats.looted} looted, ${F.stats.repelled} repelled)`);
 ok(lines.some(l=>/Qiang/.test(l[1]))&&lines.some(l=>/Xia/.test(l[1])),'both the Xia and the Qiang clans raid');
 ok(lines.some(l=>/looted .*(grain|silver|horses|hides|captives)/.test(l[1])),'looting takes grain, silver, livestock or captives');
 ok(F.stats.inv>=1&&['scout','beacon','march'].every(s=>stages.has(s))&&warnSeen&&maxCols>=2,`a massive invasion comes in ${maxCols} columns after scouts and beacons (${F.stats.inv} in 24 months)`);
 ok(lines.some(l=>/beacon|scouts report/i.test(l[1]))&&lines.some(l=>/refugees/.test(l[1])),'warnings and refugees appear in the news');
 // ripple
 ok(lines.some(l=>/blames/.test(l[1]))&&CG.sf.evlog.concat(F.log).length>0,'raids make blocs blame each other or Qinghe');
 ok(lines.some(l=>/begs Qinghe for aid|court sends|reprimand/i.test(l[1])),'hit blocs beg for aid or the court reacts');
 // repelling a column at Qinghe raises influence
 R(snap);const F2=__fr.frState();F2.mo=campaignMonth();const inv=__fr.frPlan(F2,'xia',[]);ok(inv&&inv.cols.length>=2,'an invasion plans 2-3 columns toward prefecture seats');
 const rep0=CAMP.res.rep||0,q0=CG.sf.st.qren||0,L4=[];__fr.FR&&frRepelled({frCol:inv.cols[0].id},L4);ok(CAMP.res.rep===rep0+12&&CG.sf.st.qren>=q0+25&&inv.cols[0].state==='routed','repelling an invasion column raises prestige, merit and influence');
 // save migration
 R(snap);saveGame();const raw=JSON.parse(localStorage.getItem(SAVEKEY));delete raw.cg.fr;delete raw.cg.sf.st;for(const k of ['qpow','rank5','qpowPrev','rank5Prev'])delete raw.cg.sf[k];localStorage.setItem(SAVEKEY,JSON.stringify(raw));
 CAMP=Object.assign(newCampaign(),loadGame());campLoad();showMap();await raf();await raf();month(3);
 ok(CG.fr&&CG.fr.str.xia>0&&CG.sf.st&&CG.sf.rank5&&CG.sf.rank5.qh,'a save from before t258 loads: stances and tribes are seeded and the month runs');
 ok(saveGame()&&JSON.parse(localStorage.getItem(SAVEKEY)).cg.fr.camps,'the migrated campaign saves its tribes and stances');
 // UI
 const T2=__st.stState();__st.stEnvoy(T2,'zhong','tribute',{goods:{grain:150}});__st.stEnvoy(T2,'tong','demand',{goods:{silver:60,grain:80}});
 CSEL=null;CG.layer=null;campUI();ok(document.querySelector('#swRank .sw-rk.qh')&&document.getElementById('swEnvChip'),'the ranking strip shows Qinghe and an envoy chip');
 CSEL={sf:1};campUI();const tab=document.querySelector('.sw-rtab');ok(tab&&tab.querySelector('tr.qh')&&document.querySelectorAll('[data-stance]').length===4&&[...document.querySelectorAll('[data-stance] .sw-why')].every(e=>e.textContent.length>8)&&document.querySelectorAll('[data-demand]').length===4,'the Factions panel lists Qinghe, each bloc\'s stance with its reason, and demand buttons');
 ok(document.querySelector('[data-tribes]'),'the Factions panel summarises the tribes beyond the border');
 CSEL={env:1};campUI();const cards=document.querySelectorAll('#swEnvoy [data-env]');const n0=cards.length;ok(n0>=2&&document.querySelector('#swEnvoy [data-kind="demand"] [role=button]'),'the envoy dialog shows tribute and demand cards with answers');
 const g2=CG.T[HOME].st.grain;document.querySelector('#swEnvoy [data-env="'+T2.env.find(e=>e.k==='zhong'&&e.kind==='tribute').id+'"] [role=button]').click();ok(CG.T[HOME].st.grain===g2+150&&document.querySelectorAll('#swEnvoy [data-env]').length===n0-1,'accepting from the dialog applies it and removes the card');
 // threat layer and map
 month(6);const bt=Object.keys(CG.T).find(id=>__fr.frRisk(id));ok(bt&&/raid/i.test(mlInfo(bt,'threat')),'the Threat layer info shows tribal raid risk ('+(bt&&CT[bt].en)+')');
 CSEL={t:bt};campUI();ok(document.querySelector('[data-frisk]'),'a border town panel shows its raid risk');
 for(const mp of [false,true]){__mp.MP.on=mp;for(const L of ['threat',null,'fac']){CG.layer=L;campUI();for(let i=0;i<3;i++){CTIME+=3;await raf();}}}__mp.MP.on=true;CG.layer=null;ok(true,'raids, columns and the threat overlay draw with the map cache on and off');
 return checks;});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));}finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);process.exit(1);});
