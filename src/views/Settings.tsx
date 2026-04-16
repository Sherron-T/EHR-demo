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
              onClick={() => addToast({ type: 'success', title: 'Template Created', message: 'New blank template added to your library.' })}
              className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Template
            </button>
          </div>
          {[
            { name: 'Standard Follow-up (Psychiatry)', type: 'Progress Note', lastModified: '2024-09-01', isDefault: true },
            { name: 'Initial Intake — Adult Psychiatry', type: 'Intake', lastModified: '2024-07-15', isDefault: false },
            { name: 'Med Check (Brief)', type: 'Med Check', lastModified: '2024-08-20', isDefault: false },
            { name: 'Crisis Assessment', type: 'Safety Assessment', lastModified: '2024-10-01', isDefault: false },
            { name: 'Discharge Summary', type: 'Discharge', lastModified: '2024-06-10', isDefault: false },
          ].map(t => (
            <div key={t.name} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-primary text-sm">description</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-on-surface">{t.name}</p>
                    {t.isDefault && <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">DEFAULT</span>}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{t.type} · Modified {t.lastModified}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => addToast({ type: 'info', title: 'Template Editor', message: 'Template editor would open here.' })} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button onClick={() => addToast({ type: 'success', title: 'Set as Default', message: `"${t.name}" is now the default template.` })} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-sm">star</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'Security' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface mb-4">Account Security</h3>
            <div className="space-y-4">
              {[
                { label: 'Two-Factor Authentication', status: 'Enabled', statusColor: 'text-tertiary', action: 'Manage', icon: 'security' },
                { label: 'Password', status: 'Last changed 60 days ago', statusColor: 'text-on-surface-variant', action: 'Change', icon: 'lock' },
                { label: 'Active Sessions', status: '1 device (this session)', statusColor: 'text-on-surface-variant', action: 'View All', icon: 'devices' },
                { label: 'Audit Log', status: 'HIPAA access tracking enabled', statusColor: 'text-tertiary', action: 'View Log', icon: 'manage_history' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-on-surface">{item.label}</p>
                      <p className={`text-xs ${item.statusColor}`}>{item.status}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToast({ type: 'info', title: item.label, message: `${item.action} dialog would open here.` })}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {item.action}
                  </button>
                </div>
              ))}
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
        </div>
      )}
    </div>
  );
}
