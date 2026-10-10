"""Esqueleto + animaciones del robot.

Ejecutar dentro de Blender después de build_details.py (build_all.py ya lo incluye):
    exec(open(r"C:\\Users\\danie\\portafolio\\blender\\build_rig.py", encoding="utf-8").read())

- Armature "Robot_Rig" con huesos B_* (B_Hips, B_Spine, B_Chest, B_Neck, B_Head, B_Eye_L/R,
  B_UpperArm_L/R, B_Forearm_L/R, B_Hand_L/R, falanges, B_Thigh_L/R, B_Shin_L/R, B_Foot_L/R).
- El robot es rígido: cada pieza principal cuelga de su hueso (sin pesos); los detalles
  siguen colgando de su pieza.
- B_Grip_L/R: punto entre las yemas del pulgar y el índice con la mano en pinza (ahí se "agarra"
  la gema en la intro de la web).
- Acciones (30 fps): WakeUp, Discover, Idle, LookAround, Wave, Stretch, Blink. Los ojos parpadean
  escalando B_Eye_* en vertical. Al final se ejecuta build_intro.py (Intro, Intro_Sweep).
"""
import bpy, math, sys, importlib, os
from mathutils import Vector, Quaternion, Matrix, Euler

sys.path.insert(0, r"C:\Users\danie\portafolio\blender")
import robot_utils as ru
importlib.reload(ru)

OBJ = bpy.data.objects
sc = bpy.context.scene
sc.render.fps = 30
RIG_NAME = "Robot_Rig"
CLIPS = ("WakeUp", "Discover", "Idle", "LookAround", "Wave", "Stretch", "Blink", "Intro", "Intro_Sweep")


def rot(axis, deg):
    return Quaternion(Vector(axis).normalized(), math.radians(deg))


def rx(d): return rot((1, 0, 0), d)
def ry(d): return rot((0, 1, 0), d)
def rz(d): return rot((0, 0, 1), d)


FINGER_NAMES = ("Index", "Middle", "Ring", "Pinky")
# Pinza para "atrapar la gema" (como coger una pizca): índice casi estirado que se curva hasta la
# yema del pulgar, dejando un hueco; medio, anular y meñique cada vez más recogidos detrás.
# Flexión por falange (grados, hacia la palma) y giro del pulgar (XYZ, grados, lado L).
PINCH_ANGLES = {"Index": (55, 30, 18), "Middle": (62, 40, 24), "Ring": (70, 50, 30), "Pinky": (76, 56, 34)}
PINCH_THUMB = (40, 20, 10)


def finger_rel(side, curl=0.0, pinch=0.0, spread=0.0):
    """Rotaciones relativas de los dedos (ejes de mundo en reposo).
    curl: flexión relajada (0..1) | pinch: 0..1 hacia la pinza | spread: 0..1 dedos abiertos/estirados."""
    sg = 1 if side == "L" else -1          # la palma izquierda mira a -X, la derecha a +X
    rel = {}
    for f in FINGER_NAMES:
        for k in (1, 2, 3):
            relaxed = (26 + 8 * k) * curl
            ang = relaxed * (1 - pinch) + PINCH_ANGLES[f][k - 1] * pinch - 14 * spread
            rel[f"B_Finger_{f}_{k}_{side}"] = ry(sg * ang)
    t = pinch - 0.6 * spread
    ex, ey, ez = (math.radians(v * t) for v in PINCH_THUMB)
    rel[f"B_Thumb_1_{side}"] = Euler((ex, sg * ey, sg * ez)).to_quaternion()
    return rel

# ---------------------------------------------------------------- limpiar un rig anterior
old = OBJ.get(RIG_NAME)
if old:
    # volver a la pose de reposo ANTES de soltar las piezas (si no, quedan en la pose animada)
    if old.animation_data:
        old.animation_data.action = None
        for tr in old.animation_data.nla_tracks:
            tr.mute = True
    for pb in old.pose.bones:
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)
        pb.scale = (1, 1, 1)
    bpy.context.view_layer.update()
    for ob in [o for o in OBJ if o.parent == old]:
        mw = ob.matrix_world.copy()
        ob.parent = None
        ob.matrix_world = mw
    data = old.data
    OBJ.remove(old, do_unlink=True)
    bpy.data.armatures.remove(data)
