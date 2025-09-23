#!/usr/bin/env node

/**
 * 🚨 WATER PROGRAM - STEP 4: ADD MISSING TRANSLATIONS
 * 
 * This script adds all missing translation keys to all language files
 * to ensure complete translation coverage.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const localesDir = path.join(projectRoot, 'public', 'locales');

// Missing translations that need to be added
const missingTranslations = {
  "categoryDescriptions": {
    "all": {
      "en": "All Categories",
      "ar": "جميع الفئات",
      "ku": "هەموو جۆرەکان"
    },
    "technologyInnovation": {
      "en": "Latest in tech, AI, and digital innovation",
      "ar": "أحدث التقنيات والذكاء الاصطناعي والابتكار الرقمي",
      "ku": "نوێترین تەکنەلۆژیا و AI و داهێنانی دیجیتاڵی"
    },
    "businessNetworking": {
      "en": "Professional development and networking opportunities",
      "ar": "فرص التطوير المهني والتشبيك",
      "ku": "دەرفەتەکانی گەشەپێدانی پیشەیی و تۆڕسازی"
    },
    "musicConcerts": {
      "en": "Live music performances and concerts",
      "ar": "العروض الموسيقية الحية والحفلات",
      "ku": "نمایشە مۆسیقییەکانی زیندوو و کۆنسێرتەکان"
    },
    "artsCulture": {
      "en": "Art exhibitions, cultural events, and heritage",
      "ar": "المعارض الفنية والفعاليات الثقافية والتراث",
      "ku": "نمایشگا هونەریەکان، بۆنە کولتووریەکان و میرات"
    },
    "sportsFitness": {
      "en": "Sports events, fitness activities, and wellness",
      "ar": "الفعاليات الرياضية وأنشطة اللياقة البدنية والعافية",
      "ku": "بۆنە وەرزشییەکان، چالاکی تەندروستی و خۆشگوزەرانی"
    },
    "foodDrink": {
      "en": "Culinary experiences, food festivals, and tastings",
      "ar": "التجارب الطهوية ومهرجانات الطعام والتذوق",
      "ku": "ئەزموونەکانی چێشتلێنان، فێستیڤاڵی خواردن و تام"
    },
    "learningDevelopment": {
      "en": "Educational workshops and skill development",
      "ar": "ورش تعليمية وتطوير المهارات",
      "ku": "وۆرکشۆپە فێرکاریەکان و گەشەپێدانی کارامەیی"
    },
    "healthWellness": {
      "en": "Health, wellness, and mental health events",
      "ar": "فعاليات الصحة والعافية والصحة النفسية",
      "ku": "بۆنەکانی تەندروستی، خۆشگوزەرانی و تەندروستی دەروونی"
    },
    "communitySocial": {
      "en": "Community gatherings and social events",
      "ar": "التجمعات المجتمعية والفعاليات الاجتماعية",
      "ku": "کۆبوونەوەی کۆمەڵگا و بۆنە کۆمەڵایەتییەکان"
    },
    "gamingEsports": {
      "en": "Gaming tournaments and esports competitions",
      "ar": "بطولات الألعاب ومسابقات الرياضة الإلكترونية",
      "ku": "پاڵەوانێتی یاری و پێشبڕکێی یاریە ئەلیکترۆنییەکان"
    },
    "spiritualReligious": {
      "en": "Religious ceremonies and spiritual gatherings",
      "ar": "المراسم الدينية والتجمعات الروحانية",
      "ku": "مەراسیمی ئایینی و کۆبوونەوەی ڕۆحی"
    },
    "familyKids": {
      "en": "Family-friendly events and kids activities",
      "ar": "فعاليات صديقة للعائلة وأنشطة الأطفال",
      "ku": "بۆنە خێزانیەکان و چالاکی منداڵان"
    },
    "outdoorAdventure": {
      "en": "Outdoor activities and adventure sports",
      "ar": "الأنشطة الخارجية والرياضات المغامرة",
      "ku": "چالاکی دەرەوە و وەرزشی سەرگەردانی"
    },
    "virtualEvents": {
      "en": "Online events and virtual experiences",
      "ar": "الفعاليات عبر الإنترنت والتجارب الافتراضية",
      "ku": "بۆنە ئۆنلاینەکان و ئەزموونە مەجازیەکان"
    },
    "academicConferences": {
      "en": "Academic conferences and research presentations",
      "ar": "المؤتمرات الأكاديمية والعروض البحثية",
      "ku": "کۆنفرانسی ئەکادیمی و پێشکەشکردنی توێژینەوە"
    }
  },
  "categoriesPage": {
    "title": {
      "en": "Event Categories",
      "ar": "فئات الفعاليات",
      "ku": "جۆرەکانی بۆنە"
    },
    "subtitle": {
      "en": "Discover events that match your interests",
      "ar": "اكتشف الفعاليات التي تطابق اهتماماتك",
      "ku": "ئەو بۆنانە بدۆزەرەوە کە لەگەڵ ئارەزووەکانت دەگونجێن"
    },
    "ctaTitle": {
      "en": "Ready to Create Your Event?",
      "ar": "مستعد لإنشاء فعاليتك؟",
      "ku": "ئامادەیت بۆ دروستکردنی بۆنەکەت؟"
    },
    "ctaSubtitle": {
      "en": "Join thousands of event organizers using our platform",
      "ar": "انضم لآلاف منظمي الفعاليات الذين يستخدمون منصتنا",
      "ku": "بەدوای هەزاران ڕێکخەری بۆنەوە بێ کە پلاتفۆرمەکەمان بەکاردێنن"
    }
  },
  "reset": {
    "emailSent": {
      "en": "Reset email sent successfully",
      "ar": "تم إرسال بريد إعادة التعيين بنجاح",
      "ku": "ئیمەیڵی ڕێکخستنەوە بە سەرکەوتوویی نێردرا"
    },
    "sending": {
      "en": "Sending...",
      "ar": "جاري الإرسال...",
      "ku": "ناردن..."
    },
    "sendResetLink": {
      "en": "Send Reset Link",
      "ar": "إرسال رابط إعادة التعيين",
      "ku": "بەستەری ڕێکخستنەوە بنێرە"
    }
  }
};

// Additional missing keys in about section
const aboutMissingKeys = {
  "about": {
    "values": {
      "items": {
        "culturalDiversity": {
          "title": {
            "en": "Cultural Diversity",
            "ar": "التنوع الثقافي",
            "ku": "جۆراوجۆری کولتووری"
          },
          "description": {
            "en": "We celebrate and support the rich cultural diversity of Iraq and Kurdistan.",
            "ar": "نحتفل وندعم التنوع الثقافي الغني للعراق وكردستان.",
            "ku": "ئێمە جۆراوجۆری کولتووری دەوڵەمەندی عێراق و کوردستان پیرۆز دەکەین و پشتگیری دەکەین."
          }
        },
        "accessibility": {
          "title": {
            "en": "Accessibility",
            "ar": "إمكانية الوصول",
            "ku": "دەستڕاگەیشتن"
          },
          "description": {
            "en": "We make events accessible to everyone, regardless of ability or background.",
            "ar": "نجعل الفعاليات متاحة للجميع، بغض النظر عن القدرة أو الخلفية.",
            "ku": "ئێمە بۆنەکان بۆ هەموو کەسێک دەستڕاگەیشتن دەکەین، بەبێ گوێدانە توانا یان پاشخان."
          }
        }
      }
    },
    "cta": {
      "title": {
        "en": "Join the IraqEvents Community",
        "ar": "انضم إلى مجتمع فعاليات العراق",
        "ku": "بەشداری کۆمەڵگای بۆنەکانی عێراق بکە"
      },
      "subtitle": {
        "en": "Start discovering and creating amazing events today",
        "ar": "ابدأ باكتشاف وإنشاء فعاليات رائعة اليوم",
        "ku": "ئەمڕۆ دەستبکە بە دۆزینەوە و دروستکردنی بۆنە نایابەکان"
      }
    },
    "contact": {
      "title": {
        "en": "Get in Touch",
        "ar": "تواصل معنا",
        "ku": "پەیوەندیمان پێوە بکە"
      },
      "subtitle": {
        "en": "We're here to help with any questions or support you need",
        "ar": "نحن هنا للمساعدة في أي أسئلة أو دعم تحتاجه",
        "ku": "ئێمە لێرەین بۆ یارمەتیدان لە هەر پرسیار یان پشتگیریەک کە پێویستت پێیەتی"
      },
      "emailSupport": {
        "en": "Email Support",
        "ar": "دعم البريد الإلكتروني",
        "ku": "پشتگیری ئیمەیڵ"
      },
      "liveChat": {
        "en": "Live Chat",
        "ar": "دردشة مباشرة",
        "ku": "گفتوگۆی ڕاستەوخۆ"
      },
      "liveChatAvailability": {
        "en": "Available 9 AM - 6 PM (Baghdad Time)",
        "ar": "متاح من 9 صباحاً - 6 مساءً (توقيت بغداد)",
        "ku": "بەردەستە لە کاتژمێر ٩ی بەیانی - ٦ی ئێوارە (کاتی بەغدا)"
      },
      "whatsapp": {
        "en": "WhatsApp",
        "ar": "واتساب",
        "ku": "واتساپ"
      }
    }
  }
};

async function addMissingTranslations() {
  console.log('🚨 WATER PROGRAM - ADDING MISSING TRANSLATIONS\n');
  
  const languages = ['en', 'ar', 'ku'];
  
  for (const lang of languages) {
    const filePath = path.join(localesDir, lang, 'common.json');
    
    try {
      console.log(`📝 Processing ${lang}/common.json...`);
      
      // Read current translations
      const content = fs.readFileSync(filePath, 'utf8');
      const translations = JSON.parse(content);
      
      // Add missing translations
      if (!translations.categoryDescriptions) {
        translations.categoryDescriptions = {};
      }
      
      // Add category descriptions
      Object.keys(missingTranslations.categoryDescriptions).forEach(key => {
        translations.categoryDescriptions[key] = missingTranslations.categoryDescriptions[key][lang];
      });
      
      // Add categories page
      if (!translations.categoriesPage) {
        translations.categoriesPage = {};
      }
      
      Object.keys(missingTranslations.categoriesPage).forEach(key => {
        translations.categoriesPage[key] = missingTranslations.categoriesPage[key][lang];
      });
      
      // Add reset section
      if (!translations.reset) {
        translations.reset = {};
      }
      
      Object.keys(missingTranslations.reset).forEach(key => {
        translations.reset[key] = missingTranslations.reset[key][lang];
      });
      
      // Add about missing keys
      if (!translations.about) {
        translations.about = {};
      }
      
      if (!translations.about.values) {
        translations.about.values = { items: {} };
      }
      
      if (!translations.about.values.items) {
        translations.about.values.items = {};
      }
      
      // Add cultural diversity and accessibility
      translations.about.values.items.culturalDiversity = {
        title: aboutMissingKeys.about.values.items.culturalDiversity.title[lang],
        description: aboutMissingKeys.about.values.items.culturalDiversity.description[lang]
      };
      
      translations.about.values.items.accessibility = {
        title: aboutMissingKeys.about.values.items.accessibility.title[lang],
        description: aboutMissingKeys.about.values.items.accessibility.description[lang]
      };
      
      // Add CTA section
      if (!translations.about.cta) {
        translations.about.cta = {};
      }
      
      translations.about.cta.title = aboutMissingKeys.about.cta.title[lang];
      translations.about.cta.subtitle = aboutMissingKeys.about.cta.subtitle[lang];
      
      // Add contact section
      if (!translations.about.contact) {
        translations.about.contact = {};
      }
      
      Object.keys(aboutMissingKeys.about.contact).forEach(key => {
        translations.about.contact[key] = aboutMissingKeys.about.contact[key][lang];
      });
      
      // Write back to file
      const updatedContent = JSON.stringify(translations, null, 2);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      
      console.log(`  ✅ Added missing translations to ${lang}/common.json`);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${lang}/common.json:`, error.message);
    }
  }
  
  console.log('\n🎉 All missing translations added successfully!');
  console.log('🔧 Run "npm run validate:translations" to verify all keys are now present.');
}

// Run if called directly
if (require.main === module) {
  addMissingTranslations();
}

module.exports = { addMissingTranslations };