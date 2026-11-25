'use strict';

SHIPK.transfer={zh:'境内调拨',en:'Internal transfer',c:'#8dbba0',ic:'🛒'};
function supplyJobs(){return CG.supplyRecruit||(CG.supplyRecruit=[]);}
function supplyPath(from,to){
  if(!careFriendly(from)||!careFriendly(to))return null;const prev={[from]:null},q=[from];
  for(const at of q){if(at===to)break;for(const n of CADJ[at]||[])if(careFriendly(n)&&!(n in prev)){prev[n]=at;q.push(n);}}
  if(!(to in prev))return null;const p=[];for(let at=to;at!=null;at=prev[at])p.unshift(at);return p;
}
function supplyBox(id,k){return EQ.includes(k)?CG.T[id].eq:CG.T[id].st;}
function supplyLocal(id,k){return ['silver','powder','rep'].includes(k)?CAMP.res[k]||0:supplyBox(id,k)?.[k]||0;}
function supplyIncoming(id,k){return shipsOn().filter(s=>!s.state&&s.to===id).reduce((n,s)=>n+(s.goods[k]||0),0);}
function supplyReserve(id,k){return EQ.includes(k)?0:Math.ceil(Math.max(needs(id)[k]||0,({grain:150,timber:60,stone:40})[k]||0));}
function supplyPotential(id,k){if(['silver','powder','rep'].includes(k))return supplyLocal(id,k);let n=supplyLocal(id,k)+supplyIncoming(id,k);for(const from of Object.keys(CG.T))if(from!==id&&owned(from)&&supplyPath(from,id))n+=Math.max(0,supplyLocal(from,k)-supplyReserve(from,k));return n;}
function supplyRequest(to,want){
  if(!owned(to)||!['camp','cvil'].includes(MODE))return 0;let sent=0;
  const sources=Object.keys(CG.T).filter(id=>id!==to&&owned(id)).map(id=>({id,path:supplyPath(id,to)})).filter(x=>x.path).sort((a,b)=>a.path.length-b.path.length||a.id.localeCompare(b.id));
  const deficit={};for(const k of Object.keys(want)){if(!RAW.includes(k)&&!EQ.includes(k))continue;deficit[k]=Math.max(0,Math.ceil(want[k])-supplyLocal(to,k)-supplyIncoming(to,k));}
  for(const {id:from,path} of sources){const goods={};for(const k of Object.keys(deficit)){const n=Math.min(deficit[k],Math.max(0,supplyLocal(from,k)-supplyReserve(from,k)),300);if(n>0){goods[k]=n;deficit[k]-=n;}}
    if(!Object.keys(goods).length)continue;
    for(const [k,n] of Object.entries(goods))supplyBox(from,k)[k]-=n;
    const speed=typeof companionAt==='function'&&companionAt(from,'comms')?2:1,eta=Math.max(1,Math.ceil((path.length-1)/speed));
    shipNew('transfer',from,to,goods,{internal:true,path,trail:[from],at:from,step:0,speed,eta,left:eta,cargoPhase:'loading'});sent+=Object.values(goods).reduce((a,n)=>a+n,0);
  }
  return sent;
}
let supplyChecking=false,supplyStarting=false,supplyStartRecruitment;
netIds=function(id){return Object.keys(CG.T).filter(v=>owned(v)&&supplyPath(id,v));};
{const old=have;have=function(id,k,net){if(!CG?.T[id]?.st)return old(id,k,net);return supplyChecking?supplyPotential(id,k):supplyLocal(id,k);};}
{const old=take;take=function(id,k,n,net){if(!CG?.T[id]?.st)return old(id,k,n,net);const got=Math.min(Math.max(0,n),supplyLocal(id,k));if(['silver','rep','powder'].includes(k))CAMP.res[k]-=got;else supplyBox(id,k)[k]-=got;return got;};}
{const old=trainCheck;trainCheck=function(id,type,arm){
  supplyChecking=true;let out;try{out=old(id,type,arm);}finally{supplyChecking=false;}
  if(!supplyStarting){const pending=supplyJobs().filter(j=>j.to===id);if(pending.length+CG.T[id].trn.length>=Math.max(1,yardLv(id)))out.push(Tz('已有待运军备订单','A recruitment order is awaiting supplies'));if(pending.length+CG.T[id].trn.length+unitsAt(id).length>=garrCap(id))out.push(Tz('驻军名额已预留','Garrison slots reserved'));}
  return out;
};}
{const base=train;train=function(id,type,arm=UT[type].arm){
  if(CG.phase>1||trainCheck(id,type,arm).length)return false;const c=kitCost(type,100,arm);
  if(Object.entries(c).every(([k,n])=>supplyLocal(id,k)>=n))return base(id,type,arm);
  supplyJobs().push({to:id,type,arm,created:campaignMonth()});supplyRequest(id,c);saveGame();cgLog('🛒',Tz(`${CT[id].zh}征兵等候军备运抵。`,`${CT[id].en}: recruitment is waiting for delivered equipment.`));return true;
};
supplyStartRecruitment=function(){
  const remaining=[];supplyStarting=true;
  try{for(const j of supplyJobs()){
    if(!owned(j.to)){remaining.push(j);continue;}const c=kitCost(j.type,100,j.arm);
    if(!Object.entries(c).every(([k,n])=>supplyLocal(j.to,k)>=n)||!base(j.to,j.type,j.arm)){remaining.push(j);continue;}
  }}finally{supplyStarting=false;}CG.supplyRecruit=remaining;
};
}
function supplyAuto(){
  if(!CG||CG.supplyAuto===false)return;
  for(const j of supplyJobs())if(owned(j.to))supplyRequest(j.to,kitCost(j.type,100,j.arm));
  for(const id of Object.keys(CG.T).filter(owned)){
    const want={...needs(id)};for(const [k,n] of Object.entries({grain:150,timber:60,stone:40}))want[k]=Math.max(want[k]||0,n);
    supplyRequest(id,want);
  }
}
// Replace the old instant workshop redistribution with saved, visible shipments.
caravans=function(rep){const before=shipsOn().length;supplyAuto();if(rep)rep.moved=shipsOn().length-before;return shipsOn().length-before;};
{const old=shipTurn;shipTurn=function(lines){
  const internal=shipsOn().filter(s=>s.internal&&!s.state);CG.ship=shipsOn().filter(s=>!s.internal||s.state);old(lines);
  for(const s of internal){
    if((!owned(s.to)&&!(s.worldQuest&&careFriendly(s.to)))||!careFriendly(s.at)){s.blocked=true;CG.ship.push(s);continue;}
    let route=supplyPath(s.at,s.to);if(!route){s.blocked=true;CG.ship.push(s);continue;}
    s.blocked=false;s.cargoPhase='travelling';
    if(Math.random()<shipRisk(s)&&shipRaid(s,lines)){CG.ship.push(s);continue;}
    const travel=Math.min(s.speed||1,route.length-1);s.trail=(s.trail||[s.at]).concat(route.slice(1,travel+1));s.at=route[travel];route=route.slice(travel);s.left=Math.ceil((route.length-1)/(s.speed||1));
    // Rebuild the remaining route after a detour so the map token follows friendly roads.
    s.path=[...s.trail,...route.slice(1)];s.step=s.trail.length-1;s.eta=Math.max(s.eta,s.left+1);s._a=0;
    if(s.at===s.to)shipDeliver(s,lines);else CG.ship.push(s);
  }
};}
{const old=shipProg;shipProg=function(s){
  if(!s.internal)return old(s);const n=Math.max(1,s.path.length-1),p0=(s.step||0)/n;
  if(s.blocked)return p0;
  let a=clamp(s._a||0,0,1);if(s.cargoPhase==='loading')a=clamp((a-.4)/.6,0,1);
  return lerp(p0,Math.min(.96,((s.step||0)+(s.speed||1))/n),a*a*(3-2*a));
};}
{const old=campLoad;campLoad=function(){old();if(!CG)return;for(const s of shipsOn())if(s.internal&&s.cargoPhase==='loading'&&!(LOGV[s.from]?.out.some(c=>c.sid===s.id)))logvPush(s.from,'out',s.goods,'porter',s.id);};}
{const old=endTurn;endTurn=function(){
  if(!CG||CG.pend||CG.queue.length)return old();supplyAuto();const result=old();supplyStartRecruitment();saveGame();return result;
};}
{const old=shipLine;shipLine=function(s){if(!s.internal)return old(s);return `🛒 <b>${Tz('境内调拨','Internal transfer')}</b> · ${tName(s.from)} → ${tName(s.to)} · ${goodsTxt(s.goods)} · ${s.blocked?Tz('道路受阻，货物保留','Road blocked; cargo retained'):Tz(`余${s.left}个月`,`ETA ${s.left} month(s)`)} · ${Tz('现于','At')} ${tName(s.at)}`;};}