for name in CLIPS:
    act = bpy.data.actions.get(name)
    if act:
        bpy.data.actions.remove(act)

# ---------------------------------------------------------------- definición de huesos
A, G = ru.ARM, ru.LEG
TW = ru.arm_to_world()
FWD, UP = (0, -1, 0), (0, 0, 1)
bones = []   # (nombre, cabeza, cola, padre, eje Z deseado)


def B(name, head, tail, parent, z=FWD):
    bones.append((name, Vector(head), Vector(tail), parent, Vector(z)))


B("B_Root", (0, 0, 0), (0, 0, 0.12), None, FWD)
B("B_Hips", (0, 0.012, 0.855), (0, 0.012, 0.930), "B_Root")
B("B_Spine", (0, 0.012, 0.930), (0, 0.012, 1.020), "B_Hips")
B("B_Chest", (0, 0.012, 1.020), (0, 0.015, 1.430), "B_Spine")
B("B_Neck", (0, 0.015, 1.430), (0, 0.015, 1.530), "B_Chest")
B("B_Head", (0, 0.015, 1.530), (0, 0.015, 1.800), "B_Neck")
for s in ("L", "R"):
    c = OBJ["Eye_" + s].matrix_world.to_translation()
    B("B_Eye_" + s, c, c + Vector((0, -0.025, 0)), "B_Head", UP)

left = []   # huesos del lado izquierdo, para espejar
def BL(name, head, tail, parent, z=FWD):
    left.append((name, Vector(head), Vector(tail), parent, Vector(z)))


def W(p):
    return TW @ Vector(p)


BL("B_UpperArm_L", W((0, 0, 0)), W((0, 0, A["ELBOW"])), "B_Chest")
BL("B_Forearm_L", W((0, 0, A["ELBOW"])), W((0, 0, A["WRIST"])), "B_UpperArm_L")
BL("B_Hand_L", W((0, 0, A["WRIST"])), W((0, 0, A["PALM_BOT"])), "B_Forearm_L")
for chain in [[f"Finger_{f}_{k}_L" for k in (1, 2, 3)] for f in ("Index", "Middle", "Ring", "Pinky")] + \
             [[f"Thumb_{k}_L" for k in (1, 2, 3)]]:
    heads = [OBJ[n].matrix_world.to_translation() for n in chain]
    for k, n in enumerate(chain):
        tail = heads[k + 1] if k + 1 < len(heads) else heads[k] + (heads[k] - heads[k - 1]).normalized() * 0.02
        BL("B_" + n, heads[k], tail, "B_Hand_L" if k == 0 else "B_" + chain[k - 1])
X, Y0 = G["X"], G["Y0"]
BL("B_Thigh_L", (X, Y0, G["HIP"]), (X, Y0, G["KNEE"]), "B_Hips")
BL("B_Shin_L", (X, Y0, G["KNEE"]), (X, Y0, G["ANKLE"]), "B_Thigh_L")
BL("B_Foot_L", (X, Y0, G["ANKLE"]), (X, G["TOE_Y"] + 0.03, 0.03), "B_Shin_L", UP)


def pinch_grip():
    """Punto medio entre las yemas del índice y el pulgar con la mano izquierda en pinza (reposo)."""
    L = {n: (h, t, p) for n, h, t, p, _ in left}
    rel = finger_rel("L", pinch=1.0)
    tips = []
    for chain in ([f"B_Finger_Index_{k}_L" for k in (1, 2, 3)], [f"B_Thumb_{k}_L" for k in (1, 2, 3)]):
        D, head, prev = Quaternion(), None, None
        for n in chain:
            h, t, _ = L[n]
            head = h.copy() if prev is None else head + D @ (h - L[prev][0])
            D = D @ rel.get(n, Quaternion())
            prev = n
        tips.append(head + D @ (L[prev][1] - L[prev][0]))
    return (tips[0] + tips[1]) / 2


