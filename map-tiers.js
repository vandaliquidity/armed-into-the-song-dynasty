/* v0.38 t248 campaign-map settlement tiers. The map's settlements were vector glyphs (one wall box for every town,
   2-4 roofs for every village). They are now 16 Blender-rendered icons made with the village's own camera, sun,
   palette and ink (art/map_icons.py), so the campaign map and the village read as one world:
     villages grow with prosperity: hamlet (v0) -> village (v1) -> prosperous village (v2) -> walled 堡 village (v3)
     county town (t0) and large town (t1, prosperity tier 3+); prefectural city (c0) and 府 capitals (c1)
     frontier fort (f0), pass (p0), Xia horse camp (k0), mountain stronghold 山寨 (b0)
     Western Xia places are tribal (t258): felt-yurt herders' camps, a wattle-ringed tribal town with the chief's great yurt, a
     rammed-earth fort full of tents, the ordo with the khan's gilt tent (xv, xt, xf, xc); Qiang black-tent camps (qc), tug
     standards (tq) and horse herds (hh) are drawn by frontier-raids.js
   The flag, selection ring, garrison label, supply ring, influence ring and name plate are drawn exactly as before.
   ?mt=0 (or localStorage sw_mt=0) restores the old glyphs. Icons are cut into canvases pre-scaled to the zoom bucket. */
'use strict';
const MT_META={"P":0.5,"k":{"v0":[247,205,97.0,140.0],"v1":[256,229,106.0,140.0],"v2":[280,230,130.0,140.0],"v3":[281,229,131.0,140.0],"t0":[300,229,150.0,140.0],"t1":[300,230,150.0,140.0],"c0":[300,230,150.0,140.0],"c1":[300,230,150.0,140.0],"f0":[272,230,122.0,140.0],"p0":[300,230,150.0,140.0],"k0":[229,193,79.0,140.0],"b0":[270,230,120.0,140.0],"xv":[243,193,93.0,140.0],"xt":[288,229,138.0,140.0],"xc":[300,230,150.0,140.0],"xf":[250,229,100.0,140.0],"qc":[253,187,103.0,140.0],"tq":[163,230,13.0,140.0],"hh":[83,61,46.0,32.0]},"t":{"hi":{"s":1.0,"r":{"v0":[0,0,247,205],"v1":[249,0,256,229],"v2":[507,0,280,230],"v3":[0,232,281,229],"t0":[283,232,300,229],"t1":[585,232,300,230],"c0":[0,464,300,230],"c1":[302,464,300,230],"f0":[604,464,272,230],"p0":[0,696,300,230],"k0":[302,696,229,193],"b0":[533,696,270,230],"xv":[0,928,243,193],"xt":[245,928,288,229],"xc":[535,928,300,230],"xf":[0,1160,250,229],"qc":[252,1160,253,187],"tq":[507,1160,163,230],"hh":[672,1160,83,61]},"w":1024,"h":1390},"md":{"s":0.5,"r":{"v0":[0,0,124,102],"v1":[126,0,128,114],"v2":[256,0,140,115],"v3":[0,117,140,114],"t0":[142,117,150,114],"t1":[294,117,150,115],"c0":[0,234,150,115],"c1":[152,234,150,115],"f0":[304,234,136,115],"p0":[0,351,150,115],"k0":[152,351,114,96],"b0":[268,351,135,115],"xv":[0,468,122,96],"xt":[124,468,144,114],"xc":[270,468,150,115],"xf":[0,585,125,114],"qc":[127,585,126,94],"tq":[255,585,82,115],"hh":[339,585,42,30]},"w":512,"h":700},"lo":{"s":0.3,"r":{"v0":[0,0,74,62],"v1":[76,0,77,69],"v2":[155,0,84,69],"v3":[241,0,84,69],"t0":[327,0,90,69],"t1":[419,0,90,69],"c0":[0,71,90,69],"c1":[92,71,90,69],"f0":[184,71,82,69],"p0":[268,71,90,69],"k0":[360,71,69,58],"b0":[431,71,81,69],"xv":[0,142,73,58],"xt":[75,142,86,69],"xc":[163,142,90,69],"xf":[255,142,75,69],"qc":[332,142,76,56],"tq":[410,142,49,69],"hh":[461,142,25,18]},"w":512,"h":211}},"v":{"hi":"1cb66508","md":"17cfce51","lo":"6e4da96f"}};
const MT={img:null,tier:null,C:{},F:.17};
function mtFlag(){try{const q=new URLSearchParams(location.search).get('mt');if(q!==null)return q!=='0';return localStorage.getItem('sw_mt')!=='0';}catch(e){return true;}}
function mtLoad(){if(!mtFlag())return;const t=(typeof GFX!=='undefined'&&GFX.hi)?'hi':((typeof GFX!=='undefined'&&GFX.tier)||'md');if(MT.tier===t)return;MT.tier=t;MT.img=null;MT.C={};
  const im=new Image();im.decoding='async';im.onload=()=>{if(MT.tier===t){MT.img=im;MT.C={};}};im.src=`${typeof ART_BASE!=='undefined'?ART_BASE:'assets/'}${t}/mapicons.webp?v=${MT_META.v[t]}`;}
