'use strict';
function operationBaseline(){const s=chronicle();return {month:campaignMonth(),made:{...s.metrics.made},trained:s.metrics.trained,exports:CG.dynasty?.totalSales||0};}
function operationState(){const s=chronicle();return s.operations||(s.operations={v:1,awards:{},institutions:{}});}
function operationCapture(){const a=chronicle().active;if(a&&!a.operation)a.operation={baseline:operationBaseline(),battles:[]};return a?.operation;}
function operationFeat(c,afterFee=false){
 const spec=CAMPAIGN_OPERATIONS[c.id]?.feat,g=spec?.goal,a=chronicle().active,run=a?.id===c.id?a.operation:null;if(!g)return {ok:false,value:0,target:1};
 // Old active saves begin tracking new-work feats on first load, never retroactively.
 if(!run)return {ok:false,value:0,target:g.n};let value=0;
 if(g.kind==='newMade')value=(chronicle().metrics.made[g.key]||0)-(run.baseline.made[g.key]||0);
 else if(g.kind==='newTrained')value=chronicle().metrics.trained-run.baseline.trained;
 else if(g.kind==='newExports')value=(CG.dynasty?.totalSales||0)-run.baseline.exports;
 else if(g.kind==='safeBattle')return {ok:run.battles.some(b=>b.win&&!b.auto&&b.initial>0&&b.casualties/b.initial<=g.n),value:+run.battles.some(b=>b.win&&!b.auto&&b.initial>0&&b.casualties/b.initial<=g.n),target:1};
 else if(g.kind==='rescueAll')value=+run.battles.some(b=>b.win&&b.rescued===3);
 else if(g.kind==='supplyChain')value=+['brewery','kiln'].every(k=>chronGoal(c,cg('business',k)).ok);
 else if(g.kind==='combinedArms')value=+(chronMen(u=>u.type==='xbow')>=100&&chronMen(u=>['mil','spear','dao'].includes(u.type))>=100);
 else if(g.kind==='accounts')value=+Object.keys(CG.T).some(id=>owned(id)&&CG.T[id].accountsActive);
 else if(g.kind==='livingRealm')value=+(chronGoal(c,cg('building','hosp',1,HOME)).ok&&chronGoal(c,cg('business','restaurant')).ok&&chronGoal(c,cg('care')).ok);
 else {const state=chronGoal(c,g);value=g.kind==='stock'&&['silver','powder','rep'].includes(g.key)?supplyLocal(HOME,g.key):state.value;if(afterFee&&g.kind==='stock')value-=c.cost[g.key]||0;}
 return {value:Math.max(0,value),target:g.n,ok:value>=g.n};
}
function operationStages(c){return CAMPAIGN_OPERATIONS[c.id].stages.map(stage=>({...stage,ok:stage.goals.every(i=>chronGoal(c,c.goals[i]).ok)}));}
const OPERATION_CHOICES={
 recovery:{memorial:['乡绅+8；保留原作人物纪念。','Gentry +8; retain the source character’s memorial.'],rescue:['医疗条件满足后，兰将军加入；架空救回分支。','With the required care ready, Commander Lan joins; alternate rescue branch.']},
 truce:{truce:['附近友城乡望+10，朝官+6。','Nearby allied influence +10; court +6.'],prepare:['本方军旗士气+10；不另增士兵。','Your banners gain 10 morale; no additional soldiers.']},
 hangzhou:{audit:['乡绅+6，清河出口特许12个月（+20%，需维持支持与买方预算）。','Gentry +6; Qinghe export charter for 12 months (+20%, subject to support and buyer budgets).'],seizure:['朝官+8，另获10点基础功绩；不凭空生成查抄财物。','Court +8 and 10 additional base merit; no invented confiscated goods.']},
 xia:{settlement:['现有和议保护持续4季；保留原有统兵奖励。','Existing border protection lasts four seasons; retain the stated command reward.'],occupation:['在原奖励外多容2都；乡绅-5。','Two extra company slots beyond the stated reward; gentry −5.']},
 hospital:{autonomy:['乡绅+8，保留独立账目记录。','Gentry +8; record independent accounts.'],delegation:['勤王医疗筹备额外+10，医馆仍在实际目的地建立。','Medical relief readiness gains another 10; the hospital is built at its actual destination.']}
};
function operationApplyChoice(c,choice){
 const f=CG.fac,p=politicsState(),now=campaignMonth();
 if(c.id==='recovery'&&choice==='memorial')f.gentry=Math.min(100,f.gentry+8);
 if(c.id==='truce'&&choice==='truce')f.court=Math.min(100,f.court+6);
 if(c.id==='hangzhou'){if(choice==='audit'){f.gentry=Math.min(100,f.gentry+6);p.markets[HOME]=Math.max(p.markets[HOME]||0,now+12);}else{f.court=Math.min(100,f.court+8);favAdd(10,'court');}}
 if(c.id==='xia'&&choice==='occupation'){fieldState().bonus+=2;f.gentry=Math.max(0,f.gentry-5);}
 if(c.id==='hospital'){if(choice==='autonomy')f.gentry=Math.min(100,f.gentry+8);else CG.ready=(CG.ready||0)+10;}
}
{const old=chronStart;chronStart=function(id,choice){const result=old(id,choice);if(result){operationCapture();saveGame();}return result;};}
{const old=campLoad;campLoad=function(){const result=old();if(CG?.chronicle?.active){operationCapture();saveGame();}return result;};}
{const old=resolveBattle;resolveBattle=function(q,win,r){
 if(!q.chronicle)return old(q,win,r);const s=chronicle(),exists=!!s.results[q.chronicleToken],run=operationCapture(),initial=qUnits(q).reduce((n,u)=>n+u.men,0);
 const rescued=B?.chronicle?.id===q.chronicle?(B.chronicle.party||[]).filter(u=>!u.dead&&u.rescued&&Math.hypot(u.x-B.frontier.extraction.x,u.y-B.frontier.extraction.y)<140).length:0;
 const result=old(q,win,r);if(result&&!exists&&run){run.battles.push({token:q.chronicleToken,win:!!result.win,initial,casualties:result.lostN+result.wnd,auto:!!result.auto,rescued});saveGame();}return result;
};}
{const old=chronComplete;chronComplete=function(id){
 const c=chronChapter(id),s=chronicle(),choice=s.active?.choice,feat=c&&s.active?.id===id?operationFeat(c,true):{ok:false};
 const result=old(id);if(!result)return result;const state=operationState();
 if(!state.awards[id]){state.awards[id]={month:campaignMonth(),feat:feat.ok,merit:feat.ok?13:5};favAdd(feat.ok?13:5,'court');
  if(feat.ok&&owned(HOME))CG.T[HOME].prosp=Math.min(100,CG.T[HOME].prosp+2);
  operationApplyChoice(c,choice);
  if(id==='blackstone')CG.fac.gentry=Math.min(100,CG.fac.gentry+3);
  if(id==='capital'){state.institutions.capital=true;const p=politicsState();p.markets[HOME]=Math.max(p.markets[HOME]||0,campaignMonth()+6);}
  if(id==='royal'){state.institutions.royal=true;CG.fac.court=Math.min(100,CG.fac.court+6);}
  if(id==='signals'){state.institutions.signals=true;CG.ready=(CG.ready||0)+5;}
  chronNote(Tz('军务验收：','Operation accepted: ')+(feat.ok?Tz('功绩基础+13，清河兴旺+2。','13 base merit; Qinghe prosperity +2.'):Tz('功绩基础+5。','5 base merit.')),
   feat.ok?'Operation accepted: 13 base merit; Qinghe prosperity +2.':'Operation accepted: 5 base merit.');
 }saveGame();return result;
};}
// Replace promises that previously had no corresponding persistent benefit.
chronChapter('blackstone').reward=['山寨目标达成；乡绅+3。','Stronghold secured; gentry +3.'];
chronChapter('capital').reward=['京中商号落地；清河出口特许6个月（+20%，需支持及买方预算）。','Capital concern established; Qinghe export charter for 6 months (+20%, subject to support and buyer budgets).'];
chronChapter('royal').reward=['救援幸存者记录入册；朝官+6。','Rescue survivors are registered; court +6.'];
chronChapter('signals').reward=['德顺联络站启用；勤王组织筹备+5。','Deshun dispatch station opens; organisational readiness +5.'];
