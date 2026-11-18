// Campaign expansion. Keep numeric phase IDs compatible with existing saves.
'use strict';

function frontierWalkFrame(name,phase) {
  const d=SPR[name]||SPR[SPR_ALIAS[name]];
  if(d?.gait)return Math.floor(phase*8)%(d.walk||8);
  if(d?.ext)return W8[Math.floor(phase*8)%8];
  return Math.floor(phase*4)%4;
}

const FRONTIER_REGIONS = [
  {id:'qin',zh:'秦凤路',en:'Qinfeng Circuit',hub:'qinzhou',box:[104.7,34.25,106.65,35.35],color:'#9e5736'},
  {id:'xihe',zh:'熙河路',en:'Xihe Circuit',hub:'gongchang',box:[102.8,34.3,104.7,36.0],color:'#74804d'},
  {id:'jingyuan',zh:'泾原路',en:'Jingyuan Circuit',hub:'weizhou',box:[105.5,35.35,107.7,36.85],color:'#a37b38'},
  {id:'guanzhong',zh:'关中诸州',en:'Guanzhong Prefectures',hub:'jingzhao',box:[106.65,34.05,110.55,35.35],color:'#9b634e'},
  {id:'henan',zh:'河南诸府',en:'Henan Prefectures',hub:'henan',box:[110.55,34.05,115,35.35],color:'#928254'},
  {id:'xia',zh:'西夏诸州',en:'Xia Prefectures',hub:'lingzhou',box:[104.7,36.85,108.4,38.8],color:'#636982'}
];

// Gameplay geography is schematic. Satellites are named farming, market and military districts.
const FRONTIER_CENTRES = [
  ['xizhou','熙州','Xizhou',103.86,35.38,'city','song',1500,'trade','gongchang'],
  ['hezhou','河州','Hezhou',103.21,35.6,'town','song',800,'horse','xizhou'],
  ['lanzhou','兰州','Lanzhou',103.84,36.06,'city','song',1400,'trade','xizhou'],
  ['dingxi','定西城','Dingxi',104.62,35.58,'fort','song',500,'iron','lanzhou'],
  ['jingzhou','泾州','Jingzhou',107.36,35.33,'city','song',1600,'farm','weizhou'],
  ['binzhou','邠州','Binzhou',108.08,35.03,'town','song',900,'trade','jingzhou'],
  ['qingzhou','庆州','Qingzhou',107.63,36.03,'city','song',1400,'horse','jingzhou'],
  ['yanzhou','延州','Yanzhou',109.48,36.6,'city','song',1600,'iron','qingzhou'],
  ['suide','绥德城','Suide',110.25,37.12,'fort','song',650,'horse','yanzhou'],
  ['xiazhou','夏州','Xiazhou',108.6,37.75,'city','xia',1600,'horse','yanzhouX'],
  ['youzhou','宥州','Youzhou',107.4,38.28,'town','xia',900,'salt','lingzhou'],
  ['shunzhou','顺州','Shunzhou',105.55,38.68,'fort','xia',600,'iron','xingqing']
];

