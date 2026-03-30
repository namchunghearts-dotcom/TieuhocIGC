import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Play, RotateCcw, Star, Volume2, X } from 'lucide-react';
import { evaluatePronunciation } from '../services/geminiService';

interface SpeakingLabProps {
  vocab: {
    word: string;
    translation: string;
    image: string;
    definition: string;
    example: string;
  };
  onClose: () => void;
}

export const SpeakingLab: React.FC<SpeakingLabProps> = ({ vocab, onClose }) => {
  const { word, translation, image, definition, example, emoji } = vocab;
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [result, setResult] = useState<{ 
    accuracy: number; 
    fluency: number; 
    pronunciation: number; 
    overallScore: number; 
    feedback: string; 
    tips: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleEvaluate = async () => {
    if (!audioBlob) return;
    setLoading(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(',')[1];
      const evaluation = await evaluatePronunciation(word, base64Audio);
      setResult(evaluation);
      setLoading(false);
    };
  };

  const playNative = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="clay-card w-full max-w-2xl p-6 md:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden shadow-xl border-4 border-white flex-shrink-0 aspect-square relative">
            <img 
              src={image} 
              alt={word} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 right-2 bg-white/90 rounded-2xl p-3 text-4xl shadow-lg">
              {emoji}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-blue-600 mb-1">{word}</h2>
            <p className="text-xl font-bold text-blue-400 mb-4">{translation}</p>
            
            <div className="clay-inset p-4 text-left bg-white/50">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Oxford Definition</p>
              <p className="text-gray-700 text-sm mb-3 font-medium leading-relaxed">{definition}</p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Example</p>
              <p className="text-gray-600 italic text-sm">"{example}"</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button 
            onClick={playNative}
            className="clay-button flex items-center justify-center gap-3 bg-blue-50 text-blue-600 py-4"
          >
            <Volume2 size={24} />
            <span className="font-black uppercase tracking-wider">Listen Native</span>
          </button>

          <button 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`clay-button flex items-center justify-center gap-3 transition-all py-4 ${isRecording ? 'bg-red-500 text-white scale-105 shadow-red-200' : 'bg-red-50 text-red-500'}`}
          >
            <Mic size={24} />
            <span className="font-black uppercase tracking-wider">{isRecording ? 'Recording...' : 'Hold to Speak'}</span>
          </button>
        </div>

        <AnimatePresence>
          {audioBlob && !isRecording && !result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <button 
                onClick={handleEvaluate}
                disabled={loading}
                className="clay-button bg-green-500 text-white w-full py-4 text-lg font-black uppercase tracking-widest"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RotateCcw className="animate-spin" size={20} /> AI Analyzing...
                  </span>
                ) : 'Check My Pronunciation!'}
              </button>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="clay-inset p-6 bg-yellow-50/50 border-yellow-100"
            >
              <div className="flex justify-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star 
                      size={32} 
                      fill={i < result.overallScore ? "#fbbf24" : "none"} 
                      color={i < result.overallScore ? "#fbbf24" : "#d1d5db"} 
                    />
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Accuracy', value: result.accuracy, color: 'text-green-500' },
                  { label: 'Fluency', value: result.fluency, color: 'text-blue-500' },
                  { label: 'Pronunciation', value: result.pronunciation, color: 'text-purple-500' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-xl font-black ${stat.color}`}>{stat.value}%</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="text-left space-y-4">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">AI Feedback</p>
                  <p className="font-bold text-gray-800 leading-relaxed">{result.feedback}</p>
                </div>
                <div className="bg-white/60 p-3 rounded-xl border border-yellow-200">
                  <p className="text-xs font-black text-yellow-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Pro Tip
                  </p>
                  <p className="text-sm font-medium text-gray-700 italic">{result.tips}</p>
                </div>
              </div>
              
              <button 
                onClick={() => {setResult(null); setAudioBlob(null);}}
                className="mt-6 clay-button bg-white text-blue-500 font-black flex items-center justify-center gap-2 w-full"
              >
                <RotateCcw size={18} /> Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
