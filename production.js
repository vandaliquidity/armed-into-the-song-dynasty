'use strict';

function productionMigrate(id){
  const s=CG?.T[id];if(!s?.bld)return;s.staff=s.staff||{};s.staffManual=s.staffManual||{};
  for(const k of PROD_ORDER){const value=s.staff[k];if(value==null)continue;let n=Number(value);if(!Number.isFinite(n)||n<0){delete s.staff[k];continue;}if(n>1)n=n<=100?n/100:1;s.staff[k]=clamp(n,0,1);}
  if(s.productionVersion===1)return;
  const active=PROD_ORDER.filter(k=>s.bld[k]>0);
  if(owned(id)&&s.pop>0&&active.length&&active.every(k=>s.staff[k]===0)&&!active.some(k=>s.staffManual[k])){
    for(const k of active)s.staff[k]=1;s.staffRecovered=true;
  }
  s.productionVersion=1;
}
function productionAuto(id){
  if(!CG||!owned(id)||!['camp','cvil'].includes(MODE))return false;ensureBld(id);
  CG.T[id].staffManual={};for(const k of PROD_ORDER)CG.T[id].staff[k]=1;CG.T[id].staffRecovered=false;
  if(typeof govNote==='function')govNote(id,'staff');syncRes();saveGame();return true;
}
function productionWorkers(id){
  const s=CG.T[id],available=Math.max(0,Math.round(s.pop*.5));
  const rows=PROD_ORDER.map(k=>({k,need:Math.max(0,Math.round((s.bld[k]||0)*JOBS[k]*(s.staff[k]??1))),w:0}));
  const total=rows.reduce((n,r)=>n+r.need,0);let remaining=available;
  if(total<=available){for(const r of rows){r.w=r.need;remaining-=r.w;}}
  else{
    for(const r of rows){const exact=r.need/total*available;r.w=Math.floor(exact);r.fraction=exact-r.w;remaining-=r.w;}
    const priority=rows.filter(r=>r.need>0).slice().sort((a,b)=>b.fraction-a.fraction||PROD_ORDER.indexOf(a.k)-PROD_ORDER.indexOf(b.k));
    for(const r of priority)if(remaining>0&&r.w<r.need){r.w++;remaining--;}
  }
  return{available,remaining,required:total,rows};
}
{const old=prodBreak;prodBreak=function(id){
  ensureBld(id);productionMigrate(id);const b=old(id),s=CG.T[id],d=CT[id],plan=productionWorkers(id),sea=seasonOf(CG.turn),P=perkSum(),sup=SUPP.has(id);
  for(const r of b.rows){const w=plan.rows.find(x=>x.k===r.k);const [res,rate,season]=PRODK[r.k];let m=(r.lv?1+.15*(r.lv-1):0)*season[sea]*(sup?1:.5);
    if(r.k==='farm')m*=1+(d.trait==='farm'?.3:0)+P.grain+(s.canal?.15:0)+(decOn('farm')?.25:0)+(techOn('crop')?.15:0)+(s.canal2?.1:0);
    if(r.k==='mine')m*=((d.trait==='iron'?2.2:1)+P.iron*.1)*(techOn('smelt')?1.3:1);
    if(r.k==='stable')m*=d.trait==='horse'?2:1;if(r.k==='saltw')m*=d.trait==='salt'?1.5:1;
    const amount=Math.round(w.w*rate*m),extra=r.k==='stable'?Math.round(w.w*.4*m/season[sea]):0;
    b.y[res]+=amount-r.amt;if(r.k==='stable')b.y.hide+=extra-(r.ex||0);
    Object.assign(r,{w:w.w,need:w.need,amt:amount,ex:extra,sf:s.staff[r.k]??1});
  }
  b.lab0=plan.available;b.lab=plan.remaining;b.required=plan.required;return b;
};}
function productionTiming(){const remaining=4-monthOfSeason(),month=seasonOf(CG.turn)*3+3;return Tz(`下次产出入库：${month}月季末（再结算${remaining}个月）`,`Next delivery: end of ${MONTH_EN[month-1]} (${remaining} monthly settlement${remaining===1?'':'s'} remaining)`);}
function productionInputStatus(id,p){
  if(!p)return Tz('未建造','Not built');
  if(p.n>0)return Tz(`可生产${p.n}件 / 季`,`Ready: ${p.n} items per season`);
  const shortages=Object.keys(p.R).filter(k=>(CG.T[id].st[k]||0)<Math.ceil(p.R[k]/100));
  return Tz('待原料：','Waiting for materials: ')+(shortages.length?shortages:p.short).map(k=>Tz(...RAWN[k])).join(' · ');
}
prodTable=function(id,controls){
  const b=prodBreak(id),s=CG.T[id];
  const rows=b.rows.map(r=>{
    const status=!r.lv?(building(id).some(p=>p.k===r.k)?Tz('营建中','Under construction'):Tz('未建造','Not built')):r.sf===0?Tz('手动停工','Manually paused'):r.w<r.need?Tz('劳力不足，按比例分配','Labour shortage; shared proportionally'):Tz('已开工','Working');
    const setting=controls&&r.lv?`<span class="stf" data-k="${r.k}">${[0,.5,1].map(v=>`<button type="button" data-v="${v}" class="staff-setting ${Math.abs(r.sf-v)<.01?'selected':''}">${v===0?Tz('停工','Pause'):v*100+'%'}</button>`).join('')}</span>`:'';
    return `<tr data-p="${r.k}"><td>${Tz(DEV[r.k].zh,DEV[r.k].en)} ${'★'.repeat(r.lv)}</td><td>${r.lv?r.w+' / '+r.need:'—'}</td><td>${r.lv?RAWN[r.res][2]+' <b>'+r.amt+'</b> '+(r.ex?' · 🐂'+r.ex:''):'—'}</td><td><span class="${r.lv&&(!r.w||r.w<r.need)?'short':'tip'}">${status}</span><br>${setting}</td></tr>`;
  }).join('');
  const upkeep=vilUpkeep(id),troops=Math.round(Object.values(CG.U).filter(u=>unitSite(u)===id).reduce((n,u)=>n+unitGrain(u),0));
  const workshop=WK_ORDER.filter(k=>s.bld[k]).map(k=>{const p=wkPlan(id,k);return `<tr><td>${Tz(DEV[k].zh,DEV[k].en)} → ${Tz(...(EQN[p.item]||RAWN[p.item]))}</td><td>${Tz('按原料开工','Uses materials')}</td><td><b>${p.n}</b> / ${p.cap}</td><td class="${p.n?'tip':'short'}">${productionInputStatus(id,p)}</td></tr>`;}).join('')+`<tr><td colspan="4" class="tip">${Tz(`每季消耗：乡民${upkeep.grain}粮、${upkeep.silver}银；本地部队约${troops}粮。工坊也消耗原料，故净入库少于总产出。`,`Seasonal consumption: villagers ${upkeep.grain} grain and ${upkeep.silver} silver; troops here about ${troops} grain. Workshops also consume inputs, so net stock gains are lower than gross output.`)}</td></tr>`;
  return `<div class="production-health"><b>${productionTiming()}</b><div>${Tz(`人口${s.pop}，其中${b.lab0}名可用劳力；已分配${b.lab0-b.lab}，闲置${b.lab}。`,`Population ${s.pop}; ${b.lab0} available workers, ${b.lab0-b.lab} assigned, ${b.lab} idle.`)}</div><div class="tip">${Tz('表中是每季预计产出；每三个月入库一次。工坊需要本地原料，远方货物须运抵。','Values are seasonal forecasts; stocks arrive every third month. Workshops require local materials, including delivered imports.')}</div>${s.staffRecovered?'<div class="ok">'+Tz('已恢复旧存档中的全线零用工设置。','Recovered an all-zero staffing setting from the older save.')+'</div>':''}${controls?`<button type="button" class="btn production-auto" data-auto-workers="${id}">${Tz('自动分配工人 / 恢复开工','Auto-assign workers / resume production')}</button>`:''}</div><table class="ptab" data-id="${id}" style="width:100%;font-size:12px"><tr><th>${Tz('产业','Improvement')}</th><th>${Tz('已分配 / 需求','Assigned / requested')}</th><th>${Tz('每季产出','Per season')}</th><th>${Tz('状态 / 用工','Status / staffing')}</th></tr>${rows}${workshop}<tr><td>${Tz('赋税','Taxes')}</td><td></td><td>🪙 ${b.tax}</td><td></td></tr>${b.sites.map(n=>`<tr><td>${Tz(n.zh,n.en)}</td><td></td><td>${stockTxt(NODEK[n.k].y)}</td><td>${Tz('哨堡开采','Outpost extraction')}</td></tr>`).join('')}</table>`;
};
function productionRefreshSummary(){
  const table=$('cProdAll');if(!table)return;const totals={};
  for(const row of table.querySelectorAll('tr[data-v]')){const b=prodBreak(row.dataset.v),cells=row.querySelectorAll('td');cells[1].textContent=(b.lab0-b.lab)+'/'+b.lab0;
    ['grain','timber','stone','ore','salt','horse','hide','silver'].forEach((k,i)=>{cells[i+2].textContent=b.y[k]||'—';totals[k]=(totals[k]||0)+(b.y[k]||0);});}
  const total=table.rows[table.rows.length-1];if(total) ['grain','timber','stone','ore','salt','horse','hide','silver'].forEach((k,i)=>{total.cells[i+2].textContent=totals[k]||0;});
}
bindStaff=function(el,id,redraw){
  for(const group of el.querySelectorAll('.stf'))for(const button of group.querySelectorAll('[data-v]'))button.onclick=e=>{
    e.preventDefault();e.stopPropagation();const s=CG.T[id];s.staff[group.dataset.k]=+button.dataset.v;(s.staffManual||(s.staffManual={}))[group.dataset.k]=1;s.staffRecovered=false;
    if(typeof govNote==='function')govNote(id,'staff');syncRes();saveGame();redraw();productionRefreshSummary();
  };
  for(const button of el.querySelectorAll('[data-auto-workers]'))button.onclick=e=>{e.preventDefault();e.stopPropagation();productionAuto(id);redraw();productionRefreshSummary();};
  for(const button of el.querySelectorAll('.staff-setting,[data-auto-workers]'))button.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')e.stopPropagation();};
};
{const old=campLoad;campLoad=function(){old();if(CG)for(const id of Object.keys(CG.T).filter(owned))productionMigrate(id);};}
{const old=settleUI;settleUI=function(id,tab){const result=old(id,tab);if(SET_TAB==='wk'&&owned(id)){
  const d=$('cSet'),body=d?.children[2];if(body){body.insertAdjacentHTML('afterbegin',`<div class="production-health">${productionTiming()}<br><span class="tip">${Tz('有人口不等于有原料。缺料时请在境内转运中调拨；原料运抵后，工坊在季末生产。','Population does not replace materials. Request missing inputs through Supply network; workshops produce at season end after delivery.')}</span></div>`);}
}return result;};}
