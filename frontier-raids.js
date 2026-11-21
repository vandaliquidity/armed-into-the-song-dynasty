// v0.49 (t258) the tribes at the edge of the map. Western Xia horde bands and the unsubmitted Qiang clans (生羌) of the Tao and Huang
// valleys loot the frontier villages every month, and gather now and then for a great invasion that marches in columns on the
// prefecture seats. Everything they do moves the politics of the frontier.
//  - Raids: each month each tribe sends 0-3 raiding bands (more in autumn when the horses are fat, more with its strength, at weakly
//    held villages within reach). A band either is driven off by the garrison or loots: grain, silver, horses and hides, captives, a
//    building burned, prosperity lost. On the map the band rides in under its yak-tail standard, the village burns, and the band rides
//    home with its loot trailing behind it.
//  - Invasions: when the horde is strong, the season right and the border thin, it gathers. Warning signs come first: scouts seen on the
//    border (month 1), beacon fires along the roads and refugees fleeing inward (month 2); then two or three columns march one road link a
//    month on the prefecture seats. Song towns fight with their garrison plus the bloc's relief force; Qinghe's towns are attacked as
//    normal campaign battles; won fights sack the town (the Xia keep border villages and forts they take).
//  - Political ripple: a bloc whose circuit is hit loses wealth, troops and power and begs Qinghe for aid; blocs blame each other for open
//    borders, or Qinghe for failing to defend; the court reprimands those who lose towns and sends commissions to those who hold.
//    Repelling an invasion gives Qinghe prestige, merit and renown (renown feeds its power, so the blocs grow warier). Lost and sacked
//    towns send refugees to their neighbours (more people, but unrest).
//  - Threat layer: tribal reach, raid risk per town, warning signs and invasion routes. Tribal art: yurt camps, black yak-hair tents,
//    tug standards, horse herds, fur-capped horse archers (Blender, art/map_icons.py + art/models.py t258).
'use strict';
const FR={V:'t258a',START:3,INV_START:8,QR:1.0,STEP:12};
const FR_CAMPS=[
 {id:'qingtang',zh:'青唐羌帐',en:'Qingtang Qiang camp',lon:102.86,lat:36.42,men:420},
 {id:'hezhouq',zh:'河州生羌',en:'Hezhou Qiang clans',lon:102.82,lat:35.22,men:360},
 {id:'taozhou',zh:'洮州羌部',en:'Tao River Qiang',lon:103.42,lat:34.6,men:380}];
const FR_TRIBE={xia:{zh:'西夏',en:'Xia',zh2:'夏骑',en2:'Xia riders',col:'#4a5a78',ring:'rgba(90,110,150,',spr:'xia_raider',foot:'xia_foot',heavy:'xia_iron',ch:'夏'},
  qiang:{zh:'生羌',en:'Qiang',zh2:'羌骑',en2:'Qiang riders',col:'#2f5f8a',ring:'rgba(60,120,170,',spr:'qiang_raider',foot:'qiang_foot',heavy:'qiang_raider',ch:'羌'}};
const FR_SEASON=[.6,.85,1.6,1.1];
function frState(){const F=CG.fr||(CG.fr={v:1,str:{xia:3000,qiang:1100},camps:{},bands:[],inv:null,invNext:{xia:FR.INV_START,qiang:FR.INV_START+6},warn:[],ref:[],log:[],aid:{},id:1,mo:campaignMonth(),
  stats:{raids:0,looted:0,repelled:0,inv:0,invRepelled:0,lost:0}});for(const c of FR_CAMPS)if(!F.camps[c.id])F.camps[c.id]={men:c.men};F.aid=F.aid||{};F.ref=F.ref||[];F.warn=F.warn||[];return F;}
function frCamp(id){return FR_CAMPS.find(c=>c.id===id);}
function frPos(id){const c=frCamp(id);if(c)return c._p||(c._p=cwp(c.lon,c.lat));return tPos(id);}
function frScr(id){const p=frPos(id);return c2s(p.x,p.y);}
function frName(id){const c=frCamp(id)||CT[id];return [c.zh,c.en];}
function frHit(o){return o==='qh'||o==='song'||o==='free';}
function frXiaSources(){return Object.keys(CG.T).filter(id=>CG.T[id].own==='xia'&&(CG.T[id].str||0)>=120&&CADJ[id].some(n=>frHit(CG.T[n].own)));}
function frDef(id){const s=CG.T[id];let d=s.own==='qh'?garrison(id):s.own==='song'?(s.songGarrison?.men||0):Math.min(120,s.str||40);
  const k=CT[id].kind,f=(k==='city'?1.8:k==='fort'||k==='pass'?1.5:k==='town'?1.2:1)*(1+(s.bld?.wall||0)*.15);return {men:d,v:Math.round(d*f)};}
function frGeo(a,b){const A=frCamp(a)||CT[a],B=frCamp(b)||CT[b];return Math.hypot((A.lon-B.lon)*.82,A.lat-B.lat);}
function frTargets(tr,src){let ids;if(tr==='xia'){const d=bfsDist(src,2);ids=Object.keys(d).filter(id=>d[id]>0&&frHit(CG.T[id].own));}
  else ids=CL.terr.filter(t=>frHit(CG.T[t.id].own)&&frGeo(src,t.id)<=FR.QR).map(t=>t.id);
  return ids.filter(id=>CT[id].kind!=='city'||frDef(id).men<60).map(id=>{const s=CG.T[id],D=frDef(id);const val=(10+(s.prosp||0)*.5+(s.pop||0)/150+(s.own==='qh'?10:0))*(s.own==='free'?.5:1);return {id,sc:val/(1+D.v/60)};}).sort((a,b)=>b.sc-a.sc||a.id.localeCompare(b.id));}
function frRisk(id){const s=CG.T[id];if(!s||!frHit(s.own))return null;const D=frDef(id),thr=[];
  for(const src of frXiaSources())if((bfsDist(src,2)[id]||9)<=2)thr.push({tr:'xia',src,men:frBandMen(frState(),'xia',src)});
  const F=frState();for(const c of FR_CAMPS)if(frGeo(c.id,id)<=FR.QR)thr.push({tr:'qiang',src:c.id,men:frBandMen(F,'qiang',c.id)});
  if(!thr.length)return null;const top=Math.max(...thr.map(t=>t.men));const ratio=top*1.25/Math.max(1,D.v);return {thr,top,def:D.v,lvl:ratio>1.2?2:ratio>.7?1:0,ratio};}
