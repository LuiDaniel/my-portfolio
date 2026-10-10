"""Construye brazos y manos (estilo refs 2/3/4): hombro, brazo, codo, antebrazo, muñeca, mano y dedos.

Ejecutar dentro de Blender (después de build_torso.py):
    exec(open(r"C:\\Users\\danie\\portafolio\\blender\\build_arms.py", encoding="utf-8").read())

Se modela el brazo izquierdo (+X) en un marco local (origen en el hombro, brazo a lo largo de -Z,
-Y = delante) y luego se espeja para crear el derecho. Pose A (brazos ligeramente abiertos).
"""
import bpy, bmesh, math, sys, importlib
from mathutils import Vector, Matrix

sys.path.insert(0, r"C:\Users\danie\portafolio\blender")
import robot_utils as ru
importlib.reload(ru)
from robot_utils import link, parent_keep, raycaster, cylinder, torus, tube, bevel, pod_mesh

ru.setup_scene()
PREFIXES = ("Shoulder", "UpperArm", "Elbow", "Forearm", "Wrist", "Hand", "Finger", "Thumb")
ru.remove_objects([o.name for o in bpy.data.objects
                   if o.name.startswith(PREFIXES) and o.name.endswith(("_L", "_R"))])
MATS = ru.base_materials()
torso = bpy.data.objects["Torso"]

# cotas compartidas con build_details.py (robot_utils.ARM)
A_ = ru.ARM
SH = Vector(A_["SH"])                        # hombro (eje del brazo)
R = Matrix.Rotation(-math.radians(A_["TILT_DEG"]), 4, 'Y')   # local -Z -> abajo y hacia +X
TO_WORLD = ru.arm_to_world()
UA_TOP, UA_BOT = A_["UA_TOP"], A_["UA_BOT"]  # carcasa del brazo
ELBOW = A_["ELBOW"]                          # centro del codo
FA_TOP, FA_BOT = A_["FA_TOP"], A_["FA_BOT"]  # carcasa del antebrazo
WRIST = A_["WRIST"]                          # centro de la muñeca
PALM_TOP, PALM_BOT = A_["PALM_TOP"], A_["PALM_BOT"]


def W(p):
    return TO_WORLD @ Vector(p)


def place(name, me, pivot_local, mat, parent=None):
    """me en coordenadas locales del brazo -> objeto en mundo con origen en pivot."""
    pw = W(pivot_local)
    me.transform(Matrix.Translation(-pw) @ TO_WORLD)
    ob = link(name, me, mat)
    ob.location = pw
    if parent is not None:
        parent_keep(ob, parent)
    return ob


def prim_mesh(ob):
    """Extrae la malla de un objeto primitivo recién creado (y borra el objeto)."""
    me = ob.data
    bpy.data.objects.remove(ob, do_unlink=True)
    return me


def axis_mesh(me, axis, center):
    """Orienta una malla construida a lo largo de Z hacia 'axis' y la centra en 'center' (local)."""
    q = Vector((0, 0, 1)).rotation_difference(Vector(axis).normalized())
    me.transform(Matrix.Translation(Vector(center)) @ q.to_matrix().to_4x4())
    return me


# ---------------------------------------------------------------- hombro
sh_joint = axis_mesh(prim_mesh(cylinder("tmp", 0.032, 0.11, 24, MATS["joint"])), (1, 0, 0), (-0.062, 0, -0.008))
shoulder = place("ShoulderJoint_L", sh_joint, (-0.085, 0, -0.008), MATS["joint"], torso)

# ---------------------------------------------------------------- brazo (carcasa en cápsula)
def ua_prof(t):
    # deltoide voluminoso arriba que se afina hacia el codo
    return 0.041 + 0.026 * (1 - t) ** 1.6, 0.040 + 0.020 * (1 - t) ** 1.6

