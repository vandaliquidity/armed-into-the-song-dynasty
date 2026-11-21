'use strict';
function tacticalButton(parent,label,fn,id){const b=document.createElement('button');b.type='button';b.className='tb-button';b.textContent=label;b.onclick=fn;if(id)b.id=id;parent.appendChild(b);return b;}
function tacticalChooseGroup(key){if(!B||B.over)return;const filter={all:u=>true,infantry:u=>u.kind==='troop'&&!u.def.range&&!u.def.mounted,missiles:u=>u.kind==='troop'&&u.def.range,cavalry:u=>u.kind==='troop'&&u.def.mounted,officers:u=>u.kind==='squad'||!!u.serviceOfficer}[key];setSel(B.units.filter(u=>selectable(u)&&filter(u)));}
function tacticalMoveTo(point){if(!B||B.over||!point)return;const units=selList();if(!units.length){say('先选择一队将士。','Select a group first.',2);return;}cmdMove(units,point.x,point.y);for(const u of units)if(u.ord?.type==='move'){u.ord.type='tacticalAdvance';if(point.tacticalWagon||point.tacticalEvac){u.ord.followTarget=point.id;u.ord.offsetX=u.ord.x-point.x;u.ord.offsetY=u.ord.y-point.y;}}camFocus(point.x,point.y);}
function tacticalFormation(){const units=selList().filter(u=>u.kind==='troop');if(!units.length){say('先选择步卒或弓弩。','Select infantry or missile troops first.',2);return;}const x=units.reduce((n,u)=>n+u.x,0)/units.length,y=units.reduce((n,u)=>n+u.y,0)/units.length;issueOrder('line',x,y,-Math.PI/2,[...new Set(units.map(u=>u.type))]);}
function tacticalSurvey(){if(!B)return;CAM.z=.5;camFocus(B.W*TS/2,B.H*TS/2);}
function tacticalHUDRemove(){$('tacticalUI')?.remove();}
let TACTICAL_UI_BATTLE=null,TACTICAL_UI_TIME=0;
function tacticalHUD(){
  if(MODE!=='battle'||!B?.tactics||B.over){tacticalHUDRemove();TACTICAL_UI_BATTLE=null;return;}
  const s=B.tactics;
  if(TACTICAL_UI_BATTLE!==B||!$('tacticalUI')){
    tacticalHUDRemove();TACTICAL_UI_BATTLE=B;const root=document.createElement('aside');root.id='tacticalUI';root.setAttribute('aria-label',Tz('战场指挥','Battlefield command'));
    for(const event of ['mousedown','mouseup','click','dblclick','contextmenu','keydown','keyup','wheel'])root.addEventListener(event,e=>e.stopPropagation());
    root.addEventListener('keydown',e=>{
      const k=e.key.toLowerCase();if(k==='p'){e.preventDefault();if(!e.repeat)tacticalPause();tacticalHUDPaint();return;}
      const modified=e.ctrlKey||e.metaKey||e.altKey;
      if((k==='escape'||/^[qerxgvbflwasd0-8h]$/.test(k))&&(!modified||/^[1-6]$/.test(k))){e.preventDefault();if(!KEY[k])keyHits[k]=true;KEY[k]=true;onKey(k,e);tacticalHUDPaint();}
    });
    root.addEventListener('keyup',e=>{KEY[e.key.toLowerCase()]=false;});
    root.addEventListener('mouseup',()=>{MOUSE.l=MOUSE.r=false;SEL.drag=null;});
    const header=document.createElement('div');header.className='tb-header';header.innerHTML='<span>'+Tz('亲自掌旗','TAKE COMMAND')+'</span><b id="tbState"></b>';root.appendChild(header);
    const controls=document.createElement('div');controls.className='tb-controls';
    tacticalButton(controls,'',()=>{tacticalPause();tacticalHUDPaint();},'tbPause');
    tacticalButton(controls,'1×',()=>{s.speed=1;tacticalHUDPaint();},'tbSpeed1');tacticalButton(controls,'2×',()=>{s.speed=2;tacticalHUDPaint();},'tbSpeed2');root.appendChild(controls);
    const hint=document.createElement('p');hint.className='tb-hint';hint.id='tbHint';root.appendChild(hint);
    if(s.regular){
      const deployment=document.createElement('div');deployment.id='tbDeployment';deployment.className='tb-section';deployment.innerHTML='<b>'+Tz('选择开局部署','Choose your deployment')+'</b>';
      for(const [key,plan]of Object.entries(TACTICAL_PLANS)){const b=tacticalButton(deployment,Tz(...plan.name),()=>{tacticalDeploy(key);tacticalHUDPaint();});b.dataset.plan=key;b.title=Tz(...plan.desc);}root.appendChild(deployment);
      const cohesion=document.createElement('div');cohesion.className='tb-section';cohesion.innerHTML=`<div class="tb-metric">${Tz('敌军凝聚','ENEMY COHESION')} <b id="tbCohesion"></b></div><div class="tb-meter"><i id="tbCohesionBar"></i></div>`;cohesion.title=Tz('夺据点、侧后出击、击倒军官，可迫使敌军撤退。','Take posts, flank and break command to force retreat.');root.appendChild(cohesion);
    }
    const select=document.createElement('div');select.className='tb-section';select.innerHTML='<b id="tbSelected"></b><div class="tb-groups"></div>';
    for(const [key,zh,en]of [['all','全军','All'],['infantry','步卒','Infantry'],['missiles','弓弩','Missiles'],['cavalry','骑兵','Cavalry'],['officers','队员','Officers']])tacticalButton(select.lastElementChild,Tz(zh,en),()=>tacticalChooseGroup(key));root.appendChild(select);
    const orders=document.createElement('div');orders.className='tb-controls';tacticalButton(orders,Tz('驻守','Hold'),()=>cmdHalt(selList()));tacticalButton(orders,Tz('盾弩列阵','Battle line'),tacticalFormation);tacticalButton(orders,Tz('查看全场','Survey'),tacticalSurvey);root.appendChild(orders);
    if(s.regular){
      const targets=document.createElement('div');targets.className='tb-section';targets.innerHTML='<b>'+Tz('派选中部队前往','SEND SELECTED TO')+'</b>';
      for(const [i,point]of B.frontier.points.entries()){if(B.skirm.mode==='def'&&point!==s.sidePoint)continue;const b=tacticalButton(targets,(i+1)+'. '+Tz(...point.name),()=>tacticalMoveTo(point));b.classList.add('tb-target');b.dataset.point=i;}
      tacticalButton(targets,Tz('护送辎重撤离','Escort carriers out'),()=>tacticalMoveTo(B.frontier.extraction),'tbExtract');
      tacticalButton(targets,Tz('进攻敌将','Attack the officer'),()=>{if(s.captain&&!s.captain.dead&&selList().length){cmdAttack(selList(),s.captain,'melee');camFocus(s.captain.x,s.captain.y);}},'tbOfficer');root.appendChild(targets);
      const chance=document.createElement('div');chance.className='tb-section tb-opportunity';chance.innerHTML='<b>'+Tz(...s.objective.name)+'</b><p>'+Tz(...s.objective.desc)+'</p><strong id="tbSideState"></strong>';root.insertBefore(chance,select);
      if(s.objective.kind==='evac'||s.objective.kind==='baggage')tacticalButton(chance,Tz('派选中部队接应','Send selected to intercept'),()=>{const p=s.wagon||s.evac.find(u=>!u.dead&&!tacticalEvacuated(u));if(p)tacticalMoveTo(p);});
      const intel=document.createElement('p');intel.id='tbIntent';intel.className='tb-intent';root.insertBefore(intel,select);
      const log=document.createElement('div');log.id='tbLog';root.appendChild(log);
    }
    const fold=tacticalButton(root,Tz('收起 / 展开军令','Fold / expand orders'),()=>root.classList.toggle('tb-folded'));fold.classList.add('tb-fold');document.body.appendChild(root);
  }
  tacticalHUDPaint();
}
function tacticalHUDPaint(){
  const root=$('tacticalUI');if(!root||!B?.tactics)return;const s=B.tactics;root.hidden=PAUSE_MENU||HELP_ON;
  $('tbState').textContent=s.deploying?Tz('部署中','DEPLOYMENT'):s.paused?Tz('筹划暂停','ORDERS PAUSED'):Tz('交战中','ENGAGED');
  $('tbPause').textContent=tacticalFrozen()?Tz('执行军令 ▶','Execute orders ▶'):Tz('暂停下令 [P]','Pause & order [P]');
  $('tbHint').textContent=tacticalFrozen()?Tz('战场时间暂停。可选择部队、下达路线和排定技能，执行后才消耗物资。','Time is frozen. Select units, give orders and queue skills; supplies are spent when execution resumes.')+(Object.keys(s.queued).length?' · '+Object.keys(s.queued).length+' '+Tz('个技能已排定','skills queued'):''):Tz('可随时按P暂停下令。侧后攻击与正面掩护对双方都有效。','Press P to plan. Rear attacks and frontal cover work for both sides.');
  $('tbSpeed1').classList.toggle('on',s.speed===1);$('tbSpeed2').classList.toggle('on',s.speed===2);
  $('tbSelected').textContent=Tz('已选中 ','Selected: ')+selList().length;
  if(!s.regular)return;
  $('tbDeployment').hidden=!s.deploying;for(const b of root.querySelectorAll('[data-plan]'))b.classList.toggle('on',b.dataset.plan===s.plan);
  $('tbCohesion').textContent=Math.round(s.cohesion)+'%';$('tbCohesionBar').style.width=Math.max(0,s.cohesion)+'%';
  for(const b of root.querySelectorAll('[data-point]')){const point=B.frontier.points[+b.dataset.point];b.classList.toggle('secured',point.captured);b.textContent=(point.captured?'✓ ':point.contested?'⚔ ':'')+(+b.dataset.point+1)+'. '+Tz(...point.name);}
  $('tbExtract').hidden=B.frontier.mission!=='raid'&&s.objective.kind!=='evac';$('tbOfficer').disabled=!s.captain||s.captain.dead;
  let side=s.sideEarned?Tz('已完成 · 军备回收+5个百分点','Achieved · equipment recovery +5 points'):Tz('尚未完成','Opportunity remains');
  if(s.objective.kind==='evac')side+=' · '+s.evac.filter(tacticalEvacuated).length+'/'+s.evacNeed;
  if(s.objective.kind==='baggage'&&s.wagon?.dead&&!s.sideEarned)side=Tz('辎重已损失','Baggage lost');
  if(s.objective.kind==='harvest'&&!s.sideEarned)side+=' · '+Math.ceil(Math.max(0,90-B.frontier.elapsed))+'s';
  $('tbSideState').textContent=side;
  let intent=s.reservePending?Tz(`现有预备队约${Math.ceil(Math.max(0,s.reserveAt-B.t))}秒后投入。`,`Existing reserve commits in ${Math.ceil(Math.max(0,s.reserveAt-B.t))}s.`):s.reserveCancelled?Tz('预备队信路已被截断。','Reserve signal route cut.'):s.reserveReleased?Tz('现有预备队已投入。','The existing reserve has committed.') : '';
  if(B.skirm.mode==='def'){const next=B.waves[B.wave+1];if(next){const dirs=[...new Set(next.g.map(g=>g[2]))].map(k=>({N:Tz('北','north'),E:Tz('东','east'),W:Tz('西','west'),S:Tz('南','south')}[k]||k));intent=Tz(`敌下一路来自${dirs.join(' / ')}，约${Math.ceil(Math.max(0,next.at-B.waveT))}秒。`,`Next column: ${dirs.join(' / ')} · ${Math.ceil(Math.max(0,next.at-B.waveT))}s.`);}}
  $('tbIntent').textContent=intent;const log=$('tbLog');log.replaceChildren();for(const e of s.log.slice(0,3)){const row=document.createElement('p');row.textContent=e.t+'s · '+Tz(e.zh,e.en);log.appendChild(row);}
}
{const old=renderBattle;renderBattle=function(){const r=old();const now=performance.now();if(now-TACTICAL_UI_TIME>150){TACTICAL_UI_TIME=now;tacticalHUD();}return r;};}
{const old=show;show=function(...args){const r=old(...args);if(MODE!=='battle'){tacticalHUDRemove();TACTICAL_UI_BATTLE=null;}return r;};}
{const old=battleCard;battleCard=function(){const d=old(),q=qItem();if(!q||q.story)return d;const p=settlementProfile(q.terr),chance=q.type==='def'?(['farm','market'].includes(p.type)?TACTICAL_OBJECTIVES.market:{name:['出击压住侧翼','Counterattack the flank'],desc:['夺下标记据点并留兵守住8秒。','Take the marked post and hold it for eight seconds.']}):TACTICAL_OBJECTIVES[p.type],box=document.createElement('div');box.className='tactical-brief';box.innerHTML=`<b>${Tz('这一战值得亲自指挥的地方','Your tactical opportunity')}</b><p>${Tz(...chance.name)} · ${Tz(...chance.desc)}</p><p class="tip">${Tz('操纵阵形、地形和敌将可促成溃退。达成战机、击倒敌将、保全八成主力，各提高5个百分点军备回收率，最多额外15点。','Use formations, terrain and the enemy officer to force a retreat. Achieving the opportunity, breaking enemy command and preserving 80% of troops each add 5 recovery points, up to 15 extra.')}</p>`;
  const choices=document.createElement('div');choices.className='tactical-plan-row';for(const [key,plan]of Object.entries(TACTICAL_PLANS)){const b=tacticalButton(choices,Tz(...plan.name),()=>{q.tacticalPlan=key;for(const c of choices.children)c.classList.toggle('on',c===b);saveGame();});b.classList.toggle('on',(q.tacticalPlan||'line')===key);b.title=Tz(...plan.desc);}box.appendChild(choices);d.insertBefore(box,d.lastElementChild);return d;
};}
{const old=drawOrders;drawOrders=function(){old();if(!B?.tactics?.regular)return;const s=B.tactics,g=ctx;g.save();
  for(const c of s.cover){g.strokeStyle='rgba(150,190,160,.5)';g.fillStyle='rgba(95,133,105,.12)';g.lineWidth=2;g.beginPath();g.ellipse(c.x,c.y,c.r,c.r*.65,0,0,TAU);g.fill();g.stroke();g.strokeStyle='#9ba98a';for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(c.x+i*23-8,c.y-20);g.lineTo(c.x+i*23+8,c.y-20);g.stroke();}txt(Tz('正面掩护','FRONTAL COVER'),c.x,c.y+c.r*.65+15,11,'#c9dcba','center');}
  const captain=s.captain;if(captain&&!captain.dead){g.strokeStyle='#e4b884';g.lineWidth=2;g.beginPath();g.arc(captain.x,captain.y,20,-Math.PI,0);g.stroke();txt(Tz('军旗官','OFFICER'),captain.x,captain.y-35,12,'#ffd1a0','center','bold ');}
  if(s.wagon&&!s.wagon.dead){txt(Tz('截住辎重','INTERCEPT BAGGAGE'),s.wagon.x,s.wagon.y-40,13,'#e6d18a','center');g.strokeStyle='#d6b15c';g.setLineDash([7,7]);g.beginPath();g.moveTo(s.wagon.x,s.wagon.y);g.lineTo(s.wagonExit.x,s.wagonExit.y);g.stroke();g.setLineDash([]);}
  if(s.evac)for(const u of s.evac)if(!u.dead&&!tacticalEvacuated(u))txt(u.tacticalRescued?Tz('护送中','ESCORTING'):Tz('接应','REACH ME'),u.x,u.y-30,11,'#c3e3da','center');g.restore();
};}
function tacticalDebrief(report){const d=document.createElement('div');d.className='tactical-debrief';const title=document.createElement('h3');title.textContent=Tz('军令怎样改变了战果','How your command changed the result');d.appendChild(title);
  const p=document.createElement('p');p.textContent=Tz(...TACTICAL_PLANS[report.plan].name)+' · '+report.seconds+'s · '+Tz('主力保全 ','Troops retained ')+Math.round(report.retained*100)+'%';d.appendChild(p);
  for(const name of report.achievements){const row=document.createElement('p');row.textContent='✓ '+Tz(...name);d.appendChild(row);}
  const metrics=document.createElement('p');metrics.textContent=Tz('侧后攻击伤害 ','Flank damage ')+report.flankDamage+' · '+Tz('掩护减少伤害约 ','Approx. damage saved by cover ')+report.coverSaved+' · '+Tz('溃退敌人 ','Enemies routed ')+report.routed;d.appendChild(metrics);
  if(report.recoveryBonus){const reward=document.createElement('strong');reward.textContent=Tz('从敌军现有军备额外回收 +','Additional recovery from the enemy’s existing equipment: +')+report.recoveryBonus+Tz('个百分点',' percentage points');d.appendChild(reward);}return d;
}
{const old=showBattleResult;showBattleResult=function(r,x){old(r,x);if(r.tacticalReport)$('scrEnd')?.firstElementChild?.appendChild(tacticalDebrief(r.tacticalReport));};}
