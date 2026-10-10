"""Construye la cabeza del robot (Head, Visor, Eye_L/R, Ear_L/R, EarRing_L/R, NeckSocket).

Ejecutar dentro de Blender (vía MCP o Text Editor):
    exec(open(r"C:\\Users\\danie\\portafolio\\blender\\build_head.py", encoding="utf-8").read())

Convenciones: unidades en metros, robot mirando a -Y (al exportar a glTF queda mirando a +Z),
lado izquierdo del robot = +X. Altura total prevista ~1.8 m.
"""
import bpy, bmesh, math, os, sys, importlib
from mathutils import Vector, Matrix

sys.path.insert(0, r"C:\Users\danie\portafolio\blender")
import robot_utils as ru
importlib.reload(ru)
from robot_utils import (PROJ, bsdf, link, parent_keep, raycaster, outward, spow,
                         cylinder, torus, bevel)

ru.setup_scene()
ru.remove_objects(("Eye_L", "Eye_R", "EarRing_L", "EarRing_R", "Ear_L", "Ear_R",
                   "NeckSocket", "Visor", "Head", "Cube"))

MATS = ru.base_materials()
MAT_BODY, MAT_VISOR, MAT_JOINT, MAT_NEON = MATS["body"], MATS["visor"], MATS["joint"], MATS["neon"]


# Ojos: cada LED lee un píxel de una textura COLS x ROWS (filtro Closest).
# En la web se puede sustituir por un CanvasTexture para dibujar expresiones.
COLS, ROWS = 10, 6
img = bpy.data.images.get("T_EyePattern")
if img is None or tuple(img.size) != (COLS, ROWS):
    img = bpy.data.images.new("T_EyePattern", COLS, ROWS, alpha=False)
OFF = {(0, 0), (1, 0), (8, 0), (9, 0), (0, 5), (1, 5), (8, 5), (9, 5),
       (0, 1), (9, 1), (0, 4), (9, 4)}
px = []
for r in range(ROWS):
    for c in range(COLS):
        px += [0.0, 0.025, 0.03, 1.0] if (c, r) in OFF else [0.0, 0.9, 1.0, 1.0]
img.pixels = px
os.makedirs(os.path.join(PROJ, "textures"), exist_ok=True)
img.filepath_raw = os.path.join(PROJ, "textures", "eye_pattern.png")
img.file_format = 'PNG'
img.save()

MAT_EYE = bpy.data.materials.get("M_Eye_LED") or bpy.data.materials.new("M_Eye_LED")
b = bsdf(MAT_EYE)
nt = MAT_EYE.node_tree
b.inputs["Base Color"].default_value = (0, 0, 0, 1)
b.inputs["Roughness"].default_value = 0.4
b.inputs["Emission Strength"].default_value = 6.0
tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None) or nt.nodes.new("ShaderNodeTexImage")
tex.image = img
tex.interpolation = 'Closest'
tex.location = (-400, 0)
nt.links.new(tex.outputs["Color"], b.inputs["Emission Color"])
MAT_EYE.diffuse_color = (0, 0.9, 1, 1)


# ---------------------------------------------------------------- casco
# Superelipsoide (inspirado en ref 5): cara frontal plana con esquinas redondeadas,
# lados casi paralelos, cúpula arriba, mentón estrecho en V y corona alargada hacia atrás.
C = Vector((0, 0, 1.66))          # centro de la cabeza
A = 0.084                         # semiancho
BF, BB = 0.100, 0.122             # fondo hacia delante / hacia atrás
H = 0.148                         # semialto
E1_TOP, E1_BOT = 0.80, 0.55       # exponente vertical (cúpula / parte baja más cuadrada)
E2_FRONT, E2_BACK = 0.62, 0.85    # exponente horizontal (cara curvada / nuca redonda)
BULGE = 0.012                     # volumen central de la cara (arista suave, no plana)
PIVOT = Vector((0, 0.015, 1.53))  # articulación del cuello = origen de Head


def taper(zz):  # estrechamiento en V hacia el mentón
    return 1.0 if zz > -0.1 else 1.0 - 0.50 * ((-0.1 - zz) / 0.9) ** 1.4


me = bpy.data.meshes.new("Head")
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=28, radius=1.0)
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
    if yy < 0:
        # la frente y el mentón retroceden -> cara curvada también de arriba abajo
        fz = 1 - 0.22 * max(0.0, -zz) ** 2 - 0.14 * max(0.0, zz) ** 2
        Y = yy * BF * fz
        # abultamiento central, máximo a la altura de los ojos y nulo en los bordes
        gx = max(0.0, 1 - (xx / 0.8) ** 2) ** 2
        gz = max(0.0, 1 - ((zz + 0.1) / 0.95) ** 2)
        Y -= BULGE * gx * gz * min(1.0, -yy * 3)
    else:
        Y = yy * (BB + 0.025 * max(0.0, zz)) * (1 - 0.30 * max(0.0, -zz) ** 2)  # corona atrás, nuca se cierra
    Z = zz * H
    Y += 0.07 * Z                                          # cara ligeramente inclinada hacia atrás
    v.co = Vector((X, Y, Z)) + C - PIVOT
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
bm.to_mesh(me)
bm.free()
for p in me.polygons:
    p.use_smooth = True
