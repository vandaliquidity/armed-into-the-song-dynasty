// v0.47 (t257) the four campaign-map layers become overlays you can read at a glance instead of rings and labels.
//  - Factions: soft territory tint from every town's bloc influence (colours blend where blocs contest a district, a darker seam
//    where their territories meet), contested towns marked, this month's influence pushes drawn as arrows, recent changes of
//    allegiance flagged, each bloc labelled with its power rank.
//  - Bandit threat: raid-range heat around every active stronghold, its likely next target, and every village in reach marked
//    guarded or exposed, with the garrison it would need.
//  - Supply: the supply network from Qinghe through supplied towns (own roads solid, Song roads thinner), supplied land tinted,
//    cut-off towns and armies shaded red, and the roads where supply ends.
//  - Trade: goods flowing along Qinghe's routes and the Song trade roads (live layer), route values, charters you could open,
//    chokepoints with the stronghold causing them, and the blocs' blockades.
// Each layer has a one-line legend in the layer bar and adds a line to the town hover (desktop) and the town panel (tap).
// Static parts are painted inside drawMarch, so map-perf.js caches them; the territory and heat fields are low-resolution canvases
// rebuilt only when their inputs change. Only the flowing goods and event pulses are drawn every frame (drawCaravans, live layer).
'use strict';
const ML={V:'t257a',CELL:14,f:{}};
// tint palette: the blocs' colours, more saturated so they read over the painted map (Yao's olive vanished into the grass)
const ML_TINT={liu:'#c8402a',yao:'#2f9a3a',zhong:'#d0902a',tong:'#7a44b8'};
function mlRGB(h){const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];}
function mlCan(w,h){return typeof mkCanvas==='function'?mkCanvas(w,h):Object.assign(document.createElement('canvas'),{width:w,height:h});}
function mlScr(id){const p=tPos(id);return c2s(p.x,p.y);}
function mlVis(q,m){m=m||80;return q.x>-m&&q.y>-m&&q.x<VW+m&&q.y<VH+m;}
function mlMid(a,b){const s=mlScr(a),e=mlScr(b);return {s,e,x:(s.x+e.x)/2+(s.y-e.y)*.06,y:(s.y+e.y)/2+(e.x-s.x)*.06};}
function mlCurve(g,a,b){const m=mlMid(a,b);g.beginPath();g.moveTo(m.s.x,m.s.y);g.quadraticCurveTo(m.x,m.y,m.e.x,m.e.y);return m;}
function mlText(g,s,x,y,col,sz,al){g.font=`bold ${Math.round(sz)}px "Noto Serif SC",serif`;g.textAlign=al||'center';g.lineJoin='round';g.lineWidth=3.5;g.strokeStyle='rgba(20,10,4,.88)';g.strokeText(s,x,y);g.fillStyle=col;g.fillText(s,x,y);}
function mlTag(g,s,x,y,bg,fg,sz){g.font=`bold ${Math.round(sz)}px sans-serif`;const w=g.measureText(s).width+10,h=sz+7;g.fillStyle=bg;g.strokeStyle='rgba(20,10,4,.8)';g.lineWidth=1.2;
  if(g.roundRect){g.beginPath();g.roundRect(x-w/2,y-h/2,w,h,h/2);g.fill();g.stroke();}else{g.fillRect(x-w/2,y-h/2,w,h);}g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.fillText(s,x,y+.5);g.textBaseline='alphabetic';}
function mlArrow(g,a,b,col,w,al){const s=mlScr(a),e=mlScr(b),dx=e.x-s.x,dy=e.y-s.y,L=Math.hypot(dx,dy);if(L<8)return;const ux=dx/L,uy=dy/L,sx=s.x+ux*L*.18,sy=s.y+uy*L*.18,ex=e.x-ux*L*.22,ey=e.y-uy*L*.22,mx=(sx+ex)/2-uy*L*.12,my=(sy+ey)/2+ux*L*.12;
  g.globalAlpha=al;g.strokeStyle='rgba(20,10,4,.7)';g.lineWidth=w+2.5;g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(mx,my,ex,ey);g.stroke();g.strokeStyle=col;g.lineWidth=w;g.stroke();
  const ax=ex-mx,ay=ey-my,al2=Math.hypot(ax,ay)||1,vx=ax/al2,vy=ay/al2,hs=5+w*1.6;g.fillStyle=col;g.beginPath();g.moveTo(ex+vx*hs*.6,ey+vy*hs*.6);g.lineTo(ex-vx*hs-vy*hs*.7,ey-vy*hs+vx*hs*.7);g.lineTo(ex-vx*hs+vy*hs*.7,ey-vy*hs-vx*hs*.7);g.closePath();g.fill();g.globalAlpha=1;}
