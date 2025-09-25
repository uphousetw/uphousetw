# 📄 產品需求文件（PRD — Final + 法務規範）

## 1. 專案簡介
- **產品名稱**：建設公司 Portfolio 網站  
- **目標**：  
  - 展示公司專業形象與專案案例  
  - 提供潛在客戶聯絡管道  
  - 提供內部管理者後台以維護內容與部署  
  - 符合法規要求，確保個資保護  

- **主要角色**：
  - **訪客（潛在客戶）**：瀏覽公司資訊與專案，提交聯絡表單  
  - **編輯者**：後台新增／編輯專案與「關於我們」  
  - **管理者**：後台全權管理、使用者登入、部署  
  - **法務／合規人員**：審視網站個資蒐集、隱私與免責聲明  

---

## 2. 功能需求

### 2.1 前台
- **首頁 Home**  
  - Hero 區塊（品牌標語＋主要 CTA）  
  - 公司服務／優勢（3 欄）  
  - 精選專案（3–6 個卡片）  
  - 收尾 CTA（引導聯絡）  

- **關於我們 About**  
  - 公司簡介（1–2 段）  
  - 品牌理念（3–5 條）  
  - 里程碑時間軸（可選）  

- **專案列表 Projects**  
  - 專案卡片：封面、標題、類別、年份、摘要  
  - 篩選：類別（透天／華廈／電梯大樓／其他）、年份  
  - 排序：最新／已完工優先  

- **專案內頁 Project Detail**  
  - 單一封面圖  
  - Facts（地點、年份、類別、完工日）  
  - 正文（1–3 段）  

- **聯絡我們 Contact**  
  - 表單欄位：  
    - 姓名／公司（必填，預設「王大名」）  
    - 電話（必填，預設「0932-123456」）  
    - Email（選填，預設「example@mail.com」）  
    - 專案項目（必填，下拉選單，預設「電梯大樓」）  
    - 訊息（必填，預設「您好，我想了解電梯大樓建案評估。」）  
  - 成功送出後顯示提示訊息  
  - 公司地址與 Google Map  
  - **法務條款連結**：頁尾固定顯示「隱私權政策」、「免責聲明」  

---

### 2.2 後台（/admin）
- **登入**
  - Google OAuth（白名單 Email）✅ **已實作**
    - 支援 Google 帳號登入
    - 管理員 Email 白名單驗證
    - JWT Token 認證機制
    - 自動重新導向流程
  - Email Magic Link ⚠️ **基礎架構完成**  

- **內容管理**
  - 專案管理（新增／編輯／刪除）  
  - 關於我們管理（intro、principles、milestones）  

- **系統功能**
  - 部署控制：一鍵重新部署  
  - 聯絡箱：顯示來信（僅讀／匯出 CSV）  
  - **GA4 追蹤**：所有後台操作紀錄事件（登入、CRUD、部署、錯誤）  

---

## 3. 資料模型（JSON）

