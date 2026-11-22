// v0.46 (t256) the Song blocs compete for the frontier without going to war.
//  - Influence: every Song-held or unaligned town carries an influence score (0-100) for each of the four blocs, seeded from their home
//    circuits. Each month influence spreads along the road links into neighbouring towns (patronage, marriage ties, their men placed in
//    local posts), faster for a stronger bloc, a bloc in favour at court, and a bloc Qinghe backs. When a rival's influence overtakes the
//    holder's in a Song town, the town changes allegiance (sfOf is now dynamic and saved in CG.sf.hold; old saves migrate on load).
//    Unaligned towns get a patron (the leading bloc) but stay unaligned.
//  - Power: each bloc has troops, wealth and court favour; power = towns + troops + wealth + favour + Qinghe's backing. Ranked monthly.
//  - Rivalry without war: each month a bloc may act against the rival it feuds with most: blockade one of its roads, poach its
//    captains, accuse it at court, or press the gentry of a town near Qinghe. Each is a news line and a marker on the map, and feuds now
//    rise from these acts (and cool by one a month) instead of drifting at random.
//  - Qinghe in the middle: openly backing a bloc (silver each month), grain convoys, speaking for it at court, gifts, granted requests
//    and clearing bandits in its circuit all add backing, which speeds its influence and adds to its power.
'use strict';
const SI={V:'t256a',HOME:70,FLIP:4,EVM:2,SIDE_COST:15,GRAIN:100,COURT:2};
const SF_SHORT={liu:['刘','Liu'],yao:['姚','Yao'],zhong:['种','Zhong'],tong:['童','Tong']};
const SI_BASE={liu:{tr:2400,w:300,cf:50},yao:{tr:2000,w:260,cf:40},zhong:{tr:3200,w:280,cf:45},tong:{tr:3600,w:420,cf:70}};
// action weights per bloc: blockade, poach, impeach, pressure
const SI_STYLE={liu:[1,1.2,.6,1],yao:[1.4,.6,.5,1],zhong:[.6,1.3,.8,.9],tong:[.8,.7,1.6,1.1]};
const SI_ACT={blockade:['⛔','封锁商路','Road blockade',6],poach:['🎖','挖角将校','Captains poached',5],impeach:['📜','朝中弹劾','Accused at court',8],pressure:['✊','逼迫乡绅','Gentry pressed',3],flip:['🚩','易帜','Changed allegiance',0],lean:['🏮','归心','New patron',0]};
const SI_KW={city:6,town:3,fort:3,pass:2,camp:2,village:1};
function siH(...a){let h=2166136261;for(const x of a){const s=String(x);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}}return ((h>>>0)%100000)/100000;}
function siTracked(id){const s=CG.T[id];return !!s&&(s.own==='song'||s.own==='free');}
function siRegionBloc(id){const r=CT[id].region;for(const k in SF_DEF)if(SF_DEF[k].reg.includes(r))return k;return null;}
function siTop(o){let a=null,b=null;for(const k in SF_DEF){if(a==null||o[k]>o[a]){b=a;a=k;}else if(b==null||o[k]>o[b])b=k;}return [a,b];}
function siFeudKey(a,b){return a<b?a+'_'+b:b+'_'+a;}
function siRivals(k){return Object.entries(SF_RIV[k]||{}).filter(([,m])=>m<0).map(([o])=>o).concat(Object.keys(SF_RIV).filter(o=>(SF_RIV[o][k]||0)<0)).filter((v,i,a)=>a.indexOf(v)===i);}
function siBlank(){const o={};for(const k in SF_DEF)o[k]=0;return o;}
function siNewTown(S,id){const o=siBlank(),rb=siRegionBloc(id);if(rb)o[rb]=CG.T[id].own==='song'?SI.HOME:30;
  for(const n of CADJ[id]){const q=S.inf[n];if(q)for(const k in SF_DEF)o[k]=Math.max(o[k],Math.round(q[k]*.35));}S.inf[id]=o;return o;}