// a world-space field canvas at CELL px per cell: splat(cb) adds values, paint(px) colours each cell
function mlField(name,key,splat,paint,blur){const F=ML.f[name];if(F&&F.key===key)return F.c;const C=ML.CELL,W=Math.ceil(CMW/C),H=Math.ceil(CMH/C);const t0=performance.now();
  const acc=splat(W,H,C);const c=mlCan(W,H),x=c.getContext('2d'),im=x.createImageData(W,H);paint(acc,im.data,W,H);x.putImageData(im,0,0);let out=c;if(blur){const c2=mlCan(W,H),x2=c2.getContext('2d');x2.filter=`blur(${blur}px)`;x2.drawImage(c,0,0);out=c2;}ML.f[name]={key,c:out,ms:performance.now()-t0};return out;}
function mlBlit(g,c){const s0=c2s(0,0);g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(c,s0.x,s0.y,CMW*CC.z,CMH*CC.z);g.restore();}
function mlSplat(a,W,H,C,px,py,R,fn){const r=Math.ceil(R/C),ci=px/C,cj=py/C;for(let j=Math.max(0,Math.floor(cj-r));j<=Math.min(H-1,Math.ceil(cj+r));j++)for(let i=Math.max(0,Math.floor(ci-r));i<=Math.min(W-1,Math.ceil(ci+r));i++){const dx=(i+.5)*C-px,dy=(j+.5)*C-py;fn(j*W+i,dx,dy);}}
// ---------------------------------------------------------------- Factions
function mlFacField(){const S=siState(),K=Object.keys(SF_DEF);
  return mlField('fac',S.ver+'|'+Object.keys(S.inf).length,(W,H,C)=>{const acc=K.map(()=>new Float32Array(W*H)),sg=88,R=sg*2.6,R2=R*R,s2=2*sg*sg;
    for(const id in S.inf){if(!siTracked(id))continue;const o=S.inf[id],p=tPos(id),h=CG.T[id].own==='song'?S.hold[id]:null;const v=K.map(k=>o[k]*(k===h?1.3:1));
      mlSplat(null,W,H,C,p.x,p.y,R,(q,dx,dy)=>{const d2=dx*dx+dy*dy;if(d2>R2)return;const f=Math.exp(-d2/s2);for(let n=0;n<4;n++)if(v[n]>0)acc[n][q]+=v[n]*f;});}
    return acc;},(acc,d,W,H)=>{const rgb=K.map(k=>mlRGB(ML_TINT[k]||SF_DEF[k].col)),top=new Int8Array(W*H).fill(-1);
    for(let q=0;q<W*H;q++){let a=0,b=1;if(acc[1][q]>acc[0][q]){a=1;b=0;}for(let n=2;n<4;n++){if(acc[n][q]>acc[a][q]){b=a;a=n;}else if(acc[n][q]>acc[b][q])b=n;}
      const va=acc[a][q],vb=acc[b][q];if(va<6)continue;top[q]=a;const t=vb/(va+vb),mx=t>.32?Math.min(.5,(t-.32)/.18*.5):0;
      const o=q*4;d[o]=rgb[a][0]*(1-mx)+rgb[b][0]*mx;d[o+1]=rgb[a][1]*(1-mx)+rgb[b][1]*mx;d[o+2]=rgb[a][2]*(1-mx)+rgb[b][2]*mx;d[o+3]=Math.min(140,va*1.3)*(1+mx*.25);}
    for(let j=0;j<H-1;j++)for(let i=0;i<W-1;i++){const q=j*W+i,a=top[q];if(a<0)continue;const r=top[q+1],u=top[q+W];if((r>=0&&r!==a)||(u>=0&&u!==a)){const o=q*4;d[o]*=.55;d[o+1]*=.55;d[o+2]*=.55;d[o+3]=Math.min(200,d[o+3]+70);}}},1.1);}
