// v0.42 (t255) one people standard for the main village. Every person drawn in the village (villagers, porters, carriers, merchants,
// children, soldiers on the drill yard, the edict procession, artisans at their stations, physicians, patients) now comes from one art set
// rendered by one pipeline (Blender, song08_people / models rigs, vu_style sun + ink, vu_pack grade + haze clean) and is drawn to one
// height standard: every adult stands VP.H world px tall (hat to heel), children VP.HK, a soldier the same as a villager, a rider at the
// same scale as a man on foot. Callers no longer pick their own size (r 7..14, the old x1.6 / x1.2 village boost, the artisan .56/.62 and
// patient x1.2 factors): VP.K holds each sprite's measured height so the scale is derived, not tuned per call site.
// Also: the compound view is gone (t255). What it had that the main village lacked lives here: work-loop artisans at every business
// (kiln, pottery, brewery, beauty workshop, restaurant, weaving house, paper mill, powder works, foundry, refinery), a sack stacker at the
// storehouse and a clerk counting at the 大宋官库 treasury, each with the old room's status line on hover.
'use strict';
const VP_META={"wk":{"acts":["hammer","stir","lift","weave","push","stack","pour","tend","count"],"nf":6,"w":27.5,"h":26.46,"ax":13.54,"ay":20.57,"r":8.5,"v":{"hi":"994283f2","md":"2e5fbbed","lo":"2ba30378"}},"pt":{"types":["mil","spear","dao","arch","xbow","cav","fire"],"nf":5,"liv":{"mil":"#8c6e4a","spear":"#9a2a22","dao":"#7a2440","arch":"#3f6a3a","xbow":"#2c447a","cav":"#6a4a2a","fire":"#3a3a40"},"w":29.38,"h":20.0,"ax":14.58,"ay":16.38,"r":8.5,"v":{"hi":"754586e4","md":"90f2bf19","lo":"7cccbe5a"}}};
const VP={V:'t255',img:{},tier:null,R:9*1.6,H:27.8,HK:17,
  // measured hat-to-heel height (world px) of each sprite drawn at r = VP.R (tests/village-people.cjs re-measures and checks these)
  K:{villager:27.8,vil_w:28,vil_b:29.5,vil_e:26.5,vil_k:22,porter:28.3,merchant:28,song_militia:27.0,song_spear:28.4,song_xbow:28.5,song_archer:27.5,song_fire:29.0,song_shield:28.0,song_cav:26.8,song_gun:25.3,
     worker:27.8,patient:27.8},   // worker + patient atlases are the villagers' own person8 model at the villagers' px per BU: same factor
  // target height: adults VP.H; children VP.HK; a mounted rider's head stands 1.35x a man on foot
  T:{vil_k:'HK',song_cav:1.35},CHILD:new Set(['vil_k']),
  BIZ_ACT:{kiln:'tend',pottery:'tend',brewery:'stir',beauty:'push',restaurant:'pour',weaver:'weave',papermill:'lift',powderworks:'stir',arsenal:'hammer',refinery:'hammer',garden:'lift',orchard:'stack'}};
try{localStorage.removeItem('sw_cpd3');}catch(e){}
function vpOn(){return MODE==='cvil';}
function vpLoad(){const t=GFX.tier||'md';if(VP.tier===t)return;VP.tier=t;VP.img={};
  for(const n of ['workers','patients']){const im=new Image();im.decoding='async';im.onload=()=>{if(VP.tier===t)VP.img[n]=im;};im.src=`${ART_BASE}${t}/vp_${n}.webp?v=${VP_META[n==='workers'?'wk':'pt'].v[t]}`;}}
