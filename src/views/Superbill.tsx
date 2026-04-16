import React, { useState } from 'react';
import { ViewType } from '../App';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

interface SuperbillProps {
  onViewChange: (view: ViewType) => void;
}

const CPT_CATALOG = [
  { code: '99213', description: 'Office/outpatient visit, Est. Patient — Level 3', fee: 145.00, category: 'E&M' },
  { code: '99214', description: 'Office/outpatient visit, Est. Patient — Level 4', fee: 210.00, category: 'E&M' },
  { code: '99215', description: 'Office/outpatient visit, Est. Patient — Level 5', fee: 285.00, category: 'E&M' },
  { code: '99204', description: 'Office/outpatient visit, New Patient — Level 4', fee: 265.00, category: 'E&M' },
  { code: '99205', description: 'Office/outpatient visit, New Patient — Level 5', fee: 340.00, category: 'E&M' },
  { code: '90837', description: 'Psychotherapy, 60 min', fee: 175.00, category: 'Therapy' },
  { code: '90834', description: 'Psychotherapy, 45 min', fee: 140.00, category: 'Therapy' },
  { code: '90832', description: 'Psychotherapy, 30 min', fee: 105.00, category: 'Therapy' },
  { code: '90833', description: 'Psychotherapy w/ E&M add-on, 30 min', fee: 75.00, category: 'Add-on' },
  { code: '90836', description: 'Psychotherapy w/ E&M add-on, 45 min', fee: 100.00, category: 'Add-on' },
  { code: '90838', description: 'Psychotherapy w/ E&M add-on, 60 min', fee: 130.00, category: 'Add-on' },
  { code: '96127', description: 'Brief emotional/behavioral assessment (PHQ-9/GAD-7)', fee: 25.00, category: 'Assessment' },
  { code: '99408', description: 'Alcohol/drug abuse structured assessment, 15-30 min', fee: 45.00, category: 'Assessment' },
  { code: '90792', description: 'Psychiatric diagnostic evaluation w/ medical services', fee: 320.00, category: 'Diagnostic' },
];

const PAYER_RATES: Record<string, number> = {
  'Premera Blue Cross': 0.82,
  'Regence BlueCross': 0.79,
  'Kaiser Permanente': 0.76,
  'Aetna': 0.74,
  'Cigna': 0.77,
  'United Healthcare': 0.71,
  'Medicaid': 0.55,
  'Medicare': 0.62,
  'Self-Pay': 1.0,
};

interface BillLine {
  cptCode: string;
  units: number;
  modifier: string;
}

