// v0.37 (t247) the frontier is not one Song. Four Song power blocs hold the circuits, each with its own leader, interests and
// rivals; mountain bandit strongholds (山寨) raid villages and choke trade roads; and the map gains strategic layers to read all of it.
//  - Song factions: every Song-held town belongs to the bloc that commands its circuit (Liu / Yao / Zhong families, Tong Guan's
//    Pacification Commission). Each bloc has a standing with Qinghe (-100..100). Standing changes trade-route income with its towns
//    (x0.5 hostile .. x1.15 friendly), friendly blocs send grain each season, and gifts to one bloc sour its rivals.
//  - Bandit strongholds: grow each month, raid the nearest weakly-garrisoned village (grain + the core's raided flag, which costs
//    prosperity), and cut 20% off trade routes that pass near them. Suppress with a nearby garrison (auto-resolved by unit power),
//    offer amnesty (招安, silver; the band becomes a militia company), or pay tribute for three quiet months. Clearing a stronghold
//    pleases the circuit's bloc and the gentry.
//  - Strategic layers on the campaign map: Factions, Bandit threat, Supply, Trade.
'use strict';
const RS={V:'t247a',LAYERS:[['fac','势力','Factions'],['threat','匪患','Bandit threat'],['supply','补给','Supply'],['trade','商路','Trade']]};
const SF_DEF={
 liu:{zh:'秦凤刘氏',en:'Liu clan of Qinfeng',lead:['刘延庆','Liu Yanqing'],reg:['qin'],col:'#b5452c',init:20,want:['喜战功、剿匪；恶私通西夏','Likes victories and bandit-clearing; hates dealings with Xia']},
 yao:{zh:'熙河姚氏',en:'Yao clan of Xihe',lead:['姚古','Yao Gu'],reg:['xihe'],col:'#5f7d3c',init:0,want:['喜马匹、互市；恶越境用兵','Likes horses and border trade; hates troops crossing their circuit']},
 zhong:{zh:'泾原种氏',en:'Zhong clan of Jingyuan',lead:['种师道','Zhong Shidao'],reg:['jingyuan'],col:'#a37b38',init:10,want:['喜御夏、练兵；恶阉宦专权','Likes holding the Xia line and drilled troops; hates the eunuch commission']},
 tong:{zh:'童贯宣抚司',en:"Tong Guan's Pacification Commission",lead:['童贯','Tong Guan'],reg:['guanzhong','henan'],col:'#6a4a8a',init:15,want:['喜贡献、捷报；恶擅自招安','Likes tribute and victory dispatches; hates unauthorised amnesties']}};
// rivalries between blocs (helping one moves the others by this x the change, x0.3)
const SF_RIV={liu:{tong:.4,zhong:-.3,yao:-.2},yao:{zhong:-.6,liu:-.2},zhong:{tong:-.8,yao:-.6,liu:-.3},tong:{zhong:-.8,liu:.4}};
const BD_SEED=[
 {id:'longshan',zh:'陇山寨',en:'Longshan stronghold',lon:106.42,lat:34.98,men:90,boss:['“黑脸”马五','“Black-face” Ma Wu']},
 {id:'liupan',zh:'六盘山寨',en:'Liupan stronghold',lon:106.25,lat:35.62,men:150,boss:['独眼张','One-eyed Zhang']},
 {id:'nanshan',zh:'南山寨',en:'Southern Hills stronghold',lon:105.55,lat:34.5,men:70,boss:['赵大郎','Zhao the Elder']},
 {id:'maxian',zh:'马衔山寨',en:'Maxian stronghold',lon:103.98,lat:35.78,men:120,boss:['白狼','White Wolf']},
 {id:'ziwu',zh:'子午岭寨',en:'Ziwu Ridge stronghold',lon:108.35,lat:35.85,men:160,boss:['李铁枪','Iron-spear Li']}];
const BD={GROW:6,CAP:260,RAID_R:.55,TRADE_R:.4,RESPAWN:12,GRACE:6};
function sfState(){const S=CG.sf||(CG.sf={rel:{},aid:{},log:[]});for(const k in SF_DEF)if(S.rel[k]==null)S.rel[k]=SF_DEF[k].init;return S;}
function sfOf(id){const t=CT[id];if(!t||!CG.T[id]||CG.T[id].own!=='song')return null;for(const k in SF_DEF)if(SF_DEF[k].reg.includes(t.region))return k;return null;}
function sfTowns(k){return CL.terr.filter(t=>sfOf(t.id)===k).map(t=>t.id);}
function sfMood(v){return v>=50?['亲善','Friendly','#8fd07a']:v>=15?['和睦','Cordial','#d8d08a']:v>-15?['观望','Wary','#d0b080']:v>-50?['冷淡','Cold','#e09060']:['敌视','Hostile','#ff6a50'];}
function sfTradeMul(k){const v=sfState().rel[k];return v>=50?1.15:v<=-40?.5:v<0?.85:1;}
function sfAdd(k,n,why){const S=sfState();S.rel[k]=clamp(Math.round(S.rel[k]+n),-100,100);if(Math.abs(n)>=3){for(const [o,m] of Object.entries(SF_RIV[k]||{}))S.rel[o]=clamp(Math.round(S.rel[o]+n*m*.3),-100,100);}
  if(why){S.log.unshift([campaignMonth(),k,n,why]);S.log.length=Math.min(S.log.length,20);}return S.rel[k];}
