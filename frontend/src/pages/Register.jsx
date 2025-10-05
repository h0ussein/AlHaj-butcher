import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    countryCode: '+961'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = language === 'ar' ? 'الاسم الأول مطلوب' : 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = language === 'ar' ? 'الاسم الأخير مطلوب' : 'Last name is required';
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = language === 'ar' ? 'اسم الأب مطلوب' : 'Father\'s name is required';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
    }

    // Password validation: at least 8 characters, one number, one symbol
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = language === 'ar'
        ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على رقم ورمز'
        : 'Password must be at least 8 characters and include a number and a symbol';
    }

    // Mobile number validation based on country code
    let mobileRegex;
    if (formData.countryCode === '+961') {
      // Lebanese mobile: 7-8 digits after country code
      mobileRegex = /^[0-9]{7,8}$/;
      if (!mobileRegex.test(formData.mobile)) {
        newErrors.mobile = language === 'ar' ? 'رقم الهاتف اللبناني غير صحيح (7-8 أرقام)' : 'Invalid Lebanese mobile number (7-8 digits)';
      }
    } else {
      // General validation for other countries
      mobileRegex = /^[0-9]{7,15}$/;
      if (!mobileRegex.test(formData.mobile)) {
        newErrors.mobile = language === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid mobile number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setShowResendOption(false);

    const { confirmPassword, countryCode, ...userData } = formData;
    // Combine country code with mobile number
    userData.mobile = countryCode + userData.mobile;
    const result = await register(userData);
    
    if (result.success) {
      // Redirect to dashboard after successful registration (user is auto-logged in)
      navigate('/');
    }
    
    setLoading(false);
  };


  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {t('register')}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ar' ? 'الاسم الأول' : 'First Name'}
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'ar' ? 'أدخل اسمك الأول' : 'Enter your first name'}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ar' ? 'الاسم الأخير' : 'Last Name'}
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'ar' ? 'أدخل اسمك الأخير' : 'Enter your last name'}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'ar' ? 'اسم الأب' : 'Father\'s Name'}
            </label>
            <input
              type="text"
              id="fatherName"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.fatherName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'ar' ? 'أدخل اسم الأب' : 'Enter your father\'s name'}
            />
            {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
              {t('mobile')}
            </label>
            <div className="flex">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
              >
                <option value="+961">🇱🇧 +961</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+20">🇪🇬 +20</option>
                <option value="+90">🇹🇷 +90</option>
                <option value="+39">🇮🇹 +39</option>
                <option value="+34">🇪🇸 +34</option>
                <option value="+31">🇳🇱 +31</option>
                <option value="+32">🇧🇪 +32</option>
                <option value="+41">🇨🇭 +41</option>
                <option value="+43">🇦🇹 +43</option>
                <option value="+45">🇩🇰 +45</option>
                <option value="+46">🇸🇪 +46</option>
                <option value="+47">🇳🇴 +47</option>
                <option value="+358">🇫🇮 +358</option>
                <option value="+7">🇷🇺 +7</option>
                <option value="+86">🇨🇳 +86</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+82">🇰🇷 +82</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+92">🇵🇰 +92</option>
                <option value="+93">🇦🇫 +93</option>
                <option value="+98">🇮🇷 +98</option>
                <option value="+972">🇮🇱 +972</option>
                <option value="+974">🇶🇦 +974</option>
                <option value="+965">🇰🇼 +965</option>
                <option value="+973">🇧🇭 +973</option>
                <option value="+968">🇴🇲 +968</option>
                <option value="+964">🇮🇶 +964</option>
                <option value="+963">🇸🇾 +963</option>
                <option value="+962">🇯🇴 +962</option>
                <option value="+970">🇵🇸 +970</option>
                <option value="+212">🇲🇦 +212</option>
                <option value="+213">🇩🇿 +213</option>
                <option value="+216">🇹🇳 +216</option>
                <option value="+218">🇱🇾 +218</option>
                <option value="+220">🇬🇲 +220</option>
                <option value="+221">🇸🇳 +221</option>
                <option value="+222">🇲🇷 +222</option>
                <option value="+223">🇲🇱 +223</option>
                <option value="+224">🇬🇳 +224</option>
                <option value="+225">🇨🇮 +225</option>
                <option value="+226">🇧🇫 +226</option>
                <option value="+227">🇳🇪 +227</option>
                <option value="+228">🇹🇬 +228</option>
                <option value="+229">🇧🇯 +229</option>
                <option value="+230">🇲🇺 +230</option>
                <option value="+231">🇱🇷 +231</option>
                <option value="+232">🇸🇱 +232</option>
                <option value="+233">🇬🇭 +233</option>
                <option value="+234">🇳🇬 +234</option>
                <option value="+235">🇹🇩 +235</option>
                <option value="+236">🇨🇫 +236</option>
                <option value="+237">🇨🇲 +237</option>
                <option value="+238">🇨🇻 +238</option>
                <option value="+239">🇸🇹 +239</option>
                <option value="+240">🇬🇶 +240</option>
                <option value="+241">🇬🇦 +241</option>
                <option value="+242">🇨🇬 +242</option>
                <option value="+243">🇨🇩 +243</option>
                <option value="+244">🇦🇴 +244</option>
                <option value="+245">🇬🇼 +245</option>
                <option value="+246">🇮🇴 +246</option>
                <option value="+248">🇸🇨 +248</option>
                <option value="+249">🇸🇩 +249</option>
                <option value="+250">🇷🇼 +250</option>
                <option value="+251">🇪🇹 +251</option>
                <option value="+252">🇸🇴 +252</option>
                <option value="+253">🇩🇯 +253</option>
                <option value="+254">🇰🇪 +254</option>
                <option value="+255">🇹🇿 +255</option>
                <option value="+256">🇺🇬 +256</option>
                <option value="+257">🇧🇮 +257</option>
                <option value="+258">🇲🇿 +258</option>
                <option value="+260">🇿🇲 +260</option>
                <option value="+261">🇲🇬 +261</option>
                <option value="+262">🇷🇪 +262</option>
                <option value="+263">🇿🇼 +263</option>
                <option value="+264">🇳🇦 +264</option>
                <option value="+265">🇲🇼 +265</option>
                <option value="+266">🇱🇸 +266</option>
                <option value="+267">🇧🇼 +267</option>
                <option value="+268">🇸🇿 +268</option>
                <option value="+269">🇰🇲 +269</option>
                <option value="+290">🇸🇭 +290</option>
                <option value="+291">🇪🇷 +291</option>
                <option value="+297">🇦🇼 +297</option>
                <option value="+298">🇫🇴 +298</option>
                <option value="+299">🇬🇱 +299</option>
                <option value="+350">🇬🇮 +350</option>
                <option value="+351">🇵🇹 +351</option>
                <option value="+352">🇱🇺 +352</option>
                <option value="+353">🇮🇪 +353</option>
                <option value="+354">🇮🇸 +354</option>
                <option value="+355">🇦🇱 +355</option>
                <option value="+356">🇲🇹 +356</option>
                <option value="+357">🇨🇾 +357</option>
                <option value="+358">🇫🇮 +358</option>
                <option value="+359">🇧🇬 +359</option>
                <option value="+370">🇱🇹 +370</option>
                <option value="+371">🇱🇻 +371</option>
                <option value="+372">🇪🇪 +372</option>
                <option value="+373">🇲🇩 +373</option>
                <option value="+374">🇦🇲 +374</option>
                <option value="+375">🇧🇾 +375</option>
                <option value="+376">🇦🇩 +376</option>
                <option value="+377">🇲🇨 +377</option>
                <option value="+378">🇸🇲 +378</option>
                <option value="+380">🇺🇦 +380</option>
                <option value="+381">🇷🇸 +381</option>
                <option value="+382">🇲🇪 +382</option>
                <option value="+383">🇽🇰 +383</option>
                <option value="+385">🇭🇷 +385</option>
                <option value="+386">🇸🇮 +386</option>
                <option value="+387">🇧🇦 +387</option>
                <option value="+389">🇲🇰 +389</option>
                <option value="+420">🇨🇿 +420</option>
                <option value="+421">🇸🇰 +421</option>
                <option value="+423">🇱🇮 +423</option>
                <option value="+500">🇫🇰 +500</option>
                <option value="+501">🇧🇿 +501</option>
                <option value="+502">🇬🇹 +502</option>
                <option value="+503">🇸🇻 +503</option>
                <option value="+504">🇭🇳 +504</option>
                <option value="+505">🇳🇮 +505</option>
                <option value="+506">🇨🇷 +506</option>
                <option value="+507">🇵🇦 +507</option>
                <option value="+508">🇵🇲 +508</option>
                <option value="+509">🇭🇹 +509</option>
                <option value="+590">🇬🇵 +590</option>
                <option value="+591">🇧🇴 +591</option>
                <option value="+592">🇬🇾 +592</option>
                <option value="+593">🇪🇨 +593</option>
                <option value="+594">🇬🇫 +594</option>
                <option value="+595">🇵🇾 +595</option>
                <option value="+596">🇲🇶 +596</option>
                <option value="+597">🇸🇷 +597</option>
                <option value="+598">🇺🇾 +598</option>
                <option value="+599">🇧🇶 +599</option>
                <option value="+670">🇹🇱 +670</option>
                <option value="+672">🇦🇶 +672</option>
                <option value="+673">🇧🇳 +673</option>
                <option value="+674">🇳🇷 +674</option>
                <option value="+675">🇵🇬 +675</option>
                <option value="+676">🇹🇴 +676</option>
                <option value="+677">🇸🇧 +677</option>
                <option value="+678">🇻🇺 +678</option>
                <option value="+679">🇫🇯 +679</option>
                <option value="+680">🇵🇼 +680</option>
                <option value="+681">🇼🇫 +681</option>
                <option value="+682">🇨🇰 +682</option>
                <option value="+683">🇳🇺 +683</option>
                <option value="+684">🇦🇸 +684</option>
                <option value="+685">🇼🇸 +685</option>
                <option value="+686">🇰🇮 +686</option>
                <option value="+687">🇳🇨 +687</option>
                <option value="+688">🇹🇻 +688</option>
                <option value="+689">🇵🇫 +689</option>
                <option value="+690">🇹🇰 +690</option>
                <option value="+691">🇫🇲 +691</option>
                <option value="+692">🇲🇭 +692</option>
                <option value="+850">🇰🇵 +850</option>
                <option value="+852">🇭🇰 +852</option>
                <option value="+853">🇲🇴 +853</option>
                <option value="+855">🇰🇭 +855</option>
                <option value="+856">🇱🇦 +856</option>
                <option value="+880">🇧🇩 +880</option>
                <option value="+886">🇹🇼 +886</option>
                <option value="+960">🇲🇻 +960</option>
                <option value="+961">🇱🇧 +961</option>
                <option value="+962">🇯🇴 +962</option>
                <option value="+963">🇸🇾 +963</option>
                <option value="+964">🇮🇶 +964</option>
                <option value="+965">🇰🇼 +965</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+967">🇾🇪 +967</option>
                <option value="+968">🇴🇲 +968</option>
                <option value="+970">🇵🇸 +970</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+972">🇮🇱 +972</option>
                <option value="+973">🇧🇭 +973</option>
                <option value="+974">🇶🇦 +974</option>
                <option value="+975">🇧🇹 +975</option>
                <option value="+976">🇲🇳 +976</option>
                <option value="+977">🇳🇵 +977</option>
                <option value="+992">🇹🇯 +992</option>
                <option value="+993">🇹🇲 +993</option>
                <option value="+994">🇦🇿 +994</option>
                <option value="+995">🇬🇪 +995</option>
                <option value="+996">🇰🇬 +996</option>
                <option value="+998">🇺🇿 +998</option>
              </select>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                className={`flex-1 px-3 py-2 border border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.mobile ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
              />
            </div>
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t('confirmPassword')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'ar' ? 'أكد كلمة المرور' : 'Confirm your password'}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('loading') : t('register')}
          </button>
        </form>


        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
