// v0.25 smooth village and campaign motion. Profiled: the village loot/unload scenes spent 13-14 ms a frame
// resampling whole sprite atlases; carriers snapped heading and speed; carts stopped dead; idle porters
// wandered at random; the map camera eased per frame. All motion here is time-based (frame-rate independent).
'use strict';

const MOTION={turn:10,acc:240,cartAcc:90,warmed:{}};
function easeK(rate,dt){return 1-Math.exp(-rate*dt);}
function angLerp(a,b,k){let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*k;}
function smooth01(x){x=clamp(x,0,1);return x*x*(3-2*x);}

// Village: draw from per-row bitmaps scaled to the screen, as battles do (whole-atlas draws re-upload every frame).
function villageDev(){return Math.min((VW-360)/VWW,VH/VWH)*(CVIL.z||1)*DPR;}
{const old=cvil8Frame;cvil8Frame=function(dt){SPR_DEV=villageDev();try{return old(dt);}finally{SPR_DEV=0;}};}

// Build the carrier, cart and cargo rows before the scene moves, so nothing is resampled mid-animation.
function villageWarm(){const dev=villageDev(),key=CVIL.id+'|'+sprQB(dev/2.4)+'|'+GFX.tier;if(MOTION.warmed[key])return 0;MOTION.warmed[key]=1;let n=0;
  const unit=(nm,r)=>{let d=SPR[nm]||SPR[SPR_ALIAS[nm]];if(!d?.img)return;const e=sprScaled(d,(r/d.r)/d.P*dev);for(let i=0;i<e.rows.length;i++){sprRow(e,i);n++;}};
  const prop=(nm,sc,rows)=>{const d=SPR[nm]||SPR[(typeof V8MAP!=='undefined'&&V8MAP[nm]?.[0])||'']||SPR[SPR_ALIAS[nm]];if(!d?.img)return;for(const v of rows){sprPropScaled(d,(sc/d.P)*dev,Math.min(v,d.rows-1));n++;}};
  unit('oxcart',14);for(const s of [...CARRY_SOL,...CARRY_POR])unit(s,9);
  const cargo=[...new Set(Object.values(CARGO_V))];prop('stk8',.3,cargo);if(SPR.stk9)prop('stk9',.3,cargo);prop('animal',.55,[4]);prop('rack8',.32,[0,1,2,3,4,5,6,7,8]);
  return n;}
{const old=sceneStart;sceneStart=function(){const r=old.apply(this,arguments);if(LOGI.cur&&MODE==='cvil')villageWarm();return r;};}
{const old=showCVil;showCVil=function(id){const r=old.apply(this,arguments);if(LOGV[id]&&(LOGV[id].out.length||LOGV[id].in.length))villageWarm();return r;};}

// Carts and carriers: same job model (logvDisp still reads out/in/car), with acceleration, arrival easing,
// smoothed heading, distance-driven gait, a lift when picking up, a short arc into the cart, and porters who
// wait beside their cart instead of wandering while nothing is left to carry.
function moveTo(o,tx,ty,vmax,acc,dt){const dx=tx-o.x,dy=ty-o.y,d=Math.hypot(dx,dy);
  if(d<.6){o.x=tx;o.y=ty;o.v=0;return 0;}
  const vStop=Math.sqrt(2*acc*Math.max(0,d-.5));const want=Math.min(vmax,vStop);o.v=o.v||0;o.v=o.v<want?Math.min(want,o.v+acc*dt):Math.max(want,o.v-acc*1.6*dt);
  const step=Math.min(d,o.v*dt);o.x+=dx/d*step;o.y+=dy/d*step;return step;}