// the holder of a Song town without one: its circuit's bloc, else whoever leads there, else the bloc holding the nearest town
function siAssign(S,id){const o=S.inf[id]||siNewTown(S,id);let k=siRegionBloc(id);if(!k){const [a]=siTop(o);if(o[a]>0)k=a;}
  if(!k){let bd=1e9;for(const h in S.hold){const d=Math.hypot(CT[h].lon-CT[id].lon,CT[h].lat-CT[id].lat);if(d<bd){bd=d;k=S.hold[h];}}}
  k=k||'tong';o[k]=Math.max(o[k],40);S.hold[id]=k;return k;}
function siState(){const S=sfState();if(S.inf&&S.si===1)return S;
  // first use, or a save from before t256: seed from the current map (holders = the old static circuit blocs)
  S.inf=S.inf||{};S.hold=S.hold||{};S.feud=S.feud||{};
  for(const t of CL.terr)if(siTracked(t.id)&&!S.inf[t.id]){const o=siBlank(),rb=siRegionBloc(t.id);if(rb)o[rb]=CG.T[t.id].own==='song'?SI.HOME:30;S.inf[t.id]=o;}
  for(let i=0;i<3;i++)for(const id in S.inf)for(const n of CADJ[id]){const q=S.inf[n];if(!q)continue;for(const k in SF_DEF)S.inf[id][k]=Math.max(S.inf[id][k],Math.round(q[k]*.35));}
  for(const id in S.inf)if(CG.T[id].own==='song'&&!S.hold[id])siAssign(S,id);
  S.tr=S.tr||{};S.w=S.w||{};S.cf=S.cf||{};S.bk=S.bk||{};for(const k in SF_DEF){const B=SI_BASE[k];if(S.tr[k]==null)S.tr[k]=B.tr;if(S.w[k]==null)S.w[k]=B.w;if(S.cf[k]==null)S.cf[k]=B.cf;if(S.bk[k]==null)S.bk[k]=0;}
  for(const k in SF_RIV)for(const [o,m] of Object.entries(SF_RIV[k]))if(m<0){const key=siFeudKey(k,o);if(S.feud[key]==null)S.feud[key]=Math.round(-m*50);}
  // feud keys from t247 were ordered by the SF_RIV walk; fold them into the sorted form
  for(const key of Object.keys(S.feud)){const [a,b]=key.split('_'),kk=siFeudKey(a,b);if(kk!==key){S.feud[kk]=Math.max(S.feud[kk]||0,S.feud[key]);delete S.feud[key];}}
  S.ev=S.ev||[];S.evlog=S.evlog||[];S.push=S.push||[];S.blk=S.blk||[];S.side=S.side||null;S.ver=(S.ver||0)+1;S.si=1;
  S.pow=S.pow||{};S.rank=S.rank||{};S.powPrev=S.powPrev||{};S.rankPrev=S.rankPrev||{};siRank(S,true);return S;}
sfOf=function(id){const s=CG&&CG.T[id];if(!s||s.own!=='song')return null;const S=siState();return S.hold[id]||siAssign(S,id);};
function siPatron(id){const s=CG.T[id];if(!s)return null;if(s.own==='song')return sfOf(id);if(s.own!=='free')return null;const o=siState().inf[id];if(!o)return null;const [a]=siTop(o);return o[a]>=35?a:null;}
function siTownW(id){return SI_KW[CT[id].kind]||1;}
function siPower(S,k){let tw=0;for(const id in S.hold)if(S.hold[id]===k&&CG.T[id]&&CG.T[id].own==='song')tw+=siTownW(id);
  return {tw,p:Math.round(tw*4+S.tr[k]/60+S.w[k]/12+S.cf[k]*.8+(S.bk[k]||0)*.4)};}
