'use strict';

CL.fac.jin={zh:'大金',en:'Jin',ch:'金'};
const JIN_CITIES=[
 ['taiyuan','太原府','Taiyuan',112.55,37.87,'city',4000],['zhending','真定府','Zhending',114.57,38.14,'city',3500],
 ['xiangzhou','相州','Xiangzhou',114.39,36.10,'town',2200],['daming','大名府','Daming',115.15,36.29,'city',3500],['longde','隆德府·潞州','Longde (Luzhou)',113.12,36.20,'town',2500]
];
for(const [id,zh,en,lon,lat,kind,pop] of JIN_CITIES)if(!CT[id]){const t={id,zh,en,lon,lat,kind,pop,own:'song',trait:'farm',str:0};CT[id]=t;CL.terr.push(t);CADJ[id]=[];}
for(const [a,b] of [['yanzhou','taiyuan'],['taiyuan','longde'],['longde','henan'],['taiyuan','zhending'],['zhending','xiangzhou'],['xiangzhou','daming'],['daming','kaifeng']])if(!CADJ[a].includes(b)){CL.links.push([a,b]);CADJ[a].push(b);CADJ[b].push(a);}
function historyAbsoluteMonth(){return historyStartYear()*12+campaignMonth()-1;}
function jinState(){return CG.jin||(CG.jin={next:1,armies:[],reports:[],first:false,second:false,last:historyAbsoluteMonth(),outcome:null});}
function jinReport(zh,en,at){const j=jinState();j.reports.unshift({zh,en,at,month:campaignMonth()});j.reports.length=Math.min(24,j.reports.length);cgLog('⚔',Tz(zh,en));}
function jinArmy(name,men,path,phase,state='march'){const j=jinState(),a={id:j.next++,name,men,path,step:0,at:path[0],phase,state,anim:0};j.armies.push(a);return a;}
function jinColumn(q){const id=q.jin||CG.xa.find(x=>x.id===q.xa&&x.faction==='jin')?.jinColumn;return jinState().armies.find(a=>a.id===id);}
function jinPlayerPower(id){let n=0;for(const u of Object.values(CG.U))if(unitSite(u)===id||(u.loc?.a&&CG.armies.find(a=>a.id===u.loc.a)?.loc===id))n+=unitPow(u)*100;return n;}
function jinDefencePower(){const c=CG.T.kaifeng,a=historyAid();return Math.round(((c.songGarrison?.men||0)+jinPlayerPower('kaifeng'))*8+Math.min(a.crossbows,2000)*20+Math.min(a.grain,5000)*2+historyReadiness()*100);}
function jinOccupy(a,id){
  const s=CG.T[id];if(owned(id)){
    if(!CG.xa.some(x=>x.jinColumn===a.id))CG.xa.push({id:CG.xid++,from:a.path[Math.max(0,a.step-1)],to:id,str:a.men,eta:0,faction:'jin',jinColumn:a.id});a.state='player-battle';return false;
  }
  if(s.own==='jin')return true;
  const defence=(s.songGarrison?.men||0)+jinPlayerPower(id);
  if(defence*3>a.men){a.men=Math.max(100,Math.round(a.men*.85));a.state='siege';if(a.men<defence){a.defeated=true;a.state='retreat';a.retreatMonths=2;}jinReport(`金军受阻于${CT[id].zh}，守军仍在抵抗。`,`The Jin are checked at ${CT[id].en}; its defenders hold.`,id);return false;}
  a.men=Math.max(100,a.men-Math.round(defence*.35));s.own='jin';s.str=Math.max(150,Math.round(a.men*.1));delete s.songGarrison;s.prosp=Math.max(10,s.prosp-8);s.stock=s.stock||{grain:200,bow:80,armI:30,spear:100};SEEN.add(id);
  jinReport(`金军攻占${CT[id].zh}，进军道路发生变化。`,`The Jin capture ${CT[id].en}; the military road changes hands.`,id);return true;
}
function jinCapital(){
  const j=jinState();if(j.outcome)return;const active=j.armies.filter(a=>a.phase===2&&!a.defeated&&!['withdrawn','retreat'].includes(a.state)),host=active.filter(a=>a.at==='kaifeng'),enemy=host.reduce((n,a)=>n+a.men,0),defence=jinDefencePower();if(!host.length&&active.length)return;
  if(!enemy||defence>=enemy){j.outcome='averted';for(const a of host){a.state='retreat';a.retreatMonths=2;}jinReport('宋军与勤王军击退汴京城下的金军，二帝得以保全。','Song defenders and the relief armies repel the Jin at Kaifeng; the emperors remain safe.','kaifeng');}
  else{j.outcome='fallen';const c=CG.T.kaifeng;if(owned('kaifeng')){j.outcome=null;const a=host[0];if(!CG.xa.some(x=>x.jinColumn===a.id))CG.xa.push({id:CG.xid++,from:'daming',to:'kaifeng',str:a.men,eta:0,faction:'jin',jinColumn:a.id});a.state='player-battle';return;}c.own='jin';delete c.songGarrison;c.str=Math.max(1500,Math.round(enemy*.3));c.prosp=Math.max(10,c.prosp-25);for(const a of host)a.state='occupation';jinReport('汴京城防被突破，金军入城。救援未能扭转战局。','Kaifeng’s defences break; the Jin occupy the capital. The relief effort could not reverse the battle.','kaifeng');}
  campRefresh();
}
function jinTick(){
  if(!CG||CG.over)return;const j=jinState(),now=historyAbsoluteMonth();if(now<=j.last)return;j.last=now;
  for(const a of j.armies)if(a.state==='retreat'&&--a.retreatMonths<=0)a.state='withdrawn';
  if(j.outcome||CG.fallK)return;
  if(now>=1125*12+10&&!j.first){j.first=true;const east=jinArmy(['完颜宗望','Wanyan Zongwang'],6000,['zhending','xiangzhou','daming','kaifeng'],1);jinOccupy(east,'zhending');jinArmy(['完颜宗翰','Wanyan Zonghan'],8000,['taiyuan','longde','henan','kaifeng'],1,'taiyuan-siege');jinReport('金军分东西两路南下：宗望走河北，宗翰围太原。','Two Jin columns move south: Zongwang through Hebei; Zonghan besieges Taiyuan.','taiyuan');}
  if(now>=1126*12+8&&!j.second){j.second=true;jinArmy(['宗望东路军','Zongwang’s eastern army'],12000,['zhending','xiangzhou','daming','kaifeng'],2);let west=j.armies.find(a=>a.phase===1&&a.name[1].includes('Zonghan')&&!a.defeated);if(west){west.phase=2;west.men+=6000;west.state='march';}else west=jinArmy(['宗翰西路军','Zonghan’s western army'],14000,['taiyuan','longde','henan','kaifeng'],2);jinOccupy(west,'taiyuan');jinReport('金军再次南征，东西两路向汴京会师。','The Jin invade again; eastern and western columns converge on Kaifeng.','kaifeng');}
  for(const a of j.armies){a.anim=0;if(a.defeated||['withdrawn','retreat','occupation','player-battle'].includes(a.state))continue;
    if(a.state==='siege'&&!jinOccupy(a,a.at))continue;
    if(a.state==='taiyuan-siege'){if(jinPlayerPower('taiyuan')+(CG.T.taiyuan.songGarrison?.men||0)*3>a.men){a.defeated=true;a.state='retreat';a.retreatMonths=2;jinReport('太原援军击退宗翰，西路金军受挫。','Taiyuan’s relief defeats Zonghan; the western column is checked.','taiyuan');}continue;}
    if(a.at==='kaifeng'){
      a.state='capital-siege';if(a.phase===1&&now>=1126*12+1){a.state='retreat';a.retreatMonths=2;CG.T.kaifeng.songGarrison.men=Math.max(600,Math.round(CG.T.kaifeng.songGarrison.men*.9));jinReport('汴京第一次围城解围，金军暂退；第二次进攻仍需防备。','The first siege of Kaifeng is lifted; the Jin withdraw, but a second invasion remains possible.','kaifeng');}continue;
    }
    const next=a.path[a.step+1];if(!next)continue;a.step++;a.at=next;
    if(next==='kaifeng'){a.state='capital-siege';jinReport(`${a.name[0]}抵达汴京，开始围城。`,`${a.name[1]} reaches Kaifeng and begins the siege.`,'kaifeng');}
    else jinOccupy(a,next);
  }
  if(now>=1127*12)jinCapital();campRefresh();
}
{const old=endTurn;endTurn=function(){if(!CG||CG.pend||CG.queue.length)return old();jinState();const m=campaignMonth(),r=old();if(campaignMonth()>m){jinTick();saveGame();}return r;};}
{const old=evDef;evDef=function(e){if(!e.fall)return old(e);const j=jinState();if(!j.outcome)return{zh:'汴京围城尚在进行',en:'The siege of Kaifeng continues',d:{zh:'金军与守军仍在地图上交战。下一步请查看军情并支援城防。',en:'The Jin and defenders are still fighting on the map. Inspect the armies and reinforce the capital.'},k:'ongoing',o:[{zh:'查看战局','en':'Inspect the campaign',fx:{}}]};
  if(j.outcome==='averted')return{zh:'宋军守住汴京',en:'The Song holds Kaifeng',d:{zh:'地图上的金军已被击退，二帝没有被掳。这是你的军事干预造成的架空历史分支。',en:'The Jin columns on the map have been repelled. The emperors avoid capture: an alternate-history branch earned by your military intervention.'},k:'averted',o:[{zh:'继续保卫大宋（恩眷+40）',en:'Continue defending the Song (+40 favour)',fx:{fav:40,court:15}}]};
  return{zh:LORE.arc.fall.zh,en:LORE.arc.fall.en,d:historyReadiness()>=60?LORE.arc.fall.good:LORE.arc.fall.bad,k:historyReadiness()>=60?'good':'bad',o:[{zh:'继续收复失地',en:'Continue the struggle',fx:{}}]};
};}
// Keep the crisis pending until actual map combat has produced an outcome.
{const old=evShow;evShow=function(){if(CG?.evQ?.[0]?.fall&&!jinState().outcome&&!CG.fallK)return false;return old();};}
{const old=battleCard;battleCard=function(){const d=old(),q=qItem();if(q&&(jinColumn(q)||CG.T[q.terr].own==='jin')){const walker=document.createTreeWalker(d,NodeFilter.SHOW_TEXT);while(walker.nextNode())walker.currentNode.nodeValue=walker.currentNode.nodeValue.replace(/西夏兵/g,'金军').replace(/Xia/g,'Jin');}return d;};}

