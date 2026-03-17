import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, MapPin, Calendar, Users, AlertTriangle, LogOut, TrendingUp, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav, Sidebar } from '@/components/Navigation';
import { SectionTitle, DashboardSkeleton } from '@/components/UIComponents';
import SOSOverlay from '@/components/SOSOverlay';
import { mockEmergencyFeed } from '@/data/mockData';

const HospitalDashboard: React.FC = () => {
  const { user, isSOS, setUser } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState(mockEmergencyFeed);

  useEffect(() => { setTimeout(() => setLoading(false), 1000); }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setFeed(f => f.map(e => ({ ...e, time: e.time === 'Just now' ? '1 min ago' : e.time })));
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  if (isSOS) return <SOSOverlay />;
  if (loading) return <DashboardSkeleton />;

  const severityColor = (s: string) => s === 'critical' ? 'emergency' : s === 'high' ? 'warning' : 'primary';

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-5" style={{ background: 'hsl(var(--emergency))' }} />
      <Sidebar isAdmin />
      <div className="max-w-lg mx-auto px-4">
        <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between py-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Hospital Command Center</p>
            <h1 className="text-2xl font-display font-bold mt-0.5">
              AIIMS <span className="neon-blue">Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-emergency"><span className="pulse-dot pulse-dot-red" />Live</span>
            <button onClick={() => setUser(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-2 transition-colors">
              <LogOut size={14} className="text-muted-foreground" />
            </button>
          </div>
        </motion.header>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: ShieldAlert, label: 'Active Emergencies', value: '3', color: 'emergency' },
            { icon: Users, label: 'Patients Today', value: '47', color: 'primary' },
            { icon: Calendar, label: 'Appointments', value: '12 pending', color: 'primary' },
            { icon: Activity, label: 'Ambulances', value: '2 en route', color: 'success' },
          ].map(stat => (
            <motion.div key={stat.label} whileHover={{ y: -2 }} className="p-4 rounded-2xl glass-card">
              <stat.icon size={18} style={{ color: `hsl(var(--${stat.color}))` }} className="mb-2" />
              <div className="font-display font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Live emergency feed */}
        <SectionTitle title="Live Emergency Feed" action={<span className="badge-emergency"><span className="pulse-dot pulse-dot-red" />Live</span>} />
        <div className="space-y-3 mb-5">
          <AnimatePresence>
            {feed.map((e) => (
              <motion.div key={e.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl glass-card border-l-4 ${e.severity === 'critical' ? 'border-l-emergency' : 'border-l-warning'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} style={{ color: `hsl(var(--${severityColor(e.severity)}))` }} />
                    <span className="text-sm font-display font-semibold capitalize">{e.type.replace('-', ' ')}</span>
                  </div>
                  <span style={{ color: `hsl(var(--${severityColor(e.severity)}))` }} className="text-[10px] font-bold uppercase">{e.severity}</span>
                </div>
                <div className="text-xs text-foreground">{e.patient}{e.age ? ` · ${e.age}y` : ''}</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin size={10} />{e.location} ({e.distance})
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock size={10} />ETA: {e.eta}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Map placeholder */}
        <SectionTitle title="Hospital Coverage Map" />
        <div className="rounded-2xl overflow-hidden glass-card mb-5 relative">
          <iframe
            title="Hospital Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.0!2d77.2090!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM2JzUwLjAiTiA3N8KwMTInMzIuNCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
            width="100%" height="220" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
            allowFullScreen loading="lazy"
          />
          <div className="absolute top-3 left-3 badge-emergency">Live Coverage</div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'View Appointments', icon: Calendar, path: '/appointments' },
            { label: 'Track Ambulance', icon: MapPin, path: '/ambulance' },
          ].map(a => (
            <motion.button key={a.label} onClick={() => navigate(a.path)}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              className="p-4 rounded-2xl glass-card text-left">
              <a.icon size={20} className="text-primary mb-2" />
              <div className="text-sm font-medium">{a.label}</div>
            </motion.button>
          ))}
        </div>
      </div>
      <BottomNav isAdmin />
    </div>
  );
};

export default HospitalDashboard;
