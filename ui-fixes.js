// v0.25 interface fixes from the t249 playtest.
'use strict';
// 5. Pop-up boxes (Controls and others) fit the window, scroll, and close with Esc.
alertBox=function(html){const old=document.getElementById('cAlert');if(old)old.remove();const d=document.createElement('div');d.className='panel';d.id='cAlert';
  d.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;max-width:min(760px,94vw);max-height:90vh;display:flex;flex-direction:column;padding-bottom:8px';
  const body=document.createElement('div');body.style.cssText='overflow:auto;min-height:0;flex:1 1 auto;padding-right:6px';body.innerHTML=html;d.appendChild(body);
  const close=()=>{d.remove();removeEventListener('keydown',esc,true);};const esc=e=>{if(e.key==='Escape'){e.stopPropagation();close();}};addEventListener('keydown',esc,true);
  const b=btn('关闭','Close',close);b.id='cAlertClose';b.style.cssText='flex:0 0 auto;align-self:center;margin-top:8px';d.appendChild(b);document.body.appendChild(d);return d;};
// 6. Haulage cutscenes: only this month's scenes play (at most two queued); the bar offers Skip all.
const SCENE_KEEP=2;
function scenePrune(){if(!CG||!LOGI.scenes.length)return;const m=campaignMonth();for(const S of LOGI.scenes)if(S.m==null)S.m=m;
  LOGI.scenes=LOGI.scenes.filter(S=>S.m===m&&CG.T[S.id]&&(S.kind!=='loot'||shipsOn().some(x=>x.id===S.sid&&!x.state)));if(LOGI.scenes.length>SCENE_KEEP)LOGI.scenes=LOGI.scenes.slice(-SCENE_KEEP);}
{const old=sceneOk;sceneOk=function(){try{scenePrune();}catch(e){}return old.apply(this,arguments);};}
function sceneSkipAll(){LOGI.scenes.length=0;sceneEnd(true);}
{const old=sceneStart;sceneStart=function(){const r=old.apply(this,arguments);const o=$('logiBar');if(o&&!$('logiSkipAll')){const b=document.createElement('div');b.className='btn';b.id='logiSkipAll';b.style.cssText='display:inline-block;margin:6px 0 0 8px;padding:3px 14px';b.textContent=Ts('全部跳过 ⏭⏭','Skip all ⏭⏭');b.onclick=sceneSkipAll;o.appendChild(b);}return r;};}
{const old=endTurn;endTurn=function(){const r=old.apply(this,arguments);try{const m=campaignMonth();for(const S of LOGI.scenes)if(S.m==null)S.m=m;}catch(e){}return r;};}
