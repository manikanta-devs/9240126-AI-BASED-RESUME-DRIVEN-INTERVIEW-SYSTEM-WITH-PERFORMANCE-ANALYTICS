import os
import shutil

def deep_clean():
    print("============================================================")
    print("TALENTFORGE AI - DEEP LIGHTWEIGHT OPTIMIZATION")
    print("============================================================")

    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    clean_targets = [
        '.pytest_cache',
        'backend/__pycache__',
        'backend/ai/__pycache__',
        'backend/routes/__pycache__',
        'backend/services/__pycache__',
        'frontend/node_modules/.cache',
    ]

    for rel_path in clean_targets:
        full_path = os.path.join(root_dir, rel_path)
        if os.path.exists(full_path):
            try:
                if os.path.isdir(full_path):
                    shutil.rmtree(full_path)
                else:
                    os.remove(full_path)
                print(f"  [OK] Cleaned cache: {rel_path}")
            except Exception as e:
                print(f"  [!] Skipping {rel_path}: {e}")

    for dirpath, dirnames, filenames in os.walk(root_dir):
        if 'node_modules' in dirpath or '.venv' in dirpath:
            continue
        for f in filenames:
            if f.endswith('.pyc') or f.endswith('.pyo') or f.startswith('tmp_'):
                file_p = os.path.join(dirpath, f)
                try:
                    os.remove(file_p)
                except Exception:
                    pass

    print("============================================================")
    print("SUCCESS: Project cleaned & optimized! Zero features lost.")
    print("============================================================")

if __name__ == '__main__':
    deep_clean()
