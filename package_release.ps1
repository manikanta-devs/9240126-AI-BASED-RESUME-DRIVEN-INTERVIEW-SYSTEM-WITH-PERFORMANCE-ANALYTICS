# Powershell wrapper for package_release.py
param(
    [string]$OutFile = "ai-interview-system-submission.zip"
)

$PythonPath = "python"
if (Test-Path ".venv\Scripts\python.exe") {
    $PythonPath = ".venv\Scripts\python.exe"
}

Write-Host "Running release packager using Python ($PythonPath)..."
& $PythonPath package_release.py

if ($OutFile -ne "ai-interview-system-submission.zip") {
    if (Test-Path "ai-interview-system-submission.zip") {
        Move-Item -Path "ai-interview-system-submission.zip" -Destination $OutFile -Force
        Write-Host "Moved archive to $OutFile"
    }
}
