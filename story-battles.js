'use strict';
// The relay encounter is a gameplay adaptation of the frontier dispatch arc.
{const c=chronChapter('signals');c.scenario='crossing';c.site=HOME;c.war=true;c.goals.push(cg('battle','signals'));CAMPAIGN_OPERATIONS.signals.stages.push(os('护送信使','Escort the courier',c.goals.length-1));}
CAMPAIGN_OPERATIONS.signals.order=['清河近邻的实际夏军试图截断驿递。夺下两处接力点，护送信使抵达远端并守稳10秒；若近邻已被平定，和平开通，不另生敌兵。','Actual Xia troops near Qinghe threaten the dispatch route. Take both relay posts, escort the courier to the far post and secure it for 10 seconds. Earlier conquests open the route peacefully.'];
CAMPAIGN_OPERATIONS.blackstone.order=['山寨内的首领遭人囚禁。夺下两处营垒，接应被囚寨主并护送至撤离点；别把降书变成一场屠戮。','A coup has imprisoned the stronghold’s chief. Take both wards, reach the prisoner and escort him to extraction. Leave room for surrender.'];
{const old=SETUP.skirm;SETUP.skirm=function(){
 old();const id=B.skirm.chronicle,F=B.frontier;if(campaignStory().flags.mentor==='manoeuvre')for(const u of B.units)if(u.team===0&&u.kind==='troop'&&!u.cart)u.def={...u.def,spd:u.def.spd*1.06};
 if(id==='blackstone'){
  if(campaignStory().chiefLost){B.storyBattle={kind:'afterChiefLoss'};B.skirm.hud.goal={zh:'寨主已死；夺取营垒，登记剩下的证词。',en:'The chief is lost. Take the wards and preserve the remaining testimony.'};B.win=()=>F.points.every(p=>p.captured&&!p.contested);return;}
  const at=F.points[F.points.length-1],chief=mkUnit('civ',2,at.x,at.y+70,{kind:'civ',spr:'villager',home:{x:at.x,y:at.y},name:['被囚寨主','Captive chief'],hp:220,maxhp:220});chief.team=3;chief.storyChief=true;chief.rescued=false;B.civs.push(chief);B.storyBattle={kind:'chief',chief};
  B.skirm.hud.goal={zh:'夺取营垒，救出寨主并护送撤离；其死亡不会重置。',en:'Take the wards, free the chief and escort him out. His death is permanent.'};const lose=B.lose;B.lose=()=>chief.dead?Tz('被囚寨主遇害','The captive chief was killed'):lose();B.win=()=>!chief.dead&&chief.rescued&&Math.hypot(chief.x-F.extraction.x,chief.y-F.extraction.y)<140&&F.points.every(p=>p.captured&&!p.contested);
 }
 if(id==='signals'){
  const start=F.extraction,courier=mkUnit('song_cav',0,start.x,start.y,{kind:'troop',cart:1,spr:'song_cav',type:'cart',r:11,hp:500,maxhp:500,def:{armor:.15,spd:62,mounted:1},storyCourier:true});B.carts.push(courier);B.storyBattle={kind:'courier',courier,waypoint:0,held:0};
  B.skirm.hud.goal={zh:'夺取驿点，护送信使穿越，守稳远端10秒。',en:'Take the relays, escort the courier across and secure the far post for 10 seconds.'};const lose=B.lose;B.lose=()=>courier.dead?Tz('信使阵亡，驿递中断','The courier was killed; the dispatch failed'):lose();B.win=()=>!courier.dead&&B.storyBattle.held>=10;
 }
};}
{const old=updCiv;updCiv=function(u,dt){if(!u.storyChief)return old(u,dt);if(u.dead||B.paused||B.over)return;if(!u.rescued){if(!B.frontier.points.at(-1).captured||!B.units.some(a=>a.team===0&&!a.dead&&!a.downed&&Math.hypot(a.x-u.x,a.y-u.y)<140))return;u.rescued=true;u.team=0;}const e=B.frontier.extraction;goTo(u,e.x,e.y,u.def.spd*.85,dt,8);};}
{const old=updCart;updCart=function(u,dt){if(!u.storyCourier)return old(u,dt);if(u.dead||B.paused||B.over)return;const o=B.storyBattle,F=B.frontier,p=F.points[Math.min(o.waypoint,F.points.length-1)];if(!p.captured||p.contested||B.units.some(e=>e.team===1&&!e.dead&&Math.hypot(e.x-u.x,e.y-u.y)<110))return;if(Math.hypot(u.x-p.x,u.y-p.y)<65&&o.waypoint<F.points.length-1)o.waypoint++;const goal=F.points[o.waypoint];goTo(u,goal.x,goal.y,u.def.spd,dt,10);};}
{const old=battlefieldTick;battlefieldTick=function(dt){old(dt);const o=B?.storyBattle;if(!o||B.paused||B.over)return;const F=B.frontier;if(o.kind==='afterChiefLoss'){B.skirm.hud.goal={zh:'寨主已死；夺取营垒，追查剩下的证词，损失不会重置。',en:'The chief is lost. Take the wards and preserve the remaining evidence; the loss will not reset.'};return;}if(o.kind==='chief')B.skirm.hud.goal={zh:'控制两处营垒，接应被囚寨主并护送至撤离点。',en:'Take both wards, free the captive chief and escort him to extraction.'};else{
  const end=F.points.at(-1),safe=!o.courier.dead&&F.points.every(p=>p.captured&&!p.contested)&&Math.hypot(o.courier.x-end.x,o.courier.y-end.y)<100;o.held=safe?o.held+dt:0;
  B.skirm.hud.goal={zh:`夺取驿递接力点，护送信使穿越前线，守稳10秒 · ${Math.floor(o.held)}/10`,en:`Take the relay posts, escort the courier across and hold 10s · ${Math.floor(o.held)}/10`};
 }};}
{const old=resolveBattle;resolveBattle=function(q,win,r){
 const state=campaignStory(),token=q.chronicleToken,already=token&&state.battles[token],o=B?.storyBattle,threat=q.chronicle==='signals'&&chronicle().threats.signals,remaining=threat&&Math.max(0,threat.remaining-(r.kills||0));
 const result=old(q,win,r);if(!result||!q.chronicle||already)return result;
 if(win&&threat?.from&&CG.T[threat.from]?.own==='xia')warSetMen(threat.from,warMen(threat.from)+remaining);
 const rescued=o?.kind==='chief'?+(!o.chief.dead&&o.chief.rescued&&Math.hypot(o.chief.x-B.frontier.extraction.x,o.chief.y-B.frontier.extraction.y)<140):o?.kind==='courier'?+(!o.courier.dead&&o.held>=10):null;
 if(q.chronicle==='blackstone'&&o?.chief?.dead)state.chiefLost=true;
 const record={chapter:q.chronicle,win,month:campaignMonth(),fallen:result.lostN,wounded:result.wnd,rescued,chiefLost:q.chronicle==='blackstone'&&!!state.chiefLost};state.battles[token]=record;
 const label=chronChapter(q.chronicle).title;storyJournal(q.chronicle,label[0]+` · ${win?'胜利':'失利'} · 阵亡${result.lostN}，负伤${result.wnd}`,label[1]+` · ${win?'Victory':'Setback'} · ${result.lostN} fallen, ${result.wnd} wounded`);
 if(q.chronicle==='blackstone'&&rescued){CG.T.longcheng.storyLandmarks=CG.T.longcheng.storyLandmarks||{};CG.T.longcheng.storyLandmarks.blackstone='chief';}
 if(record.chiefLost){CG.T.longcheng.storyLandmarks=CG.T.longcheng.storyLandmarks||{};CG.T.longcheng.storyLandmarks.blackstone='memorial';storyJournal('blackstone','被囚寨主遇害，后续行动保留这一损失。','The captive chief was killed; subsequent operations retain this loss.');}
 if(Object.keys(state.battles).length>100)delete state.battles[Object.keys(state.battles)[0]];result.storyRecord=record;saveGame();return result;
};}
