"""Animaciones de la intro de la web. Se ejecuta al final de build_rig.py, con sus utilidades
(rig, key_pose, finger_rel...).

- Intro: el robot despierta (parpadea dos veces) y "atrapa en el aire" tres gemas invisibles que
  flotan un poco por encima y por delante de él, alternando manos: derecha -> iconos,
  izquierda -> título, derecha -> URL. Mira cada gema, la pellizca, la baja hasta su sitio
  (delante del pecho) y la suelta. El brazo libre nunca se queda quieto.
- Intro_Sweep: con el brazo izquierdo barre todo hacia su derecha (izquierda de la pantalla).

Los brazos se colocan con IK analítica (hombro-codo-muñeca) para que el punto de agarre B_Grip_*
pase exactamente por las posiciones de GRABS. Los canales (Curves) tienen claves independientes e
interpolación cúbica monótona: movimiento fluido, sin paradas en cada clave. Cada acción guarda en
la propiedad "events" un JSON {evento: segundo} (p. ej. grab_icons, release_icons) para la web.

Cam_Intro: cámara con el encuadre de la web (torso para arriba, teleobjetivo) para revisar.
"""
import json
from mathutils import Vector, Quaternion, Matrix

FPS = sc.render.fps
REST_HEAD = {n: arm_data.bones[n].head_local.copy() for n in ORDER}
HINGE0 = Vector((-1, 0, 0))     # eje de flexión del codo en reposo (flexión hacia delante)
EYES0 = (REST_HEAD["B_Eye_L"] + REST_HEAD["B_Eye_R"]) / 2
OUT = {"L": 1, "R": -1}         # dirección "hacia fuera" en X de cada brazo

# ---------------------------------------------------------------- cámara de la intro
CAM = dict(pos=(0.0, -2.30, 1.38), fov_y=25.0)
cam = OBJ.get("Cam_Intro")
if cam is None:
    cam = bpy.data.objects.new("Cam_Intro", bpy.data.cameras.new("Cam_Intro"))
    sc.collection.objects.link(cam)
cam.location = CAM["pos"]
cam.rotation_euler = (math.radians(90), 0, 0)
cam.data.sensor_fit = 'VERTICAL'
cam.data.angle_y = math.radians(CAM["fov_y"])

# gemas: dónde se atrapan (G, arriba, delante y hacia el costado, casi con el brazo estirado),
# punto de control de la curva al traerlas (C, hacia la cámara) y dónde se sueltan (R, delante
# del pecho)
GRABS = {
    "icons": dict(side="R", G=(-0.50, -0.40, 1.70), C=(-0.36, -0.62, 1.62), R=(0.0, -0.42, 1.47)),
    "title": dict(side="L", G=(0.58, -0.40, 1.64), C=(0.38, -0.62, 1.48), R=(0.0, -0.45, 1.29)),
    "url": dict(side="R", G=(-0.60, -0.38, 1.54), C=(-0.40, -0.64, 1.30), R=(0.0, -0.45, 1.11)),
}


# ---------------------------------------------------------------- cinemática
def fk(rel):
    """Rotación acumulada (mundo, desde reposo) y posición de la cabeza de cada hueso."""
    D, H = {}, {}
    for n in ORDER:
        p = PARENT[n]
        if p is None:
            D[n], H[n] = rel.get(n, I), REST_HEAD[n]
        else:
            D[n] = D[p] @ rel.get(n, I)
            H[n] = H[p] + D[p] @ (REST_HEAD[n] - REST_HEAD[p])
    return D, H


def frame_rot(u0, h0, u1, h1):
    """Rotación que lleva el par (u0, h0) a (u1, h1) (h se ortogonaliza respecto a u)."""
    def basis(u, h):
        u = u.normalized()
        h = (h - u * h.dot(u)).normalized()
        return Matrix((u, h, u.cross(h))).transposed()
    return (basis(u1, h1) @ basis(u0, h0).transposed()).to_quaternion()


def wrist_rel(side, flex=0.0, dev=0.0, roll=0.0):
    """Muñeca: flex (+ hacia la palma), dev (+ hacia el pulgar) y roll (giro sobre el eje de la mano)."""
    sg = 1 if side == "L" else -1
    return rot(rest_dir(f"B_Hand_{side}"), -roll * sg) @ ry(sg * flex) @ rx(-4 - dev)


