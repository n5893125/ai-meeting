# Cloudflare Pages 部署指南 (Deployment Guide)

## 重要提示 (Important Notes)

由於您的系統是 Windows ARM64，Wrangler CLI 可能無法正常安裝。建議使用 Cloudflare Dashboard 進行部署。

Due to Windows ARM64 compatibility issues with Wrangler CLI, we recommend deploying via the Cloudflare Dashboard.

---

## 方法 1: 使用 Cloudflare Dashboard 部署 (Recommended)

### 步驟 1: 準備專案 (Prepare Project)

1. 開啟 PowerShell 並導航到專案目錄:
   ```powershell
   cd "\\mac\Home\Downloads\英語口說練習-(english-speaking-practice)"
   ```

2. 安裝前端依賴:
   ```powershell
   npm install
   ```

3. 安裝後端函數依賴:
   ```powershell
   cd functions
   npm install
   cd ..
   ```

4. 建置專案:
   ```powershell
   npm run build
   ```

### 步驟 2: 使用 Git 部署

1. 初始化 Git 儲存庫 (如果尚未初始化):
   ```powershell
   git init
   git add .
   git commit -m "Initial commit for Cloudflare Pages deployment"
   ```

2. 將專案推送到 GitHub/GitLab:
   - 在 GitHub 或 GitLab 上創建新儲存庫
   - 按照指示推送代碼:
   ```powershell
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```

### 步驟 3: 在 Cloudflare 上設置 Pages

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)

2. 點擊左側選單的 **Pages**

3. 點擊 **Create a project** > **Connect to Git**

4. 授權 Cloudflare 訪問您的 GitHub/GitLab 帳戶

5. 選擇您剛剛推送的儲存庫

6. 配置建置設置:
   - **Project name**: `ai-meeting`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (保持空白或填 `/`)

7. 點擊 **Save and Deploy**

### 步驟 4: 設置環境變數

部署完成後:

1. 在 Cloudflare Dashboard 中，進入 **Pages** > **ai-meeting**

2. 點擊 **Settings** > **Environment variables**

3. 點擊 **Add variable**:
   - **Variable name**: `GEMINI_API_KEY`
   - **Value**: 您的 Google Gemini API 金鑰
   - **Environment**: 選擇 `Production` (和 `Preview` 如果需要)

4. 點擊 **Save**

5. 返回 **Deployments** 頁面，點擊 **Retry deployment** 以使用新的環境變數重新部署

---

## 方法 2: 直接上傳 (Alternative Method)

如果您不想使用 Git:

1. 完成上述「步驟 1: 準備專案」

2. 在 Cloudflare Dashboard:
   - 點擊 **Pages** > **Create a project** > **Upload assets**
   - **Project name**: `ai-meeting`
   - 上傳整個 `dist` 資料夾

3. 部署後，按照「步驟 4: 設置環境變數」設置 API 金鑰

**注意**: 使用直接上傳方法時，您需要手動上傳 `functions` 資料夾。建議使用 Git 方法以獲得完整功能。

---

## 驗證部署 (Verify Deployment)

部署完成後:

1. Cloudflare 會提供一個 URL，例如: `https://ai-meeting.pages.dev`

2. 訪問該 URL 測試應用程式

3. 檢查以下功能:
   - ✅ 設置頁面載入
   - ✅ AI 老師圖像生成
   - ✅ 語音對話功能
   - ✅ 學習報告生成

---

## 故障排除 (Troubleshooting)

### API 錯誤

如果看到 "API key not configured" 錯誤:
- 確認已在 Cloudflare Pages 設置中添加 `GEMINI_API_KEY`
- 重新部署專案以應用環境變數

### 建置失敗

如果建置失敗:
- 檢查 Cloudflare Pages 的建置日誌
- 確認所有依賴都已正確安裝
- 確認 `functions/package.json` 包含 `@google/genai` 依賴

### Functions 無法運作

如果 API endpoints 返回 404:
- 確認 `functions` 資料夾已包含在部署中
- 檢查 Cloudflare Pages Functions 日誌

---

## 本地測試 (Local Testing)

由於 Wrangler 在 ARM64 上的限制，本地測試可能受限。您可以:

1. 使用標準 Vite 開發伺服器 (但 Functions 不會運作):
   ```powershell
   npm run dev
   ```

2. 或在部署到 Cloudflare Pages 後直接測試

---

## 更新專案 (Updating the Project)

使用 Git 方法部署後，更新很簡單:

```powershell
git add .
git commit -m "Update description"
git push
```

Cloudflare Pages 會自動檢測變更並重新部署。

---

## 獲取 Gemini API 金鑰

如果您還沒有 Gemini API 金鑰:

1. 訪問 [Google AI Studio](https://aistudio.google.com/apikey)
2. 登入您的 Google 帳戶
3. 點擊 **Get API Key** 或 **Create API Key**
4. 複製金鑰並保存在安全的地方
5. 在 Cloudflare Pages 環境變數中使用此金鑰

---

## 安全性說明 (Security Notes)

✅ **已實現的安全措施**:
- API 金鑰儲存在 Cloudflare 的環境變數中，不會暴露給客戶端
- 所有 Gemini API 呼叫都在後端 (Cloudflare Functions) 進行
- 前端只與您的 API endpoints 通訊

❌ **不要**:
- 不要在前端代碼中硬編碼 API 金鑰
- 不要將 `.env` 檔案提交到 Git
- 不要分享您的 API 金鑰

---

## 需要幫助？

如果遇到問題:
1. 檢查 Cloudflare Pages 的部署日誌
2. 檢查瀏覽器控制台的錯誤訊息
3. 確認所有環境變數都已正確設置
