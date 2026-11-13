'use strict';

// CG.turn remains the saved seasonal clock. Three monthly order rounds share
// one seasonal economy tick, preserving old dates, dues and event schedules.
function campaignMonth(){return (CG.turn-1)*3+(CG.month||1);}
function monthOfSeason(){return clamp(CG?.month||1,1,3);}
const MONTH_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
function campaignDate(turn,month=1,short=false){
  const year=CL.ad0+Math.floor((turn-1)/4),m=seasonOf(turn)*3+month;
  return Tz(`${year}年${m}月`,`${short?MONTH_EN[m-1].slice(0,3):MONTH_EN[m-1]} ${year}`);
}
dateTxt=function(turn,short){return campaignDate(turn,CG&&turn===CG.turn?monthOfSeason():1,short);};
{const old=cgLog;cgLog=function(ic,s){old(ic,s);if(CG.log[0])CG.log[0].month=monthOfSeason();};}

{const seasonalEnd=endTurn;endTurn=function(){
  if(!CG||CG.pend||CG.queue.length)return null;
  const month=monthOfSeason();
  if(month===3) {
    const report=seasonalEnd();CG.month=1;CG.lastMonthSettled=true;
    saveGame();return report;
  }
  const lines=[];
  // Movement and arrivals progress monthly; resources and upkeep settle once
  // at quarter end. The seasonal end hook handles the third monthly arrival tick.
  shipTurn(lines);for(const l of lines)cgLog(l[0],l[1]);
  for(const x of CG.xa)x.eta--;
  for(const s of shipsOn())s._a=0;
  CG.month=month+1;CG.phase=0;CG.queue=[];CG.lastMonthSettled=false;
  campRefresh();syncRes();saveGame();return null;
};}

// Victory becomes a milestone. Defeat still has its normal consequences.
{const old=endBox;endBox=function(){
  if(CG.won&&!CG.over) {
    if(CG.victoryContinued)return document.createDocumentFragment();
    const d=document.createElement('div');d.className='panel modal';d.id='cVictory';
    d.innerHTML=`<div class="campaign-eyebrow">${T('战役里程碑','Campaign milestone')}</div><h2>${T('边地大定','The frontier is secured')}</h2><p>${T('兴庆已归清河。你的基业仍可延续：继续经营、拓土、研究与统兵，战役没有回合上限。','Xingqing is yours. Continue governing, expanding, researching and commanding your armies. There is no turn limit.')}</p>`;
    d.appendChild(btn('继续战役','Continue campaign',()=>{CG.victoryContinued=1;saveGame();campUI();}));
    d.appendChild(btn('返回标题','Return to title',()=>{campEl().style.display='none';showTitle();}));return d;
  }
  return old();
};}
LORE.arc.clockD={zh:'一回合为一个月，一季三个月。靖康之变是历史章节，之后仍可继续经营；战役没有回合上限。',en:'One turn is one month, with three months per season. Jingkang is a story chapter; your campaign continues afterward without a turn limit.'};
CL.tut[4]={zh:'每次结算推进一个月；每季第三个月收获、结算用度并推进营建、训练与研究。',en:'End month advances one month. The third month of each season settles income, upkeep, construction, training and research.'};
CL.tut[5]={zh:'每季会有季报。历史事件与统一边地都是里程碑，之后仍可继续经营。',en:'A report appears at each season end. Historical events and frontier victory are milestones; you can keep playing afterward.'};

