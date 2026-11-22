'use strict';
const OPENING_BALANCE={months:18,gap:3,factionGap:6};
function politicsDeveloped(){return Object.keys(CG.T).filter(owned).length>=3||menOf(Object.values(CG.U))>=1200||(CG.dynasty?.totalSales||0)>=300;}
function politicsProtected(){return !CG||campaignMonth()<=OPENING_BALANCE.months||!politicsDeveloped();}
function politicsPressureReady(T){return !politicsProtected()&&campaignMonth()>=(T.lastPressure??-100)+OPENING_BALANCE.gap;}
function politicsDemandGoods(id=HOME){const silver=Math.floor(Math.min(80,Math.max(0,CAMP.res.silver)*.1)),grain=Math.floor(Math.min(120,Math.max(0,CG.T[id].st.grain||0)*.08));return CAMP.res.silver>=120&&(CG.T[id].st.grain||0)>=200?{silver,grain}:null;}
function politicsOpeningClean(){if(!CG||!politicsProtected())return;CG.xdem=null;if(!CG.sf?.st)return;const S=CG.sf,T=S.st;T.env=T.env.filter(e=>e.kind!=='demand');T.har={};T.coal=[];S.blk=(S.blk||[]).filter(x=>x.o!=='qh');}

function openingRecovery(){const now=campaignMonth(),s=CG.openingBalance||(CG.openingBalance={lastSupport:now});if(s.lastSupport>=now)return false;s.lastSupport=now;if(!politicsProtected()||!owned(HOME))return false;CG.fac.court=Math.max(CG.fac.court,Math.min(50,CG.fac.court+2));CG.fac.gentry=Math.max(CG.fac.gentry,Math.min(50,CG.fac.gentry+1));return true;}