// ---- bandits
function bdState(){const B=CG.bd||(CG.bd={list:BD_SEED.map(b=>({id:b.id,men:b.men,quiet:0,cleared:0,raids:0}))});for(const s of BD_SEED)if(!B.list.find(b=>b.id===s.id))B.list.push({id:s.id,men:s.men,quiet:0,cleared:0,raids:0});return B;}
function bdDef(id){return BD_SEED.find(b=>b.id===id);}
function bdGet(id){return bdState().list.find(b=>b.id===id);}
function bdActive(b){return b.men>0;}
function bdDist(b,id){const d=bdDef(b.id),t=CT[id];return Math.hypot(d.lon-t.lon,(d.lat-t.lat)*1.2);}
function bdRegion(b){const d=bdDef(b.id);return frontierRegion({lon:d.lon,lat:d.lat,own:'song'}).id;}
function bdFaction(b){const r=bdRegion(b);for(const k in SF_DEF)if(SF_DEF[k].reg.includes(r))return k;return null;}
function bdNear(b,R){return CL.terr.filter(t=>CG.T[t.id]&&bdDist(b,t.id)<=R).sort((x,y)=>bdDist(b,x.id)-bdDist(b,y.id)).map(t=>t.id);}
function bdPow(us){let n=0;for(const u of us)n+=u.men*(UT[u.type]?.pow||1)*(1-(u.wnd||0)/Math.max(1,u.men+(u.wnd||0)));return n;}
// defenders of a territory: its garrison plus any band standing there
function bdHere(id){const us=unitsAt(id);for(const a of CG.armies||[])if(a.loc===id)us.push(...armyUnits(a));return us;}
function bdStr(b){return b.men*1.25;} // mountain palisades: one bandit behind his stockade is worth more than in the open
function bdBase(b){const ids=bdNear(b,BD.RAID_R+.25).filter(owned);let best=null,bp=0;for(const id of ids){const p=bdPow(bdHere(id));if(p>bp){bp=p;best=id;}}return best?{id:best,pow:bp}:null;}
// raid target: the juiciest reachable village, Qinghe's own first (Song towns have walls and their own troops)
function bdTarget(b){let best=null,bs=0;for(const id of bdNear(b,BD.RAID_R)){const o=CG.T[id].own;if(o!=='qh'&&o!=='song')continue;const def=o==='qh'?bdPow(bdHere(id)):300;const sc=(o==='qh'?2:1)/(1+def/bdStr(b))/(1+bdDist(b,id));if(sc>bs){bs=sc;best=id;}}return best;}
function bdTick(lines){const B=bdState();for(const b of B.list){const d=bdDef(b.id);
  if(!bdActive(b)){if(++b.cleared>=BD.RESPAWN){b.men=40;b.cleared=0;lines.push(['🏴',Ts(`${d.zh}又聚起了亡命之徒`,`Outlaws gather again at ${d.en}`)]);}continue;}
  b.men=Math.min(BD.CAP,b.men+BD.GROW);if(b.quiet>0){b.quiet--;continue;}
  if(campaignMonth()<=BD.GRACE)continue; // the bands size up a new lord for two seasons before striking
  const tg=bdTarget(b);if(!tg)continue;const s=CG.T[tg];
  if(s.own==='qh'){const def=bdPow(bdHere(tg));if(def>=bdStr(b)*.9){lines.push(['🛡',Ts(`${d.zh}窥伺${CT[tg].zh}，见守军严整而退`,`${d.en} eyed ${CT[tg].en} but the garrison was ready`)]);continue;}
    const g=Math.min(s.st.grain||0,Math.round(b.men*.6)),sv=Math.min(CAMP.res.silver,Math.round(b.men*.15));s.st.grain=(s.st.grain||0)-g;CAMP.res.silver-=sv;s.raided=true;b.raids++;b.men+=4;
    lines.push(['🔥',Ts(`${d.zh}劫掠${CT[tg].zh}：失粮${g}、银${sv}`,`${d.en} raided ${CT[tg].en}: lost ${g} grain and ${sv} silver`)]);}
  else if(s.own==='song'){s.prosp=Math.max(0,(s.prosp||0)-3);b.raids++;const k=sfOf(tg);if(k)lines.push(['🔥',Ts(`${d.zh}骚扰宋境${CT[tg].zh}（${SF_DEF[k].zh}辖）`,`${d.en} harried Song ${CT[tg].en} (${SF_DEF[k].en})`)]);}}}
