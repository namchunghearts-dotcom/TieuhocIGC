import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { ECO_ZONES, EcoZone } from './constants';
import { Book, Gamepad2, Mic2, Map as MapIcon, ChevronLeft, Camera, Scan, Play, RefreshCw, Trophy, Info, X, Volume2 } from 'lucide-react';
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
  const [detected, setDetected] = useState<{ zone: EcoZone, object: string } | null>(null);
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
          setDetected({ zone, object: result.detectedObject });
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
              <motion.span 
                animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-9xl mb-4 drop-shadow-2xl"
              >
                {detected.zone.icon}
              </motion.span>
              <h3 className="text-3xl font-black text-blue-600 mb-2">PHÁT HIỆN: {detected.object}!</h3>
              <p className="text-gray-600 mb-6">Hiệu ứng {detected.zone.name} đang hiển thị trên mô hình của bạn!</p>
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
function VocabularyWheel({ onPractice }: { onPractice: (word: string) => void }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{word: string, zone: string} | null>(null);

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
      setResult({ word: randomWord.word, zone: zone.name });
      setSpinning(false);
      playSound('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'); // Win sound
    }, 3000);
  };

  return (
    <div className="clay-card p-8 flex flex-col items-center gap-6 overflow-hidden">
      <h2 className="text-2xl font-black text-gray-800">Vòng quay Từ vựng</h2>
      
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        <motion.div 
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "circOut" }}
          className="w-full h-full rounded-full border-[12px] border-white shadow-2xl overflow-hidden relative"
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
            <div className="w-12 h-12 bg-white rounded-full shadow-lg border-4 border-blue-500 z-10" />
          </div>
        </motion.div>
        
        {/* Pointer */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-blue-600 z-20 drop-shadow-lg" />
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ scale: 0, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            className="text-center bg-blue-50 p-6 rounded-3xl w-full border-2 border-blue-100"
          >
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{result.zone}</p>
            <h3 className="text-4xl font-black text-blue-600 mb-4">{result.word}</h3>
            <button onClick={() => onPractice(result.word)} className="clay-button py-3 px-8 bg-green-500 text-white flex items-center gap-2 mx-auto">
              <Mic2 size={20} /> Luyện phát âm ngay
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        disabled={spinning}
        onClick={spin} 
        className={`clay-button w-full py-4 text-xl font-black uppercase tracking-widest transition-all ${spinning ? 'bg-gray-200 text-gray-400' : 'bg-yellow-400 text-white hover:bg-yellow-500'}`}
      >
        {spinning ? 'Đang quay...' : 'QUAY NGAY!'}
      </button>
    </div>
  );
}

