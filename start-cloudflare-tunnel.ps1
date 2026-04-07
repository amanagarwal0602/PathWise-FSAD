param()

# Navigate to project root (folder where this script lives)
Push-Location $PSScriptRoot

$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"

if (-not (Test-Path $cloudflaredPath)) {
    Write-Error "cloudflared not found at $cloudflaredPath. Please check your installation."
    Pop-Location
    exit 1
}

# Start a quick tunnel to the local backend on port 9090
& $cloudflaredPath tunnel --url http://localhost:9090

Pop-Location
