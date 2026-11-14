'use strict';
const COUNCIL_UI={id:HOME,tab:'business',trade:'local',court:'pol'};
const councilGovernors=govUI;
function councilTradeNavigation(body,id){const row=document.createElement('div');row.className='dy-toolbar';for(const [key,zh,en]of [['local','州县现货','Local markets'],['contracts','商帮、官贸与约货','Charters & contracts']]){const b=dynastyButton(row,zh,en,()=>{COUNCIL_UI.trade=key;CP_TAB='trade';dynastyUI(id,'markets');});b.dataset.trade=key;b.classList.toggle('dy-selected',COUNCIL_UI.trade===key);}body.appendChild(row);}
function councilSection(body,id,tab){v7s();tribes();tribState();const re=()=>{syncRes();saveGame();if(MODE==='camp')campUI();else if(MODE==='cvil')cvilUI();dynastyUI(id,tab);};
 if(tab==='production'){CP_TAB='prod';cpProd(body,re);body.insertAdjacentHTML('beforeend','<h3>'+Tz('本地新增货品','Local specialty stocks')+'</h3><p>'+dynastyGoods(Object.fromEntries([...Object.keys(DY_GOODS)].map(k=>[k,CG.T[id].st[k]||0])))+'</p>');return;}
 const nav=document.createElement('div');nav.className='dy-toolbar';for(const [key,zh,en]of [['pol','朝廷、民望与诏令','Court & decrees'],['trib','贡赋与部族','Dues & tribes'],['gov','知事与自治','Governors']]){const b=dynastyButton(nav,zh,en,()=>{COUNCIL_UI.court=key;dynastyUI(id,'court');});b.dataset.court=key;b.classList.toggle('dy-selected',COUNCIL_UI.court===key);}body.appendChild(nav);
 const section=COUNCIL_UI.court;CP_TAB=section;
 if(section==='gov'){councilGovernors();const panel=$('cGov');if(panel){panel.lastElementChild?.remove();const inner=document.createElement('div');inner.id='cGov';inner.append(...panel.childNodes);panel.remove();body.appendChild(inner);}}
 else (section==='trib'?cpTrib:cpPol)(body,re);
}
cpUI=function(tab){if(!CG)return;CP_TAB=tab||CP_TAB;if(CP_TAB==='trade'){if(tab)COUNCIL_UI.trade='contracts';dynastyUI(COUNCIL_UI.id,'markets');}else if(CP_TAB==='prod')dynastyUI(COUNCIL_UI.id,'production');else{COUNCIL_UI.court=CP_TAB==='trib'?'trib':'pol';dynastyUI(COUNCIL_UI.id,'court');}};
govUI=function(){COUNCIL_UI.court='gov';dynastyUI(COUNCIL_UI.id,'court');};
{const old=settleUI;settleUI=function(id,tab){if(owned(id)&&(tab==='mkt'||(!tab&&SET_TAB==='mkt'))){SET_TAB='over';COUNCIL_UI.trade='local';dynastyUI(id,'markets');return;}return old(id,tab);};}
{const old=campUI;campUI=function(){old();if(MODE!=='camp')return;$('cCPB')?.remove();$('cGovB')?.remove();const b=$('cDynastyB');if(b){b.innerHTML=campaignIcon('trade','nav-icon')+'<span class="nav-label">'+Tz('商贸与朝政','Commerce & Council')+((CG.pet||CG.xdem)?' ❗':'')+'</span>';b.onclick=()=>dynastyUI(HOME,COUNCIL_UI.tab);}const p=$('cChainB');if(p)p.onclick=()=>dynastyUI(HOME,'production');};}
for(const [id,section]of [['trade','markets'],['tribute','court'],['gov','court']]){const lesson=COACH_DEF.find(x=>x.id===id);if(!lesson)continue;lesson.when=()=>visEl('#cDynastyB')&&!!CG;lesson.parts=[{sel:'#cDynastyB',done:()=>!!$('cDynasty')},{sel:`#cDynasty [data-council="${section}"]`,done:()=>COUNCIL_UI.tab===section&&!!$('cDynasty')},{sel:'#cDynasty .dy-body',done:()=>!$('cDynasty')}];}
