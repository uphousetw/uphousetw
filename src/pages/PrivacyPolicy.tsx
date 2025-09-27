import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            隱私權政策
          </h1>
          <div className="w-24 h-1 bg-primary-600 mx-auto"></div>
        </motion.div>

        <motion.div
          className="prose prose-lg max-w-none"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2>個人資料保護政策</h2>

            <h3>1. 個資蒐集範圍</h3>
            <p>本公司透過聯絡表單蒐集以下個人資料：</p>
            <ul>
              <li>姓名或公司名稱（必填）</li>
              <li>聯絡電話（必填）</li>
              <li>電子信箱（選填）</li>
              <li>專案需求資訊（必填）</li>
            </ul>

            <h3>2. 蒐集目的</h3>
            <p>蒐集您的個人資料主要用於：</p>
            <ul>
              <li>回覆您的諮詢需求</li>
              <li>提供建設專案相關資訊</li>
              <li>後續專案評估與報價服務</li>
              <li>客戶服務與售後支援</li>
            </ul>

            <h3>3. 資料保存方式</h3>
            <p>您的個人資料將：</p>
            <ul>
              <li>保存於本公司內部系統的 JSON 檔案中</li>
              <li>同時透過電子信件通知相關承辦人員</li>
              <li>僅限內部授權人員存取使用</li>
              <li>採用加密傳輸（HTTPS）確保資料安全</li>
            </ul>

            <h3>4. 保存期間</h3>
            <p>個人資料自收到日起保存 5 年，期滿後即予刪除。若有持續業務往來需求，將另行徵得您的同意。</p>

            <h3>5. 資訊安全措施</h3>
            <ul>
              <li>網站採用 HTTPS 加密傳輸協定</li>
              <li>限制授權人員方可存取個人資料</li>
              <li>定期備份與資料安全檢查</li>
              <li>建立存取紀錄與異常監控機制</li>
            </ul>

            <h3>6. 您的權利</h3>
            <p>依據《個人資料保護法》，您享有以下權利：</p>
            <ul>
              <li>查詢或請求閱覽您的個人資料</li>
              <li>請求製給複製本</li>
              <li>請求補充或更正資料內容</li>
              <li>請求停止蒐集、處理或利用</li>
              <li>請求刪除個人資料</li>
            </ul>

            <h3>7. Cookie 使用說明</h3>
            <p>本網站使用情況：</p>
            <ul>
              <li>前台：僅使用必要的技術性 Cookie，無需同意</li>
              <li>後台：使用 HttpOnly Cookie 作為管理員登入憑證</li>
              <li>分析工具：使用 Google Analytics 4，僅收集匿名統計資料</li>
            </ul>

            <h3>8. 聯絡窗口</h3>
            <p>如您對個人資料處理有任何疑問或希望行使上述權利，請聯絡我們：</p>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>個資查詢專責窗口</strong></p>
              <p>電話：(02) 2345-6789</p>
              <p>Email：privacy@example.com</p>
              <p>地址：台北市中正區範例路123號</p>
            </div>

            <h3>9. 政策更新</h3>
            <p>本隱私權政策如有修訂，將於本網站公告。建議您定期查看以了解最新內容。</p>

            <div className="mt-8 p-4 bg-primary-50 rounded">
              <p className="text-sm text-primary-800">
                <strong>最後更新日期：</strong>2025年1月
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}