import React, { createContext, useContext, useState, ReactNode } from 'react';

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
function d(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

const initialPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Elias Thorne',
    mrn: '8829104-X',
    dob: '1978-01-14',
    age: '48yo',
    gender: 'Male',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxcPrlspdTeQWh5T-nbbPoWHlhk4Xb1c_BlFKDIg0cnsDMlW1BVMefxFcNbWylrJ0pLOeu1GXaqlXdpKVyM7k7-E80bNvBf35-wIt_82_v4X6_yzdN6N-duFb2NC5F20BG2SDm7flSR5vqCjQZ2QqbD5AJV1uRURnaf5JjcEui8Cu3nxAzURbO2dEprFkLIJOgRbLP8ifQtqn1f2GBKCeGQPsbrEIHr7b2LhqAA8_E6f8Bl-oEwzczQLJ_iPbtcHV49klJ_uBcahlo',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    riskScore: 'Low',
    suicidalIdeation: 'Stable / None',
    diagnoses: [
      { code: 'F33.1', name: 'MDD, Recurrent', severity: 'Moderate' },
      { code: 'F41.1', name: 'Generalized Anxiety', severity: 'Persistent' }
    ],
    phone: '(206) 555-0112',
    email: 'e.thorne@email.com',
    insurance: 'Blue Cross Blue Shield',
    lastVisit: d(-3),
    nextAppt: d(25),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Carol Thorne', phone: '(206) 555-0113', relationship: 'Wife' },
    preferredPharmacy: 'CVS Pharmacy #10293 · (206) 555-0192',
    primaryCare: 'Dr. Mark Sullivan, MD — Virginia Mason',
    memberId: 'BCBS8829104',
    groupNumber: 'GRP-8821',
    pronouns: 'He/Him',
  },
  {
    id: 'p2',
    name: 'Maria Rodriguez',
    mrn: '7738291-Y',
    dob: '1992-05-22',
    age: '33yo',
    gender: 'Female',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqdoHeeW0aFG5H8qOR6WaNmrITupaq5TByXCH0M_HPgc2Z4XyM08lljwrToEr5xHzn1cC8g8NfhPdTiTqUHSVu5mOX_5KU1YbxHGrI-AcbZruRW9PFY16ZiASsY034LwAb7SmOMwcCFm3pgZXqKCqvnEyil1hJ8bBfTbPmoe_7aiYMjwHmo4y7DfJPysTt2pUsBpZ04aapI8OEkAQJT1bP54pE6nWRMEdThUcHapXgWsrMUdooRaV_7RpRw6-Yeo7WSPw1fHqq5qeu',
    allergies: ['Latex'],
    riskScore: 'Moderate',
    suicidalIdeation: 'Passive Ideation',
    diagnoses: [
      { code: 'F31.9', name: 'Bipolar Disorder, Unspecified', severity: 'Moderate' }
    ],
    phone: '(206) 555-0247',
    email: 'm.rodriguez@email.com',
    insurance: 'Aetna',
    lastVisit: d(-30),
    nextAppt: d(0),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Elena Rodriguez', phone: '(206) 555-0248', relationship: 'Mother' },
    preferredPharmacy: 'Walgreens #4821 · (206) 555-0344',
    primaryCare: 'Dr. Lisa Park, MD — UW Medicine',
    memberId: 'AET7738291',
    groupNumber: 'GRP-5544',
    pronouns: 'She/Her',
  },
  {
    id: 'p3',
    name: 'James Sullivan',
    mrn: '1192837-Z',
    dob: '1985-11-03',
    age: '40yo',
    gender: 'Male',
    image: '',
    allergies: ['None Known'],
    riskScore: 'Low',
    suicidalIdeation: 'None',
    diagnoses: [
      { code: 'F90.0', name: 'ADHD, Predominantly Inattentive', severity: 'Mild' }
    ],
    phone: '(206) 555-0389',
    email: 'j.sullivan@email.com',
    insurance: 'United Healthcare',
    lastVisit: d(-56),
    nextAppt: d(0),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Megan Sullivan', phone: '(206) 555-0390', relationship: 'Wife' },
    preferredPharmacy: 'Bartell Drugs #22 · (206) 555-0571',
    primaryCare: 'Dr. Ben Harper, MD — Swedish Medical',
    memberId: 'UHC1192837',
    groupNumber: 'GRP-3301',
    pronouns: 'He/Him',
  },
  {
    id: 'p4',
    name: 'Sarah Miller',
    mrn: '5548291-A',
    dob: '2001-08-19',
    age: '24yo',
    gender: 'Female',
    image: '',
    allergies: ['Ibuprofen'],
    riskScore: 'High',
    suicidalIdeation: 'Active Ideation (No Plan)',
    diagnoses: [
      { code: 'F43.10', name: 'PTSD', severity: 'Severe' },
      { code: 'F32.2', name: 'MDD, Single Episode, Severe', severity: 'Severe' }
    ],
    phone: '(206) 555-0421',
    email: 's.miller@email.com',
    insurance: 'Medicaid',
    lastVisit: d(-3),
    nextAppt: d(0),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Anne Miller', phone: '(206) 555-0422', relationship: 'Mother' },
    preferredPharmacy: 'Rite Aid #5501 · (206) 555-0689',
    primaryCare: 'Dr. Tricia Okafor, MD — Community Health',
    memberId: 'MCD5548291',
    groupNumber: 'GRP-0001',
    pronouns: 'She/Her',
  },
  {
    id: 'p5',
    name: 'John Wick',
    mrn: '9982731-B',
    dob: '1975-09-02',
    age: '50yo',
    gender: 'Male',
    image: '',
    allergies: ['None Known'],
    riskScore: 'Moderate',
    suicidalIdeation: 'None',
    diagnoses: [
      { code: 'F31.1', name: 'Bipolar I, Current Episode Manic', severity: 'Severe' }
    ],
    phone: '(206) 555-0553',
    email: 'j.wick@email.com',
    insurance: 'Cigna',
    lastVisit: d(-1),
    nextAppt: d(7),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Helen Wick', phone: '(206) 555-0554', relationship: 'Spouse' },
    preferredPharmacy: 'CVS Pharmacy #10293 · (206) 555-0192',
    primaryCare: 'Dr. Andrew Lim, MD — Group Health',
    memberId: 'CGN9982731',
    groupNumber: 'GRP-7712',
    pronouns: 'He/Him',
  },
  {
    id: 'p6',
    name: 'Amara Osei',
    mrn: '3341928-C',
    dob: '1990-03-11',
    age: '36yo',
    gender: 'Female',
    image: '',
    allergies: ['Codeine'],
    riskScore: 'Low',
    suicidalIdeation: 'None',
    diagnoses: [
      { code: 'F41.0', name: 'Panic Disorder', severity: 'Moderate' },
      { code: 'F40.10', name: 'Social Anxiety Disorder', severity: 'Moderate' }
    ],
    phone: '(206) 555-0618',
    email: 'a.osei@email.com',
    insurance: 'Blue Cross Blue Shield',
    lastVisit: d(-15),
    nextAppt: d(15),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Kwame Osei', phone: '(206) 555-0619', relationship: 'Brother' },
    preferredPharmacy: 'Walgreens #4821 · (206) 555-0344',
    primaryCare: 'Dr. Yemi Adeyemi, MD — Harborview',
    memberId: 'BCBS3341928',
    groupNumber: 'GRP-8821',
    pronouns: 'She/Her',
  },
  {
    id: 'p7',
    name: 'David Park',
    mrn: '6674821-D',
    dob: '1968-07-25',
    age: '57yo',
    gender: 'Male',
    image: '',
    allergies: ['Aspirin', 'Benzodiazepines'],
    riskScore: 'Moderate',
    suicidalIdeation: 'None',
    diagnoses: [
      { code: 'F10.20', name: 'Alcohol Use Disorder', severity: 'Severe' },
      { code: 'F33.0', name: 'MDD, Recurrent, Mild', severity: 'Mild' }
    ],
    phone: '(206) 555-0744',
    email: 'd.park@email.com',
    insurance: 'Medicare',
    lastVisit: d(-10),
    nextAppt: d(20),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Janet Park', phone: '(206) 555-0745', relationship: 'Ex-Wife (Emergency Only)' },
    preferredPharmacy: 'Bartell Drugs #22 · (206) 555-0571',
    primaryCare: 'Dr. Sam Choi, MD — Swedish Internal Medicine',
    memberId: 'MCR6674821',
    groupNumber: 'MCR-A',
    pronouns: 'He/Him',
  },
  {
    id: 'p8',
    name: 'Priya Nair',
    mrn: '2219384-E',
    dob: '1996-12-08',
    age: '29yo',
    gender: 'Female',
    image: '',
    allergies: ['None Known'],
    riskScore: 'Severe',
    suicidalIdeation: 'Active Ideation (With Plan)',
    diagnoses: [
      { code: 'F60.3', name: 'Borderline Personality Disorder', severity: 'Severe' },
      { code: 'F32.3', name: 'MDD, Single Episode, Severe w/ Psychosis', severity: 'Severe' }
    ],
    phone: '(206) 555-0891',
    email: 'p.nair@email.com',
    insurance: 'Aetna',
    lastVisit: d(-2),
    nextAppt: d(1),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Deepa Nair', phone: '(206) 555-0892', relationship: 'Mother (legal guardian)' },
    preferredPharmacy: 'CVS Pharmacy #10293 · (206) 555-0192',
    primaryCare: 'Dr. Priti Sharma, MD — UW Medicine',
    memberId: 'AET2219384',
    groupNumber: 'GRP-5544',
    pronouns: 'She/Her',
  },
  {
    id: 'p9',
    name: 'Marcus Thompson',
    mrn: '4423819-F',
    dob: '1982-06-14',
    age: '43yo',
    gender: 'Male',
    image: '',
    allergies: ['Haloperidol (EPS reaction)'],
    riskScore: 'Moderate',
    suicidalIdeation: 'Passive Ideation',
    diagnoses: [
      { code: 'F20.9', name: 'Schizophrenia, Unspecified', severity: 'Moderate' },
      { code: 'F33.0', name: 'MDD, Recurrent, Mild', severity: 'Mild' }
    ],
    phone: '(206) 555-0923',
    email: 'm.thompson@email.com',
    insurance: 'Medicaid',
    lastVisit: d(-14),
    nextAppt: d(14),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Gloria Thompson', phone: '(206) 555-0924', relationship: 'Mother' },
    preferredPharmacy: 'Bartell Drugs #22 · (206) 555-0571',
    primaryCare: 'Dr. James Patel, MD — Swedish Primary Care',
    memberId: 'MCD9923481',
    groupNumber: 'GRP-0001',
    pronouns: 'He/Him',
  },
  {
    id: 'p10',
    name: 'Linda Chen',
    mrn: '7712938-G',
    dob: '1963-02-28',
    age: '63yo',
    gender: 'Female',
    image: '',
    allergies: ['Sulfa Drugs', 'Tramadol (serotonin syndrome hx)'],
    riskScore: 'Low',
    suicidalIdeation: 'None',
    diagnoses: [
      { code: 'F33.1', name: 'MDD, Recurrent, Moderate', severity: 'Moderate' },
      { code: 'F41.1', name: 'Generalized Anxiety Disorder', severity: 'Mild' }
    ],
    phone: '(206) 555-0341',
    email: 'l.chen@email.com',
    insurance: 'Medicare',
    lastVisit: d(-21),
    nextAppt: d(21),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Kevin Chen', phone: '(206) 555-0342', relationship: 'Son' },
    preferredPharmacy: 'CVS Pharmacy #10293 · (206) 555-0192',
    primaryCare: 'Dr. Amy Nguyen, MD — UW Medicine',
    memberId: 'MCR1029384',
    groupNumber: 'MCR-A',
    pronouns: 'She/Her',
  },
  {
    id: 'p11',
    name: 'Tyler Brooks',
    mrn: '8836472-H',
    dob: '1997-09-05',
    age: '28yo',
    gender: 'Male',
    image: '',
    allergies: ['None Known'],
    riskScore: 'Low',
    suicidalIdeation: 'None',
    diagnoses: [
      { code: 'F42.2', name: 'OCD — Mixed Obsessional Thoughts and Acts', severity: 'Moderate' },
      { code: 'F32.1', name: 'MDD, Single Episode, Moderate', severity: 'Moderate' }
    ],
    phone: '(206) 555-0184',
    email: 't.brooks@email.com',
    insurance: 'United Healthcare',
    lastVisit: d(-7),
    nextAppt: d(21),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Sandra Brooks', phone: '(206) 555-0185', relationship: 'Mother' },
    preferredPharmacy: 'Walgreens #4821 · (206) 555-0344',
    primaryCare: 'Dr. Chris Monroe, MD — Group Health',
    memberId: 'UHC2938471',
    groupNumber: 'GRP-2291',
    pronouns: 'He/Him',
  },
  {
    id: 'p12',
    name: 'Nina Vasquez',
    mrn: '5529183-I',
    dob: '1980-11-17',
    age: '45yo',
    gender: 'Female',
    image: '',
    allergies: ['Lithium (toxicity at therapeutic levels)'],
    riskScore: 'Moderate',
    suicidalIdeation: 'Passive Ideation',
    diagnoses: [
      { code: 'F31.81', name: 'Bipolar II Disorder', severity: 'Moderate' },
      { code: 'F90.0', name: 'ADHD, Predominantly Inattentive', severity: 'Mild' }
    ],
    phone: '(206) 555-0677',
    email: 'n.vasquez@email.com',
    insurance: 'Cigna',
    lastVisit: d(-5),
    nextAppt: d(28),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Carlos Vasquez', phone: '(206) 555-0678', relationship: 'Husband' },
    preferredPharmacy: 'Rite Aid #5501 · (206) 555-0689',
    primaryCare: 'Dr. Patricia Lee, MD — Virginia Mason',
    memberId: 'CGN1192837',
    groupNumber: 'GRP-4421',
    pronouns: 'She/Her',
  },
  {
    id: 'p13',
    name: 'Omar Hassan',
    mrn: '3318274-J',
    dob: '1990-04-22',
    age: '36yo',
    gender: 'Male',
    image: '',
    allergies: ['Quetiapine (severe sedation)'],
    riskScore: 'High',
    suicidalIdeation: 'Active Ideation (No Plan)',
    diagnoses: [
      { code: 'F43.10', name: 'PTSD, Unspecified', severity: 'Severe' },
      { code: 'G47.00', name: 'Insomnia Disorder', severity: 'Moderate' }
    ],
    phone: '(206) 555-0812',
    email: 'o.hassan@email.com',
    insurance: 'Tricare',
    lastVisit: d(-4),
    nextAppt: d(3),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Fatima Hassan', phone: '(206) 555-0813', relationship: 'Wife' },
    preferredPharmacy: 'CVS Pharmacy #10293 · (206) 555-0192',
    primaryCare: 'Dr. Rachel Stone, MD — VA Puget Sound',
    memberId: 'TRC8821930',
    groupNumber: 'GRP-TRC',
    pronouns: 'He/Him',
  },
  {
    id: 'p14',
    name: 'Claire Johansson',
    mrn: '1147392-K',
    dob: '2005-07-30',
    age: '20yo',
    gender: 'Female',
    image: '',
    allergies: ['None Known'],
    riskScore: 'High',
    suicidalIdeation: 'Passive Ideation',
    diagnoses: [
      { code: 'F50.00', name: 'Anorexia Nervosa, Restricting Type', severity: 'Severe' },
      { code: 'F41.1', name: 'Generalized Anxiety Disorder', severity: 'Moderate' }
    ],
    phone: '(206) 555-0291',
    email: 'c.johansson@email.com',
    insurance: 'Blue Cross Blue Shield',
    lastVisit: d(-2),
    nextAppt: d(5),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Ingrid Johansson', phone: '(206) 555-0292', relationship: 'Mother' },
    preferredPharmacy: 'Walgreens #4821 · (206) 555-0344',
    primaryCare: 'Dr. Monica Patel, MD — Seattle Children\'s (Adult Transition)',
    memberId: 'BCBS3847291',
    groupNumber: 'GRP-1199',
    pronouns: 'She/Her',
  },
  {
    id: 'p15',
    name: 'Robert Kim',
    mrn: '9901827-L',
    dob: '1954-12-09',
    age: '71yo',
    gender: 'Male',
    image: '',
    allergies: ['Tricyclic Antidepressants (orthostatic hypotension)'],
    riskScore: 'Moderate',
    suicidalIdeation: 'Passive Ideation',
    diagnoses: [
      { code: 'F33.2', name: 'MDD, Recurrent, Severe (w/o psychosis)', severity: 'Severe' },
      { code: 'G31.84', name: 'Mild Cognitive Impairment', severity: 'Mild' }
    ],
    phone: '(206) 555-0456',
    email: 'r.kim@email.com',
    insurance: 'Medicare',
    lastVisit: d(-8),
    nextAppt: d(22),
    provider: 'Dr. Sarah Jenkins',
    emergencyContact: { name: 'Susan Kim', phone: '(206) 555-0457', relationship: 'Daughter' },
    preferredPharmacy: 'CVS Pharmacy #10293 · (206) 555-0192',
    primaryCare: 'Dr. Harold Wong, MD — Group Health Geriatrics',
    memberId: 'MCR7710293',
    groupNumber: 'MCR-B',
    pronouns: 'He/Him',
  },
];

