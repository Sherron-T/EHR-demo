import React, { useState } from 'react';
import { ViewType } from '../App';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

interface ScheduleProps {
  onViewChange: (view: ViewType) => void;
}

export default function Schedule({ onViewChange }: ScheduleProps) {
  const { appointments, patients, addAppointment, setCurrentPatientId } = useData();
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState('Week');
  const [filters, setFilters] = useState({ intake: true, medCheck: true, urgent: true });
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 21));

  // New appointment modal state
  const [showModal, setShowModal] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<{ date: string; time: string } | null>(null);
  const [apptForm, setApptForm] = useState({
    patientId: '',
    date: '',
    time: '9:00 AM',
    duration: 60,
    type: 'Med Check' as 'Intake' | 'Med Check' | 'Urgent',
  });

  const formatDateStr = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const toggleFilter = (key: keyof typeof filters) => setFilters(prev => ({ ...prev, [key]: !prev[key] }));

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    return Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    return Array.from({ length: 42 }).map((_, i) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthDays(currentDate);
  const activeDays = viewMode === 'Day' ? [currentDate] : weekDays;

  const timeSlots = Array.from({ length: 9 }).map((_, i) => {
    const hour = i + 8;
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  });

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'Day') d.setDate(d.getDate() - 1);
    else if (viewMode === 'Week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'Day') d.setDate(d.getDate() + 1);
    else if (viewMode === 'Week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  let headerText = '';
  if (viewMode === 'Day') headerText = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  else if (viewMode === 'Week') headerText = `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  else headerText = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const gridColsStyle = viewMode === 'Day' ? { gridTemplateColumns: '80px 1fr' } : { gridTemplateColumns: '80px repeat(5, 1fr)' };

  const openNewApptModal = (date?: string, time?: string) => {
    setApptForm(prev => ({
      ...prev,
      date: date ?? formatDateStr(currentDate),
      time: time ?? '9:00 AM',
    }));
    setShowModal(true);
  };

  const handleSaveAppt = () => {
    if (!apptForm.patientId) {
      addToast({ type: 'error', title: 'Patient required', message: 'Please select a patient before scheduling.' });
      return;
    }
    addAppointment({
      patientId: apptForm.patientId,
      date: apptForm.date,
      time: apptForm.time,
      duration: apptForm.duration,
      type: apptForm.type,
      status: 'Scheduled',
    });
    const pt = patients.find(p => p.id === apptForm.patientId);
    addToast({ type: 'success', title: 'Appointment Scheduled', message: `${pt?.name ?? 'Patient'} · ${apptForm.time} on ${apptForm.date}` });
    setShowModal(false);
    setApptForm({ patientId: '', date: '', time: '9:00 AM', duration: 60, type: 'Med Check' });
  };

  const handleAppointmentClick = (patientId: string) => {
    setCurrentPatientId(patientId);
    onViewChange('patients');
  };

  const apptColor = (type: string) => {
    if (type === 'Intake') return { bg: 'bg-primary-fixed/40 border-primary', text: 'text-on-primary-fixed-variant' };
    if (type === 'Med Check') return { bg: 'bg-tertiary-fixed/40 border-tertiary', text: 'text-on-tertiary-fixed-variant' };
    return { bg: 'bg-error-container/40 border-error', text: 'text-on-error-container' };
  };

  const monthApptColor = (type: string) => {
    if (type === 'Intake') return 'bg-primary-fixed/40 text-on-primary-fixed-variant';
    if (type === 'Med Check') return 'bg-tertiary-fixed/40 text-on-tertiary-fixed-variant';
    return 'bg-error-container/40 text-on-error-container';
  };

  const TIME_OPTIONS = [
    '8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM',
    '11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM',
    '2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM',
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Clinic Schedule</h1>
          <p className="text-sm text-on-surface-variant mt-1">{headerText}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-lg mr-4">
            <button onClick={handlePrev} className="p-1.5 hover:bg-white rounded-md transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button onClick={() => setCurrentDate(new Date('2024-10-21'))} className="text-sm font-bold text-primary hover:underline px-2">Today</button>
            <button onClick={handleNext} className="p-1.5 hover:bg-white rounded-md transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          <div className="flex bg-surface-container-low rounded-lg p-1">
            {['Day', 'Week', 'Month'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${viewMode === mode ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button onClick={() => openNewApptModal()} className="flex items-center gap-2 px-4 py-2 signature-gradient text-white font-bold text-sm rounded-lg shadow-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-lg">add</span>
            New Appointment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        {[
          { key: 'intake' as const, color: 'bg-primary', label: 'Intake (60m)' },
          { key: 'medCheck' as const, color: 'bg-tertiary', label: 'Med Check (20m)' },
          { key: 'urgent' as const, color: 'bg-error', label: 'Urgent/Crisis' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => toggleFilter(f.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${filters[f.key] ? 'bg-surface-container-lowest border-outline-variant/20' : 'bg-transparent border-transparent opacity-40 hover:opacity-70'}`}
          >
            <span className={`w-3 h-3 rounded-full ${f.color}`}></span>
            <span className="text-xs font-semibold text-on-surface">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden flex flex-col shadow-sm">
        {viewMode === 'Month' ? (
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-7 border-b border-outline-variant/10 bg-surface-container-low/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider border-r border-outline-variant/10">{day}</div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-6">
              {monthDays.map((day, i) => {
                const dateStr = formatDateStr(day);
                const dayAppts = appointments.filter(a => a.date === dateStr);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = dateStr === '2024-10-21';
                return (
                  <div
                    key={i}
                    onClick={() => { setCurrentDate(day); setViewMode('Day'); }}
                    className={`border-r border-b border-outline-variant/10 p-2 cursor-pointer hover:bg-primary/5 transition-colors ${isCurrentMonth ? 'bg-surface-container-lowest' : 'bg-surface-container-low/30'} ${isToday ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`text-xs font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : isCurrentMonth ? 'text-on-surface' : 'text-on-surface-variant/40'}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-0.5 overflow-hidden max-h-[60px]">
                      {dayAppts.map(appt => {
                        const patient = patients.find(p => p.id === appt.patientId);
                        if (!patient) return null;
                        if (appt.type === 'Intake' && !filters.intake) return null;
                        if (appt.type === 'Med Check' && !filters.medCheck) return null;
                        if (appt.type === 'Urgent' && !filters.urgent) return null;
                        return (
                          <div
                            key={appt.id}
                            onClick={e => { e.stopPropagation(); handleAppointmentClick(patient.id); }}
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 ${monthApptColor(appt.type)}`}
                          >
                            {appt.time.replace(':00', '')} {patient.name.split(' ')[0]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Days Header */}
            <div className="grid border-b border-outline-variant/10 bg-surface-container-low/50" style={gridColsStyle}>
              <div className="p-4 border-r border-outline-variant/10 flex items-center justify-center text-xs font-bold text-on-surface-variant uppercase">Time</div>
              {activeDays.map((day, i) => {
                const isToday = formatDateStr(day) === '2024-10-21';
                const apptCount = appointments.filter(a => a.date === formatDateStr(day)).length;
                return (
                  <div key={i} className={`p-4 border-r border-outline-variant/10 text-center ${isToday ? 'bg-primary/5' : ''}`}>
                    <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-on-surface'}`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                    </span>
                    {apptCount > 0 && <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">{apptCount}</span>}
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            <div className="flex-1 overflow-y-auto relative">
              <div className="absolute inset-0 grid pointer-events-none" style={gridColsStyle}>
                <div className="border-r border-outline-variant/10"></div>
                {activeDays.map((day, i) => (
                  <div key={i} className={`border-r border-outline-variant/10 ${formatDateStr(day) === '2024-10-21' ? 'bg-primary/[0.03]' : ''}`}></div>
                ))}
              </div>

              {timeSlots.map(time => (
                <div key={time} className="grid border-b border-outline-variant/10 relative h-24" style={gridColsStyle}>
                  <div className="p-2 text-right text-xs font-bold text-on-surface-variant border-r border-outline-variant/10 pt-3">{time}</div>
                  {activeDays.map((day, i) => {
                    const dateStr = formatDateStr(day);
                    const slot = appointments.filter(a => a.date === dateStr && a.time === time);
                    const colors = apptColor;
                    return (
                      <div
                        key={i}
                        className="p-1 border-r border-outline-variant/10 relative hover:bg-primary/5 cursor-pointer transition-colors group"
                        onClick={() => openNewApptModal(dateStr, time)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="text-[10px] text-primary font-bold">+ Add</span>
                        </div>
                        {slot.map(appt => {
                          const patient = patients.find(p => p.id === appt.patientId);
                          if (!patient) return null;
                          if (appt.type === 'Intake' && !filters.intake) return null;
                          if (appt.type === 'Med Check' && !filters.medCheck) return null;
                          if (appt.type === 'Urgent' && !filters.urgent) return null;
                          const c = colors(appt.type);
                          const height = (appt.duration / 60) * 88;
                          return (
                            <div
                              key={appt.id}
                              onClick={e => { e.stopPropagation(); handleAppointmentClick(patient.id); }}
                              className={`absolute top-1 left-1 right-1 border-l-4 rounded p-2 cursor-pointer hover:opacity-80 z-10 flex flex-col justify-between ${c.bg}`}
                              style={{ height: `${height}px` }}
                            >
                              <div>
                                <p className={`text-xs font-bold truncate ${c.text}`}>{patient.name}</p>
                                <p className={`text-[10px] truncate ${c.text}/80`}>{appt.type} · {appt.duration}m</p>
                                <span className={`text-[9px] font-bold px-1 py-0.5 rounded mt-0.5 inline-block ${appt.status === 'In Lobby' ? 'bg-primary text-white' : appt.status === 'Confirmed' ? 'bg-tertiary/30 text-tertiary' : 'bg-white/50 text-on-surface'}`}>
                                  {appt.status}
                                </span>
                              </div>
                              {height >= 44 && (
                                <button
                                  onClick={e => { e.stopPropagation(); setCurrentPatientId(patient.id); onViewChange('telehealth'); }}
                                  className="mt-1 bg-white/50 hover:bg-white/80 text-on-surface text-[10px] font-bold py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[12px]">videocam</span>
                                  Join
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline font-bold text-on-surface">Schedule Appointment</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Patient *</label>
                <select
                  value={apptForm.patientId}
                  onChange={e => setApptForm({ ...apptForm, patientId: e.target.value })}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={apptForm.date}
                    onChange={e => setApptForm({ ...apptForm, date: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Time *</label>
                  <select
                    value={apptForm.time}
                    onChange={e => setApptForm({ ...apptForm, time: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    value={apptForm.type}
                    onChange={e => setApptForm({ ...apptForm, type: e.target.value as any })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Intake">Intake (60 min)</option>
                    <option value="Med Check">Med Check (20 min)</option>
                    <option value="Urgent">Urgent / Crisis (30 min)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Duration (min)</label>
                  <select
                    value={apptForm.duration}
                    onChange={e => setApptForm({ ...apptForm, duration: Number(e.target.value) })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {[15, 20, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-surface-container-low text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveAppt} className="flex-1 py-3 signature-gradient text-white font-bold rounded-xl hover:opacity-90 transition-all">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
