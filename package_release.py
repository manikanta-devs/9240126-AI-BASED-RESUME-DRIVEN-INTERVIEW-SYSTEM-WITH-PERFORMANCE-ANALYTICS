"""Script to package the project for release, excluding unnecessary files."""

import os
import zipfile
import fnmatch


def should_exclude(path):
    """Determine if a file or directory path should be excluded from the release zip."""
    # List of directory names to completely ignore
    exclude_dirs = {
        ".git",
        ".venv",
        "venv",
        ".venv_prod",
        "node_modules",
        ".pytest_cache",
        ".mypy_cache",
        "__pycache__",
        ".vscode",
        "uploads",  # Exclude user uploads
    }

    # Split path and check if any parent directory is in the exclude list
    parts = os.path.normpath(path).split(os.sep)
    for part in parts:
        if part in exclude_dirs:
            return True

    # Check file patterns to ignore
    exclude_file_patterns = [
        "*.env",
        "*.env.local",
        "*.zip",
        "*.bak",
        ".gitignore",
        ".flake8",
        "pytest.ini",
    ]

    filename = os.path.basename(path)
    for pattern in exclude_file_patterns:
        if fnmatch.fnmatch(filename, pattern):
            return True

    return False


def build_zip(zip_filename):
    """Walk through the project and build the zip archive with proper exclusions."""
    print(f"Creating archive: {zip_filename}")
    file_count = 0

    # If the zip already exists, delete it first
    if os.path.exists(zip_filename):
        os.remove(zip_filename)

    with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("."):
            # Modify dirs in-place to prevent os.walk from recursing into excluded directories
            dirs[:] = [
                d
                for d in dirs
                if not should_exclude(os.path.normpath(os.path.join(root, d)))
            ]

            for file in files:
                file_path = os.path.normpath(os.path.join(root, file))
                # Normalize path relative to the root directory
                rel_path = os.path.relpath(file_path, ".")

                if rel_path == zip_filename:
                    continue

                if should_exclude(rel_path):
                    continue

                zipf.write(file_path, rel_path)
                file_count += 1

    size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
    print(
        f"Archive completed successfully: {zip_filename} ({size_mb:.2f} MB, {file_count} files)"
    )


if __name__ == "__main__":
    # We name the file to match the user's existing submission zip name
    build_zip("ai-interview-system-submission.zip")
