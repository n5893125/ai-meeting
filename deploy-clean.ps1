
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$source = Get-Location
$deployDir = "C:\Users\kyhsu\AiDeploy"

Write-Host "=== AI Meeting Deployment (Clean Directory Strategy) ===" -ForegroundColor Cyan
Write-Host "Source: $source"
Write-Host "Deploy Dir: $deployDir"

# 1. Prepare Clean Directory
Write-Host "Preparing clean directory..." -ForegroundColor Yellow
if (Test-Path $deployDir) {
    # Try to remove, if fails (locked), try a new name
    try {
        Remove-Item -Path $deployDir -Recurse -Force -ErrorAction Stop
    }
    catch {
        $deployDir = "C:\Users\kyhsu\AiDeploy_" + (Get-Random)
        Write-Host "Previous dir locked, using: $deployDir" -ForegroundColor Yellow
        New-Item -Path $deployDir -ItemType Directory -Force | Out-Null
    }
}
else {
    New-Item -Path $deployDir -ItemType Directory -Force | Out-Null
}

# 2. Copy Assets
Write-Host "Copying assets..." -ForegroundColor Yellow
# Copy dist
Copy-Item -Path "dist" -Destination "$deployDir\dist" -Recurse -Force
# Copy functions
Copy-Item -Path "functions" -Destination "$deployDir\functions" -Recurse -Force

Set-Location $deployDir

# 3. Initialize minimal package.json
Write-Host "Initializing package.json..."
Set-Content -Path "package.json" -Value '{ "name": "deploy-tool", "private": true }'

# 4. Install Wrangler (Local)
Write-Host "Installing Wrangler (this might take a minute)..." -ForegroundColor Yellow
# Use --no-bin-links to avoid some filesystem issues on Windows
npm install wrangler --save-dev --no-bin-links --no-audit --no-fund
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install Wrangler." -ForegroundColor Red
    exit 1
}

# 5. Deploy
Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Yellow

# Find Wrangler script
$wranglerJs = "$deployDir\node_modules\wrangler\bin\wrangler.js"
if (-not (Test-Path $wranglerJs)) {
    throw "Wrangler JS not found at $wranglerJs"
}

# Check login
node $wranglerJs whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Cloudflare..." -ForegroundColor Yellow
    node $wranglerJs login
}

# Deploy
# Note: We run from $deployDir. 'dist' is the asset folder. 'functions' is in root, so Wrangler picks it up automatically.
node $wranglerJs pages deploy dist --project-name=ai-meeting --commit-dirty=true

if ($LASTEXITCODE -eq 0) {
    Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
    Write-Host "Don't forget to set GEMINI_API_KEY in Cloudflare Pages settings!" -ForegroundColor Yellow
}
else {
    Write-Host "Deployment failed." -ForegroundColor Red
}