function bdSuppress(id){const b=bdGet(id),d=bdDef(id),base=b&&bdActive(b)&&bdBase(b);if(!base)return {ok:false,why:'nobase'};const us=bdHere(base.id).filter(u=>u.men>0),our=base.pow,their=bdStr(b);
  const roll=.85+((campaignMonth()*7+b.raids*3+b.men)%31)/100;const win=our*roll>their;const lossK=win?.12*their/Math.max(1,our):.22;
  let lost=0;for(const u of us){const l=Math.round(u.men*lossK);u.men=Math.max(5,u.men-l);lost+=l;}
  if(win){const loot=Math.round(b.men*.6+b.raids*10);CAMP.res.silver+=loot;b.men=0;b.cleared=0;const k=bdFaction(b);if(k)sfAdd(k,12,'bandit');if(CG.fac)CG.fac.gentry=clamp(CG.fac.gentry+4,0,100);
    cgLog('⚔',Ts(`剿灭${d.zh}，缴银${loot}，折兵${lost}`,`Cleared ${d.en}: ${loot} silver taken, ${lost} men lost`));const chief=bdChiefJoin(id,35);return {ok:true,win:true,loot,lost,from:base.id,chief};}
  b.men=Math.round(b.men*.8);cgLog('⚠',Ts(`攻${d.zh}不克，折兵${lost}`,`The assault on ${d.en} failed: ${lost} men lost`));return {ok:true,win:false,lost,from:base.id};}
function bdAmnestyCost(b){return Math.round(b.men*.8);}
function bdAmnesty(id){const b=bdGet(id),d=bdDef(id);if(!b||!bdActive(b))return {ok:false};const c=bdAmnestyCost(b);if(CAMP.res.silver<c)return {ok:false,why:'silver'};
  const near=bdNear(b,2).filter(owned)[0]||HOME;CAMP.res.silver-=c;const u=newUnit('mil',Math.round(b.men*.5),{loc:{v:near},mor:60,exp:1});b.men=0;b.cleared=0;
  sfAdd('tong',-8,'amnesty');const k=bdFaction(b);if(k&&k!=='tong')sfAdd(k,4,'amnesty');cgLog('🏳',Ts(`${d.zh}受招安，编为乡兵${u.men}人`,`${d.en} accepted amnesty: ${u.men} men join as militia`));const chief=bdChiefJoin(id,55);return {ok:true,unit:u.id,cost:c,at:near,chief};}
function bdTributeCost(b){return Math.round(b.men*.3);}
function bdTribute(id){const b=bdGet(id);if(!b||!bdActive(b))return {ok:false};const c=bdTributeCost(b);if(CAMP.res.silver<c)return {ok:false,why:'silver'};CAMP.res.silver-=c;b.quiet=3;return {ok:true,cost:c};}

// ---- bandit chiefs become officers: captured after a suppression or won over by amnesty (never hired for silver)
const BD_CHIEF={longshan:{tr:['brave','harsh'],sk:['山路熟：进攻、劫掠战力+12%','Knows the hill paths: +12% attacking or raiding'],m:.12},
 liupan:{tr:['martial','proud'],sk:['悍匪：战力+10%','Hard bandit: +10% strength'],m:.1},nanshan:{tr:['scout','cautious'],sk:['探路：进攻战力+8%','Pathfinder: +8% attacking'],m:.08},
 maxian:{tr:['cavalry','brave'],sk:['马贼：有骑军时战力+15%','Horse thief: +15% with cavalry'],m:.15,cav:1},ziwu:{tr:['brave','martial'],sk:['铁枪：战力+12%','Iron spear: +12% strength'],m:.12}};
for(const b of BD_SEED){const C=BD_CHIEF[b.id],id='bd_'+b.id;if(LORE.off.list.some(x=>x.id===id))continue;
  LORE.off.list.push({id,zh:b.boss[0],en:b.boss[1],k:'song',tr:C.tr,sk:{zh:C.sk[0],en:C.sk[1]},c:0,req:{},bandit:b.id,bio:{zh:`原${b.zh}寨主，熟悉山中道路与亡命之徒。`,en:`Once chief of ${b.en}; knows the hill tracks and the men who use them.`}});}
{const old=offReq;offReq=function(L){if(L&&L.bandit&&!offHas(L.id))return Ts('须先剿平或招安其山寨','clear or win over his stronghold first');return old.apply(this,arguments);};}
function bdChiefJoin(bid,loy){deepS();const id='bd_'+bid;if(offHas(id))return false;CG.off[id]={hired:1,loy,lvl:0,wins:0,army:null,gov:null};const d=bdDef(bid);cgLog('🎖',Ts(`${d.boss[0]}归顺，入帐为将`,`${d.boss[1]} submits and joins your officers`));return true;}
{const old=powerOf;powerOf=function(a,q){let p=old.apply(this,arguments);const id=a&&a.off;if(id&&String(id).startsWith('bd_')&&offHas(id)){const C=BD_CHIEF[id.slice(3)];if(C){const atk=q&&(q.type==='atk'||q.type==='raid'||q.type==='claim');const us=armyUnits(a);
  const m=C.cav?(us.some(u=>u.type==='cav')?C.m:0):(id==='bd_longshan'||id==='bd_nanshan')?(atk?C.m:0):C.m;p*=1+m;}}return p;};}
