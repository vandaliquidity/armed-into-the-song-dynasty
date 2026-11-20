// t253 step 3: grain and silver carriers paced by the ledger (harvest -> grain bin, tax and trade silver -> the treasury)
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};coachSave({off:1,seen:{}});
 __sw.cstart();if(CG.evQ)CG.evQ.length=0;const s=CG.T[HOME];showCVil(HOME);for(let i=0;i<3;i++)cvil8Frame(1/60);
 const I=__vh.income(HOME),B=prodBreak(HOME);ok(I.tax===B.tax&&I.farm===(B.rows.find(r=>r.k==='farm')||{amt:0}).amt,'carrier totals are the ledger\'s own farm and tax figures');
 const P=vcPlan(s),hv=P.legs.filter(l=>l.kind==='harvest'),tx=P.legs.filter(l=>l.kind==='tax'),tr=P.legs.filter(l=>l.kind==='trade');
 if(I.farm>0){ok(hv.length===2+(s.bld.farm||0),'one harvest leg per field plot ('+hv.length+')');ok(Math.abs(hv.reduce((n,l)=>n+l.units,0)-I.farm)<1,'harvest legs carry exactly this season\'s grain');
   const bin=vcBin('grain');ok(hv.every(l=>{const e=l.P[l.P.length-1];return e[0]===bin.d[0]&&e[1]===bin.d[1];}),'grain ends at the grain bin');}
 ok(I.tax>0&&tx.length>0&&Math.abs(tx.reduce((n,l)=>n+l.units,0)-I.tax)<1,'tax legs carry exactly this season\'s tax silver');
 ok(tx.every(l=>{const e=l.P[l.P.length-1];return e[0]===VHL.TRES[0]&&e[1]===VHL.TRES[1];}),'tax silver ends at the treasury door');
 ok(I.trade>0?tr.length===1&&tr[0].units===I.trade:tr.length===0,'trade merchants only when trade routes pay this village ('+I.trade+')');
 // pacing: trips per season = units / load
 const per=l=>VC.SEASON/Math.max(1,l.units/(l.load||VC.LOAD));if(tx[0])ok(Math.abs(per(tx[0])-VC.SEASON*10/tx[0].units)<1e-6||tx[0].units<10,'a chest is 10 silver, so trips scale with the tax');
 // run the village and see carriers on the new legs, with hover text
 for(let i=0;i<60*40;i++)cvil8Frame(1/30);const kinds=new Set(CVIL.vc.ag.map(a=>a.leg.kind));
 ok(kinds.has('tax')||kinds.has('harvest'),'grain or silver carriers are walking ('+[...kinds].join(',')+')');
 cvil8Frame(1/60);ok(CVIL.hot.some(h=>/Tax clerk|Harvest|Merchant/.test(h.t)),'hovering a carrier says what it carries and the season total');
 // winter: fewer harvest baskets than summer
 const t0=CG.turn,f=t=>{CG.turn=t;return __vh.income(HOME).farm;};let sum=0,win=0;for(let t=t0;t<t0+4;t++){if(seasonOf(t)===2)sum=f(t);if(seasonOf(t)===3)win=f(t);}CG.turn=t0;
 ok(win<sum,'winter fields send fewer baskets than autumn ('+win+' < '+sum+')');
 const t1=performance.now();for(let i=0;i<30;i++)cvil8Frame(1/60);const ms=(performance.now()-t1)/30;ok(ms<12,'village frame with carriers '+ms.toFixed(2)+' ms (budget 12)');
 return checks;});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