function mlContested(id){const o=siState().inf[id];if(!o||!siTracked(id))return null;const [a,b]=siTop(o);return o[b]>=25&&o[a]-o[b]<12?[a,b]:null;}
function mlDrawFac(g,sc){const S=siState();mlBlit(g,mlFacField());const mo=campaignMonth();
  for(const p of S.push||[])if(p.mo===mo)mlArrow(g,p.f,p.t,SF_DEF[p.k].col,Math.min(5,1.5+p.g)*sc,.85);
  for(const id in S.inf){const q=mlScr(id);if(!mlVis(q))continue;const c=mlContested(id),h=sfOf(id);
    if(c){g.lineWidth=4*sc;for(let i=0;i<2;i++){g.strokeStyle=SF_DEF[c[i]].col;g.beginPath();g.arc(q.x,q.y,19*sc,Math.PI*(i?.5:-.5),Math.PI*(i?1.5:.5));g.stroke();}mlTag(g,'⚔ '+Tz('争','contested'),q.x,q.y-30*sc,'rgba(90,20,12,.92)','#ffe0c0',10*sc);}
    else if(h){g.strokeStyle=SF_DEF[h].col;g.lineWidth=2.5*sc;g.beginPath();g.arc(q.x,q.y,17*sc,0,TAU);g.stroke();}}
  for(const e of S.ev)if(e.ty==='flip'&&e.t){const q=mlScr(e.t);if(mlVis(q))mlTag(g,`🚩 ${Tz('易帜','flipped')} → ${Tz(SF_SHORT[e.k][0],SF_SHORT[e.k][1])}`,q.x,q.y+34*sc,SF_DEF[e.k].col,'#fff',10*sc);}
  for(const k in SF_DEF){const ts=sfTowns(k);if(!ts.length)continue;let x=0,y=0,n=0;for(const id of ts){const p=tPos(id);x+=p.x*siTownW(id);y+=p.y*siTownW(id);n+=siTownW(id);}const q=c2s(x/n,y/n);
    mlText(g,`${S.rank[k]} · ${Tz(SF_DEF[k].zh,SF_SHORT[k][1])}`,q.x,q.y-44*sc,SF_DEF[k].col,15*sc);mlText(g,`${Tz('权势','power')} ${S.pow[k]} · ${ts.length}${Tz('城',' towns')}`,q.x,q.y-28*sc,'#f8e6b8',11*sc);}}
// ---------------------------------------------------------------- Bandit threat
function mlRaidR(){const kx=CGEO.k*CGEO.s,ky=CGEO.s;return {rx:BD.RAID_R*kx,ry:BD.RAID_R/1.2*ky};}
function mlThreatField(){const B=bdState(),key='adjacent:'+B.list.map(b=>b.id+b.men+(b.quiet>0?'q':'')+raidNeighbours(b.id,'bandit').join()).join(',');
 return mlField('threat',key,(W,H,C)=>{const a=new Float32Array(W*H);for(const b of B.list){if(!bdActive(b))continue;const d=bdDef(b.id),p=cwp(d.lon,d.lat),s=Math.min(1,.35+b.men/BD.CAP)*(b.quiet>0?.45:1);for(const id of raidNeighbours(b.id,'bandit')){const t=tPos(id);for(let i=0;i<=12;i++){const x=lerp(p.x,t.x,i/12),y=lerp(p.y,t.y,i/12);mlSplat(null,W,H,C,x,y,34,(q,dx,dy)=>{const n=Math.hypot(dx,dy)/34;if(n<1)a[q]=Math.max(a[q],s*(1-n));});}}}return a;},
 (a,d,W,H)=>{for(let q=0;q<W*H;q++){const v=Math.min(1,a[q]);if(v<=.01)continue;const o=q*4;d[o]=255;d[o+1]=210-150*v;d[o+2]=70-50*v;d[o+3]=40+120*v;}});}
