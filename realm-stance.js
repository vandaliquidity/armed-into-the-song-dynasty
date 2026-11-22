// v0.48 (t258) a rising Qinghe is noticed. Qinghe now has its own power score and stands in the ranking with the four blocs; as its power
// and renown grow against a bloc, that bloc takes a stance by its interests, and tribute flows both ways.
//  - Power: Qinghe's towns + troops + treasury + court merit + renown (renown comes from beating the tribes, see frontier-raids.js).
//  - Stance per bloc, re-read monthly with its reason: Watching / Friendly / Wary / Threatened / Courting / Seeks protection / Overbearing.
//    Liu (hawks) and Zhong (proud generals) feel threatened by a rival that grows armed next to them; Yao (horse traders) court the strong;
//    Tong's commission demands deference while it is far stronger and turns hostile when outgrown. Wariness rises with the power ratio,
//    with shared borders, with Qinghe backing their rivals and with Qinghe's own demands; it cools with standing.
//  - Threatened blocs act against Qinghe: they swear coalitions with other threatened blocs, block Qinghe's trade through their towns,
//    have Qinghe accused at court (merit and court support fall) and press the gentry of Qinghe's border towns (prosperity falls).
//  - Courting blocs send tribute (silver, grain, horses, or a captain and his company on loan for six months); weak, hard-pressed blocs
//    ask for Qinghe's protection (a monthly stipend while Qinghe guards them); a much stronger bloc demands tribute from Qinghe
//    (pay = standing and six quiet months; refuse = standing falls and four months of harassment). Qinghe, when strong, can demand
//    tribute from a weaker bloc in the Factions panel; whether it pays depends on the ratio, its temper and its wariness.
//  - Envoys wait in an envoy dialog (the 🏳 chip in the ranking strip), every act is a news line and a marker on the map.
'use strict';
const ST={V:'t258a',DEM_CD:6,TRIB_CD:4,ENV_TTL:2,PD_CD:6,LOAN:6,START:4};
const ST_TEMPER={liu:'hawk',yao:'trader',zhong:'proud',tong:'court'};
const ST_LBL={neutral:['观望','Watching','#d8d08a'],ally:['亲附','Friendly','#8fd07a'],wary:['戒备','Wary','#e0b060'],threat:['视为威胁','Threatened','#ff6a50'],
  court:['示好','Courting','#8fd07a'],protect:['求庇护','Seeks protection','#7ac8d0'],over:['盛气凌人','Overbearing','#c87ad0']};
Object.assign(SI_ACT,{stance:['🧭','态度转变','Stance shifts',0],tribute:['🎁','遣使进贡','Sends tribute',0],demand:['🏛','索贡','Demands tribute',0],qdemand:['💰','清河索贡','Qinghe demands tribute',0],
  coalition:['🤝','结盟制清河','Coalition against Qinghe',0],qblock:['⛔','封锁清河商路','Blocks Qinghe trade',0],qimpeach:['📜','弹劾清河','Accuses Qinghe at court',0],
  qpress:['✊','逼迫清河边镇','Presses Qinghe border town',0],protect:['🛡','求庇护','Asks protection',0],harass:['🔥','报复骚扰','Harassment',0]});
SF_SHORT.qh=['清河','Qinghe'];
const QH_COL='#c8901a';
function stState(S){S=S||siState();const T=S.st||(S.st={v:1,wr:{},stance:{},why:{},cd:{},env:[],coal:[],peace:{},har:{},hurt:{},pd:{},prot:{},loan:null,eid:1,qren:0});
  for(const k in SF_DEF){if(T.wr[k]==null)T.wr[k]=10;if(!T.stance[k])T.stance[k]='neutral';if(!T.why[k])T.why[k]=['',''];if(T.hurt[k]==null)T.hurt[k]=0;}T.env=T.env||[];T.coal=T.coal||[];return T;}
function stQhPower(){const S=siState(),T=stState(S);let tw=0;for(const id in CG.T)if(owned(id))tw+=siTownW(id);
  const tr=menOf(Object.values(CG.U)),w=Math.max(0,Math.min(6000,Math.round(CAMP.res.silver||0))),cf=Math.round(Math.min(100,(CG.fav&&CG.fav.pts)||0)),ren=Math.round(T.qren||0);
  return {tw,tr,w,cf,ren,p:Math.round(tw*4+tr/60+w/12+cf*.8+ren)};}
