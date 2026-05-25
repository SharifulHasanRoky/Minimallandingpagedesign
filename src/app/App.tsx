import { useState } from 'react';
import OmniCoreLanding from './components/OmniCoreLanding';
import OmniCoreDashboard from './components/OmniCoreDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard'>('landing');

  if (currentPage === 'dashboard') {
    return <OmniCoreDashboard onLogout={() => setCurrentPage('landing')} />;
  }

  return <OmniCoreLanding onGetStarted={() => setCurrentPage('dashboard')} />;
}
