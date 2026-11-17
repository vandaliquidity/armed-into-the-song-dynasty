'use strict';

// Song and Xia use local civilian workers, stores and a one-month muster.
function npcStores(id){const s=CG.T[id];return s.own==='xia'?(s.stock||(s.stock={})):new Proxy(s.st,{get:(o,k)=>k==='spear'?(s.eq.spear||0):o[k],set:(o,k,v)=>{if(k==='spear')s.eq.spear=v;else o[k]=v;return true;}});}
function npcEconomyInit(){
  if(!CG)return;
  for(const id of Object.keys(CG.T)){
    const s=CG.T[id];if(!warFaction(id)||s.npcEconomy)continue;
    const cap=warCap(id);warSetMen(id,Math.min(warMen(id),Math.floor(cap*.65)));
    s.npcEconomy={last:campaignMonth(),pending:0,owner:s.own,produced:0,recruited:0};
    // Existing settlements have basic farms and workshops; inputs still run out.
    s.bld.farm=Math.max(1,s.bld.farm||0);s.bld.smithy=Math.max(1,s.bld.smithy||0);
  }
  if(!CG.npcPaidMigration){
    CG.npcPaidMigration=1;
    CG.xa=CG.xa.filter(x=>{
      if(x.story||x.faction==='jin'||x.paid)return true;
      if(warFaction(x.from)!=='xia'||!(CADJ[x.from]||[]).includes(x.to))return false;
      x.str=Math.min(x.str,Math.floor(warMen(x.from)*.45));
      if(x.str<1)return false;warSetMen(x.from,warMen(x.from)-x.str);x.paid=true;return true;
    });
  }
}
function npcEconomyTick(){
  npcEconomyInit();const month=campaignMonth();
  for(const id of Object.keys(CG.T)){
    if(!warFaction(id))continue;
    const s=CG.T[id],e=s.npcEconomy,st=npcStores(id);if(e.last>=month)continue;e.last=month;
    if(e.owner!==s.own){e.pending=0;e.owner=s.own;}
    if(e.pending){warSetMen(id,warMen(id)+e.pending);e.recruited+=e.pending;e.pending=0;}
    const workers=Math.min(Math.floor(s.pop*.12),80),scale=workers/80;
    const add=(k,n)=>{st[k]=(st[k]||0)+Math.floor(n*scale);};
    add('grain',100*(s.bld.farm||0));add('timber',30);if(CT[id].trait==='iron')add('ore',35);
    add('silver',8*(s.bld.market||1));
    const made=Math.max(0,Math.min(Math.floor(12*(s.bld.smithy||0)*scale),Math.floor(st.ore||0),Math.floor(st.timber||0)));
    st.ore=(st.ore||0)-made;st.timber=(st.timber||0)-made;st.spear=(st.spear||0)+made;e.produced+=made;
    const upkeep=Math.ceil(warMen(id)*.04),fed=Math.min(st.grain||0,upkeep);st.grain=(st.grain||0)-fed;
    if(fed<upkeep)warSetMen(id,Math.max(0,warMen(id)-(upkeep-fed)));
    const n=Math.max(0,Math.min(Math.floor(18*scale),warCap(id)-warMen(id),Math.floor(s.pop-200),Math.floor(st.spear||0),Math.floor((st.grain||0)/2),Math.floor(st.silver||0)));
    if(n){s.pop-=n;st.spear-=n;st.grain-=n*2;st.silver-=n;e.pending=n;}
  }
}
// No separate automatic replenishment of Xia weapons or soldiers.
xiaRestock=function(){};
function npcRaid(from,to,weak=false){
  if(warFaction(from)!=='xia'||!owned(to)||!(CADJ[from]||[]).includes(to))return null;
  const n=Math.floor(warMen(from)*.45);if(n<40)return null;
  warSetMen(from,warMen(from)-n);
  const x={id:CG.xid++,from,to,str:n,eta:2,weak,fz:1,paid:true};CG.xa.push(x);return x;
}
// Check the source immediately before dispatch; difficulty changes decisions,
// never the number of men withdrawn from the source.
{const old=xiaAI;xiaAI=function(rep){npcEconomyInit();return old(rep);};}
{const old=campStart;campStart=function(){const r=old();npcEconomyInit();saveGame();return r;};}
{const old=campLoad;campLoad=function(){const r=old();npcEconomyInit();return r;};}
{const old=terrPanel;terrPanel=function(id){const d=old(id),s=CG.T[id],e=s.npcEconomy;if(warFaction(id)&&e){const st=npcStores(id);d.insertAdjacentHTML('beforeend',`<div class="wk"><b>${Tz('本地征募与军需','Local recruitment and supply')}</b><p>${Tz('军队从本城人口与军备征募，训练需一个月。缺粮会减员。','Troops cost local population, arms, silver and grain, and train for one month. Food shortages cause losses.')}</p><div>${Tz('训练中','Training')}: ${e.pending} · ${Tz('已征募','Recruited')}: ${e.recruited} · ${Tz('粮','Grain')}: ${Math.floor(st.grain||0)} · ${Tz('长枪','Spears')}: ${Math.floor(st.spear||0)}</div></div>`);}return d;};}
