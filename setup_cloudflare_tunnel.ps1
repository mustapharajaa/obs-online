# Cloudflare Tunnel Setup Script
# This script automates the setup of a Cloudflare Tunnel to securely expose your local server.

# --- Configuration ---
$TunnelName = "my-rtmp-tunnel"
$Hostname = "obs.liveenity.com"
$LocalServiceUrl = "http://localhost:3005"
# ---------------------

# --- Script Body ---
Write-Host "--- Cloudflare Tunnel Setup ---" -ForegroundColor Yellow

# Step 1: Check for cloudflared
Write-Host "Step 1: Checking for cloudflared..."
$cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflaredPath) {
    Write-Host "Error: 'cloudflared' command not found." -ForegroundColor Red
    Write-Host "Please download and install it from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/installation/"
    exit
}
Write-Host "✅ cloudflared found at: $($cloudflaredPath.Source)"

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
Write-Host "`nStep 3: Creating tunnel '$TunnelName'..."
$tunnelCreateOutput = cloudflared tunnel create $TunnelName 2>&1
if ($LASTEXITCODE -ne 0) {
    if ($tunnelCreateOutput -like "*already exists*") {
        Write-Host "Tunnel '$TunnelName' already exists. Skipping creation." -ForegroundColor Cyan
    } else {
        Write-Host "Error creating tunnel: $tunnelCreateOutput" -ForegroundColor Red
        exit
    }
} else {
     Write-Host "✅ Tunnel '$TunnelName' created successfully."
}

# Extract Tunnel ID and credentials file path from the output of 'cloudflared tunnel list'
$tunnelInfo = cloudflared tunnel list | Where-Object { $_ -match $TunnelName }
$tunnelId = ($tunnelInfo -split ' ')[0]

if (-not $tunnelId) {
    Write-Host "Error: Could not retrieve Tunnel ID. Please check 'cloudflared tunnel list' manually." -ForegroundColor Red
    exit
}
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