function mtCapital(t){return /府|京/.test(t.zh||'');}
function mtKey(id){const t=CT[id],s=CG.T[id],xia=s.own==='xia',tier=tierOf(s.prosp||0);
  switch(t.kind){
    case 'city':return xia?'xc':(mtCapital(t)?'c1':'c0');
    case 'town':return xia?'xt':(tier>=3?'t1':'t0');
    case 'fort':return xia?'xf':'f0';
    case 'pass':return 'p0';
    case 'camp':return 'k0';
    default:return xia?'xv':'v'+Math.min(3,tier);}}
// a canvas of icon k pre-scaled to the device size it is drawn at (quarter-octave buckets), so the map never resamples the atlas per frame
function mtCell(k,dev){const m=MT_META.k[k],e=MT_META.t[MT.tier];if(!m||!e||!MT.img)return null;const r=e.r[k];const want=m[0]*MT.F/MT_META.P*dev;
  const b=Math.pow(2,Math.round(Math.log2(Math.max(8,want))*4)/4),key=k+'@'+b;let c=MT.C[key];if(c)return c;
  const w=Math.max(1,Math.round(b)),h=Math.max(1,Math.round(b*m[1]/m[0]));c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(MT.img,r[0],r[1],r[2],r[3],0,0,w,h);
  MT.C[key]=c;const n=Object.keys(MT.C);if(n.length>120)delete MT.C[n[0]];return c;}
// draw icon k with its settlement centre at the current origin (icon units, already scaled by iconScale)
function mtDraw(g,k,alpha){const m=MT_META.k[k];if(!m||!MT.img)return false;const T=g.getTransform(),dev=Math.hypot(T.a,T.b);const c=mtCell(k,dev);if(!c)return false;
  const u=MT.F/MT_META.P,w=m[0]*u,h=m[1]*u;if(alpha!=null)g.globalAlpha=alpha;g.drawImage(c,-m[2]*u,-m[3]*u+6,w,h);if(alpha!=null)g.globalAlpha=1;return true;}
