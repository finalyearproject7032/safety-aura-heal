import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[10%] w-[400px] h-[400px] rounded-full opacity-8 blur-[120px]" style={{ background: 'hsl(var(--primary))' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{ background: 'linear-gradient(135deg, hsl(213,94%,59%), hsl(213,94%,35%))' }}>
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold">Reset Password</h1>
          <p className="text-muted-foreground text-sm">We'll send recovery instructions</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
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

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full h-11"
              >
                {loading ? 'Sending...' : 'Send Recovery Link'}
              </motion.button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <CheckCircle size={48} className="mx-auto mb-3 text-success" />
              <h3 className="font-display font-semibold text-lg mb-1">Check your inbox</h3>
              <p className="text-muted-foreground text-sm">Recovery link sent to <span className="text-primary">{email}</span></p>
            </motion.div>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-5">
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
