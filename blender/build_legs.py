"""Construye las piernas (estilo refs 2/4): cadera, muslo, rodilla, espinilla, tobillo y pie.

Ejecutar dentro de Blender (después de build_waist.py):
    exec(open(r"C:\\Users\\danie\\portafolio\\blender\\build_legs.py", encoding="utf-8").read())

Se modela la pierna izquierda (+X) y se espeja. Piernas rectas, pies sobre el suelo (Z = 0).
"""
import bpy, math, sys, importlib
from mathutils import Vector, Matrix

sys.path.insert(0, r"C:\Users\danie\portafolio\blender")
import robot_utils as ru
importlib.reload(ru)
from robot_utils import link, parent_keep, cylinder, torus, bevel, pod_mesh

ru.setup_scene()
PREFIXES = ("Hip", "Thigh", "Knee", "Shin", "Ankle", "Foot")
ru.remove_objects([o.name for o in bpy.data.objects
                   if o.name.startswith(PREFIXES) and o.name.endswith(("_L", "_R"))])
MATS = ru.base_materials()
pelvis = bpy.data.objects["Pelvis"]

# cotas compartidas con build_details.py (robot_utils.LEG)
L_ = ru.LEG
X, Y0 = L_["X"], L_["Y0"]     # eje de la pierna
HIP = L_["HIP"]               # centro de la cadera
TH_TOP, TH_BOT = L_["TH_TOP"], L_["TH_BOT"]
KNEE = L_["KNEE"]
SH_TOP, SH_BOT = L_["SH_TOP"], L_["SH_BOT"]
ANKLE = L_["ANKLE"]


def prim_mesh(ob):
    me = ob.data
    bpy.data.objects.remove(ob, do_unlink=True)
    return me


def orient(me, axis, center):
    q = Vector((0, 0, 1)).rotation_difference(Vector(axis).normalized())
    me.transform(Matrix.Translation(Vector(center)) @ q.to_matrix().to_4x4())
    return me


def place(name, me, pivot, mat, parent=None):
    """me en coordenadas de mundo -> objeto con origen en pivot."""
    pivot = Vector(pivot)
    me.transform(Matrix.Translation(-pivot))
    ob = link(name, me, mat)
    ob.location = pivot
    if parent is not None:
        parent_keep(ob, parent)
    return ob


def column(name, top, bot, prof, e_xy, e_top, e_bot, shape=None, segs=(32, 20)):
    me = pod_mesh(name, top - bot, prof, e_xy=e_xy, e_top=e_top, e_bot=e_bot, segs=segs, shape=shape)
    me.transform(Matrix.Translation((X, Y0, top)))
    return me


# ---------------------------------------------------------------- cadera
hipj = orient(prim_mesh(cylinder("tmp", 0.050, 0.095, 28, MATS["joint"])), (1, 0, 0), (X - 0.01, Y0, HIP))
hip = place("HipJoint_L", hipj, (X, Y0, HIP), MATS["joint"], pelvis)
bevel(hip, 0.004)
hcap = orient(prim_mesh(cylinder("tmp", 0.034, 0.012, 28, MATS["joint"])), (1, 0, 0), (X + 0.044, Y0, HIP))
place("HipCap_L", hcap, (X, Y0, HIP), MATS["joint"], pelvis)

# ---------------------------------------------------------------- muslo
def th_prof(t):
    return 0.076 - 0.020 * t, 0.080 - 0.022 * t

def th_shape(Xs, Ys, Zs, t):
    # parte superior recortada en diagonal (más alta por fuera), como la carcasa del brazo
    k = max(0.0, 1 - t / 0.2)
    return Xs, Ys, Zs + 0.03 * (Xs / 0.076) * k

thigh = place("Thigh_L", column("Thigh_L", TH_TOP, TH_BOT, th_prof, 0.75, 0.40, 0.28, th_shape),
              (X, Y0, HIP), MATS["body"], pelvis)

# ---------------------------------------------------------------- rodilla + espinilla
def sh_prof(t):
    # gemelo: más grueso arriba, se estrecha hacia el tobillo
    return 0.060 - 0.019 * t, 0.062 - 0.020 * t ** 0.8

def sh_shape(Xs, Ys, Zs, t):
    if Ys > 0:   # gemelo por detrás
        Ys *= 1 + 0.18 * math.sin(min(1.0, t / 0.6) * math.pi)
    return Xs, Ys, Zs

shin = place("Shin_L", column("Shin_L", SH_TOP, SH_BOT, sh_prof, 0.70, 0.30, 0.30, sh_shape),
             (X, Y0, KNEE), MATS["body"], thigh)
kj = orient(prim_mesh(cylinder("tmp", 0.040, 0.094, 28, MATS["joint"])), (1, 0, 0), (X, Y0, KNEE))
place("KneeJoint_L", kj, (X, Y0, KNEE), MATS["joint"], shin)
kring = orient(prim_mesh(torus("tmp", 0.054, 0.0045, MATS["neon"], seg=40)), (0, 0, 1), (X, Y0, TH_BOT - 0.007))
place("KneeRing_L", kring, (X, Y0, KNEE), MATS["neon"], thigh)
# rodillera
kp = pod_mesh("tmp", 0.075, lambda t: (0.040 - 0.007 * t, 0.013), e_xy=0.6, e_top=0.5, e_bot=0.5, segs=(20, 12))
kp.transform(Matrix.Translation((X, Y0 - 0.058, KNEE + 0.042)))
place("KneePad_L", kp, (X, Y0, KNEE), MATS["joint"], shin)

# ---------------------------------------------------------------- tobillo + pie
aj = orient(prim_mesh(cylinder("tmp", 0.030, 0.074, 24, MATS["joint"])), (1, 0, 0), (X, Y0, ANKLE))
aring = orient(prim_mesh(torus("tmp", 0.040, 0.0040, MATS["neon"], seg=36)), (0, 0, 1), (X, Y0, SH_BOT - 0.006))
place("AnkleRing_L", aring, (X, Y0, KNEE), MATS["neon"], shin)

FOOT_LEN, TOE_Y = L_["FOOT_LEN"], L_["TOE_Y"]


def foot_prof(t):
    # t=0 talón, t=1 punta: ancho y alto
    return 0.054 - 0.006 * t, 0.050 - 0.026 * t ** 1.2

def foot_shape(Xs, Ys, Zs, t):
    # Ys local -> altura (tras rotar): positivo = abajo; suela plana
    return Xs, min(Ys, 0.6 * foot_prof(t)[1]), Zs

fm = pod_mesh("Foot_L", FOOT_LEN, foot_prof, e_xy=0.45, e_top=0.35, e_bot=0.45, segs=(28, 18), shape=foot_shape)
# eje -Z del pod -> -Y (hacia delante); Y local -> -Z
fm.transform(Matrix.Rotation(math.radians(-90), 4, 'X'))
bb = [v.co.z for v in fm.vertices]
fm.transform(Matrix.Translation((X, TOE_Y + FOOT_LEN, -min(bb))))
foot = place("Foot_L", fm, (X, Y0, ANKLE), MATS["body"], shin)
place("AnkleJoint_L", aj, (X, Y0, ANKLE), MATS["joint"], foot)

# ---------------------------------------------------------------- lado derecho (espejo)
left = [o for o in bpy.data.objects if o.name.startswith(PREFIXES) and o.name.endswith("_L")]
ru.mirror_side(left)
print("Piernas:", len(left), "piezas por lado | pie z min:", round(min(bb), 3))
