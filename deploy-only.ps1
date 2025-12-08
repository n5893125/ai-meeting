
$buildDir = "C:\Users\kyhsu\.gemini\ai-meeting-build-temp\dist"
$toolDir = "C:\Users\kyhsu\.gemini\wrangler-tool"

Write-Host "=== AI Meeting Deployment (Deploy-Only Strategy) ===" -ForegroundColor Cyan
Write-Host "Build Directory: $buildDir"
Write-Host "Tool Directory: $toolDir"

# Verify build exists
if (-not (Test-Path $buildDir)) {
    Write-Host "Error: Build directory not found. Please run the build script first." -ForegroundColor Red
    exit 1
}

# Setup Tool Directory
if (-not (Test-Path $toolDir)) {
    New-Item -Path $toolDir -ItemType Directory -Force | Out-Null
}
Set-Location $toolDir

# Initialize minimal package.json if needed
if (-not (Test-Path "package.json")) {
    Write-Host "Initializing minimal package.json..."
    npm init -y
}

# Install Wrangler locally in this clean tool dir
Write-Host "Installing Wrangler in tool directory..." -ForegroundColor Yellow
npm install wrangler --save-dev --force --no-audit --no-fund
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install Wrangler." -ForegroundColor Red
    exit 1
}

$wrangler = ".\node_modules\.bin\wrangler.cmd"
if (-not (Test-Path $wrangler)) {
    throw "Wrangler binary not found at $wrangler"
}

# Check login
Write-Host "Checking Cloudflare login..."
& $wrangler whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Cloudflare..." -ForegroundColor Yellow
    & $wrangler login
}

# Deploy
Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Yellow
& $wrangler pages deploy $buildDir --project-name=ai-meeting --commit-dirty=true

if ($LASTEXITCODE -eq 0) {
    Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
    Write-Host "Don't forget to set GEMINI_API_KEY in Cloudflare Pages settings!" -ForegroundColor Yellow
}
else {
    Write-Host "Deployment failed." -ForegroundColor Red
}
