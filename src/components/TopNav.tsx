import React, { useState, useRef, useEffect } from 'react';
import { ViewType } from '../App';
import { useData } from '../context/DataContext';

interface TopNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function TopNav({ currentView, onViewChange }: TopNavProps) {
  const { patients, currentPatientId, setCurrentPatientId, alerts, messages, labs } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentPatient = patients.find(p => p.id === currentPatientId);
  const unreadMessages = messages.filter(m => !m.read).length;
  const totalNotifications = alerts.length + unreadMessages;

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePatientSelect = (patientId: string) => {
    setCurrentPatientId(patientId);
    setSearchQuery('');
    setIsSearchOpen(false);
    onViewChange('patients');
  };

  // Build notification items from alerts + unread messages + flagged labs
  const notifItems = [
    ...alerts.map(a => ({
      id: a.id,
      type: 'alert' as const,
      icon: 'crisis_alert',
      color: 'text-error',
      bg: 'bg-error/10',
      title: a.type,
      body: a.message,
      time: 'Now',
      patientId: a.patientId,
    })),
    ...messages.filter(m => !m.read).map(m => ({
      id: m.id,
      type: 'message' as const,
      icon: m.fromRole === 'System' ? 'notifications' : m.fromRole === 'Patient' ? 'person' : 'stethoscope',
      color: 'text-primary',
      bg: 'bg-primary/10',
      title: m.subject,
      body: `From: ${m.from}`,
      time: m.time,
      patientId: m.patientId,
    })),
    ...labs.filter(l => l.flag === 'Critical' || l.flag === 'Low' || l.flag === 'High').slice(0, 2).map(l => ({
      id: l.id,
      type: 'lab' as const,
      icon: 'biotech',
      color: l.flag === 'Critical' ? 'text-error' : 'text-[#7c5700]',
      bg: l.flag === 'Critical' ? 'bg-error/10' : 'bg-[#7c5700]/10',
      title: `${l.flag} Lab Result`,
      body: `${l.testName}: ${l.result} ${l.unit}`,
      time: l.date,
      patientId: l.patientId,
    })),
  ].slice(0, 8);

  return (
    <header className="bg-surface-container-lowest flex justify-between items-center w-full px-8 h-16 shadow-ambient sticky top-0 z-30 border-b border-outline-variant/10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          {currentPatient && (
            <div
              onClick={() => onViewChange('patients')}
              className="flex items-center gap-2 bg-primary-container/30 hover:bg-primary-container/50 text-on-surface px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-primary/20"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="font-label text-sm font-bold">{currentPatient.name}</span>
              <span className="text-xs text-on-surface-variant font-medium">({currentPatient.mrn})</span>
            </div>
          )}

          <div className="relative" ref={searchRef}>
            <div className="flex items-center bg-surface-container-low px-4 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
              <input
                type="text"
                placeholder="Search patients..."
                className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-on-surface-variant/60 outline-none"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                onFocus={() => setIsSearchOpen(true)}
              />
            </div>

            {isSearchOpen && searchQuery && (
              <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-50">
                {filteredPatients.length > 0 ? (
                  <div className="divide-y divide-outline-variant/10 max-h-64 overflow-y-auto">
                    {filteredPatients.map(patient => (
                      <div
                        key={patient.id}
                        onClick={() => handlePatientSelect(patient.id)}
                        className="p-3 hover:bg-surface-container-low cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        {patient.image ? (
                          <img src={patient.image} alt={patient.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-on-surface">{patient.name}</p>
                          <p className="text-[10px] text-on-surface-variant">MRN: {patient.mrn} · {patient.age} · {patient.riskScore} risk</p>
                        </div>
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          patient.riskScore === 'High' || patient.riskScore === 'Severe' ? 'bg-error/10 text-error' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>{patient.riskScore}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-on-surface-variant">
                    No patients found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewChange('schedule')}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container-highest text-on-surface-variant font-semibold text-sm rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-lg">schedule</span>
            Schedule Appt
          </button>
          <button
            onClick={() => onViewChange('new_note')}
            className="flex items-center gap-2 px-4 py-2 signature-gradient text-white font-bold font-headline text-sm rounded-lg shadow-sm hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add_notes</span>
            New Note
          </button>
        </div>

        <div className="flex items-center gap-3 text-on-secondary-fixed-variant border-l border-outline-variant/20 pl-6">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              className="relative hover:bg-surface-container-low p-2 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: showNotifications ? "'FILL' 1" : "'FILL' 0" }}>notifications</span>
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {totalNotifications}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-96 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="px-5 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
                  <h3 className="font-headline font-bold text-on-surface">Notifications</h3>
                  <span className="text-xs text-on-surface-variant">{totalNotifications} unread</span>
                </div>

                <div className="max-h-[420px] overflow-y-auto divide-y divide-outline-variant/10">
                  {notifItems.length === 0 ? (
                    <div className="p-8 text-center text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl text-outline-variant block mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_off</span>
                      All caught up!
                    </div>
                  ) : (
                    notifItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (item.type === 'message') onViewChange('messaging');
                          else if (item.type === 'lab') { if (item.patientId) { setCurrentPatientId(item.patientId); onViewChange('patients'); } }
                          else if (item.type === 'alert') onViewChange('dashboard');
                        }}
                        className="w-full text-left px-5 py-4 hover:bg-surface-container-low/70 transition-colors flex items-start gap-3"
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                          <span className={`material-symbols-outlined text-sm ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-on-surface truncate">{item.title}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">{item.body}</p>
                        </div>
                        <span className="text-[10px] text-on-surface-variant flex-shrink-0 mt-1">{item.time}</span>
                      </button>
                    ))
                  )}
                </div>

                <div className="px-5 py-3 border-t border-outline-variant/10 bg-surface-container-low/30">
                  <button
                    onClick={() => { setShowNotifications(false); onViewChange('messaging'); }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    View all messages →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Emergency / Crisis hotline */}
          <button
            title="Crisis Resources"
            onClick={() => window.open('https://988lifeline.org', '_blank')}
            className="hover:bg-error/10 hover:text-error p-2 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">emergency_home</span>
          </button>

          {/* Provider avatar → Settings */}
          <button onClick={() => onViewChange('settings')} title="Settings">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvPGfAkZs8oJ44KvtlmlE2XTgNpDq2SD5F_jTs30tDNxFNvaDdlCuC5nkxM_PCzj6XIJk4O2AHTUNzMQqMeSJFeSXyMzRcDWCudBTzEvEpYDz9xMaV0LpKqGZLGrHg1J7mIBzU6fpXZM5mFnTGKSPb824Nh9dS64mYE70XukgirrKPwHfs6b0Y_zcG289b11SvbANn4UwQzgLxK-IpsSKSIuHHOUcESr9E2mXcoLg8xH6La2J8sPN-7ZE2SmCbjkMawrrlCy7NoBVo"
              alt="Dr. Sarah Jenkins"
              className="w-8 h-8 rounded-full object-cover border border-outline-variant/30 hover:ring-2 hover:ring-primary/30 transition-all"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
