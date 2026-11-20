'use strict';

// Economic units below are game tokens, not chemical quantities or recipes.
const DY_GOODS={sulphur:['硫黄','Sulphur','🟡'],charcoal:['木炭','Charcoal','◼'],blackpowder:['军用火药','Ordnance powder','💥'],herbs:['香药','Aromatic herbs','🌿'],oil:['植物油','Plant oils','🫙'],wine:['酒','Wine','🍶'],cosmetics:['香膏皂品','Beauty goods','🪷']};
for(const [k,v] of Object.entries(DY_GOODS)){if(!RAW.includes(k))RAW.push(k);RAWN[k]=v;RES_N[k]=v.slice(0,2);}
for(const [k,v] of Object.entries({bomb:['宋式火弹','Song firebombs','💣'],cannon:['试制铜炮','Prototype cannon','☄'],shot:['炮弹','Cannon stores','●']})){EQ.push(k);EQN[k]=v;RES_N[k]=v.slice(0,2);RACK_V[k]=k==='cannon'?0:4;}
RAWN.nitre=['硝石','Saltpetre','⚗'];RES_N.nitre=RAWN.nitre.slice(0,2);
Object.assign(PRICE,{sulphur:75,charcoal:18,blackpowder:150,herbs:35,oil:40,wine:120,cosmetics:220});
Object.assign(NODEK,{sulphur:{zh:'晋州硫黄场',en:'Jinzhou sulphur works',ic:'🟡',y:{sulphur:45}},herbs:{zh:'山地香药',en:'Upland aromatics',ic:'🌿',y:{herbs:45}}});
const DY_HUBS=[HOME,'qingshui','shijia','gongchang','fengxiang','henan','jingzhou','jingzhao'];
for(const [i,hub] of DY_HUBS.entries())for(let j=0;j<2;j++){
 const h=CT[hub],id=hub+'_resettle_'+j;
 frontierTerr({id,zh:h.zh+(j?'旧驿镇':'流民新庄'),en:h.en+(j?' Old Post Town':' Refugee Hamlet'),lon:h.lon+(j?.16:-.18),lat:h.lat-(.14+i%2*.045),kind:j?'town':'village',own:'free',pop:j?65:40,trait:j?'trade':'farm',str:0,region:h.region,vacant:true,native:j?{tea:25,silk:12}:{grain:80}},hub);
}
FRONTIER_REGIONS.push({id:'hedong',zh:'河东路',en:'Hedong Circuit',hub:'jinzhou_mines',box:[110.4,35.35,113.7,38.6],color:'#7c8062'});
frontierTerr({id:'jinzhou_mines',zh:'晋州矿区',en:'Jinzhou mining district (Linfen)',lon:111.52,lat:36.09,kind:'town',own:'song',pop:650,trait:'iron',str:0,region:'hedong'},'longde');
frontierLink('jinzhou_mines','henan');
frontierTerr({id:'jiezhou_depot',zh:'解州集运',en:'Jiezhou collection depot',lon:110.99,lat:35.03,kind:'town',own:'song',pop:450,trait:'salt',str:0,region:'hedong'},'jinzhou_mines');frontierLink('jiezhou_depot','huazhou');
CT.taiyuan.region='hedong';CT.longde.region='hedong';
for(const [id,terr,k,dx,dy,zh,en] of [
 ['dy_jin_sulphur','jinzhou_mines','sulphur',.08,.04,'晋州硫黄场','Jinzhou sulphur works'],
 ['dy_jie_nitre','jiezhou_depot','nitre',.04,-.04,'解州硝石集运','Jiezhou saltpetre collection'],
 ['dy_jing_nitre','jingzhao','nitre',-.07,.03,'关中硝石集运','Guanzhong saltpetre collection'],
 ['dy_qin_herbs','qinzhou','herbs',-.08,.05,'秦岭香药集散','Qinling aromatics market'],
 ['dy_gong_herbs','gongchang','herbs',.05,-.05,'陇山香药圃','Longshan herb gardens']
 ]){const h=CT[terr];NODES.push({id,terr,k,lon:h.lon+dx,lat:h.lat+dy,zh,en});}
