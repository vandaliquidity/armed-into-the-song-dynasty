// v0.31 (t253) readable people at the default zoom: villagers, carriers, merchants and children draw 1.6x, soldiers in the village 1.2x,
// artisans/physicians and patients larger, chickens 1.5x; the village opens at a closer default zoom (desktop 1.35, phone 1.5) centred
// on the market lane; the "Whole" button (or the wheel) still shows the full village.
'use strict';
const VS={K:1.6,KS:1.2,Z:1.35,ZM:1.5,PEOPLE:new Set(['villager','vil_b','vil_w','vil_e','vil_k','porter','merchant'])};
function vsOn(){return MODE==='cvil'&&(typeof vlOn!=='function'||vlOn());}
{const _su=sprUnit;sprUnit=function(name,x,y,r,...rest){if(vsOn()){if(VS.PEOPLE.has(name))r*=VS.K;else if(/^song_/.test(name))r*=VS.KS;}return _su.call(this,name,x,y,r,...rest);};}
{const old=showCVil;showCVil=function(){const r=old.apply(this,arguments);try{if(vsOn()&&!(typeof cpdUse==='function'&&cpdUse())){const mob=typeof mobNarrow==='function'&&mobNarrow();CVIL.z=mob?VS.ZM:VS.Z;CVIL.fx=VWW/2;CVIL.fy=VWH*.5;}}catch(e){}return r;};}