// Qinghe joins the ranking (bloc growth still averages the four blocs only, so t256's spread is unchanged)
{const old=siRank;siRank=function(S,init){const ord=old.apply(this,arguments);try{const T=stState(S),Q=stQhPower();if(!init){S.qpowPrev=S.qpow!=null?S.qpow:Q.p;S.rank5Prev={...(S.rank5||{})};}
  S.qpow=Q.p;const all=[...Object.keys(SF_DEF),'qh'],P=k=>k==='qh'?S.qpow:S.pow[k];const o5=all.sort((a,b)=>P(b)-P(a)||a.localeCompare(b));S.rank5={};o5.forEach((k,i)=>S.rank5[k]=i+1);
  if(init||!S.rank5Prev){S.rank5Prev=S.rank5Prev&&Object.keys(S.rank5Prev).length?S.rank5Prev:{...S.rank5};if(S.qpowPrev==null)S.qpowPrev=S.qpow;}}catch(e){console.error(e);}return ord;};}
function stRatio(S,k){return (S.qpow||stQhPower().p)/Math.max(1,S.pow[k]);}
function stBorder(k){const ts=sfTowns(k);if(!ts.length)return 0;let n=0;for(const id of ts)if(CADJ[id].some(owned))n++;return n/ts.length;}
function stQhBorderTowns(k){return Object.keys(CG.T).filter(id=>owned(id)&&CADJ[id].some(n=>sfOf(n)===k));}
function stEvent(S,ty,k,t,extra){const e=siEvent(S,ty,k,'qh',t||null,extra);e.o=null;e.q=1;return e;}
function stLine(lines,ic,zh,en){lines.push([ic,Ts(zh,en)]);}
function stHome(){return HOME;}
// ---- stance
function stRead(S,T,k){const r=stRatio(S,k),rel=sfState().rel[k],tm=ST_TEMPER[k],b=stBorder(k),F=SF_DEF[k],back=S.side&&siRivals(k).includes(S.side);
  const tgt=Math.max(0,Math.min(100,(r-.55)*75+b*30+(back?15:0)-rel*.25+T.hurt[k]+(T.coal.some(c=>c.a===k||c.b===k)?10:0)));T.wr[k]=Math.round((T.wr[k]+(tgt-T.wr[k])*.35)*10)/10;const wr=T.wr[k];
  const rpz=`清河权势 ${S.qpow} : ${SF_SHORT[k][0]} ${S.pow[k]}`,rpe=`Qinghe power ${S.qpow} : ${SF_SHORT[k][1]} ${S.pow[k]}`;let st,why;
  if(r<.5&&(tm==='court'||(b>0&&rel<15))){st='over';why=[`${rpz}，自恃势大，要清河俯首`,`${rpe}: far stronger, they expect Qinghe to defer`];}
  else if(r>=1.15){
    if(r>=1.7&&S.rank5[k]>=4&&tm!=='proud'&&wr<70){st='protect';why=[`${rpz}，势衰位末，欲倚清河`,`${rpe}: weak and near the bottom of the ranking, they look to Qinghe`];}
    else if(tm==='trader'||rel>=35||(tm==='court'&&rel>=0)){st='court';why=[`${rpz}，宁与日盛之清河交好`,`${rpe}: they would rather befriend a rising Qinghe`];}
    else{st='threat';why=[`${rpz}，清河坐大${b>0?'，且与其辖地接壤':''}`,`${rpe}: Qinghe has outgrown them${b>0?' and borders their towns':''}`];}}
  else if(wr>=55){st='threat';why=[`${rpz}，戒心${Math.round(wr)}${back?'，又恨你扶持其对头':''}`,`${rpe}; wariness ${Math.round(wr)}${back?', and you back their rival':''}`];}
  else if(wr>=30){st='wary';why=[`${rpz}，戒心${Math.round(wr)}${b>0?'，边境相接':''}`,`${rpe}; wariness ${Math.round(wr)}${b>0?', shared border':''}`];}
  else if(rel>=40){st='ally';why=[`${rpz}，交谊深厚`,`${rpe}; good standing`];}
  else{st='neutral';why=[`${rpz}，静观其变`,`${rpe}; they wait and see`];}
  return {st,why,r,wr};}
