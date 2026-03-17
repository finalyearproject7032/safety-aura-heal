import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/Navigation';

const AmbulanceTracking: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const isFemale = user?.gender === 'female';
  const [eta, setEta] = useState(12);
  const [status, setStatus] = useState('En Route');

  useEffect(() => {
    const iv = setInterval(() => {
      setEta(e => {
        if (e <= 1) { setStatus('Arrived'); return 0; }
        return e - 1;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      <div className="max-w-lg mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 py-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold">Ambulance Tracking</h1>
            <p className="text-xs text-muted-foreground">Live location updates</p>
          </div>
        </motion.div>

        {/* Status */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-emergency rounded-2xl p-5 mb-5 text-center">
          <div className="text-4xl font-display font-black text-emergency mb-1">{eta > 0 ? `${eta} min` : 'Arrived!'}</div>
          <div className="text-sm text-muted-foreground">Estimated Arrival</div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="pulse-dot pulse-dot-red" />
            <span className="text-sm font-medium text-emergency">{status}</span>
          </div>
        </motion.div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden glass-card mb-5">
          <iframe title="Ambulance Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.0!2d77.2090!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM2JzUwLjAiTiA3N8KwMTInMzIuNCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
            width="100%" height="250" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} allowFullScreen loading="lazy" />
        </div>

        {/* Driver info */}
        <div className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-lg">R</div>
          <div className="flex-1">
            <div className="font-semibold">Rajesh (Driver)</div>
            <div className="text-xs text-muted-foreground">Ambulance #AMB-2045 · GJ-12-X-1234</div>
          </div>
          <a href="tel:+919876543210" className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
            <Phone size={16} className="text-success" />
          </a>
        </div>

        {/* Steps */}
        {[
          { label: 'Call Received', done: true },
          { label: 'Ambulance Dispatched', done: true },
          { label: 'En Route to Location', done: eta < 10 },
          { label: 'Arrived', done: eta === 0 },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-success text-white' : 'bg-surface-2 text-muted-foreground border border-border'}`}>
              {step.done ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${step.done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{step.label}</span>
          </div>
        ))}
      </div>
      <BottomNav isFemale={isFemale} />
    </div>
  );
};

export default AmbulanceTracking;
