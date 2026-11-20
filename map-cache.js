// v0.25 campaign map base cache. The parchment pattern, painted landscape and vignette were three full-viewport
// fills every frame (about 9 ms of the map's 15-26 ms frame in profiles). They never change during play, so they
// are baked once into 512 px world tiles (bitmaps, least-recently-used, 24 max) plus one quarter-scale overview
// used when zoomed out and for any tile not baked yet. Same pixels; the layers above are untouched.
'use strict';
const MAPB={T:512,tiles:new Map(),lo:null,loK:.25,max:24,bakePerFrame:2,baked:0,frame:0,x0:-400,y0:-400};
function mapBaseLayers(q,A,x0,y0,w,h,k){
  q.save();q.scale(k,k);q.translate(-x0,-y0);
  q.fillStyle=q.createPattern(A.parch,'repeat');q.fillRect(x0,y0,w/k,h/k);
  if(typeof drawCampaignGround==='function'){if(!MAP_GROUND)drawCampaignGround(mkCanvas(1,1).getContext('2d'));q.drawImage(MAP_GROUND,0,0,CMW,CMH);}
  const vg=q.createRadialGradient(CMW/2,CMH/2,CMH*.3,CMW/2,CMH/2,CMW*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(90,50,20,.45)');q.fillStyle=vg;q.fillRect(x0,y0,w/k,h/k);
  q.restore();}
function mapBaseLo(A){if(MAPB.lo)return MAPB.lo;const k=MAPB.loK,W=Math.ceil((CMW+800)*k),H=Math.ceil((CMH+800)*k);const c=mkCanvas(W,H);mapBaseLayers(c.getContext('2d'),A,MAPB.x0,MAPB.y0,W,H,k);
  const o={c};MAPB.lo=o;toBitmap(o,'c');return o;}
function mapBaseTile(A,i,j){const key=i+','+j;let t=MAPB.tiles.get(key);if(t){t.f=MAPB.frame;return t;}
  if(MAPB.baked>=MAPB.bakePerFrame)return null;MAPB.baked++;
  const T=MAPB.T,c=mkCanvas(T,T);mapBaseLayers(c.getContext('2d'),A,MAPB.x0+i*T,MAPB.y0+j*T,T,T,1);t={c,f:MAPB.frame};toBitmap(t,'c');MAPB.tiles.set(key,t);
  if(MAPB.tiles.size>MAPB.max){let old=null;for(const [k2,v] of MAPB.tiles)if(!old||v.f<old[1].f)old=[k2,v];if(old){const b=old[1].c;if(b&&b.close)try{b.close();}catch(e){}MAPB.tiles.delete(old[0]);}}
  return t;}
function mapBaseDraw(g,A){if(window.__noMapCache)return false;MAPB.frame++;MAPB.baked=0;const lo=mapBaseLo(A),k=MAPB.loK;
  const vx0=Math.max(MAPB.x0,CC.x),vy0=Math.max(MAPB.y0,CC.y),vx1=Math.min(CMW+400,CC.x+VW/CC.z),vy1=Math.min(CMH+400,CC.y+VH/CC.z);
  if(CC.z*DPR<.5){g.drawImage(lo.c,(vx0-MAPB.x0)*k,(vy0-MAPB.y0)*k,(vx1-vx0)*k,(vy1-vy0)*k,vx0,vy0,vx1-vx0,vy1-vy0);return true;}
  const T=MAPB.T,i0=Math.floor((vx0-MAPB.x0)/T),i1=Math.floor((vx1-MAPB.x0-.01)/T),j0=Math.floor((vy0-MAPB.y0)/T),j1=Math.floor((vy1-MAPB.y0-.01)/T);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=MAPB.x0+i*T,y=MAPB.y0+j*T;const t=mapBaseTile(A,i,j);
    if(t)g.drawImage(t.c,x,y,T+.5,T+.5);else g.drawImage(lo.c,i*T*k,j*T*k,T*k,T*k,x,y,T+.5,T+.5);}
  return true;}
