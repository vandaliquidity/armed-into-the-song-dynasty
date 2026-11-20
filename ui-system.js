// v0.37 (t247) one small UI design system for the campaign screens. Tokens (ink, paper, gold, cinnabar, jade; 4-px spacing scale; two
// radii; one border weight) and components (.sw-card, .sw-h, .sw-p, .sw-note, .sw-row, .sw-btn, .sw-chip, .sw-bar, .sw-fac, .sw-layers)
// used by the new strategy panels, plus a neatness pass over the existing campaign HUD: one button height and border, visible focus
// and disabled states, tabular numbers, consistent panel padding and line height, thin scrollbars. Colours and fonts are the game's own.
'use strict';
const SWUI_CSS=`:root{--sw-ink:#1e120a;--sw-paper:rgba(30,18,10,.9);--sw-paper2:rgba(52,32,18,.92);--sw-line:#8a6424;--sw-gold:#f4d27a;--sw-cream:#f8e6b8;--sw-red:#5a1c14;--sw-red2:#3a100c;--sw-jade:#8fd07a;--sw-warn:#ff8a70;
 --sw-s1:4px;--sw-s2:8px;--sw-s3:12px;--sw-r1:4px;--sw-r2:8px;--sw-bw:1.5px;--sw-fs:13px;--sw-lh:1.45}
#campUI .panel{border-width:var(--sw-bw);border-radius:var(--sw-r2);line-height:var(--sw-lh)}
#campUI .btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--sw-s1);min-height:30px;box-sizing:border-box;border-width:var(--sw-bw);border-radius:var(--sw-r1);margin:3px;line-height:1.2;transition:filter .12s,transform .06s}
#campUI .btn:hover{filter:brightness(1.18)}#campUI .btn:active{transform:translateY(1px)}#campUI .btn:focus-visible{outline:2px solid var(--sw-gold);outline-offset:1px}
#campUI .btn.dis{opacity:.45;cursor:not-allowed;filter:grayscale(.4)}
#campUI b,#campUI .rs b{font-variant-numeric:tabular-nums}
#campUI .tip{line-height:var(--sw-lh)}
#campUI ::-webkit-scrollbar{width:8px;height:8px}#campUI ::-webkit-scrollbar-thumb{background:#6a4a1e;border-radius:4px}#campUI ::-webkit-scrollbar-track{background:transparent}
#campUI .panel{scrollbar-width:thin;scrollbar-color:#6a4a1e transparent}
.sw-card{display:flex;flex-direction:column;gap:var(--sw-s2);font-size:var(--sw-fs);line-height:var(--sw-lh);color:var(--sw-cream)}
.sw-h{color:var(--sw-gold);font-size:15px;font-weight:bold;letter-spacing:.02em;border-bottom:1px solid rgba(184,134,46,.35);padding-bottom:var(--sw-s1)}
.sw-p{font-size:var(--sw-fs)}.sw-note{font-size:12px;opacity:.78}
.sw-row{display:flex;flex-wrap:wrap;gap:var(--sw-s1)}
#campUI .sw-btn,.sw-btn{font-size:13px;padding:5px 10px;margin:0;min-width:0}
.sw-chiprow{margin:var(--sw-s1) 0;cursor:pointer}.sw-chip{display:inline-block;border:var(--sw-bw) solid var(--sw-line);border-radius:999px;padding:2px 10px;font-size:12px;background:var(--sw-paper2)}
.sw-bar{position:relative;height:8px;border-radius:4px;background:linear-gradient(90deg,rgba(255,106,80,.25),rgba(216,208,138,.18) 50%,rgba(143,208,122,.25));border:1px solid rgba(184,134,46,.4)}
.sw-bar u{position:absolute;top:0;bottom:0;border-radius:3px;text-decoration:none}.sw-bar i{position:absolute;top:-2px;bottom:-2px;border-left:1px solid var(--sw-gold)}
.sw-fac{border-left:4px solid var(--sw-line);padding:var(--sw-s2) var(--sw-s2) var(--sw-s2) var(--sw-s3);background:rgba(255,240,200,.04);border-radius:0 var(--sw-r1) var(--sw-r1) 0;display:flex;flex-direction:column;gap:6px}
.sw-fh{display:flex;justify-content:space-between;align-items:baseline;gap:var(--sw-s2)}.sw-fh span{font-size:12px;opacity:.75}
#campUI .sw-layers{left:50%;transform:translateX(-50%);bottom:12px;display:flex;align-items:center;gap:var(--sw-s1);padding:var(--sw-s1) var(--sw-s2);flex-wrap:wrap;max-width:calc(100vw - 560px);justify-content:center}
.sw-lab{color:var(--sw-gold);font-size:12px;margin-right:var(--sw-s1)}
#campUI .sw-tog{font-size:12px;padding:3px 9px;min-height:26px;background:linear-gradient(#3a2414,#24160c)}#campUI .sw-tog.on{background:linear-gradient(#8a2a18,#5a1c14);border-color:var(--sw-gold);color:#fff4d0}
@media (max-width:700px){/* phone top bar: its rows were sizing to their content (530px) and widening the page; clamp them so the resource row scrolls instead */#campUI .campaign-top>*{min-width:0!important;max-width:100%!important;align-self:stretch!important}#campUI .campaign-resources{max-width:100%!important}#campUI .realm-inspector,#campUI .campaign-nav,#campUI .campaign-log{overflow-x:hidden!important}#campUI .realm-inspector *{max-width:100%;overflow-wrap:anywhere}#campUI .sw-layers{left:6px;right:6px;transform:none;top:auto;bottom:60px;max-width:none;padding:3px 4px;gap:3px}#campUI .sw-layers .sw-lab{display:none}#campUI .sw-tog{font-size:11px;padding:3px 6px}body.mob-insp #campUI .sw-layers,body.mob-nav #campUI .sw-layers,body.mob-log #campUI .sw-layers{display:none}#campUI .btn{min-height:34px}}`;
function swuiInstall(){if(document.getElementById('swuiCss'))return;const st=document.createElement('style');st.id='swuiCss';st.textContent=SWUI_CSS;document.head.appendChild(st);}
swuiInstall();window.__swui={V:'t247a',css:()=>SWUI_CSS};
