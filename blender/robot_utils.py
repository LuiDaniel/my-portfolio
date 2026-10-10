"""Utilidades compartidas por los scripts build_*.py del robot.

Uso dentro de Blender:
    import sys, importlib
    sys.path.insert(0, r"C:\\Users\\danie\\portafolio\\blender")
    import robot_utils as ru; importlib.reload(ru)
"""
import bpy, bmesh, math
from mathutils import Vector

PROJ = r"C:\Users\danie\portafolio\blender"


# ---------------------------------------------------------------- escena
def setup_scene():
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.scale_length = 1.0


def remove_objects(names):
    for n in names:
        o = bpy.data.objects.get(n)
        if o:
            bpy.data.objects.remove(o, do_unlink=True)
    for m in list(bpy.data.meshes):
        if m.users == 0:
            bpy.data.meshes.remove(m)


# ---------------------------------------------------------------- materiales
def bsdf(mat):
    mat.use_nodes = True
    return next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def make_mat(name, base, metallic, rough, emis=None, strength=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    b = bsdf(m)
    b.inputs["Base Color"].default_value = (*base, 1)
    b.inputs["Metallic"].default_value = metallic
    b.inputs["Roughness"].default_value = rough
    if emis:
        b.inputs["Emission Color"].default_value = (*emis, 1)
        b.inputs["Emission Strength"].default_value = strength
    m.diffuse_color = (*(emis or base), 1)
    return m


def base_materials():
    return {
        "body": make_mat("M_Body_BlackMatte", (0.007, 0.007, 0.008), 0.0, 0.50),
        "visor": make_mat("M_Visor_BlackMirror", (0.005, 0.005, 0.006), 0.9, 0.04),
        "joint": make_mat("M_Joint_DarkMetal", (0.025, 0.025, 0.027), 1.0, 0.30),
        "cable": make_mat("M_Cable_Rubber", (0.006, 0.006, 0.007), 0.0, 0.7),
        "neon": make_mat("M_Neon_Cyan", (0.0, 0.85, 1.0), 0.0, 0.3, emis=(0.0, 0.85, 1.0), strength=6.0),
        "plate": make_mat("M_Plate_BlackSatin", (0.010, 0.010, 0.011), 0.35, 0.28),
        "steel": make_mat("M_Steel_Polished", (0.16, 0.16, 0.17), 1.0, 0.20),
    }


# ---------------------------------------------------------------- cotas compartidas
# Brazo izquierdo: marco local con origen en el hombro, brazo a lo largo de -Z (ver build_arms.py).
ARM = dict(SH=(0.262, 0.012, 1.385), TILT_DEG=10.0,
           UA_TOP=0.062, UA_BOT=-0.250, ELBOW=-0.285, FA_TOP=-0.300, FA_BOT=-0.515,
           WRIST=-0.535, PALM_TOP=-0.548, PALM_BOT=-0.640)
# Pierna izquierda (ver build_legs.py), coordenadas de mundo.
LEG = dict(X=0.105, Y0=0.012, HIP=0.795, TH_TOP=0.815, TH_BOT=0.470, KNEE=0.445,
           SH_TOP=0.425, SH_BOT=0.105, ANKLE=0.075, FOOT_LEN=0.250, TOE_Y=0.012 - 0.175)


def arm_to_world():
    from mathutils import Matrix
    return (Matrix.Translation(ARM["SH"]) @
            Matrix.Rotation(-math.radians(ARM["TILT_DEG"]), 4, 'Y'))


# ---------------------------------------------------------------- objetos
def link(name, me, mat, smooth=None):
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.data.materials.append(mat)
    if smooth is not None:
        for p in me.polygons:
            p.use_smooth = smooth
    return ob


def parent_keep(ob, par):
    bpy.context.view_layer.update()
    ob.parent = par
    ob.matrix_parent_inverse = par.matrix_world.inverted()


def bevel(ob, width, segments=2):
    m = ob.modifiers.new("Bevel", 'BEVEL')
    m.width = width
    m.segments = segments
    return m


def raycaster(ob):
    """Devuelve cast(origen, dirección) -> (punto, normal) en coordenadas de mundo."""
    bpy.context.view_layer.update()
    ev = ob.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mw = ob.matrix_world
    mwi = mw.inverted()
    nmat = mw.to_3x3().inverted().transposed()

    def cast(origin, direction):
        ok, p, n, _ = ev.ray_cast(mwi @ origin, (mwi.to_3x3() @ direction).normalized())
        if not ok:
            raise RuntimeError(f"raycast falló contra {ob.name} desde {origin}")
        return mw @ p, (nmat @ n).normalized()
    return cast


def outward(me, axis_sign_y=-1):
    """Asegura que las normales apunten hacia -Y (hacia delante)."""
    if sum((p.normal for p in me.polygons), Vector()).y * axis_sign_y < 0:
        me.flip_normals()


def spow(v, e):
    return math.copysign(abs(v) ** e, v)


# ---------------------------------------------------------------- primitivas
def cylinder(name, r, depth, segs, mat, r2=None):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r,
                          radius2=r if r2 is None else r2, depth=depth)
    bm.to_mesh(me)
    bm.free()
    ob = link(name, me, mat)
    for p in me.polygons:   # laterales suaves, tapas planas
        p.use_smooth = len(p.vertices) == 4
    return ob


