import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Calendar, Activity, MapPin, FileText,
  Heart, Thermometer, Droplets, Wind, LogOut, Brain, ChevronRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav, Sidebar } from '@/components/Navigation';
import { GlassCard, VitalCard, SectionTitle, StaggerList, DashboardSkeleton } from '@/components/UIComponents';
import SOSOverlay from '@/components/SOSOverlay';
import { mockDoctors, mockAppointments, mockVitals } from '@/data/mockData';

const MaleDashboard: React.FC = () => {
  const { user, isSOS, triggerSOS, setUser } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [heartRate, setHeartRate] = useState(72);

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

        {/* SOS Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={triggerSOS}
          className="w-full mb-5 p-4 rounded-2xl relative overflow-hidden flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, hsl(0,84%,50%,0.15), hsl(0,84%,50%,0.05))', border: '1px solid hsl(var(--emergency) / 0.3)' }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(var(--emergency) / 0.15)' }}>
            <ShieldAlert size={24} style={{ color: 'hsl(var(--emergency))' }} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-display font-bold text-emergency">Emergency SOS</div>
            <div className="text-xs text-muted-foreground">Tap to send alert to contacts & services</div>
          </div>
          <ChevronRight size={18} style={{ color: 'hsl(var(--emergency))' }} />
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
