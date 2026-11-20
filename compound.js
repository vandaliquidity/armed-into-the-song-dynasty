// v0.26 (t250) Qinghe walled compound: the home village seen as a Song courtyard compound, top-down 3/4 cutaway.
// Art: art/compound.py (Blender, Freestyle ink) -> assets/<tier>/compound_base.webp (empty rooms) + compound_rooms.webp (furnished rooms).
// Each room is tied to a real building: furnished when it is built (or stocked), bare with a "not built" plaque when it is not.
// Workers are the village figures doing work frames at their stations; porters walk the cobbled lane. The classic village view stays one click away.
'use strict';
const CPD={W:1800,H:1120,img:{},tier:null,on:(()=>{try{return localStorage.getItem('sw_compound')!=='0';}catch(e){return true;}})(),wk:null,
  // room rects in village world px (match art/compound.py ROOMS); crop rects add the north wall and a little margin
  R:{granary:[90,70,830,300],treasury:[990,70,1710,300],smithy:[90,310,830,510],kiln:[990,310,1710,510],press:[90,610,830,790],dye:[990,610,1710,790],brewery:[90,800,830,950],tea:[990,800,1710,950]},
  V:'t250a'};
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
  for(const n of ['compound_base','compound_rooms']){const im=new Image();im.decoding='async';im.onload=()=>{CPD.img[n]=im;CPD.cut=null;};im.src=`${ART_BASE}${t}/${n}.webp?v=${CPD.V}`;}}
// slice the furnished-room atlas into one small canvas per room (so each frame draws small bitmaps, not one big atlas)
function cpdCut(){const A=CPD.img.compound_rooms;if(!A||CPD.cut)return CPD.cut;const k=A.width/CPD.ATLAS_W;CPD.cut={};
  for(const [id,r] of Object.entries(CPD.CROP)){const c=document.createElement('canvas');c.width=Math.round(r.w*k);c.height=Math.round(r.h*k);c.getContext('2d').drawImage(A,r.ax*k,r.ay*k,r.w*k,r.h*k,0,0,c.width,c.height);CPD.cut[id]=c;}
  return CPD.cut;}
CPD.ATLAS_W=760;CPD.CROP={};{let y=0;for(const [id,[x0,y0,x1,y1]] of Object.entries(CPD.R)){const r={x:x0-8,y:y0-12,w:x1-x0+16,h:y1-y0+20,ax:0,ay:y};CPD.CROP[id]=r;y+=r.h;}CPD.ATLAS_H=y;}
// worker stations per room: [x,y,sprite,face(rad),mode] mode w=work frames, p=pace between two points
const CPD_WK={granary:[[200,150,'vil_b',1.6,'w'],[420,220,'vil_w',0,'w'],[640,170,'porter',0,'p',[300,250]]],treasury:[[1180,190,'vil_e',1.6,'w'],[1600,200,'vil_b',3.1,'w']],
  smithy:[[250,420,'vil_b',0,'w'],[370,460,'vil_b',3.1,'w'],[640,440,'vil_k',1.6,'w']],kiln:[[1180,470,'vil_b',-1.6,'w'],[1500,420,'vil_w',1.6,'w'],[1600,450,'porter',3.1,'p',[1250,470]]],
  press:[[300,720,'vil_b',3.1,'w'],[560,720,'vil_b',0,'w'],[700,690,'vil_w',1.6,'w']],dye:[[1110,730,'vil_w',-1.6,'w'],[1330,720,'vil_w',1.6,'w'],[1600,720,'vil_e',3.1,'w']],
  brewery:[[460,900,'vil_b',1.6,'w'],[640,920,'vil_w',3.1,'w']],tea:[[1150,910,'vil_e',-1.6,'w'],[1330,910,'vil_w',-1.6,'w'],[1600,900,'vil_k',1.6,'w']]};