function frontierLink(a,b) {
  if(CADJ[a].includes(b))return;
  CL.links.push([a,b]);CADJ[a].push(b);CADJ[b].push(a);
}
function frontierTerr(t,hub) {
  if(CT[t.id])return;
  CL.terr.push(t);CT[t.id]=t;CADJ[t.id]=[];
  if(hub)frontierLink(t.id,hub);
}
for(const [id,zh,en,lon,lat,kind,own,pop,trait,hub] of FRONTIER_CENTRES) {
  frontierTerr({id,zh,en,lon,lat,kind,own,pop,trait,str:own==='xia'?55:0},hub);
}
const FRONTIER_CLUSTERS = [
  'qinzhou','gongchang','xizhou','lanzhou','weizhou','zhenrong','fengxiang',
  'jingzhou','jingzhao','huazhou','henan','kaifeng','lingzhou','xingqing','xiazhou','mingsha'
];
for(const [i,hub] of FRONTIER_CLUSTERS.entries()) {
  const h=CT[hub];let prev=hub;
  for(let j=0;j<3;j++) {
    const id=hub+'_district_'+j,dx=[-.28,.29,.1][j],dy=[.14,.12,-.23][j];
    const kind=j===1?'town':j===2?'fort':'village';
    const trait=['farm','trade','iron','horse','salt'][(i+j)%5];
    const suffix=[['西庄','West farms'],['东市镇','East market'],['南堡','South fort']][j];
    frontierTerr({id,zh:h.zh+suffix[0],en:h.en+' '+suffix[1],lon:h.lon+dx,lat:h.lat+dy,
      kind,own:j===0&&i%4===0?'free':h.own,pop:j===1?260:130,trait,
      str:h.own==='xia'?(kind==='fort'?24:14):0},hub);
    if(prev!==hub)frontierLink(prev,id);prev=id;
  }
}
frontierLink('binzhou','jingzhao');frontierLink('dingxi','gongchang');
frontierLink('qingzhou','zhenrong');frontierLink('suide','xiazhou');
frontierLink('youzhou','xiazhou');frontierLink('shunzhou','tiandu');
CT.chapu.kind='town';CT.yanjing.kind='fort';

function frontierRegion(t) {
  if(t.own==='xia'&&t.lat>36.8)return FRONTIER_REGIONS[5];
  return FRONTIER_REGIONS.find(r=>t.lon>=r.box[0]&&t.lon<r.box[2]&&t.lat>=r.box[1]&&t.lat<r.box[3])
    ||FRONTIER_REGIONS[2];
}
for(const t of CL.terr) {
  t.region=frontierRegion(t).id;
  if(t.own==='free'&&!t.native)t.native=({farm:{grain:80},trade:{tea:25,silk:12},iron:{ore:65},horse:{horse:15,hide:30},salt:{salt:50}})[t.trait];
  if(!FRONTIER_CENTRES.some(c=>c[0]===t.id)&&!t.id.includes('_district_'))continue;
  const types={farm:['fish','timber'],trade:['silk','tea'],iron:['iron','stone'],horse:['horse','hide'],salt:['salt','nitre']};
  for(const [j,k] of (types[t.trait]||types.farm).entries()) {
    NODES.push({id:'fr_'+t.id+'_'+k,terr:t.id,k,lon:t.lon+(j?-.09:.1),lat:t.lat+(j?-.075:.08),
      zh:t.zh+'·'+NODEK[k].zh,en:t.en+' '+NODEK[k].en});
  }
}

