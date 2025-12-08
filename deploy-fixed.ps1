
Write-Host "=== AI Meeting Cloudflare Deployment (Fixed) ===" -ForegroundColor Cyan

$uncPath = "\\mac\Home\Downloads\英語口說練習-(english-speaking-practice)"
$driveLetter = "Z"

# Remove existing drive if it exists
if (Test-Path "${driveLetter}:") {
    try {
        Remove-PSDrive -Name $driveLetter -Force -ErrorAction SilentlyContinue
    }
    catch {}
}

Write-Host "Mapping network drive to ${driveLetter}:..." -ForegroundColor Yellow
# Try New-PSDrive first (session scope)
try {
    New-PSDrive -Name $driveLetter -PSProvider FileSystem -Root $uncPath -ErrorAction Stop | Out-Null
}
catch {
    Write-Host "New-PSDrive failed, trying net use..." -ForegroundColor Yellow
    net use "${driveLetter}:" $uncPath
}

if (-not (Test-Path "${driveLetter}:")) {
    Write-Host "Error: Failed to map network drive" -ForegroundColor Red
    exit 1
}

try {
    Set-Location "${driveLetter}:"
    Write-Host "Current location: $(Get-Location)"

    # Step 1: Install frontend dependencies
    Write-Host "Step 1: Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { throw "Failed to install frontend dependencies" }

    # Step 2: Install functions dependencies
    Write-Host "Step 2: Installing functions dependencies..." -ForegroundColor Yellow
    Set-Location functions
    npm install
    if ($LASTEXITCODE -ne 0) { throw "Failed to install functions dependencies" }
    Set-Location ..

    # Step 3: Build the project
    Write-Host "Step 3: Building the project..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Failed to build the project" }

    # Step 4: Check Wrangler
    Write-Host "Step 4: Checking Wrangler..." -ForegroundColor Yellow
    if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
        Write-Host "Installing Wrangler globally..." -ForegroundColor Yellow
        npm install -g wrangler
    }

    # Step 5: Deploy
    Write-Host "Step 5: Deploying to Cloudflare Pages..." -ForegroundColor Yellow
    # Check login first
    wrangler whoami
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Not logged in. Attempting login..." -ForegroundColor Yellow
        wrangler login
    }
    
    wrangler pages deploy dist --project-name=ai-meeting
    if ($LASTEXITCODE -ne 0) { throw "Failed to deploy" }

    Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
    Write-Host "Remember to set GEMINI_API_KEY in Cloudflare Pages settings." -ForegroundColor Yellow
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
finally {
    Set-Location C:\
    if (Test-Path "${driveLetter}:") {
        Remove-PSDrive -Name $driveLetter -Force -ErrorAction SilentlyContinue
    }
}