const initialAppointments: Appointment[] = [
  { id: 'a1', patientId: 'p3', date: d(0),  time: '9:00 AM',  duration: 60, type: 'Intake',    status: 'Confirmed' },
  { id: 'a2', patientId: 'p2', date: d(0),  time: '10:00 AM', duration: 20, type: 'Med Check', status: 'In Lobby' },
  { id: 'a3', patientId: 'p4', date: d(0),  time: '1:00 PM',  duration: 30, type: 'Urgent',    status: 'Scheduled' },
  { id: 'a6', patientId: 'p1', date: d(0),  time: '2:00 PM',  duration: 60, type: 'Med Check', status: 'Scheduled' },
  { id: 'a4', patientId: 'p1', date: d(1),  time: '9:00 AM',  duration: 60, type: 'Intake',    status: 'Scheduled' },
  { id: 'a5', patientId: 'p5', date: d(1),  time: '10:00 AM', duration: 60, type: 'Intake',    status: 'Scheduled' },
  { id: 'a8', patientId: 'p8', date: d(1),  time: '2:00 PM',  duration: 60, type: 'Urgent',    status: 'Confirmed' },
  { id: 'a7', patientId: 'p6', date: d(2),  time: '11:00 AM', duration: 45, type: 'Med Check', status: 'Scheduled' },
  { id: 'a9', patientId: 'p7', date: d(2),  time: '3:00 PM',  duration: 30, type: 'Med Check', status: 'Scheduled' },
  { id: 'a10',patientId: 'p2', date: d(4),  time: '9:30 AM',  duration: 60, type: 'Intake',    status: 'Scheduled' },
  { id: 'a11',patientId: 'p3', date: d(7),  time: '11:00 AM', duration: 20, type: 'Med Check', status: 'Scheduled' },
  { id: 'a12',patientId: 'p4', date: d(7),  time: '1:30 PM',  duration: 30, type: 'Urgent',    status: 'Scheduled' },
  { id: 'a13', patientId: 'p14', date: d(0),  time: '3:00 PM',  duration: 45, type: 'Urgent',    status: 'Confirmed' },
  { id: 'a14', patientId: 'p13', date: d(3),  time: '10:00 AM', duration: 60, type: 'Med Check', status: 'Scheduled' },
  { id: 'a15', patientId: 'p9',  date: d(14), time: '9:00 AM',  duration: 30, type: 'Med Check', status: 'Scheduled' },
  { id: 'a16', patientId: 'p10', date: d(21), time: '2:00 PM',  duration: 30, type: 'Med Check', status: 'Scheduled' },
  { id: 'a17', patientId: 'p11', date: d(21), time: '11:00 AM', duration: 45, type: 'Intake',    status: 'Scheduled' },
  { id: 'a18', patientId: 'p12', date: d(28), time: '1:00 PM',  duration: 45, type: 'Med Check', status: 'Scheduled' },
  { id: 'a19', patientId: 'p15', date: d(22), time: '3:30 PM',  duration: 30, type: 'Med Check', status: 'Scheduled' },
];

