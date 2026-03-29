import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Play, RotateCcw, Star, Volume2, X } from 'lucide-react';
import { evaluatePronunciation } from '../services/geminiService';

interface SpeakingLabProps {
  word: string;
  onClose: () => void;
}

export const SpeakingLab: React.FC<SpeakingLabProps> = ({ word, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div className="clay-card w-full max-w-md p-8 relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-blue-600 mb-2">{word}</h2>
          <p className="text-gray-500 font-medium">Listen and repeat!</p>
        </div>

        <div className="flex justify-center gap-6 mb-10">
          <button 
            onClick={playNative}
            className="clay-button flex flex-col items-center gap-2 bg-blue-50 text-blue-600"
          >
            <Volume2 size={32} />
            <span className="text-xs">Listen</span>
          </button>

          <button 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`clay-button flex flex-col items-center gap-2 transition-all ${isRecording ? 'bg-red-500 text-white scale-110' : 'bg-red-50 text-red-500'}`}
          >
            <Mic size={32} />
            <span className="text-xs">{isRecording ? 'Recording...' : 'Hold to Speak'}</span>
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
                className="clay-button bg-green-500 text-white w-full"
              >
                {loading ? 'Analyzing...' : 'Check My Voice!'}
              </button>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="clay-inset p-6 text-center"
            >
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={24} 
                    fill={i < result.score ? "#fbbf24" : "none"} 
                    color={i < result.score ? "#fbbf24" : "#d1d5db"} 
                  />
                ))}
              </div>
              <p className="font-bold text-gray-700">{result.feedback}</p>
              <button 
                onClick={() => {setResult(null); setAudioBlob(null);}}
                className="mt-4 text-blue-500 font-bold flex items-center justify-center gap-2 w-full"
              >
                <RotateCcw size={16} /> Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
