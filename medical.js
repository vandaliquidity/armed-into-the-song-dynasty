'use strict';

function careBatches(){if(!CG)return[];return CG.medical=CG.medical||[];}
function carePending(uid){return careBatches().filter(b=>b.unitId===uid).reduce((n,b)=>n+b.n,0);}
function careFriendly(id){return !!CG?.T[id]&&['qh','song'].includes(CG.T[id].own);}
function careNearest(from){
  if(!careFriendly(from))return null;
  const dist={[from]:0},previous={[from]:null},open=new Set([from]);
  while(open.size){
    const at=[...open].sort((a,b)=>dist[a]-dist[b]||a.localeCompare(b))[0];open.delete(at);
    for(const next of CADJ[at]||[]){
      if(!careFriendly(next))continue;
      const cost=dist[at]+rtsKm(at,next);
      if(dist[next]==null||cost<dist[next]-1e-8){dist[next]=cost;previous[next]=at;open.add(next);}
    }
  }
  const candidates=Object.keys(dist).filter(id=>hospLv(id)>0)
    .sort((a,b)=>dist[a]-dist[b]||hospLv(b)-hospLv(a)||a.localeCompare(b));
  if(!candidates.length)return null;
  const to=candidates[0],path=[];let p=to;
  while(p!==from){path.unshift(p);p=previous[p];}
  return{to,path,km:dist[to]};
}
function careRoute(batch){
  const plan=careNearest(batch.at);
  if(!plan){batch.path=[];batch.state='blocked';return false;}
  batch.to=plan.to;batch.path=plan.path;batch.state=plan.path.length?'travel':'care';return true;
}
function consolidateWounded(){
  const result={sent:0,units:0,already:0,unreachable:0};
  if(!CG||MODE==='battle'||CG.pend||CG.over)return result;
  const cache={};
  for(const batch of careBatches())if(batch.state!=='care'||!hospLv(batch.at))careRoute(batch);
  result.already=careBatches().filter(b=>b.state==='care').reduce((n,b)=>n+b.n,0);
  result.unreachable=careBatches().filter(b=>b.state==='blocked').reduce((n,b)=>n+b.n,0);
  for(const u of Object.values(CG.U)){
    const n=Math.max(0,Math.floor(u.wnd||0));if(!n)continue;
    const from=siteOf(u),plan=from?(cache[from]===undefined?(cache[from]=careNearest(from)):cache[from]):null;
    if(!plan){result.unreachable+=n;continue;}
    const local=from===plan.to;
    if(local)result.already+=n;
    CG.medicalId=(CG.medicalId||0)+1;
    careBatches().push({id:CG.medicalId,unitId:u.id,n,at:from,to:plan.to,path:[...plan.path],state:local?'care':'travel',
      kit:{type:u.type,arm:u.arm,wq:u.wq,exp:u.exp,mor:u.mor,home:u.home||HOME}});
    u.wnd-=n;if(!local)result.sent+=n;result.units++;
  }
  if(result.sent)cgLog('🩹',Ts(`伤兵${result.sent}人转送最近医馆，健卒留守原部`,`${result.sent} wounded dispatched to the nearest hospitals; healthy troops stay with their units`));
  saveGame();return result;
}
function careAdvance(){
  for(const b of careBatches()){
    if(b.state==='care'&&hospLv(b.at))continue;
    if(!b.path?.length||!hospLv(b.to)||!b.path.every(careFriendly))careRoute(b);
    if(b.state==='blocked'||!b.path.length)continue;
    const next=b.path[0];
    if(!CADJ[b.at]?.includes(next)||!careFriendly(b.at)||!careFriendly(next)){b.state='blocked';continue;}
    b.at=b.path.shift();
    if(!b.path.length){b.state='care';cgLog('🩹',Ts(`${b.n}名伤兵抵达${CT[b.at].zh}医馆`,`${b.n} wounded arrive at the hospital in ${CT[b.at].en}`));}
  }
}
function careReturn(b,n){
  const origin=CG.U[b.unitId];
  if(origin){const space=Math.max(0,100-origin.men-(origin.wnd||0)),back=Math.min(n,space);origin.men+=back;n-=back;}
  const at=owned(b.at)?b.at:HOME;
  while(n>0){
    const reserve=unitsAt(at).find(u=>u.type===b.kit.type&&u.arm===b.kit.arm&&u.wq===b.kit.wq&&u.men+(u.wnd||0)<100);
    const count=Math.min(n,reserve?100-reserve.men-(reserve.wnd||0):100);
    if(reserve)reserve.men+=count;else newUnit(b.kit.type,count,{...b.kit,loc:{v:at}});
    n-=count;
  }
}
{const old=woundedAll;woundedAll=function(){return old()+careBatches().reduce((n,b)=>n+b.n,0);};}
{const old=woundedAt;woundedAt=function(id){return old(id)+careBatches().filter(b=>b.at===id).reduce((n,b)=>n+b.n,0);};}
{const old=endTurn;endTurn=function(){
  if(CG&&!CG.pend&&!CG.queue.length&&CG.phase===3)careAdvance();
  return old();
};}
{const old=woundTick;woundTick=function(rep){
  old(rep);
  for(const b of careBatches()){
    const lv=b.state==='care'?hospLv(b.at):0,field=!owned(b.at),su=suAt(b.at);
    const rate=HEALR[lv]*(field?.6:1)+(su?.15:0)+(techOn('inoc')?.1:0);
    const recovered=Math.min(b.n,Math.max(1,Math.round(b.n*rate)));
    const died=Math.min(b.n-recovered,Math.round((b.n-recovered)*WDIE[lv]*(su?.4:1)*(techOn('inoc')?.5:1)));
    b.n-=recovered+died;careReturn(b,recovered);
    CG.stats.wrec=(CG.stats.wrec||0)+recovered;CG.stats.wdied=(CG.stats.wdied||0)+died;
    rep.lines.push(['🩹',Ts(`${CT[b.at].zh}：转送伤兵${recovered}人康复归队${died?'，'+died+'人不治':''}`,
      `${CT[b.at].en}: ${recovered} evacuated wounded recovered${died?', '+died+' died of their wounds':''}`)]);
  }
  CG.medical=careBatches().filter(b=>b.n>0);
};}

