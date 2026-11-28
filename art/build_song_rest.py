"""Render genuine seated poses from the game's existing civilian meshes.
Blender --background --python art/build_song_rest.py
"""
from pathlib import Path
source = Path(__file__).with_name('build_song_people.py')
exec(compile(source.read_text(encoding='utf-8').split("if '--source-only' in sys.argv:")[0], str(source), 'exec'))
OUT = os.path.join(ROOT, 'assets', 'song', 'people-rest')
os.makedirs(OUT, exist_ok=True)
for role, rig in RIGS.items():
    moving = set(rig['limbs'].values()) | set(rig['hands'].values()) | set(rig['feet'].values())
    for obj in rig['parts']:
        obj.hide_render = False
        if obj in moving:
            continue
        if obj.type == 'MESH' and obj.name.startswith(('Long woven', 'Plain merchants')):
            for v in obj.data.vertices:
                v.co.z = max(.1, v.co.z - .40)
                if v.co.z < .6:
                    v.co.y -= (.6 - v.co.z) * .45
        else:
            obj.location.z -= .40
    pixels = array('f', [0]) * (128 * 1280 * 4)
    for direction in range(8):
        pose(rig, 0, 'idle')
        for side in [-1, 1]:
            hip=(side*.105, 0, .46); knee=(side*.12, -.28, .46); ankle=(side*.12, -.30, .105)
            shoulder=(side*.225, 0, .95); elbow=(side*.25, -.10, .68); hand=(side*.14, -.29, .58)
            for part,a,b,r in [('thigh',hip,knee,.073),('shin',knee,ankle,.06),('upper',shoulder,elbow,.078),('fore',elbow,hand,.058)]:
                pose_rod(rig['limbs'][(side,part)],a,b,r)
            rig['hands'][side].location=hand
            rig['feet'][side].location=(ankle[0],ankle[1]-.035,.055)
        rig['root'].rotation_euler.z=math.pi/2-direction*math.tau/8
        buf=render_image(os.path.join(OUT,'render.png'))
        for y in range(160):
            dst=((1280-(direction+1)*160+y)*128)*4
            pixels[dst:dst+512]=buf[y*512:y*512+512]
    atlas=bpy.data.images.new(role+' seated',width=128,height=1280,alpha=True)
    atlas.pixels.foreach_set(pixels);atlas.filepath_raw=os.path.join(OUT,role+'.png');atlas.file_format='PNG';atlas.save();bpy.data.images.remove(atlas)
    for obj in rig['parts']:obj.hide_render=True
    print('SEATED_READY',role,flush=True)
print('SONG_REST_READY',OUT,flush=True)
