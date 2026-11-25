const {chromium}=require('playwright');const {startServer,browserOptions}=require('./server.cjs');
(async()=>{const {server,url}=await startServer();let b;try{b=await chromium.launch(browserOptions());const p=await b.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto(url,{waitUntil:'load'});
 const checks=await p.evaluate(()=>{const out=[],ok=(v,m)=>{if(!v)throw Error(m);out.push(m);};coachSave({off:1,seen:{}});LOGI.on=false;__sw.cstart();CG.evQ=[];
 function build(id,type='atk'){B=null;showCamp();const q={type,terr:id,army:journeyLeader().id};if(type==='def'){const x={id:CG.xid++,from:'liulin',to:id,str:400,eta:0,paid:true};CG.xa.push(x);q.xa=x.id;}CG.queue=[q];CG.phase=3;beginSkirm(q);}
 build('majia');const gate=B.siegeDistrict.frontGate,force=B.units.length,army=JSON.stringify(CG.U);
 ok(gate.songSiege&&!passable(0,gate.tx+1,gate.ty)&&passable(1,gate.tx+1,gate.ty),'attacking troops cannot walk through a closed defending gate');
 tacticalDeploy('left');const own=B.units.filter(u=>u.team===0&&selectable(u));let min=Infinity;for(let i=0;i<own.length;i++)for(let j=i+1;j<own.length;j++)min=Math.min(min,Math.hypot(own[i].x-own[j].x,own[i].y-own[j].y));ok(min>=29,'infantry, archers, cavalry and officers deploy in separated ranks: '+min);
 ok(B.units.length===force&&JSON.stringify(CG.U)===army,'formation changes keep the same tactical and campaign force');
 const slots=battleRankSlots(40,500,1500,-Math.PI/2);ok(slots.length===40&&new Set(slots.map(p=>p.x+','+p.y)).size===40,'movement orders provide a distinct standing position for every selected soldier');
 const u=own.find(u=>u.kind==='troop'&&!u.def.range);u.x=gate.x;u.y=(gate.ty+gate.h)*TS+20;u.vx=u.vy=0;const hp=gate.hp;ok(siegeOrder([u],gate),'a player can explicitly attack the gate');for(let i=0;i<3;i++)siegeStep(u,.6);ok(gate.hp<hp,'actual infantry attacks damage the gate');
 damageStruct(gate,gate.hp+1);ok(gate.dead&&passable(0,gate.tx+1,gate.ty),'breaking the gate opens a physical route');siegeStep(u,0);ok(u.ord.type==='hold','soldiers stop targeting a destroyed structure');
 build('qinghe','def');const friendly=B.siegeDistrict.frontGate;ok(passable(0,friendly.tx+1,friendly.ty)&&passable(2,friendly.tx+1,friendly.ty)&&!passable(1,friendly.tx+1,friendly.ty),'own soldiers and civilians can pass their gate while enemies must breach or flank');
 build('tiandu');ok(!B.siegeDistrict,'pasture encampments retain their own architecture');return out;});
 if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({checks,errors},null,2));
 }finally{if(b)await b.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