// ---- monthly / seasonal ticks
function sfTick(lines,season){const S=sfState();for(const k in SF_DEF){const v=S.rel[k];S.rel[k]=v>0?v-1:v<0?v+1:0;}
  if(season)for(const k in SF_DEF)if(S.rel[k]>=50&&sfTowns(k).length){const g=40;CG.T[HOME].st.grain=(CG.T[HOME].st.grain||0)+g;lines.push(['🎁',Ts(`${SF_DEF[k].zh}馈粮${g}石`,`${SF_DEF[k].en} sent ${g} grain`)]);}}

// ---- faction AI: each bloc acts once a month on its own interests
//  - polices its own circuit: attacks a stronghold there that has grown past 120 men
//  - jealousy: if Qinghe is much closer to a rival than to it, its standing slips
//  - asks favours of a friendly Qinghe that is rich (a pending request: pay and gain standing, or refuse and lose it)
//  - a hostile bloc harasses Qinghe's convoys (silver lost) on top of its trade embargo
//  - blocs feud with each other: rival pairs' feud level rises and falls, shown in the panel
function sfAI(lines){const S=sfState();S.req=S.req||{};S.feud=S.feud||{};const mo=campaignMonth();
  for(const k in SF_DEF){const F=SF_DEF[k],v=S.rel[k];
    const mine=bdState().list.filter(b=>bdActive(b)&&bdFaction(b)===k&&b.men>120);if(mine.length){const b=mine[0],hit=30+((mo*13+k.length*7)%31);b.men=Math.max(0,b.men-hit);if(!b.men)b.cleared=0;lines.push(['🏹',Ts(`${F.zh}出兵清剿${bdDef(b.id).zh}，斩获${hit}`,`${F.en} sent troops against ${bdDef(b.id).en}: ${hit} outlaws fell`)]);continue;}
    const riv=Object.entries(SF_RIV[k]||{}).filter(([o,m])=>m<0).map(([o])=>o);const close=riv.find(o=>S.rel[o]-v>=35);if(close){sfAdd(k,-3);lines.push(['😠',Ts(`${F.zh}不满你与${SF_DEF[close].zh}过从甚密`,`${F.en} resents your closeness to ${SF_DEF[close].en}`)]);}
    if(!S.req[k]&&v>=20&&CAMP.res.silver>=300&&(mo+k.length)%4===0){S.req[k]={m:mo,c:50};lines.push(['📨',Ts(`${F.zh}来书求助军饷五十两`,`${F.en} writes asking for 50 silver toward its pay chests`)]);}
    if(S.req[k]&&mo-S.req[k].m>=2){delete S.req[k];sfAdd(k,-6,'refused');lines.push(['📪',Ts(`${F.zh}所请未获回应，颇有怨言`,`${F.en} took your silence as a refusal`)]);}
    if(v<=-50&&CAMP.res.silver>0){const t=Math.min(CAMP.res.silver,20);CAMP.res.silver-=t;lines.push(['⚠',Ts(`${F.zh}截留你的商队，损银${t}`,`${F.en} detained your convoy: ${t} silver lost`)]);}}
  for(const k in SF_RIV)for(const [o,m] of Object.entries(SF_RIV[k])){if(m>=0||k>o)continue;const key=k+'_'+o;S.feud[key]=clamp((S.feud[key]??Math.round(-m*50))+(((mo*7+key.length)%5)-2),0,100);}}
function sfReqAnswer(k,yes){const S=sfState(),R=S.req&&S.req[k];if(!R)return {ok:false};if(yes){if(CAMP.res.silver<R.c)return {ok:false};CAMP.res.silver-=R.c;sfAdd(k,12,'request');}else sfAdd(k,-6,'refused');delete S.req[k];return {ok:true};}
function sfGift(k){const c=40;if(CAMP.res.silver<c)return {ok:false};CAMP.res.silver-=c;return {ok:true,rel:sfAdd(k,10,'gift')};}
function sfAidOk(k){const S=sfState();return S.rel[k]>=40&&(S.aid[k]||-99)<=campaignMonth()-3;}
function sfAid(k){if(!sfAidOk(k))return {ok:false};const S=sfState();S.aid[k]=campaignMonth();const h=CG.T[HOME];h.st.grain=(h.st.grain||0)+60;h.eq=h.eq||{};h.eq.spear=(h.eq.spear||0)+20;sfAdd(k,-15,'aid');return {ok:true};}
{const old=endTurn;endTurn=function(){if(!CG||CG.pend||(CG.queue&&CG.queue.length))return old.apply(this,arguments);const m=campaignMonth(),t=CG.turn;const r=old.apply(this,arguments);const n=campaignMonth()-m;
  if(n>0){const lines=r&&r.lines?r.lines:[];for(let i=0;i<n;i++){bdTick(lines);sfAI(lines);sfTick(lines,CG.turn>t&&i===n-1);}if(!r||!r.lines)for(const l of lines)cgLog(l[0],l[1]);}return r;};}
