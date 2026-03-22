import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Brain, ChevronRight, Stethoscope, Pill,
  AlertTriangle, Lightbulb, Loader2, BookOpen, ShieldAlert
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/Navigation';
import { mockDoctors } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';

const AIRecommender: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const isFemale = user?.gender === 'female';
  const [symptoms, setSymptoms] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [doctors, setDoctors] = useState<typeof mockDoctors>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const suggestions = [
    'Chest pain & breathlessness',
    'Severe headache & fever',
    'Fever & cold with body ache',
    'Anxiety & stress',
    'Back pain & fatigue',
    'Stomach pain & nausea',
  ];

  const handleSearch = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setAiAdvice('');
    setDoctors([]);
    setError('');

    try {
      // Call AI doctor edge function
      const { data, error: fnError } = await supabase.functions.invoke('ai-doctor', {
        body: {
          symptoms,
          bloodGroup: user?.medicalInfo?.bloodGroup,
          allergies: user?.medicalInfo?.allergies || [],
          conditions: user?.medicalInfo?.conditions || [],
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setAiAdvice(data.advice || '');

      // Also match specialist doctors
      const q = symptoms.toLowerCase();
      const matched = mockDoctors.filter(d => d.symptoms?.some(s => q.includes(s)));
      setDoctors(matched.length ? matched : mockDoctors.slice(0, 2));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to get AI advice';
      setError(msg);
      // Fallback: still show doctors
      const q = symptoms.toLowerCase();
      const matched = mockDoctors.filter(d => d.symptoms?.some(s => q.includes(s)));
      setDoctors(matched.length ? matched : mockDoctors.slice(0, 2));
    } finally {
      setLoading(false);
    }
  };

  // Parse the AI response into visual sections
  const renderAdvice = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim());
    return (
      <div className="space-y-2">
        {lines.map((line, i) => {
          const isHeader = line.startsWith('##') || /^\*\*/.test(line) || /^[1-9]\./.test(line);
          const cleaned = line.replace(/^#{1,3}\s*/, '').replace(/\*\*/g, '').replace(/^[1-9]\.\s*/, '');
          return (
            <div key={i} className={isHeader
              ? 'font-display font-semibold text-sm text-foreground mt-3 first:mt-0'
              : 'text-xs text-muted-foreground leading-relaxed pl-1'
            }>
              {cleaned}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      {/* Ambient */}
      <div className="fixed top-0 left-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-6"
        style={{ background: 'hsl(var(--primary))' }} />

      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 py-6">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold">AI Doctor</h1>
            <p className="text-xs text-muted-foreground">Symptoms → Diagnosis + Medication</p>
          </div>
          <div className="ml-auto">
            <span className="badge-primary text-[10px]">
              <span className="pulse-dot pulse-dot-blue" />AI Powered
            </span>
          </div>
        </motion.div>

        {/* Disclaimer banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/25 mb-4">
          <ShieldAlert size={14} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-warning leading-relaxed">
            For informational purposes only. Always consult a qualified doctor for proper diagnosis and treatment.
          </p>
        </motion.div>

        {/* Input card */}
        <div className="glass-card-glow rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={18} className="text-primary" />
            <span className="font-display font-semibold text-sm">Describe Your Symptoms</span>
          </div>
          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder="e.g. 'I have chest pain and difficulty breathing for 2 days'"
            rows={3}
            className="aegis-input resize-none mb-3"
          />

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map(s => (
              <button key={s} onClick={() => setSymptoms(s)}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
                {s}
              </button>
            ))}
          </div>

          <motion.button
            onClick={handleSearch}
            disabled={loading || !symptoms.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Analyzing with AI…</>
              : <><Brain size={16} /> Analyze & Get Advice</>
            }
          </motion.button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mb-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
                <div className="h-3 bg-surface-3 rounded-full w-1/2 mb-2" />
                <div className="h-2 bg-surface-3 rounded-full w-full mb-1.5" />
                <div className="h-2 bg-surface-3 rounded-full w-3/4" />
              </div>
            ))}
          </motion.div>
        )}

        {/* Error */}
        {error && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 rounded-2xl bg-emergency/10 border border-emergency/25 mb-4 flex items-start gap-2">
            <AlertTriangle size={14} className="text-emergency flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emergency">{error}</p>
          </motion.div>
        )}

        {/* AI Advice */}
        <AnimatePresence>
          {aiAdvice && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 space-y-3"
            >
              {/* Diagnosis & advice */}
              <div className="glass-card-glow rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <BookOpen size={14} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-sm">AI Medical Analysis</div>
                    <div className="text-[10px] text-muted-foreground">Personalized to your health profile</div>
                  </div>
                  <span className="ml-auto badge-primary text-[9px]">AI</span>
                </div>
                <div className="bg-surface-2 rounded-xl p-4 border border-border/50">
                  {renderAdvice(aiAdvice)}
                </div>
              </div>

              {/* Quick tips pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {['Drink water', 'Rest well', 'Monitor temperature', 'Eat light'].map(tip => (
                  <span key={tip} className="text-[10px] px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/15 flex items-center gap-1">
                    <Lightbulb size={9} />{tip}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Matched Doctors */}
        <AnimatePresence>
          {doctors.length > 0 && !loading && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope size={14} className="text-primary" />
                  <span className="font-display font-semibold text-sm">Recommended Specialists</span>
                </div>
                <span className="text-xs text-muted-foreground">{doctors.length} matched</span>
              </div>
              <div className="space-y-3">
                {doctors.map(doc => (
                  <motion.div key={doc.id} whileHover={{ x: 3 }}
                    className="glass-card rounded-xl p-4 flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate('/appointments')}>
                    <img src={doc.image} alt={doc.name} className="w-12 h-12 rounded-xl bg-surface-2 object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">{doc.specialization}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-warning text-xs">★ {doc.rating}</span>
                        <span className="text-[10px] text-muted-foreground">{doc.experience}y exp</span>
                        {doc.available && <span className="badge-success">Available</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-bold text-sm">₹{doc.fee}</div>
                      <div className="text-[10px] text-muted-foreground mb-1">per visit</div>
                      <ChevronRight size={14} className="text-muted-foreground ml-auto" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav isFemale={isFemale} />
    </div>
  );
};

export default AIRecommender;
