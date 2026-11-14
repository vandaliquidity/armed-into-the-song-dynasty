'use strict';

// A save-backed expedition. Geography is schematic; Lu Wan is a fictional character.
const JOURNEY_ROUTES={
  road:{name:['驿道','Post road'],desc:['付驿站护路费，步卒居多，车路平缓。','Pay for road protection. Mostly foot soldiers; a broad, steady road.'],cost:{silver:60},width:72,height:46,speed:38,enemy:18},
  gorge:{name:['山峡小径','Gorge track'],desc:['不付路费；山口狭窄，伏弩较多，车辆较慢。','No toll. Narrow approaches, more hidden archers, slower wagons.'],cost:{},width:64,height:44,speed:29,enemy:28},
  pasture:{name:['牧场绕道','Pasture detour'],desc:['多带40粮喂养牲口；道路开阔，但骑兵会从侧翼袭来。','Take 40 extra grain for the animals. Open ground, with cavalry attacking the flanks.'],cost:{grain:40},width:70,height:54,speed:35,enemy:22}
};
LORE.off.list.push({id:'luwan',zh:'陆婉',en:'Lu Wan',k:'song',tr:['merchant','admin'],c:0,req:{fav:0},
  sk:{zh:'商路管事：善营建、调配与买卖；可任命为知寨。',en:'Caravan factor: favours markets, stores and administration as a governor.'},
  bio:{zh:'秦州商队的年轻管事。本作虚构人物；她的算盘与对乡人的承诺同样认真。',en:'A young Qinzhou caravan factor. A fictional character who takes her accounts and promises to villagers equally seriously.'}});
{const old=offReq;offReq=function(o){if(o.id==='luwan'&&!CG?.off?.luwan?.hired)return Tz('完成秦州之旅并赢得信任','Earn her trust on the Qinzhou Journey');return old(o);};}

