import React, { useState } from 'react';
import { ViewType } from '../App';
import { useData } from '../context/DataContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

interface ReportsProps {
  onViewChange: (view: ViewType) => void;
}

const COLORS = ['#004d64', '#4d616c', '#006a6a', '#ba1a1a', '#7c5700'];

const apptVolumeData = [
  { month: 'May', Intake: 18, 'Med Check': 32, Urgent: 5 },
  { month: 'Jun', Intake: 22, 'Med Check': 35, Urgent: 4 },
  { month: 'Jul', Intake: 20, 'Med Check': 38, Urgent: 7 },
  { month: 'Aug', Intake: 25, 'Med Check': 40, Urgent: 6 },
  { month: 'Sep', Intake: 19, 'Med Check': 42, Urgent: 9 },
  { month: 'Oct', Intake: 24, 'Med Check': 44, Urgent: 8 },
];

const revenueData = [
  { month: 'May', Collected: 42000, Billed: 55000 },
  { month: 'Jun', Collected: 48000, Billed: 61000 },
  { month: 'Jul', Collected: 45000, Billed: 58000 },
  { month: 'Aug', Collected: 52000, Billed: 67000 },
  { month: 'Sep', Collected: 49000, Billed: 63000 },
  { month: 'Oct', Collected: 56000, Billed: 71000 },
];

const payerMixData = [
  { name: 'Blue Cross Blue Shield', value: 32 },
  { name: 'Aetna', value: 21 },
  { name: 'United Healthcare', value: 18 },
  { name: 'Medicare', value: 15 },
  { name: 'Medicaid', value: 9 },
  { name: 'Self-Pay', value: 5 },
];

const waitTimeData = [
  { month: 'May', days: 14 },
  { month: 'Jun', days: 12 },
  { month: 'Jul', days: 16 },
  { month: 'Aug', days: 11 },
  { month: 'Sep', days: 9 },
  { month: 'Oct', days: 8 },
];

const noShowData = [
  { month: 'May', rate: 12 },
  { month: 'Jun', rate: 10 },
  { month: 'Jul', rate: 14 },
  { month: 'Aug', rate: 11 },
  { month: 'Sep', rate: 9 },
  { month: 'Oct', rate: 8 },
];

const complianceItems = [
  { label: 'HIPAA Privacy Training', status: 'Completed', due: '2026-06-01', score: 100 },
  { label: 'Annual Security Awareness Training', status: 'Completed', due: '2026-06-01', score: 100 },
  { label: 'Suicide Risk Assessment Protocol', status: 'Completed', due: '2026-09-01', score: 95 },
  { label: 'Documentation Timeliness (48h)', status: 'Needs Attention', due: 'Ongoing', score: 82 },
  { label: 'Informed Consent on File', status: 'Completed', due: 'Per patient', score: 91 },
  { label: 'DEA Registration Renewal', status: 'Due Soon', due: '2025-01-15', score: null },
  { label: 'State Medical License Renewal', status: 'Completed', due: '2025-06-30', score: null },
  { label: 'Malpractice Insurance Verification', status: 'Completed', due: '2025-03-01', score: null },
];