ua = pod_mesh("UpperArm_L", UA_TOP - UA_BOT, ua_prof, e_xy=0.80, e_top=0.55, e_bot=0.22, segs=(32, 20))
ua.transform(Matrix.Translation((0, 0, UA_TOP)))
upper = place("UpperArm_L", ua, (0, 0, 0), MATS["body"], torso)

# ---------------------------------------------------------------- codo
el = axis_mesh(prim_mesh(cylinder("tmp", 0.029, 0.064, 24, MATS["joint"])), (1, 0, 0), (0, 0, ELBOW))
forearm_pivot = (0, 0, ELBOW)
core = axis_mesh(prim_mesh(cylinder("tmp", 0.021, 0.07, 20, MATS["joint"])), (0, 0, 1), (0, 0, ELBOW + 0.01))

# ---------------------------------------------------------------- antebrazo robusto
def fa_prof(t):
    # robusto junto al codo, se estrecha hacia la muñeca
    return 0.057 - 0.022 * t ** 0.9, 0.052 - 0.019 * t ** 0.9

def fa_shape(X, Y, Z, t):
    # corte superior inclinado: más alto por el lado exterior (+X), como en la ref 2
    k = max(0.0, 1 - t / 0.22)
    return X, Y, Z + 0.026 * (X / 0.057) * k

fa = pod_mesh("Forearm_L", FA_TOP - FA_BOT, fa_prof, e_xy=0.62, e_top=0.30, e_bot=0.30,
              segs=(32, 20), shape=fa_shape)
fa.transform(Matrix.Translation((0, 0, FA_TOP)))
forearm = place("Forearm_L", fa, forearm_pivot, MATS["body"], upper)
place("ElbowJoint_L", el, forearm_pivot, MATS["joint"], forearm)
place("ElbowCore_L", core, forearm_pivot, MATS["joint"], forearm)
ering = axis_mesh(prim_mesh(torus("tmp", 0.035, 0.004, MATS["neon"], seg=36)), (0, 0, 1), (0, 0, UA_BOT - 0.006))
place("ElbowRing_L", ering, forearm_pivot, MATS["neon"], upper)

# detalle mecánico: pistones por detrás y rejilla por fuera, pegados a la superficie
bpy.context.view_layer.update()
fcast = raycaster(forearm)
inv_rot = R.to_3x3()


def on_forearm(local_pt, local_dir, off):
    o = W(local_pt) - (inv_rot @ Vector(local_dir)) * 0.2
    p, n = fcast(o, inv_rot @ Vector(local_dir))
    return p + n * off


pist = []
for dx in (-0.016, 0.016):
    a = on_forearm((dx, 0, -0.335), (0, -1, 0), 0.006)
    b = on_forearm((dx, 0, -0.470), (0, -1, 0), 0.006)
    pist.append(tube("tmp", [a, b], 0.0055, MATS["joint"], segs=10, smooth_samples=1))
for k, z in enumerate((-0.370, -0.385, -0.400, -0.415)):
    a = on_forearm((0, -0.020, z), (-1, 0, 0), 0.0015)
    b = on_forearm((0, 0.020, z), (-1, 0, 0), 0.0015)
    pist.append(tube("tmp", [a, a.lerp(b, 0.5), b], 0.0022, MATS["joint"], segs=6, smooth_samples=4))
det = ru.merge("ForearmDetail_L", pist, MATS["joint"], W(forearm_pivot))
for p in det.data.polygons:
    p.use_smooth = True
parent_keep(det, forearm)

# ---------------------------------------------------------------- muñeca
wj = axis_mesh(prim_mesh(cylinder("tmp", 0.023, 0.034, 20, MATS["joint"])), (0, 0, 1), (0, 0, WRIST))
place("WristJoint_L", wj, (0, 0, WRIST), MATS["joint"], forearm)
wr = axis_mesh(prim_mesh(torus("tmp", 0.030, 0.0036, MATS["neon"], seg=32)), (0, 0, 1), (0, 0, FA_BOT - 0.006))
place("WristRing_L", wr, (0, 0, WRIST), MATS["neon"], forearm)

