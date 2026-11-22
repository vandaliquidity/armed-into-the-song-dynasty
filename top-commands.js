'use strict';
function topLabel(node,zh,en,icon){node.innerHTML=(icon?campaignIcon(icon,'nav-icon'):'')+'<span>'+Tz(zh,en)+'</span>';}
function topMenu(nav,key,zh,en){
 const menu=document.createElement('details');menu.className='top-menu';menu.dataset.menu=key;
 const summary=document.createElement('summary');summary.textContent=Tz(zh,en);const body=document.createElement('div');body.className='top-menu-body';menu.append(summary,body);nav.appendChild(menu);
 menu.addEventListener('toggle',()=>{if(!menu.open)return;for(const other of nav.querySelectorAll('details.top-menu'))if(other!==menu)other.open=false;const r=summary.getBoundingClientRect(),w=Math.min(340,innerWidth-16);body.style.width=w+'px';body.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+'px';body.style.top=(r.bottom+5)+'px';body.style.maxHeight=Math.max(100,innerHeight-r.bottom-18)+'px';});
 body.addEventListener('click',e=>{if(e.target.closest('.btn')&&!e.target.closest('#campaignMinimap'))menu.open=false;});return body;
}
function officerTabs(which){const d=$('cOff');if(!d||d.querySelector('.officer-tabs'))return;const row=document.createElement('div');row.className='officer-tabs';for(const [key,zh,en,fn]of [['service','五人队与晋升','Companions & promotions',campOfficers],['recruit','任用与招募','Appointments & recruitment',offUI]]){const b=btn(zh,en,()=>{$('cOff')?.remove();fn();},key===which?'gold':'');b.dataset.officerTab=key;row.appendChild(b);}d.insertBefore(row,d.children[1]||null);}
{const old=campOfficers;campOfficers=function(){ $('cOff')?.remove();const r=old();officerTabs('service');return r;};}
{const old=offUI;offUI=function(){const r=old();officerTabs('recruit');return r;};}
function topCommands(){
 const ui=campEl();ui.dataset.topCommands='1';document.body.classList.add('top-commands');document.body.classList.remove('mob-nav','mob-insp','mob-log');$('mobDock')?.remove();
 const old=ui.querySelector('.campaign-nav');if(!old)return;const buttons=[...old.querySelectorAll('.btn')],nav=document.createElement('nav');nav.id='topCommands';nav.setAttribute('aria-label',Tz('行营菜单','Campaign commands'));nav.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '||e.key.startsWith('Arrow'))e.stopPropagation();});
 const take=id=>buttons.find(b=>b.id===id),anonymous=pattern=>buttons.find(b=>!b.id&&pattern.test(b.textContent));
 const labels={cRosterB:['兵籍','Muster roll'],cMedicalB:[`就近送医 (${woundedAll()})`,`Send wounded (${woundedAll()})`],cTechB:['格物研究','Research'],cSupplyB:['境内转运','Supply routes'],cTRB:[`在途辎重 (${shipsOn().filter(s=>!s.state).length})`,`Cargo in transit (${shipsOn().filter(s=>!s.state).length})`],cMusicB:['音乐','Music'],cCoachB:['帮助与教程','Help & tutorials']};for(const b of buttons)if(labels[b.id])topLabel(b,...labels[b.id]);
 const missions=take('cMissionsB');if(missions){topLabel(missions,'任务','Missions','flag');nav.appendChild(missions);}
 const town=topMenu(nav,'town','城镇','Towns');for(const [b,zh,en]of [[take('cSetB'),'治所与营建','Settlement & construction'],[anonymous(/Village|村寨/),'进入城镇','Visit town']])if(b){topLabel(b,zh,en);town.appendChild(b);}
 const army=topMenu(nav,'army','军队','Armies');for(const b of [take('cRosterB'),take('cOffB'),take('cMedicalB'),take('cTechB')])if(b){if(b.id==='cOffB'){topLabel(b,'将佐','Officers');b.onclick=()=>campOfficers();}army.appendChild(b);}
 const council=take('cDynastyB');if(council){topLabel(council,'商贸与朝政','Commerce & Council','trade');nav.appendChild(council);}
 const logistics=topMenu(nav,'logistics','后勤','Logistics');for(const b of [take('cSupplyB'),take('cTRB')])if(b)logistics.appendChild(b);
 const map=topMenu(nav,'map','舆图','Map');const whole=anonymous(/Whole realm|全图/);if(whole){topLabel(whole,'全图','Whole map');map.appendChild(whole);}for(const el of [$('swLayers'),$('campaignMinimap'),ui.querySelector('.campaign-log')])if(el)map.appendChild(el);
 const system=topMenu(nav,'system','系统','System');for(const b of buttons)if(old.contains(b)&&b.id!=='cChainB'&&!/Officers|将佐|Guide|教程/.test(b.textContent.replace(/Help & tutorials|帮助与教程/,'')))system.appendChild(b);
 // Production lives once in Commerce & Council; officer recruitment is a tab
 // of Officers. The old containers are removed, not hidden duplicate menus.
 old.remove();ui.appendChild(nav);
 const strip=ui.querySelector('.chapter-strip');if(strip)ui.querySelector('.campaign-date')?.appendChild(strip);
 const inspector=ui.querySelector('.realm-inspector');if(inspector){inspector.hidden=!CSEL;if(CSEL){const close=btn('收起详情','Close details',()=>{CSEL=null;campUI();});close.classList.add('selection-close');inspector.prepend(close);}}
 topPlace();requestAnimationFrame(topPlace);
 const alert=$('swEnvChip');if(alert){alert.classList.add('top-envoy');nav.insertBefore(alert,nav.firstChild);}
}
{const old=campUI;campUI=function(){const r=old();if(MODE==='camp'&&CG)topCommands();return r;};}
document.addEventListener('pointerdown',e=>{for(const m of document.querySelectorAll('#topCommands .top-menu[open]'))if(!m.contains(e.target))m.open=false;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const menus=[...document.querySelectorAll('#topCommands .top-menu[open]')];if(menus.length){e.stopPropagation();e.preventDefault();}for(const m of menus){m.open=false;m.querySelector('summary').focus();}}});
{const old=show;show=function(...args){const r=old(...args);if(MODE!=='camp')document.body.classList.remove('top-commands');return r;};}
// Show the actual camp approaches instead of an invisible geographical radius.
{const old=drawRaids;drawRaids=function(g){g.save();g.strokeStyle='#71614780';g.lineWidth=1.2;g.setLineDash([3,4]);for(const [c,kind]of [...FR_CAMPS.map(c=>[c,'qiang']),...BD_SEED.map(c=>[c,'bandit'])])for(const id of raidNeighbours(c.id,kind)){const cp=cwp(c.lon,c.lat),a=c2s(cp.x,cp.y),p=tPos(id),b=c2s(p.x,p.y);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();}g.restore();return old(g);};}

