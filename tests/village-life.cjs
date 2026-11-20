// t252 village life: classic village is the default; the hospital ward shows the real wounded as persistent people,
// carts bring them in, beds have a capacity that changes recovery, healed men walk out and stand ready.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);};const w=ms=>new Promise(r=>setTimeout(r,ms));coachSave({off:1,seen:{}});
 localStorage.removeItem('sw_cpd3');__sw.cstart();if(CG.evQ)CG.evQ.length=0;CPD.on=(localStorage.getItem('sw_cpd3')==='1');CAMP.bld.clinic=1;
 const a=newUnit('spear',70,{loc:{v:HOME},wnd:45}),b=newUnit('xbow',80,{loc:{v:HOME},wnd:30});showCVil(HOME);
 ok(!cpdUse(),'the classic village is the default view');for(let i=0;i<200&&!(VL.img.ward&&VL.img.patients);i++){cvil8Frame(1/60);await w(100);}ok(VL.img.ward&&VL.img.patients,'ward art loads for the tier');
 for(let i=0;i<5;i++)cvil8Frame(.2);const W=vlWard(HOME),want=Math.ceil(45/20)+Math.ceil(30/20)+vlGroups(HOME).filter(g=>g.key!=='u'+a.id&&g.key!=='u'+b.id).reduce((n,g)=>n+Math.ceil(g.n/20),0);
 ok(W.pts.length===want,'one patient figure per 20 wounded of each company ('+W.pts.length+')');
 ok(W.pts.some(p=>p.key==='u'+a.id&&p.type==='spear')&&W.pts.some(p=>p.key==='u'+b.id&&p.type==='xbow'),'patients carry their company identity and livery');
 const names=W.pts.map(p=>vlName(p.fid)[1]).join();vlSync(HOME);ok(W.pts.map(p=>vlName(p.fid)[1]).join()===names,'names and beds persist across syncs');
 ok(W.pts.every(p=>p.arr),'new wounded arrive by cart first');ok(CVIL.vl.carts.length>0,'an ox cart is on its way from the gate');
 for(let i=0;i<60*40&&W.pts.some(p=>p.arr);i++)cvil8Frame(1/30);ok(!W.pts.some(p=>p.arr),'the carts unload every patient into the ward');
 await w(200);ok(CVIL.hot.some(h=>/Co\. \d+/.test(h.t)&&/Healing/.test(h.t)),'hovering a bed names the soldier, his company and healing progress');
 // capacity: 400 wounded in a 160-bed hospital heal slower than if all had beds
 for(const u of Object.values(CG.U))u.wnd=0;CG.medical=[];const big=newUnit('dao',100,{loc:{v:HOME},wnd:400});const rep={lines:[]};const m0=big.men;woundTick(rep);const rec=big.men-m0;
 ok(rep.lines.some(l=>/hospital is full/.test(l[1])),'a full hospital reports the overflow');ok(rec<Math.round(400*HEALR[1])&&rec>=Math.round(160*HEALR[1]),'overflow heals at the no-hospital rate ('+rec+' recovered)');
 // healed men leave their beds and form up ready
 for(const u of Object.values(CG.U))u.wnd=0;CVIL.vl.sync=0;cvil8Frame(1/30);ok(CVIL.vl.ready.length>0,'healed patients get up and walk to the drill yard');
 for(let i=0;i<60*30;i++)cvil8Frame(1/30);ok(CVIL.vl.ready.some(r=>vlAlong(r.P,r.d).end),'and stand ready for deployment');
 // let async decodes/bitmaps settle (the real game loop yields every frame), then time steady-state frames
 for(let i=0;i<150&&window.__vu&&!__vu.on();i++){cvil8Frame(1/60);await new Promise(r=>setTimeout(r,40));}for(let i=0;i<150&&typeof VU!=='undefined'&&VU.U&&Object.keys(VU.U).some(k=>!SPR['vu_'+k]);i++){cvil8Frame(1/60);await new Promise(r=>setTimeout(r,40));}for(let i=0;i<40;i++){cvil8Frame(1/60);await new Promise(r=>setTimeout(r,40));}
 const t0=performance.now();for(let i=0;i<30;i++)cvil8Frame(1/60);const ms=(performance.now()-t0)/30;ok(ms<12,'village frame with the ward '+ms.toFixed(2)+' ms (budget 12)');
 return checks;});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