grip = pinch_grip()
hand_dir = (W((0, 0, A["PALM_BOT"])) - W((0, 0, A["WRIST"]))).normalized()
BL("B_Grip_L", grip, grip + hand_dir * 0.02, "B_Hand_L")

def mirror_name(n):
    return n[:-2] + "_R" if n and n.endswith("_L") else n

for name, h, t, par, z in left:
    bones.append((name, h, t, par, z))
    bones.append((mirror_name(name), Vector((-h.x, h.y, h.z)), Vector((-t.x, t.y, t.z)), mirror_name(par), z))

# ---------------------------------------------------------------- crear armature
arm_data = bpy.data.armatures.new(RIG_NAME)
rig = bpy.data.objects.new(RIG_NAME, arm_data)
sc.collection.objects.link(rig)
arm_data.display_type = 'STICK'
rig.show_in_front = True
for o in bpy.context.selected_objects:
    o.select_set(False)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
for name, h, t, par, z in bones:
    eb = arm_data.edit_bones.new(name)
    eb.head, eb.tail = h, t
    eb.align_roll(z)
for name, h, t, par, z in bones:
    if par:
        arm_data.edit_bones[name].parent = arm_data.edit_bones[par]
bpy.ops.object.mode_set(mode='OBJECT')

# ---------------------------------------------------------------- colgar piezas de los huesos
def bone_for(n):
    if n == "Pelvis":
        return "B_Hips"
    if n == "Waist" or n.startswith(("WaistRib_", "WaistCable_", "WaistVein_")):
        return "B_Spine"
    if n == "Torso":
        return "B_Chest"
    if n == "Neck" or n.startswith(("NeckRib_", "NeckCable_", "NeckVein_")):
        return "B_Neck"
    if n in ("Head", "Eye_L", "Eye_R"):
        return "B_" + n
    base = n[:-2]
    if n.endswith(("_L", "_R")) and (base in ("UpperArm", "Forearm", "Hand", "Thigh", "Shin", "Foot")
                                      or base.startswith(("Finger_", "Thumb_"))):
        return "B_" + n
    return None

bpy.context.view_layer.update()
# guardar TODAS las matrices de mundo antes de tocar nada (si no, los hijos de una pieza recién
# recolgada leen una posición intermedia sin evaluar)
targets = [(ob, bone_for(ob.name)) for ob in OBJ]
targets = [(ob, b) for ob, b in targets if b is not None and b in arm_data.bones]
saved = {ob.name: ob.matrix_world.copy() for ob in OBJ if ob.type == 'MESH'}
for ob, b in targets:
    ob.parent = rig
    ob.parent_type = 'BONE'
    ob.parent_bone = b
    ob.matrix_parent_inverse = Matrix.Identity(4)
bpy.context.view_layer.update()
for ob, b in targets:
    ob.matrix_world = saved[ob.name]
bpy.context.view_layer.update()
count = len(targets)
bad = [n for n, m in saved.items() if (OBJ[n].matrix_world.translation - m.translation).length > 1e-4]
if bad:
    raise RuntimeError(f"Piezas desplazadas al crear el rig: {bad[:10]}")

# ---------------------------------------------------------------- utilidades de pose
ORDER = [b[0] for b in bones]
PARENT = {b[0]: b[3] for b in bones}
REST_Q = {n: arm_data.bones[n].matrix_local.to_quaternion() for n in ORDER}
I = Quaternion()


def rest_dir(b):
    bb = arm_data.bones[b]
    return (bb.tail_local - bb.head_local).normalized()


def eye_axis():
    """Índice del eje local del hueso del ojo más alineado con la vertical del mundo."""
    m = arm_data.bones["B_Eye_L"].matrix_local.to_3x3()
    return max(range(3), key=lambda i: abs(m.col[i].z))


EYE_AX = eye_axis()