for(const t of CL.terr)if(!t.region)t.region=frontierRegion(t).id;

const DY_BUSINESSES={
 brewery:{name:['酒坊','Brewery'],cost:{silver:90,timber:50,grain:20},jobs:30,input:{grain:12,charcoal:2},output:{wine:12},wage:4,color:'#9b5038'},
 beauty:{name:['香皂香膏作','Beauty workshop'],cost:{silver:110,timber:45},jobs:24,input:{herbs:8,oil:4},output:{cosmetics:10},wage:5,color:'#966780'},
 restaurant:{name:['清河酒楼','Restaurant'],cost:{silver:140,timber:60,stone:20},jobs:32,input:{grain:16,salt:3,wine:3},output:{silver:48},wage:6,color:'#a47732'},
 kiln:{name:['炭窑','Charcoal kiln'],cost:{silver:55,timber:35,stone:20},jobs:20,input:{timber:12},output:{charcoal:22},wage:2,color:'#4e6559'},
 powderworks:{name:['军器火药作','Powder works'],cost:{silver:160,timber:70,stone:50},jobs:24,input:{nitre:4,sulphur:3,charcoal:5},output:{blackpowder:12},wage:5,color:'#756542'},
 arsenal:{name:['军器监分作','Ordnance foundry'],cost:{silver:250,ore:100,timber:80,stone:50},jobs:40,input:{ore:18,blackpowder:10,timber:5},output:{bomb:6},wage:8,color:'#5e737c'}
};
const DY_PRICE={grain:.2,timber:.3,ore:.5,stone:.25,hide:.3,leather:.5,horse:9,nitre:2,sulphur:2,charcoal:1,herbs:2,oil:2,salt:.4,tea:2,silk:3,wine:3,cosmetics:6,spear:2,dao:3,bow:3,xbow:5,armL:3,armI:6,shield:2,saddle:3};
Object.assign(SHIPK,{dynTrade:{zh:'商号货运',en:'Merchant cargo',c:'#e4c177',ic:'🍶'},dynAid:{zh:'盟军援兵',en:'Allied auxiliaries',c:'#81b89d',ic:'⚑'},dynNPC:{zh:'州县商旅',en:'Song market caravan',c:'#a7b1a1',ic:'🛒'}});
UT.gun={zh:'试制炮队',en:'Prototype artillery',eng:'gun',kit:{cannon:.02,shot:.2},arm:0,t:2,silver:100,pow:3.2};UT_ORDER.push('gun');REFIT_PATHS.gun=[];
UNITS.gun.zh='试制铜炮';UNITS.gun.en='Prototype cannon';
{const old=kitCost;kitCost=function(t,n,a){const c=old(t,n,a);if(t==='gun')for(const k in c)c[k]=Math.ceil(c[k]);return c;};}
{const old=trainCheck;trainCheck=function(id,t,a){const r=old(id,t,a);if(t==='gun'&&(!CG.dynasty?.siegecraft||!CG.T[id].businesses?.arsenal?.level))r.push(Tz('需本地军器分作与试炮研究','Needs a local foundry and completed cannon research'));return r;};}

