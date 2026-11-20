// v0.31 (t253) readable people at the default zoom. v0.42 (t255): the per-group people boosts (villagers 1.6x, soldiers 1.2x) moved into
// village-people.js, which draws every person to one height standard; this file keeps the closer default zoom. The village opens at a closer default zoom (desktop 1.35, phone 1.5) centred
// on the market lane; the "Whole" button (or the wheel) still shows the full village.
'use strict';
const VS={K:1.6,KS:1.2,Z:1.35,ZM:1.5,PEOPLE:new Set(['villager','vil_b','vil_w','vil_e','vil_k','porter','merchant'])};
function vsOn(){return MODE==='cvil'&&(typeof vlOn!=='function'||vlOn());}
{const old=showCVil;showCVil=function(){const r=old.apply(this,arguments);try{if(vsOn()){const mob=typeof mobNarrow==='function'&&mobNarrow();CVIL.z=mob?VS.ZM:VS.Z;CVIL.fx=VWW/2;CVIL.fy=VWH*.5;}}catch(e){}return r;};}
