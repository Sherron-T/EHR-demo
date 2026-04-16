import React, { useState } from 'react';
import { ViewType } from '../App';
import { useData, Referral } from '../context/DataContext';

interface ReferralsProps {
  onViewChange: (view: ViewType) => void;
}

const STATUS_CONFIG = {
  Pending:   { bg: 'bg-secondary-container',   text: 'text-on-secondary-fixed-variant', icon: 'schedule' },
  Accepted:  { bg: 'bg-tertiary/15',            text: 'text-tertiary',                   icon: 'check_circle' },
  Completed: { bg: 'bg-primary/10',             text: 'text-primary',                    icon: 'task_alt' },
  Declined:  { bg: 'bg-error/10',               text: 'text-error',                      icon: 'cancel' },
};

const URGENCY_CONFIG = {
  Routine: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
  Urgent:  { bg: 'bg-error/10',               text: 'text-error' },
  STAT:    { bg: 'bg-error',                  text: 'text-white' },
};

export default function Referrals({ onViewChange }: ReferralsProps) {
  const { referrals, addReferral, updateReferralStatus, patients, setCurrentPatientId } = useData();
  const [filter, setFilter] = useState<'All' | Referral['status']>('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    patientId: '',
    referredTo: '',
    specialty: '',
    reason: '',
    urgency: 'Routine' as Referral['urgency'],
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'All' ? referrals : referrals.filter(r => r.status === filter);

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'Pending').length,
    accepted: referrals.filter(r => r.status === 'Accepted').length,
    completed: referrals.filter(r => r.status === 'Completed').length,
  };

  const handleSubmit = () => {
    if (!form.patientId || !form.referredTo || !form.specialty || !form.reason) return;
    addReferral({
      patientId: form.patientId,
      date: new Date().toISOString().split('T')[0],
      referredTo: form.referredTo,
      specialty: form.specialty,
      reason: form.reason,
      urgency: form.urgency,
      status: 'Pending',
      notes: form.notes || undefined,
    });
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
      setForm({ patientId: '', referredTo: '', specialty: '', reason: '', urgency: 'Routine', notes: '' });
    }, 1200);
  };

  const getPatient = (id: string) => patients.find(p => p.id === id);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Referral Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">Track outgoing referrals and care coordination requests.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 signature-gradient text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Referral
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Referrals', value: stats.total, icon: 'send', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Pending', value: stats.pending, icon: 'schedule', color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Accepted', value: stats.accepted, icon: 'check_circle', color: 'text-tertiary', bg: 'bg-tertiary/10' },
          { label: 'Completed', value: stats.completed, icon: 'task_alt', color: 'text-primary', bg: 'bg-primary/10' },
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

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-outline-variant/10 pb-4">
        {(['All', 'Pending', 'Accepted', 'Completed', 'Declined'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary text-white font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {f}
            {f !== 'All' && (
              <span className="ml-1.5 text-[11px]">
                ({referrals.filter(r => r.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Referrals List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center bg-surface-container-lowest rounded-2xl border border-outline-variant/10 border-dashed">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">send</span>
            <p className="font-medium text-on-surface-variant">No referrals in this category.</p>
          </div>
        ) : (
          filtered.map(ref => {
            const patient = getPatient(ref.patientId);
            const statusCfg = STATUS_CONFIG[ref.status];
            const urgencyCfg = URGENCY_CONFIG[ref.urgency];
            const isExpanded = expandedId === ref.id;

            return (
              <div key={ref.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                <div
                  className="p-5 flex items-start gap-4 cursor-pointer hover:bg-surface-container-low/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : ref.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-on-surface">{ref.specialty}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.text} flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{statusCfg.icon}</span>
                        {ref.status}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${urgencyCfg.bg} ${urgencyCfg.text}`}>
                        {ref.urgency}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                      {patient && (
                        <button
                          onClick={e => { e.stopPropagation(); setCurrentPatientId(patient.id); onViewChange('patients'); }}
                          className="flex items-center gap-1.5 font-medium hover:text-primary transition-colors"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[9px]">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          {patient.name}
                        </button>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">business</span>
                        {ref.referredTo}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        Referred: {new Date(ref.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {ref.scheduledDate && (
                        <span className="flex items-center gap-1 text-tertiary font-medium">
                          <span className="material-symbols-outlined text-xs">event</span>
                          Scheduled: {new Date(ref.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ref.status === 'Pending' && (
                      <button
                        onClick={e => { e.stopPropagation(); updateReferralStatus(ref.id, 'Accepted'); }}
                        className="px-3 py-1.5 bg-tertiary/10 text-tertiary text-xs font-bold rounded-lg hover:bg-tertiary/20 transition-colors"
                      >
                        Mark Accepted
                      </button>
                    )}
                    {ref.status === 'Accepted' && (
                      <button
                        onClick={e => { e.stopPropagation(); updateReferralStatus(ref.id, 'Completed'); }}
                        className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-outline-variant/10 px-5 py-4 bg-surface-container-low/40 space-y-3 animate-in fade-in duration-200">
                    <div>
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Reason for Referral</p>
                      <p className="text-sm text-on-surface leading-relaxed">{ref.reason}</p>
                    </div>
                    {ref.notes && (
                      <div>
                        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Additional Notes</p>
                        <p className="text-sm text-on-surface leading-relaxed">{ref.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      {ref.status !== 'Declined' && ref.status !== 'Completed' && (
                        <button
                          onClick={() => updateReferralStatus(ref.id, 'Declined')}
                          className="px-3 py-1.5 bg-error/10 text-error text-xs font-bold rounded-lg hover:bg-error/20 transition-colors"
                        >
                          Mark Declined
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Referral Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline font-bold text-on-surface">Create New Referral</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-5xl text-tertiary mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="font-bold text-on-surface">Referral Created!</p>
                <p className="text-sm text-on-surface-variant mt-1">The referral has been submitted and is now pending.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Patient</label>
                  <select
                    value={form.patientId}
                    onChange={e => setForm({ ...form, patientId: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (MRN: {p.mrn})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Referred To</label>
                    <input
                      type="text"
                      placeholder="Provider or facility name"
                      value={form.referredTo}
                      onChange={e => setForm({ ...form, referredTo: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Specialty</label>
                    <select
                      value={form.specialty}
                      onChange={e => setForm({ ...form, specialty: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select specialty...</option>
                      <option>Intensive Outpatient Program</option>
                      <option>DBT Skills Group</option>
                      <option>Psychotherapy (CBT)</option>
                      <option>Substance Use Disorder Counseling</option>
                      <option>Internal Medicine</option>
                      <option>Neurology</option>
                      <option>Pain Management</option>
                      <option>Case Management</option>
                      <option>Social Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Urgency</label>
                  <div className="flex gap-2">
                    {(['Routine', 'Urgent', 'STAT'] as Referral['urgency'][]).map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setForm({ ...form, urgency: u })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors border ${
                          form.urgency === u
                            ? u === 'STAT' ? 'bg-error text-white border-error' : u === 'Urgent' ? 'bg-error/10 text-error border-error/30' : 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-highest'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Reason for Referral</label>
                  <textarea
                    rows={3}
                    placeholder="Clinical justification for this referral..."
                    value={form.reason}
                    onChange={e => setForm({ ...form, reason: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Additional Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="Any coordination notes..."
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!form.patientId || !form.referredTo || !form.specialty || !form.reason}
                    className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Submit Referral
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