function siRank(S,init){const P={};for(const k in SF_DEF)P[k]=siPower(S,k).p;const ord=Object.keys(SF_DEF).sort((a,b)=>P[b]-P[a]||a.localeCompare(b));
  if(!init){S.powPrev={...S.pow};S.rankPrev={...S.rank};}S.pow=P;S.rank={};ord.forEach((k,i)=>S.rank[k]=i+1);if(init){for(const k in P){if(S.powPrev[k]==null)S.powPrev[k]=P[k];if(S.rankPrev[k]==null)S.rankPrev[k]=S.rank[k];}}return ord;}
function siGrowth(S,k){const P=S.pow,avg=Object.values(P).reduce((a,b)=>a+b,0)/4||1;let n=0,m=0;for(const id in S.hold)if(CG.T[id]&&CG.T[id].own==='song'){n++;if(S.hold[id]===k)m++;}
  const over=1.12-.5*(n?m/n:0);                   // a bloc holding much of the frontier is stretched thin
  return over*(.65+.35*P[k]/avg)*(.8+S.cf[k]/250)*(1+(S.bk[k]||0)/100*.5);}
function siEvent(S,ty,k,o,t,extra){const e={mo:campaignMonth(),ty,k,o:o||null,t:t||null,...(extra||{})};S.ev.push(e);S.evlog.unshift(e);S.evlog.length=Math.min(S.evlog.length,24);return e;}
function siNear(id,R){return bfsDist(id,R);}
function siNearPlayer(){const out=new Set();for(const id in CG.T)if(owned(id)){const d=bfsDist(id,2);for(const k in d)out.add(k);}return out;}
function siMethod(id,k,mo){return [['门生故吏遍布','patronage of its protégés'],['与当地大族联姻','marriage ties with the leading family'],['安插亲信任职','its men placed in the local posts']][Math.floor(siH(id,k,mo)*3)];}
// ---- monthly influence spread
function siSpread(S,lines){const mo=campaignMonth(),G={};for(const k in SF_DEF)G[k]=siGrowth(S,k);
  for(const t of CL.terr)if(siTracked(t.id)&&!S.inf[t.id])siNewTown(S,t.id);
  const nx={},push=[];
  for(const id in S.inf){if(!siTracked(id))continue;const o=S.inf[id],n2={...o},h=CG.T[id].own==='song'?S.hold[id]:null;
    for(const k in SF_DEF){let src=0,from=null;for(const n of CADJ[id]){const q=S.inf[n];if(!q||!siTracked(n))continue;const v=q[k]*(S.hold[n]===k?1:.85);if(v>src){src=v;from=n;}}
      // pull from the strongest neighbouring town; the holder is also held up by its men in the posts, more where it holds the neighbours too
      let tgt=Math.min(100,src*.84*G[k]);if(k===h){let n=0,m=0;for(const x of CADJ[id])if(S.inf[x]&&siTracked(x)){n++;if(S.hold[x]===k)m++;}tgt=Math.max(tgt,(45+30*(n?m/n:1))*G[k]);}
      const cur=o[k],d=(tgt-cur)*.12+(siH(id,k,mo)-.5)*.6;
      n2[k]=Math.max(0,Math.min(100,cur+d));if(d>1.2&&from&&k!==h)push.push({f:from,t:id,k,g:+d.toFixed(2)});}
    const sum=Object.values(n2).reduce((a,b)=>a+b,0);if(sum>115)for(const k in n2)n2[k]*=115/sum;
    for(const k in n2)n2[k]=Math.round(n2[k]*10)/10;nx[id]=n2;}
  for(const id in nx)S.inf[id]=nx[id];
  push.sort((a,b)=>b.g-a.g);S.push=push.slice(0,14).map(p=>({...p,mo}));
  // allegiance: a rival that overtakes the holder takes the town; unaligned towns change patron
  for(const id in S.inf){const s=CG.T[id];if(!siTracked(id))continue;const o=S.inf[id],[a]=siTop(o);
    if(s.own==='song'){const h=S.hold[id]||siAssign(S,id);if(a!==h&&o[a]>o[h]+SI.FLIP){S.hold[id]=a;const m=siMethod(id,a,mo);const fk=siFeudKey(a,h);if(S.feud[fk]!=null)S.feud[fk]=Math.min(100,S.feud[fk]+4);
        siEvent(S,'flip',a,h,id);lines.push(['🚩',Ts(`${CT[id].zh}易帜：${SF_DEF[a].zh}凭${m[0]}，夺${SF_DEF[h].zh}之势`,`${CT[id].en} changes allegiance: ${SF_DEF[a].en} outgrew ${SF_DEF[h].en} there through ${m[1]}`)]);}}
    else{S.pat=S.pat||{};const p=o[a]>=35?a:null,was=S.pat[id]||null;if(p!==was){S.pat[id]=p;if(p&&was&&was!==p){siEvent(S,'lean',p,was,id);lines.push(['🏮',Ts(`${CT[id].zh}（未附）乡绅渐归${SF_DEF[p].zh}`,`The gentry of unaligned ${CT[id].en} now look to ${SF_DEF[p].en}`)]);}}}}}
