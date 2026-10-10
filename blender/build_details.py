"""Pasada de detalle sobre todo el robot: placas, costuras, tornillos, pistones hidráulicos,
mangueras, rejillas y tapas de articulación.

Ejecutar dentro de Blender al final (después de build_legs.py):
    exec(open(r"C:\\Users\\danie\\portafolio\\blender\\build_details.py", encoding="utf-8").read())

Todos los objetos creados llevan la propiedad "detail" = True y cuelgan de la pieza que acompañan,
así que se borran y regeneran limpiamente al volver a ejecutar el script.
"""
import bpy, bmesh, math, sys, importlib
from mathutils import Vector, Matrix

sys.path.insert(0, r"C:\Users\danie\portafolio\blender")
import robot_utils as ru
importlib.reload(ru)
from robot_utils import (raycaster, parent_keep, cylinder, torus, tube, patch, bolts, ring_points,
                         piston, loop_on, line_on, pod_mesh, link)

ru.setup_scene()
ru.remove_objects([o.name for o in bpy.data.objects if o.get("detail")])
M = ru.base_materials()
OBJ = bpy.data.objects


def D(ob, parent):
    ob["detail"] = True
    parent_keep(ob, parent)
    return ob


def disc(name, p, n, r, h, mat, segs=28):
    """Cilindro corto apoyado sobre (p, n)."""
    ob = cylinder(name, r, h, segs, mat)
    q = Vector((0, 0, 1)).rotation_difference(Vector(n))
    ob.data.transform(q.to_matrix().to_4x4())
    ob.location = Vector(p) + Vector(n) * (h / 2)
    return ob


def ring_on(name, p, n, R, r, mat):
    ob = torus(name, R, r, mat, seg=36, mseg=8)
    q = Vector((0, 0, 1)).rotation_difference(Vector(n))
    ob.data.transform(q.to_matrix().to_4x4())
    ob.location = p
    return ob


def joint_cap(base, side, p, n, r, parent, n_bolts=6, neon=True):
    """Tapa de articulación: disco + buje de acero + tornillos + (aro de neón)."""
    n = Vector(n).normalized()
    out = [D(disc(f"{base}_{side}", p, n, r, 0.010, M["joint"]), parent)]
    face = Vector(p) + n * 0.010
    out.append(D(disc(f"{base}Hub_{side}", face, n, r * 0.30, 0.006, M["steel"], 20), parent))
    pts = ring_points(face, n, r * 0.55, n_bolts, phase=0.3)
    out.append(D(bolts(f"{base}Bolts_{side}", [(q, n) for q in pts], r * 0.085, 0.004, M["steel"]), parent))
    if neon:
        out.append(D(ring_on(f"{base}Ring_{side}", face + n * 0.0005, n, r * 0.80, 0.0028, M["neon"]), parent))
    return out


def pin(name, center, axis, r, length, mat):
    """Pasador de bisagra que atraviesa la articulación."""
    ob = cylinder(name, r, length, 20, mat)
    q = Vector((0, 0, 1)).rotation_difference(Vector(axis))
    ob.data.transform(q.to_matrix().to_4x4())
    ob.location = center
    return ob


# ======================================================================== CABEZA
head = OBJ["Head"]
visor = OBJ["Visor"]
hcast = raycaster(head)
HC = Vector((0, 0, 1.66))

# marco del visor: tubo de metal oscuro siguiendo su borde
bm = bmesh.new()
bm.from_mesh(visor.data)
bm.edges.ensure_lookup_table()
bnd = [e for e in bm.edges if e.is_boundary]
adj = {}
for e in bnd:
    a, b = e.verts
    adj.setdefault(a.index, []).append(b.index)
    adj.setdefault(b.index, []).append(a.index)
start = bnd[0].verts[0].index
loop, prev, cur = [start], None, start
while True:
    nxt = [v for v in adj[cur] if v != prev][0]
    if nxt == start:
        break
    loop.append(nxt)
    prev, cur = cur, nxt