logvStep=function(id,dt){const V=LOGV[id];if(!V)return;logvPrune(V);const lane=503;V.drops=V.drops||[];V._pk=V._pk||[];
  const work=V.out.length+V.in.length+V.car.length;const wantC=work?clamp(Math.ceil(work/6),2,4):0;
  let waiting=0;for(const c of V.carts)if(!c.go)waiting++;
  while(waiting<wantC){const i=V.carts.length;const inb=V.in.length>0&&!V.out.length;V.carts.push({x:VZ.store[0]-160-i*90,px:VZ.store[0]+140+(i%4)*150,y:lane,load:inb?6:0,arr:0,go:0,dir:1,v:0,od:0});waiting++;}
  for(const c of V.carts){c.v=c.v||0;
    if(c.go){c.v=Math.min(60,c.v+MOTION.cartAcc*.6*dt);const s=c.v*dt;c.x+=c.dir*s;c.od=(c.od||0)+s;continue;}
    if(!c.arr){const y0=c.y;const s=moveTo(c,c.px,c.y,120,MOTION.cartAcc,dt);c.y=y0;c.od=(c.od||0)+s;if(Math.abs(c.x-c.px)<.7&&c.v<1){c.x=c.px;c.arr=1;c.v=0;}}}
  let pending=V.drops.length;
  if(!work&&!pending)for(const c of V.carts)if(!c.go&&c.arr){c.go=1;c.v=0;c.dir=c.x<VWW/2?-1:1;}
  for(let i=V.carts.length-1;i>=0;i--){const c=V.carts[i];if(c.x<=-260||c.x>=VWW+260)V.carts.splice(i,1);}
  const parked=V._pk;parked.length=0;for(const c of V.carts)if(c.arr&&!c.go)parked.push(c);
  for(let i=V.drops.length-1;i>=0;i--){const d=V.drops[i];d.t+=dt/.32;if(d.t>=1){if(d.cart)d.cart.load=(d.cart.load||0)+1;V.drops.splice(i,1);}}
  if(!parked.length)return;
  let sol=false;for(const c of V.out)if(c.who==='soldier'){sol=true;break;}const nCar=sol?12:8;
  while(V.car.length<nCar&&(V.out.length||V.in.length)){const i=V.car.length;const cart=parked[i%parked.length];
    const sp=sol?CARRY_SOL[i%CARRY_SOL.length]:CARRY_POR[i%CARRY_POR.length];V.car.push({sp,x:cart.x+((i*37)%40-20),y:lane+((i*13)%12-6),c:null,dir:null,ph:(i*.37)%1,cart,wait:i*.35,v:0,f:Math.PI/2,i});}
  const near=x=>{let b=parked[0];for(const c of parked)if(Math.abs(c.x-x)<Math.abs(b.x-x))b=c;return b;};
  for(const r of V.car){if(r.lift!=null&&r.lift<1)r.lift=Math.min(1,r.lift+dt/.3);
    if(r.wait>0){r.wait-=dt;r.mv=0;r.v=0;continue;}
    if(!r.c){if(V.out.length){r.idle=0;r.job=V.out.shift();r.dir='out';r.tgt=logvSpot(r.job.k);r.cart=near(r.tgt.x);r.phase='fetch';r.hold=null;r.c={k:r.job.k,n:r.job.n,pend:1};}
      else if(V.in.length){r.idle=0;r.job=V.in.shift();r.dir='in';r.c=r.job;r.cart=near(logvSpot(r.job.k).x);r.tgt={x:r.cart.x,y:lane};r.phase='fetch';}
      else if(!r.idle){r.idle=1;r.phase=null;if(parked.indexOf(r.cart)<0)r.cart=parked[0];r.tgt={x:r.cart.x-26+(r.i%4)*17,y:lane+18+(r.i%2)*7};}}
    let tx,ty;if(r.idle||r.phase==='fetch'||!r.c){tx=r.tgt.x;ty=r.tgt.y;}else if(r.dir==='out'){tx=r.cart.x;ty=lane;}else{const p=logvSpot(r.c.k);tx=p.x;ty=p.y;}
    const vmax=r.c&&r.phase==='carry'?72:92;const x0=r.x,y0=r.y;const s=moveTo(r,tx,ty,vmax,MOTION.acc,dt);
    if(s>.05){const a=Math.atan2(r.y-y0,r.x-x0);r.f=angLerp(r.f??a,a,easeK(MOTION.turn,dt));r.ph+=s/30;r.mv=1;}
    else{r.mv=0;if(r.idle){if(r.cart)r.f=angLerp(r.f||0,-Math.PI/2,easeK(4,dt));continue;}
      if(r.phase==='fetch'){r.phase='carry';r.hold=r.c;r.lift=0;r.wait=.35;if(r.dir==='out')r.c.pend=0;}
      else{if(r.dir==='out'){const j=(r.cart.load||0)+V.drops.filter(d=>d.cart===r.cart).length;V.drops.push({k:r.hold.k,x0:r.x,y0:r.y-22,x1:r.cart.x-14-(j%3)*8,y1:r.cart.y+28-Math.floor(Math.min(5,j)/3)*6,t:0,cart:r.cart});}
        else{r.cart.load=Math.max(0,(r.cart.load||0)-1);}r.c=null;r.hold=null;r.phase=null;r.lift=null;r.wait=.25;}}}
  if(!V.out.length&&!V.in.length&&!V.drops.length&&V.car.every(r=>!r.c)){V.car.length=0;}};
