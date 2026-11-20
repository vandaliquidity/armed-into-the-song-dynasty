// v0.25 coach fixes (playtest t249): the bubble docks clear of its target and any open dialog; lessons queue with a
// pause between them instead of chaining five in three minutes; steps finish on the actions they ask for; a step
// whose panel was closed goes back to "open the panel"; the trade lesson matches the Buy-only Trade tab.
'use strict';
const COACH_GAP=45;// seconds between one lesson ending and the next starting (the battle prompt is exempt)
CO.lastEnd=-1e9;CO.acts={move:0};
LCO.steps.trade.p[0]={zh:'有了集市就能采买。点“商贸与朝政”。',en:'With a market you can buy goods. Click Commerce & Politics.'};
LCO.steps.trade.p[2]={zh:'各处集市卖大宋货物，价钱各不相同。买进一宗试试，货物会装车运回。',en:'Each market sells Song goods at its own price. Buy one lot; it travels home by cart.'};
{const t=COACH_DEF.find(d=>d.id==='trade');if(t&&t.parts[2])t.parts[2].done=()=>CG.stats.trade>CO.base.trade||CAMP.res.silver<CO.base.silver||coachShipN()>CO.base.ships||!$('cCP');}
{const m=COACH_DEF.find(d=>d.id==='move');if(m&&m.parts[1]){const d0=m.parts[1].done;m.parts[1].done=()=>d0()||CO.acts.move>CO.base.move;}}
function coachShipN(){return typeof shipsOn==='function'?shipsOn().filter(s=>['buy','deal','sell'].includes(s.kind)).length:0;}
for(const fn of ['rtsCommand','rtsConfirm','rtsGo'])if(typeof window[fn]==='function'){const old=window[fn];window[fn]=function(){CO.acts.move++;return old.apply(this,arguments);};}
{const old=coachStart;coachStart=function(d){old(d);CO.base.silver=CAMP.res.silver;CO.base.ships=coachShipN();CO.base.move=CO.acts.move;};}
{const old=coachDone;coachDone=function(id){old(id);CO.lastEnd=performance.now();};}
function coachOver(a,b){const w=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),h=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);return w>0&&h>0?w*h:0;}
function coachAvoid(){const out=[];for(const e of document.querySelectorAll('.panel.modal,#cSet,#cCP,#cRoster,#cGov,#cTech,#cTransit,#cSplit,#cBattle')){if(e.id==='cCoach')continue;const r=e.getBoundingClientRect();if(r.width>0&&r.height>0)out.push({x:r.left,y:r.top,w:r.width,h:r.height});}return out;}
function coachDock(){const e=coachEls(),b=e.bub;if(!CO.cur||b.style.display==='none')return;const p=CO.cur.parts[CO.part];const r=p&&coachRect(p);const bw=b.offsetWidth,bh=b.offsetHeight,W=innerWidth,H=innerHeight,m=12;
  const cand=[];if(r){cand.push([r.x+r.w+14,r.y],[r.x-bw-14,r.y],[r.x,r.y+r.h+12],[r.x,r.y-bh-12]);}cand.push([W-bw-m,H-bh-m],[m,H-bh-m],[W-bw-m,90],[m,90]);
  const avoid=coachAvoid(),tgt=r?{x:r.x-6,y:r.y-6,w:r.w+12,h:r.h+12}:null;let best=null,bs=1e18;
  for(const [x0,y0] of cand){const x=clamp(x0,8,W-bw-8),y=clamp(y0,8,H-bh-8),q={x,y,w:bw,h:bh};let s=tgt?coachOver(q,tgt)*50:0;for(const a of avoid)s+=coachOver(q,a);if(s<bs-1){bs=s;best=[x,y];}}
  if(best){b.style.left=Math.round(best[0])+'px';b.style.top=Math.round(best[1])+'px';}}
{const old=coachTick;coachTick=function(){try{
  if(CG&&!CO.cur&&performance.now()-CO.lastEnd<COACH_GAP*1000){const s=coachS();const d=COACH_DEF.find(d=>!s.seen[d.id]&&d.when());if(!d||d.id!=='fight'){coachHide();return;}}
  // a later step lost its panel (closed by the player): go back to the step that opens it
  if(CO.cur&&CO.part>0){const p=CO.cur.parts[CO.part];if(p&&p.sel&&!p.rect&&!visEl(p.sel)&&!CO.cur.parts[0].done()&&!p.done()){CO.part=0;}}
  old();coachDock();}catch(err){console.warn('coach',err);}};}
clearInterval(CO.iv);CO.iv=setInterval(coachTick,250);