def key_pose(frame, rel=None, eyes=1.0, hips_up=0.0, only_eyes=False):
    """rel: {hueso: rotación relativa al padre expresada en ejes del mundo en reposo}."""
    rel = rel or {}
    D = {}
    for n in ORDER:
        dp = D[PARENT[n]] if PARENT[n] else I
        D[n] = dp @ rel.get(n, I)
    for n in ORDER:
        pb = rig.pose.bones[n]
        if not only_eyes:
            dp = D[PARENT[n]] if PARENT[n] else I
            q = REST_Q[n].inverted() @ dp.inverted() @ D[n] @ REST_Q[n]
            pb.rotation_mode = 'QUATERNION'
            pb.rotation_quaternion = q
            pb.keyframe_insert("rotation_quaternion", frame=frame)
        if n.startswith("B_Eye_"):
            sc_ = [1.0, 1.0, 1.0]
            sc_[EYE_AX] = max(eyes, 0.02)
            pb.scale = sc_
            pb.keyframe_insert("scale", frame=frame)
    if not only_eyes:
        pb = rig.pose.bones["B_Hips"]
        pb.location = (0, hips_up, 0)   # el hueso apunta hacia arriba: Y local = vertical
        pb.keyframe_insert("location", frame=frame)


def new_clip(name):
    act = bpy.data.actions.new(name)
    act.use_fake_user = True
    rig.animation_data_create()
    rig.animation_data.action = act
    return act


def finish_clip(act, start, end, cyclic=False):
    ad = rig.animation_data
    ad.action = None
    tr = ad.nla_tracks.new()
    tr.name = act.name
    strip = tr.strips.new(act.name, start, act)
    tr.mute = True
    act.frame_range = (start, end)
    act.use_frame_range = True
    act.use_cyclic = cyclic


def arms(rel, l_up=None, r_up=None, l_fore=None, r_fore=None, l_hand=None, r_hand=None):
    for k, v in (("B_UpperArm_L", l_up), ("B_UpperArm_R", r_up), ("B_Forearm_L", l_fore),
                 ("B_Forearm_R", r_fore), ("B_Hand_L", l_hand), ("B_Hand_R", r_hand)):
        if v is not None:
            rel[k] = v
    return rel


# pose base: codos y muñecas ligeramente flexionados (hacia delante = rotación negativa en X)
def base(extra=None):
    rel = arms({}, l_fore=rx(-8), r_fore=rx(-8), l_hand=rx(-4), r_hand=rx(-4))
    rel.update(extra or {})
    return rel


# ======================================================================== WakeUp (despertar)
act = new_clip("WakeUp")
slump = base({"B_Spine": rx(6), "B_Chest": rx(12), "B_Neck": rx(15), "B_Head": rx(22),
              "B_UpperArm_L": ry(8), "B_UpperArm_R": ry(-8),
              "B_Forearm_L": rx(-18), "B_Forearm_R": rx(-18)})
key_pose(1, slump, eyes=0.02, hips_up=-0.015)
key_pose(18, slump, eyes=0.02, hips_up=-0.015)
key_pose(21, slump, eyes=1.0, hips_up=-0.015, only_eyes=False)   # se encienden los ojos
key_pose(24, slump, eyes=0.15, hips_up=-0.015)                    # parpadeo
key_pose(28, slump, eyes=1.0, hips_up=-0.015)
key_pose(36, slump, eyes=1.0, hips_up=-0.015)
mid = base({"B_Spine": rx(2), "B_Chest": rx(4), "B_Neck": rx(4), "B_Head": rx(-4)})
key_pose(58, mid, eyes=1.0, hips_up=-0.004)
over = base({"B_Chest": rx(-2), "B_Head": rx(-8)})                # mira un poco hacia arriba
key_pose(70, over, eyes=1.0)
key_pose(78, over, eyes=0.2)
key_pose(82, over, eyes=1.0)
key_pose(96, base(), eyes=1.0)
finish_clip(act, 1, 96)

