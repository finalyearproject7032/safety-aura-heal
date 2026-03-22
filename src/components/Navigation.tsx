import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert, Home, Calendar, FileText, MapPin, LogOut,
  Mic, Camera, Navigation, PhoneCall, Activity, Zap, Menu, X, User
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const femaleNav: NavItem[] = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: ShieldAlert, label: 'SOS', path: '/dashboard' },
  { icon: Navigation, label: 'Safe Zones', path: '/women-safety' },
  { icon: Calendar, label: 'Doctors', path: '/appointments' },
  { icon: FileText, label: 'Records', path: '/records' },
];

const maleNav: NavItem[] = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Calendar, label: 'Book', path: '/appointments' },
  { icon: MapPin, label: 'Ambulance', path: '/ambulance' },
  { icon: Activity, label: 'AI Doctor', path: '/ai-doctor' },
  { icon: FileText, label: 'Records', path: '/records' },
];

const adminNav: NavItem[] = [
  { icon: Home, label: 'Overview', path: '/admin' },
  { icon: ShieldAlert, label: 'Emergency', path: '/admin' },
  { icon: Calendar, label: 'Appointments', path: '/appointments' },
  { icon: Activity, label: 'Analytics', path: '/admin' },
  { icon: MapPin, label: 'Map', path: '/admin' },
];

interface BottomNavProps {
  isFemale?: boolean;
  isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ isFemale, isAdmin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerSOS, user } = useApp();
  const navItems = isAdmin ? adminNav : isFemale ? femaleNav : maleNav;
  const accentColor = isFemale ? 'var(--safety)' : 'var(--primary)';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="glass-card mx-3 mb-3 rounded-2xl border border-white/5 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            const isSosButton = isFemale && i === 1;

            if (isSosButton) {
              return (
                <motion.button
                  key="sos-nav"
                  onClick={triggerSOS}
                  whileTap={{ scale: 0.9 }}
                  className="relative -mt-6 w-14 h-14 rounded-full flex items-center justify-center shadow-emergency"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--emergency)), hsl(0,84%,35%))' }}
                >
                  <ShieldAlert size={24} className="text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emergency animate-ping" />
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item.path + item.label}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.9 }}
                className={`nav-item flex-1 ${isActive ? (isFemale ? 'active-safety' : 'active') : ''}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `hsl(${accentColor} / 0.12)` }}
                  />
                )}
                <item.icon size={18} className="relative z-10" />
                <span className="text-[10px] font-medium relative z-10">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface SidebarProps {
  isFemale?: boolean;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isFemale, isAdmin }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser, triggerSOS } = useApp();

  const navItems = isAdmin ? adminNav : isFemale ? femaleNav : maleNav;

  const extraItems: NavItem[] = isFemale
    ? [
        { icon: Camera, label: 'Auto Recording', path: '/women-safety' },
        { icon: Mic, label: 'Voice SOS', path: '/women-safety' },
        { icon: PhoneCall, label: 'Quick Dial', path: '/women-safety' },
        { icon: Zap, label: 'Calculator', path: '/calculator' },
      ]
    : [
        { icon: Activity, label: 'AI Doctor', path: '/ai-doctor' },
        { icon: MapPin, label: 'Ambulance', path: '/ambulance' },
      ];

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      {/* Toggle button visible on desktop */}
      <button
        onClick={() => setOpen(!open)}
        className="hidden md:flex fixed top-4 left-4 z-50 w-10 h-10 items-center justify-center rounded-xl glass-card border border-white/5 hover:border-primary/30 transition-all"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:block hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 hidden md:flex flex-col"
              style={{ background: 'hsl(var(--sidebar-background))' }}
            >
              <div className="flex items-center gap-3 p-5 border-b border-sidebar-border">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: isFemale ? 'hsl(var(--safety) / 0.15)' : 'hsl(var(--primary) / 0.15)' }}>
                  {isFemale ? <ShieldAlert size={18} style={{ color: 'hsl(var(--safety))' }} /> : <Activity size={18} style={{ color: 'hsl(var(--primary))' }} />}
                </div>
                <div>
                  <div className="font-display font-semibold text-sm text-sidebar-foreground">AegisMed</div>
                  <div className="text-[10px] text-muted-foreground">{isFemale ? 'Safety Mode' : isAdmin ? 'Hospital Admin' : 'Healthcare'}</div>
                </div>
              </div>

              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                <div className="section-header px-3 py-2">Navigation</div>
                {navItems.map(item => (
                  <motion.button
                    key={item.path + item.label}
                    onClick={() => { navigate(item.path); setOpen(false); }}
                    whileHover={{ x: 2 }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      location.pathname === item.path
                        ? isFemale
                          ? 'bg-safety/10 text-safety border border-safety/20'
                          : 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </motion.button>
                ))}

                <div className="section-header px-3 py-2 mt-4">Features</div>
                {extraItems.map(item => (
                  <motion.button
                    key={item.label}
                    onClick={() => { navigate(item.path); setOpen(false); }}
                    whileHover={{ x: 2 }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </motion.button>
                ))}
              </nav>

              <div className="p-3 border-t border-sidebar-border">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' }}>
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-sidebar-foreground">{user?.name}</div>
                    <div className="text-[10px] text-muted-foreground">{user?.email}</div>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-emergency hover:bg-emergency/5 transition-all duration-200">
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