head = link("Head", me, MAT_BODY)
head.location = PIVOT

# ---------------------------------------------------------------- visor
hcast = raycaster(head)
NU, NV = 28, 24
ZBOT, ZTOP, W = C.z - 0.116, C.z + 0.074, 0.077
CHIN_R = 0.028    # cuánto suben los lados del borde inferior (mentón en U)
BROW = 0.010      # arco suave de la ceja


def halfw(z):  # sigue el estrechamiento del casco
    return W * taper((z - C.z) / H)


def visor_z(u, v):  # v: 0 = mentón, 1 = ceja; filas sin cruzarse
    zb = ZBOT + CHIN_R * u ** 2
    zt = ZTOP - BROW * u ** 2
    return zb + v * (zt - zb)


vm = bpy.data.meshes.new("Visor")
bm = bmesh.new()
grid = []
for j in range(NV + 1):
    v = j / NV
    row = []
    for i in range(NU + 1):
        u = -1 + 2 * i / NU
        z = visor_z(u, v)
        x = u * halfw(z)
        p, n = hcast(Vector((x, -1.0, z)), Vector((0, 1, 0)))
        row.append(bm.verts.new(p + n * 0.0012 - PIVOT))
    grid.append(row)
for j in range(NV):
    for i in range(NU):
        bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
bm.to_mesh(vm)
bm.free()
outward(vm)
for p in vm.polygons:
    p.use_smooth = True
visor = link("Visor", vm, MAT_VISOR)
visor.location = PIVOT
sol = visor.modifiers.new("Solidify", 'SOLIDIFY')
sol.thickness = 0.003
sol.offset = -1.0
sol.use_even_offset = True
parent_keep(visor, head)

# ---------------------------------------------------------------- ojos LED
vcast = raycaster(visor)
SP, DR, SEG = 0.0046, 0.00155, 8   # separación, radio de cada LED, lados del disco
EZ = C.z - 0.004
for side, ex in (("L", 0.034), ("R", -0.034)):
    center, cn = vcast(Vector((ex, -1.0, EZ)), Vector((0, 1, 0)))
    center = center + cn * 0.0008
    me = bpy.data.meshes.new("Eye_" + side)
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new("UVMap")
    for r in range(ROWS):
        for c in range(COLS):
            p, n = vcast(Vector((ex + (c - (COLS - 1) / 2) * SP, -1.0,
                                 EZ + (r - (ROWS - 1) / 2) * SP)), Vector((0, 1, 0)))
            p = p + n * 0.0008
            t = n.cross(Vector((0, 0, 1))).normalized()
            bt = t.cross(n).normalized()
            f = bm.faces.new([bm.verts.new(p - center + (t * math.cos(a) + bt * math.sin(a)) * DR)
                              for a in (2 * math.pi * k / SEG for k in range(SEG))])
            for lp in f.loops:
                lp[uvl].uv = ((c + 0.5) / COLS, (r + 0.5) / ROWS)
    bm.to_mesh(me)
    bm.free()
    outward(me)
    eye = link("Eye_" + side, me, MAT_EYE)
    eye.location = center   # origen en el centro del ojo -> escalar Z = parpadeo
    parent_keep(eye, head)

# ---------------------------------------------------------------- orejas
for side, sx in (("L", 1), ("R", -1)):
    p, n = hcast(Vector((sx * 1.0, 0.012, 1.655)), Vector((-sx, 0, 0)))
    rot = n.to_track_quat('Z', 'Y').to_euler()
    ear = cylinder("Ear_" + side, 0.030, 0.014, 32, MAT_JOINT)
    ear.location = p + n * 0.002
    ear.rotation_euler = rot
    bev = ear.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.003
    bev.segments = 2
    ring = torus("EarRing_" + side, 0.0225, 0.0016, MAT_NEON)
    ring.location = p + n * 0.0095
    ring.rotation_euler = rot
    parent_keep(ear, head)
    parent_keep(ring, head)

# ---------------------------------------------------------------- encastre del cuello
sock = cylinder("NeckSocket", 0.034, 0.03, 32, MAT_JOINT)
sock.location = PIVOT + Vector((0, 0, 0.004))
bev = sock.modifiers.new("Bevel", 'BEVEL')
bev.width = 0.004
bev.segments = 2
parent_keep(sock, head)

print("Cabeza construida:", [o.name for o in head.children])
