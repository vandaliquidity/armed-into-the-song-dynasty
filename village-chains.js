// v0.31 (t252/t253) village life, part 2: visible production chains and everyday life in the classic village.
// Chains follow the real workshop plans (wkPlan): for every workshop that is producing this season, carriers take each raw material
// from its storehouse bin (or leather from the tannery: one workshop's product is the next one's input) to the artisan, the artisan works
// his station with a looping work animation, and the finished pieces are carried to the armoury (weapons, armour, saddles) or back to the
// leather bin. One carrier load = 50 pieces (the storehouse unit); trips are paced so one season's real output is moved per VC.SEASON
// seconds of village time, so a busy smithy visibly runs more loads than a starved one, and a workshop short of material stands idle.
// Life: chickens round the houses, children playing tag, laundry lines, women at the well, cooking smoke at meal times on a gentle
// day clock with lamps at dusk, buyers haggling at stalls, spring petals and autumn leaves. Agents are capped per graphics tier.
'use strict';
const VC={SEASON:60,LOAD:50,CAP:{hi:34,md:24,lo:12},DAY:150};
const VC_ACT={tannery:'stir',smithy:'hammer',bowyer:'weave',armour:'hammer',saddle:'weave',fire:'tend'};
const VC_WKPOS=[[1400,880],[1560,880],[1710,880],[1400,1030],[1560,1030],[1710,1030]];
const VC_COL={grain:'#d8b050',timber:'#8a5a30',stone:'#a8a8a0',ore:'#4a4a50',hide:'#b08060',leather:'#7a4a28',nitre:'#e0e0d0',salt:'#f0f0f0'};
function vcCap(){const c=VC.CAP[GFX.tier||'md']||20;return typeof mobNarrow==='function'&&mobNarrow()?Math.ceil(c/2):c;}
// places: a door, plus the lane points that join it to the main east-west road (y 470)
function vcBin(k){const i=STK_BINS.findIndex(b=>b.includes(k)),gap=(VZ.store[2]-VZ.store[0])/4,x=VZ.store[0]+gap*((i<0?0:i)+.5);return {d:[x,452],via:[],port:[x,470]};}
function vcShop(s,k){const ws=WK_ORDER.filter(w=>s.bld[w]),i=ws.indexOf(k);if(i<0)return null;const [x,y]=VC_WKPOS[i];return {d:[x-30,y+16],via:[[1320,y+16]],port:[1320,470],x,y};}
function vcArm(){return {d:[575,650],via:[[600,650]],port:[600,470]};}
function vcRoute(A,B){if(A.via.length&&B.via.length&&A.via[0][0]===B.via[0][0])return [A.d,A.via[0],B.via[0],B.d];return [A.d,...A.via,A.port,B.port,...[...B.via].reverse(),B.d];}
// the chain plan for this village (recomputed every couple of seconds; cheap)
function vcPlan(s){const legs=[],shops=[];for(const k of WK_ORDER){if(!s.bld[k])continue;const p=wkPlan(CVIL.id,k),S=vcShop(s,k);if(!p||!S)continue;shops.push({k,p,S});if(!p.n)continue;
    for(const r in p.R){const units=p.R[r]*p.n/100,tan=r==='leather'&&k!=='tannery'&&!!s.bld.tannery,src=tan?vcShop(s,'tannery'):vcBin(r);legs.push({kind:'raw',k:r,to:k,units,P:vcRoute(src,S),from:tan?'tannery':'store'});}
    const dst=p.item==='leather'?vcBin('leather'):vcArm();legs.push({kind:'out',k:p.item,from:k,units:p.n,P:vcRoute(S,dst),to:p.item==='leather'?'store':'armoury'});}
  return {legs,shops};}
function vcAlong(P,d){let j=0;while(j<P.length-2){const L=Math.hypot(P[j+1][0]-P[j][0],P[j+1][1]-P[j][1]);if(d<=L)break;d-=L;j++;}const a=P[j],b=P[j+1],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,e=Math.min(1,d/L);return {x:a[0]+(b[0]-a[0])*e,y:a[1]+(b[1]-a[1])*e,f:Math.atan2(b[1]-a[1],b[0]-a[0]),end:e>=1&&j>=P.length-2};}
function vcLen(P){let n=0;for(let j=0;j<P.length-1;j++)n+=Math.hypot(P[j+1][0]-P[j][0],P[j+1][1]-P[j][1]);return n;}
function vcState(s){if(!CVIL.vc||CVIL.vc.id!==CVIL.id)CVIL.vc={id:CVIL.id,ag:[],plan:null,pt:0,clk:{},life:null};return CVIL.vc;}
function vcName(k){return RAWN[k]?Ts(RAWN[k][0],RAWN[k][1]):EQN[k]?Ts(EQN[k][0],EQN[k][1]):k;}
function vcShopName(k){return DEV[k]?Ts(DEV[k].zh,DEV[k].en):k;}
function vcLoad(g,x,y,leg){if(leg.k==='silver'){sprProp('stk8',x,y,14,.22);return;}if(leg.kind==='harvest'){sprProp('stk',x,y,CARGO_V.grain,.26);return;}if(leg.kind==='raw'&&CARGO_V[leg.k]!==undefined){sprProp('stk',x,y,CARGO_V[leg.k],.3);return;}
  g.fillStyle=VC_COL[leg.k]||'#8a8a90';g.strokeStyle='rgba(30,18,8,.85)';g.lineWidth=1;g.fillRect(x-7,y-9,14,9);g.strokeRect(x-7,y-9,14,9);
  if(EQN[leg.k]){g.font='9px sans-serif';g.textAlign='center';g.fillText(EQN[leg.k][2],x,y-11);}}
