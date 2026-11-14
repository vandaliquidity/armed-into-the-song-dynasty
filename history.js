'use strict';

function historyStartYear(){return CG?.startYear||CL.ad0;}
function jingkangTurn(){return (1127-historyStartYear())*4+1;}
function jingkangMonth(){return (jingkangTurn()-1)*3+1;}
{const old=newCampaign;newCampaign=function(){const c=old();c.startYear=1120;c.roster.xbow=5;c.bld.workshop=1;return c;};}
// The initial title-screen campaign was constructed before extension scripts load.
if(!CAMP.cg&&!CAMP.done.length&&CAMP.next===0){CAMP.startYear=1120;CAMP.roster.xbow=Math.max(5,CAMP.roster.xbow||0);CAMP.bld.workshop=Math.max(1,CAMP.bld.workshop||0);}
{const old=newCG;newCG=function(){const c=old();c.startYear=CAMP.startYear||CL.ad0;return c;};}
{const old=campStart;campStart=function(){old();if(CG.startYear===1120&&!CG.crossbowFoundation){
  const s=CG.T[HOME];s.eq.xbow=(s.eq.xbow||0)+1000;s.eq.armL=(s.eq.armL||0)+1000;s.bld.bowyer=Math.max(2,s.bld.bowyer||0);s.bld.yard=Math.max(1,s.bld.yard||0);CG.crossbowFoundation=1;
  cgLog('🎯',Tz('开局军备：增发神臂弓1000、皮甲1000，并开放二级弓弩坊。','Starting arsenal: 1,000 extra crossbows and 1,000 leather armour; a level-two bowyer is available.'));syncRes();saveGame();
}};}
{const old=SETUP.ch1;SETUP.ch1=function(){CAMP.roster.xbow=Math.max(5,CAMP.roster.xbow||0);old();B.N=10;B.initOrders.xbow={type:'hold',x:B.key.x,y:B.key.y+100,f:-Math.PI/2};};}
{const old=rosterToUnits;rosterToUnits=function(ro,a){old(ro,a);const n=(ro.xbow||0)*10;if(n>0&&n<30){const u=newUnit('xbow',n,{loc:{a:a.id},home:HOME,exp:2});a.units.push(u.id);}};}
{const old=beginBattle;beginBattle=function(i,o){const r=old(i,o);if(i===0&&B){B.form.xbow=true;B.N=10;}return r;};}
{const old=showBrief;showBrief=function(i){old(i);if(i===0)$('scrBrief')?.firstElementChild?.insertAdjacentHTML('beforeend',`<div class="panel">🎯 ${Tz('清河弩兵支援：50名弩手（5个战斗棋子），已在粮仓后方列阵。幸存者随你进入战役。','Qinghe support: 50 crossbowmen (5 battle figures), deployed behind the granary. Survivors carry into the campaign.')}</div>`);};}
LORE.title.tag={zh:'宣和二年 · 秦凤路 · 公元1120年',en:'Xuanhe 2 · Qinfeng Circuit · AD 1120'};
LORE.chapters[0].sub={zh:'宣和二年。五人落在秦州陇山，山下清河村正遭西夏兵劫掠。距离靖康危机尚有七年。',en:'Xuanhe 2 (1120). Five travellers arrive in the Long Mountains of Qinzhou. Xia raiders threaten Qinghe below; the Jingkang crisis is seven years away.'};
LORE.chapters[0].intro=LORE.chapters[0].intro.map(line=>line[0]==='lead'?['lead','现在是宣和二年。先守住村子，再用这七年为大宋准备。弩手护粮仓，队员随我！','Xuanhe year two. Hold the village, then use these seven years to prepare the Song. Crossbowmen, cover the granary; squad, with me!']:line);
CHAPTERS[0].sub=LORE.chapters[0].sub;CHAPTERS[0].intro=LORE.chapters[0].intro;
campaignDate=function(turn,month=1,short=false){const year=historyStartYear()+Math.floor((turn-1)/4),m=seasonOf(turn)*3+month;return Tz(`${year}年${m}月`,`${short?MONTH_EN[m-1].slice(0,3):MONTH_EN[m-1]} ${year}`);};
zhYear=function(turn){const year=historyStartYear()+Math.floor((turn-1)/4),month=seasonOf(turn)*3+(CG&&CG.turn===turn?monthOfSeason():1);if(year<1126)return '宣和'+cnNum(year-1118)+'年';if(CG?.fallK==='averted'||year<1127||(year===1127&&month<5))return '靖康'+(year===1126?'元':cnNum(year-1125))+'年';return '建炎'+(year===1127?'元':cnNum(year-1126))+'年';};
{const old=evRoll;evRoll=function(rep){const list=LORE.arc.list,offset=(CL.ad0-historyStartYear())*4;LORE.arc.list=list.map(a=>({...a,turn:a.turn+offset}));try{return old(rep);}finally{LORE.arc.list=list;}};}