// drawing-side memo: risk and Xia sources change at most with the month or a garrison move; recompute every 2 s
const FR_MEMO={k:null,risk:{},src:null};function frMemo(){const k=campaignMonth()+'|'+Math.floor(performance.now()/2000);if(FR_MEMO.k!==k){FR_MEMO.k=k;FR_MEMO.risk={};FR_MEMO.src=null;}return FR_MEMO;}
function frRiskM(id){const M=frMemo();return id in M.risk?M.risk[id]:(M.risk[id]=frRisk(id));}
function frSrcM(){const M=frMemo();return M.src||(M.src=frXiaSources());}
// ---- a raid
function frLoot(id,men,h){const s=CG.T[id],L={grain:0,silver:0,horse:0,hide:0,cap:0,burn:null};
  if(s.own==='qh'){L.grain=take(id,'grain',Math.round(Math.min((s.st.grain||0)*.35,men*2)),false)||0;L.horse=take(id,'horse',Math.round(Math.min((s.st.horse||0)*.4,men*.1)),false)||0;L.hide=take(id,'hide',Math.round(Math.min((s.st.hide||0)*.4,men*.3)),false)||0;
    if(id===HOME||CT[id].kind!=='village'){L.silver=Math.round(Math.min((CAMP.res.silver||0)*.05,70));CAMP.res.silver-=L.silver;}
    const ks=Object.keys(s.bld||{}).filter(k=>k!=='wall'&&s.bld[k]>0).sort();if(ks.length&&h<.6){L.burn=ks[Math.floor(h*ks.length/.6)%ks.length];s.bld[L.burn]--;}s.raided=1;}
  else{L.grain=Math.round(men*1.2);L.silver=Math.round(10+(s.prosp||0)*.4);L.horse=Math.round(men*.05);}
  L.cap=Math.round((s.pop||0)*.03);s.pop=Math.max(50,(s.pop||0)-L.cap);s.prosp=Math.max(0,(s.prosp||0)-10);if(s.own==='song'&&s.songGarrison)s.songGarrison.men=Math.round(s.songGarrison.men*.85);return L;}
function frRaid(F,tr,src,id,men,lines,R){const s=CG.T[id],D=frDef(id),h1=siH('fd',id,F.mo,R),h2=siH('fa',src,F.mo,R),mo=F.mo,T=FR_TRIBE[tr],nm=CT[id];
  const A=men*(.85+.3*h2)*1.25,Dv=D.v*(.85+.3*h1),b={id:F.id++,tr,src,to:id,men,mo,own:s.own,k:s.own==='song'?sfOf(id):null};F.stats.raids++;
  if(Dv>=A){b.res='repelled';b.men=Math.round(men*.6);if(tr==='xia')CG.T[src].str=Math.max(0,CG.T[src].str-Math.round(men*.4));else F.camps[src].men=Math.max(60,F.camps[src].men-Math.round(men*.4));F.stats.repelled++;
    if(s.own==='qh'){const T2=stState();T2.qren=(T2.qren||0)+3;CAMP.res.rep=(CAMP.res.rep||0)+1;for(const u of unitsAt(id))u.men=Math.max(10,Math.round(u.men*.97));}else if(s.own==='song'&&s.songGarrison)s.songGarrison.men=Math.round(s.songGarrison.men*.92);
    lines.push(['🛡',Ts(`${T.zh2}${men}来掠${nm.zh}，为守军击退`,`${men} ${T.en2} rode on ${nm.en} and were driven off by the garrison`)]);}
  else{b.res='looted';b.loot=frLoot(id,men,siH('fl',id,mo,R));F.stats.looted++;if(tr==='qiang')F.camps[src].men=Math.min(900,F.camps[src].men+Math.round(men*.08));else F.str.xia+=Math.round(men*.1);
    const L=b.loot,gz=[],ge=[];if(L.grain){gz.push(`粮${L.grain}`);ge.push(`${L.grain} grain`);}if(L.silver){gz.push(`银${L.silver}`);ge.push(`${L.silver} silver`);}if(L.horse){gz.push(`马${L.horse}`);ge.push(`${L.horse} horses`);}if(L.hide){gz.push(`皮${L.hide}`);ge.push(`${L.hide} hides`);}if(L.cap){gz.push(`掳走${L.cap}口`);ge.push(`${L.cap} captives`);}
    const dn=L.burn&&typeof DEV!=='undefined'&&DEV[L.burn]?DEV[L.burn]:{zh:L.burn,en:L.burn},bz=L.burn?`，焚其${dn.zh}`:'',be=L.burn?`, burned the ${String(dn.en).toLowerCase()}`:'';
    lines.push(['🔥',Ts(`${T.zh2}${men}劫掠${nm.zh}：${gz.join('、')}${bz}`,`${men} ${T.en2} looted ${nm.en}: ${ge.join(', ')}${be}`)]);}
  F.bands.push(b);return b;}
function frRaids(F,tr,lines){const mo=F.mo,sea=FR_SEASON[seasonOf(CG.turn)]||1,D=[.75,1,1.3][CG.diff??1]||1;
  const srcs=tr==='xia'?frXiaSources():FR_CAMPS.map(c=>c.id);if(!srcs.length)return;
  const rate=(tr==='xia'?.9:.6)*sea*(.6+F.str[tr]/(tr==='xia'?7000:2500))*D;const n=Math.min(3,Math.floor(rate+siH('frn',tr,mo)));
  const used=new Set(F.bands.filter(b=>b.mo===mo).map(b=>b.to));
  for(let i=0;i<n;i++){const src=srcs[Math.floor(siH('frs',tr,mo,i)*srcs.length)];const c=frTargets(tr,src).filter(t=>!used.has(t.id)&&!(F.inv&&F.inv.cols.some(cl=>cl.path.includes(t.id))));if(!c.length)continue;
    const men=frBandMen(F,tr,src);if(men<40)continue;const soft=c.filter(t=>frDef(t.id).v<men*1.4),cc=soft.length?soft:c.slice(0,6).sort((a,b)=>frDef(a.id).v-frDef(b.id).v||a.id.localeCompare(b.id)).slice(0,2);
    const pick=cc[Math.min(cc.length-1,Math.floor(Math.pow(siH('frp',tr,mo,i),2)*Math.min(4,cc.length)))];used.add(pick.id);frRaid(F,tr,src,pick.id,men,lines,i);}}
