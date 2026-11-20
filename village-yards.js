// v0.31 (t253) classic village buildings re-rendered to the hospital's standard: squarish walled yards with painted brick, plaster and
// rammed-earth wall faces, tiled or thatched roofs (ridge, acroteria), AO and soft shadows, and dense yard props (jars, sacks, baskets,
// barrels, woodpiles, coops, vegetable beds, laundry, plants). Art: art/vyards.py (Blender) -> assets/<tier>/vyards.webp (one atlas).
// Houses (by the core's house variant), the six workshops and the armoury court draw as these plates (the user's treasury and the shrine keep theirs);
// anything not covered keeps the v0.8 sprites. Artisans stand at the station each workshop plate was furnished for.
'use strict';
const VY_META={"plates":{"thA":{"W":124,"H":150,"oy":60,"st":[]},"thB":{"W":124,"H":150,"oy":60,"st":[]},"tiA":{"W":124,"H":160,"oy":60,"st":[]},"tiB":{"W":124,"H":160,"oy":60,"st":[]},"tav":{"W":124,"H":160,"oy":60,"st":[]},"gen":{"W":124,"H":170,"oy":60,"st":[]},"wk_smithy":{"W":150,"H":160,"oy":56,"st":[[57,118,"hammer",0]]},"wk_tannery":{"W":150,"H":160,"oy":56,"st":[[30,124,"stir",3]]},"wk_bowyer":{"W":150,"H":160,"oy":56,"st":[[65,132,"weave",3]]},"wk_armour":{"W":150,"H":160,"oy":56,"st":[[51,126,"hammer",0]]},"wk_saddle":{"W":150,"H":160,"oy":56,"st":[[59,126,"weave",0]]},"wk_fire":{"W":150,"H":160,"oy":56,"st":[[55,128,"tend",0]]},"armoury":{"W":440,"H":280,"oy":70,"st":[]},"treasury":{"W":220,"H":200,"oy":70,"st":[[110,174,"count",3]]}},"rects":{"hi":{"thA":[0,0,186,225],"thB":[188,0,186,225],"tiA":[376,0,186,240],"tiB":[564,0,186,240],"tav":[752,0,186,240],"gen":[940,0,186,255],"wk_smithy":[1128,0,225,240],"wk_tannery":[0,257,225,240],"wk_bowyer":[227,257,225,240],"wk_armour":[454,257,225,240],"wk_saddle":[681,257,225,240],"wk_fire":[908,257,225,240],"armoury":[0,499,660,420],"treasury":[662,499,330,300]},"md":{"thA":[0,0,124,150],"thB":[126,0,124,150],"tiA":[252,0,124,160],"tiB":[378,0,124,160],"tav":[504,0,124,160],"gen":[630,0,124,170],"wk_smithy":[756,0,150,160],"wk_tannery":[0,172,150,160],"wk_bowyer":[152,172,150,160],"wk_armour":[304,172,150,160],"wk_saddle":[456,172,150,160],"wk_fire":[608,172,150,160],"armoury":[0,334,440,280],"treasury":[442,334,220,200]},"lo":{"thA":[0,0,62,75],"thB":[64,0,62,75],"tiA":[128,0,62,80],"tiB":[192,0,62,80],"tav":[256,0,62,80],"gen":[320,0,62,85],"wk_smithy":[384,0,75,80],"wk_tannery":[0,87,75,80],"wk_bowyer":[77,87,75,80],"wk_armour":[154,87,75,80],"wk_saddle":[231,87,75,80],"wk_fire":[308,87,75,80],"armoury":[0,169,220,140],"treasury":[222,169,110,100]}}};
const VY={img:null,tier:null,V:'t253a'};
const VY_HOUSE={0:'thA',1:'thB',2:'thA',8:'thB',3:'tiA',5:'tiA',9:'tiB',4:'tiB',6:'gen',7:'tav'};
const VY_WK=['wk_smithy','wk_tannery','wk_bowyer','wk_armour','wk_saddle','wk_fire'];  // by WKV index
function vyLoad(){const t=GFX.tier||'md';if(VY.tier===t)return;VY.tier=t;VY.img=null;const im=new Image();im.decoding='async';im.onload=()=>{VY.img=im;};im.src=`${ART_BASE}${t}/vyards.webp?v=${VY.V}`;}
function vyOn(){return MODE==='cvil'&&!!VY.img&&(typeof vlOn!=='function'||vlOn());}
// draw plate n so that its yard's bottom edge sits at world (x, yb), centred on x
function vyDraw(n,x,yb){const P=VY_META.plates[n],R=VY_META.rects[VY.tier]?.[n];if(!P||!R)return false;ctx.drawImage(VY.img,R[0],R[1],R[2],R[3],x-P.W/2,yb-P.H,P.W,P.H);return true;}
function vyStation(n,x,yb){const P=VY_META.plates[n];if(!P||!P.st.length)return null;const [sx,sy,act,dir]=P.st[0];return {x:x-P.W/2+sx,y:yb-P.H+sy,act,dir};}
{const _sp=sprProp;sprProp=function(name,x,y,v=0,sc=1){if(vyOn()){
    if(name==='vhouse8'&&VY_HOUSE[v]&&vyDraw(VY_HOUSE[v],x,y+40))return true;
    if((name==='vwk'||name==='vwk8')&&VY_WK[v]&&vyDraw(VY_WK[v],x,y+40))return true;}
  return _sp(name,x,y,v,sc);};}
// the armoury court goes under the racks
{const old=cvilArmoury7;cvilArmoury7=function(add,g,s){vyLoad();if(vyOn()){const A=VZ.arm;add(A[1]-60,()=>vyDraw('armoury',(A[0]+A[2])/2,A[3]+30));}return old.apply(this,arguments);};}
{const old=cvilWorkshops7;cvilWorkshops7=function(){vyLoad();return old.apply(this,arguments);};}
