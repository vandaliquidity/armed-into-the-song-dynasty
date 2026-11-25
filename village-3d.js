'use strict';
const VILLAGE_3D={ready:false,failed:false,enabled:localStorage.getItem('song_village_3d')!=='off',view:null,promise:null};
window.VILLAGE_3D=VILLAGE_3D;
{const style=document.createElement('style');style.textContent='body.song-village-3d #village3DCanvas{outline:none}.village3DPanelToggle{display:none}@media(max-width:760px){body.song-village-3d #campUI>.village3DSidebar{display:none}body.song-village-3d.village3DPanelOpen #campUI>.village3DSidebar{display:block;top:132px!important;bottom:8px!important;max-width:calc(100vw - 28px)}.village3DPanelToggle{display:block}}';document.head.append(style);}
function village3DUI(){
 $('village3DTools')?.remove();if(MODE!=='cvil')return;campEl().querySelector(':scope > .panel')?.classList.add('village3DSidebar');
 const tools=document.createElement('div');tools.id='village3DTools';tools.style.cssText='position:absolute;left:14px;top:90px;display:flex;gap:5px;pointer-events:auto;z-index:4';
 const make=(label,title,fn)=>{const b=document.createElement('button');b.className='btn';b.textContent=label;b.title=title;b.onclick=fn;tools.append(b);return b;};
 if(VILLAGE_3D.ready&&VILLAGE_3D.enabled){make(Tz('屋顶','Roofs'),Tz('显示或隐藏屋顶','Show or hide roofs'),e=>{const v=VILLAGE_3D.view;v.setRoofs(!v.roofs);e.currentTarget.setAttribute('aria-pressed',String(v.roofs));}).setAttribute('aria-pressed',String(VILLAGE_3D.view.roofs));make(Tz('复位','Reset'),Tz('重置视角','Reset camera'),()=>VILLAGE_3D.view.reset(townScene()));}
 const b=make(VILLAGE_3D.failed?Tz('二维视图','2D view'):VILLAGE_3D.ready?(VILLAGE_3D.enabled?'2D':'3D'):'3D…',VILLAGE_3D.failed?Tz('此设备未能启动三维视图','3D could not start on this device'):Tz('切换村庄视图','Switch village view'),()=>{VILLAGE_3D.enabled=!VILLAGE_3D.enabled;localStorage.setItem('song_village_3d',VILLAGE_3D.enabled?'on':'off');village3DVisibility();village3DUI();});b.disabled=!VILLAGE_3D.ready;
 if(VILLAGE_3D.ready&&VILLAGE_3D.enabled)make(Tz('村务','Village'),Tz('村庄管理','Village management'),e=>{const open=document.body.classList.toggle('village3DPanelOpen');e.currentTarget.setAttribute('aria-expanded',String(open));}).classList.add('village3DPanelToggle');
 campEl().append(tools);
}
function village3DVisibility(){const active=MODE==='cvil'&&VILLAGE_3D.ready&&VILLAGE_3D.enabled;document.body.classList.toggle('song-village-3d',active);cv.style.pointerEvents=active?'none':'';if(active)VILLAGE_3D.view.canvas.style.display='block';else VILLAGE_3D.view?.hide();if(MODE!=='cvil'){$('village3DTools')?.remove();document.body.classList.remove('village3DPanelOpen');}}
function village3DLoad(){if(VILLAGE_3D.promise)return;VILLAGE_3D.promise=import('./village-3d-renderer.mjs?v=0.65').then(async({Village3D})=>{const v=new Village3D();VILLAGE_3D.view=v;v.hide();await v.load();v.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();VILLAGE_3D.ready=false;VILLAGE_3D.failed=true;village3DVisibility();village3DUI();});VILLAGE_3D.ready=true;village3DVisibility();village3DUI();}).catch(error=>{VILLAGE_3D.failed=true;VILLAGE_3D.view?.hide();console.warn('Village 3D unavailable; using the existing village view.',error);village3DVisibility();village3DUI();});}
{const old=showCVil;showCVil=function(...args){const r=old(...args);village3DLoad();village3DVisibility();village3DUI();return r;};}
{const old=cvilUI;cvilUI=function(...args){const r=old(...args);village3DUI();return r;};}
{const old=cvil8Frame;cvil8Frame=function(dt){if(VILLAGE_3D.ready&&VILLAGE_3D.enabled){try{return VILLAGE_3D.view.frame(dt);}catch(error){VILLAGE_3D.ready=false;VILLAGE_3D.failed=true;console.error('Village 3D stopped',error);village3DVisibility();village3DUI();}}return old(dt);};}
{const old=show;show=function(...args){const r=old(...args);village3DVisibility();return r;};}
