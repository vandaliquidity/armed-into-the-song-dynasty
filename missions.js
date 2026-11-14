'use strict';

let missionBriefRoster=null;
function missionChapterDone(i){return CAMP.done.includes(i)||(i===1&&CG.journey?.stage==='complete');}
function missionCancelBrief(){if(MODE==='brief'&&CG?.pend?.story===2){CG.pend=null;if(missionBriefRoster)CAMP.roster=missionBriefRoster;missionBriefRoster=null;saveGame();}}

function missionsInit(){
  if(!CG||CG.missionsVersion===1||CG.pend)return;
  // Old saves may already have this scripted march queued. Hold it for the hub;
  // ordinary enemy armies keep their existing orders and deadlines.
  const held=CG.xa.some(x=>x.story==='ch3')||CG.queue.some(q=>q.story==='ch3');
  if(held){CG.xa=CG.xa.filter(x=>x.story!=='ch3');CG.queue=CG.queue.filter(q=>q.story!=='ch3');CG.story.qingheHeld=1;}
  CG.missionsVersion=1;
}
function missionReady(){
  const a=journeyLeader();return MODE==='camp'&&!CG.over&&!CG.pend&&CG.phase===0&&!CG.queue.length&&a&&a.loc===HOME&&!a.dest&&a.mem.length&&armyUnits(a).some(u=>u.men>0);
}
function missionQinghe(){
  if(!missionChapterDone(1)||missionChapterDone(2)||!missionReady())return false;
  CG.story.ch3warn=1;CG.story.qingheHeld=0;CG.story.qingheAttempts=(CG.story.qingheAttempts||0)+1;
  $('cMissions')?.remove();missionBriefRoster={...CAMP.roster};saveGame();campStory(2);return true;
}
function missionNext(){
  if(CG)journeyState();
  if(MODE!=='camp'||!CG||CG.over||CG.pend)return false;
  if(CG.phase===3&&CG.queue.length){$('cMissions')?.remove();showCamp();if(!$('cBattle'))campEl().appendChild(battleCard());return true;}
  if(!missionChapterDone(1)){$('cMissions')?.remove();journeyUI();return true;}
  if(!missionChapterDone(2))return missionQinghe();
  missionsUI();return false;
}
function missionOperations(){
  const offers=[];if(CG.phase!==0||CG.pend)return offers;
  for(const a of CG.armies){if(!a.mem.length||!armyUnits(a).some(u=>u.men>0)||!owned(a.loc)||a.dest||a.route?.length)continue;
    for(const terr of CADJ[a.loc]||[])if(['xia','free'].includes(CG.T[terr].own))offers.push({army:a.id,terr,type:CG.T[terr].own==='xia'?'raid':'claim'});
  }
  return offers.sort((a,b)=>CG.T[a.terr].str-CG.T[b.terr].str||a.terr.localeCompare(b.terr)).slice(0,6);
}
function missionPlan(army,terr){
  if(MODE!=='camp'||CG.phase!==0||CG.pend||!missionOperations().some(o=>o.army===army&&o.terr===terr))return false;
  const a=CG.armies.find(a=>a.id===army);if(!rtsGo([a],terr,CG.T[terr].own==='xia'))return false;
  saveGame();campUI();missionsUI(Tz('已下达行动命令。点击“执行军令”开始行军与战斗。','Operation ordered. Use Resolve orders to start the march and battle.'));return true;
}
function missionsUI(message=''){
  if(CG)journeyState();
  if(MODE!=='camp'||!CG)return;missionsInit();$('cMissions')?.remove();const d=document.createElement('div');d.id='cMissions';d.className='panel modal';d.style.cssText='width:min(850px,94%);max-width:850px;max-height:88vh;overflow:auto';
  d.innerHTML=`<div class="campaign-eyebrow">${Tz('战役任务总览','CAMPAIGN MISSION BOARD')}</div><h2>${Tz('边地纪事与军务','Missions and frontier operations')}</h2><p>${Tz('剧情任务集中在此。准备好后点击开始或继续；未开始的清河剧情战不会自动倒计时。普通敌军进攻仍按战役时间推进。','Story missions live here. Start or continue when you are ready; the scripted Qinghe battle has no countdown before you launch it. Ordinary enemy attacks still follow the campaign clock.')}</p>${message?'<p class="ok">'+message+'</p>':''}`;
  const active=CG.phase===3&&CG.queue.length;
  const ready=missionReady();const next=btn(active?'处理当前战事':'开始 / 继续下一任务',active?'Command current battle':'Start / continue next mission',missionNext);next.id='missionNext';
  if(!active&&missionChapterDone(1)&&!missionChapterDone(2)&&!ready){next.classList.add('dis');next.style.pointerEvents='none';next.setAttribute('aria-disabled','true');}
  if(!active&&missionChapterDone(1)&&missionChapterDone(2)){next.innerHTML=T('剧情已完成 · 下方可安排边地行动','Story complete · choose a frontier operation below');next.classList.add('dis');next.style.pointerEvents='none';}
  d.appendChild(next);
  function row(title,tag,desc,label,fn,enabled=true){const r=document.createElement('div');r.className='wk mission-row';r.innerHTML=`<div><b>${title}</b><span class="chip">${tag}</span></div><p>${desc}</p>`;if(fn){const b=btn(label[0],label[1],fn);if(!enabled){b.classList.add('dis');b.style.pointerEvents='none';b.setAttribute('aria-disabled','true');}r.appendChild(b);}d.appendChild(r);return r;}
  row(Tz('第一章 · 保卫清河','I · Defend Qinghe'),CAMP.done.includes(0)?Tz('已完成','Completed'):Tz('开篇','Prologue'),Tz('初到宋境的清河保卫战。','Your first defence after arriving in the Song frontier.'),null,null);
  const j=journeyState(),finished=missionChapterDone(1),expandedDone=j.stage==='complete',escortWon=j.result?.win&&['market','homeward'].includes(j.stage);
  const journey=row(Tz('第二章 · 秦州押运','II · Escort to Qinzhou'),finished?Tz('已完成','Completed'):escortWon?Tz('押运已完成 · 待交易与归乡','Escort completed · trade and homecoming remain'):j.stage==='prepare'?Tz('可准备','Available'):Tz('进行中','In progress'),finished&&!expandedDone?Tz('存档已记录原版秦州押运任务完成。无需重新押运，第三章已解锁。','Your save records the original Qinzhou escort as complete. No replay is required; Chapter III is unlocked.'):Tz('重建清河、择路押运、解救乡人、在秦州交易，再带着人才与物资归来。','Prepare Qinghe, escort a convoy, rescue villagers, trade in Qinzhou, and bring people and supplies home.'),finished&&!expandedDone?null:expandedDone?['查看行旅记事','View journey journal']:escortWon?['完成交易与归乡','Finish trade and homecoming']:['准备 / 继续行旅','Prepare / continue journey'],finished&&!expandedDone?null:()=>{d.remove();journeyUI();});journey.dataset.mission='qinzhou';const jb=journey.querySelector('.btn');if(jb)jb.id='missionJourney';
  if(finished&&!expandedDone){const optional=row(Tz('可选 · 再访秦州','Optional · Return to Qinzhou'),j.stage==='prepare'?Tz('支线扩展','Optional expansion'):Tz('支线进行中','Optional expedition in progress'),Tz('新增行旅支线，可结识陆婉并改善清河。它不影响第二章的已完成状态，也不是推进主线的要求。','An expanded expedition to meet Lu Wan and improve Qinghe. It does not change your completed escort record and is not required for the main story.'),['游玩 / 继续可选支线','Play / continue optional expedition'],()=>{d.remove();journeyUI();});optional.dataset.mission='qinzhou-return';optional.querySelector('.btn').id='missionJourney';}
  if(finished){const replay=btn('重玩第二章押运（演练）','Replay Chapter II escort (practice)',()=>{d.remove();journeyReplay();});replay.id='missionReplayJourney';journey.appendChild(replay);}
  const won=missionChapterDone(2),unlocked=missionChapterDone(1);
  const q=row(Tz('第三章 · 清河血战','III · The Battle of Qinghe'),won?Tz('已完成','Completed'):!unlocked?Tz('秦州商路开通后解锁','Unlock by opening Qinzhou trade'):ready?Tz('等你准备好','Ready when you are'):Tz('待整军','Prepare your army'),Tz('西夏三千大军。保住粮仓并击杀敌军统领即可获胜，无须杀尽敌军。开战后有35秒布防；秦州援军在进攻开始45秒后出现。','A 3,000-strong Xia host. Protect the granary and kill its commander to win. You have 35 seconds to prepare; unlocked Qinzhou riders arrive 45 seconds after the assault begins.'),won?null:['我已准备好，开始清河战役','I am ready: start Qinghe'],won?null:missionQinghe,unlocked&&ready);const qb=q.querySelector('.btn');if(qb)qb.id='missionQinghe';
  if(!won&&!ready)q.insertAdjacentHTML('beforeend',`<div class="tip">${Tz('在筹划阶段，让林队部、队员与至少一支部队回到清河，取消其行军令，并先处理当前战事。','During Planning, bring Captain Lin’s band, companions and at least one troop unit to Qinghe, cancel its march order, and resolve any current battles.')}</div>`);
  d.insertAdjacentHTML('beforeend',`<h2 style="margin-top:20px">${Tz('持续军务','Ongoing frontier operations')}</h2><p class="tip">${Tz('主线目前是以上三章。边地行动可持续进行，目标随疆界与部队位置变化；它们使用真实行军、占领与劫营规则。','The current main story has the three chapters above. Frontier operations continue with targets based on borders and army positions, using the normal march, occupation and raid rules.')}</p>`);
  const ops=missionOperations();for(const o of ops){const a=CG.armies.find(a=>a.id===o.army);row((o.type==='raid'?Tz('劫营 · ','Supply raid · '):Tz('收复 · ','Secure · '))+tName(o.terr),Tz('可安排','Available'),`${armyName(a)} · ${tName(a.loc)} → ${tName(o.terr)} · ${Tz('敌兵约','Enemy approximately')} ${CG.T[o.terr].str}`,['下达行动命令','Plan operation'],()=>missionPlan(o.army,o.terr));}
  if(!ops.length)d.insertAdjacentHTML('beforeend',`<p class="tip">${Tz('暂无相邻目标。让有队员与部队的军队靠近西夏或未归附村寨，即会出现可安排的行动。','No adjacent targets. Move an army with companions and troops beside Xia or unaligned territory to reveal operations.')}</p>`);
  if(CG.xa.length)d.insertAdjacentHTML('beforeend',`<div class="wk"><b>${Tz('正在接近的敌军','Incoming enemy armies')}</b>${CG.xa.map(x=>`<div>${tName(x.from)} → ${tName(x.to)} · ${Math.max(0,x.eta)} ${Tz('个月','month(s)')}</div>`).join('')}</div>`);
  d.appendChild(btn('关闭','Close',()=>d.remove()));campEl().appendChild(d);
}
CAMPAIGN_ICONS.missions=CAMPAIGN_ICONS.flag;
{const old=showCamp;showCamp=function(){missionCancelBrief();return old();};}
{const old=showCVil;showCVil=function(id){missionCancelBrief();return old(id);};}
{const old=campAfterStory;campAfterStory=function(i,win,stats){const r=old(i,win,stats);if(i===2)missionBriefRoster=null;return r;};}
{const old=campLoad;campLoad=function(){old();missionsInit();};}
{const old=campUI;campUI=function(){missionsInit();old();if(MODE!=='camp'||!CG)return;const b=$('cJourneyB');if(b){b.id='cMissionsB';b.onclick=()=>missionsUI();b.innerHTML=campaignIcon('missions','nav-icon')+'<span class="nav-label">'+T('战役任务','Missions')+'</span>';}};}
// Campaign shortcuts must not resolve orders underneath a mission dialog.
{const old=campKey;campKey=function(k,e){const panel=$('cJourney')||$('cMissions');if(MODE==='camp'&&panel){if(k==='escape')panel.remove();return;}return old(k,e);};}
