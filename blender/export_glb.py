"""Exporta el robot a public/models/robot.glb (Draco + animaciones) para la web.

Se ejecuta en un Blender en segundo plano, sobre una copia en memoria de robot.blend:
    blender -b robot.blend -P export_glb.py

Optimización: las ~300 piezas se unen por (hueso, material) en unas pocas mallas rígidas
colgadas de su hueso. Se mantienen separados:
  - Eye_L / Eye_R (expresiones con textura de puntos LED),
  - los pistones (*PistonSleeve_* / *PistonRod_*) para reorientarlos en la web.
"""
import bpy, bmesh, os, re, json, struct
from mathutils import Matrix

ROOT = r"C:\Users\danie\portafolio"
OUT = os.path.join(ROOT, "public", "models", "robot.glb")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

OBJ = bpy.data.objects
rig = OBJ["Robot_Rig"]

# ---------------------------------------------------------------- pose de reposo, sin acción activa
ad = rig.animation_data
ad.action = None
for tr in ad.nla_tracks:
    tr.mute = True
for pb in rig.pose.bones:
    pb.rotation_quaternion = (1, 0, 0, 0)
    pb.location = (0, 0, 0)
    pb.scale = (1, 1, 1)
bpy.context.scene.frame_set(1)
bpy.context.view_layer.update()


def owner_bone(ob):
    o = ob
    while o is not None:
        if o.parent == rig and o.parent_type == 'BONE':
            return o.parent_bone
        o = o.parent
    return None


SUFFIX = {"M_Body_BlackMatte": "", "M_Visor_BlackMirror": "_Visor", "M_Joint_DarkMetal": "_Metal",
          "M_Neon_Cyan": "_Neon", "M_Plate_BlackSatin": "_Plate", "M_Steel_Polished": "_Steel",
          "M_Cable_Rubber": "_Cable", "M_Eye_LED": "_Eye"}

dg = bpy.context.evaluated_depsgraph_get()
groups, keep = {}, []
for ob in [o for o in OBJ if o.type == 'MESH']:
    b = owner_bone(ob)
    if b is None:
        continue
    if ob.name in ("Eye_L", "Eye_R") or ob.get("piston"):
        keep.append((ob, b))
        continue
    mat = ob.material_slots[0].material
    groups.setdefault((b, mat.name), []).append(ob)

# mallas evaluadas (con Solidify/Bevel aplicados) en coordenadas de mundo
baked = {}
for (b, mname), objs in groups.items():
    bm = bmesh.new()
    for o in objs:
        ev = o.evaluated_get(dg)
        tmp = bpy.data.meshes.new_from_object(ev)
        tmp.transform(ev.matrix_world)
        bm.from_mesh(tmp)
        bpy.data.meshes.remove(tmp)
    baked[(b, mname)] = bm

# borrar las piezas originales que se han unido
for objs in groups.values():
    for o in objs:
        OBJ.remove(o, do_unlink=True)

made = []
for (b, mname), bm in baked.items():
    name = b[2:] + SUFFIX.get(mname, "_" + mname)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(bpy.data.materials[mname])
    head = rig.matrix_world @ rig.data.bones[b].head_local
    me.transform(Matrix.Translation(-head))
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = head
    made.append((ob, b))

# colgar las mallas nuevas (y las conservadas) directamente de su hueso
items = made + keep
bpy.context.view_layer.update()   # evaluar las mallas nuevas: si no, su matrix_world aún es la identidad
saved = {ob.name: ob.matrix_world.copy() for ob, _ in items}
for ob, b in items:
    ob.parent = rig
    ob.parent_type = 'BONE'
    ob.parent_bone = b
    ob.matrix_parent_inverse = Matrix.Identity(4)
bpy.context.view_layer.update()
for ob, b in items:
    ob.matrix_world = saved[ob.name]
bpy.context.view_layer.update()
moved = [ob.name for ob, _ in items
         if (ob.matrix_world.translation - saved[ob.name].translation).length > 1e-4]
if moved:
    raise RuntimeError(f"Piezas desplazadas al colgarlas de los huesos: {moved[:10]}")
for ob, b in made:   # comprobación: la malla debe quedar alrededor de su hueso
    head = rig.matrix_world @ rig.data.bones[b].head_local
    if (ob.matrix_world.translation - head).length > 1e-3:
        raise RuntimeError(f"{ob.name} no quedó en su hueso {b}")

# nombres claros para los pistones: ElbowPiston_LSleeve -> ElbowPistonSleeve_L
for ob, _ in keep:
    m = re.match(r"(.*)_(L|R)(Sleeve|Rod)$", ob.name)
    if m:
        ob.name = f"{m.group(1)}{m.group(3)}_{m.group(2)}"

# ---------------------------------------------------------------- exportar
for o in bpy.context.view_layer.objects:
    o.select_set(False)
rig.select_set(True)
for ob, _ in items:
    ob.select_set(True)
bpy.context.view_layer.objects.active = rig

wanted = dict(
    filepath=OUT, export_format='GLB', use_selection=True, export_apply=True,
    export_yup=True, export_extras=True, export_cameras=False, export_lights=False,
    export_animations=True, export_animation_mode='ACTIONS', export_force_sampling=True,
    export_optimize_animation_size=True, export_def_bones=False, export_skins=True,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14, export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12, export_image_format='AUTO',
)
valid = {p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
kwargs = {k: v for k, v in wanted.items() if k in valid}
print("Opciones ignoradas:", sorted(set(wanted) - valid))
bpy.ops.export_scene.gltf(**kwargs)

# ---------------------------------------------------------------- resumen del archivo
with open(OUT, "rb") as fh:
    data = fh.read()
jlen = struct.unpack("<I", data[12:16])[0]
gj = json.loads(data[20:20 + jlen])
print(f"GLB: {len(data) / 1024 / 1024:.2f} MB | nodos {len(gj.get('nodes', []))} | "
      f"mallas {len(gj.get('meshes', []))} | materiales {len(gj.get('materials', []))} | "
      f"skins {len(gj.get('skins', []))}")
print("Extensiones:", gj.get("extensionsUsed"))
print("Animaciones:", [(a["name"], len(a["channels"])) for a in gj.get("animations", [])])
print("Mallas:", sorted(m["name"] for m in gj.get("meshes", [])))
