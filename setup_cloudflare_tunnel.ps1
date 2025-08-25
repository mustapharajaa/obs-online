# Set execution policy for the current process to allow script execution
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# Cloudflare Tunnel Setup Script
# This script automates the setup of a Cloudflare Tunnel to securely expose your local server.

# --- Configuration from .env ---
# Read and parse the .env file
$envFile = ".\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env file not found in the current directory." -ForegroundColor Red
    exit
}

$envConfig = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([^#\s=]+)\s*=\s*(.*)") {
        $key = $Matches[1]
        $value = $Matches[2].Trim()
        $envConfig[$key] = $value
    }
}

# Set variables from the parsed .env config
$Hostname = $envConfig["BACKEND_DOMAIN"]
$Port = $envConfig["SERVER_PORT"]
$TunnelName = $Hostname.Split('.')[0] # e.g., "obs" from "obs.liveenity.com"
$LocalServiceUrl = "http://localhost:$Port"

if (-not $Hostname -or -not $Port) {
    Write-Host "Error: BACKEND_DOMAIN or SERVER_PORT not found in .env file." -ForegroundColor Red
    exit
}

Write-Host "Loaded configuration: Hostname=$Hostname, Service=$LocalServiceUrl, TunnelName=$TunnelName" -ForegroundColor Green
# -----------------------------

# --- Script Body ---
Write-Host "--- Cloudflare Tunnel Setup ---" -ForegroundColor Yellow

# Step 1: Check for and install cloudflared if missing
Write-Host "Step 1: Checking for cloudflared..."
$cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflaredPath) {
    Write-Host "'cloudflared' not found. Attempting to install..." -ForegroundColor Yellow
    
    # Download
    $installerUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi"
    $installerPath = "$env:TEMP\cloudflared-installer.msi"
    Write-Host "Downloading from $installerUrl..."
    try {
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
        Write-Host "✅ Download complete."
    } catch {
        Write-Host "Error downloading installer: $_" -ForegroundColor Red
        exit
    }
    
    # Install
    Write-Host "Installing cloudflared..."
    $installProcess = Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet /qn /norestart" -Wait -PassThru
    if ($installProcess.ExitCode -ne 0) {
        Write-Host "Error during installation. Exit code: $($installProcess.ExitCode)" -ForegroundColor Red
        Write-Host "Please try installing manually from the downloaded file: $installerPath"
        exit
    }
    Write-Host "✅ Installation complete."
    
    # Clean up installer
    Remove-Item $installerPath -Force
    
    # Add to PATH for the current session to ensure it can be found immediately
    # The default install path for the MSI is in Program Files (x86)
    $installDir = "C:\Program Files (x86)\cloudflared"
    if (Test-Path "$installDir\cloudflared.exe") {
         $env:Path += ";$installDir"
         Write-Host "Temporarily added $installDir to PATH for this session."
    } else {
        Write-Host "Warning: Could not find cloudflared installation directory to update PATH. A terminal restart may be required after installation." -ForegroundColor Yellow
    }

    # Verify installation
    $cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue
    if (-not $cloudflaredPath) {
        Write-Host "Error: cloudflared installation failed or was not found in PATH. Please restart the terminal and try again." -ForegroundColor Red
        exit
    }
}
Write-Host "✅ cloudflared is available."

# Step 2: Login
Write-Host "`nStep 2: Authenticating with Cloudflare..."
Write-Host "A browser window will open. Please log in and authorize the certificate for your domain ($Hostname)."
Read-Host -Prompt "Press Enter to continue after you have authorized in the browser"
try {
    cloudflared tunnel login
    Write-Host "✅ Login successful."
} catch {
    Write-Host "Error during login. Please try again." -ForegroundColor Red
    exit
}

# Step 3: Create Tunnel
Write-Host "Step 3: Creating tunnel '$TunnelName'..."

# To ensure a clean state, first attempt to delete the tunnel if it already exists.
# This handles cases where the tunnel exists remotely but local credentials are lost.
Write-Host "Ensuring a clean slate by attempting to delete '$TunnelName' first..."
cloudflared tunnel delete $TunnelName > $null

# Now, create a new tunnel.
Write-Host "Creating a new tunnel named '$TunnelName'..."
$creationOutput = cloudflared tunnel create $TunnelName
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create tunnel. Please check your Cloudflare configuration and permissions."
    Write-Host $creationOutput
    exit 1
}

Write-Host "✅ Tunnel '$TunnelName' created successfully."
# Extract Tunnel ID from creation output
$tunnelId = ($creationOutput | Select-String -Pattern '([a-f0-9-]{36})').Matches[0].Groups[1].Value
if (-not $tunnelId) {
    Write-Host "❌ Could not extract Tunnel ID from creation output."
    exit 1
}
Write-Host "Discovered Tunnel ID: $tunnelId"

# The Tunnel ID is now reliably extracted from the 'create' command output.
# The credentials file is located using this ID.
$credsFilePath = "$env:USERPROFILE\.cloudflared\$tunnelId.json"

Write-Host "Tunnel ID: $tunnelId"
Write-Host "Credentials file: $credsFilePath"


# Step 4: Create Config File
Write-Host "`nStep 4: Creating configuration file..."
$configDir = "$env:USERPROFILE\.cloudflared"
$configFile = "$configDir\config.yml"

if (-not (Test-Path $configDir)) {
    New-Item -Path $configDir -ItemType Directory
}

$configContent = @"
tunnel: $tunnelId
credentials-file: $credsFilePath

ingress:
  - hostname: $Hostname
    service: $LocalServiceUrl
  - service: http_status:404
"@

Set-Content -Path $configFile -Value $configContent
Write-Host "✅ Configuration file created at '$configFile'"

# Step 5: Create DNS Record
Write-Host "`nStep 5: Creating DNS record for '$Hostname'..."
cloudflared tunnel route dns $TunnelName $Hostname
if ($LASTEXITCODE -ne 0) {
     Write-Host "Warning: Could not create DNS record. It might already exist. Please check your Cloudflare dashboard." -ForegroundColor Yellow
} else {
    Write-Host "✅ DNS record created successfully."
}

# Final Instructions
Write-Host "`n--- Setup Complete! ---" -ForegroundColor Green
Write-Host "To start the tunnel, run the following command in your terminal:"
Write-Host "cloudflared tunnel run $TunnelName" -ForegroundColor Cyan