def torus(name, R, r, mat, seg=32, mseg=8):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    rings = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        ring = []
        for j in range(mseg):
            t = 2 * math.pi * j / mseg
            rr = R + r * math.cos(t)
            ring.append(bm.verts.new((rr * math.cos(a), rr * math.sin(a), r * math.sin(t))))
        rings.append(ring)
    for i in range(seg):
        for j in range(mseg):
            bm.faces.new((rings[i][j], rings[(i + 1) % seg][j],
                          rings[(i + 1) % seg][(j + 1) % mseg], rings[i][(j + 1) % mseg]))
    bm.to_mesh(me)
    bm.free()
    return link(name, me, mat, smooth=True)


def pod_mesh(name, length, prof, e_xy=0.8, e_top=0.5, e_bot=0.4, segs=(32, 18), shape=None):
    """Malla tipo cápsula/carcasa a lo largo de -Z (de Z=0 arriba a Z=-length abajo).

    prof(t) -> (rx, ry) con t en [0,1] (0 arriba, 1 abajo); e_xy redondez de la sección
    (1 = elipse, <1 = más cuadrada); e_top/e_bot redondez de los extremos (pequeño = más plano).
    shape(X, Y, Z, t) -> (X, Y, Z) permite deformaciones extra (cortes inclinados, etc.).
    """
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs[0], v_segments=segs[1], radius=1.0)
    for v in bm.verts:
        x, y, z = v.co
        st = math.hypot(x, y)
        phi = math.atan2(y, x)
        e1 = e_top if z > 0 else e_bot
        r = st ** e1
        zz = spow(z, e1)
        t = (1 - zz) / 2
        rx, ry = prof(t)
        X = spow(math.cos(phi), e_xy) * r * rx
        Y = spow(math.sin(phi), e_xy) * r * ry
        Z = -t * length
        if shape:
            X, Y, Z = shape(X, Y, Z, t)
        v.co = Vector((X, Y, Z))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    return me


def mirror_side(objs, suffix_from="_L", suffix_to="_R"):
    """Crea la copia espejada (X -> -X) de objetos *_L (sin rotación/escala) y replica su jerarquía."""
    from mathutils import Matrix
    bpy.context.view_layer.update()
    made = {}
    for ob in objs:
        name = ob.name.replace(suffix_from, suffix_to)
        old = bpy.data.objects.get(name)
        if old:
            bpy.data.objects.remove(old, do_unlink=True)
        me = ob.data.copy()
        me.name = name
        me.transform(Matrix.Scale(-1, 4, (1, 0, 0)))
        me.flip_normals()
        new = bpy.data.objects.new(name, me)
        bpy.context.scene.collection.objects.link(new)
        loc = ob.matrix_world.to_translation()
        new.location = (-loc.x, loc.y, loc.z)
        for k in ob.keys():
            new[k] = ob[k]
        for m in ob.modifiers:   # copiar modificadores (Solidify, Bevel...)
            nm = new.modifiers.new(m.name, m.type)
            for prop in m.bl_rna.properties:
                if not prop.is_readonly and prop.identifier not in ("name", "type"):
                    try:
                        setattr(nm, prop.identifier, getattr(m, prop.identifier))
                    except (AttributeError, TypeError):
                        pass
        made[ob.name] = new
    for ob in objs:
        par = ob.parent
        if par is None:
            continue
        target = made.get(par.name)
        if target is None and par.name.endswith(suffix_from):
            target = bpy.data.objects.get(par.name[:-len(suffix_from)] + suffix_to)
        parent_keep(made[ob.name], target or par)
    return list(made.values())


