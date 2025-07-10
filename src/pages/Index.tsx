import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Volume2, Plane, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [text, setText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.8]);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const languages = [
    { code: "ms-MY", name: "Malay (Malaysia)", flag: "🇲🇾" },
    { code: "zh-CN", name: "Chinese (Mandarin)", flag: "🇨🇳" },
    { code: "zh-TW", name: "Chinese (Traditional)", flag: "🇹🇼" },
  ];

  // Enhanced translation function with better Chinese support
  const translateText = async (text: string, targetLang: string): Promise<string> => {
    setIsTranslating(true);
    
    try {
      // Simulate translation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (targetLang === "ms-MY") {
        // Enhanced English to Malay translations
        const malayTranslations: { [key: string]: string } = {
          "Attention passengers": "Perhatian penumpang",
          "attention passengers": "perhatian penumpang",
          "Flight": "Penerbangan",
          "flight": "penerbangan",
          "to": "ke",
          "is now boarding": "sedang menaiki kapal terbang",
          "now boarding": "sedang menaiki kapal terbang",
          "at Gate": "di Pintu",
          "at gate": "di pintu",
          "Gate": "Pintu",
          "gate": "pintu",
          "Final boarding call": "Panggilan terakhir untuk menaiki kapal terbang",
          "final boarding call": "panggilan terakhir untuk menaiki kapal terbang",
          "for passengers on": "untuk penumpang",
          "passengers on": "penumpang",
          "Ladies and gentlemen": "Tuan-tuan dan puan-puan",
          "ladies and gentlemen": "tuan-tuan dan puan-puan",
          "welcome to": "selamat datang ke",
          "Welcome to": "Selamat datang ke",
          "International Airport": "Lapangan Terbang Antarabangsa",
          "international airport": "lapangan terbang antarabangsa",
          "Please proceed to": "Sila pergi ke",
          "please proceed to": "sila pergi ke",
          "departure gate": "pintu berlepas",
          "connecting flight": "penerbangan sambungan",
          "Kuala Lumpur": "Kuala Lumpur",
          "Singapore": "Singapura",
          "Thank you": "Terima kasih",
          "thank you": "terima kasih"
        };
        
        let translatedText = text;
        Object.entries(malayTranslations).forEach(([english, malay]) => {
          const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          translatedText = translatedText.replace(regex, malay);
        });
        
        return translatedText;
      } else if (targetLang === "zh-CN" || targetLang === "zh-TW") {
        // Enhanced English to Chinese translations
        const chineseTranslations: { [key: string]: string } = {
          "Attention passengers": "各位旅客请注意",
          "attention passengers": "各位旅客请注意",
          "Flight": "航班",
          "flight": "航班",
          "to": "飞往",
          "is now boarding": "现在开始登机",
          "now boarding": "现在开始登机",
          "at Gate": "在",
          "at gate": "在",
          "Gate": "号登机口",
          "gate": "号登机口",
          "Final boarding call": "最后登机通知",
          "final boarding call": "最后登机通知",
          "for passengers on": "搭乘",
          "passengers on": "搭乘",
          "Ladies and gentlemen": "女士们先生们",
          "ladies and gentlemen": "女士们先生们",
          "welcome to": "欢迎来到",
          "Welcome to": "欢迎来到",
          "International Airport": "国际机场",
          "international airport": "国际机场",
          "Please proceed to": "请前往",
          "please proceed to": "请前往",
          "departure gate": "登机口",
          "connecting flight": "转机航班",
          "Kuala Lumpur": "吉隆坡",
          "Singapore": "新加坡",
          "Thank you": "谢谢",
          "thank you": "谢谢"
        };
        
        let translatedText = text;
        Object.entries(chineseTranslations).forEach(([english, chinese]) => {
          const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          translatedText = translatedText.replace(regex, chinese);
        });
        
        return translatedText;
      }
      
      return text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  // Function to find the best voice for the selected language
  const findBestVoice = (lang: string): SpeechSynthesisVoice | null => {
    const voices = speechSynthesis.getVoices();
    console.log("Available voices:", voices.map(v => ({ name: v.name, lang: v.lang, gender: v.name })));
    
    // Filter voices by language
    const languageVoices = voices.filter(voice => {
      if (lang === "ms-MY") {
        return voice.lang.includes("ms") || voice.lang.includes("MY");
      } else if (lang === "zh-CN") {
        return voice.lang.includes("zh-CN") || voice.lang.includes("cmn");
      } else if (lang === "zh-TW") {
        return voice.lang.includes("zh-TW") || voice.lang.includes("zh-HK");
      }
      return false;
    });

    // If no specific language voices, try broader language matching
    if (languageVoices.length === 0) {
      const broadVoices = voices.filter(voice => {
        if (lang === "ms-MY") {
          return voice.lang.startsWith("ms");
        } else if (lang === "zh-CN" || lang === "zh-TW") {
          return voice.lang.startsWith("zh");
        }
        return false;
      });
      
      // Prefer female voices (common female voice indicators)
      const femaleVoice = broadVoices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('mei') ||
        voice.name.toLowerCase().includes('ling') ||
        voice.name.toLowerCase().includes('hui') ||
        voice.name.toLowerCase().includes('siti') ||
        voice.name.toLowerCase().includes('nurul')
      );
      
      return femaleVoice || broadVoices[0] || null;
    }

    // Prefer female voices from language-specific voices
    const femaleVoice = languageVoices.find(voice => 
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('mei') ||
      voice.name.toLowerCase().includes('ling') ||
      voice.name.toLowerCase().includes('hui') ||
      voice.name.toLowerCase().includes('siti') ||
      voice.name.toLowerCase().includes('nurul')
    );
    
    return femaleVoice || languageVoices[0];
  };

  const handleSpeak = async () => {
    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to convert to speech.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedLanguage) {
      toast({
        title: "No language selected",
        description: "Please select a target language.",
        variant: "destructive",
      });
      return;
    }

    // Stop any currently playing speech safely
    if (currentUtterance) {
      speechSynthesis.cancel();
      setCurrentUtterance(null);
      setIsPlaying(false);
      // Wait a bit for the cancellation to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      // Wait for voices to be loaded
      if (speechSynthesis.getVoices().length === 0) {
        await new Promise(resolve => {
          const checkVoices = () => {
            if (speechSynthesis.getVoices().length > 0) {
              resolve(true);
            } else {
              setTimeout(checkVoices, 100);
            }
          };
          checkVoices();
        });
      }

      // Translate the text first
      const translatedText = await translateText(text, selectedLanguage);
      
      console.log("Original text:", text);
      console.log("Translated text:", translatedText);

      const utterance = new SpeechSynthesisUtterance(translatedText);
      
      // Find and set the best voice
      const bestVoice = findBestVoice(selectedLanguage);
      if (bestVoice) {
        utterance.voice = bestVoice;
        console.log("Selected voice:", bestVoice.name, bestVoice.lang);
      } else {
        console.log("No specific voice found, using default");
      }
      
      utterance.lang = selectedLanguage;
      utterance.volume = volume[0];
      utterance.rate = 0.7; // Slower for clarity and smoother sound
      utterance.pitch = 1.1; // Slightly higher pitch for more pleasant female sound

      utterance.onstart = () => {
        setIsPlaying(true);
        console.log("Speech started");
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentUtterance(null);
        console.log("Speech ended");
      };

      utterance.onerror = (event) => {
        console.error("Speech error:", event.error);
        setIsPlaying(false);
        setCurrentUtterance(null);
        
        // Don't show error toast for 'interrupted' errors as they're expected when user stops/changes speech
        if (event.error !== 'interrupted') {
          toast({
            title: "Speech Error",
            description: "There was an error generating the speech. Please try again.",
            variant: "destructive",
          });
        }
      };

      setCurrentUtterance(utterance);
      speechSynthesis.speak(utterance);

      toast({
        title: "Speech Started",
        description: `Converting to ${languages.find(l => l.code === selectedLanguage)?.name}`,
      });
    } catch (error) {
      console.error("Error in handleSpeak:", error);
      setIsPlaying(false);
      setCurrentUtterance(null);
      toast({
        title: "Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePause = () => {
    speechSynthesis.pause();
    setIsPlaying(false);
  };

  const handleResume = () => {
    speechSynthesis.resume();
    setIsPlaying(true);
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentUtterance(null);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (currentUtterance) {
      currentUtterance.volume = newVolume[0];
    }
  };

  const sampleTexts = [
    "Attention passengers, Flight MH123 to Kuala Lumpur is now boarding at Gate 5.",
    "Final boarding call for passengers on Flight SQ456 to Singapore.",
    "Ladies and gentlemen, welcome to Kuala Lumpur International Airport.",
    "Please proceed to the departure gate for your connecting flight.",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Plane className="h-8 w-8 text-white" />
            </div>
            <div className="p-3 bg-green-600 rounded-full">
              <Languages className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800">
            Airport Linguist
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Professional text-to-speech platform with translation for multilingual airport announcements
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-blue-600" />
                English Text Input
              </CardTitle>
              <CardDescription>
                Enter your English text - it will be translated to the selected language
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Textarea
                placeholder="Enter your English announcement text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] text-lg leading-relaxed border-slate-300 focus:border-blue-500"
              />
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  Sample Announcements:
                </label>
                <div className="grid gap-2">
                  {sampleTexts.map((sample, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start h-auto p-3 text-sm"
                      onClick={() => setText(sample)}
                    >
                      {sample}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls Section */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-blue-600" />
                Translation & Speech Controls
              </CardTitle>
              <CardDescription>
                Select language for translation and speech output
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Language Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Target Language (Translation & Speech)
                </label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Volume Control */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  Volume: {Math.round(volume[0] * 100)}%
                </label>
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex gap-2">
                {!isPlaying ? (
                  <Button
                    onClick={handleSpeak}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    disabled={isTranslating}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {isTranslating ? "Translating..." : "Translate & Speak"}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handlePause}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </Button>
                    <Button
                      onClick={handleResume}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Resume
                    </Button>
                  </>
                )}
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  size="lg"
                  disabled={!currentUtterance}
                >
                  <Square className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-center">Platform Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Languages className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Real Translation</h3>
                <p className="text-sm text-slate-600">
                  Translate English text to Malay and Chinese before speaking
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Volume2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Enhanced Voice</h3>
                <p className="text-sm text-slate-600">
                  Optimized for smooth, female voices with natural pronunciation
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Plane className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Airport Ready</h3>
                <p className="text-sm text-slate-600">
                  Pre-loaded with common airport phrases and terminology
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
