'use client';

import { useState } from 'react';

type Student = { id: string; name: string };
type Session = { id: string; title: string; datetime: string };

interface SessionModalProps {
  session: Session;
  students: Student[];
  initialAttendance: Set<string>; // Set of studentIds present for this session
  onClose: () => void;
  onSave: (presentStudentIds: string[]) => Promise<void>;
}

export function SessionModal({ session, students, initialAttendance, onClose, onSave }: SessionModalProps) {
  const [search, setSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [presentStudents, setPresentStudents] = useState<Set<string>>(initialAttendance);
  const [saving, setSaving] = useState(false);

  const formatDt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch { return iso; }
  };

  const visibleStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedStudents(new Set(visibleStudents.map(s => s.id)));
    else setSelectedStudents(new Set());
  };

  const handleBulkAction = (markPresent: boolean) => {
    setPresentStudents(prev => {
      const next = new Set(prev);
      selectedStudents.forEach(id => {
        if (markPresent) next.add(id);
        else next.delete(id);
      });
      return next;
    });
    setSelectedStudents(new Set());
  };

  const toggleStudent = (id: string, isPresent: boolean) => {
    setPresentStudents(prev => {
      const next = new Set(prev);
      if (isPresent) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(Array.from(presentStudents));
    } catch {
      alert("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', width: '480px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 4px 0' }}>{session.title}</h2>
          <p className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{formatDt(session.datetime)}</p>
        </div>
        
        <input 
          type="text" 
          placeholder="Search students..." 
          className="input-field" 
          style={{ margin: '16px 24px', width: 'calc(100% - 48px)' }} 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />

        {selectedStudents.size > 0 && (
          <div style={{ padding: '8px 24px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
            <button className="primary-btn small" style={{ width: 'auto' }} onClick={() => handleBulkAction(true)}>Mark Present</button>
            <button style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '6px', padding: '5px 12px', fontSize: '13px', cursor: 'pointer' }} onClick={() => handleBulkAction(false)}>Mark Absent</button>
          </div>
        )}

        <div style={{ overflowY: 'auto', flex: 1, padding: '0 24px' }}>
           {visibleStudents.length === 0 ? (
             <p style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>No students found.</p>
           ) : (
             <>
               <div style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                 <input type="checkbox" checked={visibleStudents.length > 0 && selectedStudents.size === visibleStudents.length} onChange={e => handleSelectAll(e.target.checked)} />
                 <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select All</span>
               </div>
               {visibleStudents.map(s => {
                  const isPresent = presentStudents.has(s.id);
                  return (
                     <div key={s.id} className="modal-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <input type="checkbox" checked={selectedStudents.has(s.id)} onChange={e => {
                           setSelectedStudents(prev => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(s.id); else next.delete(s.id);
                              return next;
                           })
                        }} />
                        <span style={{ color: 'var(--text-primary)', fontSize: '14px', flex: 1 }}>{s.name}</span>
                        <input type="checkbox" checked={isPresent} onChange={e => toggleStudent(s.id, e.target.checked)} />
                     </div>
                  )
               })}
             </>
           )}
        </div>
        
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
           <button onClick={onClose} disabled={saving} className="text-btn secondary">Cancel</button>
           <button onClick={handleSave} disabled={saving} className="primary-btn" style={{ width: 'auto' }}>
             {saving ? 'Saving...' : 'Save Attendance'}
           </button>
        </div>
      </div>
    </div>
  );
}
