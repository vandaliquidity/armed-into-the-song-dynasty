// t255: one people standard in the main village. The compound view is gone; every person sprite comes from the one re-rendered art set
// and stands to one height (adults equal, soldiers = villagers, children smaller, riders 1.35x); artisans work at every business.
const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let browser;try{browser=await chromium.launch(browserOptions());const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto(url,{waitUntil:'load'});await page.waitForFunction(()=>typeof sprReady!=='undefined'&&sprReady,null,{timeout:90000});
const checks=await page.evaluate(async()=>{const checks=[],ok=(v,s)=>{if(!v)throw Error(s);checks.push(s);},w=ms=>new Promise(r=>setTimeout(r,ms));coachSave({off:1,seen:{}});
 ok(typeof CPD==='undefined'&&typeof cpdView==='undefined'&&![...document.scripts].some(s=>/compound\.js/.test(s.src))&&localStorage.getItem('sw_cpd3')===null,'the compound view is gone: no compound.js, no toggle state, no default');
 __sw.cstart();if(CG.evQ)CG.evQ.length=0;const s=CG.T[HOME];for(const k in s.bld)s.bld[k]=Math.max(s.bld[k]||0,(DEV[k]&&DEV[k].max)||2);s.prosp=95;s.pop=900;for(const k in CAMP.bld)CAMP.bld[k]=2;CAMP.bld.clinic=2;
 s.businesses=s.businesses||{};for(const k in DY_BUSINESSES)s.businesses[k]={level:3,paused:false};for(const u of unitsAt(HOME))u.wnd=Math.max(u.wnd||0,30);
 __vu.set(true);showCVil(HOME);const need=['villager','vil_w','vil_b','vil_e','vil_k','porter','merchant','song_militia','song_spear','song_xbow','song_archer','song_fire','song_cav','song_gun'];
 for(let i=0;i<300;i++){for(const n of need)vuSpr(n);cvil8Frame(1/60);await w(30);if(need.every(n=>SPR['vu_'+n])&&VP.img.workers&&VP.img.patients&&VL.img.ward)break;}
 ok(need.every(n=>SPR['vu_'+n]),'every person type drawn in the village has a re-rendered (vu) atlas, the gun crew included');
 ok(/vp_workers/.test(VP.img.workers.src)&&/vp_patients/.test(VP.img.patients.src),'artisans, physicians and patients load from the same pipeline (vp_ atlases)');
 // every sprUnit call in a busy village frame resolves to a vu atlas
 const used={};const _su=sprUnit;sprUnit=function(n){used[n]=1;return _su.apply(this,arguments);};for(let i=0;i<40;i++)cvil8Frame(1/20);sprUnit=_su;
 const stray=Object.keys(used).filter(n=>n!=='oxcart'&&!VU_META.units[n]);ok(!stray.length,'no person in the village draws from an old art set ('+Object.keys(used).length+' types'+(stray.length?'; stray: '+stray:'')+')');
 // Painted natural-proportion heads are narrower than the old miniature heads; measure visible anatomy with a two-world-pixel row threshold.
 // heights: draw each the way the game calls it, measure hat to heel in world px (nothing below 2 px under the feet counts: the gun crew's carriage stands in front of him)
 const Z=4,cv=document.createElement('canvas');cv.width=64*Z;cv.height=80*Z;const L=cv.getContext('2d');
 let rowNarrow=false;const meas=draw=>{L.setTransform(1,0,0,1,0,0);L.clearRect(0,0,cv.width,cv.height);L.translate(32*Z,70*Z);L.scale(Z,Z);const _d=ctx.drawImage;ctx.drawImage=function(...a){return L.drawImage(...a);};try{draw();}finally{ctx.drawImage=_d;}
   L.setTransform(1,0,0,1,0,0);const d=L.getImageData(0,0,cv.width,cv.height).data,W=cv.width,row=y=>{let n=0;for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>150)n++;return n;};let t=-1,b=-1;
   for(let y=0;y<cv.height;y++)if(row(y)>=(rowNarrow?2:4.5)*Z){t=y;break;}for(let y=Math.min(cv.height-1,72*Z);y>t;y--)if(row(y)>=2*Z){b=y;break;}return t<0?0:(b-t+1)/Z;};
 const U=(n,r)=>{rowNarrow=!!(window.__songPeople&&SONG_PEOPLE.poses.has(__songPeople.role(n)+':0:0'));return meas(()=>sprUnit(n,0,-(vpR(n)||r)*.35,r,Math.PI/2,0));};
 const H={};for(const [n,r] of [['villager',9],['vil_w',9],['vil_b',9],['vil_e',9],['porter',10],['porter',8],['merchant',9.5],['villager',8],['song_militia',10],['song_spear',10],['song_xbow',10],['song_archer',10],['song_fire',10],['song_gun',12]])(H[n]=H[n]||[]).push(U(n,r));
 const ad=Object.values(H).flat(),md=ad.slice().sort((a,b)=>a-b)[ad.length>>1],spread=Math.max(...ad)/Math.min(...ad);
 ok(spread<1.08,'adults stand to one height whoever draws them and with whatever r: '+ad.map(v=>v.toFixed(1)).join(', ')+' (spread '+spread.toFixed(3)+')');
 const sol=['song_militia','song_spear','song_xbow','song_archer','song_fire'].map(n=>H[n][0]),vil=['villager','vil_w','vil_b','vil_e'].map(n=>H[n][0]),avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
 ok(Math.abs(avg(sol)/avg(vil)-1)<.05,'soldiers in the village are the same height as villagers ('+avg(sol).toFixed(1)+' vs '+avg(vil).toFixed(1)+')');
 const kid=U('vil_k',7);ok(kid/md>.5&&kid/md<.7,'children stand smaller ('+(kid/md*100).toFixed(0)+'% of an adult)');
 const cav=U('song_cav',13);ok(cav/md>1.2&&cav/md<1.5,'a mounted rider stands 1.2-1.5x a man on foot ('+(cav/md).toFixed(2)+'x)');
 rowNarrow=!!window.__songPeople;const art=meas(()=>vpWorker(ctx,0,0,'pour',1,0));rowNarrow=false;const pat=meas(()=>vpPatient(ctx,'spear',0,0,4));
 ok(art/md>.85&&art/md<1.06,'artisans and physicians stand to the same standard ('+art.toFixed(1)+' vs '+md.toFixed(1)+'; the old atlas drew them ~1.7x)');
 ok(pat/md<1.06,'a patient sitting up is no taller than a standing adult ('+pat.toFixed(1)+')');
 // compound room functions in the main village view
 for(let i=0;i<5;i++)cvil8Frame(1/30);const hot=CVIL.hot.map(h=>h.t);
 const biz=Object.keys(VP.BIZ_ACT).filter(k=>s.businesses[k]?.level&&hot.some(t=>t.startsWith(Ts(...DY_BUSINESSES[k].name)+' Lv')));
 ok(biz.length>=8&&biz.every(k=>hot.some(t=>t.startsWith(Ts(...DY_BUSINESSES[k].name)+' · '+Ts('匠人','artisan')))),'every business shown in the village has an artisan at its station with a status line ('+biz.length+')');
 ok(hot.some(t=>t.includes(Ts('库吏','clerk'))&&t.includes(Ts('银','Silver')))&&hot.some(t=>t.includes(Ts('司仓','stacker'))&&t.includes(Ts('存粮','Grain'))),'the treasury clerk and the storehouse stacker carry the old compound rooms\' status lines');
 ok(typeof vlOn==='function'&&vlOn()&&!!CVIL.vc,'the hospital ward and production chains still run in the main village');
 const t0=performance.now();for(let i=0;i<30;i++)cvil8Frame(1/60);const ms=(performance.now()-t0)/30;ok(ms<14,'fully built village frame '+ms.toFixed(2)+' ms (budget 14)');
 __vu.set(false);return checks;});
if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
