
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
  const { toast } = useToast();

  const languages = [
    { code: "ms-MY", name: "Malay (Malaysia)", flag: "🇲🇾" },
    { code: "zh-CN", name: "Chinese (Mandarin)", flag: "🇨🇳" },
    { code: "zh-TW", name: "Chinese (Traditional)", flag: "🇹🇼" },
  ];

  const handleSpeak = () => {
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
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.volume = volume[0];
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;

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
      setIsPlaying(false);
      setCurrentUtterance(null);
      console.error("Speech error:", event.error);
      toast({
        title: "Speech Error",
        description: "There was an error generating the speech. Please try again.",
        variant: "destructive",
      });
    };

    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);

    toast({
      title: "Speech Started",
      description: `Converting to ${languages.find(l => l.code === selectedLanguage)?.name}`,
    });
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
            Professional text-to-speech platform for multilingual airport announcements
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-blue-600" />
                Text Input
              </CardTitle>
              <CardDescription>
                Enter your English text for conversion
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Textarea
                placeholder="Enter your announcement text here..."
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
                Speech Controls
              </CardTitle>
              <CardDescription>
                Configure and control speech output
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Language Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Target Language
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
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Speak
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
                <h3 className="font-semibold">Multi-Language Support</h3>
                <p className="text-sm text-slate-600">
                  Convert English text to Malay and Chinese speech
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Volume2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Professional Quality</h3>
                <p className="text-sm text-slate-600">
                  Clear, natural-sounding speech for airport environments
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Plane className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Airport Ready</h3>
                <p className="text-sm text-slate-600">
                  Designed specifically for aviation communication needs
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