function frBandMen(F,tr,src){return tr==='xia'?Math.round(Math.min(CG.T[src].str*.3,120+F.str.xia/25)):Math.round(F.camps[src].men*.5);}
// ---- invasions
function frPath(from,to,tr){const prev={[from]:null},q=[from];for(const at of q){if(at===to)break;for(const n of CADJ[at]||[])if(!(n in prev)&&CG.T[n]&&(CG.T[n].own!=='xia'||tr==='xia')){prev[n]=at;q.push(n);}}
  if(!(to in prev))return null;const p=[];for(let at=to;at!=null;at=prev[at])p.unshift(at);return p;}
function frNearTown(cid){let best=null,bd=9;for(const t of CL.terr)if(frHit(CG.T[t.id].own)){const d=frGeo(cid,t.id);if(d<bd){bd=d;best=t.id;}}return best;}
function frSeats(tr){const ownN=Object.keys(CG.T).filter(owned).length;return CL.terr.filter(t=>{const s=CG.T[t.id];if(!s||!['song','qh'].includes(s.own))return false;if(t.id===HOME&&ownN<5)return false;return t.kind==='city'||(s.own==='qh'&&['town','fort'].includes(t.kind));}).map(t=>t.id);}
function frPlan(F,tr,lines){const mo=F.mo,srcs=tr==='xia'?frXiaSources():FR_CAMPS.map(c=>c.id);if(!srcs.length)return null;const seats=frSeats(tr),cols=[];
  for(const s of srcs){const start=tr==='xia'?s:frNearTown(s);if(!start)continue;for(const t of seats){const p=frPath(start,t,tr);if(!p)continue;const path=tr==='xia'?p:[s,...p];const L=path.length-1;if(L<1||L>5)continue;
      cols.push({src:s,to:t,path,sc:(CT[t].pop||1000)/1000/(1+frDef(t).v/400)/L+siH('frc',s,t,mo)*.3});}}
  if(!cols.length)return null;cols.sort((a,b)=>b.sc-a.sc);const pick=[],usedS=new Set(),usedT=new Set();
  for(const c of cols){if(pick.length>=(F.str[tr]>(tr==='xia'?4500:1800)?3:2))break;if(usedS.has(c.src)||usedT.has(c.to))continue;usedS.add(c.src);usedT.add(c.to);pick.push(c);}
  const men=Math.round(F.str[tr]*.65);F.str[tr]-=men;const T=FR_TRIBE[tr];
  const inv={tr,stage:'scout',mo0:mo,men,cols:pick.map((c,i)=>({id:i+1,src:c.src,to:c.to,path:c.path,step:0,men:Math.round(men/pick.length),state:'wait'})),relief:{},beat:0,qhBeat:0};
  inv.warn=[...new Set(inv.cols.map(c=>c.path[tr==='xia'?1:1]).filter(Boolean))];F.inv=inv;F.stats.inv++;
  lines.push(['👁',Ts(`边地哨探回报：${T.zh}游骑屡现于${inv.warn.map(id=>CT[id]?.zh||'').join('、')}一带`,`Border scouts report ${T.en} outriders around ${inv.warn.map(id=>CT[id]?.en||'').join(', ')}`)]);return inv;}
function frRefugees(F,id,n,lines){const nb=CADJ[id].filter(x=>CG.T[x]&&frHit(CG.T[x].own)&&x!==id);if(!nb.length||n<10)return;const per=Math.round(n/nb.length);
  for(const x of nb){const s=CG.T[x];s.pop=(s.pop||0)+per;if(s.own==='qh'){s.prosp=Math.max(0,s.prosp-2);}F.ref.push({from:id,to:x,n:per,mo:F.mo});}
  const q=nb.filter(owned);lines.push(['🚶',Ts(`${CT[id].zh}难民${n}口逃往${nb.slice(0,3).map(x=>CT[x].zh).join('、')}${q.length?'，清河境内人心惶惶':''}`,`${n} refugees flee ${CT[id].en} for ${nb.slice(0,3).map(x=>CT[x].en).join(', ')}${q.length?'; unrest in Qinghe\'s towns':''}`)]);}
function frColFight(F,inv,c,id,lines){const s=CG.T[id],T=FR_TRIBE[inv.tr],nm=CT[id],h=siH('cf',id,c.id,F.mo);
  if(s.own==='qh'&&inv.tr==='xia'){const x={id:CG.xid++,from:c.path[Math.max(0,c.step-1)],to:id,str:c.men,eta:0,faction:'xia',paid:true,frCol:c.id};CG.xa.push(x);c.state='battle';c.xa=x.id;
    lines.push(['⚔',Ts(`${T.zh}大军一路${c.men}人压向清河${nm.zh}！`,`A ${T.en} column of ${c.men} bears down on Qinghe's ${nm.en}!`)]);return;}
  const D=frDef(id),k=s.own==='song'?sfOf(id):null;let relief=0;const S=siState();if(k&&!inv.relief[k]){relief=Math.round(Math.min(S.tr[k]*.08,600));inv.relief[k]=relief;S.tr[k]-=relief;}
  const dv=(D.v+relief*1.2)*(.85+.3*h),av=c.men*(.9+.3*siH('ca',id,c.id,F.mo));
  if(dv>=av){c.men=Math.round(c.men*.45);c.state='routed';inv.beat++;if(k){S.tr[k]+=Math.round(relief*.7);S.cf[k]=Math.min(100,S.cf[k]+6);}if(s.own==='qh'){inv.qhBeat++;}
    if(s.own==='song'&&s.songGarrison)s.songGarrison.men=Math.round(s.songGarrison.men*.7);
    lines.push(['🛡',Ts(`${nm.zh}${k?SF_DEF[k].zh+'援军'+relief+'人与':''}守军大破${T.zh}一路，敌退走`,`${nm.en} holds${k?` with ${relief} relief troops of ${SF_DEF[k].en}`:''}: a ${T.en} column is broken and falls back`)]);
    if(k)lines.push(['📜',Ts(`朝廷遣使嘉奖${SF_DEF[k].zh}守${nm.zh}之功（朝眷+6）`,`The court sends a commission to praise ${SF_DEF[k].en} for holding ${nm.en} (court favour +6)`)]);return;}
  c.men=Math.round(c.men-Math.min(c.men*.4,D.v*.5));const occupy=inv.tr==='xia'&&['village','fort','camp'].includes(CT[id].kind)&&CADJ[id].some(n=>CG.T[n].own==='xia');const refN=Math.round((s.pop||0)*.1);s.pop=Math.max(50,(s.pop||0)-refN);
  s.prosp=Math.max(0,(s.prosp||0)-20);if(s.songGarrison)s.songGarrison.men=Math.round(s.songGarrison.men*.2);
  if(occupy&&s.own!=='qh'){s.own='xia';s.str=Math.round(c.men*.15);c.men-=s.str;delete s.songGarrison;F.stats.lost++;if(S.hold)delete S.hold[id];}
  frRefugees(F,id,refN,lines);F.hitTown=F.hitTown||[];F.hitTown.push({id,k,lost:occupy,inv:1,own:occupy?'song':s.own});
  lines.push(['🔥',occupy?Ts(`${T.zh}攻陷${nm.zh}，据而守之`,`The ${T.en} storm ${nm.en} and hold it`):Ts(`${T.zh}攻破${nm.zh}，大掠而过`,`The ${T.en} break into ${nm.en} and sack it`)]);
  if(k){S.cf[k]=Math.max(0,S.cf[k]-10);lines.push(['📜',Ts(`朝廷切责${SF_DEF[k].zh}失守${nm.zh}（朝眷-10）`,`The court reprimands ${SF_DEF[k].en} for losing ${nm.en} (court favour -10)`)]);}}
