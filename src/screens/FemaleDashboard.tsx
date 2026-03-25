import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Mic, Camera, Navigation, PhoneCall, Zap,
  Heart, MapPin, AlertTriangle, LogOut, Activity, Brain,
  FileText, Upload, ChevronRight, Loader2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav, Sidebar } from '@/components/Navigation';
import { StatCard, SectionTitle, StaggerList, DashboardSkeleton } from '@/components/UIComponents';
import SOSOverlay from '@/components/SOSOverlay';
import { mockSafeZones, mockMedicalRecords } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const FemaleDashboard: React.FC = () => {
  const { user, isSOS, triggerSOS, setUser, location } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [voiceActive, setVoiceActive] = useState(false);
  const [safeZoneAlert, setSafeZoneAlert] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSafeZoneAlert(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (isSOS) return <SOSOverlay />;
  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      {/* Ambient rose glow */}
      <div className="fixed top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-10"
        style={{ background: 'hsl(var(--safety))' }} />

      <Sidebar isFemale />

      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between py-6"
        >
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Welcome back</p>
            <h1 className="text-2xl font-display font-bold mt-0.5">
              Stay Safe,{' '}
              <span style={{ color: 'hsl(var(--safety))' }}>{user?.name.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-safety">
              <span className="pulse-dot pulse-dot-rose" />
              Safety Mode
            </span>
            <button onClick={() => setUser(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-2 transition-colors">
              <LogOut size={14} className="text-muted-foreground" />
            </button>
          </div>
        </motion.header>

        {/* Safe zone alert */}
        <AnimatePresence>
          {safeZoneAlert && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              className="mb-4 glass-safety rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={16} style={{ color: 'hsl(var(--safety))' }} />
                <div>
                  <div className="text-xs font-semibold text-safety">Area Alert: Sector 18</div>
                  <div className="text-[10px] text-muted-foreground">Low lighting — Safe zone 0.3km away</div>
                </div>
              </div>
              <button onClick={() => setSafeZoneAlert(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOS Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={triggerSOS}
            className="w-full h-40 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center gap-2 group"
            style={{ background: 'linear-gradient(135deg, hsl(0,84%,55%), hsl(0,84%,30%))' }}
          >
            {/* Radial shine */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
            {/* Pulse rings */}
            <motion.div
              animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
              className="absolute w-32 h-32 rounded-full border-2 border-white/20"
            />
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.2, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut', delay: 0.4 }}
              className="absolute w-32 h-32 rounded-full border border-white/10"
            />
            <ShieldAlert size={44} className="text-white relative z-10" />
            <div className="relative z-10 text-center">
              <div className="font-display font-black text-xl text-white uppercase tracking-tight">Hold for SOS</div>
              <div className="text-white/60 text-xs mt-0.5">Long press to activate emergency alert</div>
            </div>
          </motion.button>
        </motion.div>

        {/* Quick safety grid */}
        <SectionTitle title="Safety Tools" action={
          <span className="badge-safety">Active</span>
        } />
        <StaggerList className="grid grid-cols-2 gap-3 mb-5">
          <StatCard icon={Mic} label="Voice SOS" value="Listening..." sub="Say 'Help Me'" active variant="safety"
            onClick={() => { setVoiceActive(!voiceActive); navigate('/women-safety'); }} />
          <StatCard icon={Camera} label="Auto Record" value="Ready" sub="On SOS Trigger" variant="safety" onClick={() => navigate('/women-safety')} />
          <StatCard icon={Navigation} label="Safe Zones" value="4 Nearby" sub="Tap to Navigate" variant="safety" onClick={() => navigate('/women-safety')} />
          <StatCard icon={Zap} label="Calculator" value="Decoy App" sub="123= → SOS" variant="safety" onClick={() => navigate('/calculator')} />
        </StaggerList>

        {/* Quick Contacts */}
        <SectionTitle title="Emergency Contacts" />
        <div className="space-y-2 mb-5">
          {user?.emergencyContacts.length ? user.emergencyContacts.map((c, i) => (
            <motion.div key={i} whileHover={{ x: 3 }}
              className="flex items-center justify-between p-3 rounded-xl glass-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'hsl(var(--safety) / 0.15)', color: 'hsl(var(--safety))' }}>
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">{c.relation} · {c.phone}</div>
                </div>
              </div>
              <a href={`tel:${c.phone}`}>
                <PhoneCall size={16} style={{ color: 'hsl(var(--safety))' }} />
              </a>
            </motion.div>
          )) : (
            <div className="glass-card p-4 rounded-xl text-sm text-muted-foreground text-center">
              No emergency contacts. <button onClick={() => {}} className="text-safety">Add now →</button>
            </div>
          )}
          <motion.a href="tel:112" whileHover={{ x: 3 }}
            className="flex items-center justify-between p-3 rounded-xl glass-emergency cursor-pointer">
            <div className="flex items-center gap-3">
              <PhoneCall size={18} style={{ color: 'hsl(var(--emergency))' }} />
              <div>
                <div className="text-sm font-medium text-emergency">Police Emergency</div>
                <div className="text-[10px] text-muted-foreground">National Emergency · 112</div>
              </div>
            </div>
            <span className="badge-emergency">CALL</span>
          </motion.a>
        </div>

        {/* Safe zones */}
        <SectionTitle title="Nearby Safe Zones" action={
          <button onClick={() => navigate('/women-safety')} className="text-xs text-safety hover:underline">View map</button>
        } />
        <div className="space-y-2 mb-5">
          {mockSafeZones.slice(0, 3).map(zone => (
            <motion.div key={zone.id} whileHover={{ x: 3 }}
              className="flex items-center justify-between p-3 rounded-xl glass-card">
              <div className="flex items-center gap-3">
                <MapPin size={16} style={{ color: 'hsl(var(--safety))' }} />
                <div>
                  <div className="text-sm font-medium">{zone.name}</div>
                  <div className="text-[10px] text-muted-foreground">{zone.distance} away</div>
                </div>
              </div>
              <span className="badge-success">Safe</span>
            </motion.div>
          ))}
        </div>

        {/* Location badge */}
        <div className="glass-card p-3 rounded-xl flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.15)' }}>
            <MapPin size={14} style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <div>
            <div className="text-xs font-medium">{location?.address || 'New Delhi, India'}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{location?.lat?.toFixed(4)}, {location?.lng?.toFixed(4)}</div>
          </div>
          <span className="badge-primary ml-auto">Live</span>
        </div>
      </div>

      <BottomNav isFemale />
    </div>
  );
};

export default FemaleDashboard;