// --- Find the Treasure Game (With Timer & Levels) ---
function TreasureGame() {
  const [target, setTarget] = useState<{word: string, zoneId: string} | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(false);
  const [message, setMessage] = useState("Sẵn sàng tìm báu vật chưa?");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextRound = () => {
    const randomZone = ECO_ZONES[Math.floor(Math.random() * ECO_ZONES.length)];
    const randomWord = randomZone.vocab[Math.floor(Math.random() * randomZone.vocab.length)];
    setTarget({ word: randomWord.word, zoneId: randomZone.id });
    setMessage(`Hãy tìm: ${randomWord.word}!`);
    setTimeLeft(10);
  };

  const startGame = () => {
    setScore(0);
    setGameActive(true);
    nextRound();
  };

  const handleZoneClick = (zoneId: string) => {
    if (!gameActive || !target) return;
    
    if (zoneId === target.zoneId) {
      setScore(s => s + 10);
      playSound('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
      nextRound();
    } else {
      playSound('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
      setTimeLeft(t => Math.max(0, t - 2)); // Penalty
    }
  };

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
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
  }, [gameActive, timeLeft]);

  return (
    <div className="clay-card p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">Thử thách Tìm báu vật</h2>
        <div className="flex gap-4">
          <div className="bg-yellow-100 px-4 py-1 rounded-full text-yellow-600 font-black flex items-center gap-2">
            <Trophy size={18} /> {score}
          </div>
          <div className={`px-4 py-1 rounded-full font-black flex items-center gap-2 ${timeLeft < 4 ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      <div className="clay-inset p-6 text-center min-h-[100px] flex items-center justify-center">
        {!gameActive && score > 0 ? (
          <div className="space-y-4">
            <p className="text-2xl font-black text-gray-800">KẾT QUẢ: {score} ĐIỂM!</p>
            <button onClick={startGame} className="clay-button bg-blue-500 text-white">Chơi lại</button>
          </div>
        ) : !gameActive ? (
          <button onClick={startGame} className="clay-button bg-green-500 text-white text-xl px-12">BẮT ĐẦU CHƠI</button>
        ) : (
          <p className="text-2xl font-black text-blue-600 uppercase tracking-widest">{message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 aspect-square">
        {ECO_ZONES.map(zone => (
          <motion.button 
            key={zone.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleZoneClick(zone.id)}
            disabled={!gameActive}
            className={`clay-card relative overflow-hidden flex items-center justify-center text-6xl transition-all ${!gameActive ? 'opacity-50 grayscale' : 'hover:shadow-xl'}`}
          >
            <div className={`absolute inset-0 opacity-10 ${zone.color}`} />
            <span className="z-10">{zone.icon}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// --- Zone Detail View ---
function ZoneView({ onPractice }: { onPractice: (word: string) => void }) {
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
            <img 
              src={item.image} 
              alt={item.word} 
              className="w-24 h-24 rounded-2xl object-cover shadow-inner"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-800">{item.word}</h4>
              <p className="text-blue-500 font-medium text-sm mb-2">{item.translation}</p>
              <button 
                onClick={() => onPractice(item.word)}
                className="text-xs font-black uppercase tracking-widest text-white bg-green-500 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-600 transition-colors"
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
function DictionaryView({ onPractice }: { onPractice: (word: string) => void }) {
  const { zoneId } = useParams();
  const zone = ECO_ZONES.find(z => z.id === zoneId);

  if (!zone) return <div>Zone not found</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-gray-800 mb-6">Từ điển hình ảnh: {zone.name}</h2>
      {zone.vocab.map((item) => (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          key={item.word} 
          className="clay-card p-6 flex flex-col md:flex-row gap-6"
        >
          <img 
            src={item.image} 
            alt={item.word} 
            className="w-full md:w-48 h-32 rounded-2xl object-cover shadow-md"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-black text-blue-600">{item.word}</h3>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold text-gray-500">{item.translation}</span>
            </div>
            <p className="text-gray-600 italic mb-4">"{item.example}"</p>
            <button 
              onClick={() => onPractice(item.word)}
              className="clay-button py-2 text-sm flex items-center gap-2"
            >
              <Mic2 size={16} /> Luyện phát âm
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// --- Main App Shell ---
function MainContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'explorer' | 'wheel' | 'game'>('map');

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
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { id: 'map', icon: <MapIcon size={20} />, label: 'Bản đồ' },
                  { id: 'explorer', icon: <Camera size={20} />, label: 'Thám hiểm' },
                  { id: 'wheel', icon: <RefreshCw size={20} />, label: 'Vòng quay' },
                  { id: 'game', icon: <Trophy size={20} />, label: 'Trò chơi' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`clay-button flex items-center gap-2 ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
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
                  {activeTab === 'wheel' && <VocabularyWheel onPractice={setSpeakingWord} />}
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
          <Route path="/:zoneId" element={<ZoneView onPractice={setSpeakingWord} />} />
          <Route path="/:zoneId/dictionary" element={<DictionaryView onPractice={setSpeakingWord} />} />
        </Routes>
      </main>

      {/* Speaking Lab Modal */}
      <AnimatePresence>
        {speakingWord && (
          <SpeakingLab 
            word={speakingWord} 
            onClose={() => setSpeakingWord(null)} 
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