// ---- envoys (the dialog)
function stEnvoy(T,k,kind,o){const e={id:T.eid++,k,kind,mo:campaignMonth(),until:campaignMonth()+ST.ENV_TTL,...o};T.env=T.env.filter(x=>!(x.k===k&&x.kind===kind));T.env.push(e);return e;}
function stEnvText(e){const F=SF_DEF[e.k],g=e.goods||{},gs=stGoods(g);
  if(e.kind==='tribute')return [`${F.zh}遣使携${gs[0]}来贺，愿与清河交好。`,`${F.en} sends an envoy with ${gs[1]}, seeking Qinghe's friendship.`];
  if(e.kind==='demand')return [`${F.zh}使者傲然索要${gs[0]}，称“以示恭顺”。拒之则其必相扰。`,`${F.en}'s envoy demands ${gs[1]} "as a token of deference". Refuse and they will harass you.`];
  if(e.kind==='protect')return [`${F.zh}势衰，请清河庇护其城镇，愿月奉银${e.stip}。`,`${F.en}, hard-pressed, asks Qinghe to protect its towns and offers ${e.stip} silver a month.`];return ['',''];}
function stGoods(g){const z=[],n=[];if(g.silver){z.push(`银${g.silver}`);n.push(`${g.silver} silver`);}if(g.grain){z.push(`粮${g.grain}`);n.push(`${g.grain} grain`);}if(g.horse){z.push(`马${g.horse}`);n.push(`${g.horse} horses`);}
  if(g.loan){z.push(`将校一员（领兵${g.loan}，借期${ST.LOAN}月）`);n.push(`a captain with ${g.loan} men on loan for ${ST.LOAN} months`);}return [z.join('、')||'薄礼',n.join(', ')||'a small gift'];}
function stAnswer(id,yes){const S=siState(),T=stState(S),e=T.env.find(x=>x.id===id);if(!e)return {ok:false};const k=e.k,F=SF_DEF[k],mo=campaignMonth(),lines=[];
  if(e.kind==='tribute'){if(yes){stGain(e.goods,k);sfAdd(k,4,'tribute');stLine(lines,'🎁',`收下${F.zh}之礼`,`You accept ${F.en}'s tribute`);}else{sfAdd(k,2,'tribute');T.wr[k]=Math.max(0,T.wr[k]-6);stLine(lines,'🎁',`婉谢${F.zh}之礼，彼戒心稍解`,`You politely return ${F.en}'s gifts; they are less wary`);}}
  else if(e.kind==='demand'){const g=e.goods;if(yes){if(CAMP.res.silver<(g.silver||0)||(CG.T[HOME].st.grain||0)<(g.grain||0))return {ok:false,why:'cost'};CAMP.res.silver-=g.silver||0;CG.T[HOME].st.grain-=g.grain||0;
      sfAdd(k,6,'tribute');T.peace[k]=mo+6;T.wr[k]=Math.max(0,T.wr[k]-8);stEvent(S,'demand',k,stHome(),{paid:1});stLine(lines,'🏳',`清河如数纳贡于${F.zh}，换得半年安宁`,`Qinghe pays ${F.en}'s tribute and buys six quiet months`);}
    else stRefuse(S,T,k,lines);}
  else if(e.kind==='protect'){if(yes){T.prot[k]={until:mo+12,stip:e.stip};sfAdd(k,8,'protect');siBack(k,10);for(const o of siRivals(k))T.wr[o]=Math.min(100,(T.wr[o]||0)+8);stLine(lines,'🛡',`清河应允庇护${F.zh}，其对头侧目`,`Qinghe takes ${F.en} under its protection; their rivals take note`);}
    else{sfAdd(k,-3,'protect');stLine(lines,'🛡',`清河婉拒${F.zh}所请`,`Qinghe declines ${F.en}'s request`);}}
  T.env=T.env.filter(x=>x!==e);for(const l of lines)cgLog(l[0],l[1]);S.ver++;return {ok:true,lines};}
