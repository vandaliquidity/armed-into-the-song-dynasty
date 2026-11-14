'use strict';

const REFIT_PATHS={mil:['spear','dao','arch','xbow','fire','cav'],spear:['dao','xbow','fire','cav'],dao:['xbow','fire','cav'],arch:['xbow','fire','cav'],xbow:['fire','cav'],fire:['cav'],cav:[]};
function refitKit(type,arm,n){const kit={};for(const [k,v] of Object.entries(UT[type].kit))kit[k]=Math.ceil(v*n);if(arm===1)kit.armL=n;if(arm===2)kit.armI=n;return kit;}
function refitPlan(uid,type,arm){
  const u=CG?.U[uid];if(!u||!UT[type]||!Number.isInteger(arm)||arm<0||arm>2)return null;
  const at=unitSite(u),n=u.men+(u.wnd||0),old=refitKit(u.type,u.arm||0,n),next=refitKit(type,arm,n),cost={},returned={},reasons=[];
  if(!['camp','cvil'].includes(MODE)||CG.phase!==0||CG.pend||CG.over)reasons.push(Tz('在筹划阶段整编','Re-equip during Planning'));
  if(!at||!owned(at))reasons.push(Tz('须驻于己方村寨','Must be at an owned settlement'));
  const a=u.loc?.a&&CG.armies.find(a=>a.id===u.loc.a);if(a?.dest)reasons.push(Tz('先取消行军命令','Cancel the march order first'));
  if(type!==u.type&&!(REFIT_PATHS[u.type]||[]).includes(type))reasons.push(Tz('此兵种不能如此升级','This upgrade path is unavailable'));
  if(arm<Math.max(u.arm||0,UT[type].arm))reasons.push(Tz('保留现有护甲，且须达到新兵种甲等','Keep current armour and meet the new troop’s armour requirement'));
  if(type!==u.type&&at&&yardLv(at)<1)reasons.push(Tz('改编兵种需本地兵营','Changing troop type requires local barracks'));
  if(type==='cav'&&u.type!=='cav'&&at&&at!==HOME&&!CG.T[at].bld.stable)reasons.push(Tz('骑军改编需本地马厩','Cavalry conversion requires local stables'));
  if(typeof carePending==='function'&&carePending(uid)>0)reasons.push(Tz('先等已转送伤兵归队，再统一换装','Wait for evacuated patients to rejoin before changing their unit’s equipment'));
  if(n<=0)reasons.push(Tz('没有可换装士兵','No soldiers to re-equip'));
  if(type===u.type&&arm===u.arm)reasons.push(Tz('请选择不同兵种或更好的护甲','Choose another troop type or better armour'));
  for(const k of new Set([...Object.keys(old),...Object.keys(next)])){const d=(next[k]||0)-(old[k]||0);if(d>0)cost[k]=d;else if(d<0)returned[k]=-d;}
  const silver=Math.ceil(n/100*(Math.max(0,UT[type].silver-UT[u.type].silver)+Math.max(0,arm-u.arm)*10));if(silver)cost.silver=silver;
  const missing={};if(at)for(const [k,q] of Object.entries(cost))if(supplyLocal(at,k)<q)missing[k]=q-supplyLocal(at,k);
  return{u,at,n,type,arm,cost,returned,missing,reasons,ok:!reasons.length&&!Object.keys(missing).length};
}
function refitUnit(uid,type,arm){
  const p=refitPlan(uid,type,arm);if(!p?.ok)return false;
  // Validate everything before mutating: the same unit object, rank and assignments survive.
  for(const [k,n] of Object.entries(p.cost))take(p.at,k,n,false);
  for(const [k,n] of Object.entries(p.returned))supplyBox(p.at,k)[k]=(supplyBox(p.at,k)[k]||0)+n;
  const previous=p.u.type;p.u.type=type;p.u.arm=arm;
  cgLog('🛡',Tz(`${CT[p.at].zh}：${UT[previous].zh}换装为${UT[type].zh}，原军阶与经验保留。`,`${CT[p.at].en}: ${UT[previous].en} re-equipped as ${UT[type].en}; rank and experience retained.`));
  syncRes();saveGame();sfx('ui');return true;
}
// Keep the existing one-click armour buttons consistent with full-unit refits.
reequip=function(uid,arm){const u=CG?.U[uid];return !!u&&refitUnit(uid,u.type,arm);};

