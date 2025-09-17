import React, { useState, useId, useEffect } from 'react';
import type { City, Category, Event, Language, AIAutofillData, User } from '../types';

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

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSave, cities, categories, lang, eventToEdit, aiAutofillData, currentUser }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [activeLangTab, setActiveLangTab] = useState<LangKey>('en');
  const [error, setError] = useState('');
  const formId = useId();
  const isEditMode = !!eventToEdit;

  useEffect(() => {
    if (isOpen) {
        if (eventToEdit) {
            setFormData({
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
            });
        } else if (aiAutofillData) {
            setFormData({
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
            });
        } else {
            setFormData({
                ...initialFormData,
                organizerName: currentUser?.name || '',
                organizerPhone: currentUser?.phone || '',
                imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`,
            });
        }
        setError('');
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
    error: { en: 'Please fill out all required fields.', ar: 'يرجى ملء جميع الحقول المطلوبة.', ku: 'تکایە هەموو خانە داواکراوەکان پڕبکەرەوە.' }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields: (keyof typeof formData)[] = ['title_en', 'title_ar', 'description_en', 'description_ar', 'organizerName', 'categoryId', 'cityId', 'date', 'venue', 'organizerPhone'];
    if (requiredFields.some(field => !formData[field as keyof typeof formData])) {
        setError(t.error[lang]);
        return;
    }
    
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
    
    onSave(eventData);
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-neutral-border bg-neutral-container text-neutral-text rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";
  const tabClasses = (isActive: boolean) => `px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none ${isActive ? 'bg-transparent text-dark-text border-b-2 border-secondary' : 'text-neutral-text-soft hover:bg-neutral-border/20'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="create-event-modal-title">
      <div className="bg-neutral-container rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-neutral-border">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-4 border-b border-neutral-border pb-3">
            <h2 id="create-event-modal-title" className="text-2xl font-bold text-neutral-text">{isEditMode ? t.editTitle[lang] : t.title[lang]}</h2>
            <button type="button" onClick={onClose} className="text-neutral-text-soft hover:text-neutral-text text-3xl leading-none">&times;</button>
          </div>
          <div className="space-y-4">
            <div className="border-b border-neutral-border">
                <nav className="-mb-px flex gap-4" aria-label="Tabs">
                    {langTabs.map(tab => (
                        <button key={tab.key} type="button" onClick={() => setActiveLangTab(tab.key)} className={tabClasses(activeLangTab === tab.key)}>
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="space-y-4">
                {langTabs.map(tab => (
                    <div key={tab.key} className={activeLangTab === tab.key ? 'block' : 'hidden'}>
                        <div>
                            <label htmlFor={`${formId}-title-${tab.key}`} className="block text-sm font-medium text-neutral-text-soft mb-1">{t.eventTitle[lang]} ({tab.name})</label>
                            <input type="text" id={`${formId}-title-${tab.key}`} name={`title_${tab.key}`} value={formData[`title_${tab.key}` as keyof typeof formData]} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div className="mt-4">
                            <label htmlFor={`${formId}-description-${tab.key}`} className="block text-sm font-medium text-neutral-text-soft mb-1">{t.description[lang]} ({tab.name})</label>
                            <textarea id={`${formId}-description-${tab.key}`} name={`description_${tab.key}`} value={formData[`description_${tab.key}` as keyof typeof formData]} onChange={handleChange} rows={5} className={inputClasses} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-border">
                <div>
                  <label htmlFor={`${formId}-organizerName`} className="block text-sm font-medium text-neutral-text-soft mb-1">{t.organizerName[lang]}</label>
                  <input type="text" id={`${formId}-organizerName`} name="organizerName" value={formData.organizerName} onChange={handleChange} className={inputClasses} />
                </div>
                 <div>
                  <label htmlFor={`${formId}-phone`} className="block text-sm font-medium text-neutral-text-soft mb-1">{t.phone[lang]}</label>
                  <input type="tel" id={`${formId}-phone`} name="organizerPhone" value={formData.organizerPhone} onChange={handleChange} className={inputClasses} />
                </div>
                 <div>
                  <label htmlFor={`${formId}-whatsapp`} className="block text-sm font-medium text-neutral-text-soft mb-1">{t.whatsapp[lang]}</label>
                  <input type="tel" id={`${formId}-whatsapp`} name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor={`${formId}-category`} className="block text-sm font-medium text-neutral-text-soft mb-1">{t.category[lang]}</label>
                  <select id={`${formId}-category`} name="categoryId" value={formData.categoryId} onChange={handleChange} className={inputClasses}>
                    <option value="">Select...</option>
                    {categories.filter(c => c.id !== 'all').map(item => (<option key={item.id} value={item.id}>{item.name[lang]}</option>))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`${formId}-city`} className="block text-sm font-medium text-neutral-text-soft mb-1">{t.city[lang]}</label>
                  <select id={`${formId}-city`} name="cityId" value={formData.cityId} onChange={handleChange} className={inputClasses}>
                    <option value="">Select...</option>
                    {cities.map(item => (<option key={item.id} value={item.id}>{item.name[lang]}</option>))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`${formId}-date`} className="block text-sm font-medium text-neutral-text-soft mb-1">{t.date[lang]}</label>
                  <input type="datetime-local" id={`${formId}-date`} name="date" value={formData.date} onChange={handleChange} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor={`${formId}-venue`} className="block text-sm font-medium text-neutral-text-soft mb-1">{t.venue[lang]}</label>
                  <input type="text" id={`${formId}-venue`} name="venue" value={formData.venue} onChange={handleChange} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor={`${formId}-ticketInfo`} className="block text-sm font-medium text-neutral-text-soft mb-1">{t.ticketInfo[lang]}</label>
                  <input type="text" id={`${formId}-ticketInfo`} name="ticketInfo" value={formData.ticketInfo} onChange={handleChange} className={inputClasses} placeholder="e.g., Free Entry, 25,000 IQD"/>
                </div>
            </div>
             <div>
                <label htmlFor={`${formId}-image`} className="block text-sm font-medium text-neutral-text-soft mb-1">{t.image[lang]}</label>
                <input type="text" id={`${formId}-image`} name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={inputClasses} />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-border text-neutral-text-soft rounded-md hover:bg-neutral-border/80">{t.cancel[lang]}</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary/90">{isEditMode ? t.saveChanges[lang] : t.submit[lang]}</button>
          </div>
        </form>
      </div>
    </div>
  );
};