// ---- rivalry acts
function siBig(k){let best=null,bw=-1;const S=siState();for(const id in S.hold)if(S.hold[id]===k&&CG.T[id].own==='song'){const w=siTownW(id)+CT[id].pop/1e4;if(w>bw){bw=w;best=id;}}return best;}
function siActions(S,lines){const mo=campaignMonth(),near=siNearPlayer();
  for(const k of Object.keys(SF_DEF)){const F=SF_DEF[k],riv=siRivals(k);if(!riv.length)continue;
    let o=riv[0],fv=-1;for(const r of riv){const v=S.feud[siFeudKey(k,r)]||0;if(v>fv){fv=v;o=r;}}
    const back=S.side&&S.side!==k&&riv.includes(S.side);if(back)o=S.side;
    const p=Math.min(.55,.18+fv/250+(back?.15:0));if(siH('act',k,mo)>=p)continue;
    const W=SI_STYLE[k].slice();const oTowns=Object.keys(S.hold).filter(id=>S.hold[id]===o&&CG.T[id].own==='song');if(!oTowns.length)continue;
    const press=Object.keys(S.inf).filter(id=>near.has(id)&&siTracked(id)&&(S.hold[id]===o||CG.T[id].own==='free'));if(!press.length)W[3]=0;if(back)W[3]*=2.2;
    if(S.cf[o]<15)W[2]=0;if(S.tr[o]<800)W[1]*=.3;
    const tot=W.reduce((a,b)=>a+b,0);let r=siH('pick',k,mo)*tot,ty=0;while(ty<3&&r>W[ty]){r-=W[ty];ty++;}
    const fk=siFeudKey(k,o),A=['blockade','poach','impeach','pressure'][ty];let e=null;
    if(A==='blockade'){const id=oTowns[Math.floor(siH('b',k,mo)*oTowns.length)],nb=CADJ[id].filter(n=>CG.T[n]&&CG.T[n].own!=='xia');const b=nb[Math.floor(siH('b2',k,mo)*nb.length)]||id;
      const loss=Math.min(S.w[o],30+Math.round(siH('bl',k,mo)*30));S.w[o]-=loss;S.w[k]-=8;S.blk=S.blk.filter(x=>x.until>mo);S.blk.push({k,o,a:id,b,until:mo+3});
      e=siEvent(S,'blockade',k,o,id,{b});lines.push(['⛔',Ts(`${F.zh}封锁${SF_DEF[o].zh}的${CT[id].zh}商路，${SF_DEF[o].zh}损银${loss}`,`${F.en} blockades the road at ${CT[id].en}: ${SF_DEF[o].en} loses ${loss} silver in trade`)]);}
    else if(A==='poach'){const n=Math.round(S.tr[o]*(.05+siH('p',k,mo)*.04));S.tr[o]-=n;S.tr[k]+=Math.round(n*.8);S.w[k]-=15;const id=siBig(o);
      e=siEvent(S,'poach',k,o,id);lines.push(['🎖',Ts(`${F.zh}以厚禄挖走${SF_DEF[o].zh}麾下将校，带走兵${n}`,`${F.en} lures captains away from ${SF_DEF[o].en} with better pay: ${n} men follow them`)]);}
    else if(A==='impeach'){let hit=8+Math.round(siH('i',k,mo)*8);let back2=false;if(S.cf[o]>S.cf[k]+25&&siH('i2',k,mo)<.4){back2=true;}
      if(back2){S.cf[k]=Math.max(0,S.cf[k]-6);hit=0;}else{S.cf[o]=Math.max(0,S.cf[o]-hit);S.cf[k]=Math.max(0,S.cf[k]-2);}const id=siBig(o);
      e=siEvent(S,'impeach',k,o,id,{hit,back:back2});lines.push(['📜',back2?Ts(`${F.zh}弹劾${SF_DEF[o].zh}不成，反失朝眷`,`${F.en} accused ${SF_DEF[o].en} at court; it backfired`):Ts(`${F.zh}遣台谏弹劾${SF_DEF[o].zh}，${SF_DEF[o].zh}朝眷-${hit}`,`${F.en} has ${SF_DEF[o].en} accused at court: its court favour falls ${hit}`)]);}
    else{const id=press[Math.floor(siH('pr',k,mo)*press.length)],q=S.inf[id];const add=12+Math.round(siH('pa',k,mo)*6);q[k]=Math.min(100,q[k]+add);S.w[k]-=10;
      e=siEvent(S,'pressure',k,o,id);lines.push(['✊',Ts(`${F.zh}在清河近旁的${CT[id].zh}逼迫乡绅改换门庭`,`${F.en} presses the gentry of ${CT[id].en}, near Qinghe, to change sides`)]);}
    if(S.feud[fk]!=null)S.feud[fk]=Math.min(100,S.feud[fk]+SI_ACT[A][3]);}}
