"""Register generated building art and create the handover's transparent delivery layers.
Uses the supplied packer for premultiplied-alpha hi/md/lo WebP export.
The small level-up furnishings are deterministic 2D art, not extra inventory.
"""
from pathlib import Path
import json, math, argparse, importlib.util
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
HAND=ROOT/'art/building-handover'
SPEC=json.loads((HAND/'specs/buildings_spec.json').read_text(encoding='utf-8'))
SOURCE=ROOT/'art/building-masters/generated'
MASTERS=ROOT/'art/building-masters/deliverables'
MASTERS.mkdir(parents=True,exist_ok=True)

def clean(im):
    a=np.array(im.convert('RGBA'));alpha=a[:,:,3]
    # Some alpha exports have a few highly saturated key-colour pixels on the contour.
    inner=np.asarray(Image.fromarray(alpha).filter(ImageFilter.MinFilter(5)))>180
    bad=~inner & (a[:,:,0]>190) & (a[:,:,1]<90) & ((a[:,:,2]>175)|(a[:,:,2]<90))
    a[bad,3]=0
    a[:,:,3]=np.where(a[:,:,3]>=200,255,0).astype(np.uint8)
    return Image.fromarray(a)

def registered(im,size,scale,offset):
    # A single transform is shared by every layer; never independently trim a roof.
    return im.transform(size,Image.Transform.AFFINE,(1/scale,0,-offset[0]/scale,0,1/scale,-offset[1]/scale),Image.Resampling.BICUBIC)

def furnishing(size,b,level,key):
    """Small code-native 2D upgrade furniture, scaled in the same world units as people."""
    W,H=size;out=Image.new('RGBA',size);d=ImageDraw.Draw(out)
    stations=b['stations_wu_from_anchor'];piles=[b.get('input_pile_wu_from_anchor'),b.get('output_rack_wu_from_anchor')]
    candidates=[(-b['box_wu'][0]*.24,-b['box_wu'][1]*.48),(b['box_wu'][0]*.25,-b['box_wu'][1]*.51),(0,-b['box_wu'][1]*.58),(-b['box_wu'][0]*.22,-b['box_wu'][1]*.27),(b['box_wu'][0]*.22,-b['box_wu'][1]*.27)]
    avoid=[(p['x'],p['y']) for p in stations+piles if p]
    candidates.sort(key=lambda p:min([math.hypot(p[0]-q[0],p[1]-q[1]) for q in avoid] or [100]),reverse=True)
    x,y=candidates[min(level-2,len(candidates)-1)];x=W/2+x*6;y=H+y*6
    def poly(points,fill,outline='#4b3322',width=4):d.polygon([(round(x+a*6),round(y+c*6)) for a,c in points],fill=fill);d.line([(round(x+a*6),round(y+c*6)) for a,c in points+[points[0]]],fill=outline,width=width)
    def line(points,fill='#4b3322',width=4):d.line([(round(x+a*6),round(y+c*6)) for a,c in points],fill=fill,width=width)
    def oval(box,fill,outline='#4b3322',width=4):d.ellipse((round(x+box[0]*6),round(y+box[1]*6),round(x+box[2]*6),round(y+box[3]*6)),fill=fill,outline=outline,width=width)
    if key=='hospital':
        for dx,dy in [(-83,-36),(83,-36),(-83,-75),(83,-75)]:
            x=W/2+dx*6;y=H+dy*6
            poly([(-12,-7),(11,-7),(12,4),(-11,4)],'#ac9771');poly([(-11,-7),(10,-7),(10,-3),(-10,-3)],'#e1d6bc')
    elif key in ['tannery','brewery','beauty','saltworks','powderworks','refinery']:
        poly([(-11,-10),(10,-10),(9,5),(-9,5)],'#84603d');oval((-11,-17,11,-6),'#b08c60');oval((-8,-14,8,-8),'#53523d');line([(-10,-1),(10,-1)],'#43372a',6);line([(-6,-13),(5,-26)],'#92714a',7)
    elif key in ['bowyer','armourer','saddlery','weaver','arsenal']:
        for xx in [-12,12]:line([(xx,5),(xx,-28)],'#6a4a30',9)
        line([(-14,-25),(14,-25)],'#a18052',10);line([(-13,0),(13,0)],'#6a4a30',8)
        for xx in [-8,-2,4,10]:line([(xx,-23),(xx+2,-2)],'#c4b38e' if key=='weaver' else '#8b7b61',4)
    else:
        for xx in [-13,12]:line([(xx,-4),(xx,7)],'#5e422b',8)
        poly([(-16,-14),(12,-14),(18,-6),(-10,-6)],'#bd9e70');poly([(-10,-6),(18,-6),(18,-2),(-10,-2)],'#7a5636')
        for xx in [-10,-4,2,8]:line([(xx,-14),(xx+6,-6)],'#735337',2)
        if key=='smithy':poly([(-5,-14),(4,-14),(9,-18),(4,-20),(-7,-20)],'#555760',width=3)
        elif key in ['restaurant','pottery','kiln']:oval((-6,-23,6,-14),'#aa7b51');oval((-5,-23,5,-19),'#69503b')
        elif key in ['storehouse_a','storehouse_b','armoury','market']:poly([(-8,-25),(6,-25),(8,-14),(-8,-14)],'#9e7c52')
    return out