function topPlace(){if(MODE!=='camp')return;const ui=campEl(),header=ui.querySelector('.campaign-top'),nav=$('topCommands');if(!header||!nav)return;nav.style.top=(header.getBoundingClientRect().bottom+5)+'px';const y=nav.getBoundingClientRect().bottom+10;for(const el of [ui.querySelector('.realm-inspector'),$('cIntel'),$('cEdictGo')])if(el)el.style.setProperty('top',y+'px','important');}
window.addEventListener('resize',()=>{for(const m of document.querySelectorAll('#topCommands .top-menu[open]'))m.open=false;requestAnimationFrame(topPlace);});
{const old=coachUI;coachUI=function(){const r=old(),d=$('cCoach');if(d){d.appendChild(btn('操作说明','Controls',()=>alertBox(helpHTML())));d.appendChild(btn('重启入门引导','Restart introduction',()=>{d.remove();CG.tut=0;campUI();}));}return r;};}
function raidPrune(){if(CG.fr)CG.fr.bands=CG.fr.bands.filter(b=>raidAdjacent(b.src,b.to,b.tr));const bad=new Set();CG.xa=CG.xa.filter(x=>{if(x.story||x.faction||x.frCol!=null||raidAdjacent(x.from,x.to))return true;bad.add(x.id);if(x.paid&&CG.T[x.from]?.own==='xia')warSetMen(x.from,warMen(x.from)+x.str);return false;});CG.queue=CG.queue.filter(q=>q.type!=='def'||!bad.has(q.xa));if(bad.size)cgLog('⚑',Tz('撤销旧存档中跨越相邻地界的劫掠，已扣除的兵员退回原驻地。','Cancelled non-adjacent raids from the old save; paid troops returned to their origin.'));}
{const old=campLoad;campLoad=function(){const r=old();if(CG){raidPrune();saveGame();}return r;};}
