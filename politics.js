'use strict';
// Court favour remains lifetime honour for ranks. Commissions spend its available balance.
const POL_PROJECTS={
 charter:{name:['县政托管','County charter'],merit:45,cost:{silver:80,paper:20},gate:{court:45,gentry:50},months:2,desc:['接管友方村镇、税源、库存及其真实驻军。','Take stewardship of an allied village or town, its taxes, stocks and actual garrison.']},
 procurement:{name:['军械调拨状','Arsenal warrant'],merit:35,cost:{silver:60,paper:15},gate:{court:55},months:1,desc:['从宋城现有库存调拨最多100件弩；签发一月后，军需车逐路运抵。','Requisition up to 100 crossbows from existing Song stocks. One month to authorise, then a cart travels each road link.']},
 works:{name:['官绅合办水利','Cooperative public works'],merit:30,cost:{silver:40,timber:60,stone:20},gate:{gentry:55,court:40},months:2,desc:['永久灌溉：本城粮产+15%；已有水渠则再增10%。','Permanent irrigation: +15% local grain yield, or another +10% where a canal already exists.']},
 command:{name:['节制军印','Regional command seal'],merit:60,cost:{silver:120,paper:20},gate:{court:65,gentry:45},months:2,desc:['多领一旗，主将旗下多容四都。朝官低于30时暂停扩编权，保留现有士卒。','One additional banner and four extra companies under the main commander. Court support below 30 suspends expansion rights; existing troops remain.']},
 market:{name:['商路特许','Market charter'],merit:25,cost:{silver:60,paper:10},gate:{court:40,gentry:55},months:1,desc:['本城出口价格+20%，持续12个月；买方预算支付，货到才入账。朝官或乡绅低于40暂停。','Local export prices +20% for 12 months, paid from customer budgets on delivery. Suspended below 40 court or gentry support.']},
 compact:{name:['边防互保盟约','Frontier defence compact'],merit:30,cost:{silver:50,grain:80},gate:{court:40,qiang:50},months:2,desc:['友城乡望升至100，可调用其真实驻军；附近商路遭袭概率减半12个月，羌部低于35暂停护路。','Ally influence reaches 100: call its actual garrison. Nearby convoy raid risk halves for 12 months; protection pauses below 35 Qiang support.']}
};
function politicsState(){return CG.politics||(CG.politics={v:1,spent:0,next:1,projects:[],markets:{},pacts:{},ledger:[],last:campaignMonth(),seal:false,earned:0});}
function politicsAvailable(){return Math.max(0,Math.floor(CG.fav.pts)-politicsState().spent);}
function politicsNote(text){const p=politicsState();p.ledger.unshift({month:campaignMonth(),text});p.ledger.length=Math.min(40,p.ledger.length);cgLog('印',text);}
function politicsSources(to){return Object.keys(CG.T).filter(id=>CG.T[id].own==='song'&&(CG.T[id].eq.xbow||0)>10&&supplyPath(id,to)).sort((a,b)=>CG.T[b].eq.xbow-CG.T[a].eq.xbow);}
function politicsSource(to){return politicsSources(to)[0];}
function politicsAllocation(to){let left=100;const out=[];for(const id of politicsSources(to)){const n=Math.min(left,CG.T[id].eq.xbow-10);if(n>0){out.push({id,n});left-=n;}if(!left)break;}return out;}
function politicsTargets(k,home){if(k==='charter')return Object.keys(CG.T).filter(id=>CG.T[id].own==='song'&&['town','village'].includes(CT[id].kind)&&!['qinzhou','qingshui'].includes(id)&&dynastyNearest(id,3));if(k==='compact')return Object.keys(CG.T).filter(id=>CG.T[id].own==='song'&&(CG.T[id].songGarrison?.men||0)>=150&&dynastyNearest(id,3));return owned(home)?[home]:[];}
function politicsReason(k,target,home){
 const d=POL_PROJECTS[k],p=politicsState();if(!d||!CG.T[target]||!owned(home))return 'Choose a valid settlement.';
 if(!dynastyPlanning()||CG.queue.length)return Tz('请在无待决战事的筹划阶段办理。','Use the planning stage with no pending battles.');
 if(!politicsTargets(k,home).includes(target))return Tz('没有符合条件的友城。','No eligible allied settlement.');
 if(p.projects.some(x=>x.kind===k&&(x.target===target||k==='command')&&!['done','lost','partial'].includes(x.status)))return Tz('申请正在办理。','This commission is already underway.');
 if(k==='command'&&p.seal)return Tz('军印已授。','Command seal already awarded.');
 if(k==='works'&&CG.T[target].canal&&CG.T[target].canal2)return Tz('水利已完备。','Both irrigation improvements are complete.');
 if((k==='market'&&p.markets[target]>campaignMonth())||(k==='compact'&&p.pacts[target]>campaignMonth()))return Tz('特许仍有效。','This charter is still in force.');
 for(const [f,n]of Object.entries(d.gate))if(CG.fac[f]<n)return `${f}: ${Math.floor(CG.fac[f])}/${n}`;
 if(politicsAvailable()<d.merit)return Tz(`可用功绩不足：${politicsAvailable()}/${d.merit}`,`Available merit: ${politicsAvailable()}/${d.merit}`);
 for(const [r,n]of Object.entries(d.cost))if(supplyLocal(home,r)<n)return `${Tz(...RES_N[r])}: ${Math.floor(supplyLocal(home,r))}/${n}`;
 if(k==='procurement'&&!politicsSource(home))return Tz('连通宋城无多余弩。','No connected Song arsenal has spare crossbows.');return '';
}
function politicsStart(k,target,home){
 if(politicsReason(k,target,home))return false;const p=politicsState(),d=POL_PROJECTS[k],source=k==='procurement'?politicsSource(home):null;
 const x={id:p.next++,kind:k,target,home,started:campaignMonth(),due:campaignMonth()+d.months,status:'pending'};
 if(source){x.parcels=[];x.goods=0;x.delivered=0;for(const {id,n}of politicsAllocation(home)){const cargo=dynastyShipment('dynTrade',id,home,{xbow:n},{polProject:x.id,polRelease:x.due});CG.T[id].eq.xbow-=n;x.parcels.push({ship:cargo.id,n,status:'shipping'});x.goods+=n;}x.source=source;x.ship=x.parcels[0].ship;x.status='shipping';}
 for(const [r,n]of Object.entries(d.cost))take(home,r,n,false);p.spent+=d.merit;p.projects.unshift(x);
 politicsNote(`${Tz(...d.name)} · ${tName(target)} · ${Tz('受理','commissioned')}`);saveGame();return true;
}
function politicsTick(){
 const p=politicsState(),now=campaignMonth();if(p.last>=now)return false;p.last=now;
 for(const x of p.projects){
  if(x.status==='shipping'){for(const parcel of x.parcels||[])if(parcel.status==='shipping'&&shipsOn().find(s=>s.id===parcel.ship)?.state==='lost'){parcel.status='lost';politicsNote(Tz('调拨车队损失。','Arsenal convoy lost.'));}politicsCargoStatus(x);continue;}
  if(!['pending','blocked'].includes(x.status)||x.due>now)continue;
  if(!careFriendly(x.target)||!owned(x.home)||!supplyPath(x.home,x.target)){x.status='blocked';continue;}
  x.status='done';const s=CG.T[x.target];
  if(x.kind==='charter')chronCharter(x.target);
  if(x.kind==='works'){if(!s.canal)s.canal=1;else s.canal2=1;CVIL.lay=null;}
  if(x.kind==='command')p.seal=true;
  if(x.kind==='market')p.markets[x.target]=now+12;
  if(x.kind==='compact'){p.pacts[x.target]=now+12;dynastyState().influence[x.target]=100;}
  politicsNote(`${Tz(...POL_PROJECTS[x.kind].name)} · ${tName(x.target)} · ${Tz('生效','ratified')}`);
 }return true;
}
function politicsCargoStatus(x){if(x.parcels?.every(p=>p.status!=='shipping'))x.status=x.delivered===x.goods?'done':x.delivered?'partial':'lost';}
function politicsMarketActive(id){return politicsState().markets[id]>campaignMonth()&&CG.fac.court>=40&&CG.fac.gentry>=40&&owned(id);}
function politicalExportValue(from,k,n){return Math.floor(n*(DY_PRICE[k]||0)*(CG.T[from].accountsActive?1.15:1)*(politicsMarketActive(from)?1.2:1));}
{const old=dynastyExport;dynastyExport=function(from,to,k,n=12){if(!Number.isInteger(n)||n<=0)return false;const before=new Set(shipsOn().map(s=>s.id)),ok=old(from,to,k,n);if(ok){const s=shipsOn().find(s=>!before.has(s.id)&&s.sale);if(s)s.polBonus=s.pay-Math.floor(n*(DY_PRICE[k]||0)*(CG.T[from].accountsActive?1.15:1));}return ok;};}
{const old=dynastyArrive;dynastyArrive=function(s,lines){if(s.state||((s.polProject||s.polBonus)&&!careFriendly(s.to)))return;old(s,lines);if(s.state!=='done')return;const p=politicsState();if(s.polProject){const x=p.projects.find(x=>x.id===s.polProject);if(x){const parcel=x.parcels?.find(p=>p.ship===s.id);if(parcel&&parcel.status==='shipping'){parcel.status='done';x.delivered+=s.goods.xbow;politicsCargoStatus(x);}politicsNote(Tz(`军械抵达：${s.goods.xbow}弩。`,`Arsenal delivery received: ${s.goods.xbow} crossbows.`));}}if(s.polBonus){p.earned+=s.polBonus;politicsNote(Tz(`特许商路增收${s.polBonus}银。`,`Market charter earned ${s.polBonus} extra silver.`));}};}
{const old=shipTurn;shipTurn=function(lines){const held=shipsOn().filter(s=>s.polProject&&!s.state&&campaignMonth()<s.polRelease);CG.ship=shipsOn().filter(s=>!held.includes(s));old(lines);CG.ship.push(...held);};}
{const old=shipRisk;shipRisk=function(s){const base=old(s);if(!CG||CG.fac.qiang<35)return base;return (s.path||[]).some(id=>Object.entries(politicsState().pacts).some(([town,until])=>until>campaignMonth()&&CG.T[town]?.own==='song'&&(id===town||CADJ[town].includes(id))))?base*.5:base;};}
{const old=armySlots;armySlots=function(){return old()+(CG?.politics?.seal&&CG.fac.court>=30?1:0);};}
{const old=armyDuCap;armyDuCap=function(a){return old(a)+(CG?.politics?.seal&&CG.fac.court>=30&&a.cmd==='lead'?4:0);};}
{const old=petAnswer;petAnswer=function(a){const had=CG.pet,result=old(a);if(result&&had&&a){favAdd(8,'court');politicsNote(Tz('请愿已办：功绩增加。','Petition fulfilled: court merit earned.'));}return result;};}
{const old=endTurn;endTurn=function(){const before=CG&&campaignMonth(),result=old();if(CG&&campaignMonth()!==before){politicsTick();saveGame();}return result;};}