def arm_ik(rel, side, target, pole, twist=0.0):
    """Coloca hombro+codo para que B_Grip_<side> llegue a target (con la muñeca que traiga rel).
    Devuelve las rel del brazo."""
    up, fo, ha, gr = (f"B_{b}_{side}" for b in ("UpperArm", "Forearm", "Hand", "Grip"))
    rel = dict(rel)
    D, H = fk(rel)
    S, Dc = H[up], D[PARENT[up]]
    a = (REST_HEAD[fo] - REST_HEAD[up]).length
    b = (REST_HEAD[ha] - REST_HEAD[fo]).length
    target = Vector(target)
    pole = Vector(pole).normalized()
    # primera estimación de la muñeca: el mismo desfase muñeca-agarre que en la pose actual
    wpt = target + (H[ha] - H[gr])
    sg = 1 if side == "L" else -1
    for _ in range(12):
        v = wpt - S
        d = min(max(v.length, abs(a - b) + 1e-3), a + b - 1e-4)
        dv = v.normalized()
        n = (pole - dv * pole.dot(dv)).normalized()
        cos_a = (a * a + d * d - b * b) / (2 * a * d)
        sin_a = math.sqrt(max(0.0, 1 - cos_a * cos_a))
        elbow = S + dv * a * cos_a + n * a * sin_a
        u = (elbow - S).normalized()
        f = (S + dv * d - elbow).normalized()
        h = n.cross(dv)
        Du = frame_rot(rest_dir(up), HINGE0, u, h)
        Df = Quaternion(f, math.radians(-twist * sg)) @ frame_rot(rest_dir(fo), HINGE0, f, h)
        rel[up] = Dc.inverted() @ Du
        rel[fo] = Du.inverted() @ Df
        _, H2 = fk(rel)
        wpt = wpt + (target - H2[gr])
    return {k: rel[k] for k in (up, fo, ha)}


def head_look(point, rel):
    """Reparte entre pecho, cuello y cabeza el giro necesario para mirar un punto."""
    d = Vector(point) - EYES0
    # no gira del todo: los ojos LED "terminan" de mirar (si no, la cara queda de perfil)
    yaw = max(-48, min(48, 0.75 * math.degrees(math.atan2(d.x, -d.y))))
    pitch = max(-30, min(30, -0.8 * math.degrees(math.atan2(d.z, math.hypot(d.x, d.y)))))
    rel["B_Neck"] = rz(yaw * 0.28) @ rx(pitch * 0.35)
    rel["B_Head"] = rz(yaw * 0.60) @ rx(pitch * 0.65)
    return yaw


def bezier(g, c, r, u):
    g, c, r = Vector(g), Vector(c), Vector(r)
    return g * (1 - u) ** 2 + c * 2 * u * (1 - u) + r * u * u


# ---------------------------------------------------------------- canales
def _mono(ks, f):
    """Interpolación cúbica monótona (Fritsch-Carlson) de una lista [(fotograma, valor)]."""
    if f <= ks[0][0]:
        return ks[0][1]
    if f >= ks[-1][0]:
        return ks[-1][1]
    fs = [k[0] for k in ks]
    vs = [k[1] for k in ks]
    m = [(vs[i + 1] - vs[i]) / (fs[i + 1] - fs[i]) for i in range(len(ks) - 1)]
    i = max(j for j in range(len(ks) - 1) if fs[j] <= f)

    def tangent(j):
        if j == 0 or j == len(ks) - 1 or m[j - 1] * m[j] <= 0:
            return 0.0
        h0, h1 = fs[j] - fs[j - 1], fs[j + 1] - fs[j]
        return 3 * (h0 + h1) / ((2 * h1 + h0) / m[j - 1] + (h1 + 2 * h0) / m[j])

    h = fs[i + 1] - fs[i]
    t = (f - fs[i]) / h
    t2, t3 = t * t, t * t * t
    return ((2 * t3 - 3 * t2 + 1) * vs[i] + (t3 - 2 * t2 + t) * h * tangent(i)
            + (-2 * t3 + 3 * t2) * vs[i + 1] + (t3 - t2) * h * tangent(i + 1))


