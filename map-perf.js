/* v0.44 campaign-map layer cache. The map frame was raster-bound, not script-bound: about ten full-screen layers
   (parchment tiles, terrain wash, mountains, region calligraphy, rivers, fields, roads, 121 settlements with labels,
   frame) were composited every frame although almost none of them change. Profiles on a 4x-throttled phone showed
   ~4% of frame time in JavaScript and the rest in raster.
   Now the core frame is split in two:
     static layer - everything from the parchment up to the settlements, march arrows, strategic layers and the scroll
                    frame - is painted into an offscreen canvas only when the view changes (camera, selection, hover,
                    layer, language, a new turn or any campUI refresh) and otherwise refreshed slowly for the ambient
                    river flow, boats and birds (every 250 ms, or 6x its own cost on slow devices);
     live layer   - armies, caravans, raids, fog drift, the season tint and particles and the hover card - is drawn on
                    top every frame.
   (A half-resolution static layer while panning was tried and measured slower on a throttled phone - the resize and
   upscale cost more than they saved - so the layer is always full resolution.) Nothing the player can see is culled. ?mp=0 (localStorage sw_mp=0)
   turns the cache off. */
'use strict';
const MP={slow:0,on:null,S:null,sx:null,k:1,key:'',last:0,cost:16,ver:0,frames:0,builds:0,lo:0};
function mpFlag(){if(MP.on!==null)return MP.on;try{const q=new URLSearchParams(location.search).get('mp');MP.on=q!==null?q!=='0':localStorage.getItem('sw_mp')!=='0';}catch(e){MP.on=true;}return MP.on;}
// a context proxy: the core paints through the page's own ctx, so for the static pass its methods and properties are
// pointed at the offscreen canvas (or a 1x1 scratch canvas when the cached layer is still valid)
const MPX=(()=>{const P=CanvasRenderingContext2D.prototype,D={};let T=null,K=1;
  for(const n of Object.getOwnPropertyNames(P)){if(n==='constructor'||n==='canvas')continue;const d=Object.getOwnPropertyDescriptor(P,n);
    if(typeof d.value==='function'){let f;if(n==='setTransform')f=function(a,b,c,e,x,y){if(a&&typeof a==='object'){const m=a;return T.setTransform(m.a*K,m.b*K,m.c*K,m.d*K,m.e*K,m.f*K);}return T.setTransform(a*K,b*K,c*K,e*K,x*K,y*K);};
      else if(n==='resetTransform')f=function(){return T.setTransform(K,0,0,K,0,0);};else f=function(){return T[n].apply(T,arguments);};D[n]={value:f,configurable:true,writable:true};}
    else if(d.get)D[n]={configurable:true,get(){return T[n];},set(v){T[n]=v;}};}
  const names=Object.keys(D);
  return {on(t,k){T=t;K=k;Object.defineProperties(ctx,D);},off(){for(const n of names)delete ctx[n];T=null;}};})();