function mlExposure(id){const B=bdState(),thr=B.list.filter(b=>bdActive(b)&&raidAdjacent(b.id,id,'bandit'));if(!thr.length)return null;const def=bdPow(bdHere(id)),need=Math.max(...thr.map(bdStr))*.9;
  const per=(UT.spear&&UT.spear.pow)||1;const add=Math.max(0,Math.ceil((need-def)/per/10)*10);return {thr,def:Math.round(def),need:Math.round(need),safe:def>=need,add};}
function mlDrawThreat(g,sc){const B=bdState();mlBlit(g,mlThreatField());
  for(const b of B.list){if(!bdActive(b)||b.quiet>0)continue;const tg=bdTarget(b);if(!tg)continue;const s=bdScreen(b.id),e=mlScr(tg);g.setLineDash([7,6]);g.strokeStyle='rgba(150,20,10,.85)';g.lineWidth=2.2*sc;g.beginPath();g.moveTo(s.x,s.y);g.lineTo(e.x,e.y);g.stroke();g.setLineDash([]);
    mlTag(g,Tz('下次劫掠？','next raid?'),(s.x+e.x)/2,(s.y+e.y)/2,'rgba(120,20,10,.9)','#ffd8c8',10*sc);}
  for(const t of CL.terr){const id=t.id,o=CG.T[id].own;if(o!=='qh'&&o!=='song'&&o!=='free')continue;const X=mlExposure(id);if(!X)continue;const q=mlScr(id);if(!mlVis(q))continue;
    if(o==='qh'){const s=X.safe?`🛡 ${Tz('守备足','Guarded')} ${X.def}/${X.need}`:`⚠ ${Tz('守备不足','Exposed')} ${X.def}/${X.need} · ${Tz('宜增兵','post')} +${X.add}${Tz('人',' men')}`;mlTag(g,s,q.x,q.y+40*sc,X.safe?'rgba(40,90,40,.92)':'rgba(150,30,16,.95)','#fff',11*sc);}
    else{g.strokeStyle=o==='song'?'rgba(200,120,60,.85)':'rgba(220,60,40,.9)';g.lineWidth=2*sc;g.setLineDash([3,3]);g.beginPath();g.arc(q.x,q.y,15*sc,0,TAU);g.stroke();g.setLineDash([]);}}}
// ---------------------------------------------------------------- Supply
function mlSupplyTree(){const par={},q=[HOME];par[HOME]=null;while(q.length){const a=q.shift();for(const b of CADJ[a])if(par[b]===undefined&&SUPP.has(b)){par[b]=a;q.push(b);}}return par;}
function mlCut(){const out=[];for(const id in CG.T)if(owned(id)&&!SUPP.has(id))out.push(id);for(const a of CG.armies||[])if(!armySupplied(a))out.push(a.loc);return [...new Set(out)];}
function mlSupplyField(){const cut=mlCut(),key=[...SUPP].join(',')+'|'+cut.join(',');
  return mlField('supply',key,(W,H,C)=>{const a=[new Float32Array(W*H),new Float32Array(W*H)];const R=110,R2=R*R;
    for(const id of SUPP){const p=tPos(id),w=owned(id)?1.4:.8;mlSplat(null,W,H,C,p.x,p.y,R,(q,dx,dy)=>{const d2=dx*dx+dy*dy;if(d2<R2)a[0][q]=Math.max(a[0][q],w*(1-d2/R2));});}
    for(const id of cut){const p=tPos(id);mlSplat(null,W,H,C,p.x,p.y,R*1.2,(q,dx,dy)=>{const d2=dx*dx+dy*dy;if(d2<R2*1.44)a[1][q]=Math.max(a[1][q],1-d2/(R2*1.44));});}return a;},
    (a,d,W,H)=>{for(let q=0;q<W*H;q++){const g=Math.min(1,a[0][q]),r=a[1][q],o=q*4;if(r>.02){d[o]=200;d[o+1]=50;d[o+2]=30;d[o+3]=60+130*r;}else if(g>.02){d[o]=80;d[o+1]=170;d[o+2]=70;d[o+3]=40+90*g;}}});}
