
$source = Get-Location
$dest = "C:\Users\kyhsu\AiMeeting_Fix"

Write-Host "Preparing FIXED source code for GitHub upload..." -ForegroundColor Cyan
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
    if ($name -eq "node_modules" -or $name -eq ".git" -or $name -eq ".wrangler" -or $name -eq "dist" -or $name -eq "deploy-local-copy.ps1") {
        return
    }
    Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
}

Set-Location $dest

# 1. Fix root package.json
$pkg = Get-Content "package.json" | ConvertFrom-Json
# Remove @google/genai if present, add @google/generative-ai
if ($pkg.dependencies.'@google/genai') {
    $pkg.dependencies.PSObject.Properties.Remove('@google/genai')
}
$pkg.dependencies | Add-Member -Name "@google/generative-ai" -Value "^0.21.0" -MemberType NoteProperty -Force

$pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json"

# 2. Fix functions/package.json (if exists)
if (Test-Path "functions/package.json") {
    $funcPkg = Get-Content "functions/package.json" | ConvertFrom-Json
    if ($funcPkg.dependencies.'@google/genai') {
        $funcPkg.dependencies.PSObject.Properties.Remove('@google/genai')
    }
    $funcPkg.dependencies | Add-Member -Name "@google/generative-ai" -Value "^0.21.0" -MemberType NoteProperty -Force
    $funcPkg | ConvertTo-Json -Depth 10 | Set-Content "functions/package.json"
}

# 3. Fix Import paths in Functions
$functions = Get-ChildItem -Path "functions/api" -Filter "*.ts"
foreach ($file in $functions) {
    $content = Get-Content $file.FullName
    $newContent = $content -replace '@google/genai', '@google/generative-ai'
    Set-Content -Path $file.FullName -Value $newContent
}

Write-Host "Done! 'AiMeeting_Fix' folder is ready." -ForegroundColor Green
Write-Host "Please upload content of C:\Users\kyhsu\AiMeeting_Fix to GitHub." -ForegroundColor Yellow
Invoke-Item .
