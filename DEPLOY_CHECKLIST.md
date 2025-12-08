# 🚀 部署檢查清單 (Deploy Checklist)

## 前置準備

### ✅ 步驟 1: 獲取 Google Gemini API Key

1. 訪問: https://aistudio.google.com/apikey
2. 使用您的 Google 帳戶登入
3. 點擊 **Create API Key** 或 **Get API key**
4. 複製並保存您的 API 金鑰（格式類似: `AIzaSy...`）

**您的 API Key**: _________________ (請填寫)

---

## 部署方式選擇

由於技術限制（UNC 路徑 + Windows ARM64），我們使用 **直接上傳方式**：

### ✅ 步驟 2: 準備專案檔案

#### 選項 A: 使用已建置的檔案（如果有 dist 資料夾）

1. 檢查專案根目錄是否有 `dist` 資料夾
2. 如果有，直接進入步驟 3

#### 選項 B: 在另一台電腦或雲端環境建置

如果本機建置有問題，您可以：
1. 將專案上傳到 GitHub
2. 使用 GitHub Codespaces 或其他雲端環境
3. 執行:
   ```bash
   npm install
   cd functions
   npm install
   cd ..
   npm run build
   ```
4. 下載 `dist` 資料夾

#### 選項 C: 跳過建置，使用 Git 部署

最推薦的方式！讓 Cloudflare 自動建置。

---

### ✅ 步驟 3: 登入 Cloudflare

1. 在瀏覽器中訪問: https://dash.cloudflare.com/
2. 使用您的 Cloudflare 帳戶登入
   - 如果沒有帳戶，請先註冊（免費）
3. 登入成功後，您會看到 Cloudflare Dashboard

現在請先登入 Cloudflare！✋

---

### ✅ 步驟 4: 創建 Pages 專案

登入後：

1. 在左側選單找到並點擊 **Workers & Pages**
   
2. 點擊右上角的 **Create application** 按鈕

3. 選擇 **Pages** 標籤

4. 選擇部署方式：

#### 方式 A: Connect to Git (強烈推薦！) ⭐

**前置準備:**
a. 將專案推送到 GitHub:
   - 訪問 https://github.com/new
   - 創建新儲存庫，名稱: `ai-meeting`
   - 在本地執行:
     ```bash
     git init
     git add .
     git commit -m "Initial commit for Cloudflare deployment"
     git remote add origin https://github.com/YOUR_USERNAME/ai-meeting.git
     git branch -M main
     git push -u origin main
     ```

**然後在 Cloudflare:**
a. 點擊 **Connect to Git**
b. 選擇 **GitHub** 並授權
c. 選擇 `ai-meeting` 儲存庫
d. 配置建置設定:
   - **Project name**: `ai-meeting`
   - **Production branch**: `main`
   - **Framework preset**: `無` 或 `Vite`
   - **Build command**: `npm install && cd functions && npm install && cd .. && npm run build`
   - **Build output directory**: `dist`
e. 點擊 **Save and Deploy**

#### 方式 B: Direct Upload (簡單但功能受限)

a. 點擊 **Upload assets**
b. **Project name**: 輸入 `ai-meeting`
c. 將 `dist` 資料夾拖放到上傳區域
d. 點擊 **Deploy site**

⚠️ **注意**: 直接上傳方式，Functions 可能無法正常運作！建議使用 Git 方式。

---

### ✅ 步驟 5: 設置環境變數

部署完成後（等待 1-2 分鐘）：

1. 在 Cloudflare Dashboard 中，找到您的專案
   - **Workers & Pages** > **ai-meeting**

2. 點擊上方的 **Settings** 標籤

3. 在左側選單找到 **Environment variables**

4. 在 **Production** 部分，點擊 **Add variable**:
   - **Variable name**: 輸入 `GEMINI_API_KEY`
   - **Value**: 貼上您的 Gemini API 金鑰
   - **Type**: 選擇 `Text` (或預設)

5. 點擊 **Save**

6. 返回 **Deployments** 標籤

7. 找到最新的部署，點擊右側的三個點 `⋯`

8. 選擇 **Retry deployment**
   - 這會使用新的環境變數重新部署

---

### ✅ 步驟 6: 測試部署

1. 部署成功後，Cloudflare 會提供一個 URL
   - 格式: `https://ai-meeting.pages.dev`
   - 或類似: `https://ai-meeting-xxx.pages.dev`

2. 點擊 URL 訪問您的應用程式

3. 測試以下功能:
   - [ ] 首頁載入成功
   - [ ] 可以選擇主題和難度
   - [ ] 點擊開始後，AI 老師圖像可以生成
   - [ ] 語音識別功能正常
   - [ ] 可以進行對話
   - [ ] AI 有回應
   - [ ] 對話結束後可以查看學習報告

---

## 🔧 故障排除

### 問題 1: "API key not configured"

**原因**: 環境變數未設置或未生效

**解決方案**:
1. 確認已在 **Settings** > **Environment variables** 中添加 `GEMINI_API_KEY`
2. 變數名稱必須完全一致（區分大小寫）
3. 在 **Deployments** 中重新部署

### 問題 2: API endpoints 返回 404

**原因**: Functions 未包含在部署中

**解決方案**:
1. 確認使用 Git 部署方式
2. 確認 `functions` 資料夾已推送到 GitHub
3. 檢查 Cloudflare 的建置日誌

### 問題 3: 建置失敗

**原因**: 依賴安裝失敗或配置錯誤

**解決方案**:
1. 檢查 Cloudflare 的建置日誌（在 Deployments 頁面）
2. 確認 `package.json` 和 `functions/package.json` 都存在
3. 嘗試修改 Build command 為:
   ```
   npm install && npm run build
   ```

### 問題 4: 圖像生成失敗

**原因**: Gemini API quota 或許可權問題

**解決方案**:
1. 確認您的 Gemini API key 有效
2. 檢查 Google AI Studio 的 quota 限制
3. 確認已啟用 Imagen API

---

## 📝 當前進度追蹤

- [ ] 步驟 1: 獲取 Gemini API Key
- [ ] 步驟 2: 準備專案檔案
- [ ] 步驟 3: 登入 Cloudflare
- [ ] 步驟 4: 創建 Pages 專案
- [ ] 步驟 5: 設置環境變數
- [ ] 步驟 6: 測試部署

---

## 🎉 完成！

恭喜！您的 AI Meeting 應用程式現在應該已經成功部署到 Cloudflare Pages！

**您的應用程式 URL**: ___________________

**下次更新應用程式**:
如果使用 Git 方式部署，只需:
```bash
git add .
git commit -m "Update"
git push
```
Cloudflare 會自動檢測變更並重新部署。
