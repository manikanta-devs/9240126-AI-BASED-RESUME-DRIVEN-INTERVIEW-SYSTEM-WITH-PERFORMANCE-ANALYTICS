# Powershell wrapper for package_release.py
param(
    [string]$OutFile = "ai-interview-system-submission.zip"
)

# Determine the directory of this script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$WorkspaceRoot = Split-Path -Parent $ScriptDir

# Resolve Python Path
$PythonPath = "python"
if (Test-Path "$WorkspaceRoot\.venv\Scripts\python.exe") {
    $PythonPath = "$WorkspaceRoot\.venv\Scripts\python.exe"
}

Write-Host "Running release packager using Python ($PythonPath)..."
& $PythonPath "$ScriptDir\package_release.py"

# If the output file is not the default, move it from the workspace root to the requested destination
if ($OutFile -ne "ai-interview-system-submission.zip") {
    if (Test-Path "$WorkspaceRoot\ai-interview-system-submission.zip") {
        Move-Item -Path "$WorkspaceRoot\ai-interview-system-submission.zip" -Destination $OutFile -Force
        Write-Host "Moved archive to $OutFile"
    }
}
