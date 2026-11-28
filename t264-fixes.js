'use strict';
// t264 playtest fixes:
//  1. Mission 1 "hold by the granary": a right-click order (issueOrder) counts, not only the X key / halt.
//  2. Hospital and Clinic are one building: the legacy Clinic is renamed Hospital and its level is shared with Qinghe's hospital,
//     and both cards draw the hospital ward art instead of the grey placeholder slab.
//  3. The village header names the same rank as the side panel (tier · character · residents).
//  4. A haulage cutscene plays once: re-entering the village does not replay a convoy banner that already ran.
//  5. Build slots: two projects at once (three in a town of tier 3+), so silver is spent.
{const old=issueOrder;issueOrder=function(type,x,y,face,groups){const r=old.apply(this,arguments);try{if(typeof B!=='undefined'&&B&&B.les&&B.key&&x!=null&&Math.hypot(x-B.key.x,y-B.key.y)<260){const gs=groups||[...(B.sel||[])];if(gs.some(g=>groupUnits(g).some(u=>u.type==='militia')))B.les.mHold=1;}}catch(e){}return r;};}
if(typeof BLD!=='undefined'&&BLD.clinic){BLD.clinic.zh='医馆';BLD.clinic.en='Hospital';}
function hospSync(){if(!CG||!CG.T||!CG.T[HOME]||typeof CAMP==='undefined')return;const s=CG.T[HOME];s.bld=s.bld||{};const lv=Math.min(2,Math.max(s.bld.hosp||0,CAMP.bld.clinic||0));if(lv){s.bld.hosp=lv;CAMP.bld.clinic=lv;}}
{const old=campUI;campUI=function(){try{hospSync();}catch(e){}return old.apply(this,arguments);};}
{const old=showVillage;showVillage=function(){try{hospSync();}catch(e){}return old.apply(this,arguments);};}
function hospIcon(c){if(typeof songBuildingReady==='function'&&songBuildingReady('hospital')){const g=c.getContext('2d'),b=SONG_BUILDINGS.meta.buildings.hospital,scale=Math.min(c.width/b.box_wu[0],c.height/b.box_wu[1])*.94;g.clearRect(0,0,c.width,c.height);for(const layer of ['base','props'])songBuildingDraw(g,'hospital',layer,c.width/2,c.height-3,b.box_wu[0]*scale,b.box_wu[1]*scale);return true;}try{vlLoad();}catch(e){}const im=VL.img.ward,g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);if(im){const s=Math.min(c.width/im.width,c.height/im.height)*.95;g.drawImage(im,(c.width-im.width*s)/2,c.height-im.height*s,im.width*s,im.height*s);return true;}
 if(typeof songSprite==='function'&&songSprite(g,'courtyard',c.width/2,c.height-4,c.width*.62,c.height*.95)){g.fillStyle='#b8402e';g.fillRect(c.width/2-9,c.height*.30,18,5);g.fillRect(c.width/2-2.5,c.height*.30-6.5,5,18);return true;}return false;}
{const old=propIcon;propIcon=function(name,c,v){if(name==='clinic'&&hospIcon(c))return;return old.apply(this,arguments);};}
{const old=productionModelIcon;productionModelIcon=function(k){if(k==='hosp'){const c=mkCanvas(500,210);if(hospIcon(c))return c;}return old.apply(this,arguments);};}
function townRankText(id){const s=CG.T[id],tier=tierOf(s.prosp);return Tz(CL.tiers[tier][0],CL.tiers[tier][1])+' · '+Tz(...villageIdentity(id).name)+' · 👥'+s.pop;}
// played haulage scenes are remembered in the save, so a convoy banner never replays
function vwSeen(){const v=CG.vw||(CG.vw={v:1});return v.scenes||(v.scenes={});}
{const old=sceneStart;sceneStart=function(){try{const seen=vwSeen();LOGI.scenes=LOGI.scenes.filter(S=>!seen[S.kind+':'+S.sid]);const S=LOGI.scenes[0];if(S){seen[S.kind+':'+S.sid]=campaignMonth();}}catch(e){}return old.apply(this,arguments);};}
buildSlots=function(id){return 2+(tierOf(CG.T[id].prosp)>=3?1:0);};
window.__t264fix={hospSync,townRankText,hospIcon};

// Registered per-building previews for the existing development panel.
{const old=productionModelIcon;productionModelIcon=function(k){const key={store:'storehouse_a',yard:'barracks',hosp:'hospital',saddle:'saddlery',fire:'firelance',armour:'armourer',saltw:'saltworks',tower:'watchtower_l1',wall:'wall_kit',farm:'field_'+['spring','summer','autumn','winter'][townSeason()]}[k]||k,spec=typeof SONG_BUILDINGS!=='undefined'&&SONG_BUILDINGS.meta?.buildings[key];if(!spec)return old(...arguments);const c=old(...arguments);const paint=()=>{if(!songBuildingReady(key))return;const g=c.getContext('2d'),scale=Math.min(c.width/spec.box_wu[0],c.height/spec.box_wu[1])*.94;g.clearRect(0,0,c.width,c.height);for(const layer of ['base','props'])songBuildingDraw(g,key,layer,c.width/2,c.height-3,spec.box_wu[0]*scale,spec.box_wu[1]*scale);};songBuildingLoad(key);if(songBuildingReady(key))paint();else SONG_BUILDINGS.loading.get(songBuildingTier()+':'+key)?.then(()=>{if(c.isConnected)paint();});return c;};}