function vcChains(add,g,s,t,dt){const V=vcState(s);V.pt-=dt;if(V.pt<=0||!V.plan){V.plan=vcPlan(s);V.pt=2;}const P=V.plan,cap=vcCap();
  // spawn: each leg runs trips = units / LOAD per season, spread over VC.SEASON seconds
  for(const leg of P.legs){const key=leg.key||leg.kind+leg.k+(leg.to||leg.from),per=VC.SEASON/Math.max(1,leg.units/(leg.load||VC.LOAD));V.clk[key]=(V.clk[key]??Math.random()*per)-dt;
    if(V.clk[key]<=0){V.clk[key]+=Math.max(3,per);if(V.ag.length<cap)V.ag.push({leg,d:0,L:vcLen(leg.P),st:0,back:0,ph:Math.random()*9,per});}}
  // artisans at their workshops: work while the shop produces, stand idle (and the label says why) when it is short
  for(const {k,p,S} of P.shops){const st=typeof vyOn==='function'&&vyOn()?vyStation(VY_WK[WKV[k]],S.x,S.y+40):null;const x=st?st.x:S.x-34,y=st?st.y:S.y+8,act=st?st.act:(VC_ACT[k]||'hammer'),dir=st?st.dir:0,busy=p.n>0;
    add(y,()=>typeof vpWorker==='function'&&vpWorker(g,x,y,act,dir,busy?Math.floor(t*5+S.x):0));   // t255: one people standard (village-people.js)
    const ins=Object.entries(p.R).map(([r,q])=>`${vcName(r)} ${q}`).join(' + ');
    CVIL.hot.unshift({r:[x-16,y-34,x+16,y+4],t:`${vcShopName(k)} · ${Ts('匠人','artisan')}\n${busy?`${Ts('本季','This season')}: ${vcName(p.item)} ${p.n}/${p.cap}`:Ts('缺料停工','Idle: short of materials')+': '+p.short.map(vcName).join(', ')}\n${Ts('每百件用料','Per 100 pieces')}: ${ins}`});}
  // carriers: walk the lanes loaded, set the load down, walk back empty
  for(const a of V.ag){if(a.st>0){a.st-=dt;if(a.st<=0)a.back=1;}else if(!a.back){a.d+=dt*36;if(a.d>=a.L){a.d=a.L;a.st=1.2;}}else a.d-=dt*42;
    const q=vcAlong(a.leg.P,Math.max(0,Math.min(a.L,a.d))),loaded=!a.back,face=a.back?q.f+Math.PI:q.f,fr=a.st>0?4+(Math.floor(t*3)%2):frontierWalkFrame('porter',a.d/14+a.ph);
    add(q.y,()=>{const sp=a.leg.spr&&SPR_META[a.leg.spr]?a.leg.spr:SPR.porter?'porter':'villager',hand=typeof songCarryAnchor==='function'?songCarryAnchor(sp,q.x,q.y,face):null,drawLoad=()=>vcLoad(g,hand?hand.x:q.x,hand?hand.y:q.y-30,a.leg);if(loaded&&a.st<=0&&hand?.behind)drawLoad();sprUnit(sp,q.x,q.y,10,face,fr,{civilianCarrier:true});if(loaded&&a.st<=0&&!hand?.behind)drawLoad();else if(a.st>0)vcLoad(g,q.x+10,q.y-2,a.leg);});
    if(loaded){const L=a.leg;CVIL.hot.unshift({r:[q.x-10,q.y-30,q.x+10,q.y+4],t:L.kind==='harvest'?`${Ts('收割','Harvest')}: ${vcName('grain')} ${L.load} → ${Ts('粮仓','the grain bin')}\n${Ts('来自田地','From the fields')} · ${Ts('本季收成','this season')} ${Math.round(P.inc.farm)}`:L.kind==='tax'?`${Ts('税吏','Tax clerk')}: ${Ts('银','silver')} ${L.load} → ${Ts('大宋官库','the treasury')}\n${Ts('各户赋税','Household tax')} · ${Ts('本季','this season')} ${P.inc.tax}`:L.kind==='trade'?`${Ts('商贾','Merchant')}: ${Ts('银','silver')} ${L.load} → ${Ts('大宋官库','the treasury')}\n${Ts('商路收入','Trade-route income')} · ${Ts('本季','this season')} ${P.inc.trade}`:L.kind==='raw'?`${Ts('搬运','Carrying')} ${vcName(L.k)} ${VC.LOAD} → ${vcShopName(L.to)}\n${Ts('来自','From')} ${L.from==='store'?Ts('仓廒','the storehouse'):vcShopName('tannery')} · ${Ts('本季需','needed this season')} ${Math.round(L.units)}`:`${Ts('送交','Delivering')} ${vcName(L.k)} ${VC.LOAD} → ${L.to==='armoury'?Ts('武库','the armoury'):Ts('仓廒','the storehouse')}\n${Ts('本季产出','This season')} ${L.units}`});}}
  V.ag=V.ag.filter(a=>!(a.back&&a.d<=0));}