// trade: blocs scale income with their towns; strongholds near a road cut it
{const old=tradeRoutes;tradeRoutes=function(){const out=old.apply(this,arguments);if(!CG)return out;const B=bdState();
  for(const r of out){let m=1;for(const id of [r.a,r.b]){const k=sfOf(id);if(k)m*=sfTradeMul(k);}
    const A=CT[r.a],Bt=CT[r.b],mx=(A.lon+Bt.lon)/2,my=(A.lat+Bt.lat)/2;r.choke=B.list.filter(b=>bdActive(b)&&b.quiet<=0&&Math.hypot(bdDef(b.id).lon-mx,(bdDef(b.id).lat-my)*1.2)<BD.TRADE_R).map(b=>b.id);if(r.choke.length)m*=.8;
    r.v0=r.v;r.v=Math.round(r.v*m);r.mul=m;}return out;};}
// ---- map: stronghold markers, picking and layers
function bdScreen(id){const d=bdDef(id);const p=d._p||(d._p=cwp(d.lon,d.lat));return c2s(p.x,p.y);}
function rsLayer(){return CG&&CG.layer||null;}
function rsDrawFort(g,x,y,sc,b){const d=bdDef(b.id),on=bdActive(b);g.save();g.translate(x,y);g.scale(sc,sc);
  g.fillStyle='rgba(30,20,10,.35)';g.beginPath();g.ellipse(2,4,22,7,0,0,TAU);g.fill();
  for(let i=-3;i<=3;i++){const h=(i%2?12:15);g.fillStyle=on?'#6a4a2a':'#8a8070';g.fillRect(i*6-2,-h,4,h);g.fillStyle=on?'#3a2612':'#5a5448';g.beginPath();g.moveTo(i*6-2,-h);g.lineTo(i*6,-h-4);g.lineTo(i*6+2,-h);g.fill();}
  if(on){g.fillStyle='#1a1410';g.fillRect(-1,-30,2,18);g.fillStyle='#202020';g.beginPath();g.moveTo(1,-30);g.lineTo(14,-27);g.lineTo(1,-22);g.fill();}
  g.font='bold 11px "Noto Serif SC",serif';g.textAlign='center';g.fillStyle=on?'#fff0d0':'#d8d0c0';g.strokeStyle='rgba(20,10,4,.9)';g.lineWidth=3;const lab=`${Tz(d.zh,d.en)}${on?' · '+b.men:' · '+Tz('已平','cleared')}`;g.strokeText(lab,0,14);g.fillText(lab,0,14);g.restore();}
