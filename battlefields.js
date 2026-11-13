'use strict';

const BATTLE_REGIONS={
  farm:{zh:'田庄村落',en:'Farming hamlet',terrain:'orchards',names:[['粮仓','Granary'],['村中广场','Village green']]},
  market:{zh:'商埠市镇',en:'Market town',terrain:'streets',names:[['集市','Market square'],['转运场','Caravan yard']]},
  fort:{zh:'山寨要塞',en:'Frontier fortress',terrain:'ridge',names:[['外寨','Outer ward'],['中军帐','Command yard']]},
  city:{zh:'州府城池',en:'Prefectural city',terrain:'city',names:[['城门街','Gate district'],['州衙','Prefectural hall'],['军仓','Military stores']]},
  steppe:{zh:'牧场营寨',en:'Pasture encampment',terrain:'steppe',names:[['马场','Horse corral'],['辎重营','Supply camp']]},
  crossing:{zh:'渡口盐镇',en:'River settlement',terrain:'river',names:[['西桥头','West bridgehead'],['东渡仓','East wharf']]},
  quarry:{zh:'矿山聚落',en:'Mining settlement',terrain:'quarry',names:[['矿场','Mine works'],['冶炼场','Smelting yard']]}
};
function battlefieldHash(id){let n=2166136261;for(const c of id)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
function settlementProfile(id){
  const t=CT[id];
  const type=t.kind==='city'?'city':t.kind==='fort'||t.kind==='pass'?'fort':t.kind==='camp'||t.trait==='horse'?'steppe':
    t.trait==='salt'||/ford|渡/.test(t.en+' '+t.zh)?'crossing':t.trait==='iron'?'quarry':t.kind==='town'||t.trait==='trade'?'market':'farm';
  return{type,...BATTLE_REGIONS[type],seed:battlefieldHash(id)};
}
{const old=battleSpec;battleSpec=function(q){
  const s=old(q),p=settlementProfile(q.terr);s.profile=p;s.kind=CT[q.terr].kind;s.mission=q.type==='raid'?'raid':q.type==='def'?'defend':'occupy';
  const total=Math.max(6,Object.values(s.enemy).reduce((a,b)=>a+b,0));
  const weights={farm:{xfoot:.65,xarch:.3,xraid:.05},market:{xfoot:.5,xarch:.45,xraid:.05},fort:{xfoot:.5,xarch:.4,xiron:.1},city:{xfoot:.45,xarch:.4,xiron:.15},steppe:{xfoot:.15,xarch:.15,xraid:.55,xiron:.15},crossing:{xfoot:.55,xarch:.4,xraid:.05},quarry:{xfoot:.65,xarch:.35}}[p.type];
  let left=total;const keys=Object.keys(weights);s.enemy={};keys.forEach((k,i)=>{s.enemy[k]=i===keys.length-1?left:Math.min(left,Math.round(total*weights[k]));left-=s.enemy[k];});
  s.hud={...s.hud,zh:s.hud.zh+' · '+p.zh,en:s.hud.en+' · '+p.en};
  return s;
};}

function battlefieldPoint(x,y,name,index){return{x:x*TS,y:y*TS,name,index,r:115,held:0,need:12,captured:false,contested:false};}
function battlefieldOpen(tx,ty,w=3,h=3){
  for(let y=ty;y<ty+h;y++)for(let x=tx;x<tx+w;x++)if(inB(x,y)){B.solid[tIdx(x,y)]=0;B.sgrid[tIdx(x,y)]=-1;}
}

SETUP.skirm=function(){
  const S=B.skirm,p=S.profile||settlementProfile(S.terr),R=srand(p.seed),type=p.type;
  const W=type==='city'?88:72,H=type==='city'?70:60,cx=Math.floor(W/2),cy=24+(p.seed%3)*2;
  allocGrid(W,H);B.vilTier=S.tier;B.noSiege=S.mode!=='def';
  B.spawns={N:{x:cx*TS,y:3*TS,rx:120,ry:25},W:{x:3*TS,y:cy*TS,rx:25,ry:130},E:{x:(W-3)*TS,y:cy*TS,rx:25,ry:130},S:{x:cx*TS,y:(H-3)*TS,rx:120,ry:25}};
  for(let x=0;x<W;x++){blockRect(x,0,1,1);blockRect(x,H-1,1,1);}for(let y=0;y<H;y++){blockRect(0,y,1,1);blockRect(W-1,y,1,1);}
  const positions=type==='city'?[[cx,38],[cx-14,18],[cx+14,21]]:type==='crossing'?[[20,25],[50,22]]:
    type==='steppe'?[[cx-12,cy-3],[cx+12,cy+3]]:type==='quarry'?[[cx-9,cy-7],[cx+12,cy+2]]:
    type==='fort'?[[cx,39],[cx,18]]:[[cx-10,cy-2],[cx+12,cy+1]];
  const points=positions.map(([x,y],i)=>battlefieldPoint(x,y,p.names[i],i));
  const start={x:(cx+(p.seed%2?-10:10))*TS,y:(H-9)*TS};
  B.frontier={profile:p,points,extraction:start,mission:S.mission,defendTime:180+S.tier*15,elapsed:0};
  B.objective={x:cx*TS,y:cy*TS};B.encl={x0:10,x1:W-10,y0:7,y1:43};
  B.road=[{x:start.x,y:(H-2)*TS},{x:cx*TS,y:(H-14)*TS},{x:cx*TS,y:cy*TS},{x:cx*TS,y:3*TS}];
  const reserved=(x,y)=>Math.abs(x-cx)<4||Math.abs(y-38)<2||points.some(o=>Math.hypot(o.x/TS-x,o.y/TS-y)<5)||y>H-15;
  const house=(x,y,v=0)=>{if(reserved(x+1,y+1))return;addHouse(x,y,v);};
  const prop=(name,x,y,v=0)=>addProp(name,x*TS,y*TS,v);
  const cliffs=[];
  const cliff=(x,y)=>{blockEll(x,y+.2,4.6,3);cliffs.push([x,y]);for(let i=0;i<3;i++)prop('rock',x-2+i*2,y+1,i%2);};

  if(type==='city'||type==='market') {
    const step=type==='city'?6:8;
    for(let y=10;y<42;y+=step)for(let x=12;x<W-13;x+=step)if(R()<(type==='city'?.92:.72))house(x+(R()>.65?1:0),y,type==='city'||R()>.5?1:0);
    for(let i=0;i<(type==='city'?12:8);i++){const x=cx-8+(i%4)*5,y=cy-6+Math.floor(i/4)*4;if(!reserved(x,y))prop('stall8',x,y,i%6);}
    prop('hall',points[type==='city'?1:0].x/TS-1,points[type==='city'?1:0].y/TS-3,2);
    if(type==='city')for(let x=10;x<=W-10;x++){if(Math.abs(x-cx)<4)continue;for(const y of [7,44]){prop('cwall',x+.5,y,0);blockRect(x,y,1,1);}}
    if(type==='city')for(let y=8;y<44;y++)for(const x of[10,W-10]){if(Math.abs(y-29)<3)continue;prop('cwall',x+.5,y,1);blockRect(x,y,1,1);}
  } else if(type==='fort') {
    for(let y=5;y<43;y+=7){cliff(17+(R()*2|0),y);cliff(W-18-(R()*2|0),y);}
    for(let x=24;x<=W-24;x++)for(const y of [12,35]){if(Math.abs(x-cx)<3)continue;prop('palisade',x+.5,y,0);blockRect(x,y,1,1);}
    prop('gate',cx,35,0);prop('barracks',cx-6,24);prop('barracks',cx+7,22);prop('hall',cx,15,1);
    for(const [x,y] of [[cx-8,34],[cx+8,34],[cx-8,12],[cx+8,12]])prop('tower',x,y);
    for(let y=18;y<33;y+=8)for(const x of[cx-10,cx+8])house(x,y,1);
  } else if(type==='steppe') {
    for(let i=0;i<14;i++){const a=i/14*TAU,r=8+(i%3)*3,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.7;if(!reserved(x,y)){prop('yurt',x,y);blockRect(Math.floor(x)-1,Math.floor(y)-1,2,2);}}
    for(let i=0;i<10;i++)prop('animal',cx-16+i%5*2,cy+7+Math.floor(i/5)*3,4);
    for(let i=0;i<10;i++)prop('fence',cx-18+i*2,cy+12,0);
  } else if(type==='crossing') {
    for(let y=31;y<=34;y++)for(let x=1;x<W-1;x++)if(Math.abs(x-20)>3&&Math.abs(x-50)>3)blockRect(x,y,1,1);
    prop('bridge',20,34);prop('bridge',50,34);
    for(let i=0;i<12;i++)house(9+(i%4)*15,11+Math.floor(i/4)*7,R()>.5?1:0);
    for(let i=0;i<8;i++)prop('stk8',56+(i%3)*2,26+Math.floor(i/3)*2,9);
  } else if(type==='quarry') {
    for(let y=6;y<42;y+=7)for(const x of[12,W-13])cliff(x,y);
    for(let i=0;i<24;i++){const x=18+R()*(W-36),y=7+R()*31;if(!reserved(x,y)&&Math.abs(y-cy)>4)addRock(Math.floor(x),Math.floor(y));}
    for(let i=0;i<8;i++)house(17+(i%4)*10,12+Math.floor(i/4)*20,0);
    prop('forge',cx+10,cy-1);for(let i=0;i<8;i++)prop('stk8',cx+7+i%3*2,cy+4+Math.floor(i/3)*2,i%2?4:5);
  } else {
    for(let cluster=0;cluster<3;cluster++){const bx=14+cluster*18,by=12+(p.seed%4)*2;for(let i=0;i<4;i++)house(bx+(i%2)*5,by+Math.floor(i/2)*7+cluster*3,R()>.85?1:0);}
    for(let y=10;y<40;y+=5)for(const x of[5,8,W-8,W-5])addTree(x,y,R()>.5?0:4);
    for(let i=0;i<12;i++)prop('haystack',15+i%6*7,43+Math.floor(i/6)*3,i%3);
  }

  for(const o of points){battlefieldOpen(Math.floor(o.x/TS)-2,Math.floor(o.y/TS)-2,5,5);prop('banner',o.x/TS+2,o.y/TS-1,S.mode==='def'?0:1);}
  // Clear the start and outer approach; every map has a usable southern entry.
  battlefieldOpen(Math.floor(start.x/TS)-5,H-15,11,13);
  for(let y=H-15;y>39;y--)battlefieldOpen(cx-2,y,5,1);
  B.lanePts=points.map(o=>({x:o.x,y:o.y}));
  B.paintExtra=(g,road,field)=>{
    const T=TS;
    g.fillStyle={farm:'#b7a56530',market:'#aa9b7b35',city:'#bcb2a545',fort:'#72796a35',steppe:'#71905945',crossing:'#91aaa22a',quarry:'#69676340'}[type];g.fillRect(0,0,W*T,H*T);
    for(const [x,y] of cliffs){
      const mesh=[[-4,-.8],[-3,-2.1],[-1.1,-2.8],[1,-2.2],[3.6,-1.7],[4.5,.3],[3.2,2.3],[.8,3],[-2.3,2.4],[-4.6,.9]];
      const face=(dx,dy)=>{g.beginPath();mesh.forEach(([a,b],i)=>i?g.lineTo((x+a+dx)*T,(y+b+dy)*T):g.moveTo((x+a+dx)*T,(y+b+dy)*T));g.closePath();};
      g.fillStyle='rgba(45,40,25,.18)';face(.4,.6);g.fill();
      const rock=g.createLinearGradient((x-4)*T,(y-2)*T,(x+4)*T,(y+3)*T);rock.addColorStop(0,'#c3b58d');rock.addColorStop(.4,'#a69672');rock.addColorStop(1,'#6d725e');g.fillStyle=rock;face(0,0);g.fill();
      g.strokeStyle='#ddd0a066';g.lineWidth=2;g.beginPath();g.moveTo((x-3)*T,(y-1.6)*T);g.lineTo((x-.8)*T,(y-2)*T);g.lineTo((x+1)*T,y*T);g.lineTo((x+3)*T,(y+.5)*T);g.stroke();
      g.strokeStyle='#53564266';g.beginPath();g.moveTo((x-.8)*T,(y-2)*T);g.lineTo((x-1.7)*T,(y+.3)*T);g.lineTo((x-1)*T,(y+2)*T);g.moveTo((x+1)*T,y*T);g.lineTo((x+.8)*T,(y+2.5)*T);g.stroke();
    }
    if(type==='crossing'){
      g.fillStyle='#5b858a';g.fillRect(T,31*T,(W-2)*T,4*T);g.strokeStyle='#a1c2bd';g.lineWidth=2;
      for(let y=31.4;y<34.8;y+=.7){g.beginPath();g.moveTo(T,y*T);g.lineTo((W-1)*T,y*T);g.stroke();}
      for(const x of [20,50]){g.fillStyle='#8c7959';g.fillRect((x-3)*T,30.8*T,6*T,4.4*T);}
    }
    for(const o of points)road([{x:start.x,y:start.y},{x:o.x,y:Math.max(o.y,39*T)},{x:o.x,y:o.y}],type==='city'?75:35);
    if(type==='farm')for(let i=0;i<8;i++)field((12+i%4*13)*T,(8+Math.floor(i/4)*31)*T,220,100,0);
    if(type==='market'||type==='city')road([{x:10*T,y:29*T},{x:(W-10)*T,y:29*T}],80);
  };

  const own=S.mode==='def';
  if(own){B.key=addStruct('granary',cx-1,cy+3,{key:1,hp:2200+S.tier*400});B.objective={x:B.key.x,y:B.key.y};}
  else prop('granary',cx,cy-5);
  const home=own?{x:cx*TS,y:(cy+7)*TS}:{x:start.x,y:(H-15)*TS};
  placeSquad(home.x,home.y);placeTroops(home.x,home.y+30);
  if(B.members.includes('lead'))addTruck(start.x+4*TS,start.y+3*TS);
  B.camStart={x:home.x,y:home.y-100,z:type==='city'?.8:.9};
  B.enemyTotal=Math.max(1,Object.values(S.enemy).reduce((a,b)=>a+b,0));
  const units=[];for(const t in S.enemy)for(let i=0;i<S.enemy[t];i++)units.push(t);
  const reserveN=S.mission==='raid'?0:Math.floor(units.length*.2);
  const reserve=units.splice(Math.max(0,units.length-reserveN));
  const enemy=(t,x,y,goal)=>{const u=mkUnit(t,1,x,y,{aggro:type==='steppe'?450:260});u.goal=goal||{x,y};return u;};
  if(own){
    const dirs=type==='crossing'?['N','E']:type==='fort'?['N','W']:type==='steppe'?['E','W']:['N','E'];
    const groups=pool=>{const out=[];for(const t of new Set(pool))out.push([t,pool.filter(k=>k===t).length,dirs[out.length%dirs.length]]);return out;};
    B.waves=[{at:20,g:groups(units),left:9999,max:9999,msg:['敌军开始进攻！','The enemy assault begins!']}];
    if(reserve.length)B.waves.push({at:65,g:groups(reserve),left:9999,max:9999,msg:['第二路敌军抵达！','The second enemy column arrives!']});
    for(let i=0;i<Math.min(15,5+S.tier*2);i++)B.civs.push(mkUnit('civ',2,(cx-5+R()*10)*TS,(cy+6+R()*3)*TS,{kind:'civ',spr:'villager',home:{x:cx*TS,y:(cy+8)*TS}}));
  } else {
    units.forEach((t,i)=>{const o=points[i%points.length],a=R()*TAU,r=(1.5+R()*3)*TS;enemy(t,o.x+Math.cos(a)*r,o.y+Math.sin(a)*r);});
    B.waves=[];
    if(reserve.length)B.events.push({c:()=>B.t>75&&!points[points.length-1].captured,f:()=>{reserve.forEach((t,i)=>{const sp=B.spawns[p.seed%2?'E':'N'];enemy(t,sp.x+(i%4)*20,sp.y+Math.floor(i/4)*20,B.objective);});say('敌方预备队赶到！','Enemy reserves arrive!',3);}});
  }
  B.win=()=>{
    const F=B.frontier;if(S.mode==='def')return !B.key.dead&&(F.elapsed>=F.defendTime||(B.wave>=B.waves.length-1&&enemiesAlive()<=1&&routRest()));
    if(S.mission==='raid')return points.every(o=>{
      const carrier=B.units.find(u=>u.id===o.carrierId);
      return o.captured&&carrier&&!carrier.dead&&!carrier.downed&&Math.hypot(carrier.x-start.x,carrier.y-start.y)<150;
    });
    return points.every(o=>o.captured)||(enemiesAlive()<=Math.max(1,Math.ceil(B.enemyTotal*.08))&&routRest());
  };
  B.lose=()=>{if(own&&B.key.dead)return Ts('粮仓被焚','The granary burned');if(B.squad.every(u=>u.dead||u.downed))return Ts('小队全部倒下','The whole squad is down');};
  battlefieldTick(0);
};

function battlefieldTick(dt){
  const F=B?.frontier;if(!F||B.paused||B.over)return;F.elapsed+=dt;
  if(F.mission!=='defend')for(const p of F.points){
    if(p.captured){
      if(F.mission==='raid'){const carrier=B.units.find(u=>u.id===p.carrierId);if(!carrier||carrier.dead||carrier.downed){p.captured=false;p.held=0;}}
      if(p.captured)continue;
    }
    const friendly=B.units.find(u=>u.team===0&&!u.dead&&!u.downed&&!u.inVeh&&u.kind!=='veh'&&Math.hypot(u.x-p.x,u.y-p.y)<p.r);
    p.contested=B.units.some(u=>u.team===1&&!u.dead&&!u.rout&&Math.hypot(u.x-p.x,u.y-p.y)<p.r+25);
    if(friendly&&!p.contested)p.held=Math.min(p.need,p.held+dt);
    if(p.held>=p.need){p.captured=true;p.carrierId=friendly?.id;say('控制 '+p.name[0],p.name[1]+' secured',2);sfx('win');}
  }
  const count=F.points.filter(p=>p.captured).length;
  const hp=B.key?Math.max(0,Math.round(B.key.hp/B.key.maxhp*100)):100;
  const goal=F.mission==='defend'?{zh:`守住粮仓 ${hp}% · ${Math.ceil(Math.max(0,F.defendTime-F.elapsed))}秒`,en:`Granary ${hp}% · hold ${Math.ceil(Math.max(0,F.defendTime-F.elapsed))}s`}:
    F.mission==='raid'?{zh:`夺取辎重 ${count}/${F.points.length}，返回南方撤离点`,en:`Seize depots ${count}/${F.points.length}, then withdraw south`}:
      {zh:`控制要地 ${count}/${F.points.length}（无敌军时驻守12秒）`,en:`Secure districts ${count}/${F.points.length} · hold uncontested for 12s`};
  B.skirm.hud.goal=goal;
}
{const old=updateBattle;updateBattle=function(dt){battlefieldTick(dt);return old(dt);};}
{const old=drawOrders;drawOrders=function(){
  old();const F=B?.frontier;if(!F)return;ctx.save();
  for(const p of F.points){const color=p.captured?'#a8d79a':p.contested?'#e08d6d':'#edce82';ctx.strokeStyle=color;ctx.lineWidth=2;ctx.setLineDash([8,7]);ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*.65,0,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle=color;ctx.lineWidth=6;ctx.beginPath();ctx.arc(p.x,p.y-30,18,-Math.PI/2,-Math.PI/2+TAU*p.held/p.need);ctx.stroke();txt((p.captured?'✓ ':String(p.index+1)+'. ')+Tz(...p.name),p.x,p.y-p.r*.65-15,15,color,'center','bold ');}
  if(F.mission==='raid'){const e=F.extraction;ctx.strokeStyle='#9bcbbc';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(e.x,e.y,150,80,0,0,TAU);ctx.stroke();txt(Tz('撤离点','WITHDRAW HERE'),e.x,e.y+100,16,'#b9e6d1','center','bold ');}
  ctx.restore();
};}

// Peaceful settlements retain recognizable functional districts, while housing,
// boundaries and civic architecture reflect their identity rather than one plan.
{const old=cvilLayout;cvilLayout=function(){
  old();if(!v8ok())return;
  const p=settlementProfile(CVIL.id),R=srand(p.seed),L=CVIL.lay;
  L.profile=p;
  for(const h of L.houses){h.x+=Math.round((R()-.5)*(p.type==='farm'?34:8));h.y+=Math.round((R()-.5)*(p.type==='farm'?26:5));
    if(p.type==='city'||p.type==='market'){h.v=.65+R()*.3;h.yard=R()>.4;h.shop=R()>.5;}
    if(p.type==='steppe'||p.type==='quarry')h.v=R()*.3;
  }
  if(p.type==='city'||p.type==='market')for(let x=580;x<1560;x+=135)L.houses.push({x,y:1050,v:.7+R()*.25,yard:p.type==='city',shop:true});
  if(p.type==='farm')L.trees.push(...Array.from({length:5},(_,i)=>({x:1040+i*140,y:360,v:i%4})));
  for(const s of L.stalls){s.x+=Math.round((R()-.5)*20);s.y+=Math.round((R()-.5)*10);}
};}
cvilStatic8=function(add,s,tier){
  const p=settlementProfile(CVIL.id),fort=p.type==='fort'||p.type==='city';
  if(fort){
    for(let x=96;x<VWW;x+=192)add(30,()=>sprProp('vgate8',x,34,1,1));
    for(let y=110;y<VWH-40;y+=98){add(y,()=>sprProp('vgate8',10,y,2,1));add(y,()=>sprProp('vgate8',VWW-10,y,2,1));}
    for(let x=96;x<VWW;x+=192)if(Math.abs(x-900)>=150)add(VWH-8,()=>sprProp('vgate8',x,VWH-6,1,1));
    add(VWH-4,()=>sprProp('vgate8',900,VWH-4,0,1));
    for(const x of [85,1710])add(740,()=>sprProp('tower',x,740,0,1.4));
  } else {
    for(let x=70;x<1700;x+=190)if(Math.abs(x-900)>140)add(VWH-10,()=>sprProp('fence',x,VWH-10,0,1));
    add(VWH-5,()=>sprProp('banner',845,VWH-5,s.own==='xia'?1:0,1));
  }
  add(900,()=>sprProp('vcomp8',500,902,p.type==='city'?0:1,.8));
  if(p.type==='steppe')for(let i=0;i<3;i++)add(280+i*30,()=>sprProp('yurt',1450+i*95,280+i*30,0,1));
  if(p.type==='quarry'){add(810,()=>sprProp('forge',1700,810,0,1.2));for(let i=0;i<5;i++)add(1020,()=>sprProp('rock',1460+i*55,1020,i%2,1.5));}
  if(p.type==='crossing')for(let i=0;i<7;i++)add(340,()=>sprProp('stk8',1270+i*60,340,9,.9));
  if(p.type==='market')for(let i=0;i<3;i++)add(720,()=>sprProp('clutter',700+i*130,720,i%2?2:3,1.1));
  add(600,()=>sprProp('vgate8',1240,600,4,.72));
};
{const old=terrPanel;terrPanel=function(id){const p=old(id),profile=settlementProfile(id);const d=document.createElement('div');d.className='wk';d.innerHTML=`<b>${Tz(profile.zh,profile.en)}</b><br><span class="tip">${Tz('要地：','Key districts: ')}${profile.names.map(n=>Tz(...n)).join(' · ')}</span>`;p.appendChild(d);return p;};}

function battlefieldHUD(){
  let d=$('battleObjectiveCard');
  if(MODE!=='battle'||!B?.frontier){if(d)d.remove();return;}
  if(!d){d=document.createElement('div');d.id='battleObjectiveCard';document.body.appendChild(d);}
  const F=B.frontier,key=B.skirm.terr+'|'+F.mission+'|'+LANG+'|'+F.points.map(p=>p.captured+':'+Math.floor(p.held)+':'+p.contested).join('|')+'|'+Math.floor(F.elapsed)+'|'+Math.round(B.key?.hp||0);
  if(d.dataset.key===key)return;d.dataset.key=key;
  d.innerHTML=`<div class="campaign-eyebrow">${Tz(F.profile.zh,F.profile.en)} · ${Tz(...(F.mission==='raid'?['辎重突袭','SUPPLY RAID']:F.mission==='defend'?['防御战','HOLD THE LINE']:['要地争夺','DISTRICT ASSAULT']))}</div><strong>${tName(B.skirm.terr)}</strong><div class="objective-summary">${Tz(B.skirm.hud.goal.zh,B.skirm.hud.goal.en)}</div>`;
  if(F.mission==='defend')d.insertAdjacentHTML('beforeend',`<div class="objective-track"><i style="width:${100*F.elapsed/F.defendTime}%"></i></div>`);
  else d.insertAdjacentHTML('beforeend',`<div class="objective-rows">${F.points.map(p=>`<div class="objective-row ${p.captured?'done':p.contested?'contested':''}"><span>${p.captured?'✓ ':''}${Tz(...p.name)}</span><div class="objective-track"><i style="width:${100*p.held/p.need}%"></i></div></div>`).join('')}</div>`);
}
{const old=drawHUD;drawHUD=function(){old();battlefieldHUD();};}
{const old=loop;loop=function(now){battlefieldHUD();return old(now);};}
