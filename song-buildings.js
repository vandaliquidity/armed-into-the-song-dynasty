'use strict';
// Registered 2.5D layers. The town scene still owns placements, routes and jobs.
const SONG_BUILDINGS={version:'0.69',meta:null,images:new Map(),loading:new Map(),failed:new Set(),tier:null,ready:new Set(),stats:{draws:0,roofAlpha:1}};
function songBuildingKey(r,id=CVIL.id){
 if(r.house)return 'home_'+(r.model==='courtyard'?'courtyard':'cottage')+'_'+['a','b','c'][battlefieldHash(id+':'+r.k)%3];
 if(r.model==='store')return 'storehouse_'+(Number(r.k.split(':')[1])%2?'b':'a');
 if(r.k==='yard')return 'barracks';if(r.k==='stable')return 'stable';
 if(r.k==='hospital'||r.dev==='hosp')return 'hospital';
 if(r.biz)return r.biz;
 if(r.k==='hall'||r.k==='memorial')return r.k;if(r.dev){const names={saddle:'saddlery',fire:'firelance',armour:'armourer',armorer:'armourer',saltw:'saltworks',powder:'firelance',saddler:'saddlery',tower:(CG.T[id].bld.tower||0)>1?'watchtower_l2':'watchtower_l1'};return names[r.dev]||({saddler:'saddlery',powder:'firelance'}[r.model])||r.dev;}
 return {saddler:'saddlery',powder:'firelance'}[r.model]||r.model;
}
function songBuildingSpec(r,id=CVIL.id){return SONG_BUILDINGS.meta?.buildings[songBuildingKey(r,id)];}
function townWorkSeason(){const m=(campaignMonth()-1)%12+1;return m>=3&&m<=5?0:m>=6&&m<=8?1:m>=9&&m<=11?2:3;}
function townStaff(){return false;}
function songBuildingTier(){return GFX.tier==='lo'?'lo':GFX.tier==='hi'?'hi':'md';}
function songBuildingAllowed(id=CVIL.id){return CG?.T[id]&&!['xia','jin'].includes(CG.T[id].own);}
function songBuildingsLoad(){
 const B=SONG_BUILDINGS;if(!B.meta){if(!B.manifestPromise)B.manifestPromise=fetch('assets/bld_manifest.json?v='+B.version).then(r=>{if(!r.ok)throw Error('Building manifest '+r.status);return r.json();}).then(m=>{B.meta=m;B.tier=null;if(typeof TOWN!=='undefined')TOWN.scene=null;songBuildingsLoad();}).catch(()=>{B.manifestPromise=null;});return;}
 B.tier=songBuildingTier();if(MODE!=='cvil'||!CG?.T[CVIL.id])return;
 const keys=new Set();for(const r of TOWN.scene?.records||[])if(r.built||r.construction)keys.add(songBuildingKey(r));
 const q=villageGateQuality(CVIL.id);keys.add(['gate_hamlet','gate_village','gate_town'][q]);keys.add('gate_hamlet');
 if(CG.T[CVIL.id].bld.farm)keys.add('field_'+['spring','summer','autumn','winter'][townWorkSeason()]);
 for(const k of keys)songBuildingLoad(k,B.tier);
}
function songBuildingLoad(key,tier=songBuildingTier()){
 const B=SONG_BUILDINGS,spec=B.meta?.buildings[key],token=tier+':'+key;if(!spec||B.ready.has(token)||B.loading.has(token)||B.failed.has(token))return;
 const promise=Promise.all(spec.layers.map(layer=>new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>resolve([layer,im]);im.onerror=()=>reject(Error(key+' '+layer));im.src='assets/'+tier+'/bld_'+key+'__'+layer+'.webp?v='+B.version;}))).then(images=>{for(const [layer,im]of images)B.images.set(token+':'+layer,im);B.ready.add(token);SONG_ART.maps.clear();songInvalidate();}).catch(()=>B.failed.add(token)).finally(()=>B.loading.delete(token));B.loading.set(token,promise);
}
function songBuildingReady(key){const B=SONG_BUILDINGS,tier=songBuildingTier();if(!B.ready.has(tier+':'+key)){songBuildingLoad(key,tier);return false;}return true;}
function songBuildingRoofAlpha(scale=CVIL._sc||1){const f=SONG_BUILDINGS.meta?.roof_fade_sc||{alpha1_at_or_below:.4,alpha0_at_or_above:.7};return clamp((f.alpha0_at_or_above-scale)/(f.alpha0_at_or_above-f.alpha1_at_or_below),0,1);}
function songBuildingDraw(g,key,layer,x,y,w,h,alpha=1){
 const B=SONG_BUILDINGS,im=B.images.get(songBuildingTier()+':'+key+':'+layer);if(!im||alpha<=0)return false;
 g.save();g.globalAlpha*=alpha;g.drawImage(im,x-w/2,y-h,w,h);g.restore();B.stats.draws++;return true;
}
function songBuildingSourcePoint(spec,nx,ny){const r=spec.source_registration;if(!r)return {x:(nx-.5)*spec.box_wu[0],y:(ny-1)*spec.box_wu[1]};return {x:(nx*r.width*r.scale+r.x-spec.master_canvas_px[0]/2)/6,y:(ny*r.height*r.scale+r.y-spec.master_canvas_px[1])/6};}
function songBuildingTreasury(g,r,s){const spec=songBuildingSpec(r);if(!spec)return;const trays=spec.treasury_tray_normalized||{columns:[.35,.54],rows:[.445,.525,.61]},pieces=treasuryContents(s.st.gold||0,CVIL.id===HOME?CAMP.res.silver:s.stock?.silver||0),counts={gold:0,silver:0};for(const item of pieces){const n=counts[item.k]++,tray=Math.min(2,Math.floor(n/16)),slot=n%16,p=songBuildingSourcePoint(spec,trays.columns[item.k==='gold'?0:1],trays.rows[tray]);songIngot(g,r.x+p.x-9+slot%4*6,r.y+p.y-3+Math.floor(slot/4)*2.2,6,item.k==='gold');}}
function songBuildingPlacement(r){const spec=songBuildingSpec(r);if(!spec)return null;
 const at={key:songBuildingKey(r),spec,x:r.x,y:r.y,w:spec.box_wu[0],h:spec.box_wu[1]};
 if(r.k==='yard'){at.y-=120;}else if(r.k==='stable'){at.y-=125;}return at;
}
function songBuildingPoint(r,kind='input'){
 const at=songBuildingPlacement(r),p=at?.spec[kind==='output'?'output_rack_wu_from_anchor':'input_pile_wu_from_anchor'];
 return at&&p?{x:at.x+p.x,y:at.y+p.y}:{...r.door};
}
function songBuildingStations(r){const at=songBuildingPlacement(r);return at?(at.spec.stations_wu_from_anchor||[]).map(p=>({...p,x:at.x+p.x,y:at.y+p.y})):[];}
function songBuildingLevel(r,s){return r.biz?s.businesses?.[r.biz]?.level||0:r.k.startsWith('store:')?s.bld.store||0:r.k==='treasury'?1:r.k==='armoury'?s.bld.yard||0:r.k==='yard'?s.bld.yard||0:r.k==='stable'?s.bld.stable||0:r.dev?s.bld[r.dev]||0:1;}
function songBuildingLayers(add,g,r,s,t){
 if(!songBuildingAllowed()||!r.built)return false;const at=songBuildingPlacement(r);if(!at||!songBuildingReady(at.key))return false;
 const {key,spec,x,y,w,h}=at,level=songBuildingLevel(r,s),cut=spec.class==='W';
 add(cut?y-h*.6:y,()=>{g.save();if(r.house&&r.inhabited===false)g.globalAlpha*=.73;songBuildingDraw(g,key,'base',x,y,w,h);g.restore();if(key==='hospital'&&level>=2)songBuildingDraw(g,key,'props_l2',x,y,w,h);if(cut&&spec.plaque_text){g.save();g.fillStyle='#59412be8';g.fillRect(x-29,y-h*.79,58,16);g.strokeStyle='#a48a5c';g.lineWidth=.8;g.strokeRect(x-29,y-h*.79,58,16);g.fillStyle='#e0d4b7';g.font='600 11px "Noto Serif SC",SimSun,serif';g.textAlign='center';g.fillText(spec.plaque_text,x,y-h*.79+12,54);g.restore();}});
 if(cut){
  add(y+1,()=>{songBuildingDraw(g,key,'props',x,y,w,h);if(key!=='hospital')for(let n=2;n<=Math.min(3,level);n++)songBuildingDraw(g,key,'props_l'+n,x,y,w,h);});
  add(y+3,()=>{const a=songBuildingRoofAlpha();SONG_BUILDINGS.stats.roofAlpha=a;songBuildingDraw(g,key,level>=3&&spec.layers.includes('roof_l3')?'roof_l3':'roof',x,y,w,h,a);});
 }
 return true;
}
window.__songBuildings={state:SONG_BUILDINGS,key:songBuildingKey,placement:songBuildingPlacement,roofAlpha:songBuildingRoofAlpha,point:songBuildingPoint};