function dynastyState(){return CG.dynasty||(CG.dynasty={v:1,last:campaignMonth(),influence:{},markets:{},ledger:[],income:0,expenses:0,totalSales:0,history:[],aidSlots:{}});}
function dynastyInit(){
 if(!CG)return;const d=dynastyState();
 for(const t of CL.terr){if(!CG.T[t.id]){CG.T[t.id]={own:t.own,pop:t.pop,prosp:t.own==='song'?62:18,bld:{},build:null,str:0,raided:0,fest:0};econInit(t.id);ensureBld(t.id);}
  const s=CG.T[t.id];for(const k of RAW)s.st[k]=Math.max(0,s.st[k]||0);for(const k of EQ)s.eq[k]=Math.max(0,s.eq[k]||0);s.businesses=s.businesses||{};
  if(s.own==='song'&&!d.markets[t.id]){d.markets[t.id]={budget:150,demand:{wine:30,cosmetics:20},cooldown:0};for(const k of ['oil','herbs','nitre'])s.st[k]=Math.max(s.st[k],k==='oil'?40:20);for(const k of ['spear','bow','xbow','armL'])s.eq[k]=Math.max(s.eq[k],30);}
 }
 const jin=CG.T.jinzhou_mines;if(!d.mineralsSeeded){d.mineralsSeeded=true;jin.st.sulphur+=100;CG.T.jiezhou_depot.st.nitre+=80;}
}
function dynastyPlanning(){return CG&&!CG.over&&!CG.pend&&CG.phase===0&&['camp','cvil'].includes(MODE);}
function dynastyMoney(id){return (CAMP.res.silver||0)+(CG.T[id]?.st.gold||0)*10;}
function dynastyCanPay(id,c){return owned(id)&&Object.entries(c).every(([k,n])=>(k==='silver'?dynastyMoney(id):supplyLocal(id,k))>=n);}
function dynastyPay(id,c){if(!dynastyCanPay(id,c))return false;const need=Math.max(0,(c.silver||0)-CAMP.res.silver);if(need){const gold=Math.ceil(need/10);CG.T[id].st.gold-=gold;CAMP.res.silver+=gold*10;}for(const [k,n]of Object.entries(c))take(id,k,n,false);return true;}
function dynastyExchange(id,n=5){if(!dynastyPlanning()||!owned(id)||CG.T[id].st.gold<n)return false;CG.T[id].st.gold-=n;CAMP.res.silver+=n*10;saveGame();return true;}
{const old=cpPrice;cpPrice=function(p,k,s){const v=old(p,k,s);return k==='gold'?(s==='buy'?Math.max(v,lotN(k)*12):Math.min(v,lotN(k)*10)):v;};}
{const old=buyPrice;buyPrice=function(id,k){return k==='gold'?Math.max(old(id,k),60):old(id,k);};}
{const old=sellPriceK;sellPriceK=function(id,k){return k==='gold'?Math.min(old(id,k),50):old(id,k);};}
{const old=buyRaw;buyRaw=function(id,k){if(k!=='gold')return old(id,k);const price=buyPrice(id,k);if(!canTrade(id,k)||CG.phase>1||CAMP.res.silver<price)return false;CAMP.res.silver-=price;CG.T[id].st.gold+=5;CG.stats.trade+=price;return true;};}
{const old=sellRaw;sellRaw=function(id,k){if(k!=='gold')return old(id,k);if(!marketLv(id)||CG.phase>1||CG.T[id].st.gold<5)return false;CG.T[id].st.gold-=5;CAMP.res.silver+=sellPriceK(id,k);return true;};}
{const old=canDeal;canDeal=function(p,k,side){return DY_GOODS[k]?false:old(p,k,side);};}
{const old=canTrade;canTrade=function(id,k){return DY_GOODS[k]?false:old(id,k);};}
function dynastyBuild(id,k){
 if(!dynastyPlanning()||!owned(id)||!DY_BUSINESSES[k])return false;const s=CG.T[id],b=s.businesses[k]||(s.businesses[k]={level:0}),n=b.level+1;if(n>3||b.build)return false;
 const cost=dynastyBuildCost(id,k);if(!dynastyPay(id,cost))return false;b.build=1;b.paused=false;saveGame();return true;
}
function dynastyBuildCost(id,k){const n=(CG.T[id].businesses[k]?.level||0)+1,c=Object.fromEntries(Object.entries(DY_BUSINESSES[k].cost).map(([r,v])=>[r,v*n]));if(n===2)Object.assign(c,{cloth:10,ceramics:10,paper:5});if(n===3)Object.assign(c,{steel:12,copper:8,ceramics:15,paper:10});return c;}
function dynastyLabour(id){const s=CG.T[id],rows=Object.entries(s.businesses||{}).filter(([k,b])=>DY_BUSINESSES[k]&&b.level&&!b.paused).map(([k,b])=>({k,need:DY_BUSINESSES[k].jobs*b.level})),need=rows.reduce((n,r)=>n+r.need,0),available=Math.min(Math.floor(s.pop*.25),need);let left=available;for(const r of rows){r.work=Math.min(left,Math.floor(available*r.need/Math.max(1,need)));left-=r.work;}for(const r of rows)if(left&&r.work<r.need){r.work++;left--;}return {rows,used:available-left};}
function dynastyWorkforce(id){return dynastyLabour(id).used;}
function dynastyProduction(id,k){const s=CG.T[id],b=s.businesses[k],def=DY_BUSINESSES[k],lab=dynastyLabour(id).rows.find(r=>r.k===k),factor=(lab?.work||0)/def.jobs;
 let input=def.input,output=def.output;
 if(k==='arsenal'&&b.order==='cannon'){input={ore:45,timber:20,blackpowder:12};output={cannon:1,shot:10};}
 if(k==='arsenal'&&b.order==='shot'){input={ore:12,blackpowder:8};output={shot:20};}
 if(typeof REALM_ORDERS!=='undefined'&&REALM_ORDERS[k]?.[b.order]){input=REALM_ORDERS[k][b.order].input;output=REALM_ORDERS[k][b.order].output;}
 const scale=Math.min(factor,...Object.entries(input).map(([r,v])=>(s.st[r]||0)/v));
 return {input,output,scale:Math.floor(Math.max(0,scale)*100)/100,workers:lab?.work||0,wage:Math.ceil(def.wage*factor),blocked:k==='arsenal'&&['cannon','heavycannon'].includes(b.order)&&!dynastyState().siegecraft};
}
function dynastyNearest(id,max=4){if(!careFriendly(id))return null;const q=[[id]],seen=new Set([id]);for(const path of q){const at=path[path.length-1];if(owned(at))return {to:at,path};if(path.length>max)continue;for(const n of [...(CADJ[at]||[])].sort())if(!seen.has(n)&&careFriendly(n)){seen.add(n);q.push([...path,n]);}}return null;}
function dynastyInfluence(id){return dynastyState().influence[id]||0;}
function dynastyNote(zh,en){const d=dynastyState();d.ledger.unshift({month:campaignMonth(),zh,en});d.ledger.length=Math.min(30,d.ledger.length);}
function dynastyDonate(id){const near=dynastyNearest(id,3);if(!dynastyPlanning()||CG.T[id]?.own!=='song'||!near||dynastyInfluence(id)>=100||!dynastyPay(near.to,{silver:40,grain:60}))return false;const d=dynastyState();d.influence[id]=Math.min(100,dynastyInfluence(id)+20);CG.T[id].st.grain+=60;saveGame();return true;}
function dynastyShipment(kind,from,to,goods,extra={}){const path=supplyPath(from,to);if(!path)return null;return shipNew(kind,from,to,goods,{dynasty:true,path,trail:[from],at:from,step:0,speed:1,eta:Math.max(1,path.length-1),left:Math.max(1,path.length-1),...extra});}
// v0.25 (t249): each market prices its own goods (±10%, fixed per town and good) and distance adds 6% per extra month of road
function dyTradePrice(from,to,k,n){const base=(DY_PRICE[k]||99)*n*1.15,d=Math.max(0,((supplyPath(from,to)||[]).length||2)-2);let h=7;for(const c of from+'|'+k)h=(h*31+c.charCodeAt(0))>>>0;return Math.ceil(base*(.9+(h%21)/100)*(1+.06*d));}
function dynastyTrade(from,to,k,n=20){
 const s=CG.T[from],box=EQ.includes(k)?s?.eq:s?.st,price=dyTradePrice(from,to,k,n);
 if(!dynastyPlanning()||s?.own!=='song'||!owned(to)||!DY_PRICE[k]||!supplyPath(from,to)||!dynastyNearest(from,4)||box[k]<n||(EQ.includes(k)&&dynastyInfluence(from)<40)||!dynastyCanPay(to,{silver:price}))return false;
 dynastyPay(to,{silver:price});box[k]-=n;dynastyShipment('dynTrade',from,to,{[k]:n},{purchase:true});saveGame();return true;
}
function dynastyExport(from,to,k,n=12){
 const d=dynastyState(),m=d.markets[to],s=CG.T[from],pay=typeof politicalExportValue==='function'?politicalExportValue(from,k,n):Math.floor(n*(DY_PRICE[k]||0)*(s.accountsActive?1.15:1));if(!owned(from)||CG.T[to]?.own!=='song'||!m||!REALM_EXPORTS.includes(k)||s.st[k]<n||m.budget<pay||(m.demand[k]||0)<n||!supplyPath(from,to))return false;
 s.st[k]-=n;m.budget-=pay;m.demand[k]-=n;dynastyShipment('dynTrade',from,to,{[k]:n},{sale:true,pay});return true;
}
function dynastyAid(id,to){
 const d=dynastyState(),s=CG.T[id],m=d.markets[id],path=supplyPath(id,to),men=Math.min(300,Math.floor(((s?.songGarrison?.men||0)-50)/50)*50);
 if(!dynastyPlanning()||s?.own!=='song'||dynastyInfluence(id)<100||!dynastyNearest(id,3)||(!owned(to)&&to!=='kaifeng')||!careFriendly(to)||!path||men<100||(m?.cooldown||0)>campaignMonth())return false;
 s.songGarrison.men-=men;d.influence[id]=60;m.cooldown=campaignMonth()+6;
 dynastyShipment('dynAid',id,to,{grain:Math.ceil(men/2)},{dyTroops:men,dyType:s.songGarrison.type==='cav'?'cav':'spear'});saveGame();return true;
}
function dynastyCharter(id){
 const d=dynastyState(),s=CG.T[id],near=dynastyNearest(id,3);if(!dynastyPlanning()||s?.own!=='song'||!['town','village'].includes(CT[id].kind)||['qinzhou','qingshui'].includes(id)||dynastyInfluence(id)<100||!near||!dynastyPay(near.to,{silver:350,grain:100}))return false;
 const men=s.songGarrison?.men||0,type=s.songGarrison?.type==='cav'?'cav':'spear';claimTerr(id);delete s.songGarrison;d.aidSlots[id]=(d.aidSlots[id]||0)+Math.ceil(men/100);for(let left=men;left>0;left-=100)newUnit(type,Math.min(100,left),{arm:1,loc:{v:id},home:id,exp:2});d.influence[id]=0;saveGame();return true;
}
function dynastyResearch(id){const d=dynastyState();if(!dynastyPlanning()||d.siegecraft||d.research||!CG.T[id]?.businesses.arsenal?.level||!dynastyPay(id,{silver:200,ore:50}))return false;d.research={id,left:6};saveGame();return true;}
function dynastyLoadBombs(id,n=6){if(!dynastyPlanning()||!owned(id)||CG.T[id].eq.bomb<n)return false;CG.T[id].eq.bomb-=n;CAMP.mod.gren+=n;saveGame();return true;}
{const old=garrCap;garrCap=function(id){return old(id)+(CG?.dynasty?.aidSlots[id]||0);};}
{const old=needs;needs=function(id){const out=old(id);for(const [k,b]of Object.entries(CG.T[id].businesses||{}))if(b.level&&!b.paused){const p=dynastyProduction(id,k);for(const [r,n]of Object.entries(p.input))out[r]=(out[r]||0)+n*Math.max(1,b.level)*2;}return out;};}

