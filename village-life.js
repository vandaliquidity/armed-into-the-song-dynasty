// v0.30 (t252) village life, part 1: the hospital ward (医馆) in the classic village, tied to the real casualty data.
// Every wounded soldier the ward shows is a persistent person: a figure per 20 wounded men of a real company (unit or evacuation batch),
// with a stable name, the company's livery, and the day he was admitted. Ox carts bring new wounded from the gate; they lie in beds
// while a physician takes pulses, a helper gives medicine and an apprentice tends the decoction stove; a bar shows healing against the
// real recovery rate. When the season's recovery check returns men to their company, the same figures get up, walk to the drill yard
// and stand ready for deployment. Capacity matters: beds hold HOSP_CAP men per hospital level; the overflow waits outside and heals at
// the no-hospital rate (see the woundTick wrapper). Art: art/ward.py (Blender) -> assets/<tier>/ward.webp; the patients and physicians are in the one people art set (village-people.js, vp_patients/vp_workers).
'use strict';
const VL_META={"W":220,"H":310,"oy":60,"beds":[[62,88],[62,124],[62,160],[62,196],[158,88],[158,124],[158,160],[158,196]],"stations":[[168,228,"stir",3],[110,230,"count",3]],"pt":{"types":["mil","spear","dao","arch","xbow","cav","fire"],"nf":5,"w":48.4,"h":35.8,"ax":27.7,"ay":31.4,"liv":{"mil":"#8c6e4a","spear":"#9a2a22","dao":"#7a2440","arch":"#3f6a3a","xbow":"#2c447a","cav":"#6a4a2a","fire":"#3a3a40"}}};
const VL={img:{},tier:null,V:'t254a',X:1570,Y:60,FIG:20};
const HOSP_CAP=[0,160,240];
function hospCap(id){return HOSP_CAP[hospLv(id)]||0;}
function vlLoad(){const t=GFX.tier||'md';if(VL.tier===t)return;VL.tier=t;VL.img={};
  for(const [n,v] of [['ward',VL.V]]){const im=new Image();im.decoding='async';im.onload=()=>{VL.img[n]=im;};im.src=`${ART_BASE}${t}/${n}.webp?v=${v}`;}}
// ---------------------------------------------------------------- ward places: 8 beds; level 2 adds 4 mats in the aisle; overflow mats outside the gate
function vlSlots(lv){const X=VL.X,Y=VL.Y+VL_META.oy,S=VL_META.beds.map(([x,y])=>({x:X+x,y:Y+y,bed:1}));if(lv>=2)for(let k=0;k<4;k++)S.push({x:X+110,y:Y+96+k*32,mat:1});return S;}
function vlOut(k){return {x:VL.X+30+(k%6)*32,y:VL.Y+VL_META.H+22+Math.floor(k/6)*16,mat:1,out:1};}
const VL_SUR=[['王','Wang'],['李','Li'],['张','Zhang'],['刘','Liu'],['陈','Chen'],['杨','Yang'],['赵','Zhao'],['黄','Huang'],['周','Zhou'],['吴','Wu'],['徐','Xu'],['孙','Sun'],['马','Ma'],['朱','Zhu'],['胡','Hu'],['郭','Guo'],['何','He'],['高','Gao'],['林','Lin'],['罗','Luo'],['韩','Han'],['石','Shi']];
const VL_GIV=[['大郎','Dalang'],['二郎','Erlang'],['三郎','Sanlang'],['小乙','Xiaoyi'],['阿四','Asi'],['六哥','Liuge'],['铁牛','Tieniu'],['石头','Shitou'],['狗儿','Gou\'er'],['德','De'],['忠','Zhong'],['顺','Shun'],['福','Fu'],['安','An'],['虎','Hu'],['七郎','Qilang']];
function vlHash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function vlName(fid){const h=vlHash(fid),a=VL_SUR[h%VL_SUR.length],b=VL_GIV[(h>>>8)%VL_GIV.length];return [a[0]+b[0],a[1]+' '+b[1]];}
function vlTag(e){const u=UT[e.type]||UT.mil;return [`${u.zh}第${e.unit}都`,`${u.en} · Co. ${e.unit}`];}
// ---------------------------------------------------------------- the patient roll: real wounded at this village, grouped by company
function vlGroups(id){const G=[];for(const u of Object.values(CG.U))if(u.wnd>0&&siteOf(u)===id)G.push({key:'u'+u.id,n:Math.floor(u.wnd),type:u.type,unit:u.id});
  if(typeof careBatches==='function')for(const b of careBatches())if(b.at===id&&b.n>0&&b.state==='care')G.push({key:'b'+b.id,n:b.n,type:b.kit?.type||'mil',unit:b.unitId});return G;}
