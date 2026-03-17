import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Star, Calendar, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { mockDoctors, specializations } from '@/data/mockData';

const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { toast } = useToast();
  const isFemale = user?.gender === 'female';
  const [search, setSearch] = useState('');
  const [activeSpec, setActiveSpec] = useState('All');
  const [booked, setBooked] = useState<Record<string, string>>({});
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});

  const filtered = mockDoctors.filter(d => {
    const matchSpec = activeSpec === 'All' || d.specialization === activeSpec;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  });

  const handleBook = (doctorId: string, slot: string) => {
    setBooked(prev => ({ ...prev, [doctorId]: slot }));
    const doc = mockDoctors.find(d => d.id === doctorId);
    toast({ title: `✅ Appointment Booked`, description: `${doc?.name} at ${slot}` });
  };

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      <div className="max-w-lg mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 py-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center hover:border-primary/30 transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold">Book Appointment</h1>
            <p className="text-xs text-muted-foreground">{filtered.length} doctors available</p>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctor or specialty..." className="aegis-input pl-10" />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {specializations.map(s => (
            <button key={s} onClick={() => setActiveSpec(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeSpec === s
                  ? isFemale ? 'bg-safety/15 text-safety border-safety/30' : 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-surface-2 text-muted-foreground border-border hover:border-primary/20'
              }`}>
              {s}
            </button>
          ))}
        </div>

        {/* Doctor cards */}
        <div className="space-y-4">
          {filtered.map((doc, i) => (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass-card rounded-2xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <img src={doc.image} alt={doc.name} className="w-14 h-14 rounded-xl bg-surface-2" />
                <div className="flex-1">
                  <div className="font-display font-semibold">{doc.name}</div>
                  <div className="text-xs text-muted-foreground">{doc.specialization} · {doc.hospital}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-warning"><Star size={10} fill="currentColor" />{doc.rating}</span>
                    <span className="text-xs text-muted-foreground">{doc.experience}y exp</span>
                    <span className={doc.available ? 'badge-success' : 'badge-emergency'}>{doc.available ? 'Available' : 'Full'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">₹{doc.fee}</div>
                  <div className="text-[10px] text-muted-foreground">per visit</div>
                </div>
              </div>

              {/* Slots */}
              {doc.available && !booked[doc.id] && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Available Slots</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {doc.slots.map(slot => {
                      const isBooked = doc.bookedSlots.includes(slot);
                      const isSelected = selectedSlots[doc.id] === slot;
                      return (
                        <button key={slot} disabled={isBooked}
                          onClick={() => setSelectedSlots(prev => ({ ...prev, [doc.id]: slot }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                            isBooked ? 'opacity-30 cursor-not-allowed bg-surface-2 text-muted-foreground' :
                            isSelected ? (isFemale ? 'bg-safety/20 text-safety border border-safety/40' : 'bg-primary/20 text-primary border border-primary/40') :
                            'bg-surface-2 text-foreground hover:bg-surface-3 border border-border'
                          }`}>
                          {slot}{isBooked ? ' ✗' : ''}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSlots[doc.id] && (
                    <motion.button initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleBook(doc.id, selectedSlots[doc.id])}
                      className={isFemale ? 'btn-safety w-full' : 'btn-primary w-full'}>
                      <Calendar size={14} />Book at {selectedSlots[doc.id]}
                    </motion.button>
                  )}
                </div>
              )}

              {booked[doc.id] && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-success/10 border border-success/25 text-sm text-success text-center font-medium">
                  ✓ Booked for {booked[doc.id]}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav isFemale={isFemale} />
    </div>
  );
};

export default AppointmentsPage;
