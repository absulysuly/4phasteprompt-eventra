import React, { useState, useId, useEffect } from 'react';
import type { City, Category, Event, Language, AIAutofillData, User } from '../types';
import { 
  validateRequired, 
  validateEmail, 
  validatePhone, 
  validateUrl, 
  validateEventDate, 
  validateLength 
} from '../utils/validation';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<Event, 'id' | 'reviews' | 'organizerId'>) => void;
  cities: City[];
  categories: Category[];
  lang: Language;
  eventToEdit: Event | null;
  aiAutofillData: AIAutofillData | null;
  currentUser: User | null;
}

const initialFormData = {
  title_en: '',
  title_ar: '',
  title_ku: '',
  description_en: '',
  description_ar: '',
  description_ku: '',
  organizerName: '',
  categoryId: '',
  cityId: '',
  date: '',
  venue: '',
  organizerPhone: '',
  whatsappNumber: '',
  imageUrl: '',
  ticketInfo: '',
};

type LangKey = 'en' | 'ar' | 'ku';
const langTabs: { key: LangKey, name: string }[] = [
  { key: 'en', name: 'English' },
  { key: 'ar', name: 'العربية' },
  { key: 'ku', name: 'کوردی' },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ 
  isOpen, onClose, onSave, cities, categories, lang, eventToEdit, aiAutofillData, currentUser 
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [activeLangTab, setActiveLangTab] = useState<LangKey>('en');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [progress, setProgress] = useState(0);
  const formId = useId();
  const isEditMode = !!eventToEdit;

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'title_en':
      case 'title_ar': {
        const reqResult = validateRequired(value, 'Title');
        if (!reqResult.isValid) return reqResult.error!;
        const lenResult = validateLength(value, 'Title', 3, 100);
        return lenResult.isValid ? '' : lenResult.error!;
      }
      case 'description_en':
      case 'description_ar': {
        const reqResult = validateRequired(value, 'Description');
        if (!reqResult.isValid) return reqResult.error!;
        const lenResult = validateLength(value, 'Description', 10, 1000);
        return lenResult.isValid ? '' : lenResult.error!;
      }
      case 'organizerName': {
        const reqResult = validateRequired(value, 'Organizer Name');
        if (!reqResult.isValid) return reqResult.error!;
        const lenResult = validateLength(value, 'Organizer Name', 2, 50);
        return lenResult.isValid ? '' : lenResult.error!;
      }
      case 'organizerPhone': {
        const reqResult = validateRequired(value, 'Phone Number');
        if (!reqResult.isValid) return reqResult.error!;
        const phoneResult = validatePhone(value);
        return phoneResult.isValid ? '' : phoneResult.error!;
      }
      case 'whatsappNumber': {
        if (!value) return '';
        const phoneResult = validatePhone(value);
        return phoneResult.isValid ? '' : phoneResult.error!;
      }
      case 'venue': {
        const reqResult = validateRequired(value, 'Venue');
        if (!reqResult.isValid) return reqResult.error!;
        const lenResult = validateLength(value, 'Venue', 5, 200);
        return lenResult.isValid ? '' : lenResult.error!;
      }
      case 'date': {
        const reqResult = validateRequired(value, 'Date');
        if (!reqResult.isValid) return reqResult.error!;
        const dateResult = validateEventDate(value);
        return dateResult.isValid ? '' : dateResult.error!;
      }
      case 'categoryId': {
        const reqResult = validateRequired(value, 'Category');
        return reqResult.isValid ? '' : reqResult.error!;
      }
      case 'cityId': {
        const reqResult = validateRequired(value, 'City');
        return reqResult.isValid ? '' : reqResult.error!;
      }
      case 'imageUrl': {
        if (!value) return '';
        const urlResult = validateUrl(value, 'Image URL');
        return urlResult.isValid ? '' : urlResult.error!;
      }
      default:
        return '';
    }
  };

  const validateAllFields = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const fieldsToValidate = [
      'title_en', 'title_ar', 'description_en', 'description_ar',
      'organizerName', 'organizerPhone', 'venue', 'date', 'categoryId', 'cityId'
    ];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) errors[field] = error;
    });
    
    // Validate WhatsApp if provided
    if (formData.whatsappNumber) {
      const whatsappError = validateField('whatsappNumber', formData.whatsappNumber);
      if (whatsappError) errors.whatsappNumber = whatsappError;
    }
    
    // Validate image URL if provided
    if (formData.imageUrl && !formData.imageUrl.startsWith('data:')) {
      const imageError = validateField('imageUrl', formData.imageUrl);
      if (imageError) errors.imageUrl = imageError;
    }
    
    return errors;
  };

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = ['title_en', 'title_ar', 'description_en', 'description_ar', 'organizerName', 'organizerPhone', 'venue', 'date', 'categoryId', 'cityId'];
    const completedFields = requiredFields.filter(field => formData[field as keyof typeof formData].trim() !== '').length;
    setProgress((completedFields / requiredFields.length) * 100);
  }, [formData]);

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        const newFormData = {
          title_en: eventToEdit.title.en,
          title_ar: eventToEdit.title.ar,
          title_ku: eventToEdit.title.ku || '',
          description_en: eventToEdit.description.en,
          description_ar: eventToEdit.description.ar,
          description_ku: eventToEdit.description.ku || '',
          organizerName: eventToEdit.organizerName,
          categoryId: eventToEdit.categoryId,
          cityId: eventToEdit.cityId,
          date: eventToEdit.date.substring(0, 16),
          venue: eventToEdit.venue,
          organizerPhone: eventToEdit.organizerPhone,
          whatsappNumber: eventToEdit.whatsappNumber || '',
          imageUrl: eventToEdit.imageUrl,
          ticketInfo: eventToEdit.ticketInfo || '',
        };
        setFormData(newFormData);
        setImagePreview(eventToEdit.imageUrl);
      } else if (aiAutofillData) {
        const newFormData = {
          ...initialFormData,
          title_en: aiAutofillData.title.en,
          title_ar: aiAutofillData.title.ar,
          title_ku: aiAutofillData.title.ku || '',
          description_en: aiAutofillData.description.en,
          description_ar: aiAutofillData.description.ar,
          description_ku: aiAutofillData.description.ku || '',
          categoryId: aiAutofillData.categoryId,
          cityId: aiAutofillData.cityId,
          imageUrl: `data:image/png;base64,${aiAutofillData.imageBase64}`,
          organizerName: currentUser?.name || '',
        };
        setFormData(newFormData);
        setImagePreview(newFormData.imageUrl);
      } else {
        const randomSeed = Math.random();
        const newFormData = {
          ...initialFormData,
          organizerName: currentUser?.name || '',
          organizerPhone: currentUser?.phone || '',
          imageUrl: `https://picsum.photos/seed/${randomSeed}/800/600`,
        };
        setFormData(newFormData);
        setImagePreview(newFormData.imageUrl);
      }
      setError('');
      setFieldErrors({});
      setIsLoading(false);
      setIsDirty(false);
      setActiveLangTab(lang === 'ku' ? 'ku' : lang);
    }
  }, [isOpen, eventToEdit, aiAutofillData, currentUser, lang]);

  if (!isOpen) return null;
  
  const t = {
    title: { en: 'Create New Event', ar: 'إنشاء فعالية جديدة', ku: 'دروستکردنی ڕووداوی نوێ' },
    editTitle: { en: 'Edit Event', ar: 'تعديل الفعالية', ku: 'دەستکاری ڕووداو' },
    eventTitle: { en: 'Event Title', ar: 'عنوان الفعالية', ku: 'ناوی ڕووداو' },
    organizerName: { en: 'Organizer Name', ar: 'اسم المنظم', ku: 'ناوی ڕێکخەر' },
    category: { en: 'Category', ar: 'التصنيف', ku: 'پۆل' },
    city: { en: 'City', ar: 'المدينة', ku: 'شار' },
    date: { en: 'Date and Time', ar: 'التاريخ والوقت', ku: 'کات و بەروار' },
    venue: { en: 'Venue/Address', ar: 'المكان/العنوان', ku: 'شوێن/ناونیشان' },
    description: { en: 'Description', ar: 'الوصف', ku: 'پێناسە' },
    phone: { en: 'Organizer Phone', ar: 'رقم هاتف المنظم', ku: 'ژمارەی مۆبایلی ڕێکخەر' },
    whatsapp: { en: 'WhatsApp Number (Optional)', ar: 'رقم واتساب (اختياري)', ku: 'ژمارەی واتسئاپ (ئارەزوومەندانە)' },
    image: { en: 'Featured Image URL', ar: 'رابط الصورة البارزة', ku: 'لینکى وێنەى سەرەکی' },
    ticketInfo: { en: 'Ticket/Entry Info', ar: 'معلومات التذكرة/الدخول', ku: 'زانیاری بلیت/چوونەژوورەوە' },
    submit: { en: 'Create Event', ar: 'إنشاء الفعالية', ku: 'دروستکردنی ڕووداو' },
    saveChanges: { en: 'Save Changes', ar: 'حفظ التغييرات', ku: 'پاشەکەوتکردنی گۆڕانکارییەکان' },
    cancel: { en: 'Cancel', ar: 'إلغاء', ku: 'هەڵوەشاندنەوە' },
    error: { en: 'Please fill out all required fields.', ar: 'يرجى ملء جميع الحقول المطلوبة.', ku: 'تکایە هەموو خانە داواکراوەکان پڕبکەرەوە.' },
    progress: { en: 'Form Progress', ar: 'تقدم النموذج', ku: 'پێشکەوتنی فۆرم' },
    required: { en: 'Required', ar: 'مطلوب', ku: 'پێویست' },
    optional: { en: 'Optional', ar: 'اختياري', ku: 'ئارەزوومەندانە' }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Real-time validation for better UX
    const fieldError = validateField(name, value);
    if (fieldError && value.trim() !== '') {
      setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    }
    
    // Update image preview if image URL changes
    if (name === 'imageUrl' && value && !fieldError) {
      setImagePreview(value);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate all fields
    const errors = validateAllFields();
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setError(t.error[lang]);
      setIsLoading(false);
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(`${formId}-${firstErrorField.replace('_', '-')}`);
      element?.focus();
      return;
    }
    
    try {
      const eventData = {
        title: { en: formData.title_en, ar: formData.title_ar, ku: formData.title_ku },
        description: { en: formData.description_en, ar: formData.description_ar, ku: formData.description_ku },
        organizerName: formData.organizerName,
        categoryId: formData.categoryId,
        cityId: formData.cityId,
        date: new Date(formData.date).toISOString(),
        venue: formData.venue,
        organizerPhone: formData.organizerPhone,
        whatsappNumber: formData.whatsappNumber,
        imageUrl: formData.imageUrl || `https://picsum.photos/seed/${Math.random()}/800/600`,
        ticketInfo: formData.ticketInfo,
      };
      
      await onSave(eventData);
    } catch (err) {
      setError(lang === 'en' ? 'Failed to save event. Please try again.' : 
               lang === 'ar' ? 'فشل في حفظ الفعالية. يرجى المحاولة مرة أخرى.' : 
               'شکست لە پاشەکەوتکردنی ڕووداو. تکایە دووبارە هەوڵ بدەرەوە.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    if (isDirty) {
      const confirmMessage = lang === 'en' ? 'You have unsaved changes. Are you sure you want to close?' :
                           lang === 'ar' ? 'لديك تغييرات غير محفوظة. هل أنت متأكد من الإغلاق؟' :
                           'گۆڕانکارییەکانت پاشەکەوت نەکراون. دڵنیایت لە داخستن؟';
      if (confirm(confirmMessage)) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Enhanced input classes with error states
  const getInputClasses = (fieldName: string) => {
    const hasError = fieldErrors[fieldName];
    const baseClasses = "mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none transition-all duration-200";
    const errorClasses = "border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-500 focus:border-red-500";
    const normalClasses = "border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400";
    return `${baseClasses} ${hasError ? errorClasses : normalClasses}`;
  };
  
  const tabClasses = (isActive: boolean) => `px-6 py-3 text-sm font-medium rounded-t-lg focus:outline-none transition-all duration-200 ${
    isActive 
      ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm -mb-px' 
      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
  }`;
  
  const ErrorMessage: React.FC<{ fieldName: string }> = ({ fieldName }) => {
    if (!fieldErrors[fieldName]) return null;
    return (
      <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {fieldErrors[fieldName]}
      </p>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-event-modal-title">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 id="create-event-modal-title" className="text-2xl font-bold text-gray-900">
                  {isEditMode ? t.editTitle[lang] : t.title[lang]}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {lang === 'en' ? 'Fill in the details below to create your event' : 
                   lang === 'ar' ? 'املأ التفاصيل أدناه لإنشاء فعاليتك' : 
                   'زانیارییەکان پڕبکەرەوە بۆ دروستکردنی ڕووداوەکەت'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Progress indicator */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{t.progress[lang]}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
              </div>
              <button 
                type="button" 
                onClick={handleClose} 
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 text-2xl p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Language Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-1" aria-label="Tabs">
                {langTabs.map(tab => (
                  <button 
                    key={tab.key} 
                    type="button" 
                    onClick={() => setActiveLangTab(tab.key)} 
                    className={tabClasses(activeLangTab === tab.key)}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Multilingual Fields */}
            <div className="mb-8">
              {langTabs.map(tab => (
                <div key={tab.key} className={activeLangTab === tab.key ? 'block' : 'hidden'}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor={`${formId}-title-${tab.key}`} className="block text-sm font-medium text-gray-700 mb-2">
                        {t.eventTitle[lang]} ({tab.name}) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        id={`${formId}-title-${tab.key}`} 
                        name={`title_${tab.key}`} 
                        value={formData[`title_${tab.key}` as keyof typeof formData]} 
                        onChange={handleChange} 
                        className={getInputClasses(`title_${tab.key}`)}
                        placeholder={lang === 'en' ? 'Enter event title...' : 
                                   lang === 'ar' ? 'أدخل عنوان الفعالية...' :
                                   'ناوی ڕووداو بنووسە...'}
                      />
                      <ErrorMessage fieldName={`title_${tab.key}`} />
                    </div>
                    <div>
                      <label htmlFor={`${formId}-description-${tab.key}`} className="block text-sm font-medium text-gray-700 mb-2">
                        {t.description[lang]} ({tab.name}) <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        id={`${formId}-description-${tab.key}`} 
                        name={`description_${tab.key}`} 
                        value={formData[`description_${tab.key}` as keyof typeof formData]} 
                        onChange={handleChange} 
                        rows={4} 
                        className={getInputClasses(`description_${tab.key}`)}
                        placeholder={lang === 'en' ? 'Describe your event in detail...' :
                                   lang === 'ar' ? 'اوصف فعاليتك بالتفصيل...' :
                                   'ڕووداوەکەت بە وردی باس بکە...'}
                      />
                      <ErrorMessage fieldName={`description_${tab.key}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organizer Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {lang === 'en' ? 'Organizer Information' :
                   lang === 'ar' ? 'معلومات المنظم' :
                   'زانیاری ڕێکخەر'}
                </h3>
              </div>
              
              <div>
                <label htmlFor={`${formId}-organizerName`} className="block text-sm font-medium text-gray-700 mb-2">
                  {t.organizerName[lang]} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id={`${formId}-organizerName`} 
                  name="organizerName" 
                  value={formData.organizerName} 
                  onChange={handleChange} 
                  className={getInputClasses('organizerName')}
                />
                <ErrorMessage fieldName="organizerName" />
              </div>
              
              <div>
                <label htmlFor={`${formId}-phone`} className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phone[lang]} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  id={`${formId}-phone`} 
                  name="organizerPhone" 
                  value={formData.organizerPhone} 
                  onChange={handleChange} 
                  className={getInputClasses('organizerPhone')}
                  placeholder="+964 750 123 4567"
                />
                <ErrorMessage fieldName="organizerPhone" />
              </div>
              
              <div>
                <label htmlFor={`${formId}-whatsapp`} className="block text-sm font-medium text-gray-700 mb-2">
                  {t.whatsapp[lang]}
                </label>
                <input 
                  type="tel" 
                  id={`${formId}-whatsapp`} 
                  name="whatsappNumber" 
                  value={formData.whatsappNumber} 
                  onChange={handleChange} 
                  className={getInputClasses('whatsappNumber')}
                  placeholder="+964 750 123 4567"
                />
                <ErrorMessage fieldName="whatsappNumber" />
              </div>

              {/* Event Details */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {lang === 'en' ? 'Event Details' :
                   lang === 'ar' ? 'تفاصيل الفعالية' :
                   'وردەکارییەکانی ڕووداو'}
                </h3>
              </div>
              
              <div>
                <label htmlFor={`${formId}-category`} className="block text-sm font-medium text-gray-700 mb-2">
                  {t.category[lang]} <span className="text-red-500">*</span>
                </label>
                <select 
                  id={`${formId}-category`} 
                  name="categoryId" 
                  value={formData.categoryId} 
                  onChange={handleChange} 
                  className={getInputClasses('categoryId')}
                >
                  <option value="">{lang === 'en' ? 'Select category...' : lang === 'ar' ? 'اختر التصنيف...' : 'پۆل هەڵبژێرە...'}</option>
                  {categories.filter(c => c.id !== 'all').map(item => (
                    <option key={item.id} value={item.id}>{item.name[lang]}</option>
                  ))}
                </select>
                <ErrorMessage fieldName="categoryId" />
              </div>
              
              <div>
                <label htmlFor={`${formId}-city`} className="block text-sm font-medium text-gray-700 mb-2">
                  {t.city[lang]} <span className="text-red-500">*</span>
                </label>
                <select 
                  id={`${formId}-city`} 
                  name="cityId" 
                  value={formData.cityId} 
                  onChange={handleChange} 
                  className={getInputClasses('cityId')}
                >
                  <option value="">{lang === 'en' ? 'Select city...' : lang === 'ar' ? 'اختر المدينة...' : 'شار هەڵبژێرە...'}</option>
                  {cities.map(item => (
                    <option key={item.id} value={item.id}>{item.name[lang]}</option>
                  ))}
                </select>
                <ErrorMessage fieldName="cityId" />
              </div>
              
              <div>
                <label htmlFor={`${formId}-date`} className="block text-sm font-medium text-gray-700 mb-2">
                  {t.date[lang]} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="datetime-local" 
                  id={`${formId}-date`} 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  className={getInputClasses('date')}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <ErrorMessage fieldName="date" />
              </div>
              
              <div>
                <label htmlFor={`${formId}-venue`} className="block text-sm font-medium text-gray-700 mb-2">
                  {t.venue[lang]} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id={`${formId}-venue`} 
                  name="venue" 
                  value={formData.venue} 
                  onChange={handleChange} 
                  className={getInputClasses('venue')}
                  placeholder={lang === 'en' ? 'e.g., Baghdad Convention Center' :
                             lang === 'ar' ? 'مثال: مركز بغداد للمؤتمرات' :
                             'نموونە: سەنتەری کۆنفرانسی بەغدا'}
                />
                <ErrorMessage fieldName="venue" />
              </div>
              
              <div>
                <label htmlFor={`${formId}-ticketInfo`} className="block text-sm font-medium text-gray-700 mb-2">
                  {t.ticketInfo[lang]}
                </label>
                <input 
                  type="text" 
                  id={`${formId}-ticketInfo`} 
                  name="ticketInfo" 
                  value={formData.ticketInfo} 
                  onChange={handleChange} 
                  className={getInputClasses('ticketInfo')}
                  placeholder={lang === 'en' ? 'e.g., Free Entry, 25,000 IQD' :
                             lang === 'ar' ? 'مثال: دخول مجاني، 25,000 دينار' :
                             'نموونە: چوونەژوورەوەی خۆڕایی، 25,000 دینار'}
                />
                <ErrorMessage fieldName="ticketInfo" />
              </div>

              {/* Image Section */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  {lang === 'en' ? 'Event Image' :
                   lang === 'ar' ? 'صورة الفعالية' :
                   'وێنەی ڕووداو'}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor={`${formId}-image`} className="block text-sm font-medium text-gray-700 mb-2">
                      {t.image[lang]}
                    </label>
                    <input 
                      type="url" 
                      id={`${formId}-image`} 
                      name="imageUrl" 
                      value={formData.imageUrl} 
                      onChange={handleChange} 
                      className={getInputClasses('imageUrl')}
                      placeholder="https://example.com/image.jpg"
                    />
                    <ErrorMessage fieldName="imageUrl" />
                  </div>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {lang === 'en' ? 'Preview' : lang === 'ar' ? 'معاينة' : 'پێشبینین'}
                      </label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Event preview" 
                          className="w-full h-32 object-cover"
                          onError={() => setImagePreview('')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={handleClose} 
                disabled={isLoading}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
              >
                {t.cancel[lang]}
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading 
                  ? (lang === 'en' ? 'Creating...' : lang === 'ar' ? 'جاري الإنشاء...' : 'دروستکردن...') 
                  : (isEditMode ? t.saveChanges[lang] : t.submit[lang])
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};