function journeyState(){return CG.journey||(CG.journey={v:1,stage:'prepare',trust:0,journal:[],legacy:CAMP.done.includes(1)});}
function journeyLeader(){return CG.armies.find(a=>a.cmd==='lead');}
function journeyCanPay(cost){return Object.entries(cost).every(([k,n])=>(k==='silver'?CAMP.res.silver:CG.T[HOME].st[k]||0)>=n);}
function journeyPay(cost){if(!journeyCanPay(cost))return false;for(const [k,n] of Object.entries(cost)){if(k==='silver')CAMP.res.silver-=n;else CG.T[HOME].st[k]-=n;}return true;}
function journeyCost(cost){return Object.entries(cost).map(([k,n])=>n+' '+Tz(...({grain:['粮','grain'],timber:['木','timber'],silver:['银','silver']}[k]))).join(' · ')||Tz('无额外费用','No extra cost');}
function journeyNote(zh,en){journeyState().journal.push({zh,en});}
function journeyCommit(){syncRes();campRefresh();saveGame();campUI();journeyUI();}
function journeyChoice(key){
  if(!CG||MODE!=='camp'||CG.over||CG.pend)return false;
  const j=journeyState(),s=CG.T[HOME];if(!owned(HOME))return false;
  if(j.stage==='prepare'){
    const a=journeyLeader();if(CG.phase!==0||!a||a.loc!==HOME||!a.mem.length||!armyUnits(a).some(u=>u.men>0))return false;
    if(!['community','convoy'].includes(key))return false;
    const cost=key==='community'?{grain:80,timber:40,silver:30}:{grain:40,timber:20,silver:60};
    if(!journeyPay(cost))return false;j.prep=key;j.army=a.id;j.stage='route';j.started=campaignMonth();j.before={pop:s.pop,prosp:s.prosp,market:s.bld.market||0};
    if(key==='community'){s.pop+=60;s.prosp=Math.min(100,s.prosp+8);j.trust++;journeyNote('出发前先修民居、开粥棚。清河多了60人，繁荣+8。','Repaired homes and opened a grain kitchen before departure: Qinghe +60 residents, +8 prosperity.');}
    else journeyNote('木匠加固车轴，车队耐久提高。乡人仍在等待修屋。','The carpenter reinforced the axles: stronger wagons. Families still await repairs.');
  }else if(j.stage==='route'){
    if(!JOURNEY_ROUTES[key]||!journeyPay(JOURNEY_ROUTES[key].cost))return false;j.route=key;j.stage='decision';
    journeyNote('已选择'+JOURNEY_ROUTES[key].name[0]+'。','Chose the '+JOURNEY_ROUTES[key].name[1].toLowerCase()+'.');
  }else if(j.stage==='decision'){
    if(!['rescue','cargo'].includes(key))return false;j.priority=key;j.stage='ambush';
    journeyNote(key==='rescue'?'苏：先救村人；车队在村口等待。':'程：车队继续走，清河不能再缺粮。',key==='rescue'?'Su: “We rescue the villagers first. The wagons can wait.”':'Cheng: “Keep the convoy moving. Qinghe needs those stores.”');
  }else if(j.stage==='market'){
    if(!['fair','hard'].includes(key))return false;j.deal=key;
    const cargo=j.result.carts;
    // Cargo is a one-off expedition reward, not a repeatable trade exploit.
    const silver=cargo*(key==='fair'?65:105),horse=cargo*(key==='fair'?8:4);
    CAMP.res.silver+=silver;s.st.horse=(s.st.horse||0)+horse;
    if(key==='fair')j.trust++;
    journeyNote(key==='fair'?`按公价换马：得${silver}银、${horse}匹马。陆婉信任+1。`:`趁缺货抬价：得${silver}银、${horse}匹马。陆婉记下了这笔账。`,key==='fair'?`Honest weights: ${silver} silver, ${horse} horses. Lu Wan's trust +1.`:`Scarcity prices: ${silver} silver, ${horse} horses. Lu Wan remembers the terms.`);
    j.stage='homeward';
  }else if(j.stage==='homeward'){
    if(!['market','hospital'].includes(key))return false;j.invest=key;j.stage='complete';
    const b=key==='market'?'market':'hosp';s.bld[b]=Math.min(DEV[b].c.length,(s.bld[b]||0)+1);s.pop+=j.result.saved*8;s.prosp=Math.min(100,s.prosp+10);s.st.grain+=j.result.carts*40;
    if(j.trust>=2){deepS();CG.off.luwan={hired:1,loy:80,lvl:0,wins:0,army:null,gov:null};j.recruited=true;}
    CG.trade.qinzhou=1;CG.trade.qingshui=1;
    if(!CAMP.done.includes(1)){CAMP.done.push(1);CAMP.next=Math.max(CAMP.next,2);CAMP.unl.tea=1;CAMP.unl.heroes=1;CG.story.ch2t=CG.turn;}
    if(j.result.rescued&&CG.T.shijia.own==='free')claimTerr('shijia');
    CAMP.res.rep+=10;
    journeyNote(key==='market'?'归来后扩建集市，商旅开始在清河落脚。':'归来后扩建医馆，伤兵与乡人有了安身处。',key==='market'?'A larger market welcomes the returning caravan. Traders now have a reason to stop in Qinghe.':'An expanded hospital welcomes the returning caravan. Wounded soldiers and villagers have a place to recover.');
    if(j.recruited)journeyNote('陆婉带着账簿留下，愿为清河效力（每季俸银8，可任命知寨）。','Lu Wan stays with her account books and joins your officers (8 silver seasonal salary; available as governor).');
    else journeyNote('陆婉留在秦州。商路开通了，但她还不愿把前途押在清河。','Lu Wan remains in Qinzhou. Trade is open, but she will not entrust her future to Qinghe.');
    cgLog('🐫',Tz('秦州之旅完成：清河与秦州通商。','The Qinzhou Journey is complete: Qinghe trades with Qinzhou.'));
    if(CVIL)CVIL.lay=null;
  }else if(j.stage==='setback'&&key==='recover'){
    // A failed expedition has real casualties and spent stores; it grants no trade or free rewards.
    j.stage='prepare';j.trust=0;j.result=null;j.route=null;j.priority=null;j.prep=null;
  }else return false;
  journeyCommit();return true;
}

