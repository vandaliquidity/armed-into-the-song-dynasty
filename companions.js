'use strict';

const COMPANION_HP={lead:600,marks:380,eng:480,medic:400,comms:420};
const COMPANION_PASSIVES={
  lead:['操练：本地新兵训练缩短一季（至少一季），部队季末士气+5。','Drill: local recruits train one season faster (minimum one); local troops gain 5 morale each season.'],
  marks:['瞭望：本村向外多看一段路。','Watch: reveal roads and settlements one additional link from this village.'],
  eng:['工务：本地工坊产能+25%，仍需足额原料。','Works: local workshop capacity +25%; all extra materials must still be supplied.'],
  medic:['救护：本地伤兵每季康复率+15个百分点，与既有军医加成不重复。','Care: local wounded recovery +15 percentage points; does not stack with the existing medic bonus.'],
  comms:['转运：从本村出发的境内车队每月走两段路。','Dispatch: internal supply carts departing here travel two road links per month.']
};
const COMPANION_R={
  lead:{name:['旋风斩','Whirlwind'],cd:8,desc:['向目标跃进并旋斩；短暂免伤。','Leap toward the target and spin; brief invulnerability.']},
  marks:{name:['压制射击','Pinning shot'],cd:20,desc:['耗2弹，近处目标受到穿甲伤害与3秒压制。','Costs 2 rounds: armour-piercing fire pins nearby targets for 3 seconds.']},
  eng:{name:['抢修','Field repairs'],cd:24,desc:['修复身边180范围内友方建筑、车辆，恢复其25%最大耐久。','Repair friendly structures and vehicles within 180 for 25% maximum health.']},
  medic:{name:['急救掩护','Emergency cover'],cd:28,desc:['200范围内友军恢复15%生命，并获得8秒减伤35%。','Allies within 200 heal 15% and take 35% less damage for 8 seconds.']},
  comms:{name:['重整旗鼓','Regroup'],cd:22,desc:['240范围友军撤向通信兵、恢复10%生命，E技能冷却缩短6秒。','Allies within 240 regroup, heal 10%; companions recover 6 seconds of E cooldown.']}
};
for(const sd of SQUAD){sd.hp=COMPANION_HP[sd.id];const r=COMPANION_R[sd.id];sd.skR={zh:r.name[0],en:r.name[1],cd:r.cd,d:r.desc.join(' · ')};}
function companionSite(sid){
  if(!CG)return null;const post=CG.posts?.[sid];if(post)return owned(post)?post:null;
  const a=CG.armies.find(a=>a.mem.includes(sid));return a&&owned(a.loc)?a.loc:null;
}
function companionAt(id,sid){return companionSite(sid)===id;}
function companionStation(sid,id){
  if(!CG||CG.phase!==0||!owned(id)||companionSite(sid)!==id)return false;
  const a=CG.armies.find(a=>a.mem.includes(sid));if(!a||a.cmd===sid)return false;
  a.mem=a.mem.filter(m=>m!==sid);(CG.posts||(CG.posts={}))[sid]=id;campRefresh();saveGame();return true;
}
function companionRejoin(sid,id){
  if(CG.phase!==0||CG.posts?.[sid]!==id||!owned(id))return false;const a=CG.armies.find(a=>a.loc===id);if(!a)return false;
  if(!a.mem.includes(sid))a.mem.push(sid);delete CG.posts[sid];campRefresh();saveGame();return true;
}
{const old=mkSquad;mkSquad=function(sd,x,y){const u=old(sd,x,y);u.guardCharges=1;return u;};}
{const old=damage;damage=function(u,amt,src,o={}){
  if(u.kind==='squad')amt*=.8;
  if(u.coverUntil>B.t)amt*=.65;
  // One emergency survival window per companion per battle; healing is still required.
  if(u.kind==='squad'&&!u.dead&&(u.hp<u.maxhp*.25||amt>=u.hp)&&u.guardCharges>0&&amt>0&&!(u.inv>0)){
    u.guardCharges--;u.inv=2;u.hp=Math.min(u.maxhp,u.hp+u.maxhp*.12);part('ring',u.x,u.y,{life:.6,sz:45,c:'#b9e7cb'});
  }
  return old(u,amt,src,o);
};}
function companionSecondary(u,m){
  if(!u||u.dead||u.inVeh||u.skR>0||B.paused||B.over)return false;const id=u.sd.id,r=COMPANION_R[id];m=m||{x:u.x+120,y:u.y};
  if(id==='lead'){const selected=new Set(B.selU);B.selU.add(u);const old=companionWhirl;old(m);B.selU=selected;return u.skR>0;}
  if(id==='marks'){
    if(B.mod.ammo<2){say('压制射击需要2发子弹','Pinning shot needs 2 rounds',1.5);return false;}
    const d=Math.hypot(m.x-u.x,m.y-u.y);if(d>WPN.sniper.range){say('目标太远','Target out of range',1.5);return false;}
    u.face=Math.atan2(m.y-u.y,m.x-u.x);fireGun(u,u.face,{...WPN.sniper,dmg:220,ammo:2,pierce:3});
    for(const e of B.units)if(e.team===1&&!e.dead&&Math.hypot(e.x-m.x,e.y-m.y)<100&&losClear(0,u.x,u.y,e.x,e.y))e.stun=Math.max(e.stun||0,3);
  }else if(id==='eng'){
    let repaired=0;for(const t of [...B.structs,...B.units])if(t.team===0&&!t.dead&&(t.kind==='veh'||t.cart||B.structs.includes(t))&&Math.hypot(t.x-u.x,t.y-u.y)<180&&t.hp<t.maxhp){t.hp=Math.min(t.maxhp,t.hp+t.maxhp*.25);repaired++;}
    if(!repaired){say('附近没有需要修复的友方建筑或车辆','No damaged friendly structure or vehicle nearby',1.5);return false;}sfx('thud');
  }else{
    const R=id==='medic'?200:240;for(const t of B.units)if(t.team===0&&!t.dead&&!t.inVeh&&(t.kind==='squad'||t.kind==='troop')&&!t.cart&&Math.hypot(t.x-u.x,t.y-u.y)<R){
      t.hp=Math.min(t.maxhp,t.hp+t.maxhp*(id==='medic'?.15:.1));
      if(id==='medic')t.coverUntil=B.t+8;
      else{t.rout=false;t.skE=Math.max(0,(t.skE||0)-6);if(t.kind==='troop')t.ord={type:'hold',x:u.x+rnd(-60,60),y:u.y+rnd(-60,60),f:u.face};else if(t!==u)t.ord={type:'move',x:u.x+rnd(-40,40),y:u.y+rnd(-40,40)};}
    }sfx('heal');
  }
  u.skR=r.cd;part('ring',u.x,u.y,{life:.7,sz:id==='comms'?240:180,c:id==='medic'?'#94dfa9':'#a1c8df'});say(r.name[0],r.name[1],1.6);return true;
}
const companionWhirl=keyWhirl;
keyWhirl=function(m){const selected=selSquad().filter(u=>!u.dead);const list=selected.length?selected:[B.ctrl];for(const u of list)companionSecondary(u,m);};

