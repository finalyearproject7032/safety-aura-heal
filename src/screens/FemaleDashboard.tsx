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
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [voiceActive, setVoiceActive] = useState(false);
  const [safeZoneAlert, setSafeZoneAlert] = useState(false);
  // AI Doctor quick widget
  const [quickSymptoms, setQuickSymptoms] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  // Health reports
  const [records, setRecords] = useState(mockMedicalRecords);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSafeZoneAlert(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleQuickAI = async () => {
    if (!quickSymptoms.trim()) return;
    setAiLoading(true);
    setAiResult('');
    try {
      const { data, error } = await supabase.functions.invoke('ai-doctor', {
        body: {
          symptoms: quickSymptoms,
          bloodGroup: user?.medicalInfo?.bloodGroup,
          allergies: user?.medicalInfo?.allergies || [],
          conditions: user?.medicalInfo?.conditions || [],
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiResult(data.advice || '');
    } catch (err) {
      toast({ title: '⚠️ AI Error', description: err instanceof Error ? err.message : 'Failed to get advice', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newRecords = Array.from(files).map(file => ({
      id: `r${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      date: new Date().toISOString().slice(0, 10),
      type: file.type.includes('image') ? 'radiology' : 'lab',
      doctor: 'Self Upload',
      size: file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`,
      status: 'pending',
    }));
    setRecords(prev => [...newRecords, ...prev]);
    toast({ title: `✅ ${newRecords.length} file(s) uploaded`, description: 'Added to your health records' });
    e.target.value = '';
  };

  if (isSOS) return <SOSOverlay />;
  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      {/* Ambient rose glow */}
      <div className="fixed top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-10"
        style={{ background: 'hsl(var(--safety))' }} />

      <Sidebar isFemale />

      {/* Hidden real file input */}
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden" onChange={handleFileUpload} />

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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
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
        <SectionTitle title="Safety Tools" action={<span className="badge-safety">Active</span>} />
        <StaggerList className="grid grid-cols-2 gap-3 mb-5">
          <StatCard icon={Mic} label="Voice SOS" value="Listening..." sub="Say 'Help Me'" active variant="safety"
            onClick={() => { setVoiceActive(!voiceActive); navigate('/women-safety'); }} />
          <StatCard icon={Camera} label="Auto Record" value="Ready" sub="On SOS Trigger" variant="safety" onClick={() => navigate('/women-safety')} />
          <StatCard icon={Navigation} label="Safe Zones" value="4 Nearby" sub="Tap to Navigate" variant="safety" onClick={() => navigate('/women-safety')} />
          <StatCard icon={Zap} label="Calculator" value="Decoy App" sub="123= → SOS" variant="safety" onClick={() => navigate('/calculator')} />
        </StaggerList>

        {/* ── AI Doctor Quick Widget ── */}
        <SectionTitle title="AI Doctor" action={
          <button onClick={() => navigate('/ai-doctor')} className="text-xs text-primary hover:underline flex items-center gap-1">
            Full view <ChevronRight size={12} />
          </button>
        } />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card-glow rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} className="text-primary" />
            <span className="text-sm font-semibold">Quick Symptom Check</span>
            <span className="ml-auto badge-primary text-[9px]">AI Powered</span>
          </div>
          <textarea
            value={quickSymptoms}
            onChange={e => setQuickSymptoms(e.target.value)}
            placeholder="e.g. headache, fever, nausea..."
            rows={2}
            className="aegis-input resize-none text-sm mb-3"
          />
          <motion.button
            onClick={handleQuickAI}
            disabled={aiLoading || !quickSymptoms.trim()}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full text-sm disabled:opacity-50 mb-3"
          >
            {aiLoading
              ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
              : <><Brain size={14} /> Get AI Advice</>
            }
          </motion.button>
          <AnimatePresence>
            {aiResult && !aiLoading && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-surface-2 rounded-xl p-3 border border-border/50 text-xs text-muted-foreground leading-relaxed max-h-40 overflow-y-auto">
                {aiResult.split('\n').filter(l => l.trim()).slice(0, 8).map((line, i) => {
                  const isH = /^\*\*|^#{1,3}\s|^[1-9]\./.test(line);
                  return (
                    <div key={i} className={isH ? 'font-semibold text-foreground mt-2 first:mt-0' : 'pl-1'}>
                      {line.replace(/^#{1,3}\s*/, '').replace(/\*\*/g, '').replace(/^[1-9]\.\s*/, '')}
                    </div>
                  );
                })}
                <button onClick={() => navigate('/ai-doctor')} className="mt-2 text-primary text-[10px] font-medium hover:underline">
                  See full analysis →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Health Reports Upload ── */}
        <SectionTitle title="Health Reports" action={
          <button onClick={() => navigate('/records')} className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight size={12} />
          </button>
        } />
        {/* Upload button */}
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className="w-full glass-card rounded-xl p-4 mb-3 flex items-center gap-3 border-dashed border-2 border-border hover:border-primary/40 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Upload size={18} className="text-primary" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium">Upload Report</div>
            <div className="text-[10px] text-muted-foreground">PDF, JPG, PNG — tap to pick files</div>
          </div>
          <FolderOpen size={16} className="text-muted-foreground ml-auto" />
        </motion.button>

        {/* Recent records (latest 3) */}
        <div className="space-y-2 mb-5">
          {records.slice(0, 3).map((rec, i) => (
            <motion.div key={rec.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `hsl(var(--${rec.type === 'lab' ? 'primary' : rec.type === 'radiology' ? 'warning' : 'emergency'}) / 0.15)` }}>
                <FileText size={15} style={{ color: `hsl(var(--${rec.type === 'lab' ? 'primary' : rec.type === 'radiology' ? 'warning' : 'emergency'}))` }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs truncate">{rec.name}</div>
                <div className="text-[10px] text-muted-foreground">{rec.doctor} · {rec.date}</div>
              </div>
              <span className={rec.status === 'normal' ? 'badge-success' : 'badge-primary'}>
                {rec.status}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Emergency Contacts */}
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
