'use strict';
// No inventory reset on migration. Household spending and NPC production are
// bounded monthly flows, separate from the player's treasury.
function economyState(){return CG.economy||(CG.economy={v:1,last:campaignMonth(),contracts:{},receipts:0});}
function economyDemand(id){const s=CG.T[id],traffic=shipsOn().filter(c=>!c.state&&(c.from===id||c.to===id)).length;return Math.floor(Math.max(0,s.pop)*.035*(.6+s.prosp/100)+Math.min(36,traffic*6));}
function economyHousehold(id){const s=CG.T[id],now=campaignMonth();return s.households||(s.households={budget:economyDemand(id),last:now});}
function economyPrepare(){const now=campaignMonth();for(const id of Object.keys(CG.T).filter(owned)){const h=economyHousehold(id);if(h.last<now){h.last=now;h.budget=Math.min(economyDemand(id)*1.5,h.budget+economyDemand(id));}}economyState().last=now;}
function economyRestaurantSale(id,n){const h=economyHousehold(id);h.budget=Math.max(0,h.budget-n);}
function economyMarketMonth(id){
 const s=CG.T[id],m=dynastyState().markets[id];if(!m||s.marketProduction?.month===campaignMonth())return;const workers=Math.min(70,Math.floor(s.pop*.08)),lab=workers/70,st=s.st,eq=s.eq;
 // Market demand is finite; local tax funds, rather than a free treasury grant,
 // replenish each customer's purchasing purse.
 const tax=Math.max(0,Math.floor(s.pop*.008*(.6+s.prosp/100))),earned=Math.min(35,Math.floor(tax*.4),Math.max(0,(st.silver||0)+tax-30));st.silver=Math.max(0,(st.silver||0)+tax-earned);m.budget=Math.min(600,m.budget+earned);
 for(const k of REALM_EXPORTS)m.demand[k]=Math.min(60,(m.demand[k]||0)+Math.max(1,Math.floor(lab*(k==='wine'?8:4))));
 const crops=CT[id].trait==='farm'?['grain','oil']:CT[id].trait==='horse'?['grain','hide']:['grain'];for(const k of crops)st[k]=Math.min(1200,(st[k]||0)+Math.floor((k==='grain'?45:6)*lab));
 for(const n of NODES.filter(n=>n.terr===id))for(const [k,v]of Object.entries(NODEK[n.k].y))if(RAW.includes(k))st[k]=Math.min(1200,(st[k]||0)+Math.floor(v*lab/3));
 const recipe=CT[id].trait==='iron'?{k:'xbow',max:6,c:{timber:2,ore:1,silver:1}}:CT[id].trait==='horse'?{k:'armL',max:8,c:{leather:2,silver:1}}:{k:'bow',max:6,c:{timber:2,leather:1,silver:1}};
 const n=Math.max(0,Math.min(Math.floor(recipe.max*lab),...Object.entries(recipe.c).map(([k,v])=>Math.floor((st[k]||0)/v))));if(n){for(const [k,v]of Object.entries(recipe.c))st[k]-=v*n;eq[recipe.k]=(eq[recipe.k]||0)+n;}
 s.marketProduction={month:campaignMonth(),workers,made:{[recipe.k]:n},missing:n?[]:Object.keys(recipe.c).filter(k=>(st[k]||0)<recipe.c[k])};
 st.wine=Math.max(0,(st.wine||0)-Math.floor(4*lab));st.cosmetics=Math.max(0,(st.cosmetics||0)-Math.floor(2*lab));
 const near=dynastyNearest(id,3);if(near){const host=CG.T[near.to],business=Object.values(host.businesses).filter(b=>b.level&&!b.paused).length;dynastyState().influence[id]=Math.min(100,dynastyInfluence(id)+Math.min(10,2+business+Math.floor(host.prosp/25)+(host.bld.hosp||0)));}
}
{const old=dynastyProduction;dynastyProduction=function(id,k){const p=old(id,k);if(k==='restaurant')p.scale=Math.min(p.scale,Math.floor(economyHousehold(id).budget/Math.max(1,p.output.silver)*100)/100);return p;};}
{const old=dynastyTick;dynastyTick=function(){if(CG&&dynastyState().last<campaignMonth())economyPrepare();return old();};}
{const old=dyTradePrice;dyTradePrice=function(from,to,k,n){const box=supplyBox(from,k),stock=box?.[k]||0,scarcity=stock<n*2?1.3:stock>n*8?.9:1;return Math.ceil(old(from,to,k,n)*scarcity);};}
function economyContracts(from){if(!owned(from))return[];const d=dynastyState(),result=[];for(const to of Object.keys(d.markets)){if(CG.T[to].own!=='song'||!supplyPath(from,to)||supplyPath(from,to).length>6)continue;const m=d.markets[to],k=REALM_EXPORTS[battlefieldHash(to+'-'+Math.floor(campaignMonth()/3))%REALM_EXPORTS.length],n=Math.min(12,m.demand[k]||0),pay=Math.ceil(politicalExportValue(from,k,n)*1.15),key=to+'-'+campaignMonth()+'-'+k;if(n>=4&&m.budget>=pay&&!economyState().contracts[key])result.push({key,to,k,n,pay});}return result.slice(0,6);}
function economyAccept(from,key){if(!dynastyPlanning())return false;const c=economyContracts(from).find(c=>c.key===key);if(!c||supplyLocal(from,c.k)<c.n)return false;const m=dynastyState().markets[c.to],shipment=dynastyShipment('dynTrade',from,c.to,{[c.k]:c.n},{sale:true,pay:c.pay,economicContract:key});if(!shipment)return false;take(from,c.k,c.n,false);m.budget-=c.pay;m.demand[c.k]-=c.n;economyState().contracts[key]={ship:shipment.id,status:'travel',pay:c.pay};saveGame();return true;}
{const old=dynastyArrive;dynastyArrive=function(s,lines){const was=s.state,r=old(s,lines);if(!was&&s.state==='done'&&s.economicContract){const c=economyState().contracts[s.economicContract];if(c){c.status='delivered';economyState().receipts+=s.pay;}}return r;};}
