'use strict';
function bannerReserveCandidates(a){
 const routes=new Map(),rows=[];if(!a||!careFriendly(a.loc))return rows;
 for(const u of Object.values(CG.U)){
  const city=u.loc?.v;if(!city||!owned(city)||u.bannerFor||carePending(u.id)||!(u.men>0))continue;
  if(!routes.has(city)){const path=supplyPath(city,a.loc);routes.set(city,path?{path,months:path.length-1,km:path.slice(1).reduce((n,id,i)=>n+rtsKm(path[i],id),0)}:null);}
  const route=routes.get(city);if(route)rows.push({u,city,...route,men:Math.floor(u.men)});
 }
 return rows.filter(r=>r.men>0).sort((x,y)=>x.months-y.months||x.km-y.km||x.u.id-y.u.id);
}
function bannerReservePlan(id,count){
 const a=CG&&bannerArmy(id),empty={ok:false,rows:[],available:0,max:0,slots:0};if(!a||!careFriendly(a.loc))return {...empty,reason:Tz('军旗须在友方城镇','Banner must be at a friendly settlement')};
 const candidates=bannerReserveCandidates(a),slots=Math.min(candidates.length,Math.max(0,Math.floor(bannerSpace({army:a.id})))),available=candidates.reduce((n,r)=>n+r.men,0),suffix=new Array(candidates.length+1);let best=[];suffix[candidates.length]=Array(slots+1).fill(0);
 // At each distance, retain enough later manpower to satisfy the exact count
 // within the actual company limit. Do not let small nearby remnants strand it.
 for(let i=candidates.length-1;i>=0;i--){best=[...best,candidates[i].men].sort((a,b)=>b-a).slice(0,slots);const sums=[0];for(let j=0;j<slots;j++)sums.push(sums[j]+(best[j]||0));suffix[i]=sums;}
 const max=suffix[0][slots],plan={ok:false,rows:[],available,max,slots};
 if(!dynastyPlanning())return {...plan,reason:Tz('仅限筹划阶段','Planning only')};
 if(!Number.isSafeInteger(count)||count<=0)return {...plan,reason:Tz('输入征调人数','Enter a whole soldier count')};
 if(count>max)return {...plan,reason:!available?Tz('没有可达的未编入军旗士兵','No unassigned soldiers within reach'):!slots?Tz('军旗编制已满','Banner company slots full'):Tz(`本旗当前最多可征调${max}人`,`At most ${max} soldiers fit this banner now`)};
 let left=count,room=slots;for(let i=0;i<candidates.length&&left>0;i++){
  const row=candidates[i],n=Math.min(row.men,left);if(!room||suffix[i+1][room-1]<left-n)continue;
  plan.rows.push({...row,n});left-=n;room--;
 }
 return {...plan,ok:left===0,count,reason:left?Tz('当前无法凑足人数','Exact count unavailable'):''};
}
function bannerAssignNearest(id,count){
 const plan=bannerReservePlan(id,count);if(!plan.ok)return plan;const target=bannerArmy(id).id;
 const batches={};for(const row of plan.rows){
  const u=row.u;let selected=u;
  if(row.n!==u.men||(u.wnd||0)>0){const copy=JSON.parse(JSON.stringify(u));delete copy.id;copy.men=row.n;copy.wnd=0;selected=newUnit(u.type,row.n,copy);u.men-=row.n;}
  (batches[row.city]||(batches[row.city]=[])).push(selected.id);
 }
 for(const [city,units]of Object.entries(batches))bannerStartOrder(city,{army:target},units);
 bannerLog(`征调${count}名现有预备兵，按就近道路归旗。`,`Called ${count} existing reserve soldiers to join by the nearest available roads.`);saveGame();return plan;
}
function bannerReserveForm(a){
 const form=document.createElement('form');form.className='banner-reserves';form.dataset.reserveBanner=a.id;const label=document.createElement('label');label.textContent=Tz('征调预备兵','Assign reserves');const input=document.createElement('input');input.type='number';input.min='1';input.step='1';input.inputMode='numeric';input.id='bannerReserveCount';input.setAttribute('aria-label',Tz('征调人数','Soldiers to assign'));
 const counts=BANNER_UI.reserveCounts||(BANNER_UI.reserveCounts={});input.value=Object.prototype.hasOwnProperty.call(counts,a.id)?counts[a.id]:'100';label.appendChild(input);form.appendChild(label);
 const button=document.createElement('button');button.type='submit';button.className='btn';button.textContent=Tz('就近归队','Assign nearest soldiers');button.id='bannerAssignNearest';form.appendChild(button);
 const info=document.createElement('small');info.className='banner-reserve-status';info.setAttribute('aria-live','polite');form.appendChild(info);
 const update=()=>{counts[a.id]=input.value;const p=bannerReservePlan(a.id,Number(input.value));input.max=String(p.max);button.disabled=!p.ok;button.classList.toggle('dis',!p.ok);const origins=new Map();for(const r of p.rows){const old=origins.get(r.city)||{n:0,months:r.months};old.n+=r.n;origins.set(r.city,old);}info.textContent=`${p.available} `+Tz('名未编入军旗','unassigned')+' · '+(p.ok?[...origins].map(([city,r])=>`${tName(city)} ${r.n} · ${r.months} `+Tz('个月',r.months===1?'month':'months')).join(' / '):p.reason);};
 input.oninput=update;form.onsubmit=e=>{e.preventDefault();button.disabled=true;const p=bannerAssignNearest(a.id,Number(input.value));if(p.ok){counts[a.id]='';bannerUIAfter(Tz(`已征调${p.count}人，现有兵马沿路归队。`,`Assigned ${p.count} soldiers; detachments are joining along the roads.`));}else update();};update();return form;
}
{const old=rosterUI;rosterUI=function(...args){const r=old(...args),a=CG&&bannerArmy(BANNER_UI.army),p=$('cRoster');if(a&&p&&BANNER_UI.view!=='create'){const overview=p.querySelector('.banner-main .banner-overview');if(overview)overview.after(bannerReserveForm(a));}return r;};}