function frontierMigrate() {
  if(!CG)return;
  CG.month=clamp(CG.month||1,1,3);
  // Reuse the established migration for new territories; never reset an existing settlement.
  t235Mig();
  for(const t of CL.terr) {
    const s=CG.T[t.id];ensureBld(t.id);
    if(s.frontierReady)continue;
    s.frontierReady=1;
    const scale={village:1,town:2,fort:2,pass:1,camp:2,city:4}[t.kind]||1;
    if(s.own==='song') {
      Object.assign(s.st,{grain:400*scale,timber:100*scale,stone:70*scale,ore:60*scale,
        hide:40*scale,horse:t.trait==='horse'?80*scale:20*scale,tea:25*scale,silk:15*scale,gold:3*scale});
      s.bld.store=Math.max(s.bld.store,Math.min(3,scale));s.bld.market=Math.max(s.bld.market,1);
      s.bld.yard=Math.max(s.bld.yard,1);s.bld.wall=Math.max(s.bld.wall,1);
      s.songGarrison={men:({city:1200,town:400,fort:700,pass:500}[t.kind]||150),type:t.trait==='horse'?'cav':'spear'};
    } else if(s.own==='free') {
      // Stock stays local: annexation opens access rather than granting global materials.
      s.st.grain=Math.max(s.st.grain,280*scale);s.st.timber=Math.max(s.st.timber,120*scale);
      s.st.stone=Math.max(s.st.stone,70*scale);s.st.ore=Math.max(s.st.ore,45*scale);
      const native={farm:{grain:80},trade:{tea:25,silk:12},iron:{ore:65},horse:{horse:15,hide:30},salt:{salt:50}};
      t.native=t.native||native[t.trait];
    } else if(s.own==='xia'&&s.stock) {
      for(const k of Object.keys(s.stock))s.stock[k]=Math.round(s.stock[k]*1.6);
      Object.assign(s.stock,{timber:150*scale,stone:100*scale,ore:80*scale,gold:4*scale});
    }
  }
  if(!CG.frontierProvisioned) {
    CG.frontierProvisioned=1;
    const h=CG.T[HOME];
    // One-time local relief, including when continuing an existing campaign.
    for(const [k,v] of Object.entries({grain:480,timber:300,stone:180,ore:140,hide:100,leather:60,tea:40,silk:20,gold:10}))h.st[k]=(h.st[k]||0)+v;
    CAMP.res.silver=(CAMP.res.silver||0)+350;
    h.bld.store=Math.max(h.bld.store,2);
    cgLog('📦',Ts('边地补给抵达；州县、村镇、矿场与驻军已标入舆图','Frontier supplies arrive; towns, resource sites and garrisons added to the map'));
  }
  if(CG.phase===1||CG.phase===2)CG.phase=0;
}
{const old=campStart;campStart=function(){old();frontierMigrate();campRefresh();};}
{const old=campLoad;campLoad=function(){
  CG=CAMP.cg||null;
  // The legacy refresh walks every road, so add new endpoints before it runs.
  if(CG)for(const t of CL.terr)if(!CG.T[t.id]) {
    CG.T[t.id]={own:t.own,pop:t.pop,prosp:t.own==='song'?62:t.own==='xia'?34:18,
      bld:{},build:null,str:t.str||0,raided:0,fest:0};
    econInit(t.id);ensureBld(t.id);
  }
  old();frontierMigrate();if(CG)campRefresh();
};}
{const old=storeCap;storeCap=function(id){return old(id)+1200;};}
{const old=garrison;garrison=function(id){const s=CG.T[id];return old(id)+(s.own==='song'?(s.songGarrison?.men||0):0);};}

// A single planning stage accepts every administrative action and movement order.
CL.phases[0]=['筹划','Planning'];
{const old=nextPhase;nextPhase=function(){
  if(!CG||CG.pend)return;
  if(CG.phase<=2) {
    CG.phase=2;
    for(const a of CG.armies)if(a.route&&!a.dest)rtsTake(a);
    beginBattlePhase();
  } else old();
};}
{const old=orderMarch;orderMarch=function(a,to){
  if(CG.phase>2)return false;
  const phase=CG.phase;CG.phase=2;try{return old(a,to);}finally{CG.phase=phase;}
};}
{const old=storyAvail;storyAvail=function(){
  if(!CG||CG.phase>2)return null;
  const phase=CG.phase;CG.phase=2;try{return old();}finally{CG.phase=phase;}
};}
LORE.rts.setOut={zh:'{a} 已接令前往 {t}；按“执行军令”出发（{k}）',en:'{a} ordered to {t}; press Resolve orders to depart ({k})'};
CL.tut=[
  {zh:'拖动地图、滚轮缩放。州城、县镇、村落与资源点都有道路连接，旗色代表所属。',en:'Drag to pan and scroll to zoom. Roads connect cities, towns, villages and resources; banners show allegiance.'},
  {zh:'筹划阶段可同时营建、训练、买卖与调兵；左侧页签随时可查看。',en:'During Planning, build, train, trade and issue orders together. The left tabs open their panels at any time.'},
  {zh:'在“治所 → 兵营”训练兵马；在部曲面板调入已训练的驻军。',en:'Train troops in Settlement → Barracks, then draw trained garrison units into your band.'},
  {zh:'选择军旗，右键村镇规划路线；按“执行军令”后开始行军与交战。',en:'Select your banner and right-click a settlement to plan a route. Resolve orders starts movement and battles.'},
  {zh:'处理所有战斗后，按“结算本季”领取收成、推进营建与训练。',en:'After resolving every battle, End season collects income and advances construction and training.'},
  {zh:'季报列出收入、消耗、训练与战事；关闭后开始下一季筹划。',en:'The seasonal report lists income, upkeep, training and battles. Close it to plan the next season.'}
];
{const old=campUI;campUI=function(){
  old();if(MODE!=='camp')return;
  const next=$('cNext'),top=next?.parentNode;
  if(top) {
    for(const [i,el] of [...top.querySelectorAll('.ph')].entries()) {
      if(i===1||i===2){el.remove();continue;}
      el.textContent=Ts(...({0:['1. 筹划','1. Planning'],3:['2. 交战','2. Battles'],4:['3. 季报','3. Report']}[i]));
      el.title=Ts(i===0?'营建、征募、商贸、调兵均在此阶段':'处理战事后结算本季',i===0?'Build, recruit, trade and plan movement together':'Resolve battles, then settle this season');
    }
    if(CG.phase===0)next.innerHTML=T('执行军令 ▶','Resolve orders ▶');
    top.style.paddingBottom='10px';
  }
};}
{const old=selPanel;selPanel=function(){
  const p=old();if(CG.phase===0&&p.children[1])p.children[1].innerHTML=T(
    '筹划：营建、训练、买卖、调兵可同时进行。军令执行后交战；每回合一月，季末结算一次。',
    'Plan buildings, recruitment, trade and movement together. Resolve orders starts battles. End month advances time; the third month settles the season.');
  return p;
};}

