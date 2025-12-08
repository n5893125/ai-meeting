
$source = Get-Location
$dest = "C:\Users\kyhsu\AiMeeting_Fix8"

Write-Host "Preparing FIXED source code (Round 8 - Root Dependency) for GitHub upload..." -ForegroundColor Cyan
Write-Host "Source: $source"
Write-Host "Destination: $dest"

# Clean destination
if (Test-Path $dest) {
    Remove-Item -Path $dest -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -Path $dest -ItemType Directory -Force | Out-Null

# Copy all files first
Get-ChildItem -Path $source | ForEach-Object {
    $name = $_.Name
    if ($name -eq "node_modules" -or $name -eq ".git" -or $name -eq ".wrangler" -or $name -eq "dist" -or $name -eq "deploy-local-copy.ps1" -or $name -eq "wrangler.toml") {
        return
    }
    Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
}

Set-Location $dest

# 1. Update ROOT package.json to include @google/generative-ai
$pkg = Get-Content "package.json" | ConvertFrom-Json
if ($pkg.dependencies.'@google/genai') {
    $pkg.dependencies.PSObject.Properties.Remove('@google/genai')
}
# Add to dependencies if not present
if (-not $pkg.dependencies.'@google/generative-ai') {
    $pkg.dependencies | Add-Member -Name "@google/generative-ai" -Value "^0.21.0" -MemberType NoteProperty -Force
}
$pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json"

# 2. Also keep functions/package.json just in case, but ensure it's correct
if (Test-Path "functions/package.json") {
    $funcPkg = Get-Content "functions/package.json" | ConvertFrom-Json
    if ($funcPkg.dependencies.'@google/genai') {
        $funcPkg.dependencies.PSObject.Properties.Remove('@google/genai')
    }
    if (-not $funcPkg.dependencies.'@google/generative-ai') {
        $funcPkg.dependencies | Add-Member -Name "@google/generative-ai" -Value "^0.21.0" -MemberType NoteProperty -Force
    }
    $funcPkg | ConvertTo-Json -Depth 10 | Set-Content "functions/package.json"
}

Write-Host "Done! 'AiMeeting_Fix8' folder is ready." -ForegroundColor Green
Write-Host "Please upload content of C:\Users\kyhsu\AiMeeting_Fix8 to GitHub." -ForegroundColor Yellow
Invoke-Item .
