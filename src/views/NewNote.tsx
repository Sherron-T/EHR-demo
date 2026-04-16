import React, { useState } from 'react';
import { ViewType } from '../App';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

interface NewNoteProps {
  onViewChange: (view: ViewType) => void;
}

export default function NewNote({ onViewChange }: NewNoteProps) {
  const { patients, currentPatientId, addNote, notes } = useData();
  const { addToast } = useToast();
  const [activeSection, setActiveSection] = useState('subjective');
  const [savedTime, setSavedTime] = useState('2 mins ago');
  const [wnl, setWnl] = useState({
    appearance: true, eyeContact: true, cooperative: true,
    affectApprop: true, flat: false, labile: false,
    linear: true
  });
  const [noteData, setNoteData] = useState({
    subjective: "Patient presents for a routine follow-up of Major Depressive Disorder. Reports mood has been 'okay, but still struggling with motivation.' Sleep is fair, getting about 6 hours per night but waking up unrefreshed. Appetite is stable. Denies any active suicidal ideation, intent, or plan. Notes that the recent increase in Bupropion has helped slightly with energy levels in the morning.",
    assessment: "46yo male with recurrent MDD, currently in partial remission. Symptoms are stable but residual fatigue and amotivation persist. Denies acute safety concerns.",
    plan: "1. Continue Escitalopram 20mg daily.\n2. Continue Bupropion XL 150mg daily.\n3. Encouraged behavioral activation (daily 20 min walk).\n4. Follow up in 4 weeks."
  });

  const patient = patients.find(p => p.id === currentPatientId);

  if (!patient) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">person_off</span>
        <h2 className="text-xl font-bold text-on-surface-variant">No Patient Selected</h2>
        <p className="text-sm text-on-surface-variant mt-2">Please select a patient to write a note.</p>
        <button onClick={() => onViewChange('dashboard')} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-bold">Go to Dashboard</button>
      </div>
    );
  }

  const handleSave = () => {
    setSavedTime('Just now');
  };

  const markWNL = () => {
    setWnl({
      appearance: true, eyeContact: true, cooperative: true,
      affectApprop: true, flat: false, labile: false,
      linear: true
    });
  };

  const [billing, setBilling] = useState({
    cptCode: '99214',
    icd10Codes: patient?.diagnoses.map(d => d.code) || []
  });

  const handleSignAndSubmit = () => {
    addNote({
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      type: 'Progress Note',
      author: 'Dr. Sarah Jenkins',
      subjective: noteData.subjective,
      objective: wnl, // Simplified for demo
      assessment: noteData.assessment,
      plan: noteData.plan,
      billing: billing
    });
    addToast({ type: 'success', title: 'Note Signed & Submitted', message: `Progress note for ${patient.name} has been finalized.` });
    onViewChange('patients');
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Note Navigation Sidebar */}
      <div className="w-64 bg-surface-container-lowest border-r border-outline-variant/10 flex flex-col">
        <div className="p-4 border-b border-outline-variant/10">
          <h2 className="font-headline font-bold text-on-surface">Progress Note</h2>
          <p className="text-xs text-on-surface-variant mt-1">Standard Psychiatric Follow-up</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {[
            { id: 'subjective', label: 'Subjective (HPI)' },
            { id: 'objective', label: 'Objective (MSE)' },
            { id: 'assessment', label: 'Assessment' },
            { id: 'plan', label: 'Plan' },
            { id: 'billing', label: 'Billing & Coding' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id 
                  ? 'bg-primary/10 text-primary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Note Content Area */}
      <div className="flex-1 overflow-y-auto bg-surface p-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Subjective Section */}
          <section id="subjective" className={`space-y-4 ${activeSection !== 'subjective' && 'opacity-50'}`}>
            <h3 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">S</span>
              Subjective
            </h3>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
              <label className="block text-sm font-bold text-on-surface mb-2">History of Present Illness (HPI)</label>
              <textarea 
                className="w-full h-48 bg-surface-container-low border-none rounded-xl p-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                placeholder="Patient reports..."
                value={noteData.subjective}
                onChange={(e) => setNoteData({...noteData, subjective: e.target.value})}
              ></textarea>
              
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => {
                    const lastNote = notes.find(n => n.patientId === currentPatientId);
                    if (lastNote) {
                      setNoteData({...noteData, subjective: lastNote.subjective});
                      addToast({ type: 'info', title: 'Previous HPI Loaded', message: `Inserted from note dated ${lastNote.date}.` });
                    } else {
                      addToast({ type: 'warning', title: 'No Previous Notes', message: 'No prior notes found for this patient.' });
                    }
                  }} 
                  className="px-3 py-1.5 bg-surface-container-low text-xs font-bold text-on-surface-variant rounded-lg hover:bg-surface-container-highest transition-colors"
                >
                  Insert Last HPI
                </button>
                <button 
                  onClick={() => {
                    setNoteData({
                      ...noteData,
                      subjective: "Patient presents for a routine follow-up. Reports mood is []. Sleep is []. Appetite is []. Denies active SI/HI.",
                      assessment: "Patient with [Diagnosis], currently [stable/unstable].",
                      plan: "1. Continue current medications.\n2. Follow up in [] weeks."
                    });
                  }} 
                  className="px-3 py-1.5 bg-surface-container-low text-xs font-bold text-on-surface-variant rounded-lg hover:bg-surface-container-highest transition-colors"
                >
                  Use Follow-up Template
                </button>
              </div>
            </div>
          </section>

          {/* Objective Section (MSE) */}
          <section id="objective" className={`space-y-4 ${activeSection !== 'objective' && 'opacity-50'}`}>
            <h3 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">O</span>
              Objective (Mental Status Exam)
            </h3>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
              <div className="flex justify-end mb-4">
                <button onClick={markWNL} className="text-sm font-bold text-primary hover:underline">Mark All Within Normal Limits (WNL)</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Appearance */}
                <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/5">
                  <span className="text-[11px] font-bold text-outline-variant uppercase tracking-widest block mb-4">Appearance & Behavior</span>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 group cursor-pointer">
                      <input type="checkbox" checked={wnl.appearance} onChange={(e) => setWnl({...wnl, appearance: e.target.checked})} className="rounded border-outline-variant text-primary focus:ring-primary-container w-4 h-4" />
                      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">Well-groomed</span>
                    </label>
                    <label className="flex items-center gap-3 group cursor-pointer">
                      <input type="checkbox" checked={wnl.eyeContact} onChange={(e) => setWnl({...wnl, eyeContact: e.target.checked})} className="rounded border-outline-variant text-primary focus:ring-primary-container w-4 h-4" />
                      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">Good eye contact</span>
                    </label>
                    <label className="flex items-center gap-3 group cursor-pointer">
                      <input type="checkbox" checked={wnl.cooperative} onChange={(e) => setWnl({...wnl, cooperative: e.target.checked})} className="rounded border-outline-variant text-primary focus:ring-primary-container w-4 h-4" />
                      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">Cooperative</span>
                    </label>
                  </div>
                </div>

                {/* Affect */}
                <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/5">
                  <span className="text-[11px] font-bold text-outline-variant uppercase tracking-widest block mb-4">Affect</span>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 group cursor-pointer">
                      <input type="checkbox" checked={wnl.affectApprop} onChange={(e) => setWnl({...wnl, affectApprop: e.target.checked})} className="rounded border-outline-variant text-primary focus:ring-primary-container w-4 h-4" />
                      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">Appropriate</span>
                    </label>
                    <label className="flex items-center gap-3 group cursor-pointer">
                      <input type="checkbox" checked={wnl.flat} onChange={(e) => setWnl({...wnl, flat: e.target.checked})} className="rounded border-outline-variant text-primary focus:ring-primary-container w-4 h-4" />
                      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">Flat / Blunted</span>
                    </label>
                    <label className="flex items-center gap-3 group cursor-pointer">
                      <input type="checkbox" checked={wnl.labile} onChange={(e) => setWnl({...wnl, labile: e.target.checked})} className="rounded border-outline-variant text-primary focus:ring-primary-container w-4 h-4" />
                      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">Labile</span>
                    </label>
                  </div>
                </div>

                {/* Thought Content */}
                <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/5">
                  <span className="text-[11px] font-bold text-outline-variant uppercase tracking-widest block mb-4">Thought Content</span>
                  <select className="w-full bg-surface-container-low border-none rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-surface-tint/20 mb-3">
                    <option>No SI/HI reported</option>
                    <option>Ideation present (no plan)</option>
                    <option>Ideation present (active plan)</option>
                  </select>
                  <label className="flex items-center gap-3 group cursor-pointer">
                    <input type="checkbox" checked={wnl.linear} onChange={(e) => setWnl({...wnl, linear: e.target.checked})} className="rounded border-outline-variant text-primary focus:ring-primary-container w-4 h-4" />
                    <span className="text-sm font-medium text-on-surface">Linear & Goal-Directed</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Assessment Section */}
          <section id="assessment" className={`space-y-4 ${activeSection !== 'assessment' && 'opacity-50'}`}>
            <h3 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">A</span>
              Assessment
            </h3>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
              <textarea 
                className="w-full h-32 bg-surface-container-low border-none rounded-xl p-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                placeholder="Clinical assessment..."
                value={noteData.assessment}
                onChange={(e) => setNoteData({...noteData, assessment: e.target.value})}
              ></textarea>
            </div>
          </section>

          {/* Plan Section */}
          <section id="plan" className={`space-y-4 ${activeSection !== 'plan' && 'opacity-50'}`}>
            <h3 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">P</span>
              Plan
            </h3>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
              <textarea 
                className="w-full h-32 bg-surface-container-low border-none rounded-xl p-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                placeholder="Treatment plan..."
                value={noteData.plan}
                onChange={(e) => setNoteData({...noteData, plan: e.target.value})}
              ></textarea>
            </div>
          </section>

          {/* Billing Section */}
          <section id="billing" className={`space-y-4 ${activeSection !== 'billing' && 'opacity-50'}`}>
            <h3 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">$</span>
              Billing & Coding
            </h3>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">CPT Code (E&M)</label>
                  <select 
                    className="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                    value={billing.cptCode}
                    onChange={(e) => setBilling({...billing, cptCode: e.target.value})}
                  >
                    <option value="99213">99213 - Level 3 Established Patient</option>
                    <option value="99214">99214 - Level 4 Established Patient</option>
                    <option value="99215">99215 - Level 5 Established Patient</option>
                    <option value="99204">99204 - Level 4 New Patient</option>
                    <option value="99205">99205 - Level 5 New Patient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">ICD-10 Diagnoses</label>
                  <div className="space-y-2">
                    {patient.diagnoses.map(dx => (
                      <label key={dx.code} className="flex items-center gap-3 group cursor-pointer bg-surface-container-low p-2 rounded-lg">
                        <input 
                          type="checkbox" 
                          checked={billing.icd10Codes.includes(dx.code)} 
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBilling({...billing, icd10Codes: [...billing.icd10Codes, dx.code]});
                            } else {
                              setBilling({...billing, icd10Codes: billing.icd10Codes.filter(c => c !== dx.code)});
                            }
                          }}
                          className="rounded border-outline-variant text-primary focus:ring-primary-container w-4 h-4" 
                        />
                        <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{dx.code} - {dx.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-surface-container-lowest border-t border-outline-variant/10 p-4 px-8 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-on-surface-variant">Status: <span className="text-tertiary font-bold">Draft</span></span>
          <span className="text-xs text-on-surface-variant">Last saved: {savedTime}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} className="px-6 py-2.5 bg-surface-container-low text-on-surface-variant font-bold rounded-lg hover:bg-surface-container-highest transition-colors">
            Save Draft
          </button>
          <button onClick={handleSignAndSubmit} className="px-6 py-2.5 signature-gradient text-white font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">draw</span>
            Sign & Submit
          </button>
        </div>
      </div>
    </div>
  );
}
