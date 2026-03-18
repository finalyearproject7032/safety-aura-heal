import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Camera, MapPin, PhoneCall, Shield, MicOff } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/Navigation';
import { mockSafeZones } from '@/data/mockData';

// Extend Window for SpeechRecognition
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

const EMERGENCY_KEYWORDS = ['help me', 'emergency', 'help', 'bachao', 'mayday', 'sos'];

const WomenSafetyPage: React.FC = () => {
  const navigate = useNavigate();
  const { triggerSOS, user } = useApp();
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'detected' | 'error'>('idle');
  const [lastHeard, setLastHeard] = useState('');
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const recInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const restartRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRecognition = useCallback(() => {
    if (restartRef.current) clearTimeout(restartRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setVoiceStatus('idle');
  }, []);

  const startRecognition = useCallback(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceStatus('error');
      return;
    }

    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-IN';

    rec.onstart = () => setVoiceStatus('listening');

    rec.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        setLastHeard(transcript);
        const matched = EMERGENCY_KEYWORDS.some(kw => transcript.includes(kw));
        if (matched) {
          setVoiceStatus('detected');
          triggerSOS();
          // Brief pause then resume listening
          restartRef.current = setTimeout(() => {
            if (voiceOn) startRecognition();
          }, 3000);
          return;
        }
      }
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'not-allowed') {
        setVoiceStatus('error');
        return;
      }
      // Auto-restart on other errors
      restartRef.current = setTimeout(() => {
        if (recognitionRef.current) startRecognition();
      }, 1000);
    };

    rec.onend = () => {
      // Auto-restart when it ends naturally (it stops after silence)
      if (recognitionRef.current) {
        restartRef.current = setTimeout(() => startRecognition(), 300);
      }
    };

    recognitionRef.current = rec;
    try { rec.start(); } catch { /* ignore duplicate start */ }
  }, [triggerSOS, voiceOn]);

  useEffect(() => {
    if (voiceOn) {
      startRecognition();
    } else {
      stopRecognition();
      setLastHeard('');
    }
    return () => stopRecognition();
  }, [voiceOn]);

  const toggleVoice = () => setVoiceOn(v => !v);

  const toggleRecording = () => {
    if (!recording) {
      setRecording(true);
      setRecTime(0);
      recInterval.current = setInterval(() => setRecTime(t => t + 1), 1000);
    } else {
      setRecording(false);
      if (recInterval.current) clearInterval(recInterval.current);
    }
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      <div className="fixed top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-10" style={{ background: 'hsl(var(--safety))' }} />
      <div className="max-w-lg mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 py-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold">Women Safety Center</h1>
            <p className="text-xs" style={{ color: 'hsl(var(--safety))' }}>💖 Safety Mode Active</p>
          </div>
          <span className="badge-safety ml-auto"><span className="pulse-dot pulse-dot-rose" />Protected</span>
        </motion.div>

        {/* SOS panic */}
        <motion.button whileTap={{ scale: 0.95 }} onClick={triggerSOS}
          className="w-full h-28 rounded-2xl mb-5 relative overflow-hidden flex items-center justify-center gap-3"
          style={{ background: 'linear-gradient(135deg, hsl(0,84%,50%), hsl(0,84%,28%))' }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
          <Shield size={32} className="text-white relative z-10" />
          <div className="relative z-10">
            <div className="font-display font-black text-xl text-white">PANIC SOS</div>
            <div className="text-white/60 text-xs">Sends alert to all emergency contacts</div>
          </div>
        </motion.button>

        {/* Voice SOS */}
        <div className={`rounded-2xl p-4 mb-4 transition-all ${voiceStatus === 'detected' ? 'bg-emergency/20 border border-emergency/40' : 'glass-safety'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {voiceOn && voiceStatus === 'listening'
                ? <Mic size={18} className="animate-pulse" style={{ color: 'hsl(var(--safety))' }} />
                : voiceStatus === 'error'
                  ? <MicOff size={18} style={{ color: 'hsl(var(--emergency))' }} />
                  : <Mic size={18} style={{ color: 'hsl(var(--safety))' }} />
              }
              <div>
                <div className="font-semibold text-sm">Voice SOS Trigger</div>
                <div className="text-xs text-muted-foreground">
                  {voiceStatus === 'error' ? 'Mic permission denied' : 'Say "Help me" or "Emergency"'}
                </div>
              </div>
            </div>
            <button onClick={toggleVoice}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${voiceOn ? 'bg-safety' : 'bg-surface-3 border border-border'}`}>
              <motion.div animate={{ x: voiceOn ? 24 : 2 }} className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>
          {voiceOn && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-safety/20">
              {voiceStatus === 'error' ? (
                <div className="text-xs text-emergency flex items-center gap-2">
                  <MicOff size={12} /> Please allow microphone access in your browser settings
                </div>
              ) : voiceStatus === 'detected' ? (
                <div className="flex items-center gap-2 text-xs text-emergency font-bold">
                  <div className="w-2 h-2 rounded-full bg-emergency animate-ping" />
                  🚨 Keyword detected! SOS triggered!
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-safety">
                  <div className="flex gap-0.5 items-end">
                    {[1,2,3,4,5].map(i => (
                      <motion.div key={i} className="w-0.5 rounded-full bg-safety"
                        animate={{ height: ['6px', `${8 + i * 4}px`, '6px'] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }} />
                    ))}
                  </div>
                  <span>{voiceStatus === 'listening' ? `Listening…${lastHeard ? ` "${lastHeard}"` : ''}` : 'Starting mic…'}</span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Auto Recording */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Camera size={18} style={{ color: recording ? 'hsl(var(--emergency))' : 'hsl(var(--muted-foreground))' }} />
              <div>
                <div className="font-semibold text-sm">Auto Recording</div>
                <div className="text-xs text-muted-foreground">Cloud sync enabled</div>
              </div>
            </div>
            <button onClick={toggleRecording}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${recording ? 'bg-emergency/15 text-emergency border border-emergency/30' : 'bg-surface-2 text-muted-foreground border border-border'}`}>
              {recording ? 'STOP' : 'START'}
            </button>
          </div>
          {recording && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-2 rounded-lg bg-emergency/10">
              <div className="w-2 h-2 rounded-full bg-emergency animate-blink-rec" />
              <span className="text-xs font-mono text-emergency">REC {fmt(recTime)}</span>
              <span className="text-xs text-muted-foreground ml-auto">Uploading to cloud...</span>
            </motion.div>
          )}
        </div>

        {/* Safe Zones */}
        <div className="font-display font-semibold text-sm mb-3">Nearby Safe Zones</div>
        <div className="space-y-2 mb-4">
          {mockSafeZones.map(z => (
            <motion.div key={z.id} whileHover={{ x: 3 }}
              className="flex items-center justify-between p-3 rounded-xl glass-card cursor-pointer">
              <div className="flex items-center gap-3">
                <MapPin size={15} style={{ color: 'hsl(var(--safety))' }} />
                <div>
                  <div className="text-sm font-medium">{z.name}</div>
                  <div className="text-[10px] text-muted-foreground">{z.distance}</div>
                </div>
              </div>
              <span className="badge-success">Navigate</span>
            </motion.div>
          ))}
        </div>

        {/* Helplines */}
        <div className="font-display font-semibold text-sm mb-3">Emergency Helplines</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "Women's Helpline", num: '1091' },
            { name: 'Police', num: '100' },
            { name: 'Ambulance', num: '108' },
            { name: 'National Emergency', num: '112' },
          ].map(h => (
            <motion.a key={h.num} href={`tel:${h.num}`} whileHover={{ y: -2 }}
              className="p-3 rounded-xl glass-safety flex items-center gap-2 cursor-pointer">
              <PhoneCall size={14} style={{ color: 'hsl(var(--safety))' }} />
              <div>
                <div className="text-xs font-semibold">{h.name}</div>
                <div className="font-mono text-xs text-muted-foreground">{h.num}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
      <BottomNav isFemale />
    </div>
  );
};

export default WomenSafetyPage;
