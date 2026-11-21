"""Original procedural Jurchen/Jin game art. Run with Blender --background --python.
Schematic game designs, not a claim to reconstruct a particular archaeological suit.
The .blend source and transparent, eight-direction walking atlas are reproducible.
"""
import bpy, math, os
from mathutils import Vector
from array import array
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'assets','jin');os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,col,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*col,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=.6;return m
M={k:mat(k,c,.5 if k=='iron' else 0) for k,c in {'iron':(.24,.25,.27),'cloth':(.38,.12,.09),'fur':(.69,.57,.39),'skin':(.64,.43,.27),'wood':(.22,.12,.065),'horse':(.24,.16,.11),'mane':(.065,.045,.035),'ivory':(.86,.82,.65),'gold':(.62,.43,.13)}.items()}
parts=[]
def cube(n,loc,scale,m):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=n;o.scale=scale;o.data.materials.append(M[m]);parts.append(o);return o
def ball(n,loc,scale,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=loc);o=bpy.context.object;o.name=n;o.scale=scale;o.data.materials.append(M[m]);parts.append(o);return o
def rod(n,a,b,r,m):
 d=Vector(b)-Vector(a);bpy.ops.mesh.primitive_cylinder_add(vertices=8,radius=r,depth=d.length,location=(Vector(a)+Vector(b))/2);o=bpy.context.object;o.name=n;o.rotation_euler=d.to_track_quat('Z','Y').to_euler();o.data.materials.append(M[m]);parts.append(o);return o
def person(z=0,rider=False):
 cube('russet padded coat',(0,0,z+.82),(.47,.28,.63),'cloth');ball('fur shoulder collar',(0,0,z+1.12),(.32,.20,.12),'fur')
 for j in range(4):
  for i in range(5):cube('overlapping lamellar plate',((i-2)*.09,-.154,z+.64+j*.11),(.083,.035,.13),'iron')
 ball('face',(0,-.01,z+1.36),(.15,.14,.19),'skin');ball('iron helmet',(0,.01,z+1.49),(.18,.16,.12),'iron')
 for i in range(10):
  a=i*math.tau/10;ball('fur helmet rim',(.16*math.cos(a),.14*math.sin(a),z+1.43),(.048,.048,.05),'fur')
 rod('helmet finial',(0,0,z+1.55),(0,0,z+1.72),.025,'gold')
 for x in [-.23,.23]:
  rod('arm',(x,0,z+1.03),(x*1.55,-.15,z+.74),.085,'cloth');ball('hand',(x*1.55,-.15,z+.72),(.065,.06,.065),'skin')
  end=(x*1.4,.02,z+.22) if rider else (x*.6,.04,z+.13)
  rod('booted leg',(x*.6,0,z+.61),end,.09,'iron')
 for i in range(4):ball('dark queue braid',(0,.14,z+1.29-i*.065),(.033,.04,.05),'mane')
def horse():
 ball('horse barrel',(0,.08,.78),(.30,.53,.32),'horse');ball('neck',(0,-.39,1.05),(.20,.23,.4),'horse');ball('long horse head',(0,-.58,1.34),(.14,.27,.17),'horse')
 rod('mane',(0,-.32,.95),(0,-.43,1.51),.065,'mane');rod('tail',(0,.57,.90),(0,.76,.34),.055,'mane')
 legs=[]
 for x in [-.19,.19]:
  for y in [-.25,.39]:legs.append(rod('horse leg',(x,y,.73),(x,y,.13),.065,'horse'));ball('hoof',(x,y,.1),(.08,.1,.06),'mane')
 cube('ivory saddlecloth',(0,.08,1.04),(.65,.45,.09),'ivory');return legs
