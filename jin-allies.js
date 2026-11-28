'use strict';
// v0.68 (t264 phase D) The Jin war is won by arms, and helped by friends.
//  - Victory stays military: Kaifeng holds only if the defence at the capital outweighs the Jin host (jin-campaign.js jinCapital).
//    Qinghe's own army is the main path and can win alone if it is strong enough.
//  - Excellent diplomacy and commerce turn into real soldiers: Song blocs with high standing, and Qinghe's tributary towns, commit
//    named contingents in their own colours when the Jin mobilise. Contingents march along the roads on the campaign map, add to
//    the defence of the town they stand in (jinPlayerPower), fight beside Qinghe's companies in Jin battles (battleSpec), and can
//    instead be told to hold Qinghe's forts (frDef).
//  - Allies follow a leader: help scales with Qinghe's own army (full help from 1,500 strength) and can never exceed it.
//  - Trade buys war: mercenary companies and remounts, limited by trade depth (trade-route income and charters).
//  - Neglected blocs send nothing; hostile ones (standing below -30, or at war) defect when the Jin arrive and add men to the Jin.
//  - A Jin war readiness panel lists every source against the expected Jin host.
const JA={V:1,LEAD:1500,COMMIT:60,CORDIAL:30,DEFECT:-30,MOB:1125*12+10,SPEED:2,MERC:{silver:180,men:100,per:20,max:4},HORSE:{silver:90,n:20},
 CH:{liu:'刘',yao:'姚',zhong:'种',tong:'童',trib:'贡'},TRIB_COL:'#d9a62a'};
function jaState(){if(!CG)return null;const S=CG.ja||(CG.ja={v:JA.V,c:[],mob:false,defect:{},defApplied:false,hired:0,horses:0,id:1,dest:'kaifeng'});S.c=S.c||[];S.defect=S.defect||{};return S;}
function jaAbs(){return historyAbsoluteMonth();}
function jaJinPlanned(){const j=jinState();if(j.second){return j.armies.filter(a=>a.phase===2&&!a.defeated&&!['withdrawn','retreat'].includes(a.state)).reduce((n,a)=>n+a.men,0)||0;}return 22000;}
function jaOwn(){let own=0,merc=0;for(const u of Object.values(CG.U)){if(!u||u.men<=0||u.tm===1)continue;const p=unitPow(u)*100;if(u.merc)merc+=p;else own+=p;}return {own:Math.round(own),merc:Math.round(merc)};}
function jaOwnAt(id){let n=0;for(const u of Object.values(CG.U))if(unitSite(u)===id||(u.loc?.a&&CG.armies.find(a=>a.id===u.loc.a)?.loc===id))n+=unitPow(u)*100;return Math.round(n);}
function jaCharters(k){let n=0;for(const id in (CG.trade||{}))if(CG.trade[id]&&sfOf(id)===k)n++;return n;}
function jaStanding(k){if(typeof hdAtWar==='function'&&hdAtWar(k))return -100;const rel=sfState().rel[k]||0,S=siState(),T=stState(S),st=T.stance[k],bk=S.bk?.[k]||0,wr=T.wr[k]||0;
 const sb={ally:25,court:15,protect:20,neutral:0,wary:-10,threat:-25,over:-10}[st]||0;return Math.round(clamp(rel+bk*.3-(wr-10)*.4+sb+jaCharters(k)*8,-100,100));}
function jaTrade(){let tr=0;try{for(const r of ROUTES)tr+=r.v;}catch(e){}return Math.round(tr+Object.values(CG.trade||{}).filter(Boolean).length*10);}
function jaMercMax(){return Math.min(JA.MERC.max,Math.floor(jaTrade()/JA.MERC.per));}
function jaBlocPledge(k){const s=jaStanding(k),F=SF_DEF[k];if(s>=JA.COMMIT)return {k,tier:'commit',men:Math.round(300+15*(s-JA.COMMIT)),q:1.1,s};if(s>=JA.CORDIAL)return {k,tier:'token',men:150,q:1,s};
 if(s<JA.DEFECT)return {k,tier:'defect',men:Math.round(300+Math.min(300,(JA.DEFECT-s)*6)),q:1,s};return {k,tier:'watch',men:0,q:1,s};}
