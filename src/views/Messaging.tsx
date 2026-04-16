import React, { useState } from 'react';
import { ViewType } from '../App';
import { useData, Message } from '../context/DataContext';

interface MessagingProps {
  onViewChange: (view: ViewType) => void;
}

const ROLE_ICON: Record<string, string> = {
  Patient: 'person',
  Provider: 'stethoscope',
  System: 'notifications',
};

const ROLE_COLOR: Record<string, string> = {
  Patient: 'bg-primary/10 text-primary',
  Provider: 'bg-tertiary/10 text-tertiary',
  System: 'bg-secondary/10 text-secondary',
};

export default function Messaging({ onViewChange }: MessagingProps) {
  const { messages, addMessage, markMessageRead, patients, setCurrentPatientId } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id ?? null);
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Patient' | 'Provider' | 'System'>('All');
  const [showCompose, setShowCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', body: '' });
  const [composeSent, setComposeSent] = useState(false);

  const filtered = messages.filter(m => {
    if (filter === 'Unread') return !m.read;
    if (filter === 'Patient') return m.fromRole === 'Patient';
    if (filter === 'Provider') return m.fromRole === 'Provider';
    if (filter === 'System') return m.fromRole === 'System';
    return true;
  });

  const selected = messages.find(m => m.id === selectedId) ?? null;

  const handleSelect = (msg: Message) => {
    setSelectedId(msg.id);
    if (!msg.read) markMessageRead(msg.id);
  };

  const handleSend = () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.body) return;
    addMessage({
      threadId: `thread${Date.now()}`,
      from: 'Dr. Sarah Jenkins',
      fromRole: 'Provider',
      to: composeForm.to,
      subject: composeForm.subject,
      body: composeForm.body,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      read: true,
    });
    setComposeSent(true);
    setTimeout(() => {
      setShowCompose(false);
      setComposeForm({ to: '', subject: '', body: '' });
      setComposeSent(false);
    }, 1200);
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-surface">
      {/* Left Sidebar — Inbox */}
      <div className="w-80 border-r border-outline-variant/10 bg-surface-container-lowest flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
          <div>
            <h2 className="font-headline font-bold text-lg text-on-surface">Inbox</h2>
            {unreadCount > 0 && (
              <p className="text-xs text-on-surface-variant">{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>
          <button
            onClick={() => setShowCompose(true)}
            className="p-2 signature-gradient text-white rounded-xl hover:opacity-90 transition-all shadow-sm"
            title="Compose"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-2 border-b border-outline-variant/10 overflow-x-auto no-scrollbar">
          {(['All', 'Unread', 'Patient', 'Provider', 'System'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {f}
              {f === 'Unread' && unreadCount > 0 && (
                <span className="ml-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-sm">No messages here.</div>
          ) : (
            filtered.map(msg => (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={`w-full text-left p-4 border-b border-outline-variant/10 transition-colors hover:bg-surface-container-low/70 ${
                  selectedId === msg.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${ROLE_COLOR[msg.fromRole]}`}>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{ROLE_ICON[msg.fromRole]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className={`text-sm truncate ${!msg.read ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant'}`}>
                        {msg.from}
                      </p>
                      <span className="text-[10px] text-on-surface-variant ml-2 flex-shrink-0">{msg.time}</span>
                    </div>
                    <p className={`text-xs truncate ${!msg.read ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}>
                      {msg.subject}
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{msg.body.slice(0, 60)}...</p>
                  </div>
                  {!msg.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel — Message Detail */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            {/* Message Header */}
            <div className="p-6 border-b border-outline-variant/10 bg-surface-container-lowest">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-headline font-bold text-xl text-on-surface">{selected.subject}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ROLE_COLOR[selected.fromRole]}`}>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{ROLE_ICON[selected.fromRole]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{selected.from}</p>
                      <p className="text-xs text-on-surface-variant">{selected.date} at {selected.time}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ROLE_COLOR[selected.fromRole]}`}>
                      {selected.fromRole}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selected.patientId && (
                    <button
                      onClick={() => { setCurrentPatientId(selected.patientId!); onViewChange('patients'); }}
                      className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      View Chart
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setComposeForm({ to: selected.from, subject: `Re: ${selected.subject}`, body: '' });
                      setShowCompose(true);
                    }}
                    className="px-3 py-1.5 bg-surface-container-low text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">reply</span>
                    Reply
                  </button>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto">
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
                  <pre className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap font-label">{selected.body}</pre>
                </div>

                {selected.fromRole === 'Patient' && (
                  <div className="mt-6 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Quick Actions</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setComposeForm({ to: selected.from, subject: `Re: ${selected.subject}`, body: '' });
                          setShowCompose(true);
                        }}
                        className="px-3 py-2 bg-white text-on-surface text-xs font-bold rounded-lg border border-outline-variant/20 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">reply</span> Reply to Patient
                      </button>
                      {selected.patientId && (
                        <>
                          <button
                            onClick={() => { setCurrentPatientId(selected.patientId!); onViewChange('eprescribing'); }}
                            className="px-3 py-2 bg-white text-on-surface text-xs font-bold rounded-lg border border-outline-variant/20 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">prescriptions</span> Manage Meds
                          </button>
                          <button
                            onClick={() => { setCurrentPatientId(selected.patientId!); onViewChange('new_note'); }}
                            className="px-3 py-2 bg-white text-on-surface text-xs font-bold rounded-lg border border-outline-variant/20 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">note_add</span> Write Note
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-surface-container-low rounded-3xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-outline-variant" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface-variant">Select a message</h3>
            <p className="text-sm text-on-surface-variant/70 mt-1">Choose a conversation from the inbox to view it here.</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-end p-6">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/10">
              <h3 className="font-headline font-bold text-on-surface">New Secure Message</h3>
              <button onClick={() => { setShowCompose(false); setComposeSent(false); }} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {composeSent ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-tertiary mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="font-bold text-on-surface">Message Sent!</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">To</label>
                  <input
                    type="text"
                    placeholder="Recipient name or patient"
                    value={composeForm.to}
                    onChange={e => setComposeForm({ ...composeForm, to: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={composeForm.subject}
                    onChange={e => setComposeForm({ ...composeForm, subject: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Message</label>
                  <textarea
                    rows={6}
                    placeholder="Write your message..."
                    value={composeForm.body}
                    onChange={e => setComposeForm({ ...composeForm, body: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                    End-to-end encrypted
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCompose(false)}
                      className="px-4 py-2 bg-surface-container-low text-on-surface-variant text-sm font-bold rounded-xl hover:bg-surface-container-highest transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      className="px-4 py-2 signature-gradient text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
