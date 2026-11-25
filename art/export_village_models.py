"""Export the game's editable people/animal meshes for the WebGL village.
Blender --background --python art/export_village_models.py
"""
import bpy, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST=os.path.join(ROOT,'assets','song','models');os.makedirs(DEST,exist_ok=True)
source=open(os.path.join(ROOT,'art','build_song_people.py'),encoding='utf-8').read()
exec(source.split('RIGS={')[0])
def export_model(name,root,parts):
 bpy.ops.object.select_all(action='DESELECT')
 root.select_set(True);root.location.x=0;root.rotation_euler=(0,0,0)
 for o in parts:
  o.hide_render=False;o.hide_viewport=False;o.hide_set(False);o.select_set(True)
  if 'part' not in o:o['part']='body'
  if o.type=='MESH':
   # glTF has no Blender procedural shader graph. Preserve its authored base dye.
   for m in o.data.materials:
    if m and m.use_nodes:
     p=m.node_tree.nodes.get('Principled BSDF')
     if p:
      for link in list(p.inputs['Base Color'].links):m.node_tree.links.remove(link)
   if len(o.data.polygons)>2500 and not o.modifiers.get('Realtime LOD'):
    mod=o.modifiers.new('Realtime LOD','DECIMATE');mod.ratio=.28
 bpy.context.view_layer.objects.active=root
 bpy.ops.export_scene.gltf(filepath=os.path.join(DEST,name+'.glb'),export_format='GLB',use_selection=True,export_extras=True,export_animations=False,export_apply=True,export_cameras=False,export_lights=False)
 for o in parts:o.hide_render=True
 print('VILLAGE_GLB',name,flush=True)
for role in ['man','woman','porter','merchant','elder','child','guard','archer']:
 rig=person(role if role in ['man','woman','porter','merchant','elder','child'] else 'man');pose(rig,0,'idle')
 for (side,part),o in rig['limbs'].items():o['part']=('leg' if part in ['thigh','shin'] else 'arm')+('L' if side<0 else 'R')
 for side,o in rig['hands'].items():o['part']='arm'+('L' if side<0 else 'R')
 for side,o in rig['feet'].items():o['part']='leg'+('L' if side<0 else 'R')
 if role in ['guard','archer']:
  for o in rig['parts']:
   if o.type=='MESH' and o.data.materials and o.data.materials[0]==M['indigo']:o.data.materials[0]=M['rust' if role=='guard' else 'teal']
  extra=[]
  if role=='guard':
   extra=[box('Lamellar breastplate',(0,-.16,1.23),(.34,.06,.29),'iron'),rod('Spear',(.32,-.13,.28),(.32,-.13,2.05),.018,'wood'),ball('Iron spear point',(.32,-.13,2.14),(.028,.028,.10),'iron')]
  else:
   for i in range(9):
    a=-1.3+i*.29;b=a+.29;extra.append(rod('Bow',(.32,-.18+math.cos(a)*.16,1.05+math.sin(a)*.34),(.32,-.18+math.cos(b)*.16,1.05+math.sin(b)*.34),.012,'wood'))
  for o in extra:o.parent=rig['root'];o['part']='body';rig['parts'].append(o)
 export_model(role,rig['root'],rig['parts'])
 # Keep the source parts but remove this exported rig from subsequent exports.

# Rebuild the editable animal scene without rendering its sprite atlases.
source=open(os.path.join(ROOT,'art','build_song_animals.py'),encoding='utf-8').read()
exec(source.split("for name in ['horse','song','xia','jin','oxcart','chicken']:atlas")[0])
for rig in [H,OX]:
 horse_pose(rig,0,False)
 for (side,front),parts in rig['legs'].items():
  for o in parts:o['part']='leg'+('F' if front<0 else 'B')+('L' if side<0 else 'R')
export_model('horse',H['root'],H['parts'])
export_model('oxcart',OX['root'],OX['parts']+cart)
export_model('chicken',CROOT,chicken)
for name in ['song','xia','jin']:
 rig=R[name]
 # Parent rider to the horse with its existing seated height preserved.
 rig['root'].parent=H['root']
 export_model('cavalry-'+name,H['root'],H['parts']+rig['parts']+[rig['root']])
 rig['root'].parent=None
print('VILLAGE_MODELS_READY',flush=True)