function stRefuse(S,T,k,lines){const F=SF_DEF[k],mo=campaignMonth();if(politicsProtected()){T.peace[k]=mo+3;return;}sfAdd(k,-5,'refused');T.har[k]=mo+4;T.cd[k]=mo+1;(T.demCd||(T.demCd={}))[k]=mo+6;T.wr[k]=Math.min(100,T.wr[k]+5);stEvent(S,'harass',k,stHome());
 stLine(lines,'⚔',`清河拒绝${F.zh}索贡，彼扬言报复`, `Qinghe refuses ${F.en}'s demand; limited retaliation may follow`);}
function stGain(g,k){g=g||{};if(g.silver)CAMP.res.silver+=g.silver;const h=CG.T[HOME];if(g.grain)h.st.grain=(h.st.grain||0)+g.grain;if(g.horse)h.st.horse=(h.st.horse||0)+g.horse;
  if(g.loan&&typeof newUnit==='function'){const T=stState(),u=newUnit(k==='yao'?'cav':'spear',g.loan,{loc:{v:HOME},mor:70,exp:2});u.loan=k;T.loan={k,u:u.id,until:campaignMonth()+ST.LOAN};}}
function stLoanEnd(T,lines){const L=T.loan;if(!L||campaignMonth()<L.until)return;const u=CG.U[L.u];if(u){for(const a of CG.armies)a.units=a.units.filter(i=>i!==u.id);delete CG.U[u.id];}
  T.loan=null;stLine(lines,'🎖',`${SF_DEF[L.k].zh}借调之兵期满归营`,`The company on loan from ${SF_DEF[L.k].en} returns home`);}
// ---- the month
function stMonth(lines){const S=siState(),T=stState(S),mo=campaignMonth(),F0=SF_DEF;politicsOpeningClean();T.qren=Math.max(0,Math.round((T.qren||0)*.97*10)/10);
  for(const k in T.hurt)T.hurt[k]=Math.max(0,Math.round(T.hurt[k]*.85));T.coal=T.coal.filter(c=>c.until>mo);stLoanEnd(T,lines);
  // Unanswered demands expire peacefully; refusing explicitly is a separate choice.
  for(const e of T.env.slice())if(e.until<=mo){T.env=T.env.filter(x=>x!==e);if(e.kind==='demand'){stLine(lines,'📜',`${SF_DEF[e.k].zh}的索贡使者离去，未引发报复。`,`${SF_DEF[e.k].en}'s demand expires without retaliation.`);}else if(e.kind==='tribute'){stGain(e.goods,e.k);}}
  for(const k in T.prot){const P=T.prot[k];if(P.until<=mo||!sfTowns(k).length){delete T.prot[k];continue;}CAMP.res.silver+=P.stip;}
  if(campaignMonth()<ST.START)return;
  for(const k of Object.keys(SF_DEF)){const F=F0[k],R=stRead(S,T,k),was=T.stance[k];T.stance[k]=R.st;T.why[k]=R.why;
    if(was!==R.st){stEvent(S,'stance',k,siBig(k),{st:R.st});const L=ST_LBL[R.st];stLine(lines,'🧭',`${F.zh}对清河态度转为「${L[0]}」：${R.why[0]}`,`${F.en} is now ${L[1].toLowerCase()} toward Qinghe: ${R.why[1]}`);}
    if((T.cd[k]||0)>mo)continue;const quiet=(T.peace[k]||0)>mo,har=(T.har[k]||0)>mo;
    if(R.st==='threat'||har){if(quiet||!politicsPressureReady(T))continue;const inCoal=T.coal.some(c=>c.a===k||c.b===k);const p=Math.min(.75,.22+R.wr/300+(inCoal?.1:0)+(har?.3:0));if(siH('st',k,mo)>=p)continue;if(stHostile(S,T,k,R,lines,har))T.cd[k]=mo+OPENING_BALANCE.factionGap;}
    else if(R.st==='court'){if(siH('trib',k,mo)>=.4)continue;const g=stTribGoods(S,k,mo);stEnvoy(T,k,'tribute',{goods:g});stEvent(S,'tribute',k,siBig(k));
      stLine(lines,'🎁',`${F.zh}遣使携礼赴清河示好（待你接见）`,`${F.en} sends an envoy with gifts to Qinghe (waiting to be received)`);T.cd[k]=mo+ST.TRIB_CD;}
    else if(R.st==='protect'){if(T.prot[k]||siH('prot',k,mo)>=.45)continue;const stip=10+Math.round(S.w[k]/40);stEnvoy(T,k,'protect',{stip});stEvent(S,'protect',k,siBig(k));
      stLine(lines,'🛡',`${F.zh}遣使求清河庇护`,`${F.en} sends an envoy asking for Qinghe's protection`);T.cd[k]=mo+6;}
    else if(R.st==='over'){if(quiet||!politicsPressureReady(T)||(T.demCd?.[k]||0)>mo||siH('dem',k,mo)>=.35)continue;const g=politicsDemandGoods();if(!g)continue;T.lastPressure=mo;stEnvoy(T,k,'demand',{goods:g});stEvent(S,'demand',k,stHome());
      stLine(lines,'🏛',`${F.zh}使者至清河，索银${g.silver}、粮${g.grain}`,`An envoy of ${F.en} arrives in Qinghe demanding ${g.silver} silver and ${g.grain} grain`);T.cd[k]=mo+ST.DEM_CD;}}
  S.ver++;}