{const old=suAt;suAt=function(id){return companionAt(id,'medic')||old(id);};}
{const old=wkPlan;wkPlan=function(id,k){const p=old(id,k);if(!p||!companionAt(id,'eng'))return p;p.cap=Math.ceil(p.cap*1.25);let n=p.cap;for(const r in p.R)n=Math.min(n,Math.floor((CG.T[id].st[r]||0)/p.R[r]*100));p.n=Math.max(0,n);p.short=Object.keys(p.R).filter(r=>(CG.T[id].st[r]||0)<p.R[r]*p.cap/100);return p;};}
{const old=needs;needs=function(id){const n=old(id);if(companionAt(id,'eng'))for(const k in n)n[k]=Math.ceil(n[k]*1.25);return n;};}
{const old=finishTraining;finishTraining=function(rep){
  for(const id of Object.keys(CG.T).filter(owned))if(companionAt(id,'lead')){
    for(const q of CG.T[id].trn)if(!q.drilled){q.t=Math.max(1,q.t-1);q.drilled=true;}
    for(const u of Object.values(CG.U))if(unitSite(u)===id)u.mor=Math.min(100,u.mor+5);
  }return old(rep);
};}
{const old=campRefresh;campRefresh=function(){old();if(!CG)return;const id=companionSite('marks');if(id){const range=2+(CG.T[id].bld.tower?1:0);for(const k of Object.keys(bfsDist(id,range)))SEEN.add(k);CG.everSeen=[...new Set([...(CG.everSeen||[]),...SEEN])];}};}
{const old=battleSpec;battleSpec=function(q){const s=old(q);if(q.type==='def')for(const sd of SQUAD)if(CG.posts?.[sd.id]===q.terr&&!s.members.includes(sd.id))s.members.push(sd.id);return s;};}
{const old=canCommand;canCommand=function(q){return old(q)||(q.type==='def'&&SQUAD.some(sd=>CG.posts?.[sd.id]===q.terr));};}
{const old=placeSquad;placeSquad=function(x,y,ang){if(CG?.pend&&!B.members){const a=CG.armies.find(a=>a.id===CG.pend.army);B.members=[...(a?.mem||[])];if(CG.pend.story===2)for(const sd of SQUAD)if(CG.posts?.[sd.id]===HOME&&!B.members.includes(sd.id))B.members.push(sd.id);}return old(x,y,ang);};}

