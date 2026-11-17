'use strict';

// A bounded monthly simulation for independent Song and Xia forces. Player
// troops and territory remain in the normal campaign battle system.
function frontierWar(){return CG.frontierWar||(CG.frontierWar={v:1,next:1,armies:[],reports:[],cooldown:{},last:campaignMonth()});}
function warFaction(id){const f=CG.T[id]?.own;return f==='song'||f==='xia'?f:null;}
function warMen(id){return warFaction(id)==='song'?CG.T[id].songGarrison?.men||0:warFaction(id)==='xia'?CG.T[id].str||0:0;}
function warSetMen(id,n){const s=CG.T[id];n=Math.max(0,Math.round(n));if(s.own==='song'){s.songGarrison=s.songGarrison||{type:CT[id].trait==='horse'?'cav':'spear',men:0};s.songGarrison.men=n;}else if(s.own==='xia')s.str=n;}
function warCap(id,fac=warFaction(id)){return (fac==='song'?{city:450,town:180,fort:260,pass:180,camp:150,village:70}:{city:1600,town:700,fort:800,pass:650,camp:600,village:300})[CT[id].kind]||250;}
function warBorder(id){const fac=warFaction(id);return fac&&(CADJ[id]||[]).some(n=>warFaction(n)&&warFaction(n)!==fac);}
function warPath(from,to,fac){
  const prev={[from]:null},q=[from];for(const at of q){if(at===to)break;for(const n of CADJ[at]||[])if(warFaction(n)===fac&&!(n in prev)){prev[n]=at;q.push(n);}}
  if(!(to in prev))return null;const path=[];for(let at=to;at!=null;at=prev[at])path.unshift(at);return path;
}
function warReport(zh,en,at){const w=frontierWar(),r={month:campaignMonth(),zh,en,at};w.reports.unshift(r);w.reports.length=Math.min(w.reports.length,24);cgLog('⚔',Tz(zh,en));}
function warDispatch(fac,from,to,men,kind='attack',path=[from,to]){
  if(!Number.isInteger(men)||warFaction(from)!==fac||warMen(from)<men||men<1||path[0]!==from||path[path.length-1]!==to||path.length<2||path.some((id,i)=>i&&(!(CADJ[path[i-1]]||[]).includes(id)||(i<path.length-1&&warFaction(id)!==fac))))return null;warSetMen(from,warMen(from)-men);
  const w=frontierWar(),a={id:w.next++,fac,from,to,at:from,path,step:0,men,kind,state:'march',born:campaignMonth(),anim:0};w.armies.push(a);w.cooldown[from]=campaignMonth()+3;return a;
}
function warRetreat(a,at){
  const candidates=Object.keys(CG.T).filter(id=>warFaction(id)===a.fac).map(id=>({id,path:warPath(at,id,a.fac)})).filter(c=>c.path).sort((x,y)=>x.path.length-y.path.length);
  if(!candidates.length||a.men<=0)return false;const best=candidates[0];a.from=at;a.at=at;a.to=best.id;a.path=best.path;a.step=0;a.kind='return';a.state='march';a.anim=0;return true;
}
function warResolve(a){
  const fac=warFaction(a.to),s=CG.T[a.to],w=frontierWar();if((!fac&&!(a.kind==='occupy'&&s.own==='free'))||fac===a.fac){if(fac===a.fac)warSetMen(a.to,warMen(a.to)+a.men);return false;}
  const defenders=warMen(a.to),fort=1+(s.bld?.wall||0)*.12+(['city','fort','pass'].includes(CT[a.to].kind)?.2:0);
  const R=srand(battlefieldHash(`war-${a.id}-${campaignMonth()}-${a.to}`)),won=a.men*(.85+R()*.3)>defenders*fort*(.85+R()*.3);
  const attackerName=a.fac==='song'?['宋军','Song']:['夏军','Xia'],defenderName=fac==='song'?['宋军','Song']:['夏军','Xia'];
  if(won){
    const routed=Math.round(defenders*.2);a.men=Math.round(a.men*(.65-R()*.15));s.own=a.fac;s.prosp=Math.max(8,s.prosp-7);s.pop=Math.max(50,Math.round(s.pop*.98));
    if(a.fac==='song'){s.str=0;s.songGarrison={men:a.men,type:CT[a.to].trait==='horse'?'cav':'spear'};}else{delete s.songGarrison;s.str=a.men;}
    warReport(`${attackerName[0]}攻下${CT[a.to].zh}，边界移位。`,`${attackerName[1]} captured ${CT[a.to].en}; the frontier shifts.`,a.to);
    if(routed){const retreat={id:w.next++,fac,from:a.to,at:a.to,to:a.to,path:[a.to],step:0,men:routed,kind:'return',state:'march',born:campaignMonth(),anim:0};if(warRetreat(retreat,a.to))w.armies.push(retreat);}
    return false;
  }
  warSetMen(a.to,Math.max(0,defenders-Math.round(Math.min(defenders*.45,a.men*(.25+R()*.2)))));a.men=Math.round(a.men*(.25+R()*.15));
  warReport(`${defenderName[0]}守住${CT[a.to].zh}，${attackerName[0]}退却。`,`${defenderName[1]} held ${CT[a.to].en}; the ${attackerName[1]} column retreats.`,a.to);
  return warRetreat(a,a.to);
}
function warIssueOrders(){
  const w=frontierWar(),month=campaignMonth();
  for(const fac of ['song','xia']){
    if(w.armies.filter(a=>a.fac===fac).length>=4)continue;
    const pairs=[];for(const from of Object.keys(CG.T))if(warFaction(from)===fac&&warMen(from)>=130&&(w.cooldown[from]||0)<=month&&!w.armies.some(a=>a.from===from&&a.kind==='attack')){
      for(const to of CADJ[from]||[])if(warFaction(to)&&warFaction(to)!==fac&&!w.armies.some(a=>a.fac===fac&&a.to===to&&a.kind==='attack')){
        const men=Math.min(1400,Math.floor(warMen(from)*.45));if(men<60)continue;pairs.push({from,to,men,score:men/(warMen(to)+80)+(CG.T[to].prosp||0)/300});
      }
    }
    pairs.sort((a,b)=>b.score-a.score||a.from.localeCompare(b.from));
    if(pairs.length){const p=pairs[0];warDispatch(fac,p.from,p.to,p.men);}
    if(w.armies.filter(a=>a.fac===fac).length>=4)continue;
    const front=Object.keys(CG.T).filter(id=>warFaction(id)===fac&&warBorder(id)&&warMen(id)<warCap(id)*.75).sort((a,b)=>warMen(a)-warMen(b));
    for(const to of front){if(w.armies.some(a=>a.to===to&&a.kind==='reinforce'))continue;
      const candidates=Object.keys(CG.T).filter(id=>id!==to&&warFaction(id)===fac&&!warBorder(id)&&warMen(id)>250&&(w.cooldown[id]||0)<=month).map(from=>({from,path:warPath(from,to,fac)})).filter(p=>p.path&&p.path.length<=5).sort((a,b)=>a.path.length-b.path.length||warMen(b.from)-warMen(a.from));
      if(candidates.length){const p=candidates[0];warDispatch(fac,p.from,to,Math.min(300,Math.floor(warMen(p.from)*.25)),'reinforce',p.path);break;}
    }
  }
}
function warTick(){
  if(!CG||CG.over)return;const w=frontierWar(),month=campaignMonth();if(month<=w.last)return;w.last=month;
  const current=w.armies.slice();w.armies=[];
  for(const a of current){
    a.anim=0;
    if(a.state==='fight'){if(warResolve(a))w.armies.push(a);continue;}
    const destination=warFaction(a.to);
    if((!destination&&!(a.kind==='occupy'&&CG.T[a.to]?.own==='free'))||(a.kind==='attack'&&destination===a.fac)){
      if(warFaction(a.at)===a.fac)warSetMen(a.at,warMen(a.at)+a.men);else if(warRetreat(a,a.at))w.armies.push(a);continue;
    }
    const next=a.path[a.step+1];
    if(!next){if(destination===a.fac)warSetMen(a.to,warMen(a.to)+a.men);else if(a.kind==='attack'){a.state='fight';w.armies.push(a);}continue;}
    const enteringEnemy=next===a.to&&((a.kind==='attack'&&warFaction(next)&&warFaction(next)!==a.fac)||(a.kind==='occupy'&&CG.T[next]?.own==='free'));
    if(!(CADJ[a.at]||[]).includes(next)||(warFaction(next)!==a.fac&&!enteringEnemy)){if(warRetreat(a,a.at))w.armies.push(a);continue;}
    a.step++;a.at=next;
    if(a.at===a.to){if(['attack','occupy'].includes(a.kind)&&destination!==a.fac){a.state='fight';w.armies.push(a);}else warSetMen(a.to,warMen(a.to)+a.men);}
    else w.armies.push(a);
  }
  npcEconomyTick();
  warIssueOrders();campRefresh();
}
{const old=endTurn;endTurn=function(){if(!CG||CG.pend||CG.queue.length)return old();frontierWar();const before=campaignMonth(),r=old();if(campaignMonth()>before){warTick();saveGame();}return r;};}