function supplyUI(id=HOME){
  $('cSupply')?.remove();const d=document.createElement('div');d.id='cSupply';d.className='panel modal';d.style.maxWidth='760px';d.style.maxHeight='86vh';d.style.overflow='auto';
  d.innerHTML=`<h2>${Tz('境内转运','Settlement supply network')}</h2><p>${Tz('各村只使用本地库存。兵营缺军备时可先下征兵订单，车队运抵后自动开训。工坊原料与基础储备每月自动调拨；不搬走供货村的口粮与工坊用料。','Settlements spend local stocks. Recruitment can be ordered with missing kit: training starts after delivery. Workshops and basic reserves request spare materials monthly; donors retain food and workshop inputs.')}</p><p class="tip">${Tz('只经己方与友宋道路，每月一段路；通信兵驻地出发每月两段。进村可见搬运与装卸，地图可见车队。断路暂停或改道。','Only owned and allied Song roads are used: one link per month, two for departures supervised by Comms. Villages show loading and unloading; the map shows carts. Closed roads pause or reroute cargo.')}</p>`;
  const toggle=document.createElement('label');toggle.innerHTML=`<input type="checkbox" ${CG.supplyAuto!==false?'checked':''}> ${Tz('自动调拨','Automatic supply')}`;toggle.querySelector('input').onchange=e=>{CG.supplyAuto=e.target.checked;saveGame();};d.appendChild(toggle);
  const form=document.createElement('div');form.className='wk';form.style.marginTop='12px';
  const target=document.createElement('select');for(const v of Object.keys(CG.T).filter(owned)){const o=new Option(tName(v),v);o.selected=v===id;target.add(o);}form.appendChild(target);
  const item=document.createElement('select');for(const k of [...RAW,...EQ])item.add(new Option(Tz(...(RAWN[k]||EQN[k])),k));form.appendChild(item);
  const qty=document.createElement('input');qty.type='number';qty.min=1;qty.max=3000;qty.value=100;qty.style.width='80px';form.appendChild(qty);
  const status=document.createElement('div');form.appendChild(btn('补足至此数量','Request this stock level',()=>{const n=Math.min(3000,Math.max(1,Math.floor(+qty.value||1))),sent=supplyRequest(target.value,{[item.value]:n});saveGame();status.textContent=Tz(`已派送${sent}；现有与在途货物计入需求，不重复调运。`,`Dispatched ${sent}. Existing and incoming goods count toward the target.`);supplyRefresh();}));form.appendChild(status);d.appendChild(form);
  const list=document.createElement('div');d.appendChild(list);
  function supplyRefresh(){list.innerHTML='';for(const j of supplyJobs()){const row=document.createElement('div');row.className='wk';row.innerHTML=`${tName(j.to)} · ${Tz(UT[j.type].zh,UT[j.type].en)} · ${Tz('待运军备；运抵才扣饷银与丁口','Waiting for equipment; silver and manpower charged when training starts')}`;row.appendChild(btn('取消征兵','Cancel recruitment',()=>{CG.supplyRecruit=supplyJobs().filter(x=>x!==j);saveGame();supplyRefresh();}));list.appendChild(row);}for(const s of shipsOn().filter(s=>s.internal&&!s.state))list.insertAdjacentHTML('beforeend',`<div class="wk">${shipLine(s)}</div>`);}
  supplyRefresh();d.appendChild(btn('关闭','Close',()=>d.remove()));campEl().appendChild(d);
}
CAMPAIGN_ICONS.supply='M2 4h10v8H2ZM12 7h3l2 3v2h-5M4 14h1M13 14h1';
{const old=campUI;campUI=function(){old();if(MODE!=='camp'||!CG)return;const nav=campEl().querySelector('.campaign-nav');if(nav){const b=btn('境内转运','Supply network',()=>supplyUI());b.id='cSupplyB';b.innerHTML=campaignIcon('supply','nav-icon')+'<span class="nav-label">'+T('境内转运','Supply network')+'</span>';nav.insertBefore(b,nav.querySelector('.btn'));}};}
{const old=settleUI;settleUI=function(id,tab){const r=old(id,tab),d=$('cSet');if(d&&owned(id)){const n=document.createElement('div');n.className='wk';n.innerHTML=`<b>${Tz('本地库存与转运','Local stocks and delivery')}</b><div class="tip">${Tz('军备和原料运抵才能使用。征兵按钮可预订远方军备；运抵后自动开训。','Arms and materials must arrive before use. Train can order remote kit; training starts after delivery.')}</div>`;n.appendChild(btn('调拨原料与军备 / 待训订单','Request supplies / pending recruitment',()=>supplyUI(id)));d.appendChild(n);if(SET_TAB==='yard')for(const b of d.querySelectorAll('[data-t]')){const key=b.dataset.t,t=key.slice(0,-1),arm=+key.slice(-1);if(UT[t]&&Object.entries(kitCost(t,100,arm)).some(([k,n])=>supplyLocal(id,k)<n))b.innerHTML=T('调运后训练','Deliver kit, then train');}
  if(SET_TAB==='store'){
    const tip=d.children[2]?.querySelector('.tip');if(tip)tip.innerHTML=T('仓内显示本地实存；外村货物须由车队运抵，不能直接使用。','The warehouse shows local stocks. Goods from other settlements must arrive by cart before use.');
    for(const e of d.querySelectorAll('[data-e]')){const tip=e.querySelector('.tip');if(tip)tip.innerHTML=T('在途','Incoming')+' '+supplyIncoming(id,e.dataset.e);}
    for(const el of d.querySelectorAll('div'))if(el.children.length<=2&&/Armoury \(here|武库（本村/.test(el.textContent))el.innerHTML=T('本地武库 / 在途补给','Local armoury / incoming supplies');
  }
}return r;};}
