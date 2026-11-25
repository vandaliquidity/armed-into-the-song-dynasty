import {TownModels,TownActors,T,S} from './village-3d-models.mjs';
import {OrbitControls} from './assets/vendor/three/addons/controls/OrbitControls.js';

// A presentation of the existing town scene. Economy, travel and saves retain their owners.
export class Village3D {
 constructor(){
  this.renderer=new T.WebGLRenderer({antialias:true,alpha:false});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;
  this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
  this.canvas=this.renderer.domElement;this.canvas.id='village3DCanvas';this.canvas.style.cssText='position:absolute;left:0;top:0;z-index:0;touch-action:none';
  this.canvas.setAttribute('aria-label','3D village. Drag to orbit, scroll to zoom, right drag to pan.');
  cv.before(this.canvas);this.scene=new T.Scene();this.scene.background=new T.Color('#b8c9c2');this.scene.fog=new T.Fog('#b8c9c2',170,440);
  this.camera=new T.PerspectiveCamera(42,1,.3,650);this.controls=new OrbitControls(this.camera,this.canvas);
  Object.assign(this.controls,{enableDamping:true,dampingFactor:.12,minDistance:8,maxDistance:280,minPolarAngle:.22,maxPolarAngle:Math.PI*.47,maxTargetRadius:500});
  this.scene.add(new T.HemisphereLight(0xf4f0d7,0x526b52,2.1));
  this.sun=new T.DirectionalLight(0xffedcc,3.1);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);this.sun.shadow.bias=-.0003;this.sun.shadow.normalBias=.06;
  Object.assign(this.sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:1,far:220});this.scene.add(this.sun,this.sun.target);
  this.actorRoot=new T.Group();this.scene.add(this.actorRoot);this.actors=new TownActors(this.actorRoot);
  this.roofs=true;this.clock=0;this.lastFocus='';this.ray=new T.Raycaster();this.pointer=new T.Vector2(3,3);this.cargoPools=new Map();this.cargoMatrix=new T.Matrix4();
  this.canvas.addEventListener('pointermove',e=>{const b=this.canvas.getBoundingClientRect();this.pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);});
  this.canvas.addEventListener('pointerleave',()=>this.pointer.set(3,3));
  this.canvas.addEventListener('dblclick',()=>{if(this.hover)this.focus(this.hover.x,this.hover.y,35);});
 }
 async load(){await this.actors.load();}
 reset(sc){const mobile=mobNarrow();this.controls.target.set(sc.gate.x*S+(mobile?0:7),0,sc.gate.y*S-(mobile?8:12));this.camera.position.copy(this.controls.target).add(new T.Vector3(mobile?8:29,mobile?42:38,mobile?58:48));this.controls.update();}
 focus(x,y,distance=40){const offset=this.camera.position.clone().sub(this.controls.target).normalize().multiplyScalar(distance);this.controls.target.set(x*S,0,y*S);this.camera.position.copy(this.controls.target).add(offset);this.controls.update();}
 whole(sc){this.controls.target.set(sc.width*S/2,0,sc.height*S/2);this.camera.position.copy(this.controls.target).add(new T.Vector3(0,sc.width*S*.66,sc.width*S*.78));this.controls.update();}
 build(sc,s){
  if(this.models){this.scene.remove(this.staticRoot);this.models.dispose();this.ground.geometry.dispose();this.ground.material.map.dispose();this.ground.material.dispose();}
  this.staticRoot=new T.Group();this.scene.add(this.staticRoot);this.models=new TownModels(this.staticRoot);const m=this.models;
  const texture=new T.CanvasTexture(townGround(sc));texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());
  this.ground=new T.Mesh(new T.PlaneGeometry(sc.width*S,sc.height*S),new T.MeshStandardMaterial({map:texture,roughness:1}));this.ground.rotation.x=-Math.PI/2;this.ground.position.set(sc.width*S/2,-.025,sc.height*S/2);this.ground.receiveShadow=true;this.staticRoot.add(this.ground);
  for(const r of sc.records)m.building(r,s);
  const quality=s.bld.wall||0,height=(34+Math.min(3,quality)*18)*S;
  for(let i=0;i<sc.streets.polygon.length;i++){const a=sc.streets.polygon[i],b=sc.streets.polygon[(i+1)%sc.streets.polygon.length],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/8);let begin=null;
   for(let j=0;j<=n;j++){const p=[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n],main=Math.abs(p[1]-sc.gate.y)<18&&Math.abs(p[0]-sc.gate.x)<(quality?140:120),north=Math.abs(p[1]-100)<18&&Math.abs(p[0]-sc.gate.x)<56,open=main||north||townGateOpening(sc,...p);if(open||j===n){if(begin)m.wall(begin,p,height,quality);begin=null;}else if(!begin)begin=p;}
  }
  m.gate(sc.gate.x*S,sc.gate.y*S,CT[sc.id].zh,villageGateQuality(sc.id));m.gate(sc.gate.x*S,5,'',0,true);
  for(const tr of sc.trees)m.tree(tr.x*S,tr.y*S,tr.v);
  for(const f of sc.fields){m.box(f.x*S,.015,(f.y-35)*S,5.2,.06,3.8,'earth');for(let row=0;row<5;row++)for(let col=0;col<10;col++){const x=(f.x-47+col*10)*S,z=(f.y-65+row*15)*S;m.cylinder(x,.25,z,.025,.5,'green');m.ball(x,.48,z,.06,.16,.06,'leaf');}}
  m.flush();this.setRoofs(this.roofs);this.key=sc.key;this.goodsKey='';
 }
 setRoofs(value){this.roofs=value;for(const mesh of this.models?.roofMeshes||[])mesh.visible=value;}
 goods(sc,s){
  const signature=JSON.stringify([s.st,s.eq,sc.delivered,CVIL.id===HOME?CAMP.res.silver:s.stock?.silver]);if(signature===this.goodsKey)return;this.goodsKey=signature;
  if(this.goodsModel){this.scene.remove(this.goodsRoot);this.goodsModel.dispose();}
  this.goodsRoot=new T.Group();this.scene.add(this.goodsRoot);const m=this.goodsModel=new TownModels(this.goodsRoot);
  for(const r of sc.stock)r.goods.filter(k=>s.st[k]>0).forEach((k,i)=>{for(let j=0;j<Math.min(5,Math.ceil(s.st[k]/100));j++)m.goods(k,(r.x-90+i%4*58)*S,(r.y-65+Math.floor(i/4)*30)*S,j);});
  const arm=sc.byKey.armoury;EQ.filter(k=>s.eq[k]>0).slice(0,12).forEach((k,i)=>m.goods(k,(arm.x-90+i%5*42)*S,(arm.y-40+Math.floor(i/5)*38)*S));
  for(const r of sc.records.filter(r=>r.construction)){const d=sc.delivered[r.construction.token]||{};Object.entries(d).filter(([,n])=>n>0).forEach(([k],i)=>m.goods(k,(r.x-r.w/2+25+i%4*30)*S,(r.y+12+Math.floor(i/4)*20)*S));}
  const tr=sc.byKey.treasury;if(tr.built){for(const [kind,side,amount]of [['gold',-1,s.st.gold||0],['silver',1,CVIL.id===HOME?CAMP.res.silver:s.stock?.silver||0]])for(let i=0;i<Math.min(24,Math.ceil(amount/(kind==='gold'?5:50)));i++)m.add(m.ballGeo,kind,[tr.x*S+side*tr.w*.82*S*.22+(i%4-1.5)*.38,.88+Math.floor(i/12)*.15,tr.y*S-2.3+Math.floor(i/4)%3*.4],[.23,.08,.12]);}
  m.flush();
 }
 people(sc,s,t){
  const a=this.actors;a.begin();for(const pool of this.cargoPools.values())pool.count=0;const roles={vil:'man',villager:'man',vil_b:'woman',vil_m:'man',vil_f:'woman',vil_k:'child',porter:'porter',merchant:'merchant',elder:'elder'};
  for(const p of sc.people){const prev=p._3pos,walk=prev&&Math.hypot(p.x-prev[0],p.y-prev[1])>.001;p._3pos=[p.x,p.y];a.add(roles[p.spr]||'man',p.x,p.y,p.f,p.ph,walk);}
  for(const j of sc.jobs){const carry=['carry','unload'].includes(j.state);a.add('porter',j.x,j.y,j.face,j.phase,!j.wait,false,carry);if(carry)this.cargo(j.k,j.x,j.y,j.face);}
  for(const h of sc.horses||[])a.add('horse',h.x,h.y,h.f,h.phase,h.wait<=0);
  for(const c of sc.animals)a.add('chicken',c.x,c.y,c.f,c.ph,false);
  for(const cycle of sc.production.values())if(cycle.state==='work'){const r=cycle.plan.r;a.add('man',r.x,r.y-8,-Math.PI/2,t*.7,false,true);}
  const tr=sc.byKey.treasury;if(tr.built)a.add('merchant',tr.x+25,tr.y-8,-Math.PI/2,t*.4,false,true);
  for(const r of sc.records.filter(r=>r.construction))a.add('man',r.x+35,r.y-8,-Math.PI/2,t*.8,false,true);
  const yard=sc.byKey.yard,units=[...unitsAt(sc.id),...CG.armies.filter(b=>b.loc===sc.id).flatMap(armyUnits)],seen=new Set(),figures=[];
  for(const u of units)if(!seen.has(u.id)&&u.men>0){seen.add(u.id);for(let i=0;i<Math.min(2,Math.ceil(u.men/100));i++)figures.push({type:u.type});}
  if(yard.built)for(const q of s.trn||[])figures.push({type:q.type,training:true});
  figures.slice(0,28).forEach((f,i)=>{const name=UNITS[UT[f.type]?.eng]?.spr||'',role=/cav|horse/.test(name)?'cavalry-song':/bow|cross/.test(name)?'archer':'guard';a.add(role,yard.x-126+i%7*42,yard.y-55+Math.floor(i/7)*34,-Math.PI/2,t*.6,!!f.training,!!f.training);});
  const v=LOGV[sc.id];if(v){for(const c of v.carts||[]){a.add('oxcart',c.x,c.y,c.dir>0?0:Math.PI,t*.45,!!c.go||!c.arr);if(c.load>0)this.cargo('grain',c.x,c.y,c.dir>0?0:Math.PI,.65);}for(const c of v.car||[]){a.add('porter',c.x,c.y,c.f||0,c.ph||0,!!c.mv,false,!!c.hold);if(c.hold)this.cargo(c.hold.k,c.x,c.y,c.f||0);}}
  if(hospLv(sc.id)>0){const hospital=sc.byKey.hospital;for(const [i,p]of vlWard(sc.id).pts.entries()){const slot=p.slot>=0?p.slot:i,x=hospital.x+(slot%2?54:-54),y=hospital.y-40-Math.floor(slot/2)*46;a.add('man',x,y,0,0,false,false,false,{height:.85,lying:true});}a.add('woman',hospital.x,hospital.y-10,-Math.PI/2,t*.5,false,true);}
  if(EDICT){const progress=Math.min(1,EDICT.t/ED_ARR);for(let i=0;i<5;i++)a.add(i===0?'merchant':'guard',sc.gate.x+(i%2?24:-24),sc.gate.y+70-progress*170+Math.floor(i/2)*25,-Math.PI/2,t*.5,progress<1);}
  a.end();for(const pool of this.cargoPools.values())for(const mesh of pool.meshes){mesh.count=Math.min(pool.count,100);mesh.instanceMatrix.needsUpdate=true;}
 }
 cargo(kind,x,y,face,height=.9){
  if(kind==='horse')return;let pool=this.cargoPools.get(kind);
  if(!pool){const root=new T.Group(),model=new TownModels(root);model.goods(kind,0,0);model.flush();pool={count:0,meshes:[],model};for(const source of root.children){const mesh=new T.InstancedMesh(source.geometry,source.material,100);mesh.castShadow=true;mesh.frustumCulled=false;this.scene.add(mesh);pool.meshes.push(mesh);}this.cargoPools.set(kind,pool);}
  const index=pool.count++;if(index>=100)return;this.cargoMatrix.makeRotationY(Math.PI/2-face);this.cargoMatrix.setPosition(x*S+Math.cos(face)*.35,height,y*S+Math.sin(face)*.35);for(const mesh of pool.meshes)mesh.setMatrixAt(index,this.cargoMatrix);
 }
 frame(dt){
  const sc=townScene(),s=CG.T[CVIL.id],width=mobNarrow()?VW:VW-360;
  this.canvas.style.display='block';if(this.width!==width||this.height!==VH){const mobile=mobNarrow();if(this.mobile!==undefined&&this.mobile!==mobile)this.reset(sc);this.mobile=mobile;this.width=width;this.height=VH;this.renderer.setSize(width,VH);this.camera.aspect=width/VH;this.camera.updateProjectionMatrix();}
  if(this.id!==sc.id){this.id=sc.id;this.reset(sc);this.lastFocus='';}if(this.key!==sc.key)this.build(sc,s);
  const focus=[CVIL.fx,CVIL.fy,CVIL.z].join(':');if(this.lastFocus&&focus!==this.lastFocus){if(CVIL.z<=1.001)this.whole(sc);else this.focus(CVIL.fx,CVIL.fy,Math.max(20,65/CVIL.z));}this.lastFocus=focus;
  CVIL.t+=dt;CVIL._vdt=dt;CVIL.hot=[];CVIL.lay={v8:true,houses:sc.housing,trees:[],stalls:[],alleys:[]};CVIL.peo=sc.people;
  const noDraw=()=>{};townEconomy(noDraw,ctx,sc,s,CVIL.t,dt);townLife(noDraw,ctx,sc,s,CVIL.t,dt);if(LOGV[sc.id])logvStep(sc.id,dt);edictDraw(noDraw,ctx,CVIL.t,dt);
  this.clock+=dt;if(this.clock>.5||!this.goodsKey){this.goods(sc,s);this.clock=0;}this.people(sc,s,CVIL.t);this.controls.update();
  const target=this.controls.target;this.sun.target.position.copy(target);this.sun.position.copy(target).add(new T.Vector3(-40,85,35));this.renderer.render(this.scene,this.camera);
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,VW,VH);ctx.fillStyle='#21362de8';ctx.fillRect(14,14,Math.min(410,width-28),67);ctx.strokeStyle='#bba36d';ctx.strokeRect(14,14,Math.min(410,width-28),67);txt(tName(sc.id),28,43,23,'#ecd8a4','left','bold ');txt(Tz(...sc.identity.name)+' · '+s.pop+' · '+dateTxt(CG.turn),28,67,12,'#d3d8bd','left');
  this.ray.setFromCamera(this.pointer,this.camera);this.hover=null;let nearest=Infinity;for(const {r,box}of this.models.pick){const hit=this.ray.ray.intersectBox(box,new T.Vector3());if(hit&&hit.distanceTo(this.camera.position)<nearest){nearest=hit.distanceTo(this.camera.position);this.hover=r;}}
  if(this.hover){const r=this.hover,label=r.biz?Tz(...DY_BUSINESSES[r.biz].name):r.dev?Tz(DEV[r.dev].zh,DEV[r.dev].en):r.model==='treasury'?Tz('大宋官库','Song treasury'):r.house?Tz('民居','Home'):r.k;ctx.fillStyle='#21362de8';ctx.fillRect(14,VH-44,Math.min(width-28,350),30);txt(label,25,VH-24,13,'#ecd8a4','left');}
  edictOverlay(ctx,CVIL.t);
 }
 hide(){this.canvas.style.display='none';}
}
