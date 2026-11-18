'use strict';
SHIPK.chronicle={zh:'战役专运',en:'Campaign dispatch',c:'#c9b278',ic:'⚑'};
for(const [id,zh,en,tr] of [['chron_yue','岳统领','Commander Yue',['martial','cautious']],['chron_feng','冯统领','Commander Feng',['martial','admin']],['chron_lan','兰将军','Commander Lan',['brave','cavalry']]])
  LORE.off.list.push({id,zh,en,k:'song',tr,c:0,req:{},sk:{zh:'战役任命：可领旗、驻防与治所任职。',en:'Campaign appointment: may command a banner, garrison or govern.'},bio:{zh:'随战役纪事加入；名字为本作改写。',en:'Joins through the chronicle; this adaptation uses an altered name.'}});
function chronicle(){return CG.chronicle||(CG.chronicle={v:1,done:{},active:null,cargo:{},threats:{},results:{},metrics:{made:{},trained:0},journal:[],next:1});}
function chronChapter(id){return CHRONICLE_CHAPTERS.find(c=>c.id===id);}
function chronNext(){const s=chronicle();return CHRONICLE_CHAPTERS.find(c=>!s.done[c.id]);}
function chronPlanning(){return MODE==='camp'&&CG&&!CG.over&&!CG.pend&&CG.phase===0&&!CG.queue.length;}
function chronStock(k){return Object.keys(CG.T).filter(owned).reduce((n,id)=>n+(supplyBox(id,k)[k]||0),0);}
function chronCanPay(id,cost){return Object.entries(cost).every(([k,n])=>supplyLocal(id,k)>=n);}
function chronRefuge(){return ['henan','qinzhou',HOME].find(careFriendly);}
function chronCargoSpec(c){const job=c.cargo;if(!job)return null;return job.to==='kaifeng'&&CG.jin?.outcome==='fallen'&&!careFriendly('kaifeng')?{...job,to:chronRefuge(),refuge:true}:job;}
function chronMen(test=()=>true){return Object.values(CG.U).filter(test).reduce((n,u)=>n+u.men,0);}
function chronNote(zh,en){const s=chronicle();s.journal.unshift({month:campaignMonth(),zh,en});s.journal.length=Math.min(80,s.journal.length);cgLog('📜',Tz(zh,en));}
function chronOfficer(id){if(!id)return;CG.off=CG.off||{};if(CG.off[id]?.hired)return;CG.off[id]={hired:1,loy:80,lvl:1,wins:0,army:null,gov:null};}
function chronCharter(id){
  const s=CG.T[id];if(s.own==='qh')return true;if(s.own!=='song')return false;
  const men=s.songGarrison?.men||0,type=s.songGarrison?.type==='cav'?'cav':'spear';
  // Transfer the actual allied garrison. The existing once-only village militia
  // grant remains an explicit opening difficulty accommodation.
  claimTerr(id);delete s.songGarrison;for(let n=men;n>0;n-=100)newUnit(type,Math.min(100,n),{loc:{v:id},home:id,exp:2});return true;
}
function chronGoal(c,g){
  const s=chronicle(),a=s.active?.id===c.id?s.active:null;let value=0,label='';
  const name=k=>Tz(...(RES_N[k]||[k,k]));
  if(c.id==='relief'&&CG.jin?.outcome){
    if(g.kind==='aid'){const value=g.key==='troops'?chronMen():chronStock(g.key==='crossbows'?'xbow':'grain');return {label:Tz('围城之后保留的兵力与物资 · ','Post-siege troops and reserves · ')+Tz(...({troops:['将士','Troops'],crossbows:['弩','Crossbows'],grain:['粮','Grain']}[g.key])),value,target:g.n,ok:value>=g.n};}
    if(g.kind==='readiness'){const ok=hospLv(HOME)>=1&&!Object.values(CG.U).some(u=>u.wnd>0&&!hospLv(unitSite(u)));return {label:Tz('围城之后的医疗与安置','Post-siege care and resettlement'),value:+ok,target:1,ok};}
  }
  switch(g.kind){
    case 'men':value=chronMen();label=Tz('可用将士','Fit soldiers');break;
    case 'veterans':value=chronMen(u=>u.exp>=2);label=Tz('有战阵经验的将士','Experienced soldiers');break;
    case 'building':{const t=CG.T[g.id];value=g.key==='hosp'?hospLv(g.id):g.key==='yard'?yardLv(g.id):t.bld[g.key]||0;label=tName(g.id)+' · '+Tz(...(g.key==='hosp'?['医馆','Hospital']:g.key==='yard'?['兵营','Barracks']:[DEV[g.key]?.zh||g.key,DEV[g.key]?.en||g.key]));break;}
    case 'business':value=Object.keys(CG.T).filter(owned).reduce((n,id)=>n+(CG.T[id].businesses?.[g.key]?.level||0),0);label=Tz(...DY_BUSINESSES[g.key].name);break;
    case 'months':value=a?Math.max(0,campaignMonth()-a.started):0;label=Tz('本章已筹备月数','Months since this chapter began');break;
    case 'stock':value=chronStock(g.key);label=name(g.key)+Tz(' · 本方实际库存',' · actual controlled stock');break;
    case 'made':value=s.metrics.made[g.key]||0;label=Tz('工坊实际制造 · ','Actually manufactured · ')+name(g.key);break;
    case 'trained':value=s.metrics.trained;label=Tz('兵营实际出营将士','Soldiers who completed training');break;
    case 'friendly':value=+careFriendly(g.key);label=tName(g.key)+Tz(' · 已解除敌方控制',' · cleared of hostile control');break;
    case 'owned':value=+owned(g.key);label=tName(g.key)+Tz(' · 本方治所',' · under your administration');break;
    case 'route':{const target=c.act===5&&g.key==='kaifeng'&&CG.jin?.outcome==='fallen'&&!careFriendly('kaifeng')?chronRefuge():g.key;value=+!!supplyPath(HOME,target);label=Tz('清河补给路 → ','Qinghe supply road → ')+tName(target);break;}
    case 'exports':value=CG.dynasty?.totalSales||0;label=Tz('商号实际出口回款','Export payments actually received');break;
    case 'cargo':value=+(s.cargo[g.key]?.state==='delivered'&&careFriendly(s.cargo[g.key].to));label=Tz('专运抵达且目的地仍安全','Cargo delivered to a still-friendly destination');break;
    case 'care':{const untreated=Object.values(CG.U).filter(u=>u.wnd>0&&!hospLv(unitSite(u))).reduce((n,u)=>n+u.wnd,0)+(CG.medical||[]).filter(b=>b.state==='blocked').reduce((n,b)=>n+b.n,0);value=+(untreated===0);label=Tz('伤兵均有医馆或转运安排','Every wounded group has care or a working evacuation route');break;}
    case 'battle':value=+(a?.wins?.[g.key]||s.done[c.id]);if(c.war&&!value&&!chronWarOrigins(c).length&&!s.threats[c.id]?.remaining)value=1;label=c.war?Tz('守住桥头，或已提前消除邻近威胁','Hold the bridgehead, or remove the adjacent threat beforehand'):Tz('完成本章救援或山寨战斗','Complete this chapter’s rescue or stronghold battle');break;
    case 'aid':value=historyAid()[g.key]||0;label=Tz('实际抵京 · ','Delivered to Kaifeng · ')+Tz(...({troops:['援兵','Troops'],crossbows:['弩','Crossbows'],grain:['军粮','Grain']}[g.key]));break;
    case 'readiness':value=historyReadiness();label=Tz('勤王筹备','Readiness');break;
    case 'research':value=+!!CG.dynasty?.siegecraft;label=Tz('军器分作的试炮研究完成','Prototype trials completed at the ordnance foundry');break;
    case 'outcome':value=+!!CG.jin?.outcome;label=Tz('地图上的汴京围城已有结果','The map siege of Kaifeng has an outcome');break;
  }
  return {label,value,target:g.n,ok:value>=g.n};
}
function chronStart(id,choice){
  if(!chronPlanning()||!missionChapterDone(2)||chronNext()?.id!==id)return false;
  const s=chronicle(),c=chronChapter(id);if(s.active)return s.active.id===id;
  if(c.choices&&!c.choices.some(x=>x[0]===choice))choice=c.choices[0][0];
  s.active={id,started:campaignMonth(),choice:choice||null,wins:{},attempts:0};
  chronNote(Tz(...c.title)+'：开始筹划。',Tz(...c.title)+': planning begins.');saveGame();return true;
}
function chronComplete(id){
  const s=chronicle(),c=chronChapter(id),a=s.active;
  if(!chronPlanning()||!c||a?.id!==id||s.done[id]||!c.goals.every(g=>chronGoal(c,g).ok)||!chronCanPay(HOME,c.cost))return false;
  if(c.charter&&!['qh','song'].includes(CG.T[c.charter].own))return false;
  for(const [k,n]of Object.entries(c.cost))take(HOME,k,n,false);s.done[id]={month:campaignMonth(),choice:a.choice};
  if(c.charter)chronCharter(c.charter);if(c.officer)chronOfficer(c.officer);
  if(c.command)fieldState().bonus+=c.command;
  if(c.prosperity)for(const at of [HOME,'longcheng'])if(owned(at))CG.T[at].prosp=Math.min(100,CG.T[at].prosp+c.prosperity);
  if(c.readiness)CG.ready=(CG.ready||0)+c.readiness;
  if(id==='recovery'&&a.choice==='rescue')chronOfficer('chron_lan');
  if(id==='truce'){
    if(a.choice==='truce'){const d=dynastyState();for(const at of Object.keys(d.markets))if(dynastyNearest(at,3))d.influence[at]=Math.min(100,(d.influence[at]||0)+10);}
    else for(const army of CG.armies)army.morale=Math.min(100,army.morale+10);
  }
  if(id==='xia'&&a.choice==='settlement')for(const at of Object.keys(CG.T).filter(owned))CG.T[at].tribX=Math.max(CG.T[at].tribX||0,CG.turn+4);
  if(id==='linhe'){chronCharter('linhe');CG.T.linhe.bld.hosp=Math.max(1,CG.T.linhe.bld.hosp||0);}
  if(id==='hospital'){const to=s.cargo.hospital.to;CG.T[to].bld.hosp=Math.max(1,CG.T[to].bld.hosp||0);CG.ready=(CG.ready||0)+5;}
  CAMP.res.rep=(CAMP.res.rep||0)+5;s.active=null;
  const choice=c.choices?.find(x=>x[0]===a.choice),suffix=choice?' · '+Tz(choice[1],choice[2]):'';
  chronNote(Tz(...c.title)+'：'+Tz(...c.reward)+suffix,Tz(...c.title)+': '+Tz(...c.reward)+suffix);
  campRefresh();syncRes();saveGame();return true;
}
function chronSendCargo(id,from){
  const s=chronicle(),c=chronChapter(id),job=c&&chronCargoSpec(c);if(!chronPlanning()||s.active?.id!==id||!job)return false;
  const existing=s.cargo[job.key];if((existing?.state==='delivered'&&careFriendly(existing.to))||shipsOn().some(x=>x.id===existing?.ship&&!x.state))return false;
  from=job.from||from||HOME;if(!owned(from)||!careFriendly(job.to)||!supplyPath(from,job.to))return false;
  const cost={...job.goods,silver:job.silver||0};if(!Object.entries(cost).every(([k,n])=>supplyLocal(from,k)>=n))return false;
  const ship=dynastyShipment('chronicle',from,job.to,job.goods,{chronicleChapter:id,chronicleCargo:job.key});if(!ship)return false;
  for(const [k,n]of Object.entries(cost))take(from,k,n,false);
  s.cargo[job.key]={ship:ship.id,state:'travel',from,to:job.to};chronNote('专运出发：'+tName(from)+' → '+tName(job.to),'Campaign cargo dispatched: '+tName(from)+' → '+tName(job.to));saveGame();return true;
}
function chronRerouteCargo(id){
  const c=chronChapter(id),spec=c&&chronCargoSpec(c),job=spec&&chronicle().cargo[spec.key],ship=shipsOn().find(x=>x.id===job?.ship&&!x.state);
  if(!chronPlanning()||chronicle().active?.id!==id||!spec?.refuge||!ship||ship.to===spec.to)return false;
  const path=supplyPath(ship.at,spec.to);if(!path)return false;
  ship.to=spec.to;ship.path=[...ship.trail,...path.slice(1)];ship.left=path.length-1;ship.eta=Math.max(ship.eta,ship.left);ship.blocked=false;ship._a=0;job.to=spec.to;
  chronNote('在途专运改向友方治所，物资不复制。','The existing convoy diverts to a friendly refuge without duplicating its cargo.');saveGame();return true;
}
function chronCargoArrived(ship){if(!ship.chronicleCargo||ship.chronicleCredited||ship.state!=='done')return;
  ship.chronicleCredited=true;const s=chronicle();s.cargo[ship.chronicleCargo]={...s.cargo[ship.chronicleCargo],state:'delivered',month:campaignMonth()};chronNote('战役专运抵达'+tName(ship.to),'Campaign dispatch arrived at '+tName(ship.to));saveGame();
}
{const old=dynastyArrive;dynastyArrive=function(ship,lines){if(ship.chronicleCargo&&(!careFriendly(ship.to)||ship.chronicleCredited))return false;const r=old(ship,lines);chronCargoArrived(ship);return r;};}
{const old=shipDeliver;shipDeliver=function(ship,lines){
  if(!ship.chronicleCargo)return old(ship,lines);
  if(ship.chronicleCredited||ship.state)return false;
  if(!careFriendly(ship.to))return false;
  const r=old(ship,lines);chronCargoArrived(ship);return r;
};}
{const old=produce;produce=function(rep){const made=old(rep);if(CG){const s=chronicle();for(const [k,n]of Object.entries(made))s.metrics.made[k]=(s.metrics.made[k]||0)+n;}return made;};}
{const old=finishTraining;finishTraining=function(rep){const before=chronMen(),r=old(rep);chronicle().metrics.trained+=Math.max(0,chronMen()-before);return r;};}
{const old=offReq;offReq=function(o){if(o.id.startsWith('chron_')&&!CG?.off?.[o.id]?.hired)return Tz('随战役纪事受命','Earn this appointment through the campaign chronicle');return old(o);};}
function chronWarOrigins(c){return (CADJ[c.site]||[]).filter(id=>CG.T[id].own==='xia'&&warMen(id)>=20);}
function chronThreat(c){
  const s=chronicle();if(s.threats[c.id])return s.threats[c.id];
  let men=c.enemy,from=null;if(c.war){from=chronWarOrigins(c).sort((a,b)=>warMen(b)-warMen(a))[0];if(!from)return null;men=Math.floor(warMen(from)*.5);warSetMen(from,warMen(from)-men);}
  return s.threats[c.id]={initial:men,remaining:men,from,at:c.site};
}
function chronArmy(c,id){return CG.armies.find(a=>(id==null||a.id===id)&&a.mem.length&&!a.dest&&!a.route?.length&&armyUnits(a).some(u=>u.men>0)&&(a.loc===c.site||(CADJ[c.site]||[]).includes(a.loc)));}
function chronBattle(id,armyId){
  const s=chronicle(),c=chronChapter(id);if(!chronPlanning()||s.active?.id!==id||!c.scenario||s.active.wins[id])return false;
  const army=chronArmy(c,armyId);if(!army)return false;const threat=chronThreat(c);if(!threat)return false;
  const token=s.next++,q={type:'chronicle',terr:c.site,army:army.id,chronicle:id,chronicleToken:token};s.active.battle={token,army:army.id};s.active.attempts++;
  saveGame();$('cMissions')?.remove();beginSkirm(q);campEl().style.display='none';return true;
}
{const old=qEnemyStr;qEnemyStr=function(q){return q.chronicle?(chronicle().threats[q.chronicle]?.remaining||0):old(q);};}
{const old=battleSpec;battleSpec=function(q){const s=old(q);if(!q.chronicle)return s;const c=chronChapter(q.chronicle),type=c.scenario==='rescue'?'market':c.scenario;
  s.profile={type,...BATTLE_REGIONS[type],seed:battlefieldHash('chronicle-'+c.id)};s.mission='occupy';s.mode='atk';s.chronicle=c.id;s.tier=1;
  s.hud={zh:c.title[0],en:c.title[1],goal:{zh:'执行本章目标，保全将士。',en:'Complete the chapter objective and preserve your soldiers.'}};return s;
};}
{const old=SETUP.skirm;SETUP.skirm=function(){old();const id=B.skirm.chronicle;if(!id)return;
  const c=chronChapter(id),F=B.frontier;B.chronicle={id,hold:0};
  if(c.scenario==='rescue'){
    const at=F.points[0];B.chronicle.party=[];
    for(let i=0;i<3;i++){const u=mkUnit('civ',2,at.x+(i-1)*20,at.y+60,{kind:'civ',spr:'villager',home:{x:at.x,y:at.y}});u.chronicleRescue=true;u.rescued=false;B.civs.push(u);B.chronicle.party.push(u);}
    const lose=B.lose;B.lose=()=>B.chronicle.party.every(u=>u.dead)?Tz('救援队伍全灭','The trapped party was lost'):lose();
    B.win=()=>B.chronicle.party.some(u=>!u.dead&&u.rescued&&Math.hypot(u.x-F.extraction.x,u.y-F.extraction.y)<140);
  }else if(c.scenario==='crossing')B.win=()=>F.points.every(p=>p.captured)&&B.chronicle.hold>=25;
};}
{const old=updCiv;updCiv=function(u,dt){if(!u.chronicleRescue)return old(u,dt);
  if(!u.rescued){if(B.units.some(a=>a.team===0&&!a.dead&&!a.downed&&Math.hypot(a.x-u.x,a.y-u.y)<140))u.rescued=true;else return;}
  const e=B.frontier.extraction;goTo(u,e.x,e.y,u.def.spd*.85,dt,8);
};}
{const old=battlefieldTick;battlefieldTick=function(dt){old(dt);if(!B?.chronicle||B.paused||B.over)return;const c=chronChapter(B.chronicle.id),F=B.frontier;
  if(c.scenario==='rescue'){const saved=B.chronicle.party.filter(u=>u.rescued&&!u.dead).length;B.skirm.hud.goal={zh:`找到并护送队伍返回撤离点 · 已接应${saved}/3`,en:`Reach the party, then escort it to extraction · ${saved}/3 reached`};}
  if(c.scenario==='crossing'){if(F.points.every(p=>p.captured&&!p.contested))B.chronicle.hold+=dt;else B.chronicle.hold=0;B.skirm.hud.goal={zh:`控制两岸桥头并守住25秒 · ${Math.floor(B.chronicle.hold)}/25`,en:`Secure both bridgeheads and hold 25s · ${Math.floor(B.chronicle.hold)}/25`};}
};}
{const old=resolveBattle;resolveBattle=function(q,win,r){
  if(!q.chronicle)return old(q,win,r);const s=chronicle();if(s.results[q.chronicleToken])return s.results[q.chronicleToken];
  if(s.active?.id!==q.chronicle||s.active.battle?.token!==q.chronicleToken)return null;
  const a=qArmy(q),inventory=win?spoilsEquipment(q):null;let lostN=0,wnd=0;
  for(const u of qUnits(q)){const lost=Math.max(0,Math.min(u.men,Math.round(u.men*(r.frac?r.frac(u):0)))),w=Math.round(lost*(a?.mem.includes('medic')?.52:.36));u.men-=lost;u.wnd=(u.wnd||0)+w;u.exp+=win?2:1;wnd+=w;lostN+=lost-w;}
  CG.stats.battles++;if(win)CG.stats.wins++;const threat=s.threats[q.chronicle];threat.remaining=win?0:Math.max(0,threat.remaining-Math.max(0,r.kills||0));
  if(win)s.active.wins[q.chronicle]=true;
  const gain={silver:0,grain:0,ore:0,horse:0,rep:win?5:0};CAMP.res.rep=(CAMP.res.rep||0)+gain.rep;
  const result={q:{...q},win,gain,lostN,back:0,wnd,kills:r.kills||0,terr:q.terr,t:r.t||0,saved:r.saved||0,auto:!!r.auto};
  if(win)result.capturedEquipment=spoilsAward(inventory,q.terr,owned(a.loc)?a.loc:HOME);
  s.results[q.chronicleToken]=result;s.active.battle=null;CG.last=result;chronNote(Tz(...chronChapter(q.chronicle).title)+(win?'：战斗目标达成。':'：失利，整军再来。'),Tz(...chronChapter(q.chronicle).title)+(win?': battle objective secured.':': a setback; regroup before returning.'));
  campRefresh();saveGame();return result;
};}
function chronNextAction(){const c=chronNext();if(!c){missionsUI();return false;}if(!chronicle().active)chronStart(c.id);missionsUI();return true;}
{const old=missionNext;missionNext=function(){return missionChapterDone(2)&&MODE==='camp'&&CG.phase===0&&!CG.queue.length?chronNextAction():old();};}
// Completion is manual; the calendar never consumes objectives or rewards.
{const old=campStart;campStart=function(){const r=old();chronicle();saveGame();return r;};}
{const old=campLoad;campLoad=function(){const r=old();if(CG)chronicle();return r;};}
