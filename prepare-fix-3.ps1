
$source = Get-Location
$dest = "C:\Users\kyhsu\AiMeeting_Fix3"

Write-Host "Preparing FIXED source code (Round 3) for GitHub upload..." -ForegroundColor Cyan
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

# 1. Fix Import paths in Functions
$functions = Get-ChildItem -Path "functions/api" -Filter "*.ts"
foreach ($file in $functions) {
    $content = Get-Content $file.FullName
    # Replace @google/genai with @google/generative-ai in import paths
    $newContent = $content -replace 'from "@google/genai"', 'from "@google/generative-ai"'
    $newContent = $newContent -replace "from '@google/genai'", "from '@google/generative-ai'"
    
    # Ensure GoogleGenerativeAI is used (just in case)
    $newContent = $newContent -replace 'GoogleGenAI', 'GoogleGenerativeAI'
    
    Set-Content -Path $file.FullName -Value $newContent
}

# 2. Ensure package.json has correct dependency
$pkg = Get-Content "package.json" | ConvertFrom-Json
if ($pkg.dependencies.'@google/genai') {
    $pkg.dependencies.PSObject.Properties.Remove('@google/genai')
}
if (-not $pkg.dependencies.'@google/generative-ai') {
    $pkg.dependencies | Add-Member -Name "@google/generative-ai" -Value "^0.21.0" -MemberType NoteProperty -Force
}
$pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json"

# 3. Ensure functions/package.json has correct dependency
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

Write-Host "Done! 'AiMeeting_Fix3' folder is ready." -ForegroundColor Green
Write-Host "Please upload content of C:\Users\kyhsu\AiMeeting_Fix3 to GitHub." -ForegroundColor Yellow
Invoke-Item .
