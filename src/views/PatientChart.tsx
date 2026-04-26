import React, { useState } from 'react';
import { ViewType } from '../App';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import PatientOutcomes from '../components/PatientOutcomes';

interface PatientChartProps {
  onViewChange: (view: ViewType) => void;
}

const LAB_OPTIONS = [
  'Comprehensive Metabolic Panel (CMP)',
  'Complete Blood Count (CBC) with Differential',
  'Thyroid Panel (TSH, Free T4)',
  'Lipid Panel, Fasting',
  'Hepatic Function Panel',
  'Lithium Serum Level',
  'Valproic Acid Level',
  'Lamotrigine Level',
  'Urine Drug Screen',
  'Hemoglobin A1c',
  'Prolactin Level',
  'Fasting Glucose',
  'B12 / Folate',
  'Vitamin D (25-OH)',
];

function calcBMI(weight?: number, height?: number): string {
  if (!weight || !height) return '—';
  const bmi = (703 * weight) / (height * height);
  return bmi.toFixed(1);
}

function bpCategory(sys?: number, dia?: number): { label: string; color: string } {
  if (!sys || !dia) return { label: '—', color: 'text-on-surface-variant' };
  if (sys >= 180 || dia >= 120) return { label: 'Crisis', color: 'text-error font-bold' };
  if (sys >= 140 || dia >= 90) return { label: 'Stage 2', color: 'text-error' };
  if (sys >= 130 || dia >= 80) return { label: 'Stage 1', color: 'text-[#7c5700]' };
  if (sys >= 120) return { label: 'Elevated', color: 'text-[#7c5700]' };
  return { label: 'Normal', color: 'text-tertiary' };
}

