import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, ChevronRight, Stethoscope } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/Navigation';
import { mockDoctors } from '@/data/mockData';

const AIRecommender: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const isFemale = user?.gender === 'female';
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState<typeof mockDoctors>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const q = symptoms.toLowerCase();
    const matched = mockDoctors.filter(d => d.symptoms.some(s => q.includes(s)));
    setResults(matched.length ? matched : mockDoctors.slice(0, 2));
    setLoading(false);
  };

  const suggestions = ['Chest pain & breathlessness', 'Severe headache', 'Fever & cold', 'Anxiety & stress', 'Back pain'];

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      <div className="max-w-lg mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 py-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold">AI Doctor Recommender</h1>
            <p className="text-xs text-muted-foreground">Describe symptoms for specialist match</p>
          </div>
        </motion.div>

        <div className="glass-card-glow rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={18} className="text-primary" />
            <span className="font-display font-semibold text-sm">Symptom Analysis</span>
          </div>
          <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms in detail... e.g. 'I have chest pain and difficulty breathing for 2 days'"
            rows={3} className="aegis-input resize-none mb-3" />
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map(s => (
              <button key={s} onClick={() => setSymptoms(s)}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
                {s}
              </button>
            ))}
          </div>
          <motion.button onClick={handleSearch} disabled={loading || !symptoms}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full">
            {loading ? <><Stethoscope size={16} className="animate-spin" />Analyzing...</> : <><Brain size={16} />Find Specialists</>}
          </motion.button>
        </div>

        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              {results.length} specialist{results.length > 1 ? 's' : ''} matched
            </div>
            <div className="space-y-3">
              {results.map(doc => (
                <motion.div key={doc.id} whileHover={{ x: 3 }}
                  className="glass-card rounded-xl p-4 flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate('/appointments')}>
                  <img src={doc.image} alt={doc.name} className="w-12 h-12 rounded-xl bg-surface-2" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.specialization}</div>
                    <div className="text-xs text-warning mt-1">★ {doc.rating} · {doc.experience}y exp</div>
                  </div>
                  <div className="text-right">
                    <div className="text-primary font-bold text-sm">₹{doc.fee}</div>
                    <ChevronRight size={14} className="text-muted-foreground ml-auto mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav isFemale={isFemale} />
    </div>
  );
};

export default AIRecommender;
