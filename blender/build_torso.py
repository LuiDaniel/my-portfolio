"""Construye el torso y el cuello (Torso, ChestLine, Neck, NeckRib_*, NeckRing, NeckCable_*, NeckVein_*).

Ejecutar dentro de Blender:
    exec(open(r"C:\\Users\\danie\\portafolio\\blender\\build_torso.py", encoding="utf-8").read())

Mismas convenciones que build_head.py (metros, robot mirando a -Y, izquierda = +X).
"""
import bpy, bmesh, math, sys, importlib
from mathutils import Vector

sys.path.insert(0, r"C:\Users\danie\portafolio\blender")
import robot_utils as ru
importlib.reload(ru)
from robot_utils import link, parent_keep, raycaster, spow, cylinder, torus, tube, bevel

ru.setup_scene()
ru.remove_objects([o.name for o in bpy.data.objects
                   if o.name.startswith(("Torso", "ChestLine", "Neck", "NeckRib", "NeckRing",
                                         "NeckCable", "NeckVein"))
                   and o.name != "NeckSocket"])
MATS = ru.base_materials()

NECK_TOP = Vector((0, 0.015, 1.53))   # = pivote de Head (build_head.py)

# ---------------------------------------------------------------- torso (escudo)
# Superelipsoide deformado: arriba ancho y cuadrado (hombros), abajo estrecho (cintura).
C = Vector((0, 0.012, 1.215))
A = 0.200                          # semiancho máximo (hombros)
BF, BB = 0.105, 0.095              # fondo delante / detrás
H = 0.215                          # semialto -> z de 1.00 a 1.43
E1_TOP, E1_BOT = 0.30, 0.55        # arriba cuadrado (hombros), abajo truncado
E2_FRONT, E2_BACK = 0.52, 0.55
CHEST = 0.014                      # volumen del pecho


def taper(zz):  # estrecha hacia la cintura
    return 1.0 if zz > 0.05 else 1.0 - 0.60 * ((0.05 - zz) / 1.05) ** 1.25


me = bpy.data.meshes.new("Torso")
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=32, radius=1.0)
for v in bm.verts:
    x, y, z = v.co
    st, ct = math.hypot(x, y), z
    phi = math.atan2(y, x)
    cp, sp = math.cos(phi), math.sin(phi)
    e1 = E1_TOP if ct > 0 else E1_BOT
    e2 = E2_FRONT if sp < 0 else E2_BACK
    r = abs(st) ** e1
    zz = spow(ct, e1)
    xx = spow(cp, e2) * r
    yy = spow(sp, e2) * r
    X = xx * A * taper(zz)
    thin_bottom = 1 - 0.42 * max(0.0, -zz) ** 1.6       # más delgado hacia la cintura
    thin_top = 1 - 0.30 * max(0.0, zz) ** 4              # hombros más finos arriba
    if yy < 0:
        Y = yy * BF * thin_bottom * thin_top
        gx = max(0.0, 1 - (xx / 0.85) ** 2) ** 2
        gz = max(0.0, 1 - ((zz - 0.35) / 0.70) ** 2)
        Y -= CHEST * gx * gz * min(1.0, -yy * 3)
    else:
        Y = yy * BB * thin_bottom * thin_top
    Z = zz * H - 0.035 * max(0.0, zz) ** 3 * xx ** 2      # hombros caídos (trapecio)
    v.co = Vector((X, Y, Z)) + C
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
bm.to_mesh(me)
bm.free()
torso = link("Torso", me, MATS["body"], smooth=True)
# origen en la cintura (donde girará la columna)
pivot = Vector((0, 0.012, 1.02))
me.transform(__import__("mathutils").Matrix.Translation(-pivot))
torso.location = pivot

tcast = raycaster(torso)

# ---------------------------------------------------------------- línea curva del pecho
# Arco en U de hombro a hombro que baja en el centro del pecho (relieve fino de metal oscuro).
pts = []
N = 24
for i in range(N + 1):
    u = -1 + 2 * i / N
    x = u * 0.165
    z = 1.300 + 0.075 * u ** 2
    try:
        p, n = tcast(Vector((x, -1.0, z)), Vector((0, 1, 0)))
    except RuntimeError:
        continue
    pts.append(p + n * 0.0012)
chest = tube("ChestLine", pts, 0.0022, MATS["joint"], segs=6, smooth_samples=3)
parent_keep(chest, torso)

# ---------------------------------------------------------------- cuello
top_hit, _ = tcast(Vector((0, NECK_TOP.y, 2.0)), Vector((0, 0, -1)))
NECK_BASE = Vector((0, NECK_TOP.y, top_hit.z - 0.02))
neck_len = NECK_TOP.z - NECK_BASE.z
neck = cylinder("Neck", 0.025, neck_len, 24, MATS["joint"])
neck.location = (NECK_BASE + NECK_TOP) / 2
parent_keep(neck, torso)

# costillas mecánicas en el cuello
for k, f in enumerate((0.40, 0.55, 0.70)):
    rib = torus(f"NeckRib_{k}", 0.0265, 0.0028, MATS["joint"], seg=24, mseg=6)
    rib.location = NECK_BASE.lerp(NECK_TOP, f)
    parent_keep(rib, torso)

# anillo de neón donde el cuello sale del torso
ring_hit, _ = tcast(Vector((0.036, NECK_TOP.y, 2.0)), Vector((0, 0, -1)))
ring = torus("NeckRing", 0.036, 0.0042, MATS["neon"], seg=40, mseg=8)
ring.location = (0, NECK_TOP.y, ring_hit.z + 0.002)
parent_keep(ring, torso)
collar = cylinder("NeckCollar", 0.034, 0.016, 32, MATS["joint"])
collar.location = (0, NECK_TOP.y, ring_hit.z + 0.004)
bevel(collar, 0.003)
parent_keep(collar, torso)

# cables: salen del torso, se acercan al cuello y entran bajo la cabeza
def neck_cable(name, ang_deg, r, mat, r_out=0.058, r_mid=0.030, r_top=0.030):
    a = math.radians(ang_deg)
    d = Vector((math.cos(a), math.sin(a), 0))
    base, _ = tcast(Vector((0, NECK_TOP.y, 2.0)) + d * r_out, Vector((0, 0, -1)))
    start = base - Vector((0, 0, 0.012))
    z0, z1 = start.z, NECK_TOP.z - 0.005
    c = Vector((0, NECK_TOP.y, 0))
    pts = [start,
           c + d * (r_out - 0.004) + Vector((0, 0, z0 + 0.022)),
           c + d * (r_mid + 0.012) + Vector((0, 0, z0 + 0.045)),
           c + d * r_mid + Vector((0, 0, (z0 + z1) / 2 + 0.02)),
           c + d * r_top + Vector((0, 0, z1))]
    ob = tube(name, pts, r, mat, segs=8, smooth_samples=6)
    parent_keep(ob, torso)
    return ob

# -Y es el frente: ángulos medidos desde +X; 270° = delante, 90° = detrás
for k, ang in enumerate((235, 305, 145, 35)):
    neck_cable(f"NeckCable_{k}", ang, 0.0055, MATS["cable"])
for k, ang in enumerate((262, 278)):
    neck_cable(f"NeckVein_{k}", ang, 0.0026, MATS["neon"], r_out=0.050, r_mid=0.026, r_top=0.027)

print("Torso construido:", sorted(o.name for o in torso.children),
      "dims", tuple(round(d, 3) for d in torso.dimensions))
