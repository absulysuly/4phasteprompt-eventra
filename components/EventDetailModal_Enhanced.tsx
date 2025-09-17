import React, { useState, useEffect } from 'react';
import type { Event, Language, Review, User } from '../types';
import { WhatsAppIcon, FacebookIcon, GmailIcon, StarIcon } from './icons';
import { EventMap } from './EventMap';

interface EventDetailModalProps {
  event: Event | null;
  onClose: () => void;
  lang: Language;
  onAddReview: (eventId: string, review: Omit<Review, 'id' | 'user' | 'timestamp'>) => void;
  currentUser: User | null;
  onEdit: (event: Event) => void;
  onViewProfile: (userId: string) => void;
}

const StarRating: React.FC<{ rating: number; setRating?: (rating: number) => void; size?: 'sm' | 'md' | 'lg' }> = ({ 
  rating, setRating, size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${sizeClasses[size]} transition-colors duration-200 ${
            setRating ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
          onClick={() => setRating?.(star)}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ 
  event, onClose, lang, onAddReview, currentUser, onEdit, onViewProfile 
}) => {
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'contact'>('details');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (event) {
      setNewComment('');
      setNewRating(0);
      setIsSubmitting(false);
      setActiveTab('details');
      setShowShareMenu(false);
      setImageError(false);
      setShowFullDescription(false);
    }
  }, [event]);

  if (!event) return null;

  const isOwner = currentUser && event.organizerId === currentUser.id;
  const averageRating = event.reviews.length > 0 
    ? event.reviews.reduce((sum, review) => sum + review.rating, 0) / event.reviews.length 
    : 0;

  const getLocale = () => {
    if (lang === 'ar') return 'ar-IQ';
    if (lang === 'ku') return 'ku-IQ';
    return 'en-US';
  };

  const t = {
    organizerContact: { en: 'Contact Organizer', ar: 'اتصل بالمنظم', ku: 'پەیوەندی بە ڕێکخەر' },
    chat: { en: 'Chat on Platform', ar: 'مراسلة على المنصة', ku: 'گفتوگۆ لەسەر پلاتفۆرم' },
    call: { en: 'Call Organizer', ar: 'اتصل بالمنظم', ku: 'پەیوەندی بکە بە ڕێکخەر' },
    whatsapp: { en: 'Message on WhatsApp', ar: 'مراسلة عبر واتساب', ku: 'نامەناردن لە وەتسئەپ' },
    reviews: { en: 'Reviews & Comments', ar: 'التقييمات والتعليقات', ku: 'پێداچوونەوە و کۆمێنتەکان' },
    addReview: { en: 'Add your review', ar: 'أضف تقييمك', ku: 'پێداچوونەوەی خۆت زیاد بکە' },
    submitReview: { en: 'Submit Review', ar: 'إرسال التقييم', ku: 'ناردنی پێداچوونەوە' },
    share: { en: 'Share Event', ar: 'شارك الفعالية', ku: 'هاوبەشی پێکردنی ڕووداو' },
    location: { en: 'Location', ar: 'الموقع', ku: 'شوێن' },
    ticketInfo: { en: 'Tickets', ar: 'التذاكر', ku: 'بلیتەکان' },
    loginToReview: { en: 'Please sign in to leave a review.', ar: 'يرجى تسجيل الدخول لترك مراجعة.', ku: 'تکایە بچۆ ژوورەوە بۆ دانانی پێداچوونەوە.' },
    editEvent: { en: 'Edit Event', ar: 'تعديل الفعالية', ku: 'دەستکاری ڕووداو' },
    viewProfile: { en: 'View Profile', ar: 'عرض الملف الشخصي', ku: 'پڕۆفایل ببینە' },
    details: { en: 'Details', ar: 'التفاصيل', ku: 'وردەکارییەکان' },
    contact: { en: 'Contact', ar: 'اتصال', ku: 'پەیوەندی' },
    readMore: { en: 'Read more', ar: 'قراءة المزيد', ku: 'زیاتر بخوێنەرەوە' },
    readLess: { en: 'Read less', ar: 'قراءة أقل', ku: 'کەمتر بخوێنەرەوە' },
    attending: { en: 'Attending', ar: 'سأحضر', ku: 'ئامادەبوون' },
    interested: { en: 'Interested', ar: 'مهتم', ku: 'ئارەزوومەندم' },
    shareVia: { en: 'Share via', ar: 'شارك عبر', ku: 'هاوبەشی پێبکە لە ڕێگەی' },
    copyLink: { en: 'Copy Link', ar: 'نسخ الرابط', ku: 'کۆپیکردنی بەستەر' },
    linkCopied: { en: 'Link copied!', ar: 'تم نسخ الرابط!', ku: 'بەستەر کۆپی کرا!' }
  };

  const handleAddReview = async () => {
    if (newComment && newRating > 0 && currentUser && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddReview(event.id, {
          rating: newRating,
          comment: newComment,
        });
        setNewComment('');
        setNewRating(0);
      } catch (error) {
        console.error('Failed to add review:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Show success message (you could add a toast notification here)
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const contactNumber = event.whatsappNumber || event.organizerPhone;
  const whatsappLink = `https://wa.me/${contactNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I have a question about the event: ${event.title[lang]}`)}`;
  const callLink = `tel:${event.organizerPhone}`;
  const gmailLink = `mailto:?subject=${encodeURIComponent(event.title[lang])}&body=${encodeURIComponent(`Check out this event: ${event.title[lang]}\n\n${event.description[lang]}\n\nDate: ${new Date(event.date).toLocaleString()}`)}`;
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(getLocale(), options);
  };

  const TabButton: React.FC<{ tab: 'details' | 'reviews' | 'contact'; children: React.ReactNode }> = ({ tab, children }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all duration-200 ${
        activeTab === tab
          ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Hero Section */}
        <div className="relative">
          <div className="h-80 overflow-hidden">
            {!imageError ? (
              <img 
                src={event.imageUrl} 
                alt={event.title[lang]} 
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-2xl font-bold">{event.title[lang]}</h3>
                </div>
              </div>
            )}
          </div>
          
          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-opacity-30 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Event Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex justify-between items-end">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 leading-tight">{event.title[lang]}</h1>
                <div className="flex items-center space-x-4 text-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {event.venue}
                  </div>
                </div>
                
                {/* Rating Display */}
                {event.reviews.length > 0 && (
                  <div className="flex items-center mt-3 space-x-2">
                    <StarRating rating={Math.round(averageRating)} size="sm" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-300">({event.reviews.length} reviews)</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                {isOwner && (
                  <button 
                    onClick={() => onEdit(event)}
                    className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 font-medium"
                  >
                    {t.editEvent[lang]}
                  </button>
                )}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>{t.share[lang]}</span>
                  </button>
                  
                  {/* Share Dropdown */}
                  {showShareMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-10">
                      <a 
                        href={whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <WhatsAppIcon className="w-5 h-5 mr-3 text-green-500" />
                        WhatsApp
                      </a>
                      <a 
                        href={facebookLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <FacebookIcon className="w-5 h-5 mr-3 text-blue-600" />
                        Facebook
                      </a>
                      <a 
                        href={gmailLink}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <GmailIcon className="w-5 h-5 mr-3 text-red-500" />
                        Email
                      </a>
                      <button 
                        onClick={handleCopyLink}
                        className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {t.copyLink[lang]}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex px-6">
            <TabButton tab="details">{t.details[lang]}</TabButton>
            <TabButton tab="reviews">{t.reviews[lang]} ({event.reviews.length})</TabButton>
            <TabButton tab="contact">{t.contact[lang]}</TabButton>
          </div>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-24rem)] p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Organizer Info */}
              <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">
                    {event.organizerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{event.organizerName}</h3>
                  <button 
                    onClick={() => onViewProfile(event.organizerId)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {t.viewProfile[lang]}
                  </button>
                </div>
              </div>

              {/* Ticket Info */}
              {event.ticketInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h12v1a1 1 0 01-1 1H6a1 1 0 01-1-1zm1-4a1 1 0 00-1 1v1h12v-1a1 1 0 00-1-1H5z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="font-semibold text-green-800">{t.ticketInfo[lang]}: </span>
                      <span className="text-green-700">{event.ticketInfo}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="text-gray-700 leading-relaxed">
                  {showFullDescription ? (
                    <p className="whitespace-pre-wrap">{event.description[lang]}</p>
                  ) : (
                    <p className="whitespace-pre-wrap">
                      {event.description[lang].length > 300
                        ? `${event.description[lang].substring(0, 300)}...`
                        : event.description[lang]
                      }
                    </p>
                  )}
                  {event.description[lang].length > 300 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {showFullDescription ? t.readLess[lang] : t.readMore[lang]}
                    </button>
                  )}
                </div>
              </div>

              {/* Location */}
              {event.coordinates && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.location[lang]}</h3>
                  <EventMap coordinates={event.coordinates} venueName={event.venue} lang={lang} />
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Reviews List */}
              <div className="space-y-4">
                {event.reviews.map(review => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={review.user.avatarUrl} 
                        alt={review.user.name} 
                        className="w-10 h-10 rounded-full object-cover" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => onViewProfile(review.user.id)}
                            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {review.user.name}
                          </button>
                          <span className="text-sm text-gray-500">
                            {new Date(review.timestamp).toLocaleDateString(getLocale())}
                          </span>
                        </div>
                        <div className="mt-1">
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <p className="mt-2 text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {event.reviews.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>{lang === 'en' ? 'No reviews yet. Be the first to review!' : 
                        lang === 'ar' ? 'لا توجد تقييمات بعد. كن أول من يقيم!' : 
                        'هیچ پێداچوونەوەیەک نیە. یەکەم کەس بە بۆ پێداچوونەوە!'}</p>
                  </div>
                )}
              </div>

              {/* Add Review Section */}
              <div className="border-t border-gray-200 pt-6">
                {currentUser ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">{t.addReview[lang]}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <StarRating rating={newRating} setRating={setNewRating} size="lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                        <textarea 
                          value={newComment} 
                          onChange={(e) => setNewComment(e.target.value)} 
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder={lang === 'en' ? 'Share your experience...' : 
                                     lang === 'ar' ? 'شارك تجربتك...' : 
                                     'ئەزموونەکەت باس بکە...'}
                          rows={4}
                        />
                      </div>
                      <button 
                        onClick={handleAddReview} 
                        disabled={!newComment || newRating === 0 || isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                      >
                        {isSubmitting 
                          ? (lang === 'en' ? 'Submitting...' : lang === 'ar' ? 'جاري الإرسال...' : 'ناردن...')
                          : t.submitReview[lang]
                        }
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-gray-600">{t.loginToReview[lang]}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t.organizerContact[lang]}</h3>
                  
                  <button className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">{t.chat[lang]}</p>
                        <p className="text-sm text-blue-700">Send a message on the platform</p>
                      </div>
                    </div>
                  </button>

                  <a 
                    href={callLink} 
                    className="block w-full p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-green-900">{t.call[lang]}</p>
                        <p className="text-sm text-green-700">{event.organizerPhone}</p>
                      </div>
                    </div>
                  </a>

                  {event.whatsappNumber && (
                    <a 
                      href={whatsappLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <WhatsAppIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-green-900">{t.whatsapp[lang]}</p>
                          <p className="text-sm text-green-700">{event.whatsappNumber}</p>
                        </div>
                      </div>
                    </a>
                  )}
                </div>

                {/* Organizer Info Card */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-blue-600 font-bold text-2xl">
                        {event.organizerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.organizerName}</h3>
                    <p className="text-gray-600 mb-4">Event Organizer</p>
                    <button 
                      onClick={() => onViewProfile(event.organizerId)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {t.viewProfile[lang]}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};