class Curves:
    """Canales animables con claves independientes por canal e interpolación cúbica monótona:
    la velocidad es continua al pasar por las claves intermedias (sin tirones ni paradas) y nunca
    se pasa de los valores clave. Al principio y al final de cada canal la velocidad es 0."""

    def __init__(self, **defaults):
        self.k = {c: [(1, float(v))] for c, v in defaults.items()}

    def key(self, f, **vals):
        for c, v in vals.items():
            ks = self.k[c]
            assert f >= ks[-1][0], f"canal {c}: clave en {f} antes de {ks[-1][0]}"
            if f == ks[-1][0]:
                ks[-1] = (f, float(v))
            else:
                ks.append((f, float(v)))
        return self

    def hold(self, f, *names):
        """Mantiene hasta f el valor actual de los canales (todos si no se indican)."""
        for c in names or tuple(self.k):
            self.key(f, **{c: self.k[c][-1][1]})
        return self

    def at(self, f):
        return {c: _mono(ks, f) for c, ks in self.k.items()}


def arm_curves():
    # w: 0 = brazo libre, 1 = IK hacia el objetivo | u: avance al jalar (0 = G, 1 = R)
    # pinch: pinza | spread: dedos abiertos | twist: giro del antebrazo | flex/dev/roll: muñeca
    # lift/fwd/elbow/curl: movimiento del brazo libre
    return Curves(w=0.0, u=0.0, pinch=0.0, spread=0.0, twist=0.0, flex=0.0, dev=0.0, roll=0.0,
                  px=0.5, py=0.3, pz=-1.0, lift=0.0, fwd=0.0, elbow=0.0, curl=0.12)


def sample(name, end, body, look, eyes, arm, target, events):
    """Muestrea los canales fotograma a fotograma y crea la acción."""
    act = new_clip(name)
    for f in range(1, end + 1):
        bd = body.at(f)
        rel = base()
        lk = look.at(f)
        yaw = head_look((lk["x"], lk["y"], lk["z"]), rel)
        rel["B_Spine"] = rz(bd["yaw"] * 0.4)
        rel["B_Chest"] = rx(bd["lean"]) @ ry(bd["roll"]) @ rz(yaw * 0.12 + bd["yaw"] * 0.6)
        for side in ("L", "R"):
            a = arm[side].at(f)
            sg = 1 if side == "L" else -1
            rel[f"B_UpperArm_{side}"] = ry(-sg * a["lift"]) @ rx(-a["fwd"])
            rel[f"B_Forearm_{side}"] = rx(-8 - a["elbow"])
            rel[f"B_Hand_{side}"] = wrist_rel(side, a["flex"], a["dev"], a["roll"])
            rel.update(finger_rel(side, a["curl"], a["pinch"], a["spread"]))
            w = a["w"]
            if w > 1e-3:
                # La mano viaja como un brazo humano: gira desde el hombro (dirección interpolada
                # en esfera) mientras la distancia hombro-mano cambia poco a poco, así el codo se
                # dobla de forma gradual. Con w -> 0 la IK reproduce la pose libre (mismo codo, sin
                # giro del antebrazo), así que entrar y salir de la IK no produce saltos.
                _, H = fk(rel)
                S = H[f"B_UpperArm_{side}"]
                dv = (H[f"B_Hand_{side}"] - S).normalized()
                e = H[f"B_Forearm_{side}"] - S
                free_pole = (e - dv * e.dot(dv)).normalized()
                ws = w * w * (3 - 2 * w)
                want = Vector((a["px"] * OUT[side], a["py"], a["pz"])).normalized()
                pole = free_pole.lerp(want, ws)
                d0 = H[f"B_Grip_{side}"] - S
                d1 = Vector(target(side, f, a)) - S
                q = d0.normalized().rotation_difference(d1.normalized())
                q = Quaternion().slerp(q, w)
                tgt = S + (q @ d0.normalized()) * (d0.length + (d1.length - d0.length) * w)
                rel.update(arm_ik(rel, side, tgt, pole, a["twist"] * ws))
        key_pose(f, rel, eyes=eyes.at(f)["e"], hips_up=bd["hips"])
    act["events"] = json.dumps({k: round((v - 1) / FPS, 3) for k, v in sorted(events.items(), key=lambda x: x[1])})
    finish_clip(act, 1, end)
    return act


