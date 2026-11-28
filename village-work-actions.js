'use strict';
// Physical presentation of work. These buffers never own campaign inventory.
function townWorkBuffers(scene,r){scene.workBuffers=scene.workBuffers||new Map();if(!scene.workBuffers.has(r.k))scene.workBuffers.set(r.k,{input:{},bench:{},output:{}});return scene.workBuffers.get(r.k);}
function townToolPoint(r){const a=songBuildingPlacement(r);return a?{x:a.x-a.w*.23,y:a.y-23}:{x:r.x-30,y:r.y-12};}
function townToolKind(act){return {hammer:'hammer',tend:'tongs',weave:'needle',count:'brush',stir:'ladle',pour:'ladle',lift:'basket',stack:'basket',push:'shovel'}[act]||'hammer';}
function townWorkGoal(p,point,stage,dt,delay=.45){const a=p._activity;p._work.x=point.x;p._work.y=point.y;p._work.busy=['takeTool','returnTool','takeInput','placeInput','takeOutput','placeOutput'].includes(stage);p._work.act=p._work.busy?'lift':p._work.act;if(a.stage!==stage){a.stage=stage;a.elapsed=0;}if(Math.hypot(p.x-point.x,p.y-point.y)>17){a.elapsed=0;return false;}a.elapsed+=dt;return a.elapsed>=delay;}
function townConfigureWork(scene,p,r,work,busy,index){
 const dt=scene.workDt||0,a=p._activity||(p._activity={stage:'idle',elapsed:0,cargo:null}),cycle=[...(scene.production?.values()||[])].find(c=>c.plan.r.k===r.k),buffers=townWorkBuffers(scene,r),station={x:work.x,y:work.y},rack=townToolPoint(r),kind=work.tool||townToolKind(work.act);
 a.cycle=cycle;a.owner=r.k;work.tool=kind;
 if(p.resident.tool&&(p.resident.tool.owner!==r.k||p.resident.tool.kind!==kind||!busy)){
  const old=scene.byKey[p.resident.tool.owner],goal=old?.built?townToolPoint(old):p.home?.door||rack;
  if(townWorkGoal(p,goal,'returnTool',dt)){p.resident.tool=null;a.stage='idle';a.elapsed=0;}return;
 }
 if(!busy){a.stage='idle';return;}
 if(!p.resident.tool){if(townWorkGoal(p,rack,'takeTool',dt)){p.resident.tool={owner:r.k,slot:index,kind};a.stage='idle';a.elapsed=0;}return;}
 if(cycle?.state==='finished'){
  const item=cycle.finishedItems?.find(item=>!item.placed);if(!item){cycle.readyToDispatch=true;work.busy=false;return;}
  if(!a.cargo){if(townWorkGoal(p,station,'takeOutput',dt)){a.cargo={k:item.k,n:item.n,kind:'output'};a.stage='idle';a.elapsed=0;}return;}
  if(townWorkGoal(p,songBuildingPoint(r,'output'),'placeOutput',dt)){buffers.output[item.k]=item.n;item.placed=true;a.cargo=null;a.stage='idle';a.elapsed=0;if(cycle.finishedItems.every(item=>item.placed))cycle.readyToDispatch=true;}return;
 }
 if(cycle&&['input','work'].includes(cycle.state)){
  if(a.cargo){if(townWorkGoal(p,station,'placeInput',dt)){buffers.bench[a.cargo.k]=(buffers.bench[a.cargo.k]||0)+a.cargo.n;a.cargo=null;a.stage='idle';a.elapsed=0;}return;}
  const item=Object.entries(buffers.input).find(([,n])=>n>0);if(item){if(townWorkGoal(p,songBuildingPoint(r,'input'),'takeInput',dt)){a.cargo={k:item[0],n:item[1],kind:'input'};buffers.input[item[0]]=0;a.stage='idle';a.elapsed=0;}return;}
 }
 p._work.x=station.x;p._work.y=station.y;const reached=Math.hypot(p.x-station.x,p.y-station.y)<18;
 a.stage=reached?'work':'walkToWork';work.busy=reached&&(!cycle||cycle.state==='work');
}
function townWorkerCanWork(scene,cycle){if(!scene.residentRoll)return true;const p=scene.staffAssignments.get(cycle.plan.r.k+':0');return !!p&&p._activity?.stage==='work'&&!p._activity.cargo&&!Object.values(townWorkBuffers(scene,cycle.plan.r).input).some(n=>n>0);}
function townBeginFinished(scene,cycle){
 if(!scene.residentRoll){townOutput(scene,cycle);return;}
 const b=townWorkBuffers(scene,cycle.plan.r);b.bench={};cycle.state='finished';cycle.readyToDispatch=false;cycle.finishedItems=Object.entries(cycle.plan.output).filter(([,n])=>n>0).map(([k,n])=>({k,n:Math.min(50,Math.max(1,Math.round(n))),placed:false}));
 if(!cycle.finishedItems.length){cycle.state='rest';cycle.timer=18;}
}
function townDrawTool(g,kind,x,y,phase=0,held=false){
 g.save();g.translate(x,y);if(held)g.rotate(Math.sin(phase)*.25);g.strokeStyle='#6b482c';g.lineWidth=1.8;g.lineCap='round';
 if(kind==='basket'){g.fillStyle='#9e7c48';g.strokeStyle='#4d3926';g.beginPath();g.ellipse(0,-4,5,4,0,0,TAU);g.fill();g.stroke();g.beginPath();g.arc(0,-6,4,Math.PI,0);g.stroke();}
 else{g.beginPath();g.moveTo(0,2);g.lineTo(0,-16);g.stroke();g.strokeStyle='#434b49';g.lineWidth=2.2;g.beginPath();
  if(kind==='sickle'){g.moveTo(0,-16);g.quadraticCurveTo(9,-23,9,-13);g.quadraticCurveTo(5,-17,0,-13);}
  else if(kind==='hoe'||kind==='hammer'){g.moveTo(-5,-15);g.lineTo(6,-15);}
  else if(kind==='shovel'){g.moveTo(-4,-16);g.lineTo(0,-23);g.lineTo(4,-16);g.closePath();}
  else if(kind==='ladle'){g.arc(0,-19,3,0,TAU);}
  else if(kind==='tongs'){g.moveTo(-3,-18);g.lineTo(2,0);g.moveTo(3,-18);g.lineTo(-2,0);}
  else{g.moveTo(0,-16);g.lineTo(0,-21);}g.stroke();}
 g.restore();
}
function townDrawWorkerCargo(g,p,t){
 const a=p._activity,hand={x:p.x+Math.cos(p.f||0)*7,y:p.y-9+Math.sin(p.f||0)*2};
 if(a?.cargo)songGoods(g,a.cargo.k,hand.x,hand.y,.32,EQ.includes(a.cargo.k));
 else if(p.resident.tool&&(a?.stage!=='work'||p._work?.field!=null))townDrawTool(g,p.resident.tool.kind,hand.x,hand.y,p.ph*TAU,true);
}
function townDrawWorkBuffers(add,g,scene){
 for(const r of scene.records.filter(r=>r.built||r.construction)){
  const b=scene.workBuffers?.get(r.k);if(b){for(const [slot,point]of [['input',songBuildingPoint(r,'input')],['bench',songBuildingStations(r)[0]||r.door],['output',songBuildingPoint(r,'output')]]){
   const items=Object.entries(b[slot]).filter(([,n])=>n>0);if(items.length)add(point.y-.5,()=>items.forEach(([k],i)=>songGoods(g,k,point.x+i%2*10,point.y-Math.floor(i/2)*9,.42,EQ.includes(k))));
  }}
  const assigned=[...(scene.staffAssignments?.entries()||[])].filter(([key])=>key.startsWith(r.k+':'));if(!assigned.length)continue;
  const rack=townToolPoint(r);add(rack.y,()=>{g.strokeStyle='#6c5033';g.lineWidth=2;g.beginPath();g.moveTo(rack.x-7,rack.y+2);g.lineTo(rack.x-7,rack.y-17);g.lineTo(rack.x+16,rack.y-17);g.lineTo(rack.x+16,rack.y+2);g.stroke();for(const [i,[,p]]of assigned.slice(0,3).entries())if(p.resident.tool?.owner!==r.k)townDrawTool(g,p._work?.tool||townToolKind(p._work?.act),rack.x+i*8,rack.y-1);});
 }
}

