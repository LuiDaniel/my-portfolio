"""Renderiza un video de presentación del robot con todas las animaciones en secuencia.

Se ejecuta en un Blender en segundo plano (no modifica robot.blend):
    blender -b robot.blend -P render_showreel.py -- [--still FRAME]

Salida: renders/showreel.mp4 (o renders/still_FRAME.png con --still).
"""
import bpy, math, os, sys
from mathutils import Vector

ROOT = r"C:\Users\danie\portafolio"
OUT_DIR = os.path.join(ROOT, "renders")
os.makedirs(OUT_DIR, exist_ok=True)
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
STILL = int(argv[argv.index("--still") + 1]) if "--still" in argv else None

sc = bpy.context.scene
rig = bpy.data.objects["Robot_Rig"]

# ---------------------------------------------------------------- secuencia de clips (NLA)
SEQ = ["WakeUp", "Discover", "Idle", "LookAround", "Wave", "Stretch"]
ad = rig.animation_data
ad.action = None
for tr in ad.nla_tracks:
    tr.mute = True
track = ad.nla_tracks.new()
track.name = "Showreel"
f = 1
marks = []
for name in SEQ:
    act = bpy.data.actions[name]
    s = track.strips.new(name, f, act)
    s.extrapolation = 'NOTHING'
    marks.append((name, f))
    f = int(s.frame_end) + 1
end = f + 20
track.strips[-1].extrapolation = 'HOLD_FORWARD'
blinks = ad.nla_tracks.new()
blinks.name = "Blinks"
idle_start = dict(marks)["Idle"]
for off in (35, 92):
    b = blinks.strips.new(f"Blink{off}", idle_start + off, bpy.data.actions["Blink"])
    b.extrapolation = 'NOTHING'
sc.frame_start, sc.frame_end = 1, end
sc.render.fps = 30

# ---------------------------------------------------------------- escena: suelo, luces, mundo
world = bpy.data.worlds.get("ShowWorld") or bpy.data.worlds.new("ShowWorld")
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
bg.inputs["Color"].default_value = (0.006, 0.008, 0.012, 1)
bg.inputs["Strength"].default_value = 1.0
sc.world = world

bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, 0))
floor = bpy.context.active_object
fm = bpy.data.materials.new("M_Floor")
fm.use_nodes = True
b = next(n for n in fm.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
b.inputs["Base Color"].default_value = (0.012, 0.013, 0.016, 1)
b.inputs["Roughness"].default_value = 0.35
b.inputs["Metallic"].default_value = 0.0
floor.data.materials.append(fm)


def area(name, loc, energy, color, size, target=(0, 0, 1.0)):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy = energy
    ld.color = color
    ld.size = size
    ob = bpy.data.objects.new(name, ld)
    sc.collection.objects.link(ob)
    ob.location = loc
    d = Vector(target) - Vector(loc)
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return ob


for o in [o for o in bpy.data.objects if o.type == 'LIGHT' and o.name == "Light"]:
    bpy.data.objects.remove(o, do_unlink=True)
area("Key", (-2.2, -2.6, 2.6), 120, (1.0, 0.97, 0.93), 2.0)
area("Fill", (2.6, -2.0, 1.2), 30, (0.75, 0.85, 1.0), 2.5)
area("RimL", (-1.8, 2.4, 2.2), 380, (0.55, 0.9, 1.0), 1.2)
area("RimR", (1.9, 2.2, 1.6), 300, (1.0, 1.0, 1.0), 1.2)
area("Top", (0, 0.5, 3.6), 45, (1.0, 1.0, 1.0), 1.5, target=(0, 0, 0.9))

# ---------------------------------------------------------------- cámara (encuadre 4:5, cuerpo entero)
cd = bpy.data.cameras.new("ShowCam")
cd.lens = 50
cam = bpy.data.objects.new("ShowCam", cd)
sc.collection.objects.link(cam)
target = Vector((0, 0, 0.93))
dirv = Vector((0.42, -1.0, 0.12)).normalized()
cam.location = target + dirv * 3.25
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.camera = cam

# ---------------------------------------------------------------- render
for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        sc.render.engine = eng
        break
    except TypeError:
        pass
try:
    sc.eevee.taa_render_samples = 16
except AttributeError:
    pass
sc.render.resolution_x, sc.render.resolution_y = 720, 900
sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'AgX' if 'AgX' in [i.identifier for i in
                                                    sc.view_settings.bl_rna.properties['view_transform'].enum_items] else sc.view_settings.view_transform
sc.view_settings.look = 'None'
sc.view_settings.exposure = -0.1

# resplandor del neón (compositor); si la API no coincide, se omite
try:
    tree = bpy.data.node_groups.new("ShowGlow", "CompositorNodeTree")
    tree.interface.new_socket("Image", in_out='OUTPUT', socket_type='NodeSocketColor')
    rl = tree.nodes.new("CompositorNodeRLayers")
    gl = tree.nodes.new("CompositorNodeGlare")
    out = tree.nodes.new("NodeGroupOutput")
    tree.links.new(rl.outputs["Image"], gl.inputs["Image"])
    tree.links.new(gl.outputs["Image"], out.inputs[0])
    for key, val in (("Type", "Bloom"), ("Quality", "High"), ("Threshold", 1.0), ("Size", 0.6),
                     ("Strength", 0.6), ("Mix", 0.0)):
        if key in gl.inputs:
            try:
                gl.inputs[key].default_value = val
            except (TypeError, ValueError):
                pass
    sc.compositing_node_group = tree
    sc.render.use_compositing = True
    print("Glow: ok")
except Exception as e:
    print("Glow omitido:", e)

if STILL is not None:
    sc.frame_set(STILL)
    sc.render.image_settings.file_format = 'PNG'
    sc.render.filepath = os.path.join(OUT_DIR, f"still_{STILL}.png")
    bpy.ops.render.render(write_still=True)
else:
    try:
        sc.render.image_settings.media_type = 'VIDEO'
    except (AttributeError, TypeError):
        pass
    sc.render.image_settings.file_format = 'FFMPEG'
    sc.render.ffmpeg.format = 'MPEG4'
    sc.render.ffmpeg.codec = 'H264'
    sc.render.ffmpeg.constant_rate_factor = 'HIGH'
    sc.render.ffmpeg.ffmpeg_preset = 'GOOD'
    sc.render.filepath = os.path.join(OUT_DIR, "showreel.mp4")
    bpy.ops.render.render(animation=True)
print("Secuencia:", marks, "fin", end)
