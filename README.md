# 建設公司 Portfolio 網站

這是一個基於 React 和 Tailwind CSS 的現代化建設公司作品集網站，符合 PRD 規範要求。

## 🏗️ 功能特色

### 前台功能
- **首頁**：品牌展示、服務介紹、精選建案
- **關於我們**：公司簡介、品牌理念、發展歷程
- **建案列表**：可篩選排序的建案展示
- **建案詳情**：詳細建案資訊與規格
- **聯絡我們**：聯絡表單與公司資訊
- **法規頁面**：隱私權政策、免責聲明

### 後台功能
- **身份驗證**：Google OAuth + Magic Link
- **內容管理**：建案 CRUD、關於我們編輯
- **聯絡訊息**：查看客戶來信、匯出 CSV
- **網站部署**：一鍵重新部署
- **GA4 追蹤**：完整的管理操作記錄

### 技術規格
- **前端**：React 18 + TypeScript + React Router
- **樣式**：Tailwind CSS + Framer Motion
- **後端**：Netlify Functions (Serverless)
- **部署**：Netlify 自動部署
- **SEO**：自動生成 sitemap、robots.txt、meta tags
- **分析**：Google Analytics 4 整合
- **安全**：JWT + HttpOnly Cookie、HTTPS

## 🚀 快速開始

### 環境需求
- Node.js 18+
- npm 或 yarn

### 安裝步驟

1. **克隆建案**
   ```bash
   git clone <repository-url>
   cd uphouse-portfolio
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **設置環境變數**
   ```bash
   cp .env.example .env
   # 編輯 .env 文件，填入實際的配置值
   ```

4. **啟動開發服務器**
   ```bash
   npm run dev
   ```

   網站將在 http://localhost:5173 啟動

### 建置部署

```bash
# 建置生產版本
npm run build

# 預覽建置結果
npm run preview
```

## 📁 建案結構

```
├── public/                 # 靜態資源
│   ├── robots.txt         # SEO 爬蟲規則
│   └── sitemap.xml        # 網站地圖
├── src/
│   ├── components/        # 可重用組件
│   ├── pages/            # 頁面組件
│   ├── types/            # TypeScript 型別定義
│   ├── data/             # 預設資料
│   └── utils/            # 工具函數
├── netlify/
│   └── functions/        # Serverless 函數
├── netlify.toml          # Netlify 配置
└── PRD.md               # 產品需求文件
```

## 🔧 配置說明

### 環境變數

複製 `.env.example` 為 `.env` 並更新以下設定：

```env
REACT_APP_SITE_URL=https://your-site.netlify.app
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
JWT_SECRET=your-secure-secret
ADMIN_EMAILS=admin@example.com
```

### Google Analytics 4

1. 建立 GA4 屬性
2. 取得測量 ID (G-XXXXXXXXXX)
3. 更新 `.env` 中的 `REACT_APP_GA_MEASUREMENT_ID`

### 管理員設定

在 `.env` 中的 `ADMIN_EMAILS` 設定白名單：

```env
ADMIN_EMAILS=admin@company.com,manager@company.com
```

## 🚀 部署到 Netlify

### 自動部署

1. **連接 Git Repository**
   - 登入 Netlify
   - New site from Git
   - 選擇你的 repository

2. **設定建置**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **環境變數**
   在 Netlify Dashboard > Site settings > Environment variables 中設定：
   - `JWT_SECRET`
   - `ADMIN_EMAILS`
   - `REACT_APP_GA_MEASUREMENT_ID`

### 手動部署

```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 登入
netlify login

# 建置並部署
npm run build
netlify deploy --prod --dir=dist
```

## 📊 GA4 事件追蹤

後台操作會自動記錄以下事件：

- `admin_login` - 管理員登入
- `admin_logout` - 管理員登出
- `admin_action` - CRUD 操作
- `admin_upload` - 檔案上傳
- `admin_deploy_triggered` - 觸發部署
- `admin_deploy_result` - 部署結果
- `admin_error` - 錯誤記錄

## 🔒 安全性

- HTTPS 強制加密
- JWT token 存於 HttpOnly Cookie
- 管理員 email 白名單驗證
- GA4 不記錄個人資料 (PII)
- CORS 設定保護 API
- 敏感檔案路徑保護

## 📋 法規合規

- **隱私權政策** - 完整的個資保護說明
- **免責聲明** - 網站使用條款
- **Cookie 政策** - Cookie 使用說明
- **個資權利** - 用戶權利行使管道

## 🛠️ 開發指南

### 新增頁面

1. 在 `src/pages/` 建立組件
2. 更新 `src/App.tsx` 路由
3. 加入 SEO 元素
4. 更新 sitemap.xml

### 修改樣式

使用 Tailwind CSS classes：

```jsx
<div className="bg-primary-600 text-white p-6 rounded-lg">
  內容
</div>
```

### 新增 API 端點

在 `netlify/functions/` 建立新的 serverless 函數。

## 🐛 疑難排解

### 建置錯誤

```bash
# 清除 node_modules 重新安裝
rm -rf node_modules package-lock.json
npm install
```

### 樣式問題

確認 Tailwind CSS 配置正確：

```bash
# 重新建置 CSS
npm run build
```

## 📞 技術支援

如有技術問題，請參考：

1. **文件** - 查看 PRD.md 了解詳細需求
2. **日誌** - 檢查瀏覽器 Console 和 Netlify Functions 日誌
3. **環境** - 確認 .env 配置正確

## 📄 授權

本建案依照 PRD 需求開發，包含完整的法規合規功能。

---

## 🎯 PRD 合規檢查清單

### ✅ 前台功能
- [x] 首頁 Hero + 服務優勢 + 精選建案
- [x] 關於我們頁面（簡介 + 理念 + 歷程）
- [x] 建案列表（篩選 + 排序）
- [x] 建案詳情頁面
- [x] 聯絡表單（必填預設值）
- [x] 隱私權政策 + 免責聲明連結

### ✅ 後台功能
- [x] 登入系統 (OAuth + Magic Link 架構)
- [x] 內容管理架構
- [x] 部署控制
- [x] GA4 事件追蹤

### ✅ 技術需求
- [x] React + React Router + TypeScript
- [x] Tailwind CSS + Framer Motion
- [x] Serverless Functions (Netlify)
- [x] SEO 優化 (sitemap, robots.txt, meta)
- [x] 安全性 (JWT + HttpOnly Cookie)

### ✅ 法規合規
- [x] 完整隱私權政策
- [x] 免責聲明
- [x] Cookie 政策說明
- [x] 個資權利保護
- [x] GA4 不含 PII