# ======================================================================== Idle (reposo, cíclico)
act = new_clip("Idle")
for f, br, yaw, sway in ((1, 0, 0, 0), (31, -1.5, 2, 1), (61, 0, 4, 0), (91, -1.5, 2, -1), (121, 0, 0, 0)):
    key_pose(f, base({"B_Chest": rx(br), "B_Head": rz(yaw) @ rx(br * 0.6),
                      "B_UpperArm_L": rx(sway * 1.5), "B_UpperArm_R": rx(-sway * 1.5)}),
             hips_up=0.003 * (br / -1.5))
finish_clip(act, 1, 121, cyclic=True)

# ======================================================================== LookAround (mirar alrededor)
act = new_clip("LookAround")
def look(yaw, pitch=0, roll=0):
    return base({"B_Chest": rz(yaw * 0.12), "B_Neck": rz(yaw * 0.3),
                 "B_Head": rz(yaw * 0.58) @ rx(pitch) @ ry(roll)})
key_pose(1, look(0))
key_pose(22, look(55, -4, 4))
key_pose(30, look(55, -4, 4), eyes=0.55)       # entrecierra los ojos
key_pose(46, look(58, -6, 6), eyes=0.55)
key_pose(52, look(58, -6, 6), eyes=1.0)
key_pose(72, look(-55, 2, -4))
key_pose(80, look(-55, 2, -4), eyes=0.15)      # parpadeo
key_pose(84, look(-55, 2, -4))
key_pose(98, look(-58, 4, -6))
key_pose(116, look(0, -3))
key_pose(128, look(0))
finish_clip(act, 1, 128)

# ======================================================================== Wave (saludo con la mano derecha)
act = new_clip("Wave")
fore_axis_r = rest_dir("B_Forearm_R")
def wave(bend, wrist=0, head_tilt=0):
    twist = rot(fore_axis_r, 90)                # palma mirando hacia delante
    return base({"B_UpperArm_R": ry(78), "B_Forearm_R": ry(bend) @ twist,
                 "B_Hand_R": rot((0, 1, 0), wrist), "B_Head": ry(head_tilt) @ rx(-3),
                 "B_Chest": rz(-4)})
key_pose(1, base())
key_pose(20, wave(92, 0, -6))
for k, f in enumerate((28, 36, 44, 52, 60)):
    key_pose(f, wave(92 + (18 if k % 2 == 0 else -18), wrist=(10 if k % 2 == 0 else -10), head_tilt=-6))
key_pose(68, wave(92, 0, -6))
key_pose(72, wave(92, 0, -6), eyes=0.35)       # ojos "sonrientes"
key_pose(82, wave(92, 0, -6), eyes=0.35)
key_pose(86, wave(92, 0, -6), eyes=1.0)
key_pose(106, base())
finish_clip(act, 1, 106)

# ======================================================================== Stretch (estirarse)
act = new_clip("Stretch")
def stretch(lean, side=0):
    return {"B_Spine": rx(lean * 0.4) @ ry(side * 0.4), "B_Chest": rx(lean) @ ry(side),
            "B_Head": rx(lean * 1.2),
            "B_UpperArm_L": ry(-158), "B_UpperArm_R": ry(158),
            "B_Hand_L": rx(-10), "B_Hand_R": rx(-10)}
key_pose(1, base())
key_pose(30, stretch(-10), hips_up=0.01)
key_pose(48, stretch(-12, 7), hips_up=0.012, eyes=0.3)
key_pose(66, stretch(-12, -7), hips_up=0.012, eyes=0.3)
key_pose(78, stretch(-10), hips_up=0.01, eyes=1.0)
key_pose(104, base())
finish_clip(act, 1, 104)

# ======================================================================== Discover (descubre su cuerpo nuevo)
# Sube las dos manos a la vez y las gira coordinadamente (palma <-> dorso) mientras la cabeza mira
# primero una mano y luego la otra; cierra los dedos en cascada, se mira las piernas y prueba un pie.
# Animación por canales independientes (cabeza, cada brazo, cada dedo, pierna, ojos) con curvas
# suaves y desfases entre partes del cuerpo para que se vea natural; se muestrea cada 2 fotogramas.
act = new_clip("Discover")
FORE_AXIS = {s: rest_dir(f"B_Forearm_{s}") for s in ("L", "R")}