// ---------------------------------------------------------------- everyday life
function vcLifeInit(s){const L=CVIL.lay,R=srand(91+[...CVIL.id].reduce((a,c)=>a+c.charCodeAt(0),0)),hs=(L.houses||[]).slice(0,clamp(Math.round(4+s.pop/120),4,(L.houses||[]).length));
  const mob=typeof mobNarrow==='function'&&mobNarrow(),ch=[];for(let i=0;i<Math.min(mob?6:12,4+hs.length);i++){const h=hs[Math.floor(R()*hs.length)]||{x:900,y:600};ch.push({hx:h.x,hy:h.y+26,x:h.x+(R()-.5)*50,y:h.y+26+R()*24,a:R()*TAU,t:R()*3,c:R()<.3?'#f4efe4':R()<.6?'#b8642e':'#6a3a20'});}
  const lines=[];for(let i=0;i<Math.min(4,Math.floor(hs.length/3));i++){const h=hs[i*3];if(!h||h.side)continue;lines.push({x:h.x-30,y:h.y+34,w:60,c:[...Array(4)].map(()=>['#2f4f8f','#e8e0c8','#9a2b2b','#c7a23a','#5a7fae','#4a7a4a'][Math.floor(R()*6)])});}
  const kids=[];for(let i=0;i<clamp(2+tierOf(s.prosp),2,5);i++)kids.push({x:820+R()*120,y:620+R()*60,ph:R()*TAU,r:30+R()*30});
  const chim=hs.filter(h=>!h.side).slice(0,10).map(h=>({x:h.x+12,y:h.y-46}));
  return {ch,lines,kids,chim,leaf:[]};}
function vcLife(add,g,s,t,dt,se){const V=vcState(s);if(!V.life)V.life=vcLifeInit(s);const F=V.life,day=(t/VC.DAY+.3)%1;
  // chickens peck about the house fronts
  for(const c of F.ch){c.t-=dt;if(c.t<0){c.t=1+Math.random()*3;c.a=Math.atan2(c.hy+Math.random()*30-c.y,c.hx+(Math.random()-.5)*70-c.x);c.mv=Math.random()<.5?.8:0;}if(c.mv>0){c.mv-=dt;c.x+=Math.cos(c.a)*dt*16;c.y+=Math.sin(c.a)*dt*16;}
    const peck=c.mv<=0&&Math.sin(t*7+c.hx)>.2;add(c.y,()=>{g.save();g.translate(c.x,c.y);g.scale(1.5,1.5);g.translate(-c.x,-c.y);g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(c.x,c.y+1,5,2,0,0,TAU);g.fill();g.fillStyle=c.c;g.beginPath();g.ellipse(c.x,c.y-4,5,3.6,0,0,TAU);g.fill();const hx=c.x+Math.cos(c.a)*4,hy=c.y-(peck?3:8);g.beginPath();g.arc(hx,hy,2.2,0,TAU);g.fill();g.fillStyle='#c0301a';g.fillRect(hx-1,hy-3.2,2,1.6);g.fillStyle='#e0a030';g.fillRect(hx+(Math.cos(c.a)>0?1.6:-3),hy-.5,1.6,1.2);g.restore();});}
  // laundry lines between house fronts
  for(const l of F.lines)add(l.y+2,()=>{g.strokeStyle='rgba(60,40,20,.8)';g.lineWidth=.8;g.beginPath();g.moveTo(l.x,l.y-18);g.quadraticCurveTo(l.x+l.w/2,l.y-14,l.x+l.w,l.y-18);g.stroke();
    l.c.forEach((c,i)=>{const x=l.x+8+i*13,sw=Math.sin(t*2+i)*1.5;g.fillStyle=c;g.fillRect(x+sw*.3,l.y-17,9,10+sw);g.strokeStyle='rgba(30,20,10,.5)';g.strokeRect(x+sw*.3,l.y-17,9,10+sw);});});
  // children playing tag round the plaza (stay home in winter evenings)
  if(!(se===3&&day>.75))F.kids.forEach((k,i)=>{const a=t*.9+k.ph,x=k.x+Math.cos(a)*k.r,y=k.y+Math.sin(a*1.3)*k.r*.4;add(y,()=>sprUnit(SPR.vil_k?'vil_k':'villager',x,y,7,a+Math.PI/2,frontierWalkFrame('vil_k',t*3+i)));});
  // cooking smoke at breakfast, noon and supper
  const meal=[.08,.42,.74].some(m=>day>m&&day<m+.1);if(meal)for(const c of F.chim)for(let k=0;k<3;k++){const a=((t*.3+k*.33+c.x*.01)%1);add(c.y-200,()=>{g.fillStyle=`rgba(215,210,200,${.28*(1-a)})`;g.beginPath();g.ellipse(c.x+Math.sin(t+k+c.x)*5,c.y-a*55,4+a*10,3+a*8,0,0,TAU);g.fill();});}
  // seasonal particles: spring petals, autumn leaves
  if(se===0||se===2){if(F.leaf.length<26&&Math.random()<dt*8)F.leaf.push({x:Math.random()*VWW,y:-10,v:20+Math.random()*25,ph:Math.random()*TAU});
    for(const f of F.leaf){f.y+=f.v*dt;f.x+=Math.sin(t*1.5+f.ph)*12*dt;}F.leaf=F.leaf.filter(f=>f.y<VWH+10);}
  return day;}
