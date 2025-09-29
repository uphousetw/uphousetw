# Google OAuth 設定指南

## 1. Google Cloud Console 設定

### 步驟 1: 建立 Google Cloud 建案
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新建案或選擇現有建案
3. 記錄建案 ID

### 步驟 2: 啟用 Google+ API
1. 在 Google Cloud Console 中，前往「API 和服務」→「程式庫」
2. 搜尋並啟用「Google+ API」或「People API」
3. 搜尋並啟用「Google Identity」

### 步驟 3: 設定 OAuth 2.0 憑證
1. 前往「API 和服務」→「憑證」
2. 點擊「建立憑證」→「OAuth 2.0 用戶端 ID」
3. 選擇「網頁應用程式」

### 步驟 4: 設定授權 JavaScript 來源
```
開發環境:
- http://localhost:5173
- http://localhost:3000

生產環境:
- https://your-domain.netlify.app
- https://your-custom-domain.com
```

### 步驟 5: 設定授權重新導向 URI
```
開發環境:
- http://localhost:5173/admin
- http://localhost:3000/admin

生產環境:
- https://your-domain.netlify.app/admin
- https://your-custom-domain.com/admin
```

### 步驟 6: 取得憑證
建立完成後，複製：
- **用戶端 ID** (GOOGLE_CLIENT_ID)
- **用戶端密鑰** (GOOGLE_CLIENT_SECRET)

## 2. 環境變數設定

將以下變數加入 `.env` 檔案：

```env
# Google OAuth 設定
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 管理員白名單 (重要!)
ADMIN_EMAILS=admin@yourcompany.com,manager@yourcompany.com
```

## 3. 網域設定 (生產環境)

### Netlify 環境變數
1. 前往 Netlify Dashboard → Site settings → Environment variables
2. 新增以下變數：
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `ADMIN_EMAILS`

## 4. 安全性注意事項

⚠️ **重要安全措施：**

1. **管理員白名單**: 只有在 `ADMIN_EMAILS` 中列出的 email 才能登入
2. **網域限制**: 在 Google Cloud Console 中限制授權網域
3. **HTTPS**: 生產環境必須使用 HTTPS
4. **敏感資料**: 絕不要將 `GOOGLE_CLIENT_SECRET` 暴露到前端

## 5. 測試流程

### 開發環境測試
1. 設定好環境變數
2. 執行 `npm run dev`
3. 前往 `http://localhost:5173/admin`
4. 點擊「使用 Google 登入」
5. 選擇在白名單中的 Google 帳號

### 除錯常見問題

**錯誤：`redirect_uri_mismatch`**
- 檢查 Google Cloud Console 中的重新導向 URI 設定
- 確保 URL 完全匹配（包含通訊協定）

**錯誤：`access_denied`**
- 檢查 email 是否在 `ADMIN_EMAILS` 白名單中
- 確認 Google 帳號設定允許第三方應用

**錯誤：`invalid_client`**
- 檢查 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 是否正確
- 確認環境變數已正確設定

## 6. 生產環境部署檢查清單

- [ ] Google Cloud Console 中設定正確的生產網域
- [ ] Netlify 環境變數已設定
- [ ] 管理員 email 白名單已更新
- [ ] 測試 OAuth 流程
- [ ] 檢查 GA4 事件記錄

## 7. 進階設定

### 自訂登入畫面
可以在 Google Cloud Console → OAuth 同意畫面 中設定：
- 應用程式名稱
- 使用者支援電子信箱
- 應用程式標誌
- 隱私權政策連結
- 服務條款連結

### API 配額管理
- 前往 Google Cloud Console → API 和服務 → 配額
- 監控 API 使用量
- 必要時申請增加配額