def fingers(side, amounts):
    """amounts: {dedo: 0..1} (1 = flexionado del todo). 'Thumb' también vale."""
    sg = 1 if side == "L" else -1        # la palma izquierda mira a -X, la derecha a +X
    rel = {}
    for f, amt in amounts.items():
        for k in (1, 2, 3):
            if f == "Thumb":
                b = f"B_Thumb_{k}_{side}"
                axis = rest_dir(b).cross(Vector((1, 0, 0)))
                rel[b] = rot(axis, -sg * 22 * amt)
            else:
                rel[f"B_Finger_{f}_{k}_{side}"] = ry(sg * (26 + 8 * k) * amt)
    return rel


def smoother(t):
    return t * t * t * (t * (t * 6 - 15) + 10)


class Track:
    """Canal animable: claves (fotograma, valores) con interpolación suave."""

    def __init__(self, **defaults):
        self.keys = [(1, dict(defaults))]

    def key(self, f, **vals):
        assert f >= self.keys[-1][0], "las claves de un canal deben ir en orden"
        v = dict(self.keys[-1][1])
        v.update(vals)
        self.keys.append((f, v))
        return self

    def at(self, f):
        ks = self.keys
        if f <= ks[0][0]:
            return ks[0][1]
        for (f0, v0), (f1, v1) in zip(ks, ks[1:]):
            if f0 <= f <= f1:
                t = smoother((f - f0) / (f1 - f0)) if f1 > f0 else 1.0
                return {k: v0[k] + (v1[k] - v0[k]) * t for k in v0}
        return ks[-1][1]


body = Track(yaw=0.0, pitch=0.0, chest=0.0)
arm = {s: Track(lift=0.0, twist=0.0, wrist=0.0, flex=0.0) for s in ("L", "R")}
fing = {(s, f): Track(a=0.0) for s in ("L", "R") for f in FINGER_NAMES + ("Thumb",)}
leg = Track(lift=0.0, ankle=0.0)
eyes = Track(e=1.0)


def cascade(side, start, target, stagger=3, dur=9):
    """Cierra/abre los dedos uno tras otro (índice -> meñique -> pulgar)."""
    for k, f in enumerate(FINGER_NAMES + ("Thumb",)):
        t0 = start + k * stagger
        fing[(side, f)].key(t0).key(t0 + dur, a=target)


def both_arms(f, lag=3, **vals):
    """Mueve los dos brazos a la vez; el izquierdo va unos fotogramas por detrás (más natural)."""
    arm["R"].key(f, **vals)
    arm["L"].key(f + lag, **vals)


