import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Activity, Eye, Trash2, FolderOpen, Upload } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { mockMedicalRecords } from '@/data/mockData';

const MedicalRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { toast } = useToast();
  const isFemale = user?.gender === 'female';
  const [records, setRecords] = useState(mockMedicalRecords);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newRecords = Array.from(files).map(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const type = ['jpg', 'jpeg', 'png'].includes(ext)
        ? 'radiology'
        : ext === 'pdf' || ext === 'doc' || ext === 'docx'
        ? 'lab'
        : 'lab';
      return {
        id: `r${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        date: new Date().toISOString().slice(0, 10),
        type,
        doctor: 'Self Upload',
        size: file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`,
        status: 'pending',
      };
    });

    setRecords(prev => [...newRecords, ...prev]);
    toast({
      title: `✅ ${newRecords.length} file(s) uploaded`,
      description: newRecords.map(r => r.name).join(', '),
    });
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    toast({ title: 'Deleted', description: 'Record removed' });
  };

  const typeColor = (t: string) => {
    if (t === 'lab') return 'primary';
    if (t === 'radiology') return 'warning';
    if (t === 'cardiology') return 'emergency';
    return 'primary';
  };

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      {/* Hidden real file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-lg mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 py-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold">Medical Records</h1>
            <p className="text-xs text-muted-foreground">{records.length} documents</p>
          </div>
        </motion.div>

        {/* Upload area — real file picker */}
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className="w-full glass-card rounded-2xl p-6 mb-5 flex flex-col items-center justify-center gap-2 cursor-pointer border-dashed border-2 border-border hover:border-primary/40 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload size={20} className="text-primary" />
          </div>
          <div className="text-sm font-medium">Upload Report</div>
          <div className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC — tap to pick from your device</div>
          <div className="flex items-center gap-1.5 mt-1 text-primary text-xs font-medium">
            <FolderOpen size={13} /> Browse Files
          </div>
        </motion.button>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total', value: records.length.toString(), color: 'primary' },
            { label: 'Normal', value: records.filter(r => r.status === 'normal').length.toString(), color: 'success' },
            { label: 'Pending', value: records.filter(r => r.status === 'pending').length.toString(), color: 'warning' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-3 text-center">
              <div className="font-display font-bold text-xl" style={{ color: `hsl(var(--${s.color}))` }}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Records list */}
        <div className="space-y-3">
          {records.map((rec, i) => (
            <motion.div key={rec.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `hsl(var(--${typeColor(rec.type)}) / 0.15)` }}>
                <FileText size={18} style={{ color: `hsl(var(--${typeColor(rec.type)}))` }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{rec.name}</div>
                <div className="text-[10px] text-muted-foreground">{rec.doctor} · {rec.date} · {rec.size}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={rec.status === 'normal' ? 'badge-success' : rec.status === 'reviewed' ? 'badge-primary' : 'badge-primary'}>
                  {rec.status}
                </span>
                <button onClick={() => handleDelete(rec.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-emergency hover:bg-emergency/10 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav isFemale={isFemale} />
    </div>
  );
};

export default MedicalRecordsPage;