const MP_DYN=['drawRaids','drawArmy','drawCaravans','drawFog','seasonFx','drawHover'];
function mpKey(){let a='';for(const x of CG.armies)a+=x.id+':'+x.loc+'>'+(x.dest||'')+(x.liv?x.liv.c+x.liv.ch:'')+';';
  return [Math.round(CC.x*10),Math.round(CC.y*10),Math.round(CC.z*1e4),VW,VH,DPR,cv.width,cv.height,JSON.stringify(CSEL||0),JSON.stringify(CHOV||0),CG.layer||'',document.body.className,MP.ver,
    CG.turn,CG.month,CG.phase,SEEN.size,(window.__mt&&__mt.MT.img)?1:0,a].join('|');}
{const old=campUI;campUI=function(){MP.ver++;return old.apply(this,arguments);};}
{const old=campRefresh;campRefresh=function(){MP.ver++;return old.apply(this,arguments);};}
// v0.44 pan margin: while the camera is being panned the static layer is painted M px (30% of the short screen side)
// wider than the screen on every side, with the camera shifted to match. A pan at the same zoom then only slides the
// cached layer; it is repainted when the slide nears the margin, the zoom changes or anything else in the view key
// changes. Ambient refreshes (river flow, boats, birds) wait until the pan stops and are screen-sized. The scroll frame (screen-fixed) moved
// to the live layer.
const MP_KEYCUT=3;   // mpKey parts 0..2 are camera x, y, zoom
{const old=campFrame;campFrame=function(dt){if(!mpFlag()||!CG||MODE!=='camp')return old(dt);
  MP.frames++;const now=performance.now(),W=cv.width,H=cv.height;
  const glide=(typeof CAMT!=='undefined'&&(CAMT.z!=null||CAMT.x!=null))||CC.tz!=null||CC.tx!=null;
  const key=mpKey(),kp=key.split('|'),rest=kp.slice(MP_KEYCUT).join('|'),z=CC.z;
  const M=MP.M=Math.round(Math.min(VW,VH)*.3),dx=(MP.ox!=null?(MP.ox-CC.x)*z:0),dy=(MP.oy!=null?(MP.oy-CC.y)*z:0);
  if(CC.x!==MP.px||CC.y!==MP.py){MP.lastMove=now;MP.px=CC.x;MP.py=CC.y;}const panning=now-(MP.lastMove||-1e9)<400;
  const lim=(MP.mw||0)*.85,slid=Math.abs(dx)>lim+.01||Math.abs(dy)>lim+.01,moved=kp[2]!==MP.kz;
  const stale=!MP.S||glide||moved||slid||rest!==MP.rest||(!panning&&now-MP.last>Math.max(250,MP.cost*6));
  if(!MP.S){MP.S=document.createElement('canvas');MP.sx=MP.S.getContext('2d');MP.T=document.createElement('canvas');MP.T.width=MP.T.height=1;MP.tx=MP.T.getContext('2d');}
  const mw=(glide||!panning)?0:M,w=Math.max(1,Math.round(W+2*mw*DPR)),h=Math.max(1,Math.round(H+2*mw*DPR));
  if(stale&&(MP.S.width!==w||MP.S.height!==h)){MP.S.width=w;MP.S.height=h;}
  const saved={};for(const n of MP_DYN)saved[n]=window[n];const sf=drawFrame;
  const noop=function(){};drawRaids=noop;drawArmy=noop;drawCaravans=noop;drawFog=noop;seasonFx=noop;drawHover=noop;drawFrame=noop;
  const t0=performance.now();let r;const x0=CC.x,y0=CC.y,VW0=VW,VH0=VH;
  if(stale&&mw){CC.x=x0-mw/z;CC.y=y0-mw/z;VW=VW0+2*mw;VH=VH0+2*mw;}
  MPX.on(stale?MP.sx:MP.tx,1);
  try{r=old(dt);}finally{MPX.off();
    if(stale&&mw){MP.ox=CC.x+mw/z;MP.oy=CC.y+mw/z;MP.mw=mw;CC.x=x0;CC.y=y0;VW=VW0;VH=VH0;}else if(stale){MP.ox=CC.x;MP.oy=CC.y;MP.mw=0;}
    drawRaids=saved.drawRaids;drawArmy=saved.drawArmy;drawCaravans=saved.drawCaravans;drawFog=saved.drawFog;seasonFx=saved.seasonFx;drawHover=saved.drawHover;drawFrame=sf;}
  if(stale){MP.cost=MP.cost*.6+(performance.now()-t0)*.4;MP.key=mpKey();MP.rest=MP.key.split('|').slice(MP_KEYCUT).join('|');MP.kz=MP.key.split('|')[2];MP.last=now;MP.builds++;}
  // live layer: the cached static layer slid to the current camera, then everything that moves
  const g=ctx,ox=(MP.ox-CC.x)*CC.z*DPR-MP.mw*DPR,oy=(MP.oy-CC.y)*CC.z*DPR-MP.mw*DPR;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.imageSmoothingEnabled=true;
  const sx=Math.round(-ox),sy=Math.round(-oy);
  if(sx>=0&&sy>=0&&sx+W<=MP.S.width&&sy+H<=MP.S.height)g.drawImage(MP.S,sx,sy,W,H,0,0,W,H);   // copy only the visible window
  else{g.fillStyle='#2a1a10';g.fillRect(0,0,W,H);g.drawImage(MP.S,-sx,-sy);}
  g.setTransform(DPR,0,0,DPR,0,0);
  try{drawRaids(g);for(const a of CG.armies)drawArmy(g,a);drawCaravans(g);drawFog(g,campArt());seasonFx(g,dt);drawFrame(g);if(CHOV&&!CDRAG)drawHover(g);}catch(e){console.error(e);}
  return r;};}
window.__mp={MP,mpKey,V:'t256'};