const initialNotes: Note[] = [
  {
    id: 'n1', patientId: 'p1', date: d(-90), author: 'Dr. Sarah Jenkins', type: 'Initial Intake',
    subjective: 'Patient presents with recurring depressive episodes over the last 6 months. Reports insomnia and decreased appetite. Denies active SI but mentions passive "weariness".',
    objective: { appearance: true, affectApprop: true, linear: true },
    assessment: '48yo male with recurrent MDD, currently in partial remission.',
    plan: 'Start Escitalopram 10mg daily. Follow up in 2 weeks.'
  },
  {
    id: 'n2', patientId: 'p2', date: d(-30), author: 'Dr. Sarah Jenkins', type: 'Med Check',
    subjective: 'Patient reports mood is stable. Sleep is improved on current regimen.',
    objective: { appearance: true, affectApprop: true, linear: true },
    assessment: '33yo female with Bipolar Disorder, currently stable.',
    plan: 'Continue current medications. Follow up in 3 months.'
  },
  {
    id: 'n3', patientId: 'p4', date: d(-3), author: 'Dr. Sarah Jenkins', type: 'Crisis Assessment',
    subjective: 'Patient reports increasing SI with no specific plan. Endorses hopelessness and anhedonia. Recent trauma exposure related to prior incident.',
    objective: { appearance: false, affectApprop: false, linear: true },
    assessment: '24yo female with PTSD and severe MDD, currently in crisis. Active SI without plan.',
    plan: '1. Safety plan reviewed and updated. 2. Crisis line number provided. 3. Increased frequency to weekly. 4. Consider referral to IOP.'
  },
  {
    id: 'n4', patientId: 'p7', date: d(-10), author: 'Dr. Sarah Jenkins', type: 'Progress Note',
    subjective: 'Patient is 45 days sober. Reports strong cravings but engaging with AA. Sleep has improved significantly.',
    objective: { appearance: true, affectApprop: true, linear: true },
    assessment: '57yo male with AUD in early remission and mild MDD.',
    plan: '1. Continue Naltrexone 50mg. 2. Continue attending AA 3x/week. 3. Follow up in 4 weeks.'
  }
];

