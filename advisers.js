'use strict';
let ADVISER_MANUAL_MARKETS=false;
function adviserState(){return CG.advisers||(CG.advisers={v:1,works:{active:false,remaining:0,spent:0,until:0,last:0,goal:'balanced',floor:150},trade:{mode:'surplus',cap:80,floor:150,month:0,spent:0,last:0},deferred:{},log:[]});}
function adviserLog(kind,text){const a=adviserState();a.log.unshift({month:campaignMonth(),kind,text});a.log.length=Math.min(24,a.log.length);cgLog('🏛',text);}
function adviserPriority(p){const g=adviserState().works.goal;return p.score+(p.score>=90?100:0)+(g==='food'&&p.k==='farm'?30:0)+(g==='income'&&['market','restaurant','brewery'].includes(p.k)?20:0);}
function adviserProjects(){governorProposalTick(true);return governorAdvice().items.filter(p=>p.status==='pending').sort((a,b)=>adviserPriority(b)-adviserPriority(a)||a.id-b.id);}
function adviserApproveWorks(goal,budget){
 if(!dynastyPlanning()||!['balanced','food','income'].includes(goal)||![150,300,600].includes(budget))return false;
 const w=adviserState().works;if(w.active&&w.until>campaignMonth()&&w.remaining>0)return false;
 Object.assign(w,{active:true,goal,remaining:budget,budget,spent:0,until:campaignMonth()+6});adviserWorksTick();saveGame();return true;
}
function adviserWorksTick(){
 const w=adviserState().works,now=campaignMonth();if(!dynastyPlanning()||!w.active||w.last>=now)return false;w.last=now;
 if(now>=w.until||w.remaining<=0){w.active=false;return false;}
 for(const p of adviserProjects()){
  const cost=governorProposalCost(p),price=cost?.silver||0;if(price>w.remaining||CAMP.res.silver-price<w.floor){if(p.score>=90)return false;continue;}
  if(governorProposalReason(p)){supplyRequest(p.city,Object.fromEntries(Object.entries(cost).map(([k,n])=>[k==='iron'?'ore':k,n])));if(p.score>=90)return false;continue;}
  const prior=CG._govAct;CG._govAct=1;let ok;try{ok=governorDecide(p.id,true);}finally{CG._govAct=prior;}
  if(ok){w.remaining-=price;w.spent+=price;adviserLog('economy',tName(p.city)+' · '+Tz(...(p.kind==='build'?[DEV[p.k].zh,DEV[p.k].en]:DY_BUSINESSES[p.k].name))+` · ${price} `+Tz('银','silver'));return true;}
 }return false;
}
function adviserReserve(city,k){const f=k==='grain'?governorFood(city):null;return Math.max(supplyReserve(city,k),realmReserve(CG.T[city],k),f?Math.max(150,f.eat*2):0);}
function adviserTradePolicy(mode,cap){if(!dynastyPlanning()||!['surplus','supply','stockpile'].includes(mode)||![40,80,160].includes(cap))return false;const t=adviserState().trade;t.mode=mode;t.cap=cap;saveGame();return true;}
{const old=dynastyExport;dynastyExport=function(from,to,k,n=12){if(!owned(from)||!CG.T[to]||adviserState().trade.mode==='stockpile'||supplyLocal(from,k)-n<adviserReserve(from,k))return false;return old(from,to,k,n);};}
{const old=economyAccept;economyAccept=function(from,key){const c=economyContracts(from).find(c=>c.key===key);if(!c||adviserState().trade.mode==='stockpile'||supplyLocal(from,c.k)-c.n<adviserReserve(from,c.k))return false;return old(from,key);};}
function adviserTradeNeeds(){
 const result=[];for(const city of Object.keys(CG.T).filter(owned)){
  const want={...needs(city)},f=governorFood(city);want.grain=Math.max(want.grain||0,Math.max(150,f.eat));
  for(const [k,n]of Object.entries(want)){if(!RAW.includes(k)||!DY_PRICE[k])continue;const missing=Math.ceil(n-supplyLocal(city,k)-supplyIncoming(city,k));if(missing>0)result.push({city,k,n,missing,score:k==='grain'&&f.stock<f.eat?100:60});}
 }return result.sort((a,b)=>b.score-a.score||a.city.localeCompare(b.city)||a.k.localeCompare(b.k));
}
function adviserTradeTick(){
 const t=adviserState().trade,now=campaignMonth();if(!dynastyPlanning()||t.last>=now)return false;t.last=now;if(t.month!==now){t.month=now;t.spent=0;}
 if(t.mode==='stockpile')return false;let acted=false;
 if(t.mode==='supply'){
  let orders=0;for(const need of adviserTradeNeeds()){
   supplyRequest(need.city,{[need.k]:need.n});const missing=Math.ceil(need.n-supplyLocal(need.city,need.k)-supplyIncoming(need.city,need.k));if(missing<=0)continue;
   const sellers=Object.keys(dynastyState().markets).filter(id=>CG.T[id].own==='song'&&supplyPath(id,need.city)&&dynastyNearest(id,4)).sort((a,b)=>dyTradePrice(a,need.city,need.k,10)-dyTradePrice(b,need.city,need.k,10)||a.localeCompare(b));
   for(const from of sellers){
    let n=Math.min(20,missing,Math.floor(Math.max(0,supplyLocal(from,need.k)-supplyReserve(from,need.k))));while(n>0&&(dyTradePrice(from,need.city,need.k,n)>t.cap-t.spent||CAMP.res.silver-dyTradePrice(from,need.city,need.k,n)<t.floor))n--;
    if(!n)continue;const price=dyTradePrice(from,need.city,need.k,n);if(dynastyTrade(from,need.city,need.k,n)){t.spent+=price;acted=true;orders++;adviserLog('trade',tName(need.city)+` · ${n} `+Tz(...RES_N[need.k])+` · ${price} `+Tz('银','silver'));break;}
   }if(orders>=2||t.spent>=t.cap||shipsOn().filter(s=>!s.state&&s.dynasty).length>=24)break;
  }
 }
 const offers=Object.keys(CG.T).filter(id=>owned(id)&&CG.T[id].autoExport!==false).flatMap(from=>economyContracts(from).filter(c=>supplyLocal(from,c.k)-c.n>=adviserReserve(from,c.k)).map(c=>({...c,from}))).sort((a,b)=>b.pay/(supplyPath(b.from,b.to).length-1)-a.pay/(supplyPath(a.from,a.to).length-1)||a.key.localeCompare(b.key));
 let count=0;for(const c of offers){if(shipsOn().filter(s=>s.sale&&!s.state).length>=24)break;if(economyAccept(c.from,c.key)){acted=true;if(++count>=2)break;}}
 return acted;
}
function adviserMilitary(){
 const deferred=adviserState().deferred,now=campaignMonth();
 const wounded=Object.values(CG.U).filter(u=>u.wnd>0&&careNearest(siteOf(u)));if(wounded.length&&(deferred.evac||0)<=now)return {key:'evac',kind:'evac',title:Tz('集中救治伤兵','Evacuate wounded'),result:wounded.reduce((n,u)=>n+u.wnd,0)+' '+Tz('人送往最近医馆','patients to nearest hospitals'),cost:{},reason:Tz('不动健卒，伤兵经友方道路转运。','Healthy troops stay in place; patients follow friendly roads.')};
 for(const u of Object.values(CG.U).sort((a,b)=>b.exp-a.exp||String(a.id).localeCompare(String(b.id)))){if(!['mil','spear','dao','arch'].includes(u.type)||u.men<20)continue;const key='refit:'+u.id;if((deferred[key]||0)>now)continue;const p=refitPlan(u.id,'xbow',Math.max(u.arm||0,UT.xbow.arm));if(p?.ok&&CAMP.res.silver-(p.cost.silver||0)>=150)return {key,kind:'refit',uid:u.id,arm:p.arm,cost:p.cost,title:Tz('老兵换装弩手','Equip veterans with crossbows'),result:`${p.n} `+Tz('人，保留军阶','soldiers; rank retained'),reason:tName(p.at)};}
 for(const city of Object.keys(CG.T).filter(owned)){
  const enemy=(CADJ[city]||[]).filter(id=>CG.T[id].own==='xia').reduce((n,id)=>n+warMen(id),0),ours=unitsAt(city).reduce((n,u)=>n+u.men,0)+CG.armies.filter(a=>a.loc===city).reduce((n,a)=>n+armyUnits(a).reduce((n,u)=>n+u.men,0),0);
  const key='recruit:'+city;if(enemy<=ours||ours>=300||(deferred[key]||0)>now||CG.T[city].trn.length||supplyJobs().some(j=>j.to===city)||trainCheck(city,'mil',0).length||CAMP.res.silver-UT.mil.silver<150)continue;
  return {key,kind:'recruit',city,cost:kitCost('mil',100,0),title:Tz('补足边寨守兵','Reinforce a frontier garrison'),result:tName(city)+' · 100 '+Tz('乡勇','militia'),reason:Tz('相邻夏军兵力高于本地驻军。','Actual adjacent Xia garrisons outnumber the local defenders.')};
 }return null;
}
function adviserPolitics(){
 const now=campaignMonth(),deferred=adviserState().deferred,exports=shipsOn().some(s=>s.sale&&!s.state),food=Object.keys(CG.T).filter(owned).some(id=>governorFood(id).net<0);
 const kinds=[...(food?['works']:[]),'procurement',...(exports?['market']:[]),'compact','charter','command'];
 for(const k of [...new Set(kinds)])for(const home of Object.keys(CG.T).filter(owned)){
  if(k==='procurement'&&supplyPotential(home,'xbow')>=100)continue;
  for(const target of politicsTargets(k,home)){const key='politics:'+k+':'+target;if((deferred[key]||0)>now||politicsReason(k,target,home)||CAMP.res.silver-POL_PROJECTS[k].cost.silver<150)continue;return {key,kind:k,home,target,cost:POL_PROJECTS[k].cost,title:Tz(...POL_PROJECTS[k].name),result:tName(target)+' · '+POL_PROJECTS[k].merit+' '+Tz('功绩','merit'),reason:Tz(...POL_PROJECTS[k].desc)};}
 }return null;
}
function adviserDecide(role,key,approve){
 if(!dynastyPlanning())return false;const proposal=role==='military'?adviserMilitary():role==='politics'?adviserPolitics():null;if(!proposal||proposal.key!==key)return false;
 if(!approve){adviserState().deferred[key]=campaignMonth()+6;saveGame();return true;}
 let ok=false;if(role==='politics')ok=politicsStart(proposal.kind,proposal.target,proposal.home);
 else if(proposal.kind==='evac')ok=consolidateWounded().units>0;else if(proposal.kind==='refit')ok=refitUnit(proposal.uid,'xbow',proposal.arm);else if(proposal.kind==='recruit')ok=train(proposal.city,'mil',0);
 if(ok){adviserLog(role,proposal.title+' · '+proposal.result);saveGame();}return ok;
}
function adviserRunMonth(){if(!CG||CG.over||CG.pend||CG.queue.length||!['camp','cvil'].includes(MODE))return;const phase=CG.phase;CG.phase=0;try{governorProposalTick(true);adviserWorksTick();adviserTradeTick();}finally{CG.phase=phase;}saveGame();}
{const old=endTurn;endTurn=function(){const before=CG&&campaignMonth(),r=old();if(CG&&campaignMonth()!==before){adviserRunMonth();syncRes();if(r){r.res1={...CAMP.res};r.tot1=realmTotals();}}return r;};}
