// v0.25 one set of numbers (playtest t249): the top bar, the realm panel and the village panel now quote the same
// season ledger (production - troop pay - village upkeep = net), attack confirmations quote the same odds the battle
// card and auto-resolve use, and Chapter 1 counts figures and men the same way in the briefing, scout report and HUD.
'use strict';
function realmLedger(){const inc=income();const up=inc.up||{grain:0,silver:0},vup=inc.vup||{grain:0,silver:0};const net=inc.tot;
  return{net,troops:up,villages:vup,upkeep:{grain:Math.round(up.grain+vup.grain),silver:Math.round(up.silver+vup.silver)},prod:{grain:Math.round(net.grain+up.grain+vup.grain),silver:Math.round(net.silver+up.silver+vup.silver)},trade:inc.trade};}
function ledgerLine(L){return Ts(`产出 +${L.prod.grain}粮 +${L.prod.silver}银 · 军饷 -${L.troops.grain}粮 -${L.troops.silver}银 · 村用 -${L.villages.grain}粮 -${L.villages.silver}银 · 净 ${L.net.grain>=0?'+':''}${Math.round(L.net.grain)}粮 ${L.net.silver>=0?'+':''}${Math.round(L.net.silver)}银 /季`,
  `Output +${L.prod.grain} grain +${L.prod.silver} silver · troop pay -${L.troops.grain} grain -${L.troops.silver} silver · villages -${L.villages.grain} grain -${L.villages.silver} silver · net ${L.net.grain>=0?'+':''}${Math.round(L.net.grain)} grain ${L.net.silver>=0?'+':''}${Math.round(L.net.silver)} silver per season`);}
{const old=campUI;campUI=function(){const r=old.apply(this,arguments);try{if(MODE!=='camp'||!CG)return r;const L=realmLedger(),tip=ledgerLine(L);
  for(const k of campEl().querySelectorAll('.kv .k'))if(/军饷|Upkeep/.test(k.textContent)&&k.nextElementSibling){k.innerHTML=T('用度','Upkeep');const v=k.nextElementSibling;v.id='cLedgerUp';v.title=tip;
    v.innerHTML=`-${L.upkeep.grain} ${Ts('粮','grain')} · -${L.upkeep.silver} ${Ts('银','silver')} <span class="tip">(${Ts('净','net')} ${L.net.grain>=0?'+':''}${Math.round(L.net.grain)} ${Ts('粮','grain')} · ${L.net.silver>=0?'+':''}${Math.round(L.net.silver)} ${Ts('银','silver')} /${Ts('季','season')})</span>`;}
  for(const t of campEl().querySelectorAll('.resource-tile'))if(/粮食|Grain|库银|Treasury/.test(t.textContent))t.title=tip;}catch(e){console.warn('ledger',e);}return r;};}
// the village panel's figure is that village's share; say so, and give the realm total next to it
{const old=settleUI;settleUI=function(id,tab){const r=old.apply(this,arguments);try{const u=$('cUpkeep');if(u&&!u.dataset.led){u.dataset.led=1;const L=realmLedger();u.insertAdjacentHTML('beforeend',`<div class="tip" id="cUpkeepRealm">${Ts('以上为本村一处。全境','This village only. Whole realm')}: ${ledgerLine(L)}</div>`);}}catch(e){}return r;};}
// one odds model: auto-resolve wins when P*U(.85,1.15) > E*1.1*U(.85,1.15); the card and the confirm both quote it
function autoOdds(P,E){if(!E)return 1;if(!P)return 0;const n=120;let w=0;for(let i=0;i<n;i++){const pe=P*(.85+.3*(i+.5)/n);const t=(pe/(E*1.1)-.85)/.3;w+=clamp(t,0,1);}return w/n;}
{const old=battleForecast;battleForecast=function(q,N){const r=old.call(this,q,N);try{const E=qEnemyStr(q),P=powerOf(qArmy(q),q);r.win=autoOdds(P,E);}catch(e){}return r;};}
{const old=rtsConfirm;rtsConfirm=function(as,to){old(as,to);setTimeout(()=>{try{const d=$('cAtk');if(!d)return;let E=0,P=0;for(const a of as){const q={type:'atk',army:a.id,terr:to};E=Math.max(E,qEnemyStr(q));P+=powerOf(a,q);}
  const p=Math.round(autoOdds(P,E)*100);const div=d.children[1];if(div)div.innerHTML=div.innerHTML.replace(/(胜算约\s*)\d+%/,'$1'+p+'%').replace(/(odds about\s*)\d+%/,'$1'+p+'%');d.dataset.odds=p;}catch(e){}},0);};}
// Chapter 1: figures and men
LLS.intro={zh:'探马来报：西夏四十队人马（约四百骑步）三路扑来，咱们只有十队乡勇、六队清河弩（共一百六十人）。硬拼必败——叠加优势才能赢。',en:'Scouts report: forty Xia figures (about four hundred raiders) on three roads; we have ten militia and six Qinghe crossbow figures (160 men). A straight fight loses; stack advantages to win.'};
{const old=showBrief;showBrief=function(i){const r=old.apply(this,arguments);try{if(i===0&&lessonOn()){const w=$('scrBrief')?.firstElementChild;if(w&&!$('cLesForces')){
  for(const p of w.querySelectorAll('.panel'))if(/50 crossbowmen|50名弩手/.test(p.textContent))p.remove();
  w.insertAdjacentHTML('beforeend',`<div class="panel" id="cLesForces">🎯 ${Tz('战术课兵力：乡勇10队、清河弩6队（每队10人，共160人），对西夏40队（约400人）。每个战斗棋子＝10人。幸存者随你进入战役。','Lesson forces: 10 militia and 6 Qinghe crossbow figures (10 men each, 160 men) against 40 Xia figures (about 400 men). One battle figure = 10 men. Survivors carry into the campaign.')}</div>`);}}}catch(e){}return r;};}