// ---- the month
function siMonth(lines){const S=siState(),mo=campaignMonth();
  for(const k in S.feud)S.feud[k]=Math.max(0,Math.round(S.feud[k]-2-S.feud[k]/25));   // feuds cool unless fed
  for(const k in SF_DEF){S.bk[k]=Math.max(0,(S.bk[k]||0)-3);}
  if(S.side){const k=S.side;if(CAMP.res.silver>=SI.SIDE_COST){CAMP.res.silver-=SI.SIDE_COST;S.bk[k]=Math.min(100,S.bk[k]+8);for(const o of siRivals(k))sfAdd(o,-2);}
    else{S.side=null;lines.push(['⚠',Ts(`银两不继，你不再公开支持${SF_DEF[k].zh}`,`Out of silver: you can no longer back ${SF_DEF[k].en} openly`)]);}}
  for(const k in SF_DEF){const {tw}=siPower(S,k);S.w[k]=Math.round(Math.max(0,S.w[k]+(400+tw*10-S.w[k])*.08+(S.bk[k]||0)*.3));S.tr[k]=Math.round(S.tr[k]+(900+tw*40-S.tr[k])*.06);S.cf[k]=Math.round(Math.max(0,Math.min(100,S.cf[k]+(SI_BASE[k].cf-S.cf[k])*.08)));}
  S.ev=S.ev.filter(e=>e.mo>mo-SI.EVM);S.blk=(S.blk||[]).filter(x=>x.until>mo);
  siSpread(S,lines);siActions(S,lines);siRank(S,false);S.ver++;
  const up=Object.keys(SF_DEF).filter(k=>S.rank[k]<S.rankPrev[k]);if(up.length&&S.rank[up[0]]===1)lines.push(['👑',Ts(`${SF_DEF[up[0]].zh}权势跃居诸派之首`,`${SF_DEF[up[0]].en} is now the most powerful bloc`)]);}
{const old=sfAI;sfAI=function(lines){const S=siState(),fd={...S.feud};const r=old.apply(this,arguments);
  // t247's sfAI drifted feuds at random; t256 feuds move only with acts (restore, then the month runs)
  for(const k of Object.keys(S.feud))if(!(k in fd))delete S.feud[k];Object.assign(S.feud,fd);siMonth(lines);return r;};}