# 1) se mira el cuerpo, parpadeo de sorpresa
body.key(16, pitch=28, chest=5).key(30, pitch=28, chest=5)
eyes.key(14, e=0.85).key(24, e=0.85).key(27, e=0.1).key(31, e=1.0)
# 2) suben las dos manos a la vez, palmas hacia la cara; la cabeza mira la mano derecha
arm["R"].key(28).key(56, lift=1.0, twist=90)
arm["L"].key(31).key(59, lift=1.0, twist=90)
body.key(46, yaw=-6, pitch=20, chest=2).key(62, yaw=-20, pitch=20, chest=2)
eyes.key(60, e=0.8)
# 3) giran las manos coordinadamente: dorso -> palma -> dorso -> palma (con la muñeca)
both_arms(76, twist=-70, wrist=12, flex=8)
both_arms(94, twist=90, wrist=-8, flex=0)
both_arms(112, twist=-70, wrist=12, flex=8)
both_arms(130, twist=90, wrist=-6, flex=0)
both_arms(142, twist=90, wrist=0, flex=0)
# dedos: cierran en cascada, se abren estirados y vuelven a reposo
cascade("R", 96, 1.0)
cascade("L", 99, 1.0)
cascade("R", 118, -0.2, stagger=2, dur=8)
cascade("L", 121, -0.2, stagger=2, dur=8)
cascade("R", 134, 0.0, stagger=1, dur=10)
cascade("L", 137, 0.0, stagger=1, dur=10)
# la cabeza sigue la mano derecha y luego pasa a la izquierda (con un parpadeo al cambiar)
body.key(84, yaw=-23, pitch=22, chest=2).key(100, yaw=-19, pitch=19, chest=2)
body.key(118, yaw=21, pitch=19, chest=2).key(138, yaw=23, pitch=22, chest=2)
eyes.key(104, e=0.8).key(107, e=0.12).key(111, e=0.8).key(140, e=0.8)
# 4) bajan los brazos y se mira las piernas; levanta el pie derecho y mueve el tobillo
arm["R"].key(150).key(178, lift=0.0, twist=0.0, wrist=0.0, flex=0.0)
arm["L"].key(154).key(182, lift=0.0, twist=0.0, wrist=0.0, flex=0.0)
body.key(152, yaw=12, pitch=14, chest=2).key(178, yaw=-4, pitch=32, chest=8)
eyes.key(178, e=0.85)
leg.key(180).key(198, lift=1.0).key(206, ankle=16).key(214, ankle=-14).key(222, ankle=12)
leg.key(230, ankle=0.0).key(248, lift=0.0)
# 5) se endereza satisfecho (ojos sonrientes) y vuelve a la pose base
body.key(248, yaw=-4, pitch=32, chest=8).key(268, yaw=0, pitch=-6, chest=-3)
body.key(292, yaw=0, pitch=-4, chest=-2).key(314, yaw=0, pitch=0, chest=0)
eyes.key(250, e=0.85).key(264, e=1.0).key(272, e=0.35).key(292, e=0.35).key(300, e=1.0)

END = 314
for f in list(range(1, END, 2)) + [END]:
    b = body.at(f)
    rel = base({"B_Chest": rx(b["chest"]) @ rz(b["yaw"] * 0.12),
                "B_Neck": rz(b["yaw"] * 0.28) @ rx(b["pitch"] * 0.35),
                "B_Head": rz(b["yaw"] * 0.60) @ rx(b["pitch"] * 0.65)})
    for side in ("L", "R"):
        sg = 1 if side == "L" else -1
        a = arm[side].at(f)
        L = a["lift"]
        rel[f"B_UpperArm_{side}"] = rz(-28 * sg * L) @ rx(-60 * L)
        rel[f"B_Forearm_{side}"] = rx(-8 - 87 * L + a["flex"]) @ rot(FORE_AXIS[side], -a["twist"] * sg)
        rel[f"B_Hand_{side}"] = rx(-4 + a["wrist"])
        rel.update(fingers(side, {fn: fing[(side, fn)].at(f)["a"] for fn in FINGER_NAMES + ("Thumb",)}))
    lg = leg.at(f)
    rel.update({"B_Thigh_R": rx(-30 * lg["lift"]), "B_Shin_R": rx(48 * lg["lift"]),
                "B_Foot_R": rx(-14 * lg["lift"] + lg["ankle"])})
    key_pose(f, rel, eyes=eyes.at(f)["e"])
finish_clip(act, 1, END)

# ======================================================================== Blink (solo ojos, para combinar)
act = new_clip("Blink")
for f, e in ((1, 1.0), (4, 0.06), (6, 0.06), (10, 1.0)):
    key_pose(f, eyes=e, only_eyes=True)
finish_clip(act, 1, 10)

# ======================================================================== intro de la web (Intro, Intro_Sweep)
exec(open(os.path.join(os.path.dirname(ru.__file__), "build_intro.py"), encoding="utf-8").read(), globals())

# ---------------------------------------------------------------- dejar el rig en reposo
for pb in rig.pose.bones:
    pb.rotation_quaternion = I
    pb.location = (0, 0, 0)
    pb.scale = (1, 1, 1)
sc.frame_start, sc.frame_end = 1, 314
print(f"Rig: {len(ORDER)} huesos, {count} piezas colgadas | clips:",
      [(a.name, tuple(int(x) for x in a.frame_range)) for a in bpy.data.actions if a.name in CLIPS])
