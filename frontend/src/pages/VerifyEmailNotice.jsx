import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const VerifyEmailNotice = () => {
  const [resendLoading, setResendLoading] = useState(false);
  const { language } = useLanguage();
  const location = useLocation();
  
  // Get email from URL params or state
  const urlParams = new URLSearchParams(location.search);
  const email = urlParams.get('email') || '';

  const handleResendVerification = async () => {
    if (!email) {
      alert(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني أولاً' : 'Please enter your email first');
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(language === 'ar' ? 'تم إرسال رابط التحقق بنجاح!' : 'Verification email sent successfully!');
      } else {
        alert(data.message || (language === 'ar' ? 'خطأ في إرسال رابط التحقق' : 'Error sending verification email'));
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      alert(language === 'ar' ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8 text-center">
      <h2 className="text-xl font-semibold mb-4">
        {language === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check your email'}
      </h2>
      <p className="text-gray-700">
        {language === 'ar' 
          ? 'أرسلنا لك رابط التحقق. يرجى التحقق من بريدك الإلكتروني لإكمال التسجيل.' 
          : 'We sent you a verification link. Please verify your email to complete registration.'
        }
      </p>
      <p className="text-gray-500 mt-2">
        {language === 'ar' 
          ? 'إذا لم تجد الرسالة، تحقق من مجلد الرسائل المزعجة.' 
          : 'If you don\'t see the email, check Spam.'
        }
      </p>
      
      {email && (
        <button
          onClick={handleResendVerification}
          disabled={resendLoading}
          className="w-full mt-4 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors"
        >
          {resendLoading 
            ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...')
            : (language === 'ar' ? 'إعادة إرسال رابط التحقق' : 'Resend Verification Email')
          }
        </button>
      )}
      
      <Link to="/login" className="inline-block mt-6 text-red-600 hover:text-red-700">
        {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
      </Link>
    </div>
  );
};

export default VerifyEmailNotice;


