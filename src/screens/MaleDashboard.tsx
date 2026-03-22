import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Calendar, Activity, MapPin, FileText,
  Heart, Thermometer, Wind, LogOut, Brain, ChevronRight, Mic, MicOff
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav, Sidebar } from '@/components/Navigation';
import { VitalCard, SectionTitle, StaggerList, DashboardSkeleton } from '@/components/UIComponents';
import SOSOverlay from '@/components/SOSOverlay';
import { mockDoctors, mockAppointments } from '@/data/mockData';

// SpeechRecognition types
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

const MaleDashboard: React.FC = () => {
  const { user, isSOS, triggerSOS, setUser } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [heartRate, setHeartRate] = useState(72);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'detected' | 'error'>('idle');
  const [lastHeard, setLastHeard] = useState('');
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
    if (!SpeechRec) { setVoiceStatus('error'); return; }

    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-IN';

    rec.onstart = () => setVoiceStatus('listening');

    rec.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        setLastHeard(transcript);
        if (EMERGENCY_KEYWORDS.some(kw => transcript.includes(kw))) {
          setVoiceStatus('detected');
          triggerSOS();
          restartRef.current = setTimeout(() => { if (voiceOn) startRecognition(); }, 3000);
          return;
        }
      }
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'not-allowed') { setVoiceStatus('error'); return; }
      restartRef.current = setTimeout(() => { if (recognitionRef.current) startRecognition(); }, 1000);
    };

    rec.onend = () => {
      if (recognitionRef.current) {
        restartRef.current = setTimeout(() => startRecognition(), 300);
      }
    };

    recognitionRef.current = rec;
    try { rec.start(); } catch { /* ignore */ }
  }, [triggerSOS, voiceOn]);

  useEffect(() => {
    if (voiceOn) { startRecognition(); }
    else { stopRecognition(); setLastHeard(''); }
    return () => stopRecognition();
  }, [voiceOn]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  // Simulate live heart rate
  useEffect(() => {
    const iv = setInterval(() => {
      setHeartRate(prev => prev + Math.floor((Math.random() - 0.5) * 4));
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  if (isSOS) return <SOSOverlay />;
  if (loading) return <DashboardSkeleton />;

  const nextAppointment = mockAppointments[0];
  const featuredDoctors = mockDoctors.slice(0, 2);

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-8"
        style={{ background: 'hsl(var(--primary))' }} />

      <Sidebar />

      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between py-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Healthcare Dashboard</p>
            <h1 className="text-2xl font-display font-bold mt-0.5">
              Hello, <span className="neon-blue">{user?.name.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-primary">
              <span className="pulse-dot pulse-dot-blue" />
              Active
            </span>
            <button onClick={() => setUser(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-2 transition-colors">
              <LogOut size={14} className="text-muted-foreground" />
            </button>
          </div>
        </motion.header>

        {/* SOS Button — full red, prominent, impossible to miss */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.94 }}
          onClick={triggerSOS}
          className="w-full mb-5 h-24 rounded-2xl relative overflow-hidden flex items-center gap-5 px-6"
          style={{ background: 'linear-gradient(135deg, hsl(0,84%,44%), hsl(0,90%,28%))' }}
        >
          {/* Radial highlight */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 25% 35%, rgba(255,255,255,0.18), transparent 65%)' }} />
          {/* Pulsing ring */}
          <motion.div
            animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
            className="absolute left-6 w-12 h-12 rounded-full border-2 border-white/50"
          />
          <div className="relative z-10 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/30">
            <ShieldAlert size={26} className="text-white" />
          </div>
          <div className="relative z-10 flex-1 text-left">
            <div className="font-display font-black text-xl text-white tracking-wide">EMERGENCY SOS</div>
            <div className="text-white/70 text-xs mt-0.5">Sends SMS alert + location to contacts</div>
          </div>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="relative z-10"
          >
            <ChevronRight size={22} className="text-white/80" />
          </motion.div>
        </motion.button>

        {/* Live Vitals */}
        <SectionTitle title="Live Vitals" action={<span className="badge-primary text-[10px]">Syncing</span>} />
        <div className="grid grid-cols-2 gap-3 mb-5">
          <VitalCard label="Heart Rate" value={heartRate.toString()} unit="bpm" status="normal" icon={Heart} />
          <VitalCard label="Blood Pressure" value="120/80" unit="mmHg" status="normal" icon={Activity} />
          <VitalCard label="SpO₂" value="98" unit="%" status="normal" icon={Wind} />
          <VitalCard label="Temperature" value="98.6" unit="°F" status="normal" icon={Thermometer} />
        </div>

        {/* Quick actions */}
        <SectionTitle title="Quick Actions" />
        <StaggerList className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: Calendar, label: 'Book Appointment', sub: 'See 6 doctors', path: '/appointments', color: 'primary' },
            { icon: MapPin, label: 'Ambulance', sub: 'Track live', path: '/ambulance', color: 'emergency' },
            { icon: Brain, label: 'AI Doctor', sub: 'Check symptoms', path: '/ai-doctor', color: 'primary' },
            { icon: FileText, label: 'Medical Records', sub: '3 files', path: '/records', color: 'primary' },
          ].map(item => (
            <motion.button
              key={item.label}
              onClick={() => navigate(item.path)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="p-4 rounded-2xl glass-card text-left"
            >
              <div className="mb-3" style={{ color: `hsl(var(--${item.color}))` }}>
                <item.icon size={20} />
              </div>
              <div className="font-display font-semibold text-sm text-foreground">{item.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</div>
            </motion.button>
          ))}
        </StaggerList>

        {/* Upcoming appointment */}
        {nextAppointment && (
          <>
            <SectionTitle title="Upcoming Appointment" action={
              <button onClick={() => navigate('/appointments')} className="text-xs text-primary hover:underline">View all</button>
            } />
            <motion.div whileHover={{ y: -2 }} onClick={() => navigate('/appointments')}
              className="glass-card-glow p-4 rounded-2xl mb-5 cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display font-semibold">{nextAppointment.doctorName}</div>
                  <div className="text-xs text-muted-foreground">{nextAppointment.specialization}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge-primary">{nextAppointment.date}</span>
                    <span className="badge-primary">{nextAppointment.time}</span>
                  </div>
                </div>
                <span className={nextAppointment.status === 'confirmed' ? 'badge-success' : 'badge-primary'}>
                  {nextAppointment.status}
                </span>
              </div>
            </motion.div>
          </>
        )}

        {/* Featured Doctors */}
        <SectionTitle title="Top Doctors" action={
          <button onClick={() => navigate('/appointments')} className="text-xs text-primary hover:underline">Browse all</button>
        } />
        <div className="space-y-3">
          {featuredDoctors.map(doc => (
            <motion.div key={doc.id} whileHover={{ x: 3 }}
              className="glass-card p-3 rounded-xl flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/appointments')}>
              <img src={doc.image} alt={doc.name} className="w-12 h-12 rounded-xl object-cover bg-surface-2" />
              <div className="flex-1">
                <div className="font-medium text-sm">{doc.name}</div>
                <div className="text-xs text-muted-foreground">{doc.specialization} · {doc.hospital}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-warning text-xs">★ {doc.rating}</span>
                  <span className="text-[10px] text-muted-foreground">({doc.reviews})</span>
                  {doc.available && <span className="badge-success">Available</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-primary">₹{doc.fee}</div>
                <div className="text-[10px] text-muted-foreground">per visit</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MaleDashboard;