function stTribGoods(S,k,mo){const h=siH('tg',k,mo),w=S.w[k];if(k==='yao')return {horse:6+Math.round(h*8),silver:20};if(k==='zhong')return {grain:150+Math.round(h*120)};
  if(k==='liu')return h<.5?{loan:100,silver:20}:{silver:40+Math.round(w/12)};return {silver:60+Math.round(h*60)};}
function stHostile(S,T,k,R,lines,har){if(!politicsPressureReady(T)||(T.cd[k]||0)>campaignMonth())return false;const F=SF_DEF[k],mo=campaignMonth(),W=[1.2,1,1,.8];
  const other=Object.keys(SF_DEF).find(o=>o!==k&&T.stance[o]==='threat'&&!T.coal.some(c=>(c.a===k&&c.b===o)||(c.a===o&&c.b===k)));if(!other)W[3]=0;
  const bt=stQhBorderTowns(k);if(!bt.length){W[0]=0;W[2]=0;}if(har){W[0]*=1.5;W[2]*=1.5;}
  const tot=W.reduce((a,b)=>a+b,0);if(!tot)return false;T.lastPressure=mo;T.cd[k]=mo+OPENING_BALANCE.factionGap;let r=siH('stp',k,mo)*tot,ty=0;while(ty<3&&r>W[ty]){r-=W[ty];ty++;}
  if(ty===0){const b=bt[Math.floor(siH('qb',k,mo)*bt.length)],a=CADJ[b].find(n=>sfOf(n)===k)||b;S.blk=(S.blk||[]).filter(x=>x.until>mo);S.blk.push({k,o:'qh',a,b,until:mo+2});
    stEvent(S,'qblock',k,b,{b:a});stLine(lines,'⛔',`${F.zh}封锁通往清河${CT[b].zh}的商路两月`,`${F.en} closes the roads into Qinghe's ${CT[b].en} for two months`);}
  else if(ty===1){const hit=2+Math.round(siH('qi',k,mo)*2);if(typeof favAdd==='function')favAdd(-hit,'court');if(CG.fac)CG.fac.court=Math.max(0,CG.fac.court-1);S.cf[k]=Math.max(0,S.cf[k]-2);
    stEvent(S,'qimpeach',k,stHome(),{hit});stLine(lines,'📜',`${F.zh}遣台谏弹劾清河擅权，功绩-${hit}，朝官支持-1`,`${F.en} has Qinghe accused at court of overreach: merit -${hit}, court support -1`);}
  else if(ty===2){const id=bt[Math.floor(siH('qp',k,mo)*bt.length)],s=CG.T[id],d=2+Math.round(siH('qpd',k,mo)*2);s.prosp=Math.max(0,s.prosp-d);
    stEvent(S,'qpress',k,id);stLine(lines,'✊',`${F.zh}逼迫清河${CT[id].zh}乡绅，民心不安（繁荣-${d}）`,`${F.en} leans on the gentry of Qinghe's ${CT[id].en}: unrest (prosperity -${d})`);}
  else{T.coal.push({a:k,b:other,until:mo+12});const fk=siFeudKey(k,other);if(S.feud[fk]!=null)S.feud[fk]=Math.max(0,S.feud[fk]-12);
    stEvent(S,'coalition',k,siBig(k),{with:other});stLine(lines,'🤝',`${F.zh}与${SF_DEF[other].zh}暂释宿怨，结盟以制清河`,`${F.en} and ${SF_DEF[other].en} set aside their feud and combine against Qinghe`);}return true;}
{const old=siMonth;siMonth=function(lines){const r=old.apply(this,arguments);try{stMonth(lines);}catch(e){console.error(e);}return r;};}
// ---- Qinghe demands tribute from a weaker bloc
function stCanDemand(k){const S=siState(),T=stState(S);return stRatio(S,k)>=1.3&&(T.pd[k]||0)<=campaignMonth();}
function stDemand(k){const S=siState(),T=stState(S),F=SF_DEF[k],mo=campaignMonth();if(!stCanDemand(k))return {ok:false};const r=stRatio(S,k),tm=ST_TEMPER[k];
  const pc=Math.max(.1,Math.min(.9,.3+(r-1.3)*.5+(tm==='trader'?.2:0)-(tm==='hawk'?.15:0)-(tm==='proud'?.1:0)-T.wr[k]/300));const yes=siH('pd',k,mo,T.eid)<pc;T.pd[k]=mo+ST.PD_CD;T.eid++;let msg;
  if(yes){const g={silver:Math.min(300,30+Math.round(S.pow[k]/5)),grain:100};S.w[k]=Math.max(0,S.w[k]-g.silver);stGain(g,k);sfAdd(k,-6,'demand');T.wr[k]=Math.min(100,T.wr[k]+12);T.hurt[k]+=10;
    msg=Ts(`${F.zh}不敢违逆，纳银${g.silver}、粮${g.grain}于清河，然心怀怨望`,`${F.en} dares not refuse: ${g.silver} silver and ${g.grain} grain reach Qinghe, with resentment`);}
  else{sfAdd(k,-10,'demand');T.wr[k]=Math.min(100,T.wr[k]+8);T.hurt[k]+=6;CAMP.res.rep=Math.max(0,(CAMP.res.rep||0)-2);msg=Ts(`${F.zh}断然拒绝清河索贡，清河颜面受损`,`${F.en} flatly refuses Qinghe's demand; Qinghe loses face`);}
  stEvent(S,'qdemand',k,siBig(k),{paid:yes?1:0});cgLog(yes?'💰':'✋',msg);S.ver++;return {ok:true,paid:yes,p:pc};}