function vlWard(id){CG.wardV=CG.wardV||{};return CG.wardV[id]=CG.wardV[id]||{pts:[]};}
// sync the persistent roll with the real numbers; returns {arrived, healed} entries for the animations
function vlSync(id){const W=vlWard(id),lv=hospLv(id),slots=vlSlots(lv),want=new Map();
  for(const g of vlGroups(id)){const nf=Math.ceil(g.n/VL.FIG);for(let i=0;i<nf;i++)want.set(g.key+'#'+i,g);}
  const healed=[],arrived=[];W.pts=W.pts.filter(p=>{if(want.has(p.fid))return true;healed.push(p);return false;});
  const have=new Set(W.pts.map(p=>p.fid));for(const [fid,g] of want)if(!have.has(fid)){const p={fid,key:g.key,type:g.type,unit:g.unit,since:CG.turn,arr:1,slot:-1};W.pts.push(p);arrived.push(p);}
  // beds first come first served; the rest wait outside
  const used=new Set();for(const p of W.pts)if(p.slot>=0&&p.slot<slots.length&&!used.has(p.slot))used.add(p.slot);else p.slot=-1;
  for(const p of W.pts)if(p.slot<0){const k=slots.findIndex((_,i)=>!used.has(i));if(k>=0){p.slot=k;used.add(k);}}
  return {arrived,healed};}
function vlPos(id,p,lv){if(p.slot>=0)return vlSlots(lv)[p.slot];const outs=vlWard(id).pts.filter(q=>q.slot<0);return vlOut(Math.max(0,outs.indexOf(p)));}
function vlRate(id,p){const lv=p.slot>=0?hospLv(id):0;return HEALR[lv]+(techOn('inoc')?.1:0);}
// ---------------------------------------------------------------- capacity: the overflow heals at the no-hospital rate
{const old=woundTick;woundTick=function(rep){const stash=[];
  try{for(const id of Object.keys(CG.T)){const lv=hospLv(id);if(!lv)continue;const load=woundedAt(id),cap=hospCap(id);if(load<=cap)continue;const k=(load-cap)/load;let over=0;
    for(const u of Object.values(CG.U))if(u.wnd>0&&siteOf(u)===id){const m=Math.min(u.wnd,Math.round(u.wnd*k));if(m>0){u.wnd-=m;over+=m;stash.push({u,m});}}
    if(typeof careBatches==='function')for(const b of careBatches())if(b.at===id&&b.state==='care'&&b.n>0){const m=Math.min(b.n,Math.round(b.n*k));if(m>0){b.n-=m;over+=m;stash.push({b,m});}}
    if(over)rep.lines.push(['🛏',Ts(`${CT[id].zh}医馆床位已满（${cap}人）：${over}名伤兵在外候诊，按无医馆疗效`,`${CT[id].en}: the hospital is full (${cap} beds); ${over} wounded wait outside and heal at the no-hospital rate`)]);}}catch(e){console.warn(e);}
  old(rep);
  for(const x of stash){const rec=Math.min(x.m,Math.max(0,Math.round(x.m*HEALR[0]))),die=Math.min(x.m-rec,Math.round((x.m-rec)*WDIE[0])),left=x.m-rec-die;
    CG.stats.wrec=(CG.stats.wrec||0)+rec;CG.stats.wdied=(CG.stats.wdied||0)+die;
    if(x.u){if(!CG.U[x.u.id]&&x.u.loc?.v)CG.U[x.u.id]=x.u;x.u.men+=rec;x.u.wnd=(x.u.wnd||0)+left;}
    else{x.b.n+=left;if(rec)careReturn(x.b,rec);if(x.b.n>0&&!careBatches().includes(x.b))careBatches().push(x.b);}}};}
