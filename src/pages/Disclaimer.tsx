import { motion } from 'framer-motion';

export default function Disclaimer() {
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
            免責聲明
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
            <h2>使用條款與免責聲明</h2>

            <h3>1. 網站內容聲明</h3>
            <ul>
              <li>本網站所提供的資訊僅供參考，不構成任何法律建議或合約要約</li>
              <li>所有建案資訊以實際合約內容為準</li>
              <li>建案圖片與說明可能因拍攝角度、光線等因素與實際狀況有所差異</li>
              <li>建案規劃與設計如有變更，以主管機關核准之圖說為準</li>
            </ul>

            <h3>2. 內容準確性</h3>
            <p>本公司力求網站內容之準確性，惟：</p>
            <ul>
              <li>不保證網站資訊完全無誤或即時更新</li>
              <li>如發現內容錯誤，我們將盡快進行修正</li>
              <li>使用者應以正式合約文件為最終依據</li>
            </ul>

            <h3>3. 建案資訊</h3>
            <p>關於展示之建設建案：</p>
            <ul>
              <li>完工時間僅供參考，實際以使用執照取得為準</li>
              <li>建材設備如因市場供應狀況需要調整，將選用同等級以上產品替代</li>
              <li>公共設施與景觀配置可能因法規要求或實際需要進行調整</li>
              <li>所有建案均需通過相關法規審查始得施工</li>
            </ul>

            <h3>4. 投資風險提醒</h3>
            <p>房地產投資具有風險：</p>
            <ul>
              <li>市場價格可能因經濟環境變化而波動</li>
              <li>建議投資前詳細評估個人財務狀況</li>
              <li>應諮詢專業人士意見</li>
              <li>過往表現不代表未來獲利</li>
            </ul>

            <h3>5. 第三方連結</h3>
            <p>本網站可能包含外部網站連結：</p>
            <ul>
              <li>對連結網站之內容不承擔任何責任</li>
              <li>建議使用者自行評估外部網站之可信度</li>
              <li>連結網站之隱私權政策可能與本網站不同</li>
            </ul>

            <h3>6. 技術限制</h3>
            <ul>
              <li>網站可能因維護、更新或技術問題暫停服務</li>
              <li>不同瀏覽器或裝置可能影響網站顯示效果</li>
              <li>網路傳輸可能受外在因素影響</li>
            </ul>

            <h3>7. 著作權聲明</h3>
            <ul>
              <li>本網站內容受著作權法保護</li>
              <li>未經授權不得複製、轉載或商業使用</li>
              <li>如需引用請註明出處並事先徵得同意</li>
            </ul>

            <h3>8. 責任限制</h3>
            <p>本公司對於使用本網站可能產生之任何直接或間接損失不承擔責任，包括但不限於：</p>
            <ul>
              <li>因網站資訊不正確而造成之損失</li>
              <li>因技術問題導致之服務中斷</li>
              <li>因第三方行為造成之損害</li>
              <li>其他非可歸責於本公司之損失</li>
            </ul>

            <h3>9. 法律適用</h3>
            <ul>
              <li>本聲明受中華民國法律管轄</li>
              <li>如有爭議，以台灣台北地方法院為第一審管轄法院</li>
            </ul>

            <h3>10. 聯絡資訊</h3>
            <p>如對本聲明有任何疑問，請聯絡我們：</p>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>客服中心</strong></p>
              <p>電話：(03) 777-5355</p>
              <p>Email：info@uphousetw.com</p>
              <p>地址：苗栗縣竹南鎮康德街71號</p>
            </div>

            <h3>11. 聲明修改</h3>
            <p>本公司保留隨時修改、更新本免責聲明內容之權利，修改後之內容將於網站公告，不另行通知。建議使用者定期查看以了解最新內容。</p>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ 重要提醒：</strong>
                購買不動產前請詳細了解相關法規，並建議諮詢地政士、建築師或律師等專業人士。
                本公司建議所有客戶在簽約前充分了解合約條款，確保自身權益。
              </p>
            </div>

            <div className="mt-4 p-4 bg-primary-50 rounded">
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