function warDraw(g){
  const w=CG.frontierWar;if(!w)return;const sc=iconScale();g.save();
  for(const a of w.armies){
    const fighting=a.state==='fight',n=Math.max(1,a.path.length-1),step=Math.max(0,a.step-1),k=fighting?a.step/n:Math.min(1,(step+(a.step?clamp(a.anim/4,0,1):clamp(a.anim/14,0,.85)))/n),p=pathAt(a.path,k),q=c2s(p.x,p.y);
    if(q.x<-100||q.x>VW+100||q.y<-100||q.y>VH+100)continue;
    const col=a.fac==='song'?'#ddb767':'#d7898d',spr=a.fac==='song'?'song_spear':'xia_raider',fr=fighting?4:Math.floor(CTIME*8)%4;
    g.strokeStyle=col;g.lineWidth=1.7*sc;g.setLineDash([4*sc,5*sc]);const end=tPos(a.to),e=c2s(end.x,end.y);g.beginPath();g.moveTo(q.x,q.y);g.lineTo(e.x,e.y);g.stroke();g.setLineDash([]);
    for(let i=0;i<3;i++)sprUnit(spr,q.x-(i%2)*15*sc,q.y+Math.floor(i/2)*12*sc,8*sc,p.f,fr);
    banner(g,q.x+10*sc,q.y,a.fac==='song'?'#a84931':'#453d67',a.fac==='song'?'宋':'夏',sc);
    const text=(a.fac==='song'?Tz('宋','Song'):Tz('夏','Xia'))+' '+a.men+' · '+(fighting?Tz('交战','Fighting'):a.kind==='reinforce'?Tz('增援','Reinforcing'):a.kind==='return'?Tz('撤退','Retreating'):Tz('进军','Marching'));
    shipPill(g,text,q.x,q.y-44*sc,Math.max(10,11*sc),col);
    if(fighting){const flash=.5+.5*Math.sin(CTIME*12+a.id);g.strokeStyle=`rgba(255,181,87,${flash})`;g.lineWidth=2*sc;g.beginPath();g.arc(q.x,q.y,26*sc+flash*8*sc,0,TAU);g.stroke();txt('⚔',q.x+28*sc,q.y,20*sc,'#ffe1a0','center');}
  }g.restore();
}
{const old=drawRaids;drawRaids=function(g){old(g);warDraw(g);};}
{const old=campFrame;campFrame=function(dt){if(CG?.frontierWar)for(const a of CG.frontierWar.armies)a.anim=Math.min(15,(a.anim||0)+dt);return old(dt);};}
{const old=missionsUI;missionsUI=function(message){old(message);const d=$('cMissions');if(!d||!CG)return;const w=frontierWar(),box=document.createElement('div');box.className='wk';box.style.marginTop='14px';box.innerHTML=`<h2>${Tz('宋夏边战','Song–Xia frontier war')}</h2><div class="tip">${Tz('双方独立出兵、增援与交战，每月结算。攻守影响驻军与城镇归属；你方部队与领地仍由战役战斗规则处理。','Both sides march, reinforce and fight independently each month. Battles change garrisons and settlement control; your troops and territory remain in the campaign battle system.')}</div>${w.armies.length?w.armies.map(a=>`<div>${a.fac==='song'?Tz('宋军','Song'):Tz('夏军','Xia')} ${a.men} · ${tName(a.from)} → ${tName(a.to)} · ${a.state==='fight'?Tz('交战中','Fighting'):a.kind==='reinforce'?Tz('增援','Reinforcing'):a.kind==='return'?Tz('撤退','Retreating'):Tz('行军','Marching')}</div>`).join(''):'<p>'+Tz('下个月起，双方边军开始调动。','Frontier columns begin moving next month.')+'</p>'}${w.reports.slice(0,6).map(r=>'<p>⚔ '+Tz(r.zh,r.en)+'</p>').join('')}`;d.insertBefore(box,d.lastElementChild);};}
{const old=terrPanel;terrPanel=function(id){const d=old(id),w=CG.frontierWar;if(w){const report=w.reports.find(r=>r.at===id);if(report)d.insertAdjacentHTML('beforeend',`<div class="wk">⚔ ${Tz(report.zh,report.en)}</div>`);}return d;};}
