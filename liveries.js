/* v0.40 t248b unit and army liveries.
   Unit liveries: every unit type has one coat colour, the same everywhere - the village drill-yard tags, the hospital
   ward, the re-rendered unified soldier sprites (crossbowmen blue, archers green, cavalry brown, fire lancers black,
   spearmen Song red, militia undyed hemp) and a stripe on every unit card - so a company reads by colour at a glance.
   Army liveries: each band carries its own banner colour and emblem on the campaign map and in its panel. Lin Feng's
   band keeps Qinghe gold with 林; a band an officer leads takes his colour and surname; the player can change both in
   the army panel (stored on the army as a.liv, so it lives in the save). */
'use strict';
const LIV_TYPE={mil:'#8c6e4a',spear:'#9a2a22',dao:'#7a2440',arch:'#3f6a3a',xbow:'#2c447a',cav:'#6a4a2a',fire:'#3a3a40'};
const LIV_PAL=['#c8901a','#9a2a22','#2c447a','#3f6a3a','#5a3a5e','#3d7896','#6a4a2a','#2a2622'];
const LIV_OFF={wujie:'#9a2a22',liuqi:'#2c447a',hansz:'#b5452c',quduan:'#5a3a5e',liyx:'#3f6a3a',zhoupb:'#6a6a5a',shilg:'#b08a3a',langyu:'#2a2622',yunb:'#c8642e',luwan:'#3d7896',
  chron_yue:'#9a2a22',chron_feng:'#6a4a2a',chron_lan:'#3f7a58',bd_longshan:'#2a2622',bd_liupan:'#2a2622',bd_nanshan:'#5a4a36',bd_maxian:'#d8d4c8',bd_ziwu:'#4a4a50'};
function livType(t){return LIV_TYPE[t]||LIV_TYPE.mil;}
function livDefault(a){const L=a.off&&LORE.off.list.find(x=>x.id===a.off);if(L)return {c:LIV_OFF[L.id]||'#9a2a22',ch:(L.zh.replace(/[“”"]/g,'').match(/[\u4e00-\u9fff]/)||['宋'])[0]};
  const sd=SQUAD.find(q=>q.id===a.cmd)||offSD(a);return {c:'#c8901a',ch:(sd&&sd.zh&&sd.zh[0])||'清'};}
function livOf(a){return a&&a.liv&&a.liv.c?a.liv:livDefault(a);}
function livEmblems(a){const d=livDefault(a).ch;return [...new Set([d,'清','林','宋','忠','义','勇','威'])];}
// campaign map: the band's banner in its livery (drawArmy's banner call is redirected for that one army)
{const old=drawArmy;drawArmy=function(g,a){const L=livOf(a),ob=banner;banner=function(g2,x,y,col,ch,sc,dark){return ob.call(this,g2,x,y,L.c,L.ch,sc,dark);};try{return old.apply(this,arguments);}finally{banner=ob;}};}
// unit cards: a stripe in the unit type's livery colour
{const old=unitCard;unitCard=function(u){const d=old.apply(this,arguments);try{d.style.borderLeft=`4px solid ${livType(u.type)}`;d.dataset.liv=u.type;}catch(e){}return d;};}
// army panel: banner colour swatches and emblem choice
{const old=armyPanel;armyPanel=function(a){const w=old.apply(this,arguments);try{const L=livOf(a),row=document.createElement('div');row.className='sw-row sw-liv';row.style.cssText='display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:4px 0 6px';
  row.insertAdjacentHTML('beforeend',`<span class="tip" style="margin-right:4px">${Ts('旗号','Livery')}</span><span class="sw-livflag" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:26px;background:${L.c};color:#fff0cd;font:bold 14px serif;border:1.5px solid #d9cca3;border-radius:2px">${L.ch}</span>`);
  for(const c of LIV_PAL){const b=document.createElement('button');b.className='sw-sw'+(c===L.c?' on':'');b.dataset.c=c;b.title=c;b.style.cssText=`width:18px;height:18px;min-height:0;padding:0;border-radius:3px;border:${c===L.c?'2px solid #f4d27a':'1px solid #8a6424'};background:${c};cursor:pointer`;
    b.onclick=e=>{e.stopPropagation();a.liv={c,ch:livOf(a).ch};campUI();};row.appendChild(b);}
  const s=document.createElement('select');s.className='sw-livch';s.innerHTML=livEmblems(a).map(ch=>`<option${ch===L.ch?' selected':''}>${ch}</option>`).join('');s.onchange=()=>{a.liv={c:livOf(a).c,ch:s.value};campUI();};row.appendChild(s);
  const h=w.firstElementChild&&w.firstElementChild.classList.contains('sw-porthead')?w.children[2]:w.children[1];h?h.after(row):w.appendChild(row);}catch(e){}return w;};}
window.__liv={LIV_TYPE,LIV_PAL,livOf,livDefault,livType,V:'t248b'};