function dynastyArrive(s,lines){
 if(s.state)return;s.state='done';const d=dynastyState(),T=CG.T[s.to];
 if(s.dyTroops){if(owned(s.to)){d.aidSlots[s.to]=(d.aidSlots[s.to]||0)+Math.ceil(s.dyTroops/100);const a=journeyLeader();for(let n=s.dyTroops;n>0;n-=100){const joins=a?.loc===s.to&&a.units.length<armyDuCap(a),u=newUnit(s.dyType,Math.min(100,n),{arm:1,exp:2,home:s.to,loc:joins?{a:a.id}:{v:s.to}});if(joins)a.units.push(u.id);}}
  else if(T.own==='song'){T.songGarrison=T.songGarrison||{men:0,type:'spear'};T.songGarrison.men+=s.dyTroops;if(s.to==='kaifeng'){historyAid().troops+=s.dyTroops;CG.ready=(CG.ready||0)+s.dyTroops/20;}}
 }else{for(const [k,n]of Object.entries(s.goods)){const box=EQ.includes(k)?T.eq:T.st;box[k]=(box[k]||0)+n;}if(s.sale){CAMP.res.silver+=s.pay;d.income+=s.pay;d.totalSales+=s.pay;CG.stats.trade+=s.pay;d.influence[s.to]=Math.min(100,dynastyInfluence(s.to)+4);dynastyNote(`货款入账${s.pay}银：${CT[s.to].zh}。`,`Sale delivered to ${CT[s.to].en}: ${s.pay} silver received.`);}}
 if(owned(s.to))logvPush(s.to,'in',s.goods,'porter',s.id);lines.push([SHIPK[s.kind].ic,Tz(`商旅/援军抵达${CT[s.to].zh}。`,`Trade or reinforcements reached ${CT[s.to].en}.`)]);
}
{const old=shipDeliver;shipDeliver=function(s,lines){if(s.dynasty)return dynastyArrive(s,lines);return old(s,lines);};}
{const old=shipTurn;shipTurn=function(lines){const ours=shipsOn().filter(s=>s.dynasty&&!s.state);CG.ship=shipsOn().filter(s=>!s.dynasty);old(lines);for(const s of ours){
  if(!careFriendly(s.at)||!careFriendly(s.to)){s.blocked=true;CG.ship.push(s);continue;}const path=supplyPath(s.at,s.to);if(!path){s.blocked=true;CG.ship.push(s);continue;}
  s.blocked=false;if(Math.random()<shipRisk(s)&&shipRaid(s,lines)){CG.ship.push(s);continue;}const at=path[Math.min(1,path.length-1)];s.at=at;s.trail.push(at);s.step=s.trail.length-1;s.path=[...s.trail,...path.slice(2)];s.left=Math.max(0,path.length-2);s._a=0;if(at===s.to)dynastyArrive(s,lines);else CG.ship.push(s);
 }};}
{const old=shipProg;shipProg=function(s){if(!s.dynasty)return old(s);return Math.min(1,((s.step||0)+(s.blocked?0:clamp(s._a||0,0,1)))/Math.max(1,s.path.length-1));};}
{const old=shipLine;shipLine=function(s){if(!s.dynasty)return old(s);return `${SHIPK[s.kind].ic} ${tName(s.from)} → ${tName(s.to)} · ${s.dyTroops?s.dyTroops+' '+Tz('援军','auxiliaries'):goodsTxt(s.goods)} · ${s.blocked?Tz('道路受阻','Road blocked'):s.left+' '+Tz('个月','month(s)')}${s.sale?' · '+s.pay+' '+Tz('银待收','silver on delivery'):''}`;};}