// ---------------------------------------------------------------- fields: two columns when the ward stands in the north-east corner
// t255: the field plots make room for the ward in vfSlots (index.html)
function vlOn(){return MODE==='cvil'&&!!CG?.T?.[CVIL.id];}
// ---------------------------------------------------------------- per-view animation state
function vlPath(){return [[900,VWH-20],[900,470],[1762,470],[1762,398],[VL.X+110,398],[VL.X+110,VL.Y+VL_META.oy+236]];}
function vlAlong(P,d){let j=0;while(j<P.length-2){const L=Math.hypot(P[j+1][0]-P[j][0],P[j+1][1]-P[j][1]);if(d<=L)break;d-=L;j++;}const a=P[j],b=P[j+1],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,e=Math.min(1,d/L);return {x:a[0]+(b[0]-a[0])*e,y:a[1]+(b[1]-a[1])*e,f:Math.atan2(b[1]-a[1],b[0]-a[0]),end:e>=1&&j>=P.length-2};}
function vlPlen(P){let n=0;for(let j=0;j<P.length-1;j++)n+=Math.hypot(P[j+1][0]-P[j][0],P[j+1][1]-P[j][1]);return n;}
function vlState(){if(!CVIL.vl||CVIL.vl.id!==CVIL.id){CVIL.vl={id:CVIL.id,carts:[],ready:[],sync:0,first:1};}return CVIL.vl;}
function vlStep(s,dt){const V=vlState(),id=CVIL.id;V.sync-=dt;if(V.sync>0)return V;V.sync=.5;const {arrived,healed}=vlSync(id),lv=hospLv(id);
  // patients still flagged "arriving" (carts interrupted by leaving the view) ride the next cart
  const riding=new Set(V.carts.flatMap(c=>c.figs.map(p=>p.fid)));const wait=vlWard(id).pts.filter(p=>p.arr&&!riding.has(p.fid));
  for(let i=0;i<wait.length;i+=4){V.carts.push({figs:wait.slice(i,i+4),d:-i*30,stop:0,back:0});}
  for(const p of healed){if(V.ready.length>=16)break;const q=vlPos(id,p,lv);V.ready.push({...p,x:q.x,y:q.y,t:0,d:0,P:[[q.x,q.y],[VL.X+110,VL.Y+VL_META.oy+236],[VL.X+110,398],[1762,398],[1762,470],[1292,470],[1292,1000],[1140+(V.ready.length%6)*22,1016+Math.floor(V.ready.length/6)*20]]});}
  V.first=0;return V;}
