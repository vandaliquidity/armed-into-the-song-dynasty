"""Blender 5.2: matching dimensional livestock, cavalry and ox transport.
blender --background --python art/build_song_animals.py
"""
import bpy, math, os, json
from mathutils import Vector
from array import array
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
exec(open(os.path.join(ROOT,'art','build_song_people.py'),encoding='utf-8').read().split('RIGS={')[0])
OUT=os.path.join(ROOT,'assets','song','animals-3d');os.makedirs(OUT,exist_ok=True)
for k,c in {'bay':(.29,.16,.085),'flax':(.55,.43,.28),'horn':(.46,.40,.28),'chicken':(.46,.29,.15),'feather':(.17,.20,.17),'comb':(.40,.08,.045),'beak':(.56,.38,.14),'red':(.35,.11,.08),'leather':(.22,.13,.075)}.items():M[k]=material(k,c)
for key in ['bay','flax','chicken','feather']:
 m=M[key];p=m.node_tree.nodes.get('Principled BSDF');color=tuple(p.inputs['Base Color'].default_value[:3]);n=m.node_tree.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=120
 bump=m.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.16;bump.inputs['Distance'].default_value=.015;m.node_tree.links.new(n.outputs['Fac'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal'])
 broad=m.node_tree.nodes.new('ShaderNodeTexNoise');broad.inputs['Scale'].default_value=5
 ramp=m.node_tree.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(*(v*.65 for v in color),1);ramp.color_ramp.elements[1].color=(*(v*1.2 for v in color),1);m.node_tree.links.new(broad.outputs['Fac'],ramp.inputs['Fac']);m.node_tree.links.new(ramp.outputs['Color'],p.inputs['Base Color'])

def beast(ox=False):
 global CURRENT
 CURRENT=[];fur='flax' if ox else 'bay'
 ball('Barrel',(0,0,1.08),(.32,.67,.35),fur)
 ball('Haunches',(0,.46,1.08),(.34,.32,.35),fur)
 ball('Chest',(0,-.45,1.12),(.30,.31,.42),fur)
 neck=ball('Strong sloping neck',(0,-.64,1.48),(.23,.26,.48),fur);neck.rotation_euler.x=-.35
 ball('Long skull',(0,-.89,1.79),(.14,.23,.20),fur)
 muzzle=ball('Tapered muzzle',(0,-1.08,1.61),(.107,.265,.12),fur);muzzle.rotation_euler.x=.45
 ball('Dark muzzle',(0,-1.24,1.51),(.113,.105,.09),'leather')
 body=[o for o in CURRENT if o.name.startswith(('Barrel','Haunches','Chest','Strong sloping neck','Long skull','Tapered muzzle','Dark muzzle'))];kept=[o for o in CURRENT if o not in body]
 bpy.ops.object.select_all(action='DESELECT')
 for o in body:o.select_set(True)
 bpy.context.view_layer.objects.active=body[0];bpy.ops.object.join();merged=bpy.context.object
 mod=merged.modifiers.new('Continuous anatomical skin','REMESH');mod.mode='VOXEL';mod.voxel_size=.032;mod.use_smooth_shade=True
 bpy.ops.object.modifier_apply(modifier=mod.name);mod=merged.modifiers.new('Soft anatomical transitions','SMOOTH');mod.factor=1;mod.iterations=4
 CURRENT=kept+[merged]
 for side in [-1,1]:
  ball('Visible eye',(side*.147,-.93,1.81),(.021,.03,.025),'eye')
  e=ball('Upright ear',(side*.115,-.76,2.00),(.035,.055,.11),fur);e.rotation_euler.y=side*.25
  if ox:
   rod('Horn',(side*.15,-.73,1.93),(side*.42,-.65,2.12),.045,'horn');rod('Horn tip',(side*.42,-.65,2.12),(side*.45,-.76,2.22),.025,'horn')
 for z in range(7):ball('Mane',(0,-.47-z*.032,1.43+z*.075),(.07,.085,.09),'hair')
 tail=rod('Tail',(0,.61,1.13),(0,.94,.38),.065,'hair')
 legs={}
 for side in [-1,1]:
  for front in [-1,1]:
   key=(side,front);legs[key]=[rod('Upper leg',(0,0,0),(0,0,1),.07,fur),rod('Lower leg',(0,0,0),(0,0,1),.045,fur),ball('Hoof',(0,0,0),(.075,.10,.065),'cap')]
 root=bpy.data.objects.new('Ox' if ox else 'Horse',None);bpy.context.collection.objects.link(root)
 parts=CURRENT.copy()
 for o in parts:o.parent=root;o.hide_render=True
 return {'root':root,'parts':parts,'legs':legs,'tail':tail}

def horse_pose(rig,phase,walk):
 for (side,front),parts in rig['legs'].items():
  d=math.sin(phase+(side*front<0)*math.pi)*.25 if walk else 0
  hip=(side*.215,front*.43,1.10);knee=(side*.23,front*.43+d*.45,.60);foot=(side*.23,front*.43+d,.08+max(0,d)*.3)
  pose_rod(parts[0],hip,knee,.07);pose_rod(parts[1],knee,foot,.042);parts[2].location=foot

H=beast();OX=beast(True)
R={}
for faction,color in [('song','red'),('xia','tan'),('jin','grey')]:
 rig=person('man');rig['root'].name=faction+' cavalry rider'
 for o in rig['parts']:
  if o.type=='MESH' and o.data.materials and o.data.materials[0]==M['indigo']:o.data.materials[0]=M[color]
 rig['root'].scale=(.88,.88,.88);rig['root'].location=(0,.05,1.12)
 for side in [-1,1]:
  shoulder=(side*.225,0,1.35);elbow=(side*.25,-.17,1.15);hand=(side*.14,-.36,1.09)
  hip=(side*.14,0,.86);knee=(side*.32,-.18,.61);ankle=(side*.34,-.03,.23)
  for part,a,b,r in [('thigh',hip,knee,.073),('shin',knee,ankle,.06),('upper',shoulder,elbow,.078),('fore',elbow,hand,.058)]:pose_rod(rig['limbs'][(side,part)],a,b,r)
  rig['hands'][side].location=hand;rig['feet'][side].location=ankle
  for o in [rod('Reins',hand,(side*.13,-.98,.53),.008,'leather')]:o.parent=rig['root'];rig['parts'].append(o);o.hide_render=True
 if faction=='song':
  for o in [rod('Spear',(.25,-.2,.5),(.25,-.2,2.35),.018,'wood'),ball('Iron spear point',(.25,-.2,2.43),(.028,.028,.12),'iron')]:o.parent=rig['root'];rig['parts'].append(o);o.hide_render=True
 else:
  for i in range(8):
   a=-1.2+i*.34;b=a+.34
   o=rod('Curved bow',(.28,-.30+math.cos(a)*.18,1.05+math.sin(a)*.30),(.28,-.30+math.cos(b)*.18,1.05+math.sin(b)*.30),.012,'wood');o.parent=rig['root'];rig['parts'].append(o);o.hide_render=True
 R[faction]=rig

CURRENT=[]
for x in [-.32,.32]:rod('Shaft',(x,.2,.68),(x,1.65,.68),.04,'wood')
box('Cart floor',(0,1.65,.57),(.85,1.2,.09),'wood')
for x in [-.43,.43]:
 box('Cart side',(x,1.65,.83),(.065,1.25,.48),'wood')
 for y in [1.1,1.65,2.2]:rod('Vertical stake',(x,y,.62),(x,y,1.08),.025,'wood')
 bpy.ops.mesh.primitive_torus_add(major_radius=.31,minor_radius=.026,major_segments=24,minor_segments=8,location=(x*1.25,1.65,.34),rotation=(0,math.pi/2,0));wheel=finish(bpy.context.object,'Wooden wheel','wood')
 for a in range(8):rod('Spoke',(x*1.25,1.65,.34),(x*1.25,1.65+math.cos(a*math.tau/8)*.31,.34+math.sin(a*math.tau/8)*.31),.014,'wood')
cart=CURRENT.copy()
for o in cart:o.parent=OX['root'];o.hide_render=True

CURRENT=[]
ball('Hen body',(0,0,.23),(.14,.22,.16),'chicken');ball('Hen neck',(0,-.15,.37),(.09,.085,.15),'chicken');ball('Hen head',(0,-.18,.49),(.075,.085,.085),'chicken')
for side in [-1,1]:
 ball('Small bright eye',(side*.067,-.213,.51),(.010,.012,.011),'eye');ball('Folded wing',(side*.12,.015,.25),(.045,.14,.095),'feather')
 for toe in [-1,0,1]:rod('Claw',(side*.063,0,.045),(side*.063+toe*.027,-.065,.025),.006,'beak')
 rod('Thin leg',(side*.065,.015,.18),(side*.063,0,.045),.012,'beak')
rod('Beak',(0,-.24,.49),(0,-.32,.47),.018,'beak')
for i in range(3):ball('Small comb',(0,-.19+i*.03,.568),(.018,.03,.027),'comb')
for i in range(4):
 o=ball('Tail feather',((i-1.5)*.025,.19,.35),(.035,.12,.07),'feather');o.rotation_euler.x=.7
chicken=CURRENT.copy();CROOT=bpy.data.objects.new('Village hen',None);bpy.context.collection.objects.link(CROOT)
for o in chicken:o.parent=CROOT;o.hide_render=True

scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=8;scene.cycles.use_denoising=True;scene.render.film_transparent=True;scene.render.resolution_x=160;scene.render.resolution_y=192;scene.render.resolution_percentage=100;scene.view_settings.view_transform='Standard';scene.world.color=(.6,.6,.6)
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
bpy.ops.object.light_add(type='AREA',location=(-3,-4,7));bpy.context.object.data.energy=500;bpy.context.object.data.size=3
bpy.ops.object.light_add(type='AREA',location=(3,2,4));bpy.context.object.data.energy=110;bpy.context.object.data.size=4
bpy.ops.object.camera_add(location=(0,-7,6));cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO'
allparts=H['parts']+OX['parts']+cart+chicken+sum([r['parts'] for r in R.values()],[])
def atlas(name,nf=5):
 for o in allparts:o.hide_render=True
 ishen=name=='chicken';isox=name=='oxcart';rig=OX if isox else H;active=chicken if ishen else rig['parts']+(cart if isox else [])+(R[name]['parts'] if name in R else [])
 for o in active:o.hide_render=False
 target=Vector((0,.55 if isox else 0,.28 if ishen else 1.3 if name in R else 1));cam.location=target+Vector((0,-7,5.5));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=1 if ishen else 4.7 if isox else 3.7 if name in R else 3.05
 W=160*nf;HH=192*8;pixels=array('f',[0])*(W*HH*4);temp=os.path.join(OUT,'render.png')
 for row in range(8):
  for phase in range(nf):
   angle=math.pi/2-row*math.tau/8
   if ishen:CROOT.rotation_euler.z=angle;CROOT.location.z=.012*math.sin(phase*math.pi/2)
   else:
    rig['root'].rotation_euler.z=angle;horse_pose(rig,(phase-1)*math.tau/4,phase>0)
    if name in R:R[name]['root'].rotation_euler.z=angle
   scene.render.filepath=temp;bpy.ops.render.render(write_still=True);im=bpy.data.images.load(temp,check_existing=False);buf=array('f',[0])*(160*192*4);im.pixels.foreach_get(buf);bpy.data.images.remove(im)
   for y in range(192):
    dst=((HH-(row+1)*192+y)*W+phase*160)*4;src=y*160*4;pixels[dst:dst+640]=buf[src:src+640]
  print('ANIMALS',name,row+1,flush=True)
 im=bpy.data.images.new(name,width=W,height=HH,alpha=True);im.pixels.foreach_set(pixels);im.filepath_raw=os.path.join(OUT,name+'.png');im.file_format='PNG';im.save();bpy.data.images.remove(im)
for name in ['horse','song','xia','jin','oxcart','chicken']:atlas(name,3 if name=='chicken' else 5)
for o in allparts:o.hide_render=True
for i,(name,rig) in enumerate([('horse',H),('ox',OX),*R.items()]):
 rig['root'].location.x=i*2.5
 for o in rig['parts']:o.hide_render=False
CROOT.location.x=12.5
for o in chicken:o.hide_render=False
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'song-animals-source.blend'))
with open(os.path.join(OUT,'manifest.json'),'w',encoding='utf-8') as f:json.dump({'width':160,'height':192,'directions':8,'frames':5,'chickenFrames':3},f,indent=2)
print('SONG_ANIMALS_READY',flush=True)