function mlDrawSupply(g,sc){mlBlit(g,mlSupplyField());const par=mlSupplyTree();
  for(const id in par){const p=par[id];if(!p)continue;const own=owned(id)||owned(p);g.strokeStyle='rgba(20,40,10,.6)';g.lineWidth=(own?7:4)*sc;mlCurve(g,p,id);g.stroke();g.strokeStyle=own?'#9fe07a':'#c8e890';g.lineWidth=(own?4.5:2.6)*sc;mlCurve(g,p,id);g.stroke();}
  for(const id of SUPP)for(const b of CADJ[id])if(!SUPP.has(b)&&CG.T[b].own!=='xia'){const m=mlMid(id,b);g.setLineDash([4,4]);g.strokeStyle='rgba(220,70,50,.9)';g.lineWidth=2*sc;g.beginPath();g.moveTo(m.s.x,m.s.y);g.lineTo(m.x,m.y);g.stroke();g.setLineDash([]);}
  const h=mlScr(HOME);mlTag(g,Tz('粮台 · 补给之源','Depot · supply source'),h.x,h.y+42*sc,'rgba(40,90,40,.95)','#fff',11*sc);
  for(const id of mlCut()){const q=mlScr(id);g.strokeStyle='#ff6a50';g.lineWidth=3*sc;g.setLineDash([5,4]);g.beginPath();g.arc(q.x,q.y,26*sc,0,TAU);g.stroke();g.setLineDash([]);mlTag(g,`✕ ${Tz('补给断绝','Cut off')}`,q.x,q.y+40*sc,'rgba(150,30,16,.95)','#fff',11*sc);}}
// ---------------------------------------------------------------- Trade
function mlSongRoads(){const out=[];for(const [a,b] of CL.links){const A=CG.T[a],B=CG.T[b];if(A.own!=='song'||B.own!=='song')continue;const v=Math.round(3+2*(siTownW(a)+siTownW(b)));out.push({a,b,v,k:sfOf(a)===sfOf(b)?sfOf(a):null});}return out;}
function mlCharters(){const out=[];for(const [a,b] of CL.links)for(const [x,y] of [[a,b],[b,a]]){const X=CG.T[x],Y=CG.T[y];if(X.own==='qh'&&X.bld.market>0&&Y.own==='song'&&!CG.trade[y]){const v=Math.round(6+3*(tierOf(X.prosp)+3)+2*(X.bld.market+(Y.bld.market||0))+8+(CT[y].kind==='city'?10:0));out.push({a:x,b:y,v});}}return out;}
function mlChokers(a,b){const B=bdState(),A=CT[a],Bt=CT[b],mx=(A.lon+Bt.lon)/2,my=(A.lat+Bt.lat)/2;return B.list.filter(s=>bdActive(s)&&s.quiet<=0&&(raidAdjacent(s.id,a,'bandit')||raidAdjacent(s.id,b,'bandit'))).map(s=>s.id);}
function mlDrawTrade(g,sc){const S=siState(),roads=mlSongRoads(),ch=new Map();
  for(const r of roads){const col=r.k?SF_DEF[r.k].col:'#b89a60';g.strokeStyle='rgba(20,10,4,.45)';g.lineWidth=(2+r.v/5)*sc+2;mlCurve(g,r.a,r.b);g.stroke();g.globalAlpha=.75;g.strokeStyle=col;g.lineWidth=(2+r.v/5)*sc;mlCurve(g,r.a,r.b);g.stroke();g.globalAlpha=1;for(const c of mlChokers(r.a,r.b))(ch.get(c)||ch.set(c,[]).get(c)).push([r.a,r.b]);}
  for(const r of mlCharters()){g.setLineDash([8,6]);g.strokeStyle='rgba(255,215,110,.9)';g.lineWidth=2.5*sc;const m=mlCurve(g,r.a,r.b);g.stroke();g.setLineDash([]);mlTag(g,`${Tz('可通商','charter')} +🪙${r.v}`,m.x,m.y,'rgba(60,40,10,.9)','#ffe7a0',10*sc);}
  for(const r of ROUTES){const bad=r.choke&&r.choke.length;g.strokeStyle='rgba(20,10,4,.7)';g.lineWidth=(4+Math.min(8,r.v/5))*sc+2;mlCurve(g,r.a,r.b);g.stroke();g.strokeStyle=bad?'#e0502c':(r.blk?SF_DEF[r.blk].col:'#ffd25a');g.lineWidth=(4+Math.min(8,r.v/5))*sc;const m=mlCurve(g,r.a,r.b);g.stroke();
    mlTag(g,`🪙${r.v}${r.mul&&Math.abs(r.mul-1)>.01?` ×${r.mul.toFixed(2)}`:''}`,m.x,m.y,'rgba(30,18,10,.92)',bad?'#ffb0a0':'#ffe7a0',11*sc);for(const c of r.choke||[])(ch.get(c)||ch.set(c,[]).get(c)).push([r.a,r.b]);}
  for(const [c,ls] of ch){const f=bdScreen(c);for(const [a,b] of ls){const m=mlMid(a,b);g.setLineDash([3,4]);g.strokeStyle='rgba(200,40,20,.8)';g.lineWidth=1.5*sc;g.beginPath();g.moveTo(f.x,f.y);g.lineTo(m.x,m.y);g.stroke();g.setLineDash([]);
      g.fillStyle='rgba(170,30,15,.95)';g.beginPath();g.arc(m.x,m.y,8*sc,0,TAU);g.fill();mlText(g,'✕',m.x,m.y+4*sc,'#fff',11*sc);}
    mlTag(g,Tz(`扼守${ls.length}路 −20%`,`chokes ${ls.length} road${ls.length>1?'s':''} −20%`),f.x,f.y-40*sc,'rgba(150,30,16,.95)','#fff',10*sc);}
  for(const x of S.blk||[]){const m=mlMid(x.a,x.b);mlTag(g,`⛔ ${Tz(SF_SHORT[x.k][0]+'氏封锁',SF_SHORT[x.k][1]+' blockade')}`,m.x,m.y-16*sc,SF_DEF[x.k].col,'#fff',10*sc);}}