def merge(name, objs, mat, origin):
    """Une varios objetos en una sola malla (sin operadores) con origen en 'origin' (mundo)."""
    from mathutils import Matrix
    bpy.context.view_layer.update()
    bm = bmesh.new()
    for o in objs:
        tmp = o.data.copy()
        tmp.transform(Matrix.Translation(-Vector(origin)) @ o.matrix_world)
        bm.from_mesh(tmp)
        bpy.data.meshes.remove(tmp)
    for o in objs:
        bpy.data.objects.remove(o, do_unlink=True)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = link(name, me, mat)
    ob.location = origin
    return ob


def catmull(pts, samples=6):
    """Suaviza una polilínea (Catmull-Rom) para cables."""
    pts = [Vector(p) for p in pts]
    ext = [pts[0] * 2 - pts[1]] + pts + [pts[-1] * 2 - pts[-2]]
    out = []
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        for s in range(samples):
            t = s / samples
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                              + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(pts[-1])
    return out


def tube(name, pts, r, mat, segs=8, smooth_samples=6, caps=True, closed=False, up=None):
    """Tubo (cable, costura) a lo largo de una polilínea.

    closed=True cierra el lazo (sin suavizado ni tapas). up fija la orientación de la sección
    (útil en lazos alrededor de un eje); si no, se usan marcos de transporte paralelo.
    """
    if closed:
        path = [Vector(p) for p in pts]
    else:
        path = catmull(pts, smooth_samples) if smooth_samples > 1 else [Vector(p) for p in pts]
    n = len(path)
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    nrm = (path[1] - path[0]).normalized().orthogonal().normalized()
    rings = []
    for i, p in enumerate(path):
        if closed:
            t = (path[(i + 1) % n] - path[(i - 1) % n]).normalized()
        else:
            t = (path[min(i + 1, n - 1)] - path[max(i - 1, 0)]).normalized()
        ref = Vector(up) if up is not None else nrm
        nrm = (ref - t * ref.dot(t)).normalized()
        bin_ = t.cross(nrm)
        rings.append([bm.verts.new(p + (nrm * math.cos(a) + bin_ * math.sin(a)) * r)
                      for a in (2 * math.pi * k / segs for k in range(segs))])
    last = n if closed else n - 1
    for i in range(last):
        a_, b_ = rings[i], rings[(i + 1) % n]
        for k in range(segs):
            bm.faces.new((a_[k], a_[(k + 1) % segs], b_[(k + 1) % segs], b_[k]))
    if caps and not closed:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    return link(name, me, mat, smooth=True)