function journeyStartBattle(){
  if(MODE!=='camp'||!CG||CG.pend||CG.over)return false;const j=journeyState(),a=journeyLeader();
  if(j.stage!=='ambush'||!a||a.id!==j.army||a.loc!==HOME||!a.mem.length||!armyUnits(a).some(u=>u.men>0))return false;
  $('cJourney')?.remove();campEl().style.display='none';
  beginSkirm({type:'journey',terr:HOME,army:a.id,journey:true});return true;
}

{const old=battleSpec;battleSpec=function(q){const s=old(q);if(q.journey){s.journey=true;s.N=10;s.men=10;s.tro={};for(const u of qUnits(q)){const t=UT[u.type].eng;s.tro[t]=(s.tro[t]||0)+Math.round(u.men/10);}s.hud={zh:'秦州之旅 · 押运与抉择',en:'The Qinzhou Journey · convoy under fire',goal:{zh:'至少一辆车抵达东侧路标；救人路线须先解救村人。',en:'Get a wagon to the eastern marker. A rescue pledge also requires securing the hamlet.'}};}return s;};}

{const old=SETUP.skirm;SETUP.skirm=function(){
  if(!B.skirm.journey)return old();const j=journeyState(),r=JOURNEY_ROUTES[j.route],W=r.width,H=r.height,R=srand(battlefieldHash('journey-'+j.route));
  allocGrid(W,H);B.journey=true;B.noSiege=true;
  const roadY=x=>H/2+Math.sin(x/(j.route==='gorge'?8:14))*(j.route==='gorge'?4:2);
  B.road=[];for(let x=2;x<=W-3;x+=1)B.road.push({x:x*TS,y:roadY(x)*TS});
  B.spawns={N:{x:W*.38*TS,y:3*TS,rx:90},S:{x:W*.66*TS,y:(H-3)*TS,rx:100},E:{x:(W-4)*TS,y:roadY(W-4)*TS,ry:70}};
  for(let x=0;x<W;x++){blockRect(x,0,1,1);blockRect(x,H-1,1,1);}
  for(let y=0;y<H;y++){blockRect(0,y,1,1);blockRect(W-1,y,1,1);}
  for(let x=10;x<W-7;x+=7){const y=roadY(x);if(j.route==='gorge'){addHill(x,y-10,0);addHill(x,y+10,1);}else if(j.route==='pasture'){addProp('yurt',x*TS,6*TS,0);addProp('haystack',x*TS,(H-6)*TS,0);}else{addProp('banner',x*TS,(y+4)*TS,0);addHouse(x,5,x%2);}}
  for(let i=0;i<85;i++){const x=3+R()*(W-6),y=2+R()*(H-4);if(Math.abs(y-roadY(x))>8&&Math.abs(x-W/2)>8&&freeTile(x|0,y|0))addTree(x|0,y|0,i%3);}
  const hx=Math.floor(W/2),hy=Math.round(roadY(hx))-7;
  villageCore(hx,hy,[[-4,0,0],[1,-2,1],[5,0,0]]);B.hamlet={x:hx*TS,y:(hy+2)*TS,done:false};
  for(let i=0;i<6;i++)B.civs.push(mkUnit('civ',2,(hx-2+i)*TS,(hy+3)*TS,{kind:'civ',spr:'villager',home:{x:hx*TS,y:(hy+3)*TS}}));
  spawnGroup('xfoot',5,{x:(hx+3)*TS,y:(hy+4)*TS,rx:30,ry:20},{goal:B.hamlet});
  for(let i=0;i<3;i++)B.carts.push(mkUnit('oxcart',0,(8-i*3)*TS,roadY(8-i*3)*TS,{kind:'troop',cart:1,spr:'oxcart',r:15,hp:j.prep==='convoy'?1100:800,maxhp:j.prep==='convoy'?1100:800,def:{armor:.4,spd:r.speed,mounted:0},wp:6-i*3,type:'cart'}));
  placeSquad(10*TS,roadY(10)*TS-35,0);placeTroops(7*TS,roadY(7)*TS-90);addTruck(4*TS,roadY(4)*TS+80);
  B.objective={x:(W-4)*TS,y:roadY(W-4)*TS};addProp('banner',B.objective.x,B.objective.y-60,0);
  for(const p of B.road)battlefieldOpen(Math.round(p.x/TS)-1,Math.round(p.y/TS)-1,3,3);
  const lead=()=>Math.max(0,...B.carts.filter(c=>!c.dead).map(c=>c.x/TS));
  B.events=[{c:()=>lead()>W*.25,f:()=>{spawnGroup(j.route==='gorge'?'xarch':'xfoot',Math.round(r.enemy*.45),'N');say('北坡有伏兵！','Ambushers on the north slope!',3);sfx('horn');}},
    {c:()=>lead()>W*.57,f:()=>{spawnGroup(j.route==='pasture'?'xraid':'xfoot',Math.round(r.enemy*.55),'S');say('后队遇袭，护住车队！','The rear is under attack. Cover the wagons!',3);sfx('horn');}}];
  B.win=()=>B.carts.some(c=>!c.dead)&&B.carts.filter(c=>!c.dead).every(c=>c.x>(W-5)*TS)&&(j.priority!=='rescue'||(B.hamlet.done&&B.civs.some(c=>!c.dead)));
  B.lose=()=>B.carts.every(c=>c.dead)?Tz('车队覆没；活下来的人退回清河。','The convoy is lost. Survivors fall back to Qinghe.'):j.priority==='rescue'&&B.civs.every(c=>c.dead)?Tz('村人全部遇难。','No villagers survived.'):null;
};}
{const old=updCart;updCart=function(c,dt){
  if(!B?.journey)return old(c,dt);
  if(c.x>(B.W-5)*TS){c.journeyArrived=true;moveUnit(c,0,0,dt);return;}
  if(journeyState().priority==='rescue'&&!B.hamlet.done&&c.x>B.W*.44*TS)return;
  // Wagons already at the destination must not block the next wagon's arrival.
  const all=B.carts;B.carts=all.filter(w=>!w.journeyArrived);try{return old(c,dt);}finally{B.carts=all;}
};}
{const old=updateBattle;updateBattle=function(dt){if(B?.journey){const n=B.carts.filter(c=>!c.dead).length,done=B.hamlet.done;B.skirm.hud.goal={zh:`车辆 ${n}/3 · 村庄${done?'已解救':'在路中北侧'} · 东行至金色路标`,en:`Wagons ${n}/3 · Hamlet ${done?'secured':'north of midpoint'} · reach the eastern gold marker`};}return old(dt);};}
{const old=drawOrders;drawOrders=function(){old();if(!B?.journey)return;ctx.save();for(const [p,name,color] of [[B.hamlet,Tz('解救村庄','RESCUE HAMLET'),'#a4d1b1'],[B.objective,Tz('秦州方向','TO QINZHOU'),'#edcc82']]){ctx.strokeStyle=color;ctx.lineWidth=3;ctx.setLineDash([9,7]);ctx.beginPath();ctx.ellipse(p.x,p.y,115,70,0,0,TAU);ctx.stroke();txt(name,p.x,p.y-85,17,color,'center','bold ');}ctx.restore();};}