function jaTribPledges(){const H=CG.hold;if(!H?.trib)return [];return Object.entries(H.trib).filter(([id,t])=>t.on&&CG.T[id]?.own==='song').map(([id])=>({k:'trib',id,tier:'tributary',men:Math.round(Math.min(300,120+(CG.T[id].pop||0)/50)),q:.85}));}
function jaLead(own){return clamp(own/JA.LEAD,0,1);}
// what every source would bring if the Jin came now (live contingents once mobilised)
function jaSources(){const S=jaState(),o=jaOwn(),blocs=Object.keys(SF_DEF).map(jaBlocPledge),trib=jaTribPledges(),help=[...blocs.filter(p=>p.tier==='commit'||p.tier==='token'),...trib];
 const raw=help.reduce((n,p)=>n+p.men*p.q,0),L=jaLead(o.own),cap=o.own,eff=Math.min(raw*L,cap),f=raw>0?eff/raw:0;for(const p of help)p.eff=Math.round(p.men*p.q*f);
 let live=null;if(S.mob){live={};for(const c of S.c)if(c.state!=='withdrawn'&&c.state!=='routed')live[c.src]=(live[c.src]||0)+Math.round(c.men*c.q);}
 const defect=blocs.filter(p=>p.tier==='defect');const aid=historyAid(),aidPow=Math.round((Math.min(aid.crossbows,2000)*40+Math.min(aid.grain,5000)*2+historyReadiness()*100)/8),garr=CG.T.kaifeng?.songGarrison?.men||0;
 const jin=jaJinPlanned()+(S.mob?0:defect.reduce((n,p)=>n+p.men,0)),need=Math.max(0,Math.round(jin/8-aidPow-garr));
 const friendly=(live?Object.values(live).reduce((a,b)=>a+b,0):Math.round(eff));return {own:o.own,merc:o.merc,ownKaifeng:jaOwnAt('kaifeng'),blocs,trib,help,lead:L,cap,friendly,live,defect,jin,need,garr,aidPow,trade:jaTrade()};}
function jaPath(from,to){const prev={[from]:null},q=[from];for(const x of q){if(x===to)break;for(const y of CADJ[x]||[])if(!(y in prev)){prev[y]=x;q.push(y);}}if(!(to in prev))return [from];const p=[];for(let x=to;x!=null;x=prev[x])p.unshift(x);return p;}
function jaName(p){if(p.k==='trib')return [`${CT[p.id].zh}乡勇`,`${CT[p.id].en} levies`];const F=SF_DEF[p.k];return [`${F.lead[0]}部`,`${F.lead[1]}'s contingent`];}
function jaOrigin(p){if(p.k==='trib')return p.id;const ts=sfTowns(p.k).sort((a,b)=>(CG.T[b].pop||0)-(CG.T[a].pop||0));return ts[0]||HOME;}
function jaMobilise(lines){const S=jaState();if(S.mob)return;S.mob=true;const src=jaSources();
 for(const p of src.help){if(!p.eff)continue;const from=jaOrigin(p),dest=S.dest==='home'?HOME:'kaifeng',c={id:S.id++,src:p.k==='trib'?'trib:'+p.id:p.k,k:p.k,name:jaName(p),men:Math.round(p.eff/p.q),q:p.q,path:jaPath(from,dest),step:0,at:from,state:'march',anim:0,col:p.k==='trib'?JA.TRIB_COL:SF_DEF[p.k].col,ch:JA.CH[p.k]||'宋'};S.c.push(c);
  cgLog('🚩',Tz(`${c.name[0]}${c.men}人应清河之约，开赴${tName(dest)}`,`${c.name[1]} (${c.men} men) answers Qinghe's call and marches for ${CT[dest].en}`));}
 for(const p of src.defect){S.defect[p.k]=p.men;cgLog('☠',Tz(`${SF_DEF[p.k].zh}与清河交恶，金军南下之际倒向金人（金军+${p.men}）`,`The ${SF_DEF[p.k].en}, estranged from Qinghe, goes over to the Jin as they arrive (+${p.men} Jin)`));}
 if(lines)lines.push(['🚩',Tz('金军南下，盟友与属村出兵','The Jin come south: allies and tributaries send troops')]);}
