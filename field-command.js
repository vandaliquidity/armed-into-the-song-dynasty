'use strict';

SQUAD.find(s=>s.id==='lead').en='Lin Feng';LORE.squad.lead.en='Lin Feng';
SHIPK.commission={zh:'奉调部队',en:'Commissioned formations',c:'#8fbed0',ic:'⚑'};
const FIELD_COMMISSIONS=[
 {id:'qinghe',chapter:0,bonus:2,title:['清河守将','Qinghe command'],units:[['spear',100],['xbow',100]]},
 {id:'qinzhou',chapter:1,bonus:5,title:['秦州边军统领','Qinzhou field command'],units:[['spear',200],['xbow',200],['cav',100]]},
 {id:'western',chapter:2,bonus:10,title:['西军统制','Western Army command'],units:[['spear',400],['xbow',400],['cav',200]]},
 {id:'imperial',chapter:2,year:1124,bonus:15,title:['勤王军统领','Imperial relief command'],units:[['spear',500],['xbow',700],['cav',300]]}
];
function fieldState(){return CG.fieldCommand||(CG.fieldCommand={awards:{},bonus:0,reserveSlots:0});}
function fieldArrive(rows){
  const leader=journeyLeader(),state=fieldState();for(const [type,total] of rows){let left=total;while(left>0){const n=Math.min(100,left),inArmy=leader&&leader.loc===HOME&&leader.units.length<armyDuCap(leader),u=newUnit(type,n,{arm:UT[type].arm,wq:2,exp:3,mor:100,home:HOME,loc:inArmy?{a:leader.id}:{v:HOME}});if(inArmy)leader.units.push(u.id);else state.reserveSlots++;left-=n;}}
}
function fieldAward(id){
  if(!CG||CG.over||CG.pend)return false;const c=FIELD_COMMISSIONS.find(c=>c.id===id),state=fieldState();if(!c||state.awards[id]||!missionChapterDone(c.chapter)||(c.year&&historyStartYear()+Math.floor((CG.turn-1)/4)<c.year))return false;
  state.awards[id]=1;state.bonus+=c.bonus;
  if(id==='qinghe')fieldArrive(c.units);
  else{const from=careFriendly('qinzhou')?'qinzhou':HOME,path=supplyPath(from,HOME)||shipPath(from,HOME),goods={};for(const [type,n] of c.units)for(const [k,v] of Object.entries(refitKit(type,UT[type].arm,n)))goods[k]=(goods[k]||0)+v;
    shipNew('commission',from,HOME,goods,{path,eta:Math.max(1,path.length-1),left:Math.max(1,path.length-1),commissionUnits:c.units,commission:id});}
  cgLog('⚑',Tz(`林队获授${c.title[0]}：统兵上限增加${c.bonus}都，获拨${c.units.reduce((n,r)=>n+r[1],0)}名正规军。`,`Lin Feng receives ${c.title[1]}: command +${c.bonus} companies; ${c.units.reduce((n,r)=>n+r[1],0)} regulars assigned.`));saveGame();return true;
}
function fieldAwards(){if(!CG||CG.pend)return;for(const c of FIELD_COMMISSIONS)if(!c.year)fieldAward(c.id);}
{const old=armyDuCap;armyDuCap=function(a){return old(a)+(a?.mem?.includes('lead')?(CG.fieldCommand?.bonus||0):0);};}
{const old=garrCap;garrCap=function(id){return old(id)+(id===HOME?(CG.fieldCommand?.reserveSlots||0):0);};}
{const old=campStart;campStart=function(){old();fieldAwards();};}
{const old=campAfterStory;campAfterStory=function(i,win,stats){const r=old(i,win,stats);if(win)fieldAwards();return r;};}
{const old=journeyChoice;journeyChoice=function(key){const r=old(key);if(r&&CG.journey?.stage==='complete')fieldAwards();return r;};}
{const old=shipTurn;shipTurn=function(lines){const held=shipsOn().filter(s=>s.kind==='commission'&&!s.state&&s.path.slice(Math.max(0,s.eta-s.left)).some(id=>!careFriendly(id)));CG.ship=shipsOn().filter(s=>!held.includes(s));old(lines);CG.ship.push(...held);};}
{const old=shipRisk;shipRisk=function(s){return s.commissionUnits?0:old(s);};}
{const old=shipDeliver;shipDeliver=function(s,lines){if(s.commissionPaid)return;const eligible=s.commissionUnits&&!s.state,r=old(s,lines);if(eligible){s.commissionPaid=1;for(const [k,n] of Object.entries(s.goods))supplyBox(HOME,k)[k]=Math.max(0,supplyBox(HOME,k)[k]-n);fieldArrive(s.commissionUnits);saveGame();}return r;};}
{const old=campLoad;campLoad=function(){old();fieldAwards();};}
{const old=missionsUI;missionsUI=function(message){fieldAwards();old(message);const d=$('cMissions');if(!d)return;const state=fieldState(),panel=document.createElement('div');panel.className='wk';panel.id='cFieldCommand';panel.innerHTML=`<h2>${Tz('林队的统兵之路','Lin Feng’s field command')}</h2><p>${Tz('任务胜利带来军令、正规军与更大的统兵上限。奉调部队沿道路抵达清河；统领在场且有空位时直接归队，否则驻清河军营。','Mission victories grant commissions, regular formations and larger command capacity. Ordered troops travel to Qinghe, joining Lin Feng if he is present with space, otherwise staying in its garrison.')}</p>`;
  for(const c of FIELD_COMMISSIONS){const ready=missionChapterDone(c.chapter)&&(!c.year||historyStartYear()+Math.floor((CG.turn-1)/4)>=c.year),row=document.createElement('div');row.className='wk';row.innerHTML=`<b>${Tz(...c.title)}</b> · ${c.units.reduce((n,r)=>n+r[1],0)} ${Tz('正规军','regulars')} · +${c.bonus} ${Tz('都统兵上限','company command slots')} · ${state.awards[c.id]?Tz('已受命','Commission granted'):ready?Tz('可受命','Available'):Tz('待完成任务','Complete the preceding campaign')}${c.year?' · '+c.year+'+':''}`;if(c.year&&!state.awards[c.id]){const b=btn('接受勤王军统领之命','Accept imperial relief command',()=>{if(fieldAward(c.id)){campUI();missionsUI();}});if(!ready){b.classList.add('dis');b.style.pointerEvents='none';}row.appendChild(b);}panel.appendChild(row);}d.insertBefore(panel,d.lastElementChild);
};}
