
$source = Get-Location
$dest = "C:\Users\kyhsu\AiMeeting_MissingFiles"

Write-Host "Preparing MISSING source files for GitHub upload..." -ForegroundColor Cyan
Write-Host "Source: $source"
Write-Host "Destination: $dest"

# Clean destination
if (Test-Path $dest) {
    Remove-Item -Path $dest -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -Path $dest -ItemType Directory -Force | Out-Null

# Copy ONLY the missing source files/folders
$itemsToCopy = @("components", "hooks", "services", "App.tsx", "index.tsx", "constants.ts", "types.ts")

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
