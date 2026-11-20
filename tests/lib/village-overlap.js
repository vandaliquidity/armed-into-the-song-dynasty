// t255 footprint + click-box overlap check for the main village view (loaded by tests/village-overlap.cjs and the dev report).
// Every top-level sprProp call in one cvil8Frame is drawn alone into a world-space mask. Its ground footprint is the part of the mask
// between the ground anchor mirrored above itself and the lowest opaque row (kit sprites are anchored at the centre of their base),
// flat ground items (fields) use the whole mask, trees use the trunk. Buildings, enclosures, trees, fields and haystacks are checked
// pairwise; cargo piles, racks, targets, banners and animals are yard contents and are not.
window.__vOverlap=function(opt={}){
 const CAT=n=>/^(fence|fence8|cwall|cgate)$/.test(n)?'encl':/^(tree|tree8)$/.test(n)?'tree':/^(field)$/.test(n)?'field':/^(haystack|hay8)$/.test(n)?'hay':
   /^(stk|stk8|rack|rack8|butt|butt8|banner|animal|stall|stall8)$/.test(n)?'prop':'bld';
 const W=VWW,H=VWH,S=2,oc=document.createElement('canvas');oc.width=W;oc.height=H;const ox=oc.getContext('2d',{willReadFrequently:true});
 const inst=[];let depth=0,cur=null;const _di=ctx.drawImage,_sp=sprProp;
 const base=()=>new DOMMatrix().scale(DPR,DPR).translate(CVIL._ox,CVIL._oy).scale(CVIL._sc,CVIL._sc);let B=null;
 ctx.drawImage=function(...a){if(cur){if(!B)B=base().inverse();ox.setTransform(B.multiply(ctx.getTransform()));const ga=ox.globalAlpha;ox.globalAlpha=1;try{ox.drawImage(...a);}catch(e){}ox.globalAlpha=ga;cur.d=1;}return _di.apply(this,a);};
 sprProp=function(n,x,y,v=0,sc=1){if(depth>0)return _sp.apply(this,arguments);const st=(new Error().stack.split('\n')[2]||'').trim().replace(/^at /,'').replace(/\(?https?:\/\/[^/]+\/([\w./-]*?)(?:\?[^:]*)?:(\d+):\d+\)?/,'$1:$2');
   ox.setTransform(1,0,0,1,0,0);ox.clearRect(0,0,W,H);cur={n,x,y,v,sc,st,cat:CAT(n)};depth++;let r;try{r=_sp.apply(this,arguments);}finally{depth--;}const o=cur;cur=null;if(o.d)inst.push(foot(o));return r;};
 function foot(o){ox.setTransform(1,0,0,1,0,0);const d=ox.getImageData(0,0,W,H).data;let x0=W,x1=-1,y0=H,y1=-1;
   for(let y=0;y<H;y+=S)for(let x=0;x<W;x+=S)if(d[(y*W+x)*4+3]>110){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
   if(x1<0)return Object.assign(o,{fp:null});
   let fy0=y0,fy1=y1;if(o.cat==='tree'){const r=8;return Object.assign(o,{bb:[x0,y0,x1,y1],fp:{x0:Math.round(o.x-r),y0:Math.round(o.y-r/2),x1:Math.round(o.x+r),y1:Math.round(o.y+r/2),ell:1}});}
   if(o.cat!=='field'){const ay=Math.round(o.y);fy0=Math.max(y0,y1>ay+4?2*ay-y1:ay-8);fy1=y1;}
   const cols=Math.ceil(W/S),bits=new Set(),all=new Set();if(o.cat==='bld')for(let y=y0;y<=y1;y+=S)for(let x=x0;x<=x1;x+=S)if(d[(y*W+x)*4+3]>110)all.add((y/S|0)*cols+(x/S|0));let fx0=W,fx1=-1;for(let y=fy0-fy0%S;y<=fy1;y+=S)for(let x=x0;x<=x1;x+=S)if(d[(y*W+x)*4+3]>110){bits.add((y/S|0)*cols+(x/S|0));if(x<fx0)fx0=x;if(x>fx1)fx1=x;}
   return Object.assign(o,{bb:[x0,y0,x1,y1],fp:{x0:fx0,y0:fy0,x1:fx1,y1:fy1,bits},all});}
 const fr=opt.frame||(()=>cvil8Frame(1/60));try{fr();}finally{ctx.drawImage=_di;sprProp=_sp;}
 // the hospital ward is drawn straight from its plate (not a sprProp): its footprint is the plate's ground rect
 if(typeof vlOn==='function'&&vlOn()&&typeof VL!=='undefined'){const X=VL.X,Y=VL.Y+VL_META.oy,cols=Math.ceil(W/S),bits=new Set();for(let y=Y;y<VL.Y+VL_META.H;y+=S)for(let x=X;x<X+VL_META.W;x+=S)bits.add((y/S|0)*cols+(x/S|0));
   const all=new Set();for(let y=VL.Y;y<VL.Y+VL_META.H;y+=S)for(let x=X;x<X+VL_META.W;x+=S)all.add((y/S|0)*cols+(x/S|0));inst.push({n:'ward',x:X+VL_META.W/2,y:VL.Y+VL_META.H,cat:'bld',st:'village-life.js',bb:[X,VL.Y,X+VL_META.W,VL.Y+VL_META.H],fp:{x0:X,y0:Y,x1:X+VL_META.W,y1:VL.Y+VL_META.H,bits},all});}
 const cols=Math.ceil(W/S),CHK=new Set(['bld|bld','bld|encl','bld|tree','bld|field','bld|hay','encl|tree','field|tree','field|hay','encl|field']);
 const pairs=[];const L=inst.filter(o=>o.fp&&o.cat!=='prop');
 for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j],k=[a.cat,b.cat].sort().join('|');if(!CHK.has(k))continue;const A=a.fp,Bf=b.fp;
   let occ=0;if(k==='bld|bld'&&a.all&&b.all&&!(Math.round(a.x)===Math.round(b.x)&&Math.round(a.y)===Math.round(b.y))){const [bk,fr]=a.y<b.y?[a,b]:[b,a];for(const q of bk.fp.bits)if(fr.all.has(q))occ+=S*S;}
   if(occ>=60)pairs.push({a:a.n+'@'+Math.round(a.x)+','+Math.round(a.y)+' ['+a.st+']',b:b.n+'@'+Math.round(b.x)+','+Math.round(b.y)+' ['+b.st+']',kind:'bld covers bld base',area:occ,at:[Math.round(((a.bb||[a.x])[0]+(b.bb||[b.x])[0])/2),Math.round((a.y+b.y)/2)]});
   if(A.x1<Bf.x0||Bf.x1<A.x0||A.y1<Bf.y0||Bf.y1<A.y0)continue;let n=0;
   if(A.ell||Bf.ell){const T=A.ell?A:Bf,O=A.ell?Bf:A;const cx=(T.x0+T.x1)/2,cy=(T.y0+T.y1)/2;if(O.ell){n=Math.hypot(cx-(O.x0+O.x1)/2,cy-(O.y0+O.y1)/2)<12?99:0;}else for(let y=T.y0;y<=T.y1;y+=S)for(let x=T.x0;x<=T.x1;x+=S)if(((x-cx)/8)**2+((y-cy)/4)**2<=1&&O.bits.has((y/S|0)*cols+(x/S|0)))n+=S*S;}
   else{const sm=A.bits.size<Bf.bits.size?A.bits:Bf.bits,lg=sm===A.bits?Bf.bits:A.bits;for(const q of sm)if(lg.has(q))n+=S*S;}
   if(Math.round(a.x)===Math.round(b.x)&&Math.round(a.y)===Math.round(b.y))continue;   // two draws of one composite building (base + roof)
   const min=k==='bld|encl'||k==='encl|field'?80:k.includes('tree')?24:40;if(n>=min)pairs.push({a:a.n+'@'+Math.round(a.x)+','+Math.round(a.y)+' ['+a.st+']',b:b.n+'@'+Math.round(b.x)+','+Math.round(b.y)+' ['+b.st+']',kind:k,area:n,at:[Math.round((Math.max(A.x0,Bf.x0)+Math.min(A.x1,Bf.x1))/2),Math.round((Math.max(A.y0,Bf.y0)+Math.min(A.y1,Bf.y1))/2)]});}
 // click boxes: building boxes (not people, not the storehouse bins inside the storehouse row) must not overlap each other
 const person=t=>/匠人|artisan|库吏|clerk|司仓|stacker|Carrying|Delivering|Harvest|Tax clerk|税吏|搬运|送交|收割|伤兵 |Ready|待命|Patient|病|医/.test(t)&&!/Hospital/.test(t);
 const hb=CVIL.hot.filter(h=>!person(h.t)).map(h=>({r:h.r,t:h.t.split('\n')[0]}));const hits=[];
 for(let i=0;i<hb.length;i++)for(let j=i+1;j<hb.length;j++){const a=hb[i].r,b=hb[j].r,w=Math.min(a[2],b[2])-Math.max(a[0],b[0]),h=Math.min(a[3],b[3])-Math.max(a[1],b[1]);if(w>2&&h>2)hits.push({a:hb[i].t,b:hb[j].t,area:Math.round(w*h),r:[Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])]});}
 return {n:inst.length,checked:L.length,pairs,hot:hb.length,hotPairs:hits,inst:opt.keep?inst.map(o=>({n:o.n,cat:o.cat,x:Math.round(o.x),y:Math.round(o.y),st:o.st,fp:o.fp&&[o.fp.x0,o.fp.y0,o.fp.x1,o.fp.y1]})):undefined};};
