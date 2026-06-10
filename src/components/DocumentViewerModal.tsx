import React from 'react';
import { Document } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';

export function getDocumentContent(doc: Document, patientName?: string) {
  if (doc.type === 'Assessment') {
    if (doc.title.includes('PHQ-9')) {
      return `PHQ-9 PATIENT HEALTH QUESTIONNAIRE
Date: ${doc.date} | Patient: ${patientName} | Completed via: Patient Portal

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
Date: ${doc.date} | Patient: ${patientName} | Completed via: Patient Portal

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
Date: ${doc.date} | Patient: ${patientName}

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
Date: ${doc.date} | Patient: ${patientName} | Clinician: ${doc.author}

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
Date: ${doc.date} | Patient: ${patientName}

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
Date: ${doc.date} | Patient: ${patientName} | Provider: ${doc.author}

I, ${patientName ?? '[Patient Name]'}, consent to psychiatric evaluation and treatment by Dr. Sarah Jenkins, MD.

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
Patient: ${patientName}

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
}

interface DocumentViewerModalProps {
  doc: Document;
  patientName?: string;
  onClose: () => void;
}

export default function DocumentViewerModal({ doc, patientName, onClose }: DocumentViewerModalProps) {
  const { addToast } = useToast();

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b border-outline-variant/10 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="font-headline font-bold text-on-surface">{doc.title}</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">{doc.type} · {doc.date} · {doc.author}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addToast({ type: 'info', title: 'Printing…', message: `${doc.title} sent to printer.` })}
            className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-sm">print</span>
          </button>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
      <div className="p-6 overflow-y-auto flex-1">
        <pre className="text-xs font-mono text-on-surface leading-relaxed whitespace-pre-wrap bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
          {getDocumentContent(doc, patientName)}
        </pre>
      </div>
    </Modal>
  );
}
