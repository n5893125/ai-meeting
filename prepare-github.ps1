
$source = Get-Location
$dest = "C:\Users\kyhsu\AiMeeting_SourceCode"

Write-Host "Preparing source code for GitHub upload..." -ForegroundColor Cyan
Write-Host "Source: $source"
Write-Host "Destination: $dest"

# Clean destination
if (Test-Path $dest) {
    Remove-Item -Path $dest -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -Path $dest -ItemType Directory -Force | Out-Null

# Copy essential files/folders
$itemsToCopy = @("src", "public", "functions", "package.json", "tsconfig.json", "vite.config.ts", "index.html", "wrangler.toml", "README.md")

foreach ($item in $itemsToCopy) {
    $path = Join-Path $source $item
    if (Test-Path $path) {
        Write-Host "Copying $item..."
        Copy-Item -Path $path -Destination $dest -Recurse -Force
    }
    else {
        Write-Host "Warning: $item not found in source." -ForegroundColor Yellow
    }
}

Write-Host "Done! Folder is ready for upload." -ForegroundColor Green
Invoke-Item $dest
