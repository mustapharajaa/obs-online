# Myrtille Automated Installation Script
# This script downloads and installs the latest version of Myrtille silently.

# 1. Define the download URL and the path to save the installer
$myrtilleVersion = "2.9.1" # You can update this version number as new releases come out
$downloadUrl = "https://github.com/cedrozor/myrtille/releases/download/$($myrtilleVersion)/Myrtille_$($myrtilleVersion).msi"
$installerPath = "$env:TEMP\Myrtille.msi"

# 2. Download the installer
Write-Host "Downloading Myrtille from $downloadUrl..."
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -ErrorAction Stop
    Write-Host "Download complete."
} catch {
    Write-Error "Failed to download Myrtille. Please check the URL and your internet connection."
    exit 1
}

# 3. Run the silent installation
Write-Host "Starting silent installation of Myrtille..."
# The /qn flag ensures a quiet, non-interactive installation.
Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /qn" -Wait

# 4. Clean up the installer file
Remove-Item $installerPath -Force

Write-Host "✅ Myrtille installation is complete. You can access it at http://localhost/myrtille"
