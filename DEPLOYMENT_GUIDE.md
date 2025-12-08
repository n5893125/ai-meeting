# AI Meeting - Cloudflare Pages 部署指南

## 專案已準備好部署！

您的專案已經成功構建，所有檔案都在 `dist` 資料夾中。

## 部署步驟

### 方法 1: 使用 Cloudflare Dashboard (推薦 - 最簡單)

1. **打開 Cloudflare Dashboard**
   - 前往: https://dash.cloudflare.com/
   - 登入您的 Cloudflare 帳號

2. **創建新的 Pages 專案**
   - 點擊左側選單的 **Workers & Pages**
   - 點擊 **Create application**
   - 選擇 **Pages** 標籤
   - 點擊 **Upload assets**

3. **上傳專案檔案**
   - 專案名稱輸入: `ai-meeting`
   - 將以下資料夾中的所有檔案拖曳到上傳區域:
     ```
     C:\Users\kyhsu\.gemini\ai-meeting-build\dist
     ```
   - 點擊 **Deploy site**

4. **設定環境變數 (重要！)**
   - 部署完成後，點擊專案的 **Settings**
   - 選擇 **Environment variables**
   - 點擊 **Add variable**
   - 設定以下變數:
     - **變數名稱**: `GEMINI_API_KEY`
     - **變數類型**: 選擇 `Encrypted` (加密)
     - **變數值**: 貼上您的 Gemini API Key
     - **環境**: 選擇 `Production` 和 `Preview` (兩者都要)
   - 點擊 **Save**

5. **重新部署**
   - 返回專案的 **Deployments** 頁面
   - 點擊最新的部署旁的 **...** 選單
   - 選擇 **Retry deployment**

### 方法 2: 使用 Git Repository (推薦 - 自動化)

1. **將專案推送到 GitHub**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **在 Cloudflare 連接 Git**
   - 前往 https://dash.cloudflare.com/
   - **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**
   - 授權 Cloudflare 存取您的 GitHub/GitLab
   - 選擇您的 repository

3. **配置構建設定**
   - **專案名稱**: `ai-meeting`
   - **構建命令**: `npm run build`
   - **構建輸出目錄**: `dist`
   - **Root directory**: `/` (預設)
   - 點擊 **Save and Deploy**

4. **設定環境變數**
   - 同方法 1 的步驟 4

### 方法 3: 使用 Wrangler CLI (進階)

如果您想使用命令列工具，可以嘗試以下步驟:

```powershell
# 安裝 wrangler (如果尚未安裝)
npm install -g wrangler

# 登入 Cloudflare
wrangler login

# 部署專案
wrangler pages deploy dist --project-name=ai-meeting
```

注意：由於您的系統環境問題，wrangler可能無法正常安裝。建議使用方法 1 或方法 2。

## 部署後的檢查清單

- [ ] 專案已成功部署
- [ ] `GEMINI_API_KEY` 環境變數已設定
- [ ] 環境變數已套用到 Production 和 Preview 環境
- [ ] 專案可以正常訪問
- [ ] API 功能正常運作（可以生成 AI 老師、進行對話等）

## 專案配置文件

以下是重要的配置檔案:

### wrangler.toml
```toml
name = "ai-meeting"
compatibility_date = "2024-11-01"
pages_build_output_dir = "dist"

[build]
command = "npm run build"
```

### package.json
- 構建命令: `npm run build`
- 開發伺服器: `npm run dev`

## Functions (Cloudflare Pages Functions)

專案已經包含以下 API endpoints（會自動部署）:

- `/api/generate-image` - 生成 AI 老師頭像
- `/api/chat-create` - 創建新的對話
- `/api/chat-message` - 發送訊息給 AI
- `/api/generate-report` - 生成學習報告

這些 functions 位於 `functions/api/` 目錄，Cloudflare Pages 會自動識別並部署它們。

## 取得 Gemini API Key

如果您還沒有 Gemini API Key:

1. 前往 https://aistudio.google.com/
2. 登入您的 Google 帳號
3. 點擊 **Get API key**
4. 創建新的 API key
5. 複製 API key 並保存在安全的地方

## 故障排除

### 問題: API 呼叫失敗
**解決方案**: 確認 `GEMINI_API_KEY` 已正確設定在環境變數中

### 問題: 頁面顯示但功能無法使用
**解決方案**: 
1. 檢查瀏覽器控制台的錯誤訊息
2. 確認 Functions 已正確部署（在 Cloudflare Dashboard 的 Functions 標籤中查看）
3. 確認 API key 有效且有足夠的配額

### 問題: 找不到 dist 資料夾
**解決方案**: 
```powershell
cd C:\Users\kyhsu\.gemini\ai-meeting-build
npm run build
```

## 需要幫助？

如果遇到任何問題，可以查看:
- Cloudflare Pages 文檔: https://developers.cloudflare.com/pages/
- Cloudflare Functions 文檔: https://developers.cloudflare.com/pages/functions/
- Gemini API 文檔: https://ai.google.dev/docs

---

**準備好了嗎？**

打開檔案總管到 `dist` 資料夾:
```powershell
explorer.exe C:\Users\kyhsu\.gemini\ai-meeting-build\dist
```

打開 Cloudflare Dashboard:
```powershell
start https://dash.cloudflare.com/
```

祝您部署順利！🚀
