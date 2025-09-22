"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

interface Translation {
  logoText: string;
  heroTitle: string;
  heroDesc: string;
  login: string;
  createEvent: string;
  upcomingEvents: string;
  events: string;
  filters: string[];
  months: string[];
  about: string;
  contact: string;
  follow: string;
  copyright: string;
  eventTitles: string[];
  eventDescriptions: string[];
  filterByMonth: string;
  allFilters: string;
  email: string;
  password: string;
  eventTitle: string;
  date: string;
  category: string;
  description: string;
  eventImage: string;
  uploadImage: string;
  selectCategory: string;
  createNewEvent: string;
}

const translations: Record<string, Translation> = {
  en: {
    logoText: "EventMaster",
    heroTitle: "Discover Amazing Events",
    heroDesc: "Find and create events that match your interests. Connect with people and enjoy unique experiences.",
    login: "Login",
    createEvent: "Create Event",
    upcomingEvents: "Upcoming Events",
    events: "Events",
    filters: ["All", "Music", "Sports", "Art", "Food", "Technology"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    about: "About Us",
    contact: "Contact",
    follow: "Follow Us",
    copyright: "© 2023 EventMaster. All rights reserved.",
    eventTitles: ["Summer Music Festival", "Basketball Tournament", "Art Exhibition"],
    eventDescriptions: [
      "Join us for the biggest music festival of the year featuring top international artists.",
      "Annual city basketball tournament for amateur teams. Register your team now!",
      "Exhibition featuring works from local artists. Free entrance for all visitors."
    ],
    filterByMonth: "Filter by Month",
    allFilters: "All Filters",
    email: "Email",
    password: "Password",
    eventTitle: "Event Title",
    date: "Date",
    category: "Category",
    description: "Description",
    eventImage: "Event Image",
    uploadImage: "Upload Image",
    selectCategory: "Select category",
    createNewEvent: "Create New Event"
  },
  ar: {
    logoText: "الفعاليات",
    heroTitle: "اكتشف الفعاليات المدهشة",
    heroDesc: "ابحث وأنشئ فعاليات تطابق اهتماماتك. تواصل مع الأشخاص واستمتع بتجارب فريدة.",
    login: "تسجيل الدخول",
    createEvent: "إنشاء فعالية",
    upcomingEvents: "الفعاليات القادمة",
    events: "الفعاليات",
    filters: ["الكل", "موسيقى", "رياضة", "فن", "طعام", "تكنولوجيا"],
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    about: "من نحن",
    contact: "اتصل بنا",
    follow: "تابعنا",
    copyright: "© 2023 الفعاليات. جميع الحقوق محفوظة.",
    eventTitles: ["مهرجان الموسيقى الصيفي", "بطولة كرة السلة", "معرض فني"],
    eventDescriptions: [
      "انضم إلينا في أكبر مهرجان موسيقي لهذا العام بمشاركة كبار الفنانين الدوليين.",
      "بطولة كرة السلة السنوية للمدينة للفرق الهواة. سجل فريقك الآن!",
      "معرض يعرض أعمال فنانين محليين. دخول مجاني لجميع الزوار."
    ],
    filterByMonth: "تصفية حسب الشهر",
    allFilters: "جميع التصنيفات",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    eventTitle: "عنوان الفعالية",
    date: "التاريخ",
    category: "الفئة",
    description: "الوصف",
    eventImage: "صورة الفعالية",
    uploadImage: "رفع صورة",
    selectCategory: "اختر الفئة",
    createNewEvent: "إنشاء فعالية جديدة"
  },
  ku: {
    logoText: "بۆنەگرنگەکان",
    heroTitle: "بۆنە سەرسووڕهێنەرەکان بدۆزەوە",
    heroDesc: "بۆنەکان بدۆزەوە و دروستی بکە کە جێی بایەختن. پەیوەندی بە خەڵکەوە بکە و چێژ لە ئەزموونی تایبەت وەربگرە.",
    login: "چوونەژوورەوە",
    createEvent: "دروستکردنی بۆنە",
    upcomingEvents: "بۆنەکانی داهاتوو",
    events: "بۆنەکان",
    filters: ["هەموو", "مۆسیقا", "وەرزش", "هونەر", "خواردن", "تەکنەلۆژیا"],
    months: ["کانوونی دووەم", "شوبات", "ئازار", "نیسان", "ئایار", "حوزەیران", "تەمووز", "ئاب", "ئەیلوول", "تشرینی یەکەم", "تشرینی دووەم", "کانوونی یەکەم"],
    about: "دەربارەی ئێمە",
    contact: "پەیوەندی",
    follow: "فۆڵۆمان بکە",
    copyright: "© 2023 بۆنەگرنگەکان. هەموو مافەکان پارێزراون.",
    eventTitles: ["فێستیڤاڵی مۆسیقای هاوینە", "پاڵەوانییەتی تۆپی سەبەتە", "نمایشگاهی هونەری"],
    eventDescriptions: [
      "بەشداری بکە لە گەورەترین فێستیڤاڵی مۆسیقای ساڵ کە باشترین هونەرمەندانی نێودەوڵەتی تێدایە.",
      "پاڵەوانییەتی تۆپی سەبەتەی ساڵانەی شار بۆ تیپە ئاماتۆرەکان. تیپەکەت ئێستا تۆمار بکە!",
      "فیستیڤاڵێک کە کارەکانی هونەرمەندانی ناوخۆیی پیشان دەدات. چوونەژوورەوەی بێبەرامبەر بۆ هەموو سەردانکەران."
    ],
    filterByMonth: "پاڵاوتن بەپێی مانگ",
    allFilters: "هەموو پۆلەکان",
    email: "ئیمەیڵ",
    password: "وشەی نهێنی",
    eventTitle: "ناونیشانی بۆنە",
    date: "بەروار",
    category: "جۆر",
    description: "وەسف",
    eventImage: "وێنەی بۆنە",
    uploadImage: "بارکردنی وێنە",
    selectCategory: "جۆر هەڵبژێرە",
    createNewEvent: "دروستکردنی بۆنەی نوێ"
  }
};

export default function MultilingualEventsPage() {
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [isRTL, setIsRTL] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  const t = translations[currentLang];

  useEffect(() => {
    // Set RTL for Arabic and Kurdish
    setIsRTL(currentLang === "ar" || currentLang === "ku");
    document.body.dir = isRTL ? "rtl" : "ltr";
  }, [currentLang, isRTL]);

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    setShowLoginModal(false);
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle event creation logic here
    setShowCreateEventModal(false);
  };

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        strategy="lazyOnload"
      />
      
      <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <i className="fas fa-calendar-alt text-2xl"></i>
                <span className="text-2xl font-bold">{t.logoText}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`px-4 py-2 rounded-full transition-all ${
                    currentLang === "en" 
                      ? "bg-white text-purple-600" 
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange("ar")}
                  className={`px-4 py-2 rounded-full transition-all ${
                    currentLang === "ar" 
                      ? "bg-white text-purple-600" 
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  Arabic
                </button>
                <button
                  onClick={() => handleLanguageChange("ku")}
                  className={`px-4 py-2 rounded-full transition-all ${
                    currentLang === "ku" 
                      ? "bg-white text-purple-600" 
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  Kurdish
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {t.heroTitle}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t.heroDesc}
            </p>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all transform hover:-translate-y-1"
              >
                {t.login}
              </button>
              <button
                onClick={() => setShowCreateEventModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all transform hover:-translate-y-1"
              >
                {t.createEvent}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            {t.upcomingEvents}
          </h2>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {t.filters.map((filter, index) => (
              <button
                key={index}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  selectedFilter === filter
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Month Filters */}
          <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            {t.filterByMonth}
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-12">
            {t.months.map((month, index) => (
              <button
                key={index}
                onClick={() => setSelectedMonth(month)}
                className={`px-3 py-2 text-center rounded-lg border transition-all ${
                  selectedMonth === month
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
              >
                {month}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Event Card 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer transform hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <i className="fas fa-music text-white text-4xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {t.eventTitles[0]}
                </h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <i className="far fa-calendar-alt mr-2"></i>
                  <span>June 15, 2023</span>
                </div>
                <p className="text-gray-600 line-clamp-3">
                  {t.eventDescriptions[0]}
                </p>
              </div>
            </div>

            {/* Event Card 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer transform hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <i className="fas fa-basketball-ball text-white text-4xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {t.eventTitles[1]}
                </h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <i className="far fa-calendar-alt mr-2"></i>
                  <span>July 22, 2023</span>
                </div>
                <p className="text-gray-600 line-clamp-3">
                  {t.eventDescriptions[1]}
                </p>
              </div>
            </div>

            {/* Event Card 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer transform hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                <i className="fas fa-paint-brush text-white text-4xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {t.eventTitles[2]}
                </h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <i className="far fa-calendar-alt mr-2"></i>
                  <span>August 5, 2023</span>
                </div>
                <p className="text-gray-600 line-clamp-3">
                  {t.eventDescriptions[2]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">{t.about}</h3>
                <p className="text-gray-400">
                  We connect people through events and experiences. Our platform makes it easy to discover and create events.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">{t.contact}</h3>
                <p className="text-gray-400">
                  Email: info@eventmaster.com<br />
                  Phone: +1 234 567 8900
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">{t.follow}</h3>
                <div className="flex space-x-4 text-2xl">
                  <i className="fab fa-facebook hover:text-blue-400 cursor-pointer"></i>
                  <i className="fab fa-twitter hover:text-blue-400 cursor-pointer"></i>
                  <i className="fab fa-instagram hover:text-pink-400 cursor-pointer"></i>
                  <i className="fab fa-linkedin hover:text-blue-400 cursor-pointer"></i>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>{t.copyright}</p>
            </div>
          </div>
        </footer>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
              
              <h2 className="text-2xl font-bold mb-6">{t.login}</h2>
              
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.password}
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t.login}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowCreateEventModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
              
              <h2 className="text-2xl font-bold mb-6">{t.createNewEvent}</h2>
              
              <form onSubmit={handleCreateEventSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.eventTitle}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.date}
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.category}
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">{t.selectCategory}</option>
                    <option value="music">Music</option>
                    <option value="sports">Sports</option>
                    <option value="art">Art</option>
                    <option value="food">Food</option>
                    <option value="tech">Technology</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.description}
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.eventImage}
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept="image/*"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                      <i className="fas fa-upload mr-2"></i>
                      {uploadedFileName || t.uploadImage}
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t.createEvent}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}