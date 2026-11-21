'use strict';
// Forward encampments are schematic gameplay sites, not a claim that Jin held
// the nearby historical cities in 1120. The broader map uses geographic coordinates.
const EASTERN_SITES=[
 {id:'jin_east',zh:'燕山金军行营',en:'Jin Yanshan headquarters',lon:116.65,lat:40.05,kind:'fort',pop:7000,men:9000},
 {id:'jin_west',zh:'云中金军行营',en:'Jin Yunzhong headquarters',lon:113.35,lat:40.15,kind:'fort',pop:7000,men:9000},
 {id:'jin_juyong',zh:'居庸北营',en:'Juyong northern camp',lon:116.08,lat:40.3,kind:'pass',pop:2800,men:1600},
 {id:'jin_yan_supply',zh:'燕北军需镇',en:'Yanbei supply town',lon:115.85,lat:39.75,kind:'town',pop:3500,men:1400},
 {id:'jin_datong_horses',zh:'云中牧马站',en:'Yunzhong horse station',lon:112.95,lat:39.8,kind:'town',pop:3200,men:1400},
 {id:'jin_south',zh:'桑干前哨',en:'Sanggan forward post',lon:113.6,lat:39.35,kind:'fort',pop:2500,men:1800}
];
for(const t of EASTERN_SITES)frontierTerr({...t,own:'jin',trait:t.id.includes('horses')?'horse':t.kind==='town'?'farm':'iron',str:t.men,region:'jin_frontier'},t.id==='jin_west'?'taiyuan':t.id==='jin_east'?'zhending':t.id==='jin_datong_horses'?'jin_west':'jin_east');
frontierTerr({id:'xia_yellow_frontier',zh:'夏军东北河防寨',en:'Xia northeastern river outpost',lon:111.75,lat:39.35,kind:'fort',own:'xia',pop:260,trait:'horse',str:8,region:'xia'},'xiazhou');frontierLink('jin_south','xia_yellow_frontier');
for(const [a,b]of [['jin_east','jin_west'],['jin_juyong','jin_yan_supply'],['jin_west','jin_south'],['jin_south','xiazhou'],['jin_south','taiyuan']])frontierLink(a,b);
FRONTIER_REGIONS.push({id:'jin_frontier',zh:'金国东北边地',en:'Jin northeastern frontier',hub:'jin_east',box:[112.5,39.1,117.2,40.5],color:'#804338'});
const JIN_ART={image:new Image(),ready:false};JIN_ART.image.onload=()=>JIN_ART.ready=true;JIN_ART.image.src='assets/jin/jin-atlas.png?v=0.52';
function jinSprite(g,kind,x,y,size=52,face=0,frame=0){if(!JIN_ART.ready)return false;const base={foot:0,lancer:2,archer:4,camp:6}[kind]??0,row=base+(kind==='camp'?0:Math.abs(frame|0)%2),dir=((Math.round(face/(Math.PI/4))%8)+8)%8;g.drawImage(JIN_ART.image,dir*160,row*160,160,160,x-size/2,y-size*.78,size,size);return true;}
