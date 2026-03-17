import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type UserRole = 'user' | 'admin';
export type UserGender = 'male' | 'female' | 'other';

export interface EmergencyContact {
  name: string;
  phone: string;
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
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  sosCountdown: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SOS_WEBHOOK = 'https://n8n.placeholder-webhook.com/sos';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    const stored = localStorage.getItem('aegis_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isSOS, setIsSOS] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [sosSmsSent, setSosSmsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(30);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aegis_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aegis_user');
    }
  }, [user]);

  // Get geolocation
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

  const triggerSOS = () => {
    setIsSOS(true);
    setSosSmsSent(false);
    setSosCountdown(30);

    // Vibrate
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 1000]);
    }

    // Simulate audio siren using Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      for (let i = 0; i < 8; i++) {
        playBeep(880, i * 0.5, 0.3);
        playBeep(660, i * 0.5 + 0.25, 0.25);
      }
    } catch {
      // ignore
    }

    // Simulate webhook
    setTimeout(() => {
      fetch(SOS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.name,
          phone: user?.phone,
          gender: user?.gender,
          emergencyContacts: user?.emergencyContacts,
          location: location,
          type: 'SOS',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
      setSosSmsSent(true);
    }, 2000);

    // Countdown
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
    setSosCountdown(30);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  return (
    <AppContext.Provider value={{
      user, setUser, isSOS, setIsSOS, triggerSOS, cancelSOS,
      location, setLocation, sosSmsSent, isLoading, setIsLoading, sosCountdown,
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