# ---------------------------------------------------------------- mano
def palm_prof(t):
    return 0.019 - 0.002 * t, 0.038 + 0.005 * t

pm = pod_mesh("Hand_L", PALM_TOP - PALM_BOT, palm_prof, e_xy=0.55, e_top=0.40, e_bot=0.35, segs=(24, 14))
pm.transform(Matrix.Translation((0, 0, PALM_TOP)))
hand = place("Hand_L", pm, (0, 0, WRIST), MATS["body"], forearm)
# placa metálica en el dorso (lado +X, exterior)
plate = pod_mesh("tmp", 0.060, lambda t: (0.006, 0.030), e_xy=0.5, e_top=0.4, e_bot=0.4, segs=(16, 10))
plate.transform(Matrix.Translation((0.017, 0, PALM_TOP - 0.012)))
place("HandPlate_L", plate, (0, 0, WRIST), MATS["joint"], hand)


def segment(name, start, direction, length, r, parent, pin_axis=(0, 1, 0)):
    """Falange en cápsula + bisagra (pasador) en su base."""
    me = pod_mesh(name, length, lambda t: (r * (1 - 0.12 * t), r * (1 - 0.12 * t)),
                  e_xy=1.0, e_top=0.7, e_bot=0.7, segs=(12, 8))
    q = Vector((0, 0, -1)).rotation_difference(direction.normalized())
    me.transform(Matrix.Translation(start) @ q.to_matrix().to_4x4())
    bm = bmesh.new()
    bm.from_mesh(me)
    qa = Vector((0, 0, 1)).rotation_difference(Vector(pin_axis)).to_matrix().to_4x4()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=r * 0.62, radius2=r * 0.62,
                          depth=r * 2.3, matrix=Matrix.Translation(start) @ qa)
    bm.to_mesh(me)
    bm.free()
    return place(name, me, tuple(start), MATS["joint"], parent)


FINGERS = {   # nombre: (y, longitudes de falanges, radio) — dedos finos y largos (pinza tipo refs de la mano)
    "Index":  (-0.026, (0.040, 0.027, 0.022), 0.0074),
    "Middle": (-0.009, (0.043, 0.029, 0.023), 0.0076),
    "Ring":   (0.008,  (0.040, 0.027, 0.022), 0.0072),
    "Pinky":  (0.025,  (0.032, 0.022, 0.019), 0.0064),
}
CURL = (math.radians(8), math.radians(14), math.radians(12))   # flexión hacia la palma (-X)
for fname, (fy, lens, r) in FINGERS.items():
    p = Vector((-0.002, fy, PALM_BOT + 0.006))
    d = Vector((0, 0, -1))
    par = hand
    for k, (L, c) in enumerate(zip(lens, CURL)):
        d = Matrix.Rotation(c, 3, 'Y') @ d
        seg = segment(f"Finger_{fname}_{k + 1}_L", p, d, L, r * (1 - 0.08 * k), par)
        p = p + d * (L - r * 0.6)
        par = seg

thumb_dirs = [Vector((-0.30, -0.55, -0.78)), Vector((-0.40, -0.40, -0.82)), Vector((-0.50, -0.22, -0.84))]
p = Vector((-0.012, -0.034, PALM_TOP - 0.022))
par = hand
# pulgar largo: tiene que llegar a las yemas del índice/medio con los dedos casi estirados (pinza)
for k, (d, L) in enumerate(zip(thumb_dirs, (0.034, 0.030, 0.026))):
    seg = segment(f"Thumb_{k + 1}_L", p, d, L, 0.0082 * (1 - 0.08 * k), par,
                  pin_axis=d.cross(Vector((1, 0, 0))).normalized())
    p = p + d.normalized() * (L - 0.005)
    par = seg

# ---------------------------------------------------------------- lado derecho (espejo)
left = [o for o in bpy.data.objects if o.name.startswith(PREFIXES) and o.name.endswith("_L")]
right = ru.mirror_side(left)
print("Brazos:", len(left), "piezas por lado")