function companionPanel(id){
  const box=document.createElement('div');box.className='wk';box.innerHTML=`<b>${Tz('特战队驻地与被动','Companions stationed here')}</b><div class="tip">${Tz('部曲停在本村时即生效。队员可留驻，随军离开则失效；同一被动不叠加。','Applies while their army is here. Companions may stay behind; benefits leave with them. Each passive applies once.')}</div>`;
  for(const sd of SQUAD){if(!companionAt(id,sd.id))continue;const row=document.createElement('div');row.style.marginTop='8px';row.innerHTML=`<b>${Tz(sd.zh,sd.en)}</b> · ${Tz(...COMPANION_PASSIVES[sd.id])}<br><span class="tip">HP ${sd.hp} · E ${Tz(sd.skE.zh,sd.skE.en)} · R ${Tz(...COMPANION_R[sd.id].name)}: ${Tz(...COMPANION_R[sd.id].desc)}</span>`;
    const a=CG.armies.find(a=>a.mem.includes(sd.id));if(CG.posts?.[sd.id]===id)row.appendChild(btn('归队','Rejoin army',()=>{companionRejoin(sd.id,id);settleUI(id);}));else if(a?.cmd!==sd.id)row.appendChild(btn('留驻本村','Station here',()=>{companionStation(sd.id,id);settleUI(id);}));box.appendChild(row);
  }
  if(!SQUAD.some(sd=>companionAt(id,sd.id)))box.insertAdjacentHTML('beforeend',`<p class="tip">${Tz('目前没有特战队员在此。','No companions are stationed here.')}</p>`);return box;
}
{const old=settleUI;settleUI=function(id,tab){const r=old(id,tab);if(owned(id)&&$('cSet'))$('cSet').appendChild(companionPanel(id));return r;};}
{const old=campOfficers;campOfficers=function(){old();const d=$('cOff');if(!d)return;const rows=[...d.children].filter(e=>e.classList.contains('panel'));SQUAD.forEach((sd,i)=>{const row=rows[i];if(!row)return;const at=companionSite(sd.id),note=document.createElement('div');note.className='wk';note.style.cssText='flex-basis:100%;margin-top:8px';note.innerHTML=`<b>${Tz('驻地被动','Village passive')} · ${at?tName(at):Tz('未驻扎己方村寨','Away from owned settlements')}</b><br>${Tz(...COMPANION_PASSIVES[sd.id])}<br><span class="tip">HP ${sd.hp} · R ${Tz(...COMPANION_R[sd.id].name)}: ${Tz(...COMPANION_R[sd.id].desc)}</span>`;if(at)note.appendChild(btn('查看驻地 / 留驻','View village / station',()=>{d.remove();settleUI(at,'garr');}));row.appendChild(note);});};}
{const old=drawHUD;drawHUD=function(){old();if(!B)return;ctx.save();B.squad.forEach((u,i)=>{const y=34+i*34;ctx.fillStyle='#101e1b';ctx.fillRect(48,y+16,120,10);ctx.fillStyle=u.dead?'#575757':u.hp/u.maxhp<.3?'#e38f6d':'#72d59d';ctx.fillRect(48,y+16,120*clamp(u.hp/u.maxhp,0,1),10);txt(`${Math.max(0,Math.ceil(u.hp))}/${u.maxhp}`,108,y+24,9,'#fff','center','bold ');});ctx.restore();
  let d=$('companionSkills');if(MODE!=='battle'){d?.remove();return;}if(!d){d=document.createElement('div');d.id='companionSkills';document.body.appendChild(d);}const selected=selSquad().filter(u=>!u.dead),u=selected.length===1?selected[0]:null;
  d.innerHTML=u?`<b>${Tz(u.sd.zh,u.sd.en)}</b> · E ${Tz(u.sd.skE.zh,u.sd.skE.en)}<br><b>R ${Tz(...COMPANION_R[u.sd.id].name)}</b> ${u.skR>0?Math.ceil(u.skR)+'s':Tz('就绪','Ready')}<br>${Tz(...COMPANION_R[u.sd.id].desc)}`:Tz('选择一名队员查看 E / R 技能。','Select one companion to inspect their E / R skills.');
};}
{const old=loop;loop=function(now){if(MODE!=='battle')$('companionSkills')?.remove();return old(now);};}
