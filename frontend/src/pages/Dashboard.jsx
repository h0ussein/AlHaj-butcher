import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import worker1 from '../assets/worker1.jpg';
import worker2 from '../assets/worker2.jpg';
import workImg1 from '../assets/some_of_our_work1 (1).jpg';
import workImg2 from '../assets/some_of_our_work1 (2).jpg';
import workImg3 from '../assets/some_of_our_work1 (3).jpg';
import workImg4 from '../assets/some_of_our_work1 (4).jpg';
import workImg5 from '../assets/some_of_our_work1 (5).jpg';
import workImg6 from '../assets/some_of_our_work1 (6).jpg';
import workImg7 from '../assets/some_of_our_work1 (7).jpg';

const Dashboard = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '🥩',
      title: language === 'ar' ? 'لحم طازج' : 'Fresh Meat',
      description: language === 'ar' ? 'نقدم أجود أنواع اللحوم الطازجة يومياً' : 'We provide the finest fresh meat daily'
    },
    {
      icon: '🚚',
      title: language === 'ar' ? 'توصيل سريع' : 'Fast Delivery',
      description: language === 'ar' ? 'خدمة توصيل سريعة وموثوقة' : 'Fast and reliable delivery service'
    },
    {
      icon: '⭐',
      title: language === 'ar' ? 'جودة عالية' : 'High Quality',
      description: language === 'ar' ? 'نضمن جودة منتجاتنا ورضا عملائنا' : 'We guarantee quality products and customer satisfaction'
    },
    {
      icon: '💰',
      title: language === 'ar' ? 'أسعار مناسبة' : 'Fair Prices',
      description: language === 'ar' ? 'أسعار تنافسية ومناسبة للجميع' : 'Competitive and affordable prices for everyone'
    }
  ];

  const works = [workImg1, workImg2, workImg3, workImg4, workImg5, workImg6, workImg7];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          {t('welcome')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {language === 'ar' 
            ? 'نقدم أجود أنواع اللحوم الطازجة مع خدمة مميزة وتوصيل سريع'
            : 'We provide the finest fresh meat with exceptional service and fast delivery'
          }
        </p>
        
        {!isAuthenticated ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-red-700 transition-colors"
            >
              {t('register')} & {t('startOrdering')}
            </Link>
            <Link
              to="/login"
              className="border-2 border-red-600 text-red-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-red-50 transition-colors"
            >
              {t('login')}
            </Link>
          </div>
        ) : (
          <Link
            to="/products"
            className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-red-700 transition-colors inline-block"
          >
            {t('startOrdering')}
          </Link>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      

      {/* Professional Team Section */}
      <section className="bg-gray-50 rounded-lg p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {language === 'ar' ? 'فريق العمل المحترف' : 'Our Professional Butchers'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Worker 1 card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-64 w-full overflow-hidden">
              <img src={worker1} alt={language === 'ar' ? 'العامل 1' : 'Worker 1'} className="w-full h-full " />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {language === 'ar' ? 'خبرة عالية' : 'High Expertise'}
              </h3>
              <p className="text-gray-600">
                {language === 'ar'
                  ? 'لدينا فريق محترف بخبرة سنوات في اختيار وتقطيع اللحوم بأعلى معايير الجودة.'
                  : 'Our team has years of experience selecting and cutting meats to the highest standards.'}
              </p>
            </div>
          </div>

          {/* Worker 2 card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-64 w-full overflow-hidden">
              <img src={worker2} alt={language === 'ar' ? 'العامل 2' : 'Worker 2'} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {language === 'ar' ? 'نظافة ودقة' : 'Cleanliness & Precision'}
              </h3>
              <p className="text-gray-600">
                {language === 'ar'
                  ? 'نلتزم بالنظافة والدقة في كل خطوة لضمان تجربة مميزة.'
                  : 'We ensure cleanliness and precision in every step to deliver an exceptional experience.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Work Gallery */}
      <section id="our-work" className="bg-white rounded-lg shadow-md p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {language === 'ar' ? 'بعض أعمالنا' : 'Some of Our Work'}
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
          {language === 'ar'
            ? 'مجموعة من أعمالنا المنفذة بعناية وفق أعلى معايير الجودة.'
            : 'A selection of our carefully executed work, crafted to the highest standards of quality.'}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          {works.map((src, idx) => (
            <div
              key={idx}
              className="group overflow-hidden rounded-xl bg-gray-50 shadow hover:shadow-xl transition-shadow fade-in-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="h-24 sm:h-40 lg:h-64 w-full overflow-hidden">
                <img
                  src={src}
                  alt={language === 'ar' ? `صورة عمل رقم ${idx + 1}` : `Work photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {t('aboutUs')}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              {language === 'ar' 
                ? 'نحن متجر جزارة عائلي متخصص في تقديم أجود أنواع اللحوم الطازجة منذ أكثر من 30 عاماً. نلتزم بتقديم منتجات عالية الجودة مع خدمة عملاء مميزة.'
                : 'We are a family-owned butcher shop specializing in providing the finest fresh meat for over 30 years. We are committed to delivering high-quality products with exceptional customer service.'
              }
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              {language === 'ar' 
                ? 'نقدم مجموعة واسعة من اللحوم الطازجة، من اللحم البقري مع ضمان الجودة والطزاجة في كل طلب.'
                : 'We offer a wide range of fresh meat ensuring quality and freshness in every order.'
              }
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🥩</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('freshMeat')}
            </h3>
            <p className="text-gray-600">
              {language === 'ar' 
                ? 'نحصل على اللحوم الطازجة يومياً من أفضل المزارع المحلية'
                : 'We source fresh meat daily from the best local farms'
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Language Selection Reminder */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {t('selectLanguage')}
          </h3>
          <p className="text-blue-700">
            {language === 'ar' 
              ? 'يمكنك تغيير اللغة في أي وقت من خلال القائمة العلوية'
              : 'You can change the language anytime using the top menu'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
