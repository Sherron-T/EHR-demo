import React, { useState, useMemo } from 'react';
import { ViewType } from '../App';
import { useData, Patient } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

const TODAY = new Date().toISOString().split('T')[0];

interface PatientListProps {
  onViewChange: (view: ViewType) => void;
}

const RISK_CONFIG = {
  Low:      { bg: 'bg-tertiary-fixed',        text: 'text-on-tertiary-fixed-variant' },
  Moderate: { bg: 'bg-secondary-container',   text: 'text-on-secondary-fixed-variant' },
  High:     { bg: 'bg-error/20',              text: 'text-error' },
  Severe:   { bg: 'bg-error',                 text: 'text-white' },
};

export default function PatientList({ onViewChange }: PatientListProps) {
  const { patients, addPatient, setCurrentPatientId, appointments, medications } = useData();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'risk' | 'lastVisit'>('name');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Female', insurance: '', phone: '', email: '', provider: '',
  });
  const [registering, setRegistering] = useState(false);

  const filteredPatients = useMemo(() => {
    let result = [...patients];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.diagnoses.some(d => d.name.toLowerCase().includes(q))
      );
    }
    if (riskFilter !== 'All') {
      result = result.filter(p => p.riskScore === riskFilter);
    }
    const riskOrder = { Severe: 0, High: 1, Moderate: 2, Low: 3 };
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'risk') return (riskOrder[a.riskScore] ?? 4) - (riskOrder[b.riskScore] ?? 4);
      if (sortBy === 'lastVisit') {
        const aDate = a.lastVisit ?? '1970-01-01';
        const bDate = b.lastVisit ?? '1970-01-01';
        return bDate.localeCompare(aDate);
      }
      return 0;
    });
    return result;
  }, [patients, search, riskFilter, sortBy]);

  const openChart = (p: Patient) => {
    setCurrentPatientId(p.id);
    onViewChange('patients');
  };

  const stats = {
    total: patients.length,
    highRisk: patients.filter(p => p.riskScore === 'High' || p.riskScore === 'Severe').length,
    scheduledToday: appointments.filter(a => a.date === TODAY).length,
    activeMeds: medications.filter(m => m.status === 'Active').length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Patient Roster</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage and review your active patient panel.</p>
        </div>
        <button
          onClick={() => setShowNewPatientModal(true)}
          className="px-5 py-2.5 signature-gradient text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          New Patient
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Patients', value: stats.total, icon: 'group', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'High / Severe Risk', value: stats.highRisk, icon: 'crisis_alert', color: 'text-error', bg: 'bg-error/10' },
          { label: 'Appointments Today', value: stats.scheduledToday, icon: 'calendar_today', color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Active Prescriptions', value: stats.activeMeds, icon: 'medication', color: 'text-tertiary', bg: 'bg-tertiary/10' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-xl`}>
              <span className={`material-symbols-outlined ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-headline font-bold text-on-surface">{s.value}</p>
              <p className="text-xs text-on-surface-variant font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-64">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Search by name, MRN, or diagnosis..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {['All', 'Severe', 'High', 'Moderate', 'Low'].map(risk => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                riskFilter === risk
                  ? 'bg-primary text-white font-bold'
                  : 'bg-surface-container-lowest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none"
        >
          <option value="name">Sort: Name</option>
          <option value="risk">Sort: Risk Level</option>
          <option value="lastVisit">Sort: Last Visit</option>
        </select>
      </div>

      {/* Patient count */}
      <p className="text-xs text-on-surface-variant font-medium mb-4">
        Showing {filteredPatients.length} of {patients.length} patients
      </p>

      {/* Patient Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Diagnoses</th>
              <th className="px-6 py-4">Risk</th>
              <th className="px-6 py-4">Last Visit</th>
              <th className="px-6 py-4">Next Appt</th>
              <th className="px-6 py-4">Provider</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline-variant block mb-3">search_off</span>
                  <p className="text-on-surface-variant font-medium">No patients match your search.</p>
                </td>
              </tr>
            ) : (
              filteredPatients.map(p => {
                const riskCfg = RISK_CONFIG[p.riskScore];
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-surface-container-low/60 cursor-pointer transition-colors"
                    onClick={() => openChart(p)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {p.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-on-surface">{p.name}</p>
                          <p className="text-xs text-on-surface-variant">MRN: {p.mrn} · {p.age} · {p.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {p.diagnoses.slice(0, 2).map((dx, i) => (
                          <p key={i} className="text-xs text-on-surface-variant">
                            <span className="font-bold text-on-surface">{dx.code}</span> · {dx.name}
                          </p>
                        ))}
                        {p.diagnoses.length > 2 && (
                          <p className="text-xs text-primary">+{p.diagnoses.length - 2} more</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskCfg.bg} ${riskCfg.text}`}>
                        {p.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-xs">
                      {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {p.nextAppt ? (
                        <span className="text-primary font-medium">
                          {new Date(p.nextAppt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant">{p.provider ?? 'Unassigned'}</td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openChart(p)}
                          className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          Chart
                        </button>
                        <button
                          onClick={() => { setCurrentPatientId(p.id); onViewChange('new_note'); }}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="New Note"
                        >
                          <span className="material-symbols-outlined text-sm">note_add</span>
                        </button>
                        <button
                          onClick={() => { setCurrentPatientId(p.id); onViewChange('eprescribing'); }}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="e-Prescribing"
                        >
                          <span className="material-symbols-outlined text-sm">prescriptions</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* New Patient Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-headline font-bold text-on-surface">Register New Patient</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">MRN will be auto-generated on submission</p>
              </div>
              <button onClick={() => setShowNewPatientModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">First Name *</label>
                  <input
                    type="text"
                    placeholder="First"
                    value={newPatientForm.firstName}
                    onChange={e => setNewPatientForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    placeholder="Last"
                    value={newPatientForm.lastName}
                    onChange={e => setNewPatientForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Date of Birth *</label>
                  <input
                    type="date"
                    value={newPatientForm.dob}
                    onChange={e => setNewPatientForm(f => ({ ...f, dob: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={e => setNewPatientForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Non-Binary</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Phone</label>
                  <input
                    type="tel"
                    placeholder="(206) 555-0100"
                    value={newPatientForm.phone}
                    onChange={e => setNewPatientForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="patient@email.com"
                    value={newPatientForm.email}
                    onChange={e => setNewPatientForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Insurance</label>
                <input
                  type="text"
                  placeholder="e.g. Premera Blue Cross"
                  value={newPatientForm.insurance}
                  onChange={e => setNewPatientForm(f => ({ ...f, insurance: e.target.value }))}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Referring Provider</label>
                <input
                  type="text"
                  placeholder="Dr. Name or Self-referred"
                  value={newPatientForm.provider}
                  onChange={e => setNewPatientForm(f => ({ ...f, provider: e.target.value }))}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowNewPatientModal(false)} className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors">
                Cancel
              </button>
              <button
                disabled={!newPatientForm.firstName || !newPatientForm.lastName || !newPatientForm.dob || registering}
                onClick={() => {
                  if (!newPatientForm.firstName || !newPatientForm.lastName || !newPatientForm.dob) return;
                  setRegistering(true);
                  const dobDate = new Date(newPatientForm.dob);
                  const ageYears = Math.floor((Date.now() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                  setTimeout(() => {
                    addPatient({
                      name: `${newPatientForm.firstName} ${newPatientForm.lastName}`,
                      mrn: '', // auto-generated in addPatient
                      dob: newPatientForm.dob,
                      age: `${ageYears}yo`,
                      gender: newPatientForm.gender,
                      image: '',
                      allergies: ['None Known'],
                      riskScore: 'Low',
                      suicidalIdeation: 'Denied',
                      diagnoses: [],
                      phone: newPatientForm.phone || undefined,
                      email: newPatientForm.email || undefined,
                      insurance: newPatientForm.insurance || undefined,
                      provider: newPatientForm.provider || 'Dr. Sarah Jenkins',
                      lastVisit: undefined,
                      nextAppt: undefined,
                    });
                    addToast({ type: 'success', title: 'Patient Registered', message: `${newPatientForm.firstName} ${newPatientForm.lastName} has been added to your panel.` });
                    setShowNewPatientModal(false);
                    setNewPatientForm({ firstName: '', lastName: '', dob: '', gender: 'Female', insurance: '', phone: '', email: '', provider: '' });
                    setRegistering(false);
                  }, 600);
                }}
                className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {registering ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">person_add</span>Register Patient</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