function jinEngage(id,armyId){
  const col=jinState().armies.find(a=>a.id===id),a=CG.armies.find(a=>a.id===armyId);
  if(MODE!=='camp'||CG.phase!==0||CG.pend||CG.queue.length||!col||col.defeated||['withdrawn','retreat','occupation'].includes(col.state)||!a?.mem.length||!armyUnits(a).some(u=>u.men>0)||(a.loc!==col.at&&!CADJ[a.loc].includes(col.at)))return false;
  $('cMissions')?.remove();beginSkirm({type:'def',terr:col.at,army:a.id,jin:col.id});campEl().style.display='none';return true;
}
{const old=qEnemyStr;qEnemyStr=function(q){const a=jinColumn(q);return a?a.men:old(q);};}
{const old=battleSpec;battleSpec=function(q){const s=old(q),a=jinColumn(q);if(a||CG.T[q.terr]?.own==='jin'){
  s.enemyFaction='jin';if(a){s.str=a.men;s.enemy=enemyMix(a.men,CT[q.terr].kind,s.N);s.hud={zh:'抗金作战 · '+CT[q.terr].zh,en:'Defence against the Jin · '+CT[q.terr].en,goal:{zh:'守住要地，击退金军攻势。',en:'Hold the strongpoint and repel the Jin assault.'}};const npc=CG.T[q.terr].songGarrison?.men||0;s.tro.spear=(s.tro.spear||0)+Math.round(npc*.65/s.N);s.tro.xbow=(s.tro.xbow||0)+Math.round(npc*.35/s.N);}
}return s;};}
{const old=mkUnit;mkUnit=function(type,team,x,y,o={}){const u=old(type,team,x,y,o);if(team===1&&B?.skirm?.enemyFaction==='jin')u.name=[type==='xiron'?'金军铁骑':'金军',type==='xiron'?'Jin armoured cavalry':'Jin troops'];return u;};}
{const old=resolveBattle;resolveBattle=function(q,win,stats){const col=jinColumn(q);if(!col)return old(q,win,stats);
  const a=qArmy(q),inventory=win?spoilsEquipment(q):null;let lostN=0,wnd=0;for(const u of qUnits(q)){const n=Math.min(u.men,Math.round(u.men*(stats.frac?stats.frac(u):0))),w=Math.round(n*(a?.mem.includes('medic')?.52:.36));u.men-=n;u.wnd=(u.wnd||0)+w;u.exp+=win?3:1;lostN+=n-w;wnd+=w;}
  CG.stats.battles++;if(win)CG.stats.wins++;for(const m of a?.mem||[])CG.sq[m].merit+=win?50:15;
  if(win){col.defeated=true;col.men=Math.round(col.men*.15);col.state='retreat';col.retreatMonths=2;CG.ready=(CG.ready||0)+15;if(CG.T[col.at].own==='jin'){CG.T[col.at].own='song';CG.T[col.at].str=0;CG.T[col.at].songGarrison={men:300,type:'spear'};}jinReport(`林队部击败${col.name[0]}，金军败退。`,`Lin Feng’s army defeats ${col.name[1]}; the Jin retreat.`,col.at);}
  else{col.men=Math.max(100,Math.round(col.men*.8));if(q.xa&&owned(q.terr)){loseTerr(q.terr);CG.T[q.terr].own='jin';CG.T[q.terr].str=col.men;if(q.terr==='kaifeng')jinState().outcome='fallen';}if(a&&a.loc===col.at){const back=CADJ[a.loc].find(id=>careFriendly(id));if(back)a.loc=back;}jinReport('勤王军作战失利，整军再战。','The relief force falls back to regroup.',col.at);}
  CG.xa=CG.xa.filter(x=>x.jinColumn!==col.id);CG.queue=CG.queue.filter(x=>x!==q);const gain={silver:0,ore:0,horse:0,grain:0,rep:win?12:-3};CAMP.res.rep=Math.max(0,(CAMP.res.rep||0)+gain.rep);
  const r={q:{...q},win,gain,lostN,back:0,wnd,kills:stats.kills||0,terr:q.terr,t:stats.t||0,auto:!!stats.auto,saved:stats.saved||0};if(win){const to=owned(q.terr)?q.terr:HOME;r.capturedEquipment=spoilsAward(inventory,q.terr,to);gain.horse=r.capturedEquipment?.goods.horse||0;}
  CG.last=r;campRefresh();saveGame();return r;
};}
function jinDraw(g){const j=CG.jin;if(!j)return;const sc=iconScale();for(const a of j.armies){if(a.state==='withdrawn')continue;const n=Math.max(1,a.path.length-1),k=Math.max(0,a.step-1)+clamp(a.anim/5,0,1),p=pathAt(a.path,Math.min(1,k/n)),where=['capital-siege','taiyuan-siege','siege','player-battle','occupation'].includes(a.state)?tPos(a.at):p,q=c2s(where.x,where.y);if(q.x<-100||q.y<-100||q.x>VW+100||q.y>VH+100)continue;g.save();g.strokeStyle='#8d83ba';g.lineWidth=2;g.setLineDash([6,6]);const end=tPos(a.path[a.path.length-1]),e=c2s(end.x,end.y);g.beginPath();g.moveTo(q.x,q.y);g.lineTo(e.x,e.y);g.stroke();g.setLineDash([]);for(let i=0;i<4;i++)sprUnit('xia_iron',q.x+(i%2)*12*sc,q.y+Math.floor(i/2)*12*sc,9*sc,p.f,Math.floor(CTIME*8)%4);banner(g,q.x-8*sc,q.y,'#514777','金',sc,true);shipPill(g,Tz(a.name[0],a.name[1])+' '+a.men,q.x,q.y-46*sc,Math.max(11,11*sc),'#e8ddff');if(a.state.includes('siege')||a.state==='player-battle'){g.strokeStyle='#f5b966';g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,32*sc+Math.sin(CTIME*8)*5,0,TAU);g.stroke();txt('⚔',q.x+35*sc,q.y,22*sc,'#ffe3a4','center');}g.restore();}}
{const old=drawRaids;drawRaids=function(g){old(g);jinDraw(g);};}
{const old=campFrame;campFrame=function(dt){if(CG?.jin)for(const a of CG.jin.armies)a.anim=Math.min(10,(a.anim||0)+dt);return old(dt);};}
function jinPanel(){const j=jinState(),d=document.createElement('div');d.className='wk';d.id='cJinWar';d.innerHTML=`<h2>${Tz('金军南侵 · 地图战局','Jin invasion · the campaign map')}</h2><p>${Tz('金军将于1125年分两路南下，1126年再度进攻，最终围攻汴京。路线为示意，兵力为游戏平衡值。城镇会被攻占，救援会被道路阻断；可把部队开到金军附近亲自截击。','The Jin advance in two columns in 1125 and return in 1126 to besiege Kaifeng. Routes are schematic and strengths are gameplay values. Towns can fall and relief roads can close. Bring an army within one road link to command an interception.')}</p><div>${Tz('汴京综合防御','Kaifeng defence power')}: ${jinDefencePower().toLocaleString()} · ${Tz('结局','Outcome')}: ${j.outcome||Tz('尚未决出','Undecided')}</div>`;
  for(const col of j.armies.filter(a=>a.state!=='withdrawn')){const r=document.createElement('div');r.className='wk';r.innerHTML=`<b>${Tz(...col.name)} · ${col.men}</b> · ${tName(col.at)} · ${col.defeated?Tz('败退','Defeated'):col.state.includes('siege')?Tz('围城','Besieging'):Tz('行军','Marching')}`;for(const army of CG.armies)if(army.mem.length&&armyUnits(army).some(u=>u.men>0)&&(army.loc===col.at||CADJ[army.loc].includes(col.at))&&!col.defeated)r.appendChild(btn('亲自截击','Command interception',()=>jinEngage(col.id,army.id)));d.appendChild(r);}
  for(const r of j.reports.slice(0,5))d.insertAdjacentHTML('beforeend','<p>⚔ '+Tz(r.zh,r.en)+'</p>');return d;
}
{const old=missionsUI;missionsUI=function(message){old(message);const d=$('cMissions');if(d)d.insertBefore(jinPanel(),d.lastElementChild);};}