function frInvMonth(F,lines){const inv=F.inv;if(!inv)return;const mo=F.mo,T=FR_TRIBE[inv.tr];
  if(inv.stage==='scout'&&mo>=inv.mo0+1){inv.stage='beacon';inv.beacons=[...new Set(inv.cols.flatMap(c=>c.path.slice(1,3)))].filter(id=>CG.T[id]&&frHit(CG.T[id].own));
    lines.push(['🔥',Ts(`烽燧相望：${inv.beacons.map(id=>CT[id].zh).join('、')}举火，${T.zh}大军将至`,`Beacon fires burn at ${inv.beacons.map(id=>CT[id].en).join(', ')}: a ${T.en} host is coming`)]);
    for(const id of inv.warn)if(CG.T[id]&&frHit(CG.T[id].own)){const n=Math.round((CG.T[id].pop||0)*.05);CG.T[id].pop-=n;frRefugees(F,id,n,lines);}return;}
  if(inv.stage==='beacon'&&mo>=inv.mo0+2){inv.stage='march';for(const c of inv.cols)c.state='march';
    lines.push(['⚔',Ts(`${T.zh}大举入寇！${inv.cols.length}路兵马共${inv.men}人，分趋${inv.cols.map(c=>CT[c.to].zh).join('、')}`,`The ${T.en} invade in force: ${inv.cols.length} columns, ${inv.men} men, marching on ${inv.cols.map(c=>CT[c.to].en).join(', ')}`)]);return;}
  if(inv.stage!=='march')return;
  for(const c of inv.cols){if(c.state==='routed'||c.state==='home'){c.state='gone';continue;}if(c.state!=='march')continue;
    if(c.men<250){c.state='routed';continue;}c.step++;const id=c.path[c.step];if(!id){c.state='home';continue;}
    const o=CG.T[id].own;if(o==='xia'&&inv.tr==='xia'){if(c.step>=c.path.length-1)c.state='home';continue;}if(!frHit(o)){continue;}
    frColFight(F,inv,c,id,lines);if(c.state==='march'&&c.step>=c.path.length-1)c.state='home';}
  if(inv.cols.every(c=>['gone','routed','home'].includes(c.state))&&!inv.cols.some(c=>c.state==='battle')){
    if(inv.cols.every(c=>c.state==='gone')){F.str[inv.tr]+=Math.round(inv.cols.reduce((a,c)=>a+c.men,0)*.8);F.invNext[inv.tr]=mo+12+Math.round(siH('nx',inv.tr,mo)*8);
      if(inv.qhBeat||inv.beat>=Math.ceil(inv.cols.length/2)){F.stats.invRepelled++;}
      lines.push(['🏳',Ts(`${T.zh}此番入寇已退，${inv.beat}路被击溃`,`The ${T.en} invasion is over: ${inv.beat} of ${inv.cols.length} columns were broken`)]);F.inv=null;}}}
function frInvTrigger(F,tr,lines){const mo=F.mo;if(F.inv||mo<FR.INV_START||mo<(F.invNext[tr]||0))return;const sea=seasonOf(CG.turn);
  const srcs=tr==='xia'?frXiaSources():FR_CAMPS.map(c=>c.id);let weak=0,n=0;for(const s of srcs){const ts=tr==='xia'?CADJ[s].filter(x=>frHit(CG.T[x].own)):[frNearTown(s)].filter(Boolean);for(const x of ts){n++;weak+=frDef(x).v<200?1:0;}}
  const p=.1+(sea===2?.15:sea===3?.1:0)+(n?weak/n:0)*.15+Math.min(1,F.str[tr]/(tr==='xia'?6000:2400))*.1;if(siH('inv',tr,mo)<p&&F.str[tr]>=(tr==='xia'?2200:900))frPlan(F,tr,lines);}
