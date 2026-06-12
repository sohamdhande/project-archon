'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionModal } from '@/components/admin/SessionModal';

type Student = { id: string; name: string; manualPoints: number; score?: number };
type Session = { id: string; title: string; datetime: string; meetLink?: string };
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
  const [newSessionDatetime, setNewSessionDatetime] = useState('');
  const [newSessionLink, setNewSessionLink] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [sRes, seRes, aRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/sessions'),
        fetch('/api/attendance'),
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
    // Optimistic UI Update: Instantly change the value on screen
    setStudents(prev => prev.map(s => s.id === id ? { ...s, manualPoints: s.manualPoints + points } : s));
    
    // Background Network Request
    try {
      await fetch(`/api/students/${id}`, { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ points }) });
    } catch (e) {
      console.error("Failed to update points", e);
      fetchAll(); // Revert on failure
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim() || !newSessionDatetime) return;
    await fetch('/api/sessions', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ title: newSessionTitle.trim(), datetime: new Date(newSessionDatetime).toISOString(), meetLink: newSessionLink.trim() }) });
    setNewSessionTitle('');
    setNewSessionDatetime('');
    setNewSessionLink('');
    fetchAll();
  };

  const formatDt = (iso: string) => {
    try { return new Date(iso).toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' }); } catch { return iso; }
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', position: 'relative' }}>


      <div style={{ padding: '40px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border)', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 600, margin: 0 }}>Admin Dashboard</h1>
          <div>
            <a href="/" className="nav-link">← Public Portal</a>
            <button onClick={async () => { await fetch('/api/logout', { method: 'POST' }); router.push('/login'); }} style={{ color: 'var(--danger)', background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>Logout</button>
          </div>
        </header>

        {/* OVERVIEW */}
        <div className="panel">
          <h2 className="panel-heading">Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="stat-card">
              <div className="stat-value mono">{totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-value mono">{totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value mono">{avgAttendance}%</div>
              <div className="stat-label">Avg Attendance</div>
            </div>
            <div className="stat-card">
              <div className="stat-value mono">{avgScore}</div>
              <div className="stat-label">Avg Score</div>
            </div>
          </div>
        </div>

        {/* SESSIONS */}
        <div className="panel">
          <h2 className="panel-heading">Sessions</h2>
          <form onSubmit={handleAddSession} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input type="text" required placeholder="Session title" value={newSessionTitle} onChange={e => setNewSessionTitle(e.target.value)} className="input-field" style={{ flex: 1 }} />
            <input type="datetime-local" required value={newSessionDatetime} onChange={e => setNewSessionDatetime(e.target.value)} className="input-field" style={{ width: '200px', colorScheme: 'dark' }} />
            <input type="url" placeholder="Meet link (optional)" value={newSessionLink} onChange={e => setNewSessionLink(e.target.value)} className="input-field" style={{ flex: 1 }} />
            <button type="submit" className="primary-btn" style={{ whiteSpace: 'nowrap' }}>Create Session</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {sessions.map(s => {
              const count = getAttendanceCountForSession(s.id);
              return (
                <div key={s.id} className="session-card">
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 500 }}>{s.title}</h3>
                    <p className="mono" style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)' }}>{formatDt(s.datetime)}</p>
                    {s.meetLink && <a href={s.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '12px', textDecoration: 'none' }}>🔗 {s.meetLink}</a>}
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: '13px', color: 'var(--accent)' }}>{count} / {totalStudents} Present</span>
                    <button onClick={() => setModalSessionId(s.id)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>Manage Attendance →</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STUDENT MANAGEMENT */}
        <div className="panel">
          <h2 className="panel-heading">Student Management</h2>
          <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '12px', marginBottom: '24px', maxWidth: '400px' }}>
            <input type="text" placeholder="Student Name" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="input-field" />
            <button type="submit" className="primary-btn">Add</button>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>Name</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>Current Score</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Manual Points</th>
                <th style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 0', color: 'var(--text-primary)' }}>{s.name}</td>
                  <td className="mono" style={{ padding: '12px 0', textAlign: 'right', color: 'var(--accent)' }}>{s.score}</td>
                  <td style={{ padding: '12px 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleUpdatePoints(s.id, -1)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                      <span className="mono" style={{ width: '24px' }}>{s.manualPoints}</span>
                      <button onClick={() => handleUpdatePoints(s.id, 1)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                    </div>
                  </td>
                  <td style={{ padding: '12px 0', textAlign: 'right' }}>
                    <button onClick={() => handleRemoveStudent(s.id)} className="danger-text-btn">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            if (!res.ok) throw new Error('Save failed');
            await fetchAll();
            setModalSessionId(null);
          }}
        />
      )}
    </div>
  );
}