// ---------------------------------------------------------------- drawing (hooked into the classic village's depth-sorted list)
function vlDraw(add,s,t,dt){vlLoad();const A=VL.img.ward,id=CVIL.id,lv=hospLv(id),V=vlStep(s,dt),W=vlWard(id),M=VL_META,X=VL.X,Y=VL.Y,g=ctx;if(!A)return;
  add(Y+2,()=>{g.drawImage(A,X,Y,M.W,M.H);if(!lv){g.fillStyle='rgba(30,22,14,.5)';g.fillRect(X,Y+M.oy,M.W,M.H-M.oy);g.fillStyle='rgba(30,22,14,.8)';g.fillRect(X+40,Y+M.oy+100,M.W-80,30);g.fillStyle='#f0e2c4';g.textAlign='center';g.font='12px "Noto Serif SC",serif';g.fillText(Tz('医馆未建 · 营建后可收治','Hospital not built yet'),X+M.W/2,Y+M.oy+120);}
    if(lv>=2){g.fillStyle='rgba(160,130,80,.85)';for(let k=0;k<4;k++)g.fillRect(X+96,Y+M.oy+88+k*32,28,14);}
    const used=W.pts.filter(p=>p.slot>=0&&!p.arr).length,cap=hospCap(id),label=`${Tz('医馆','Hospital')}${lv?' Lv'+lv:''} · ${Tz('床','beds')} ${Math.min(used*VL.FIG,woundedAt(id))}/${cap}`;
    g.font='bold 12px "Noto Serif SC",serif';const w=g.measureText(label).width+14;g.fillStyle='rgba(70,28,14,.9)';g.fillRect(X+8,Y+M.oy-8,w,19);g.strokeStyle='#d9a54a';g.lineWidth=1;g.strokeRect(X+8,Y+M.oy-8,w,19);g.fillStyle='#ffe7a0';g.textAlign='left';g.fillText(label,X+15,Y+M.oy+6);});
  CVIL.hot.push({r:[X,Y+M.oy-10,X+M.W,Y+M.H],t:`${Ts('医馆','Hospital')}${lv?' Lv'+lv:` · ${Ts('未建','not built')}`}\n${Ts('伤兵','Wounded')} ${woundedAt(id)} · ${Ts('床位','Beds')} ${hospCap(id)}\n${Ts('每季康复率','Recovery per season')} ${Math.round(HEALR[lv]*100)}%${woundedAt(id)>hospCap(id)?`\n${Ts('超出床位者在外候诊，按无医馆疗效','Overflow waits outside at the no-hospital rate')}`:''}`});
  const PR=(p,x,y,fr)=>typeof vpPatient==='function'&&vpPatient(g,p.type,x,y,fr);   // t255: one people standard (village-people.js)
  // physician + helper move between the occupied beds; the apprentice tends the stove
  const inbed=W.pts.filter(p=>!p.arr),occ=inbed.filter(p=>p.slot>=0).map(p=>({p,q:vlPos(id,p,lv)}));const tend=new Set();
  if(lv){{const dw=(x,y,act,dir,ph)=>typeof vpWorker==='function'&&vpWorker(g,x,y,act,dir,Math.floor(t*5+ph));
    for(const [sx,sy,act,dir] of M.stations)add(Y+M.oy+sy,()=>dw(X+sx,Y+M.oy+sy,act,dir,sx));
    if(occ.length){for(const [k,act,per] of [[0,'count',7],[1,'pour',5.3]]){if(k&&occ.length<2)break;const i=(Math.floor(t/per)+k*Math.ceil(occ.length/2))%occ.length,o=occ[i];tend.add(o.p.fid);const x=o.q.x+(k?-26:26),y=o.q.y+12;add(y,()=>dw(x,y,act,k?0:2,k*3));}}}}
  // patients: breathing in bed, stirring when tended, sitting up when nearly healed; hover names
  for(const p of inbed){const q=vlPos(id,p,lv),prog=clamp((CG.turn-p.since+.35)*vlRate(id,p),0,1),ph=vlHash(p.fid)%97/10,near=tend.has(p.fid);
    const fr=prog>.85?4:near?(Math.floor(t*1.2)%2?3:2):(Math.floor(t*.8+ph)%2);
    add(q.y+1,()=>{if(q.out){g.fillStyle='rgba(150,120,70,.9)';g.fillRect(q.x-20,q.y-6,40,12);}PR(p,q.x,q.y,fr);
      g.fillStyle='rgba(20,14,8,.65)';g.fillRect(q.x-12,q.y-22,24,4);g.fillStyle=prog>.85?'#8fd060':'#d0b040';g.fillRect(q.x-12,q.y-22,24*prog,4);});
    const nm=vlName(p.fid),tg=vlTag(p);CVIL.hot.unshift({r:[q.x-22,q.y-26,q.x+22,q.y+10],t:`${Ts(nm[0],nm[1])}\n${Ts(...tg)}\n${Ts('入院','Admitted')} ${dateTxt(p.since)} · ${Ts('伤愈','Healing')} ${Math.round(prog*100)}%${q.out?`\n${Ts('床位已满，在外候诊','Ward full: waiting outside')}`:''}`});}
  if(W.pts.filter(p=>p.slot<0).length>12)add(VL.Y+M.H+60,()=>txt(`+${W.pts.filter(p=>p.slot<0).length-12} ${Tz('候诊','waiting')}`,VL.X+M.W/2,VL.Y+M.H+64,12,'#7a1a08','center','bold '));
  // carts from the gate: drive in, unload one patient at a time onto his bed, drive back out
  const P=vlPath(),PL=vlPlen(P);for(const c of V.carts){if(c.d<0){c.d+=dt*110;continue;}
    if(!c.back){const a=vlAlong(P,c.d);if(!a.end)c.d+=dt*110;else{c.stop+=dt;const k=Math.floor(c.stop/1.1);for(let i=0;i<Math.min(k,c.figs.length);i++)c.figs[i].arr=0;if(k>=c.figs.length){c.back=1;c.d=PL;}}}
    else c.d-=dt*130;
    const a=vlAlong(P,Math.max(0,c.d)),face=c.back?a.f+Math.PI:a.f,still=c.stop>0&&!c.back;
    add(a.y+14,()=>{sprUnit('oxcart',a.x,a.y+14,14,face,still?0:Math.floor(t*6)%4);if(!c.back)c.figs.forEach((p,i)=>{if(p.arr)PR(p,a.x-6+i*5,a.y+2-i*3,0);});});
    // stretcher bearers carry the patient being unloaded
    if(still&&!c.back){const k=Math.floor(c.stop/1.1),p=c.figs[k];if(p){const q=vlPos(id,p,lv),e=(c.stop%1.1)/1.1,x=a.x+(q.x-a.x)*e,y=a.y+(q.y-a.y)*e;add(y+2,()=>{PR(p,x,y-6,0);sprUnit(SPR.porter?'porter':'villager',x-18,y,8,Math.atan2(q.y-a.y,q.x-a.x),frontierWalkFrame('porter',t*3));sprUnit(SPR.porter?'porter':'villager',x+18,y,8,Math.atan2(q.y-a.y,q.x-a.x),frontierWalkFrame('porter',t*3+1));});}}}
  V.carts=V.carts.filter(c=>!(c.back&&c.d<=0));
  // recovered men: get up, walk to the drill yard, form up and stand ready
  for(const r of V.ready){r.t+=dt;const a=vlAlong(r.P,r.d),eng=UT[r.type]?.eng||'militia',sp=UNITS[eng]?.spr||'villager';if(!a.end)r.d+=dt*42;
    const nm=vlName(r.fid),tg=vlTag(r);add(a.y,()=>{sprUnit(SPR[sp]?sp:'villager',a.x,a.y,9,a.end?Math.PI/2:a.f,a.end?0:frontierWalkFrame(sp,r.d/12));if(a.end&&Math.floor(t*1.5)%3===0)txt(Tz('待命','Ready'),a.x,a.y-24,11,'#1e3a06','center','bold ');});
    CVIL.hot.unshift({r:[a.x-10,a.y-26,a.x+10,a.y+4],t:`${Ts(nm[0],nm[1])}\n${Ts(...tg)}\n${a.end?Ts('伤愈归队，待命出征','Recovered: formed up, ready for deployment'):Ts('伤愈出院，前往校场','Recovered: walking to the drill yard')}`});}
  V.ready=V.ready.filter(r=>r.t<70);}
{const old=cvilWorkers8;cvilWorkers8=function(add,s,tier,se,t){const r=old.apply(this,arguments);try{if(vlOn())vlDraw(add,s,t,CVIL._vdt||1/60);}catch(e){console.warn(e);}return r;};}
{const old=cvil8Frame;cvil8Frame=function(dt){CVIL._vdt=dt;return old.apply(this,arguments);};}
// field workers that stood in the north-east plots move with their plots
{const old=cvilWorkers8;cvilWorkers8=function(add,s,tier,se,t){if(CVIL.wk8&&CVIL.wk8.id===CVIL.id&&!CVIL.wk8.vl){for(const w of CVIL.wk8)if(w.k==='field'&&w.x>VL.X-20){w.x-=400;w.y+=130;}CVIL.wk8.vl=1;}return old.apply(this,arguments);};}
{const old=cvilWaypoints;cvilWaypoints=function(){const P=old.apply(this,arguments);for(const w of P)if(w.x>VL.X-20&&w.y<VL.Y+VL_META.H+10){w.x-=420;}return P;};}
