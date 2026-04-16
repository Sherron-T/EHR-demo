import React from 'react';
import { ViewType } from '../App';
import { useData } from '../context/DataContext';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onViewChange, onLogout }: SidebarProps) {
  const { messages, alerts, priorAuths, labs, notes, appointments } = useData();
  const unreadMessages = messages.filter(m => !m.read).length;
  const pendingPA = priorAuths.filter(p => ['Draft', 'Submitted', 'Under Review'].includes(p.status)).length;
  const today = new Date().toISOString().split('T')[0];
  const flaggedLabs = labs.filter(l => l.flag === 'Critical' || l.flag === 'High' || l.flag === 'Low').length;
  const unsignedNotes = appointments.filter(a =>
    a.date === today && a.status === 'Completed' &&
    !notes.some(n => n.patientId === a.patientId && n.date === today)
  ).length;
  const inboxCount = unreadMessages + flaggedLabs + unsignedNotes + alerts.length;

  const navItems: { id: ViewType; icon: string; label: string; badge?: number }[] = [
    { id: 'dashboard',    icon: 'dashboard',     label: 'Dashboard' },
    { id: 'inbox',        icon: 'inbox',          label: 'Inbox',           badge: inboxCount || undefined },
    { id: 'patient_list', icon: 'group',          label: 'Patients' },
    { id: 'schedule',     icon: 'calendar_month', label: 'Schedule' },
    { id: 'eprescribing', icon: 'prescriptions',  label: 'e-Prescribing' },
    { id: 'messaging',    icon: 'mail',           label: 'Messaging',       badge: unreadMessages || undefined },
    { id: 'referrals',    icon: 'send',           label: 'Referrals' },
    { id: 'prior_auth',   icon: 'policy',         label: 'Prior Auth',      badge: pendingPA || undefined },
    { id: 'reports',      icon: 'assessment',     label: 'Reports' },
  ];

  const isActive = (id: ViewType) => {
    if (currentView === id) return true;
    if (id === 'patient_list' && (currentView === 'patients' || currentView === 'new_note' || currentView === 'superbill')) return true;
    return false;
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-surface-container-low flex flex-col py-4 gap-2 border-r border-outline-variant/10">
      <div className="px-6 py-4 flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl signature-gradient flex items-center justify-center text-white shadow-sm">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
        <div>
          <h2 className="font-headline font-bold text-on-surface leading-tight text-sm">Psychiatry Care</h2>
          <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider">High Fidelity EHR</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r-full transition-all duration-200 ${
                active
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm translate-x-1'
                  : 'text-on-secondary-fixed-variant hover:bg-surface-container-highest hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Alert strip */}
      {alerts.length > 0 && (
        <button
          onClick={() => onViewChange('dashboard')}
          className="mx-3 px-4 py-3 bg-error/10 text-error rounded-2xl flex items-center gap-3 hover:bg-error/15 transition-colors"
        >
          <span className="material-symbols-outlined text-sm animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>crisis_alert</span>
          <div className="text-left">
            <p className="text-xs font-bold">{alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}</p>
            <p className="text-[10px] text-error/70">Requires attention</p>
          </div>
        </button>
      )}

      <div className="mt-2 px-3 space-y-0.5 pb-4 pt-3 border-t border-outline-variant/10">
        {/* Provider info */}
        <div className="px-4 py-2.5 flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-full signature-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">SJ</div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">Dr. Sarah Jenkins, MD</p>
            <p className="text-[10px] text-on-surface-variant">Psychiatry</p>
          </div>
        </div>
        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all rounded-r-full ${
            currentView === 'settings' ? 'bg-surface-container-lowest text-primary font-semibold' : 'text-on-secondary-fixed-variant hover:bg-surface-container-highest hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-on-secondary-fixed-variant hover:bg-error/10 hover:text-error transition-all rounded-r-full"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