// ---------------------------------------------------------------- legends, hover and tap info
const ML_LEG={fac:()=>Object.keys(SF_DEF).map(k=>`<span><i style="background:${ML_TINT[k]}"></i>${Ts(SF_SHORT[k][0],SF_SHORT[k][1])}</span>`).join('')+`<span><i class="ring2"></i>${Ts('争夺','contested')}</span><span>➜ ${Ts('本月扩张','pushed this month')}</span><span>🚩 ${Ts('易帜','flipped')}</span>`,
  threat:()=>`<span><i style="background:linear-gradient(90deg,#ffd246,#ff3c14)"></i>${Ts('劫掠范围','raid range')}</span><span>⚠ ${Ts('守备不足（需增兵）','exposed (men needed)')}</span><span>🛡 ${Ts('守备足','guarded')}</span><span>┅ ${Ts('下次劫掠','next raid')}</span>`,
  supply:()=>`<span><i style="background:#9fe07a"></i>${Ts('补给线','supply line')}</span><span><i style="background:rgba(90,170,80,.6)"></i>${Ts('补给所及','supplied')}</span><span><i style="background:#c83220"></i>${Ts('断绝','cut off')}</span><span>┅ ${Ts('补给尽头','supply ends')}</span>`,
  trade:()=>`<span><i style="background:#ffd25a"></i>${Ts('你的商路','your routes')}</span><span><i style="background:#b89a60"></i>${Ts('宋境商道','Song roads')}</span><span>┅ ${Ts('可通商','charter')}</span><span>✕ ${Ts('山寨扼守','choked by bandits')}</span><span>⛔ ${Ts('派系封锁','blockade')}</span>`};