mw = visor.matrix_world
bm.verts.ensure_lookup_table()
rim_pts = []
for i in loop[::2]:
    v = bm.verts[i]
    rim_pts.append(mw @ (v.co + v.normal * 0.0015))
bm.free()
D(tube("VisorRim", rim_pts, 0.0024, M["joint"], segs=6, closed=True), head)

# costuras de la corona (centro y dos laterales), de la frente a la nuca
for name, dx in (("CrownSeam", 0.0), ("CrownSeamSide_L", 0.042), ("CrownSeamSide_R", -0.042)):
    rays = []
    for k in range(14):
        a = math.radians(-8 + k * 11)          # desde arriba de la frente hacia la nuca
        d = Vector((0, math.sin(a), math.cos(a)))
        rays.append((HC + Vector((dx, 0, 0)) + d * 0.5, -d))
    D(line_on(name, hcast, rays, 0.0006, 0.0017, M["joint"], smooth_samples=3), head)

# rejilla trasera
for k in range(4):
    z = 1.615 + k * 0.016
    rays = [(Vector((x, 1.0, z)), Vector((0, -1, 0))) for x in (-0.03, -0.01, 0.01, 0.03)]
    D(line_on(f"HeadVent_{k}", hcast, rays, 0.0015, 0.0024, M["joint"], smooth_samples=3), head)