# ======================================================================== Intro
PINCH_TWIST = -105.0             # giro del antebrazo al agarrar: la pinza se ve de perfil
REACH_POLE = (0.5, -0.15, -1.0)   # codo abajo, afuera y un poco adelante (alcanzar arriba al costado)
PLACE_POLE = (0.6, 0.3, -1.0)    # codo abajo al dejarla delante del pecho

body = Curves(yaw=0.0, lean=6.0, roll=0.0, hips=-0.004)
look = Curves(x=0.0, y=-2.3, z=1.15)      # empieza con la cabeza un poco baja (despertando)
eyes = Curves(e=1.0)
arm = {s: arm_curves() for s in ("L", "R")}
events = {}

# despertar: levanta la cabeza y parpadea dos veces
body.key(18, lean=0.0, hips=0.0)
look.key(16, x=0.0, y=-2.3, z=1.42)
eyes.key(4, e=1.0).key(7, e=0.08).key(10, e=1.0).key(14, e=1.0).key(17, e=0.08).key(20, e=1.0)
events["wake_blink"] = 6


def grab(name, f0):
    """Un agarre completo (~86 f): alcanza con la mano abierta (26 f), pellizca la gema al llegar,
    la baja por una curva hacia la cámara hasta su sitio (28 f), la suelta y el brazo vuelve."""
    g = GRABS[name]
    tr = arm[g["side"]]
    o = OUT[g["side"]]
    g["start"] = f0
    tr.key(f0, w=0.0, u=0.0, twist=0.0, spread=0.0, flex=0.0)
    # el brazo libre deja de balancearse mientras se estira
    tr.key(f0 + 12, lift=0.0, fwd=0.0, elbow=0.0)
    # alcanzar: la mano se abre, la muñeca se echa un poco atrás y el antebrazo gira
    tr.key(f0 + 14, curl=0.0)
    tr.key(f0 + 18, spread=0.7, flex=-16.0)
    tr.key(f0 + 26, w=1.0, twist=PINCH_TWIST, px=REACH_POLE[0], py=REACH_POLE[1], pz=REACH_POLE[2], dev=0.0)
    # pellizca al llegar (los dedos empiezan a cerrarse justo antes) y la muñeca acompaña
    tr.key(f0 + 22, pinch=0.0)
    tr.key(f0 + 30, u=0.0, roll=0.0)
    tr.key(f0 + 32, pinch=1.0, spread=0.0, flex=6.0)
    tr.key(f0 + 34, dev=-4.0)
    # la baja hasta su sitio girando un poco la muñeca, como quien lleva algo delicado
    tr.key(f0 + 44, roll=10.0)
    tr.key(f0 + 54, pinch=1.0, flex=4.0)
    tr.key(f0 + 58, u=1.0, px=PLACE_POLE[0], py=PLACE_POLE[1], pz=PLACE_POLE[2], spread=0.0)
    # la suelta: abre los dedos con la muñeca hacia atrás y el brazo vuelve a reposo
    tr.key(f0 + 60, w=1.0, twist=PINCH_TWIST, roll=0.0, dev=0.0)
    tr.key(f0 + 64, pinch=0.0, flex=-10.0)
    tr.key(f0 + 66, spread=0.5)
    tr.key(f0 + 80, flex=0.0)
    tr.key(f0 + 82, spread=0.0, curl=0.12)
    tr.key(f0 + 86, w=0.0, u=1.0, twist=0.0)
    # el torso acompaña: se inclina hacia la gema y vuelve al soltarla
    body.key(f0 + 26, yaw=-5.0 * o, roll=-4.0 * o).key(f0 + 58, yaw=0.0, roll=0.0)
    # la cabeza mira la gema antes de que llegue la mano y la acompaña mientras la baja
    for f, p in ((f0 + 12, g["G"]), (f0 + 30, g["G"]), (f0 + 54, g["R"])):
        look.key(f, x=p[0], y=p[1], z=p[2])
    events[f"grab_{name}"] = f0 + 30
    events[f"release_{name}"] = f0 + 62