// ---- political ripple (monthly)
SI_ACT.blame=['🗯','互相推诿','Blame for the raid',0];
function frRipple(F,lines){const S=siState(),T=stState(S),mo=F.mo,hits={},blame=new Set();
  for(const b of F.bands.filter(b=>b.mo===mo&&b.res==='looted')){const k=b.k;if(k){hits[k]=(hits[k]||0)+1;S.w[k]=Math.max(0,S.w[k]-Math.round(15+(b.loot?.silver||0)));S.tr[k]=Math.max(0,S.tr[k]-Math.round(b.men*.2));}}
  for(const h of F.hitTown||[])if(h.k)hits[h.k]=(hits[h.k]||0)+2;
  const all=[...F.bands.filter(b=>b.mo===mo&&b.res==='looted').map(b=>({id:b.to,k:b.k,own:b.own,src:b.src})),...(F.hitTown||[]).map(h=>({id:h.id,k:h.k,own:h.own}))];
  for(const h of all){if(h.k){const rv=CADJ[h.id].map(n=>sfOf(n)).find(o=>o&&o!==h.k&&siRivals(h.k).includes(o));if(rv&&!blame.has(h.k+rv)){blame.add(h.k+rv);const fk=siFeudKey(h.k,rv);if(S.feud[fk]!=null)S.feud[fk]=Math.min(100,S.feud[fk]+6);siEvent(S,'blame',h.k,rv,h.id);
        lines.push(['🗯',Ts(`${SF_DEF[h.k].zh}怪罪${SF_DEF[rv].zh}守边不力，致${CT[h.id].zh}遭劫`,`${SF_DEF[h.k].en} blames ${SF_DEF[rv].en} for the open border that let raiders into ${CT[h.id].en}`)]);}
      const q=CADJ[h.id].some(owned);if((q||T.prot[h.k])&&!blame.has(h.k+'qh')){blame.add(h.k+'qh');sfAdd(h.k,T.prot[h.k]?-6:-3,'blame');
        lines.push(['🗯',Ts(`${SF_DEF[h.k].zh}责清河${T.prot[h.k]?'庇护不力':'坐视'}${CT[h.id].zh}遭劫`,`${SF_DEF[h.k].en} blames Qinghe for ${T.prot[h.k]?'failing to protect':'standing by while raiders hit'} ${CT[h.id].en}`)]);}}}
  for(const k in hits){if(F.aid[k]||hits[k]<2)continue;F.aid[k]={mo,until:mo+3,grain:120,silver:40};lines.push(['📯',Ts(`${SF_DEF[k].zh}屡遭劫掠，遣使求清河援手（粮或银）`,`Raided again and again, ${SF_DEF[k].en} begs Qinghe for aid (grain or silver)`)]);}
  for(const k in F.aid){const A=F.aid[k];if(A.until<=mo){delete F.aid[k];sfAdd(k,-5,'refused');lines.push(['📪',Ts(`${SF_DEF[k].zh}求援无果，怨清河见死不救`,`${SF_DEF[k].en} resents that Qinghe sent no help against the raiders`)]);}}
  const qLost=(F.hitTown||[]).filter(h=>h.own==='qh').length,qLoot=F.bands.filter(b=>b.mo===mo&&b.res==='looted'&&b.own==='qh').length;
  if(qLost||qLoot>=2){if(typeof favAdd==='function')favAdd(-3,'def');if(CG.fac)CG.fac.court=Math.max(0,CG.fac.court-2);lines.push(['📜',Ts('朝廷下诏切责清河边备废弛（功绩-3）','The court reprimands Qinghe for a neglected border (merit -3)')]);}
  F.hitTown=[];}
function frAidSend(k,what){const F=frState(),A=F.aid[k];if(!A)return {ok:false};const S=siState();
  if(what==='grain'){if((CG.T[HOME].st.grain||0)<A.grain)return {ok:false};CG.T[HOME].st.grain-=A.grain;}else{if(CAMP.res.silver<A.silver)return {ok:false};CAMP.res.silver-=A.silver;}
  delete F.aid[k];sfAdd(k,8,'aid');siBack(k,12);S.tr[k]+=150;cgLog('📯',Ts(`清河援${SF_DEF[k].zh}${what==='grain'?'粮'+A.grain:'银'+A.silver}，彼甚感念`,`Qinghe sends ${SF_DEF[k].en} ${what==='grain'?A.grain+' grain':A.silver+' silver'} against the raiders; they are grateful`));return {ok:true};}
function frRepelled(x,lines){const F=frState(),inv=F.inv,T=stState(),S=siState();if(!inv)return;const c=inv.cols.find(c=>c.id===x.frCol);if(c){c.state='routed';c.men=Math.round(c.men*.4);inv.beat++;inv.qhBeat++;}
  CAMP.res.rep=(CAMP.res.rep||0)+12;if(typeof favAdd==='function')favAdd(6,'def');T.qren=(T.qren||0)+25;
  for(const k in SF_DEF){if(['hawk','proud'].includes(ST_TEMPER[k])||T.stance[k]==='threat')T.wr[k]=Math.min(100,T.wr[k]+10);else sfAdd(k,3,'defence');}
  lines.push(['🏆',Ts(`清河大破${FR_TRIBE[inv.tr].zh}一路！声望+12，功绩+6；朝廷遣使嘉奖，诸将门侧目`,`Qinghe breaks a ${FR_TRIBE[inv.tr].en} column! Prestige +12, merit +6; the court sends a commission, and the military families take note`)]);}
{const old=resolveBattle;resolveBattle=function(q,win,r){const x=q&&q.xa!=null?CG.xa.find(o=>o.id===q.xa):null,fc=x&&x.frCol!=null?x:null;const out=old.apply(this,arguments);
  try{if(fc){const F=frState(),inv=F.inv,lines=[];if(win)frRepelled(fc,lines);else if(inv){const c=inv.cols.find(c=>c.id===fc.frCol);if(c){c.men=Math.round(c.men*.7);c.state=c.step>=c.path.length-1?'home':'march';}
      F.hitTown=F.hitTown||[];F.hitTown.push({id:q.terr,k:null,lost:CG.T[q.terr].own!=='qh',inv:1,own:'qh'});frRefugees(F,q.terr,Math.round((CG.T[q.terr].pop||0)*.08),lines);}for(const l of lines)cgLog(l[0],l[1]);}}catch(e){console.error(e);}return out;};}