function dynastyTick(){
 dynastyInit();const d=dynastyState(),now=campaignMonth();if(d.last>=now)return false;d.last=now;
 d.history.unshift({income:d.income,expenses:d.expenses,month:now-1});d.history.length=Math.min(24,d.history.length);d.income=0;d.expenses=0;
 if(d.research&&owned(d.research.id)&&CG.T[d.research.id].businesses.arsenal?.level&&--d.research.left<=0){d.research=null;d.siegecraft=true;dynastyNote('试制铜炮研究完成。','Prototype cannon research completed.');}
 for(const [id,s]of Object.entries(CG.T)){
  if(s.own==='song'){
   const m=d.markets[id],scale=CT[id].kind==='city'?3:1;if(!m)continue;m.budget=Math.min(600,m.budget+35*scale);m.demand.wine=Math.min(60,m.demand.wine+12*scale);m.demand.cosmetics=Math.min(40,m.demand.cosmetics+8*scale);realmMarketMonth(id,scale);
   s.st.grain=Math.min(900,s.st.grain+35*scale);s.st.oil=Math.min(180,s.st.oil+8*scale);s.st.herbs=Math.min(180,s.st.herbs+5*scale);s.st.nitre=Math.min(180,s.st.nitre+4*scale);s.st.wine=Math.max(0,s.st.wine-12*scale);s.st.cosmetics=Math.max(0,s.st.cosmetics-8*scale);
   for(const n of NODES.filter(n=>n.terr===id))for(const [k,v]of Object.entries(NODEK[n.k].y)){if(RAW.includes(k))s.st[k]=Math.min(1200,(s.st[k]||0)+Math.ceil(v/3));}
   for(const k of ['spear','bow','xbow','armL'])s.eq[k]=Math.min(200,s.eq[k]+(k==='xbow'?8:15));
   const near=dynastyNearest(id,3);if(near){const host=CG.T[near.to],business=Object.values(host.businesses).filter(b=>b.level&&!b.paused).length;d.influence[id]=Math.min(100,dynastyInfluence(id)+Math.min(12,2+business+Math.floor(host.prosp/25)+(host.bld.hosp||0)));}
  }
  if(!owned(id))continue;
  s.accountsActive=!!(s.accounts&&s.st.paper>=2);if(s.accountsActive)s.st.paper-=2;
  for(const [k,b]of Object.entries(s.businesses))if(b.build&&--b.build<=0){delete b.build;b.level++;b.last=Tz('开张','Opened');CVIL.lay=null;}
  for(const [k,b]of Object.entries(s.businesses)){
   if(!b.level||b.paused)continue;const p=dynastyProduction(id,k);if(p.blocked||p.scale<=0||!dynastyCanPay(id,{silver:p.wage})){b.last=p.blocked?Tz('待试炮研究','Awaiting cannon research'):p.scale<=0?Tz('缺原料或劳力：','Missing inputs or workers: ')+Object.entries(p.input).filter(([r,n])=>s.st[r]<n).map(([r,n])=>Tz(...RES_N[r])+' '+Math.max(0,n-s.st[r])).join(' · '):Tz('缺工资','Wages unavailable');continue;}
   const out=Object.fromEntries(Object.entries(p.output).map(([r,n])=>[r,Math.floor(n*p.scale)]));if(!Object.values(out).some(Boolean)){b.last=Tz('原料不足一批','Inputs below one batch');continue;}
   dynastyPay(id,{silver:p.wage});d.expenses+=p.wage;for(const [r,n]of Object.entries(p.input))s.st[r]-=Math.ceil(n*p.scale);
   for(const [r,n]of Object.entries(out))if(r==='silver'){CAMP.res.silver+=n;d.income+=n;}else{const box=EQ.includes(r)?s.eq:s.st;box[r]=(box[r]||0)+n;}
   b.last=stockTxt(out);b.made=out;s.prosp=Math.min(100,s.prosp+.35);if(k==='restaurant'&&p.scale>=.5)s.pop+=2;
  }
  const customers=Object.keys(d.markets).filter(to=>CG.T[to].own==='song'&&supplyPath(id,to)?.length<=5).sort((a,b)=>supplyPath(id,a).length-supplyPath(id,b).length);
  if(s.autoExport!==false)for(const k of REALM_EXPORTS){if(shipsOn().filter(x=>x.sale&&x.from===id&&!x.state).length>=8)break;const reserve=realmReserve(s,k),n=Math.min(12,Math.max(0,s.st[k]-reserve));if(n>=4)for(const to of customers)if(dynastyExport(id,to,k,n))break;}
 }
 // Bounded real NPC trade: goods leave one Song market and arrive at another.
 if(shipsOn().filter(s=>s.kind==='dynNPC'&&!s.state).length<12){const all=Object.keys(d.markets).filter(id=>CG.T[id].own==='song'),near=all.filter(id=>dynastyNearest(id,4)),hubs=near.length?near:all;for(let i=0;i<Math.min(2,hubs.length);i++){const from=hubs[(now*2+i)%hubs.length],to=(CADJ[from]||[]).find(id=>CG.T[id].own==='song'&&CG.T[id].st.grain<800);if(to&&CG.T[from].st.grain>=40){CG.T[from].st.grain-=40;dynastyShipment('dynNPC',from,to,{grain:40});}}}
 dynastyNote(`本月商税与营收${d.income}银，工钱${d.expenses}银。`,`Businesses received ${d.income} silver this month; wages ${d.expenses}.`);syncRes();return true;
}
{const old=endTurn;endTurn=function(){const before=CG&&campaignMonth(),r=old();if(CG&&campaignMonth()!==before){dynastyTick();saveGame();}return r;};}
{const old=campStart;campStart=function(){old();dynastyInit();};}
{const old=campLoad;campLoad=function(){old();dynastyInit();};}
