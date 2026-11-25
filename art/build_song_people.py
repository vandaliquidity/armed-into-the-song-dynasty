"""Reproducible 2.5D Song civilians: real articulated meshes, eight camera facings.
Blender --background --python art/build_song_people.py [-- --preview]
"""
import bpy, math, os, sys, json
from mathutils import Vector
from array import array
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'assets','song','people-3d');os.makedirs(OUT,exist_ok=True)
PREVIEW='--preview' in sys.argv
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def material(name,color,cloth=False):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=.86
 if cloth:
  noise=m.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=95;noise.inputs['Detail'].default_value=2
  bump=m.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.28;bump.inputs['Distance'].default_value=.018;m.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal'])
 if cloth:
  broad=m.node_tree.nodes.new('ShaderNodeTexNoise');broad.inputs['Scale'].default_value=7
  ramp=m.node_tree.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(*(v*.62 for v in color),1);ramp.color_ramp.elements[1].color=(*(min(1,v*1.24) for v in color),1)
  m.node_tree.links.new(broad.outputs['Fac'],ramp.inputs['Fac']);m.node_tree.links.new(ramp.outputs['Color'],p.inputs['Base Color'])
 return m
M={k:material(k,c,k not in ['skin','eye','wood','clay']) for k,c in {'indigo':(.17,.23,.26),'rust':(.43,.23,.14),'tan':(.48,.35,.21),'cream':(.64,.59,.43),'teal':(.24,.32,.28),'cap':(.12,.14,.14),'hair':(.075,.063,.05),'grey':(.39,.40,.37),'skin':(.58,.39,.25),'eye':(.045,.035,.025),'wood':(.24,.14,.07),'clay':(.43,.26,.12),'belt':(.29,.23,.14),'iron':(.17,.18,.18)}.items()}
CURRENT=[]
def finish(o,name,mat):
 o.name=name;o.data.materials.append(M[mat]);CURRENT.append(o)
 if o.type=='MESH':
  for p in o.data.polygons:p.use_smooth=True
 return o
def ball(name,loc,scale,mat):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=loc);o=finish(bpy.context.object,name,mat);o.scale=scale;return o
def box(name,loc,scale,mat):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=finish(bpy.context.object,name,mat);o.scale=scale;mod=o.modifiers.new('Soft worn edges','BEVEL');mod.width=.045;mod.segments=2;return o
def rod(name,a,b,r,mat):
 bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=1,depth=1);o=finish(bpy.context.object,name,mat);pose_rod(o,a,b,r);return o
def pose_rod(o,a,b,r):
 a,b=Vector(a),Vector(b);d=b-a;o.location=(a+b)/2;o.rotation_euler=d.to_track_quat('Z','Y').to_euler();o.scale=(r,r,max(.001,d.length))
def garment(name,rings,mat,fold=.012):
 verts=[];faces=[];N=32
 for z,rx,ry in rings:
  for i in range(N):
   a=i*math.tau/N;wr=1+fold*math.sin(a*9+z*12);verts.append((rx*math.cos(a)*wr,ry*math.sin(a)*wr,z))
 for j in range(len(rings)-1):
  for i in range(N):a=j*N+i;b=j*N+(i+1)%N;faces.append((a,b,b+N,a+N))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);return finish(o,name,mat)
