import { useState } from 'react';
import { motion } from 'framer-motion';

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  project: '透天' | '華廈' | '電梯大樓' | '其他';
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    phone: '',
    email: '',
    project: '電梯大樓',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedFields, setFocusedFields] = useState<Set<string>>(new Set());

  const defaultValues = {
    name: '王大名',
    phone: '0932-123456',
    email: 'example@mail.com',
    message: '您好，我想了解電梯大樓建案評估。'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFocus = (fieldName: string) => {
    setFocusedFields(prev => new Set(prev).add(fieldName));
  };

  const getDisplayValue = (fieldName: keyof typeof defaultValues, currentValue: string) => {
    if (currentValue || focusedFields.has(fieldName)) {
      return currentValue;
    }
    return defaultValues[fieldName];
  };

  const getInputClassName = (fieldName: keyof typeof defaultValues, currentValue: string) => {
    const baseClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors";
    if (!currentValue && !focusedFields.has(fieldName)) {
      return `${baseClasses} text-gray-400`;
    }
    return baseClasses;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare form data with actual values (not display values)
    const submitData = {
      name: form.name || defaultValues.name,
      phone: form.phone || defaultValues.phone,
      email: form.email || defaultValues.email,
      project: form.project,
      message: form.message || defaultValues.message
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccess(true);

        // Reset form
        setForm({
          name: '',
          phone: '',
          email: '',
          project: '電梯大樓',
          message: ''
        });
        setFocusedFields(new Set());

        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        console.error('Form submission failed:', data);
        // You could set an error state here to show error message to user
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // You could set an error state here to show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            聯絡我們
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            準備開始您的建設項目？聯絡我們的專業團隊
          </p>
          <div className="w-24 h-1 bg-primary-600 mx-auto mt-6"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                聯絡表單
              </h2>


              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓名／公司 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={getDisplayValue('name', form.name)}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    required
                    className={getInputClassName('name', form.name)}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={getDisplayValue('phone', form.phone)}
                    onChange={handleChange}
                    onFocus={() => handleFocus('phone')}
                    required
                    className={getInputClassName('phone', form.phone)}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email （選填）
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={getDisplayValue('email', form.email)}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    className={getInputClassName('email', form.email)}
                  />
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    專案項目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="project"
                    value={form.project}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="透天">透天</option>
                    <option value="華廈">華廈</option>
                    <option value="電梯大樓">電梯大樓</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    訊息 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={getDisplayValue('message', form.message)}
                    onChange={handleChange}
                    onFocus={() => handleFocus('message')}
                    required
                    rows={5}
                    className={`${getInputClassName('message', form.message)} resize-vertical`}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      送出中...
                    </span>
                  ) : '送出訊息'}
                </button>

                {/* Success Message */}
                {showSuccess && (
                  <motion.div
                    className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium">感謝您的來信！</p>
                        <p className="text-sm text-green-700">我們會盡快與您聯絡，通常在 24 小時內回覆。</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>

          {/* Contact Info & Map */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Contact Information */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                聯絡資訊
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 text-primary-600 mr-3 mt-1">
                    📍
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">地址</p>
                    <p className="text-gray-600">台北市中正區範例路123號</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 text-primary-600 mr-3 mt-1">
                    📞
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">電話</p>
                    <p className="text-gray-600">(02) 2345-6789</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 text-primary-600 mr-3 mt-1">
                    📧
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">info@example.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 text-primary-600 mr-3 mt-1">
                    ⏰
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">營業時間</p>
                    <p className="text-gray-600">週一至週五 9:00 - 18:00</p>
                    <p className="text-gray-600">週六 9:00 - 12:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Placeholder */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                位置地圖
              </h3>
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>Google Map</p>
                  <p className="text-sm">（此處將嵌入實際地圖）</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Privacy Notice */}
        <motion.div
          className="mt-12 bg-gray-50 p-6 rounded-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            個人資料使用說明
          </h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            您所提供的個人資料將僅用於回覆您的諮詢需求與提供專案資訊。我們承諾保護您的個人隱私，
            不會將您的資料用於其他目的或提供給第三方。詳細的隱私權政策請參考我們的
            <a href="/privacy" className="text-primary-600 hover:text-primary-700 mx-1">隱私權政策</a>
            頁面。
          </p>
        </motion.div>
      </div>
    </div>
  );
}