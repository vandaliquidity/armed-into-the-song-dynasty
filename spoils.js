'use strict';

// Approximate carried loadouts; fractions represent equipment distributed within
// a troop type. Recovery uses full opposing headcount, not just confirmed kills.
const SPOILS_KIT={
  xfoot:{spear:.6,dao:.4,shield:.5,armL:.6},xarch:{bow:1,dao:.25,armL:.15},
  xraid:{bow:1,dao:1,armL:1,horse:1,saddle:1},xiron:{spear:1,dao:.25,shield:1,armI:1,horse:1,saddle:1},
  xcamel:{dao:1,armL:1},xboss:{dao:1,armI:1,horse:1,saddle:1},
  militia:{spear:1},spear:{spear:1,armL:1},shield:{dao:1,shield:1,armL:1},archer:{bow:1},xbow:{xbow:1,armL:1},fire:{lance:1,armL:1},cav:{spear:1,armL:1,horse:1,saddle:1}
};
{const old=mkUnit;mkUnit=function(type,team,x,y,o={}){const u=old(type,team,x,y,o);if(B&&team===1&&SPOILS_KIT[type]){const ledger=B.spoilsLedger||(B.spoilsLedger={});ledger[type]=(ledger[type]||0)+1;}return u;};}
function spoilsForce(q){if(q.spoilsForce)return q.spoilsForce;const s=battleSpec(q);return q.spoilsForce={strength:s.str,mix:{...s.enemy}};}
{const old=qEnemyStr;qEnemyStr=function(q){return q.spoilsForce?.strength??old(q);};}
{const old=beginSkirm;beginSkirm=function(q){spoilsForce(q);return old(q);};}
{const old=autoResolve;autoResolve=function(q){spoilsForce(q);return old(q);};}
{const old=beginBattle;beginBattle=function(i,o){const eligible=!CAMP.done.includes(i),r=old(i,o);if(B)B.spoilsRewardEligible=eligible;return r;};}
function spoilsInventory(mix,strength,scale=1){
  const figures=Object.values(mix).reduce((n,v)=>n+v,0);if(!figures)return{};const headcount=Math.max(Math.round(strength||0),Math.round(figures*scale)),kit={};
  for(const [type,n] of Object.entries(mix))for(const [k,v] of Object.entries(SPOILS_KIT[type]||{}))kit[k]=(kit[k]||0)+n/figures*headcount*v;
  for(const k in kit)kit[k]=Math.ceil(kit[k]);return kit;
}
function spoilsEquipment(q){
  const force=spoilsForce(q),tactical=B?.skirm&&!B.journey&&SK_SNAP?.q===q;
  return tactical?spoilsInventory(B.spoilsLedger||force.mix,force.strength,B.N||1):spoilsInventory(force.mix,force.strength);
}
function spoilsAward(inventory,from,to){
  const rate=clamp(.3+Math.max(0,perkSum().loot||0)*.15,.3,.8),goods={};for(const [k,n] of Object.entries(inventory))if(n>0)goods[k]=Math.ceil(n*rate);
  if(!Object.keys(goods).length)return null;let shipment=null;
  if(owned(from)&&from===to){for(const [k,n] of Object.entries(goods))supplyBox(to,k)[k]=(supplyBox(to,k)[k]||0)+n;logvPush(to,'in',goods,'soldier',0);}
  else shipment=shipNew('raid',from,to,goods)?.id||null;
  const result={rate,inventory,goods,from,to,shipment};cgLog('🛡',Tz(`回收敌军军备（至少30%）：`,`Recovered enemy equipment (at least 30%): `)+spoilsText(goods));syncRes();saveGame();return result;
}
function spoilsText(goods){return Object.entries(goods).map(([k,n])=>`${n} ${Tz(...(EQN[k]||RAWN[k]||[k,k]))}`).join(' · ');}
function spoilsPanel(result){const d=document.createElement('div');d.className='wk captured-equipment';d.innerHTML=`<b>🛡 ${Tz('缴获敌军军备','Captured enemy equipment')} · ${Math.round(result.rate*100)}%</b><p>${spoilsText(result.goods)}</p><div class="tip">${Tz('按对方参战兵力及兵种配装计算，不只按击杀人数。','Based on the opposing force and its modeled loadout, including routed troops—not only kills.')}<br>${result.shipment?Tz('车队在途，运抵后可用：','Convoy in transit; usable after delivery: '):Tz('已存入本地武库：','Added to the local armoury: ')}${tName(result.to)}</div>`;return d;}
{const old=resolveBattle;resolveBattle=function(q,win,stats){
  const eligible=win&&!q.spoilsPaid&&['atk','def','claim','raid'].includes(q.type),inventory=eligible?spoilsEquipment(q):null;
  const r=old(q,win,stats);if(!eligible)return r;
  const a=qArmy(q),to=owned(q.terr)?q.terr:a&&owned(a.loc)?a.loc:HOME;
  const result=spoilsAward(inventory,q.terr,to);if(result){q.spoilsPaid=1;r.q.spoilsPaid=1;r.capturedEquipment=result;r.gain.horse+=(result.goods.horse||0);r.horses+=(result.goods.horse||0);CG.last=r;saveGame();}return r;
};}
{const old=campAfterStory;campAfterStory=function(i,win,stats){
  const battle=B,eligible=win&&battle&&!battle.skirm&&!battle.spoilsPaid&&battle.spoilsRewardEligible!==false&&battle.ch===i;
  const inventory=eligible?spoilsInventory(battle.spoilsLedger||{},i===2?3000:0,battle.N||(CG?.pend?10:1)):null;
  const r=old(i,win,stats);if(eligible&&CG&&owned(HOME)){battle.spoilsOutcome=spoilsAward(inventory,HOME,HOME);battle.spoilsPaid=1;saveGame();}return r;
};}
{const old=showBattleResult;showBattleResult=function(r,x){old(r,x);if(r.capturedEquipment){const target=$('scrEnd')?.firstElementChild;if(target)target.appendChild(spoilsPanel(r.capturedEquipment));}};}
{const old=campBattleToast;campBattleToast=function(r){old(r);if(r.capturedEquipment){const d=[...campEl().querySelectorAll('.panel.modal')].pop();if(d)d.appendChild(spoilsPanel(r.capturedEquipment));}};}
{const old=endBattle;endBattle=function(){const battle=B,r=old();if(battle&&!battle.skirm&&battle.spoilsOutcome&&MODE==='end')$('scrEnd')?.firstElementChild?.appendChild(spoilsPanel(battle.spoilsOutcome));return r;};}