function mtReady(){if(!mtFlag())return false;mtLoad();return !!MT.img;}
{const old=drawTerr;drawTerr=function(g,id){if(!mtReady()||!CG||!CG.T[id])return old.apply(this,arguments);
  const t=CT[id],s=CG.T[id],p=tPos(id),q=c2s(p.x,p.y),sc=iconScale();if(q.x<-110||q.x>VW+110||q.y<-110||q.y>VH+110)return;
  const seen=s.own!=='xia'||SEEN.has(id),col=MAP_INK[s.own]||MAP_INK.free,sel=CSEL?.t===id,hov=CHOV?.t===id,city=t.kind==='city';
  g.save();g.translate(q.x,q.y);g.scale(sc,sc);
  const halo=g.createRadialGradient(0,4,0,0,4,city?62:40);halo.addColorStop(0,sel?'rgba(219,177,67,.42)':'rgba(78,91,64,.18)');halo.addColorStop(1,'rgba(78,91,64,0)');g.fillStyle=halo;g.fillRect(-66,-50,132,100);
  if(!seen){g.globalAlpha=.55;}
  mtDraw(g,mtKey(id));g.globalAlpha=1;
  const rx=city?44:t.kind==='town'?38:32,ry=city?24:20;
  if(sel||hov){g.strokeStyle=sel?'#caa44d':'#efe4bb';g.lineWidth=sel?2:1.2;g.beginPath();g.ellipse(0,9,rx,ry,0,0,TAU);g.stroke();}
  if(seen){const fx=-rx+2;g.strokeStyle='#6a6550';g.lineWidth=1.1;g.beginPath();g.moveTo(fx,5);g.lineTo(fx,-30);g.stroke();g.fillStyle=col;g.fillRect(fx,-30,13,15);g.strokeStyle='#d9cca3';g.strokeRect(fx,-30,13,15);g.font='bold 10px serif';g.textAlign='center';g.fillStyle='#fff0cd';g.fillText(CL.fac[s.own].ch,fx+6.5,-19);}
  if(s.build){g.fillStyle='#d4ac53';g.fillRect(rx-8,-12,5,5);}
  if(CC.z>.8&&s.own==='song'&&typeof dynastyNearest==='function'&&dynastyNearest(id,3)){const influence=clamp((CG.dynasty?.influence[id]||0)/100,0,1);
    g.strokeStyle='#647f6a';g.lineWidth=2;g.beginPath();g.ellipse(0,9,rx,ry,0,0,TAU);g.stroke();
    if(influence){g.strokeStyle='#dec477';g.beginPath();g.ellipse(0,9,rx,ry,0,-Math.PI/2,-Math.PI/2+TAU*influence);g.stroke();}}
  if(s.own==='qh'&&Object.values(s.businesses||{}).some(b=>b.level)){g.fillStyle='#d2aa50';g.beginPath();g.arc(rx-4,14,3,0,TAU);g.fill();}
  if(s.own==='free'&&t.vacant){g.strokeStyle='#efe7c8';g.lineWidth=1.3;g.strokeRect(rx-8,9,5,5);}
  if(s.own==='qh'&&!SUPP.has(id)){g.strokeStyle='#b56c55';g.setLineDash([3,3]);g.beginPath();g.ellipse(0,9,rx,ry,0,0,TAU);g.stroke();g.setLineDash([]);}
  g.restore();
  const label=MAP_LABELS.get(id);if(label){const {x,y,w,h,size,name}=label;
    g.save();if(Math.abs(label.dy)>35){g.strokeStyle='rgba(94,100,75,.4)';g.lineWidth=.7;g.beginPath();g.moveTo(q.x,q.y+12*sc);g.lineTo(x+w/2,label.dy<0?y+h:y);g.stroke();}
    g.shadowColor='rgba(46,52,37,.15)';g.shadowBlur=5;g.shadowOffsetY=2;g.fillStyle=sel?'#344c46':'rgba(246,239,214,.94)';g.beginPath();g.roundRect(x,y,w,h,3);g.fill();g.shadowBlur=0;g.shadowOffsetY=0;
    g.fillStyle=col;g.fillRect(x,y+3,2,h-6);g.font=`600 ${size}px "Noto Serif SC",serif`;g.textAlign='center';g.fillStyle=sel?'#f8e7ac':'#34463d';g.fillText(name,x+w/2,y+h-6);
    const men=s.own==='song'?s.songGarrison?.men:s.own==='xia'&&seen?s.str:0;
    if(men&&(sel||hov||CC.z>1.25)){g.font=`10px sans-serif`;g.fillStyle=col;g.fillText(Tz('驻军 ','Garrison ')+men,x+w/2,y+h+11);}
    g.restore();}
};}
// bandit strongholds (realm-strategy.js): the rendered 山寨 replaces the canvas palisade; a cleared one is drawn faded
if(typeof rsDrawFort==='function'){const old=rsDrawFort;rsDrawFort=function(g,x,y,sc,b){if(!mtReady())return old.apply(this,arguments);const d=bdDef(b.id),on=bdActive(b);
  g.save();g.translate(x,y);g.scale(sc*.82,sc*.82);if(!on)g.filter='grayscale(.8)';mtDraw(g,'b0',on?1:.5);g.filter='none';g.restore();
  g.save();g.font='bold 11px "Noto Serif SC",serif';g.textAlign='center';g.fillStyle=on?'#fff0d0':'#d8d0c0';g.strokeStyle='rgba(20,10,4,.9)';g.lineWidth=3;const lab=`${Tz(d.zh,d.en)}${on?' · '+b.men:' · '+Tz('已平','cleared')}`;
  g.strokeText(lab,x,y+26*sc);g.fillText(lab,x,y+26*sc);g.restore();};}
window.__mt={MT,MT_META,mtKey,mtDraw,mtFlag,mtReady,mtLoad,V:'t248a'};