export default function PatientChart({ onViewChange }: PatientChartProps) {
  const {
    patients, currentPatientId,
    medications, notes, labs, orders, documents,
    addOrder, addLab,
    vitals, addVital,
    safetyPlans, upsertSafetyPlan,
    outcomes,
  } = useData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('Summary');

  // Order modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ type: 'Lab', description: '', priority: 'Routine' });
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  // Vitals modal
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    weight: '',
    height: '',
    bpSystolic: '',
    bpDiastolic: '',
    heartRate: '',
    notes: '',
  });

  // Safety Plan modal
  const [showSafetyPlan, setShowSafetyPlan] = useState(false);
  const [spForm, setSpForm] = useState({
    warningSigns: '',
    internalCoping: '',
    socialName1: '', socialPhone1: '',
    socialName2: '', socialPhone2: '',
    crisisName1: '', crisisPhone1: '', crisisRel1: '',
    crisisName2: '', crisisPhone2: '', crisisRel2: '',
    professionalName: '', professionalPhone: '', professionalAvail: '',
    meansRestriction: '',
    reasonsForLiving: '',
    signedByPatient: false,
    signedByProvider: false,
  });
  const [spSaved, setSpSaved] = useState(false);

  // Document viewer modal
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);

  // Note detail modal
  const [selectedNote, setSelectedNote] = useState<typeof notes[0] | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const tabs = ['Summary', 'Demographics', 'Outcomes', 'Timeline', 'Labs', 'Vitals', 'Orders', 'Documents'];

  const patient = patients.find(p => p.id === currentPatientId);

  if (!patient) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">person_off</span>
        <h2 className="text-xl font-bold text-on-surface-variant">No Patient Selected</h2>
        <p className="text-sm text-on-surface-variant mt-2">Please select a patient from the search bar or dashboard.</p>
      </div>
    );
  }

  const patientMeds = medications.filter(m => m.patientId === patient.id && m.status === 'Active');
  const patientNotes = notes.filter(n => n.patientId === patient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const patientLabs = labs.filter(l => l.patientId === patient.id);
  const patientOrders = orders.filter(o => o.patientId === patient.id);
  const patientDocs = documents.filter(d => d.patientId === patient.id);
  const patientVitals = vitals.filter(v => v.patientId === patient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const existingSafetyPlan = safetyPlans.find(sp => sp.patientId === patient.id);
  const isHighRisk = patient.riskScore === 'High' || patient.riskScore === 'Severe';

  const patientOutcomes = outcomes.filter(o => o.patientId === patient.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Care gaps — computed from patient data
  const lastLabDate = patientLabs.length > 0 ? patientLabs.sort((a,b) => new Date(b.date).getTime()-new Date(a.date).getTime())[0].date : null;
  const lastOutcome = patientOutcomes ? patientOutcomes[patientOutcomes.length - 1] : null;
  const daysSinceLastLab = lastLabDate ? Math.floor((Date.now() - new Date(lastLabDate).getTime()) / 86400000) : 999;
  const careGaps = [
    daysSinceLastLab > 90 && { label: 'Annual Labs Overdue', detail: `Last drawn ${daysSinceLastLab} days ago`, icon: 'biotech', urgent: daysSinceLastLab > 180 },
    patientNotes.length === 0 && { label: 'No Clinical Notes on File', detail: 'Initial documentation needed', icon: 'edit_note', urgent: true },
    patientVitals.length === 0 && { label: 'No Vitals Recorded', detail: 'Baseline vitals needed', icon: 'monitor_heart', urgent: false },
    isHighRisk && !existingSafetyPlan && { label: 'Safety Plan Required', detail: 'High/Severe risk — safety plan missing', icon: 'crisis_alert', urgent: true },
  ].filter(Boolean) as { label: string; detail: string; icon: string; urgent: boolean }[];

  // Build a unified timeline from notes, labs, orders, and meds
  const timelineEvents = [
    ...patientNotes.map(n => ({ date: n.date, type: 'Note', title: n.type, detail: n.subjective.slice(0, 80) + '...', icon: 'description', color: 'text-primary', bg: 'bg-primary/10' })),
    ...patientLabs.map(l => ({ date: l.date, type: 'Lab', title: l.testName, detail: `Result: ${l.result} ${l.unit} ${l.flag !== 'Normal' ? `· ${l.flag}` : ''}`.trim(), icon: 'biotech', color: l.flag !== 'Normal' ? 'text-error' : 'text-tertiary', bg: l.flag !== 'Normal' ? 'bg-error/10' : 'bg-tertiary/10' })),
    ...patientOrders.map(o => ({ date: o.date, type: 'Order', title: o.description, detail: `${o.type} · ${o.status}`, icon: 'assignment', color: 'text-secondary', bg: 'bg-secondary/10' })),
    ...patientMeds.map(m => ({ date: patient.lastVisit ?? new Date().toISOString().split('T')[0], type: 'Medication', title: `Started: ${m.name}`, detail: m.dose, icon: 'medication', color: 'text-primary', bg: 'bg-primary/10' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOrderSubmit = () => {
    if (!orderForm.description) return;
    const today = new Date().toISOString().split('T')[0];
    addOrder({
      patientId: patient.id,
      date: today,
      type: orderForm.type,
      description: `${orderForm.description}${orderForm.priority !== 'Routine' ? ` (${orderForm.priority})` : ''}`,
      status: 'Pending',
      orderedBy: 'Dr. Sarah Jenkins',
    });
    if (orderForm.type === 'Lab') {
      addLab({
        patientId: patient.id,
        date: today,
        testName: orderForm.description,
        result: 'Pending',
        unit: '',
        referenceRange: '',
        flag: 'Normal',
        orderedBy: 'Dr. Sarah Jenkins',
        status: 'Pending',
      });
    }
    setOrderSubmitted(true);
    setTimeout(() => {
      setShowOrderModal(false);
      setOrderSubmitted(false);
      setOrderForm({ type: 'Lab', description: '', priority: 'Routine' });
      setActiveTab('Orders');
    }, 1200);
  };

  const handleVitalsSave = () => {
    const today = new Date().toISOString().split('T')[0];
    const w = parseFloat(vitalsForm.weight) || undefined;
    const h = parseFloat(vitalsForm.height) || undefined;
    addVital({
      patientId: patient.id,
      date: today,
      weight: w,
      height: h,
      bpSystolic: parseInt(vitalsForm.bpSystolic) || undefined,
      bpDiastolic: parseInt(vitalsForm.bpDiastolic) || undefined,
      heartRate: parseInt(vitalsForm.heartRate) || undefined,
      bmi: w && h ? parseFloat(calcBMI(w, h)) : undefined,
      notes: vitalsForm.notes || undefined,
      recordedBy: 'Dr. Sarah Jenkins',
    });
    addToast({ type: 'success', title: 'Vitals Recorded', message: `Vitals saved for ${patient.name}.` });
    setShowVitalsModal(false);
    setVitalsForm({ weight: '', height: '', bpSystolic: '', bpDiastolic: '', heartRate: '', notes: '' });
  };

  const handleOpenSafetyPlan = () => {
    if (existingSafetyPlan) {
      setSpForm({
        warningSigns: existingSafetyPlan.warningSigns.join('\n'),
        internalCoping: existingSafetyPlan.internalCoping.join('\n'),
        socialName1: existingSafetyPlan.socialDistraction[0]?.name ?? '',
        socialPhone1: existingSafetyPlan.socialDistraction[0]?.phone ?? '',
        socialName2: existingSafetyPlan.socialDistraction[1]?.name ?? '',
        socialPhone2: existingSafetyPlan.socialDistraction[1]?.phone ?? '',
        crisisName1: existingSafetyPlan.crisisContacts[0]?.name ?? '',
        crisisPhone1: existingSafetyPlan.crisisContacts[0]?.phone ?? '',
        crisisRel1: existingSafetyPlan.crisisContacts[0]?.relationship ?? '',
        crisisName2: existingSafetyPlan.crisisContacts[1]?.name ?? '',
        crisisPhone2: existingSafetyPlan.crisisContacts[1]?.phone ?? '',
        crisisRel2: existingSafetyPlan.crisisContacts[1]?.relationship ?? '',
        professionalName: existingSafetyPlan.professionalContacts[0]?.name ?? '',
        professionalPhone: existingSafetyPlan.professionalContacts[0]?.phone ?? '',
        professionalAvail: existingSafetyPlan.professionalContacts[0]?.available ?? '',
        meansRestriction: existingSafetyPlan.meansRestriction,
        reasonsForLiving: existingSafetyPlan.reasonsForLiving.join('\n'),
        signedByPatient: existingSafetyPlan.signedByPatient,
        signedByProvider: existingSafetyPlan.signedByProvider,
      });
    }
    setSpSaved(false);
    setShowSafetyPlan(true);
  };

  const handleSafetyPlanSave = () => {
    const today = new Date().toISOString().split('T')[0];
    upsertSafetyPlan({
      patientId: patient.id,
      updatedDate: today,
      warningSigns: spForm.warningSigns.split('\n').map(s => s.trim()).filter(Boolean),
      internalCoping: spForm.internalCoping.split('\n').map(s => s.trim()).filter(Boolean),
      socialDistraction: [
        spForm.socialName1 ? { name: spForm.socialName1, phone: spForm.socialPhone1 } : null,
        spForm.socialName2 ? { name: spForm.socialName2, phone: spForm.socialPhone2 } : null,
      ].filter(Boolean) as { name: string; phone: string }[],
      crisisContacts: [
        spForm.crisisName1 ? { name: spForm.crisisName1, phone: spForm.crisisPhone1, relationship: spForm.crisisRel1 } : null,
        spForm.crisisName2 ? { name: spForm.crisisName2, phone: spForm.crisisPhone2, relationship: spForm.crisisRel2 } : null,
      ].filter(Boolean) as { name: string; phone: string; relationship: string }[],
      professionalContacts: spForm.professionalName
        ? [{ name: spForm.professionalName, phone: spForm.professionalPhone, available: spForm.professionalAvail }]
        : [],
      meansRestriction: spForm.meansRestriction,
      reasonsForLiving: spForm.reasonsForLiving.split('\n').map(s => s.trim()).filter(Boolean),
      signedByPatient: spForm.signedByPatient,
      signedByProvider: spForm.signedByProvider,
    });
    setSpSaved(true);
    addToast({ type: 'success', title: 'Safety Plan Saved', message: `Safety plan updated for ${patient.name}.` });
    setTimeout(() => setShowSafetyPlan(false), 1400);
  };

  const getDocumentContent = (doc: typeof documents[0]) => {
    if (doc.type === 'Assessment') {
      if (doc.title.includes('PHQ-9')) {
        return `PHQ-9 PATIENT HEALTH QUESTIONNAIRE
Date: ${doc.date} | Patient: ${patient?.name} | Completed via: Patient Portal

Over the last 2 weeks, how often have you been bothered by:

1. Little interest or pleasure in doing things .............. Nearly every day (3)
2. Feeling down, depressed, or hopeless ................... More than half the days (2)
3. Trouble falling/staying asleep, or sleeping too much .... Several days (1)
4. Feeling tired or having little energy ................... Nearly every day (3)
5. Poor appetite or overeating ............................. Several days (1)
6. Feeling bad about yourself .............................. More than half the days (2)
7. Trouble concentrating on things ......................... Several days (1)
8. Moving/speaking slowly OR being fidgety/restless ........ Not at all (0)
9. Thoughts of being better off dead or hurting yourself ... Not at all (0)

TOTAL SCORE: 13 / 27
SEVERITY: Moderate Depression

Functional impairment: "Somewhat difficult"

——————————————————————
Scored and reviewed by: ${doc.author}`;
      }
      if (doc.title.includes('GAD-7')) {
        return `GAD-7 GENERALIZED ANXIETY DISORDER SCALE
Date: ${doc.date} | Patient: ${patient?.name} | Completed via: Patient Portal

Over the last 2 weeks, how often have you been bothered by:

1. Feeling nervous, anxious, or on edge ................... Several days (1)
2. Not being able to stop or control worrying ............. More than half the days (2)
3. Worrying too much about different things ............... Several days (1)
4. Trouble relaxing ....................................... Nearly every day (3)
5. Being so restless it is hard to sit still .............. Not at all (0)
6. Becoming easily annoyed or irritable ................... Several days (1)
7. Feeling afraid as if something awful might happen ...... More than half the days (2)

TOTAL SCORE: 10 / 21
SEVERITY: Moderate Anxiety

——————————————————————
Scored and reviewed by: ${doc.author}`;
      }
      if (doc.title.includes('AUDIT')) {
        return `AUDIT-C ALCOHOL USE DISORDERS IDENTIFICATION TEST
Date: ${doc.date} | Patient: ${patient?.name}

1. How often do you have a drink containing alcohol?
   → 2-4 times a month (2)

2. How many drinks containing alcohol do you have on a typical day?
   → 5 or 6 (3)

3. How often do you have six or more drinks on one occasion?
   → Weekly (4)

AUDIT-C SCORE: 9 / 12
INTERPRETATION: High risk — likely alcohol dependence

Referred for: Full AUDIT assessment and SUD counseling

——————————————————————
Completed by: Patient | Reviewed by: ${doc.author}`;
      }
      return `CLINICAL ASSESSMENT\n\nDocument: ${doc.title}\nDate: ${doc.date}\nAuthor: ${doc.author}\n\n[Assessment content on file]`;
    }

    if (doc.type === 'Safety Assessment') {
      return `COLUMBIA SUICIDE SEVERITY RATING SCALE (C-SSRS)
Date: ${doc.date} | Patient: ${patient?.name} | Clinician: ${doc.author}

IDEATION INTENSITY:
Frequency: Daily
Duration: 1–5 minutes per episode
Controllability: Unable to control
Deterrents: Yes — patient identifies family as a deterrent
Reasons for ideation: Hopelessness, feeling like a burden

SUICIDAL BEHAVIOR HISTORY:
Lifetime attempts: 0
Most recent ideation level: Active ideation without plan

C-SSRS RISK LEVEL: Moderate–High

CLINICAL DECISION:
Safety plan reviewed and updated. Increased session frequency to weekly.
Crisis resources provided. No hospitalization required at this time.
Patient contracted for safety verbally and in writing.

——————————————————————
Clinician Signature: ${doc.author}`;
    }

    if (doc.type === 'Crisis Document') {
      return `STANLEY-BROWN SAFETY PLAN
Date: ${doc.date} | Patient: ${patient?.name}

STEP 1 — Warning Signs:
• Feeling hopeless about the future
• Isolating from friends and family
• Stopping medications

STEP 2 — Internal Coping Strategies:
• Go for a walk outside
• Practice 4-7-8 breathing for 5 minutes
• Journal about what I am grateful for

STEP 3 — Social Contacts (Distraction):
• Emma (Best Friend): (206) 555-0391
• Mom: (206) 555-0422

STEP 4 — Crisis Contacts:
• Dr. Sarah Jenkins: (206) 555-0100
• 988 Suicide & Crisis Lifeline: 988
• Crisis Text Line: Text HOME to 741741

STEP 5 — Professional Resources:
• Dr. Sarah Jenkins, MD — M–F 9am–5pm
• Ascend IOP Program: (206) 555-0200

STEP 6 — Means Restriction:
Firearms removed from home and stored at brother's house.
Medications held by mother and dispensed daily.

———
Patient Signature: _____________________ Date: ${doc.date}
Provider Signature: Dr. Sarah Jenkins    Date: ${doc.date}`;
    }

    if (doc.type === 'Consent') {
      return `INFORMED CONSENT FOR PSYCHIATRIC TREATMENT
Date: ${doc.date} | Patient: ${patient?.name} | Provider: ${doc.author}

I, ${patient?.name ?? '[Patient Name]'}, consent to psychiatric evaluation and treatment by Dr. Sarah Jenkins, MD.

I understand that:
1. Treatment may include medication management, psychotherapy referrals, and crisis intervention.
2. Medications carry risks and benefits that have been explained to me.
3. I have the right to refuse treatment at any time.
4. My records are confidential except as required by law (duty to warn, mandated reporting).
5. Telehealth services may be used and carry the same confidentiality protections.

HIPAA Notice: I have received and reviewed the Notice of Privacy Practices.

Emergency Contact Authorization: I authorize contacting my emergency contact in a psychiatric emergency.

———
Patient Signature: _____________________ Date: ${doc.date}
Provider Signature: Dr. Sarah Jenkins    Date: ${doc.date}
Witness: _____________________________ Date: ${doc.date}`;
    }

    if (doc.type === 'External Records') {
      return `EXTERNAL RECORDS — RECEIVED
Document: ${doc.title}
Date Received: ${doc.date}
Source: ${doc.author}
Patient: ${patient?.name}

[External records received and scanned into chart. Reviewed by Dr. Sarah Jenkins.]

Summary of relevant history from external provider:
• Previous psychiatric diagnoses confirmed
• Prior medication trials documented
• No prior hospitalizations noted
• Patient in therapy with previous provider for approximately 18 months

Records reviewed and integrated into clinical assessment.

——————————————————————
Reviewed by: Dr. Sarah Jenkins, MD
Date of Review: ${doc.date}`;
    }

    return `DOCUMENT: ${doc.title}\nType: ${doc.type}\nDate: ${doc.date}\nAuthor: ${doc.author}\n\n[Document content on file]`;
  };

  return (
    <div className="pb-12">
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-surface-container-low to-surface px-8 py-8 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              {patient.image ? (
                <img src={patient.image} alt={patient.name} className="w-24 h-24 rounded-2xl object-cover shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl shadow-sm">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-tertiary text-white p-1.5 rounded-lg shadow-lg">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="font-headline font-bold text-4xl text-on-surface tracking-tight">{patient.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-on-surface-variant font-label text-sm">
                <span><span className="font-semibold text-primary">MRN:</span> {patient.mrn}</span>
                <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                <span><span className="font-semibold text-primary">DOB:</span> {patient.dob}</span>
                <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                <span><span className="font-semibold text-primary">Age:</span> {patient.age}</span>
                <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                <span><span className="font-semibold text-primary">Gender:</span> {patient.gender}</span>
                {patient.insurance && (
                  <>
                    <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                    <span><span className="font-semibold text-primary">Ins:</span> {patient.insurance}</span>
                  </>
                )}
              </div>
              <div className="pt-2 flex flex-wrap gap-2">
                {patient.allergies.map((allergy, idx) => (
                  <span key={idx} className={`${allergy === 'None Known' ? 'bg-surface-container-high text-on-surface-variant' : 'bg-error-container text-on-error-container'} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                    {allergy !== 'None Known' && <span className="material-symbols-outlined text-xs">warning</span>}
                    ALLERGY: {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isHighRisk && (
              <div className="bg-error-container/30 border-l-4 border-error p-4 rounded-r-xl max-w-sm">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>crisis_alert</span>
                  <div>
                    <h4 className="text-on-error-container font-bold text-xs uppercase tracking-wider">Critical Alert</h4>
                    <p className="text-sm text-on-error-container/90 leading-tight mt-1">High Risk Patient. {patient.suicidalIdeation}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowOrderModal(true)} className="px-3 py-2 bg-surface-container-lowest text-on-surface text-sm font-bold rounded-xl border border-outline-variant/20 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                New Order
              </button>
              <button onClick={() => onViewChange('superbill')} className="px-3 py-2 bg-surface-container-lowest text-on-surface text-sm font-bold rounded-xl border border-outline-variant/20 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">receipt_long</span>
                Superbill
              </button>
              <button onClick={() => onViewChange('new_note')} className="px-3 py-2 signature-gradient text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">note_add</span>
                New Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 border-b border-outline-variant/10 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex gap-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 py-4 text-sm tracking-wide transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant font-medium hover:text-primary'
              }`}
            >
              {tab}
              {tab === 'Labs' && patientLabs.some(l => l.flag !== 'Normal') && (
                <span className="ml-1.5 w-2 h-2 bg-error rounded-full inline-block" />
              )}
              {tab === 'Vitals' && patientVitals.length > 0 && (
                <span className="ml-1.5 text-[10px] font-bold text-on-surface-variant">({patientVitals.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* ── Summary Tab ── */}
        {activeTab === 'Summary' ? (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {careGaps.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#7c5700]" style={{fontVariationSettings:"'FILL' 1"}}>warning</span>
                    Care Gaps ({careGaps.length})
                  </h3>
                  <div className="space-y-1.5">
                    {careGaps.map((gap, i) => (
                      <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs ${gap.urgent ? 'bg-error/8 border border-error/20' : 'bg-[#7c5700]/8 border border-[#7c5700]/20'}`}>
                        <span className={`material-symbols-outlined text-sm flex-shrink-0 ${gap.urgent ? 'text-error' : 'text-[#7c5700]'}`} style={{fontVariationSettings:"'FILL' 1"}}>{gap.icon}</span>
                        <div>
                          <p className={`font-bold ${gap.urgent ? 'text-error' : 'text-[#7c5700]'}`}>{gap.label}</p>
                          <p className="text-on-surface-variant">{gap.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">medication</span>
                    </div>
                    <h3 className="font-headline font-bold text-lg text-on-surface">Current Medications</h3>
                  </div>
                  <button onClick={() => onViewChange('eprescribing')} className="text-primary font-bold text-sm hover:underline">Manage Meds</button>
                </div>
                <div className="space-y-3">
                  {patientMeds.length === 0 ? (
                    <p className="text-sm text-on-surface-variant italic">No active medications.</p>
                  ) : (
                    patientMeds.map(med => (
                      <div key={med.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary font-bold shadow-sm">
                            {med.dose.match(/\d+/)?.[0] || 'Rx'}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{med.name}</p>
                            <p className="text-xs text-on-surface-variant">{med.dose} · {med.sig}</p>
                          </div>
                        </div>
                        <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-xs font-semibold">Active</span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary-container p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">description</span>
                    </div>
                    <h3 className="font-headline font-bold text-lg text-on-surface">Recent Progress Notes</h3>
                  </div>
                  <button onClick={() => onViewChange('new_note')} className="text-primary font-bold text-sm hover:underline">+ Add Note</button>
                </div>
                <div className="space-y-6">
                  {patientNotes.length === 0 ? (
                    <p className="text-sm text-on-surface-variant italic">No recent notes.</p>
                  ) : (
                    patientNotes.slice(0, 3).map(note => (
                      <div key={note.id} className="relative pl-6 border-l-2 border-outline-variant/20 space-y-2">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-primary uppercase">{new Date(note.date).toLocaleDateString()} · {note.type}</span>
                          <span className="text-xs text-on-surface-variant">By: {note.author}</span>
                        </div>
                        <p className="text-sm text-on-surface leading-relaxed line-clamp-2">{note.subjective}</p>
                        <details className="group">
                          <summary className="text-xs font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors list-none">
                            Read Full Note <span className="group-open:rotate-180 inline-block transition-transform">▾</span>
                          </summary>
                          <div className="mt-3 space-y-2 bg-surface-container-low rounded-xl p-4 text-xs text-on-surface">
                            <p><strong>S:</strong> {note.subjective}</p>
                            <p><strong>A:</strong> {note.assessment}</p>
                            <p><strong>P:</strong> {note.plan}</p>
                          </div>
                        </details>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <section className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10">
                <div className="bg-primary px-6 py-4">
                  <h3 className="font-headline font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
                    Risk Assessment
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-label text-sm font-medium text-on-surface-variant">Suicidal Ideation</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        patient.suicidalIdeation.includes('Active') ? 'bg-error text-white' : 'bg-secondary-container text-on-secondary-fixed-variant'
                      }`}>
                        {patient.suicidalIdeation}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                      <div className={`h-full ${
                        patient.riskScore === 'Severe' ? 'bg-error w-full' :
                        patient.riskScore === 'High' ? 'bg-error w-3/4' :
                        patient.riskScore === 'Moderate' ? 'bg-tertiary w-1/2' :
                        'bg-primary w-1/4'
                      }`}></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Global Risk Score</span>
                      <span className={`text-2xl font-headline font-extrabold ${
                        patient.riskScore === 'Severe' || patient.riskScore === 'High' ? 'text-error' : 'text-primary'
                      }`}>{patient.riskScore}</span>
                    </div>
                  </div>

                  {/* Safety Plan button for high-risk patients */}
                  {isHighRisk && (
                    <button
                      onClick={handleOpenSafetyPlan}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        existingSafetyPlan
                          ? 'bg-tertiary/10 text-tertiary hover:bg-tertiary/20 border border-tertiary/30'
                          : 'bg-error/10 text-error hover:bg-error/15 border border-error/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {existingSafetyPlan ? 'task_alt' : 'emergency_home'}
                      </span>
                      {existingSafetyPlan ? 'View / Update Safety Plan' : 'Create Safety Plan'}
                    </button>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-2xl p-6 border border-outline-variant/10">
                <h3 className="font-headline font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">assignment_late</span>
                  Active Diagnoses
                </h3>
                <div className="flex flex-col gap-2">
                  {patient.diagnoses.map((dx, idx) => (
                    <div key={idx} className="p-3 bg-surface-container-low rounded-xl flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${dx.severity === 'Severe' ? 'bg-error' : 'bg-primary'}`}></div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{dx.code} — {dx.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-tighter">{dx.severity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Most recent vitals snapshot */}
              {patientVitals.length > 0 && (
                <section className="bg-white rounded-2xl p-6 border border-outline-variant/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">monitor_heart</span>
                      Latest Vitals
                    </h3>
                    <button onClick={() => setActiveTab('Vitals')} className="text-xs font-bold text-primary hover:underline">View All</button>
                  </div>
                  {(() => {
                    const v = patientVitals[0];
                    const bp = bpCategory(v.bpSystolic, v.bpDiastolic);
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        {v.bpSystolic && v.bpDiastolic && (
                          <div className="p-3 bg-surface-container-low rounded-xl">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Blood Pressure</p>
                            <p className="text-lg font-bold text-on-surface">{v.bpSystolic}/{v.bpDiastolic}</p>
                            <p className={`text-[10px] ${bp.color}`}>{bp.label}</p>
                          </div>
                        )}
                        {v.heartRate && (
                          <div className="p-3 bg-surface-container-low rounded-xl">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Heart Rate</p>
                            <p className="text-lg font-bold text-on-surface">{v.heartRate} <span className="text-xs font-normal">bpm</span></p>
                          </div>
                        )}
                        {v.weight && (
                          <div className="p-3 bg-surface-container-low rounded-xl">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Weight</p>
                            <p className="text-lg font-bold text-on-surface">{v.weight} <span className="text-xs font-normal">lbs</span></p>
                          </div>
                        )}
                        {v.bmi && (
                          <div className="p-3 bg-surface-container-low rounded-xl">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">BMI</p>
                            <p className="text-lg font-bold text-on-surface">{v.bmi.toFixed(1)}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <p className="text-[10px] text-on-surface-variant mt-3">Recorded: {patientVitals[0].date}</p>
                </section>
              )}

              {patient.phone && (
                <section className="bg-white rounded-2xl p-6 border border-outline-variant/10">
                  <h3 className="font-headline font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">contact_phone</span>
                    Contact
                  </h3>
                  <div className="space-y-2 text-sm">
                    {patient.phone && <p className="flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-sm">call</span>{patient.phone}</p>}
                    {patient.email && <p className="flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-sm">mail</span>{patient.email}</p>}
                    {patient.provider && <p className="flex items-center gap-2 text-on-surface-variant"><span className="material-symbols-outlined text-sm">stethoscope</span>{patient.provider}</p>}
                  </div>
                </section>
              )}
            </div>
          </div>

        ) : activeTab === 'Demographics' ? (
          <div className="space-y-4">
            {/* Insurance */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary" style={{fontVariationSettings:"'FILL' 1"}}>health_and_safety</span>
                Insurance & Coverage
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Insurance Plan</p>
                  <p className="font-medium text-on-surface">{patient.insurance ?? 'Not on file'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Member ID</p>
                  <p className="font-medium text-on-surface font-mono">{patient.memberId ?? 'Not on file'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Group Number</p>
                  <p className="font-medium text-on-surface font-mono">{patient.groupNumber ?? 'Not on file'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Coverage Type</p>
                  <p className="font-medium text-on-surface">{patient.insurance?.includes('Medicare') || patient.insurance?.includes('Medicaid') ? 'Government' : 'Commercial'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Copay (Est.)</p>
                  <p className="font-medium text-on-surface">{patient.insurance?.includes('Medicaid') ? '$0' : patient.insurance?.includes('Medicare') ? '$20 – $40' : '$30 – $50'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Eligibility Status</p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary inline-block"></span>
                    Verified {new Date().toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}
                  </span>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary" style={{fontVariationSettings:"'FILL' 1"}}>person</span>
                Patient Information
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Date of Birth</p>
                  <p className="font-medium text-on-surface">{new Date(patient.dob + 'T00:00:00').toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'})}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Age</p>
                  <p className="font-medium text-on-surface">{patient.age}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Gender</p>
                  <p className="font-medium text-on-surface">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Pronouns</p>
                  <p className="font-medium text-on-surface">{patient.pronouns ?? 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Phone</p>
                  <p className="font-medium text-on-surface">{patient.phone ?? 'Not on file'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Email</p>
                  <p className="font-medium text-on-surface">{patient.email ?? 'Not on file'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">MRN</p>
                  <p className="font-medium text-on-surface font-mono">{patient.mrn}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact & PCP */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-error" style={{fontVariationSettings:"'FILL' 1"}}>emergency</span>
                  Emergency Contact
                </h3>
                {patient.emergencyContact ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Name</p>
                      <p className="font-medium text-on-surface">{patient.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Relationship</p>
                      <p className="font-medium text-on-surface">{patient.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Phone</p>
                      <p className="font-medium text-on-surface">{patient.emergencyContact.phone}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant italic">Not on file</p>
                )}
              </div>

              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary" style={{fontVariationSettings:"'FILL' 1"}}>stethoscope</span>
                  Primary Care Provider
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Provider</p>
                    <p className="font-medium text-on-surface">{patient.primaryCare ?? 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Preferred Pharmacy</p>
                    <p className="font-medium text-on-surface">{patient.preferredPharmacy ?? 'Not on file'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-error" style={{fontVariationSettings:"'FILL' 1"}}>medication_liquid</span>
                Allergies & Adverse Reactions
              </h3>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-error/8 border border-error/20 rounded-xl text-xs">
                    <span className="material-symbols-outlined text-sm text-error" style={{fontVariationSettings:"'FILL' 1"}}>warning</span>
                    <span className="font-medium text-error">{a}</span>
                  </div>
                ))}
                {patient.allergies.length === 0 && <p className="text-sm text-on-surface-variant italic">No known allergies</p>}
              </div>
            </div>
          </div>

        ) : activeTab === 'Outcomes' ? (
          <PatientOutcomes />

        ) : activeTab === 'Timeline' ? (
          <div className="max-w-3xl mx-auto space-y-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-on-surface-variant">{timelineEvents.length} events across all records</p>
            </div>
            {timelineEvents.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/10 border-dashed">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">timeline</span>
                <p className="text-on-surface-variant font-medium">No timeline events yet.</p>
              </div>
            ) : (
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-outline-variant/20"></div>
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative mb-6">
                    <div className={`absolute -left-5 top-3 w-4 h-4 rounded-full border-2 border-white ${event.bg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-[10px] ${event.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{event.icon}</span>
                    </div>
                    <div
                      className={`bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 hover:shadow-sm transition-shadow ${event.type === 'Note' ? 'cursor-pointer hover:bg-surface-container-low/30' : ''}`}
                      onClick={() => {
                        if (event.type === 'Note') {
                          const note = patientNotes.find(n => n.date === event.date && n.type === event.title);
                          if (note) { setSelectedNote(note); setShowNoteModal(true); }
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${event.bg} ${event.color}`}>{event.type}</span>
                            <span className="text-xs text-on-surface-variant">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <p className="font-bold text-sm text-on-surface">{event.title}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{event.detail}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        ) : activeTab === 'Labs' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-on-surface-variant">{patientLabs.length} lab result{patientLabs.length !== 1 ? 's' : ''}</p>
              <button
                onClick={() => setShowOrderModal(true)}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Order Lab
              </button>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Test Name</th>
                    <th className="px-6 py-4">Result</th>
                    <th className="px-6 py-4">Ref Range</th>
                    <th className="px-6 py-4">Flag</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {patientLabs.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">No lab results found.</td></tr>
                  ) : (
                    patientLabs.map(lab => (
                      <tr key={lab.id} className="hover:bg-surface-container-low/50">
                        <td className="px-6 py-4 text-on-surface-variant">{lab.date}</td>
                        <td className="px-6 py-4 font-medium text-on-surface">{lab.testName}</td>
                        <td className="px-6 py-4">{lab.result} {lab.unit}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{lab.referenceRange || '—'}</td>
                        <td className="px-6 py-4">
                          {lab.flag !== 'Normal' ? (
                            <span className={`px-2 py-1 rounded text-xs font-bold ${lab.flag === 'Critical' ? 'bg-error text-white' : 'bg-error-container text-on-error-container'}`}>{lab.flag}</span>
                          ) : (
                            <span className="text-on-surface-variant text-xs">Normal</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${lab.status === 'Pending' ? 'bg-secondary-container text-on-secondary-fixed-variant' : lab.status === 'In Progress' ? 'bg-tertiary/10 text-tertiary' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'}`}>
                            {lab.status ?? 'Resulted'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        ) : activeTab === 'Vitals' ? (
          /* ── Vitals Tab ── */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-on-surface-variant">{patientVitals.length} vitals record{patientVitals.length !== 1 ? 's' : ''}</p>
              <button
                onClick={() => setShowVitalsModal(true)}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Record Vitals
              </button>
            </div>

            {patientVitals.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center bg-surface-container-lowest rounded-2xl border border-outline-variant/10 border-dashed">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">monitor_heart</span>
                <p className="font-medium text-on-surface-variant">No vitals recorded yet.</p>
                <button onClick={() => setShowVitalsModal(true)} className="mt-4 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all">
                  Record First Vitals
                </button>
              </div>
            ) : (
              <>
                {/* Trend cards for most recent */}
                {(() => {
                  const v = patientVitals[0];
                  const bp = bpCategory(v.bpSystolic, v.bpDiastolic);
                  const prev = patientVitals[1];
                  const weightDelta = prev?.weight && v.weight ? (v.weight - prev.weight).toFixed(1) : null;
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        {
                          label: 'Blood Pressure',
                          value: v.bpSystolic && v.bpDiastolic ? `${v.bpSystolic}/${v.bpDiastolic}` : '—',
                          unit: 'mmHg',
                          icon: 'favorite',
                          status: bp.label,
                          statusColor: bp.color,
                        },
                        {
                          label: 'Heart Rate',
                          value: v.heartRate ?? '—',
                          unit: 'bpm',
                          icon: 'ecg_heart',
                          status: v.heartRate ? (v.heartRate > 100 ? 'Tachycardia' : v.heartRate < 60 ? 'Bradycardia' : 'Normal') : '',
                          statusColor: v.heartRate && (v.heartRate > 100 || v.heartRate < 60) ? 'text-[#7c5700]' : 'text-tertiary',
                        },
                        {
                          label: 'Weight',
                          value: v.weight ?? '—',
                          unit: 'lbs',
                          icon: 'scale',
                          status: weightDelta ? `${parseFloat(weightDelta) > 0 ? '+' : ''}${weightDelta} from last visit` : 'First record',
                          statusColor: 'text-on-surface-variant',
                        },
                        {
                          label: 'BMI',
                          value: v.bmi ? v.bmi.toFixed(1) : calcBMI(v.weight, v.height),
                          unit: 'kg/m²',
                          icon: 'accessibility_new',
                          status: (() => {
                            const b = parseFloat(String(v.bmi ?? calcBMI(v.weight, v.height)));
                            if (isNaN(b)) return '';
                            if (b < 18.5) return 'Underweight';
                            if (b < 25) return 'Normal';
                            if (b < 30) return 'Overweight';
                            return 'Obese';
                          })(),
                          statusColor: 'text-on-surface-variant',
                        },
                      ].map(card => (
                        <div key={card.label} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{card.label}</p>
                          </div>
                          <p className="text-2xl font-bold text-on-surface">{card.value}</p>
                          <p className="text-xs text-on-surface-variant">{card.unit}</p>
                          {card.status && <p className={`text-xs font-semibold mt-2 ${card.statusColor}`}>{card.status}</p>}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Vitals history table */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30">
                    <h3 className="font-headline font-bold text-on-surface">Vitals History</h3>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">BP (mmHg)</th>
                        <th className="px-6 py-3">HR (bpm)</th>
                        <th className="px-6 py-3">Weight (lbs)</th>
                        <th className="px-6 py-3">BMI</th>
                        <th className="px-6 py-3">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {patientVitals.map(v => {
                        const bp = bpCategory(v.bpSystolic, v.bpDiastolic);
                        return (
                          <tr key={v.id} className="hover:bg-surface-container-low/50">
                            <td className="px-6 py-4 text-on-surface-variant font-medium">{v.date}</td>
                            <td className="px-6 py-4">
                              {v.bpSystolic && v.bpDiastolic ? (
                                <span>
                                  <span className="font-medium text-on-surface">{v.bpSystolic}/{v.bpDiastolic}</span>
                                  <span className={`ml-2 text-[10px] font-bold ${bp.color}`}>{bp.label}</span>
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-6 py-4 text-on-surface">{v.heartRate ?? '—'}</td>
                            <td className="px-6 py-4 text-on-surface">{v.weight ?? '—'}</td>
                            <td className="px-6 py-4 text-on-surface">{v.bmi ? v.bmi.toFixed(1) : calcBMI(v.weight, v.height)}</td>
                            <td className="px-6 py-4 text-on-surface-variant text-xs">{v.recordedBy ?? 'Clinical Staff'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

        ) : activeTab === 'Orders' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-on-surface-variant">{patientOrders.length} order{patientOrders.length !== 1 ? 's' : ''}</p>
              <button
                onClick={() => setShowOrderModal(true)}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                New Order
              </button>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Ordered By</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {patientOrders.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">No orders found.</td></tr>
                  ) : (
                    patientOrders.map(order => (
                      <tr key={order.id} className="hover:bg-surface-container-low/50">
                        <td className="px-6 py-4 text-on-surface-variant">{order.date}</td>
                        <td className="px-6 py-4 font-medium text-on-surface">{order.type}</td>
                        <td className="px-6 py-4">{order.description}</td>
                        <td className="px-6 py-4 text-on-surface-variant text-xs">{order.orderedBy ?? 'Dr. Sarah Jenkins'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            order.status === 'Completed' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' :
                            order.status === 'Cancelled' ? 'bg-error/10 text-error' :
                            'bg-secondary-container text-on-secondary-fixed-variant'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        ) : activeTab === 'Documents' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patientDocs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-on-surface-variant">No documents found.</div>
            ) : (
              patientDocs.map(doc => (
                <div key={doc.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-surface-container-low/50 transition-colors" onClick={() => { setSelectedDoc(doc); setShowDocModal(true); }}>
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">{doc.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">{doc.type} · {doc.date}</p>
                    <p className="text-[10px] text-on-surface-variant mt-2">By: {doc.author}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>

      {/* ── New Order Modal ── */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline font-bold text-on-surface">New Order</h2>
              <button onClick={() => setShowOrderModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {orderSubmitted ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-5xl text-tertiary mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="font-bold text-on-surface">Order Submitted!</p>
                <p className="text-sm text-on-surface-variant mt-1">Navigating to Orders tab...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Order Type</label>
                  <div className="flex gap-2">
                    {['Lab', 'Referral', 'Imaging', 'Other'].map(t => (
                      <button
                        key={t}
                        onClick={() => setOrderForm({ ...orderForm, type: t, description: '' })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors border ${
                          orderForm.type === t
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-highest'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    {orderForm.type === 'Lab' ? 'Test Name' : 'Description'}
                  </label>
                  {orderForm.type === 'Lab' ? (
                    <select
                      value={orderForm.description}
                      onChange={e => setOrderForm({ ...orderForm, description: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select lab test...</option>
                      {LAB_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={`Enter ${orderForm.type.toLowerCase()} details...`}
                      value={orderForm.description}
                      onChange={e => setOrderForm({ ...orderForm, description: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Priority</label>
                  <div className="flex gap-2">
                    {['Routine', 'Urgent', 'STAT'].map(p => (
                      <button
                        key={p}
                        onClick={() => setOrderForm({ ...orderForm, priority: p })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors border ${
                          orderForm.priority === p
                            ? p === 'STAT' ? 'bg-error text-white border-error'
                              : p === 'Urgent' ? 'bg-error/10 text-error border-error/30'
                              : 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-highest'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOrderSubmit}
                    disabled={!orderForm.description}
                    className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
                  >
                    Submit Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add Vitals Modal ── */}
      {showVitalsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-headline font-bold text-on-surface">Record Vitals</h2>
                <p className="text-sm text-on-surface-variant mt-0.5">{patient.name} · {new Date().toLocaleDateString()}</p>
              </div>
              <button onClick={() => setShowVitalsModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Weight (lbs)</label>
                  <input
                    type="number"
                    placeholder="e.g. 165"
                    value={vitalsForm.weight}
                    onChange={e => setVitalsForm({ ...vitalsForm, weight: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Height (inches)</label>
                  <input
                    type="number"
                    placeholder="e.g. 68"
                    value={vitalsForm.height}
                    onChange={e => setVitalsForm({ ...vitalsForm, height: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Blood Pressure (mmHg)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Systolic"
                    value={vitalsForm.bpSystolic}
                    onChange={e => setVitalsForm({ ...vitalsForm, bpSystolic: e.target.value })}
                    className="flex-1 bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-on-surface-variant font-bold text-lg">/</span>
                  <input
                    type="number"
                    placeholder="Diastolic"
                    value={vitalsForm.bpDiastolic}
                    onChange={e => setVitalsForm({ ...vitalsForm, bpDiastolic: e.target.value })}
                    className="flex-1 bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {vitalsForm.bpSystolic && vitalsForm.bpDiastolic && (() => {
                  const bp = bpCategory(parseInt(vitalsForm.bpSystolic), parseInt(vitalsForm.bpDiastolic));
                  return <p className={`text-xs font-semibold mt-1.5 ${bp.color}`}>Category: {bp.label}</p>;
                })()}
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Heart Rate (bpm)</label>
                <input
                  type="number"
                  placeholder="e.g. 72"
                  value={vitalsForm.heartRate}
                  onChange={e => setVitalsForm({ ...vitalsForm, heartRate: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {vitalsForm.weight && vitalsForm.height && (
                <div className="bg-primary/5 rounded-xl px-4 py-3 border border-primary/20 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-sm">calculate</span>
                  <p className="text-sm text-on-surface">Calculated BMI: <span className="font-bold">{calcBMI(parseFloat(vitalsForm.weight), parseFloat(vitalsForm.height))}</span></p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Notes (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Any relevant observations..."
                  value={vitalsForm.notes}
                  onChange={e => setVitalsForm({ ...vitalsForm, notes: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowVitalsModal(false)}
                  className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVitalsSave}
                  className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  Save Vitals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Viewer Modal ── */}
      {showDocModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowDocModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-outline-variant/10 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-headline font-bold text-on-surface">{selectedDoc.title}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{selectedDoc.type} · {selectedDoc.date} · {selectedDoc.author}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addToast({ type: 'info', title: 'Printing…', message: `${selectedDoc.title} sent to printer.` })}
                  className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                </button>
                <button onClick={() => setShowDocModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <pre className="text-xs font-mono text-on-surface leading-relaxed whitespace-pre-wrap bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                {getDocumentContent(selectedDoc)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ── Note Detail Modal ── */}
      {showNoteModal && selectedNote && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNoteModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-outline-variant/10 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-headline font-bold text-on-surface">{selectedNote.type}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{selectedNote.date} · {selectedNote.author}</p>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Subjective</h4>
                <p className="text-sm text-on-surface leading-relaxed bg-surface-container-low rounded-xl p-4">{selectedNote.subjective}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Objective / Mental Status</h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(selectedNote.objective as Record<string, boolean>).map(([key, val]) => (
                    <div key={key} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium ${val ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{val ? 'check_circle' : 'cancel'}</span>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Assessment</h4>
                <p className="text-sm text-on-surface leading-relaxed bg-surface-container-low rounded-xl p-4">{selectedNote.assessment}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Plan</h4>
                <p className="text-sm text-on-surface leading-relaxed bg-surface-container-low rounded-xl p-4">{selectedNote.plan}</p>
              </div>
              {selectedNote.billing && (
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Billing</h4>
                  <div className="bg-surface-container-low rounded-xl p-4 flex gap-4 text-sm">
                    <span><span className="text-on-surface-variant text-xs">CPT:</span> <span className="font-bold">{selectedNote.billing.cptCode}</span></span>
                    <span><span className="text-on-surface-variant text-xs">ICD-10:</span> <span className="font-bold">{selectedNote.billing.icd10Codes?.join(', ')}</span></span>
                  </div>
                </div>
              )}
              <div className="pt-3 border-t border-outline-variant/10">
                <p className="text-xs text-on-surface-variant text-center">✓ Signed by {selectedNote.author} on {selectedNote.date}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Safety Plan Modal ── */}
      {showSafetyPlan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-outline-variant/10 sticky top-0 bg-surface rounded-t-2xl z-10">
              <div>
                <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_home</span>
                  Safety Plan
                </h2>
                <p className="text-sm text-on-surface-variant mt-0.5">{patient.name} · Stanley-Brown Collaborative Safety Planning</p>
              </div>
              <button onClick={() => setShowSafetyPlan(false)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors flex-shrink-0">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {spSaved ? (
              <div className="py-16 text-center px-8">
                <span className="material-symbols-outlined text-6xl text-tertiary mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                <p className="font-bold text-xl text-on-surface">Safety Plan Saved</p>
                <p className="text-sm text-on-surface-variant mt-2">The plan has been documented and signed.</p>
              </div>
            ) : (
              <div className="px-8 py-6 space-y-8">
                {/* Step 1 */}
                <section>
                  <h3 className="font-headline font-bold text-on-surface mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-error/10 text-error text-xs font-bold flex items-center justify-center">1</span>
                    Warning Signs
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3">Signs that a crisis may be developing (one per line)</p>
                  <textarea
                    rows={3}
                    placeholder={"e.g. Increased isolation\nRuminating on hopelessness\nStopping medications"}
                    value={spForm.warningSigns}
                    onChange={e => setSpForm({ ...spForm, warningSigns: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </section>

                {/* Step 2 */}
                <section>
                  <h3 className="font-headline font-bold text-on-surface mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                    Internal Coping Strategies
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3">Things patient can do alone to take mind off distress</p>
                  <textarea
                    rows={3}
                    placeholder={"e.g. Deep breathing exercises\nGo for a walk\nListen to music"}
                    value={spForm.internalCoping}
                    onChange={e => setSpForm({ ...spForm, internalCoping: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </section>

                {/* Step 3 */}
                <section>
                  <h3 className="font-headline font-bold text-on-surface mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold flex items-center justify-center">3</span>
                    Social Distraction
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3">People or places that take mind off crisis</p>
                  <div className="space-y-2">
                    {[{ name: 'socialName1', phone: 'socialPhone1', label: 'Contact 1' }, { name: 'socialName2', phone: 'socialPhone2', label: 'Contact 2' }].map(row => (
                      <div key={row.label} className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder={`${row.label} name`}
                          value={spForm[row.name as keyof typeof spForm] as string}
                          onChange={e => setSpForm({ ...spForm, [row.name]: e.target.value })}
                          className="bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={spForm[row.phone as keyof typeof spForm] as string}
                          onChange={e => setSpForm({ ...spForm, [row.phone]: e.target.value })}
                          className="bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Step 4 */}
                <section>
                  <h3 className="font-headline font-bold text-on-surface mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-error/10 text-error text-xs font-bold flex items-center justify-center">4</span>
                    Crisis Contacts
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3">People to contact if in crisis</p>
                  <div className="space-y-2">
                    {[
                      { name: 'crisisName1', phone: 'crisisPhone1', rel: 'crisisRel1', label: 'Contact 1' },
                      { name: 'crisisName2', phone: 'crisisPhone2', rel: 'crisisRel2', label: 'Contact 2' },
                    ].map(row => (
                      <div key={row.label} className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder={`${row.label} name`}
                          value={spForm[row.name as keyof typeof spForm] as string}
                          onChange={e => setSpForm({ ...spForm, [row.name]: e.target.value })}
                          className="bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={spForm[row.phone as keyof typeof spForm] as string}
                          onChange={e => setSpForm({ ...spForm, [row.phone]: e.target.value })}
                          className="bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="text"
                          placeholder="Relationship"
                          value={spForm[row.rel as keyof typeof spForm] as string}
                          onChange={e => setSpForm({ ...spForm, [row.rel]: e.target.value })}
                          className="bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    ))}
                  </div>

                  {/* 988 Lifeline always-present */}
                  <div className="mt-3 p-3 bg-error/5 rounded-xl border border-error/20 flex items-center gap-3">
                    <span className="material-symbols-outlined text-error text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_home</span>
                    <div>
                      <p className="text-xs font-bold text-error">988 Suicide & Crisis Lifeline</p>
                      <p className="text-xs text-on-surface-variant">Call or text 988 · Available 24/7</p>
                    </div>
                  </div>
                </section>

                {/* Step 5 - Professional */}
                <section>
                  <h3 className="font-headline font-bold text-on-surface mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">5</span>
                    Professional / Agency Contact
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={spForm.professionalName}
                      onChange={e => setSpForm({ ...spForm, professionalName: e.target.value })}
                      className="bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={spForm.professionalPhone}
                      onChange={e => setSpForm({ ...spForm, professionalPhone: e.target.value })}
                      className="bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      type="text"
                      placeholder="Hours available"
                      value={spForm.professionalAvail}
                      onChange={e => setSpForm({ ...spForm, professionalAvail: e.target.value })}
                      className="bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </section>

                {/* Step 6 - Means Restriction */}
                <section>
                  <h3 className="font-headline font-bold text-on-surface mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-error/10 text-error text-xs font-bold flex items-center justify-center">6</span>
                    Means Restriction
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3">How will access to lethal means be restricted?</p>
                  <input
                    type="text"
                    placeholder="e.g. Firearms secured with family member; medications locked in safe"
                    value={spForm.meansRestriction}
                    onChange={e => setSpForm({ ...spForm, meansRestriction: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </section>

                {/* Reasons for Living */}
                <section>
                  <h3 className="font-headline font-bold text-on-surface mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    Reasons for Living
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3">Patient's own reasons to stay alive (one per line)</p>
                  <textarea
                    rows={3}
                    placeholder={"e.g. My children\nMy dog\nHope that things will improve"}
                    value={spForm.reasonsForLiving}
                    onChange={e => setSpForm({ ...spForm, reasonsForLiving: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </section>

                {/* Signatures */}
                <section className="bg-surface-container-low rounded-2xl p-5">
                  <h3 className="font-headline font-bold text-on-surface mb-4">Signatures</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={spForm.signedByPatient}
                        onChange={e => setSpForm({ ...spForm, signedByPatient: e.target.checked })}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <div>
                        <p className="text-sm font-bold text-on-surface">Patient Signature</p>
                        <p className="text-xs text-on-surface-variant">Patient acknowledges and agrees to the safety plan</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={spForm.signedByProvider}
                        onChange={e => setSpForm({ ...spForm, signedByProvider: e.target.checked })}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <div>
                        <p className="text-sm font-bold text-on-surface">Provider Signature — Dr. Sarah Jenkins, MD</p>
                        <p className="text-xs text-on-surface-variant">Provider attests to collaborative completion of this plan</p>
                      </div>
                    </label>
                  </div>
                </section>

                {/* Action buttons */}
                <div className="flex gap-3 pb-2">
                  <button
                    onClick={() => setShowSafetyPlan(false)}
                    className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSafetyPlanSave}
                    className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    Save Safety Plan
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
