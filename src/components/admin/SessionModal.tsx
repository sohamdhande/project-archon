'use client';

import { useState } from 'react';

type Student = { id: string; name: string };
type Session = { id: string; title: string; lecture_start: string; lecture_end: string };

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
    } catch (err) {
      alert((err instanceof Error ? err.message : "Failed to save attendance. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 7, 10, 0.8)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="glass-card" style={{ width: '500px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            {formatDt(session.lecture_start)} - {formatDt(session.lecture_end)}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-grotesk)', margin: 0, color: 'var(--text-primary)' }}>{session.title}</h2>
        </div>
        
        <div style={{ padding: '20px 32px 0 32px' }}>
          <input 
            type="text" 
            placeholder="Search students..." 
            style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', marginBottom: '16px' }} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        {selectedStudents.size > 0 && (
          <div style={{ padding: '12px 32px', background: 'rgba(45, 212, 191, 0.05)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '12px' }}>
            <button style={{ background: 'var(--text-primary)', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }} onClick={() => handleBulkAction(true)}>Mark Present</button>
            <button style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: 'var(--text-primary)', borderRadius: '6px', padding: '6px 16px', fontSize: '13px', cursor: 'pointer' }} onClick={() => handleBulkAction(false)}>Mark Absent</button>
          </div>
        )}

        <div style={{ overflowY: 'auto', flex: 1, padding: '0 32px' }}>
           {visibleStudents.length === 0 ? (
             <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No students found.</p>
           ) : (
             <>
               <div style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                 <input type="checkbox" checked={visibleStudents.length > 0 && selectedStudents.size === visibleStudents.length} onChange={e => handleSelectAll(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
                 <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SELECT ALL</span>
               </div>
               {visibleStudents.map(s => {
                  const isPresent = presentStudents.has(s.id);
                  return (
                     <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                        <input type="checkbox" checked={selectedStudents.has(s.id)} onChange={e => {
                           setSelectedStudents(prev => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(s.id); else next.delete(s.id);
                              return next;
                           })
                        }} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
                        <span style={{ color: isPresent ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '15px', flex: 1, fontWeight: isPresent ? 500 : 400 }}>{s.name}</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={isPresent} onChange={e => toggleStudent(s.id, e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                        </label>
                     </div>
                  )
               })}
             </>
           )}
        </div>
        
        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '16px', background: 'rgba(0,0,0,0.2)' }}>
           <button onClick={onClose} disabled={saving} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
           <button onClick={handleSave} disabled={saving} style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
             {saving ? 'Saving...' : 'Save Attendance'}
           </button>
        </div>
      </div>
    </div>
  );
}