# tornillos y buje en las orejas
for side in ("L", "R"):
    ear = OBJ["Ear_" + side]
    n = (ear.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized()
    face = ear.matrix_world.to_translation() + n * 0.007
    D(disc("EarHub_" + side, face, n, 0.009, 0.005, M["steel"], 20), head)
    D(bolts("EarBolts_" + side, [(q, n) for q in ring_points(face, n, 0.016, 5)], 0.0022, 0.003, M["steel"]), head)


# ======================================================================== TORSO
torso = OBJ["Torso"]
tcast = raycaster(torso)
FRONT, BACK = Vector((0, 1, 0)), Vector((0, -1, 0))


def front(x, z):
    return tcast(Vector((x, -1.0, z)), FRONT)


def back(x, z):
    return tcast(Vector((x, 1.0, z)), BACK)


def side_hit(sx, y, z):
    return tcast(Vector((sx * 1.0, y, z)), Vector((-sx, 0, 0)))


def half_width(z):
    return side_hit(1, 0.012, z)[0].x


# placas pectorales (siguen la línea curva del pecho)
for side, s in (("L", 1), ("R", -1)):
    def pec(u, v, s=s):
        x = 0.030 + u * 0.120
        zt = 1.286 + 0.075 * (x / 0.165) ** 2
        zb = 1.198 + 0.035 * (x / 0.150) ** 3
        return front(s * x, zb + v * (zt - zb))
    D(patch("ChestPlate_" + side, pec, 12, 6, 0.003, 0.006, M["plate"]), torso)

# núcleo del pecho: disco + aro de neón (puede latir en la web)
p, n = front(0, 1.245)
D(disc("ChestCore", p, n, 0.022, 0.010, M["joint"]), torso)
D(ring_on("ChestCoreRing", p + n * 0.0105, n, 0.0155, 0.0026, M["neon"]), torso)
D(disc("ChestCoreLens", p + n * 0.009, n, 0.009, 0.004, M["visor"], 20), torso)

# costura del esternón (del collarín a la línea del pecho)
D(line_on("SternumSeam", tcast, [(Vector((0, -1, z)), FRONT) for z in (1.415, 1.385, 1.355, 1.325, 1.305)],
          0.0006, 0.0018, M["joint"]), torso)

# placas abdominales segmentadas
for k in range(3):
    z0 = 1.165 - k * 0.042
    hw = half_width(z0 + 0.015) * 0.58

    def ab(u, v, z0=z0, hw=hw):
        x = (-1 + 2 * u) * hw
        return front(x, z0 + v * 0.030 + 0.010 * (x / hw) ** 2)
    D(patch(f"AbPlate_{k}", ab, 14, 3, 0.003, 0.006, M["plate"]), torso)

# yugo: tornillos entre la línea del pecho y los hombros
yoke = []
for x, z in ((0.05, 1.372), (0.115, 1.384)):
    for s in (1, -1):
        p, n = front(s * x, z)
        yoke.append((p, n))
D(bolts("YokeBolts", yoke, 0.0040, 0.004, M["steel"]), torso)

# rejillas laterales
for side, s in (("L", 1), ("R", -1)):
    def vent_bg(u, v, s=s):
        return side_hit(s, -0.045 + u * 0.09, 1.155 + v * 0.11)
    D(patch("SideVentPanel_" + side, vent_bg, 6, 6, 0.0008, 0.002, M["joint"]), torso)
    for k in range(5):
        z = 1.170 + k * 0.020
        rays = [(Vector((s * 1.0, y, z)), Vector((-s, 0, 0))) for y in (-0.036, -0.012, 0.012, 0.036)]
        D(line_on(f"SideVent_{k}_{side}", tcast, rays, 0.0032, 0.0028, M["plate"]), torso)

# espalda: placa de columna con costillas y venas de neón a los lados
D(patch("SpinePlate", lambda u, v: back(-0.028 + u * 0.056, 1.04 + v * 0.36), 4, 16, 0.004, 0.008, M["plate"]), torso)
for k in range(6):
    z = 1.075 + k * 0.055
    D(line_on(f"SpineRib_{k}", tcast, [(Vector((x, 1.0, z)), BACK) for x in (-0.022, 0.0, 0.022)],
              0.0068, 0.0026, M["joint"]), torso)
for side, x in (("L", 0.037), ("R", -0.037)):
    D(line_on("SpineVein_" + side, tcast, [(Vector((x, 1.0, z)), BACK) for z in (1.06, 1.15, 1.25, 1.33, 1.39)],
              0.0014, 0.0022, M["neon"]), torso)

# omóplatos
blade_bolts = []
for side, s in (("L", 1), ("R", -1)):
    D(patch("ShoulderBlade_" + side, lambda u, v, s=s: back(s * (0.055 + u * 0.105), 1.250 + v * 0.115),
            10, 6, 0.003, 0.006, M["plate"]), torso)
    for x, z in ((0.066, 1.262), (0.148, 1.262), (0.066, 1.352), (0.148, 1.352)):
        p, n = back(s * x, z)
        blade_bolts.append((p + n * 0.003, n))
D(bolts("ShoulderBladeBolts", blade_bolts, 0.0035, 0.004, M["steel"]), torso)

# costura inferior del torso
D(loop_on("TorsoBottomSeam", tcast, Vector((0, 0.012, 1.050)), (0, 0, 1), 48, 0.0006, 0.0020, M["joint"]), torso)


# ======================================================================== PELVIS
pelvis = OBJ["Pelvis"]
pcast = raycaster(pelvis)
D(patch("PelvisPlate", lambda u, v: pcast(Vector((-0.055 + u * 0.11, -1.0, 0.828 + v * 0.055)), FRONT),
        10, 5, 0.003, 0.006, M["plate"]), pelvis)
pb = []
for x in (-0.045, 0.045):
    for z in (0.836, 0.875):
        p, n = pcast(Vector((x, -1.0, z)), FRONT)
        pb.append((p + n * 0.003, n))
D(bolts("PelvisBolts", pb, 0.0035, 0.004, M["steel"]), pelvis)
D(loop_on("PelvisSeam", pcast, Vector((0, 0.012, 0.893)), (0, 0, 1), 48, 0.0006, 0.0020, M["joint"]), pelvis)


# ======================================================================== BRAZO IZQUIERDO
A = ru.ARM
TW = ru.arm_to_world()
R3 = TW.to_3x3()
upper, forearm, hand = OBJ["UpperArm_L"], OBJ["Forearm_L"], OBJ["Hand_L"]
ucast, fcast = raycaster(upper), raycaster(forearm)
ARM_AXIS = (R3 @ Vector((0, 0, 1))).normalized()
left_details = []


def W(p):
    return TW @ Vector(p)


def Wd(d):
    return (R3 @ Vector(d)).normalized()


def L(ob, parent):
    left_details.append(ob)
    return D(ob, parent)


# tapa exterior del hombro (con neón): sustituye al aro que quedaba en el hueco
p, n = ucast(W((0.3, 0, -0.005)), Wd((-1, 0, 0)))
for o in joint_cap("ShoulderCap", "L", p + n * 0.002, n, 0.040, upper, n_bolts=6):
    left_details.append(o)

# costuras de carcasa
L(loop_on("UpperArmSeam_L", ucast, W((0, 0, -0.200)), ARM_AXIS, 40, 0.0005, 0.0018, M["joint"]), upper)
for k, z in enumerate((-0.338, -0.492, -0.503)):
    L(loop_on(f"ForearmSeam_{k}_L", fcast, W((0, 0, z)), ARM_AXIS, 40, 0.0005, 0.0018, M["joint"]), forearm)

# tapas del codo (bisagra) a ambos lados + protector trasero
for side_x, nm in ((1, "Out"), (-1, "In")):
    n = Wd((side_x, 0, 0))
    for o in joint_cap(f"ElbowCap{nm}", "L", W((side_x * 0.060, 0, A["ELBOW"])), n, 0.030, forearm,
                       n_bolts=5, neon=(nm == "Out")):
        left_details.append(o)
L(pin("ElbowPin_L", W((0, 0, A["ELBOW"])), Wd((1, 0, 0)), 0.014, 0.122, M["steel"]), forearm)
guard = pod_mesh("ElbowGuard_L", 0.060, lambda t: (0.027 - 0.004 * t, 0.009), e_xy=0.6, e_top=0.5, e_bot=0.5,
                 segs=(20, 12))
guard.transform(TW @ Matrix.Translation((0, 0.034, A["ELBOW"] + 0.030)))
L(link("ElbowGuard_L", guard, M["plate"]), forearm)

# pistón hidráulico delantero (bíceps): camisa en el brazo, vástago en el antebrazo
a, b = W((0, -0.061, -0.100)), W((0, -0.060, -0.360))
sl, rd = piston("ElbowPiston_L", a, b, 0.0090, 0.0042, M["joint"], M["steel"], split=0.58,
                mount_axis=Wd((1, 0, 0)))
L(sl, upper)
L(rd, forearm)
for nm, eye, cast, par in (("ElbowPistonMountA_L", a, ucast, upper), ("ElbowPistonMountB_L", b, fcast, forearm)):
    hit, _ = cast(eye, Wd((0, 1, 0)))
    L(tube(nm, [eye, hit + Wd((0, 1, 0)) * 0.003], 0.0050, M["joint"], segs=8, smooth_samples=1), par)

# manguera + vena de neón por detrás del brazo, cruzando el codo hasta el antebrazo
hose_rays = [(W((0.012, 0.3, z)), Wd((0, -1, 0))) for z in (0.010, -0.060, -0.130, -0.200)]
pts = []
for o, d in hose_rays:
    p, n = ucast(o, d)
    pts.append(p + n * 0.007)
pts += [W((0.014, 0.058, -0.262)), W((0.012, 0.056, -0.300)), W((0.010, 0.058, -0.335))]
L(tube("ArmHose_L", pts, 0.0058, M["cable"], segs=8, smooth_samples=6), upper)
vpts = []
for z in (0.000, -0.070, -0.140, -0.210):
    p, n = ucast(W((-0.010, 0.3, z)), Wd((0, -1, 0)))
    vpts.append(p + n * 0.0035)
L(tube("ArmVein_L", vpts, 0.0024, M["neon"], segs=6, smooth_samples=6), upper)

# placa delantera del antebrazo + tornillos
def fa_plate(u, v):
    return fcast(W((-0.022 + u * 0.044, -0.3, -0.380 - v * 0.095)), Wd((0, 1, 0)))
L(patch("ForearmPlate_L", fa_plate, 6, 8, 0.003, 0.006, M["plate"]), forearm)
fb = []
for x in (-0.016, 0.016):
    for z in (-0.388, -0.467):
        p, n = fcast(W((x, -0.3, z)), Wd((0, 1, 0)))
        fb.append((p + n * 0.003, n))
L(bolts("ForearmBolts_L", fb, 0.0030, 0.004, M["steel"]), forearm)

# muñeca: anillos de acero estriados
for k, dz in enumerate((-0.009, 0.0, 0.009)):
    rr = ring_on(f"WristRib_{k}_L", W((0, 0, A["WRIST"] + dz)), ARM_AXIS, 0.0238, 0.0022, M["steel"])
    L(rr, forearm)

# tornillos en la placa del dorso de la mano
plate = OBJ["HandPlate_L"]
pc = raycaster(plate)
hb = []
for y in (-0.020, 0.020):
    for z in (A["PALM_TOP"] - 0.022, A["PALM_TOP"] - 0.062):
        p, n = pc(W((0.3, y, z)), Wd((-1, 0, 0)))
        hb.append((p, n))
L(bolts("HandBolts_L", hb, 0.0026, 0.004, M["steel"]), hand)


# ======================================================================== PIERNA IZQUIERDA
G = ru.LEG
X, Y0 = G["X"], G["Y0"]
thigh, shin, foot = OBJ["Thigh_L"], OBJ["Shin_L"], OBJ["Foot_L"]
thc, shc, ftc = raycaster(thigh), raycaster(shin), raycaster(foot)
UP = Vector((0, 0, 1))

# tapa de cadera por fuera del muslo
p, n = thc(Vector((1.0, Y0, 0.772)), Vector((-1, 0, 0)))
for o in joint_cap("HipCap", "L", p + n * 0.002, n, 0.046, thigh, n_bolts=6):
    left_details.append(o)

# placa frontal del muslo + tornillos
L(patch("ThighPlate_L", lambda u, v: thc(Vector((X - 0.046 + u * 0.092, -1.0, 0.530 + v * 0.200)), FRONT),
        8, 10, 0.003, 0.007, M["plate"]), thigh)
tb = []
for x in (X - 0.034, X + 0.034):
    for z in (0.545, 0.715):
        p, n = thc(Vector((x, -1.0, z)), FRONT)
        tb.append((p + n * 0.003, n))
L(bolts("ThighBolts_L", tb, 0.0034, 0.004, M["steel"]), thigh)
L(loop_on("ThighSeam_L", thc, Vector((X, Y0, 0.502)), UP, 40, 0.0005, 0.0019, M["joint"]), thigh)

# manguera exterior del muslo + vena de neón
pts = []
for z in (0.745, 0.680, 0.610, 0.540):
    p, n = thc(Vector((1.0, Y0 + 0.022, z)), Vector((-1, 0, 0)))
    pts.append(p + n * 0.008)
pts.append(Vector((X + 0.062, Y0 + 0.030, 0.470)))
L(tube("LegHose_L", pts, 0.0062, M["cable"], segs=8, smooth_samples=6), thigh)
vp = []
for z in (0.742, 0.660, 0.580, 0.515):
    p, n = thc(Vector((1.0, Y0 - 0.004, z)), Vector((-1, 0, 0)))
    vp.append(p + n * 0.0035)
L(tube("LegVein_L", vp, 0.0025, M["neon"], segs=6, smooth_samples=6), thigh)

# tapas de rodilla (bisagra) a ambos lados
for sx, nm in ((1, "Out"), (-1, "In")):
    for o in joint_cap(f"KneeCap{nm}", "L", Vector((X + sx * 0.062, Y0, G["KNEE"])), Vector((sx, 0, 0)), 0.036,
                       shin, n_bolts=5, neon=(nm == "Out")):
        left_details.append(o)
L(pin("KneePin_L", Vector((X, Y0, G["KNEE"])), (1, 0, 0), 0.016, 0.126, M["steel"]), shin)

# pistón trasero de la rodilla (muslo -> gemelo)
a, b = Vector((X, Y0 + 0.086, 0.630)), Vector((X, Y0 + 0.086, 0.355))
sl, rd = piston("KneePiston_L", a, b, 0.0105, 0.0050, M["joint"], M["steel"], split=0.58, mount_axis=(1, 0, 0))
L(sl, thigh)
L(rd, shin)
for nm, eye, cast, par in (("KneePistonMountA_L", a, thc, thigh), ("KneePistonMountB_L", b, shc, shin)):
    hit, _ = cast(eye, Vector((0, -1, 0)))
    L(tube(nm, [eye, hit + Vector((0, -0.003, 0))], 0.0058, M["joint"], segs=8, smooth_samples=1), par)

# espinillera + tornillos + costura
L(patch("ShinGuard_L", lambda u, v: shc(Vector((X - 0.032 + u * 0.064, -1.0, 0.170 + v * 0.220)), FRONT),
        6, 12, 0.004, 0.008, M["plate"]), shin)
sb = []
for x in (X - 0.022, X + 0.022):
    p, n = shc(Vector((x, -1.0, 0.372)), FRONT)
    sb.append((p + n * 0.004, n))
L(bolts("ShinBolts_L", sb, 0.0032, 0.004, M["steel"]), shin)
L(loop_on("ShinSeam_L", shc, Vector((X, Y0, 0.140)), UP, 40, 0.0005, 0.0019, M["joint"]), shin)

# rejilla exterior del gemelo
for k in range(4):
    z = 0.250 + k * 0.022
    rays = [(Vector((1.0, y, z)), Vector((-1, 0, 0))) for y in (Y0 - 0.010, Y0 + 0.012, Y0 + 0.034)]
    L(line_on(f"CalfVent_{k}_L", shc, rays, 0.0015, 0.0026, M["joint"]), shin)

# tapas del tobillo
for sx, nm in ((1, "Out"), (-1, "In")):
    for o in joint_cap(f"AnkleCap{nm}", "L", Vector((X + sx * 0.037, Y0, G["ANKLE"])), Vector((sx, 0, 0)), 0.029,
                       foot, n_bolts=4, neon=False):
        left_details.append(o)

# pistón del tendón de Aquiles (gemelo -> talón)
a, b = Vector((X, Y0 + 0.068, 0.250)), Vector((X, Y0 + 0.082, 0.088))
sl, rd = piston("AnklePiston_L", a, b, 0.0080, 0.0040, M["joint"], M["steel"], split=0.55, mount_axis=(1, 0, 0))
L(sl, shin)
L(rd, foot)

# pie: suela de metal (contorno del pie aplanado), costura de la puntera y línea de neón superior
sole_me = foot.data.copy()
sole_me.name = "FootSole_L"
fl = foot.matrix_world.to_translation()
cx, cy = X - fl.x, (G["TOE_Y"] + G["FOOT_LEN"] / 2) - fl.y
for v in sole_me.vertices:
    co = v.co
    wz = co.z + fl.z
    co.x = cx + (co.x - cx) * 1.035
    co.y = cy + (co.y - cy) * 1.025
    co.z = min(wz, 0.013) - fl.z
sole = link("FootSole_L", sole_me, M["joint"])
sole.location = fl
L(sole, foot)
L(loop_on("ToeSeam_L", ftc, Vector((X, G["TOE_Y"] + 0.078, 0.032)), (0, 1, 0), 40, 0.0005, 0.0019,
          M["joint"]), foot)
L(line_on("FootVein_L", ftc, [(Vector((X, y, 1.0)), Vector((0, 0, -1)))
                              for y in (G["TOE_Y"] + 0.030, G["TOE_Y"] + 0.070, G["TOE_Y"] + 0.120)],
          0.0016, 0.0022, M["neon"]), foot)


# ======================================================================== LADO DERECHO
ru.mirror_side(left_details)

n_det = len([o for o in bpy.data.objects if o.get("detail")])
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
print(f"Detalles: {n_det} objetos | triángulos aprox. de todo el robot (sin modificadores): {tris}")
