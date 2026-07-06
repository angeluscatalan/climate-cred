import traceback, sys

with open("/tmp/import_result.txt", "w") as f:
    try:
        import ml_core
        f.write("ml_core OK\n")
    except Exception as e:
        f.write(traceback.format_exc())
        f.write(f"\nPython: {sys.executable}\n")
        f.write(f"Path: {sys.path}\n")
