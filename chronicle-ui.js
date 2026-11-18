'use strict';
function chronBtn(zh,en,fn,enabled=true){const b=btn(zh,en,fn);if(!enabled){b.classList.add('dis');b.style.pointerEvents='none';b.setAttribute('aria-disabled','true');b.disabled=true;}return b;}
function chronFocus(id){$('cMissions')?.remove();CSEL={t:id};showCamp();focusOn(id,1.25);}
function chronUtility(key){$('cMissions')?.remove();if(key==='muster')rosterUI();else if(key==='care')medicalQuickAction();else dynastyUI(owned('longcheng')?'longcheng':HOME,key);}
function chronCost(cost){return Object.entries(cost).map(([k,n])=>`${Tz(...(RES_N[k]||[k,k]))} ${n}`).join(' · ');}
function chronCard(c){
  const s=chronicle(),active=s.active?.id===c.id,done=s.done[c.id],current=chronNext()?.id===c.id,card=document.createElement('article');card.className='chron-card'+(current?' current':'')+(done?' completed':'');card.id='chron-'+c.id;
  const heading=document.createElement('h3');heading.textContent=(done?'✓ ':'')+Tz(...c.title);card.appendChild(heading);
  const source=document.createElement('div');source.className='chron-source';source.textContent=(c.act===5?Tz('游戏历史分支 · ','Game history branch · '):Tz('阅读依据 · ','Reading reference · '))+c.source;card.appendChild(source);
  if(!current&&!done){card.classList.add('locked');return card;}
  if(done){const p=document.createElement('p');p.textContent=Tz(...c.reward);card.appendChild(p);if(done.choice){const ch=c.choices?.find(x=>x[0]===done.choice);if(ch){const v=document.createElement('small');v.textContent=Tz(ch[1],ch[2]);card.appendChild(v);}}return card;}
  const brief=document.createElement('p');brief.className='chron-brief';brief.textContent=Tz(...c.brief);card.appendChild(brief);
  if(c.id==='relief'&&CG.jin?.outcome)brief.textContent=Tz('围城已有结果，本章转为保全部队、军械、粮食与医疗。无需再向已陷落或已解围的城市补交失效的勤王订单。','The siege is already decided. This chapter now preserves troops, equipment, food and care; it does not demand obsolete relief orders to a fallen or already relieved city.');
  if(CHRONICLE_COUNCILS[c.id]){const scene=document.createElement('div');scene.className='chron-council';for(const [role,zh,en]of CHRONICLE_COUNCILS[c.id]){const speaker=SQUAD.find(s=>s.id===role),line=document.createElement('p'),name=document.createElement('b');name.textContent=Tz(speaker.zh,speaker.en)+' · ';line.append(name,document.createTextNode(Tz(zh,en)));scene.appendChild(line);}card.appendChild(scene);}
  const goals=document.createElement('ul');goals.className='chron-goals';for(const g of c.goals){const state=chronGoal(c,g),li=document.createElement('li');li.classList.toggle('met',state.ok);li.textContent=`${state.ok?'✓':'○'} ${state.label} · ${Math.min(state.value,state.target)}/${state.target}`;goals.appendChild(li);}card.appendChild(goals);
  const reward=document.createElement('p');reward.className='chron-reward';reward.textContent=Tz('完成后：','On completion: ')+Tz(...c.reward);card.appendChild(reward);
  if(Object.keys(c.cost).length){const cost=document.createElement('p');cost.className='chron-source';cost.textContent=Tz('完成时从清河实付：','Paid locally at Qinghe on completion: ')+chronCost(c.cost);card.appendChild(cost);}
  let choice=null;if(c.choices){choice=document.createElement('select');choice.className='chron-choice';choice.setAttribute('aria-label',Tz('本章选择','Chapter choice'));for(const [id,zh,en]of c.choices)choice.add(new Option(Tz(zh,en),id));if(active)choice.value=s.active.choice;choice.disabled=active;card.appendChild(choice);}
  const actions=document.createElement('div');actions.className='chron-actions';
  if(!active)actions.appendChild(chronBtn('开始本章筹划','Begin this chapter',()=>{chronStart(c.id,choice?.value);missionsUI();},chronPlanning()&&missionChapterDone(2)));
  else{
    const ready=c.goals.every(g=>chronGoal(c,g).ok)&&chronCanPay(HOME,c.cost);
    const complete=chronBtn('验收本章 / 接受任命','Complete chapter / accept appointment',()=>{if(chronComplete(c.id)){campUI();missionsUI();}},chronPlanning()&&ready);complete.dataset.chronComplete=c.id;actions.appendChild(complete);
    if(!ready){const tip=document.createElement('span');tip.className='chron-source';tip.textContent=Tz('达成目标后手动验收；结算月份不会自动扣费或跳章。','Complete the objectives, then claim the chapter manually. Ending a month does not pay costs or skip chapters.');actions.appendChild(tip);}
  }card.appendChild(actions);
  if(active&&c.scenario&&!chronGoal(c,c.goals.find(g=>g.kind==='battle')).ok){
    const row=document.createElement('div');row.className='chron-operation';const title=document.createElement('b');title.textContent=Tz('本章战场 · ','Chapter battlefield · ')+tName(c.site);row.appendChild(title);
    const list=document.createElement('select');list.setAttribute('aria-label','Battle banner');for(const a of CG.armies)if(chronArmy(c,a.id))list.add(new Option(armyName(a)+' · '+armyN(a),a.id));row.appendChild(list);
    row.appendChild(chronBtn('亲自指挥','Command this battle',()=>{chronBattle(c.id,+list.value);},chronPlanning()&&list.options.length>0));
    row.appendChild(chronBtn('查看集结位置','Show staging point',()=>chronFocus(c.site)));
    const tip=document.createElement('p');tip.className='chron-source';tip.textContent=Tz('带队员的军旗须在集结地或相邻道路节点，且没有未执行的行军令。失败后的敌方损失会保留；重新出战不会复制敌军。','A banner with a companion must be at the staging site or one road link away, with no pending march. Enemy losses persist after defeat; retrying does not duplicate its force.');row.appendChild(tip);card.appendChild(row);
  }
  if(active&&c.cargo){
    const spec=chronCargoSpec(c),job=s.cargo[spec.key],ship=shipsOn().find(x=>x.id===job?.ship),delivered=job?.state==='delivered'&&careFriendly(job.to),row=document.createElement('div');row.className='chron-operation';const h=document.createElement('b');h.textContent=Tz('专运 → ','Dispatch → ')+tName(delivered?job.to:spec.to);row.appendChild(h);
    if(spec.refuge){const note=document.createElement('p');note.className='chron-source';note.textContent=Tz('汴京已失守，机构迁往友方避难治所 · 架空分支。','Kaifeng has fallen; the institution relocates to a friendly refuge · alternate branch.');row.appendChild(note);}
    const text=document.createElement('p');text.className='chron-source';text.textContent=delivered?Tz('货物已实际入库。','Cargo has actually arrived.'):ship&&!ship.state?shipLine(ship):Tz('在拥有货物的城镇发车：','Dispatch from a town holding the goods: ')+chronCost({...spec.goods,silver:spec.silver});row.appendChild(text);
    if(spec.refuge&&ship&&!ship.state&&ship.to!==spec.to)row.appendChild(chronBtn('让原车队改道','Reroute the existing convoy',()=>{const ok=chronRerouteCargo(c.id);missionsUI(ok?'':Tz('请先恢复车队当前位置到避难治所的友方道路。','Reopen a friendly road from the convoy’s actual position to the refuge.'));},chronPlanning()));
    if(!delivered&&(!ship||ship.state)){
      const from=document.createElement('select');from.setAttribute('aria-label','Cargo source');const ids=spec.from?[spec.from]:Object.keys(CG.T).filter(owned);
      for(const id of ids)if(owned(id))from.add(new Option(tName(id),id));
      const cost={...spec.goods,silver:spec.silver};const best=ids.find(id=>owned(id)&&supplyPath(id,spec.to)&&chronCanPay(id,cost));if(best)from.value=best;
      row.appendChild(from);row.appendChild(chronBtn('装车并出发','Load and dispatch',()=>{const ok=chronSendCargo(c.id,from.value);missionsUI(ok?'':Tz('出发地须有全部货物及运费，并有连续的友方道路。','The source must hold every item and the fee, with a continuous friendly route.'));},chronPlanning()&&from.options.length>0));
    }row.appendChild(chronBtn('查看目的地','Show destination',()=>chronFocus(spec.to)));card.appendChild(row);
  }
  const tools=document.createElement('div');tools.className='chron-tools';for(const [key,zh,en]of [['production','产业与军器','Production & equipment'],['business','商号与城镇','Businesses & town'],['muster','兵营与军旗','Muster & banners'],['care','就近送医','Evacuate wounded']])tools.appendChild(chronBtn(zh,en,()=>chronUtility(key)));
  if(c.act===5)tools.appendChild(chronBtn('勤王运输 / 实时战局','Relief convoys / live siege',()=>{const base=$('chronDispatches');base.open=true;($('cHistory')||$('cJinWar')||base).scrollIntoView({block:'start',behavior:'smooth'});}));card.appendChild(tools);return card;
}
{const old=missionsUI;missionsUI=function(message=''){
  old(message);const d=$('cMissions');if(!d||!CG)return;const s=chronicle(),next=$('missionNext'),close=d.lastElementChild,oldTitle=d.querySelector('h2'),intro=oldTitle?.nextElementSibling;
  const legacy=$('cFieldCommand');if(legacy){legacy.querySelector('h2').textContent=Tz('开篇援助与旧版军令','Opening support & legacy commissions');legacy.querySelector('p').textContent=Tz('保留原有开篇部队与旧版勤王援助。上方纪事中的正式任命另按实际目标取得，不重复发放既有援军。','Existing opening formations and legacy imperial support are preserved. Formal appointments in the Chronicle require their actual objectives; already-granted formations are not issued again.');}
  const original=[...d.childNodes].filter(n=>n!==next&&n!==close&&n!==oldTitle&&n!==intro&&!(n.nodeType===1&&n.classList.contains('campaign-eyebrow')));
  d.replaceChildren();d.classList.add('chronicle-board');const head=document.createElement('div');head.className='chron-header';
  const title=document.createElement('h2');title.textContent=Tz('清河起势 · 持械入宋战役','From Qinghe to a realm · Campaign Chronicle');head.appendChild(title);
  const count=[0,1,2].filter(missionChapterDone).length+Object.keys(s.done).length,total=CHRONICLE_CHAPTERS.length+3;
  const meta=document.createElement('p');meta.textContent=Tz('章节 ','Chapters ')+count+'/'+total+' · '+Tz('沿原作推进，保留你的经营与军队','Story progression with your actual economy and armies');head.appendChild(meta);
  const bar=document.createElement('div');bar.className='chron-progress';const fill=document.createElement('i');fill.style.width=100*count/total+'%';bar.appendChild(fill);head.appendChild(bar);d.appendChild(head);
  if(message){const m=document.createElement('p');m.className='chron-message';m.textContent=message;d.appendChild(m);}
  if(missionChapterDone(2)){next.classList.remove('dis');next.style.pointerEvents='';next.removeAttribute('aria-disabled');next.disabled=false;next.innerHTML=chronNext()?Tz('开始 / 继续下一章','Start / continue next chapter'):Tz('战役纪事完成 · 继续经营天下','Chronicle complete · continue the realm');next.onclick=()=>chronNextAction();}
  d.appendChild(next);
  const opening=document.createElement('div');opening.className='chron-opening';opening.textContent=Tz('卷一 · 清河初立：','I · Qinghe takes root: ')+[Tz('初战','Arrival'),Tz('秦州行旅','Qinzhou journey'),Tz('清河血战','Qinghe defence')].map((name,i)=>(missionChapterDone(i)?'✓ ':'○ ')+name).join('　→　');d.appendChild(opening);
  for(let act=1;act<CHRONICLE_ACTS.length;act++){
    const section=document.createElement('details');section.className='chron-act';section.open=missionChapterDone(2)&&chronNext()?.act===act;
    const heading=document.createElement('summary'),rows=CHRONICLE_CHAPTERS.filter(c=>c.act===act);heading.textContent=Tz(...CHRONICLE_ACTS[act])+' · '+rows.filter(c=>s.done[c.id]).length+'/'+rows.length;section.appendChild(heading);
    for(const c of rows)section.appendChild(chronCard(c));d.appendChild(section);
  }
  const base=document.createElement('details');base.id='chronDispatches';base.className='chron-dispatches';base.open=!missionChapterDone(2);const summary=document.createElement('summary');summary.textContent=Tz('开篇任务、边地行动与实时军报','Opening missions, frontier operations & live dispatches');base.appendChild(summary);for(const child of original)base.appendChild(child);
  for(const p of base.querySelectorAll('p'))if(p.textContent.includes('The current main story has the three chapters above.')||p.textContent.includes('主线目前是以上三章。'))p.textContent=Tz('开篇之后，按上方纪事继续。以下边地行动可随时安排，不会自动完成纪事。','Continue through the Chronicle after the opening. These frontier operations remain available and do not skip story chapters.');
  d.appendChild(base);
  if(s.journal.length){const log=document.createElement('details');log.className='chron-dispatches';const summary=document.createElement('summary');summary.textContent=Tz('战役记事与选择','Journal & lasting choices');log.appendChild(summary);for(const entry of s.journal.slice(0,24)){const p=document.createElement('p');p.textContent=Tz('第','Month ')+entry.month+Tz('月 · ',' · ')+Tz(entry.zh,entry.en);log.appendChild(p);}d.appendChild(log);}
  const note=document.createElement('p');note.className='chron-source';note.textContent=Tz('原作依据至第四卷已读部分。兵力、月份、地理与条件为玩法调整；最后一卷明确为游戏的历史分支。既有存档与开篇援助保留。','Based on the documented reading through Volume IV. Strengths, months, geography and conditions are gameplay adaptations. The final act is the game’s history branch. Existing saves and opening support are retained.');d.appendChild(note);d.appendChild(close);
};}
{const old=drawRaids;drawRaids=function(g){old(g);const c=CG?.chronicle?.active&&chronChapter(CG.chronicle.active.id);if(!c)return;const id=c.site||c.cargo?.to||c.goals.find(o=>['friendly','owned','route'].includes(o.kind))?.key;if(!id||!CT[id])return;
  const p=tPos(id),q=c2s(p.x,p.y),sc=iconScale();if(q.x<0||q.x>VW||q.y<0||q.y>VH)return;g.save();g.strokeStyle='#e3c578';g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y+5*sc,40*sc,24*sc,0,0,TAU);g.stroke();g.fillStyle='#e3c578';g.font=`bold ${14*sc}px serif`;g.textAlign='center';g.fillText('◆',q.x+34*sc,q.y-25*sc);g.restore();
};}