export default function Superbill({ onViewChange }: SuperbillProps) {
  const { patients, currentPatientId, notes, appointments } = useData();
  const { addToast } = useToast();

  const patient = patients.find(p => p.id === currentPatientId);
  const today = new Date().toISOString().split('T')[0];

  // Pull last note's billing data as defaults
  const lastNote = notes.filter(n => n.patientId === currentPatientId).sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastAppt = appointments.filter(a => a.patientId === currentPatientId).sort((a, b) => b.date.localeCompare(a.date))[0];

  const [dateOfService, setDateOfService] = useState(lastAppt?.date ?? today);
  const [placeOfService, setPlaceOfService] = useState('11 – Office');
  const [billLines, setBillLines] = useState<BillLine[]>(() => {
    const defaults: BillLine[] = [];
    if (lastNote?.billing?.cptCode) {
      defaults.push({ cptCode: lastNote.billing.cptCode, units: 1, modifier: '' });
    } else {
      defaults.push({ cptCode: '99214', units: 1, modifier: '' });
    }
    return defaults;
  });
  const [selectedDx, setSelectedDx] = useState<string[]>(
    lastNote?.billing?.icd10Codes ?? patient?.diagnoses.map(d => d.code) ?? []
  );
  const [submitted, setSubmitted] = useState(false);
  const [showCptPicker, setShowCptPicker] = useState(false);
  const [cptSearch, setCptSearch] = useState('');

  if (!patient) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">receipt_long</span>
        <h2 className="text-xl font-bold text-on-surface-variant">No Patient Selected</h2>
        <p className="text-sm text-on-surface-variant mt-2">Please select a patient to generate a superbill.</p>
        <button onClick={() => onViewChange('patient_list')} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-bold">Patient Roster</button>
      </div>
    );
  }

  const payerRate = PAYER_RATES[patient.insurance ?? ''] ?? 0.75;
  const totalCharge = billLines.reduce((sum, line) => {
    const cpt = CPT_CATALOG.find(c => c.code === line.cptCode);
    return sum + (cpt?.fee ?? 0) * line.units;
  }, 0);
  const expectedPayment = totalCharge * payerRate;
  const patientResponsibility = totalCharge - expectedPayment;

  const updateLine = (idx: number, field: keyof BillLine, value: string | number) => {
    setBillLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };
  const removeLine = (idx: number) => setBillLines(prev => prev.filter((_, i) => i !== idx));
  const addLine = (cptCode: string) => {
    setBillLines(prev => [...prev, { cptCode, units: 1, modifier: '' }]);
    setShowCptPicker(false);
    setCptSearch('');
  };

  const toggleDx = (code: string) => {
    setSelectedDx(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  const handleSubmitClaim = () => {
    setSubmitted(true);
    addToast({ type: 'success', title: 'Claim Submitted', message: `$${totalCharge.toFixed(2)} claim sent to ${patient.insurance ?? 'payer'} for ${patient.name}.` });
  };

  const handlePrint = () => {
    addToast({ type: 'info', title: 'Generating PDF', message: 'Superbill PDF is being prepared for download.' });
  };

  const filteredCpt = CPT_CATALOG.filter(c =>
    c.code.includes(cptSearch) || c.description.toLowerCase().includes(cptSearch.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant mb-2">
            <button onClick={() => onViewChange('patients')} className="hover:text-primary transition-colors">{patient.name}</button>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary">Superbill</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Superbill / Charge Capture</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-surface-container-low text-on-surface-variant font-bold rounded-lg hover:bg-surface-container-highest transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Print / PDF
          </button>
          <button
            onClick={handleSubmitClaim}
            disabled={submitted || billLines.length === 0 || selectedDx.length === 0}
            className={`px-4 py-2 font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 ${
              submitted ? 'bg-tertiary text-white' : 'signature-gradient text-white hover:opacity-90 disabled:opacity-40'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{submitted ? 'check_circle' : 'send'}</span>
            {submitted ? 'Claim Submitted' : 'Submit Claim'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main billing area */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* Encounter Info */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <h2 className="font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">event_note</span>
              Encounter Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Date of Service</label>
                <input
                  type="date"
                  value={dateOfService}
                  onChange={e => setDateOfService(e.target.value)}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Place of Service</label>
                <select
                  value={placeOfService}
                  onChange={e => setPlaceOfService(e.target.value)}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option>11 – Office</option>
                  <option>02 – Telehealth (Patient Home)</option>
                  <option>10 – Telehealth (Non-Home)</option>
                  <option>21 – Inpatient Hospital</option>
                  <option>23 – Emergency Room</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Rendering Provider</label>
                <div className="bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface">Dr. Sarah Jenkins, MD</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">NPI</label>
                <div className="bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface">1234567890</div>
              </div>
            </div>
          </div>

          {/* CPT Codes / Charges */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-visible">
            <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30 flex justify-between items-center">
              <h2 className="font-headline font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">receipt</span>
                Procedure Codes (CPT)
              </h2>
              <button
                onClick={() => setShowCptPicker(true)}
                className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Code
              </button>
            </div>

            {/* CPT Picker dropdown */}
            {showCptPicker && (
              <div className="mx-6 mt-4 mb-2 bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden z-20 relative">
                <div className="p-3 border-b border-outline-variant/10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search CPT codes..."
                    value={cptSearch}
                    onChange={e => setCptSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  <button onClick={() => { setShowCptPicker(false); setCptSearch(''); }} className="text-on-surface-variant hover:text-error">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-outline-variant/10">
                  {filteredCpt.map(c => (
                    <button
                      key={c.code}
                      onClick={() => addLine(c.code)}
                      className="w-full text-left px-4 py-3 hover:bg-surface-container-highest transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-sm text-primary mr-2">{c.code}</span>
                        <span className="text-xs text-on-surface">{c.description}</span>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant flex-shrink-0">${c.fee.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="divide-y divide-outline-variant/10">
              {billLines.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant text-sm">
                  No procedure codes added. Click "Add Code" to begin.
                </div>
              ) : (
                <>
                  <div className="px-6 py-3 grid grid-cols-12 gap-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low/20">
                    <div className="col-span-2">CPT</div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2">Modifier</div>
                    <div className="col-span-1">Units</div>
                    <div className="col-span-1 text-right">Fee</div>
                    <div className="col-span-1"></div>
                  </div>
                  {billLines.map((line, idx) => {
                    const cpt = CPT_CATALOG.find(c => c.code === line.cptCode);
                    return (
                      <div key={idx} className="px-6 py-4 grid grid-cols-12 gap-3 items-center hover:bg-surface-container-low/30 transition-colors">
                        <div className="col-span-2">
                          <span className="font-bold text-sm text-primary">{line.cptCode}</span>
                        </div>
                        <div className="col-span-5">
                          <p className="text-xs text-on-surface leading-snug">{cpt?.description ?? '—'}</p>
                          <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded-full">{cpt?.category}</span>
                        </div>
                        <div className="col-span-2">
                          <select
                            value={line.modifier}
                            onChange={e => updateLine(idx, 'modifier', e.target.value)}
                            className="w-full bg-surface-container-low rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/30"
                          >
                            <option value="">None</option>
                            <option value="GT">GT – Telehealth</option>
                            <option value="95">95 – Synchronous</option>
                            <option value="25">25 – Significant E&M</option>
                            <option value="59">59 – Distinct procedure</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={line.units}
                            onChange={e => updateLine(idx, 'units', parseInt(e.target.value) || 1)}
                            className="w-full bg-surface-container-low rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/30 text-center"
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          <span className="text-sm font-bold text-on-surface">${((cpt?.fee ?? 0) * line.units).toFixed(2)}</span>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button onClick={() => removeLine(idx)} className="p-1 text-on-surface-variant/40 hover:text-error transition-colors rounded">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Diagnoses */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <h2 className="font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">diagnosis</span>
              Diagnosis Codes (ICD-10)
            </h2>
            {patient.diagnoses.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic">No diagnoses on file for this patient.</p>
            ) : (
              <div className="space-y-2">
                {patient.diagnoses.map((dx, i) => (
                  <label key={dx.code} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container-highest transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedDx.includes(dx.code)}
                      onChange={() => toggleDx(dx.code)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-primary mr-2">{dx.code}</span>
                      <span className="text-sm text-on-surface">{dx.name}</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                      Pointer {String.fromCharCode(65 + i)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: summary + patient/payer */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Patient & Insurance */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <h3 className="font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">person</span>
              Patient / Payer
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Patient</p>
                <p className="font-bold text-on-surface">{patient.name}</p>
                <p className="text-xs text-on-surface-variant">MRN: {patient.mrn} · DOB: {patient.dob}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Insurance</p>
                <p className="font-medium text-on-surface">{patient.insurance ?? 'Self-Pay'}</p>
              </div>
              {patient.insurance && (
                <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Expected Reimbursement Rate</p>
                  <p className="text-sm font-bold text-primary">{Math.round(payerRate * 100)}% of charges</p>
                </div>
              )}
            </div>
          </div>

          {/* Charge Summary */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <h3 className="font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">payments</span>
              Charge Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Total Charges</span>
                <span className="font-bold text-on-surface">${totalCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Insurance Adjustment</span>
                <span className="font-medium text-error">−${(totalCharge - expectedPayment).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Expected Payment</span>
                <span className="font-bold text-tertiary">${expectedPayment.toFixed(2)}</span>
              </div>
              <div className="border-t border-outline-variant/10 pt-3 flex justify-between">
                <span className="text-sm font-bold text-on-surface">Patient Balance</span>
                <span className="font-bold text-on-surface">${patientResponsibility.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {[...billLines].map((line, i) => {
                const cpt = CPT_CATALOG.find(c => c.code === line.cptCode);
                return (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-primary font-bold">{line.cptCode}</span>
                    <span className="text-on-surface-variant">${((cpt?.fee ?? 0) * line.units).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation */}
          <div className={`rounded-2xl p-4 border ${billLines.length > 0 && selectedDx.length > 0 ? 'bg-tertiary/5 border-tertiary/30' : 'bg-error/5 border-error/20'}`}>
            <p className={`text-xs font-bold mb-2 ${billLines.length > 0 && selectedDx.length > 0 ? 'text-tertiary' : 'text-error'}`}>
              {billLines.length > 0 && selectedDx.length > 0 ? '✓ Ready to submit' : 'Claim incomplete'}
            </p>
            <div className="space-y-1">
              {[
                { label: 'CPT code selected', ok: billLines.length > 0 },
                { label: 'Diagnosis linked', ok: selectedDx.length > 0 },
                { label: 'Date of service set', ok: !!dateOfService },
                { label: 'Provider info complete', ok: true },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <span className={`material-symbols-outlined text-sm ${item.ok ? 'text-tertiary' : 'text-error'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {item.ok ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={item.ok ? 'text-on-surface-variant' : 'text-error'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
