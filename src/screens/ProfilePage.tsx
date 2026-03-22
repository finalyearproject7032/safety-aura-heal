import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, Mail, Droplets, AlertTriangle,
  Heart, Shield, LogOut, Edit3, UserCheck, BadgeCheck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/Navigation';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useApp();
  const isFemale = user?.gender === 'female';

  const accent = isFemale ? 'var(--safety)' : 'var(--primary)';
  const accentClass = isFemale ? 'text-safety' : 'text-primary';
  const bgClass = isFemale ? 'bg-safety/10 border-safety/20' : 'bg-primary/10 border-primary/20';

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  if (!user) return null;

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bgClass} border`}>
        <Icon size={14} style={{ color: `hsl(${accent})` }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="text-sm font-medium text-foreground mt-0.5 break-words">{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background bg-grid pb-28">
      {/* Ambient glow */}
      <div className="fixed top-0 right-0 w-72 h-72 rounded-full blur-[120px] pointer-events-none opacity-8"
        style={{ background: `hsl(${accent})` }} />

      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 py-6">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold">My Profile</h1>
            <p className="text-xs text-muted-foreground">Your registered details</p>
          </div>
        </motion.div>

        {/* Avatar + name card */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card-glow rounded-2xl p-6 mb-5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 80% 20%, hsl(${accent} / 0.08), transparent 60%)` }} />
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black relative"
              style={{ background: `hsl(${accent} / 0.15)`, border: `2px solid hsl(${accent} / 0.3)` }}>
              <span style={{ color: `hsl(${accent})` }}>{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-lg leading-tight">{user.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wide ${bgClass}`}
                  style={{ color: `hsl(${accent})` }}>
                  {user.gender}
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wide ${bgClass}`}
                  style={{ color: `hsl(${accent})` }}>
                  {user.role === 'admin' ? '🏥 Admin' : '👤 User'}
                </span>
                {isFemale && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-safety/10 border border-safety/20 text-safety font-semibold">
                    💖 Safety Mode
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <BadgeCheck size={22} style={{ color: `hsl(${accent})` }} />
            </div>
          </div>
        </motion.div>

        {/* Personal Details */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4 mb-4">
          <div className={`flex items-center gap-2 mb-2 ${accentClass}`}>
            <User size={14} />
            <span className="text-xs font-display font-semibold uppercase tracking-wider">Personal Details</span>
          </div>
          <InfoRow icon={User} label="Full Name" value={user.name} />
          <InfoRow icon={Mail} label="Email Address" value={user.email} />
          <InfoRow icon={Phone} label="Mobile Number" value={user.phone} />
          <InfoRow icon={UserCheck} label="Gender" value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)} />
        </motion.div>

        {/* Medical Info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-4 mb-4">
          <div className={`flex items-center gap-2 mb-2 ${accentClass}`}>
            <Heart size={14} />
            <span className="text-xs font-display font-semibold uppercase tracking-wider">Medical Information</span>
          </div>
          <InfoRow icon={Droplets} label="Blood Group" value={user.medicalInfo?.bloodGroup || 'Not specified'} />
          <InfoRow
            icon={AlertTriangle}
            label="Allergies"
            value={user.medicalInfo?.allergies?.length ? user.medicalInfo.allergies.join(', ') : 'None reported'}
          />
          <InfoRow
            icon={Heart}
            label="Existing Conditions"
            value={user.medicalInfo?.conditions?.length ? user.medicalInfo.conditions.join(', ') : 'None reported'}
          />
        </motion.div>

        {/* Emergency Contacts */}
        {user.emergencyContacts?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4 mb-4">
            <div className={`flex items-center gap-2 mb-3 ${accentClass}`}>
              <Shield size={14} />
              <span className="text-xs font-display font-semibold uppercase tracking-wider">Emergency Contacts</span>
            </div>
            <div className="space-y-3">
              {user.emergencyContacts.map((contact, idx) => (
                <motion.div key={idx} whileHover={{ x: 2 }}
                  className={`rounded-xl p-3 border ${bgClass}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: `hsl(${accent} / 0.2)`, color: `hsl(${accent})` }}>
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{contact.name}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">{contact.relation}</div>
                      <div className="flex flex-col gap-0.5 mt-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone size={10} />
                          <span className="font-mono">{contact.phone}</span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail size={10} />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <a href={`tel:${contact.phone}`}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgClass} border`}>
                        <Phone size={12} style={{ color: `hsl(${accent})` }} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="space-y-3 mb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emergency/10 border border-emergency/25 text-emergency font-semibold text-sm hover:bg-emergency/20 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </motion.div>
      </div>

      <BottomNav isFemale={isFemale} />
    </div>
  );
};

export default ProfilePage;
