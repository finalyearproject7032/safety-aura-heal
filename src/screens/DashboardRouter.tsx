import React from 'react';
import { useApp } from '@/context/AppContext';
import FemaleDashboard from './FemaleDashboard';
import MaleDashboard from './MaleDashboard';
import OtherDashboard from './OtherDashboard';
import HospitalDashboard from './HospitalDashboard';

const DashboardRouter: React.FC = () => {
  const { user } = useApp();

  if (!user) return null;

  if (user.role === 'admin') return <HospitalDashboard />;
  if (user.gender === 'female') return <FemaleDashboard />;
  if (user.gender === 'male') return <MaleDashboard />;
  return <OtherDashboard />;
};

export default DashboardRouter;
