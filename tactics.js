'use strict';

const TACTICAL_PLANS={
 line:{name:['盾弩中军','Shield and bolt'],desc:['步卒在前，弓弩在后，保留骑兵。','Infantry in front, missiles behind, cavalry in reserve.']},
 left:{name:['左翼迂回','Left hook'],desc:['一部由左侧展开，其余保持正面。','Deploy a left wing while the centre fixes the enemy.']},
 right:{name:['右翼迂回','Right hook'],desc:['一部由右侧展开，争夺敌后军旗。','Deploy a right wing and threaten the enemy standard.']}
};
const TACTICAL_OBJECTIVES={
 farm:{kind:'harvest',name:['保住收成','Save the harvest'],desc:['90秒内夺下粮仓区。','Secure the first depot within 90 seconds.']},
 market:{kind:'evac',name:['护送乡人','Bring the townspeople out'],desc:['接近乡人，再护送他们抵达撤离区。','Reach the townspeople, then escort them to extraction.']},
 fort:{kind:'signal',name:['截断传令','Cut the signal'],desc:['敌预备队到达前夺下外寨。','Take the outer ward before the reserve arrives.']},
 city:{kind:'signal',name:['封住援军入口','Seal the reinforcement gate'],desc:['抢占城门区，让现有预备队无法投入。','Secure the gate district before the existing reserve commits.']},
 steppe:{kind:'baggage',name:['截住辎重','Intercept the baggage'],desc:['逼近行进的辎重车，清除护卫后控制它；不要击毁。','Reach the moving wagon and hold nearby after clearing its escort; keep it intact.']},
 crossing:{kind:'signal',name:['守住渡口','Close the approach'],desc:['预备队抵达前控制西桥头。','Secure the west bridgehead before the reserve arrives.']},
 quarry:{kind:'ridge',name:['争夺高地','Hold the ridge'],desc:['控制矿场区后，留兵守住8秒。','Capture the mine works, then keep soldiers there for eight seconds.']}
};
function tacticalFrozen(){return !!B?.tactics&&(B.tactics.deploying||B.tactics.paused);}
function tacticalLiving(u){return !u.dead&&!u.downed&&!u.inVeh&&!u.gone;}
function tacticalLog(zh,en){const s=B.tactics;s.log.unshift({t:Math.round(B.t),zh,en});s.log.length=Math.min(5,s.log.length);say(zh,en,2.2);}
function tacticalInit(q=null){
  const regular=!!B.skirm&&!B.journey&&!q?.chronicle&&!B.chronicle;
  const total=B.skirm?Object.values(B.skirm.enemy).reduce((n,x)=>n+x,0):0;
  B.tactics={regular,deploying:regular&&total>0,paused:false,speed:1,plan:q?.tacticalPlan||'line',queued:{},log:[],initialTroops:B.units.filter(u=>u.team===0&&u.kind==='troop'&&!u.cart).map(u=>u.id),initial:B.units.filter(u=>u.team===0&&selectable(u)).map(u=>({id:u.id,x:u.x,y:u.y})),cohesion:100,coverSaved:0,flankDamage:0,sideEarned:false,sideHold:0,recaptures:0,routed:0,queueClock:0};
  const s=B.tactics;if(!regular)return;
  const F=B.frontier,p=B.skirm.profile;s.sidePoint=B.skirm.mode==='def'?F.points.at(-1):F.points[0];s.reserveAt=45;s.reserveEvent=B.events.find(e=>e.tacticalReserve);s.reservePending=!!s.reserveEvent;
  s.objective=B.skirm.mode==='def'&&['farm','market'].includes(p.type)?TACTICAL_OBJECTIVES.market:B.skirm.mode==='def'?{kind:'ridge',name:['出击压住侧翼','Counterattack the flank'],desc:['控制标记据点并留兵8秒，迫使敌军分兵。','Take the marked post and hold it eight seconds to draw enemy troops away.']}:TACTICAL_OBJECTIVES[p.type];
  F.defendTime=Math.min(F.defendTime,110+B.skirm.tier*8);
  for(const point of F.points){point.need=8;point.enemyHold=0;}
  s.cover=F.points.map(point=>({x:point.x,y:point.y,r:85}));
  if(s.reserveEvent){const event=s.reserveEvent,release=event.f;event.c=()=>B.t>=s.reserveAt&&!s.reserveCancelled;event.f=()=>{s.reservePending=false;s.reserveReleased=true;release();tacticalLog('敌预备队正在投入，注意侧翼！','The existing reserve is committing. Watch the flank!');};}
  if(s.objective.kind==='evac'){
    s.evac=B.civs.slice();if(!s.evac.length){const at=F.points[0];for(let i=0;i<3;i++){const u=mkUnit('civ',2,at.x+(i-1)*22,at.y+55,{kind:'civ',spr:'villager',home:{x:at.x,y:at.y}});B.civs.push(u);s.evac.push(u);}}
    for(const u of s.evac)u.tacticalEvac=true;
    s.evacNeed=Math.max(1,Math.ceil(s.evac.length*.6));
  }
  if(s.objective.kind==='baggage'){
    const u=B.units.find(u=>u.team===1&&!u.def.range&&!u.def.mounted&&!u.dead);
    if(u){u.tacticalWagon=true;u.spr='oxcart';u.r=14;s.wagon=u;s.wagonExit={x:(B.W-4)*TS,y:u.y};}
    else{s.objective=TACTICAL_OBJECTIVES.farm;}
  }
  tacticalCaptain();tacticalDeploy(s.plan);
  setSel(B.units.filter(selectable));
  if(s.deploying)B.skirm.hud.goal={zh:'选择部署、排定军令，然后执行。',en:'Choose deployment, queue orders, then execute.'};
  tacticalLog('先看地形，再下第一道军令。','Survey the ground, then give your opening orders.');
}
function tacticalCaptain(){
  const s=B?.tactics;if(!s?.regular||s.captain)return;
  s.captain=B.units.filter(u=>u.team===1&&tacticalLiving(u)&&!u.tacticalWagon).sort((a,b)=>(b.maxhp||0)-(a.maxhp||0))[0]||null;
  if(s.captain)s.captain.tacticalCaptain=true;
}
function tacticalDeploy(plan){
  const s=B?.tactics;if(!s?.regular||!s.deploying||!TACTICAL_PLANS[plan])return false;s.plan=plan;
  const defenders=B.skirm.mode==='def',base=defenders?{x:B.key.x,y:B.key.y+100}:B.frontier.extraction;
  const rows={front:[],ranged:[],wing:[],officers:[]};
  for(const u of B.units.filter(u=>u.team===0&&selectable(u))){const original=s.initial.find(o=>o.id===u.id);if(original){u.x=original.x;u.y=original.y;}u.ord=null;
    if(u.kind==='squad')rows.officers.push(u);else if(u.def.mounted)rows.wing.push(u);else if(u.def.range)rows.ranged.push(u);else rows.front.push(u);
  }
  if(plan!=='line'&&!rows.wing.length&&rows.front.length>3)rows.wing.push(...rows.front.splice(-Math.max(2,Math.floor(rows.front.length*.3))));
  const side=plan==='left'?-1:1;
  const deploy=(units,x,y)=>{const width=Math.min(14,units.length);units.forEach((u,i)=>{const [px,py]=snapFree(0,x+(i%width-(width-1)/2)*22,y+Math.floor(i/width)*22);u.x=px;u.y=py;u.face=-Math.PI/2;u.ord={type:'hold',x:u.x,y:u.y,f:u.face};});};
  deploy(rows.front,base.x,base.y-180);deploy(rows.ranged,base.x,base.y-20);deploy(rows.wing,base.x+side*(plan==='line'?200:280),base.y-100);deploy(rows.officers,base.x,base.y+70);
  B.form.spear=true;B.form.shield=true;B.form.xbow=true;if(SK_SNAP?.q)SK_SNAP.q.tacticalPlan=plan;return true;
}
function tacticalResume(){
  if(!B?.tactics||B.paused||B.over)return false;const s=B.tactics;s.deploying=false;s.paused=false;
  const queued=Object.values(s.queued);s.queued={};for(const action of queued){const u=action.unit&&B.units.find(u=>u.id===action.unit);if(action.unit&&!tacticalLiving(u||{dead:true}))continue;TACTICAL_CASTS[action.kind](u,action.target,action.id);}
  return true;
}
function tacticalPause(){if(!B?.tactics||B.over||B.paused)return false;if(tacticalFrozen())return tacticalResume();B.tactics.paused=true;return true;}
function tacticalQueue(kind,u,target,id){if(!B?.tactics||B.over)return false;B.tactics.queued[(u?.id||id)+':'+kind]={kind,unit:u?.id,target:target?{x:target.x,y:target.y}:null,id};return true;}
const TACTICAL_CASTS={
 E:((old)=>(u,m)=>old(u,m))(useSkillE),R:((old)=>(u,m)=>old(u,m))(companionSecondary),
 Q:((old)=>(u,m)=>old(u,m))(throwGrenade),A:((old)=>(u,m,id)=>old(id,m?.x,m?.y))(useAbil)
};
{const old=useSkillE;useSkillE=function(u,m){return tacticalFrozen()?tacticalQueue('E',u,m):old(u,m);};}
{const old=companionSecondary;companionSecondary=function(u,m){return tacticalFrozen()?tacticalQueue('R',u,m):old(u,m);};}
{const old=throwGrenade;throwGrenade=function(u,m){return tacticalFrozen()?tacticalQueue('Q',u,m):old(u,m);};}
{const old=useAbil;useAbil=function(id,x,y){return tacticalFrozen()?tacticalQueue('A',null,{x,y},id):old(id,x,y);};}
{const old=beginSkirm;beginSkirm=function(q){const r=old(q);if(B)tacticalInit(q);return r;};}
{const old=beginBattle;beginBattle=function(...args){const r=old(...args);if(B)tacticalInit();return r;};}
{const old=spawnGroup;spawnGroup=function(...args){const units=old(...args);tacticalCaptain();return units;};}
{const old=onKey;onKey=function(k,e){if(MODE==='battle'&&B?.tactics&&!B.over&&!PAUSE_MENU&&!HELP_ON&&k==='p'){e?.preventDefault();if(!e?.repeat)tacticalPause();return;}return old(k,e);};}
{const old=updateBattle;updateBattle=function(dt){if(tacticalFrozen())return;if(B?.tactics){const speed=B.tactics.speed||1;for(let i=0;i<speed;i++){if(!B||MODE!=='battle')break;old(dt);}}else return old(dt);};}
function tacticalEvacuated(u){return !u.dead&&u.tacticalRescued&&Math.hypot(u.x-B.frontier.extraction.x,u.y-B.frontier.extraction.y)<130;}
{const old=updCiv;updCiv=function(u,dt){if(!B?.tactics?.regular||!u.tacticalEvac)return old(u,dt);
  if(!u.tacticalRescued){if(B.skirm.mode==='def'||B.units.some(o=>o.team===0&&tacticalLiving(o)&&Math.hypot(o.x-u.x,o.y-u.y)<140))u.tacticalRescued=true;else return;}
  if(!tacticalEvacuated(u)){const e=B.frontier.extraction;goTo(u,e.x,e.y,u.def.spd*.9,dt,8);}
};}
// Advance orders fight on the way instead of making soldiers run through an
// enemy line. Ordinary right-click movement retains its original precision.
{const old=updSquad;updSquad=function(u,dt){const order=u.ord;if(!B?.tactics||order?.type!=='tacticalAdvance')return old(u,dt);
  tacticalTrack(u);
  if(u.ord!==order)return old(u,dt);
  const target=nearestFoe(u,u.type==='marks'?620:240,null),sniper=u.type==='marks';
  const engage=target&&(!sniper||B.weaponsFree||keyTarget(target)||Math.hypot(target.x-u.x,target.y-u.y)<90);
  u.ord=engage?{type:'hold',x:u.x,y:u.y,f:u.face}:{...order,type:'move'};old(u,dt);
  u.ord=Math.hypot(u.x-order.x,u.y-order.y)<9?{...order,type:'hold'}:order;
};}
{const old=keyTarget;keyTarget=function(u){return !!u?.tacticalCaptain||old(u);};}
function tacticalTrack(u){const o=u.ord;if(o?.type!=='tacticalAdvance'||!o.followTarget)return;
  const target=B.units.find(a=>a.id===o.followTarget);if(!target||target.dead||target.tacticalCaptured||target.tacticalEvac&&tacticalEvacuated(target)){u.ord={type:'hold',x:u.x,y:u.y,f:u.face};return;}
  o.x=target.x+(o.offsetX||0);o.y=target.y+(o.offsetY||0);
}
{const old=troopOrder;troopOrder=function(u,dt){if(B?.tactics)tacticalTrack(u);return old(u,dt);};}
{const old=nearestFoe;nearestFoe=function(u,r,filter){return B?.tactics?.regular&&u.team===0?old(u,r,o=>!o.tacticalWagon&&(!filter||filter(o))):old(u,r,filter);};}
{const old=updEnemy;updEnemy=function(u,dt){
  const s=B?.tactics;if(!s?.regular)return old(u,dt);
  if(u.tacticalWagon){if(!u.tacticalCaptured&&B.t>8)goTo(u,s.wagonExit.x,s.wagonExit.y,u.def.spd*.5,dt,12);return;}
  if(!u.tacticalOrderAt||B.t>u.tacticalOrderAt){u.tacticalOrderAt=B.t+5;const lost=B.frontier.points.filter(p=>p.captured);
    if(lost.length){const point=lost.reduce((a,b)=>Math.hypot(u.x-a.x,u.y-a.y)<Math.hypot(u.x-b.x,u.y-b.y)?a:b);u.goal={x:point.x+(u.def.mounted?(u.id%2?220:-220):0),y:point.y+(u.def.mounted?80:0)};}
  }return old(u,dt);
};}
function tacticalCover(u,src){return !!src&&['troop','squad','enemy'].includes(u.kind)&&Math.abs(angDiff(u.face,Math.atan2(src.y-u.y,src.x-u.x)))<1.5&&B.tactics.cover.some(c=>Math.hypot(u.x-c.x,u.y-c.y)<c.r);}
{const old=damage;damage=function(u,n,src,opts={}){
  const s=B?.tactics;if(!s?.regular)return old(u,n,src,opts);let amount=n,covered=false,flanked=false;
  if(['arrow','bolt','bullet','tbolt'].includes(opts.kind)&&tacticalCover(u,src)){amount*=.75;covered=true;}
  if(src&&src.team!==u.team&&['troop','squad','enemy'].includes(u.kind)&&opts.kind!=='blast'&&Math.abs(angDiff(u.face,Math.atan2(src.y-u.y,src.x-u.x)))>2.2){amount*=1.18;flanked=true;}
  const before=u.hp,r=old(u,amount,src,opts),dealt=Math.max(0,before-u.hp);
  if(covered&&u.team===0&&dealt>0)s.coverSaved+=dealt/3;
  if(flanked&&src?.team===0&&dealt>0){s.flankDamage+=dealt;if(B.t>(s.flankFlash||0)){s.flankFlash=B.t+2;B.texts.push({x:u.x,y:u.y-35,t:1,s:Tz('侧后攻击','FLANKED'),c:'#f0d37b'});}}
  return r;
};}
function tacticalRout(u){if(!tacticalLiving(u)||u.rout)return;u.rout=true;u.routTo=Object.values(B.spawns).reduce((a,b)=>Math.hypot(a.x-u.x,a.y-u.y)<Math.hypot(b.x-u.x,b.y-u.y)?a:b);B.tactics.routed++;}
function tacticalPoint(point,dt){
  const F=B.frontier,s=B.tactics,near=B.units.filter(u=>tacticalLiving(u)&&!u.rout&&Math.hypot(u.x-point.x,u.y-point.y)<point.r),us=near.filter(u=>u.team===0&&['troop','squad','enemy'].includes(u.kind)&&!u.cart),them=near.filter(u=>u.team===1&&!u.tacticalWagon);
  point.contested=them.length>0;
  if(point.captured){
    if(F.mission==='raid'){const carrier=B.units.find(u=>u.id===point.carrierId);if(!carrier||!tacticalLiving(carrier)){point.captured=false;point.held=0;}return;}
    point.enemyHold=them.length>=2&&!us.length?(point.enemyHold||0)+dt:0;
    if(point.enemyHold>=8){point.captured=false;point.held=0;point.enemyHold=0;s.recaptures++;tacticalLog('敌军夺回据点，留下守军再推进！','The enemy retook a post. Leave a guard before advancing!');}return;
  }
  if(them.length)point.held=Math.max(0,point.held-dt*.4);
  else if(us.length)point.held=Math.min(point.need,point.held+dt*Math.min(1.5,us.length/2));
  if(point.held>=point.need){point.captured=true;point.carrierId=us[0]?.id;tacticalLog('控制 '+point.name[0],point.name[1]+' secured');s.captures=(s.captures||0)+1;
    if(point===s.sidePoint&&s.reservePending){s.reserveCancelled=true;s.reservePending=false;s.reserveEvent.done=true;tacticalLog('传令路被截断，预备队未能投入。','The signal route is cut. The existing reserve cannot commit.');}
  }
}
function tacticalTick(dt){
  const s=B.tactics,F=B.frontier;if(B.paused||B.over||tacticalFrozen())return;F.elapsed+=dt;
  const points=B.skirm.mode==='def'?[s.sidePoint]:F.points;for(const p of points)tacticalPoint(p,dt);
  const at=s.sidePoint,kind=s.objective.kind;
  if(!s.sideEarned){
    if(kind==='harvest'&&at.captured&&F.elapsed<=90)s.sideEarned=true;
    if(kind==='signal'&&at.captured&&!s.reserveReleased)s.sideEarned=true;
    if(kind==='ridge'){if(at.captured&&!at.contested&&B.units.some(u=>u.team===0&&tacticalLiving(u)&&Math.hypot(u.x-at.x,u.y-at.y)<at.r))s.sideHold+=dt;else s.sideHold=0;if(s.sideHold>=8)s.sideEarned=true;}
    if(kind==='evac'&&s.evac.filter(tacticalEvacuated).length>=s.evacNeed)s.sideEarned=true;
    if(kind==='baggage'&&s.wagon&&!s.wagon.dead){const w=s.wagon,near=B.units.filter(u=>tacticalLiving(u)&&!u.rout&&u!==w&&Math.hypot(u.x-w.x,u.y-w.y)<130),us=near.filter(u=>u.team===0),foes=near.filter(u=>u.team===1);if(us.length&&!foes.length)s.sideHold+=dt;else s.sideHold=0;if(s.sideHold>=5){s.sideEarned=true;w.tacticalCaptured=true;tacticalRout(w);}}
    if(s.sideEarned)tacticalLog('战机达成：'+s.objective.name[0],s.objective.name[1]+' achieved');
  }
  tacticalCaptain();
  if(s.captain?.dead&&!s.captainFallen){s.captainFallen=true;let n=0;for(const u of B.units)if(u.team===1&&!u.dead&&Math.hypot(u.x-s.captain.x,u.y-s.captain.y)<180&&n++<Math.max(2,B.enemyTotal*.2))tacticalRout(u);tacticalLog('敌将倒下，近卫开始动摇！','The enemy officer fell. Nearby guards are breaking!');}
  const broken=B.units.filter(u=>u.team===1&&(u.dead||u.rout||u.gone)).length,captured=F.points.filter(p=>p.captured).length;
  s.cohesion=Math.max(0,100-(broken/Math.max(1,B.enemyTotal)*60+(s.captainFallen?30:0)+captured/F.points.length*50));
  const pending=B.skirm.mode==='def'?B.wave<B.waves.length-1:s.reservePending;
  if(B.t>25&&s.cohesion<=22&&!pending&&(B.skirm.mode==='def'||captured>0)&&F.mission!=='raid'){
    if(!s.decisive){s.decisive=true;for(const u of B.units)if(u.team===1)tacticalRout(u);tacticalLog('敌阵瓦解，无需逐个追杀。','The enemy line has broken. No need to hunt every survivor.');}
  }
  const hp=B.key?Math.max(0,Math.round(B.key.hp/B.key.maxhp*100)):100;
  B.skirm.hud.goal=B.skirm.mode==='def'?{zh:`守住粮仓 ${hp}% · ${Math.ceil(Math.max(0,F.defendTime-F.elapsed))}秒 · 敌军凝聚 ${Math.round(s.cohesion)}%`,en:`Granary ${hp}% · ${Math.ceil(Math.max(0,F.defendTime-F.elapsed))}s · enemy cohesion ${Math.round(s.cohesion)}%`}:F.mission==='raid'?{zh:'夺取辎重并护送携带者撤回，不必歼灭全军。',en:'Seize supplies and escort the carriers back; do not chase every enemy.'}:{zh:`据点 ${captured}/${F.points.length} · 敌军凝聚 ${Math.round(s.cohesion)}%`,en:`Posts ${captured}/${F.points.length} · enemy cohesion ${Math.round(s.cohesion)}%`};
}
{const old=battlefieldTick;battlefieldTick=function(dt){return B?.tactics?.regular?tacticalTick(dt):old(dt);};}
{const old=beginSkirm;beginSkirm=function(q){const r=old(q);if(B?.tactics?.regular){const win=B.win;B.win=()=>B.tactics.decisive&&(!B.key||!B.key.dead)||win();}return r;};}
function tacticalReport(){
  const s=B.tactics,current=B.units.filter(u=>s.initialTroops.includes(u.id)&&!u.dead).length,retained=s.initialTroops.length?current/s.initialTroops.length:1;
  const achievements=[];if(s.sideEarned)achievements.push(s.objective.name);if(s.captainFallen)achievements.push(['打断敌军指挥','Enemy command broken']);if(retained>=.8)achievements.push(['保全主力','Main force preserved']);
  return {plan:s.plan,seconds:Math.round(B.t),retained,achievements,score:Math.min(3,achievements.length),coverSaved:Math.round(s.coverSaved),flankDamage:Math.round(s.flankDamage),routed:Math.max(s.routed,B.units.filter(u=>u.team===1&&(u.rout||u.gone)).length)};
}
{const old=resolveBattle;resolveBattle=function(q,win,stats){
  if(q.tacticalRewardPaid&&B?.tactics?.rewardQuery===q)return B.tactics.rewardResult;
  const manual=!stats.auto&&!q.tacticalRewardPaid&&B?.tactics?.regular&&SK_SNAP?.q===q,report=manual?tacticalReport():null,defenders=CG?.T[q.terr]?.str||0,r=old(q,win,stats);
  if(!manual||!r)return r;q.tacticalRewardPaid=true;r.q.tacticalRewardPaid=true;r.tacticalReport=report;
  if(['atk','raid'].includes(q.type)&&!owned(q.terr))CG.T[q.terr].str=Math.min(CG.T[q.terr].str,Math.max(0,defenders-Math.max(0,Math.round(stats.kills||0))));
  const kit=r.capturedEquipment,extra={};if(win&&kit&&report.score){const rate=Math.min(.8,kit.rate+report.score*.05);for(const [k,n]of Object.entries(kit.inventory)){const add=Math.max(0,Math.min(n,Math.ceil(n*rate))-(kit.goods[k]||0));if(add)extra[k]=add;}
    const ship=kit.shipment&&shipsOn().find(s=>s.id===kit.shipment&&!s.state);
    for(const [k,n]of Object.entries(extra)){kit.goods[k]=(kit.goods[k]||0)+n;if(ship)ship.goods[k]=(ship.goods[k]||0)+n;else supplyBox(kit.to,k)[k]=(supplyBox(kit.to,k)[k]||0)+n;}
    kit.rate=rate;report.recoveryBonus=report.score*5;report.extra=extra;
  }
  B.tactics.rewardQuery=q;B.tactics.rewardResult=r;CG.last=r;syncRes();saveGame();return r;
};}