const initialMedications: Medication[] = [
  { id: 'm1', patientId: 'p1', name: 'Escitalopram (Lexapro)', dose: '20mg Oral Tablet', sig: 'Take 1 tablet by mouth daily in the morning.', dispense: '30 Tablet(s)', refills: 3, status: 'Active' },
  { id: 'm2', patientId: 'p1', name: 'Bupropion XL (Wellbutrin XL)', dose: '150mg Oral Tablet Extended Release 24 Hour', sig: 'Take 1 tablet by mouth daily in the morning.', dispense: '30 Tablet(s)', refills: 3, status: 'Active' },
  { id: 'm3', patientId: 'p2', name: 'Lamotrigine (Lamictal)', dose: '100mg Oral Tablet', sig: 'Take 1 tablet by mouth daily.', dispense: '30 Tablet(s)', refills: 2, status: 'Active' },
  { id: 'm4', patientId: 'p5', name: 'Lithium Carbonate', dose: '300mg Oral Capsule', sig: 'Take 2 capsules by mouth at bedtime.', dispense: '60 Capsule(s)', refills: 1, status: 'Active' },
  { id: 'm5', patientId: 'p2', name: 'Quetiapine (Seroquel)', dose: '50mg Oral Tablet', sig: 'Take 1 tablet by mouth at bedtime.', dispense: '30 Tablet(s)', refills: 2, status: 'Active' },
  { id: 'm6', patientId: 'p3', name: 'Amphetamine Salts (Adderall XR)', dose: '20mg Oral Capsule Extended Release', sig: 'Take 1 capsule by mouth each morning.', dispense: '30 Capsule(s)', refills: 0, status: 'Active' },
  { id: 'm7', patientId: 'p4', name: 'Sertraline (Zoloft)', dose: '100mg Oral Tablet', sig: 'Take 1 tablet by mouth daily.', dispense: '30 Tablet(s)', refills: 2, status: 'Active' },
  { id: 'm8', patientId: 'p4', name: 'Prazosin', dose: '1mg Oral Tablet', sig: 'Take 1 tablet by mouth at bedtime for nightmares.', dispense: '30 Tablet(s)', refills: 1, status: 'Active' },
  { id: 'm9', patientId: 'p7', name: 'Naltrexone (Vivitrol)', dose: '50mg Oral Tablet', sig: 'Take 1 tablet by mouth daily.', dispense: '30 Tablet(s)', refills: 2, status: 'Active' },
  { id: 'm10', patientId: 'p6', name: 'Escitalopram (Lexapro)', dose: '10mg Oral Tablet', sig: 'Take 1 tablet by mouth daily.', dispense: '30 Tablet(s)', refills: 3, status: 'Active' },
  { id: 'm11', patientId: 'p6', name: 'Propranolol', dose: '10mg Oral Tablet', sig: 'Take 1 tablet by mouth as needed before anxiety-provoking situations.', dispense: '30 Tablet(s)', refills: 2, status: 'Active' },
  { id: 'm12', patientId: 'p8', name: 'Aripiprazole (Abilify)', dose: '10mg Oral Tablet', sig: 'Take 1 tablet by mouth daily.', dispense: '30 Tablet(s)', refills: 1, status: 'Active' },
  { id: 'm13', patientId: 'p9',  name: 'Risperidone (Risperdal)', dose: '2mg Oral Tablet', sig: 'Take 1 tablet by mouth twice daily.', dispense: '60 Tablet(s)', refills: 2, status: 'Active' },
  { id: 'm14', patientId: 'p9',  name: 'Benztropine (Cogentin)', dose: '1mg Oral Tablet', sig: 'Take 1 tablet by mouth daily to prevent EPS.', dispense: '30 Tablet(s)', refills: 3, status: 'Active' },
  { id: 'm15', patientId: 'p10', name: 'Sertraline (Zoloft)', dose: '50mg Oral Tablet', sig: 'Take 1 tablet by mouth daily in the morning.', dispense: '30 Tablet(s)', refills: 3, status: 'Active' },
  { id: 'm16', patientId: 'p10', name: 'Mirtazapine (Remeron)', dose: '15mg Oral Tablet', sig: 'Take 1 tablet by mouth at bedtime.', dispense: '30 Tablet(s)', refills: 2, status: 'Active' },
  { id: 'm17', patientId: 'p11', name: 'Fluvoxamine (Luvox)', dose: '100mg Oral Tablet', sig: 'Take 1 tablet by mouth at bedtime.', dispense: '30 Tablet(s)', refills: 2, status: 'Active' },
  { id: 'm18', patientId: 'p12', name: 'Lamotrigine (Lamictal)', dose: '150mg Oral Tablet', sig: 'Take 1 tablet by mouth daily.', dispense: '30 Tablet(s)', refills: 2, status: 'Active' },
  { id: 'm19', patientId: 'p12', name: 'Lisdexamfetamine (Vyvanse)', dose: '30mg Oral Capsule', sig: 'Take 1 capsule by mouth each morning.', dispense: '30 Capsule(s)', refills: 0, status: 'Active' },
  { id: 'm20', patientId: 'p13', name: 'Sertraline (Zoloft)', dose: '150mg Oral Tablet', sig: 'Take 1.5 tablets by mouth daily.', dispense: '45 Tablet(s)', refills: 2, status: 'Active' },
  { id: 'm21', patientId: 'p13', name: 'Prazosin', dose: '2mg Oral Tablet', sig: 'Take 1 tablet by mouth at bedtime for nightmares.', dispense: '30 Tablet(s)', refills: 2, status: 'Active' },
  { id: 'm22', patientId: 'p14', name: 'Escitalopram (Lexapro)', dose: '10mg Oral Tablet', sig: 'Take 1 tablet by mouth daily. (Note: use with caution given BMI)', dispense: '30 Tablet(s)', refills: 1, status: 'Active' },
  { id: 'm23', patientId: 'p15', name: 'Mirtazapine (Remeron)', dose: '30mg Oral Tablet', sig: 'Take 1 tablet by mouth at bedtime.', dispense: '30 Tablet(s)', refills: 3, status: 'Active' },
  // Stopped medications (history)
  { id: 'm24', patientId: 'p1',  name: 'Sertraline (Zoloft)', dose: '100mg Oral Tablet', sig: 'Take 1 tablet by mouth daily.', dispense: '30 Tablet(s)', refills: 0, status: 'Stopped', stopDate: d(-180), stopReason: 'Inadequate response after 8 weeks. Switched to Escitalopram.' },
  { id: 'm25', patientId: 'p2',  name: 'Lithium Carbonate', dose: '300mg Oral Capsule', sig: 'Take 2 capsules by mouth at bedtime.', dispense: '60 Capsule(s)', refills: 0, status: 'Stopped', stopDate: d(-90), stopReason: 'GI intolerance and fine tremor. Switched to Lamotrigine + Quetiapine.' },
  { id: 'm26', patientId: 'p4',  name: 'Fluoxetine (Prozac)', dose: '20mg Oral Tablet', sig: 'Take 1 tablet by mouth daily.', dispense: '30 Tablet(s)', refills: 0, status: 'Stopped', stopDate: d(-120), stopReason: 'Worsening anxiety and insomnia. Switched to Sertraline.' },
  { id: 'm27', patientId: 'p9',  name: 'Olanzapine (Zyprexa)', dose: '10mg Oral Tablet', sig: 'Take 1 tablet by mouth at bedtime.', dispense: '30 Tablet(s)', refills: 0, status: 'Stopped', stopDate: d(-60), stopReason: 'Significant weight gain (+22 lbs in 3 months). Switched to Risperidone.' },
];