// the radius that makes this sprite stand to the standard height
function vpR(name){const h=VP.K[name];if(!h)return null;const t=VP.T[name];return VP.R*(t==='HK'?VP.HK:VP.H*(t||1))/h;}
{const _su=sprUnit;sprUnit=function(name,x,y,r,...rest){if(vpOn()){const rr=vpR(name);if(rr)r=rr;else if(/^(vil|villager|porter|merchant)/.test(name))r*=1.6;else if(/^song_/.test(name))r*=1.2;}return _su.call(this,name,x,y,r,...rest);};}
// work loops (same figures as the villagers, same scale): act in VP_META.wk.acts, dir 0 E 1 S 2 W 3 N
function vpWorkerScale(){return vpR('worker')/VP_META.wk.r;}
function vpWorker(g,x,y,act,dir,f){vpLoad();const WK=VP.img.workers,M=VP_META.wk;if(!WK)return false;const row=Math.max(0,M.acts.indexOf(act))*4+(dir|0),cw=WK.width/M.nf,ch=WK.height/(M.acts.length*4),k=vpWorkerScale();
  g.drawImage(WK,(f%M.nf)*cw,row*ch,cw,ch,x-M.ax*k,y-M.ay*k,M.w*k,M.h*k);return true;}
function vpPatientScale(){return vpR('patient')/VP_META.pt.r;}
function vpPatient(g,type,x,y,fr){vpLoad();const PT=VP.img.patients,M=VP_META.pt;if(!PT)return false;const row=Math.max(0,M.types.indexOf(type)),cw=PT.width/M.nf,ch=PT.height/M.types.length,k=vpPatientScale();
  g.drawImage(PT,fr*cw,row*ch,cw,ch,x-M.ax*k,y-M.ay*k,M.w*k,M.h*k);return true;}
window.__vp={V:VP.V,r:vpR,worker:vpWorker,patient:vpPatient};
// ---- what the compound view had that the main village lacked: artisans at every business, the storehouse stacker, the treasury clerk
function vpBizLine(id,k,b){const def=DY_BUSINESSES[k],p=dynastyProduction(id,k),nm=o=>Object.entries(o||{}).map(([q,n])=>{const a=RAWN[q]||EQN[q];return `${a?Ts(a[0],a[1]):q} ${n}`;}).join(' + ');
  return {busy:!b.paused&&p.scale>0,t:`${Ts(...def.name)} · ${Ts('匠人','artisan')}\n${b.paused?Ts('歇业','Paused'):p.scale>0?`${Ts('开工','Working')} ${Math.round(p.scale*100)}% · ${Ts('雇工','workers')} ${p.workers}/${def.jobs}`:Ts('缺工或缺料停工','Idle: short of workers or materials')}\n${Ts('每月','Per month')}: ${nm(p.input)} → ${nm(p.output)}`};}
{const old=dynastyShop;dynastyShop=function(add,k,b,x,y){const r=old.apply(this,arguments);try{if(b?.level&&VP.BIZ_ACT[k]){const L=vpBizLine(CVIL.id,k,b),wx=x+70,wy=y+30,t=CVIL.t,ph=(x*7+y)%13;
  add(wy,()=>vpWorker(ctx,wx,wy,VP.BIZ_ACT[k],1,L.busy?Math.floor(t*5+ph):0));CVIL.hot.unshift({r:[wx-14,wy-34,wx+14,wy+4],t:L.t});}}catch(e){}return r;};}
{const old=cvilStatic8;cvilStatic8=function(add,s,tier){const r=old.apply(this,arguments);try{if(vpOn()&&typeof vcBin==='function'){const t=CVIL.t,b=vcBin('grain'),gx=b.d[0]+34,gy=b.d[1]+10,st=s.st||{};
   add(gy,()=>vpWorker(ctx,gx,gy,'stack',1,Math.floor(t*4)));CVIL.hot.unshift({r:[gx-14,gy-34,gx+14,gy+4],t:`${Ts('仓廒','Storehouse')} · ${Ts('司仓','stacker')}\n${Ts('存粮','Grain')} ${Math.floor(st.grain||0)} · ${Ts('木料','Timber')} ${Math.floor(st.timber||0)}`});
   if(CVIL.id===HOME){const tx=VP.TRES[0],ty=VP.TRES[1];add(946,()=>vpWorker(ctx,tx,ty,'count',1,Math.floor(t*3)));
     CVIL.hot.unshift({r:[tx-14,ty-34,tx+14,ty+4],t:`${Ts('大宋官库','Song treasury')} · ${Ts('库吏','clerk')}\n${Ts('银','Silver')} ${Math.floor(CAMP?.res?.silver||0)} · ${Ts('金','Gold')} ${Math.floor(st.gold||0)}`});}}}catch(e){}return r;};}
VP.TRES=[372,906];
