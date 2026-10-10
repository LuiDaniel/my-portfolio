"""Reconstruye el robot completo en orden y guarda robot.blend.

Ejecutar dentro de Blender:
    exec(open(r"C:\\Users\\danie\\portafolio\\blender\\build_all.py", encoding="utf-8").read())
"""
import bpy, os

PROJ = r"C:\Users\danie\portafolio\blender"
for script in ("build_head.py", "build_torso.py", "build_waist.py", "build_arms.py",
               "build_legs.py", "build_details.py", "build_rig.py"):
    print("==>", script)
    exec(open(os.path.join(PROJ, script), encoding="utf-8").read(), {"__name__": "__main__"})
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(PROJ, "robot.blend"))