const initialLabs: Lab[] = [
  { id: 'l1', patientId: 'p1', date: d(-90), testName: 'Comprehensive Metabolic Panel', result: 'WNL', unit: '', referenceRange: '', flag: 'Normal', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l2', patientId: 'p1', date: d(-90), testName: 'TSH', result: '2.1', unit: 'mIU/L', referenceRange: '0.4 - 4.0', flag: 'Normal', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l3', patientId: 'p5', date: d(-1),  testName: 'Lithium Level', result: '0.4', unit: 'mEq/L', referenceRange: '0.6 - 1.2', flag: 'Low', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l4', patientId: 'p5', date: d(-1),  testName: 'Comprehensive Metabolic Panel', result: 'WNL', unit: '', referenceRange: '', flag: 'Normal', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l5', patientId: 'p7', date: d(-14), testName: 'Hepatic Function Panel', result: 'ALT: 62', unit: 'U/L', referenceRange: '7 - 56', flag: 'High', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l6', patientId: 'p7', date: d(-14), testName: 'GGT', result: '89', unit: 'U/L', referenceRange: '8 - 61', flag: 'High', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l7', patientId: 'p2', date: d(-35), testName: 'Thyroid Panel (TSH, Free T4)', result: 'WNL', unit: '', referenceRange: '', flag: 'Normal', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l8', patientId: 'p4', date: d(-3),  testName: 'CBC with Differential', result: 'WNL', unit: '', referenceRange: '', flag: 'Normal', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l9', patientId: 'p1', date: d(-3),  testName: 'Lipid Panel', result: 'Pending', unit: '', referenceRange: '', flag: 'Normal', orderedBy: 'Dr. Sarah Jenkins', status: 'Pending' },
  { id: 'l10', patientId: 'p9',  date: d(-14), testName: 'Fasting Glucose', result: '112', unit: 'mg/dL', referenceRange: '70 - 99', flag: 'High', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l11', patientId: 'p10', date: d(-21), testName: 'Comprehensive Metabolic Panel', result: 'WNL', unit: '', referenceRange: '', flag: 'Normal', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l12', patientId: 'p11', date: d(-7),  testName: 'CBC with Differential', result: 'WNL', unit: '', referenceRange: '', flag: 'Normal', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l13', patientId: 'p12', date: d(-5),  testName: 'Lamotrigine Level', result: '8.2', unit: 'mcg/mL', referenceRange: '3.0 - 14.0', flag: 'Normal', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l14', patientId: 'p13', date: d(-4),  testName: 'Urine Drug Screen', result: 'Negative', unit: '', referenceRange: 'Negative', flag: 'Normal', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l15', patientId: 'p14', date: d(-2),  testName: 'Comprehensive Metabolic Panel', result: 'BMP: Na 134, K 3.1, CO2 29', unit: '', referenceRange: 'Na 136-145, K 3.5-5.0', flag: 'Critical', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l16', patientId: 'p14', date: d(-2),  testName: 'Magnesium Level', result: '1.4', unit: 'mg/dL', referenceRange: '1.7 - 2.2', flag: 'Low', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l17', patientId: 'p15', date: d(-8),  testName: 'B12 / Folate', result: 'B12: 210', unit: 'pg/mL', referenceRange: '200 - 900', flag: 'Normal', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
  { id: 'l18', patientId: 'p15', date: d(-8),  testName: 'Thyroid Panel (TSH, Free T4)', result: 'TSH: 6.8', unit: 'mIU/L', referenceRange: '0.4 - 4.0', flag: 'High', orderedBy: 'Dr. Sarah Jenkins', status: 'Resulted' },
];

const initialOrders: Order[] = [
  { id: 'o1', patientId: 'p1', date: d(-90), type: 'Lab',      description: 'Lipid Panel, Fasting',                          status: 'Completed', orderedBy: 'Dr. Sarah Jenkins' },
  { id: 'o2', patientId: 'p4', date: d(0),   type: 'Referral', description: 'Referral to DBT Skills Group',                  status: 'Pending',   orderedBy: 'Dr. Sarah Jenkins' },
  { id: 'o3', patientId: 'p5', date: d(-1),  type: 'Lab',      description: 'Lithium Level, STAT',                           status: 'Completed', orderedBy: 'Dr. Sarah Jenkins' },
  { id: 'o4', patientId: 'p7', date: d(-14), type: 'Lab',      description: 'Hepatic Function Panel',                        status: 'Completed', orderedBy: 'Dr. Sarah Jenkins' },
  { id: 'o5', patientId: 'p4', date: d(-3),  type: 'Referral', description: 'Intensive Outpatient Program (IOP) Assessment', status: 'Pending',   orderedBy: 'Dr. Sarah Jenkins' },
  { id: 'o6', patientId: 'p1', date: d(-3),  type: 'Lab',      description: 'Lipid Panel, Fasting — Annual',                 status: 'Pending',   orderedBy: 'Dr. Sarah Jenkins' },
];

const initialDocuments: Document[] = [
  { id: 'd1', patientId: 'p1', date: d(-90),  title: 'PHQ-9 Questionnaire',                          type: 'Assessment',       author: 'Patient Portal' },
  { id: 'd2', patientId: 'p1', date: d(-90),  title: 'GAD-7 Questionnaire',                          type: 'Assessment',       author: 'Patient Portal' },
  { id: 'd3', patientId: 'p2', date: d(-180), title: 'Previous Psychiatrist Records',                 type: 'External Records', author: 'Dr. Emily Chen' },
  { id: 'd4', patientId: 'p4', date: d(-3),   title: 'Columbia Suicide Severity Rating Scale (C-SSRS)', type: 'Safety Assessment', author: 'Dr. Sarah Jenkins' },
  { id: 'd5', patientId: 'p4', date: d(-3),   title: 'Safety Plan',                                  type: 'Crisis Document',  author: 'Dr. Sarah Jenkins' },
  { id: 'd6', patientId: 'p7', date: d(-45),  title: 'AUDIT-C Alcohol Screening',                    type: 'Assessment',       author: 'Patient Portal' },
  { id: 'd7', patientId: 'p1', date: d(-3),   title: 'Informed Consent for Treatment',               type: 'Consent',          author: 'Dr. Sarah Jenkins' },
];

const initialOutcomes: Outcome[] = [
  { id: 'out1',  patientId: 'p1', date: d(-270), phq9: 18, gad7: 16, sleepHours: 4.5, mood: 3 },
  { id: 'out2',  patientId: 'p1', date: d(-240), phq9: 19, gad7: 15, sleepHours: 5.0, mood: 3 },
  { id: 'out3',  patientId: 'p1', date: d(-210), phq9: 17, gad7: 14, sleepHours: 4.0, mood: 4 },
  { id: 'out4',  patientId: 'p1', date: d(-180), phq9: 18, gad7: 15, sleepHours: 4.5, mood: 3 },
  { id: 'out5',  patientId: 'p1', date: d(-150), phq9: 12, gad7: 10, sleepHours: 6.0, mood: 5 },
  { id: 'out6',  patientId: 'p1', date: d(-120), phq9: 8,  gad7: 7,  sleepHours: 6.5, mood: 6 },
  { id: 'out7',  patientId: 'p1', date: d(-90),  phq9: 6,  gad7: 5,  sleepHours: 7.0, mood: 7 },
  { id: 'out8',  patientId: 'p1', date: d(-60),  phq9: 5,  gad7: 4,  sleepHours: 7.5, mood: 7 },
  { id: 'out9',  patientId: 'p1', date: d(-30),  phq9: 4,  gad7: 4,  sleepHours: 7.0, mood: 8 },
  { id: 'out10', patientId: 'p1', date: d(-3),   phq9: 3,  gad7: 3,  sleepHours: 7.5, mood: 8 },
  { id: 'out11', patientId: 'p2', date: d(-120), phq9: 14, gad7: 11, sleepHours: 5.0, mood: 4 },
  { id: 'out12', patientId: 'p2', date: d(-90),  phq9: 10, gad7: 9,  sleepHours: 6.0, mood: 5 },
  { id: 'out13', patientId: 'p2', date: d(-60),  phq9: 8,  gad7: 7,  sleepHours: 6.5, mood: 6 },
  { id: 'out14', patientId: 'p2', date: d(-30),  phq9: 6,  gad7: 5,  sleepHours: 7.0, mood: 7 },
  { id: 'out15', patientId: 'p4', date: d(-60),  phq9: 22, gad7: 19, sleepHours: 3.0, mood: 2 },
  { id: 'out16', patientId: 'p4', date: d(-30),  phq9: 20, gad7: 17, sleepHours: 3.5, mood: 2 },
  { id: 'out17', patientId: 'p4', date: d(-3),   phq9: 19, gad7: 18, sleepHours: 3.0, mood: 2 },
];

const initialMessages: Message[] = [
  {
    id: 'msg1', threadId: 'thread1', from: 'Elias Thorne', fromRole: 'Patient', to: 'Dr. Sarah Jenkins',
    subject: 'Question about medication side effects',
    body: 'Hi Dr. Jenkins,\n\nI\'ve been on the Bupropion for about 3 weeks now and I\'ve been having some trouble sleeping — is this normal? It usually takes me over an hour to fall asleep. Should I be concerned?\n\nThank you,\nElias',
    date: d(-3), time: '9:32 AM', read: false, patientId: 'p1'
  },
  {
    id: 'msg2', threadId: 'thread2', from: 'Maria Rodriguez', fromRole: 'Patient', to: 'Dr. Sarah Jenkins',
    subject: 'Requesting refill early — running low',
    body: 'Hello,\n\nI miscounted my Lamictal and I\'m going to run out about 5 days before my next scheduled appointment. Is there any way to send a refill early? I don\'t want to miss any doses.\n\nThank you,\nMaria',
    date: d(-4), time: '4:15 PM', read: false, patientId: 'p2'
  },
  {
    id: 'msg3', threadId: 'thread3', from: 'Dr. Marcus Webb', fromRole: 'Provider', to: 'Dr. Sarah Jenkins',
    subject: 'Re: Sarah Miller — IOP Referral',
    body: 'Sarah,\n\nThanks for the referral on Sarah Miller. We have an opening in our IOP program starting next Monday. The intake coordinator will reach out to her directly. Let me know if you have any questions.\n\nBest,\nDr. Marcus Webb\nAscend Behavioral Health IOP Program',
    date: d(-2), time: '11:08 AM', read: true, patientId: 'p4'
  },
  {
    id: 'msg4', threadId: 'thread4', from: 'System', fromRole: 'System', to: 'Dr. Sarah Jenkins',
    subject: 'Lab Result Alert — John Wick (p5)',
    body: 'A lab result requiring your attention is now available.\n\nPatient: John Wick (MRN: 9982731-B)\nTest: Lithium Serum Level\nResult: 0.4 mEq/L — LOW (Reference: 0.6–1.2)\n\nPlease review and acknowledge.',
    date: d(-1), time: '2:45 PM', read: true, patientId: 'p5'
  },
  {
    id: 'msg5', threadId: 'thread5', from: 'James Sullivan', fromRole: 'Patient', to: 'Dr. Sarah Jenkins',
    subject: 'Appointment rescheduling request',
    body: 'Hi Dr. Jenkins,\n\nI have a work conflict come up with my upcoming appointment. Is there any availability in the afternoon or later that week? Really sorry for the short notice.\n\nJames',
    date: d(-5), time: '7:00 PM', read: true, patientId: 'p3'
  },
  {
    id: 'msg6', threadId: 'thread6', from: 'Pharmacy Team', fromRole: 'System', to: 'Dr. Sarah Jenkins',
    subject: 'Prior Authorization Required — Spravato (Esketamine)',
    body: 'Prior authorization is required for the following prescription:\n\nPatient: Elias Thorne\nMedication: Esketamine (Spravato) 56mg nasal spray\nDiagnosis: F33.1 — MDD, Recurrent\nInsurance: Blue Cross Blue Shield\n\nPlease submit PA documentation at your earliest convenience.',
    date: d(-7), time: '10:00 AM', read: true, patientId: 'p1'
  },
];

const initialReferrals: Referral[] = [
  {
    id: 'ref1', patientId: 'p4', date: d(-3), referredTo: 'Ascend Behavioral Health', specialty: 'Intensive Outpatient Program',
    reason: 'Patient requires higher level of care due to active SI and severe MDD. Recommend IOP for daily structure and therapeutic support.',
    urgency: 'Urgent', status: 'Accepted', notes: `IOP start date: ${d(7)}`, scheduledDate: d(7)
  },
  {
    id: 'ref2', patientId: 'p4', date: d(0), referredTo: 'Northwest DBT Center', specialty: 'DBT Skills Group',
    reason: 'Patient with PTSD and emotional dysregulation. DBT skills group to complement individual therapy.',
    urgency: 'Routine', status: 'Pending'
  },
  {
    id: 'ref3', patientId: 'p1', date: d(-210), referredTo: 'Dr. Elena Voss, PhD', specialty: 'Psychotherapy (CBT)',
    reason: 'Adjunct CBT for MDD and residual anxiety symptoms.',
    urgency: 'Routine', status: 'Completed', scheduledDate: d(-196)
  },
  {
    id: 'ref4', patientId: 'p7', date: d(-35), referredTo: 'Harbor Recovery Center', specialty: 'Substance Use Disorder (SUD) Counseling',
    reason: 'AUD in early remission. Referral to outpatient SUD counselor for relapse prevention and motivational interviewing.',
    urgency: 'Routine', status: 'Accepted', scheduledDate: d(-25)
  },
  {
    id: 'ref5', patientId: 'p5', date: d(-1), referredTo: 'Dr. Carol Huang, MD', specialty: 'Internal Medicine',
    reason: 'Lithium monitoring and renal function assessment. Serum lithium sub-therapeutic.',
    urgency: 'Urgent', status: 'Pending'
  },
];

const initialPriorAuths: PriorAuth[] = [
  {
    id: 'pa1', patientId: 'p1', medication: 'Esketamine (Spravato) 56mg', indication: 'F33.1 — MDD, Recurrent, Treatment-Resistant',
    insurancePlan: 'Blue Cross Blue Shield', submittedDate: d(-7),
    status: 'Under Review', notes: 'Patient has failed 2 adequate antidepressant trials. Submitting clinical summary and prior treatment records.',
  },
  {
    id: 'pa2', patientId: 'p4', medication: 'Brexanolone (Zulresso)', indication: 'F32.2 — MDD, Severe',
    insurancePlan: 'Medicaid', submittedDate: d(-21),
    status: 'Denied', determinationDate: d(-11),
    notes: 'Denied — step therapy requirements not met. Initiating appeal with additional documentation.',
  },
  {
    id: 'pa3', patientId: 'p5', medication: 'Lithium Carbonate 300mg (>90 day supply)', indication: 'F31.1 — Bipolar I',
    insurancePlan: 'Cigna', submittedDate: d(-28),
    status: 'Approved', determinationDate: d(-20), expirationDate: d(337),
  },
  {
    id: 'pa4', patientId: 'p8', medication: 'Clozapine (Clozaril) 100mg', indication: 'F32.3 — MDD w/ Psychosis, F60.3 — BPD',
    insurancePlan: 'Aetna', status: 'Draft',
    notes: 'Draft — need to gather REMS enrollment confirmation before submitting.',
  },
  {
    id: 'pa5', patientId: 'p3', medication: 'Amphetamine Salts (Adderall XR) 20mg — >30 day', indication: 'F90.0 — ADHD',
    insurancePlan: 'United Healthcare', submittedDate: d(-3),
    status: 'Submitted',
  },
];

const initialVitals: Vital[] = [
  { id: 'v1', patientId: 'p1', date: d(-270), weight: 182, bpSystolic: 118, bpDiastolic: 76, heartRate: 72, height: 71, bmi: 25.4, recordedBy: 'MA' },
  { id: 'v2', patientId: 'p1', date: d(-90),  weight: 179, bpSystolic: 116, bpDiastolic: 74, heartRate: 70, height: 71, bmi: 24.9, recordedBy: 'MA' },
  { id: 'v3', patientId: 'p1', date: d(-3),   weight: 177, bpSystolic: 114, bpDiastolic: 72, heartRate: 68, height: 71, bmi: 24.7, recordedBy: 'MA' },
  { id: 'v4', patientId: 'p2', date: d(-30),  weight: 148, bpSystolic: 122, bpDiastolic: 80, heartRate: 78, height: 64, bmi: 25.4, recordedBy: 'MA' },
  { id: 'v5', patientId: 'p5', date: d(-1),   weight: 204, bpSystolic: 128, bpDiastolic: 82, heartRate: 84, height: 70, bmi: 29.3, recordedBy: 'MA', notes: 'Patient reports increased thirst and urinary frequency — monitor for lithium toxicity' },
  { id: 'v6', patientId: 'p4', date: d(-3),   weight: 124, bpSystolic: 108, bpDiastolic: 68, heartRate: 92, height: 65, bmi: 20.6, recordedBy: 'MA', notes: 'HR elevated — patient reports anxiety and poor sleep' },
  { id: 'v7', patientId: 'p7', date: d(-10),  weight: 218, bpSystolic: 136, bpDiastolic: 88, heartRate: 76, height: 72, bmi: 29.6, recordedBy: 'MA', notes: 'BP elevated. Advised to follow up with PCP.' },
  { id: 'v8', patientId: 'p8', date: d(-2),   weight: 138, bpSystolic: 112, bpDiastolic: 70, heartRate: 102, height: 63, bmi: 24.5, recordedBy: 'MA', notes: 'Tachycardia noted — patient in significant distress' },
  { id: 'v9',  patientId: 'p9',  date: d(-14), weight: 195, bpSystolic: 124, bpDiastolic: 78, heartRate: 74, height: 70, bmi: 28.0, recordedBy: 'MA' },
  { id: 'v10', patientId: 'p10', date: d(-21), weight: 162, bpSystolic: 132, bpDiastolic: 84, heartRate: 68, height: 63, bmi: 28.7, recordedBy: 'MA', notes: 'BP slightly elevated. Patient aware, monitoring.' },
  { id: 'v11', patientId: 'p11', date: d(-7),  weight: 176, bpSystolic: 118, bpDiastolic: 74, heartRate: 70, height: 70, bmi: 25.3, recordedBy: 'MA' },
  { id: 'v12', patientId: 'p12', date: d(-5),  weight: 154, bpSystolic: 116, bpDiastolic: 72, heartRate: 82, height: 66, bmi: 24.9, recordedBy: 'MA' },
  { id: 'v13', patientId: 'p13', date: d(-4),  weight: 188, bpSystolic: 126, bpDiastolic: 80, heartRate: 88, height: 72, bmi: 25.5, recordedBy: 'MA', notes: 'HR elevated — hypervigilance consistent with PTSD presentation' },
  { id: 'v14', patientId: 'p14', date: d(-2),  weight: 94,  bpSystolic: 92,  bpDiastolic: 58, heartRate: 58, height: 65, bmi: 15.6, recordedBy: 'MA', notes: 'CRITICAL LOW WEIGHT. BMI 15.6. HR bradycardic. Discussed medical stabilization urgency. PCP notified.' },
  { id: 'v15', patientId: 'p15', date: d(-8),  weight: 171, bpSystolic: 138, bpDiastolic: 86, heartRate: 66, height: 69, bmi: 25.3, recordedBy: 'MA', notes: 'BP elevated. Reminded to take antihypertensive. PCP follow-up scheduled.' },
];

const initialSafetyPlans: SafetyPlan[] = [
  {
    id: 'sp1', patientId: 'p4', updatedDate: d(-3),
    warningSigns: ['Feeling hopeless about the future', 'Isolating from friends and family', 'Stopping medications', 'Sleeping more than usual', 'Giving away possessions'],
    internalCoping: ['Go for a walk outside', 'Listen to music playlist (calm)', 'Journal about what I am grateful for', 'Practice 4-7-8 breathing for 5 minutes'],
    socialDistraction: [
      { name: 'Emma (Best Friend)', phone: '(206) 555-0391' },
      { name: 'Mom', phone: '(206) 555-0422' },
    ],
    crisisContacts: [
      { name: 'Dr. Sarah Jenkins', phone: '(206) 555-0100', relationship: 'Psychiatrist' },
      { name: '988 Suicide & Crisis Lifeline', phone: '988', relationship: 'Crisis Line' },
      { name: 'Crisis Text Line', phone: 'Text HOME to 741741', relationship: 'Crisis Line' },
    ],
    professionalContacts: [
      { name: 'Dr. Sarah Jenkins, MD', phone: '(206) 555-0100', available: 'M–F 9am–5pm; after-hours paging available' },
      { name: 'Ascend IOP Program', phone: '(206) 555-0200', available: 'M–F 8am–6pm' },
    ],
    meansRestriction: 'Firearms removed from home and stored at brother\'s house. Medications held by mother and dispensed daily.',
    reasonsForLiving: ['My dog Biscuit', 'My younger sister', 'Finishing my degree', 'Travel plans to Italy'],
    signedByPatient: true,
    signedByProvider: true,
  },
];

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
