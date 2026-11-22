'use strict';
// Settlements use their actual road edges. Off-road camps have one explicit
// approach to the nearest settlement, shared by targeting, warnings and drawing.
const RAID_LINKS=new Map();
function raidNeighbours(src,kind){
 if(CADJ[src]&&kind!=='bandit'&&kind!=='qiang')return CADJ[src];
 const camp=kind==='bandit'?(typeof bdDef==='function'&&bdDef(src)):(typeof frCamp==='function'&&frCamp(src))||(typeof bdDef==='function'&&bdDef(src));
 if(!camp)return [];
 const key=(kind||'road')+':'+src+':'+CL.terr.length;if(!RAID_LINKS.has(key)){
  const near=CL.terr.slice().sort((a,b)=>Math.hypot((a.lon-camp.lon)*.82,a.lat-camp.lat)-Math.hypot((b.lon-camp.lon)*.82,b.lat-camp.lat)||a.id.localeCompare(b.id))[0];
  RAID_LINKS.set(key,near?[near.id]:[]);
 }return RAID_LINKS.get(key);
}
function raidAdjacent(src,to,kind){return raidNeighbours(src,kind).includes(to);}