function journeyFinishBattle(){
  const j=journeyState();if(j.stage!=='ambush')return;
  const win=!!B.over.win,alive=countTroopsArmy(),a=journeyLeader();let fallen=0,wounded=0;
  for(const u of qUnits(SK_SNAP.q)){const t=UT[u.type].eng,f=B.init[t]?clamp(1-(alive[t]||0)/B.init[t],0,1):0,l=Math.min(u.men,Math.round(u.men*f)),w=Math.round(l*(a.mem.includes('medic')?.52:.36));u.men-=l;u.wnd=(u.wnd||0)+w;u.exp+=win?2:1;fallen+=l-w;wounded+=w;}
  CAMP.mod.ammo=Math.max(0,B.mod.ammo);CAMP.mod.gren=Math.max(0,B.mod.gren);CAMP.mod.fuel=Math.max(0,B.mod.fuel);CAMP.kills+=B.kills;CAMP.roster=SK_SNAP.roster;
  CG.stats.battles++;if(win)CG.stats.wins++;
  const rescued=!!(B.hamlet.done&&B.civs.some(c=>!c.dead));j.result={win,carts:win?B.carts.filter(c=>!c.dead).length:0,saved:rescued?B.civs.filter(c=>!c.dead).length:0,rescued,fallen,wounded,ammo:B.used.ammo};
  if(rescued)j.trust++;j.stage=win?'market':'setback';
  journeyNote(win?`车队抵达秦州：${j.result.carts}/3辆车；救出${j.result.saved}名乡人；阵亡${fallen}，伤${wounded}。`:`车队折返：阵亡${fallen}，伤${wounded}。已花费的粮银与弹药不会退还。`,win?`Qinzhou reached: ${j.result.carts}/3 wagons, ${j.result.saved} villagers rescued; ${fallen} fallen, ${wounded} wounded.`:`The convoy retreats: ${fallen} fallen, ${wounded} wounded. Spent supplies and ammunition are not refunded.`);
  END={win,i:-1,skirm:1};MODE='end';show('scrEnd');saveGame();
  // Let the current battle frame finish before removing its render state.
  setTimeout(()=>{B=null;showCamp();journeyUI();},0);
}
{const old=endSkirm;endSkirm=function(){if(B?.journey)return journeyFinishBattle();return old();};}

