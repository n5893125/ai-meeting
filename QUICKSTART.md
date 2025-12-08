# Quick Start Guide - AI Meeting 部署

## 🚀 快速開始 (5 分鐘設置)

### 方法 1: 使用 GitHub + Cloudflare (推薦)

#### 步驟 1: 準備 GitHub 儲存庫

```bash
# 初始化 Git (如果尚未初始化)
git init

# 添加所有檔案
git add .

# 提交
git commit -m "Ready for Cloudflare Pages deployment"

# 在 GitHub 創建新儲存庫，然後:
git remote add origin https://github.com/YOUR_USERNAME/ai-meeting.git
git branch -M main
git push -u origin main
```

#### 步驟 2: Cloudflare Pages 設置

1. 訪問 https://dash.cloudflare.com/
2. 點擊 **Pages** → **Create a project** → **Connect to Git**
3. 選擇您的 GitHub 儲存庫
4. 配置:
   - **Project name**: `ai-meeting`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. 點擊 **Save and Deploy**

#### 步驟 3: 設置 API 金鑰

1. 獲取 Gemini API Key: https://aistudio.google.com/apikey
2. 在 Cloudflare: **Pages** → **ai-meeting** → **Settings** → **Environment variables**
3. 添加變數:
   - Name: `GEMINI_API_KEY`
   - Value: 您的 API 金鑰
4. **Retry deployment** 以應用變更

### ✅ 完成！

您的應用現在應該可以在 `https://ai-meeting.pages.dev` 訪問了！

---

## 📋 檢查清單

部署前:
- [ ] 已安裝 Node.js 和 npm
- [ ] 已獲取 Gemini API 金鑰
- [ ] 已創建 GitHub/GitLab 帳戶
- [ ] 已創建 Cloudflare 帳戶

部署後:
- [ ] 網站可以訪問
- [ ] 設置環境變數 `GEMINI_API_KEY`
- [ ] 測試 AI 對話功能
- [ ] 測試學習報告生成

---

## 🔧 故障排除

### 問題: "API key not configured"
**解決方案**: 
1. 確認已在 Cloudflare Pages 設置中添加 `GEMINI_API_KEY`
2. 重新部署專案

### 問題: Functions 返回 404
**解決方案**: 
1. 確認 `functions` 資料夾已包含在 Git 儲存庫中
2. 檢查 Cloudflare Pages 的建置日誌

### 問題: 建置失敗
**解決方案**: 
1. 檢查 Cloudflare 的建置日誌
2. 確認 `package.json` 和 `functions/package.json` 都已提交

---

## 📚 更多資訊

- 完整部署指南: 查看 `DEPLOYMENT.md`
- 重構詳情: 查看 `REFACTORING_SUMMARY.md`
- Cloudflare Pages 文件: https://developers.cloudflare.com/pages/

---

## 🆘 需要幫助？

1. 檢查 Cloudflare Pages 的部署日誌
2. 檢查瀏覽器控制台 (F12) 的錯誤訊息
3. 確認所有環境變數都已設置
4. 參考 `DEPLOYMENT.md` 中的詳細故障排除指南