function jaMarch(){const S=jaState();for(const c of S.c){if(c.state!=='march')continue;
  if(c.k!=='trib'&&jaStanding(c.k)<0){c.state='withdrawn';cgLog('🏳',Tz(`${c.name[0]}因与清河失和撤回`,`${c.name[1]} turns back: its bloc has fallen out with Qinghe`));continue;}
  for(let i=0;i<JA.SPEED&&c.step<c.path.length-1;i++){c.step++;c.at=c.path[c.step];c.anim=0;}if(c.step>=c.path.length-1){c.state='garrison';cgLog('🚩',Tz(`${c.name[0]}抵达${tName(c.at)}`,`${c.name[1]} reaches ${CT[c.at].en}`));}}}
function jaHere(id){const S=CG?.ja;if(!S?.mob)return [];return S.c.filter(c=>c.at===id&&(c.state==='march'||c.state==='garrison')&&c.men>0);}
function jaPowAt(id){return Math.round(jaHere(id).reduce((n,c)=>n+c.men*c.q,0));}
function jaApplyDefect(){const S=jaState(),j=jinState();if(S.defApplied||!j.second)return;const host=j.armies.find(a=>a.phase===2&&!a.defeated);if(!host)return;const n=Object.values(S.defect).reduce((a,b)=>a+b,0);if(n){host.men+=n;}S.defApplied=true;}
function jaRedirect(dest){const S=jaState();S.dest=dest;const to=dest==='home'?HOME:'kaifeng';for(const c of S.c){if(c.state==='withdrawn'||c.state==='routed')continue;c.path=jaPath(c.at,to);c.step=0;c.state=c.path.length>1?'march':'garrison';}return true;}
// hooks: the defence of any town counts contingents standing in it
{const old=jinPlayerPower;jinPlayerPower=function(id){return old.apply(this,arguments)+jaPowAt(id);};}
{const old=jinOccupy;jinOccupy=function(a,id){const r=old.apply(this,arguments);try{if(r){for(const c of jaHere(id)){c.men=Math.round(c.men*.5);c.state=c.men<60?'routed':'march';c.path=jaPath(id,'kaifeng');c.step=0;cgLog('🩸',Tz(`${c.name[0]}在${CT[id].zh}失利，残部退往汴京`,`${c.name[1]} is beaten at ${CT[id].en}; survivors fall back on Kaifeng`));}}}catch(e){console.error(e);}return r;};}
{const old=jinCapital;jinCapital=function(){const j=jinState(),was=j.outcome;const r=old.apply(this,arguments);try{if(!was&&j.outcome){for(const c of jaHere('kaifeng'))c.men=Math.round(c.men*(j.outcome==='averted'?.7:.3));if(j.outcome==='averted'&&jaState().c.some(c=>c.at==='kaifeng'&&c.men>0)){for(const k of new Set(jaState().c.filter(c=>c.at==='kaifeng'&&c.k!=='trib').map(c=>c.k)))sfAdd(k,10,'victory');}}}catch(e){console.error(e);}return r;};}
{const old=jinTick;jinTick=function(){try{const S=jaState();if(S&&!CG.jin?.outcome){if(!S.mob&&jaAbs()>=JA.MOB)jaMobilise(CG.lastRep?.lines);else if(S.mob)jaMarch();}}catch(e){console.error(e);}const r=old.apply(this,arguments);try{jaApplyDefect();}catch(e){console.error(e);}return r;};}
// allies fight beside Qinghe in Jin battles at their town
{const old=battleSpec;battleSpec=function(q){const s=old(q);try{if(s&&s.enemyFaction==='jin'){const here=jaHere(q.terr);if(here.length){const N=s.N||1;for(const c of here){const cav=c.k==='yao'?.4:.15;s.tro.spear=(s.tro.spear||0)+Math.round(c.men*(.85-cav)*.6/N);s.tro.xbow=(s.tro.xbow||0)+Math.round(c.men*(.85-cav)*.4/N);s.tro.cav=(s.tro.cav||0)+Math.round(c.men*cav/N);}s.allies=here.map(c=>({name:c.name,men:c.men,col:c.col}));if(s.hud)s.hud.en+=' · '+here.map(c=>c.name[1]).join(', ');}}}catch(e){console.error(e);}return s;};}
// contingents told to hold Qinghe strengthen its raid defence
{const old=frDef;frDef=function(id){const r=old.apply(this,arguments);try{const n=jaPowAt(id);if(n&&r&&typeof r.v==='number'){r.v+=n;r.men=(r.men||0)+n;}}catch(e){}return r;};}
// trade buys war
function jaHire(kind='spear'){const S=jaState();if(S.hired>=jaMercMax())return false;if((CAMP.res.silver||0)<JA.MERC.silver)return false;CAMP.res.silver-=JA.MERC.silver;S.hired++;
 const u=newUnit(kind,JA.MERC.men,{loc:{v:HOME}});u.merc=1;try{serviceCompany(u).name=Tz(`雇佣第${S.hired}营`,`Hired company ${S.hired}`);}catch(e){}cgLog('🪙',Tz(`以商路之利雇得一营${JA.MERC.men}人（银-${JA.MERC.silver}）`,`Trade silver hires a company of ${JA.MERC.men} (-${JA.MERC.silver} silver)`));saveGame();return u;}
