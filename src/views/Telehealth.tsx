import React, { useState, useEffect } from 'react';
import { ViewType } from '../App';
import { useData } from '../context/DataContext';

interface TelehealthProps {
  onViewChange: (view: ViewType) => void;
}

export default function Telehealth({ onViewChange }: TelehealthProps) {
  const { patients, currentPatientId } = useData();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const patient = patients.find(p => p.id === currentPatientId);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!patient) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[calc(100vh-64px)]">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">videocam_off</span>
        <h2 className="text-xl font-bold text-on-surface-variant">No Patient Selected</h2>
        <p className="text-sm text-on-surface-variant mt-2">Please select a patient from the schedule to start a telehealth visit.</p>
        <button onClick={() => onViewChange('schedule')} className="mt-6 px-4 py-2 bg-primary text-white rounded-lg font-bold">Go to Schedule</button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#1e1e1e] text-white overflow-hidden">
      {/* Video Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Main Video (Patient) */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {patient.image ? (
            <img src={patient.image} alt={patient.name} className="w-full h-full object-cover opacity-90" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold text-5xl mb-4">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <p className="text-xl font-medium text-white/80">{patient.name}</p>
            </div>
          )}
          
          {/* Call Info Overlay */}
          <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
            <span className="font-mono font-bold text-sm">{formatTime(callDuration)}</span>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <span className="font-medium text-sm">{patient.name}</span>
          </div>
        </div>

        {/* Self View (Provider) */}
        <div className="absolute bottom-24 right-6 w-48 h-32 bg-surface-container-highest rounded-xl border-2 border-white/10 overflow-hidden shadow-2xl">
          {isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center bg-[#2d2d2d]">
              <span className="material-symbols-outlined text-white/50 text-3xl">videocam_off</span>
            </div>
          ) : (
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvPGfAkZs8oJ44KvtlmlE2XTgNpDq2SD5F_jTs30tDNxFNvaDdlCuC5nkxM_PCzj6XIJk4O2AHTUNzMQqMeSJFeSXyMzRcDWCudBTzEvEpYDz9xMaV0LpKqGZLGrHg1J7mIBzU6fpXZM5mFnTGKSPb824Nh9dS64mYE70XukgirrKPwHfs6b0Y_zcG289b11SvbANn4UwQzgLxK-IpsSKSIuHHOUcESr9E2mXcoLg8xH6La2J8sPN-7ZE2SmCbjkMawrrlCy7NoBVo" alt="Provider" className="w-full h-full object-cover" />
          )}
          <div className="absolute bottom-2 left-2 text-xs font-medium bg-black/60 px-2 py-1 rounded">You</div>
        </div>

        {/* Controls */}
        <div className="h-20 bg-[#1e1e1e] flex items-center justify-center gap-4 border-t border-white/10">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-error text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            <span className="material-symbols-outlined">{isMuted ? 'mic_off' : 'mic'}</span>
          </button>
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-error text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            <span className="material-symbols-outlined">{isVideoOff ? 'videocam_off' : 'videocam'}</span>
          </button>
          <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">screen_share</span>
          </button>
          <button 
            onClick={() => {
              if(window.confirm('End telehealth visit?')) {
                onViewChange('new_note');
              }
            }}
            className="w-16 h-12 rounded-full bg-error hover:bg-error/80 text-white flex items-center justify-center transition-colors ml-4"
          >
            <span className="material-symbols-outlined">call_end</span>
          </button>
        </div>
      </div>

      {/* Side Panel (Chart/Notes) */}
      <div className="w-96 bg-surface border-l border-outline-variant/10 flex flex-col text-on-surface">
        <div className="p-4 border-b border-outline-variant/10 bg-surface-container-lowest flex justify-between items-center">
          <h3 className="font-headline font-bold text-lg">Quick Chart</h3>
          <button onClick={() => onViewChange('patients')} className="text-primary text-sm font-bold hover:underline">Full Chart</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-2">Patient Info</h4>
            <div className="bg-surface-container-low p-3 rounded-lg">
              <p className="font-bold">{patient.name}</p>
              <p className="text-sm text-on-surface-variant">DOB: {patient.dob} ({patient.age})</p>
              <p className="text-sm text-on-surface-variant">MRN: {patient.mrn}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-2">Active Diagnoses</h4>
            <div className="space-y-2">
              {patient.diagnoses.map(dx => (
                <div key={dx.code} className="bg-surface-container-low p-2 rounded-lg text-sm">
                  <span className="font-bold">{dx.code}</span> - {dx.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-2">Scratchpad</h4>
            <textarea 
              className="w-full h-48 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              placeholder="Jot down quick notes during the call. You can copy these to your official progress note later..."
            ></textarea>
            <button onClick={() => onViewChange('new_note')} className="w-full mt-3 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors">
              Start Official Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
