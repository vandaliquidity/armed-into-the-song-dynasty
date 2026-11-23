'use strict';
function mainBanner(){
 if(!CG)return null;const state=CG.bannerContinuity||(CG.bannerContinuity={v:1,main:null});
 const captain=CG.armies.find(a=>a.cmd==='lead'&&a.mem.includes('lead'))||(serviceAvailable('s:lead')&&CG.armies.find(a=>a.mem.includes('lead')));
 if(captain&&serviceAvailable('s:lead'))captain.cmd='lead';
 const a=captain||CG.armies.find(a=>a.id===state.main)||CG.armies.find(a=>a.linBanner)||CG.armies.find(a=>a.id===1);
 if(a){state.main=a.id;for(const other of CG.armies)other.linBanner=other===a;}return a||null;
}
function mainBannerStatus(a){
 if(a!==mainBanner())return '';const status=serviceAvailable('s:lead')?'':serviceStatus('s:lead');
 const acting=a.cmd!=='lead'?(a.cmd==='acting'?Tz('军士代领','Acting sergeant'):Tz('代领：','Acting commander: ')+Tz(...(()=>{const p=SQUAD.find(s=>s.id===a.cmd)||offSD(a);return [p.zh,p.en];})())):'';
 return [acting,status].filter(Boolean).join(' · ');
}
function mainBannerRetain(a){
 if(!a||CG.armies.some(x=>x.id===a.id))return;
 // Keep a headquarters, never restore casualties or detached personnel.
 a.units=a.units.filter(id=>CG.U[id]?.loc?.a===a.id);a.mem=a.mem.filter(id=>serviceAvailable('s:'+id));
 if(!a.mem.includes(a.cmd))a.cmd=a.mem[0]||(a.off&&serviceAvailable('o:'+a.off)?'o'+a.off:'acting');
 CG.armies.push(a);mainBanner();
}
{const old=armyName;armyName=function(a){return a?.linBanner?old({...a,cmd:'lead'}):old(a);};}
{const old=livDefault;livDefault=function(a){return a?.linBanner?{c:'#c8901a',ch:'林'}:old(a);};}
{const old=serviceDetach;serviceDetach=function(key){mainBanner();return old(key);};}
{const old=resolveBattle;resolveBattle=function(...args){const a=mainBanner(),r=old(...args);if(r){mainBannerRetain(a);mainBanner();saveGame();}return r;};}
{const old=campAfterStory;campAfterStory=function(...args){const a=mainBanner(),r=old(...args);mainBannerRetain(a);mainBanner();return r;};}
{const old=companionRejoin;companionRejoin=function(id,at){
 const a=id==='lead'&&mainBanner();if(!a||a.loc!==at){const r=old(id,at);if(r&&id==='lead'){mainBanner();saveGame();}return r;}
 if(!serviceAvailable('s:lead')||CG.phase!==0||CG.posts?.lead!==at||!owned(at))return false;
 bannerRemoveOfficer('s:lead');bannerAttachOfficer('s:lead',{army:a.id});a.cmd='lead';mainBanner();campRefresh();saveGame();return true;
};}
function locateBanner(id){const a=CG?.armies.find(a=>a.id===id);if(!a||!CT[a.loc])return false;showCamp();for(const modal of campEl().querySelectorAll('.modal'))modal.remove();CSEL={a:a.id};CSELM.clear();CSELM.add(a.id);focusOn(a.loc);campUI();return true;}
{const old=rosterUI;rosterUI=function(...args){mainBanner();const r=old(...args),p=$('cRoster'),a=CG&&bannerArmy(BANNER_UI.army);if(p&&a){const body=p.querySelector('.banner-main');if(body){const row=document.createElement('div');row.className='banner-actions';const b=dynastyButton(row,'定位军旗','Locate banner',()=>locateBanner(a.id));b.dataset.locateBanner=a.id;body.querySelector('.banner-overview')?.after(row);const status=mainBannerStatus(a);if(status){const line=document.createElement('small');line.className='banner-command-status';line.textContent=status;row.appendChild(line);}}}return r;};}
{const old=armyPanel;armyPanel=function(a){const p=old(a),status=mainBannerStatus(a);if(status){const s=document.createElement('small');s.className='banner-command-status';s.textContent=status;p.appendChild(s);}return p;};}
{const old=campStart;campStart=function(...args){const r=old(...args);mainBanner();saveGame();return r;};}
{const old=campLoad;campLoad=function(...args){const r=old(...args);mainBanner();saveGame();return r;};}
{const old=journeyBlocker;journeyBlocker=function(){if(!serviceAvailable('s:lead'))return serviceStatus('s:lead');return old();};}