function medicalPanel(result){
  const old=$('cMedical');if(old)old.remove();
  const d=document.createElement('div');d.id='cMedical';d.className='panel modal';d.style.maxWidth='720px';
  d.innerHTML=`<div class="campaign-eyebrow">${Tz('伤兵转运','WOUNDED CARE')}</div><h2>${Tz('就近送医','Nearest-hospital evacuation')}</h2><p class="tip">${T(
    '只转送伤兵，健卒及军令留在原部。按友方道路距离选择最近的自有医馆，每月行进一段；每季治疗，伤愈者优先归还原部，原部已满或解散则留在医馆驻地。',
    'Only wounded soldiers leave; healthy troops and army orders stay in place. Patients follow friendly roads to the nearest owned hospital, one road segment per month. Recovery is seasonal; healed men rejoin their original unit where possible, otherwise the hospital garrison.')}</p>`;
  if(result)d.insertAdjacentHTML('beforeend',`<div class="wk">${Tz(`已安排 ${result.sent} 人；已在医馆 ${result.already} 人；无路可达 ${result.unreachable} 人`,
    `Dispatched: ${result.sent} · Already at a hospital: ${result.already} · No reachable hospital: ${result.unreachable}`)}</div>`);
  const batches=careBatches();
  for(const b of batches){
    const state=b.state==='care'?Tz('住院治疗','In hospital'):b.state==='blocked'?Tz('道路受阻，待重整','Route blocked; awaiting reroute'):Tz(`途中 · 余 ${b.path.length} 个月`,`En route · ${b.path.length} month${b.path.length===1?'':'s'} remaining`);
    d.insertAdjacentHTML('beforeend',`<div class="wk"><b>${b.n} ${Tz('名伤兵','wounded')} · ${Tz(UT[b.kit.type].zh,UT[b.kit.type].en)}</b><br>${tName(b.at)} → ${tName(b.to)}<br><span class="tip">${state}</span></div>`);
  }
  if(!batches.length)d.insertAdjacentHTML('beforeend',`<p>${T('目前没有在途或住院的转送伤兵。','There are no evacuated patients currently travelling or in hospital.')}</p>`);
  if(!Object.keys(CG.T).some(id=>hospLv(id)>0))d.insertAdjacentHTML('beforeend',`<p class="tip">${T('尚无医馆：请在“治所 → 概况”的营建列表兴建医馆。','No hospitals yet: build a Hospital in Settlement → Overview before sending wounded.')}</p>`);
  d.appendChild(btn('关闭','Close',()=>d.remove()));campEl().appendChild(d);
}
function medicalQuickAction(){const result=consolidateWounded();campUI();medicalPanel(result);}
CAMPAIGN_ICONS.medical='M6 2h6v4h4v6h-4v4H6v-4H2V6h4V2Z';
{const old=campUI;campUI=function(){
  old();if(MODE!=='camp')return;const nav=campEl().querySelector('.campaign-nav');if(!nav)return;
  const n=woundedAll(),b=btn(`就近送医 (${n})`,`Send wounded (${n})`,medicalQuickAction,n?'':'dis');b.id='cMedicalB';
  b.innerHTML=campaignIcon('medical','nav-icon')+'<span class="nav-label">'+T(`就近送医 (${n})`,`Send wounded (${n})`)+'</span>';
  const first=nav.querySelector('.btn');nav.insertBefore(b,first);
};}
{const old=campBattleToast;campBattleToast=function(r){
  old(r);if(!woundedAll())return;const dialog=[...campEl().querySelectorAll('.panel.modal')].pop();
  if(dialog)dialog.appendChild(btn('就近送医','Send wounded to hospitals',medicalQuickAction));
};}
{const old=unitCard;unitCard=function(u,buttons,sm){
  const d=old(u,buttons,sm),n=carePending(u.id);
  if(n){d.title+=` · ${n} ${Tz('名伤兵在途或住院','wounded evacuated or in hospital')}`;d.insertAdjacentHTML('beforeend',`<div class="tip" style="color:#b6d8b2;font-size:10px">${Tz('送医 ','In care ')}${n}</div>`);}
  return d;
};}