function historyAid(){return CG.jingkang||(CG.jingkang={troops:0,crossbows:0,grain:0,materialBonus:false});}
function historyReadiness(){return Math.round((CG.ready||0)+(CG.fav?.lv||0)*5+Math.min(20,(CG.stats.sentN||0)*3));}
function historyPrepared(){const a=historyAid();return historyReadiness()>=70&&a.troops>=500&&a.crossbows>=300&&a.grain>=1000;}
SHIPK.relief={zh:'勤王援京',en:'Capital relief',c:'#e7c979',ic:'🏯'};
function historyDispatch(from,uid=null){
  if(MODE!=='camp'||CG.phase!==0||CG.over||CG.pend||CG.fallK||CG.jin?.outcome||campaignMonth()>=jingkangMonth()||!owned(from)||!careFriendly('kaifeng'))return false;
  const path=supplyPath(from,'kaifeng');if(!path)return false;const u=uid?CG.U[uid]:null;
  if(uid&&(!u||unitSite(u)!==from||u.men<50||u.wnd||carePending(uid)>0))return false;
  const cost=u?{grain:200,silver:50}:{grain:1000,silver:200,xbow:300,armL:300};if(!canPayAt(from,cost))return false;
  const goods=u?{grain:200,...refitKit(u.type,u.arm,u.men)}:{grain:1000,xbow:300,armL:300},eta=Math.max(1,path.length-1);
  const ship=shipNew('relief',from,'kaifeng',goods,{path,eta,left:eta,reliefUnit:u?JSON.parse(JSON.stringify(u)):null});if(!ship)return false;
  payAt(from,cost);if(u){for(const army of CG.armies)army.units=army.units.filter(id=>id!==u.id);delete CG.U[u.id];}
  cgLog('🏯',Tz(`${CT[from].zh}派出勤王援京队，路程${eta}个月。`,`${CT[from].en} dispatched capital relief: ${eta} months on the road.`));saveGame();campUI();missionsUI();return true;
}
// Block unsafe relief routes without changing ordinary trade/raid convoy rules.
{const old=shipTurn;shipTurn=function(lines){for(const s of shipsOn())if(s.kind==='relief')s.reliefBlocked=false;const blocked=shipsOn().filter(s=>s.kind==='relief'&&!s.state&&(!careFriendly(s.to)||s.path.slice(Math.max(0,s.eta-s.left)).some(id=>!careFriendly(id))));CG.ship=shipsOn().filter(s=>!blocked.includes(s));for(const s of blocked)s.reliefBlocked=true;old(lines);CG.ship.push(...blocked);};}
{const old=shipDeliver;shipDeliver=function(s,lines){
  if(s.kind==='relief'&&s.reliefCredited)return;
  const relief=s.kind==='relief'&&!s.reliefCredited&&!s.state,unit=s.reliefUnit,r=old(s,lines);if(!relief)return r;
  const aid=historyAid();aid.troops+=unit?.men||0;aid.crossbows+=s.goods.xbow||0;aid.grain+=s.goods.grain||0;s.reliefCredited=1;
  if(unit){CG.ready=(CG.ready||0)+Math.max(1,Math.round(unit.men/20));if(owned('kaifeng'))CG.U[unit.id]={...unit,loc:{v:'kaifeng'}};else{const city=CG.T.kaifeng;city.songGarrison=city.songGarrison||{men:0,type:'spear'};city.songGarrison.men+=unit.men;}}
  if(!aid.materialBonus&&aid.crossbows>=300&&aid.grain>=1000){aid.materialBonus=true;CG.ready=(CG.ready||0)+10;}
  saveGame();return r;
};}
{const old=evApply;evApply=function(fx,id,report){
  const before=fx.loseDu&&fx.ready>0?Object.values(CG.U).map(u=>({unit:JSON.parse(JSON.stringify(u)),from:unitSite(u)||HOME})):[];
  const r=old(fx,id,report),sent=before.filter(x=>!CG.U[x.unit.id]);
  sent.forEach(({unit,from},i)=>{const path=supplyPath(from,'kaifeng')||shipPath(from,'kaifeng'),grain=i===0?Math.max(0,-(fx.grain||0)):0;shipNew('relief',from,'kaifeng',{...refitKit(unit.type,unit.arm,unit.men),...(grain?{grain}: {})},{path,eta:Math.max(1,path.length-1),left:Math.max(1,path.length-1),reliefUnit:unit});});
  return r;
};}
{const old=evDef;evDef=function(e){if(!e.fall)return old(e);const normal=old(e);if(!historyPrepared())return normal;
  return{zh:'汴京守住了 · 靖康之变被阻止',en:'Kaifeng holds · Jingkang averted',d:{zh:'按期抵达的勤王兵、神臂弓与军粮支撑了城防，你的提前备战说服朝廷坚守。金军第二次围城未能得手，二帝没有被掳。这是你改变历史的架空分支；史实中的汴京于1127年陷落。',en:'Your timely reinforcements, crossbows and provisions sustain the defences, while preparations persuade the court to hold. The second siege is repelled and the emperors avoid capture. This is the alternate-history branch earned by your intervention; historically, Kaifeng fell in 1127.'},k:'averted',o:[{zh:'保全社稷，继续经营（恩眷+40）',en:'The Song endures; continue the campaign (+40 favour)',fx:{fav:40,court:15}}]};
};}
LORE.arc.clockD={zh:'史事仍按1122—1127年的时间推进。若1127年初前送达500援兵、300神臂弓、1000粮，且备战达70，可阻止靖康之变。',en:'Historical milestones retain their 1122–1127 dates. Before early 1127, deliver 500 troops, 300 crossbows and 1,000 grain, and reach 70 readiness to avert Jingkang.'};
LORE.arc.fall.good={zh:'援助尚不足以打破围城，汴京陷落，二帝被掳。但已抵京的勤王兵帮助百姓撤离，清河为南方朝廷保留了力量。',en:'Relief was insufficient to break the siege. Kaifeng falls and the emperors are captured, but your dispatched forces help civilians escape and preserve strength for the southern court.'};
function historyPanel(){
  const d=document.createElement('div');d.className='wk';d.id='cHistory';const aid=historyAid(),left=Math.max(0,jingkangMonth()-campaignMonth());
  d.innerHTML=`<h2>${Tz('沿史而行 · 备战靖康','Along the historical timeline · prepare for Jingkang')}</h2><p>${Tz(`1127年初危机前尚有${left}个月。新战役从1120年开始；既有战役保持原日期。`,`Time before the early-1127 crisis: ${left} months. New campaigns begin in 1120; existing campaigns keep their dates.`)}</p><div>${Tz('已送抵汴京','Delivered to Kaifeng')}: ${aid.troops}/500 ${Tz('援兵','troops')} · ${aid.crossbows}/300 ${Tz('神臂弓','crossbows')} · ${aid.grain}/1000 ${Tz('粮','grain')} · ${Tz('备战','Readiness')} ${historyReadiness()}/70</div><p class="tip">${Tz('须在危机前实际送达，不能只存放在清河。途中可能受袭或断路；派驻军护送。历史事件的备战选项也计入准备。','Aid must arrive before the crisis, not remain in Qinghe. Convoys may be raided or blocked; assign escorts. Readiness choices in historical events also contribute.')}</p>`;
  if(CG.fallK||CG.jin?.outcome){d.insertAdjacentHTML('beforeend',`<b>${CG.fallK==='averted'||CG.jin?.outcome==='averted'?Tz('汴京守住了，历史已改写。','Kaifeng held; your intervention changed history.'):Tz('靖康危机已结算，仍可继续经营。','The Jingkang crisis has resolved; the campaign continues.')}</b>`);return d;}
  for(const from of Object.keys(CG.T).filter(owned)){const route=supplyPath(from,'kaifeng');if(!route)continue;const row=document.createElement('div');row.className='wk';row.innerHTML=`<b>${tName(from)}</b> → ${tName('kaifeng')} · ${route.length-1} ${Tz('个月','months')}`;
    const pack=btn('送援京军备：1000粮、300弩、300皮甲、200银','Send relief: 1000 grain, 300 crossbows, 300 armour, 200 silver',()=>historyDispatch(from));if(CG.phase!==0||!canPayAt(from,{grain:1000,xbow:300,armL:300,silver:200})){pack.classList.add('dis');pack.style.pointerEvents='none';}row.appendChild(pack);
    const candidates=Object.values(CG.U).filter(u=>unitSite(u)===from&&u.men>=50&&!u.wnd&&!carePending(u.id));
    for(const u of candidates){const b=btn(`派${u.men}名${UT[u.type].zh}勤王（200粮、50银）`,`Send ${u.men} ${UT[u.type].en} (200 grain, 50 silver)`,()=>historyDispatch(from,u.id));if(CG.phase!==0||!canPayAt(from,{grain:200,silver:50})){b.classList.add('dis');b.style.pointerEvents='none';}row.appendChild(b);}
    d.appendChild(row);
  }
  for(const s of shipsOn().filter(s=>s.kind==='relief'&&!s.state))d.insertAdjacentHTML('beforeend',`<p>🏯 ${tName(s.from)} → ${tName(s.to)} · ${s.reliefBlocked?Tz('道路受阻','Road blocked'):s.left+' '+Tz('个月','months')} · ${spoilsText(s.goods)}</p>`);
  return d;
}
{const old=missionsUI;missionsUI=function(message){old(message);const d=$('cMissions');if(d)d.insertBefore(historyPanel(),d.lastElementChild);};}
{const old=campUI;campUI=function(){old();if(MODE!=='camp'||!CG)return;$('cClock')?.remove();const strip=campEl().querySelector('.chapter-strip');if(strip){const left=Math.max(0,jingkangMonth()-campaignMonth());strip.innerHTML=`<b>${CG.fallK==='averted'?Tz('北宋延续 · 历史改写','The Northern Song endures'):CG.fallK?Tz('靖康之后','After Jingkang'):Tz('沿史备战','Prepare along the historical timeline')}</b><span>${CG.fallK?'':Tz(`距1127年危机 ${left}个月 · `,`${left} months to the 1127 crisis · `)}${Tz('备战','Readiness')} ${historyReadiness()}/70</span>`;}};}

function conquestMilitia(id){
  if(!CG||id===HOME||!owned(id)||(CG.conquestMilitia||{})[id])return false;
  (CG.conquestMilitia||(CG.conquestMilitia={}))[id]=1;for(let i=0;i<2;i++)newUnit('mil',100,{loc:{v:id},home:id});
  cgLog('⚑',Tz(`${CT[id].zh}乡兵200人就地留守，不耗丁口、军备或银。`,`${CT[id].en}: 200 free militia remain as the local garrison.`));return true;
}
{const old=claimTerr;claimTerr=function(id,quiet){const was=owned(id),r=old(id,quiet);if(!was&&owned(id)&&conquestMilitia(id)){campRefresh();saveGame();}return r;};}
{const old=garrCap;garrCap=function(id){return old(id)+(CG?.conquestMilitia?.[id]?2:0);};}
{const old=campLoad;campLoad=function(){old();if(CG&&!CG.conquestMilitiaMigrated){for(const id of Object.keys(CG.T).filter(owned))conquestMilitia(id);CG.conquestMilitiaMigrated=1;}};}
