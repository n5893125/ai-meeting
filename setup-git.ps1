# Git 儲存庫初始化腳本
# 此腳本會初始化 Git 儲存庫並準備推送到 GitHub

Write-Host "=== AI Meeting Git 儲存庫設置 ===" -ForegroundColor Cyan
Write-Host ""

# 設置專案路徑
$projectPath = "\\mac\Home\Downloads\英語口說練習-(english-speaking-practice)"
Write-Host "專案路徑: $projectPath" -ForegroundColor Yellow

# 檢查 Git 是否已安裝
Write-Host ""
Write-Host "檢查 Git 安裝狀態..." -ForegroundColor Yellow
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue

if (-not $gitInstalled) {
    Write-Host "❌ Git 未安裝！" -ForegroundColor Red
    Write-Host ""
    Write-Host "請選擇以下方式之一：" -ForegroundColor Yellow
    Write-Host "1. 下載並安裝 Git: https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host "2. 下載並使用 GitHub Desktop (更簡單): https://desktop.github.com/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "安裝後請重新執行此腳本，或使用 GitHub Desktop 的圖形介面。" -ForegroundColor Yellow
    
    # 詢問是否要打開下載頁面
    $response = Read-Host "是否要在瀏覽器中打開 GitHub Desktop 下載頁面? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Start-Process "https://desktop.github.com/"
    }
    
    exit 1
}

Write-Host "✅ Git 已安裝" -ForegroundColor Green

# 切換到專案目錄
Write-Host ""
Write-Host "切換到專案目錄..." -ForegroundColor Yellow
try {
    Push-Location $projectPath
    Write-Host "✅ 成功進入專案目錄" -ForegroundColor Green
}
catch {
    Write-Host "❌ 無法進入專案目錄: $_" -ForegroundColor Red
    exit 1
}

# 檢查是否已經是 Git 儲存庫
Write-Host ""
Write-Host "檢查 Git 儲存庫狀態..." -ForegroundColor Yellow
$isGitRepo = Test-Path ".git"

if ($isGitRepo) {
    Write-Host "✅ 已經是 Git 儲存庫" -ForegroundColor Green
}
else {
    Write-Host "初始化 Git 儲存庫..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Git 儲存庫初始化成功" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Git 儲存庫初始化失敗" -ForegroundColor Red
        Pop-Location
        exit 1
    }
}

# 添加所有檔案
Write-Host ""
Write-Host "添加專案檔案到 Git..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 檔案添加成功" -ForegroundColor Green
}
else {
    Write-Host "❌ 檔案添加失敗" -ForegroundColor Red
    Pop-Location
    exit 1
}

# 提交變更
Write-Host ""
Write-Host "提交變更..." -ForegroundColor Yellow
$commitMessage = "Initial commit - Refactored for Cloudflare Pages deployment with backend API"
git commit -m "$commitMessage"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 提交成功" -ForegroundColor Green
}
else {
    Write-Host "⚠️  提交可能失敗（也可能是沒有變更）" -ForegroundColor Yellow
}

# 設置預設分支為 main
Write-Host ""
Write-Host "設置預設分支為 main..." -ForegroundColor Yellow
git branch -M main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 分支設置成功" -ForegroundColor Green
}
else {
    Write-Host "⚠️  分支設置可能失敗" -ForegroundColor Yellow
}

# 詢問是否要設置 GitHub remote
Write-Host ""
Write-Host "=== GitHub 設置 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "請先在 GitHub 創建一個新的儲存庫：" -ForegroundColor Yellow
Write-Host "1. 訪問: https://github.com/new" -ForegroundColor Cyan
Write-Host "2. Repository name: ai-meeting" -ForegroundColor Cyan
Write-Host "3. 不要勾選 'Initialize this repository with a README'" -ForegroundColor Cyan
Write-Host "4. 點擊 'Create repository'" -ForegroundColor Cyan
Write-Host ""

$addRemote = Read-Host "已經在 GitHub 創建儲存庫了嗎? (Y/N)"

if ($addRemote -eq 'Y' -or $addRemote -eq 'y') {
    Write-Host ""
    $username = Read-Host "請輸入您的 GitHub 用戶名"
    $repoName = Read-Host "請輸入儲存庫名稱 (預設: ai-meeting)"
    
    if ([string]::IsNullOrWhiteSpace($repoName)) {
        $repoName = "ai-meeting"
    }
    
    $remoteUrl = "https://github.com/$username/$repoName.git"
    
    Write-Host ""
    Write-Host "添加 GitHub remote: $remoteUrl" -ForegroundColor Yellow
    
    # 檢查 remote 是否已存在
    $existingRemote = git remote get-url origin 2>$null
    if ($existingRemote) {
        Write-Host "⚠️  Remote 'origin' 已存在: $existingRemote" -ForegroundColor Yellow
        $updateRemote = Read-Host "是否要更新為新的 URL? (Y/N)"
        if ($updateRemote -eq 'Y' -or $updateRemote -eq 'y') {
            git remote set-url origin $remoteUrl
        }
    }
    else {
        git remote add origin $remoteUrl
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Remote 設置成功" -ForegroundColor Green
    }
    
    # 推送到 GitHub
    Write-Host ""
    Write-Host "推送到 GitHub..." -ForegroundColor Yellow
    Write-Host "注意：這可能需要您輸入 GitHub 登入憑證" -ForegroundColor Cyan
    
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 成功推送到 GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "您的儲存庫 URL: https://github.com/$username/$repoName" -ForegroundColor Cyan
    }
    else {
        Write-Host ""
        Write-Host "❌ 推送失敗" -ForegroundColor Red
        Write-Host "可能的原因：" -ForegroundColor Yellow
        Write-Host "1. 需要先設置 GitHub 認證" -ForegroundColor Cyan
        Write-Host "2. 儲存庫 URL 不正確" -ForegroundColor Cyan
        Write-Host "3. 網路連線問題" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "建議使用 GitHub Desktop 來推送：" -ForegroundColor Yellow
        Write-Host "1. 下載 GitHub Desktop: https://desktop.github.com/" -ForegroundColor Cyan
        Write-Host "2. 登入您的 GitHub 帳戶" -ForegroundColor Cyan
        Write-Host "3. File → Add local repository → 選擇此專案" -ForegroundColor Cyan
        Write-Host "4. Publish repository" -ForegroundColor Cyan
    }
}

Pop-Location

Write-Host ""
Write-Host "=== 下一步 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 如果尚未推送到 GitHub，請使用 GitHub Desktop 完成推送" -ForegroundColor Yellow
Write-Host "2. 在 Cloudflare Dashboard (https://dash.cloudflare.com/)：" -ForegroundColor Yellow
Write-Host "   - Workers & Pages → Create → Connect to Git" -ForegroundColor Cyan
Write-Host "   - 選擇 GitHub 並授權" -ForegroundColor Cyan
Write-Host "   - 選擇 'ai-meeting' 儲存庫" -ForegroundColor Cyan
Write-Host "   - Build command: npm install && cd functions && npm install && cd .. && npm run build" -ForegroundColor Cyan
Write-Host "   - Build output: dist" -ForegroundColor Cyan
Write-Host "3. 部署完成後，設置環境變數 GEMINI_API_KEY" -ForegroundColor Yellow
Write-Host ""
Write-Host "詳細步驟請參考: VISUAL_DEPLOY_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