export default function Reports({ onViewChange }: ReportsProps) {
  const { patients, appointments, notes, medications, referrals } = useData();
  const [activeTab, setActiveTab] = useState('Clinical');

  const totalPatients = patients.length;
  const highRiskPatients = patients.filter(p => p.riskScore === 'High' || p.riskScore === 'Severe').length;
  const activeMeds = medications.filter(m => m.status === 'Active').length;
  const totalAppts = appointments.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 shadow-lg text-xs">
          <p className="font-bold text-on-surface mb-1">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {typeof entry.value === 'number' && entry.name.includes('Collected') || entry.name.includes('Billed') ? `$${entry.value.toLocaleString()}` : entry.value}
              {entry.name === 'rate' ? '%' : ''}
              {entry.name === 'days' ? ' days' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Reports & Analytics</h1>
          <p className="text-sm text-on-surface-variant mt-2">Clinic performance and patient population metrics. Data period: Apr 2026.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-surface-container-low text-on-surface font-bold rounded-lg hover:bg-surface-container-highest transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
          <button className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">print</span>
            Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-outline-variant/10 pb-4">
        {['Clinical', 'Operational', 'Financial', 'Compliance'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              activeTab === tab
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* === CLINICAL TAB === */}
      {activeTab === 'Clinical' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'group', color: 'text-primary', bg: 'bg-primary/10', badge: '+12%', badgeColor: 'text-tertiary bg-tertiary/10', value: totalPatients, label: 'Total Active Patients' },
              { icon: 'crisis_alert', color: 'text-error', bg: 'bg-error/10', badge: 'Action Needed', badgeColor: 'text-error bg-error/10', value: highRiskPatients, label: 'High/Severe Risk Patients' },
              { icon: 'medication', color: 'text-secondary', bg: 'bg-secondary/10', badge: null, badgeColor: '', value: activeMeds, label: 'Active Prescriptions' },
              { icon: 'description', color: 'text-tertiary', bg: 'bg-tertiary/10', badge: null, badgeColor: '', value: notes.length, label: 'Notes Authored (30d)' },
            ].map((card, i) => (
              <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className={`${card.bg} p-2 rounded-lg ${card.color}`}>
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                  {card.badge && <span className={`text-xs font-bold px-2 py-1 rounded-full ${card.badgeColor}`}>{card.badge}</span>}
                </div>
                <h3 className="text-3xl font-headline font-bold text-on-surface">{card.value}</h3>
                <p className="text-sm text-on-surface-variant font-medium">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-6">Patient Risk Stratification</h3>
              <div className="space-y-4">
                {[
                  { label: 'Low Risk', count: patients.filter(p=>p.riskScore==='Low').length, total: totalPatients, color: 'bg-primary' },
                  { label: 'Moderate Risk', count: patients.filter(p=>p.riskScore==='Moderate').length, total: totalPatients, color: 'bg-secondary' },
                  { label: 'High Risk', count: patients.filter(p=>p.riskScore==='High').length, total: totalPatients, color: 'bg-error/70' },
                  { label: 'Severe Risk', count: patients.filter(p=>p.riskScore==='Severe').length, total: totalPatients, color: 'bg-error' },
                ].map(item => {
                  const pct = totalPatients > 0 ? Math.round((item.count / totalPatients) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-on-surface-variant">{item.label}</span>
                        <span className="font-bold text-on-surface">{item.count} pts ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-surface-container-low rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-6">Common Diagnoses (Top 5)</h3>
              <div className="space-y-3">
                {[
                  { label: 'Major Depressive Disorder', count: 142 },
                  { label: 'Generalized Anxiety Disorder', count: 98 },
                  { label: 'ADHD', count: 65 },
                  { label: 'Bipolar Disorder', count: 42 },
                  { label: 'PTSD', count: 31 }
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-on-surface-variant w-5">{i + 1}.</span>
                      <span className="text-sm font-medium text-on-surface">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(item.count / 142) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-primary w-16 text-right">{item.count} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outcomes summary */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Referrals Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Referrals', value: referrals.length, color: 'text-primary' },
                { label: 'Pending', value: referrals.filter(r=>r.status==='Pending').length, color: 'text-secondary' },
                { label: 'Accepted', value: referrals.filter(r=>r.status==='Accepted').length, color: 'text-tertiary' },
                { label: 'Completed', value: referrals.filter(r=>r.status==='Completed').length, color: 'text-primary' },
              ].map(s => (
                <div key={s.label} className="bg-surface-container-low p-4 rounded-xl text-center">
                  <p className={`text-3xl font-headline font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === OPERATIONAL TAB === */}
      {activeTab === 'Operational' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Avg Daily Appointments', value: '12.4', icon: 'calendar_today', delta: '+8%', up: true },
              { label: 'No-Show Rate (Oct)', value: '8.0%', icon: 'event_busy', delta: '-3.5%', up: true },
              { label: 'Avg Wait Time (New Pt)', value: '8 days', icon: 'schedule', delta: '-4 days', up: true },
              { label: 'Provider Utilization', value: '91%', icon: 'person_check', delta: '+2%', up: true },
            ].map(kpi => (
              <div key={kpi.label} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <span className="material-symbols-outlined">{kpi.icon}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.up ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>{kpi.delta}</span>
                </div>
                <h3 className="text-3xl font-headline font-bold text-on-surface">{kpi.value}</h3>
                <p className="text-sm text-on-surface-variant font-medium">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Appointment Volume Chart */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-6">Monthly Appointment Volume by Type</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={apptVolumeData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                <Bar dataKey="Intake" fill="#004d64" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Med Check" fill="#4d616c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Urgent" fill="#ba1a1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wait Time Trend */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">New Patient Wait Time (days)</h3>
              <p className="text-sm text-on-surface-variant mb-6">Avg days from referral to first appointment</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={waitTimeData}>
                  <defs>
                    <linearGradient id="waitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#004d64" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#004d64" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="days" stroke="#004d64" strokeWidth={2} fill="url(#waitGrad)" name="days" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* No-Show Rate */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">No-Show Rate (%)</h3>
              <p className="text-sm text-on-surface-variant mb-6">Monthly no-show percentage — target ≤10%</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={noShowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="rate" stroke="#ba1a1a" strokeWidth={2} dot={{ fill: '#ba1a1a', r: 4 }} name="rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status breakdown table */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Appointment Status — April 2026</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Scheduled', count: appointments.filter(a=>a.status==='Scheduled').length, color: 'bg-secondary-container text-on-secondary-fixed-variant' },
                { label: 'Confirmed', count: appointments.filter(a=>a.status==='Confirmed').length, color: 'bg-tertiary/10 text-tertiary' },
                { label: 'In Lobby', count: appointments.filter(a=>a.status==='In Lobby').length, color: 'bg-primary/10 text-primary' },
                { label: 'Completed', count: appointments.filter(a=>a.status==='Completed').length, color: 'bg-surface-container-high text-on-surface-variant' },
              ].map(s => (
                <div key={s.label} className={`p-4 rounded-xl text-center ${s.color}`}>
                  <p className="text-3xl font-headline font-bold">{s.count}</p>
                  <p className="text-xs font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === FINANCIAL TAB === */}
      {activeTab === 'Financial' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Revenue Collected (Oct)', value: '$56,200', icon: 'payments', delta: '+14%', up: true },
              { label: 'Claims Submitted (Oct)', value: '$71,000', icon: 'receipt_long', delta: null, up: true },
              { label: 'Collection Rate', value: '79.2%', icon: 'percent', delta: '+2.1%', up: true },
              { label: 'Outstanding Balances', value: '$12,400', icon: 'account_balance', delta: '-8%', up: true },
            ].map(kpi => (
              <div key={kpi.label} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-tertiary/10 p-2 rounded-lg text-tertiary">
                    <span className="material-symbols-outlined">{kpi.icon}</span>
                  </div>
                  {kpi.delta && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.up ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>{kpi.delta}</span>
                  )}
                </div>
                <h3 className="text-3xl font-headline font-bold text-on-surface">{kpi.value}</h3>
                <p className="text-sm text-on-surface-variant font-medium">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Revenue: Billed vs. Collected</h3>
            <p className="text-sm text-on-surface-variant mb-6">Monthly billing cycle performance</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="billedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4d616c" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4d616c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004d64" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#004d64" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                <Area type="monotone" dataKey="Billed" stroke="#4d616c" strokeWidth={2} fill="url(#billedGrad)" />
                <Area type="monotone" dataKey="Collected" stroke="#004d64" strokeWidth={2} fill="url(#collectedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payer Mix */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-6">Payer Mix</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={payerMixData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {payerMixData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {payerMixData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-on-surface-variant">{item.name}</span>
                    </div>
                    <span className="font-bold text-on-surface">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outstanding claims */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Accounts Receivable Aging</h3>
              <div className="space-y-3">
                {[
                  { label: '0–30 days', amount: '$4,200', pct: 34, color: 'bg-tertiary' },
                  { label: '31–60 days', amount: '$3,800', pct: 31, color: 'bg-secondary' },
                  { label: '61–90 days', amount: '$2,500', pct: 20, color: 'bg-primary' },
                  { label: '90+ days', amount: '$1,900', pct: 15, color: 'bg-error' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-on-surface-variant font-medium">{item.label}</span>
                      <span className="font-bold text-on-surface">{item.amount}</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-between">
                <span className="text-sm font-bold text-on-surface">Total Outstanding</span>
                <span className="text-sm font-bold text-error">$12,400</span>
              </div>
            </div>
          </div>

          {/* Top CPT codes */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Top CPT Codes (Apr 2026)</h3>
            <table className="w-full text-sm">
              <thead className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                <tr className="border-b border-outline-variant/10">
                  <th className="py-2 text-left">CPT Code</th>
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-right">Units</th>
                  <th className="py-2 text-right">Avg Reimbursement</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {[
                  { code: '99214', desc: 'Level 4 E&M – Established Patient', units: 62, avg: '$145', total: '$8,990' },
                  { code: '99213', desc: 'Level 3 E&M – Established Patient', units: 38, avg: '$108', total: '$4,104' },
                  { code: '99215', desc: 'Level 5 E&M – Established Patient', units: 14, avg: '$210', total: '$2,940' },
                  { code: '90837', desc: 'Psychotherapy, 60 min', units: 11, avg: '$180', total: '$1,980' },
                  { code: '99204', desc: 'Level 4 E&M – New Patient', units: 9, avg: '$225', total: '$2,025' },
                ].map(row => (
                  <tr key={row.code} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 font-bold text-primary">{row.code}</td>
                    <td className="py-3 text-on-surface-variant">{row.desc}</td>
                    <td className="py-3 text-right font-medium text-on-surface">{row.units}</td>
                    <td className="py-3 text-right text-on-surface-variant">{row.avg}</td>
                    <td className="py-3 text-right font-bold text-on-surface">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === COMPLIANCE TAB === */}
      {activeTab === 'Compliance' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Overall Compliance Score', value: '94%', icon: 'verified_user', color: 'text-tertiary', bg: 'bg-tertiary/10' },
              { label: 'Training Modules Complete', value: '8/8', icon: 'school', color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Notes Signed <48h', value: '82%', icon: 'draw', color: 'text-secondary', bg: 'bg-secondary/10' },
              { label: 'Items Requiring Attention', value: '2', icon: 'warning', color: 'text-error', bg: 'bg-error/10' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                <div className={`${kpi.bg} p-2 rounded-lg ${kpi.color} mb-4 w-fit`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
                </div>
                <h3 className="text-3xl font-headline font-bold text-on-surface">{kpi.value}</h3>
                <p className="text-sm text-on-surface-variant font-medium">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Compliance Checklist */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/30">
              <h3 className="font-headline font-bold text-lg text-on-surface">Provider Compliance Checklist</h3>
              <p className="text-sm text-on-surface-variant">Dr. Sarah Jenkins · Period: 2026</p>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {complianceItems.map(item => {
                const statusConfig = {
                  'Completed':         { bg: 'bg-tertiary/10', text: 'text-tertiary', icon: 'check_circle' },
                  'Needs Attention':   { bg: 'bg-error/10',    text: 'text-error',    icon: 'warning' },
                  'Due Soon':          { bg: 'bg-secondary/10', text: 'text-secondary', icon: 'schedule' },
                }[item.status] ?? { bg: 'bg-surface-container-low', text: 'text-on-surface-variant', icon: 'info' };

                return (
                  <div key={item.label} className="px-6 py-4 flex items-center gap-4 hover:bg-surface-container-low/50 transition-colors">
                    <span className={`material-symbols-outlined ${statusConfig.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>{statusConfig.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-on-surface text-sm">{item.label}</p>
                      <p className="text-xs text-on-surface-variant">Due: {item.due}</p>
                    </div>
                    {item.score != null && (
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-on-surface-variant">Score</span>
                          <span className="font-bold text-on-surface">{item.score}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.score >= 90 ? 'bg-tertiary' : item.score >= 75 ? 'bg-secondary' : 'bg-error'}`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} flex-shrink-0`}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documentation compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Documentation Timeliness</h3>
              <div className="space-y-4">
                {[
                  { label: 'Notes signed within 24 hours', pct: 68, color: 'bg-tertiary' },
                  { label: 'Notes signed within 48 hours', pct: 82, color: 'bg-primary' },
                  { label: 'Notes signed within 72 hours', pct: 91, color: 'bg-secondary' },
                  { label: 'Total notes signed', pct: 96, color: 'bg-surface-container-highest' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-on-surface-variant font-medium">{item.label}</span>
                      <span className="font-bold text-on-surface">{item.pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Upcoming Renewals & Deadlines</h3>
              <div className="space-y-3">
                {[
                  { label: 'DEA Registration', date: 'Jan 15, 2025', urgency: 'Soon' },
                  { label: 'CME Credits (50 hrs required)', date: 'Mar 1, 2025', urgency: 'On Track' },
                  { label: 'State Medical License', date: 'Jun 30, 2025', urgency: 'On Track' },
                  { label: 'Malpractice Insurance', date: 'Mar 1, 2025', urgency: 'On Track' },
                  { label: 'HIPAA Annual Training', date: 'Jun 1, 2025', urgency: 'On Track' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{item.label}</p>
                      <p className="text-xs text-on-surface-variant">{item.date}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.urgency === 'Soon' ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary'
                    }`}>
                      {item.urgency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