function journeyScene(j){
  const city=['market','homeward'].includes(j.stage),done=j.stage==='complete';
  let art='<svg viewBox="0 0 800 210" aria-hidden="true"><defs><linearGradient id="jySky" x2="0" y2="1"><stop stop-color="#738d88"/><stop offset="1" stop-color="#d7c394"/></linearGradient></defs><rect width="800" height="210" fill="url(#jySky)"/><circle cx="650" cy="46" r="26" fill="#eddbad"/><path d="M0 130L100 58 205 133 320 45 490 138 590 75 800 137V210H0" fill="#405b52" opacity=".6"/><path d="M0 175Q200 125 380 184T800 158V210H0" fill="#566752"/><path d="M280 210Q360 135 800 150" stroke="#c5ae7c" stroke-width="30" fill="none"/>';
  const houses=city?9:done?7:3;for(let i=0;i<houses;i++){const x=45+i*(city?78:95),y=city?135:159-(i%2)*18;art+=`<g transform="translate(${x} ${y})"><rect x="-22" y="-20" width="44" height="34" fill="#a58c61"/><path d="M-31-20Q0-31 31-20L24-27 0-40-24-27Z" fill="#293f3b"/><rect x="-4" y="-4" width="9" height="18" fill="#35463b"/>${city||done?'<path d="M-25 6H25L19-5H-19Z" fill="#975d45"/>':''}</g>`;}
  for(let i=0;i<14;i++){const x=city?35+i*54:450+i*20,y=city?175+(i%3)*7:182+(i%3)*4;art+=`<circle cx="${x}" cy="${y-9}" r="3" fill="#e0c390"/><path d="M${x} ${y-6}v11" stroke="${i%2?'#7b4939':'#384f50'}" stroke-width="5"/>`;}
  return art+'</svg><span>'+Tz(city?'秦州 · 人马往来，市声不绝':done?'清河 · 值得回来之地':'清河至秦州 · 西北边地',city?'QINZHOU · horses, account books and crowded streets':done?'QINGHE · a place worth returning to':'QINGHE → QINZHOU · the northwestern frontier')+'</span>';
}
function journeyUI(){
  if(MODE!=='camp'||!CG)return;$('cJourney')?.remove();const j=journeyState(),d=document.createElement('div');d.id='cJourney';d.className='panel modal journey-panel';
  const stages=['prepare','route','decision','ambush','market','homeward','complete'];const i=stages.indexOf(j.stage);
  d.innerHTML=`<div class="journey-top"><div><div class="campaign-eyebrow">${Tz('边地纪事 · 第一卷','FRONTIER CHRONICLES · I')}</div><h2>${Tz('秦州之旅','The Qinzhou Journey')}</h2></div></div><div class="journey-scene">${journeyScene(j)}</div><div class="journey-progress">${[Tz('清河','Qinghe'),Tz('择路','The road'),Tz('抉择','A promise'),Tz('押运','The convoy'),Tz('秦州','Qinzhou'),Tz('归途','Homeward'),Tz('新家','Home')].map((s,n)=>`<span class="${n<=i?'lit':''}">${s}</span>`).join('')}</div><div class="journey-body"></div>`;
  d.querySelector('.journey-top').appendChild(btn('关闭','Close',()=>d.remove()));const body=d.querySelector('.journey-body');
  const prose=(zh,en)=>body.insertAdjacentHTML('beforeend','<p>'+Tz(zh,en)+'</p>');
  const choose=(key,zh,en,detail,cost,enabled=true)=>{const b=btn(zh,en,()=>journeyChoice(key));b.classList.add('journey-choice');b.dataset.choice=key;b.insertAdjacentHTML('beforeend',`<small>${detail}${cost?' · '+journeyCost(cost):''}</small>`);const can=enabled&&(!cost||journeyCanPay(cost));if(!can){b.classList.add('dis');b.setAttribute('aria-disabled','true');b.style.pointerEvents='none';}body.appendChild(b);};
  if(j.stage==='prepare'){
    prose(j.legacy?'你曾走通过秦州的路。这次不是重领赏赐：清河需要一条能留下人才与生计的商路。':'秦州的商人愿用马匹换粮。清河却还在修屋、安置流民。带走一车粮，就少一车过冬粮。',j.legacy?'You have reached Qinzhou before. This expedition is a new undertaking: Qinghe needs a road that brings people and livelihoods home.':'Qinzhou merchants will trade horses for grain. Qinghe is still repairing homes and sheltering refugees. Every wagon sent away is one less in the winter store.');
    const a=journeyLeader(),ready=CG.phase===0&&a?.loc===HOME&&a?.mem.length&&armyUnits(a).some(u=>u.men>0);
    prose('苏：先让乡人安顿下来。程：车轴若断在山里，谁也带不回来。','Su: “Help the families settle first.” Cheng: “An axle broken in the hills brings nothing home.”');
    if(!ready)prose('在筹划阶段，让主将、队员与至少一支部队回到清河后才能出发。','Start during Planning, with the lead army, companions and at least one troop unit at Qinghe.');
    choose('community','先修民居、开粥棚','Repair homes and share grain',Tz('人口+60，繁荣+8；陆婉信任+1。普通车轴。','+60 residents, +8 prosperity; trust +1. Standard wagons.'),{grain:80,timber:40,silver:30},ready);
    choose('convoy','优先加固车队','Reinforce the convoy',Tz('每车耐久1100（通常800）；留下更多粮，乡人继续等待。','Wagon health 1100 (normally 800). More grain stays home; families wait.'),{grain:40,timber:20,silver:60},ready);
  }else if(j.stage==='route'){
    prose('商路不是地图上的一条线。驿站要钱，牲口要吃，峡谷里每块岩石都可能藏着弩手。','A trade road is more than a line on a map. Posts demand payment, animals need fodder, and a gorge can hide crossbowmen.');
    for(const [k,r] of Object.entries(JOURNEY_ROUTES))choose(k,...r.name,Tz(...r.desc),r.cost);
  }else if(j.stage==='decision'){
    prose('前哨来报：半路村庄遭到劫掠。年轻管事陆婉的家人也在那里。苏要去救人；程担心车队停下后会被包围。','A scout reports a hamlet under attack. Caravan factor Lu Wan has family there. Su wants a rescue; Cheng fears the wagons will be surrounded if they stop.');
    choose('rescue','答应救人，车队在村口等候','Promise a rescue; hold the wagons',Tz('必须解救村庄才能获胜。救出乡人可得信任+1；停留会暴露车队。','Must secure the hamlet to win. Surviving villagers earn trust +1; waiting exposes the wagons.'));
    choose('cargo','车队继续，救人由你判断','Keep moving; rescue if you can',Tz('只须一辆车抵达。仍可绕行救人；若置之不理，陆婉会记得。','One arriving wagon wins. You may still rescue villagers; Lu Wan remembers if you leave them.'));
  }else if(j.stage==='ambush'){
    prose('这不是占领战：护送车辆沿路向东，防住侧翼伏兵。村庄在路中段北侧。','This is an escort: protect the eastbound wagons from flanking ambushes. The hamlet lies north of the road at its midpoint.');
    prose('车辆携带全部交易货物。保住三辆的回报高于勉强保住一辆。现代弹药不会补回；未完成的战斗在重载后从头开始。','The wagons carry your trade goods: three arriving wagons pay more than one. Modern ammunition is finite. Reloading an unfinished battle restarts that encounter.');
    body.appendChild(btn('护送车队','Escort the convoy',journeyStartBattle));
  }else if(j.stage==='market'){
    prose(`抵达${j.result.carts}/3辆车。陆婉在马市核对牙牌、秤重与账册。“在这里，讲信用比会造神兵更值钱。”`,`Arrived: ${j.result.carts}/3 wagons. At the horse market, Lu Wan checks tallies, weights and accounts. “A kept promise is worth more here than another miraculous weapon.”`);
    prose(j.result.rescued?'她认出了获救的乡人，神色松了下来。':'她问起半路的村庄。你没有带回幸存者。',j.result.rescued?'She recognises the rescued villagers. Her expression softens.':'She asks about the hamlet. You brought no survivors.');
    choose('fair','按公价成交','Trade at honest weights',Tz('每车65银、8马；信任+1。','Per wagon: 65 silver, 8 horses; trust +1.'));
    choose('hard','趁缺货索高价','Demand scarcity prices',Tz('每车105银、4马；没有额外信任。','Per wagon: 105 silver, 4 horses. No additional trust.'));
  }else if(j.stage==='homeward'){
    prose('陆婉：宋人并非不懂工艺。账簿、转运、铁作和火药都有人在做。你们能帮的，是让这些人好好合作。','Lu Wan: “Our craftsmen already know ironworking and gunpowder. Our clerks know transport and accounts. Help them work together.”');
    prose('回程商队愿出资为清河营建一处设施。两条道路都带回每车40粮。信任达到2，陆婉就会留下。','The returning merchants will fund one improvement in Qinghe. Either choice also brings 40 grain per surviving wagon. With trust 2 or more, Lu Wan stays.');
    choose('market','扩建清河集市','Expand Qinghe market',Tz('集市等级+1（至上限）；更多摊位，商路开通。','Market +1 level, up to its cap; more stalls and open trade.'));
    choose('hospital','扩建清河医馆','Expand Qinghe hospital',Tz('医馆等级+1（至上限）；配合“就近送医”安置伤兵。','Hospital +1 level, up to its cap; use Send wounded to admit patients.'));
  }else if(j.stage==='setback'){
    prose('这次没有打通商路。生还的人带着伤回到清河。先补充部队与物资，再决定是否重新出发。','The road remains closed. Survivors return wounded to Qinghe. Replenish the army and stores before trying again.');
    choose('recover','整理损失，重新准备','Regroup and prepare again',Tz('不退还消耗；下一次出发须重新支付整备费用。','Spent supplies stay spent. A new departure requires fresh preparations.'));
  }else{
    prose(j.recruited?'陆婉留下了。你带回的不只是马匹，而是一位愿意为清河谋未来的人。':'商路通了。陆婉留在秦州；这段经历也留下了另一种代价。',j.recruited?'Lu Wan stays. You brought home horses, and someone willing to build a future in Qinghe.':'The trade road is open. Lu Wan remains in Qinzhou; that is part of the price of this journey.');
    prose(`清河：人口 ${j.before.pop} → ${CG.T[HOME].pop}，繁荣 ${Math.round(j.before.prosp)} → ${Math.round(CG.T[HOME].prosp)}。`,`Qinghe: residents ${j.before.pop} → ${CG.T[HOME].pop}; prosperity ${Math.round(j.before.prosp)} → ${Math.round(CG.T[HOME].prosp)}.`);
    body.appendChild(btn('看看回来的清河','Visit the changed Qinghe',()=>{d.remove();showCVil(HOME);}));if(j.recruited)body.appendChild(btn('查看陆婉与将佐','Meet Lu Wan in Officers',()=>{d.remove();offUI();}));
  }
  body.insertAdjacentHTML('beforeend',`<div class="journey-trust">${Tz('陆婉的信任','Lu Wan’s trust')} ${j.trust}/2 · ${Tz('达到2愿意留下；并非历史人物。','At 2, she will stay. A fictional character.')}</div>`);
  if(j.journal.length)body.insertAdjacentHTML('beforeend',`<details class="journey-journal"><summary>${Tz('行旅记事','Journey journal')}</summary>${j.journal.map(e=>'<p>'+Tz(e.zh,e.en)+'</p>').join('')}</details>`);
  body.insertAdjacentHTML('beforeend',`<div class="tip">${Tz('历史底色：宋代西北边贸、马匹供应与成熟工艺。人物与此次行旅为虚构，路线为示意。','Historical setting: Song frontier trade, horse supply and skilled crafts. This expedition and its characters are fictional; routes are schematic.')}</div>`);
  campEl().appendChild(d);
}

CAMPAIGN_ICONS.journey='M2 15l5-9 5 5 4-8M2 15h14M5 4h2M13 2h3';
{const old=campUI;campUI=function(){old();if(MODE!=='camp'||!CG)return;const nav=campEl().querySelector('.campaign-nav');if(!nav)return;const j=journeyState(),b=btn('秦州之旅','Qinzhou Journey',journeyUI);b.id='cJourneyB';b.innerHTML=campaignIcon('journey','nav-icon')+'<span class="nav-label">'+T('秦州之旅','Qinzhou Journey')+(j.stage==='complete'?' ✓':'')+'</span>';nav.insertBefore(b,nav.querySelector('.btn'));};}
{const old=campStory;campStory=function(i,q){if(i===1){showCamp();journeyUI();return;}return old(i,q);};}
{const old=cvilStatic8;cvilStatic8=function(add,s,tier){old(add,s,tier);if(CVIL.id!==HOME||CG.journey?.stage!=='complete')return;add(780,()=>{sprProp('banner',1070,780,0,1);txt(Tz('秦州商路 · 陆婉行记','Qinzhou trade road'),1070,735,18,'#f4df9f','center','bold ');});};}
