'use strict';
function edictSpeechAvailable(){return typeof window.speechSynthesis!=='undefined'&&typeof window.SpeechSynthesisUtterance==='function';}
function edictSpeechControls(){
 const b=$('cEdictVoice');if(!b||!EDICT)return;const state=EDICT.speechState;
 b.disabled=!edictSpeechAvailable();b.textContent=b.disabled?Tz('无可用语音','Speech unavailable'):state==='loading'||state==='reading'?Tz('停止朗读','Stop reading'):state==='failed'?Tz('重试朗读','Retry narration'):Tz('朗读','Read aloud');
 b.title=b.disabled?Tz('此浏览器无语音，仍可接旨继续','Speech unavailable in this browser; Continue remains available'):'';
}
function edictStopSpeech(E=EDICT,state='stopped'){
 if(!E)return;E.speechToken=(E.speechToken||0)+1;clearTimeout(E.speechTimer);E.speechTimer=null;E.utterance=null;E.speechState=state;
 try{if(edictSpeechAvailable())window.speechSynthesis.cancel();}catch(_){}edictSpeechControls();
}
function edictReadAloud(E=EDICT){
 if(!E||E!==EDICT)return false;E.narrationAttempted=true;edictStopSpeech(E);if(!edictSpeechAvailable()){E.speechState='failed';edictSpeechControls();return false;}
 const token=E.speechToken,synth=window.speechSynthesis;let voices=[];try{voices=synth.getVoices();}catch(_){}
 const chinese=voices.filter(v=>/^zh\b/i.test(v.lang)),english=voices.filter(v=>/^en\b/i.test(v.lang));
 const useChinese=LANG==='zh'||LANG==='both'&&chinese.length>0,language=useChinese?'zh-CN':'en-GB',pool=useChinese?chinese:english;
 const voice=pool.find(v=>v.localService&&v.lang.toLowerCase()===language.toLowerCase())||pool.find(v=>v.localService)||pool[0];
 const text=useChinese?E.tx.zh.join(' '):E.tx.en,parts=[];
 // Short utterances avoid browsers cutting off a single long proclamation.
 for(const sentence of text.match(/[^.!?。！？；;]+[.!?。！？；;]?/gu)||[text]){let rest=sentence.trim();while(rest.length>160){let cut=rest.lastIndexOf(' ',160);if(cut<60)cut=160;parts.push(rest.slice(0,cut));rest=rest.slice(cut).trim();}if(rest)parts.push(rest);}
 E.speechState='loading';edictSpeechControls();
 const current=()=>EDICT===E&&E.speechToken===token;
 const fail=()=>{if(current())edictStopSpeech(E,'failed');};
 function next(){
  if(!current())return;clearTimeout(E.speechTimer);const part=parts.shift();if(!part){E.utterance=null;E.speechState='ended';edictSpeechControls();return;}
  try{const u=new SpeechSynthesisUtterance(part);E.utterance=u;u.lang=voice?.lang||language;if(voice)u.voice=voice;u.rate=useChinese?.9:.94;u.volume=Math.max(.1,Math.min(1,SFXVOL));
   u.onstart=()=>{if(!current())return;clearTimeout(E.speechTimer);E.speechState='reading';edictSpeechControls();E.speechTimer=setTimeout(fail,40000);};
   u.onend=()=>{if(current())next();};u.onerror=fail;
   E.speechTimer=setTimeout(fail,8000);synth.resume();synth.speak(u);
  }catch(_){fail();}
 }
 next();return E.speechState!=='failed';
}
function edictRemoveControls(){$('cEdictControls')?.remove();$('cEdictB')?.remove();}
function edictDismiss(){const E=EDICT;if(E)edictStopSpeech(E);EDICT=null;edictRemoveControls();}
function edictMountControls(){
 edictRemoveControls();if(!EDICT||MODE!=='cvil')return;const box=document.createElement('div');box.id='cEdictControls';box.setAttribute('role','group');box.setAttribute('aria-label',Tz('圣旨','Royal edict'));
 const voice=document.createElement('button');voice.id='cEdictVoice';voice.type='button';voice.className='btn';voice.onclick=()=>{if(['loading','reading'].includes(EDICT?.speechState))edictStopSpeech();else edictReadAloud();};
 const ack=document.createElement('button');ack.id='cEdictB';ack.type='button';ack.className='btn';ack.textContent=Tz('接旨谢恩 · 继续','Acknowledge edict · Continue');ack.onclick=()=>edictEnd();
 for(const b of [voice,ack])b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();b.click();}};
 box.append(voice,ack);campEl().appendChild(box);edictSpeechControls();ack.focus({preventScroll:true});
}
{const old=edictStart;edictStart=function(){if(EDICT)return;const r=old();if(EDICT){EDICT.speechState='ready';try{if(edictSpeechAvailable())window.speechSynthesis.getVoices();}catch(_){}edictMountControls();}return r;};}
edictEnd=function(){
 const E=EDICT;if(!E)return;const queue=CG.fav.q,index=queue.indexOf(E.rec);edictDismiss();if(index>=0)queue.splice(index,1);sfx('win');saveGame();cvilUI();
};
{const old=cvilUI;cvilUI=function(...args){const r=old(...args);if(EDICT)edictMountControls();return r;};}
{const old=edictDraw;edictDraw=function(...args){const E=EDICT,r=old(...args);if(E&&EDICT!==E){edictStopSpeech(E);edictRemoveControls();}if(EDICT&&EDICT.t>=ED_READ&&!EDICT.narrationAttempted){EDICT.narrationAttempted=true;if(!muted&&SFXVOL>0)edictReadAloud();}return r;};}
{const old=showCamp;showCamp=function(...args){edictDismiss();return old(...args);};}
{const old=showCVil;showCVil=function(id,...args){if(id!==HOME)edictDismiss();return old(id,...args);};}
{const old=show;show=function(...args){if(MODE!=='cvil')edictDismiss();return old(...args);};}
{const old=campStart;campStart=function(...args){edictDismiss();return old(...args);};}
{const old=campLoad;campLoad=function(...args){edictDismiss();return old(...args);};}
