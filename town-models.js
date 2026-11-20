'use strict';
function townModel(k,level){if(k==='arsenal'||k==='refinery')return ['forge',0,1.45];if(k==='kiln'||k==='pottery')return ['vhouse8',8,1.18];if(k==='powderworks')return ['vhouse8',9,1.18];if(k==='papermill')return ['vhouse8',4,1.18];if(k==='restaurant'&&level>=3)return ['vcomp8',0,.8];return ['vhouse8',level>=3?6:level>=2?7:k==='brewery'?8:3,1.18];}
function townShopIcon(k,level){const c=mkCanvas(500,210),[name,v]=townModel(k,level);propIcon(name,c,v);return c;}
function townJar(g,x,y,color){g.fillStyle=color;g.strokeStyle='#493b2d';g.lineWidth=1;g.beginPath();g.ellipse(x,y-5,6,9,0,0,TAU);g.fill();g.stroke();g.fillStyle='#c5ad7d';g.fillRect(x-4,y-16,8,4);}
dynastyShop=function(add,k,b,x,y){const s=CG.T[CVIL.id],t=CVIL.t,def=DY_BUSINESSES[k],active=!b.paused&&dynastyProduction(CVIL.id,k).scale>0,[model,v,scale]=townModel(k,b.level);
 add(y,()=>{const g=ctx;g.save();g.fillStyle='#3a302727';g.beginPath();g.ellipse(x+4,y+14,83,25,0,0,TAU);g.fill();sprProp(model,x,y,v,scale);
  // Timber signs, awnings, stacked goods and work fittings distinguish industries.
  const sx=x-56,sy=y-48;g.fillStyle='#453623';g.fillRect(sx-2,sy-2,116,20);g.fillStyle=def.color;g.fillRect(sx,sy,112,16);g.strokeStyle='#c5b284';g.strokeRect(sx,sy,112,16);txt(Tz(...def.name),x,sy+12,10,'#fff0c7','center','bold ');
  for(const dx of [-66,63]){g.strokeStyle='#675334';g.beginPath();g.moveTo(x+dx,y-33);g.lineTo(x+dx,y-14);g.stroke();g.fillStyle='#b94f34';g.beginPath();g.ellipse(x+dx,y-10,5,8,0,0,TAU);g.fill();}
  if(k==='brewery'||k==='beauty'||k==='pottery')for(let i=0;i<6;i++)townJar(g,x-44+i*15,y+24-i%2*3,k==='beauty'?(i%2?'#95b4a5':'#b997a5'):k==='pottery'?'#9bb6ad':'#92724d');
  if(k==='weaver')for(let i=0;i<5;i++){g.fillStyle=['#ae887b','#73938d','#c8b58b'][i%3];g.fillRect(x-38+i*16,y+14,13,12);g.strokeStyle='#635b45';g.strokeRect(x-38+i*16,y+14,13,12);}
  if(k==='kiln'||k==='pottery'){g.fillStyle='#8d6b50';g.beginPath();g.arc(x+40,y+17,15,Math.PI,0);g.lineTo(x+55,y+31);g.lineTo(x+25,y+31);g.closePath();g.fill();g.strokeStyle='#584836';g.stroke();g.fillStyle=active?'#b46e38':'#3b3d32';g.beginPath();g.arc(x+40,y+24,8,Math.PI,0);g.fill();}
  if(k==='papermill'){g.strokeStyle='#6e6147';for(const dx of[-46,36]){g.beginPath();g.moveTo(x+dx,y+14);g.lineTo(x+dx,y+36);g.stroke();}g.fillStyle='#e5dbba';g.fillRect(x-46,y+14,82,7);g.strokeRect(x-46,y+14,82,7);}
  if(k==='restaurant')for(let i=0;i<3;i++){const xx=x-55+i*55,yy=y+36;g.fillStyle='#7d6543';g.beginPath();g.ellipse(xx,yy,17,9,0,0,TAU);g.fill();g.fillStyle='#e7e1c8';for(let j=0;j<3;j++){g.beginPath();g.ellipse(xx-9+j*9,yy-2,3,2,0,0,TAU);g.fill();}sprUnit(i%2?'merchant':'villager',xx,yy+13,8,-Math.PI/2,0);}
  if(k==='arsenal'||k==='refinery'){sprUnit('song_gun',x-40,y+28,12,0,0);for(let i=0;i<5;i++){g.fillStyle=i%2?'#777d78':'#ac8c54';g.fillRect(x+5+i*9,y+17-i%2*4,14,6);g.strokeStyle='#484c43';g.strokeRect(x+5+i*9,y+17-i%2*4,14,6);}}
  if(active&&['kiln','pottery','arsenal','refinery','powderworks','restaurant'].includes(k))for(let i=0;i<3;i++){const phase=(t*.21+i*.31)%1;g.globalAlpha=(1-phase)*.27;g.fillStyle='#c5c3ac';g.beginPath();g.ellipse(x+32+Math.sin(t+i)*7,y-96-phase*45,5+phase*9,7+phase*9,0,0,TAU);g.fill();}g.globalAlpha=1;
  const goods=Object.keys(b.made||def.output).filter(q=>q!=='silver').map(q=>`${(RAWN[q]||EQN[q])[2]} ${s.st[q]||s.eq[q]||0}`).join(' · ');txt(b.paused?Tz('歇业','PAUSED'):goods||Tz('酒楼营业','DINING'),x,y+62,10,'#493c29','center','bold ');g.restore();
 });
 if(active)for(let i=0;i<Math.min(5,b.level+2);i++){const p=(t*.045+i*.23)%1,xx=x-70+p*140,yy=y+34+i%2*8;add(yy,()=>sprUnit(i%2?'porter':'villager',xx,yy,8,p<.5?0:Math.PI,frontierWalkFrame('villager',t*.6+i)));}
 CVIL.hot.push({r:[x-77,y-125,x+77,y+40],t:Tz(...def.name)+' Lv '+b.level+'\n'+(b.last||Tz('待月结','Awaiting month end'))});   // t255: box = the building, no overlap with neighbours
};
{const old=cvilStatic8;cvilStatic8=function(add,s,tier){old(add,s,tier);for(const [k,x,y]of [['weaver',690,735],['papermill',1105,735]]){const b=s.businesses?.[k];if(b?.level)dynastyShop(add,k,b,x,y);}
 for(const [k,paired,x]of [['pottery','kiln',1380],['refinery','arsenal',1690]]){const b=s.businesses?.[k];if(b?.level&&!s.businesses[paired]?.level)dynastyShop(add,k,b,x,x>1600?716:722);else if(b?.level)add(762,()=>{townJar(ctx,x+50,757,'#91aca4');txt(Tz(...DY_BUSINESSES[k].name),x,765,10,'#4a3c28','center','bold ');});}
 if(s.businesses?.garden?.level||s.businesses?.orchard?.level)for(let i=0;i<9;i++){const x=1200+i*42,y=104;add(y,()=>{if(s.businesses.orchard?.level&&i%2){sprProp('tree',x,y,0,.55);for(let j=0;j<5;j++){ctx.fillStyle='#b88254';ctx.beginPath();ctx.arc(x-18+j*9,y-40+Math.sin(j)*9,3,0,TAU);ctx.fill();}}else{ctx.fillStyle='#668054';for(let j=0;j<4;j++){ctx.beginPath();ctx.ellipse(x-15+j*10,y-6,4,7,-.3,0,TAU);ctx.fill();}}});}   // t255: orchard + kitchen beds in the strip north of the field plots, not on them
};}
