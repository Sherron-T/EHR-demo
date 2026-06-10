import React from 'react';
import { Note } from '../context/DataContext';
import Modal from './Modal';

interface NoteDetailModalProps {
  note: Note;
  onClose: () => void;
}

export default function NoteDetailModal({ note, onClose }: NoteDetailModalProps) {
  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b border-outline-variant/10 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="font-headline font-bold text-on-surface">{note.type}</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">{note.date} · {note.author}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-lg">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
      <div className="p-6 overflow-y-auto flex-1 space-y-5">
        <div>
          <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Subjective</h4>
          <p className="text-sm text-on-surface leading-relaxed bg-surface-container-low rounded-xl p-4">{note.subjective}</p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Objective / Mental Status</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(note.objective as Record<string, boolean>).map(([key, val]) => (
              <div key={key} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium ${val ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{val ? 'check_circle' : 'cancel'}</span>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Assessment</h4>
          <p className="text-sm text-on-surface leading-relaxed bg-surface-container-low rounded-xl p-4">{note.assessment}</p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Plan</h4>
          <p className="text-sm text-on-surface leading-relaxed bg-surface-container-low rounded-xl p-4">{note.plan}</p>
        </div>
        {note.billing && (
          <div>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Billing</h4>
            <div className="bg-surface-container-low rounded-xl p-4 flex gap-4 text-sm">
              <span><span className="text-on-surface-variant text-xs">CPT:</span> <span className="font-bold">{note.billing.cptCode}</span></span>
              <span><span className="text-on-surface-variant text-xs">ICD-10:</span> <span className="font-bold">{note.billing.icd10Codes?.join(', ')}</span></span>
            </div>
          </div>
        )}
        <div className="pt-3 border-t border-outline-variant/10">
          <p className="text-xs text-on-surface-variant text-center">✓ Signed by {note.author} on {note.date}</p>
        </div>
      </div>
    </Modal>
  );
}