setTimeout(songBuildingsLoad,0);

// Existing patient identities, capacities and recovery remain owned by village-life.
{const old=vlSlots;vlSlots=function(level){const r=TOWN.scene?.byKey.hospital,b=SONG_BUILDINGS.meta?.buildings.hospital;if(!r||!songBuildingAllowed()||!songBuildingReady('hospital')||!b?.beds_wu_from_anchor)return old(...arguments);const slots=b.beds_wu_from_anchor.map(p=>({x:r.x+p.x,y:r.y+p.y,bed:1}));if(level>=2)for(const p of b.extra_mats_wu_from_anchor||[])slots.push({x:r.x+p.x,y:r.y+p.y,mat:1});return slots;};}
{const old=vlOut;vlOut=function(index){const r=TOWN.scene?.byKey.hospital;if(!r||!songBuildingAllowed()||!songBuildingReady('hospital'))return old(...arguments);return {x:r.x+(index%4<2?-1:1)*(38+index%2*30),y:r.y+23+Math.floor(index/4)*20,mat:1,out:1};};}

// The same paintings supply map plates and existing production/commerce thumbnails.
const SONG_BUILDING_LEGACY_BIZ=Object.fromEntries(Object.keys(DY_BUSINESSES).map(k=>[k,songBusinessModel(k)]));
{const old=songBusinessModel;songBusinessModel=function(k){return SONG_BUILDINGS.meta?.buildings[k]?k:old(k);};}
{const old=songSprite;songSprite=function(g,k,x,y,width,maxHeight=Infinity){
 const names={cottage:'home_cottage_a',courtyard:'home_courtyard_a',winehouse:'restaurant',granary:'granary_map',yamen:'hall',saddler:'saddlery',powder:'firelance'},key=names[k]||k,spec=SONG_BUILDINGS.meta?.buildings[key];
 if((MODE==='camp'||MODE==='cvil'&&songBuildingAllowed())&&spec&&songBuildingReady(key)){
  const scale=Math.min(width/spec.box_wu[0],maxHeight/spec.box_wu[1]),w=spec.box_wu[0]*scale,h=spec.box_wu[1]*scale;
  for(const layer of MODE==='cvil'&&width<=160&&spec.class==='W'?['base','props']:['base','props','roof'])songBuildingDraw(g,key,layer,x,y,w,h);return true;
 }
 return old(g,SONG_BUILDING_LEGACY_BIZ[k]||k,x,y,width,maxHeight);
};}
