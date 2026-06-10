import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  initialPatients, initialAppointments, initialNotes, initialMedications,
  initialLabs, initialOrders, initialDocuments, initialOutcomes, initialMessages,
  initialReferrals, initialPriorAuths, initialVitals, initialSafetyPlans,
} from '../data/seed';

export interface Patient {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  age: string;
  gender: string;
  image: string;
  allergies: string[];
  riskScore: 'Low' | 'Moderate' | 'High' | 'Severe';
  suicidalIdeation: string;
  diagnoses: { code: string; name: string; severity: string }[];
  phone?: string;
  email?: string;
  insurance?: string;
  lastVisit?: string;
  nextAppt?: string;
  provider?: string;
  emergencyContact?: { name: string; phone: string; relationship: string };
  preferredPharmacy?: string;
  primaryCare?: string;
  memberId?: string;
  groupNumber?: string;
  pronouns?: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  sig: string;
  dispense: string;
  refills: number;
  status: 'Active' | 'Stopped';
  stopDate?: string;
  stopReason?: string;
}

export interface Note {
  id: string;
  patientId: string;
  date: string;
  author: string;
  type: string;
  subjective: string;
  objective: any;
  assessment: string;
  plan: string;
  billing?: {
    cptCode: string;
    icd10Codes: string[];
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  duration: number;
  type: 'Intake' | 'Med Check' | 'Urgent';
  status: 'Scheduled' | 'Confirmed' | 'In Lobby' | 'Completed';
}

export interface Lab {
  id: string;
  patientId: string;
  date: string;
  testName: string;
  result: string;
  unit: string;
  referenceRange: string;
  flag: 'Normal' | 'High' | 'Low' | 'Critical';
  orderedBy?: string;
  status?: 'Resulted' | 'Pending' | 'In Progress';
}

export interface Order {
  id: string;
  patientId: string;
  date: string;
  type: string;
  description: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  orderedBy?: string;
}

export interface Document {
  id: string;
  patientId: string;
  date: string;
  title: string;
  type: string;
  author: string;
}

export interface Outcome {
  id: string;
  patientId: string;
  date: string;
  phq9: number | null;
  gad7: number | null;
  sleepHours: number | null;
  mood: number | null;
}

export interface Message {
  id: string;
  threadId: string;
  from: string;
  fromRole: 'Patient' | 'Provider' | 'System';
  to: string;
  subject: string;
  body: string;
  date: string;
  time: string;
  read: boolean;
  patientId?: string;
}

export interface Referral {
  id: string;
  patientId: string;
  date: string;
  referredTo: string;
  specialty: string;
  reason: string;
  urgency: 'Routine' | 'Urgent' | 'STAT';
  status: 'Pending' | 'Accepted' | 'Completed' | 'Declined';
  notes?: string;
  scheduledDate?: string;
}

export interface PriorAuth {
  id: string;
  patientId: string;
  medication: string;
  indication: string;
  insurancePlan: string;
  submittedDate?: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Denied' | 'Appealing';
  determinationDate?: string;
  expirationDate?: string;
  notes?: string;
}

export interface Vital {
  id: string;
  patientId: string;
  date: string;
  weight?: number;       // lbs
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  height?: number;       // inches
  bmi?: number;
  notes?: string;
  recordedBy?: string;
}

export interface SafetyPlan {
  id: string;
  patientId: string;
  updatedDate: string;
  warningSigns: string[];
  internalCoping: string[];
  socialDistraction: { name: string; phone: string }[];
  crisisContacts: { name: string; phone: string; relationship: string }[];
  professionalContacts: { name: string; phone: string; available: string }[];
  meansRestriction: string;
  reasonsForLiving: string[];
  signedByPatient: boolean;
  signedByProvider: boolean;
}

interface DataContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  currentPatientId: string | null;
  setCurrentPatientId: (id: string | null) => void;
  medications: Medication[];
  addMedication: (med: Omit<Medication, 'id'>) => void;
  stopMedication: (id: string) => void;
  notes: Note[];
  addNote: (note: Omit<Note, 'id'>) => void;
  appointments: Appointment[];
  addAppointment: (appt: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  cancelAppointment: (id: string) => void;
  labs: Lab[];
  addLab: (lab: Omit<Lab, 'id'>) => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => void;
  documents: Document[];
  outcomes: Outcome[];
  addOutcome: (outcome: Omit<Outcome, 'id'>) => void;
  tasks: { id: string; text: string; done: boolean }[];
  toggleTask: (id: string) => void;
  addTask: (text: string) => void;
  deleteTask: (id: string) => void;
  alerts: { id: string; type: string; message: string; patientId?: string; severity: string }[];
  dismissAlert: (id: string) => void;
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id'>) => void;
  markMessageRead: (id: string) => void;
  referrals: Referral[];
  addReferral: (ref: Omit<Referral, 'id'>) => void;
  updateReferralStatus: (id: string, status: Referral['status']) => void;
  priorAuths: PriorAuth[];
  addPriorAuth: (pa: Omit<PriorAuth, 'id'>) => void;
  updatePriorAuthStatus: (id: string, status: PriorAuth['status']) => void;
  vitals: Vital[];
  addVital: (v: Omit<Vital, 'id'>) => void;
  safetyPlans: SafetyPlan[];
  upsertSafetyPlan: (sp: Omit<SafetyPlan, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Helper: returns an ISO date string offset by `days` from today (negative = past, positive = future)
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useLocalStorage<Patient[]>('ehr_patients_r3', initialPatients);
  const [currentPatientId, setCurrentPatientId] = useLocalStorage<string | null>('ehr_currentPatientId_r2', 'p1');
  const [medications, setMedications] = useLocalStorage<Medication[]>('ehr_medications_r3', initialMedications);
  const [notes, setNotes] = useLocalStorage<Note[]>('ehr_notes_r2', initialNotes);
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('ehr_appointments_r3', initialAppointments);
  const [labs, setLabs] = useLocalStorage<Lab[]>('ehr_labs_r3', initialLabs);
  const [orders, setOrders] = useLocalStorage<Order[]>('ehr_orders_r2', initialOrders);
  const [documents] = useLocalStorage<Document[]>('ehr_documents_r2', initialDocuments);
  const [outcomes, setOutcomes] = useLocalStorage<Outcome[]>('ehr_outcomes_r2', initialOutcomes);
  const [messages, setMessages] = useLocalStorage<Message[]>('ehr_messages_r2', initialMessages);
  const [referrals, setReferrals] = useLocalStorage<Referral[]>('ehr_referrals_r2', initialReferrals);
  const [priorAuths, setPriorAuths] = useLocalStorage<PriorAuth[]>('ehr_prior_auths_r2', initialPriorAuths);
  const [vitals, setVitals] = useLocalStorage<Vital[]>('ehr_vitals_r3', initialVitals);
  const [safetyPlans, setSafetyPlans] = useLocalStorage<SafetyPlan[]>('ehr_safety_plans_r2', initialSafetyPlans);

  const [tasks, setTasks] = useLocalStorage('ehr_tasks_r2', [
    { id: 't1', text: 'Sign 3 Progress Notes', done: false },
    { id: 't2', text: 'Refill Request: Fluoxetine (Maria Rodriguez)', done: false },
    { id: 't3', text: 'Prior Auth: Spravato (Elias Thorne)', done: false },
    { id: 't4', text: 'Review Lithium levels — John Wick', done: false },
    { id: 't5', text: 'Call IOP re: Sarah Miller intake', done: false },
  ]);

  const [alerts, setAlerts] = useLocalStorage('ehr_alerts_r2', [
    { id: 'al1', type: 'Risk Assessment Due', message: 'Patient Sarah Miller reported ideation on daily check-in. Immediate review required.', patientId: 'p4', severity: 'High' },
    { id: 'al2', type: 'Lab Results Ready', message: 'Lithium levels for John Wick are available (Crit Low: 0.4 mEq/L).', patientId: 'p5', severity: 'High' },
    { id: 'al3', type: 'Severe Risk Patient', message: 'Priya Nair flagged as Severe risk. Active ideation with plan — immediate follow-up required.', patientId: 'p8', severity: 'High' },
  ]);

  const addMedication = (med: Omit<Medication, 'id'>) => {
    setMedications(prev => [{ ...med, id: `m${Date.now()}` }, ...prev]);
  };
  const stopMedication = (id: string) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, status: 'Stopped' } : m));
  };
  const addNote = (note: Omit<Note, 'id'>) => {
    setNotes(prev => [{ ...note, id: `n${Date.now()}` }, ...prev]);
  };
  const addAppointment = (appt: Omit<Appointment, 'id'>) => {
    setAppointments(prev => [...prev, { ...appt, id: `a${Date.now()}` }]);
  };
  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };
  const cancelAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };
  const addLab = (lab: Omit<Lab, 'id'>) => {
    setLabs(prev => [{ ...lab, id: `l${Date.now()}` }, ...prev]);
  };
  const addOrder = (order: Omit<Order, 'id'>) => {
    setOrders(prev => [{ ...order, id: `o${Date.now()}` }, ...prev]);
  };
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };
  const addTask = (text: string) => {
    setTasks(prev => [...prev, { id: `t${Date.now()}`, text, done: false }]);
  };
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };
  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };
  const addOutcome = (outcome: Omit<Outcome, 'id'>) => {
    setOutcomes(prev => [...prev, { ...outcome, id: `out${Date.now()}` }]);
  };
  const addMessage = (msg: Omit<Message, 'id'>) => {
    setMessages(prev => [{ ...msg, id: `msg${Date.now()}` }, ...prev]);
  };
  const markMessageRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };
  const addReferral = (ref: Omit<Referral, 'id'>) => {
    setReferrals(prev => [{ ...ref, id: `ref${Date.now()}` }, ...prev]);
  };
  const updateReferralStatus = (id: string, status: Referral['status']) => {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };
  const addPriorAuth = (pa: Omit<PriorAuth, 'id'>) => {
    setPriorAuths(prev => [{ ...pa, id: `pa${Date.now()}` }, ...prev]);
  };
  const updatePriorAuthStatus = (id: string, status: PriorAuth['status']) => {
    setPriorAuths(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };
  const addVital = (v: Omit<Vital, 'id'>) => {
    setVitals(prev => [{ ...v, id: `v${Date.now()}` }, ...prev]);
  };
  const addPatient = (patient: Omit<Patient, 'id'>) => {
    const newId = `p${Date.now()}`;
    const mrn = `MRN${Math.floor(100000 + Math.random() * 900000)}`;
    setPatients(prev => [...prev, { ...patient, id: newId, mrn }]);
  };
  const upsertSafetyPlan = (sp: Omit<SafetyPlan, 'id'>) => {
    setSafetyPlans(prev => {
      const existing = prev.find(p => p.patientId === sp.patientId);
      if (existing) return prev.map(p => p.patientId === sp.patientId ? { ...sp, id: existing.id } : p);
      return [{ ...sp, id: `sp${Date.now()}` }, ...prev];
    });
  };

  return (
    <DataContext.Provider value={{
      patients, addPatient, currentPatientId, setCurrentPatientId,
      medications, addMedication, stopMedication,
      notes, addNote,
      appointments, addAppointment, updateAppointmentStatus, cancelAppointment,
      labs, addLab,
      orders, addOrder,
      documents,
      outcomes, addOutcome,
      tasks, toggleTask, addTask, deleteTask,
      alerts, dismissAlert,
      messages, addMessage, markMessageRead,
      referrals, addReferral, updateReferralStatus,
      priorAuths, addPriorAuth, updatePriorAuthStatus,
      vitals, addVital,
      safetyPlans, upsertSafetyPlan,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
