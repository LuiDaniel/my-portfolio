"""Construye la cintura y la pelvis (Pelvis, Waist, WaistRib_*, WaistRing, WaistCable_*, WaistVein_*).

Ejecutar dentro de Blender (después de build_torso.py):
    exec(open(r"C:\\Users\\danie\\portafolio\\blender\\build_waist.py", encoding="utf-8").read())
"""
import bpy, bmesh, math, sys, importlib
from mathutils import Vector, Matrix

sys.path.insert(0, r"C:\Users\danie\portafolio\blender")
import robot_utils as ru
importlib.reload(ru)
from robot_utils import link, parent_keep, raycaster, spow, cylinder, torus, tube, bevel

ru.setup_scene()
ru.remove_objects([o.name for o in bpy.data.objects
                   if o.name.startswith(("Pelvis", "Waist"))])
MATS = ru.base_materials()

torso = bpy.data.objects["Torso"]
tcast = raycaster(torso)
AXIS_Y = 0.012
torso_bottom, _ = tcast(Vector((0, AXIS_Y, 0.5)), Vector((0, 0, 1)))

# ---------------------------------------------------------------- pelvis
C = Vector((0, AXIS_Y, 0.855))
A, BF, BB, H = 0.128, 0.078, 0.082, 0.062
me = bpy.data.meshes.new("Pelvis")
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=1.0)
for v in bm.verts:
    x, y, z = v.co
    st, ct = math.hypot(x, y), z
    phi = math.atan2(y, x)
    e1 = 0.55 if ct > 0 else 0.70
    r = abs(st) ** e1
    zz = spow(ct, e1)
    xx = spow(math.cos(phi), 0.55) * r
    yy = spow(math.sin(phi), 0.60) * r
    w = 1.0 - 0.18 * max(0.0, -zz) ** 1.5 - 0.10 * max(0.0, zz) ** 2   # más estrecha abajo y arriba
    v.co = Vector((xx * A * w, yy * (BF if yy < 0 else BB), zz * H)) + C
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
bm.to_mesh(me)
bm.free()
me.transform(Matrix.Translation(-C))
pelvis = link("Pelvis", me, MATS["body"], smooth=True)
pelvis.location = C
pcast = raycaster(pelvis)
pelvis_top, _ = pcast(Vector((0, AXIS_Y, 2.0)), Vector((0, 0, -1)))

# ---------------------------------------------------------------- columna
z0, z1 = pelvis_top.z - 0.01, torso_bottom.z + 0.03
col = cylinder("Waist", 0.030, z1 - z0, 24, MATS["joint"])
col.location = (0, AXIS_Y, (z0 + z1) / 2)
parent_keep(col, pelvis)

# vértebras (discos con bisel)
gap_lo, gap_hi = pelvis_top.z, torso_bottom.z
for k in range(3):
    f = (k + 1) / 4
    disc = cylinder(f"WaistRib_{k}", 0.040, 0.010, 32, MATS["joint"])
    disc.location = (0, AXIS_Y, gap_lo + (gap_hi - gap_lo) * f)
    bevel(disc, 0.003)
    parent_keep(disc, pelvis)

# anillo de neón sobre la pelvis
ring = torus("WaistRing", 0.050, 0.0045, MATS["neon"], seg=40, mseg=8)
ring.location = (0, AXIS_Y, pelvis_top.z + 0.003)
parent_keep(ring, pelvis)

# cables: salen de la pelvis, se abomban hacia fuera y entran en el torso
def waist_cable(name, ang_deg, r, mat, rad=0.058, bulge=0.016):
    a = math.radians(ang_deg)
    d = Vector((math.cos(a), math.sin(a), 0))
    c = Vector((0, AXIS_Y, 0))
    lo = c + d * rad + Vector((0, 0, pelvis_top.z - 0.012))
    hi = c + d * (rad - 0.010) + Vector((0, 0, torso_bottom.z + 0.015))
    mid = (lo + hi) / 2 + d * bulge
    pts = [lo, lo.lerp(mid, 0.6) + Vector((0, 0, 0.004)), mid, hi.lerp(mid, 0.6), hi]
    ob = tube(name, pts, r, mat, segs=8, smooth_samples=6)
    parent_keep(ob, pelvis)

for k, ang in enumerate((215, 250, 290, 325, 35, 90, 145)):
    waist_cable(f"WaistCable_{k}", ang, 0.0065, MATS["cable"])
for k, ang in enumerate((232, 308, 120)):
    waist_cable(f"WaistVein_{k}", ang, 0.003, MATS["neon"], rad=0.052, bulge=0.010)

print("Cintura/pelvis:", round(pelvis_top.z, 3), "->", round(torso_bottom.z, 3),
      "| hijos:", len(pelvis.children))