// ---- the month
function frMonth(lines){if(!CG||CG.over)return;const F=frState(),mo=campaignMonth();if(F.mo===mo&&F.ran)return;F.mo=mo;F.ran=1;
  F.bands=F.bands.filter(b=>b.mo>=mo-0);F.bands=[];F.ref=F.ref.filter(r=>r.mo>=mo);F.ref=[];F.hitTown=F.hitTown||[];
  F.str.xia=Math.min(7000,F.str.xia+80);F.str.qiang=Math.min(3000,F.str.qiang+35);for(const c of FR_CAMPS){const C=F.camps[c.id];C.men=Math.min(900,C.men+15);}
  frInvMonth(F,lines);if(mo>=FR.START){frRaids(F,'xia',lines);frRaids(F,'qiang',lines);}frInvTrigger(F,'xia',lines);frInvTrigger(F,'qiang',lines);frRipple(F,lines);
  F.log.unshift({mo,raids:F.bands.length,looted:F.bands.filter(b=>b.res==='looted').length});F.log.length=Math.min(F.log.length,24);if(typeof MP!=='undefined'&&MP)MP.ver=(MP.ver||0)+1;}
{const old=siMonth;siMonth=function(lines){const r=old.apply(this,arguments);try{const F=frState();F.ran=0;frMonth(lines);}catch(e){console.error(e);}return r;};}
// ---- Factions panel: aid requests; town panel: raid risk
{const old=sfPanel;sfPanel=function(){const w=old.apply(this,arguments);try{const F=frState();for(const c of w.querySelectorAll('.sw-fac')){const k=c.dataset.sf,A=k&&F.aid[k];if(!A)continue;
  const q=rsEl('div','sw-row sw-req');q.dataset.aid=k;q.appendChild(rsEl('span','sw-note',`📯 ${Ts('屡遭胡骑劫掠，求援','Begs aid against the raiders')} · ${Ts('限期','by')} ${Ts(A.until+'月','M'+A.until)}`));
  q.appendChild(rsBtn(`援粮 🌾${A.grain}`,`Send 🌾${A.grain}`,()=>{frAidSend(k,'grain');campUI();},(CG.T[HOME].st.grain||0)<A.grain));q.appendChild(rsBtn(`援银 🪙${A.silver}`,`Send 🪙${A.silver}`,()=>{frAidSend(k,'silver');campUI();},CAMP.res.silver<A.silver));c.appendChild(q);}
  const inv=F.inv,box=rsEl('div','sw-note sw-ev');box.dataset.tribes=1;const stg=inv?{scout:Ts('哨探已现','scouts seen'),beacon:Ts('烽火已举','beacons lit'),march:Ts('大军入寇','invading')}[inv.stage]:null;
  box.innerHTML=`<b>${Ts('边外诸部','The tribes beyond the border')}</b><br>🐎 ${Ts('西夏兵势','Xia horde')} ${F.str.xia} · ${Ts('生羌','Qiang clans')} ${FR_CAMPS.reduce((a,c)=>a+F.camps[c.id].men,0)+F.str.qiang}${stg?`<br>⚠ ${Ts(FR_TRIBE[inv.tr].zh,FR_TRIBE[inv.tr].en)}: ${stg}${inv.stage==='march'?' · '+inv.cols.filter(c=>c.state==='march'||c.state==='battle').length+Ts('路','  columns'):''}`:''}<br>${Ts('本月劫掠','Raids this month')} ${F.bands.length} · ${Ts('被击退','repelled')} ${F.bands.filter(b=>b.res==='repelled').length}`;w.appendChild(box);}catch(e){console.error(e);}return w;};}
{const old=terrPanel;terrPanel=function(id){const w=old.apply(this,arguments);try{const R=w&&frRisk(id);if(R){const L=[Ts('低','low'),Ts('中','medium'),Ts('高','high')][R.lvl];const e=rsEl('div','sw-note',`🐎 ${Ts('胡骑劫掠之险','Tribal raid risk')}: <b style="color:${['#a8e090','#ffd070','#ff8a70'][R.lvl]}">${L}</b> · ${Ts('来犯约','raiders up to')} ${R.top} vs ${Ts('守','defence')} ${R.def}`);e.dataset.frisk=R.lvl;w.appendChild(e);}}catch(e){console.error(e);}return w;};}
// ---- drawing: static (camps, tug standards, herds; threat overlay) and live (bands, columns, beacons, scouts, refugees)
function frIcon(g,k,x,y,s,a){if(typeof mtDraw!=='function'||!mtReady())return false;g.save();g.translate(x,y);g.scale(s,s);const r=mtDraw(g,k,a);g.restore();return r;}
function frLabel(g,s,x,y,col,sz){g.font=`bold ${Math.round(sz)}px "Noto Serif SC",serif`;g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(20,10,4,.9)';g.strokeText(s,x,y);g.fillStyle=col||'#e8f0ff';g.fillText(s,x,y);}
function frDrawStatic(g){if(!CG||MODE!=='camp')return;const F=frState(),sc=iconScale();
  for(const c of FR_CAMPS){const q=frScr(c.id);if(q.x<-90||q.x>VW+90||q.y<-90||q.y>VH+90)continue;frIcon(g,'qc',q.x,q.y,sc*.9,1);frLabel(g,`${Tz(c.zh,c.en)} · ${F.camps[c.id].men}`,q.x,q.y+30*sc,'#cfe0ff',11*sc);}
  if(CC.z>.75)for(const id of frSrcM()){const q=mlScr(id);if(!mlVis(q,60))continue;frIcon(g,'tq',q.x-26*sc,q.y-4*sc,sc*.55,1);if(siH('herd',id)<.45&&CC.z>1)frIcon(g,'hh',q.x+30*sc,q.y+14*sc,sc*.5,1);}
  if(rsLayer()==='threat')frDrawThreat(g,sc);}
function frDrawThreat(g,sc){const F=frState(),kx=CGEO.k*CGEO.s,ky=CGEO.s;
  for(const c of FR_CAMPS){const q=frScr(c.id),rx=FR.QR/.82*kx*CC.z,ry=FR.QR*ky*CC.z,a=Math.min(.35,.12+F.camps[c.id].men/3000);const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,Math.max(rx,ry));gr.addColorStop(0,`rgba(60,120,190,${a})`);gr.addColorStop(1,'rgba(60,120,190,0)');
    g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y,rx,ry,0,0,TAU);g.fill();g.setLineDash([6,6]);g.strokeStyle='rgba(80,150,220,.75)';g.lineWidth=1.6*sc;g.stroke();g.setLineDash([]);}
  for(const src of frSrcM()){const q=mlScr(src),r=70*sc*CC.z;const a=Math.min(.32,.1+CG.T[src].str/4000);const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,r);gr.addColorStop(0,`rgba(110,120,170,${a})`);gr.addColorStop(1,'rgba(110,120,170,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,r,0,TAU);g.fill();
    for(const n of CADJ[src])if(frHit(CG.T[n].own)){const e=mlScr(n);g.strokeStyle='rgba(90,100,160,.55)';g.lineWidth=2*sc;g.setLineDash([3,5]);g.beginPath();g.moveTo(q.x,q.y);g.lineTo(e.x,e.y);g.stroke();g.setLineDash([]);}}
  for(const t of CL.terr){const id=t.id,s=CG.T[id];if(s.own!=='qh'&&s.own!=='song')continue;const R=frRiskM(id);if(!R||R.lvl<1)continue;const q=mlScr(id);if(!mlVis(q))continue;
    if(s.own==='qh')mlTag(g,`🐎 ${Tz('胡骑','raid risk')} ${R.lvl>1?Tz('高','high'):Tz('中','med')} ${R.top}/${R.def}`,q.x,q.y+56*sc,R.lvl>1?'rgba(40,50,110,.95)':'rgba(60,70,120,.85)','#e8f0ff',10*sc);
    else{g.strokeStyle=R.lvl>1?'rgba(70,90,200,.9)':'rgba(90,110,190,.6)';g.lineWidth=2*sc;g.beginPath();g.arc(q.x,q.y,20*sc,0,TAU);g.stroke();}}
  const inv=F.inv;if(inv)for(const c of inv.cols){if(c.state==='gone')continue;const pts=c.path.slice(c.step).map(frScr);if(pts.length<2)continue;g.strokeStyle='rgba(200,30,20,.85)';g.lineWidth=4*sc;g.setLineDash([12,8]);g.beginPath();g.moveTo(pts[0].x,pts[0].y);for(const p of pts.slice(1))g.lineTo(p.x,p.y);g.stroke();g.setLineDash([]);
    const e=pts[pts.length-1];mlTag(g,`⚠ ${Tz('入寇路线','invasion route')} → ${Tz(CT[c.to].zh,CT[c.to].en)}`,e.x,e.y-34*sc,'rgba(140,20,12,.95)','#fff',11*sc);}}
{const old=rsDrawLayers;rsDrawLayers=function(g){const r=old.apply(this,arguments);try{frDrawStatic(g);}catch(e){console.error(e);}return r;};}
// live
function frT(o,len){if(o._t0==null)o._t0=CTIME+siH('t0',o.id||0)*2;return ((CTIME-o._t0)%len+len)%len;}
function frRiders(g,tr,x,y,face,n,sc,ph,heavy){const T=FR_TRIBE[tr];for(let i=0;i<n;i++){const ox=((i%3)-1)*13*sc,oy=Math.floor(i/3)*11*sc+(i%2)*4*sc;const spr=heavy&&i>=n-2?T.heavy:T.spr;sprUnit(spr,x+ox,y+oy,8*sc,face,frontierWalkFrame(spr,ph+i*.13));}}
// a massive column: a wedge of riders rotated to the march direction, heavy cavalry at the core, a dust cloud behind
function frHost(g,tr,x,y,face,n,sc,ph){if(FR.lite)n=Math.ceil(n*.55);const T=FR_TRIBE[tr],fx=Math.cos(face),fy=Math.sin(face),px=-fy,py=fx;
  g.fillStyle='rgba(150,125,90,.22)';for(let i=0;i<4;i++){const d=(26+i*14)*sc,w=(16+i*5)*sc;g.beginPath();g.ellipse(x-fx*d+Math.sin(CTIME*2+i)*2*sc,y-fy*d,w,w*.55,0,0,TAU);g.fill();}
  const pos=[];let row=0,i=0;while(i<n){const m=row+1;for(let j=0;j<m&&i<n;j++,i++){const lat=(j-(m-1)/2)*15*sc,back=row*12*sc;pos.push({x:x-fx*back+px*lat,y:y-fy*back+py*lat,h:row>=1&&row<=2&&Math.abs(j-(m-1)/2)<1,r:row});}row++;}
  pos.sort((a,b)=>a.y-b.y);pos.forEach((q,k)=>{const spr=q.h&&tr==='xia'?T.heavy:tr==='qiang'&&q.r>=3?T.foot:T.spr;sprUnit(spr,q.x,q.y,8*sc,face,frontierWalkFrame(spr,ph+k*.13));});}
