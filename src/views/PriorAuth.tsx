import React, { useState } from 'react';
import { ViewType } from '../App';
import { useData, PriorAuth as PriorAuthType } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

interface PriorAuthProps {
  onViewChange: (view: ViewType) => void;
}

const STATUS_CONFIG: Record<PriorAuthType['status'], { bg: string; text: string; icon: string }> = {
  Draft:          { bg: 'bg-surface-container-high',   text: 'text-on-surface-variant', icon: 'draft' },
  Submitted:      { bg: 'bg-secondary/10',             text: 'text-secondary',           icon: 'send' },
  'Under Review': { bg: 'bg-[#7c5700]/10',             text: 'text-[#7c5700]',           icon: 'pending' },
  Approved:       { bg: 'bg-tertiary/10',              text: 'text-tertiary',            icon: 'check_circle' },
  Denied:         { bg: 'bg-error/10',                 text: 'text-error',               icon: 'cancel' },
  Appealing:      { bg: 'bg-primary/10',               text: 'text-primary',             icon: 'gavel' },
};

const STATUS_FLOW: Record<PriorAuthType['status'], PriorAuthType['status'][]> = {
  Draft:          ['Submitted'],
  Submitted:      ['Under Review', 'Approved', 'Denied'],
  'Under Review': ['Approved', 'Denied'],
  Approved:       [],
  Denied:         ['Appealing'],
  Appealing:      ['Approved', 'Denied'],
};