// Region shading is drawn beneath roads and settlements; these are schematic game districts.
{const old=drawMapLife;drawMapLife=function(g){
  for(const r of (typeof drawCampaignGround==='function'?[]:FRONTIER_REGIONS)) {
    const [x0,y0,x1,y1]=r.box,a=cwp(x0,y1),b=cwp(x1,y0),p=c2s(a.x,a.y),q=c2s(b.x,b.y);
    g.save();g.fillStyle=r.color;g.globalAlpha=.065;g.fillRect(p.x,p.y,q.x-p.x,q.y-p.y);
    g.globalAlpha=.3;g.strokeStyle=r.color;g.lineWidth=1;g.setLineDash([8,6]);g.strokeRect(p.x,p.y,q.x-p.x,q.y-p.y);g.restore();
    if(CC.z<1.2) {g.save();g.font='bold '+Math.max(12,20*iconScale())+'px serif';g.fillStyle=r.color;g.textAlign='center';g.fillText(Tz(r.zh,r.en),(p.x+q.x)/2,p.y+24);g.restore();}
  }
  old(g);
};}
{const old=drawTerr;drawTerr=function(g,id){
  old(g,id);const s=CG.T[id];if(CC.z<.75||!s)return;
  const count=s.own==='song'?s.songGarrison?.men:s.own==='xia'&&SEEN.has(id)?s.str:0;
  if(!count)return;const p=tPos(id),q=c2s(p.x,p.y),sc=iconScale();
  if(q.x<-80||q.x>VW+80||q.y<-80||q.y>VH+80)return;
  const x=q.x+31*sc,y=q.y-32*sc;
  if(CC.z>1.05)for(let i=0;i<2;i++)sprUnit(s.own==='song'?'song_spear':'xia_raider',q.x+(30+i*12)*sc,q.y+2*sc,7*sc,Math.PI/2,0);
  g.save();g.fillStyle=s.own==='song'?'#86271d':'#252838';g.strokeStyle='#d6b872';g.lineWidth=1;
  g.fillRect(x-22*sc,y-12*sc,48*sc,18*sc);g.strokeRect(x-22*sc,y-12*sc,48*sc,18*sc);
  txt('⚔ '+count,x+2*sc,y+1*sc,11*sc,'#fff0c6','center','bold ');g.restore();
};}
{const old=terrPanel;terrPanel=function(id){
  const p=old(id),t=CT[id],s=CG.T[id],r=FRONTIER_REGIONS.find(r=>r.id===t.region);
  const d=document.createElement('div');d.className='wk';
  d.innerHTML='<b>'+Ts(r.zh,r.en)+'</b> · '+Ts(CL.fac[s.own].zh,CL.fac[s.own].en)+
    (s.songGarrison?'<br>'+Ts('宋军驻防：','Song garrison: ')+s.songGarrison.men+' '+Ts('人','men'):'');
  p.prepend(d);return p;
};}

