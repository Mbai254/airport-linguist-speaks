
import { GoogleGenerativeAI } from '@google/generative-ai';

export class TranslationService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    // Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual Gemini API key
    const apiKey = 'AIzaSyB-d8A7gDkbiAXq_4dRoq_II7NQ9y_YCbo';
    
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    if (!this.genAI) {
      // Fallback to basic translation if no API key
      return this.basicTranslation(text, targetLanguage);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      let languageName = "";
      let instructions = "";
      
      switch (targetLanguage) {
        case "ms-MY":
          languageName = "Malay (Bahasa Malaysia)";
          instructions = "Translate naturally and fluently. Use proper Malay pronunciation-friendly text.";
          break;
        case "zh-CN":
          languageName = "Simplified Chinese (Mandarin)";
          instructions = "Translate to natural Simplified Chinese. Use common spoken Mandarin expressions that text-to-speech can pronounce clearly. Avoid complex characters that might be difficult for TTS engines.";
          break;
        case "zh-TW":
          languageName = "Traditional Chinese";
          instructions = "Translate to natural Traditional Chinese. Use common spoken expressions that text-to-speech can pronounce clearly.";
          break;
        case "en-US":
          return text; // No translation needed for English
        default:
          return text;
      }

      const prompt = `${instructions}

Translate this English text to ${languageName}. Only return the translation, nothing else:

"${text}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translation = response.text().trim();
      
      console.log(`Gemini translation from English to ${languageName}:`, translation);
      return translation;
    } catch (error) {
      console.error("Gemini translation error:", error);
      // Fallback to basic translation
      return this.basicTranslation(text, targetLanguage);
    }
  }

  private basicTranslation(text: string, targetLang: string): string {
    // Enhanced fallback translations for airport announcements
    const translations: { [key: string]: { [key: string]: string } } = {
      "ms-MY": {
        "Attention passengers": "Perhatian penumpang",
        "Flight": "Penerbangan",
        "to": "ke",
        "is now boarding": "sedang menaiki kapal terbang",
        "at Gate": "di Pintu",
        "Final boarding call": "Panggilan terakhir untuk menaiki kapal terbang",
        "for passengers on": "untuk penumpang",
        "Ladies and gentlemen": "Tuan-tuan dan puan-puan",
        "welcome to": "selamat datang ke",
        "International Airport": "Lapangan Terbang Antarabangsa",
        "Please proceed to": "Sila pergi ke",
        "departure gate": "pintu berlepas",
        "connecting flight": "penerbangan sambungan",
        "Kuala Lumpur": "Kuala Lumpur",
        "Singapore": "Singapura",
        "Thank you": "Terima kasih"
      },
      "zh-CN": {
        "Attention passengers": "各位旅客请注意",
        "Flight": "航班",
        "to": "飞往",
        "is now boarding": "现在开始登机",
        "at Gate": "在",
        "Gate": "号登机口",
        "Final boarding call": "最后登机通知",
        "for passengers on": "搭乘",
        "Ladies and gentlemen": "女士们先生们",
        "welcome to": "欢迎来到",
        "International Airport": "国际机场",
        "Please proceed to": "请前往",
        "departure gate": "登机口",
        "connecting flight": "转机航班",
        "Kuala Lumpur": "吉隆坡",
        "Singapore": "新加坡",
        "Thank you": "谢谢"
      },
      "zh-TW": {
        "Attention passengers": "各位旅客請注意",
        "Flight": "航班",
        "to": "飛往",
        "is now boarding": "現在開始登機",
        "at Gate": "在",
        "Gate": "號登機口",
        "Final boarding call": "最後登機通知",
        "for passengers on": "搭乘",
        "Ladies and gentlemen": "女士們先生們",
        "welcome to": "歡迎來到",
        "International Airport": "國際機場",
        "Please proceed to": "請前往",
        "departure gate": "登機口",
        "connecting flight": "轉機航班",
        "Kuala Lumpur": "吉隆坡",
        "Singapore": "新加坡",
        "Thank you": "謝謝"
      }
    };

    if (targetLang === "en-US") {
      return text; // No translation needed for English
    }

    let translatedText = text;
    const targetTranslations = translations[targetLang];
    
    if (targetTranslations) {
      Object.entries(targetTranslations).forEach(([english, translated]) => {
        const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        translatedText = translatedText.replace(regex, translated);
      });
    }
    
    return translatedText;
  }
}
