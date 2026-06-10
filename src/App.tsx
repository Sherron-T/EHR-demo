import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './views/Dashboard';
import PatientChart from './views/PatientChart';
import PatientList from './views/PatientList';
import Schedule from './views/Schedule';
import EPrescribing from './views/EPrescribing';
import NewNote from './views/NewNote';
import Reports from './views/Reports';
import Telehealth from './views/Telehealth';
import Messaging from './views/Messaging';
import Referrals from './views/Referrals';
import PriorAuth from './views/PriorAuth';
import Settings from './views/Settings';
import Login from './views/Login';
import Superbill from './views/Superbill';
import Inbox from './views/Inbox';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';

export type ViewType =
  | 'dashboard'
  | 'patient_list'
  | 'patients'
  | 'schedule'
  | 'eprescribing'
  | 'reports'
  | 'new_note'
  | 'telehealth'
  | 'messaging'
  | 'referrals'
  | 'prior_auth'
  | 'settings'
  | 'superbill'
  | 'inbox';

const ALL_VIEWS: ViewType[] = [
  'dashboard', 'patient_list', 'patients', 'schedule', 'eprescribing',
  'reports', 'new_note', 'telehealth', 'messaging', 'referrals',
  'prior_auth', 'settings', 'superbill', 'inbox',
];

function viewFromHash(): ViewType {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return (ALL_VIEWS as string[]).includes(hash) ? (hash as ViewType) : 'dashboard';
}

function MobileNotice({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl signature-gradient flex items-center justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>desktop_windows</span>
        </div>
        <h1 className="font-headline font-bold text-xl text-on-surface mb-2">Best viewed on desktop</h1>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          This EHR demo is designed for clinical workstations and works best on a larger screen.
          You can continue on this device, but some layouts may not fit.
        </p>
        <button
          onClick={onContinue}
          className="px-6 py-3 signature-gradient text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all"
        >
          Continue anyway
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const [currentView, setCurrentViewState] = useState<ViewType>(viewFromHash);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileAcknowledged, setMobileAcknowledged] = useState(
    () => window.innerWidth >= 1024 || window.sessionStorage.getItem('ehr_mobile_ack') === '1'
  );

  const setCurrentView = useCallback((view: ViewType) => {
    setCurrentViewState(view);
    if (viewFromHash() !== view) {
      window.location.hash = `/${view}`;
    }
  }, []);

  // Browser back/forward and manually edited URLs
  useEffect(() => {
    const onHashChange = () => setCurrentViewState(viewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (!mobileAcknowledged) {
    return <MobileNotice onContinue={() => {
      window.sessionStorage.setItem('ehr_mobile_ack', '1');
      setMobileAcknowledged(true);
    }} />;
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':    return <Dashboard onViewChange={setCurrentView} />;
      case 'patient_list': return <PatientList onViewChange={setCurrentView} />;
      case 'patients':     return <PatientChart onViewChange={setCurrentView} />;
      case 'schedule':     return <Schedule onViewChange={setCurrentView} />;
      case 'eprescribing': return <EPrescribing onViewChange={setCurrentView} />;
      case 'new_note':     return <NewNote onViewChange={setCurrentView} />;
      case 'reports':      return <Reports onViewChange={setCurrentView} />;
      case 'telehealth':   return <Telehealth onViewChange={setCurrentView} />;
      case 'messaging':    return <Messaging onViewChange={setCurrentView} />;
      case 'referrals':    return <Referrals onViewChange={setCurrentView} />;
      case 'prior_auth':   return <PriorAuth onViewChange={setCurrentView} />;
      case 'settings':     return <Settings onViewChange={setCurrentView} />;
      case 'superbill':    return <Superbill onViewChange={setCurrentView} />;
      case 'inbox':        return <Inbox onViewChange={setCurrentView} />;
      default:             return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} onLogout={() => setIsLoggedIn(false)} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopNav currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </DataProvider>
  );
}
