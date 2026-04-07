param()

# Navigate to project root (folder where this script lives)
Push-Location $PSScriptRoot

Write-Host "=== Starting PathWise dev stack (backend + frontend + Cloudflare) ===" -ForegroundColor Cyan

############################################
# Detect Java 21 from Eclipse Adoptium     #
############################################
$javaHomeCandidate = "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.10.7-hotspot"
if (Test-Path $javaHomeCandidate) {
    $javaExe = Join-Path $javaHomeCandidate "bin\\java.exe"
} else {
    $javaExe = "java.exe"
}

Write-Host "Using Java executable: $javaExe" -ForegroundColor Yellow

############################################################
# 1) Stop anything currently listening on backend port 9090 #
############################################################
try {
    $connections = Get-NetTCPConnection -LocalPort 9090 -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            } catch {
                # ignore errors stopping the process
            }
        }
        Write-Host "Stopped existing process(es) on port 9090." -ForegroundColor Yellow
    }
} catch {
    # If Get-NetTCPConnection is unavailable, just continue
}

############################################
# 2) Start backend JAR with Java 21        #
############################################
$backendDir = Join-Path $PSScriptRoot "backend"
$jarPath    = Join-Path $backendDir "target\career-guidance-api-1.0.0.jar"

if (-not (Test-Path -Path $jarPath)) {
    Write-Host "Backend JAR not found at $jarPath. Building with Maven first ..." -ForegroundColor Yellow
    $mvnPath = Join-Path $backendDir "apache-maven-3.9.6\\bin\\mvn.cmd"
    if (-not (Test-Path -Path $mvnPath)) {
        Write-Host "Maven not found at $mvnPath" -ForegroundColor Red
        Write-Host "Please check backend/apache-maven-3.9.6 is present." -ForegroundColor Red
    } else {
        & $mvnPath clean package -DskipTests
    }
}

if (Test-Path -Path $jarPath) {
    Write-Host "Starting Spring Boot backend on http://localhost:9090 using $javaExe ..." -ForegroundColor Green
    Start-Process -FilePath $javaExe -ArgumentList "-jar", "$jarPath" -WorkingDirectory $backendDir -NoNewWindow
} else {
    Write-Host "Backend JAR still not found; cannot start backend." -ForegroundColor Red
}

############################################
# 3) Start frontend (Vite: npm run dev)   #
############################################
$npmPath = Join-Path $PSScriptRoot "node\node-v20.11.1-win-x64\npm.cmd"
if (-not (Test-Path -Path $npmPath)) {
    # Fallback to npm on PATH
    $npmPath = "npm.cmd"
}

try {
    Write-Host "Starting Vite frontend on http://localhost:5173 ..." -ForegroundColor Green
    Start-Process -FilePath $npmPath -ArgumentList "run","dev" -WorkingDirectory $PSScriptRoot -NoNewWindow
} catch {
    Write-Warning "Failed to start frontend with 'npm run dev': $($_.Exception.Message)"
}

########################################################
# 4) Start Cloudflare tunnel and update .env.local URL #
########################################################
$cloudflaredPath = Join-Path $PSScriptRoot "cloudflared.exe"
if (-not (Test-Path $cloudflaredPath)) {
    # Fallback to system-wide installation path
    $cloudflaredPath = "C:\\Program Files (x86)\\cloudflared\\cloudflared.exe"
}

if (-not (Test-Path $cloudflaredPath)) {
    Write-Warning "cloudflared not found in project root or at 'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe'. Backend and frontend are running, but no public tunnel was started."
    Pop-Location
    exit 0
}

Write-Host "Starting Cloudflare tunnel to http://localhost:9090 ..." -ForegroundColor Green
Write-Host "Waiting for tunnel URL (https://xxxx.trycloudflare.com) to update .env.local ..." -ForegroundColor Cyan

$envFilePath = Join-Path $PSScriptRoot ".env.local"
$urlPattern  = 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com'
$tunnelUrl   = $null

& $cloudflaredPath tunnel --url http://localhost:9090 2>&1 | ForEach-Object {
    $line = $_.ToString()
    Write-Host $line

    if (-not $tunnelUrl -and $line -match $urlPattern) {
        $tunnelUrl = $matches[0]
        $apiUrl    = "$tunnelUrl/api"

        try {
            if (Test-Path $envFilePath) {
                [string[]]$content = Get-Content -Path $envFilePath
                $match   = $content | Select-String -Pattern '^VITE_API_URL=' | Select-Object -First 1
                if ($match) {
                    $content[$match.LineNumber - 1] = "VITE_API_URL=$apiUrl"
                } else {
                    $content += "VITE_API_URL=$apiUrl"
                }
                $content | Set-Content -Path $envFilePath -Encoding UTF8
            } else {
                "VITE_API_URL=$apiUrl" | Set-Content -Path $envFilePath -Encoding UTF8
            }

            Write-Host "Updated .env.local with VITE_API_URL=$apiUrl" -ForegroundColor Green
            Write-Host "Frontend will use this URL for API calls." -ForegroundColor Green
        } catch {
            Write-Warning "Failed to update .env.local: $($_.Exception.Message)"
        }
    }
}

Pop-Location