function vcOverlay(g,s,t,se,day){const F=CVIL.vc?.life;if(!F)return;
  if(F.leaf.length){g.fillStyle=se===0?'rgba(245,190,205,.9)':'rgba(200,110,40,.9)';for(const f of F.leaf){g.save();g.translate(f.x,f.y);g.rotate(t*2+f.ph);g.fillRect(-2.5,-1.5,5,3);g.restore();}}
  // dusk and night: a gentle blue grade and lamps at the doors and stalls
  const dk=day>.82?Math.min(1,(day-.82)/.06):day<.06?1-day/.06:0;if(dk>0){g.fillStyle=`rgba(20,30,70,${.28*dk})`;g.fillRect(0,0,VWW,VWH);
    const lamps=[...F.chim.map(c=>[c.x-8,c.y+52]),...(CVIL.lay.stalls||[]).slice(0,6).map(st=>[st.x,st.y-30]),[900,VWH-40],[VL?.X+110||1670,(VL?.Y||60)+(typeof VL_META!=='undefined'?VL_META.H:300)-60]];
    for(const [x,y] of lamps){const gr=g.createRadialGradient(x,y,0,x,y,26);gr.addColorStop(0,`rgba(255,190,90,${.55*dk})`);gr.addColorStop(1,'rgba(255,150,60,0)');g.fillStyle=gr;g.fillRect(x-26,y-26,52,52);g.fillStyle=`rgba(255,120,50,${.9*dk})`;g.beginPath();g.ellipse(x,y,2.6,3.4,0,0,TAU);g.fill();}}}
// buyers at the stalls (the stalls and their haggle bubbles are the core's)
function vcBuyers(add,s,t){const L=CVIL.lay,n=clamp(2+s.bld.market*3+tierOf(s.prosp),2,10);for(let i=0;i<Math.min(n,6);i++){const st=L.stalls[i];if(!st)continue;const x=st.x+(i%2?-22:22),y=st.y+18;add(y,()=>sprUnit(SPR.vil_w?'vil_w':'villager',x,y,9,-Math.PI/2+(i%2?.4:-.4),Math.floor(t*1.2+i)%3===0?4+(i%2):0));}}
{const old=cvilWorkers8;cvilWorkers8=function(add,s,tier,se,t){const r=old.apply(this,arguments);try{if(typeof vlOn!=='function'||vlOn()){const dt=CVIL._vdt||1/60;vcChains(add,ctx,s,t,dt);CVIL._vday=vcLife(add,ctx,s,t,dt,se);vcBuyers(add,s,t);}}catch(e){console.warn(e);}return r;};}
{const old=cvilArrows;cvilArrows=function(g,dt){const r=old.apply(this,arguments);try{if(MODE==='cvil'&&CVIL.vc&&(typeof vlOn!=='function'||vlOn()))vcOverlay(g,CG.T[CVIL.id],CVIL.t,seasonOf(CG.turn),CVIL._vday||.5);}catch(e){console.warn(e);}return r;};}