// ---- UI: Qinghe in the ranking strip and table, stance chips with reasons, envoy dialog, demand button
const ST_CSS=`.sw-rk.qh{border-color:${QH_COL};background:rgba(90,60,14,.92)}.sw-rk.env{border-color:#ffd070;animation:swPulse 1.4s ease-in-out infinite}@keyframes swPulse{50%{box-shadow:0 0 0 3px rgba(255,208,112,.35)}}
.sw-stance{display:inline-block;border:1px solid var(--c);color:var(--c);border-radius:999px;padding:0 8px;font-size:12px;margin-right:4px}.sw-why{font-size:12px;opacity:.85}
.sw-rtab tr.qh td{background:rgba(200,144,26,.14)}.sw-env{border-left:4px solid #ffd070;padding:8px 10px;background:rgba(255,240,200,.06);border-radius:var(--sw-r1)}.sw-env .sw-h{border:0}
.sw-wr{display:inline-block;width:60px;height:6px;border-radius:3px;background:rgba(255,255,255,.12);vertical-align:middle;margin:0 4px}.sw-wr u{display:block;height:6px;border-radius:3px;background:linear-gradient(90deg,#d8d08a,#ff6a50)}`;
(function(){if(document.getElementById('stCss'))return;const st=document.createElement('style');st.id='stCss';st.textContent=ST_CSS;document.head.appendChild(st);})();
function stArrowQ(S){const d=((S.rank5Prev||{}).qh||S.rank5.qh)-S.rank5.qh,dp=(S.qpow||0)-(S.qpowPrev||0);return d>0?`<em class="up">▲${d}</em>`:d<0?`<em class="dn">▼${-d}</em>`:dp>0?`<em class="up">↑</em>`:dp<0?`<em class="dn">↓</em>`:'<em>–</em>';}
function stChip(k){const T=stState(),L=ST_LBL[T.stance[k]]||ST_LBL.neutral;return `<span class="sw-stance" style="--c:${L[2]}">${Ts(L[0],L[1])}</span>`;}
{const old=siRankStrip;siRankStrip=function(){const w=old.apply(this,arguments);try{const S=siState(),T=stState(S);if(S.rank5){
  for(const c of w.querySelectorAll('.sw-rk')){const k=c.dataset.sf,n=c.querySelector('.n');if(n&&S.rank5[k])n.textContent=S.rank5[k];}
  const nar=typeof mobNarrow==='function'&&mobNarrow(),q=rsEl('span','sw-rk qh',`<span class="n">${S.rank5.qh}</span> <i></i>${nar?SF_SHORT.qh[LANG==='en'?1:0]:Ts('清河','Qinghe')} <b>${S.qpow}</b>${stArrowQ(S)}`);q.style.setProperty('--c',QH_COL);q.dataset.sf='qh';
  q.title=Ts('清河（你）','Qinghe (you)');q.onclick=()=>{CSEL={sf:1};campUI();};const list=[...w.querySelectorAll('.sw-rk')];const at=list.find(c=>S.rank5[c.dataset.sf]>S.rank5.qh);w.insertBefore(q,at||null);
  if(T.env.length){const e=rsEl('span','sw-rk env',`🏳 ${nar?'':Ts('来使','Envoy')} <b>${T.env.length}</b>`);e.id='swEnvChip';e.title=Ts('有使者待见','Envoys are waiting');e.onclick=()=>{CSEL={env:1};campUI();};w.appendChild(e);}}}catch(e){console.error(e);}return w;};}
