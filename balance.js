// v0.25 playtest balance (t249). Live playtest: Ch.1 was the hardest fight in the game; afterwards every auto-resolve
// was a sure win, Xia never took a settlement, and captures snowballed (550 -> 2357 men, 900 -> 10k grain by turn 25)
// while resource sites and trade stayed at zero. Fixes here:
//  1. Difficulty is chosen at New campaign (Easy/Normal/Hard). The Court panel shows it but no longer changes it.
//  2. Xia pressure grows with the realm: raids get stronger and more frequent as settlements and soldiers grow.
//  3. Conquered settlements yield less while they settle (50% rising to 85% over about six months), the 200-man local
//     garrison now draws pay, and the share of stores looted on capture is halved.
//  4. Resource sites (x1.75) and trade roads (x1.6) become the main growing income.
'use strict';
const BAL={siteMul:1.75,tradeMul:1.6,lootMul:.5,levyMen:200,levySilver:6,conq0:.5,conqStep:.06,conqMax:.85};
const DIFF_NAMES=[['缓','Easy'],['常','Normal'],['烈','Hard']];
const DIFF_DESC=[['西夏试探为主，袭扰少而弱。','Xia mostly probe: fewer, weaker raids.'],['西夏随你坐大而加压。','Xia pressure grows as your realm grows.'],['西夏全力扑来，大村大镇也会被围。','Xia come in force; even large towns get besieged.']];
function balDiff(){return CG&&CG.diff!=null?CG.diff:(CAMP&&CAMP.diff!=null?CAMP.diff:1);}
function realmSize(){if(!CG)return{own:1,men:0};return{own:Object.keys(CG.T).filter(owned).length,men:menOf(Object.values(CG.U))};}
// how much harder the Xia push for a realm of this size (1 at the start)
function xiaScale(){const {own,men}=realmSize();return clamp(1+Math.max(0,own-2)*.06+Math.max(0,men-800)/4000,1,3.2);}

// 1. difficulty at New campaign
{const old=campStart;campStart=function(){const r=old.apply(this,arguments);if(CG&&CAMP&&CAMP.diff!=null)CG.diff=CAMP.diff;return r;};}
function diffPicker(go){const d=document.createElement('div');d.className='panel modal';d.id='cDiffPick';d.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:50;min-width:320px;max-width:92vw';
  d.innerHTML=`<h2 style="text-align:center">${T('西夏攻势','Xia aggression')}</h2><div class="tip" style="text-align:center;margin-bottom:8px">${T('开局选定，之后不可更改。','Chosen once, for the whole campaign.')}</div>`;
  DIFF_NAMES.forEach((n,i)=>{const b=btn(n[0]+' · '+DIFF_DESC[i][0],n[1]+' · '+DIFF_DESC[i][1],()=>{d.remove();go(i);});b.dataset.diff=i;b.style.cssText='display:block;margin:6px auto;text-align:left';if(i===1)b.classList.add('gold');d.appendChild(b);});
  d.appendChild(Object.assign(btn('返回','Back',()=>d.remove()),{style:'display:block;margin:10px auto 0'}));
  const esc=e=>{if(e.key==='Escape'){d.remove();removeEventListener('keydown',esc,true);}};addEventListener('keydown',esc,true);document.body.appendChild(d);return d;}
{const old=showTitle;showTitle=function(){const r=old.apply(this,arguments);try{const b=[...$('scrTitle').querySelectorAll('.btn')].find(x=>/新战役|New campaign/.test(x.textContent));
  if(b){const fn=b.onclick;b.onclick=e=>diffPicker(i=>{fn&&fn.call(b,e);CAMP.diff=i;saveGame();});}}catch(e){console.warn('diff',e);}return r;};}

// 2. Xia pressure scales with the realm
{const old=xiaAI;xiaAI=function(rep){const id0=CG.xid||0;old(rep);if(!CG)return;const D=balDiff(),S=xiaScale(),ratio=[.55,.8,1.05][D];
  for(const x of CG.xa)if(x.id>=id0&&!x.story&&!x.faction&&!x.jinColumn&&!x.scaled){x.scaled=1;const def=owned(x.to)?defPow(x.to):0;x.str=Math.round(Math.max(x.str*S,def*ratio*Math.min(1.6,S)));}
  const own=realmSize().own,live=CG.xa.filter(x=>!x.story&&!x.faction&&!x.jinColumn).length,cap=[1,2,3][D]+Math.floor(own/5);
  const pX=clamp((own-3)*.045,0,.55)*[.6,1,1.35][D];
  if(CG.turn>=2&&live<cap&&Math.random()<pX){const c=xiaTargets().filter(t=>!CG.xa.some(x=>x.to===t.id));if(c.length){const tg=pickSoft(c,[.5,.3,.15][D]);const def=defPow(tg.id);
    const x={id:CG.xid++,from:tg.f,to:tg.id,str:Math.round(Math.max(tg.str*S,def*ratio*Math.min(1.6,S))),eta:2,weak:tg.why.includes('weak'),fz:rnd(.8,1.25),paid:true,scaled:1,surge:1};
    CG.xa.push(x);const m=intelLine(x);rep.lines.push(['⚔',m]);cgLog('⚔',m);}}};}

// 3. conquests settle slowly, pay their levies, and yield less loot
function conqFactor(id){if(id===HOME||!CG.T[id]||!owned(id))return 1;const s=CG.T[id];if(s.conq==null)return 1;return clamp(BAL.conq0+BAL.conqStep*Math.max(0,campaignMonth()-s.conq),BAL.conq0,BAL.conqMax);}
{const old=claimTerr;claimTerr=function(id,quiet){const was=owned(id);const r=old.apply(this,arguments);if(!was&&owned(id)&&id!==HOME&&CG.T[id].conq==null)CG.T[id].conq=campaignMonth();return r;};}
{const old=prodBreak;prodBreak=function(id){const r=old.apply(this,arguments);try{if(!CG||!owned(id))return r;const site={};for(const n of r.sites||[]){const ny=NODEK[n.k].y;for(const k in ny)site[k]=(site[k]||0)+ny[k];}
  const f=conqFactor(id);for(const k in r.y){if(k==='rep')continue;const s0=site[k]||0;r.y[k]=Math.round((r.y[k]-s0)*f+s0*BAL.siteMul);}r.conq=f;r.siteMul=BAL.siteMul;}catch(e){console.warn('bal',e);}return r;};}
{const old=tradeRoutes;tradeRoutes=function(){const r=old.apply(this,arguments);for(const x of r||[])if(!x._bal){x._bal=1;x.v=Math.round(x.v*BAL.tradeMul);}return r;};}
{const old=lootStock;lootStock=function(id,frac,toId){return old.call(this,id,frac*BAL.lootMul,toId);};}
if(typeof conquestMilitia==='function'){conquestMilitia=function(id){
  if(!CG||id===HOME||!owned(id)||(CG.conquestMilitia||{})[id])return false;(CG.conquestMilitia||(CG.conquestMilitia={}))[id]=1;for(let i=0;i<BAL.levyMen/100;i++)newUnit('mil',100,{loc:{v:id},home:id,levy:1});
  cgLog('⚑',Tz(`${CT[id].zh}招本地乡兵${BAL.levyMen}人守土，按月领饷。`,`${CT[id].en}: ${BAL.levyMen} local levies hold the town, on pay.`));return true;};}
{const old=upkeep;upkeep=function(){const r=old.apply(this,arguments);let sv=0;for(const u of Object.values(CG.U))if(u.levy)sv+=u.men/100*BAL.levySilver;r.silver=Math.round(r.silver+sv);return r;};}
