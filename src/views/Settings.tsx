import React, { useState } from 'react';
import { ViewType } from '../App';
import { useToast } from '../context/ToastContext';

interface SettingsProps {
  onViewChange: (view: ViewType) => void;
}

export default function Settings({ onViewChange }: SettingsProps) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('Profile');
  const [profile, setProfile] = useState({
    firstName: 'Sarah',
    lastName: 'Jenkins',
    credentials: 'MD',
    npi: '1234567890',
    specialty: 'Psychiatry',
    dea: 'BJ1234563',
    stateLicense: 'WA-MD-45821',
    email: 'dr.jenkins@psychiatrycare.com',
    phone: '(206) 555-0100',
    clinicName: 'Psychiatry Care Associates',
    clinicAddress: '800 5th Ave, Suite 400, Seattle, WA 98104',
    defaultNoteType: 'Progress Note',
    defaultCPT: '99214',
    signatureText: 'Sarah Jenkins, MD\nBoard Certified Psychiatrist\nNPI: 1234567890',
  });
  const [notifications, setNotifications] = useState({
    labResults: true,
    messages: true,
    appointments: true,
    priorAuth: true,
    riskAlerts: true,
    refillRequests: true,
    emailSummary: false,
    smsAlerts: false,
  });
  const [templates, setTemplates] = useState([
    { id: 'tmpl1', name: 'Standard Follow-up (Psychiatry)',  type: 'Progress Note',     isDefault: true,  body: 'S: Patient reports [mood/sleep/appetite/energy]. Current medications tolerated [well/poorly]. [Specific complaints or improvements noted].\n\nO: Alert and oriented. Appearance [appropriate/disheveled]. Affect [appropriate/flat/labile/constricted]. Thought process [linear/circumstantial/tangential]. Insight [intact/limited/poor].\n\nA: [Diagnoses] — [stable/improved/worsening]. [Clinical reasoning].\n\nP: 1. Continue current medications.\n2. RTC in [X] weeks.\n3. [Additional plan items].' },
    { id: 'tmpl2', name: 'Initial Intake — Adult Psychiatry', type: 'Intake',            isDefault: false, body: 'CC: [Chief complaint in patient\'s own words]\n\nHPI: [Patient name] is a [age]yo [gender] presenting for initial psychiatric evaluation. [History of present illness, onset, duration, severity, associated symptoms].\n\nPsychiatric History: [Previous diagnoses, hospitalizations, outpatient treatment, medications tried]\n\nSubstance Use: [Current and past use, CAGE/AUDIT scores]\n\nFamily History: [Psychiatric and medical family history]\n\nSocial History: [Living situation, employment, support system, trauma history]\n\nMSE: [Mental status examination]\n\nA/P: [Assessment and plan]' },
    { id: 'tmpl3', name: 'Med Check (Brief)',                 type: 'Med Check',         isDefault: false, body: 'S: [Patient name] returns for medication management. Reports [overall status]. Side effects: [none/list]. Adherence: [good/fair/poor — reason if non-adherent].\n\nO: [Brief MSE — appearance, affect, cognition]\n\nA: [Diagnoses] — [response to current regimen].\n\nP: 1. [Continue/adjust medications — list changes]\n2. Labs: [ordered/reviewed/not indicated]\n3. RTC [timeframe].' },
    { id: 'tmpl4', name: 'Crisis Assessment',                type: 'Safety Assessment', isDefault: false, body: 'Reason for Crisis Contact: [Precipitating event or concern]\n\nSuicidal Ideation: [Active/passive/none]. Frequency: []. Intensity: []. Duration: [].\nPlan: [Yes/No — describe if yes]. Means access: [Yes/No].\nIntent: [Yes/No]. Preparatory behavior: [Yes/No].\n\nHomicidal Ideation: [Yes/No]\n\nProtective Factors: [Reasons for living, future orientation, support system]\n\nRisk Level: [Low/Moderate/High/Severe]\n\nDisposition: [Safety plan reviewed/updated. Crisis resources provided. [IOP/ED/inpatient] referral [placed/not needed]. RTC [timeframe].]' },
    { id: 'tmpl5', name: 'Discharge Summary',                type: 'Discharge',         isDefault: false, body: 'Admission Date: []\nDischarge Date: []\nAdmitting Diagnosis: []\nDischarge Diagnosis: []\n\nHospital Course: [Summary of treatment, response, and clinical decision-making]\n\nDischarge Medications: [List all medications with doses and instructions]\n\nDischarge Instructions: [Activity, diet, follow-up appointments]\n\nFollow-up: [Outpatient provider, date, contact]\n\nCondition at Discharge: [Stable/Improved/Against Medical Advice]' },
  ]);
  const [editingTemplate, setEditingTemplate] = useState<typeof templates[0] | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState('Progress Note');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    addToast({ type: 'success', title: 'Settings Saved', message: 'Your preferences have been updated successfully.' });
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = ['Profile', 'Clinic', 'Notifications', 'Note Templates', 'Security'];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Settings</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage your provider profile and application preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 signature-gradient text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">{saved ? 'check' : 'save'}</span>
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-outline-variant/10 pb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'Profile' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Avatar */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface mb-4">Provider Identity</h3>
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvPGfAkZs8oJ44KvtlmlE2XTgNpDq2SD5F_jTs30tDNxFNvaDdlCuC5nkxM_PCzj6XIJk4O2AHTUNzMQqMeSJFeSXyMzRcDWCudBTzEvEpYDz9xMaV0LpKqGZLGrHg1J7mIBzU6fpXZM5mFnTGKSPb824Nh9dS64mYE70XukgirrKPwHfs6b0Y_zcG289b11SvbANn4UwQzgLxK-IpsSKSIuHHOUcESr9E2mXcoLg8xH6La2J8sPN-7ZE2SmCbjkMawrrlCy7NoBVo"
                  alt="Provider"
                  className="w-20 h-20 rounded-2xl object-cover border border-outline-variant/20"
                />
                <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-sm hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
              <div>
                <p className="font-bold text-xl text-on-surface">Dr. {profile.firstName} {profile.lastName}, {profile.credentials}</p>
                <p className="text-on-surface-variant text-sm">{profile.specialty}</p>
                <div className="flex gap-3 mt-2 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">badge</span>NPI: {profile.npi}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">medication</span>DEA: {profile.dea}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'First Name', key: 'firstName' as const },
                { label: 'Last Name', key: 'lastName' as const },
                { label: 'Credentials (MD, DO, NP, PA)', key: 'credentials' as const },
                { label: 'Specialty', key: 'specialty' as const },
                { label: 'NPI Number', key: 'npi' as const },
                { label: 'DEA Number', key: 'dea' as const },
                { label: 'State License', key: 'stateLicense' as const },
                { label: 'Contact Email', key: 'email' as const },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    value={profile[field.key]}
                    onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/10"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Electronic Signature */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface mb-4">Electronic Signature Block</h3>
            <p className="text-xs text-on-surface-variant mb-3">This text appears at the bottom of signed notes.</p>
            <textarea
              rows={3}
              value={profile.signatureText}
              onChange={e => setProfile({ ...profile, signatureText: e.target.value })}
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none border border-outline-variant/10 font-mono"
            />
            <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs font-bold text-primary mb-1">Preview:</p>
              <pre className="text-xs text-on-surface-variant font-mono whitespace-pre-wrap">{profile.signatureText}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Clinic Tab */}
      {activeTab === 'Clinic' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface mb-4">Clinic Information</h3>
            <div className="space-y-4">
              {[
                { label: 'Clinic / Practice Name', key: 'clinicName' as const },
                { label: 'Address', key: 'clinicAddress' as const },
                { label: 'Phone', key: 'phone' as const },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    value={profile[field.key]}
                    onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/10"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface mb-4">Default Clinical Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Default Note Type</label>
                <select
                  value={profile.defaultNoteType}
                  onChange={e => setProfile({ ...profile, defaultNoteType: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option>Progress Note</option>
                  <option>Initial Intake</option>
                  <option>Med Check</option>
                  <option>Crisis Assessment</option>
                  <option>Discharge Summary</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Default CPT Code</label>
                <select
                  value={profile.defaultCPT}
                  onChange={e => setProfile({ ...profile, defaultCPT: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="99213">99213 — Level 3 Established</option>
                  <option value="99214">99214 — Level 4 Established</option>
                  <option value="99215">99215 — Level 5 Established</option>
                  <option value="99204">99204 — Level 4 New Patient</option>
                  <option value="99205">99205 — Level 5 New Patient</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface mb-4">Connected Integrations</h3>
            <div className="space-y-3">
              {[
                { name: 'Surescripts e-Prescribing', status: 'Connected', icon: 'prescriptions', color: 'text-tertiary' },
                { name: 'Quest Diagnostics (Lab Orders)', status: 'Connected', icon: 'biotech', color: 'text-tertiary' },
                { name: 'CVS Pharmacy Network', status: 'Connected', icon: 'local_pharmacy', color: 'text-tertiary' },
                { name: 'PDMP — Washington State', status: 'Connected', icon: 'policy', color: 'text-tertiary' },
                { name: 'HL7 FHIR Export', status: 'Available', icon: 'share', color: 'text-secondary' },
                { name: 'Apple Health / Epic MyChart', status: 'Not configured', icon: 'health_metrics', color: 'text-on-surface-variant' },
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-sm ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{item.name}</p>
                      <p className={`text-xs ${item.status === 'Connected' ? 'text-tertiary' : 'text-on-surface-variant'}`}>{item.status}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToast({ type: 'info', title: `${item.name}`, message: item.status === 'Connected' ? 'Integration is active and syncing.' : 'Configuration wizard would open here.' })}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {item.status === 'Connected' ? 'Manage' : 'Configure'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'Notifications' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface mb-2">In-App Notifications</h3>
            <p className="text-sm text-on-surface-variant mb-6">Control which events trigger in-app alerts.</p>
            <div className="space-y-4">
              {[
                { key: 'labResults' as const,     label: 'Lab results available',       desc: 'Notify when new lab results are resulted.' },
                { key: 'messages' as const,        label: 'Secure messages',             desc: 'Incoming messages from patients or providers.' },
                { key: 'appointments' as const,    label: 'Appointment reminders',       desc: '15-minute reminder before each scheduled appointment.' },
                { key: 'priorAuth' as const,       label: 'Prior auth status changes',   desc: 'When insurance updates a PA determination.' },
                { key: 'riskAlerts' as const,      label: 'High-risk patient alerts',    desc: 'When a patient\'s risk score changes to High or Severe.' },
                { key: 'refillRequests' as const,  label: 'Refill requests',             desc: 'Pharmacy or patient refill requests requiring review.' },
              ].map(item => (
                <div key={item.key} className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                  <div>
                    <p className="font-medium text-sm text-on-surface">{item.label}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative ${notifications[item.key] ? 'bg-primary' : 'bg-surface-container-high'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-all ${notifications[item.key] ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface mb-2">External Notifications</h3>
            <p className="text-sm text-on-surface-variant mb-6">Push alerts outside the application.</p>
            <div className="space-y-4">
              {[
                { key: 'emailSummary' as const, label: 'Daily email digest', desc: 'Receive a morning summary of pending tasks and today\'s schedule.' },
                { key: 'smsAlerts' as const,    label: 'SMS for critical alerts', desc: 'Text message for Severe risk patient alerts only.' },
              ].map(item => (
                <div key={item.key} className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                  <div>
                    <p className="font-medium text-sm text-on-surface">{item.label}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative ${notifications[item.key] ? 'bg-primary' : 'bg-surface-container-high'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-all ${notifications[item.key] ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Note Templates Tab */}
      {activeTab === 'Note Templates' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-end">
            <button
              onClick={() => { setNewTemplateName(''); setNewTemplateType('Progress Note'); setShowNewTemplate(true); }}
              className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Template
            </button>
          </div>
          {templates.map(t => (
            <div key={t.id} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-primary text-sm">description</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-on-surface">{t.name}</p>
                    {t.isDefault && <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">DEFAULT</span>}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{t.type} · {t.body.slice(0, 60)}…</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingTemplate(t); setShowTemplateEditor(true); }}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Edit template"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button
                  onClick={() => {
                    setTemplates(prev => prev.map(tmpl => ({ ...tmpl, isDefault: tmpl.id === t.id })));
                    addToast({ type: 'success', title: 'Default Template Set', message: `"${t.name}" is now the default.` });
                  }}
                  className={`p-2 rounded-lg transition-colors ${t.isDefault ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-primary/10'}`}
                  title="Set as default"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: t.isDefault ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                </button>
                <button
                  onClick={() => {
                    if (t.isDefault) { addToast({ type: 'warning', title: 'Cannot Delete Default', message: 'Set another template as default first.' }); return; }
                    setTemplates(prev => prev.filter(tmpl => tmpl.id !== t.id));
                    addToast({ type: 'info', title: 'Template Deleted', message: `"${t.name}" has been removed.` });
                  }}
                  className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                  title="Delete template"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}

          {/* New Template Modal */}
          {showNewTemplate && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNewTemplate(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h3 className="font-headline font-bold text-on-surface mb-4">New Template</h3>
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Template Name</label>
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={e => setNewTemplateName(e.target.value)}
                      placeholder="e.g. My Progress Note"
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/10"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Note Type</label>
                    <select
                      value={newTemplateType}
                      onChange={e => setNewTemplateType(e.target.value)}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {['Progress Note','Intake','Med Check','Safety Assessment','Discharge','Consultation'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowNewTemplate(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest transition-colors">Cancel</button>
                  <button
                    disabled={!newTemplateName.trim()}
                    onClick={() => {
                      const id = `tmpl${Date.now()}`;
                      setTemplates(prev => [...prev, { id, name: newTemplateName.trim(), type: newTemplateType, isDefault: false, body: `S: \n\nO: \n\nA: \n\nP: ` }]);
                      setShowNewTemplate(false);
                      addToast({ type: 'success', title: 'Template Created', message: `"${newTemplateName}" added to your library.` });
                      // Auto-open editor for the new template
                      setTimeout(() => {
                        setEditingTemplate({ id, name: newTemplateName.trim(), type: newTemplateType, isDefault: false, body: `S: \n\nO: \n\nA: \n\nP: ` });
                        setShowTemplateEditor(true);
                      }, 100);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 transition-all disabled:opacity-40"
                  >
                    Create & Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Template Editor Modal */}
          {showTemplateEditor && editingTemplate && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowTemplateEditor(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                  <div>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                      className="font-headline font-bold text-on-surface text-lg bg-transparent outline-none border-b-2 border-transparent focus:border-primary pb-0.5 w-full"
                    />
                    <p className="text-xs text-on-surface-variant mt-1">{editingTemplate.type}</p>
                  </div>
                  <button onClick={() => setShowTemplateEditor(false)} className="p-2 hover:bg-surface-container-low rounded-lg ml-4">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <div className="p-6">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Template Body</label>
                  <textarea
                    rows={14}
                    value={editingTemplate.body}
                    onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none border border-outline-variant/10 font-mono leading-relaxed"
                  />
                  <p className="text-xs text-on-surface-variant mt-2">Use [brackets] for fields to fill in. This template pre-populates the note editor when selected.</p>
                </div>
                <div className="px-6 pb-6 flex gap-2 justify-end">
                  <button onClick={() => setShowTemplateEditor(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest transition-colors">Cancel</button>
                  <button
                    onClick={() => {
                      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
                      setShowTemplateEditor(false);
                      addToast({ type: 'success', title: 'Template Saved', message: `"${editingTemplate.name}" has been updated.` });
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 transition-all"
                  >
                    Save Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'Security' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface mb-4">Account Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                  <div>
                    <p className="font-medium text-sm text-on-surface">Two-Factor Authentication</p>
                    <p className="text-xs text-tertiary">Enabled via authenticator app</p>
                  </div>
                </div>
                <button
                  onClick={() => addToast({ type: 'success', title: '2FA Active', message: 'Two-factor authentication is enabled and protecting your account.' })}
                  className="text-xs font-bold text-primary hover:underline"
                >Manage</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  <div>
                    <p className="font-medium text-sm text-on-surface">Password</p>
                    <p className="text-xs text-on-surface-variant">Last changed 60 days ago</p>
                  </div>
                </div>
                <button onClick={() => setShowPasswordModal(true)} className="text-xs font-bold text-primary hover:underline">Change</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>devices</span>
                  <div>
                    <p className="font-medium text-sm text-on-surface">Active Sessions</p>
                    <p className="text-xs text-on-surface-variant">1 device (this session) · Seattle, WA</p>
                  </div>
                </div>
                <button onClick={() => addToast({ type: 'info', title: 'Active Sessions', message: '1 active session: Chrome on MacOS · Seattle, WA · Started today' })} className="text-xs font-bold text-primary hover:underline">View All</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>manage_history</span>
                  <div>
                    <p className="font-medium text-sm text-on-surface">Audit Log</p>
                    <p className="text-xs text-tertiary">HIPAA access tracking enabled</p>
                  </div>
                </div>
                <button onClick={() => setShowAuditLog(true)} className="text-xs font-bold text-primary hover:underline">View Log</button>
              </div>
            </div>
          </div>

          <div className="bg-error/5 rounded-2xl p-6 border border-error/20">
            <h3 className="font-headline font-bold text-error mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              Danger Zone
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">These actions are irreversible. Please proceed with caution.</p>
            <button
              onClick={() => addToast({ type: 'warning', title: 'Confirmation Required', message: 'Please contact your administrator to deactivate this account.' })}
              className="px-4 py-2 bg-error/10 text-error font-bold rounded-xl text-sm hover:bg-error/20 transition-colors border border-error/20"
            >
              Deactivate Account
            </button>
          </div>

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h3 className="font-headline font-bold text-on-surface mb-5">Change Password</h3>
                <div className="space-y-3 mb-5">
                  {[
                    { label: 'Current Password', key: 'current' as const },
                    { label: 'New Password', key: 'next' as const },
                    { label: 'Confirm New Password', key: 'confirm' as const },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">{f.label}</label>
                      <input
                        type="password"
                        value={passwordForm[f.key]}
                        onChange={e => setPasswordForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/10"
                        placeholder="••••••••"
                      />
                    </div>
                  ))}
                  {passwordForm.next && passwordForm.confirm && passwordForm.next !== passwordForm.confirm && (
                    <p className="text-xs text-error font-medium">Passwords do not match.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-surface-container-low text-on-surface-variant">Cancel</button>
                  <button
                    disabled={!passwordForm.current || !passwordForm.next || passwordForm.next !== passwordForm.confirm}
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordForm({ current: '', next: '', confirm: '' });
                      addToast({ type: 'success', title: 'Password Updated', message: 'Your password has been changed successfully.' });
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 disabled:opacity-40"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Audit Log Modal */}
          {showAuditLog && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAuditLog(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                  <h3 className="font-headline font-bold text-on-surface">HIPAA Audit Log</h3>
                  <button onClick={() => setShowAuditLog(false)} className="p-2 hover:bg-surface-container-low rounded-lg">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  {[
                    { time: '9:14 AM', action: 'Viewed patient chart', detail: 'Elias Thorne (p1)', icon: 'visibility' },
                    { time: '9:31 AM', action: 'Signed progress note', detail: 'Note #n3 — Sarah Miller', icon: 'edit_note' },
                    { time: '10:02 AM', action: 'Transmitted prescription', detail: 'Sertraline 100mg → CVS #10293', icon: 'prescriptions' },
                    { time: '10:45 AM', action: 'Accessed PDMP', detail: 'James Sullivan (p3)', icon: 'policy' },
                    { time: '11:12 AM', action: 'Viewed lab results', detail: 'Lithium Level — John Wick', icon: 'biotech' },
                    { time: '11:55 AM', action: 'Updated prior auth status', detail: 'PA #pa1 → Under Review', icon: 'gavel' },
                    { time: '2:03 PM', action: 'Exported patient summary', detail: 'Maria Rodriguez (p2) — FHIR R4', icon: 'share' },
                    { time: '3:30 PM', action: 'Logged in', detail: 'Chrome · Seattle, WA · 192.168.1.x', icon: 'login' },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-b border-outline-variant/5 last:border-0">
                      <span className="material-symbols-outlined text-sm text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>{entry.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-on-surface">{entry.action}</p>
                        <p className="text-xs text-on-surface-variant">{entry.detail}</p>
                      </div>
                      <span className="text-[10px] text-on-surface-variant flex-shrink-0">{entry.time}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-outline-variant/10">
                  <p className="text-xs text-on-surface-variant text-center">Showing today's access log · All times in local timezone</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
