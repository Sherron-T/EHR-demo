import React, { useState, useMemo } from 'react';
import { ViewType } from '../App';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

interface InboxProps {
  onViewChange: (view: ViewType) => void;
}

type InboxCategory = 'All' | 'Results' | 'Messages' | 'Tasks' | 'Auth' | 'Alerts';

interface InboxItem {
  id: string;
  category: InboxCategory;
  priority: 'Critical' | 'High' | 'Normal';
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  detail: string;
  time: string;
  patientId?: string;
  patientName?: string;
  actionLabel?: string;
  actionView?: ViewType;
  done: boolean;
}

const TODAY = new Date().toISOString().split('T')[0];

export default function Inbox({ onViewChange }: InboxProps) {
  const {
    patients, setCurrentPatientId,
    labs, notes, appointments,
    messages, markMessageRead,
    priorAuths,
    alerts, dismissAlert,
    tasks, toggleTask,
  } = useData();
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState<InboxCategory>('All');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const dismiss = (id: string) => setDismissed(prev => new Set([...prev, id]));

  // Build the unified inbox item list
  const allItems = useMemo<InboxItem[]>(() => {
    const items: InboxItem[] = [];

    // 1. Clinical alerts
    alerts.forEach(a => {
      const pt = patients.find(p => p.id === a.patientId);
      items.push({
        id: `alert-${a.id}`,
        category: 'Alerts',
        priority: a.severity === 'High' ? 'Critical' : 'High',
        icon: 'crisis_alert',
        iconColor: 'text-error',
        iconBg: 'bg-error/10',
        title: a.type,
        subtitle: pt?.name ?? 'Unknown Patient',
        detail: a.message,
        time: 'Now',
        patientId: a.patientId,
        patientName: pt?.name,
        actionLabel: 'Open Chart',
        actionView: 'patients',
        done: false,
      });
    });

    // 2. Flagged lab results
    labs
      .filter(l => l.flag === 'Critical' || l.flag === 'High' || l.flag === 'Low')
      .forEach(l => {
        const pt = patients.find(p => p.id === l.patientId);
        items.push({
          id: `lab-${l.id}`,
          category: 'Results',
          priority: l.flag === 'Critical' ? 'Critical' : 'High',
          icon: 'biotech',
          iconColor: l.flag === 'Critical' ? 'text-error' : 'text-[#7c5700]',
          iconBg: l.flag === 'Critical' ? 'bg-error/10' : 'bg-[#7c5700]/10',
          title: `${l.flag} Lab: ${l.testName}`,
          subtitle: pt?.name ?? 'Unknown Patient',
          detail: `Result: ${l.result} ${l.unit} · Ref: ${l.referenceRange || 'N/A'} · Ordered by ${l.orderedBy ?? 'Provider'}`,
          time: l.date,
          patientId: l.patientId,
          patientName: pt?.name,
          actionLabel: 'Review Chart',
          actionView: 'patients',
          done: false,
        });
      });

    // 3. Unsigned notes — completed appointments today without a note
    appointments
      .filter(a => a.date === TODAY && a.status === 'Completed')
      .filter(a => !notes.some(n => n.patientId === a.patientId && n.date === TODAY))
      .forEach(a => {
        const pt = patients.find(p => p.id === a.patientId);
        items.push({
          id: `unsigned-${a.id}`,
          category: 'Tasks',
          priority: 'High',
          icon: 'edit_note',
          iconColor: 'text-primary',
          iconBg: 'bg-primary/10',
          title: 'Unsigned Note Required',
          subtitle: pt?.name ?? 'Unknown Patient',
          detail: `${a.type} completed at ${a.time} · Chart must be signed within 24 hours`,
          time: a.time,
          patientId: a.patientId,
          patientName: pt?.name,
          actionLabel: 'Write Note',
          actionView: 'new_note',
          done: false,
        });
      });

    // 4. Unread messages
    messages
      .filter(m => !m.read)
      .forEach(m => {
        const pt = m.patientId ? patients.find(p => p.id === m.patientId) : undefined;
        items.push({
          id: `msg-${m.id}`,
          category: 'Messages',
          priority: m.fromRole === 'Patient' ? 'High' : 'Normal',
          icon: m.fromRole === 'System' ? 'notifications' : m.fromRole === 'Patient' ? 'person' : 'stethoscope',
          iconColor: 'text-primary',
          iconBg: 'bg-primary/10',
          title: m.subject,
          subtitle: `From: ${m.from}`,
          detail: m.body.slice(0, 120) + (m.body.length > 120 ? '…' : ''),
          time: m.time,
          patientId: m.patientId,
          patientName: pt?.name,
          actionLabel: 'Reply',
          actionView: 'messaging',
          done: false,
        });
      });

    // 5. Prior auths needing attention
    priorAuths
      .filter(pa => pa.status === 'Denied' || pa.status === 'Under Review')
      .forEach(pa => {
        const pt = patients.find(p => p.id === pa.patientId);
        items.push({
          id: `pa-${pa.id}`,
          category: 'Auth',
          priority: pa.status === 'Denied' ? 'High' : 'Normal',
          icon: 'policy',
          iconColor: pa.status === 'Denied' ? 'text-error' : 'text-[#7c5700]',
          iconBg: pa.status === 'Denied' ? 'bg-error/10' : 'bg-[#7c5700]/10',
          title: `Prior Auth ${pa.status}: ${pa.medication}`,
          subtitle: pt?.name ?? 'Unknown Patient',
          detail: `${pa.insurancePlan} · ${pa.indication}${pa.status === 'Denied' ? ' · Consider appeal or alternative' : ' · Awaiting decision'}`,
          time: pa.submittedDate ?? 'Pending',
          patientId: pa.patientId,
          patientName: pt?.name,
          actionLabel: 'Manage PA',
          actionView: 'prior_auth',
          done: false,
        });
      });

    // 6. Pending tasks from task list
    tasks
      .filter(t => !t.done)
      .forEach(t => {
        items.push({
          id: `task-${t.id}`,
          category: 'Tasks',
          priority: 'Normal',
          icon: 'task_alt',
          iconColor: 'text-secondary',
          iconBg: 'bg-secondary/10',
          title: t.text,
          subtitle: 'To-Do Item',
          detail: 'Click to mark complete from the Dashboard tasks list.',
          time: 'Pending',
          done: false,
        });
      });

    // Sort: Critical first, then High, then Normal; within each priority by time desc
    const priorityOrder = { Critical: 0, High: 1, Normal: 2 };
    return items.sort((a, b) => (priorityOrder[a.priority] - priorityOrder[b.priority]));
  }, [alerts, labs, appointments, notes, messages, priorAuths, tasks, patients]);

  const visibleItems = allItems.filter(item =>
    !dismissed.has(item.id) &&
    (activeCategory === 'All' || item.category === activeCategory)
  );

  const categoryCounts: Record<InboxCategory, number> = {
    All: allItems.filter(i => !dismissed.has(i.id)).length,
    Results: allItems.filter(i => i.category === 'Results' && !dismissed.has(i.id)).length,
    Messages: allItems.filter(i => i.category === 'Messages' && !dismissed.has(i.id)).length,
    Tasks: allItems.filter(i => i.category === 'Tasks' && !dismissed.has(i.id)).length,
    Auth: allItems.filter(i => i.category === 'Auth' && !dismissed.has(i.id)).length,
    Alerts: allItems.filter(i => i.category === 'Alerts' && !dismissed.has(i.id)).length,
  };

  const handleAction = (item: InboxItem) => {
    if (item.patientId) setCurrentPatientId(item.patientId);
    if (item.category === 'Messages') {
      const msgId = item.id.replace('msg-', '');
      markMessageRead(msgId);
    }
    if (item.actionView) onViewChange(item.actionView);
    dismiss(item.id);
  };

  const handleDismiss = (item: InboxItem) => {
    if (item.category === 'Alerts') {
      const alertId = item.id.replace('alert-', '');
      dismissAlert(alertId);
    } else if (item.category === 'Messages') {
      const msgId = item.id.replace('msg-', '');
      markMessageRead(msgId);
    }
    dismiss(item.id);
    addToast({ type: 'info', title: 'Item Dismissed', message: `"${item.title}" removed from inbox.` });
  };

  const PRIORITY_BADGE: Record<string, string> = {
    Critical: 'bg-error text-white',
    High: 'bg-error/10 text-error',
    Normal: 'bg-surface-container-high text-on-surface-variant',
  };

  const categories: InboxCategory[] = ['All', 'Alerts', 'Results', 'Messages', 'Tasks', 'Auth'];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Provider Inbox</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {categoryCounts.All} item{categoryCounts.All !== 1 ? 's' : ''} requiring attention
          </p>
        </div>
        {categoryCounts.All > 0 && (
          <button
            onClick={() => {
              visibleItems.forEach(item => dismiss(item.id));
              addToast({ type: 'success', title: 'Inbox Cleared', message: 'All items have been dismissed.' });
            }}
            className="px-4 py-2 bg-surface-container-low text-on-surface-variant font-bold rounded-lg hover:bg-surface-container-highest transition-colors text-sm"
          >
            Dismiss All
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-surface-container-lowest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {cat}
            {categoryCounts[cat] > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                activeCategory === cat ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
              }`}>
                {categoryCounts[cat]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inbox items */}
      {visibleItems.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center bg-surface-container-lowest rounded-2xl border border-outline-variant/10 border-dashed">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
          <h3 className="font-headline font-bold text-on-surface mb-1">All caught up!</h3>
          <p className="text-sm text-on-surface-variant">No {activeCategory !== 'All' ? activeCategory.toLowerCase() : ''} items requiring attention.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleItems.map(item => (
            <div
              key={item.id}
              className={`bg-surface-container-lowest rounded-2xl border transition-all hover:shadow-sm ${
                item.priority === 'Critical'
                  ? 'border-error/30 border-l-4 border-l-error'
                  : item.priority === 'High'
                  ? 'border-[#7c5700]/20 border-l-4 border-l-[#7c5700]'
                  : 'border-outline-variant/10'
              }`}
            >
              <div className="p-5 flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                  <span className={`material-symbols-outlined text-sm ${item.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {item.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-on-surface">{item.title}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${PRIORITY_BADGE[item.priority]}`}>
                        {item.priority}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant flex-shrink-0">{item.time}</span>
                  </div>

                  {item.patientName && (
                    <p className="text-xs font-bold text-primary mb-1">{item.patientName}</p>
                  )}
                  <p className="text-xs text-on-surface-variant leading-relaxed">{item.subtitle !== item.patientName ? item.subtitle + ' · ' : ''}{item.detail}</p>

                  <div className="flex items-center gap-3 mt-3">
                    {item.actionLabel && item.actionView && (
                      <button
                        onClick={() => handleAction(item)}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        {item.actionLabel}
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(item)}
                      className="px-3 py-1.5 bg-surface-container-low text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
