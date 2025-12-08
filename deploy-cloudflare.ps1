# Deploy to Cloudflare Pages from UNC path
# This script maps a network drive temporarily to avoid UNC path issues

Write-Host "=== AI Meeting Cloudflare Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Map network drive
$uncPath = "\\mac\Home\Downloads\英語口說練習-(english-speaking-practice)"
$driveLetter = "Y:"

Write-Host "Mapping network drive..." -ForegroundColor Yellow
net use $driveLetter $uncPath /persistent:no

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to map network drive" -ForegroundColor Red
    exit 1
}

try {
    # Change to mapped drive
    Set-Location $driveLetter

    # Step 1: Install frontend dependencies
    Write-Host "Step 1: Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }

    # Step 2: Install functions dependencies
    Write-Host "Step 2: Installing functions dependencies..." -ForegroundColor Yellow
    Set-Location functions
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install functions dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location ..

    # Step 3: Build the project
    Write-Host "Step 3: Building the project..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to build the project" -ForegroundColor Red
        exit 1
    }

    # Step 4: Install Wrangler globally (if not already installed)
    Write-Host "Step 4: Checking Wrangler installation..." -ForegroundColor Yellow
    $wranglerInstalled = Get-Command wrangler -ErrorAction SilentlyContinue
    if (-not $wranglerInstalled) {
        Write-Host "Installing Wrangler globally..." -ForegroundColor Yellow
        npm install -g wrangler
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: Failed to install Wrangler" -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "Wrangler is already installed" -ForegroundColor Green
    }

    # Step 5: Login to Cloudflare (if not already logged in)
    Write-Host "Step 5: Checking Cloudflare authentication..." -ForegroundColor Yellow
    Write-Host "If you're not logged in, a browser window will open for authentication" -ForegroundColor Cyan
    wrangler whoami
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Logging in to Cloudflare..." -ForegroundColor Yellow
        wrangler login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: Failed to login to Cloudflare" -ForegroundColor Red
            exit 1
        }
    }

    # Step 6: Deploy to Cloudflare Pages
    Write-Host "Step 6: Deploying to Cloudflare Pages..." -ForegroundColor Yellow
    wrangler pages deploy dist --project-name=ai-meeting
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to deploy to Cloudflare Pages" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Don't forget to set your GEMINI_API_KEY in Cloudflare Pages:" -ForegroundColor Yellow
    Write-Host "1. Go to Cloudflare Dashboard" -ForegroundColor Cyan
    Write-Host "2. Navigate to Pages > ai-meeting > Settings > Environment variables" -ForegroundColor Cyan
    Write-Host "3. Add GEMINI_API_KEY with your Google Gemini API key" -ForegroundColor Cyan
    Write-Host ""
}
finally {
    # Cleanup: Unmap the drive
    Write-Host "Cleaning up network drive..." -ForegroundColor Yellow
    Set-Location C:\
    net use $driveLetter /delete
}

Write-Host "Done!" -ForegroundColor Green
