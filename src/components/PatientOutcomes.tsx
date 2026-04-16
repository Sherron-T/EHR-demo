import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export default function PatientOutcomes() {
  const { patients, currentPatientId, outcomes, addOutcome, medications } = useData();
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    date: new Date().toISOString().split('T')[0],
    phq9: '',
    gad7: '',
    sleepHours: '',
    mood: ''
  });

  const patient = patients.find(p => p.id === currentPatientId);
  if (!patient) return null;

  const patientOutcomes = outcomes
    .filter(o => o.patientId === patient.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Format data for Recharts
  const chartData = patientOutcomes.map(o => ({
    ...o,
    dateFormatted: new Date(o.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }));

  // Find medication start dates to overlay
  const patientMeds = medications.filter(m => m.patientId === patient.id);
  // We'll just mock a med start date for the demo if it's Elias Thorne
  const medStartDate = patient.id === 'p1' ? '2024-04-12' : null;
  const medStartFormatted = medStartDate ? new Date(medStartDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOutcome({
      patientId: patient.id,
      date: newAssessment.date,
      phq9: newAssessment.phq9 ? parseInt(newAssessment.phq9) : null,
      gad7: newAssessment.gad7 ? parseInt(newAssessment.gad7) : null,
      sleepHours: newAssessment.sleepHours ? parseFloat(newAssessment.sleepHours) : null,
      mood: newAssessment.mood ? parseInt(newAssessment.mood) : null,
    });
    setShowNewAssessment(false);
    setNewAssessment({
      date: new Date().toISOString().split('T')[0],
      phq9: '',
      gad7: '',
      sleepHours: '',
      mood: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-headline font-bold text-on-surface">Patient-Reported Outcomes</h2>
          <p className="text-sm text-on-surface-variant">Longitudinal tracking of symptoms, mood, and sleep.</p>
        </div>
        <button 
          onClick={() => setShowNewAssessment(!showNewAssessment)}
          className="flex items-center gap-2 px-4 py-2 signature-gradient text-white font-bold text-sm rounded-lg shadow-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-lg">{showNewAssessment ? 'close' : 'add'}</span>
          {showNewAssessment ? 'Cancel' : 'New Assessment'}
        </button>
      </div>

      {showNewAssessment && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 ambient-shadow animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-headline font-bold text-on-surface mb-4">Enter New Assessment</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Date</label>
              <input 
                type="date" 
                required
                value={newAssessment.date}
                onChange={e => setNewAssessment({...newAssessment, date: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">PHQ-9 (0-27)</label>
              <input 
                type="number" 
                min="0" max="27"
                value={newAssessment.phq9}
                onChange={e => setNewAssessment({...newAssessment, phq9: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">GAD-7 (0-21)</label>
              <input 
                type="number" 
                min="0" max="21"
                value={newAssessment.gad7}
                onChange={e => setNewAssessment({...newAssessment, gad7: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Sleep (Hours)</label>
              <input 
                type="number" 
                step="0.5" min="0" max="24"
                value={newAssessment.sleepHours}
                onChange={e => setNewAssessment({...newAssessment, sleepHours: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Mood (1-10)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  min="1" max="10"
                  value={newAssessment.mood}
                  onChange={e => setNewAssessment({...newAssessment, mood: e.target.value})}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {patientOutcomes.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant/20 text-center">
          <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">monitoring</span>
          <h3 className="text-lg font-bold text-on-surface">No Outcome Data</h3>
          <p className="text-sm text-on-surface-variant mt-2">Add an assessment to start tracking longitudinal trends.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* PHQ-9 & GAD-7 Chart */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 ambient-shadow">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-6">Symptom Severity (PHQ-9 & GAD-7)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 27]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {medStartFormatted && (
                    <ReferenceLine x={medStartFormatted} stroke="#8b5cf6" strokeDasharray="3 3" label={{ position: 'top', value: 'Escitalopram Started', fill: '#8b5cf6', fontSize: 10, fontWeight: 'bold' }} />
                  )}
                  <Line type="monotone" dataKey="phq9" name="PHQ-9 (Depression)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="gad7" name="GAD-7 (Anxiety)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mood & Sleep Chart */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 ambient-shadow">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-6">Wellness (Mood & Sleep)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 10]} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 12]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {medStartFormatted && (
                    <ReferenceLine yAxisId="left" x={medStartFormatted} stroke="#8b5cf6" strokeDasharray="3 3" />
                  )}
                  <Line yAxisId="left" type="monotone" dataKey="mood" name="Mood (1-10)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="sleepHours" name="Sleep (Hours)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