function cpdUse(){return CPD.on&&MODE==='cvil'&&CVIL.id===HOME&&!EDICT&&!(typeof LOGI!=='undefined'&&LOGI.cur);}
function cpdFrame(dt){cpdLoad();const base=CPD.img.compound_base;if(!base)return false;const s=CG.T[CVIL.id],g=ctx,t=CVIL.t+=dt,se=seasonOf(CG.turn);CVIL.hot=[];
  const side=(typeof mobNarrow==='function'&&mobNarrow())?0:360,aw=VW-side,z=CVIL.z||1,sc=Math.min(aw/VWW,VH/VWH)*z;CVIL._sc=sc;if(z<=1.001){CVIL.fx=VWW/2;CVIL.fy=VWH/2;}const hw=aw/2/sc,hh=VH/2/sc;
  CVIL.fx=clamp(CVIL.fx,Math.min(hw,VWW/2),Math.max(VWW-hw,VWW/2));CVIL.fy=clamp(CVIL.fy,Math.min(hh,VWH/2),Math.max(VWH-hh,VWH/2));const ox=aw/2-CVIL.fx*sc,oy=VH/2-CVIL.fy*sc;CVIL._ox=ox;CVIL._oy=oy;
  g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='#1a1008';g.fillRect(0,0,VW,VH);g.save();g.beginPath();g.rect(0,0,aw,VH);g.clip();g.translate(ox,oy);g.scale(sc,sc);
  g.imageSmoothingQuality='high';g.drawImage(base,0,0,VWW,VWH);const cut=cpdCut(),rooms=cpdRooms(s);
  for(const [id,r] of Object.entries(CPD.CROP)){const R=rooms[id],[x0,y0,x1,y1]=CPD.R[id];if(R.on&&cut?.[id])g.drawImage(cut[id],r.x,r.y,r.w,r.h);
    const nm=CPD.NAME[id];CVIL.hot.push({r:[x0,y0,x1,y1],t:`${Ts(...nm)}\n${R.line}${R.on?'':'\n'+Ts('点击前往营建','Click to build it')}`});
    // name plaque on the north wall
    const px=x0+16,py=y0+6;g.font='bold 13px "Noto Serif SC",serif';const label=Tz(...nm),w=g.measureText(label).width+14;g.fillStyle=R.on?'rgba(70,28,14,.88)':'rgba(40,34,30,.82)';g.fillRect(px,py,w,20);
    g.strokeStyle=R.on?'#d9a54a':'#8a8070';g.lineWidth=1.2;g.strokeRect(px,py,w,20);g.fillStyle=R.on?'#ffe7a0':'#cfc6b4';g.textAlign='left';g.fillText(label,px+7,py+15);
    if(!R.on){g.fillStyle='rgba(30,22,14,.72)';const cx=(x0+x1)/2,cy=(y0+y1)/2+10;g.fillRect(cx-70,cy-14,140,28);g.fillStyle='#f0e2c4';g.textAlign='center';g.font='12px "Noto Serif SC",serif';g.fillText(Tz('待营建 · 未建成','Not built yet'),cx,cy+5);}}
  // workers: built rooms get their crew; more of them as prosperity grows
  const Z=[],tier=tierOf(s.prosp),crew=Math.min(3,1+Math.floor(tier/2));
  for(const [id,list] of Object.entries(CPD_WK)){if(!rooms[id].on)continue;list.slice(0,crew).forEach((w,i)=>{const [x,y,sp,f,mode,to]=w,ph=i*1.7+id.length;let X=x,Y=y,F=f,fr;
      if(mode==='p'&&to){const per=9,k=((t+ph)%per)/per,u=k<.5?k*2:2-k*2,e=u*u*(3-2*u);X=x+(to[0]-x)*e;Y=y+(to[1]-y)*e;F=Math.atan2(to[1]-y,to[0]-x)+(k<.5?0:Math.PI);const still=Math.abs(.5-k)>.46;fr=still?0:frontierWalkFrame(sp,t*2.2+ph);}
      else fr=4+(Math.floor(t*1.4+ph)%2);
      Z.push({y:Y,fn:()=>sprUnit(SPR[sp]?sp:'villager',X,Y,sp==='vil_k'?15:20,F,fr)});});}
  // porters on the lane carry goods between the gate and the stores
  const nP=clamp(1+Math.floor((s.pop||0)/600),1,4);for(let i=0;i<nP;i++){const per=16+i*3,k=((t+i*5)%per)/per,u=k<.5?k*2:2-k*2,y=1040-u*900,x=890+(i%2?24:-24);Z.push({y,fn:()=>sprUnit(SPR.porter?'porter':'villager',x,y,20,k<.5?-Math.PI/2:Math.PI/2,frontierWalkFrame('porter',t*2.4+i))});}
  // water channel glints and smoke from the hot rooms
  g.fillStyle='rgba(220,245,255,.5)';for(let i=0;i<6;i++){const y=60+((t*40+i*83)%460);g.fillRect(964,y,8,2);}
  for(const [id,x,y] of [['smithy',176,350],['kiln',1100,330],['kiln',1300,330],['brewery',780,840],['tea',1630,830]]){if(!rooms[id].on)continue;for(let k=0;k<4;k++){const a=((t*.35+k*.25)%1);g.fillStyle=`rgba(225,220,210,${.22*(1-a)})`;g.beginPath();g.ellipse(x+Math.sin(t+k)*6,y-a*70,6+a*14,5+a*10,0,0,TAU);g.fill();}}
  Z.sort((a,b)=>a.y-b.y);for(const zz of Z)zz.fn();
  if(se===3){g.fillStyle='rgba(230,235,245,.22)';g.fillRect(0,0,VWW,VWH);}else if(se===2){g.fillStyle='rgba(190,150,70,.08)';g.fillRect(0,0,VWW,VWH);}
  g.restore();
  const nm=Tz('清河本寨','Qinghe compound');g.fillStyle='rgba(30,16,8,.85)';g.fillRect(16,14,420,64);g.strokeStyle='#b8862e';g.lineWidth=2;g.strokeRect(16,14,420,64);txt(nm,30,44,26,'#ffe7a0','left','bold ');
  txt(`${Ts(CL.tiers[tier][0],CL.tiers[tier][1])} · 👥${s.pop} · ⚔${garrison(CVIL.id)} · ${dateTxt(CG.turn)}`,30,68,13,'#e8d8b0','left');
  if(side===0){const v=VW;VW=v+360;try{cvilTip(g);}finally{VW=v;}}else cvilTip(g);return true;}
{const old=cvil8Frame;cvil8Frame=function(dt){if(cpdUse()){try{if(cpdFrame(dt))return;}catch(e){console.warn(e);CPD.on=false;}}return old.apply(this,arguments);};}
// click an unbuilt room to go and build it
addEventListener('pointerdown',e=>{if(!cpdUse()||!CVIL._sc||(e.clientX>VW-360&&!(typeof mobNarrow==='function'&&mobNarrow()))||e.button!==0)return;if(e.target?.closest?.('.panel,.btn'))return;const wx=(e.clientX-CVIL._ox)/CVIL._sc,wy=(e.clientY-CVIL._oy)/CVIL._sc;
  for(const [id,[x0,y0,x1,y1]] of Object.entries(CPD.R)){if(wx<x0||wx>x1||wy<y0||wy>y1)continue;const R=cpdRooms(CG.T[HOME])[id];if(R.on)return;
    if(id==='smithy'||id==='dye')dynastyUI(HOME,'production');else if(id==='granary'||id==='treasury')settleUI(HOME,'store');else dynastyUI(HOME,'business');return;}},true);
// the toggle in the village panel
{const old=cvilUI;cvilUI=function(){const r=old.apply(this,arguments);try{if(CVIL.id===HOME){const p=[...document.querySelectorAll('.panel')].find(x=>x.querySelector('#cvCompound')||x.textContent.includes('Back to the map'));
  if(p&&!$('cpdToggle')){const b=btn(CPD.on?'🏘 村景':'🏯 院落',CPD.on?'🏘 Village view':'🏯 Compound view',()=>{CPD.on=!CPD.on;try{localStorage.setItem('sw_compound',CPD.on?'1':'0');}catch(e){}cvilUI();});
    b.id='cpdToggle';b.style.cssText='display:block;margin-top:6px';p.insertBefore(b,p.children[2]||null);}}}catch(e){}return r;};}