function frFire(g,q,sc,k){for(let i=0;i<5;i++){const fx=q.x+(siH('fx',i)-.5)*30*sc,fy=q.y+(siH('fy',i)-.5)*14*sc,h=(10+8*Math.sin(CTIME*9+i*2))*sc*k;g.fillStyle=`rgba(255,${120+Math.round(60*Math.sin(CTIME*7+i))},30,.85)`;g.beginPath();g.moveTo(fx-5*sc,fy);g.quadraticCurveTo(fx,fy-h*1.4,fx+5*sc,fy);g.fill();
  g.fillStyle='rgba(70,60,55,.35)';g.beginPath();g.arc(fx+((CTIME*8+i*7)%20)*sc*.4,fy-h-((CTIME*14+i*9)%30)*sc,(5+((CTIME*6+i)%6))*sc,0,TAU);g.fill();}}
function frDrawBand(g,b,sc){const s=frScr(b.src),e=frScr(b.to);if(!mlVis(s,200)&&!mlVis(e,200))return;const T=FR_TRIBE[b.tr],t=frT(b,14),looted=b.res==='looted';let p,face,ph=CTIME*1.6;
  const lerpP=(a,c,k)=>({x:a.x+(c.x-a.x)*k,y:a.y+(c.y-a.y)*k});
  if(t<4){const k=t/4;p=lerpP(s,e,k*.92);face=Math.atan2(e.y-s.y,e.x-s.x);}else if(t<7){p=lerpP(s,e,.92);face=Math.atan2(e.y-s.y,e.x-s.x)+Math.sin(CTIME*2)*.6;ph=CTIME*3;}else if(t<11){const k=(t-7)/4;p=lerpP(e,s,k*.95+.08);face=Math.atan2(s.y-e.y,s.x-e.x);}else{p=s;face=0;}
  if(looted&&t>=3.5)frFire(g,e,sc,t<7?1:Math.max(.25,1-(t-7)/6));
  if(t>=7&&t<11.5&&looted){g.strokeStyle=T.col;g.globalAlpha=.85;g.lineWidth=2.2*sc;g.setLineDash([3*sc,4*sc]);g.beginPath();g.moveTo(e.x,e.y);g.lineTo(p.x,p.y);g.stroke();g.setLineDash([]);g.globalAlpha=1;
    const icons=[b.loot.grain?'🌾':null,b.loot.horse||b.loot.hide?'🐎':null,b.loot.cap?'⛓':null,b.loot.silver?'🪙':null].filter(Boolean);g.font=`${Math.round(12*sc)}px sans-serif`;g.textAlign='center';
    icons.forEach((ic,i)=>{const k=.18+i*.16;g.fillText(ic,p.x+(e.x-p.x)*k,p.y+(e.y-p.y)*k-6*sc);});}
  if(t<11.5){frRiders(g,b.tr,p.x,p.y,face,3,sc,ph);frIcon(g,'tq',p.x+16*sc,p.y-2*sc,sc*.42,1);
    const lab=`${Tz(T.zh2,T.en2)} ${b.men} · ${t<4?Tz('来袭','raiding'):t<7?(looted?Tz('劫掠','looting'):Tz('被击退','repelled')):looted?Tz('满载而归','home with loot'):Tz('败退','falling back')}`;shipPill(g,lab,p.x,p.y-34*sc,Math.max(10,11*sc),looted?'#ff9a70':'#a8e090');}}
