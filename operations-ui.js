'use strict';
function operationAdvice(c,g){
 const text={
  men:['在军籍册合并、补员或招募；只计算实际现役士卒。','Merge, refill or recruit in Muster; only actual fit soldiers count.'],
  veterans:['通过实际战斗积累经验；合并与换装保留老兵经验。','Earn experience in actual battles; merging and refitting retain veteran experience.'],
  building:['在指定城的产业面板升级；建设按季度结算，医馆可安排转运。','Upgrade through Production at the named settlement. Core buildings settle seasonally; hospitals support evacuation.'],
  business:['在商号面板营建或升级；企业一个月开张，须有本地原料和工钱。','Build or upgrade in Businesses. Enterprises open after one month and need local inputs and wages.'],
  months:['筹划后执行军令，再结束月份；与运输、研究和训练并行。','Resolve orders, then end the month. Run this clock alongside transport, research and training.'],
  stock:['只计本方已入库物资；在途货物不计数。原料可以采购、生产或沿道路调拨。','Only arrived stocks under your control count. Produce, buy or transfer goods by road; cargo in transit does not count.'],
  made:['兵器工坊选择目标产品，留足本地原料及工人；实际季度产出才记数。','Set the workshop order and provide local inputs and workers. Only actual seasonal output counts.'],
  trained:['在军籍册招募并等待真实出营；缺本地军械时先安排调拨。','Recruit in Muster and wait for actual training completion. Request equipment deliveries when local kit is missing.'],
  friendly:['查看目标驻军和道路，使用实际军旗进攻或提前平定；友军城镇无需宣战。','Inspect the garrison and approach with an actual banner. Defeat hostile control; allied towns need no attack.'],
  owned:['需要本方实际治理；使用章节任命、县政托管或合法占领。','Requires actual administration: use a chapter appointment, county charter or occupation.'],
  route:['沿地图逐段检查道路控制权；恢复中间城镇，商队会自行续行或改道。','Inspect road ownership along the map. Restore intermediate towns so convoys can resume or reroute.'],
  exports:['打开商号自动售货并供应可售商品；买方须有预算，货到才增加回款。','Enable automatic exports and supply saleable goods. The buyer needs a budget; receipts count on delivery.'],
  cargo:['下方专运面板会选择实际持货城；货品及运费须全部在该城备齐。','Use the dispatch panel below. Its source must hold every cargo item and the full transport fee.'],
  care:['使用就近送医；路断时先恢复道路或在附近建立医馆。','Use nearest-hospital evacuation. Restore a blocked road or establish nearby care.'],
  battle:['在下方选择实际集结军旗亲自指挥；失败后双方损失保留。','Choose a staged banner in the battlefield panel below. Both sides retain losses after a failed attempt.'],
  aid:['打开实时勤王运输；部队与物资抵达后才计入，提前送达有效。','Open live relief transport. Actual arrivals count, including aid sent before this chapter.'],
  readiness:['筹备来自有效的支援和任命；查看实时围城及运输，不要只堆本地库存。','Build readiness through actual support and appointments. Check the live siege and transport rather than only local stores.'],
  research:['在有军器分作的城启动六个月试炮，随后准备炮件生产原料。','Begin six-month prototype trials at an ordnance foundry; prepare cannon inputs while research runs.'],
  outcome:['历史危机按日历推进；可提前勤王或在地图拦截真实入侵军。','The historical crisis follows the calendar. Send relief early or intercept actual invasion columns on the map.']
 };return Tz(...(text[g.kind]||text.stock));
}
function operationAction(c,g,card){
 if(['cargo','battle'].includes(g.kind)){card.querySelector('.chron-operation')?.scrollIntoView({block:'center',behavior:'smooth'});return;}
 if(['aid','readiness','outcome'].includes(g.kind)){const base=$('chronDispatches');base.open=true;($('cHistory')||$('cJinWar')||base).scrollIntoView({block:'start',behavior:'smooth'});return;}
 if(['friendly','owned','route'].includes(g.kind)){const id=g.kind==='route'&&c.act===5&&CG.jin?.outcome==='fallen'?chronRefuge():g.key;chronFocus(id);return;}
 $('cMissions')?.remove();
 if(g.kind==='care'){medicalQuickAction();return;}
 if(['men','veterans','trained'].includes(g.kind)){rosterUI();return;}
 const id=g.id&&owned(g.id)?g.id:owned('longcheng')&&['business','research'].includes(g.kind)?'longcheng':HOME;
 if(g.kind==='building')PRODUCTION_VIEW.group=[...DEV_GROUP.eco,...DEV_GROUP.mil].includes(g.key)?'civic':'prod';if(g.kind==='made')PRODUCTION_VIEW.group='wk';
 dynastyUI(id,['business','exports','research'].includes(g.kind)?'business':g.kind==='stock'?'markets':'production');
}
function operationCard(card,c){
 const spec=CAMPAIGN_OPERATIONS[c.id],s=chronicle(),done=s.done[c.id],active=s.active?.id===c.id;if(!spec)return;
 if(done){const award=s.operations?.awards[c.id];if(award){const p=document.createElement('p');p.className='op-award';p.textContent=award.feat?Tz('★ 卓越军务 · 完成选做目标，功绩基础+13、清河兴旺+2。','★ Distinguished service · optional feat earned: 13 base merit, Qinghe prosperity +2.'):Tz('军务已验收 · 功绩基础+5。','Operation accepted · 5 base merit.');card.appendChild(p);}return;}
 if(chronNext()?.id!==c.id)return;
 const orders=document.createElement('details');orders.className='op-orders';orders.open=!active;const title=document.createElement('summary');title.textContent=Tz('军令与执行方案','Mission orders & execution plan');orders.appendChild(title);const text=document.createElement('p');text.textContent=Tz(...spec.order);orders.appendChild(text);card.querySelector('.chron-brief').after(orders);
 const stages=document.createElement('div');stages.className='op-stages';const rows=operationStages(c),current=rows.findIndex(r=>!r.ok);
 const progress=document.createElement('p');progress.className='op-progress';progress.textContent=Tz('军务阶段 ','Operation stages ')+rows.filter(r=>r.ok).length+'/'+rows.length+Tz(' · 可并行准备，不强制空等',' · prepare concurrently; no extra waiting gates');stages.appendChild(progress);
 rows.forEach((stage,i)=>{const section=document.createElement('details');section.className='op-stage';section.open=i===current||(current<0&&i===rows.length-1);const h=document.createElement('summary');h.textContent=(stage.ok?'✓ ':`${i+1}. `)+Tz(...stage.name);section.appendChild(h);const list=document.createElement('ul');list.className='chron-goals';
  for(const index of stage.goals){const g=c.goals[index],state=chronGoal(c,g),li=document.createElement('li');li.classList.toggle('met',state.ok);li.textContent=`${state.ok?'✓':'○'} ${state.label} · ${Math.min(state.value,state.target)}/${state.target}`;
   const hint=document.createElement('small');hint.textContent=operationAdvice(c,g);li.appendChild(hint);
   if(!state.ok&&g.kind!=='months'){const b=chronBtn(Tz('前往处理','Take action'),Tz('前往处理','Take action'),()=>operationAction(c,g,card));b.dataset.operationGoal=index;li.appendChild(b);}list.appendChild(li);
  }section.appendChild(list);stages.appendChild(section);
 });card.querySelector('.chron-goals').replaceWith(stages);
 const feat=document.createElement('div');feat.className='op-feat';const state=operationFeat(c,true);feat.textContent=(state.ok?'★ ':'☆ ')+Tz('选做：','Optional: ')+Tz(...spec.feat.name);const hint=document.createElement('small');hint.textContent=Tz('不阻止主线。验收时达成：额外基础功绩+8、清河兴旺+2；物资储备按支付章节费用后核算。','Never blocks the story. Meet it at acceptance for 8 extra base merit and Qinghe prosperity +2. Reserve feats account for chapter fees.');feat.appendChild(hint);if(active){const p=document.createElement('small');p.textContent=`${Tz('实际进度','Actual progress')}: ${Math.min(state.value,state.target)}/${state.target}`;feat.appendChild(p);}stages.after(feat);
 const service=document.createElement('p');service.className='chron-reward';service.textContent=Tz('本章另获基础功绩+5；按朝官支持倍率结算，可用于朝廷实权申请。','This chapter also earns 5 base merit, scaled by court support and spendable on political commissions.');feat.after(service);
 const choice=card.querySelector('.chron-choice');if(choice&&OPERATION_CHOICES[c.id]){const consequence=document.createElement('p');consequence.className='op-consequence';const update=()=>{const value=OPERATION_CHOICES[c.id][choice.value];consequence.textContent=value?Tz('选择后果：','Choice consequence: ')+Tz(...value):'';};choice.addEventListener('change',update);update();choice.after(consequence);}
}
{const old=chronCard;chronCard=function(c){const card=old(c);operationCard(card,c);return card;};}
function operationPreview(){
 const next=chronNext(),index=CHRONICLE_CHAPTERS.indexOf(next),future=index>=0?CHRONICLE_CHAPTERS.slice(index+1,index+3):[];if(!future.length)return null;
 const panel=document.createElement('details');panel.className='op-orders op-preview';const title=document.createElement('summary');title.textContent=Tz('提前筹备 · 后续两章需求','Plan ahead · needs for the next two chapters');panel.appendChild(title);
 for(const c of future){const section=document.createElement('section');section.dataset.preview=c.id;const heading=document.createElement('h4');heading.textContent=Tz(...c.title);section.appendChild(heading);const goals=document.createElement('p');goals.textContent=c.goals.map(g=>{const state=chronGoal(c,g);return state.label+' '+state.target;}).join(' · ');section.appendChild(goals);
  if(Object.keys(c.cost).length){const fee=document.createElement('p');fee.textContent=Tz('清河验收费用：','Qinghe acceptance fee: ')+chronCost(c.cost);section.appendChild(fee);}
  if(c.cargo){const job=chronCargoSpec(c),row=document.createElement('p'),origins=job.from?[job.from]:Object.keys(CG.T).filter(owned),paths=origins.filter(owned).map(id=>({id,path:supplyPath(id,job.to)})).filter(x=>x.path).sort((a,b)=>a.path.length-b.path.length),best=paths[0];row.textContent=Tz('未来专运：','Future dispatch: ')+chronCost({...job.goods,silver:job.silver||0})+' → '+tName(job.to)+(job.from?' · '+Tz('指定出发地：','Required origin: ')+tName(job.from):'')+' · '+(best?tName(best.id)+' '+Tz('出发至少','departure, at least ')+Math.max(1,best.path.length-1)+' '+Tz('个月','months'):Tz('需先恢复友方道路','Restore a friendly route first'));section.appendChild(row);}
  panel.appendChild(section);
 }const tools=document.createElement('div');tools.className='chron-tools';tools.appendChild(chronBtn('先安排普通转运','Stage goods with ordinary transfers',()=>{$('cMissions').remove();supplyUI();}));panel.appendChild(tools);const note=document.createElement('p');note.textContent=Tz('可预先营建、备货和普通转运；专运及章节奖励仍须到本章开启后办理，不会提前发奖。','Build, stock and make ordinary transfers ahead of time. Story dispatch and rewards still require their active chapter; this preview grants nothing.');panel.appendChild(note);return panel;
}
{const old=missionsUI;missionsUI=function(message=''){old(message);const header=$('cMissions')?.querySelector('.chron-header');if(!header)return;const d=document.createElement('div');d.className='op-calendar';const s=chronicle(),left=Math.max(0,jingkangMonth()-campaignMonth());
 d.textContent=CG.jin?.outcome?Tz('围城已有结果 · 继续保全与重建；章节不会强制结束战役。','Siege decided · preserve and rebuild; chapters do not force the campaign to end.'):(left+' '+Tz('个月至靖康危机。章节、运输与工坊可并行，勤王可提前安排。','months before the Jingkang crisis. Chapters, convoys and workshops can run concurrently; send relief before its story chapter.'));header.appendChild(d);
 if(!s.active&&chronNext()?.choices)$('missionNext').textContent=Tz('查看并选择本章方略','Review and choose this chapter’s approach');
 const preview=operationPreview();if(preview)header.after(preview);
 if(s.active){const c=chronChapter(s.active.id),next=operationStages(c).find(row=>!row.ok);if(next){const focus=document.createElement('p');focus.className='op-next';focus.textContent=Tz('当前军务：','Current operation: ')+Tz(...c.title)+' → '+Tz(...next.name);header.appendChild(focus);}}
};}
{const old=chronNextAction;chronNextAction=function(){const c=chronNext();if(c?.choices&&!chronicle().active){missionsUI(Tz('先查看选择后果，再点击本章开始按钮；尚未锁定任何选择。','Review the consequences, choose an approach, then begin this chapter. No choice has been locked in.'));$('chron-'+c.id)?.scrollIntoView({block:'start'});return true;}return old();};}
