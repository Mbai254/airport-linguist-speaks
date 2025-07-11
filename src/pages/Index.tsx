import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Volume2, Plane, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TranslationService } from "@/services/translationService";

const Index = () => {
  const [text, setText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.8]);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const languages = [
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "ms-MY", name: "Malay (Malaysia)", flag: "🇲🇾" },
    { code: "zh-CN", name: "Chinese (Mandarin)", flag: "🇨🇳" },
    { code: "zh-TW", name: "Chinese (Traditional)", flag: "🇹🇼" },
  ];

  // Enhanced voice selection with better Chinese support
  const findBestVoice = (lang: string): SpeechSynthesisVoice | null => {
    const voices = speechSynthesis.getVoices();
    console.log("Available voices:", voices.map(v => ({ name: v.name, lang: v.lang })));
    
    let filteredVoices: SpeechSynthesisVoice[] = [];
    
    if (lang === "en-US") {
      // Look for English US voices, prefer female
      filteredVoices = voices.filter(voice => 
        voice.lang.includes("en-US") || 
        voice.lang.includes("en_US") ||
        (voice.lang.startsWith("en") && voice.name.toLowerCase().includes("us"))
      );
    } else if (lang === "ms-MY") {
      // Look for Malay voices
      filteredVoices = voices.filter(voice => 
        voice.lang.includes("ms") || 
        voice.lang.includes("MY") ||
        voice.name.toLowerCase().includes("malay")
      );
    } else if (lang === "zh-CN") {
      // Look for Simplified Chinese voices with better matching
      filteredVoices = voices.filter(voice => 
        voice.lang.includes("zh-CN") || 
        voice.lang.includes("zh_CN") ||
        voice.lang.includes("cmn-Hans") ||
        voice.lang.includes("cmn-CN") ||
        (voice.lang.includes("zh") && (
          voice.name.toLowerCase().includes("china") ||
          voice.name.toLowerCase().includes("mandarin") ||
          voice.name.toLowerCase().includes("xiaoli") ||
          voice.name.toLowerCase().includes("xiaoyan") ||
          voice.name.toLowerCase().includes("huihui")
        ))
      );
    } else if (lang === "zh-TW") {
      // Look for Traditional Chinese voices
      filteredVoices = voices.filter(voice => 
        voice.lang.includes("zh-TW") || 
        voice.lang.includes("zh_TW") ||
        voice.lang.includes("zh-HK") ||
        voice.name.toLowerCase().includes("taiwan") ||
        voice.name.toLowerCase().includes("hong kong")
      );
    }

    // If no specific voices found, try broader matching
    if (filteredVoices.length === 0) {
      if (lang.startsWith("zh")) {
        filteredVoices = voices.filter(voice => voice.lang.startsWith("zh"));
      } else if (lang.startsWith("ms")) {
        filteredVoices = voices.filter(voice => voice.lang.startsWith("ms"));
      } else if (lang.startsWith("en")) {
        filteredVoices = voices.filter(voice => voice.lang.startsWith("en"));
      }
    }

    // Prefer female voices with natural names
    const femaleVoice = filteredVoices.find(voice => {
      const name = voice.name.toLowerCase();
      return name.includes('female') || 
             name.includes('woman') || 
             name.includes('mei') || 
             name.includes('ling') || 
             name.includes('hui') || 
             name.includes('xiaoli') ||
             name.includes('xiaoyan') ||
             name.includes('siti') || 
             name.includes('nurul') ||
             name.includes('yaoyao') ||
             name.includes('huihui') ||
             name.includes('samantha') ||
             name.includes('karen') ||
             name.includes('susan');
    });
    
    const selectedVoice = femaleVoice || filteredVoices[0] || null;
    
    if (selectedVoice) {
      console.log(`Selected voice for ${lang}:`, selectedVoice.name, selectedVoice.lang);
    } else {
      console.log(`No suitable voice found for ${lang}, will use default`);
    }
    
    return selectedVoice;
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

    // Stop any currently playing speech
    if (currentUtterance) {
      speechSynthesis.cancel();
      setCurrentUtterance(null);
      setIsPlaying(false);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    try {
      setIsTranslating(true);

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

      // Create translation service and translate text
      const translationService = new TranslationService();
      const translatedText = await translationService.translateText(text, selectedLanguage);
      
      console.log("Original text:", text);
      console.log("Translated text:", translatedText);

      setIsTranslating(false);

      const utterance = new SpeechSynthesisUtterance(translatedText);
      
      // Find and set the best voice
      const bestVoice = findBestVoice(selectedLanguage);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
      
      utterance.lang = selectedLanguage;
      utterance.volume = volume[0];
      
      // Adjust settings for better Chinese pronunciation
      if (selectedLanguage.startsWith("zh")) {
        utterance.rate = 0.7; // Slower for Chinese clarity
        utterance.pitch = 1.1; // Slightly higher pitch for femininity
      } else if (selectedLanguage === "ms-MY") {
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
      } else {
        utterance.rate = 0.85; // English
        utterance.pitch = 1.1;
      }

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
        description: `Speaking in ${languages.find(l => l.code === selectedLanguage)?.name}`,
      });
    } catch (error) {
      console.error("Error in handleSpeak:", error);
      setIsPlaying(false);
      setCurrentUtterance(null);
      setIsTranslating(false);
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
            Professional text-to-speech platform with AI translation for multilingual airport announcements
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
                Enter your English text - it will be translated using AI to the selected language
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
                Select language for AI translation and natural speech output
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Language Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Target Language (AI Translation & Speech)
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
                  onValueChange={(newVolume) => setVolume(newVolume)}
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
                      onClick={() => {
                        speechSynthesis.pause();
                        setIsPlaying(false);
                      }}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </Button>
                    <Button
                      onClick={() => {
                        speechSynthesis.resume();
                        setIsPlaying(true);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Resume
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => {
                    speechSynthesis.cancel();
                    setIsPlaying(false);
                    setCurrentUtterance(null);
                  }}
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
            <CardTitle className="text-center">Enhanced Platform Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Languages className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">AI Translation</h3>
                <p className="text-sm text-slate-600">
                  Uses Google Gemini AI for accurate English to Malay/Chinese translation
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Volume2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Natural Voice</h3>
                <p className="text-sm text-slate-600">
                  Intelligent voice selection with preference for smooth, natural female voices
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Plane className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Airport Optimized</h3>
                <p className="text-sm text-slate-600">
                  Specialized for airport announcements with professional aviation terminology
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