function rsDrawLayers(g){if(!CG)return;const L=rsLayer(),sc=iconScale(),B=bdState();
  if(L==='fac'){for(const t of CL.terr){const k=sfOf(t.id);if(!k)continue;const q=c2s(tPos(t.id).x,tPos(t.id).y);g.strokeStyle=SF_DEF[k].col;g.lineWidth=4*sc;g.globalAlpha=.85;g.beginPath();g.arc(q.x,q.y,26*sc,0,TAU);g.stroke();g.globalAlpha=1;}
    for(const k in SF_DEF){const ts=sfTowns(k);if(!ts.length)continue;let x=0,y=0;for(const id of ts){const q=c2s(tPos(id).x,tPos(id).y);x+=q.x;y+=q.y;}x/=ts.length;y/=ts.length;const v=sfState().rel[k],m=sfMood(v);
      g.font=`bold ${Math.round(14*sc)}px "Noto Serif SC",serif`;g.textAlign='center';g.lineWidth=4;g.strokeStyle='rgba(20,10,4,.85)';const s1=Tz(SF_DEF[k].zh,SF_DEF[k].en),s2=`${Tz(m[0],m[1])} ${v>0?'+':''}${v}`;g.strokeText(s1,x,y-40*sc);g.fillStyle=SF_DEF[k].col;g.fillText(s1,x,y-40*sc);g.strokeText(s2,x,y-24*sc);g.fillStyle=m[2];g.fillText(s2,x,y-24*sc);}}
  if(L==='threat'){for(const b of B.list){if(!bdActive(b))continue;const q=bdScreen(b.id),p0=cwp(bdDef(b.id).lon,bdDef(b.id).lat),p1=cwp(bdDef(b.id).lon+BD.RAID_R,bdDef(b.id).lat),r=(p1.x-p0.x)*CC.z;const a=Math.min(.38,.1+b.men/700);
    const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,r);gr.addColorStop(0,`rgba(200,40,20,${a})`);gr.addColorStop(1,'rgba(200,40,20,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,r,0,TAU);g.fill();g.setLineDash([6,6]);g.strokeStyle='rgba(160,30,10,.6)';g.lineWidth=1.5;g.stroke();g.setLineDash([]);}
    for(const t of CL.terr){if(!owned(t.id))continue;const thr=B.list.filter(b=>bdActive(b)&&bdDist(b,t.id)<=BD.RAID_R);if(!thr.length)continue;const q=c2s(tPos(t.id).x,tPos(t.id).y),def=bdPow(bdHere(t.id)),need=Math.max(...thr.map(bdStr))*.9,safe=def>=need;
      g.font=`bold ${Math.round(12*sc)}px sans-serif`;g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(20,10,4,.9)';const s=safe?Tz('守备足','Guarded'):Tz(`守备不足 ${Math.round(def)}/${Math.round(need)}`,`Exposed ${Math.round(def)}/${Math.round(need)}`);g.strokeText(s,q.x,q.y+44*sc);g.fillStyle=safe?'#9fe08a':'#ff8a70';g.fillText(s,q.x,q.y+44*sc);}}
  if(L==='supply'){for(const t of CL.terr){const s=CG.T[t.id];if(!s||s.own!=='qh'&&!(CG.armies||[]).some(a=>a.loc===t.id))continue;const q=c2s(tPos(t.id).x,tPos(t.id).y),ok=SUPP.has(t.id);g.lineWidth=3*sc;g.strokeStyle=ok?'rgba(110,210,110,.9)':'rgba(230,80,60,.95)';g.setLineDash(ok?[]:[5,4]);g.beginPath();g.arc(q.x,q.y,30*sc,0,TAU);g.stroke();g.setLineDash([]);
      g.font=`bold ${Math.round(11*sc)}px sans-serif`;g.textAlign='center';g.fillStyle=ok?'#bff0b0':'#ffb0a0';g.strokeStyle='rgba(20,10,4,.9)';g.lineWidth=3;const tx=ok?Tz('补给通畅','Supplied'):Tz('补给断绝','Cut off');g.strokeText(tx,q.x,q.y+46*sc);g.fillText(tx,q.x,q.y+46*sc);}}
  if(L==='trade'){for(const r of ROUTES){const p=tPos(r.a),q2=tPos(r.b),s=c2s(p.x,p.y),e=c2s(q2.x,q2.y),mx=(s.x+e.x)/2+(s.y-e.y)*.06,my=(s.y+e.y)/2+(e.x-s.x)*.06;
      g.strokeStyle=r.choke&&r.choke.length?'rgba(200,50,30,.9)':(r.mul>1?'rgba(120,220,120,.9)':'rgba(255,210,90,.9)');g.lineWidth=(2+Math.min(8,r.v/6))*sc;g.beginPath();g.moveTo(s.x,s.y);g.quadraticCurveTo(mx,my,e.x,e.y);g.stroke();
      const tx=`🪙${r.v}${r.mul&&r.mul!==1?` (×${r.mul.toFixed(2)})`:''}`;g.font=`bold ${Math.round(12*sc)}px sans-serif`;g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(20,10,4,.9)';g.strokeText(tx,mx,my);g.fillStyle='#ffe7a0';g.fillText(tx,mx,my);}}
  for(const b of B.list){const q=bdScreen(b.id);if(q.x<-60||q.x>VW+60||q.y<-60||q.y>VH+60)continue;rsDrawFort(g,q.x,q.y,sc,b);}}
{const old=drawMarch;drawMarch=function(g){const r=old.apply(this,arguments);try{rsDrawLayers(g);}catch(e){console.error(e);}return r;};}
{const old=campPick;campPick=function(sx,sy){const sc=iconScale();if(CG)for(const b of bdState().list){const q=bdScreen(b.id);if(Math.hypot(q.x-sx,q.y+8*sc-sy)<18*sc)return {bd:b.id};}return old.apply(this,arguments);};}
// ---- panels
function rsEl(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function rsBtn(zh,en,fn,dis){const b=btn(zh,en,()=>{if(dis)return;fn();},'sw-btn'+(dis?' dis':''));return b;}
function bdPanel(id){const b=bdGet(id),d=bdDef(id),w=rsEl('div','sw-card');w.dataset.bd=id;const k=bdFaction(b),base=bdActive(b)&&bdBase(b);
  w.appendChild(rsEl('div','sw-h',`🏴 ${Ts(d.zh,d.en)}`));
  if(!bdActive(b)){w.appendChild(rsEl('div','sw-p',Ts(`山寨已平。约${BD.RESPAWN-b.cleared}月后或有余党复聚。`,`Cleared. Stragglers may regroup in about ${BD.RESPAWN-b.cleared} months.`)));return w;}
  const near=bdNear(b,BD.RAID_R),thr=[...near.filter(owned),...near.filter(i=>!owned(i)&&CT[i].kind!=='district')].slice(0,4).map(i=>(owned(i)?'⚑':'')+Tz(CT[i].zh,CT[i].en));
  w.appendChild(rsEl('div','sw-p',`${Ts('寨主','Chief')}: <b>${Ts(d.boss[0],d.boss[1])}</b> · ${Ts('喽啰','Outlaws')} <b>${b.men}</b> (${Ts('据寨战力','fortified strength')} ${Math.round(bdStr(b))})<br>${Ts('威胁','Threatens')}: ${thr.join('、')||'—'}${near.length>4?` ${Ts('等','and')} ${near.length-4} ${Ts('处','more')}`:''}${k?`<br>${Ts('辖区','Circuit')}: <span style="color:${SF_DEF[k].col}">${Ts(SF_DEF[k].zh,SF_DEF[k].en)}</span>`:''}${b.quiet>0?`<br>${Ts('已纳贡，安静','Paid off, quiet for')} ${b.quiet} ${Ts('月','months')}`:''}`));
  const row=rsEl('div','sw-row');
  row.appendChild(rsBtn(base?`剿灭（${CT[base.id].zh}守军 ${Math.round(base.pow)}）`:'剿灭（附近无驻军）',base?`Suppress (${CT[base.id].en} garrison ${Math.round(base.pow)})`:'Suppress (no garrison near)',()=>{const r=bdSuppress(id);sfx(r.win?'gong':'lose');campUI();},!base));
  const ac=bdAmnestyCost(b),tc=bdTributeCost(b);
  row.appendChild(rsBtn(`招安 🪙${ac}`,`Amnesty 🪙${ac}`,()=>{bdAmnesty(id);campUI();},CAMP.res.silver<ac));
  row.appendChild(rsBtn(`纳贡三月 🪙${tc}`,`Pay off 3 months 🪙${tc}`,()=>{bdTribute(id);campUI();},CAMP.res.silver<tc||b.quiet>0));w.appendChild(row);
  w.appendChild(rsEl('div','sw-note',Ts(`寨主${d.boss[0]}：剿平则被擒归顺（忠诚低），招安则带众来投；${BD_CHIEF[id].sk[0]}`,`Chief ${d.boss[1]}: captured and pressed into service if you storm the stronghold (low loyalty), or joins willingly with amnesty. ${BD_CHIEF[id].sk[1]}`)));
  w.appendChild(rsEl('div','sw-note',Ts('剿灭以驻军战力对寨中兵力×1.25自动结算；招安编为乡兵，宣抚司不喜；纳贡则三月不扰。开局两季山寨只观望不劫掠。','Suppression is resolved from garrison power against the band ×1.25 behind its palisade. Amnesty makes the band a militia company (the Commission dislikes it). Tribute buys three quiet months. For the first two seasons the bands only watch and do not raid.')));return w;}
function sfPanel(){const S=sfState(),w=rsEl('div','sw-card');w.appendChild(rsEl('div','sw-h',Ts('宋廷诸派','The Song factions')));
  w.appendChild(rsEl('div','sw-note',Ts('西北宋军并非一体。各路将门与宣抚司各有所好、各有宿怨；与一派交好，其对头便会疏远。','The northwest Song is not one body. Each circuit\'s military family and the Pacification Commission have their own interests and feuds; courting one cools its rivals.')));
  for(const k in SF_DEF){const F=SF_DEF[k],v=S.rel[k],m=sfMood(v),ts=sfTowns(k),c=rsEl('div','sw-fac');c.dataset.sf=k;c.style.borderLeftColor=F.col;
    const riv=Object.entries(SF_RIV[k]||{}).map(([o,x])=>`<span style="color:${x<0?'#ff9a80':'#a8e090'}">${x<0?'⚔':'🤝'} ${Ts(SF_DEF[o].zh,SF_DEF[o].en)}</span>`).join(' ');
    c.innerHTML=`<div class="sw-fh"><b style="color:${F.col}">${Ts(F.zh,F.en)}</b><span>${Ts(F.lead[0],F.lead[1])}</span></div>
     <div class="sw-bar"><i style="left:50%;width:0"></i><u style="left:${v>=0?50:50+v/2}%;width:${Math.abs(v)/2}%;background:${m[2]}"></u></div>
     <div class="sw-p"><b style="color:${m[2]}">${Ts(m[0],m[1])} ${v>0?'+':''}${v}</b> · ${Ts('城镇','Towns')} ${ts.length} · ${Ts('商路收入','Trade income')} ×${sfTradeMul(k).toFixed(2)}${v>=50?' · '+Ts('每季馈粮40','sends 40 grain a season'):''}<br>${Ts(F.want[0],F.want[1])}<br>${riv}</div>`;
    const RQ=(S.req||{})[k];if(RQ){const q=rsEl('div','sw-row sw-req');q.appendChild(rsEl('span','sw-note',`📨 ${Ts('来书求饷','Asks for pay silver')} 🪙${RQ.c}`));q.appendChild(rsBtn('应允','Grant',()=>{sfReqAnswer(k,true);campUI();},CAMP.res.silver<RQ.c));q.appendChild(rsBtn('婉拒','Refuse',()=>{sfReqAnswer(k,false);campUI();}));c.appendChild(q);}
    const row=rsEl('div','sw-row');row.appendChild(rsBtn('馈赠 🪙40','Gift 🪙40',()=>{sfGift(k);campUI();},CAMP.res.silver<40));row.appendChild(rsBtn('请援（粮60·枪20）','Ask for aid (60 grain, 20 spears)',()=>{sfAid(k);campUI();},!sfAidOk(k)));c.appendChild(row);w.appendChild(c);}
  const fd=Object.entries(S.feud||{}).map(([key,v])=>{const [a,b]=key.split('_');return `${Ts(SF_DEF[a].zh,SF_DEF[a].en)} ⚔ ${Ts(SF_DEF[b].zh,SF_DEF[b].en)}: ${Ts('宿怨','feud')} ${v}`;}).join('<br>');if(fd)w.appendChild(rsEl('div','sw-note',`<b>${Ts('诸派宿怨','Feuds between the blocs')}</b><br>${fd}`));
  const lg=S.log.slice(0,5).map(([mo,k,n,why])=>`${Ts(SF_DEF[k].zh,SF_DEF[k].en)} ${n>0?'+':''}${n} (${({gift:Ts('馈赠','gift'),aid:Ts('请援','aid'),bandit:Ts('剿匪','bandits cleared'),amnesty:Ts('招安','amnesty'),request:Ts('应允求饷','granted request'),refused:Ts('拒绝所请','refused request')})[why]||why})`).join('<br>');if(lg)w.appendChild(rsEl('div','sw-note',lg));return w;}
function rsMobInsp(){if(typeof mobNarrow==='function'&&mobNarrow()){document.body.classList.remove('mob-nav','mob-log');document.body.classList.add('mob-insp');const d=document.getElementById('mobDock');if(d)for(const x of d.children)x.classList.toggle('on',x.dataset.c==='mob-insp');}}
{const old=selPanel;selPanel=function(){if(CSEL&&(CSEL.bd||CSEL.sf))setTimeout(rsMobInsp,0);if(CSEL&&CSEL.bd){const w=rsEl('div');w.appendChild(bdPanel(CSEL.bd));return w;}if(CSEL&&CSEL.sf){const w=rsEl('div');w.appendChild(sfPanel());return w;}return old.apply(this,arguments);};}
{const old=terrPanel;terrPanel=function(id){const w=old.apply(this,arguments);try{const k=sfOf(id);if(k&&w){const v=sfState().rel[k],m=sfMood(v),e=rsEl('div','sw-chiprow',`<span class="sw-chip" style="border-color:${SF_DEF[k].col}">${Ts(SF_DEF[k].zh,SF_DEF[k].en)} · <b style="color:${m[2]}">${Ts(m[0],m[1])} ${v>0?'+':''}${v}</b></span>`);e.onclick=()=>{CSEL={sf:1};campUI();};w.insertBefore(e,w.children[1]||null);}}catch(e){}return w;};}
// layer toolbar + factions button on the campaign HUD
{const old=campUI;campUI=function(){const r=old.apply(this,arguments);if(MODE!=='camp'||!CG)return r;const d=campEl();const bar=rsEl('div','panel sw-layers');bar.id='swLayers';
  bar.appendChild(rsEl('span','sw-lab',Ts('图层','Layers')));for(const [k,zh,en] of RS.LAYERS){const b=btn(zh,en,()=>{CG.layer=CG.layer===k?null:k;campUI();},'sw-btn sw-tog'+(CG.layer===k?' on':''));b.dataset.layer=k;bar.appendChild(b);}
  const f=btn('宋廷诸派','Song factions',()=>{CSEL={sf:1};campUI();},'sw-btn sw-tog'+(CSEL&&CSEL.sf?' on':''));f.id='swFacBtn';bar.appendChild(f);d.appendChild(bar);return r;};}
window.__rs={bdHere,sfAI,sfReqAnswer,bdChiefJoin,BD_CHIEF,sfState,sfOf,sfTowns,sfAdd,sfGift,sfAid,sfTradeMul,bdState,bdGet,bdSuppress,bdAmnesty,bdTribute,bdTick,bdBase,bdStr,bdPow,BD_SEED,SF_DEF,V:RS.V};
