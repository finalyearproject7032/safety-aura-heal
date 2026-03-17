import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { PhoneCall, MapPin, X, MessageSquare } from 'lucide-react';

const SOSOverlay: React.FC = () => {
  const { user, cancelSOS, sosSmsSent, sosCountdown, location } = useApp();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden animate-sos-flash"
    >
      {/* Deep red bg */}
      <div className="absolute inset-0" style={{ background: 'hsl(0,84%,12%)' }} />

      {/* Pulse rings */}
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          animate={{ scale: [1, 2 + i * 0.3], opacity: [0.4, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.4, ease: 'easeOut' }}
          className="absolute w-48 h-48 rounded-full border-2 border-red-400"
        />
      ))}

      {/* Flashing top bar */}
      <motion.div
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
        className="absolute top-0 left-0 right-0 h-2 bg-emergency"
      />
      <motion.div
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.5, delay: 0.25 }}
        className="absolute bottom-0 left-0 right-0 h-2 bg-emergency"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm px-6 text-center">
        {/* SOS label */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-md">
            <div className="w-3 h-3 rounded-full bg-emergency animate-ping" />
            <span className="font-display font-black text-2xl text-white tracking-[0.2em]">SOS ACTIVE</span>
            <div className="w-3 h-3 rounded-full bg-emergency animate-ping" />
          </div>
        </motion.div>

        {/* Timer */}
        <div className="font-mono text-5xl font-black text-white mb-1">{fmt(elapsed)}</div>
        <div className="text-white/50 text-xs uppercase tracking-widest mb-6">Emergency Duration</div>

        {/* Info Card */}
        <div className="glass-emergency rounded-2xl p-5 mb-5 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 uppercase tracking-wider">Patient</span>
            <span className="font-display font-bold text-white">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 uppercase tracking-wider">Phone</span>
            <span className="font-mono text-white/80 text-sm">{user?.phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 uppercase tracking-wider">Gender</span>
            <span className="text-white/80 text-sm capitalize">{user?.gender}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 uppercase tracking-wider">Blood</span>
            <span className="text-emergency font-bold">{user?.medicalInfo.bloodGroup}</span>
          </div>
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-white/50" />
              <span className="text-white/70 text-xs">{location?.address || 'Locating...'}</span>
            </div>
            {location && (
              <div className="font-mono text-[10px] text-white/40 mt-1">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur border border-white/10"
          >
            <div className="w-2 h-2 rounded-full bg-emergency animate-ping" />
            <span className="text-white/80 text-xs">Alerting emergency services...</span>
          </motion.div>

          {user?.emergencyContacts.map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.3 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur border border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-white/80 text-xs">Calling {c.name} ({c.relation})</span>
            </motion.div>
          ))}

          {sosSmsSent && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-success/15 border border-success/30"
            >
              <MessageSquare size={14} className="text-success" />
              <span className="text-success text-xs font-medium">✓ SMS Alert Sent via Twilio to Family</span>
            </motion.div>
          )}
        </div>

        {/* Cancel */}
        <motion.button
          onClick={cancelSOS}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl bg-white text-red-700 font-display font-black text-lg flex items-center justify-center gap-2 shadow-2xl"
        >
          <X size={20} />
          CANCEL SOS ({sosCountdown}s)
        </motion.button>

        <p className="text-white/30 text-[10px] mt-3 uppercase tracking-wider">
          Auto-cancels in {sosCountdown} seconds
        </p>
      </div>
    </motion.div>
  );
};

export default SOSOverlay;
