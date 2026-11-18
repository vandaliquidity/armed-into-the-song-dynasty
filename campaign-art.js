'use strict';

// Pure presentation: geography, ownership and simulation stay in campaign code.
const MAP_INK={qh:'#bd8d32',song:'#a34e3d',xia:'#586777',jin:'#79608d',free:'#81836b'};
let MAP_GROUND=null,MAP_LABELS=new Map();
function drawCampaignGround(g){
  if(!MAP_GROUND){
    const c=mkCanvas(CMW,CMH),q=c.getContext('2d'),R=srand(214021);
    const wash=(x,y,r,col)=>{const a=q.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,col);a.addColorStop(1,'rgba(100,130,100,0)');q.fillStyle=a;q.fillRect(x-r,y-r,r*2,r*2);};
    for(let i=0;i<160;i++){const x=R()*CMW,y=R()*CMH;wash(x,y,100+R()*290,y<CMH*.34?'rgba(182,153,99,.20)':'rgba(112,142,102,.21)');}
    for(const t of CL.terr){const p=tPos(t.id);if(t.trait==='farm')wash(p.x,p.y,170,'rgba(136,158,94,.20)');}
    // Woodland clusters follow the mountains, leaving settlement centres clear.
    for(const m of campArt().pk){const n=m.lo?3:9;for(let i=0;i<n;i++){
      const x=m.x+(R()-.5)*140,y=m.y+30+R()*55,h=6+R()*10;
      if(CL.terr.some(t=>{const p=tPos(t.id);return Math.hypot(x-p.x,y-p.y)<48;}))continue;
      q.fillStyle='rgba(53,83,65,.12)';q.beginPath();q.ellipse(x+3,y+3,h*.8,h*.25,0,0,TAU);q.fill();
      q.strokeStyle='#807b55';q.lineWidth=.9;q.beginPath();q.moveTo(x,y);q.lineTo(x,y-h*.9);q.stroke();
      q.fillStyle=['#75856a','#8e9b78','#637d67'][i%3];q.beginPath();q.moveTo(x,y-h*1.3);q.lineTo(x-h*.45,y-h*.25);q.lineTo(x+h*.45,y-h*.25);q.closePath();q.fill();
      q.fillStyle='rgba(207,213,157,.35)';q.beginPath();q.moveTo(x,y-h*1.3);q.lineTo(x-h*.45,y-h*.25);q.lineTo(x-1,y-h*.4);q.fill();
    }}MAP_GROUND=c;
  }
  g.drawImage(MAP_GROUND,0,0,CMW,CMH);
}
function drawCampaignRivers(g){
  g.save();g.lineCap='round';g.lineJoin='round';
  for(const r of RIVERS){const pts=r.pts.map(p=>cwp(p[0],p[1]));g.beginPath();g.moveTo(pts[0].x,pts[0].y);
    for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);
    g.strokeStyle='rgba(112,138,112,.25)';g.lineWidth=r.w*3.2+9;g.stroke();
    g.strokeStyle='#597e81';g.lineWidth=r.w*2.8+2;g.stroke();
    g.strokeStyle='#8eb2ab';g.lineWidth=r.w*2.1;g.stroke();
    g.strokeStyle='rgba(229,235,199,.48)';g.lineWidth=Math.max(.7,r.w*.23);g.setLineDash([7,33]);g.lineDashOffset=-CTIME*4;g.stroke();g.setLineDash([]);
  }g.restore();
}
// Softer mountain silhouettes, relief facets and fine contour strokes.
{const old=campArt;campArt=function(){const a=old();if(a.painted)return a;a.painted=true;
  const R=srand(92021);a.peaks=Array.from({length:5},(_,v)=>{
    const c=mkCanvas(320,240),g=c.getContext('2d');g.scale(2,2);
    for(let i=0;i<3;i++){
      const x=36+i*39,y=105,h=38+R()*51,w=27+R()*18;
      const gr=g.createLinearGradient(x,y-h,x,y+8);gr.addColorStop(0,v%2?'#7c8e7e':'#8a927c');gr.addColorStop(.55,'rgba(133,145,115,.78)');gr.addColorStop(1,'rgba(162,169,133,0)');
      g.fillStyle=gr;g.beginPath();g.moveTo(x-w,y);g.bezierCurveTo(x-w*.6,y-h*.36,x-8,y-h*.8,x,y-h);g.bezierCurveTo(x+9,y-h*.72,x+w*.5,y-h*.3,x+w,y);g.closePath();g.fill();
      g.fillStyle='rgba(239,227,183,.35)';g.beginPath();g.moveTo(x-w,y);g.lineTo(x,y-h);g.lineTo(x-4,y-h*.36);g.closePath();g.fill();
      g.strokeStyle='rgba(59,79,66,.36)';g.lineWidth=.65;
      for(let k=1;k<6;k++){g.beginPath();g.moveTo(x+1,y-h+k*h*.12);g.quadraticCurveTo(x+6+k*2,y-h*.55+k*6,x+w*k/6,y-6);g.stroke();}
      g.strokeStyle='rgba(60,78,64,.5)';g.lineWidth=.9;g.beginPath();g.moveTo(x-w*.8,y-6);g.quadraticCurveTo(x-9,y-h*.75,x,y-h);g.stroke();
    }return c;
  });return a;
};}
function mapLabelLayout(g){
  MAP_LABELS=new Map();const occupied=[],sc=iconScale();
  const rank=t=>(CSEL?.t===t.id?100:0)+(t.id===HOME?80:0)+(t.kind==='city'?50:t.kind==='town'?25:0)+(CG.T[t.id].own==='qh'?30:0);
  for(const t of [...CL.terr].sort((a,b)=>rank(b)-rank(a))){
    const p=tPos(t.id),q=c2s(p.x,p.y);if(q.x<30||q.x>VW-30||q.y<30||q.y>VH-25)continue;
    if(CC.z<.42&&rank(t)<25)continue;
    if(CC.z<.75&&t.id.includes('_district_')&&CG.T[t.id].own!=='qh'&&rank(t)<80)continue;
    if(CC.z<.6&&CG.T[t.id].own==='free'&&rank(t)<80)continue;
    const size=Math.max(10,Math.round((t.id===HOME||t.kind==='city'?13:11)*sc)),name=Tz(t.zh,t.en);g.font=`600 ${size}px "Noto Serif SC",serif`;
    const w=g.measureText(name).width+17,h=size+9;
    const state=CG.T[t.id],showMen=CC.z>1.25&&(state.own==='song'||(state.own==='xia'&&SEEN.has(t.id)));
    for(const dy of [29,43,-48,58,-63]){const r={x:q.x-w/2,y:q.y+dy*sc,w,h};
      if(r.x<48||r.x+w>VW-48||r.y<12||r.y+h>VH-20)continue;
      if(occupied.some(b=>r.x<b.x+b.w+5&&r.x+r.w>b.x-5&&r.y<b.y+b.h+3&&r.y+r.h>b.y-3))continue;
      occupied.push({...r,h:h+(showMen?13:0)});MAP_LABELS.set(t.id,{...r,size,name,dy});break;
    }
  }
}
drawLinks=function(g){
  mapLabelLayout(g);const sc=iconScale();g.save();g.lineCap='round';
  for(const [a,b] of CL.links){const f=tPos(a),t=tPos(b),s=c2s(f.x,f.y),e=c2s(t.x,t.y);
    if(Math.max(s.x,e.x)<0||Math.min(s.x,e.x)>VW||Math.max(s.y,e.y)<0||Math.min(s.y,e.y)>VH)continue;
    const trade=ROUTES.some(r=>(r.a===a&&r.b===b)||(r.b===a&&r.a===b)),mx=(s.x+e.x)/2+(s.y-e.y)*.06,my=(s.y+e.y)/2+(e.x-s.x)*.06;
    g.beginPath();g.moveTo(s.x,s.y);g.quadraticCurveTo(mx,my,e.x,e.y);
    g.strokeStyle=trade?'rgba(122,88,40,.28)':'rgba(97,91,67,.20)';g.lineWidth=(trade?5:3)*sc;g.stroke();
    g.strokeStyle=trade?'#d6ba77':'rgba(244,226,180,.68)';g.lineWidth=(trade?2.1:1.2)*sc;g.stroke();
  }g.restore();
};
function mapRoof(g,x,y,w,col){
  g.fillStyle='#d6c9a7';g.strokeStyle='#5c6255';g.lineWidth=.7;g.fillRect(x-w*.42,y-w*.25,w*.84,w*.3);g.strokeRect(x-w*.42,y-w*.25,w*.84,w*.3);
  g.fillStyle='#525647';g.fillRect(x-1.5,y-w*.13,3,w*.18);
  g.fillStyle=col;g.beginPath();g.moveTo(x-w*.63,y-w*.24);g.quadraticCurveTo(x-w*.39,y-w*.27,x,y-w*.67);g.quadraticCurveTo(x+w*.39,y-w*.27,x+w*.63,y-w*.24);g.lineTo(x,y-w*.13);g.closePath();g.fill();g.stroke();
  g.strokeStyle='rgba(227,224,193,.5)';g.beginPath();g.moveTo(x-w*.52,y-w*.27);g.lineTo(x,y-w*.56);g.lineTo(x+w*.52,y-w*.27);g.stroke();
}
drawTerr=function(g,id){
  const t=CT[id],s=CG.T[id],p=tPos(id),q=c2s(p.x,p.y),sc=iconScale();if(q.x<-90||q.x>VW+90||q.y<-90||q.y>VH+90)return;
  const seen=s.own!=='xia'||SEEN.has(id),col=MAP_INK[s.own]||MAP_INK.free,sel=CSEL?.t===id,hov=CHOV?.t===id,city=t.kind==='city',fort=['fort','pass'].includes(t.kind),town=t.kind==='town',tier=tierOf(s.prosp);
  g.save();g.translate(q.x,q.y);g.scale(sc,sc);
  const halo=g.createRadialGradient(0,4,0,0,4,city?57:36);halo.addColorStop(0,sel?'rgba(219,177,67,.4)':'rgba(78,91,64,.22)');halo.addColorStop(1,'rgba(78,91,64,0)');g.fillStyle=halo;g.fillRect(-60,-45,120,90);
  g.fillStyle='#b9ba91';g.strokeStyle='rgba(97,107,74,.28)';g.lineWidth=.8;g.beginPath();g.ellipse(0,7,city?31:town?24:19,city?15:11,0,0,TAU);g.fill();g.stroke();
  const roof=s.own==='xia'?'#777b75':s.own==='qh'?'#536d6b':'#647a77';
  if(city||fort||town){
    const w=city?50:fort?34:36,h=city?22:16;
    // Raised side walls and inset courtyard with a southern gate.
    g.fillStyle='#9b9f8b';g.strokeStyle='#626d60';g.lineWidth=.9;
    g.beginPath();g.moveTo(-w/2,-h/2);g.lineTo(w/2,-h/2);g.lineTo(w/2+5,h/2+4);g.lineTo(-w/2+5,h/2+4);g.closePath();g.fill();g.stroke();
    g.fillStyle='#c4c6aa';g.fillRect(-w/2,-h/2-5,w,h);g.strokeRect(-w/2,-h/2-5,w,h);
    mapRoof(g,0,-6,city?22:15,roof);if(city){mapRoof(g,-14,4,12,roof);mapRoof(g,14,4,12,roof);mapRoof(g,0,-18,16,'#92785c');}
    g.fillStyle='#a4ac96';g.fillRect(-w/2,h/2-6,w,8);g.strokeRect(-w/2,h/2-6,w,8);
    g.fillStyle='#4c5b51';g.fillRect(-3,h/2-4,6,6);
    for(const x of [-w/2,w/2]){g.fillStyle='#b9bea4';g.fillRect(x-4,h/2-11,8,11);g.strokeRect(x-4,h/2-11,8,11);mapRoof(g,x,h/2-9,11,roof);}
    if(city||fort)for(let x=-w/2+6;x<w/2-5;x+=6){g.fillStyle='#d3d1b5';g.fillRect(x,h/2-8,3,3);}
  }else if(t.kind==='camp'){
    for(const [x,y] of [[-11,3],[9,5],[0,-9]]){g.fillStyle='#e4dbc1';g.strokeStyle='#777b65';g.beginPath();g.moveTo(x-9,y);g.lineTo(x,y-13);g.lineTo(x+9,y);g.closePath();g.fill();g.stroke();g.fillStyle='#687463';g.fillRect(x-1.5,y-4,3,4);}
  }else{
    for(const [i,[x,y]] of [[-9,-4],[9,1],[-5,10],[11,-10]].entries())if(i<2+Math.min(2,tier))mapRoof(g,x,y,12+i%2*2,roof);
    g.strokeStyle='#8d9775';g.lineWidth=1;g.beginPath();g.moveTo(-19,13);g.lineTo(17,17);g.stroke();
  }
  if(sel||hov){g.strokeStyle=sel?'#caa44d':'#efe4bb';g.lineWidth=sel?2:1.2;g.beginPath();g.ellipse(0,7,city?37:29,city?21:17,0,0,TAU);g.stroke();}
  if(seen){g.strokeStyle='#6a6550';g.lineWidth=1.1;g.beginPath();g.moveTo(-22,5);g.lineTo(-22,-30);g.stroke();g.fillStyle=col;g.fillRect(-22,-30,13,15);g.strokeStyle='#d9cca3';g.strokeRect(-22,-30,13,15);g.font='bold 10px serif';g.textAlign='center';g.fillStyle='#fff0cd';g.fillText(CL.fac[s.own].ch,-15.5,-19);}
  if(s.build){g.fillStyle='#d4ac53';g.fillRect(18,-12,5,5);}
  if(CC.z>.8&&s.own==='song'&&dynastyNearest(id,3)){
    const influence=clamp((CG.dynasty?.influence[id]||0)/100,0,1);
    g.strokeStyle='#647f6a';g.lineWidth=2;g.beginPath();g.ellipse(0,7,31,18,0,0,TAU);g.stroke();
    if(influence){g.strokeStyle='#dec477';g.beginPath();g.ellipse(0,7,31,18,0,-Math.PI/2,-Math.PI/2+TAU*influence);g.stroke();}
  }
  if(s.own==='qh'&&Object.values(s.businesses||{}).some(b=>b.level)){g.fillStyle='#d2aa50';g.beginPath();g.arc(25,12,3,0,TAU);g.fill();}
  if(s.own==='free'&&t.vacant){g.strokeStyle='#efe7c8';g.lineWidth=1.3;g.strokeRect(22,7,5,5);}
  if(s.own==='qh'&&!SUPP.has(id)){g.strokeStyle='#b56c55';g.setLineDash([3,3]);g.beginPath();g.ellipse(0,7,31,18,0,0,TAU);g.stroke();g.setLineDash([]);}
  g.restore();
  const label=MAP_LABELS.get(id);if(label){const {x,y,w,h,size,name}=label;
    g.save();if(Math.abs(label.dy)>35){g.strokeStyle='rgba(94,100,75,.4)';g.lineWidth=.7;g.beginPath();g.moveTo(q.x,q.y+12*sc);g.lineTo(x+w/2,label.dy<0?y+h:y);g.stroke();}
    g.shadowColor='rgba(46,52,37,.15)';g.shadowBlur=5;g.shadowOffsetY=2;g.fillStyle=sel?'#344c46':'rgba(246,239,214,.94)';g.beginPath();g.roundRect(x,y,w,h,3);g.fill();g.shadowBlur=0;g.shadowOffsetY=0;
    g.fillStyle=col;g.fillRect(x,y+3,2,h-6);g.font=`600 ${size}px "Noto Serif SC",serif`;g.textAlign='center';g.fillStyle=sel?'#f8e7ac':'#34463d';g.fillText(name,x+w/2,y+h-6);
    const men=s.own==='song'?s.songGarrison?.men:s.own==='xia'&&seen?s.str:0;
    if(men&&(sel||hov||CC.z>1.25)){g.font=`10px sans-serif`;g.fillStyle=col;g.fillText(Tz('驻军 ','Garrison ')+men,x+w/2,y+h+11);}
    g.restore();
  }
};
drawNodes=function(g){
  const sc=iconScale();g.save();for(const n of NODES){const s=CG.T[n.terr];if(s.own==='xia'&&!SEEN.has(n.terr))continue;const p=nodeScreen(n),selected=CSEL?.n===n.id||CHOV?.n===n.id,active=nodeOk(n);
    if(p.x<-25||p.x>VW+25||p.y<-25||p.y>VH+25)continue;
    const r=(selected?10:CC.z>1.2?7:4)*sc;g.fillStyle=active?'#e5c778':'rgba(238,233,206,.92)';g.strokeStyle=active?'#9e834c':'#89917b';g.lineWidth=selected?2:1;g.beginPath();g.moveTo(p.x,p.y-r);g.lineTo(p.x+r,p.y);g.lineTo(p.x,p.y+r);g.lineTo(p.x-r,p.y);g.closePath();g.fill();g.stroke();
    if(CC.z>1.2||selected){g.font=`${Math.round(10*sc)}px sans-serif`;g.textAlign='center';g.fillText(NODEK[n.k].ic,p.x,p.y+3*sc);}
    if(selected){g.font='12px serif';g.fillStyle='#34463d';g.textAlign='center';g.fillText(Tz(n.zh,n.en),p.x,p.y+r+14);}
  }g.restore();
};
// A displaced label is an actual settlement target, just like its model.
{const old=campPick;campPick=function(x,y){const hit=old(x,y);if(hit?.a)return hit;
  for(const [id,r] of MAP_LABELS)if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)return {t:id};
  return hit;
};}
drawFog=function(g,a){
  g.save();for(const t of CL.terr){if(SEEN.has(t.id)||CG.T[t.id].own!=='xia')continue;
    const p=tPos(t.id),q=c2s(p.x,p.y);if(q.x<-200||q.x>VW+200||q.y<-200||q.y>VH+200)continue;
    for(let i=0;i<2;i++){const dx=Math.sin(CTIME*.15+i*2.1+p.x)*26*CC.z,w=170*CC.z*(1+i*.15);g.globalAlpha=.32;g.drawImage(a.cloud,q.x-w/2+dx+(i-.5)*40*CC.z,q.y-w*.32+(i-.5)*14*CC.z,w,w*.54);}
    g.globalAlpha=1;g.fillStyle='#596d68';g.font='bold 11px serif';g.textAlign='center';g.fillText('?',q.x,q.y+5);
  }g.restore();
};
