// v0.30 (t251) Qinghe walled compound: the home village as a Song courtyard compound, low 3/4 view so wall faces show.
// Art: art/compound3.py (Blender, painted materials, AO, Freestyle ink) -> assets/<tier>/compound3_base.webp (empty rooms) + compound3_rooms.webp (furnished rooms);
// art/workers.py -> compound_workers.webp: 9 prop-tied work loops (hammer, stir, lift cloth, weave/throw, push beam, stack sacks, pour tea, tend fire, count) x 4 facings x 6 frames.
// Eight near-square courtyards in a 2x4 grid off a central lane; each is tied to a real building (furnished + crewed when built, bare with a plaque when not).
// Workers stand at their props (anvil, vats, loom, press lever, kiln mouth, counting table...) and loop the matching action; porters carry goods room to room.
'use strict';
const CPD_META={"W":1240,"H":1820,"rooms":{"granary":[60,60,530,460],"treasury":[710,60,1180,460],"smithy":[60,470,530,870],"kiln":[710,470,1180,870],"press":[60,990,530,1375],"dye":[710,990,1180,1375],"brewery":[60,1385,530,1760],"tea":[710,1385,1180,1760]},"crop":{"granary":[52,30,486,438,0],"treasury":[702,30,486,438,438],"smithy":[52,440,486,438,876],"kiln":[702,440,486,438,1314],"press":[52,960,486,423,1752],"dye":[702,960,486,423,2175],"brewery":[52,1355,486,413,2598],"tea":[702,1355,486,413,3011]},"stations":[[351,220,"stack",3],[436,228,"stack",3],[248,292,"stack",2],[945,332,"count",3],[875,274,"count",0],[851,188,"stack",3],[261,654,"hammer",0],[355,714,"hammer",0],[154,670,"tend",3],[1001,750,"weave",0],[860,684,"tend",3],[1001,650,"stack",0],[192,1221,"push",3],[389,1221,"push",3],[356,1267,"pour",1],[776,1252,"stir",3],[964,1252,"lift",3],[1124,1203,"weave",3],[398,1618,"stir",3],[445,1728,"tend",3],[201,1618,"stack",3],[828,1510,"pour",1],[880,1591,"pour",2],[1044,1572,"pour",2],[1110,1546,"stir",3]],"wk":{"acts":["hammer","stir","lift","weave","push","stack","pour","tend","count"],"nf":6,"w":151.1,"h":151.1,"ax":75.6,"ay":114.0},"atlasW":486};
const CPD={W:CPD_META.W,H:CPD_META.H,img:{},tier:null,on:(()=>{try{return localStorage.getItem('sw_cpd3')==='1';}catch(e){return false;}})(),
  R:CPD_META.rooms,V:'t251a'};
CPD.NAME={granary:['粮仓','Granary'],treasury:['大宋官库','Treasury'],smithy:['铁匠铺','Smithy'],kiln:['炭窑与陶作','Charcoal kiln & pottery'],press:['香膏油坊','Oil press & beauty workshop'],
  dye:['织染坊','Loom & dye house'],brewery:['酒坊','Brewery'],tea:['清河酒楼','Tea house & restaurant']};
function cpdBiz(s,k){return s?.businesses?.[k]?.level||0;}
// what makes each room "built"; also a short status line for the tooltip
function cpdRooms(s){const st=s.st||{},bl=s.bld||{},cb=CAMP?.bld||{};return {
  granary:{on:(st.grain||0)>=150||cb.granary>0,line:`${Ts('存粮','Grain')} ${Math.floor(st.grain||0)}`},
  treasury:{on:(CAMP?.res?.silver||0)>=100,line:`${Ts('银','Silver')} ${Math.floor(CAMP?.res?.silver||0)} · ${Ts('金','Gold')} ${Math.floor(st.gold||0)}`},
  smithy:{on:cb.forge>0||bl.smithy>0||bl.armour>0,line:cb.forge>0?`${Ts('铁匠铺','Forge')} ${'★'.repeat(cb.forge)}`:Ts('未建铁匠铺（清河本寨营建）','Forge not built (Qinghe compound upgrades)')},
  kiln:{on:cpdBiz(s,'kiln')>0,line:cpdBiz(s,'kiln')?`${Ts('炭窑','Charcoal kiln')} Lv ${cpdBiz(s,'kiln')}`:Ts('未建炭窑（商号）','Charcoal kiln not built (Businesses)')},
  press:{on:cpdBiz(s,'beauty')>0,line:cpdBiz(s,'beauty')?`${Ts('香皂香膏作','Beauty workshop')} Lv ${cpdBiz(s,'beauty')}`:Ts('未建香膏作（商号）','Beauty workshop not built (Businesses)')},
  dye:{on:cb.workshop>0||(st.silk||0)>0||(st.cloth||0)>0,line:`${Ts('丝绸','Silk')} ${Math.floor(st.silk||0)}${cb.workshop?` · ${Ts('工坊','Workshop')} ${'★'.repeat(cb.workshop)}`:''}`},
  brewery:{on:cpdBiz(s,'brewery')>0,line:cpdBiz(s,'brewery')?`${Ts('酒坊','Brewery')} Lv ${cpdBiz(s,'brewery')} · ${Ts('酒','Wine')} ${Math.floor(st.wine||0)}`:Ts('未建酒坊（商号）','Brewery not built (Businesses)')},
  tea:{on:cpdBiz(s,'restaurant')>0,line:cpdBiz(s,'restaurant')?`${Ts('清河酒楼','Restaurant')} Lv ${cpdBiz(s,'restaurant')}`:Ts('未建酒楼（商号）','Restaurant not built (Businesses)')}};}