// ---- Qinghe backs a bloc
function siBack(k,n){const S=siState();S.bk[k]=Math.min(100,(S.bk[k]||0)+n);S.ver++;return S.bk[k];}
{const old=sfAdd;sfAdd=function(k,n,why){const r=old.apply(this,arguments);if(n>0&&CG&&CG.sf&&CG.sf.si){if(why==='gift')siBack(k,12);else if(why==='request')siBack(k,10);else if(why==='bandit')siBack(k,15);}return r;};}
function siSide(k){const S=siState();S.side=S.side===k?null:k;S.ver++;return S.side;}
function siGrainOk(){return (CG.T[HOME].st.grain||0)>=SI.GRAIN;}
function siGrain(k){if(!siGrainOk())return {ok:false};CG.T[HOME].st.grain-=SI.GRAIN;siBack(k,15);sfAdd(k,4,'grain');return {ok:true};}
function siCourtOk(){return typeof politicsAvailable==='function'?politicsAvailable()>=SI.COURT:(CG.fav&&CG.fav.pts>=SI.COURT);}
function siCourt(k){if(!siCourtOk())return {ok:false};favAdd(-SI.COURT,'court');const S=siState();S.cf[k]=Math.min(100,S.cf[k]+10);siBack(k,8);sfAdd(k,3,'court');return {ok:true};}
// blockades also cut Qinghe's own routes through a blockaded town
{const old=tradeRoutes;tradeRoutes=function(){const out=old.apply(this,arguments);if(!CG||!CG.sf||!CG.sf.si)return out;const B=politicsProtected()?[]:(CG.sf.blk||[]);
  for(const r of out){const b=B.find(x=>[x.a,x.b].includes(r.a)||[x.a,x.b].includes(r.b));if(b){r.blk=b.k;r.v=Math.round(r.v*.8);r.mul=(r.mul||1)*.8;}}return out;};}