export default function PriorAuth({ onViewChange }: PriorAuthProps) {
  const { priorAuths, addPriorAuth, updatePriorAuthStatus, patients, medications } = useData();
  const { addToast } = useToast();
  const [filter, setFilter] = useState<'All' | PriorAuthType['status']>('All');
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealPA, setAppealPA] = useState<typeof priorAuths[0] | null>(null);
  const [appealCopied, setAppealCopied] = useState(false);
  const [showFaxModal, setShowFaxModal] = useState(false);
  const [faxPA, setFaxPA] = useState<typeof priorAuths[0] | null>(null);
  const [faxSending, setFaxSending] = useState(false);
  const [faxSent, setFaxSent] = useState(false);
  const [form, setForm] = useState({
    patientId: '',
    medication: '',
    indication: '',
    insurancePlan: '',
    notes: '',
  });

  const filtered = filter === 'All' ? priorAuths : priorAuths.filter(p => p.status === filter);

  const counts = {
    total: priorAuths.length,
    pending: priorAuths.filter(p => ['Submitted', 'Under Review'].includes(p.status)).length,
    approved: priorAuths.filter(p => p.status === 'Approved').length,
    denied: priorAuths.filter(p => ['Denied', 'Appealing'].includes(p.status)).length,
  };

  const getPatient = (id: string) => patients.find(p => p.id === id);

  const handleStatusChange = (id: string, newStatus: PriorAuthType['status']) => {
    updatePriorAuthStatus(id, newStatus);
    const cfg = STATUS_CONFIG[newStatus];
    addToast({
      type: newStatus === 'Approved' ? 'success' : newStatus === 'Denied' ? 'error' : 'info',
      title: `PA Status Updated`,
      message: `Prior authorization moved to: ${newStatus}`,
    });
  };

  const handleSubmit = () => {
    if (!form.patientId || !form.medication || !form.indication || !form.insurancePlan) {
      addToast({ type: 'error', title: 'Missing fields', message: 'Please fill in all required fields.' });
      return;
    }
    addPriorAuth({
      patientId: form.patientId,
      medication: form.medication,
      indication: form.indication,
      insurancePlan: form.insurancePlan,
      notes: form.notes || undefined,
      status: 'Draft',
    });
    addToast({ type: 'success', title: 'PA Request Created', message: `Draft saved for ${form.medication}` });
    setShowModal(false);
    setForm({ patientId: '', medication: '', indication: '', insurancePlan: '', notes: '' });
  };

  const generateAppealLetter = (pa: typeof priorAuths[0]) => {
    const pt = getPatient(pa.patientId);
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${today}

Medical Director, Appeals Department
${pa.insurancePlan}

RE: APPEAL FOR DENIAL OF PRIOR AUTHORIZATION
Patient: ${pt?.name ?? 'Unknown'} | MRN: ${pt?.mrn ?? 'N/A'} | DOB: ${pt?.dob ?? 'N/A'}
Medication: ${pa.medication}
Diagnosis: ${pa.indication}
Original PA Reference: ${pa.id.toUpperCase()}
Denial Date: ${pa.determinationDate ?? 'On file'}

Dear Medical Director:

I am writing to formally appeal the denial of prior authorization for ${pa.medication} for my patient, ${pt?.name ?? 'this patient'}.

CLINICAL SUMMARY:
${pt?.name ?? 'The patient'} is a ${pt?.age ?? 'adult'} ${pt?.gender ?? 'patient'} with a diagnosis of ${pa.indication}. This patient has been under my care and has demonstrated a medically necessary need for the requested medication based on the following clinical findings:

1. The patient has failed multiple alternative therapies, including those required under step therapy protocols.
2. The requested medication is indicated per current clinical practice guidelines for this diagnosis.
3. Alternative therapies are medically contraindicated or have resulted in inadequate therapeutic response.

MEDICAL NECESSITY:
${pa.medication} is medically necessary for this patient because the current symptom burden significantly impairs daily functioning and quality of life. Continued denial places the patient at risk for clinical deterioration.

REQUESTED ACTION:
I respectfully request an expedited review and approval of this prior authorization request. I am available for a peer-to-peer review at your convenience.

Enclosures: Clinical notes, treatment history, laboratory results

Sincerely,

Dr. Sarah Jenkins, MD
Board Certified Psychiatrist | NPI: 1234567890
Psychiatry Care Associates | (206) 555-0100
dr.jenkins@psychiatrycare.com`;
  };

  const allMedNames = [
    'Esketamine (Spravato)', 'Brexanolone (Zulresso)', 'Clozapine (Clozaril)',
    'Aripiprazole (Abilify) LAI', 'Paliperidone (Invega Sustenna) LAI',
    'Methylphenidate (Concerta) ER', 'Amphetamine Salts (Adderall XR)',
    'Lamotrigine (Lamictal) >200mg', 'Lithium — Extended Supply',
    'Transcranial Magnetic Stimulation (TMS)', 'Electroconvulsive Therapy (ECT)',
    'Genetic Testing (GeneSight)', 'Other',
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Prior Authorization</h1>
          <p className="text-sm text-on-surface-variant mt-1">Track and manage PA requests across your patient panel.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 signature-gradient text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New PA Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Requests', value: counts.total,   icon: 'folder_open',   color: 'text-primary',    bg: 'bg-primary/10' },
          { label: 'Pending Review', value: counts.pending,  icon: 'pending',       color: 'text-[#7c5700]',  bg: 'bg-[#7c5700]/10' },
          { label: 'Approved',       value: counts.approved, icon: 'check_circle',  color: 'text-tertiary',   bg: 'bg-tertiary/10' },
          { label: 'Denied / Appeal',value: counts.denied,   icon: 'gavel',         color: 'text-error',      bg: 'bg-error/10' },
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
      <div className="flex flex-wrap gap-2 mb-6 border-b border-outline-variant/10 pb-4">
        {(['All', 'Draft', 'Submitted', 'Under Review', 'Approved', 'Denied', 'Appealing'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary text-white font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {f}
            {f !== 'All' && (
              <span className="ml-1 text-[11px] opacity-70">({priorAuths.filter(p => p.status === f).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* PA List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center bg-surface-container-lowest rounded-2xl border border-outline-variant/10 border-dashed">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">folder_open</span>
            <p className="font-medium text-on-surface-variant">No PA requests in this category.</p>
          </div>
        ) : (
          filtered.map(pa => {
            const patient = getPatient(pa.patientId);
            const cfg = STATUS_CONFIG[pa.status];
            const nextStatuses = STATUS_FLOW[pa.status];
            const isExpanded = expandedId === pa.id;

            return (
              <div key={pa.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                <div
                  className="p-5 flex items-start gap-4 cursor-pointer hover:bg-surface-container-low/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : pa.id)}
                >
                  {/* Status icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <span className={`material-symbols-outlined text-sm ${cfg.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-on-surface">{pa.medication}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>{pa.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
                      {patient && (
                        <button
                          onClick={e => { e.stopPropagation(); onViewChange('patients'); }}
                          className="flex items-center gap-1.5 font-medium hover:text-primary transition-colors"
                        >
                          <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[8px]">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          {patient.name}
                        </button>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">local_hospital</span>
                        {pa.indication}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">health_and_safety</span>
                        {pa.insurancePlan}
                      </span>
                      {pa.submittedDate && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">send</span>
                          Submitted: {new Date(pa.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {pa.determinationDate && (
                        <span className={`flex items-center gap-1 font-medium ${pa.status === 'Approved' ? 'text-tertiary' : 'text-error'}`}>
                          <span className="material-symbols-outlined text-xs">event</span>
                          Determination: {new Date(pa.determinationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {pa.expirationDate && (
                        <span className="flex items-center gap-1 text-tertiary font-medium">
                          <span className="material-symbols-outlined text-xs">update</span>
                          Expires: {new Date(pa.expirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {/* Next status action buttons */}
                    {nextStatuses.map(next => (
                      <button
                        key={next}
                        onClick={() => handleStatusChange(pa.id, next)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                          next === 'Approved' ? 'bg-tertiary/10 text-tertiary hover:bg-tertiary/20' :
                          next === 'Denied' ? 'bg-error/10 text-error hover:bg-error/20' :
                          'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                      >
                        → {next}
                      </button>
                    ))}
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-outline-variant/10 px-5 py-4 bg-surface-container-low/40 space-y-4 animate-in fade-in duration-200">
                    {pa.notes && (
                      <div>
                        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Clinical Notes / Documentation</p>
                        <p className="text-sm text-on-surface leading-relaxed">{pa.notes}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-surface-container-lowest rounded-xl p-3">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Status</p>
                        <p className={`text-sm font-bold ${cfg.text}`}>{pa.status}</p>
                      </div>
                      <div className="bg-surface-container-lowest rounded-xl p-3">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Insurance</p>
                        <p className="text-sm font-medium text-on-surface">{pa.insurancePlan}</p>
                      </div>
                      <div className="bg-surface-container-lowest rounded-xl p-3">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Submitted</p>
                        <p className="text-sm font-medium text-on-surface">{pa.submittedDate ? new Date(pa.submittedDate).toLocaleDateString() : '—'}</p>
                      </div>
                      <div className="bg-surface-container-lowest rounded-xl p-3">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Expires</p>
                        <p className="text-sm font-medium text-on-surface">{pa.expirationDate ? new Date(pa.expirationDate).toLocaleDateString() : '—'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => { setAppealPA(pa); setAppealCopied(false); setShowAppealModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">description</span>
                        Generate Appeal Letter
                      </button>
                      <button
                        onClick={() => { setFaxPA(pa); setFaxSent(false); setFaxSending(false); setShowFaxModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">fax</span>
                        Fax to Insurance
                      </button>
                      <button
                        onClick={() => addToast({ type: 'success', title: 'P2P Requested', message: `Peer-to-peer review request submitted to ${pa.insurancePlan}. Expect a callback within 24–48 business hours.` })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">phone_in_talk</span>
                        Request Peer-to-Peer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Appeal Letter Modal */}
      {showAppealModal && appealPA && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAppealModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-outline-variant/10 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-headline font-bold text-on-surface">Appeal Letter</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{appealPA.medication} · {appealPA.insurancePlan}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateAppealLetter(appealPA)).then(() => {
                      setAppealCopied(true);
                      setTimeout(() => setAppealCopied(false), 2000);
                    });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${appealCopied ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest'}`}
                >
                  <span className="material-symbols-outlined text-sm">{appealCopied ? 'check' : 'content_copy'}</span>
                  {appealCopied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print
                </button>
                <button onClick={() => setShowAppealModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg ml-1">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <pre className="text-xs font-mono text-on-surface leading-relaxed whitespace-pre-wrap bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                {generateAppealLetter(appealPA)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Fax Confirmation Modal */}
      {showFaxModal && faxPA && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { if (!faxSending) setShowFaxModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            {faxSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-tertiary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h3 className="font-headline font-bold text-on-surface mb-2">Fax Transmitted</h3>
                <p className="text-sm text-on-surface-variant mb-1">PA request sent to {faxPA.insurancePlan}</p>
                <p className="text-xs text-on-surface-variant">Confirmation #: FAX-{Date.now().toString().slice(-6)}</p>
                <button onClick={() => setShowFaxModal(false)} className="mt-5 w-full py-2.5 rounded-xl text-sm font-bold bg-primary text-white">Done</button>
              </div>
            ) : (
              <>
                <h3 className="font-headline font-bold text-on-surface mb-4">Fax to Insurance</h3>
                <div className="bg-surface-container-low rounded-xl p-4 mb-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Recipient</span>
                    <span className="font-medium text-on-surface text-xs">{faxPA.insurancePlan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Fax Number</span>
                    <span className="font-medium text-on-surface text-xs font-mono">(800) 555-0{Math.floor(100 + parseInt(faxPA.id.replace(/\D/g,'') || '1') * 37) % 900}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Document</span>
                    <span className="font-medium text-on-surface text-xs">PA Request + Clinical Notes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">Pages</span>
                    <span className="font-medium text-on-surface text-xs">~4 pages</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowFaxModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-surface-container-low text-on-surface-variant">Cancel</button>
                  <button
                    onClick={() => {
                      setFaxSending(true);
                      setTimeout(() => { setFaxSending(false); setFaxSent(true); addToast({ type: 'success', title: 'Fax Sent', message: `PA documents transmitted to ${faxPA.insurancePlan}.` }); }, 2000);
                    }}
                    disabled={faxSending}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {faxSending ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Sending…</> : 'Send Fax'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* New PA Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline font-bold text-on-surface">New PA Request</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Patient *</label>
                <select
                  value={form.patientId}
                  onChange={e => setForm({ ...form, patientId: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Medication / Treatment *</label>
                <select
                  value={form.medication}
                  onChange={e => setForm({ ...form, medication: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select medication...</option>
                  {allMedNames.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">ICD-10 Indication *</label>
                <input
                  type="text"
                  placeholder="e.g., F33.1 — MDD, Recurrent, Moderate"
                  value={form.indication}
                  onChange={e => setForm({ ...form, indication: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Insurance Plan *</label>
                <select
                  value={form.insurancePlan}
                  onChange={e => setForm({ ...form, insurancePlan: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select plan...</option>
                  {['Blue Cross Blue Shield', 'Aetna', 'United Healthcare', 'Cigna', 'Medicare', 'Medicaid', 'Other'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Clinical Justification (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Prior treatment failures, clinical necessity, step therapy documentation..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all">
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
