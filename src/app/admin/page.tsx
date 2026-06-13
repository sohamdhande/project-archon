'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionModal } from '@/components/admin/SessionModal';

type Student = { id: string; name: string; manualPoints: number; score?: number };
type Session = { id: string; title: string; lecture_start: string; lecture_end: string; meetLink?: string };
type AttendanceRecord = { studentId: string; sessionId: string };
type Assignment = { id: string; title: string; description: string; posted_at: string; due_date: string; status: string; };

export default function AdminDashboard() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

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

  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDesc, setNewAssignmentDesc] = useState('');
  const [newAssignmentDue, setNewAssignmentDue] = useState('');

  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editAssignmentTitle, setEditAssignmentTitle] = useState('');
  const [editAssignmentDesc, setEditAssignmentDesc] = useState('');
  const [editAssignmentDue, setEditAssignmentDue] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [sRes, seRes, aRes, assRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/sessions'),
        fetch('/api/attendance'),
        fetch('/api/assignments'),
      ]);
      setStudents(await sRes.json());
      setSessions(await seRes.json());
      setAttendance(await aRes.json());
      setAssignments(await assRes.json());
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

  // Assignments
  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle.trim() || !newAssignmentDesc.trim() || !newAssignmentDue) return;
    
    const res = await fetch('/api/assignments', { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({ 
        title: newAssignmentTitle.trim(), 
        description: newAssignmentDesc.trim(),
        due_date: new Date(newAssignmentDue).toISOString() 
      }) 
    });

    if (res.ok) {
      setNewAssignmentTitle('');
      setNewAssignmentDesc('');
      setNewAssignmentDue('');
      fetchAll();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleEditAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !editAssignmentTitle.trim() || !editAssignmentDesc.trim() || !editAssignmentDue) return;
    
    const res = await fetch(`/api/assignments/${editingAssignment.id}`, { 
      method: 'PATCH', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({ 
        title: editAssignmentTitle.trim(), 
        description: editAssignmentDesc.trim(),
        due_date: new Date(editAssignmentDue).toISOString(),
        status: editingAssignment.status 
      }) 
    });

    if (res.ok) {
      setEditingAssignment(null);
      fetchAll();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleArchiveAssignment = async (assignment: Assignment, status: string) => {
    const res = await fetch(`/api/assignments/${assignment.id}`, { 
      method: 'PATCH', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({ 
        title: assignment.title, 
        description: assignment.description,
        due_date: assignment.due_date,
        status
      }) 
    });
    if (res.ok) fetchAll();
  };

  const handleRemoveAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
    fetchAll();
  };


  const formatDt = (iso: string) => {
    try { return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch { return iso; }
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
          
          {editingSession ? (
            <form onSubmit={handleEditSessionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Edit Session</h3>
              <input type="text" required placeholder="Session title" value={editSessionTitle} onChange={e => setEditSessionTitle(e.target.value)} className="input-field" />
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}><label style={{fontSize: '12px', color: 'var(--text-muted)'}}>Start</label><input type="datetime-local" required value={editSessionStart} onChange={e => setEditSessionStart(e.target.value)} className="input-field" style={{ width: '100%', colorScheme: 'dark' }} /></div>
                <div style={{ flex: 1 }}><label style={{fontSize: '12px', color: 'var(--text-muted)'}}>End</label><input type="datetime-local" required value={editSessionEnd} onChange={e => setEditSessionEnd(e.target.value)} className="input-field" style={{ width: '100%', colorScheme: 'dark' }} /></div>
              </div>
              <input type="url" placeholder="Meet link (optional)" value={editSessionLink} onChange={e => setEditSessionLink(e.target.value)} className="input-field" />
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="primary-btn">Save</button>
                <button type="button" onClick={() => setEditingSession(null)} className="text-btn">Cancel</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAddSession} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <input type="text" required placeholder="Session title" value={newSessionTitle} onChange={e => setNewSessionTitle(e.target.value)} className="input-field" />
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}><label style={{fontSize: '12px', color: 'var(--text-muted)'}}>Start</label><input type="datetime-local" required value={newSessionStart} onChange={e => setNewSessionStart(e.target.value)} className="input-field" style={{ width: '100%', colorScheme: 'dark' }} /></div>
                <div style={{ flex: 1 }}><label style={{fontSize: '12px', color: 'var(--text-muted)'}}>End</label><input type="datetime-local" required value={newSessionEnd} onChange={e => setNewSessionEnd(e.target.value)} className="input-field" style={{ width: '100%', colorScheme: 'dark' }} /></div>
              </div>
              <input type="url" placeholder="Meet link (optional)" value={newSessionLink} onChange={e => setNewSessionLink(e.target.value)} className="input-field" />
              <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start' }}>Create Session</button>
            </form>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {sessions.map(s => {
              const count = getAttendanceCountForSession(s.id);
              return (
                <div key={s.id} className="session-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 500 }}>{s.title}</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => {
                          setEditingSession(s);
                          setEditSessionTitle(s.title);
                          setEditSessionStart(formatToInputDt(s.lecture_start));
                          setEditSessionEnd(formatToInputDt(s.lecture_end));
                          setEditSessionLink(s.meetLink || '');
                        }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                        
                        <button 
                          onClick={() => handleRemoveSession(s.id)} 
                          disabled={count > 0}
                          title={count > 0 ? 'Cannot delete session with attendance' : 'Delete Session'}
                          style={{ background: 'none', border: 'none', color: count > 0 ? 'var(--text-muted)' : 'var(--danger)', cursor: count > 0 ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mono" style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)' }}>{formatDt(s.lecture_start)} - {formatDt(s.lecture_end)}</p>
                    {s.meetLink && <a href={s.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '12px', textDecoration: 'none' }}>🔗 {s.meetLink}</a>}
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: '13px', color: 'var(--accent)' }}>{count} / {totalStudents} Present</span>
                    <button onClick={() => setModalSessionId(s.id)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>Manage Attendance →</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ASSIGNMENTS */}
        <div className="panel">
          <h2 className="panel-heading">Assignments</h2>

          {editingAssignment ? (
            <form onSubmit={handleEditAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Edit Assignment</h3>
              <input type="text" required placeholder="Title" value={editAssignmentTitle} onChange={e => setEditAssignmentTitle(e.target.value)} className="input-field" />
              <textarea required placeholder="Description" value={editAssignmentDesc} onChange={e => setEditAssignmentDesc(e.target.value)} className="input-field" style={{ minHeight: '80px', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{fontSize: '12px', color: 'var(--text-muted)'}}>Due Date</label>
                <input type="datetime-local" required value={editAssignmentDue} onChange={e => setEditAssignmentDue(e.target.value)} className="input-field" style={{ colorScheme: 'dark' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="primary-btn">Save</button>
                <button type="button" onClick={() => setEditingAssignment(null)} className="text-btn">Cancel</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAddAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <input type="text" required placeholder="Assignment Title" value={newAssignmentTitle} onChange={e => setNewAssignmentTitle(e.target.value)} className="input-field" />
              <textarea required placeholder="Assignment Description" value={newAssignmentDesc} onChange={e => setNewAssignmentDesc(e.target.value)} className="input-field" style={{ minHeight: '80px', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{fontSize: '12px', color: 'var(--text-muted)'}}>Due Date</label>
                <input type="datetime-local" required value={newAssignmentDue} onChange={e => setNewAssignmentDue(e.target.value)} className="input-field" style={{ colorScheme: 'dark' }} />
                <button type="submit" className="primary-btn" style={{ marginLeft: 'auto' }}>Create Assignment</button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {assignments.map(a => (
              <div key={a.id} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>{a.title}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: a.status === 'ACTIVE' ? 'var(--accent)' : 'var(--bg-elevated)', color: a.status === 'ACTIVE' ? '#000' : 'var(--text-muted)' }}>
                      {a.status}
                    </span>
                    <button onClick={() => {
                      setEditingAssignment(a);
                      setEditAssignmentTitle(a.title);
                      setEditAssignmentDesc(a.description);
                      setEditAssignmentDue(formatToInputDt(a.due_date));
                    }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                    {a.status === 'ACTIVE' ? (
                      <button onClick={() => handleArchiveAssignment(a, 'ARCHIVED')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>Archive</button>
                    ) : (
                      <button onClick={() => handleArchiveAssignment(a, 'ACTIVE')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>Unarchive</button>
                    )}
                    <button onClick={() => handleRemoveAssignment(a.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                  </div>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{a.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>Posted: {formatDt(a.posted_at)}</span>
                  <span style={{ color: new Date(a.due_date) < new Date() && a.status === 'ACTIVE' ? 'var(--danger)' : 'inherit' }}>Due: {formatDt(a.due_date)}</span>
                </div>
              </div>
            ))}
            {assignments.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No assignments found.</p>}
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