variants=[]
for kind in ['foot','lancer','archer','camp']:
 parts=[];legs=[]
 if kind=='camp':
  for x in [-.8,.8]:
   cube('timber longhouse',(x,.15,.4),(.98,1.2,.7),'wood');o=cube('steep bark roof',(x,.15,.85),(1.1,1.35,.12),'fur');o.rotation_euler.y=.12
   for y in [-.5,.8]:rod('gable beam',(x-.55,y,.7),(x,y,1.08),.04,'wood');rod('gable beam',(x,y,1.08),(x+.55,y,.7),.04,'wood')
  for i in range(14):rod('palisade',(-1.5+i*.23,1.0,0),(-1.5+i*.23,1.0,.8),.05,'wood')
  rod('white standard',(.05,-.6,0),(.05,-.6,2),.035,'wood');cube('Jin ivory banner',(.24,-.6,1.74),(.4,.04,.43),'ivory');cube('black standard mark',(.24,-.63,1.74),(.06,.02,.24),'iron')
 else:
  if kind!='foot':legs=horse();person(.57,True)
  else:
   person();legs=[o for o in parts if o.name.startswith('booted leg')]
  if kind!='archer':rod('long spear',(.4,-.3,.15),(.4,-.3,2.25),.025,'wood');ball('steel spear head',(.4,-.3,2.3),(.045,.035,.15),'iron')
  else:
   for a,b in [((.39,-.3,.8),(.49,-.3,1.2)),((.49,-.3,1.2),(.39,-.3,1.65))]:rod('recurved bow',a,b,.025,'wood')
   cube('quiver',(-.27,.21,1.4),(.11,.13,.48),'wood')
  if kind=='lancer':rod('ivory pennant pole',(-.4,.2,.7),(-.4,.2,2.4),.025,'wood');cube('swallowtail standard',(-.21,.2,2.18),(.37,.035,.35),'ivory')
 collection=bpy.data.collections.new('Jin '+kind);bpy.context.scene.collection.children.link(collection)
 for o in parts:
  for old_collection in list(o.users_collection):old_collection.objects.unlink(o)
  collection.objects.link(o)
 variants.append((kind,list(parts),legs))
for _,objects,_ in variants:
 for o in objects:o.hide_render=True
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=8;scene.cycles.use_denoising=True
scene.render.resolution_x=160;scene.render.resolution_y=160;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.view_settings.view_transform='Standard'
scene.world.color=(.5,.5,.5)
bpy.ops.object.light_add(type='AREA',location=(-3,-4,7));bpy.context.object.data.energy=450;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=5
bpy.ops.object.light_add(type='AREA',location=(4,2,5));bpy.context.object.data.energy=250;bpy.context.object.data.size=4
bpy.ops.object.camera_add(location=(3,-5,4));cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=3.1
W,H=1280,1120;pixels=array('f',[0])*(W*H*4)
for vi,(kind,objects,legs) in enumerate(variants):
 for o in objects:o.hide_render=False
 frames=1 if kind=='camp' else 2
 for frame in range(frames):
  for i,leg in enumerate(legs):leg.rotation_euler.x=(.16 if frame else -.16)*(-1 if i%2 else 1)
  for direction in range(8):
   a=direction*math.tau/8;cam.location=(4*math.sin(a),-4*math.cos(a),3.4);target=Vector((0,0,1.05 if kind!='camp' else .8));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=3.2 if kind!='camp' else 4.5
   scene.render.filepath=os.path.join(OUT,'frame.png');bpy.ops.render.render(write_still=True)
   im=bpy.data.images.load(scene.render.filepath,check_existing=False);buf=array('f',[0])*(160*160*4);im.pixels.foreach_get(buf);row=vi*2+frame
   for y in range(160):
    dst=((H-(row+1)*160+y)*W+direction*160)*4;pixels[dst:dst+640]=buf[y*640:(y+1)*640]
   bpy.data.images.remove(im)
 for o in objects:o.hide_render=True
atlas=bpy.data.images.new('Jurchen Jin eight-direction atlas',width=W,height=H,alpha=True);atlas.pixels.foreach_set(pixels);atlas.filepath_raw=os.path.join(OUT,'jin-atlas.png');atlas.file_format='PNG';atlas.save()
for kind,objects,_ in variants:
 for o in objects:o.hide_render=kind!='foot'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'jin-source.blend'))
print('JIN_ATLAS_READY',atlas.filepath_raw)
