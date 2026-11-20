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
// 7. Phone layout: the campaign menu, inspector and dispatch log become drawers behind a bottom dock.
{const css=document.createElement('link');css.rel='stylesheet';css.href='mobile.css?v=0.26';document.head.appendChild(css);}
function mobDock(){if(!CG||MODE!=='camp'){$('mobDock')?.remove();document.body.classList.remove('mob-nav','mob-insp','mob-log');return;}if($('mobDock'))return;
  const d=document.createElement('div');d.id='mobDock';const tabs=[['mob-nav','☰ 菜单','☰ Menu'],['mob-insp','ℹ 详情','ℹ Details'],['mob-log','📜 军报','📜 Log']];
  for(const [c,zh,en] of tabs){const b=btn(zh,en,()=>{const on=!document.body.classList.contains(c);document.body.classList.remove('mob-nav','mob-insp','mob-log');if(on)document.body.classList.add(c);for(const x of d.children)x.classList.toggle('on',document.body.classList.contains(x.dataset.c));});b.dataset.c=c;d.appendChild(b);}
  document.body.appendChild(d);}
{const old=campUI;campUI=function(){const r=old.apply(this,arguments);try{mobDock();}catch(e){}return r;};}
{const old=show;show=function(id){const r=old.apply(this,arguments);try{if(MODE!=='camp')mobDock();}catch(e){}return r;};}
// 8. Clutter.
// Both mode: short labels written with Tz() show their English too. Canvas drawing (inside the frame loop) keeps the compact Chinese,
// because the canvas code already draws the English line itself where there is room.
let TZ_CANVAS=0;
{const old=loop;loop=function(){TZ_CANVAS++;try{return old.apply(this,arguments);}finally{TZ_CANVAS--;}};}
Tz=function(zh,en){if(LANG==='en')return en;if(LANG==='zh'||TZ_CANVAS||!en||en===zh||String(zh).includes(en))return zh;return zh+' '+en;};
// The tester chapter select only shows with ?dev=1 (or once it has been switched on before).
{const dev=/[?&]dev=1/.test(location.search)||DEV_UNLOCK;if(!dev){const st=document.createElement('style');st.id='swNoDev';st.textContent='.devbar{display:none!important}';document.head.appendChild(st);}}
// Veterancy: ranks at 4 / 12 / 24 experience (a win gives 2), so Veteran takes a handful of battles and Elite a long war.
const CHEV_AT=[4,12,24];
chev=function(u){const e=u?.exp||0;return e>=CHEV_AT[2]?3:e>=CHEV_AT[1]?2:e>=CHEV_AT[0]?1:0;};
// Stores: goods you hold none of (and have none arriving) fold away behind one toggle.
let STORE_ALL=false;
function storeFold(root){if(!root)return;const cells=[...root.querySelectorAll('.res[data-r],.res[data-e]')];if(!cells.length)return;let n=0;
  for(const c of cells){const v=Number((c.querySelector('b')?.textContent||'').replace(/[^\d.-]/g,''));const tip=c.dataset.e?c.querySelector('.tip'):null;if(tip){const inc=Number((tip.textContent.match(/-?\d+/)||[0])[0]);tip.style.display=inc?'block':'none';if(inc&&!tip.dataset.sw){tip.dataset.sw=1;tip.innerHTML=T('在途','Incoming')+' +'+inc;}}
    const moving=[...c.querySelectorAll('span:not(.ic)')].some(s=>s.style.display!=='none'&&/[1-9]/.test(s.textContent));
    const empty=v===0&&!moving;c.classList.toggle('sw-empty',empty);c.style.display=empty&&!STORE_ALL?'none':'';if(empty)n++;}
  root.querySelector('.sw-fold')?.remove();if(!n)return;const host=cells[cells.length-1].parentElement;const b=document.createElement('div');b.className='btn sw-fold';b.style.cssText='display:inline-block;margin:6px 0;font-size:12px';
  b.textContent=STORE_ALL?Ts('收起空的货物','Hide empty goods'):Ts(`显示全部（${n}种为空）`,`Show all (${n} empty)`);b.onclick=()=>{STORE_ALL=!STORE_ALL;storeFold(root);};host.appendChild(b);}
{const old=settleUI;settleUI=function(){const r=old.apply(this,arguments);try{storeFold($('cSet'));}catch(e){}return r;};}
// One build list: the Qinghe compound upgrades move out of the village panel into Production & buildings.
function compoundRows(host,refresh){const head=document.createElement('div');head.className='sw-compound';head.style.cssText='color:#f4d27a;margin:10px 0 4px;font-weight:bold';
  head.innerHTML=T('清河本寨营建（本寨专有）','Qinghe compound upgrades (home village only)');host.appendChild(head);
  for(const k in BLD){const b=BLD[k],lv=CAMP.bld[k];const row=document.createElement('div');row.className='bl sw-compound';row.innerHTML=`<span title="${lv<2?b.d[lv]:''}">${Ts(b.zh,b.en)} ${'★'.repeat(lv)}${'☆'.repeat(2-lv)}</span>`;
    if(lv<2&&CG.phase===0){const cost=b.lv[lv];row.appendChild(btn(costText(cost),'',()=>{if(!canAfford(cost))return;pay(cost);CAMP.bld[k]++;sfx('ui');cgLog('🔨',Ts(`${LORE.home.zh}：${b.zh}`,`${LORE.home.en}: ${b.en}`));saveGame();refresh();},canAfford(cost)?'':'dis'));}host.appendChild(row);}}
{const old=cvilUI;cvilUI=function(){const r=old.apply(this,arguments);try{if(CVIL.id===HOME){const p=[...document.querySelectorAll('.panel')].find(x=>x.querySelector('.bl')&&x.innerHTML.includes('Qinghe compound'));
  if(p){const hd=[...p.children].find(x=>x.tagName==='DIV'&&x.textContent.includes('Qinghe compound'));let n=hd;const kill=[];while(n){if(n!==hd&&!n.classList.contains('bl'))break;kill.push(n);n=n.nextElementSibling;}const at=n;kill.forEach(x=>x.remove());
   const b=btn('🔨 生产与营建','🔨 Production & buildings',()=>{showCamp();dynastyUI(HOME,'production');});b.id='cvCompound';b.style.cssText='display:block;margin-top:6px';p.insertBefore(b,at);}}}catch(e){}return r;};}
{const old=dynastyUI;dynastyUI=function(id,tab){const r=old.apply(this,arguments);try{const d=$('cDynasty');if(d&&COUNCIL_UI.tab==='production'&&COUNCIL_UI.id===HOME&&!d.querySelector('.sw-compound')){
  const box=document.createElement('div');box.style.cssText='margin:8px 0;padding:6px 8px;border:1px solid rgba(244,210,122,.35);border-radius:6px';compoundRows(box,()=>dynastyUI(HOME,'production'));
  const foot=d.querySelector('.management-footer');if(foot)foot.parentElement.insertBefore(box,foot);else d.appendChild(box);}}catch(e){}return r;};}
// Trade: the three nearest markets open; farther ones fold to their heading (click to open) instead of a wall of buy buttons.
let MKT_OPEN={};
function marketFold(){const d=$('cDynasty');if(!d)return;const rows=[...d.querySelectorAll('.dy-market-row')];rows.forEach((row,i)=>{const h=row.querySelector('h3');if(!h||row.dataset.fold)return;row.dataset.fold=1;
  const key=h.textContent.split(' ')[0],btns=[...row.querySelectorAll('button')];if(!btns.length)return;const set=on=>{btns.forEach(b=>b.style.display=on?'':'none');h.querySelector('.sw-mk')&&(h.querySelector('.sw-mk').textContent=on?' ▾':` ▸ ${btns.length} ${Tz('种货','goods')}`);};
  const mk=document.createElement('span');mk.className='sw-mk';mk.style.cssText='color:#f4d27a;font-size:12px';h.appendChild(mk);h.style.cursor='pointer';const open=MKT_OPEN[key]??(i<3);set(open);
  h.onclick=()=>{MKT_OPEN[key]=btns[0].style.display==='none';set(MKT_OPEN[key]);};});}
{const old=dynastyUI;dynastyUI=function(){const r=old.apply(this,arguments);try{marketFold();}catch(e){}return r;};}
