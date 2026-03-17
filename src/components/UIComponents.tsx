import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background p-4 space-y-4">
    <div className="flex items-center justify-between py-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-40" />
      </div>
      <Skeleton className="h-10 w-24 rounded-full" />
    </div>
    <Skeleton className="h-40 w-full rounded-2xl" />
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
    </div>
    <div className="space-y-3">
      {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
  </div>
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'emergency' | 'safety' | 'primary';
}

export const GlassCard: React.FC<CardProps> = ({ children, className = '', onClick, variant = 'default' }) => {
  const classes = {
    default: 'glass-card',
    emergency: 'glass-emergency',
    safety: 'glass-safety',
    primary: 'glass-card-glow',
  };

  return (
    <motion.div
      whileHover={onClick ? { y: -2, scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`${classes[variant]} rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  active?: boolean;
  variant?: 'default' | 'emergency' | 'safety' | 'primary';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, sub, active, variant = 'default', onClick }) => {
  const iconColors = {
    default: active ? 'text-primary' : 'text-muted-foreground',
    emergency: 'text-emergency',
    safety: 'text-safety',
    primary: 'text-primary',
  };

  return (
    <GlassCard variant={active ? variant : 'default'} onClick={onClick} className="p-4 cursor-pointer">
      <div className={`mb-3 ${iconColors[variant]}`}>
        <Icon size={20} />
      </div>
      <div className="font-display font-bold text-sm text-foreground leading-tight">{label}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{value}</div>
      {sub && <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: `hsl(var(--${variant === 'safety' ? 'safety' : 'primary'}))` }}>{sub}</div>}
    </GlassCard>
  );
};

export const VitalCard: React.FC<{ label: string; value: string; unit: string; status: 'normal' | 'warning' | 'critical'; icon: React.ElementType }> = ({
  label, value, unit, status, icon: Icon
}) => {
  const colors = { normal: 'text-success', warning: 'text-warning', critical: 'text-emergency' };
  const bg = { normal: 'bg-success/5 border-success/20', warning: 'bg-warning/5 border-warning/20', critical: 'bg-emergency/5 border-emergency/20' };

  return (
    <div className={`p-3 rounded-xl border ${bg[status]}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon size={12} className={colors[status]} />
      </div>
      <div className="font-mono font-bold text-lg text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{unit}</div>
    </div>
  );
};

export const SectionTitle: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="font-display font-semibold text-base text-foreground">{title}</h2>
    {action}
  </div>
);

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } },
};

export const StaggerList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <motion.div variants={stagger.container} initial="hidden" animate="show" className={className}>
    {React.Children.map(children, child => (
      <motion.div variants={stagger.item}>{child}</motion.div>
    ))}
  </motion.div>
);