function cpdLoad(){const t=GFX.tier||'md';if(CPD.tier===t)return;CPD.tier=t;CPD.img={};CPD.cut=null;
  for(const n of ['compound3_base','compound3_rooms','compound_workers']){const im=new Image();im.decoding='async';im.onload=()=>{CPD.img[n]=im;CPD.cut=null;};im.src=`${ART_BASE}${t}/${n}.webp?v=${CPD.V}`;}}
CPD.CROP={};for(const [id,[x,y,w,h,ay]] of Object.entries(CPD_META.crop))CPD.CROP[id]={x,y,w,h,ax:0,ay};CPD.ATLAS_W=CPD_META.atlasW;
// slice the furnished-room atlas into one small canvas per room (so each frame draws small bitmaps, not one big atlas)
function cpdCut(){const A=CPD.img.compound3_rooms;if(!A||CPD.cut)return CPD.cut;const k=A.width/CPD.ATLAS_W;CPD.cut={};
  for(const [id,r] of Object.entries(CPD.CROP)){const c=document.createElement('canvas');c.width=Math.round(r.w*k);c.height=Math.round(r.h*k);c.getContext('2d').drawImage(A,r.ax*k,r.ay*k,r.w*k,r.h*k,0,0,c.width,c.height);CPD.cut[id]=c;}
  return CPD.cut;}
// stations from the art layout: [x,y,action,facing 0E 1S 2W 3N], grouped by room
const CPD_WK={};for(const st of CPD_META.stations){const id=Object.keys(CPD.R).find(k=>{const [x0,y0,x1,y1]=CPD.R[k];return st[0]>=x0-30&&st[0]<=x1+30&&st[1]>=y0&&st[1]<=y1+30;});(CPD_WK[id]=CPD_WK[id]||[]).push(st);}
const CPD_RATE={hammer:7,stir:5,lift:4,weave:6,push:4,stack:4.5,pour:4,tend:5,count:5};
function cpdWorker(g,x,y,act,dir,t,ph){const A=CPD.img.compound_workers,M=CPD_META.wk;if(!A)return;const row=M.acts.indexOf(act)*4+dir,cw=A.width/M.nf,ch=A.height/(M.acts.length*4),f=Math.floor(t*(CPD_RATE[act]||5)+ph)%M.nf;
  g.drawImage(A,f*cw,row*ch,cw,ch,x-M.ax,y-M.ay,M.w,M.h);}
// porter routes: pick up at one room's door, carry along the lane, drop at another's (only between built rooms; 'gate' is always open)
const CPD_ROUTES=[['gate','granary','#c9a24a'],['granary','brewery','#c9a24a'],['kiln','smithy','#2a2420'],['dye','treasury','#3a5a9a'],['press','tea','#d9b04a'],['gate','kiln','#8a6a3a']];
function cpdDoor(id){if(id==='gate')return [620,1780,620,1780];const [x0,y0,x1,y1]=CPD.R[id],L=x1<620,y=(y0+y1)/2;return [L?x1-24:x0+24,y,L?585:655,y];}
function cpdPorter(t,i,rooms){const live=CPD_ROUTES.filter(([a,b])=>(a==='gate'||rooms[a]?.on)&&rooms[b]?.on);if(!live.length)return null;const [a,b,col]=live[i%live.length],per=26,k=((t+i*7.3)%per)/per;
  const A=cpdDoor(a),B=cpdDoor(b),P=[[A[0],A[1]],[A[2],A[3]],[B[2],B[3]],[B[0],B[1]]],seg=(p,q)=>Math.hypot(q[0]-p[0],q[1]-p[1]);
  // timeline: 6% pick up, 44% carry A->B, 6% drop, 44% walk back empty
  let path=P,carry=true,u,act=0;if(k<.06){act=1;u=0;}else if(k<.5)u=(k-.06)/.44;else if(k<.56){act=1;u=1;}else{u=(k-.56)/.44;path=[...P].reverse();carry=false;}
  const Ls=[seg(path[0],path[1]),seg(path[1],path[2]),seg(path[2],path[3])],tot=Ls[0]+Ls[1]+Ls[2];let d=u*tot,j=0;while(j<2&&d>Ls[j]){d-=Ls[j];j++;}const p=path[j],q=path[j+1],e=Ls[j]?d/Ls[j]:0;
  return {x:p[0]+(q[0]-p[0])*e,y:p[1]+(q[1]-p[1])*e,f:Math.atan2(q[1]-p[1],q[0]-p[0]),act,carry,col,i};}