const ML_CSS=`.sw-leg{display:flex;flex-basis:100%;justify-content:center;flex-wrap:wrap;gap:2px 10px;font-size:11px;color:var(--sw-cream);opacity:.9;margin-top:2px}.sw-leg span{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.sw-leg i{display:inline-block;width:14px;height:8px;border-radius:3px}.sw-leg i.ring2{width:10px;height:10px;border-radius:50%;border:2px solid;border-color:#b5452c #a37b38 #a37b38 #b5452c;box-sizing:border-box}
.sw-lay{font-size:12px;border-left:3px solid var(--sw-gold);padding-left:8px;line-height:1.5}`;
(function(){if(document.getElementById('mlCss'))return;const st=document.createElement('style');st.id='mlCss';st.textContent=ML_CSS;document.head.appendChild(st);})();
{const old=campUI;campUI=function(){const r=old.apply(this,arguments);if(MODE!=='camp'||!CG)return r;try{const L=rsLayer(),bar=document.getElementById('swLayers');if(L&&bar&&ML_LEG[L]){const e=rsEl('div','sw-leg',ML_LEG[L]());e.id='swLegend';e.dataset.layer=L;bar.appendChild(e);}}catch(e){console.error(e);}return r;};}
function mlInfo(id,L,tz){const Ts=tz?Tz:window.Ts;L=L||rsLayer();if(!L||!CG.T[id])return '';const s=CG.T[id];
  if(L==='fac'){const S=siState(),o=S.inf[id];if(!o)return s.own==='qh'?Ts('清河自有之地','Qinghe\'s own land'):'';const [a,b]=siTop(o),h=sfOf(id)||siPatron(id),c=mlContested(id),p=(S.push||[]).find(x=>x.t===id&&x.mo===campaignMonth());
    const who=h?`${s.own==='song'?Ts('辖于','Held by'):Ts('倚','Leans to')} ${Ts(SF_SHORT[h][0]+'氏',SF_SHORT[h][1])}`:Ts('无所倚','No patron');
    return `${who} · ${Ts(SF_SHORT[a][0],SF_SHORT[a][1])} ${Math.round(o[a])} / ${Ts(SF_SHORT[b][0],SF_SHORT[b][1])} ${Math.round(o[b])}${c?' · ⚔ '+Ts('争夺中','contested'):''}${p?' · ➜ '+Ts(SF_SHORT[p.k][0]+'氏扩张',SF_SHORT[p.k][1]+' pushing'):''}`;}
  if(L==='threat'){const X=mlExposure(id);if(!X)return Ts('不在山寨劫掠范围内','Out of any stronghold\'s reach');const n=X.thr.map(b=>`${Tz(bdDef(b.id).zh,bdDef(b.id).en)} ${b.men}`).join(', ');
    return s.own==='qh'?`${n} · ${Ts('守备','garrison')} ${X.def}/${X.need}${X.safe?' 🛡':' · ⚠ '+Ts('宜增兵','post')+' +'+X.add+Ts('人',' men')}`:`${n} · ${s.own==='song'?Ts('宋军自守','Song troops hold it'):Ts('无人守护','undefended')}`;}
  if(L==='supply'){if(SUPP.has(id)){const d=bfsDist(HOME,12)[id];return `${Ts('补给通畅','Supplied')} · ${Ts('距粮台','from the depot')} ${d??'?'} ${Ts('程','links')}${owned(id)?'':' · '+Ts('经宋境','via Song roads')}`;}return owned(id)||(CG.armies||[]).some(a=>a.loc===id)?'✕ '+Ts('补给断绝：驻军与部曲士气、兵员受损','Cut off: troops here lose morale and men'):Ts('不在补给网内','Outside the supply network');}
  if(L==='trade'){const rs=ROUTES.filter(r=>r.a===id||r.b===id),cs=mlCharters().filter(r=>r.b===id||r.a===id),bl=(siState().blk||[]).find(x=>x.a===id||x.b===id);
    const parts=[];if(rs.length)parts.push(`${Ts('商路','routes')} ${rs.length} · 🪙${rs.reduce((t,r)=>t+r.v,0)}`);if(cs.length)parts.push(`${Ts('可通商','charter')} +🪙${cs[0].v}`);const ck=rs.flatMap(r=>r.choke||[]);if(ck.length)parts.push('✕ '+Tz(bdDef(ck[0]).zh,bdDef(ck[0]).en));if(bl)parts.push('⛔ '+Ts(SF_SHORT[bl.k][0]+'氏封锁',SF_SHORT[bl.k][1]+' blockade'));return parts.join(' · ')||Ts('无商路','No trade here');}
  return '';}
{const old=drawHover;drawHover=function(g){const r=old.apply(this,arguments);try{const h=CHOV;if(h&&h.t){const s=mlInfo(h.t,null,1);if(s){g.font='12px sans-serif';const w=g.measureText(s).width+14;g.fillStyle='rgba(58,16,10,.94)';g.fillRect(MOUSE.x+14,MOUSE.y+33,w,20);g.fillStyle='#ffd8b0';g.textAlign='left';g.fillText(s,MOUSE.x+21,MOUSE.y+47);}}}catch(e){}return r;};}
{const old=terrPanel;terrPanel=function(id){const w=old.apply(this,arguments);try{const L=rsLayer(),s=w&&L&&mlInfo(id,L);if(s){const e=rsEl('div','sw-lay',`<b>${Ts(RS.LAYERS.find(x=>x[0]===L)[1],RS.LAYERS.find(x=>x[0]===L)[2])}</b> · ${s}`);e.dataset.layinfo=L;w.insertBefore(e,w.children[1]||null);}}catch(e){console.error(e);}return w;};}
// ---------------------------------------------------------------- the layer pass (static) and the live pass
rsDrawLayers=function(g){if(!CG)return;const L=rsLayer(),sc=iconScale(),B=bdState();g.save();
  try{if(L==='fac')mlDrawFac(g,sc);else if(L==='threat')mlDrawThreat(g,sc);else if(L==='supply')mlDrawSupply(g,sc);else if(L==='trade')mlDrawTrade(g,sc);}catch(e){console.error(e);}g.restore();
  for(const b of B.list){const q=bdScreen(b.id);if(q.x<-60||q.x>VW+60||q.y<-60||q.y>VH+60)continue;rsDrawFort(g,q.x,q.y,sc,b);}};