function stEnvPanel(){const S=siState(),T=stState(S),w=rsEl('div','sw-card');w.id='swEnvoy';w.appendChild(rsEl('div','sw-h',Ts('来使','Envoys at Qinghe')));
  if(!T.env.length)w.appendChild(rsEl('div','sw-note',Ts('眼下无使者待见。','No envoys are waiting.')));
  for(const e of T.env){const F=SF_DEF[e.k],tx=stEnvText(e),c=rsEl('div','sw-env');c.dataset.env=e.id;c.dataset.kind=e.kind;c.style.borderLeftColor=F.col;
    c.innerHTML=`<div class="sw-h" style="color:${F.col}">${{tribute:'🎁',demand:'🏛',protect:'🛡'}[e.kind]} ${Ts(F.zh,F.en)} · ${Ts(F.lead[0],F.lead[1])}</div><div class="sw-p">${Ts(tx[0],tx[1])}</div><div class="sw-note">${stChip(e.k)} ${Ts(T.why[e.k][0],T.why[e.k][1])} · ${Ts('限期','answer by')} ${Ts(`${e.until}月`,`M${e.until}`)}</div>`;
    const row=rsEl('div','sw-row');
    if(e.kind==='tribute'){row.appendChild(rsBtn('收下（交谊+4）','Accept (standing +4)',()=>{stAnswer(e.id,true);campUI();}));row.appendChild(rsBtn('婉谢（戒心-6）','Return politely (wariness -6)',()=>{stAnswer(e.id,false);campUI();}));}
    else if(e.kind==='demand'){const g=e.goods,can=CAMP.res.silver>=(g.silver||0)&&(CG.T[HOME].st.grain||0)>=(g.grain||0);row.appendChild(rsBtn(`纳贡（交谊+6，半年无扰）`,`Pay (standing +6, six quiet months)`,()=>{stAnswer(e.id,true);campUI();},!can));
      row.appendChild(rsBtn('拒绝（交谊-10，四月骚扰）','Refuse (standing -10, four months of harassment)',()=>{stAnswer(e.id,false);campUI();}));}
    else{row.appendChild(rsBtn(`应允（月得银${e.stip}）`,`Accept (+${e.stip} silver a month)`,()=>{stAnswer(e.id,true);campUI();}));row.appendChild(rsBtn('婉拒','Decline',()=>{stAnswer(e.id,false);campUI();}));}
    c.appendChild(row);w.appendChild(c);}
  w.appendChild(rsBtn('返回诸派','Back to the factions',()=>{CSEL={sf:1};campUI();}));return w;}
{const old=selPanel;selPanel=function(){if(CSEL&&CSEL.env){if(typeof rsMobInsp==='function')setTimeout(rsMobInsp,0);const w=rsEl('div');w.appendChild(stEnvPanel());return w;}return old.apply(this,arguments);};}
{const old=sfPanel;sfPanel=function(){const w=old.apply(this,arguments);try{const S=siState(),T=stState(S),Q=stQhPower(),tab=w.querySelector('.sw-rtab');
  if(tab&&S.rank5){for(const tr of tab.querySelectorAll('tr[data-sf]')){const td=tr.firstElementChild;if(td)td.innerHTML=S.rank5[tr.dataset.sf]+siArrow(tr.dataset.sf,S);}
    const row=document.createElement('tr');row.className='qh';row.dataset.sf='qh';row.innerHTML=`<td>${S.rank5.qh}${stArrowQ(S)}</td><td><b style="color:${QH_COL}">${Ts('清河（你）','Qinghe (you)')}</b></td><td><b>${S.qpow}</b></td><td>${Object.keys(CG.T).filter(owned).length}</td><td>${Q.tr}</td><td>${Q.w}</td><td>${Q.cf}</td><td>${Ts('声望','renown')} ${Q.ren}</td>`;
    const rows=[...tab.querySelectorAll('tr[data-sf]')],at=rows.find(r=>S.rank5[r.dataset.sf]>S.rank5.qh);(at?at.parentNode:rows[0]?.parentNode||tab).insertBefore(row,at||null);}
  if(T.env.length){const b=rsEl('div','sw-env',`🏳 ${Ts(`有${T.env.length}位使者待见`,`${T.env.length} envoy(s) waiting`)}`);b.appendChild(rsBtn('接见','Receive',()=>{CSEL={env:1};campUI();}));w.insertBefore(b,w.children[1]||null);}
  for(const c of w.querySelectorAll('.sw-fac')){const k=c.dataset.sf;if(!k||!SF_DEF[k])continue;const L=ST_LBL[T.stance[k]]||ST_LBL.neutral,r=stRatio(S,k);
    const box=rsEl('div','sw-p');box.dataset.stance=T.stance[k];box.innerHTML=`${stChip(k)}<span class="sw-note">${Ts('戒心','wariness')}</span><span class="sw-wr"><u style="width:${Math.round(T.wr[k])}%"></u></span><b>${Math.round(T.wr[k])}</b><div class="sw-why">${Ts(T.why[k][0],T.why[k][1])||Ts('尚未表态','No stance yet')}${T.coal.some(x=>x.a===k||x.b===k)?' · 🤝 '+Ts('已结盟制清河','in a coalition against Qinghe'):''}${(T.har[k]||0)>campaignMonth()?' · 🔥 '+Ts('正在报复','harassing you'):''}${(T.peace[k]||0)>campaignMonth()?' · 🕊 '+Ts('纳贡后相安','quiet after tribute'):''}${T.prot[k]?' · 🛡 '+Ts('受清河庇护','under Qinghe\'s protection'):''}</div>`;
    c.insertBefore(box,c.querySelector('.sw-row')||null);
    const row=c.querySelector('[data-back]')||c;const can=stCanDemand(k);const b=rsBtn('索贡','Demand tribute',()=>{stDemand(k);campUI();},!can);b.dataset.demand=k;b.title=can?Ts('清河势大，可令其纳贡','Qinghe is strong enough to demand tribute'):Ts(`需清河权势达其1.3倍（现${r.toFixed(2)}倍）且无冷却`,`Needs Qinghe at 1.3x their power (now ${r.toFixed(2)}x) and no cooldown`);row.appendChild(b);}}catch(e){console.error(e);}return w;};}
window.__st={ST,ST_TEMPER,ST_LBL,stState,stQhPower,stMonth,stRead,stAnswer,stDemand,stCanDemand,stEnvoy,stRatio,stHostile,V:ST.V};

{const old=sfTradeMul;sfTradeMul=function(k){const m=old(k);return politicsProtected()?Math.max(1,m):m;};}