function frDrawCol(g,inv,c,sc){if(c.state==='gone'||c.state==='wait')return;const T=FR_TRIBE[inv.tr],n=c.path.length-1;const a=c.path[Math.max(0,c.step-1)],b=c.path[c.step]||c.path[n];const s=frScr(a),e=frScr(b);
  const t=frT(c,10),k=c.state==='march'||c.state==='home'?Math.min(1,t/6):1;const nx0=c.path[c.step+1],e0=c.step?e:(nx0&&c.state==='march'?frScr(nx0):e),kk=c.step?k:k*.3;let p={x:s.x+(e0.x-s.x)*kk,y:s.y+(e0.y-s.y)*kk};if(!c.step)p=c.state==='march'?{x:e.x+(e0.x-e.x)*kk,y:e.y+(e0.y-e.y)*kk}:p;if(c.state==='routed'){const r=Math.min(1,t/6);p={x:e.x+(s.x-e.x)*r,y:e.y+(s.y-e.y)*r};}
  if(!mlVis(p,150))return;const nx=c.path[c.step+1];if(nx&&c.state==='march'){const q2=frScr(nx);g.globalAlpha=.6+.3*Math.sin(CTIME*4);arrow(g,p,q2,'rgba(170,20,12,.9)',6*sc);g.globalAlpha=1;}
  const face=c.state==='routed'?Math.atan2(s.y-e.y,s.x-e.x):Math.atan2((nx?frScr(nx).y:e.y)-p.y,(nx?frScr(nx).x:e.x)-p.x);
  frHost(g,inv.tr,p.x,p.y,face,c.men>1000?14:c.men>500?11:8,sc,CTIME*1.3);frIcon(g,'tq',p.x-24*sc,p.y-6*sc,sc*.55,1);frIcon(g,'tq',p.x+24*sc,p.y-4*sc,sc*.5,1);
  if(c.state==='battle'){const fl=.5+.5*Math.sin(CTIME*12+c.id);g.strokeStyle=`rgba(255,181,87,${fl})`;g.lineWidth=2*sc;g.beginPath();g.arc(p.x,p.y,30*sc+fl*8*sc,0,TAU);g.stroke();}
  shipPill(g,`${Tz(T.zh,T.en)}${Tz('大军','host')} ${c.men} · ${{march:Tz('进军','marching'),battle:Tz('攻城','assaulting'),routed:Tz('溃退','routed'),home:Tz('掠归','withdrawing')}[c.state]||''} → ${Tz(CT[c.to].zh,CT[c.to].en)}`,p.x,p.y-46*sc,Math.max(10,11*sc),'#ff7a60');}
function frDrawWarn(g,inv,sc){if(inv.stage==='scout'||inv.stage==='beacon'){for(const id of inv.warn){const q=frScr(id);if(!mlVis(q))continue;const ph=(CTIME*1.2)%1;g.globalAlpha=1-ph;g.strokeStyle='#9ab8ff';g.lineWidth=2.5*sc;g.beginPath();g.arc(q.x,q.y,(14+ph*30)*sc,0,TAU);g.stroke();g.globalAlpha=1;
      g.font=`${Math.round(18*sc)}px sans-serif`;g.textAlign='center';g.fillText('👁',q.x+22*sc,q.y-22*sc);mlTag(g,Tz('胡骑哨探','scouts seen'),q.x,q.y-44*sc,'rgba(40,50,110,.92)','#e8f0ff',10*sc);}}
  if(inv.stage==='beacon')for(const id of inv.beacons||[]){const q=frScr(id);if(!mlVis(q))continue;const x=q.x-20*sc,y=q.y-6*sc;g.fillStyle='#6a5a48';g.fillRect(x-4*sc,y-12*sc,8*sc,12*sc);frFire(g,{x,y:y-12*sc},sc*.6,1.2);mlTag(g,'🔥 '+Tz('烽火','beacon'),x,y-38*sc,'rgba(130,40,10,.9)','#ffe0b0',10*sc);}}
function frDrawRef(g,sc){const F=frState();let n=0;for(const r of F.ref){if(n++>(FR.lite?6:14))break;const s=frScr(r.from),e=frScr(r.to);if(!mlVis(s,100)&&!mlVis(e,100))continue;for(let i=0;i<2;i++){const k=((CTIME*.07+i*.5+siH(r.from,r.to)*.7)%1),x=s.x+(e.x-s.x)*k,y=s.y+(e.y-s.y)*k+i*5*sc;
  sprUnit('villager',x,y,6*sc,Math.atan2(e.y-s.y,e.x-s.x),frontierWalkFrame('villager',CTIME*1.2+i));}if(n<=6){const m={x:(s.x+e.x)/2,y:(s.y+e.y)/2};g.font=`${Math.round(11*sc)}px sans-serif`;g.textAlign='center';g.fillStyle='#fff0d0';g.fillText('🚶'+r.n,m.x,m.y-12*sc);}}}
function frLive(g){if(!CG||MODE!=='camp'||!CG.fr)return;FR.lite=(typeof mobNarrow==='function'&&mobNarrow())||(typeof GFX!=='undefined'&&GFX.tier==='lo');const F=CG.fr,sc=iconScale();g.save();try{frDrawRef(g,sc);if(F.inv){frDrawWarn(g,F.inv,sc);for(const c of F.inv.cols)frDrawCol(g,F.inv,c,sc);}for(const b of F.bands)frDrawBand(g,b,sc);}catch(e){console.error(e);}g.restore();}
{const old=drawRaids;drawRaids=function(g){const r=old.apply(this,arguments);frLive(g);return r;};}
// threat layer: legend + info
ML_LEG.threat=(old=>()=>old()+`<span><i style="background:rgba(70,110,200,.7)"></i>${Ts('胡骑所及','tribal reach')}</span><span>🐎 ${Ts('劫掠之险','raid risk')}</span><span>👁 ${Ts('哨探','scouts')}</span><span>🔥 ${Ts('烽火','beacons')}</span><span style="color:#ff8a70">━ ${Ts('入寇路线','invasion route')}</span>`)(ML_LEG.threat);
{const old=mlInfo;mlInfo=function(id,L,tz){let s=old.apply(this,arguments);try{if((L||rsLayer())==='threat'){const R=frRiskM(id),T2=tz?Tz:Ts;if(R){const L2=[T2('低','low'),T2('中','medium'),T2('高','high')][R.lvl];s=(s?s+' · ':'')+`🐎 ${T2('胡骑之险','raid risk')} ${L2} (${R.top}/${R.def})`;}}}catch(e){}return s;};}
window.__fr={FR,FR_CAMPS,FR_TRIBE,frState,frMonth,frRaid,frRaids,frPlan,frInvMonth,frInvTrigger,frRisk,frTargets,frDef,frAidSend,frRipple,frXiaSources,frSeats,frPath,V:FR.V};
