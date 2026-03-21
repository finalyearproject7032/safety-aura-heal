import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'user' | 'admin';
export type UserGender = 'male' | 'female' | 'other';

export interface EmergencyContact {
  name: string;
  phone: string;
  email?: string;
  relation: string;
}

export interface MedicalInfo {
  bloodGroup: string;
  allergies: string[];
  conditions: string[];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: UserGender;
  role: UserRole;
  avatar?: string;
  emergencyContacts: EmergencyContact[];
  medicalInfo: MedicalInfo;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  timestamp: number;
}

interface AppContextType {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  isSOS: boolean;
  setIsSOS: (v: boolean) => void;
  triggerSOS: () => void;
  cancelSOS: () => void;
  location: Location | null;
  setLocation: (l: Location | null) => void;
  sosSmsSent: boolean;
  sosSmsFailed: boolean;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  sosCountdown: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    const stored = localStorage.getItem('aegis_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isSOS, setIsSOS] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [sosSmsSent, setSosSmsSent] = useState(false);
  const [sosSmsFailed, setSosSmsFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(30);

  // Audio refs for continuous looping siren
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenActiveRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sirenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aegis_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aegis_user');
    }
  }, [user]);

  // Get geolocation once on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: 'Location detected',
            timestamp: Date.now(),
          });
        },
        () => {
          setLocation({
            lat: 28.6139,
            lng: 77.2090,
            address: 'New Delhi, India',
            timestamp: Date.now(),
          });
        }
      );
    }
  }, []);

  // ─── Continuous looping siren using Web Audio API ───────────────────
  const startSiren = () => {
    if (sirenActiveRef.current) return;
    sirenActiveRef.current = true;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const playLoop = () => {
        if (!sirenActiveRef.current) return;
        // One siren cycle: hi-low sweep × 4 = ~2s, then repeat
        const cycleDuration = 2.0;
        const beepCount = 4;
        for (let i = 0; i < beepCount; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          const startT = ctx.currentTime + (i * cycleDuration) / beepCount;
          const dur = cycleDuration / beepCount - 0.04;

          // Sweep from 880 Hz down to 660 Hz
          osc.frequency.setValueAtTime(880, startT);
          osc.frequency.linearRampToValueAtTime(660, startT + dur);

          gain.gain.setValueAtTime(0.0, startT);
          gain.gain.linearRampToValueAtTime(0.5, startT + 0.02);
          gain.gain.setValueAtTime(0.5, startT + dur - 0.05);
          gain.gain.linearRampToValueAtTime(0.0, startT + dur);

          osc.start(startT);
          osc.stop(startT + dur);
        }

        sirenTimeoutRef.current = setTimeout(() => {
          if (sirenActiveRef.current) playLoop();
        }, cycleDuration * 1000);
      };

      playLoop();
    } catch {
      // Browser may block audio — silently ignore
    }
  };

  const stopSiren = () => {
    sirenActiveRef.current = false;
    if (sirenTimeoutRef.current) {
      clearTimeout(sirenTimeoutRef.current);
      sirenTimeoutRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch { /* ignore */ }
      audioCtxRef.current = null;
    }
  };

  // ─── Send SOS to n8n via Edge Function proxy (avoids CORS) ──────────
  const sendSOSSms = async (currentLocation: Location | null, currentUser: AppUser) => {
    try {
      console.log('🚨 Sending SOS via edge function proxy to n8n…');

      const { data, error } = await supabase.functions.invoke('sos-webhook', {
        body: {
          name: currentUser.name,
          phone: currentUser.phone,
          gender: currentUser.gender,
          bloodGroup: currentUser.medicalInfo?.bloodGroup || 'N/A',
          allergies: currentUser.medicalInfo?.allergies || [],
          conditions: currentUser.medicalInfo?.conditions || [],
          emergencyContacts: currentUser.emergencyContacts || [],
          location: currentLocation
            ? {
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                address: currentLocation.address,
              }
            : null,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;

      console.log('✅ n8n webhook triggered successfully', data);
      setSosSmsSent(true);
      setSosSmsFailed(false);
    } catch (err) {
      console.error('SOS webhook failed:', err);
      setSosSmsFailed(true);
    }
  };

  const triggerSOS = () => {
    setIsSOS(true);
    setSosSmsSent(false);
    setSosSmsFailed(false);
    setSosCountdown(30);

    // Vibrate pattern (loops on supported devices)
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 1000, 300, 500, 200, 500]);
    }

    // Start continuous looping siren
    startSiren();

    // Send real SMS after short delay (allow location to be used)
    if (user) {
      setTimeout(() => sendSOSSms(location, user), 1500);
    }

    // Countdown from 30
    let count = 30;
    countdownRef.current = setInterval(() => {
      count--;
      setSosCountdown(count);
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
      }
    }, 1000);
  };

  const cancelSOS = () => {
    setIsSOS(false);
    setSosSmsSent(false);
    setSosSmsFailed(false);
    setSosCountdown(30);
    stopSiren();
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  return (
    <AppContext.Provider value={{
      user, setUser, isSOS, setIsSOS, triggerSOS, cancelSOS,
      location, setLocation, sosSmsSent, sosSmsFailed, isLoading, setIsLoading, sosCountdown,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