# ---------------------------------------------------------------- detalles de superficie
def patch(name, grid_fn, nu, nv, off, thick, mat):
    """Placa en relieve que sigue una superficie.

    grid_fn(u, v) -> (punto, normal) en mundo, con u, v en [0, 1]. La placa sobresale 'off'
    y tiene grosor 'thick' (Solidify hacia dentro).
    """
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    grid = []
    nsum = Vector()
    for j in range(nv + 1):
        row = []
        for i in range(nu + 1):
            p, n = grid_fn(i / nu, j / nv)
            nsum += n
            row.append(bm.verts.new(p + n * off))
        grid.append(row)
    for j in range(nv):
        for i in range(nu):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    bm.normal_update()
    if sum((f.normal for f in bm.faces), Vector()).dot(nsum) < 0:
        bmesh.ops.reverse_faces(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    ob = link(name, me, mat, smooth=True)
    s = ob.modifiers.new("Solidify", 'SOLIDIFY')
    s.thickness = thick
    s.offset = -1.0
    s.use_even_offset = True
    return ob


def bolts(name, pns, r, h, mat, segs=8):
    """Tornillos: cilindros cortos sobre cada (punto, normal)."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    from mathutils import Matrix
    for p, n in pns:
        n = Vector(n).normalized()
        q = Vector((0, 0, 1)).rotation_difference(n).to_matrix().to_4x4()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r * 0.75,
                              depth=h, matrix=Matrix.Translation(Vector(p) + n * h * 0.2) @ q)
    bm.to_mesh(me)
    bm.free()
    ob = link(name, me, mat)
    for p in me.polygons:
        p.use_smooth = len(p.vertices) == 4
    return ob


def ring_points(center, normal, radius, n, phase=0.0):
    """Puntos en círculo (para tornillos alrededor de una tapa)."""
    normal = Vector(normal).normalized()
    a = normal.orthogonal().normalized()
    b = normal.cross(a)
    return [Vector(center) + (a * math.cos(phase + 2 * math.pi * k / n) +
                              b * math.sin(phase + 2 * math.pi * k / n)) * radius for k in range(n)]


def piston(name, a, b, r_sleeve, r_rod, mat_sleeve, mat_rod, split=0.55, mount_axis=None):
    """Pistón hidráulico de a -> b: camisa (objeto name+'Sleeve') y vástago (name+'Rod')."""
    from mathutils import Matrix
    a, b = Vector(a), Vector(b)
    d = b - a
    L = d.length
    dn = d / L
    R4 = Vector((0, 0, 1)).rotation_difference(dn).to_matrix().to_4x4()
    ax = Vector(mount_axis).normalized() if mount_axis is not None else dn.orthogonal().normalized()
    RA = Vector((0, 0, 1)).rotation_difference(ax).to_matrix().to_4x4()

    def cyl(bm, center, r, depth, rot, segs=12):
        bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r,
                              depth=depth, matrix=Matrix.Translation(center) @ rot)

    ls = L * split
    bm = bmesh.new()
    cyl(bm, a + dn * ls / 2, r_sleeve, ls, R4)
    cyl(bm, a + dn * (ls - 0.004), r_sleeve * 1.22, 0.008, R4)          # collarín
    cyl(bm, a + dn * (ls * 0.35), r_sleeve * 1.12, 0.004, R4)           # anillo intermedio
    cyl(bm, a, r_sleeve * 0.95, r_sleeve * 2.8, RA, 10)                  # ojo de anclaje
    me = bpy.data.meshes.new(name + "Sleeve")
    bm.to_mesh(me)
    bm.free()
    sleeve = link(name + "Sleeve", me, mat_sleeve)

    s0 = a + dn * ls * 0.7
    lr = (b - s0).length
    bm = bmesh.new()
    cyl(bm, s0 + dn * lr / 2, r_rod, lr, R4, 10)
    cyl(bm, b, r_sleeve * 0.95, r_sleeve * 2.8, RA, 10)
    me = bpy.data.meshes.new(name + "Rod")
    bm.to_mesh(me)
    bm.free()
    rod = link(name + "Rod", me, mat_rod)
    # origen de cada parte en su punto de anclaje: en la web la camisa apunta al anclaje del
    # vástago y viceversa (así el pistón sigue a la articulación al doblarse)
    for o, anchor, kind in ((sleeve, a, "sleeve"), (rod, b, "rod")):
        o.data.transform(Matrix.Translation(-anchor))
        o.location = anchor
        o["piston"] = kind
        for p in o.data.polygons:
            p.use_smooth = len(p.vertices) == 4
    return sleeve, rod


def loop_on(name, cast, center, axis, n, off, r, mat, rad=0.4, segs=6):
    """Costura/anillo cerrado que abraza una carcasa alrededor de 'axis' (rayos hacia el centro)."""
    axis = Vector(axis).normalized()
    e1 = axis.orthogonal().normalized()
    e2 = axis.cross(e1)
    pts = []
    for k in range(n):
        a = 2 * math.pi * k / n
        d = e1 * math.cos(a) + e2 * math.sin(a)
        p, nrm = cast(Vector(center) + d * rad, -d)
        pts.append(p + nrm * off)
    return tube(name, pts, r, mat, segs=segs, closed=True, up=axis)


def line_on(name, cast, rays, off, r, mat, segs=6, smooth_samples=3):
    """Línea (costura, manguera) proyectada: rays = [(origen, dirección), ...]."""
    pts = []
    for o, d in rays:
        p, nrm = cast(Vector(o), Vector(d))
        pts.append(p + nrm * off)
    return tube(name, pts, r, mat, segs=segs, smooth_samples=smooth_samples)
