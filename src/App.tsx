import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { ECO_ZONES, EcoZone } from './constants';
import { 
  Book, 
  Gamepad2, 
  Mic2, 
  Map as MapIcon, 
  ChevronLeft, 
  Camera, 
  Scan, 
  Play, 
  RefreshCw, 
  Trophy, 
  Info, 
  X, 
  Volume2, 
  Compass, 
  Settings, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  User, 
  Zap,
  Star,
  Mic 
} from 'lucide-react';
import { SpeakingLab } from './components/SpeakingLab';

// --- Sound Helper ---
const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.3;
  audio.play().catch(e => console.log("Audio play blocked", e));
};

// --- Interactive Map View ---
function MapView() {
  const navigate = useNavigate();
  
  return (
    <div className="relative w-full aspect-video md:aspect-[21/9] clay-card overflow-hidden bg-blue-50 group">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-200 to-blue-50 opacity-50" />
      
      {/* Interactive Zones */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-4 gap-4">
        {ECO_ZONES.map((zone, index) => (
          <motion.button
            key={zone.id}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playSound(zone.sound);
              navigate(`/${zone.id}`);
            }}
            className={`relative clay-card overflow-hidden flex flex-col items-center justify-center group/zone transition-all duration-500`}
          >
            <div className={`absolute inset-0 opacity-20 ${zone.color} group-hover/zone:opacity-40 transition-opacity`} />
            <motion.span 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
              className="text-6xl md:text-8xl mb-2 drop-shadow-lg z-10"
            >
              {zone.icon}
            </motion.span>
            <h3 className="text-xl md:text-3xl font-black text-gray-800 z-10 drop-shadow-sm">{zone.name}</h3>
            <div className="absolute bottom-2 right-2 opacity-0 group-hover/zone:opacity-100 transition-opacity bg-white/80 px-2 py-1 rounded-lg text-xs font-bold text-blue-600">
              Click to Explore!
            </div>
          </motion.button>
        ))}
      </div>

      {/* Map Instructions Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg pointer-events-none z-20">
        <p className="text-sm font-black text-blue-600 flex items-center gap-2">
          <MapIcon size={16} /> BẢN ĐỒ TƯƠNG TÁC: CHẠM ĐỂ KHÁM PHÁ
        </p>
      </div>
    </div>
  );
}

import { identifyEcoObject } from './services/geminiService';

// --- Explorer Mode (Real AI Detection) ---
function ExplorerMode() {
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<{ zone: EcoZone, object: string, image?: string, emoji?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setError(null);
    } catch (e) {
      setError("Không thể truy cập camera. Hãy cấp quyền camera!");
    }
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setScanning(true);
    setDetected(null);
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
      
      const result = await identifyEcoObject(imageData);
      
      if (result.zoneId !== 'none') {
        const zone = ECO_ZONES.find(z => z.id === result.zoneId);
        if (zone) {
          // Try to find a matching vocab image
          const vocabMatch = zone.vocab.find(v => v.word.toLowerCase() === result.detectedObject.toLowerCase());
          setDetected({ 
            zone, 
            object: result.detectedObject,
            image: vocabMatch?.image || zone.vocab[0].image, // Fallback to first vocab image of zone
            emoji: vocabMatch?.emoji || zone.vocab[0].emoji
          });
          playSound(zone.sound);
        } else {
          setError("Không nhận diện được vùng sinh thái.");
        }
      } else {
        setError("AI chưa nhận diện được vật thể. Hãy thử lại!");
      }
    }
    setScanning(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="clay-card p-6 flex flex-col items-center gap-6 min-h-[450px]">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800">Explorer Mode (AI AR)</h2>
        <p className="text-gray-500 font-medium">Quét mô hình thật để kích hoạt hiệu ứng 3D!</p>
      </div>

      <div className="relative w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden shadow-inner border-8 border-white">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        
        {scanning && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40">
            <motion.div 
              animate={{ y: [-150, 150, -150] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)]"
            />
            <p className="text-white font-black mt-4 animate-pulse">AI ĐANG PHÂN TÍCH...</p>
          </div>
        )}

        <AnimatePresence>
          {detected && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 p-6 text-center"
            >
              <div className="relative mb-4">
                <motion.span 
                  animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl block drop-shadow-2xl z-10 relative"
                >
                  {detected.zone.icon}
                </motion.span>
                {detected.image && (
                  <div className="relative w-32 h-32 md:w-40 md:h-40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <motion.img 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={detected.image}
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl opacity-60 aspect-square"
                      referrerPolicy="no-referrer"
                    />
                    {detected.emoji && (
                      <div className="absolute -top-2 -right-2 bg-white rounded-full w-12 h-12 flex items-center justify-center text-3xl shadow-lg border-2 border-blue-100 z-30">
                        {detected.emoji}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-black text-blue-600 mb-2 uppercase">PHÁT HIỆN: {detected.object}!</h3>
              <p className="text-gray-600 mb-6 font-bold">Hệ sinh thái: {detected.zone.name}</p>
              <button onClick={() => setDetected(null)} className="clay-button bg-blue-500 text-white w-full">Quét tiếp</button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && !scanning && !detected && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 p-6 text-center">
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 w-full max-w-sm">
        <button 
          onClick={captureAndDetect}
          disabled={scanning}
          className="clay-button flex-1 bg-blue-500 text-white flex items-center justify-center gap-2"
        >
          {scanning ? <RefreshCw className="animate-spin" /> : <Camera />}
          {scanning ? 'Đang phân tích...' : 'Chụp & Quét'}
        </button>
        <button onClick={startCamera} className="clay-button bg-gray-100 text-gray-600">
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
}

// --- Vocabulary Wheel (Fixed Rotation) ---
// --- Vocabulary Wheel (Fixed Rotation) ---
function VocabularyWheel({ onPractice }: { onPractice: (vocab: any) => void }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    
    // Play spin sound
    playSound('https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3');

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomDegree = Math.floor(Math.random() * 360);
    const newRotation = rotation + (extraSpins * 360) + randomDegree;
    
    setRotation(newRotation);

    setTimeout(() => {
      // Determine which zone based on degree (0-90: Forest, 90-180: Volcano, 180-270: Ocean, 270-360: Island)
      const finalDegree = (360 - (newRotation % 360)) % 360;
      let zoneIndex = 0;
      if (finalDegree < 90) zoneIndex = 0;
      else if (finalDegree < 180) zoneIndex = 1;
      else if (finalDegree < 270) zoneIndex = 2;
      else zoneIndex = 3;

      const zone = ECO_ZONES[zoneIndex];
      const randomWord = zone.vocab[Math.floor(Math.random() * zone.vocab.length)];
      const selected = { 
        word: randomWord.word, 
        translation: randomWord.translation,
        image: randomWord.image,
        definition: randomWord.definition,
        example: randomWord.example,
        emoji: randomWord.emoji,
        zone: zone.name 
      };
      setResult(selected);
      setHistory(prev => [selected, ...prev].slice(0, 5));
      setSpinning(false);
      playSound('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'); // Win sound
    }, 3000);
  };

  return (
    <div className="clay-card p-6 space-y-8 overflow-hidden">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800">Vòng quay Kỳ diệu</h2>
        <p className="text-gray-500 font-medium">Quay để khám phá từ vựng ngẫu nhiên!</p>
      </div>
      
      <div className="relative flex justify-center py-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 text-4xl drop-shadow-md">
          👇
        </div>
        
        <motion.div 
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "circOut" }}
          className="w-64 h-64 md:w-80 md:h-80 rounded-full border-[12px] border-white shadow-2xl overflow-hidden relative"
        >
          {/* Wheel Segments */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full grid grid-cols-2 grid-rows-2">
              <div className="bg-green-400 flex items-center justify-center text-4xl">🌲</div>
              <div className="bg-red-400 flex items-center justify-center text-4xl">🌋</div>
              <div className="bg-blue-400 flex items-center justify-center text-4xl">🌊</div>
              <div className="bg-yellow-400 flex items-center justify-center text-4xl">🏝️</div>
            </div>
          </div>
          {/* Center Pin */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg border-4 border-blue-500 z-10 flex items-center justify-center">
               <Star className={`text-yellow-400 ${spinning ? 'animate-spin' : ''}`} size={30} fill="currentColor" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={spin} 
          disabled={spinning}
          className={`clay-button text-xl px-12 py-4 font-black transition-all ${spinning ? 'bg-gray-200 text-gray-400' : 'bg-yellow-400 text-white hover:scale-110 active:scale-95'}`}
        >
          {spinning ? 'Đang quay...' : 'QUAY NGAY!'}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="clay-inset p-6 space-y-4 bg-white/80"
          >
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg shrink-0">
                <img src={result.image} alt={result.word} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-blue-600">{result.word}</h3>
                  <span className="text-2xl">{result.emoji}</span>
                </div>
                <p className="text-lg font-bold text-gray-700">{result.translation}</p>
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black rounded-md uppercase">
                  {result.zone}
                </span>
              </div>
            </div>
            
            <div className="space-y-3 pt-2 border-t border-blue-100">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Định nghĩa (Oxford Style)</p>
                <p className="text-sm text-gray-600 leading-relaxed italic">{result.definition}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Ví dụ minh họa</p>
                <p className="text-sm text-gray-800 font-medium">"{result.example}"</p>
              </div>
            </div>

            <button 
              onClick={() => onPractice(result)}
              className="w-full clay-button bg-blue-500 text-white py-3 flex items-center justify-center gap-2"
            >
              <Mic size={18} /> Luyện phát âm ngay
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Lịch sử quay</p>
          <div className="flex justify-center gap-2 overflow-x-auto pb-2">
            {history.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="w-12 h-12 rounded-xl bg-white border-2 border-blue-50 flex items-center justify-center text-xl shadow-sm shrink-0 cursor-pointer hover:bg-blue-50"
                onClick={() => setResult(item)}
              >
                {item.emoji}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sentence Builder Game (Drag & Drop) ---
function SentenceBuilderGame() {
  const [currentVocab, setCurrentVocab] = useState<any | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameActive, setGameActive] = useState(false);

  const nextRound = () => {
    const randomZone = ECO_ZONES[Math.floor(Math.random() * ECO_ZONES.length)];
    const vocab = randomZone.vocab[Math.floor(Math.random() * randomZone.vocab.length)];
    setCurrentVocab(vocab);
    
    // Generate options: correct word + 3 random ones
    const allWords = ECO_ZONES.flatMap(z => z.vocab.map(v => v.word));
    const otherWords = allWords.filter(w => w !== vocab.word);
    const shuffledOthers = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3);
    const finalOptions = [vocab.word, ...shuffledOthers].sort(() => 0.5 - Math.random());
    
    setOptions(finalOptions);
    setIsCorrect(null);
  };

  const startGame = () => {
    setScore(0);
    setGameActive(true);
    nextRound();
  };

  const handleDrop = (word: string) => {
    if (word.toLowerCase() === currentVocab.word.toLowerCase()) {
      setIsCorrect(true);
      setScore(s => s + 20);
      playSound('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
      setTimeout(nextRound, 1500);
    } else {
      setIsCorrect(false);
      playSound('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
      setTimeout(() => setIsCorrect(null), 1000);
    }
  };

  if (!gameActive) {
    return (
      <div className="clay-card p-12 text-center space-y-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen size={48} className="text-blue-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-800">Xây dựng câu hoàn chỉnh</h2>
        <p className="text-gray-500 font-medium">Kéo từ vựng đúng vào ô trống để hoàn thành câu!</p>
        <button onClick={startGame} className="clay-button bg-blue-500 text-white text-xl px-12 py-4">BẮT ĐẦU</button>
      </div>
    );
  }

  // Replace the word in example with a blank
  const sentenceParts = currentVocab.example.split(new RegExp(`(${currentVocab.word})`, 'gi'));

  return (
    <div className="clay-card p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">Ghép câu hoàn chỉnh</h2>
        <div className="bg-yellow-100 px-4 py-1 rounded-full text-yellow-600 font-black flex items-center gap-2">
          <Trophy size={18} /> {score}
        </div>
      </div>

      <div className="clay-inset p-8 text-center min-h-[250px] flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        {/* Visual Hint */}
        <div className="absolute top-4 right-4 w-16 h-16 md:w-20 md:h-20 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
           <img src={currentVocab.image} alt="" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
        </div>

        <div className="text-xl md:text-2xl font-bold text-gray-700 leading-relaxed max-w-lg">
          {sentenceParts.map((part: string, i: number) => (
            <span key={i}>
              {part.toLowerCase() === currentVocab.word.toLowerCase() ? (
                <motion.span 
                  animate={isCorrect === true ? { scale: [1, 1.1, 1], color: '#22c55e' } : isCorrect === false ? { x: [-5, 5, -5, 5, 0], color: '#ef4444' } : {}}
                  className={`inline-flex items-center justify-center min-w-[140px] h-12 border-2 border-dashed mx-2 align-middle rounded-xl transition-all duration-300 ${isCorrect === true ? 'border-green-500 bg-green-50' : isCorrect === false ? 'border-red-500 bg-red-50' : 'border-blue-300 bg-blue-50/30'}`}
                >
                  {isCorrect === true ? (
                    <span className="font-black">{currentVocab.word}</span>
                  ) : (
                    <span className="text-blue-300 text-sm animate-pulse">Thả vào đây</span>
                  )}
                </motion.span>
              ) : (
                part
              )}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-2xl border border-white">
          <span className="text-2xl">{currentVocab.emoji}</span>
          <p className="text-sm text-gray-500 font-bold italic">"{currentVocab.translation}"</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((word: string) => (
          <motion.div
            key={word}
            drag
            dragSnapToOrigin
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              // Check if dragged into the upper half of the card (the drop zone)
              if (info.point.y < 400) {
                handleDrop(word);
              }
            }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95, rotate: -1 }}
            className="clay-button bg-white text-blue-600 font-black text-lg py-5 cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl transition-shadow"
          >
            {word}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 text-gray-400">
        <Zap size={14} className="animate-pulse" />
        <p className="text-xs font-bold uppercase tracking-widest">Kéo từ vựng vào ô trống để hoàn thành!</p>
      </div>
    </div>
  );
}

// --- Motion Challenge Game (Head Movement) ---
function MotionChallengeGame() {
  const [gameActive, setGameActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [question, setQuestion] = useState<any | null>(null);
  const [options, setOptions] = useState<{word: string, side: 'left' | 'right'}[]>([]);
  const [detectedSide, setDetectedSide] = useState<'left' | 'right' | null>(null);
  const [selectionProgress, setSelectionProgress] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [motionIntensity, setMotionIntensity] = useState({ left: 0, right: 0 });
  const [trackingPoints, setTrackingPoints] = useState<{x: number, y: number}[]>([]);
  const [showSuccessParticles, setShowSuccessParticles] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Không thể truy cập camera. Hãy kiểm tra quyền truy cập!");
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const nextRound = () => {
    const randomZone = ECO_ZONES[Math.floor(Math.random() * ECO_ZONES.length)];
    const vocab = randomZone.vocab[Math.floor(Math.random() * randomZone.vocab.length)];
    setQuestion(vocab);
    
    const allWords = ECO_ZONES.flatMap(z => z.vocab.map(v => v.word));
    const wrongWord = allWords.filter(w => w !== vocab.word)[Math.floor(Math.random() * (allWords.length - 1))];
    
    const isCorrectLeft = Math.random() > 0.5;
    setOptions([
      { word: isCorrectLeft ? vocab.word : wrongWord, side: 'left' },
      { word: isCorrectLeft ? wrongWord : vocab.word, side: 'right' }
    ]);
    
    setIsCorrect(null);
    setDetectedSide(null);
    setSelectionProgress(0);
    setTimeLeft(15);
  };

  const startGame = () => {
    if (!isCameraReady) {
      startCamera();
      return;
    }
    setScore(0);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameActive(true);
        setCountdown(null);
        nextRound();
      }
    }
  }, [countdown]);

  const detectMotion = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Use a smaller canvas for performance
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (prevFrameRef.current) {
      const prevFrame = prevFrameRef.current;
      let leftMotion = 0;
      let rightMotion = 0;
      const mid = canvas.width / 2;
      const points: {x: number, y: number}[] = [];

      // Sample pixels for performance
      for (let i = 0; i < currentFrame.data.length; i += 32) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        const diff = Math.abs(currentFrame.data[i] - prevFrame.data[i]) +
                     Math.abs(currentFrame.data[i+1] - prevFrame.data[i+1]) +
                     Math.abs(currentFrame.data[i+2] - prevFrame.data[i+2]);
        
        if (diff > 70) { 
          if (x < mid) leftMotion++;
          else rightMotion++;
          
          if (points.length < 15) {
            points.push({ x: (x / canvas.width) * 100, y: (y / canvas.height) * 100 });
          }
        }
      }
      setTrackingPoints(points);

      // Normalize intensity for visual feedback (0-100)
      const maxPossibleMotion = (canvas.width * canvas.height) / 16;
      const leftInt = Math.min(100, (leftMotion / (maxPossibleMotion * 0.1)) * 100);
      const rightInt = Math.min(100, (rightMotion / (maxPossibleMotion * 0.1)) * 100);
      setMotionIntensity({ left: leftInt, right: rightInt });

      // Determine side with more motion (Swapped for mirrored view)
      if (leftInt > 30 && leftInt > rightInt * 1.5) {
        setDetectedSide('right'); // Raw-left is screen-right (User's right)
      } else if (rightInt > 30 && rightInt > leftInt * 1.5) {
        setDetectedSide('left'); // Raw-right is screen-left (User's left)
      } else {
        setDetectedSide(null);
      }
    }

    prevFrameRef.current = currentFrame;
  };

  useEffect(() => {
    if (gameActive) {
      detectionIntervalRef.current = setInterval(detectMotion, 100);
    } else if (isCameraReady) {
      // Keep detection running even when not active to show intensity meters
      detectionIntervalRef.current = setInterval(detectMotion, 100);
    }
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [gameActive, isCameraReady]);

  useEffect(() => {
    if (detectedSide && !isCorrect && gameActive) {
      const timer = setInterval(() => {
        setSelectionProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            const selectedOption = options.find(o => o.side === detectedSide);
            if (selectedOption?.word === question.word) {
              setIsCorrect(true);
              setScore(s => s + 30);
              setShowSuccessParticles(true);
              playSound('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
              setTimeout(() => {
                setShowSuccessParticles(false);
                nextRound();
              }, 1500);
            } else {
              setIsCorrect(false);
              playSound('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
              setTimeout(() => {
                setIsCorrect(null);
                setSelectionProgress(0);
              }, 1000);
            }
            return 100;
          }
          return prev + 10;
        });
      }, 50);
      return () => clearInterval(timer);
    } else if (!detectedSide) {
      setSelectionProgress(0);
    }
  }, [detectedSide, gameActive, isCorrect, options, question]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameActive) {
      nextRound();
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  return (
    <div className="clay-card p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-800">Cử động AI</h2>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Nghiêng đầu để chọn</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-yellow-100 px-4 py-1 rounded-full text-yellow-600 font-black flex items-center gap-2">
            <Trophy size={18} /> {score}
          </div>
          <div className={`px-4 py-1 rounded-full font-black ${timeLeft < 5 ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-inner border-4 border-white group">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
        <canvas ref={canvasRef} width="160" height="120" className="hidden" />
        
        {/* AI Scanning Line */}
        {isCameraReady && (
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[2px] bg-blue-400/30 shadow-[0_0_10px_rgba(96,165,250,0.5)] z-10 pointer-events-none"
          />
        )}

        {/* Tracking Status Badge */}
        {isCameraReady && (
          <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <div className={`w-2 h-2 rounded-full ${detectedSide ? 'bg-green-500 animate-pulse' : 'bg-blue-400'}`} />
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                {detectedSide ? `Đang chọn: ${detectedSide === 'left' ? 'Trái' : 'Phải'}` : 'AI: Đang theo dõi'}
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-widest">
              Góc nhìn gương
            </div>
          </div>
        )}

        {/* Tracking Points */}
        {isCameraReady && trackingPoints.map((p, i) => (
          <motion.div 
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.5 }}
            style={{ left: `${100 - p.x}%`, top: `${p.y}%` }} // Mirrored
            className="absolute w-2 h-2 bg-blue-400 rounded-full blur-[1px] z-20 pointer-events-none"
          />
        ))}

        {/* Success/Fail Flash */}
        <AnimatePresence>
          {isCorrect === true && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-green-400 z-40 pointer-events-none"
            />
          )}
          {showSuccessParticles && (
            <div className="absolute inset-0 z-50 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: '50%', y: '50%', scale: 0 }}
                  animate={{ 
                    x: `${Math.random() * 100}%`, 
                    y: `${Math.random() * 100}%`, 
                    scale: [0, 1, 0],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute w-4 h-4 text-yellow-400"
                >
                  <Star fill="currentColor" />
                </motion.div>
              ))}
            </div>
          )}
          {isCorrect === false && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-400 z-40 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Head Positioning Guide */}
        {!gameActive && countdown === null && isCameraReady && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.02, 1],
                borderColor: (motionIntensity.left > 20 || motionIntensity.right > 20) ? 'rgba(96,165,250,0.8)' : 'rgba(255,255,255,0.4)'
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-48 h-64 border-4 border-dashed rounded-[100px] relative transition-colors duration-300"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/80 px-3 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase whitespace-nowrap shadow-sm">
                Đặt mặt vào đây
              </div>
            </motion.div>
          </div>
        )}

        {/* Countdown Overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div 
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <span className="text-9xl font-black text-white drop-shadow-2xl">
                {countdown > 0 ? countdown : 'GO!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {gameActive && (
          <>
            {/* Overlays */}
            <div className="absolute inset-0 flex">
              {/* Left Side */}
              <div className={`flex-1 flex flex-col items-center justify-center border-r-2 border-white/10 transition-colors relative ${detectedSide === 'left' ? 'bg-blue-500/20' : ''}`}>
                {/* Motion Meter Left */}
                <div className="absolute left-4 bottom-4 w-2 h-24 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ height: `${motionIntensity.left}%` }}
                    className="absolute bottom-0 w-full bg-blue-400"
                  />
                </div>

                <div className={`clay-card p-4 text-center min-w-[140px] transition-all duration-300 relative z-10 ${isCorrect === true && detectedSide === 'left' ? 'bg-green-500 text-white scale-110' : isCorrect === false && detectedSide === 'left' ? 'bg-red-500 text-white' : 'bg-white/90'} ${detectedSide === 'left' ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-transparent shadow-[0_0_20px_rgba(96,165,250,0.6)]' : ''}`}>
                  {detectedSide === 'left' && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-blue-100" />
                        <motion.circle 
                          cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" 
                          strokeDasharray="113.1"
                          animate={{ strokeDashoffset: 113.1 - (113.1 * selectionProgress) / 100 }}
                          className="text-blue-500"
                        />
                      </svg>
                    </div>
                  )}
                  <p className="font-black text-lg">{options[0]?.word}</p>
                </div>
              </div>

              {/* Right Side */}
              <div className={`flex-1 flex flex-col items-center justify-center transition-colors relative ${detectedSide === 'right' ? 'bg-blue-500/20' : ''}`}>
                {/* Motion Meter Right */}
                <div className="absolute right-4 bottom-4 w-2 h-24 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ height: `${motionIntensity.right}%` }}
                    className="absolute bottom-0 w-full bg-blue-400"
                  />
                </div>

                <div className={`clay-card p-4 text-center min-w-[140px] transition-all duration-300 relative z-10 ${isCorrect === true && detectedSide === 'right' ? 'bg-green-500 text-white scale-110' : isCorrect === false && detectedSide === 'right' ? 'bg-red-500 text-white' : 'bg-white/90'} ${detectedSide === 'right' ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-transparent shadow-[0_0_20px_rgba(96,165,250,0.6)]' : ''}`}>
                  {detectedSide === 'right' && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-blue-100" />
                        <motion.circle 
                          cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" 
                          strokeDasharray="113.1"
                          animate={{ strokeDashoffset: 113.1 - (113.1 * selectionProgress) / 100 }}
                          className="text-blue-500"
                        />
                      </svg>
                    </div>
                  )}
                  <p className="font-black text-lg">{options[1]?.word}</p>
                </div>
              </div>
            </div>

            {/* Question Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <div className="bg-white/90 px-6 py-2 rounded-full shadow-lg border-2 border-blue-100 flex items-center gap-3">
                <span className="text-2xl">{question?.emoji}</span>
                <p className="font-black text-blue-600">Tìm: {question?.translation}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                <img src={question?.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </>
        )}

        {!gameActive && countdown === null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center space-y-6 p-6">
              {cameraError ? (
                <div className="bg-red-500/20 p-6 rounded-3xl border-2 border-red-500/50 text-white">
                  <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                  <h3 className="text-xl font-black mb-2">Lỗi Camera</h3>
                  <p className="text-sm font-bold opacity-80 mb-6">{cameraError}</p>
                  <button onClick={startCamera} className="clay-button bg-white text-red-500 w-full">THỬ LẠI</button>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Camera size={40} className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Sẵn sàng chưa?</h3>
                    <p className="text-blue-200 font-bold">Nghiêng đầu để chọn đáp án đúng</p>
                  </div>
                  <button onClick={startGame} className="clay-button bg-green-500 text-white text-xl px-12 py-4">BẮT ĐẦU CHƠI</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-center space-y-4">
        <div className="flex justify-center gap-12">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${detectedSide === 'left' ? 'bg-blue-500 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-400'}`}>
              <ChevronLeft size={24} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${detectedSide === 'left' ? 'text-blue-500' : 'text-gray-400'}`}>Nghiêng Trái</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${detectedSide === 'right' ? 'bg-blue-500 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-400'}`}>
              <ChevronRight size={24} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${detectedSide === 'right' ? 'text-blue-500' : 'text-gray-400'}`}>Nghiêng Phải</span>
          </div>
        </div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Giữ im đầu để xác nhận lựa chọn!</p>
      </div>
    </div>
  );
}

// --- Find the Treasure Game (With Timer & Levels) ---
function TreasureGame() {
  const [target, setTarget] = useState<any | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [message, setMessage] = useState("Sẵn sàng tìm báu vật chưa?");
  const [showChest, setShowChest] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextRound = () => {
    const randomZone = ECO_ZONES[Math.floor(Math.random() * ECO_ZONES.length)];
    const randomWord = randomZone.vocab[Math.floor(Math.random() * randomZone.vocab.length)];
    setTarget({ 
      word: randomWord.word, 
      translation: randomWord.translation,
      image: randomWord.image,
      emoji: randomWord.emoji,
      zoneId: randomZone.id 
    });
    setMessage(`Hãy tìm: ${randomWord.word}!`);
    // Difficulty increases with level
    setTimeLeft(Math.max(3, 10 - Math.floor(level / 2)));
    setShowChest(false);
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setGameActive(true);
    nextRound();
  };

  const handleZoneClick = (zoneId: string) => {
    if (!gameActive || !target || showChest) return;
    
    if (zoneId === target.zoneId) {
      setScore(s => s + 10);
      setLevel(l => l + 1);
      setShowChest(true);
      playSound('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
      setTimeout(nextRound, 1000);
    } else {
      playSound('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
      setTimeLeft(t => Math.max(0, t - 2)); // Penalty
    }
  };

  useEffect(() => {
    if (gameActive && timeLeft > 0 && !showChest) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      setMessage("HẾT GIỜ RỒI! ⌛");
      playSound('https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive, timeLeft, showChest]);

  return (
    <div className="clay-card p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-800">Tìm báu vật</h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-black rounded-md uppercase">Cấp độ {level}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-yellow-100 px-4 py-1 rounded-full text-yellow-600 font-black flex items-center gap-2">
            <Trophy size={18} /> {score}
          </div>
          <div className={`px-4 py-1 rounded-full font-black flex items-center gap-2 ${timeLeft < 4 ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      <div className="clay-inset p-6 text-center min-h-[180px] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        {showChest && (
          <motion.div 
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1.5, y: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-yellow-400/20 backdrop-blur-sm"
          >
            <span className="text-8xl">🎁</span>
          </motion.div>
        )}

        {!gameActive && score > 0 ? (
          <div className="space-y-4">
            <p className="text-2xl font-black text-gray-800">KẾT QUẢ: {score} ĐIỂM!</p>
            <p className="text-gray-500 font-bold">Bạn đã đạt đến Cấp độ {level}</p>
            <button onClick={startGame} className="clay-button bg-blue-500 text-white">Chơi lại</button>
          </div>
        ) : !gameActive ? (
          <div className="space-y-4">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <Trophy size={40} className="text-yellow-500" />
            </div>
            <button onClick={startGame} className="clay-button bg-green-500 text-white text-xl px-12">BẮT ĐẦU CHƠI</button>
          </div>
        ) : (
          <>
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <div className="w-full h-full rounded-3xl overflow-hidden shadow-lg border-4 border-white aspect-square">
                <img 
                  src={target?.image} 
                  alt={target?.word} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -top-3 -right-3 bg-white rounded-full w-12 h-12 flex items-center justify-center text-3xl shadow-lg border-2 border-blue-100">
                {target?.emoji}
              </div>
            </div>
            <p className="text-2xl font-black text-blue-600 uppercase tracking-widest">{message}</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 aspect-square">
        {ECO_ZONES.map(zone => (
          <motion.button 
            key={zone.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleZoneClick(zone.id)}
            disabled={!gameActive || showChest}
            className={`clay-card relative overflow-hidden flex flex-col items-center justify-center gap-2 transition-all ${!gameActive ? 'opacity-50 grayscale' : 'hover:shadow-xl active:bg-blue-50'}`}
          >
            <div className={`absolute inset-0 opacity-10 ${zone.color}`} />
            <span className="text-5xl z-10">{zone.icon}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest z-10">{zone.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// --- Zone Detail View ---
function ZoneView({ onPractice }: { onPractice: (vocab: any) => void }) {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const zone = ECO_ZONES.find(z => z.id === zoneId);
  const [showVideo, setShowVideo] = useState(false);

  if (!zone) return <div>Zone not found</div>;

  return (
    <div className="space-y-8">
      <div className="clay-card p-8 text-center relative overflow-hidden">
        <div className={`absolute inset-0 opacity-10 ${zone.color}`} />
        <span className="text-8xl mb-4 block animate-bounce">{zone.icon}</span>
        <h2 className="text-4xl font-black text-gray-800 mb-2">{zone.name}</h2>
        <p className="text-gray-500 font-medium mb-6">{zone.description}</p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate(`/${zone.id}/dictionary`)} className="clay-button bg-blue-50 text-blue-600 flex items-center gap-2">
            <Book size={20} /> Từ điển
          </button>
          <button onClick={() => setShowVideo(true)} className="clay-button bg-purple-50 text-purple-600 flex items-center gap-2">
            <Play size={20} /> Xem Video (QR)
          </button>
          <button onClick={() => playSound(zone.sound)} className="clay-button bg-green-50 text-green-600 flex items-center gap-2">
            <Volume2 size={20} /> Nghe âm thanh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zone.vocab.map((item) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={item.word} 
            className="clay-card p-4 flex gap-4 items-center"
          >
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 aspect-square relative">
              <img 
                src={item.image} 
                alt={item.word} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-1 right-1 bg-white/80 rounded-lg p-1 text-lg shadow-sm">
                {item.emoji}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-gray-800 truncate flex items-center gap-2">
                {item.word}
              </h4>
              <p className="text-blue-500 font-medium text-sm mb-2 truncate">{item.translation}</p>
              <button 
                onClick={() => onPractice(item)}
                className="text-xs font-black uppercase tracking-widest text-white bg-green-500 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-600 transition-colors w-fit"
              >
                <Mic2 size={12} /> Voice Master
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Modal Simulation */}
      <AnimatePresence>
        {showVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="clay-card w-full max-w-2xl p-4 relative">
              <button onClick={() => setShowVideo(false)} className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow-lg z-10">
                <X size={24} />
              </button>
              <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center text-white">
                <div className="text-center">
                  <Play size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold">Video giới thiệu hệ sinh thái {zone.name}</p>
                  <p className="text-sm opacity-60">(Song ngữ Anh - Việt)</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Dictionary View ---
function DictionaryView({ onPractice }: { onPractice: (vocab: any) => void }) {
  const { zoneId } = useParams();
  const zone = ECO_ZONES.find(z => z.id === zoneId);

  if (!zone) return <div>Zone not found</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-gray-800">Từ điển: {zone.name}</h2>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
          <BookOpen size={20} className="text-blue-500" />
          <span className="text-sm font-black text-blue-600 uppercase tracking-widest">{zone.vocab.length} Words</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {zone.vocab.map((item, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={item.word} 
            className="clay-card p-0 overflow-hidden flex flex-col md:flex-row group hover:shadow-2xl transition-all duration-500"
          >
            {/* Image Section */}
            <div className="w-full md:w-80 h-64 md:h-auto relative overflow-hidden flex-shrink-0">
              <img 
                src={item.image} 
                alt={item.word} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-4 left-4 bg-white/90 rounded-2xl p-3 text-4xl shadow-xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                {item.emoji}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-8 flex flex-col justify-between bg-white relative">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-5xl font-black text-blue-600 mb-1 tracking-tight">
                      {item.word}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-blue-400">{item.translation}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest italic">noun</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                    <Volume2 size={24} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="clay-inset p-4 bg-gray-50/50 border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Definition
                    </p>
                    <p className="text-gray-700 text-base leading-relaxed font-medium">
                      {item.definition}
                    </p>
                  </div>

                  <div className="clay-inset p-4 bg-green-50/30 border-green-100">
                    <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Example Sentence
                    </p>
                    <p className="text-gray-600 italic text-base leading-relaxed">
                      "{item.example}"
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onPractice(item)}
                className="clay-button py-4 mt-8 text-lg font-black flex items-center gap-3 w-full justify-center bg-green-500 text-white hover:bg-green-600 transform hover:-translate-y-1 transition-all"
              >
                <Mic2 size={24} /> LUYỆN PHÁT ÂM AI
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Main App Shell ---
function MainContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [speakingVocab, setSpeakingVocab] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'explorer' | 'wheel' | 'game' | 'sentences' | 'motion'>('map');

  return (
    <div className="max-w-5xl mx-auto min-h-screen flex flex-col p-4 md:p-8 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <Link to="/" onClick={() => setActiveTab('map')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <MapIcon size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 leading-none">EcoAdventure</h1>
            <span className="text-green-500 font-bold text-xs tracking-wider uppercase">Khám phá Thế giới Xanh</span>
          </div>
        </Link>
        
        {location.pathname !== '/' && (
          <button 
            onClick={() => navigate(-1)}
            className="clay-button flex items-center gap-2 text-gray-600"
          >
            <ChevronLeft size={20} /> Quay lại
          </button>
        )}
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <div className="space-y-12">
              {/* Tab Navigation */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { id: 'map', icon: <MapIcon size={18} />, label: 'Bản đồ' },
                  { id: 'explorer', icon: <Camera size={18} />, label: 'Thám hiểm' },
                  { id: 'wheel', icon: <RefreshCw size={18} />, label: 'Vòng quay' },
                  { id: 'sentences', icon: <BookOpen size={18} />, label: 'Ghép câu' },
                  { id: 'motion', icon: <Zap size={18} />, label: 'Cử động' },
                  { id: 'game', icon: <Trophy size={18} />, label: 'Báu vật' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`clay-button flex items-center gap-2 px-4 py-2 text-sm ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'text-gray-600 bg-white/50'}`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'map' && <MapView />}
                  {activeTab === 'explorer' && <ExplorerMode />}
                  {activeTab === 'wheel' && <VocabularyWheel onPractice={setSpeakingVocab} />}
                  {activeTab === 'sentences' && <SentenceBuilderGame />}
                  {activeTab === 'motion' && <MotionChallengeGame />}
                  {activeTab === 'game' && <TreasureGame />}
                </motion.div>
              </AnimatePresence>

              {/* Project Info & Message */}
              <div className="clay-card p-8 bg-green-50 border-green-100 text-center">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-2xl font-black text-green-700 mb-2 italic">"Protect our forest, protect our world"</h3>
                <p className="text-green-600 font-medium mb-6">Bảo vệ rừng xanh, bảo vệ thế giới của chúng ta.</p>
                <div className="flex flex-col items-center gap-2 pt-4 border-t border-green-200">
                  <p className="text-xs font-black text-green-800 uppercase tracking-widest">Đội ngũ sáng tạo</p>
                  <p className="text-sm font-bold text-gray-600">Nguyễn Duy • Thư Lộc • Gia Phú • Đăng Khương</p>
                </div>
              </div>
            </div>
          } />
          <Route path="/:zoneId" element={<ZoneView onPractice={setSpeakingVocab} />} />
          <Route path="/:zoneId/dictionary" element={<DictionaryView onPractice={setSpeakingVocab} />} />
        </Routes>
      </main>

      {/* Speaking Lab Modal */}
      <AnimatePresence>
        {speakingVocab && (
          <SpeakingLab 
            vocab={speakingVocab} 
            onClose={() => setSpeakingVocab(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainContent />
    </BrowserRouter>
  );
}
