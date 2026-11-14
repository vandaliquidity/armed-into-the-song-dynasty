'use strict';
// Regional supply sites are schematic gameplay geography.
const REALM_GOODS={fish:['鲜鱼','Fish','🐟'],vegetables:['蔬菜','Vegetables','🥬'],fruit:['果品','Fruit','🍑'],beans:['豆菽','Beans','🫘'],hemp:['麻料','Hemp','🌱'],cloth:['麻布','Cloth','🧶'],paper:['纸张','Paper','📜'],clay:['陶土','Clay','🟤'],ceramics:['瓷陶','Ceramics','🏺'],copper:['铜料','Copper','🟠'],coal:['石炭','Coal','⬛'],steel:['精铁','Refined steel','⚙']};
for(const [k,v]of Object.entries(REALM_GOODS)){RAW.push(k);DY_GOODS[k]=v;RAWN[k]=v;RES_N[k]=v.slice(0,2);}
Object.assign(DY_PRICE,{fish:1.5,vegetables:.5,fruit:1,beans:.5,hemp:.6,cloth:3,paper:2,clay:.3,ceramics:4,copper:3,coal:1,steel:4});for(const k in REALM_GOODS)PRICE[k]=Math.ceil(DY_PRICE[k]*50);
const REALM_EXPORTS=['wine','cosmetics','cloth','paper','ceramics','steel','fish','vegetables','fruit','beans','copper'];
Object.assign(DY_BUSINESSES,{
 garden:{name:['菜麻圃','Market garden'],cost:{silver:70,timber:35},jobs:20,input:{},output:{vegetables:20,beans:10,hemp:12},wage:3,color:'#587450'},
 orchard:{name:['果园','Orchard'],cost:{silver:90,timber:45},jobs:20,input:{},output:{fruit:20},wage:3,color:'#936341'},
 weaver:{name:['织造作','Weaving house'],cost:{silver:110,timber:50},jobs:28,input:{hemp:12},output:{cloth:12},wage:4,color:'#63888c'},
 papermill:{name:['纸坊','Paper mill'],cost:{silver:120,timber:60,stone:25},jobs:28,input:{timber:8,cloth:2},output:{paper:14},wage:4,color:'#aa9362'},
 pottery:{name:['陶瓷窑','Pottery kiln'],cost:{silver:130,timber:45,stone:50},jobs:30,input:{clay:12,charcoal:4},output:{ceramics:12},wage:4,color:'#846151'},
 refinery:{name:['冶铁作','Steel works'],cost:{silver:200,ore:60,stone:60},jobs:36,input:{ore:14,coal:6},output:{steel:12},wage:6,color:'#5f7477'}
});
const REALM_ORDERS={
 restaurant:{banquet:{name:['宴席菜','Banquet menu'],input:{grain:10,salt:3,wine:4,fish:4,vegetables:8,fruit:4,beans:4},output:{silver:88}}},
 beauty:{fine:{name:['精装香膏','Packaged beauty goods'],input:{herbs:8,oil:4,cloth:3,ceramics:2},output:{cosmetics:16}}},
 arsenal:{heavycannon:{name:['精铸炮组','Refined cannon batch'],input:{steel:18,copper:12,blackpowder:12,timber:10},output:{cannon:2,shot:20}}}
};
Object.assign(NODEK,{clay:{zh:'河谷陶土',en:'River-valley clay',ic:'🟤',y:{clay:60}},copper:{zh:'铜矿集运',en:'Copper supply',ic:'🟠',y:{copper:40}},coal:{zh:'河东石炭',en:'Hedong coal',ic:'⬛',y:{coal:60}},hemp:{zh:'麻田',en:'Hemp fields',ic:'🌱',y:{hemp:50}}});NODEK.fish.y.fish=30;
for(const [terr,k,zh,en]of [['taiyuan','coal','太原石炭集运','Taiyuan coal supply'],['jinzhou_mines','coal','晋州石炭场','Jinzhou coal yard'],['jingzhao','clay','渭河陶土场','Wei River clay yard'],['henan','clay','洛河陶土场','Luo River clay yard'],['fengxiang','copper','凤翔铜料集运','Fengxiang copper supply'],['longde','copper','潞州铜料集运','Longde copper supply'],['qingshui','hemp','清水麻田','Qingshui hemp fields'],['jingzhou','hemp','泾州麻田','Jingzhou hemp fields']]){const t=CT[terr];NODES.push({id:'realm_'+terr+'_'+k,terr,k,zh,en,lon:t.lon+.065,lat:t.lat-.06});}
{const old=dynastyInit;dynastyInit=function(){old();if(!CG)return;const d=dynastyState();for(const [id,s]of Object.entries(CG.T)){for(const k in REALM_GOODS)s.st[k]=s.st[k]||0;if(s.own==='song'&&!s.realmSeeded){s.realmSeeded=true;Object.assign(s.st,{vegetables:30,fruit:20,beans:30,hemp:30,cloth:20,paper:20,ceramics:15,clay:20});for(const n of NODES.filter(n=>n.terr===id))for(const [k,v]of Object.entries(NODEK[n.k].y))if(REALM_GOODS[k])s.st[k]+=v;}
 const m=d.markets[id];if(m)for(const k of REALM_EXPORTS)if(m.demand[k]==null)m.demand[k]=24;}};}
function realmMarketMonth(id,scale){const s=CG.T[id],m=dynastyState().markets[id];for(const k of REALM_EXPORTS)if(!['wine','cosmetics'].includes(k)){m.demand[k]=Math.min(60,(m.demand[k]||0)+8*scale);s.st[k]=Math.max(0,s.st[k]-4*scale);}for(const k of ['vegetables','beans','fruit'])s.st[k]=Math.min(300,s.st[k]+8*scale);}
function realmReserve(s,k){let n=0;for(const key of ['restaurant','beauty','papermill']){const b=s.businesses[key];if(b?.level&&!b.paused){const p=dynastyProduction(Object.keys(CG.T).find(id=>CG.T[id]===s),key);n+=(p.input[k]||0)*b.level*2;}}if(k==='paper'&&s.accounts)n+=4;return Math.max(n,({cloth:20,ceramics:25,paper:20,steel:25,copper:20})[k]||0);}
NODEK.copper.y.silver=35;