const CAMPAIGN_ICONS={
  grain:'M3 15 9 9m0 0V2m0 7 5-5M9 7 5 3M9 12l6-5M9 12 4 8M9 17v-5',
  silver:'M3 6c0-4 12-4 12 0s-12 4-12 0Zm0 0v7c0 4 12 4 12 0V6M3 10c0 4 12 4 12 0',
  timber:'m3 6 4-4 8 8v5h-5L3 6Zm7 4 5 5M7 2l-4 4',
  ore:'m3 13 3-9 7-1 4 7-6 6-8-3Zm3-9 5 6 6 0M11 10v6',
  horse:'m4 15 1-7 4-5 2 2 3 1 1 4-4-1-1 6M4 15h7M9 3V1',
  armies:'m3 3 12 12M15 3 3 15M2 6l4-4M12 16l4-4M2 12l4 4M12 2l4 4',
  settlement:'M2 8 9 2l7 6M4 7v9h10V7M7 16v-5h4v5',
  trade:'M2 6h13l-3-3M16 12H3l3 3M15 6l-3 3M3 12l3-3',
  book:'M2 3c3-1 5 0 7 2 2-2 4-3 7-2v12c-3-1-5 0-7 2-2-2-4-3-7-2V3Zm7 2v12',
  officer:'M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 17v-3c0-4 12-4 12 0v3M6 12l3 4 3-4',
  compass:'M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1Zm3 5-2 4-4 2 2-4 4-2Z',
  save:'M3 2h10l3 3v11H2V2h1Zm2 0v5h7V2M5 16v-6h8v6',
  store:'M2 7 9 2l7 5v9H2V7Zm3 9V9h8v7M5 12h8',
  shield:'M9 2 16 5v5c0 3-4 6-7 7-3-1-7-4-7-7V5l7-3Zm0 3v9',
  flag:'M3 17V2m0 1c5-4 7 4 12 0v7c-5 4-7-4-12 0',
  settings:'M3 5h12M3 13h12M6 2v6m6 2v6'
};
function campaignIcon(k,cls=''){return `<svg class="${cls}" viewBox="0 0 18 18" aria-hidden="true"><path d="${CAMPAIGN_ICONS[k]||CAMPAIGN_ICONS.flag}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;}
function campaignResource(k,name,value,delta){return `<div class="resource-tile"><div class="label">${campaignIcon(k)}${name}</div><b>${Math.round(value).toLocaleString()}</b><span class="delta ${delta<0?'negative':''}">${delta==null?Tz('在役兵力','on duty'):(delta>=0?'+':'')+Math.round(delta)+' '+Tz('/季','/ season')}</span></div>`;}

function campaignHeader(top,next){
  const totals=realmTotals(),inc=income(),ownedN=Object.keys(CG.T).filter(owned).length;
  const brand=document.createElement('div');brand.className='campaign-brand';
  brand.innerHTML=`<div class="campaign-seal">宋</div><div><div class="campaign-eyebrow">${Tz('西陲经略','The western frontier')}</div><strong>${Tz('持械入宋','Armed into Song')}</strong><div class="campaign-eyebrow">${Tz('清河行营','Qinghe command')}</div></div>`;
  const middle=document.createElement('div');
  middle.innerHTML=`<div class="campaign-resources">${campaignResource('grain',Tz('粮食','Grain'),totals.raw.grain,inc.tot.grain)}${campaignResource('silver',Tz('库银','Treasury'),CAMP.res.silver,inc.tot.silver)}${campaignResource('timber',Tz('木料','Timber'),totals.raw.timber,inc.tot.timber)}${campaignResource('ore',Tz('铁矿','Ore'),totals.raw.ore,inc.tot.ore)}${campaignResource('horse',Tz('战马','Horses'),totals.raw.horse,inc.tot.horse)}${campaignResource('armies',Tz('兵力','Troops'),menOf(Object.values(CG.U)),null)}</div><div class="campaign-date"><strong>${dateTxt(CG.turn)} · ${Tz('第','Turn ')}${campaignMonth()}${Tz('回合','')}</strong><div>${[0,3].map((p,i)=>`<span class="ph ${CG.phase===p?'on':''}">${i+1}. ${Tz(...(p===0?['筹划','Planning']:['交战','Battles']))}</span>`).join('')}</div><span>${ownedN} ${Tz('领地','settlements')} · ${Tz('无回合上限','No turn limit')}</span></div>`;
  const action=document.createElement('div');action.className='campaign-action';
  const pending=CG.phase===3&&CG.queue.length;
  action.innerHTML=`<div class="turn-label">${pending?Tz('待处理战事','Battles awaiting orders'):CG.phase===0?Tz('军政筹划','Plan your next move'):Tz('军令已执行','Orders resolved')}</div>`;
  next.innerHTML=T(CG.phase===0?'执行军令 →':pending?'先处理战事':'结束本月 →',CG.phase===0?'Resolve orders →':pending?'Resolve battles first':'End month →');
  action.appendChild(next);
  const cadence=document.createElement('div');cadence.className='cadence';cadence.textContent=Tz(`一回合一月 · ${4-monthOfSeason()}个月后季结`,`1 turn = 1 month · settlement in ${4-monthOfSeason()} month${monthOfSeason()===3?'':'s'}`);action.appendChild(cadence);
  top.classList.add('campaign-top');top.replaceChildren(brand,middle,action);
}

function campaignNavigation(nav){
  const buttons=[...nav.querySelectorAll('.btn')];
  const groups=[[],[],[]];
  for(const b of buttons){
    const text=b.textContent;
    const name=b.id||(/Whole realm|全图/.test(text)?'whole':/Save|保存/.test(text)?'save':/Title|标题/.test(text)?'title':/Village|村寨/.test(text)?'village':/Officers|将佐/.test(text)?'officers':/Guide|教程/.test(text)?'guide':'other');
    const icons={cSetB:'settlement',cCPB:'trade',cTechB:'book',cGovB:'settlement',cOffB:'officer',cChainB:'timber',cRosterB:'armies',cTransitB:'store',village:'store',officers:'shield',whole:'compass',save:'save',guide:'book',title:'settings'};
    const body=b.innerHTML.replace(/[\p{Extended_Pictographic}\uFE0F]/gu,'').trim();
    b.innerHTML=campaignIcon(icons[name]||'flag','nav-icon')+'<span class="nav-label">'+body+'</span>';
    const group=['cSetB','cChainB','cRosterB','cTransitB','village'].includes(name)?0:['cCPB','cTechB','cGovB','cOffB','officers'].includes(name)?1:2;
    groups[group].push(b);
  }
  nav.replaceChildren();nav.classList.add('campaign-nav');
  groups.forEach((items,i)=>{const title=document.createElement('div');title.className='nav-heading';title.textContent=Tz(...[['领地经营','REALM'],['军议与朝政','COUNCIL'],['行营','CAMPAIGN']][i]);nav.appendChild(title);for(const b of items)nav.appendChild(b);});
}

function campaignMinimap(){
  const box=document.createElement('div');box.className='panel campaign-minimap';box.id='campaignMinimap';
  box.innerHTML=`<div class="campaign-section-title">${Tz('天下舆图','Realm overview')} <span style="font-size:9px;letter-spacing:0;color:#a8b6a1">${Tz('点击查看','click to explore')}</span></div><canvas width="536" height="256" aria-label="${Tz('点击地图移动视野','Click map to move the camera')}" tabindex="0"></canvas><div class="map-legend"><span><i style="background:#d4a94c"></i>${Tz('清河','Qinghe')}</span><span><i style="background:#b6533e"></i>${Tz('大宋','Song')}</span><span><i style="background:#394353"></i>${Tz('西夏','Xia')}</span><span><i style="background:#e6ddbc"></i>${Tz('村镇','Free')}</span></div>`;
  const canvas=box.querySelector('canvas'),g=canvas.getContext('2d');
  const base=mkCanvas(canvas.width,canvas.height),bg=base.getContext('2d'),sx=canvas.width/CMW,sy=canvas.height/CMH;
  bg.fillStyle='#bdb798';bg.fillRect(0,0,canvas.width,canvas.height);
  bg.lineWidth=1;bg.strokeStyle='#7f806a77';
  for(const [a,b] of CL.links){const p=tPos(a),q=tPos(b);bg.beginPath();bg.moveTo(p.x*sx,p.y*sy);bg.lineTo(q.x*sx,q.y*sy);bg.stroke();}
  for(const river of RIVERS){bg.strokeStyle='#6c8a86';bg.lineWidth=2;bg.beginPath();river.pts.forEach((p,i)=>{const q=cwp(...p);i?bg.lineTo(q.x*sx,q.y*sy):bg.moveTo(q.x*sx,q.y*sy);});bg.stroke();}
  for(const t of CL.terr){const s=CG.T[t.id],p=tPos(t.id);bg.fillStyle={qh:'#d9ab47',song:'#a44031',xia:'#354150',free:'#f5eccd'}[s.own];bg.beginPath();bg.arc(p.x*sx,p.y*sy,t.kind==='city'?3:2,0,TAU);bg.fill();}
  const draw=()=>{g.drawImage(base,0,0);g.strokeStyle='#fff4c9';g.lineWidth=2;g.strokeRect(CC.x*sx,CC.y*sy,VW/CC.z*sx,VH/CC.z*sy);};
  box._draw=draw;draw();
  canvas.onclick=e=>{const r=canvas.getBoundingClientRect();CC.tx=(e.clientX-r.left)/r.width*CMW-VW/2/CC.z;CC.ty=(e.clientY-r.top)/r.height*CMH-VH/2/CC.z;};
  canvas.onkeydown=e=>{const step=200/CC.z;if(e.key==='ArrowLeft')CC.tx=CC.x-step;else if(e.key==='ArrowRight')CC.tx=CC.x+step;else if(e.key==='ArrowUp'){CC.tx=CC.x;CC.ty=CC.y-step;}else if(e.key==='ArrowDown'){CC.tx=CC.x;CC.ty=CC.y+step;}else return;if(e.key==='ArrowLeft'||e.key==='ArrowRight')CC.ty=CC.y;e.preventDefault();};
  return box;
}

{const old=campUI;campUI=function(){
  old();if(MODE!=='camp')return;
  const ui=campEl();ui.dataset.view='camp';
  const next=$('cNext'),top=next?.closest('.panel'),nav=$('cSetB')?.parentNode;
  // Capture the inspector before rebuilding navigation and the HUD.
  const panels=[...ui.children].filter(el=>el.classList.contains('panel')&&!el.classList.contains('modal'));
  const inspector=panels.find(el=>el!==top&&el!==nav&&el.style.right&&el.style.top==='84px');
  if(inspector)inspector.classList.add('realm-inspector');
  const log=panels.find(el=>el.style.left==='56px'&&el.style.bottom==='10px');
  if(log){log.classList.add('campaign-log');log.innerHTML=`<div class="campaign-section-title">${Tz('行营军报','Dispatches')}<span style="font-size:9px;letter-spacing:0;color:#a4b198">${Tz('最新','latest')}</span></div>`+CG.log.slice(0,6).map(l=>`<div><span style="color:#8fa38c">${campaignDate(l.t,l.month||1,true)}</span> ${l.s}</div>`).join('');}
  if(top&&next)campaignHeader(top,next);if(nav)campaignNavigation(nav);
  const strip=document.createElement('div');strip.className='chapter-strip';
  strip.innerHTML=`<b>${CG.fallK?Tz('新朝 · 西陲自立','A new court · the frontier endures'):Tz('第一章 · 经营西陲','Chapter I · Build the frontier')}</b><span>${Tz('备战','Readiness')} ${Math.round(CG.ready||0)} · ${Tz('声望','Renown')} ${Math.round(CAMP.res.rep||0)} · ${Tz('人口','Population')} ${totalPop().toLocaleString()}</span>`;
  ui.appendChild(strip);ui.appendChild(campaignMinimap());
  const intel=$('cIntel');if(intel){intel.style.left='220px';intel.style.top='190px';intel.style.width='280px';}
};}
{const old=cvilUI;cvilUI=function(){old();campEl().dataset.view='cvil';};}
{const old=campFrame;campFrame=function(dt){const r=old(dt);if(MODE==='camp')$('campaignMinimap')?._draw?.();return r;};}

// Keep the test helper's single-turn simulation aligned with monthly planning.
cbotTurn=function(){
  if(!CG)return null;CG.tut=6;cbotPromote();
  if(CG.phase===0){cbotDevelop();cbotRecruit();cbotMarch();nextPhase();}
  let guard=0;while(CG.phase===3&&CG.queue.length&&guard++<20){const q=CG.queue[0];if(q.story){campAfterStoryAuto(q);continue;}autoResolve(q);}
  if(CG.phase===3)nextPhase();if(CG.report)CG.report.seen=1;
  if(MODE==='camp')campUI();return{turn:campaignMonth(),season:CG.turn,month:CG.month,own:Object.keys(CG.T).filter(owned)};
};
__sw.cturn=cbotTurn;

{const old=panel;panel=function(x,y,w,h,a=.9){
  if(MODE!=='battle')return old(x,y,w,h,a);
  ctx.save();const fill=ctx.createLinearGradient(x,y,x+w,y+h);fill.addColorStop(0,`rgba(30,46,37,${a})`);fill.addColorStop(1,`rgba(13,29,22,${a})`);
  ctx.fillStyle=fill;ctx.strokeStyle='rgba(191,177,123,.75)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x+.5,y+.5,w-1,h-1,5);ctx.fill();ctx.stroke();ctx.restore();
};}
{const old=btn;btn=function(zh,en,fn,cls=''){
  const b=old(zh,en,fn,cls);b.setAttribute('role','button');b.tabIndex=cls.includes('dis')?-1:0;
  b.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!b.classList.contains('dis')){e.preventDefault();e.stopPropagation();b.click();}};
  return b;
};}

// Pause tutorial popovers while the edict is being presented; they must not
// cover the acknowledgement or change focus in the middle of the ceremony.
{const old=coachTick;coachTick=function(){if(EDICT){coachHide();return;}return old();};}
{const old=showCamp;showCamp=function(){
  // Leaving the ceremony postpones it; only Acknowledge consumes the queue.
  if(EDICT){EDICT=null;const b=$('cEdictB');if(b)b.remove();}
  return old();
};}

function resourceSiteHelp(id,refresh){
  const sites=NODES.filter(n=>n.terr===id),box=document.createElement('div');box.className='wk';box.id='cResourceSites';
  box.innerHTML=`<b style="color:#e8ce98">${T('本村资源点','This settlement’s resource sites')}</b><p class="tip">${T('占领村寨 → 兴建哨堡 → 保持通往清河的补给线。每季第三个月结算时入本村仓廒，银矿收入进入公帑。','Own the settlement → build an outpost → keep a supply route to Qinghe. Output enters this settlement’s stores at the end of month 3 each season; silver goes to the realm treasury.')}</p>`;
  for(const n of sites){
    const row=document.createElement('div');row.className='wk';
    const yieldText=Object.entries(NODEK[n.k].y).map(([k,v])=>`+${v} ${Tz(...(RAWN[k]||['银','silver']))}`).join(' · ');
    const state=!owned(id)?T('须先取得所属村寨','Acquire this settlement first'):!CG.out[n.id]?T('未开发','Not developed'):nodeOk(n)?T('开采中 · 每季入库','Working · delivered each season'):T('断供 · 暂停产出','Cut off · production paused');
    row.innerHTML=`<div><b>${T(n.zh,n.en)}</b></div><div class="tip">${yieldText} ${Tz('/季','/ season')} · ${state}</div>`;
    if(owned(id)&&!CG.out[n.id]){
      const ready=CG.phase===0&&canPayAt(id,OUTPOST_COST);
      const develop=sbtn('开发：银40 · 木60','Develop: 40 silver · 60 timber',()=>{if(buildOutpost(n.id))refresh();},ready);develop.dataset.out=n.id;row.appendChild(develop);
      if(!ready)row.insertAdjacentHTML('beforeend',`<div class="tip">${CG.phase!==0?T('在筹划阶段开发','Develop during Planning'):T('需银40及补给网内木料60','Requires 40 silver and 60 timber in the supply network')}</div>`);
    }
    box.appendChild(row);
  }
  if(!sites.length)box.insertAdjacentHTML('beforeend',`<div class="tip">${T('本村无地图资源点；可营建田庄、伐木场等生产建筑。','No map resource sites here. Build farms, lumber camps and other production works instead.')}</div>`);
  box.insertAdjacentHTML('beforeend',`<p class="tip">${T('工坊会在收成后使用木、铁、皮等材料制造装备；库存净增量可能低于资源点产量，可在产业链查看。','Workshops use timber, ore and hides after the harvest to make equipment. Your net stock increase may be lower than the site yield; check Production for usage.')}</p>`);
  return box;
}
{const old=settleUI;settleUI=function(id,tab){
  old(id,tab);if(SET_TAB!=='over')return;
  const body=$('cSet')?.children[2];if(body)body.prepend(resourceSiteHelp(id,()=>{campUI();settleUI(id,'over');}));
};}
{const old=nodePanel;nodePanel=function(nid){
  const p=old(nid),n=NODES.find(n=>n.id===nid);if(!n)return p;
  const treasury=!!NODEK[n.k].y.silver;
  const help=document.createElement('p');help.className='tip';help.textContent=Tz(
    `产出存入${treasury?'公帑':CT[n.terr].zh}；每季结算一次（三个月），并非点击后立即获得。`,
    `Output enters ${treasury?'the realm treasury':CT[n.terr].en+' stores'} once per season (every three months), not immediately on clicking the site.`);
  p.appendChild(help);return p;
};}