# brazo libre (izquierdo, antes de su agarre): contrapeso, codo, muñeca y dedos en movimiento suave
arm["L"].key(34, lift=6.0, fwd=-5.0, elbow=16.0, curl=0.3, flex=10.0, roll=-8.0)
arm["L"].key(54, lift=2.0, fwd=3.0, elbow=8.0, curl=0.2, flex=-6.0, roll=4.0)
grab("icons", 18)
grab("title", 62)
grab("url", 106)
arm["L"].key(164, lift=5.0, fwd=6.0, elbow=14.0, curl=0.28, flex=8.0, roll=-6.0)
arm["L"].key(198, lift=0.0, fwd=0.0, elbow=0.0, curl=0.12, flex=0.0, roll=0.0)
arm["R"].key(200, lift=0.0, fwd=0.0, elbow=0.0, curl=0.12)
look.key(178, x=0.0, y=-2.3, z=1.42)   # termina mirando a cámara

# satisfecho: ojos "sonrientes"
eyes.key(178, e=1.0).key(184, e=0.4).key(196, e=0.4).key(204, e=1.0)
events["done"] = 204


def intro_target(side, f, a):
    gs = [g for g in GRABS.values() if g["side"] == side and g["start"] <= f]
    g = max(gs, key=lambda x: x["start"]) if gs else next(g for g in GRABS.values() if g["side"] == side)
    return bezier(g["G"], g["C"], g["R"], a["u"])


sample("Intro", 204, body, look, eyes, arm, intro_target, events)

# ======================================================================== Intro_Sweep (barrido)
body = Curves(yaw=0.0, lean=0.0, roll=0.0, hips=0.0)
look = Curves(x=0.0, y=-2.3, z=1.42)
eyes = Curves(e=1.0)
arm = {s: arm_curves() for s in ("L", "R")}
sweep = Curves(x=0.40, y=-0.40, z=1.36)
events = {}

# toma impulso hacia su izquierda y barre con el brazo izquierdo de un solo trazo: mano vertical,
# palma hacia la izquierda de la pantalla y codo doblado (como quien limpia una pizarra); la
# muñeca va echada hacia atrás al tomar impulso y acompaña el trazo al final
L_ = arm["L"]
L_.key(18, w=1.0, spread=0.5, curl=0.0, px=0.6, py=0.2, pz=-1.0, twist=-70.0, flex=-26.0)
sweep.hold(18).key(32, x=-0.24, y=-0.48, z=1.28)
L_.key(32, flex=18.0, roll=8.0)
L_.key(36, w=1.0, spread=0.5, twist=-70.0)
L_.key(62, w=0.0, spread=0.0, curl=0.12, twist=0.0, flex=0.0, roll=0.0)
body.key(18, yaw=12.0, roll=3.0).key(32, yaw=-14.0, roll=-4.0).key(38, yaw=-14.0, roll=-4.0)
body.key(62, yaw=0.0, roll=0.0)
look.key(18, x=0.15, y=-0.45, z=1.35).key(32, x=-0.8, y=-0.6, z=1.3).key(40, x=-0.8, y=-0.6, z=1.3)
look.key(62, x=0.0, y=-2.3, z=1.42)
# el brazo derecho se aparta y hace de contrapeso
arm["R"].key(18, lift=4.0, fwd=6.0, elbow=20.0, curl=0.3, flex=8.0)
arm["R"].key(32, lift=8.0, fwd=-8.0, elbow=12.0, flex=-10.0, roll=6.0)
arm["R"].key(62, lift=0.0, fwd=0.0, elbow=0.0, curl=0.12, flex=0.0, roll=0.0)
eyes.key(28, e=1.0).key(34, e=0.6).key(42, e=0.45).key(54, e=0.45).key(64, e=1.0)
events.update(sweep_start=18, sweep=25, sweep_end=32, done=64)

sample("Intro_Sweep", 64, body, look, eyes, arm,
       lambda side, f, a: Vector(tuple(sweep.at(f)[k] for k in ("x", "y", "z"))), events)