def prepare(key,b):
    basepath=SOURCE/(key+'-base.png');roofpath=SOURCE/(key+'-roof.png')
    if not basepath.exists() or b['class']=='W' and not roofpath.exists():return False
    base=clean(Image.open(basepath));roof=clean(Image.open(roofpath)) if b['class']=='W' else None
    if roof and roof.size!=base.size:roof=roof.resize(base.size,Image.Resampling.LANCZOS)
    bb=base.getbbox();W,H=b['master_canvas_px'];margin=18;scale=min(W*.86/(bb[2]-bb[0]),(H-margin*2)/(bb[3]-bb[1]));cx=(bb[0]+bb[2])/2
    union=base.copy()
    if roof:union=Image.alpha_composite(union,roof)
    ub=union.getbbox();scale=min(scale,(W-24)/max(1,2*max(cx-ub[0],ub[2]-cx)),(H-margin*2)/max(1,bb[3]-ub[1]));offset=(W/2-cx*scale,H-margin-bb[3]*scale)
    base=registered(base,(W,H),scale,offset);layers={'base':base}
    if b['class']=='F':
        # All seasons tile on one registered earthen plot outline.
        mask=Image.new('L',(W,H));md=ImageDraw.Draw(mask);points=[(W*.07,H*.24),(W*.81,H*.16),(W*.93,H*.84),(W*.19,H*.92)];md.polygon(points,fill=255)
        plot=Image.new('RGBA',(W,H));pd=ImageDraw.Draw(plot);pd.polygon(points,fill='#b6b6a4' if key.endswith('winter') else '#aa9065');pd.line(points+[points[0]],fill='#786d50',width=6)
        arr=np.array(base);arr[:,:,3]=np.minimum(arr[:,:,3],np.asarray(mask));base=Image.alpha_composite(plot,Image.fromarray(arr));layers={'base':base}
    if roof:
        arr=np.array(base);yy,xx=np.indices((H,W));mask=((yy>H-b['box_wu'][1]*6*.13)&(np.abs(xx-W/2)>W*.15))|((np.abs(xx-W/2)>W*.37)&(yy>H*.35))
        # Foreground kerbs/posts can cover a worker; middle floor and stations stay clear.
        props=arr.copy();props[~mask,3]=0;arr[mask,3]=0
        layers={'base':Image.fromarray(arr),'props':Image.fromarray(props),'roof':registered(roof,(W,H),scale,offset)}
        for n in range(2,min(3,b['levels'])+1):layers['props_l'+str(n)]=furnishing((W,H),b,n,key)
    for layer,im in layers.items():im.save(MASTERS/(key+'__'+layer+'.png'),compress_level=4)
    return True

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--partial',action='store_true');args=ap.parse_args()
    ready=[]
    for key,b in SPEC['buildings'].items():
        if prepare(key,b):ready.append(key);print('Registered',key,flush=True)
        elif not args.partial:raise SystemExit('Missing generated image: '+key)
    module_spec=importlib.util.spec_from_file_location('handover_packer',HAND/'tools/pack_building.py');packer=importlib.util.module_from_spec(module_spec);module_spec.loader.exec_module(packer)
    manifest={k:SPEC[k] for k in ['version','ppwu','roof_fade_sc']};manifest['buildings']={}
    for key in ready:
        b=SPEC['buildings'][key];layers=[]
        for layer in b['layers_required']:
            im=Image.open(MASTERS/(key+'__'+layer+'.png')).convert('RGBA');layers.append(layer)
            for tier,ppwu in SPEC['ppwu'].items():
                out=ROOT/'assets'/tier;out.mkdir(exist_ok=True)
                size=tuple(round(v*ppwu) for v in b['box_wu']);im.convert('RGBa').resize(size,Image.Resampling.LANCZOS).convert('RGBA').save(out/('bld_'+key+'__'+layer+'.webp'),'WEBP',quality=90,method=4,alpha_quality=100)
        item={k:v for k,v in b.items() if k not in ['layers_required','layers_optional','zero_code_sheet_cell']};item['layers']=layers
        original=clean(Image.open(SOURCE/(key+'-base.png')));bb=original.getbbox();W,H=b['master_canvas_px'];sc=min(W*.86/(bb[2]-bb[0]),(H-36)/(bb[3]-bb[1]));union=original.copy();rp=SOURCE/(key+'-roof.png')
        if rp.exists():union=Image.alpha_composite(union,clean(Image.open(rp)).resize(original.size))
        ub=union.getbbox();cx=(bb[0]+bb[2])/2;sc=min(sc,(W-24)/(2*max(cx-ub[0],ub[2]-cx)),(H-36)/(bb[3]-ub[1]));item['source_registration']={'width':original.width,'height':original.height,'scale':sc,'x':W/2-cx*sc,'y':H-18-bb[3]*sc}
        if key.startswith('gate_'):item['plaque_source_rect']={'gate_hamlet':[.392,.347,.622,.42],'gate_village':[.409,.44,.577,.498],'gate_town':[.399,.48,.574,.543]}[key]
        if key=='barracks':
            item['stations_wu_from_anchor']=[{'act':'hammer','x':-25,'y':-26}]
            item['input_pile_wu_from_anchor']={'x':-34,'y':-18};item['output_rack_wu_from_anchor']={'x':34,'y':-18}
        if key.startswith('storehouse'):
            item['stations_wu_from_anchor']=[{'act':'stack','x':60,'y':-42}]
            item['input_pile_wu_from_anchor']={'x':-85,'y':-28};item['output_rack_wu_from_anchor']={'x':85,'y':-28}
        if key=='armoury':
            item['stations_wu_from_anchor']=[{'act':'count','x':40,'y':-40}]
            item['input_pile_wu_from_anchor']={'x':-75,'y':-30};item['output_rack_wu_from_anchor']={'x':75,'y':-30}
        if key=='treasury':
            item['stations_wu_from_anchor']=[{'act':'count','x':70,'y':-52}]
            item['treasury_tray_normalized']={'columns':[.35,.54],'rows':[.445,.525,.61]}
        if key=='hospital':
            # Image-local bed centres transformed with the same registration as the layers.
            original=Image.open(SOURCE/'hospital-base.png');bb=clean(original).getbbox();W,H=b['master_canvas_px'];sc=min(W*.86/(bb[2]-bb[0]),(H-36)/(bb[3]-bb[1]));roof=Image.open(SOURCE/'hospital-roof.png').resize(original.size);union=Image.alpha_composite(clean(original),clean(roof)).getbbox();cx=(bb[0]+bb[2])/2;sc=min(sc,(W-24)/(2*max(cx-union[0],union[2]-cx)),(H-36)/(bb[3]-union[1]));ox=W/2-cx*sc;oy=H-18-bb[3]*sc
            item['extra_mats_wu_from_anchor']=[{'x':x,'y':y} for x,y in [(-83,-36),(83,-36),(-83,-75),(83,-75)]]
            item['beds_wu_from_anchor']=[{'x':(original.width*x*sc+ox-W/2)/6,'y':(original.height*y*sc+oy-H)/6} for y in [.405,.625] for x in [.267,.428,.593,.755]]
        manifest['buildings'][key]=item;print('Packed',key,flush=True)
    (ROOT/'assets/bld_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=1),encoding='utf-8')
    print('Packed',len(ready),'of',len(SPEC['buildings']),'variants; masters in',MASTERS)

if __name__=='__main__':main()
