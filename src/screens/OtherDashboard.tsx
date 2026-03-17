import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Calendar, Activity, MapPin, FileText,
  Mic, Camera, Brain, PhoneCall, LogOut, Heart, ChevronRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav, Sidebar } from '@/components/Navigation';
import { GlassCard, SectionTitle, StaggerList, DashboardSkeleton } from '@/components/UIComponents';
import SOSOverlay from '@/components/SOSOverlay';
import { mockSafeZones } from '@/data/mockData';

const OtherDashboard: React.FC = () => {
  const { user, isSOS, triggerSOS, setUser } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  if (isSOS) return <SOSOverlay />;
  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      <div className="fixed top-0 right-0 w-64 h-64 rounded-full blur-[120px] pointer-events-none opacity-8"
        style={{ background: 'hsl(213,94%,59%)' }} />

      <Sidebar />

      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between py-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Safety + Healthcare</p>
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

        {/* SOS row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <motion.button whileTap={{ scale: 0.95 }} onClick={triggerSOS}
            className="h-32 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, hsl(0,84%,55%), hsl(0,84%,30%))' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
            <ShieldAlert size={32} className="text-white relative z-10" />
            <div className="font-display font-black text-sm text-white relative z-10">SOS ALERT</div>
          </motion.button>

          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/women-safety')}
            className="h-32 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, hsl(350,89%,55%), hsl(320,80%,35%))' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
            <ShieldAlert size={32} className="text-white relative z-10" />
            <div className="font-display font-black text-sm text-white relative z-10">SAFETY</div>
          </motion.button>
        </div>

        {/* Safety + Health actions */}
        <SectionTitle title="Safety Tools" />
        <StaggerList className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: Mic, label: 'Voice SOS', sub: 'Say Help Me', path: '/women-safety', color: 'safety' },
            { icon: Camera, label: 'Auto Record', sub: 'Cloud Sync', path: '/women-safety', color: 'safety' },
            { icon: MapPin, label: 'Safe Zones', sub: '4 Nearby', path: '/women-safety', color: 'primary' },
            { icon: PhoneCall, label: 'Emergency', sub: 'Quick Dial', path: '/women-safety', color: 'emergency' },
          ].map(item => (
            <motion.button key={item.label} onClick={() => navigate(item.path)}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              className="p-4 rounded-2xl glass-card text-left">
              <div className="mb-3" style={{ color: `hsl(var(--${item.color}))` }}>
                <item.icon size={20} />
              </div>
              <div className="font-display font-semibold text-sm text-foreground">{item.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</div>
            </motion.button>
          ))}
        </StaggerList>

        <SectionTitle title="Healthcare Tools" />
        <StaggerList className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: Calendar, label: 'Book Appointment', sub: '6 doctors', path: '/appointments' },
            { icon: Brain, label: 'AI Doctor', sub: 'Symptom check', path: '/ai-doctor' },
            { icon: Activity, label: 'Ambulance', sub: 'Track live', path: '/ambulance' },
            { icon: FileText, label: 'Records', sub: '3 reports', path: '/records' },
          ].map(item => (
            <motion.button key={item.label} onClick={() => navigate(item.path)}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              className="p-4 rounded-2xl glass-card text-left">
              <div className="mb-3 text-primary">
                <item.icon size={20} />
              </div>
              <div className="font-display font-semibold text-sm text-foreground">{item.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</div>
            </motion.button>
          ))}
        </StaggerList>

        {/* Emergency contacts */}
        <SectionTitle title="Emergency Line" />
        <div className="space-y-2">
          {[
            { name: 'Police', number: '100', color: 'primary' },
            { name: 'Ambulance', number: '108', color: 'emergency' },
            { name: 'Women Helpline', number: '1091', color: 'safety' },
          ].map(e => (
            <motion.a key={e.number} href={`tel:${e.number}`} whileHover={{ x: 3 }}
              className="flex items-center justify-between p-3 rounded-xl glass-card cursor-pointer">
              <div className="flex items-center gap-3">
                <PhoneCall size={16} style={{ color: `hsl(var(--${e.color}))` }} />
                <span className="text-sm font-medium">{e.name} — {e.number}</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </motion.a>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default OtherDashboard;
