import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, User, Mail, Phone, Lock, ChevronRight, CheckCircle } from 'lucide-react';
import { useApp, UserGender, UserRole } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: '' as UserGender | '',
    role: 'user' as UserRole,
    emergencyContact1Name: '',
    emergencyContact1Phone: '',
    emergencyContact1Email: '',
    bloodGroup: '',
  });

  const genders: { value: UserGender; label: string; emoji: string; desc: string }[] = [
    { value: 'female', label: 'Female', emoji: '👩', desc: 'Safety Mode + Healthcare' },
    { value: 'male', label: 'Male', emoji: '👨', desc: 'Healthcare Dashboard' },
    { value: 'other', label: 'Other', emoji: '🧑', desc: 'Combined Dashboard' },
  ];

  const handleNext = () => {
    if (step === 1 && (!form.name || !form.email || !form.phone)) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    if (step === 2 && !form.gender) {
      toast({ title: 'Please select gender', variant: 'destructive' });
      return;
    }
    setStep(s => s + 1);
  };

  const handleRegister = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));

    const newUser = {
      id: `user_${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      gender: form.gender as UserGender,
      role: form.role,
      emergencyContacts: form.emergencyContact1Name ? [
        { name: form.emergencyContact1Name, phone: form.emergencyContact1Phone, email: form.emergencyContact1Email, relation: 'Emergency Contact' }
      ] : [],
      medicalInfo: {
        bloodGroup: form.bloodGroup || 'Unknown',
        allergies: [],
        conditions: [],
      },
    };

    setUser(newUser);
    toast({ title: '🎉 Account created!', description: `Welcome, ${form.name}` });
    navigate('/dashboard');
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const steps = ['Profile', 'Identity', 'Safety'];

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-8 blur-[120px]" style={{ background: 'hsl(var(--safety))' }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-10 blur-[120px]" style={{ background: 'hsl(var(--primary))' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{ background: 'linear-gradient(135deg, hsl(213,94%,59%), hsl(213,94%,35%))' }}>
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm">Join Aegis-Med protection network</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step > i + 1 ? 'bg-success text-white' :
                  step === i + 1 ? 'bg-primary text-white' :
                  'bg-surface-2 text-muted-foreground border border-border'
                }`}>
                  {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium ${step === i + 1 ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mb-4 transition-all duration-300 ${step > i + 1 ? 'bg-success' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="font-display font-semibold text-lg">Basic Profile</h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" className="aegis-input pl-10" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" className="aegis-input pl-10" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className="aegis-input pl-10" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" className="aegis-input pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['user', 'admin'] as UserRole[]).map(r => (
                      <button key={r} onClick={() => update('role', r)}
                        className={`p-3 rounded-xl text-sm font-medium border transition-all ${form.role === r ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted-foreground hover:border-primary/30'}`}>
                        {r === 'user' ? '🧑 Patient' : '🏥 Hospital Admin'}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Gender */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <h3 className="font-display font-semibold text-lg">Your Identity</h3>
                  <p className="text-muted-foreground text-sm mt-1">This personalizes your safety dashboard</p>
                </div>

                <div className="space-y-3">
                  {genders.map(g => (
                    <motion.button
                      key={g.value}
                      onClick={() => update('gender', g.value)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                        form.gender === g.value
                          ? g.value === 'female'
                            ? 'border-safety bg-safety/10'
                            : 'border-primary bg-primary/10'
                          : 'border-border bg-surface-2 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{g.emoji}</span>
                        <div>
                          <div className={`font-semibold ${form.gender === g.value ? (g.value === 'female' ? 'text-safety' : 'text-primary') : 'text-foreground'}`}>{g.label}</div>
                          <div className="text-xs text-muted-foreground">{g.desc}</div>
                        </div>
                        {form.gender === g.value && (
                          <CheckCircle size={18} className={`ml-auto ${g.value === 'female' ? 'text-safety' : 'text-primary'}`} />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {form.gender === 'female' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl border border-safety/30 bg-safety/5 text-sm text-safety">
                    💖 Women Safety Mode will be activated — includes hidden SOS, auto recording, safe zones & voice triggers
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 3: Safety */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <h3 className="font-display font-semibold text-lg">Safety Setup</h3>
                  <p className="text-muted-foreground text-sm mt-1">Emergency contact & medical info</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Emergency Contact Name</label>
                  <input value={form.emergencyContact1Name} onChange={e => update('emergencyContact1Name', e.target.value)} placeholder="Contact person name" className="aegis-input" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Emergency Phone</label>
                  <input type="tel" value={form.emergencyContact1Phone} onChange={e => update('emergencyContact1Phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className="aegis-input" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => update('bloodGroup', e.target.value)} className="aegis-input">
                    <option value="">Select blood group</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <motion.button
                  onClick={handleRegister}
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full h-11"
                >
                  {loading ? 'Creating account...' : '🚀 Launch Dashboard'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 3 && (
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full h-11 mt-5"
            >
              Continue <ChevronRight size={16} />
            </motion.button>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already registered?{' '}
          <Link to="/login" className="text-primary hover:text-primary-glow transition-colors font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