def person(role):
 global CURRENT
 CURRENT=[];coat={'man':'indigo','woman':'rust','porter':'tan','merchant':'teal','elder':'grey','child':'tan'}[role];robe=role in ['woman','merchant'];skin='skin'
 if robe:garment('Long woven skirt' if role=='woman' else 'Plain merchants robe',[(.18,.22,.16),(.42,.23,.17),(.80,.19,.14),(1.12,.19,.13)],'cream' if role=='woman' else coat,.045)
 garment('Cross-collar working coat',[(.78,.25,.17),(.88,.235,.16),(1.06,.20,.145),(1.23,.23,.15),(1.39,.215,.135),(1.43,.14,.11)],coat,.075)
 garment('Woven waist sash',[(1.02,.207,.151),(1.075,.211,.153)],'belt',.015)
 # Raised cloth lapels, overlapping as a cross collar rather than painted lines.
 a=box('Ivory inner collar',(-.035,-.14,1.335),(.045,.025,.225),'cream');a.rotation_euler.y=-.40
 a=box('Folded tunic lapel',(.036,-.155,1.30),(.055,.025,.28),coat);a.rotation_euler.y=.48
 a=box('Hanging sash end',(.11,-.175,.925),(.043,.025,.22),'belt');a.rotation_euler.y=.15
 ball('Neck',(0,0,1.46),(.078,.075,.10),skin);ball('Face',(0,-.012,1.61),(.130,.116,.16),skin)
 for side in [-1,1]:
  ball('Ear',(side*.121,-.002,1.61),(.027,.025,.046),skin)
  ball('Eye',(side*.048,-.111,1.635),(.014,.012,.009),'eye')
  rod('Eyebrow',(side*.025,-.116,1.661),(side*.069,-.112,1.665),.007,'hair')
 ball('Nose',(0,-.128,1.603),(.023,.031,.038),skin);rod('Mouth',(-.027,-.115,1.554),(.027,-.115,1.554),.005,'hair')
 ball('Hair crown',(0,.005,1.70),(.128,.115,.079),'hair')
 if role in ['woman','child']:
  ball('Tied hair bun',(0,.07,1.778),(.066,.061,.051),'hair');rod('Hair binding',(-.05,.065,1.779),(.05,.065,1.779),.011,'belt')
 else:
  garment('Soft cloth cap',[(1.686,.127,.115),(1.74,.123,.111),(1.775,.09,.083)],'cap',.025)
  rod('Headwrap tail',(.08,.088,1.699),(.105,.13,1.57),.015,'cap')
 if role=='elder':
  garment('Short grey beard',[(1.47,.033,.032),(1.51,.075,.045),(1.565,.086,.06)],'grey',.08).location.y=-.075
 rig={'root':bpy.data.objects.new('Civilian '+role,None),'role':role,'coat':coat,'parts':CURRENT.copy(),'limbs':{},'hands':{},'feet':{}}
 bpy.context.collection.objects.link(rig['root'])
 for side in [-1,1]:
  for part,mat,r in [('thigh','cream' if not robe else coat,.073),('shin','cream',.06),('upper',coat,.077),('fore',coat,.062)]:rig['limbs'][(side,part)]=rod(part,(0,0,0),(0,0,1),r,mat)
  rig['hands'][side]=ball('Hand',(0,0,0),(.042,.033,.055),skin)
  rig['feet'][side]=ball('Cloth shoe',(0,0,0),(.072,.115,.045),'cap')
  ball('Shoulder',(side*.215,0,1.35),(.092,.09,.105),coat)
 if role=='merchant':rig['ledger']=box('Closed wooden ledger',(-.17,-.26,1.05),(.13,.05,.18),'wood')
 rig['parts']=CURRENT.copy()
 for o in CURRENT:o.parent=rig['root'];o.hide_render=True
 return rig
def pose(rig,phase,act=None):
 role=rig['role'];s=math.sin(phase);hands={}
 for side in [-1,1]:
  stride=s*side*.20 if act is None else 0;hip=(side*.105,0,.86);knee=(side*.11,stride*.50,.47);ankle=(side*.11,stride,.105+max(0,-math.cos(phase)*side)*.055 if act is None else .105)
  shoulder=(side*.225,0,1.35);elbow=(side*.265,-stride*.45,1.095);hand=(side*.25,-stride*.9,.92)
  if role=='porter':elbow=(side*.27,-.12,1.13);hand=(side*.15,-.29,1.04)
  if role=='merchant' and side==-1:elbow=(-.24,-.08,1.13);hand=(-.17,-.25,1.08)
  if act:
   if act=='hammer' and side==1:elbow=(.29,-.17,1.23+.12*s);hand=(.18,-.35,1.22+.25*s)
   elif act=='stir':elbow=(side*.24,-.12,1.19);hand=(side*.05+.04*math.cos(phase),-.30+.04*s,1.04)
   elif act=='lift':elbow=(side*.25,-.10,1.07+.10*s);hand=(side*.14,-.30,.94+.15*s)
   elif act=='weave':elbow=(side*.25,-.14,1.12);hand=(side*.12,-.30-.07*s*side,1.07)
   elif act=='pour' and side==1:elbow=(.25,-.14,1.14);hand=(.18,-.29,1.14+.05*s)
   elif act=='count' and side==1:elbow=(.26,-.1,1.15);hand=(.08+.03*s,-.28,1.13)
  for part,a,b,r in [('thigh',hip,knee,.073),('shin',knee,ankle,.06),('upper',shoulder,elbow,.078),('fore',elbow,hand,.058)]:pose_rod(rig['limbs'][(side,part)],a,b,r)
  rig['hands'][side].location=hand;rig['feet'][side].location=(ankle[0],ankle[1]-.035,.055+max(0,ankle[2]-.105));hands[side]=Vector(hand)
 return hands
