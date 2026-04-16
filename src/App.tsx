import React, { useState } from 'react';
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

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
