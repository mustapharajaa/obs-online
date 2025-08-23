# Manual OpenSSL installation for Windows
Write-Host "Downloading and installing OpenSSL manually..." -ForegroundColor Green

# Download OpenSSL installer (current available version)
$url = "https://slproweb.com/download/Win64OpenSSL-3_4_1.exe"
$installer = "$env:TEMP\Win64OpenSSL-3_4_1.exe"

Write-Host "Downloading OpenSSL installer..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
    Write-Host "Download complete" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Install OpenSSL silently
Write-Host "Installing OpenSSL..." -ForegroundColor Yellow
try {
    Start-Process -FilePath $installer -ArgumentList "/VERYSILENT", "/SUPPRESSMSGBOXES", "/NORESTART" -Wait
    Write-Host "OpenSSL installation complete" -ForegroundColor Green
} catch {
    Write-Host "Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Add OpenSSL to PATH
$opensslPath = "C:\Program Files\OpenSSL-Win64\bin"
if (Test-Path $opensslPath) {
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
    if ($currentPath -notlike "*$opensslPath*") {
        [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$opensslPath", "Machine")
        Write-Host "Added OpenSSL to system PATH" -ForegroundColor Green
    }
    
    # Update current session PATH
    $env:PATH += ";$opensslPath"
    Write-Host "Updated current session PATH" -ForegroundColor Green
} else {
    Write-Host "OpenSSL installation directory not found" -ForegroundColor Yellow
}

# Test OpenSSL
Write-Host "Testing OpenSSL installation..." -ForegroundColor Yellow
try {
    & openssl version
    Write-Host "OpenSSL is working correctly" -ForegroundColor Green
} catch {
    Write-Host "OpenSSL test failed" -ForegroundColor Red
    exit 1
}

# Clean up installer
Remove-Item $installer -Force
Write-Host "Cleaned up installer file" -ForegroundColor Green

Write-Host "OpenSSL installation complete! You can now run: npm run setup:ssl" -ForegroundColor Green
