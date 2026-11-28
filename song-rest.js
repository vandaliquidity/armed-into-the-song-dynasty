'use strict';
// Seated poses use the same civilian meshes, materials and lighting as walking.
const SONG_REST={poses:new Map(),loading:false};
function songRestLoad(){
 if(SONG_REST.loading)return;SONG_REST.loading=true;
 for(const role of ['man','woman','porter','merchant','elder','child']){
  const im=new Image();im.onload=()=>{
   const c=mkCanvas(im.width,im.height),g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
   for(let row=0;row<8;row++){
    const data=g.getImageData(0,row*160,128,160).data;let l=128,r=0,t=160,b=0;
    for(let y=0;y<160;y++)for(let x=0;x<128;x++)if(data[(y*128+x)*4+3]>110){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
    if(r<=l||b<=t)continue;const sprite=mkCanvas(r-l+7,b-t+7);sprite.getContext('2d').drawImage(c,l-3,row*160+t-3,sprite.width,sprite.height,0,0,sprite.width,sprite.height);
    SONG_REST.poses.set(role+':'+row,{c:sprite,ax:64-l+3,ay:b-t+3,height:b-t+1,id:'rest:'+role+':'+row});
   }
  };im.src=ART_BASE+'song/people-rest/'+role+'.png?v=0.70';
 }
}
function songSeated(g,p){
 songRestLoad();const role=songPersonName(p.spr)||'man',dir=((Math.round((p.f||0)/(TAU/8))%8)+8)%8,pose=SONG_REST.poses.get(role+':'+dir);
 // A low stool remains a furnishing of the workplace, never a new inventory item.
 const x=p.x,y=p.y-5;g.strokeStyle='#63482d';g.lineWidth=2;g.beginPath();g.moveTo(x-5,y);g.lineTo(x-5,y-9);g.lineTo(x+5,y-9);g.lineTo(x+5,y);g.stroke();g.fillStyle='#a68554';g.fillRect(x-6,y-11,12,3);
 if(pose)return songDrawPerson(g,pose,p.x,p.y,VP.H*SONG_PEOPLE.scale*.77,false);
 return sprUnit(p.spr,p.x,p.y,9,p.f,0);
}
setTimeout(songRestLoad,0);