// ---- UI: power ranking strip (in the layer bar), factions panel additions, town panel influence
const SI_CSS=`.sw-rank{display:flex;flex-basis:100%;justify-content:center;gap:var(--sw-s1);flex-wrap:wrap;margin-bottom:2px}
.sw-rk{display:inline-flex;align-items:center;gap:4px;font-size:12px;padding:1px 8px 1px 6px;border-radius:999px;background:var(--sw-paper2);border:1px solid var(--sw-line);cursor:pointer;pointer-events:auto;color:var(--sw-cream);white-space:nowrap}
.sw-rk i{width:9px;height:9px;border-radius:50%;background:var(--c);display:inline-block}.sw-rk b{color:var(--sw-gold)}.sw-rk em{font-style:normal;font-size:11px}.sw-rk em.up{color:var(--sw-jade)}.sw-rk em.dn{color:var(--sw-warn)}.sw-rk.side{border-color:var(--sw-gold);box-shadow:0 0 0 1px var(--sw-gold) inset}
.sw-rtab{width:100%;border-collapse:collapse;font-size:12px}.sw-rtab td,.sw-rtab th{padding:2px 4px;text-align:right;white-space:nowrap}.sw-rtab th{color:var(--sw-gold);font-weight:normal;opacity:.85}.sw-rtab td:nth-child(2),.sw-rtab th:nth-child(2){text-align:left}
.sw-inf{display:grid;grid-template-columns:auto 1fr auto;gap:2px 6px;align-items:center;font-size:12px}.sw-inf u{display:block;height:6px;border-radius:3px;background:var(--c);text-decoration:none}
.sw-ev{font-size:12px;line-height:1.5}
@media (max-width:700px){.sw-rank{gap:3px}.sw-rk{font-size:11px;padding:1px 6px 1px 5px;gap:3px}.sw-rk .n{display:none}}`;
(function(){if(document.getElementById('siCss'))return;const st=document.createElement('style');st.id='siCss';st.textContent=SI_CSS;document.head.appendChild(st);})();
function siArrow(k,S){const d=(S.rankPrev[k]||S.rank[k])-S.rank[k],dp=(S.pow[k]||0)-(S.powPrev[k]||0);return d>0?`<em class="up">▲${d}</em>`:d<0?`<em class="dn">▼${-d}</em>`:dp>0?`<em class="up">↑</em>`:dp<0?`<em class="dn">↓</em>`:'<em>–</em>';}
function siRankStrip(){const S=siState(),w=rsEl('div','sw-rank');w.id='swRank';const ord=Object.keys(SF_DEF).sort((a,b)=>S.rank[a]-S.rank[b]);
  for(const k of ord){const c=rsEl('span','sw-rk'+(S.side===k?' side':''),`<span class="n">${S.rank[k]}</span> <i></i>${(typeof mobNarrow==='function'&&mobNarrow()?SF_SHORT[k][LANG==='en'?1:0]:Ts(SF_SHORT[k][0],SF_SHORT[k][1]))} <b>${S.pow[k]}</b>${siArrow(k,S)}`);c.style.setProperty('--c',SF_DEF[k].col);c.dataset.sf=k;
    c.title=Ts(SF_DEF[k].zh,SF_DEF[k].en);c.onclick=()=>{CSEL={sf:1};campUI();};w.appendChild(c);}return w;}
{const old=campUI;campUI=function(){const r=old.apply(this,arguments);if(MODE!=='camp'||!CG)return r;try{const bar=document.getElementById('swLayers');if(bar)bar.insertBefore(siRankStrip(),bar.firstChild);}catch(e){console.error(e);}return r;};}
function siEvText(e){const A=SI_ACT[e.ty],F=SF_DEF[e.k],O=e.o&&SF_DEF[e.o],T=e.t&&CT[e.t];return `${A[0]} ${Ts(F.zh,F.en)} ${O?'→ '+Ts(O.zh,O.en):''} · ${Ts(A[1],A[2])}${T?' · '+Ts(T.zh,T.en):''}`;}
{const old=sfPanel;sfPanel=function(){const w=old.apply(this,arguments);try{const S=siState();const ord=Object.keys(SF_DEF).sort((a,b)=>S.rank[a]-S.rank[b]);
  const t=rsEl('div','sw-card');t.appendChild(rsEl('div','sw-h',Ts('权势排名','Power ranking')));
  t.appendChild(rsEl('table','sw-rtab',`<tr><th>#</th><th>${Ts('派','Bloc')}</th><th>${Ts('权势','Power')}</th><th>${Ts('城','Towns')}</th><th>${Ts('兵','Troops')}</th><th>${Ts('银','Wealth')}</th><th>${Ts('朝眷','Court')}</th><th>${Ts('扶持','Backing')}</th></tr>`+
    ord.map(k=>{const P=siPower(S,k);return `<tr data-sf="${k}"><td>${S.rank[k]}${siArrow(k,S)}</td><td style="color:${SF_DEF[k].col}"><b style="color:${SF_DEF[k].col}">${Ts(SF_SHORT[k][0],SF_SHORT[k][1])}</b></td><td><b>${S.pow[k]}</b></td><td>${sfTowns(k).length}</td><td>${S.tr[k]}</td><td>${S.w[k]}</td><td>${S.cf[k]}</td><td>${S.bk[k]||0}${S.side===k?' ★':''}</td></tr>`;}).join('')));
  t.appendChild(rsEl('div','sw-note',Ts('权势=城镇+兵力+财力+朝眷+清河扶持，逐月重排。势力在相邻城镇间扩散，压过守方者夺其城。','Power = towns + troops + wealth + court favour + Qinghe\'s backing, re-ranked monthly. Influence spreads town to town along the roads; a rival that outgrows the holder takes the town.')));
  w.insertBefore(t,w.children[2]||null);
  for(const c of w.querySelectorAll('.sw-fac')){const k=c.dataset.sf;if(!k)continue;const row=rsEl('div','sw-row');row.dataset.back=k;
    row.appendChild(rsBtn(S.side===k?'停止公开支持':`公开支持（月🪙${SI.SIDE_COST}）`,S.side===k?'Stop backing openly':`Back openly (🪙${SI.SIDE_COST}/month)`,()=>{siSide(k);campUI();},S.side!==k&&CAMP.res.silver<SI.SIDE_COST));
    row.appendChild(rsBtn(`运粮 🌾${SI.GRAIN}`,`Grain convoy 🌾${SI.GRAIN}`,()=>{siGrain(k);campUI();},!siGrainOk()));
    row.appendChild(rsBtn(`朝中进言（功绩${SI.COURT}）`,`Speak at court (${SI.COURT} merit)`,()=>{siCourt(k);campUI();},!siCourtOk()));
    c.appendChild(row);c.appendChild(rsEl('div','sw-note',`${Ts('扶持','Backing')} ${S.bk[k]||0}/100 · ${Ts('势力增速','influence growth')} ×${siGrowth(S,k).toFixed(2)}${S.side===k?' · ★ '+Ts('你公开支持此派，其对头更会在清河近旁施压','you back them openly; their rivals will press towns near Qinghe'):''}`));}
  const ev=S.evlog.slice(0,6);if(ev.length)w.appendChild(rsEl('div','sw-note sw-ev',`<b>${Ts('近来诸派相争','Recent rivalry')}</b><br>`+ev.map(e=>`${Ts(`${e.mo}月`,`M${e.mo}`)} ${siEvText(e)}`).join('<br>')));}catch(e){console.error(e);}return w;};}