function refitUI(uid,message=''){
  $('cRefit')?.remove();const u=CG?.U[uid];if(!u)return;const d=document.createElement('div');d.id='cRefit';d.className='panel modal';d.style.cssText='max-width:690px;max-height:88vh;overflow:auto';
  d.innerHTML=`<h2>${Tz('部队换装与升级','Re-equip and upgrade')}</h2><div class="wk"><b>${Tz(UT[u.type].zh,UT[u.type].en)}</b> · ${u.men} ${Tz('人','men')}${u.wnd?' + '+u.wnd+' '+Tz('伤兵','wounded'):''} · ${vetPips(chev(u))}<br>${Tz('军阶与经验保留','Rank and experience retained')}: ${u.exp} XP · ${Tz('兵器品质','Weapon quality')} ${'★'.repeat(u.wq||1)}<br><span class="tip">${Tz('原部队编号、士气、归属与伤兵数均保留。共用军备继续使用，更换下来的军备退回本地仓库。','The same unit keeps its identity, morale, assignment and wounded. Shared equipment is reused; replaced equipment returns to local stores.')}</span></div>${message?'<p class="ok">'+message+'</p>':''}`;
  const form=document.createElement('div');form.className='wk';form.style.marginTop='12px';const type=document.createElement('select');type.id='refitType';for(const k of [u.type,...REFIT_PATHS[u.type]||[]])type.add(new Option(Tz(UT[k].zh,UT[k].en),k));
  const armour=document.createElement('select');armour.id='refitArmour';form.appendChild(type);form.appendChild(armour);d.appendChild(form);
  const preview=document.createElement('div');preview.id='refitPreview';d.appendChild(preview);const actions=document.createElement('div');d.appendChild(actions);
  function drawArmour(){const min=Math.max(u.arm||0,UT[type.value].arm);armour.innerHTML='';for(let i=min;i<=2;i++)armour.add(new Option(Tz(...ARMN[i]),String(i)));draw();}
  function items(goods){return Object.entries(goods).map(([k,n])=>`${n} ${Tz(...(EQN[k]||RAWN[k]||(k==='silver'?['银','silver']:[k,k])))}`).join(' · ')||Tz('无','None');}
  function draw(){const p=refitPlan(uid,type.value,+armour.value);if(!p)return;
    preview.innerHTML=`<p>${Tz('换装人数（含本队伤兵）','Soldiers equipped (including local wounded)')}: <b>${p.n}</b></p><div class="wk">${Tz('所需新增军备与饷银','Additional equipment and silver')}: <b>${items(p.cost)}</b><br>${Tz('退回本地仓库','Returned to local stores')}: ${items(p.returned)}</div><p class="short">${p.reasons.join(' · ')}${Object.keys(p.missing).length?'<br>'+Tz('本地尚缺','Missing locally')+': '+items(p.missing):''}</p>`;
    actions.innerHTML='';const apply=btn('换装并保留军阶','Re-equip; keep rank',()=>{if(refitUnit(uid,type.value,+armour.value)){campUI();refitUI(uid,Tz('换装完成，原军阶与经验未变。','Re-equipped. Rank and experience are unchanged.'));}});apply.id='refitApply';if(!p.ok){apply.classList.add('dis');apply.setAttribute('aria-disabled','true');apply.style.pointerEvents='none';}actions.appendChild(apply);
    if(p.at&&Object.keys(p.missing).some(k=>k!=='silver')){const order=btn('调运缺少的军备','Request missing equipment',()=>{const sent=supplyRequest(p.at,p.cost);saveGame();draw();const note=document.createElement('p');note.className='tip';note.textContent=Tz(`已派送${sent}件；在途军备运抵后，再点击换装。`,`Dispatched ${sent} items. Apply the refit after the equipment arrives.`);preview.appendChild(note);});order.id='refitRequest';actions.appendChild(order);}
    actions.appendChild(btn('关闭','Close',()=>d.remove()));
  }
  type.onchange=drawArmour;armour.onchange=draw;drawArmour();campEl().appendChild(d);
}
{const old=unitCard;unitCard=function(u,buttons,small){const d=old(u,buttons,small);if(CG?.U[u.id]===u){const b=btn('换装 / 升级','Re-equip / upgrade',()=>refitUI(u.id));b.dataset.refit=u.id;b.style.cssText='display:block;font-size:11px;padding:4px 6px;margin-top:6px';d.appendChild(b);}return d;};}
