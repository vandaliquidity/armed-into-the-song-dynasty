'use strict';
PERKS.lead[1]=PERKS.lead[1]||[{s:{},t:'rally'},{s:{},t:'drums'}];
function serviceState(){return CG.service||(CG.service={v:1,next:1,last:campaignMonth(),people:{},results:{},annals:[]});}
function servicePerson(key){const d=serviceState();return d.people[key]||(d.people[key]={status:'ready',history:[],battles:0,wins:0,rescues:0,scars:0});}
function serviceName(key){const p=bannerPerson(key);return p?Tz(p.zh,p.en):key;}
function serviceNote(key,zh,en){const p=servicePerson(key),entry={month:campaignMonth(),zh,en};p.history.unshift(entry);p.history.length=Math.min(40,p.history.length);serviceState().annals.unshift({key,...entry});serviceState().annals.length=Math.min(100,serviceState().annals.length);cgLog('⚑',serviceName(key)+' · '+Tz(zh,en));}
function serviceAvailable(key){if(!CG)return true;const p=CG.service?.people[key];return (!p||p.status==='ready')&&(!key.startsWith('o:')||!CG.off[key.slice(2)]?.dead);}
function serviceParticipants(q){const a=qArmy(q),keys=a?bannerPeople(a):[];if(q.type==='def')for(const [id,o]of Object.entries(CG.off||{}))if(o.hired&&(o.gov===q.terr||(!o.army&&o.bannerLoc===q.terr)))keys.push('o:'+id);if(q.type==='def')for(const sd of SQUAD)if(CG.posts?.[sd.id]===q.terr)keys.push('s:'+sd.id);return [...new Set(keys)].filter(serviceAvailable);}
function serviceDetach(key){
 const [kind,id]=key.split(':');for(const a of CG.armies){if(kind==='s')a.mem=a.mem.filter(x=>x!==id);else{a.attachedOfficers=(a.attachedOfficers||[]).filter(x=>x!==id);if(a.off===id)a.off=null;}
  if(a.cmd===id||a.cmd==='o'+id){a.cmd=a.mem[0]||(a.off?'o'+a.off:'acting');a.dest=null;a.route=[];}}
 if(kind==='s'&&CG.posts)delete CG.posts[id];if(kind==='o'&&CG.off[id]){CG.off[id].army=null;CG.off[id].gov=null;for(const s of Object.values(CG.T))if(s.gov===id)s.gov=null;}
 if(CG.bannerService)for(const order of CG.bannerService.orders)order.officers=order.officers.filter(x=>x!==key);
}
function serviceInjure(key,at,defeat){
 const p=servicePerson(key);if(p.status!=='ready')return false;const sid=key.slice(2),s=CG.sq[sid];if(!s)return false;
 p.scars++;p.status='evacuating';p.at=at;p.home=HOME;p.trail=[at];p.anim=0;p.rest=defeat?10:5;p.left=p.rest;p.started=campaignMonth();
 p.previousRank=s.rank;s.rank=Math.max(0,s.rank-1);for(const r of Object.keys(s.picks))if(+r>s.rank)delete s.picks[r];s.merit=Math.min(s.merit,MERIT_AT[s.rank]||0);
 if(at===HOME&&owned(HOME)){p.status='resting';p.admitted=campaignMonth();}serviceDetach(key);serviceNote(key,`重伤，降一级；须运回清河后休养${p.rest}个月。`,`Gravely wounded; demoted one grade. Evacuate to Qinghe, then rest ${p.rest} months.`);return true;
}
function serviceDeath(key,at){const p=servicePerson(key);if(p.status==='dead')return false;const id=key.slice(2),o=CG.off[id];if(!o)return false;p.status='dead';p.at=at;p.died=campaignMonth();serviceDetach(key);o.dead=true;o.hired=0;o.death={month:campaignMonth(),at};serviceNote(key,`阵亡于${CT[at].zh}，军籍永久除名。`,`Killed at ${CT[at].en}; permanently removed from service.`);return true;}
function serviceTick(){const state=serviceState(),now=campaignMonth();if(state.last>=now)return false;state.last=now;
 for(const [key,p]of Object.entries(state.people)){
  if(p.status==='evacuating'||p.status==='blocked'){
   if(now<=p.started)continue;const path=careFriendly(p.at)&&owned(HOME)?supplyPath(p.at,HOME):null;
   if(!path){p.status='blocked';continue;}p.status='evacuating';if(path.length>1){p.at=path[1];p.trail.push(p.at);p.anim=0;}
   if(p.at===HOME){p.status='resting';p.admitted=now;serviceNote(key,`担架抵达清河；休养${p.rest}个月。`,`Stretcher reached Qinghe; ${p.rest} months of convalescence begin.`);}continue;
  }
  if(p.status==='resting'){
   if(!owned(HOME)){p.suspended=true;continue;}p.suspended=false;if(now<=p.admitted)continue;p.left=Math.max(0,p.left-1);
   if(!p.left){p.status='ready';CG.posts=CG.posts||{};CG.posts[key.slice(2)]=HOME;serviceNote(key,'休养结束，在清河待命；降级保留。','Recovered and available at Qinghe; the demotion remains.');}
  }
 }return true;
}
function serviceRecord(q,result,participants,down,initial){
 const state=serviceState(),at=careFriendly(q.terr)?q.terr:careFriendly(qArmy(q)?.loc)?qArmy(q).loc:participants.map(k=>bannerOfficerAt(k)).find(careFriendly)||q.terr;
 for(const key of participants){const p=servicePerson(key);p.battles++;if(result.win)p.wins++;serviceNote(key,`${CT[q.terr].zh}${result.win?'立功':'败退'}，本军伤亡${result.lostN+result.wnd}。`,`${result.win?'Victory':'Defeat'} at ${CT[q.terr].en}; ${result.lostN+result.wnd} formation casualties.`);
  if(key.startsWith('s:')){if(!result.win||down.has(key))serviceInjure(key,at,!result.win);}
  else if(down.has(key)||(!result.win&&(result.lostN+result.wnd)>=Math.max(1,initial*.35)))serviceDeath(key,q.terr);
 }
 result.officerConsequences=participants.filter(k=>!serviceAvailable(k)).map(k=>({key:k,status:servicePerson(k).status}));
}
{const old=resolveBattle;resolveBattle=function(q,win,r){if(!q.serviceToken)q.serviceToken=serviceState().next++;const state=serviceState();if(state.results[q.serviceToken])return state.results[q.serviceToken];
 const participants=serviceParticipants(q),initial=qUnits(q).reduce((n,u)=>n+u.men,0),down=new Set(B?.serviceDown||[]);if(B?.skirm&&SK_SNAP?.q===q)for(const u of B.squad)if(u.dead||u.downed)down.add('s:'+u.type);
 const result=old(q,win,r);if(!result)return result;state.results[q.serviceToken]=result;serviceRecord(q,result,participants,down,initial);campRefresh();saveGame();return result;};}
{const old=campAfterStory;campAfterStory=function(i,win,st){const pend=CG?.pend,army=pend&&CG.armies.find(a=>a.id===pend.army),keys=army?bannerPeople(army).filter(serviceAvailable):[],token=pend?`${i}-${pend.army}-${CG.stats.battles}`:null,down=new Set((B?.squad||[]).filter(u=>u.dead||u.downed).map(u=>'s:'+u.type)),at=army?.loc||HOME,r=old(i,win,st);
 if(pend&&keys.length&&!CG.pend){for(const key of keys){servicePerson(key).battles++;if(win)servicePerson(key).wins++;if(key.startsWith('s:')&&(!win||down.has(key)))serviceInjure(key,at,!win);else if(key.startsWith('o:')&&down.has(key))serviceDeath(key,at);}saveGame();}return r;};}
{const old=SETUP.skirm;SETUP.skirm=function(){old();B.serviceDown=[];const a=SK_SNAP?.q&&qArmy(SK_SNAP.q),keys=SK_SNAP?.q?serviceParticipants(SK_SNAP.q).filter(k=>k.startsWith('o:')):[],troops=B.units.filter(u=>u.team===0&&u.kind==='troop'&&!u.cart);keys.forEach((key,i)=>{if(troops[i])troops[i].serviceOfficer=key;});};}
{const old=kill;kill=function(u,src){if(u.serviceOfficer&&B){B.serviceDown=B.serviceDown||[];if(!B.serviceDown.includes(u.serviceOfficer))B.serviceDown.push(u.serviceOfficer);}return old(u,src);};}
{const old=battleSpec;battleSpec=function(q){const spec=old(q);spec.members=spec.members.filter(id=>serviceAvailable('s:'+id));return spec;};}
{const old=placeSquad;placeSquad=function(...args){const prev=B.members;B.members=(prev||SQUAD.map(s=>s.id)).filter(id=>serviceAvailable('s:'+id));return old(...args);};}
{const old=companionSite;companionSite=function(id){return serviceAvailable('s:'+id)?old(id):null;};}
{const old=canPromote;canPromote=function(id){return serviceAvailable('s:'+id)&&old(id);};}
{const old=bannerMoveOfficers;bannerMoveOfficers=function(keys,...rest){if(keys.some(k=>!serviceAvailable(k)))return false;return old(keys,...rest);};}
{const old=bannerCreate;bannerCreate=function(key){return serviceAvailable(key)?old(key):null;};}
{const old=companionRejoin;companionRejoin=function(id,...rest){return serviceAvailable('s:'+id)&&old(id,...rest);};}
{const old=offHire;offHire=function(id){return CG.off[id]?.dead?false:old(id);};}
{const old=chronOfficer;chronOfficer=function(id){if(CG.off?.[id]?.dead)return;return old(id);};}
{const old=orderMarch;orderMarch=function(a,to){if(!a.mem.some(id=>serviceAvailable('s:'+id))&&!a.off)return false;return old(a,to);};}
{const old=perkSum;perkSum=function(){if(!CG)return old();const saved=[];for(const [id,s]of Object.entries(CG.sq))if(!serviceAvailable('s:'+id)){saved.push([s,s.picks]);s.picks={};}try{return old();}finally{for(const [s,picks]of saved)s.picks=picks;}};}
{const old=endTurn;endTurn=function(){const before=CG&&campaignMonth(),result=old();if(CG&&campaignMonth()!==before){serviceTick();saveGame();}return result;};}
// A mortal Song officer can lead normal tactical troops while companions rest.
// Mark existing figures rather than creating an extra company or immortal hero.
{const old=canCommand;canCommand=function(q){if(q.story&&!serviceAvailable('s:lead'))return false;return old(q)||(qUnits(q).some(u=>u.men>0)&&serviceParticipants(q).some(k=>k.startsWith('o:')));};}
{const old=SETUP.skirm;SETUP.skirm=function(){old();const officers=B.units.filter(u=>u.serviceOfficer);for(const u of officers){u.maxhp=Math.max(u.maxhp,220+40*(CG.off[u.serviceOfficer.slice(2)]?.lvl||0));u.hp=u.maxhp;}if(!B.squad.length&&officers.length){B.ctrl=officers[0];B.lose=()=>B.chronicle?.party?.every(u=>u.dead)?Tz('救援队伍全灭','The trapped party was lost'):B.units.some(u=>u.team===0&&!u.dead&&u.kind==='troop'&&!u.cart)?B.key?.dead?Tz('粮仓失守','The granary was lost'):null:Tz('本军已无法作战','No fighting troops remain');}};}
{const old=chronArmy;chronArmy=function(c,id){return old(c,id)||CG.armies.find(a=>(id==null||a.id===id)&&!a.dest&&!a.route?.length&&armyUnits(a).some(u=>u.men>0)&&(a.loc===c.site||CADJ[c.site]?.includes(a.loc))&&bannerPeople(a).some(k=>k.startsWith('o:')&&serviceAvailable(k)));};}
{const old=useSkillE;useSkillE=function(u,m){if(u?.serviceOfficer){if(u.dead||u.skE>0||B.paused||B.over||tacticalFrozen())return;u.skE=40;for(const t of B.units)if(t.team===0&&!t.dead&&Math.hypot(t.x-u.x,t.y-u.y)<200){t.rout=false;t.stun=Math.max(0,(t.stun||0)-1);}B.buff.cry=Math.max(B.buff.cry,4);say('将领整队，稳住军阵。','The officer rallies the formation.',2);return;}if(!u?.sd)return;const fallen=(B?.squad||[]).filter(x=>x.dead),r=old(u,m);for(const t of fallen)if(!t.dead)t.downed=false;return r;};}
{const old=companionSecondary;companionSecondary=function(u,...args){if(!u?.sd||!COMPANION_R[u.sd.id])return false;return old(u,...args);};}
{const old=kill;kill=function(u,src){const r=old(u,src);if(u.serviceOfficer){u.gone=true;if(B.ctrl===u)B.ctrl=B.units.find(t=>t!==u&&t.team===0&&!t.dead&&(t.serviceOfficer||t.kind==='troop')&&!t.cart)||u;}return r;};}

{const old=updTroop;updTroop=function(u,dt){if(u.serviceOfficer)u.skE=Math.max(0,(u.skE||0)-dt);return old(u,dt);};}

{const old=campStory;campStory=function(i,q){if(CG&&i!==1&&(!serviceAvailable('s:lead')||!CG.armies.some(a=>a.cmd==='lead'))){cgLog('⚑',Tz('林队须在清河恢复并归队，才能重返开篇战役。','The captain must recover and rejoin at Qinghe before returning to an opening battle.'));showCamp();return false;}return old(i,q);};}