### Project
```json
{
  "slug": "default-project",
  "title": "範例建案",
  "category": "透天",
  "year": 2025,
  "location": "台北市中正區",
  "summary": "這是一個範例專案，用來測試專案新增與展示功能。",
  "coverUrl": "https://cdn.example.com/projects/default-cover.jpg",
  "facts": {
    "地點": "台北市中正區",
    "類別": "透天",
    "年份": "2025",
    "完工日": "2099-12-31"
  },
  "body": "這裡是專案內文範例，描述建案特色與亮點。"
}

{
  "title": "關於我們",
  "intro": "本公司專注於住宅與商辦建設，致力於品質、安全與準時交付。",
  "principles": ["品質與安全", "準時交付", "透明溝通"],
  "milestones": [
    { "year": 2019, "event": "公司成立" }
  ]
}
ContactMessage
{
  "name": "王大名",
  "phone": "0932-123456",
  "email": "example@mail.com",
  "project": "電梯大樓",
  "message": "您好，我想了解電梯大樓建案評估。",
  "createdAt": "2025-09-24T08:00:00Z"
}

4. 技術需求
前端

React + React Router（SPA）

Tailwind CSS（設計系統）

Framer Motion（互動效果）

SEO：自動 sitemap、robots.txt、meta title/description

後端

Serverless Functions（Netlify 或等效平台）

模組：

Auth（Google OAuth ✅ 已實作、Email Magic Link ⚠️ 基礎架構）
  - `/.netlify/functions/auth` - 主要認證端點
  - `/.netlify/functions/auth-callback` - Google OAuth 回調處理
  - 使用 google-auth-library 套件
  - JWT Token 產生與驗證
  - 管理員白名單檢查

Content CRUD（專案／關於我們 JSON）

Upload（圖片簽名直傳）

Deploy（Build Hook）

Contact（Email 通知 + JSON 備份）

Analytics（GA4 事件上報 via gtag.js + Measurement Protocol）

儲存

JSON/Markdown → Git repo

圖片 → Cloudinary 或 S3 相容物件儲存

安全

JWT 存於 HttpOnly Cookie

權限：Admin（全權）、Editor（內容編輯）

上傳限制檔案大小／格式（僅圖片）

不將 PII（如電話、email）傳送至 GA4

## 📋 Google OAuth 設定需求

### 環境變數
以下環境變數需要在 Netlify 和本地開發環境中設定：

```env
# Google OAuth 認證
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 管理員白名單（必填）
ADMIN_EMAILS=admin@company.com,manager@company.com

# JWT 密鑰
JWT_SECRET=your-secure-jwt-secret
```

### Google Cloud Console 設定
1. 建立 Google Cloud 專案
2. 啟用 Google+ API 和 People API
3. 建立 OAuth 2.0 憑證
4. 設定授權重新導向 URI：
   - 開發：`http://localhost:5173/.netlify/functions/auth-callback`
   - 生產：`https://your-domain.com/.netlify/functions/auth-callback`

詳細設定說明請參考 `GOOGLE_OAUTH_SETUP.md`

5. 後台 GA4 事件規格

登入：admin_login（參數：method, result）

登出：admin_logout

CRUD：admin_action（參數：action, entity, entity_id, status, category, year）

上傳：admin_upload（file_type, size_kb, status）

部署：admin_deploy_triggered / admin_deploy_result（status, build_id）

錯誤：admin_error（where, code, message）

6. 法務規範（必須在網站顯示）
6.1 隱私權政策（Privacy Policy）

個資蒐集範圍：姓名／公司、電話、Email（選填）、專案需求

蒐集目的：回覆客戶需求、提供專案資訊

保存方式：

聯絡表單紀錄將保存於系統 JSON 檔案並寄送通知信

僅限內部授權人員使用

保存期間：自收到日起 5 年，期滿即刪除

資訊安全：使用加密傳輸（HTTPS），限制授權人員存取

用戶權利：可依《個資法》要求查詢、更正或刪除個資，並透過聯絡窗口行使權利

6.2 Cookie 政策

前台僅使用必要 Cookie（登入無需 Cookie）

後台使用 JWT HttpOnly Cookie 作為登入憑證

分析工具：前台 GA4、後台 GA4（僅收集匿名事件，不含個資）

6.3 免責聲明

本網站內容僅供參考，不構成法律或合約要約

本公司保留隨時修改、更新內容之權利

6.4 聯絡資訊

公司地址

電話

Email（選填）

隱私權與個資查詢專責窗口

7. 非功能性需求

效能：桌機首屏 < 2 秒，圖片 lazy loading

SEO：結構化資料（Organization、Project）

維護性：Git 版本控制內容

部署：Netlify（前端 + Functions）；自動 redeploy

監控：API error log、GA4 事件、表單 JSON 備份

8. 成功標準

專案類別固定：透天／華廈／電梯大樓／其他

專案 Facts 使用「完工日」而非工期

聯絡表單：電話必填、Email 選填、專案項目必填

所有必填欄位皆有預設值（避免空白送出）

/admin GA4 正常記錄事件，且不含個資

隱私權政策、免責聲明能在頁尾連結存取
