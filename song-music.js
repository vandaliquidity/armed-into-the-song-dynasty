'use strict';

// Original score, inspired by qin and xiao chamber music. No sampled recording
// or claim to reconstruct a historical Song composition.
const SONG_SCORE={zh:'汴梁暮色',en:'Bianliang at Dusk',bpm:54};
Object.assign(MSTYLE,{
  calm:{bpm:54,root:50,scale:[0,2,4,7,9],lead:'xiao'},
  battle:{bpm:76,root:50,scale:[0,3,5,7,10],lead:'xiao'},
  intense:{bpm:92,root:50,scale:[0,3,5,7,10],lead:'xiao'}
});
const SONG_PHRASES=[
  [[0,2,5],[6,4,3],[12,3,4]],
  [[2,2,5],[10,0,6]],
  [[0,1,4],[6,2,5],[13,4,3]],
  [[0,3,6],[10,2,5]],
  [[0,4,5],[8,5,3],[13,4,3]],
  [[2,2,6],[11,1,4]],
  [[0,2,4],[7,1,4],[12,0,4]],
  [[0,0,10]]
];
const SONG_STRINGS=new Map();
function songStringBuffer(m,duration){
  const key=AC.sampleRate+'|'+m+'|'+duration;if(SONG_STRINGS.has(key))return SONG_STRINGS.get(key);
  const rate=AC.sampleRate,length=Math.ceil(rate*duration),period=Math.max(2,Math.round(rate/mfreq(m)));
  const buffer=AC.createBuffer(1,length,rate),data=buffer.getChannelData(0);
  let seed=(m*7919+17)>>>0;
  for(let i=0;i<period&&i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*.65;}
  let mean=0;for(let i=0;i<Math.min(period,length);i++)mean+=data[i];mean/=period;
  for(let i=0;i<Math.min(period,length);i++)data[i]-=mean;
  for(let i=period;i<length;i++)data[i]=.4985*(data[i-period]+data[i-period+1]);
  // A short fade avoids clicks at the excitation and at the end of the sample.
  for(let i=0;i<length;i++)data[i]*=Math.min(1,i/(rate*.004),(length-1-i)/(rate*.08));
  if(SONG_STRINGS.size>48)SONG_STRINGS.delete(SONG_STRINGS.keys().next().value);
  SONG_STRINGS.set(key,buffer);return buffer;
}
function songQin(t,m,volume=.15,duration=3.5){
  const source=AC.createBufferSource(),filter=AC.createBiquadFilter(),gain=AC.createGain();
  source.buffer=songStringBuffer(m,duration);filter.type='lowpass';filter.frequency.setValueAtTime(1800,t);filter.frequency.exponentialRampToValueAtTime(650,t+duration*.65);filter.Q.value=.45;
  gain.gain.setValueAtTime(volume,t);source.connect(filter);filter.connect(gain);gain.connect(MUS.bus);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start(t);source.stop(t+duration);
}
function songXiao(t,m,duration,volume=.035){
  const fundamental=AC.createOscillator(),harmonic=AC.createOscillator(),harmonicGain=AC.createGain(),envelope=AC.createGain();
  const vibrato=AC.createOscillator(),depth=AC.createGain(),f=mfreq(m);
  fundamental.type='sine';fundamental.frequency.value=f;harmonic.type='sine';harmonic.frequency.value=f*2;harmonicGain.gain.value=.12;
  vibrato.frequency.value=4.6;depth.gain.setValueAtTime(0,t);depth.gain.linearRampToValueAtTime(5,t+.5);vibrato.connect(depth);depth.connect(fundamental.detune);
  envelope.gain.setValueAtTime(.0001,t);envelope.gain.linearRampToValueAtTime(volume,t+.18);envelope.gain.setValueAtTime(volume*.8,t+Math.max(.2,duration-.3));envelope.gain.exponentialRampToValueAtTime(.0001,t+duration);
  fundamental.connect(envelope);harmonic.connect(harmonicGain);harmonicGain.connect(envelope);envelope.connect(MUS.bus);
  fundamental.onended=()=>{fundamental.disconnect();harmonic.disconnect();harmonicGain.disconnect();envelope.disconnect();vibrato.disconnect();depth.disconnect();};
  for(const node of [fundamental,harmonic,vibrato]){node.start(t);node.stop(t+duration+.05);}
}
musStep=function(t,step,bar){
  const style=MSTYLE[MUS.mode],beat=60/style.bpm/4,calm=MUS.mode==='calm',intense=MUS.mode==='intense';
  const phrase=SONG_PHRASES[bar%SONG_PHRASES.length];
  for(const [at,degree,length] of phrase)if(step===at){
    const variation=Math.floor(bar/8)%4,note=calm&&variation===1?Math.max(0,5-degree):degree;
    songQin(t,mdeg(style,note),calm?.2:.16,calm?4:2.8);
    // Breath-sized phrases and rests keep the flute from becoming a drone.
    if((bar%4===1||bar%4===2)&&(!calm||variation!==2))songXiao(t+.08,mdeg(style,note+5),Math.max(.55,length*beat*.85),calm?.035:.027);
  }
  if(step===0&&bar%2===0)songQin(t,style.root-12,.14,5);
  if(step===8&&bar%2===1)songQin(t,mdeg(style,-2),.09,3.5);
  if(!calm){
    if(step===0||step===8)iDrum(t,intense?.28:.19,72);
    if(intense&&(step===6||step===14))iDrum(t,.12,95);
    if(step===4||step===12)songQin(t,mdeg(style,step===4?0:2),.12,1.8);
  }
};

function songMusicPanel(){
  audioInit();const old=$('songMusicPanel');if(old)old.remove();
  const d=document.createElement('div');d.id='songMusicPanel';d.className='panel modal';d.setAttribute('role','dialog');d.setAttribute('aria-label',Tz('音乐设置','Music settings'));
  d.innerHTML=`<div class="campaign-eyebrow">${Tz('行营雅乐','Campaign music')}</div><h2>${T(SONG_SCORE.zh,SONG_SCORE.en)}</h2><p>${T('原创古琴与箫意境配乐：舒缓五声音阶、留白与轻柔拨弦。战场采用较紧凑的鼓点与同一主题。','An original pentatonic theme with qin-inspired plucked strings, soft flute and breathing space. Battles use a livelier variation of the same theme.')}</p>`;
  const label=document.createElement('label');label.textContent=Tz('音乐音量 ','Music volume ');
  const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=1;slider.step=.01;slider.value=MUS.vol;slider.setAttribute('aria-label',Tz('音乐音量','Music volume'));slider.oninput=()=>musSetVol(+slider.value);label.appendChild(slider);d.appendChild(label);
  const mute=btn('静音 / 开启','Mute / unmute',()=>{musMute(!MUS.muted);mute.innerHTML=T(MUS.muted?'开启音乐':'静音音乐',MUS.muted?'Unmute music':'Mute music');});d.appendChild(mute);
  d.appendChild(btn('关闭','Close',()=>d.remove()));campEl().appendChild(d);
}
{const old=campUI;campUI=function(){
  old();if(MODE!=='camp')return;const nav=campEl().querySelector('.campaign-nav');if(!nav)return;
  const b=btn('音乐','Music',songMusicPanel);b.id='cMusicB';b.innerHTML=campaignIcon('book','nav-icon')+'<span class="nav-label">'+T('音乐','Music')+'</span>';nav.appendChild(b);
};}

