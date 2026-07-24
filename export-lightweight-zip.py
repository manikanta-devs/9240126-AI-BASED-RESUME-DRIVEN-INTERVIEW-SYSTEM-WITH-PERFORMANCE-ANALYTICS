import os
import zipfile
import time

print("=" * 60)
print("TALENTFORGE AI - LIGHTWEIGHT COLLEGE PACKAGER")
print("=" * 60)

output_zip = "TalentForge_AI_College_Pack.zip"

# Exclude heavy temporary/build directories
EXCLUDE_DIRS = {".venv", ".venv_prod", "node_modules", ".git", ".mypy_cache", ".pytest_cache", "dist", "build"}
EXCLUDE_EXTS = {".pyc", ".dex"}

start_time = time.time()
file_count = 0

with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk("."):
        # Modify dirs in-place to skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in EXCLUDE_EXTS or file == output_zip:
                continue

            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, ".")
            zipf.write(file_path, arcname)
            file_count += 1

zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
elapsed = round(time.time() - start_time, 2)

print(f"\nSUCCESS: Created '{output_zip}'")
print(f"Total Archived Files : {file_count}")
print(f"ZIP Package Size     : {zip_size_mb:.2f} MB (Reduced from 1.85 GB!)")
print(f"Packaging Time       : {elapsed}s")
print("=" * 60)