RIGS={role:person(role) for role in ['man','woman','porter','merchant','elder','child']}
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=8;scene.cycles.use_denoising=True
scene.render.resolution_x=128;scene.render.resolution_y=160;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.view_settings.view_transform='Standard';scene.world.color=(.6,.6,.6)
bpy.ops.object.light_add(type='AREA',location=(-3,-4,7));bpy.context.object.data.energy=500;bpy.context.object.data.size=3
bpy.ops.object.light_add(type='AREA',location=(3,2,4));bpy.context.object.data.energy=110;bpy.context.object.data.size=4
bpy.ops.object.camera_add(location=(0,-6,5.55));cam=bpy.context.object;scene.camera=cam;cam.rotation_euler=(Vector((0,0,.9))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.05
def render_image(path):
 scene.render.filepath=path;bpy.ops.render.render(write_still=True);im=bpy.data.images.load(path,check_existing=False);buf=array('f',[0])*(128*160*4);im.pixels.foreach_get(buf);bpy.data.images.remove(im);return buf
def save_atlas(name,rows,render_row):
 W,H=640,160*rows;pixels=array('f',[0])*(W*H*4);temp=os.path.join(OUT,'render.png')
 for row in range(rows):
  for phase in range(5):
   render_row(row,phase);buf=render_image(temp)
   for y in range(160):
    dst=((H-(row+1)*160+y)*W+phase*128)*4;src=y*128*4;pixels[dst:dst+512]=buf[src:src+512]
  print('SONG_RENDER',name,row+1,'/',rows,flush=True)
 atlas=bpy.data.images.new(name,width=W,height=H,alpha=True);atlas.pixels.foreach_set(pixels);atlas.filepath_raw=os.path.join(OUT,name+'.png');atlas.file_format='PNG';atlas.save();bpy.data.images.remove(atlas)
def gallery():
 for i,rig in enumerate(RIGS.values()):
  pose(rig,0,'idle');rig['root'].location.x=i*1.15;rig['root'].rotation_euler.z=.15
  for o in rig['parts']:o.hide_render=False
 cam.location=(2.875,-8,6);cam.rotation_euler=(Vector((2.875,0,.9))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=7.6
 scene.render.resolution_x=1200;scene.render.resolution_y=500
 bpy.ops.object.select_all(action='DESELECT')
 for screen in bpy.data.screens:
  for area in screen.areas:
   if area.type=='VIEW_3D':area.spaces.active.region_3d.view_distance=8;area.spaces.active.region_3d.view_location=(2.875,0,.9)
 bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'song-people-source.blend'))
if '--source-only' in sys.argv:
 gallery()
elif PREVIEW:
 for i,role in enumerate(['man','woman','porter','merchant']):
  rig=RIGS[role]
  for o in rig['parts']:o.hide_render=False
  pose(rig,math.pi/4);rig['root'].rotation_euler.z=.5;render_image(os.path.join(ROOT,'test-results','people-3d-'+role+'.png'))
  for o in rig['parts']:o.hide_render=True
else:
 for role,rig in RIGS.items():
  for o in rig['parts']:o.hide_render=False
  def frame(row,phase):
   rig['root'].rotation_euler.z=math.pi/2-row*math.tau/8;pose(rig,(phase-1)*math.tau/4 if phase else 0,'idle' if phase==0 else None)
  save_atlas(role,8,frame)
  for o in rig['parts']:o.hide_render=True
 actions=['hammer','stir','lift','weave','pour','count']
 CURRENT=[]
 hammer=rod('Artisan hammer',(0,0,0),(0,0,1),.018,'wood');head=box('Hammer iron head',(0,0,0),(.13,.065,.055),'iron');stick=rod('Stirring stick',(0,0,0),(0,0,1),.012,'wood');jug=ball('Serving ewer',(0,0,0),(.07,.07,.10),'clay');neck=rod('Ewer neck',(0,0,0),(0,0,1),.027,'clay');tools=[hammer,head,stick,jug,neck]
 for o in tools:o.hide_render=True
 active=[None]
 def work_frame(row,frame):
  act=actions[row//4];direction=row%4;role='woman' if act=='pour' else 'merchant' if act=='count' else 'man';rig=RIGS[role]
  if active[0] is not rig:
   if active[0]:
    for o in active[0]['parts']:o.hide_render=True
   for o in rig['parts']:o.hide_render=False
   active[0]=rig
  rig['root'].rotation_euler.z=math.pi/2-direction*math.pi/2
  phase=(frame-1)*math.tau/4 if frame else 0;hands=pose(rig,phase,act if frame else 'idle')
  for o in tools:o.hide_render=True;o.parent=rig['root']
  hand=hands[1]
  if act=='hammer':
   hammer.hide_render=False;head.hide_render=False;pose_rod(hammer,hand,hand+Vector((0,0,.25)),.017);head.location=hand+Vector((0,0,.26))
  if act=='stir':stick.hide_render=False;pose_rod(stick,hands[-1]+Vector((0,0,.12)),Vector((.03,-.32,.63)),.013)
  if act=='pour':
   jug.hide_render=False;neck.hide_render=False;jug.location=hand+Vector((0,-.025,0));pose_rod(neck,hand+Vector((0,-.025,.04)),hand+Vector((0,-.025,.15)),.025)
 save_atlas('workers',24,work_frame)
 for o in tools:o.hide_render=True
 for rig in RIGS.values():
  for o in rig['parts']:o.hide_render=True
 with open(os.path.join(OUT,'manifest.json'),'w',encoding='utf-8') as f:json.dump({'columns':5,'directions':8,'frames':5,'roles':list(RIGS),'workActions':actions,'workDirections':4,'width':128,'height':160},f,indent=2)
 gallery()
 print('SONG_PEOPLE_3D_READY',OUT,flush=True)
