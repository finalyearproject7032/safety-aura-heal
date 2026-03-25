import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Brain, ChevronRight, Stethoscope, Pill,
  AlertTriangle, Lightbulb, Loader2, BookOpen, ShieldAlert,
  Upload, FileText, X, FileScan, FolderOpen
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/Navigation';
import { mockDoctors } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB

const AIRecommender: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { toast } = useToast();
  const isFemale = user?.gender === 'female';
  const [activeTab, setActiveTab] = useState<'symptoms' | 'file'>('symptoms');
  const [symptoms, setSymptoms] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [doctors, setDoctors] = useState<typeof mockDoctors>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // File tab state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileAnalysis, setFileAnalysis] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const { data, error: fnError } = await supabase.functions.invoke('ai-doctor', {
        body: {
          symptoms,
          bloodGroup: user?.medicalInfo?.bloodGroup,
          allergies: user?.medicalInfo?.allergies || [],
          conditions: user?.medicalInfo?.conditions || [],
          mode: 'symptoms',
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setAiAdvice(data.advice || '');

      const q = symptoms.toLowerCase();
      const matched = mockDoctors.filter(d => d.symptoms?.some(s => q.includes(s)));
      setDoctors(matched.length ? matched : mockDoctors.slice(0, 2));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to get AI advice';
      setError(msg);
      const q = symptoms.toLowerCase();
      const matched = mockDoctors.filter(d => d.symptoms?.some(s => q.includes(s)));
      setDoctors(matched.length ? matched : mockDoctors.slice(0, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      toast({ title: '⚠️ File too large', description: 'Maximum file size is 4 MB', variant: 'destructive' });
      e.target.value = '';
      return;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast({ title: '⚠️ Unsupported format', description: 'Upload PDF, JPG, or PNG files only', variant: 'destructive' });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setFileBase64(base64);
      setUploadedFile(file);
      setFileAnalysis('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleFileAnalyze = async () => {
    if (!uploadedFile || !fileBase64) return;
    setFileLoading(true);
    setFileAnalysis('');
    setError('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-doctor', {
        body: {
          mode: 'file',
          fileBase64,
          fileMimeType: uploadedFile.type,
          fileName: uploadedFile.name,
          bloodGroup: user?.medicalInfo?.bloodGroup,
          allergies: user?.medicalInfo?.allergies || [],
          conditions: user?.medicalInfo?.conditions || [],
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setFileAnalysis(data.advice || '');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze file';
      setError(msg);
    } finally {
      setFileLoading(false);
    }
  };

  const renderAdvice = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim());
    return (
      <div className="space-y-1.5">
        {lines.map((line, i) => {
          const isHeader = line.startsWith('##') || /^\*\*/.test(line) || /^[1-9]\./.test(line) || /^📋|^🔍|^💊|^⚠️/.test(line);
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

  const fileSizeLabel = (f: File) =>
    f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`;

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      <div className="fixed top-0 left-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-6"
        style={{ background: 'hsl(var(--primary))' }} />

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
        className="hidden" onChange={handleFileSelect} />

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
            <p className="text-xs text-muted-foreground">Symptoms · Document Analysis</p>
          </div>
          <div className="ml-auto">
            <span className="badge-primary text-[10px]">
              <span className="pulse-dot pulse-dot-blue" />AI Powered
            </span>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/25 mb-4">
          <ShieldAlert size={14} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-warning leading-relaxed">
            For informational purposes only. Always consult a qualified doctor for proper diagnosis and treatment.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="glass-card rounded-xl p-1 flex gap-1 mb-5">
          <button
            onClick={() => { setActiveTab('symptoms'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'symptoms'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Brain size={13} /> Symptom Check
          </button>
          <button
            onClick={() => { setActiveTab('file'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'file'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileScan size={13} /> Analyze Report
          </button>
        </div>

        {/* ── SYMPTOMS TAB ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'symptoms' && (
            <motion.div key="symptoms" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Analyzing with AI…</>
                    : <><Brain size={16} /> Analyze & Get Advice</>}
                </motion.button>
              </div>

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

              {error && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-4 rounded-2xl bg-emergency/10 border border-emergency/25 mb-4 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-emergency flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emergency">{error}</p>
                </motion.div>
              )}

              <AnimatePresence>
                {aiAdvice && !loading && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 space-y-3">
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
            </motion.div>
          )}

          {/* ── FILE ANALYSIS TAB ── */}
          {activeTab === 'file' && (
            <motion.div key="file" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card-glow rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileScan size={18} className="text-primary" />
                  <span className="font-display font-semibold text-sm">Upload Medical Report</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Upload a blood test, X-ray, ECG, prescription or any medical document.
                  AI will read and summarize the findings for you in simple language.
                </p>

                {/* Upload zone */}
                {!uploadedFile ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 flex flex-col items-center gap-3 transition-all cursor-pointer mb-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Upload size={24} className="text-primary" />
                    </div>
                    <div className="text-sm font-semibold">Tap to Upload Report</div>
                    <div className="text-xs text-muted-foreground text-center">
                      PDF, JPG, PNG · Max 4 MB
                    </div>
                    <div className="flex items-center gap-1.5 text-primary text-xs font-medium mt-1">
                      <FolderOpen size={13} /> Browse Files
                    </div>
                  </motion.button>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-surface-2 rounded-xl p-4 border border-border flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{uploadedFile.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {fileSizeLabel(uploadedFile)} · {uploadedFile.type.split('/')[1].toUpperCase()}
                      </div>
                    </div>
                    <button
                      onClick={() => { setUploadedFile(null); setFileBase64(''); setFileAnalysis(''); setError(''); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-emergency hover:bg-emergency/10 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}

                <motion.button
                  onClick={handleFileAnalyze}
                  disabled={fileLoading || !uploadedFile}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {fileLoading
                    ? <><Loader2 size={16} className="animate-spin" /> Reading & Analyzing…</>
                    : <><FileScan size={16} /> Analyze with AI</>}
                </motion.button>

                {/* Supported formats hint */}
                <div className="flex items-center gap-3 mt-3 justify-center">
                  {['Blood Test', 'X-Ray', 'ECG', 'Prescription', 'Scan'].map(t => (
                    <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-surface-3 text-muted-foreground border border-border/50">{t}</span>
                  ))}
                </div>
              </div>

              {/* Loading skeleton for file analysis */}
              {fileLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mb-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
                      <div className="h-3 bg-surface-3 rounded-full w-1/3 mb-2" />
                      <div className="h-2 bg-surface-3 rounded-full w-full mb-1.5" />
                      <div className="h-2 bg-surface-3 rounded-full w-4/5 mb-1.5" />
                      <div className="h-2 bg-surface-3 rounded-full w-3/5" />
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Error */}
              {error && !fileLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-4 rounded-2xl bg-emergency/10 border border-emergency/25 mb-4 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-emergency flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emergency">{error}</p>
                </motion.div>
              )}

              {/* File analysis result */}
              <AnimatePresence>
                {fileAnalysis && !fileLoading && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
                    <div className="glass-card-glow rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                          <FileScan size={14} className="text-primary" />
                        </div>
                        <div>
                          <div className="font-display font-semibold text-sm">Document Analysis</div>
                          <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{uploadedFile?.name}</div>
                        </div>
                        <span className="ml-auto badge-primary text-[9px]">AI</span>
                      </div>
                      <div className="bg-surface-2 rounded-xl p-4 border border-border/50 max-h-96 overflow-y-auto">
                        {renderAdvice(fileAnalysis)}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 w-full text-xs text-primary hover:underline flex items-center justify-center gap-1"
                      >
                        <Upload size={11} /> Upload another report
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav isFemale={isFemale} />
    </div>
  );
};

export default AIRecommender;