function jaHorses(){const S=jaState(),max=Math.floor(jaTrade()/15);if(S.horses>=max||(CAMP.res.silver||0)<JA.HORSE.silver)return false;CAMP.res.silver-=JA.HORSE.silver;S.horses++;const st=CG.T[HOME].st;st.horse=(st.horse||0)+JA.HORSE.n;saveGame();return true;}
// ---- readiness panel
function jaTierText(t){return {commit:Tz('全力出兵','commits a contingent'),token:Tz('象征出兵','sends a token force'),watch:Tz('袖手旁观','stays out'),defect:Tz('将倒向金人','will defect to the Jin'),tributary:Tz('属村出兵','tributary levy')}[t]||t;}
function jaBtn(zh,en,fn,on=true){const b=btn(zh,en,on?fn:()=>{},on?'':'dis');if(!on)b.setAttribute('aria-disabled','true');return b;}
function jaPanel(){const r=jaSources(),d=document.createElement('div');d.className='wk ja-panel';d.id='jaPanel';const total=Math.round(r.own+r.merc+r.friendly),pct=r.need?Math.min(100,Math.round(total/r.need*100)):100,ownPct=r.need?Math.min(100,Math.round(r.own/r.need*100)):100;
 const row=(ic,name,val,note,col)=>`<div class="ja-row"><span class="ja-ic" style="${col?`background:${col}`:''}">${ic}</span><b>${name}</b><span class="ja-v">${val}</span><small>${note||''}</small></div>`;
 let h=`<h3>⚔ ${Tz('抗金战备','Jin war readiness')}</h3><p class="tip">${Tz('胜负取决于汴京城下的兵力。清河自己的军队是根本；外交与商贸做到极致，盟友与属村才会出兵相助——但他们只追随强者，援兵不会多于清河自己的兵力。','The war is decided by the strength at Kaifeng. Qinghe’s own army is the backbone. Excellent diplomacy and trade bring allies and tributaries into the fight, but they follow strength: their help never exceeds Qinghe’s own army.')}</p>`;
 h+=`<div class="ja-gauge" data-ja-pct="${pct}"><div style="width:${pct}%"></div><span style="left:${ownPct}%"></span></div><div class="ja-sum">${Tz('预计金军','Expected Jin host')} <b>${r.jin.toLocaleString()}</b> · ${Tz('城下所需兵力','strength needed at Kaifeng')} <b>${r.need.toLocaleString()}</b> · ${Tz('可战之兵','available')} <b>${total.toLocaleString()}</b> (${pct}%)</div><p class="tip">${Tz('金军数为沿途损耗后的估计。兵力须在1127年前抵达汴京才算数。','The Jin figure allows for losses on the march. Strength only counts once it stands at Kaifeng before 1127.')}</p>`;
 h+=row('军',Tz('清河军队','Qinghe army'),r.own.toLocaleString(),Tz(`其中在汴京 ${r.ownKaifeng}`,`${r.ownKaifeng} already at Kaifeng`));
 if(r.merc)h+=row('🪙',Tz('雇佣兵（商贸）','Mercenaries (trade)'),r.merc.toLocaleString(),Tz('计入清河军队，需开赴汴京','count with your army; march them to Kaifeng'));
 for(const p of r.blocs){const F=SF_DEF[p.k],v=r.live?(r.live[p.k]||0):(p.eff||0);h+=row(JA.CH[p.k],Tz(F.zh,F.en),p.tier==='defect'?`−${p.men}`:v?`+${v}`:'—',`${jaTierText(p.tier)} · ${Tz('声望','standing')} ${p.s}${p.tier==='watch'?' · '+Tz(`需${JA.CORDIAL}`,`needs ${JA.CORDIAL}`):p.tier==='token'?' · '+Tz(`${JA.COMMIT}全力`,`${JA.COMMIT} to commit`):''}`,F.col);}
 for(const p of r.trib){const v=r.live?(r.live['trib:'+p.id]||0):(p.eff||0);h+=row('贡',tName(p.id),v?`+${v}`:'—',jaTierText('tributary'),JA.TRIB_COL);}
 if(!r.trib.length)h+=row('贡',Tz('属村','Tributaries'),'—',Tz('尚无属村：壮大清河以感召邻近宋村','none yet: grow Qinghe to draw neighbouring Song towns'),JA.TRIB_COL);
 h+=`<p class="tip">${Tz('统率系数','Leadership')} ${Math.round(r.lead*100)}% (${Tz(`清河军队达${JA.LEAD}时援兵全额`,`full help once Qinghe’s army reaches ${JA.LEAD}`)}) · ${Tz('援兵上限','help capped at')} ${r.cap.toLocaleString()} · ${Tz('商路深度','trade depth')} ${r.trade}</p>`;
 if(r.defect.length)h+=`<p class="ja-warn">☠ ${Tz('交恶的集团会在金军到来时倒戈，增加金军兵力。','Estranged blocs defect when the Jin arrive and swell the Jin host.')}</p>`;
 d.innerHTML=h;const act=document.createElement('div');act.className='ja-act';const S=jaState(),mm=jaMercMax();
 act.appendChild(jaBtn(`雇佣一营（银${JA.MERC.silver}）· ${S.hired}/${mm}`,`Hire a company (${JA.MERC.silver} silver) · ${S.hired}/${mm}`,()=>{if(jaHire())jaRefresh();},S.hired<mm&&(CAMP.res.silver||0)>=JA.MERC.silver));act.lastChild.id='jaHire';
 act.appendChild(jaBtn(`购马${JA.HORSE.n}匹（银${JA.HORSE.silver}）`,`Buy ${JA.HORSE.n} horses (${JA.HORSE.silver} silver)`,()=>{if(jaHorses())jaRefresh();},(CAMP.res.silver||0)>=JA.HORSE.silver&&S.horses<Math.floor(jaTrade()/15)));
 if(S.mob){act.appendChild(jaBtn(S.dest==='home'?'援军改赴汴京':'援军回守清河',S.dest==='home'?'Send allies to Kaifeng':'Allies hold Qinghe',()=>{jaRedirect(S.dest==='home'?'kaifeng':'home');jaRefresh();}));}
 d.appendChild(act);return d;}
