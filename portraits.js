/* v0.39 t248c officer portraits. 22 head-and-shoulders busts in one painted style (Song gongbi line, mineral colours,
   cream paper), generated from a single style reference so the set reads as one hand: the 13 recruitable officers,
   the 5 bandit chiefs and the 4 Song bloc leaders (刘延庆, 姚古, 种师道, 童贯). One atlas per tier, drawn as CSS sprites
   (no canvas work), shown on the officers screen, on an army led by an officer, on each bloc card in the factions panel
   and on a stronghold's panel. */
'use strict';
const PT_META={"keys":["bd_liupan","bd_longshan","bd_maxian","bd_nanshan","bd_ziwu","chron_feng","chron_lan","chron_yue","hansz","langyu","liuqi","liyx","luwan","quduan","sf_liu","sf_tong","sf_yao","sf_zhong","shilg","wujie","yunb","zhoupb"],"cols":6,"v":{"hi":"cfef19ae","md":"869c6ff7","lo":"d69825f0"}};
function ptTier(){return ((typeof GFX!=='undefined'&&GFX.hi)||(window.devicePixelRatio||1)>1.4)?'hi':'md';}
function ptHas(k){return PT_META.keys.includes(k);}
function ptEl(k,w,cls){if(!ptHas(k))return null;const i=PT_META.keys.indexOf(k),C=PT_META.cols,R=Math.ceil(PT_META.keys.length/C),h=Math.round(w*1.25),t=ptTier();
  const d=document.createElement('div');d.className='sw-port'+(cls?' '+cls:'');d.dataset.port=k;
  d.style.cssText=`width:${w}px;height:${h}px;background-image:url(${typeof ART_BASE!=='undefined'?ART_BASE:'assets/'}${t}/portraits.webp?v=${PT_META.v[t]});background-size:${C*w}px ${R*h}px;background-position:-${(i%C)*w}px -${Math.floor(i/C)*h}px`;return d;}
(function(){if(document.getElementById('ptCss'))return;const s=document.createElement('style');s.id='ptCss';
  s.textContent=`.sw-port{flex:0 0 auto;border:1.5px solid var(--sw-line,#8a6424);border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.45);background-color:#e9dcbc;background-repeat:no-repeat}
  #cOff .wk .sw-port{float:left;margin:0 8px 4px 0}#cOff .wk{overflow:hidden}
  .sw-porthead{display:flex;gap:8px;align-items:center;margin:0 0 6px}.sw-porthead b{color:var(--sw-gold,#f4d27a)}
  .sw-fac .sw-port{float:right;margin:0 0 4px 8px}`;document.head.appendChild(s);})();
{const old=offUI;offUI=function(){const r=old.apply(this,arguments);const d=document.getElementById('cOff');if(d)for(const c of d.querySelectorAll('.wk[data-o]')){if(c.querySelector('.sw-port'))continue;const p=ptEl(c.dataset.o,60);if(p)c.prepend(p);}return r;};}
{const old=armyPanel;armyPanel=function(a){const w=old.apply(this,arguments);try{if(a&&a.off&&ptHas(a.off)){const L=LORE.off.list.find(x=>x.id===a.off),o=CG.off[a.off]||{};const h=document.createElement('div');h.className='sw-porthead';h.appendChild(ptEl(a.off,48));
  const t=document.createElement('div');t.innerHTML=`<b>${Tz(L.zh,L.en)}</b><div class="tip">${Ts('统领','Commanding')} · Lv${o.lvl||1} · ${Ts('忠诚','loyalty')} ${Math.round(o.loy||0)}</div>`;h.appendChild(t);w.prepend(h);}}catch(e){}return w;};}
if(typeof sfPanel==='function'){const old=sfPanel;sfPanel=function(){const w=old.apply(this,arguments);for(const c of w.querySelectorAll('.sw-fac[data-sf]')){const p=ptEl('sf_'+c.dataset.sf,52);if(p)c.prepend(p);}return w;};}
if(typeof bdPanel==='function'){const old=bdPanel;bdPanel=function(id){const w=old.apply(this,arguments);const p=ptEl('bd_'+id,56);if(p){p.style.float='right';p.style.margin='0 0 4px 8px';const h=w.querySelector('.sw-h');h?h.after(p):w.prepend(p);}return w;};}
window.__pt={PT_META,ptEl,ptHas,V:'t248c'};
