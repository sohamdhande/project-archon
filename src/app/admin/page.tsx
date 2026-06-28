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

  const totalStudents = students.length;
  // Calculate totalSessions as max of attendanceCount across students
  const totalSessions = Math.max(...students.map(s => s.attendanceCount || 0), 0);
  const avgAttendance = totalSessions > 0 && totalStudents > 0 
    ? ((students.reduce((sum, s) => sum + (s.attendanceCount || 0), 0) / (totalStudents * totalSessions)) * 100).toFixed(1) 
    : 0;

  const totalPoints = students.reduce((sum, s) => sum + (s.score || 0), 0);
  const avgScore = totalStudents > 0 ? (totalPoints / totalStudents).toFixed(1) : 0;

  const sortedStudents = [...students].sort((a, b) => (b.score || 0) - (a.score || 0));

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

        {/* Read-Only Banner */}
        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '48px', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.03)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Google Spreadsheet Mode Enabled:</strong> The database has been migrated to Google Sheets. All actions are now read-only in this dashboard. To add students, adjust points, or record attendance, please edit the spreadsheet directly.
          </div>
        </div>

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

        {/* STUDENT DIRECTORY */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Student Directory</h2>
          
          <div className="glass-card" style={{ padding: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Sessions Attended</th>
                  <th style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Task Points</th>
                  <th style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Total Score</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '16px 0', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: '16px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{s.attendanceCount}</td>
                    <td style={{ padding: '16px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{s.manualPoints}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>{s.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
