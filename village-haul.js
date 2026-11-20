// v0.34 (t253 step 3) the season's real income walks into the village. Grain carriers bring each field's harvest to the grain bin, tax
// clerks bring the households' tax silver to the 大宋官库 treasury, and merchants bring the trade-route silver in from the high street. Each
// leg is paced by the ledger: the season's actual yield (prodBreak: the farm row's grain and the tax line; ROUTES touching this village: trade
// income) moves per VC.SEASON seconds of village time, one basket = 50 grain (the storehouse unit), one chest = 10 silver. Winter fields
// send few baskets, a village with no market routes has no trade merchants, and a halved (unsupplied) tax shows as fewer clerks' trips.
// Hover a carrier to read what it carries, from where, and this season's total.
'use strict';
const VHL={GL:50,SL:10,TRES:[278,988],LANE:388};
function vhIncome(id){const B=prodBreak(id),farm=(B.rows.find(r=>r.k==='farm')||{}).amt||0,trade=(ROUTES||[]).filter(r=>r.a===id||r.b===id).reduce((n,r)=>n+(r.v||0),0);return {farm,tax:B.tax||0,trade};}
function vhFields(s){return vfSlots(2+(s.bld.farm||0)).map(([x,y])=>[x,y+8]);}
function vhTres(){return {d:VHL.TRES,via:[[114,VHL.TRES[1]]],port:[114,470]};}
function vhHouses(){const L=CVIL.lay;return (L&&L.houses||[]).filter(h=>h.x<330&&h.y<900).slice(0,4);}
{const old=vcPlan;vcPlan=function(s){const P=old.apply(this,arguments),I=vhIncome(CVIL.id);P.inc=I;
  if(I.farm>0){const F=vhFields(s),bin=vcBin('grain');F.forEach((f,i)=>P.legs.push({kind:'harvest',k:'grain',from:'field',to:'store',key:'hv'+i,units:I.farm/F.length,load:VHL.GL,spr:'vil_b',
      P:vcRoute({d:f,via:[[f[0],VHL.LANE],[1100,VHL.LANE]],port:[1100,470]},bin)}));}
  const H=vhHouses();if(I.tax>0&&H.length)H.forEach((h,i)=>P.legs.push({kind:'tax',k:'silver',from:'houses',to:'treasury',key:'tx'+i,units:I.tax/H.length,load:VHL.SL,spr:'merchant',
      P:vcRoute({d:[h.x,h.y+44],via:[[128,h.y+44]],port:[128,470]},vhTres())}));
  if(I.trade>0)P.legs.push({kind:'trade',k:'silver',from:'road',to:'treasury',key:'tr',units:I.trade,load:VHL.SL,spr:'merchant',P:vcRoute({d:[1790,470],via:[],port:[1790,470]},vhTres())});
  return P;};}
window.__vh={income:vhIncome,V:'t253c'};