// Warehouse stacks grow from the back-left corner toward the front, with upright full-size goods.
stkGrid=function(n,x0,y0,x1,y1,it){
  const cols=Math.max(1,Math.floor((x1-x0)/it.cw)),rows=Math.max(1,Math.floor((y1-y0)/it.ch)),per=cols*rows,out=[];
  for(let i=0;i<Math.min(n,per*it.ly);i++) {
    const l=Math.floor(i/per),k=i%per;
    out.push({x:x0+it.cw*(k%cols+.5)+(l%2)*it.cw*.15,y:y0+it.ch*(Math.floor(k/cols)+.65),l});
  }
  return {pts:out,over:Math.max(0,n-per*it.ly)};
};
// Precious metal belongs in the treasury, never in the open warehouse bins.
for(const bin of STK_BINS)for(const k of ['gold','silver']){const i=bin.indexOf(k);if(i>=0)bin.splice(i,1);}
VZ.treasury=[150,760,405,970];
Object.assign(STK_IT,{
  grain:{v:1,sc:.68,cw:26,ch:17,ly:3,lz:7},
  timber:{v:3,sc:.78,cw:32,ch:18,ly:3,lz:7},
  stone:{v:4,sc:.9,cw:24,ch:17,ly:3,lz:7},
  ore:{v:5,sc:1,cw:24,ch:17,ly:3,lz:6},
  hide:{v:6,sc:.92,cw:25,ch:17,ly:3,lz:4},
  leather:{v:7,sc:.9,cw:22,ch:17,ly:3,lz:6}
});
function treasuryContents(gold,silver){
  const items=[];
  for(const [k,value,unit,x0] of [['gold',gold,5,-104],['silver',silver,50,18]]){
    const count=Math.min(48,Math.ceil(Math.max(0,value)/unit));
    for(let i=0;i<count;i++){const level=Math.floor(i/24),slot=i%24;items.push({k,v:k==='gold'?13:14,x:x0+(slot%6)*17,y:-65+Math.floor(slot/6)*13-level*6,level});}
  }
  return items.sort((a,b)=>a.y-b.y||a.level-b.level);
}
function frontierTreasury(add,g,s) {
  const x=(VZ.treasury[0]+VZ.treasury[2])/2,y=VZ.treasury[3]-30;
  const enemy=s.own==='xia',gold=enemy?(s.stock?.gold||0):(s.st.gold||0),silver=CVIL.id===HOME?Math.round(CAMP.res.silver||0):s.stock?.silver||0;
  const title=enemy?Tz('西夏军库','XIA TREASURY'):Tz('大宋官库','SONG TREASURY'),contents=treasuryContents(gold,silver);
  add(y,()=>{
    // Reuse the rendered open shell: roof lifted off, secure walls and front
    // rail intact. Ingots remain inside the building rather than outdoors.
    sprProp('store8',x,y-40,0,1.25);
    for(const px of [x-133,x+133]){g.fillStyle='#7d3527';g.fillRect(px-3,y-118,6,115);g.fillStyle='#c2a46a';g.fillRect(px-5,y-9,10,7);}
    g.fillStyle='#65251b';g.fillRect(x-53,y-124,106,19);g.strokeStyle='#c5a35a';g.lineWidth=1;g.strokeRect(x-53,y-124,106,19);
    txt(title,x,y-110,11,'#f5d58d','center','bold ');
    for(const it of contents){
      sprProp('stk8',x+it.x,y+it.y,it.v,it.k==='gold'?.85:.68);
      if(it.k==='gold'){
        // Gold catches the light inside the tray; retain the rendered chest.
        g.fillStyle='#f1ce64';for(let i=0;i<3;i++)g.fillRect(x+it.x-5+i*3.5,y+it.y-5,2.5,2);
      }
    }
    sprProp('store8',x,y-40,1,1.25);
    sprProp('banner',x-145,y+2,enemy?1:0,.8);sprProp('banner',x+145,y+2,enemy?1:0,.8);
    sprUnit(enemy?'xia_foot':'song_spear',x-120,y+10,9,Math.PI/2,0);sprUnit(enemy?'xia_foot':'song_spear',x+120,y+10,9,Math.PI/2,0);
    stockLabel(g,x,y+37,[[Tz('金 ','Gold '),gold],[Tz('银 ','Silver '),silver]]);
  });
  CVIL.hot.push({r:VZ.treasury,t:title+' · '+Tz('屋顶剖视','roof cutaway')+'\n'+Tz('黄金 ','Gold ')+gold+'\n'+Tz('白银 ','Silver ')+silver+'\n'+Tz('每盘：金5 / 银50（大量储备合并显示）','Each tray: 5 gold / 50 silver (large reserves grouped)')+(CVIL.id===HOME?'\n'+Tz('全境公帑（不计入仓廒库容）','Realm silver reserve (separate from warehouse capacity)'):'')});
}
{const old=cvilStores7;cvilStores7=function(add,g,s){old(add,g,s);frontierTreasury(add,g,s);};}
{const old=logvSpot;logvSpot=function(k){if(k==='gold'||k==='silver')return{x:278,y:940};return old(k);};}
{const old=carryProp;carryProp=function(g,k,x,y,sc=1){if(k==='gold'||k==='silver')return chest(g,x,y,sc);return old(g,k,x,y,sc);};}
{const old=cvilUI;cvilUI=function(){
  old();const side=campEl().querySelector('.panel');if(!side)return;
  const b=btn('官库','Treasury',()=>cvilFocus('treasury',2.2));b.style.cssText='font-size:12px;padding:3px 7px;min-width:0';
  const row=[...side.children].find(el=>el.querySelector('.btn')&&el.textContent.includes(Tz('全景','Whole')));if(row)row.prepend(b);
};}

