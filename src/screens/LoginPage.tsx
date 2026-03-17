import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Activity, Lock, Mail, ChevronRight, Stethoscope } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { mockFemaleUser, mockMaleUser, mockAdminDemoUser } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { label: 'Female User', user: mockFemaleUser, color: 'safety' },
    { label: 'Male User', user: mockMaleUser, color: 'primary' },
    { label: 'Hospital Admin', user: mockAdminDemoUser, color: 'success' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    // demo login
    if (email.includes('admin')) {
      setUser(mockAdminDemoUser);
    } else if (email.includes('female') || email.includes('priya')) {
      setUser(mockFemaleUser);
    } else {
      setUser(mockMaleUser);
    }
    toast({ title: 'Logged in successfully', description: 'Welcome to Aegis-Med' });
    navigate('/dashboard');
    setLoading(false);
  };

  const quickLogin = (user: typeof mockFemaleUser) => {
    setLoading(true);
    setTimeout(() => {
      setUser(user);
      toast({ title: `Welcome, ${user.name}!`, description: 'Session started' });
      navigate('/dashboard');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ background: 'hsl(var(--primary))' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-8 blur-[120px]" style={{ background: 'hsl(var(--emergency))' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, hsl(213,94%,59%), hsl(213,94%,35%))' }}
          >
            <ShieldCheck size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Aegis<span className="neon-blue">Med</span></h1>
          <p className="text-muted-foreground text-sm mt-1">Smart Healthcare & Safety System</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-semibold mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-6">Sign in to your command center</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="aegis-input pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="aegis-input pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-glow transition-colors">
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full h-11 relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Activity size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In</span>
                  <ChevronRight size={16} />
                </div>
              )}
            </motion.button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 py-0.5 rounded-full text-muted-foreground border border-border">Quick Demo</span>
            </div>
          </div>

          {/* Demo buttons */}
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((demo) => (
              <motion.button
                key={demo.label}
                onClick={() => quickLogin(demo.user)}
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="p-2.5 rounded-xl text-center text-xs font-medium transition-all duration-200 border border-border hover:border-primary/30"
                style={{ background: 'hsl(var(--surface-2))' }}
              >
                <Stethoscope size={16} className="mx-auto mb-1 text-muted-foreground" />
                <span className="text-muted-foreground">{demo.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          No account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-glow transition-colors font-medium">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