function mlFlow(g,a,b,v,col,sp){const m=mlMid(a,b);if(!mlVis(m,40))return;const n=Math.max(1,Math.min(4,Math.round(v/10))),sz=Math.max(2.5,Math.min(5,1.5+v/12));g.fillStyle=col;
  for(let i=0;i<n;i++){const t=((CTIME*sp/Math.max(60,Math.hypot(m.e.x-m.s.x,m.e.y-m.s.y)))+i/n+siH(a,b)*.5)%1,u=1-t;const x=u*u*m.s.x+2*u*t*m.x+t*t*m.e.x,y=u*u*m.s.y+2*u*t*m.y+t*t*m.e.y;g.fillRect(x-sz/2,y-sz/2,sz,sz);}}
function mlLive(g){if(!CG||MODE!=='camp')return;const sc=iconScale(),S=CG.sf&&CG.sf.si?CG.sf:null;
  if(rsLayer()==='trade'){g.strokeStyle='rgba(20,10,4,.8)';for(const r of mlSongRoads())mlFlow(g,r.a,r.b,r.v,'#fff2c0',38);for(const r of ROUTES)mlFlow(g,r.a,r.b,r.v,'#ffe070',60);}
  if(S){const mo=campaignMonth();for(const e of S.ev){if(!e.t||e.mo<mo-1)continue;const q=mlScr(e.t);if(!mlVis(q))continue;const ph=(CTIME*1.4+siH(e.t,e.ty)%1)%1,col=SF_DEF[e.k].col;
    g.globalAlpha=(1-ph)*.9;g.strokeStyle=col;g.lineWidth=3*sc;g.beginPath();g.arc(q.x,q.y,(16+ph*26)*sc,0,TAU);g.stroke();g.globalAlpha=1;
    g.font=`${Math.round(15*sc)}px sans-serif`;g.textAlign='center';g.fillText(SI_ACT[e.ty][0],q.x+18*sc,q.y-16*sc);}}}
{const old=drawCaravans;drawCaravans=function(g){const r=old.apply(this,arguments);try{mlLive(g);}catch(e){console.error(e);}return r;};}
window.__ml={ML,mlInfo,mlFacField,mlThreatField,mlSupplyField,mlExposure,mlCharters,mlSongRoads,mlSupplyTree,mlCut,mlContested,ML_LEG,V:ML.V};