// One year of representative crop patches. Seasonal progression is saved, not
// a repeated harvest loop, and the campaign remains the only grain owner.
function townCropPatch(scene,index){const roll=scene.residentRoll;if(!roll)return null;const month=campaignMonth()-1,year=Math.floor(month/12),m=month%12+1;if(!roll.crops||roll.crops.year!==year)roll.crops={year,patches:{}};const patch=roll.crops.patches[index]||(roll.crops.patches[index]={planted:0,harvested:0,elapsed:0,bundles:[]});
 if(m>=6)patch.planted=1;if(m>=4&&m<=5)patch.planted=Math.max(patch.planted,(m-3)/3);if(m>=10&&m<=11)patch.harvested=Math.max(patch.harvested,(m-9)/3);if(m===12)patch.harvested=1;return patch;
}
function townFieldPoint(field,row,side){const u=side?.78:.22,v=(row+.5)/6,A={x:.07+.74*u+.12*v,y:.24-.08*u+.68*v};return {x:field.x-80+A.x*160,y:field.y-106+A.y*106};}
function townFarmStep(scene,s,t,dt){
 if(!scene.residentRoll||!scene.fields.length)return;const farm=scene.byKey['dev:farm'],production=prodBreak(scene.id).rows.find(row=>row.k==='farm'&&row.amt>0);if(!farm?.built||!production)return;
 const season=townWorkSeason();scene.fieldQueued=scene.fieldQueued||new Set();
 for(const [i,f]of scene.fields.entries()){
  const patch=townCropPatch(scene,i);f.patch=patch;for(const bundle of patch.bundles.filter(b=>!b.delivered)){const token=i+':'+bundle.row;if(!scene.fieldQueued.has(token)){const from=townFieldPoint(f,bundle.row,1);const j=townJob(scene,{kind:'harvest',k:'grain',n:bundle.n,from,to:logvSpot('grain'),pick:()=>bundle.inTransit=true,done:()=>{bundle.delivered=true;bundle.inTransit=false;}});if(j)scene.fieldQueued.add(token);}}
  if(i>=2)continue;const harvest=season===2,plant=season===0,progress=harvest?patch.harvested:patch.planted,active=(harvest||plant)&&progress<1,row=Math.min(5,Math.floor(progress*6)),side=Math.floor(progress*12)%2,goal=active?townFieldPoint(f,row,side):{x:f.x,y:f.y+14},tool=harvest?'sickle':season===1?'ladle':'hoe';
  townStaff(()=>{},ctx,scene,farm,harvest?'weave':plant||season===1?'pour':'hammer',active||season===1,t,i,{...goal,tool,field:i});
  const p=scene.staffAssignments.get(farm.k+':'+i);if(!active||!p||p._activity?.stage!=='work'||Math.hypot(p.x-goal.x,p.y-goal.y)>18)continue;
  patch.elapsed+=dt;if(patch.elapsed<1.4)continue;patch.elapsed=0;const next=Math.min(1,progress+1/12+.00001);if(harvest){patch.harvested=next;if(Math.floor(next*6)>Math.floor(progress*6)){const rowDone=Math.min(5,Math.floor(next*6)-1),budget=Math.floor(production.amt/scene.fields.length),n=Math.min(50,Math.floor(budget/6)+(rowDone<budget%6?1:0));if(n>0&&!patch.bundles.some(b=>b.row===rowDone))patch.bundles.push({row:rowDone,n,delivered:false,inTransit:false});}}else patch.planted=next;
 }
}
function townPaintField(g,field,scene){
 const season=townWorkSeason(),key='field_'+['spring','summer','autumn','winter'][season],patch=field.patch||townCropPatch(scene,scene.fields.indexOf(field));if(!songBuildingReady(key)||!patch)return false;
 const x=field.x-80,y=field.y-106,point=(u,v)=>({x:x+160*(.07+.74*u+.12*v),y:y+106*(.24-.08*u+.68*v)}),poly=(a,b)=>{const P=[point(0,a),point(1,a),point(1,b),point(0,b)];g.beginPath();g.moveTo(P[0].x,P[0].y);for(const p of P.slice(1))g.lineTo(p.x,p.y);g.closePath();};
 g.save();poly(0,1);g.fillStyle=season===3?'#b7b7a7':'#a38b62';g.fill();g.strokeStyle='#796c4d';g.lineWidth=1.2;g.stroke();g.strokeStyle=season===3?'#858b7c':'#7d6a4c';g.lineWidth=.8;for(let row=0;row<=6;row++){const a=point(0,row/6),b=point(1,row/6);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();}
 const amount=season===0?patch.planted:season===2?1-patch.harvested:1;if(amount>0){g.save();poly(season===2?patch.harvested:0,season===0?patch.planted:1);g.clip();songBuildingDraw(g,key,'base',field.x,field.y,160,106);g.restore();}g.restore();
 for(const bundle of patch.bundles.filter(b=>!b.delivered&&!b.inTransit)){const p=townFieldPoint(field,bundle.row,1);songGoods(g,'grain',p.x,p.y,.5);}
 CVIL.hot.push({r:[field.x-80,field.y-106,field.x+80,field.y],t:Tz('田畝','Fields')+' · '+(season===0?Tz('播種 ','Sown ')+Math.floor(patch.planted*100)+'%':season===2?Tz('收穫 ','Harvested ')+Math.floor(patch.harvested*100)+'%':season===1?Tz('生長中','Growing'):Tz('休耕','Winter fallow'))});return true;
}
window.__townWork={buffers:townWorkBuffers,toolPoint:townToolPoint,patch:townCropPatch,farm:townFarmStep};