function cpdUse(){return CPD.on&&MODE==='cvil'&&CVIL.id===HOME&&!EDICT&&!(typeof LOGI!=='undefined'&&LOGI.cur);}
function cpdView(){const side=(typeof mobNarrow==='function'&&mobNarrow())?0:360,aw=VW-side,z=CVIL.z||1,sc=Math.min(aw/CPD.W,1.15)*z;return {side,aw,sc};}
function cpdFrame(dt){cpdLoad();const base=CPD.img.compound3_base;if(!base)return false;const s=CG.T[CVIL.id],g=ctx,t=CVIL.t+=dt,se=seasonOf(CG.turn);CVIL.hot=[];
  const {side,aw,sc}=cpdView();CVIL._sc=sc;if(!CVIL._cpd){CVIL._cpd=1;CVIL.fx=CPD.W/2;CVIL.fy=CPD.H*.27;}const hw=aw/2/sc,hh=VH/2/sc;
  CVIL.fx=clamp(CVIL.fx,Math.min(hw,CPD.W/2),Math.max(CPD.W-hw,CPD.W/2));CVIL.fy=clamp(CVIL.fy,Math.min(hh,CPD.H/2),Math.max(CPD.H-hh,CPD.H/2));const ox=aw/2-CVIL.fx*sc,oy=VH/2-CVIL.fy*sc;CVIL._ox=ox;CVIL._oy=oy;
  g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='#2c3a1c';g.fillRect(0,0,VW,VH);g.save();g.beginPath();g.rect(0,0,aw,VH);g.clip();g.translate(ox,oy);g.scale(sc,sc);
  g.imageSmoothingQuality='high';g.drawImage(base,0,0,CPD.W,CPD.H);const cut=cpdCut(),rooms=cpdRooms(s);
  for(const [id,r] of Object.entries(CPD.CROP)){const R=rooms[id];if(R.on&&cut?.[id])g.drawImage(cut[id],r.x,r.y,r.w,r.h);}
  // crews at their props: prosperity adds hands (2 at first, all stations later); porters run the routes
  const Z=[],tier=tierOf(s.prosp),crew=Math.min(4,2+Math.floor(tier/2));
  for(const [id,list] of Object.entries(CPD_WK)){if(!rooms[id]?.on)continue;list.slice(0,crew).forEach((w,i)=>{const [x,y,act,dir]=w,ph=i*2.3+id.length;Z.push({y,fn:()=>cpdWorker(g,x,y,act,dir,t,ph)});});}
  const nP=clamp(2+Math.floor((s.pop||0)/500),2,5);for(let i=0;i<nP;i++){const p=cpdPorter(t,i,rooms);if(!p)break;
    Z.push({y:p.y,fn:()=>{const fr=p.act?4+(Math.floor(t*3)%2):frontierWalkFrame('porter',t*2.4+i);sprUnit(SPR.porter?'porter':'villager',p.x,p.y,22,p.f,fr);
      if(p.carry){g.fillStyle=p.col;g.strokeStyle='rgba(30,18,8,.8)';g.lineWidth=1.2;g.beginPath();g.ellipse(p.x,p.y-30,9,6,0,0,TAU);g.fill();g.stroke();}}});}
  // water channel glints, pool ripples, smoke from the hot rooms
  g.fillStyle='rgba(220,245,255,.55)';for(let i=0;i<7;i++){const y=70+((t*40+i*113)%790);g.fillRect(694,y,8,2);}
  for(const [px,py] of [[230,903],[1010,903]])for(let k=0;k<2;k++){const a=((t*.4+k*.5)%1);g.strokeStyle=`rgba(235,250,255,${.45*(1-a)})`;g.lineWidth=1;g.beginPath();g.ellipse(px+(k?40:-40),py,4+a*22,2+a*8,0,0,TAU);g.stroke();}
  for(const [id,u,v] of [['smithy',.17,.0],['kiln',.32,.12],['brewery',.82,.6],['tea',.85,.1]]){if(!rooms[id].on)continue;const [x0,y0,x1,y1]=CPD.R[id],x=x0+u*(x1-x0),y=y0+v*(y1-y0);for(let k=0;k<4;k++){const a=((t*.35+k*.25)%1);g.fillStyle=`rgba(225,220,210,${.22*(1-a)})`;g.beginPath();g.ellipse(x+Math.sin(t+k)*6,y-a*80,7+a*15,6+a*11,0,0,TAU);g.fill();}}
  Z.sort((a,b)=>a.y-b.y);for(const zz of Z)zz.fn();
  // plaques and hover notes on top
  for(const [id,[x0,y0,x1,y1]] of Object.entries(CPD.R)){const R=rooms[id],nm=CPD.NAME[id];CVIL.hot.push({r:[x0,y0,x1,y1],t:`${Ts(...nm)}\n${R.line}${R.on?'':'\n'+Ts('点击前往营建','Click to build it')}`});
    const px=x0+16,py=y0+18;g.font='bold 13px "Noto Serif SC",serif';const label=Tz(...nm),w=g.measureText(label).width+14;g.fillStyle=R.on?'rgba(70,28,14,.88)':'rgba(40,34,30,.82)';g.fillRect(px,py,w,20);
    g.strokeStyle=R.on?'#d9a54a':'#8a8070';g.lineWidth=1.2;g.strokeRect(px,py,w,20);g.fillStyle=R.on?'#ffe7a0':'#cfc6b4';g.textAlign='left';g.fillText(label,px+7,py+15);
    if(!R.on){g.fillStyle='rgba(30,22,14,.72)';const cx=(x0+x1)/2,cy=(y0+y1)/2+10;g.fillRect(cx-70,cy-14,140,28);g.fillStyle='#f0e2c4';g.textAlign='center';g.font='12px "Noto Serif SC",serif';g.fillText(Tz('待营建 · 未建成','Not built yet'),cx,cy+5);}}
  if(se===3){g.fillStyle='rgba(230,235,245,.22)';g.fillRect(0,0,CPD.W,CPD.H);}else if(se===2){g.fillStyle='rgba(190,150,70,.08)';g.fillRect(0,0,CPD.W,CPD.H);}
  g.restore();
  const nm=Tz('清河本寨','Qinghe compound');g.fillStyle='rgba(30,16,8,.85)';g.fillRect(16,14,420,64);g.strokeStyle='#b8862e';g.lineWidth=2;g.strokeRect(16,14,420,64);txt(nm,30,44,26,'#ffe7a0','left','bold ');
  txt(`${Ts(CL.tiers[tier][0],CL.tiers[tier][1])} · 👥${s.pop} · ⚔${garrison(CVIL.id)} · ${dateTxt(CG.turn)}`,30,68,13,'#e8d8b0','left');
  if(side===0){const v=VW;VW=v+360;try{cvilTip(g);}finally{VW=v;}}else cvilTip(g);return true;}
{const old=showCVil;showCVil=function(){CVIL._cpd=0;return old.apply(this,arguments);};}
{const old=cvil8Frame;cvil8Frame=function(dt){if(cpdUse()){try{if(cpdFrame(dt))return;}catch(e){console.warn(e);CPD.on=false;}}return old.apply(this,arguments);};}
// click an unbuilt room to go and build it
addEventListener('pointerdown',e=>{if(!cpdUse()||!CVIL._sc||(e.clientX>VW-360&&!(typeof mobNarrow==='function'&&mobNarrow()))||e.button!==0)return;if(e.target?.closest?.('.panel,.btn'))return;const wx=(e.clientX-CVIL._ox)/CVIL._sc,wy=(e.clientY-CVIL._oy)/CVIL._sc;
  for(const [id,[x0,y0,x1,y1]] of Object.entries(CPD.R)){if(wx<x0||wx>x1||wy<y0||wy>y1)continue;const R=cpdRooms(CG.T[HOME])[id];if(R.on)return;
    if(id==='smithy'||id==='dye')dynastyUI(HOME,'production');else if(id==='granary'||id==='treasury')settleUI(HOME,'store');else dynastyUI(HOME,'business');return;}},true);
// the toggle in the village panel
{const old=cvilUI;cvilUI=function(){const r=old.apply(this,arguments);try{if(CVIL.id===HOME){const p=[...document.querySelectorAll('.panel')].find(x=>x.querySelector('#cvCompound')||x.textContent.includes('Back to the map'));
  if(p&&!$('cpdToggle')){const b=btn(CPD.on?'🏘 村景':'🏯 院落',CPD.on?'🏘 Village view':'🏯 Compound view',()=>{CPD.on=!CPD.on;try{localStorage.setItem('sw_cpd3',CPD.on?'1':'0');}catch(e){}cvilUI();});
    b.id='cpdToggle';b.style.cssText='display:block;margin-top:6px';p.insertBefore(b,p.children[2]||null);}}}catch(e){}return r;};}