function jaRefresh(){const m=document.getElementById('jaModal');if(m){m.querySelector('#jaPanel')?.replaceWith(jaPanel());}const p=document.getElementById('cMissions');if(p&&p.querySelector('#jaPanel'))p.querySelector('#jaPanel').replaceWith(jaPanel());try{campUI();}catch(e){}}
function jaOpen(){document.getElementById('jaModal')?.remove();const m=document.createElement('div');m.id='jaModal';m.className='panel modal ja-modal';m.appendChild(jaPanel());m.appendChild(btn('关闭','Close',()=>m.remove()));(typeof campEl==='function'&&campEl()||document.body).appendChild(m);return m;}
{const old=jinPanel;jinPanel=function(){const d=old.apply(this,arguments);try{d.insertBefore(jaPanel(),d.children[2]||null);}catch(e){console.error(e);}return d;};}
{const old=missionsUI;missionsUI=function(){const r=old.apply(this,arguments);try{const d=document.getElementById('cMissions');if(d&&!d.querySelector('#jaPanel'))d.insertBefore(jaPanel(),d.children[1]||null);}catch(e){console.error(e);}return r;};}
// a readiness chip on the campaign map
function jaChip(){if(MODE!=='camp'||!CG)return;let c=document.getElementById('jaChip');if(!c){c=document.createElement('div');c.id='jaChip';c.className='ja-chip';c.setAttribute('role','button');c.tabIndex=0;c.addEventListener('click',jaOpen);(typeof campEl==='function'&&campEl()||document.body).appendChild(c);}
 const r=jaSources(),total=Math.round(r.own+r.merc+r.friendly),pct=r.need?Math.min(100,Math.round(total/r.need*100)):100,yrs=Math.max(0,Math.ceil((1127*12-jaAbs())/12));c.innerHTML=`⚔ ${Tz('抗金战备','Jin readiness')} <b>${pct}%</b>`;c.title=Tz(`距靖康约${yrs}年`,`About ${yrs} year(s) to the Jingkang crisis`);c.style.display='';}
{const old=campUI;campUI=function(){const r=old.apply(this,arguments);try{jaChip();}catch(e){console.error(e);}return r;};}
{const old=showCVil;showCVil=function(){document.getElementById('jaChip')?.style.setProperty('display','none');return old.apply(this,arguments);};}
// map: contingents march in their own colours (live layer, no cache repaint)
function jaDraw(g){const S=CG?.ja;if(!S?.mob)return;const sc=iconScale();for(const c of S.c){if(c.state==='withdrawn'||c.state==='routed'||c.men<=0)continue;const n=Math.max(1,c.path.length-1),k=Math.max(0,c.step-JA.SPEED)+clamp((c.anim||0)/3,0,1)*Math.min(JA.SPEED,c.step),p=c.state==='garrison'?{...tPos(c.at),f:0}:pathAt(c.path,Math.min(1,k/n)),q=c2s(p.x,p.y);if(q.x<-100||q.y<-100||q.x>VW+100||q.y>VH+100)continue;
 g.save();const ox=14*sc;for(let i=0;i<3;i++)sprUnit(c.k==='yao'&&i===0?'song_cav':'song_spear',q.x+ox+(i%2)*11*sc,q.y+6*sc+Math.floor(i/2)*10*sc,8*sc,p.f||0,Math.floor(CTIME*8+i)%4);banner(g,q.x+ox-8*sc,q.y+6*sc,c.col,c.ch,sc*.9,false);shipPill(g,Tz(c.name[0],c.name[1])+' '+c.men,q.x+ox,q.y-34*sc,Math.max(10,10*sc),'#fff3d6');g.restore();}}
{const old=drawRaids;drawRaids=function(g){old(g);try{jaDraw(g);}catch(e){}};}
{const old=campFrame;campFrame=function(dt){if(CG?.ja?.mob)for(const c of CG.ja.c)c.anim=Math.min(10,(c.anim||0)+dt);return old(dt);};}
window.__ja={JA,state:jaState,sources:jaSources,standing:jaStanding,mobilise:jaMobilise,march:jaMarch,powAt:jaPowAt,hire:jaHire,horses:jaHorses,redirect:jaRedirect,open:jaOpen,panel:jaPanel,trade:jaTrade,path:jaPath};
