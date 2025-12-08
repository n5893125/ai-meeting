# 🎯 視覺化部署指南

## 當前狀態
✅ 專案已準備好（後端 API 已重構）
✅ Node.js 已安裝
⏳ 正在等待 Cloudflare 登入
⏳ 需要設置 Git 儲存庫

---

## 📊 部署流程圖

```
您的電腦                    GitHub                    Cloudflare Pages
┌─────────────┐           ┌─────────────┐           ┌─────────────┐
│ 專案檔案    │           │             │           │             │
│ (已重構)    │──push──→  │ ai-meeting  │──連接──→  │ ai-meeting  │
│             │           │ repository  │           │ (自動建置)  │
└─────────────┘           └─────────────┘           └─────────────┘
                                                            │
                                                            ↓
                                                     https://ai-meeting
                                                          .pages.dev
```

---

## 🔄 詳細步驟（使用 GitHub Desktop）

### 第 1 步: 安裝 GitHub Desktop

1. 訪問: **https://desktop.github.com/**
2. 下載 Windows 版本
3. 安裝並啟動

### 第 2 步: 登入 GitHub

1. 在 GitHub Desktop 中
2. File → Options → Accounts
3. Sign in to GitHub.com
4. 使用您的 GitHub 帳戶登入（沒有的話先註冊）

### 第 3 步: 添加專案

1. File → Add local repository
2. Local path: 點擊 "Choose..." 
3. 瀏覽到: `\\mac\Home\Downloads\英語口說練習-(english-speaking-practice)`
4. 點擊 "Add repository"

如果提示 "This directory does not appear to be a Git repository":
- 點擊 "create a repository"
- Repository name: `ai-meeting`
- Git ignore: `Node`
- License: `None` 或 `MIT`
- 點擊 "Create repository"

### 第 4 步: 提交變更

在 GitHub Desktop 中，您會看到所有檔案：

1. 在左下角 "Summary" 欄位輸入:
   ```
   Initial commit - Refactored for Cloudflare Pages
   ```

2. 在 "Description" 欄位輸入（可選）:
   ```
   - Added backend API functions
   - Moved Gemini API calls to server-side
   - Ready for Cloudflare Pages deployment
   ```

3. 點擊藍色的 **"Commit to main"** 按鈕

### 第 5 步: 發布到 GitHub

1. 點擊頂部的 **"Publish repository"** 按鈕

2. 在彈出視窗中:
   - Name: `ai-meeting` （保持不變）
   - Description: `AI English speaking practice app`
   - ✅ Keep this code private（如果想要私有）
   - 或 ☐ 如果想要公開

3. 點擊 **"Publish repository"**

4. 等待上傳完成（可能需要幾分鐘）

---

## 🌐 在 Cloudflare 連接 GitHub

### 前提: 已完成 Google 驗證並登入 Cloudflare

1. **在 Cloudflare Dashboard:**
   - 左側選單 → **Workers & Pages**
   - 點擊 **"Create application"**
   - 選擇 **Pages** 標籤
   - 點擊 **"Connect to Git"**

2. **授權 GitHub:**
   - 選擇 **GitHub**
   - 點擊 **"Connect GitHub"**
   - 在彈出視窗中點擊 **"Authorize Cloudflare"**
   - 可能需要輸入 GitHub 密碼確認

3. **選擇儲存庫:**
   - 在儲存庫列表中找到 **`ai-meeting`**
   - 點擊 **"Begin setup"**

4. **配置建置設定:**
   
   填寫以下資訊:

   ```
   Project name: ai-meeting
   Production branch: main
   
   Build settings:
   Framework preset: None (或選擇 Vite)
   
   Build command:
   npm install && cd functions && npm install && cd .. && npm run build
   
   Build output directory:
   dist
   
   Root directory (advanced):
   (保持空白)
   
   Environment variables (build only):
   (先不填，稍後在設定中添加)
   ```

5. **開始部署:**
   - 點擊 **"Save and Deploy"**
   - Cloudflare 會開始建置專案
   - 等待 2-5 分鐘

6. **觀察建置日誌:**
   - 您會看到即時的建置日誌
   - 確認沒有錯誤
   - 等待顯示 "Success! Your site has been deployed."

---

## 🔑 設置 API 金鑰

建置成功後：

1. **獲取 Gemini API Key:**
   - 訪問: https://aistudio.google.com/apikey
   - 登入 Google 帳戶
   - 點擊 **"Create API key"** 或 **"Get API key"**
   - **複製** 您的 API key（格式: AIzaSy...）

2. **在 Cloudflare 設置環境變數:**
   - 在專案頁面，點擊頂部的 **"Settings"** 標籤
   - 左側選單 → **"Environment variables"**
   - 在 **"Production"** 區塊，點擊 **"Add variable"**
   
   填寫:
   ```
   Variable name: GEMINI_API_KEY
   Value: [貼上您的 API key]
   ```
   
   - 點擊 **"Save"**

3. **重新部署以應用變數:**
   - 點擊頂部的 **"Deployments"** 標籤
   - 找到最新的部署
   - 點擊右側的 **三個點 (⋯)**
   - 選擇 **"Retry deployment"**
   - 等待重新部署完成

---

## ✅ 測試您的應用

部署成功後：

1. Cloudflare 會顯示您的網站 URL:
   ```
   https://ai-meeting.pages.dev
   ```
   或類似的 URL

2. 點擊 URL 訪問

3. 測試清單:
   - [ ] 首頁載入
   - [ ] 可以選擇主題和難度
   - [ ] 點擊"開始練習"
   - [ ] AI 老師圖像生成
   - [ ] 開始語音對話
   - [ ] AI 有正確回應
   - [ ] 可以查看學習報告

---

## 🎉 完成！

如果所有測試都通過，恭喜！您已成功將 AI Meeting 部署到 Cloudflare Pages！

### 下次更新:

只需在 GitHub Desktop 中：
1. 修改檔案
2. Commit changes
3. Push origin

Cloudflare 會自動檢測變更並重新部署！

---

## 📞 需要幫助？

如果遇到問題：

1. **建置失敗**
   - 檢查 Cloudflare 的建置日誌
   - 確認 package.json 正確

2. **Functions 不工作**
   - 確認 functions 資料夾已推送到 GitHub
   - 確認 GEMINI_API_KEY 已設置

3. **API 錯誤**
   - 檢查瀏覽器控制台 (F12)
   - 確認 API key 有效且有 quota

查看 `DEPLOY_CHECKLIST.md` 獲取更詳細的故障排除指南。