// Convoy progress is driven by elapsed time, and drawing/hit-testing are read-only.
shipProg=function(s){
  const p0=(s.eta-s.left)/s.eta,p1=Math.min(s.left<=1?.93:1,(s.eta-s.left+1)/s.eta);
  const a=clamp(s._a||0,0,1);return lerp(p0,p1,a*a*(3-2*a));
};
{const old=campFrame;campFrame=function(dt){
  for(const s of shipsOn())if(!s.state)s._a=Math.min(1,(s._a||0)+dt/14);
  return old(dt);
};}

// Village figures are small even when zoomed: retain their decoded medium atlas
// instead of swapping a huge character sheet into memory mid-loading animation.
{const old=sprHi;sprHi=function(d){
  if((MODE==='cvil'||MODE==='camp')&&SPR_META[d.name]?.kind==='unit'){d.used=SPR_FRAME;return;}
  return old(d);
};}

// Explicit review link: starts a disposable campaign without touching the saved game.
if(new URLSearchParams(location.search).get('preview')==='frontier') {
  const key=SAVEKEY+'_frontier_preview';
  saveGame=function(){try{localStorage.setItem(key,JSON.stringify(CAMP));return true;}catch(e){return false;}};
  loadGame=function(){try{return JSON.parse(localStorage.getItem(key)||'null');}catch(e){return null;}};
  hasSave=function(){try{return !!localStorage.getItem(key);}catch(e){return false;}};
  const start=()=>{if(!sprReady){setTimeout(start,100);return;}__sw.cstart();};
  start();
}
