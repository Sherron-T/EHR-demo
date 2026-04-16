import React, { useState } from 'react';
import { ViewType } from '../App';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

interface EPrescribingProps {
  onViewChange: (view: ViewType) => void;
}

interface EditForm {
  dose: string;
  sig: string;
  dispense: string;
  refills: number;
}

const PHARMACIES = [
  { name: 'CVS Pharmacy #10293', address: '123 Main Street, Suite 100', city: 'Seattle, WA 98101', phone: '(206) 555-0192', fax: '(206) 555-0193' },
  { name: 'Walgreens #4821', address: '456 Pine Avenue', city: 'Seattle, WA 98109', phone: '(206) 555-0344', fax: '(206) 555-0345' },
  { name: 'Bartell Drugs #22', address: '789 Broadway E', city: 'Seattle, WA 98102', phone: '(206) 555-0571', fax: '(206) 555-0572' },
  { name: 'Rite Aid #5501', address: '1010 15th Ave NE', city: 'Seattle, WA 98125', phone: '(206) 555-0689', fax: '(206) 555-0690' },
];

export default function EPrescribing({ onViewChange }: EPrescribingProps) {
  const { patients, currentPatientId, medications, addMedication, stopMedication } = useData();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [transmitted, setTransmitted] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ dose: '', sig: '', dispense: '', refills: 0 });

  // Pharmacy modal
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(PHARMACIES[0]);
  const [pharmacySearch, setPharmacySearch] = useState('');

  // PDMP modal
  const [showPDMP, setShowPDMP] = useState(false);

  const patient = patients.find(p => p.id === currentPatientId);
  const patientMeds = medications.filter(m => m.patientId === currentPatientId && m.status === 'Active');

  if (!patient) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">person_off</span>
        <h2 className="text-xl font-bold text-on-surface-variant">No Patient Selected</h2>
        <p className="text-sm text-on-surface-variant mt-2">Please select a patient to manage medications.</p>
        <button onClick={() => onViewChange('dashboard')} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-bold">Go to Dashboard</button>
      </div>
    );
  }

  const handleQuickAdd = (medName: string) => {
    if (!currentPatientId) return;
    addMedication({
      patientId: currentPatientId,
      name: medName,
      dose: 'Standard Dose',
      sig: 'Take 1 tablet by mouth daily.',
      dispense: '30 Tablet(s)',
      refills: 0,
      status: 'Active'
    });
    addToast({ type: 'success', title: 'Medication Added', message: `${medName} added to active prescriptions.` });
  };

  const handleStop = (id: string, name: string) => {
    stopMedication(id);
    addToast({ type: 'warning', title: 'Medication Discontinued', message: `${name} has been stopped and moved to inactive.` });
  };

  const handleTransmit = () => {
    setTransmitted(true);
    setTimeout(() => {
      setTransmitted(false);
      addToast({
        type: 'success',
        title: 'Prescriptions Transmitted',
        message: `${patientMeds.length} prescription${patientMeds.length !== 1 ? 's' : ''} sent to ${selectedPharmacy.name}.`,
      });
      onViewChange('patients');
    }, 1500);
  };

  const handleOpenEdit = (med: (typeof medications)[0]) => {
    setEditingMedId(med.id);
    setEditForm({ dose: med.dose, sig: med.sig, dispense: med.dispense, refills: med.refills });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const med = medications.find(m => m.id === editingMedId);
    addToast({ type: 'success', title: 'Medication Updated', message: `${med?.name ?? 'Medication'} details saved successfully.` });
    setShowEditModal(false);
    setEditingMedId(null);
  };

  const handleRefillRequest = (medName: string) => {
    addToast({ type: 'success', title: 'Refill Requested', message: `Refill request for ${medName} sent to ${selectedPharmacy.name}.` });
  };

  const handleOverride = () => {
    addToast({ type: 'warning', title: 'Interaction Override Logged', message: 'Clinical override documented with reason. Supervising provider notified.' });
  };

  const filteredPharmacies = PHARMACIES.filter(ph =>
    ph.name.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
    ph.address.toLowerCase().includes(pharmacySearch.toLowerCase())
  );

  const editingMed = medications.find(m => m.id === editingMedId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant mb-2">
            <button onClick={() => onViewChange('patients')} className="hover:text-primary transition-colors">{patient.name}</button>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary">e-Prescribing</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Medication Management</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPDMP(true)}
            className="px-4 py-2 bg-surface-container-low text-on-surface-variant font-bold rounded-lg hover:bg-surface-container-highest transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">policy</span>
            View PDMP
          </button>
          <button
            onClick={handleTransmit}
            disabled={transmitted || patientMeds.length === 0}
            className={`px-4 py-2 font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 ${
              transmitted ? 'bg-tertiary text-white' : patientMeds.length === 0 ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' : 'bg-primary text-white hover:opacity-90'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{transmitted ? 'check_circle' : 'send'}</span>
            {transmitted ? 'Transmitting...' : 'Transmit All to Pharmacy'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Search & Active Meds */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Search Box */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h2 className="text-lg font-headline font-bold text-on-surface mb-4">Prescribe New Medication</h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Search by medication name, class, or indication..."
                className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => { if (searchQuery) { handleQuickAdd(searchQuery); setSearchQuery(''); } }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Common Prescriptions Quick Add */}
            <div className="mt-4">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Quick Add (Psychiatry)</p>
              <div className="flex flex-wrap gap-2">
                {['Sertraline', 'Fluoxetine', 'Aripiprazole', 'Lamotrigine', 'Methylphenidate'].map(med => (
                  <button
                    key={med}
                    onClick={() => handleQuickAdd(med)}
                    className="px-3 py-1.5 bg-surface-container-low hover:bg-primary/10 hover:text-primary text-on-surface text-xs font-medium rounded-lg transition-colors border border-outline-variant/10"
                  >
                    + {med}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Medications List */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex justify-between items-center">
              <h2 className="text-lg font-headline font-bold text-on-surface">Active Prescriptions</h2>
              <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-xs font-bold">{patientMeds.length} Active</span>
            </div>

            {patientMeds.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">medication</span>
                <p className="text-on-surface-variant font-medium">No active prescriptions.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {patientMeds.map(med => (
                  <div key={med.id} className="p-6 hover:bg-surface-container-low/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                          {med.name}
                          <span className="material-symbols-outlined text-primary text-sm" title="Formulary Approved">verified</span>
                        </h3>
                        <p className="text-sm text-on-surface-variant mt-1">{med.dose}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(med)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit medication"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleStop(med.id, med.name)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Discontinue"
                        >
                          <span className="material-symbols-outlined text-sm">stop_circle</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 bg-surface-container-low p-4 rounded-xl">
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Sig</p>
                        <p className="text-sm font-medium text-on-surface truncate" title={med.sig}>{med.sig}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Dispense</p>
                        <p className="text-sm font-medium text-on-surface">{med.dispense}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Refills</p>
                        <p className="text-sm font-medium text-on-surface">{med.refills}</p>
                      </div>
                      <div className="flex items-end justify-end col-span-4 md:col-span-1 mt-2 md:mt-0">
                        <button
                          onClick={() => handleRefillRequest(med.name)}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          Request Refill
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pharmacy & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Pharmacy Selection */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_pharmacy</span>
                Preferred Pharmacy
              </h3>
              <button
                onClick={() => setShowPharmacyModal(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                Change
              </button>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
              <p className="font-bold text-sm text-on-surface">{selectedPharmacy.name}</p>
              <p className="text-xs text-on-surface-variant mt-1">{selectedPharmacy.address}</p>
              <p className="text-xs text-on-surface-variant">{selectedPharmacy.city}</p>
              <div className="mt-3 flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">call</span> {selectedPharmacy.phone}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">fax</span> {selectedPharmacy.fax}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-tertiary bg-tertiary/10 p-2 rounded-lg">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Accepts e-Prescribing (Surescripts)
            </div>
          </div>

          {/* Clinical Warnings */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-error">warning</span>
              Interaction Alerts
            </h3>

            <div className="space-y-3">
              {patientMeds.length > 1 ? (
                <div className="p-3 bg-error-container/30 border-l-4 border-error rounded-r-lg">
                  <p className="text-xs font-bold text-on-error-container uppercase tracking-wider mb-1">Major Interaction</p>
                  <p className="text-sm font-medium text-on-surface">{patientMeds[0].name.split(' ')[0]} + {patientMeds[1].name.split(' ')[0]}</p>
                  <p className="text-xs text-on-surface-variant mt-1">May increase risk of adverse effects. Monitor closely.</p>
                  <button
                    onClick={handleOverride}
                    className="mt-2 text-xs font-bold text-error hover:underline"
                  >
                    Override with Reason
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-surface-container-low border-l-4 border-secondary rounded-r-lg">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Duplicate Therapy</p>
                  <p className="text-sm font-medium text-on-surface">None detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Controlled Substance Summary */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">security</span>
              Controlled Substances
            </h3>
            <div className="space-y-2 text-sm">
              {patientMeds.filter(m => ['Methylphenidate', 'Amphetamine', 'Adderall', 'Vyvanse', 'Ritalin', 'Klonopin', 'Xanax', 'Ativan', 'Lorazepam', 'Clonazepam'].some(cs => m.name.includes(cs))).length === 0 ? (
                <p className="text-on-surface-variant text-xs">No Schedule II–IV medications currently prescribed.</p>
              ) : (
                patientMeds
                  .filter(m => ['Methylphenidate', 'Amphetamine', 'Adderall', 'Vyvanse', 'Ritalin', 'Klonopin', 'Xanax', 'Ativan', 'Lorazepam', 'Clonazepam'].some(cs => m.name.includes(cs)))
                  .map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                      <span className="font-medium text-on-surface text-xs">{m.name}</span>
                      <span className="text-[10px] font-bold bg-error/10 text-error px-2 py-0.5 rounded-full">Schedule II</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Medication Modal ── */}
      {showEditModal && editingMed && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-headline font-bold text-on-surface">Edit Medication</h2>
                <p className="text-sm text-on-surface-variant mt-0.5">{editingMed.name}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Dose / Strength</label>
                <input
                  type="text"
                  value={editForm.dose}
                  onChange={e => setEditForm({ ...editForm, dose: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Sig (Instructions)</label>
                <textarea
                  rows={2}
                  value={editForm.sig}
                  onChange={e => setEditForm({ ...editForm, sig: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Dispense</label>
                  <input
                    type="text"
                    value={editForm.dispense}
                    onChange={e => setEditForm({ ...editForm, dispense: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Refills</label>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={editForm.refills}
                    onChange={e => setEditForm({ ...editForm, refills: parseInt(e.target.value) || 0 })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pharmacy Search Modal ── */}
      {showPharmacyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline font-bold text-on-surface">Change Pharmacy</h2>
              <button onClick={() => setShowPharmacyModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input
                type="text"
                placeholder="Search pharmacies..."
                value={pharmacySearch}
                onChange={e => setPharmacySearch(e.target.value)}
                className="w-full bg-surface-container-low rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {filteredPharmacies.map(ph => (
                <button
                  key={ph.name}
                  onClick={() => {
                    setSelectedPharmacy(ph);
                    setShowPharmacyModal(false);
                    addToast({ type: 'success', title: 'Pharmacy Updated', message: `${ph.name} set as preferred pharmacy.` });
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedPharmacy.name === ph.name
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container-highest'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-on-surface">{ph.name}</p>
                    {selectedPharmacy.name === ph.name && (
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{ph.address}, {ph.city}</p>
                  <p className="text-xs text-on-surface-variant">{ph.phone}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PDMP Modal ── */}
      {showPDMP && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-headline font-bold text-on-surface">PDMP Report</h2>
                <p className="text-sm text-on-surface-variant mt-0.5">Prescription Monitoring Program · {patient.name}</p>
              </div>
              <button onClick={() => setShowPDMP(false)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <div>
                <p className="text-xs font-bold text-on-surface">Identity Verified</p>
                <p className="text-xs text-on-surface-variant">Query submitted to Washington State PDMP · {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Controlled Substance Fill History (12 months)</h3>
              {[
                { drug: 'Methylphenidate 20mg', qty: '60 tabs', pharmacy: 'CVS #10293', fill: '2026-03-15', prescriber: 'Dr. Sarah Jenkins' },
                { drug: 'Lorazepam 0.5mg', qty: '30 tabs', pharmacy: 'Walgreens #4821', fill: '2026-01-08', prescriber: 'Dr. Sarah Jenkins' },
                { drug: 'Methylphenidate 20mg', qty: '60 tabs', pharmacy: 'CVS #10293', fill: '2026-02-12', prescriber: 'Dr. Sarah Jenkins' },
              ].map((rx, i) => (
                <div key={i} className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-on-surface">{rx.drug}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Qty: {rx.qty} · {rx.pharmacy}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-on-surface-variant">{rx.fill}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">{rx.prescriber}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">info</span>
                MME Score: 0 · No overlapping prescriptions detected · Low risk
              </p>
            </div>

            <button
              onClick={() => setShowPDMP(false)}
              className="mt-6 w-full py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
