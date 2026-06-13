'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionModal } from '@/components/admin/SessionModal';

type Student = { id: string; name: string; manualPoints: number; score?: number };
type Session = { id: string; title: string; lecture_start: string; lecture_end: string; meetLink?: string };
type AttendanceRecord = { studentId: string; sessionId: string };

export default function AdminDashboard() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [modalSessionId, setModalSessionId] = useState<string | null>(null);

  // Forms
  const [newStudentName, setNewStudentName] = useState('');
  
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionStart, setNewSessionStart] = useState('');
  const [newSessionEnd, setNewSessionEnd] = useState('');
  const [newSessionLink, setNewSessionLink] = useState('');
  
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editSessionTitle, setEditSessionTitle] = useState('');
  const [editSessionStart, setEditSessionStart] = useState('');
  const [editSessionEnd, setEditSessionEnd] = useState('');
  const [editSessionLink, setEditSessionLink] = useState('');


  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [sRes, seRes, aRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/sessions'),
        fetch('/api/attendance')
      ]);
      setStudents(await sRes.json());
      setSessions(await seRes.json());
      setAttendance(await aRes.json());
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };

  const studentAttendanceMap = new Map<string, number>();
  const sessionAttendanceMap = new Map<string, number>();
  attendance.forEach(a => {
    studentAttendanceMap.set(a.studentId, (studentAttendanceMap.get(a.studentId) || 0) + 1);
    sessionAttendanceMap.set(a.sessionId, (sessionAttendanceMap.get(a.sessionId) || 0) + 1);
  });

  const getAttendanceCountForStudent = (id: string) => studentAttendanceMap.get(id) || 0;
  const getAttendanceCountForSession = (id: string) => sessionAttendanceMap.get(id) || 0;

  const totalStudents = students.length;
  const totalSessions = sessions.length;
  const totalAttendance = attendance.length;
  const avgAttendance = totalSessions > 0 && totalStudents > 0 ? (totalAttendance / (totalStudents * totalSessions) * 100).toFixed(1) : 0;
  
  const totalPoints = students.reduce((sum, s) => sum + (getAttendanceCountForStudent(s.id) * 5) + s.manualPoints, 0);
  const avgScore = totalStudents > 0 ? (totalPoints / totalStudents).toFixed(1) : 0;

  const sortedStudents = [...students].map(s => ({
    ...s,
    score: (getAttendanceCountForStudent(s.id) * 5) + s.manualPoints
  })).sort((a, b) => b.score - a.score);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    await fetch('/api/students', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: newStudentName.trim() }) });
    setNewStudentName('');
    fetchAll();
  };

  const handleRemoveStudent = async (id: string) => {
    if (!confirm('Remove this student entirely?')) return;
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const handleUpdatePoints = async (id: string, points: number) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, manualPoints: s.manualPoints + points } : s));
    try {
      await fetch(`/api/students/${id}`, { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ points }) });
    } catch (e) {
      console.error("Failed to update points", e);
      fetchAll();
    }
  };

  // Sessions
  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim() || !newSessionStart || !newSessionEnd) return;
    
    const res = await fetch('/api/sessions', { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({ 
        title: newSessionTitle.trim(), 
        lecture_start: new Date(newSessionStart).toISOString(), 
        lecture_end: new Date(newSessionEnd).toISOString(), 
        meetLink: newSessionLink.trim() 
      }) 
    });

    if (res.ok) {
      setNewSessionTitle('');
      setNewSessionStart('');
      setNewSessionEnd('');
      setNewSessionLink('');
      fetchAll();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleEditSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !editSessionTitle.trim() || !editSessionStart || !editSessionEnd) return;
    
    const res = await fetch(`/api/sessions/${editingSession.id}`, { 
      method: 'PATCH', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({ 
        title: editSessionTitle.trim(), 
        lecture_start: new Date(editSessionStart).toISOString(), 
        lecture_end: new Date(editSessionEnd).toISOString(), 
        meetLink: editSessionLink.trim() 
      }) 
    });

    if (res.ok) {
      setEditingSession(null);
      fetchAll();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleRemoveSession = async (id: string) => {
    if (!confirm('Are you sure you want to hard-delete this session?')) return;
    const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to delete');
    }
    fetchAll();
  };

  const formatToInputDt = (iso: string) => {
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const formatDt = (iso: string) => {
    try { return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch { return iso; }
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Cinematic Overlays */}
      <div className="aurora-glow" style={{ top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '120vw', height: '80vh', opacity: 0.15 }} />
      <div className="noise-overlay" />
      <div className="grid-overlay" />

      <div style={{ position: 'relative', zIndex: 10, padding: '60px 24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '32px', marginBottom: '48px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
              NST-SDC
            </div>
            <h1 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '32px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Admin Dashboard
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>← Public Portal</a>
            <button onClick={async () => { await fetch('/api/logout', { method: 'POST' }); router.push('/login'); }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>
              Logout
            </button>
          </div>
        </header>

        {/* OVERVIEW */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--text-primary)' }}>{totalStudents}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Students</div>
            </div>
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--text-primary)' }}>{totalSessions}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Sessions</div>
            </div>
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--accent)' }}>{avgAttendance}%</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Avg Attendance</div>
            </div>
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', color: 'var(--text-primary)' }}>{avgScore}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Avg Score</div>
            </div>
          </div>
        </div>

        {/* SESSIONS */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Sessions Management</h2>
          
          <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
            {editingSession ? (
              <form onSubmit={handleEditSessionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-grotesk)', fontWeight: 600 }}>Edit Session</h3>
                <input type="text" required placeholder="Session title" value={editSessionTitle} onChange={e => setEditSessionTitle(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}><label style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block'}}>Start</label><input type="datetime-local" required value={editSessionStart} onChange={e => setEditSessionStart(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', colorScheme: 'dark' }} /></div>
                  <div style={{ flex: 1 }}><label style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block'}}>End</label><input type="datetime-local" required value={editSessionEnd} onChange={e => setEditSessionEnd(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', colorScheme: 'dark' }} /></div>
                </div>
                <input type="url" placeholder="Meet link (optional)" value={editSessionLink} onChange={e => setEditSessionLink(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }} />
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" style={{ background: 'var(--accent)', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
                  <button type="button" onClick={() => setEditingSession(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddSession} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-grotesk)', fontWeight: 600 }}>Create New Session</h3>
                <input type="text" required placeholder="Session title" value={newSessionTitle} onChange={e => setNewSessionTitle(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}><label style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block'}}>Start Time</label><input type="datetime-local" required value={newSessionStart} onChange={e => setNewSessionStart(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', colorScheme: 'dark' }} /></div>
                  <div style={{ flex: 1 }}><label style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block'}}>End Time</label><input type="datetime-local" required value={newSessionEnd} onChange={e => setNewSessionEnd(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', colorScheme: 'dark' }} /></div>
                </div>
                <input type="url" placeholder="Meet link (optional)" value={newSessionLink} onChange={e => setNewSessionLink(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }} />
                <button type="submit" style={{ alignSelf: 'flex-start', background: 'var(--text-primary)', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>+ Schedule Session</button>
              </form>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {sessions.map(s => {
              const count = getAttendanceCountForSession(s.id);
              return (
                <div key={s.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-grotesk)' }}>{s.title}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => {
                        setEditingSession(s);
                        setEditSessionTitle(s.title);
                        setEditSessionStart(formatToInputDt(s.lecture_start));
                        setEditSessionEnd(formatToInputDt(s.lecture_end));
                        setEditSessionLink(s.meetLink || '');
                      }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit</button>
                      
                      <button 
                        onClick={() => handleRemoveSession(s.id)} 
                        disabled={count > 0}
                        title={count > 0 ? 'Cannot delete session with attendance' : 'Delete Session'}
                        style={{ background: 'none', border: 'none', color: count > 0 ? 'var(--text-muted)' : '#ef4444', cursor: count > 0 ? 'not-allowed' : 'pointer', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.6 }}>
                    <div>Start: {formatDt(s.lecture_start)}</div>
                    <div>End: {formatDt(s.lecture_end)}</div>
                  </div>
                  {s.meetLink && <a href={s.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none', display: 'inline-block', marginBottom: '16px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '4px' }}>🔗 View Meet Link</a>}
                  
                  <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}><span style={{color: 'var(--accent)'}}>{count}</span> / {totalStudents} Present</span>
                    <button onClick={() => setModalSessionId(s.id)} style={{ background: 'var(--text-primary)', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Manage →</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STUDENT MANAGEMENT */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Student Directory</h2>
          
          <div className="glass-card" style={{ padding: '32px' }}>
            <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              <input type="text" placeholder="Add new student name..." value={newStudentName} onChange={e => setNewStudentName(e.target.value)} style={{ flex: 1, maxWidth: '400px', padding: '10px 16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }} />
              <button type="submit" style={{ background: 'var(--text-primary)', color: '#000', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Add Student</button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Score</th>
                  <th style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Points Modifier</th>
                  <th style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '16px 0', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: '16px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{s.score}</td>
                    <td style={{ padding: '16px 0', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <button onClick={() => handleUpdatePoints(s.id, -1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-primary)', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>-</button>
                        <span style={{ fontFamily: 'var(--font-mono)', width: '24px', fontSize: '14px' }}>{s.manualPoints}</span>
                        <button onClick={() => handleUpdatePoints(s.id, 1)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-primary)', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>+</button>
                      </div>
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'right' }}>
                      <button onClick={() => handleRemoveStudent(s.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalSessionId && (
        <SessionModal 
          session={sessions.find(s => s.id === modalSessionId)!}
          students={students}
          initialAttendance={new Set(attendance.filter(a => a.sessionId === modalSessionId).map(a => a.studentId))}
          onClose={() => setModalSessionId(null)}
          onSave={async (presentStudentIds) => {
            const res = await fetch('/api/attendance/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: modalSessionId, presentStudentIds })
            });
            if (!res.ok) {
              const data = await res.json();
              throw new Error(data.error || 'Save failed');
            }
            await fetchAll();
            setModalSessionId(null);
          }}
        />
      )}
    </div>
  );
}