function siInfBars(id){const S=siState(),o=S.inf[id];if(!o)return null;const h=sfOf(id)||siPatron(id),[a,b]=siTop(o),cont=o[b]>=25&&o[a]-o[b]<12;
  const w=rsEl('div','sw-inf');w.dataset.inf=id;for(const k of Object.keys(SF_DEF).sort((x,y)=>o[y]-o[x])){w.insertAdjacentHTML('beforeend',`<span style="color:${SF_DEF[k].col}">${Ts(SF_SHORT[k][0],SF_SHORT[k][1])}${k===h?' ★':''}</span><span><u style="--c:${SF_DEF[k].col};width:${Math.max(2,o[k])}%"></u></span><b>${Math.round(o[k])}</b>`);}
  const box=rsEl('div','sw-card');box.appendChild(rsEl('div','sw-note',`${Ts('诸派势力','Bloc influence')}${cont?' · ⚔ '+Ts('争夺中','contested'):''}${CG.T[id].own==='free'?' · '+Ts('未附之地：有势力倚靠，不改归属','unaligned: it leans to a patron but keeps its freedom'):''}`));box.appendChild(w);return box;}
{const old=terrPanel;terrPanel=function(id){const w=old.apply(this,arguments);try{const b=w&&siInfBars(id);if(b)w.appendChild(b);}catch(e){console.error(e);}return w;};}
window.__si={SI,siState,siMonth,siSpread,siActions,siPower,siRank,siGrowth,siBack,siSide,siGrain,siCourt,siPatron,siTop,siRivals,siFeudKey,siH,SF_SHORT,SI_ACT,V:SI.V};
