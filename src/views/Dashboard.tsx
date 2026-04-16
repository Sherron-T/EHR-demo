import React, { useState } from 'react';
import { ViewType } from '../App';
import { useData } from '../context/DataContext';

const TODAY = new Date().toISOString().split('T')[0];

interface DashboardProps {
  onViewChange: (view: ViewType) => void;
}

export default function Dashboard({ onViewChange }: DashboardProps) {
  const {
    patients,
    appointments,
    notes,
    tasks, toggleTask, addTask, deleteTask,
    alerts, dismissAlert,
    setCurrentPatientId
  } = useData();

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const handlePatientClick = (patientId: string) => {
    setCurrentPatientId(patientId);
    onViewChange('patients');
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(newTaskText.trim());
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  // Live KPI calculations
  const todaysAppointments = appointments
    .filter(a => a.date === TODAY)
    .sort((a, b) => {
      const parseTime = (timeStr: string) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      return parseTime(a.time) - parseTime(b.time);
    });

  return (
    <div className="p-8 space-y-8">
      {/* KPIs Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow flex flex-col justify-between h-32 border-l-4 border-primary hover:-translate-y-1 transition-transform cursor-pointer">
          <span className="text-xs font-semibold text-on-secondary-fixed-variant uppercase tracking-wider">Patients Seen Today</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-extrabold text-primary">{todaysAppointments.filter(a => a.status === 'Completed').length}</span>
            <span className="text-xs text-tertiary font-medium">/ {todaysAppointments.length} Scheduled</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow flex flex-col justify-between h-32 border-l-4 border-primary-container hover:-translate-y-1 transition-transform cursor-pointer">
          <span className="text-xs font-semibold text-on-secondary-fixed-variant uppercase tracking-wider">Open Charts</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-extrabold text-primary-container">
              {String(todaysAppointments.filter(a => a.status === 'Completed' && !notes.some(n => n.patientId === a.patientId && n.date === TODAY)).length).padStart(2, '0')}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">Require Signing</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow flex flex-col justify-between h-32 border-l-4 border-tertiary hover:-translate-y-1 transition-transform cursor-pointer">
          <span className="text-xs font-semibold text-on-secondary-fixed-variant uppercase tracking-wider">Avg. Session Time</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-extrabold text-tertiary">
              {todaysAppointments.length > 0
                ? Math.round(todaysAppointments.reduce((s, a) => s + a.duration, 0) / todaysAppointments.length)
                : 0}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">Minutes</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow flex flex-col justify-between h-32 border-l-4 border-secondary hover:-translate-y-1 transition-transform cursor-pointer">
          <span className="text-xs font-semibold text-on-secondary-fixed-variant uppercase tracking-wider">Pending Tasks</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-extrabold text-secondary">{tasks.filter(t => !t.done).length < 10 ? `0${tasks.filter(t => !t.done).length}` : tasks.filter(t => !t.done).length}</span>
            <span className="text-xs text-on-surface-variant font-medium">Active Items</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8">
        {/* Today's Schedule */}
        <section className="col-span-12 lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-headline font-bold text-on-surface">Today's Schedule</h2>
            <button onClick={() => onViewChange('schedule')} className="text-sm font-semibold text-primary hover:underline">View Full Calendar</button>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
            <div className="divide-y divide-outline-variant/10">
              {todaysAppointments.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">No appointments scheduled for today.</div>
              ) : (
                todaysAppointments.map((appt) => {
                  const patient = patients.find(p => p.id === appt.patientId);
                  if (!patient) return null;
                  
                  return (
                    <div key={appt.id} className="p-4 flex items-center hover:bg-surface-container-low transition-colors group cursor-pointer" onClick={() => handlePatientClick(patient.id)}>
                      <div className="w-20 flex flex-col items-center justify-center border-r border-outline-variant/10 pr-4">
                        <span className="text-sm font-bold text-primary">{appt.time.split(' ')[0]}</span>
                        <span className="text-[10px] text-on-surface-variant font-medium uppercase">{appt.time.split(' ')[1]}</span>
                      </div>
                      <div className="px-6 flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {patient.image ? (
                            <img src={patient.image} alt={patient.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <div>
                            <h4 className="font-headline font-bold text-on-surface">{patient.name}</h4>
                            <p className="text-xs text-on-surface-variant">{appt.type} • {appt.duration}m</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                            appt.status === 'In Lobby' ? 'bg-secondary-container text-on-secondary-fixed-variant' : 
                            appt.status === 'Confirmed' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 
                            'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            {appt.status}
                          </span>
                          <button className="p-2 text-primary hover:bg-primary/5 rounded-full transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward_ios</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Access */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-on-surface-variant mb-4 px-2">Quick Access (Recent)</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {patients.slice(0, 4).map(patient => (
                <div key={patient.id} onClick={() => handlePatientClick(patient.id)} className="flex-shrink-0 w-44 bg-surface-container-lowest p-4 rounded-xl ambient-shadow hover:-translate-y-1 transition-transform cursor-pointer">
                  {patient.image ? (
                    <img src={patient.image} alt={patient.name} className="w-10 h-10 rounded-full object-cover mb-3" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm mb-3">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <h5 className="font-headline font-bold text-sm truncate">{patient.name}</h5>
                  <p className="text-[10px] text-on-surface-variant font-medium">MRN: {patient.mrn}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sidebar Alerts & Tasks */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>report</span>
                <h2 className="text-lg font-headline font-bold">Clinical Alerts</h2>
              </div>
              {alerts.length > 0 && (
                <button onClick={() => alerts.forEach(a => dismissAlert(a.id))} className="text-xs font-bold text-on-surface-variant hover:text-error transition-colors">Clear All</button>
              )}
            </div>
            
            <div className="space-y-3">
              {alerts.length === 0 && (
                <div className="bg-surface-container-lowest p-6 rounded-xl text-center border border-outline-variant/10 border-dashed">
                  <span className="material-symbols-outlined text-outline-variant mb-2">check_circle</span>
                  <p className="text-sm font-medium text-on-surface-variant">No active clinical alerts.</p>
                </div>
              )}

              {alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-xl flex gap-4 border relative group ${alert.severity === 'High' ? 'bg-error-container border-error/5' : 'bg-surface-container-lowest ambient-shadow border-l-4 border-error'}`}>
                  <button onClick={() => dismissAlert(alert.id)} className={`absolute top-2 right-2 transition-colors opacity-0 group-hover:opacity-100 ${alert.severity === 'High' ? 'text-on-error-container/40 hover:text-error' : 'text-on-surface-variant/40 hover:text-error'}`}>
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                  <div className="mt-1">
                    <span className={`material-symbols-outlined text-error ${alert.severity === 'High' ? '' : ''}`} style={{ fontVariationSettings: alert.severity === 'High' ? "'FILL' 1" : "" }}>
                      {alert.type.includes('Lab') ? 'lab_research' : 'warning'}
                    </span>
                  </div>
                  <div>
                    <h4 className={`font-headline font-bold text-sm ${alert.severity === 'High' ? 'text-on-error-container' : 'text-on-surface'}`}>{alert.type}</h4>
                    <p className={`text-xs mt-1 leading-relaxed ${alert.severity === 'High' ? 'text-on-error-container/80' : 'text-on-surface-variant'}`}>{alert.message}</p>
                    {alert.patientId && (
                      <button onClick={() => handlePatientClick(alert.patientId!)} className={`mt-2 text-xs font-bold hover:underline ${alert.severity === 'High' ? 'text-error hover:text-error/80' : 'text-primary'}`}>
                        Open Chart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-lg font-headline font-bold text-on-surface">Tasks</h2>
              <span className="text-xs font-bold px-2 py-0.5 bg-outline-variant/20 rounded-full text-on-surface-variant">
                {tasks.filter(t => !t.done).length} Pending
              </span>
            </div>
            
            <div className="bg-surface-container-lowest rounded-xl ambient-shadow divide-y divide-outline-variant/10">
              {tasks.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-on-surface-variant">All caught up!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} onClick={() => toggleTask(task.id)} className="p-4 flex items-center justify-between group cursor-pointer hover:bg-surface-container-low/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.done ? 'bg-primary border-primary text-white' : 'border-outline-variant group-hover:border-primary'}`}>
                        {task.done && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                      </div>
                      <span className={`text-sm font-medium transition-all ${task.done ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>{task.text}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-on-surface-variant/40 hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))
              )}
              
              {isAddingTask && (
                <div className="p-4 bg-surface-container-low/30">
                  <form onSubmit={handleAddTaskSubmit} className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Task description..."
                      className="flex-1 bg-white border border-outline-variant/30 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button type="submit" disabled={!newTaskText.trim()} className="p-1.5 bg-primary text-white rounded-lg disabled:opacity-50">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </button>
                    <button type="button" onClick={() => setIsAddingTask(false)} className="p-1.5 text-on-surface-variant hover:text-error rounded-lg">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
            
            {!isAddingTask && (
              <button onClick={() => setIsAddingTask(true)} className="w-full py-3 text-sm font-bold text-primary-container border border-dashed border-primary-container/30 rounded-xl hover:bg-primary/5 transition-colors">
                + Add Custom Task
              </button>
            )}
          </div>
        </aside>
      </div>

      <button onClick={() => onViewChange('new_note')} className="fixed bottom-8 right-8 signature-gradient w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-primary/20 transition-all hover:scale-110 active:scale-95 z-50">
        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>add</span>
      </button>
    </div>
  );
}