logvDraw=function(add,g,t,dt){const id=CVIL.id,V=LOGV[id];if(!V)return;logvStep(id,dt);
  for(const c of V.carts)add(c.y+20,()=>{const moving=c.go||!c.arr;sprUnit('oxcart',c.x,c.y+20,14,c.go?(c.dir>0?0:Math.PI):0,moving?Math.floor((c.od||0)/7)%4:0);const n=Math.min(6,c.load||0);
    for(let j=0;j<n;j++)sprProp('stk',c.x-14-(j%3)*8,c.y+8-Math.floor(j/3)*6,[0,3,5,6,9,0][j%6],.3);});
  for(const r of V.car){if(r.job==null&&!r.idle&&r.wait>0)continue;const fr=r.mv?frontierWalkFrame(r.sp,r.ph):0;add(r.y,()=>{
    if(r.hold&&r.hold.k==='horse'){sprProp('animal',r.x+12*Math.cos((r.f||0)+1.4),r.y+2,4,.55);}
    sprUnit(r.sp,r.x,r.y,9,r.f||0,fr);if(r.hold&&r.hold.k!=='horse'){const l=r.lift==null?1:smooth01(r.lift);carryProp(g,r.hold.k,r.x,lerp(r.y-6,r.y-22,l));}});}
  for(const d of V.drops){if(d.k==='horse')continue;const k=smooth01(d.t),x=lerp(d.x0,d.x1,k),y=lerp(d.y0,d.y1,k)-Math.sin(k*Math.PI)*14;add(y+20,()=>carryProp(g,d.k,x,y));}
  let n=V.out.length+V.in.length;for(const r of V.car)if(r.c)n++;if(n){let out=V.out.length>0;if(!out)for(const r of V.car)if(r.dir==='out'&&r.c){out=true;break;}const lab=out?Tz('装车外运','loading out'):Tz('卸货入库','unloading in');add(9999,()=>txt(''+lab+' · '+n+' '+Tz('件','loads'),(VZ.store[0]+VZ.store[2])/2,VZ.store[3]+122,15,'#2a1406','center','bold '));}};

// Villagers: keep their routes, but turn smoothly rather than snapping between the eight facings.
{const old=walkTo8;walkTo8=function(p,spd,dt){const f0=p.f;const mv=old(p,spd,dt);if(mv&&f0!=null)p.f=angLerp(f0,p.f,easeK(MOTION.turn,dt));return mv;};}

// Campaign camera: the same glide, per second instead of per frame (0.12 a frame at 60 fps).
const CAMT={z:null,x:null,y:null};
{const old=campFrame;campFrame=function(dt){
  if(CC.tz!=null){CAMT.z=CC.tz;CC.tz=null;}if(CC.tx!=null){CAMT.x=CC.tx;CAMT.y=CC.ty;CC.tx=null;CC.ty=null;}
  const k=easeK(7.7,Math.min(dt,.1));
  if(CAMT.z!=null){const z0=CC.z;CC.z=lerp(CC.z,CAMT.z,k);const cx=CC.x+VW/2/z0,cy=CC.y+VH/2/z0;CC.x=cx-VW/2/CC.z;CC.y=cy-VH/2/CC.z;if(Math.abs(CC.z-CAMT.z)<.003){CC.z=CAMT.z;CAMT.z=null;}}
  if(CAMT.x!=null){CC.x=lerp(CC.x,CAMT.x,k);CC.y=lerp(CC.y,CAMT.y,k);if(Math.abs(CC.x-CAMT.x)+Math.abs(CC.y-CAMT.y)<1){CAMT.x=CAMT.y=null;}}
  return old(dt);};}
// A wheel, drag or pinch hands the camera back to the player straight away.
for(const ev of ['pointerdown','wheel','touchstart'])cv.addEventListener(ev,()=>{if(MODE==='camp'){CAMT.z=CAMT.x=CAMT.y=null;}},{capture:true,passive:true});
