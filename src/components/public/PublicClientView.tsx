'use client';

import { useState, useEffect } from 'react';

type RankedStudent = {
  id: string;
  name: string;
  score: number;
  attendanceCount: number;
  rank: number;
};

type Session = {
  id: string;
  title: string;
  lecture_start: Date;
  lecture_end: Date;
  meetLink: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  posted_at: Date;
  due_date: Date;
  status: string;
};

interface Props {
  rankedStudents: RankedStudent[];
  activeSession: Session | null;
  upcomingSession: Session | null;
  assignments: Assignment[];
  totalSessions: number;
}

export default function PublicClientView({ rankedStudents, activeSession, upcomingSession, assignments, totalSessions }: Props) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'sessions' | 'assignments'>('leaderboard');
  const [now, setNow] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDt = (d: Date) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const relevantSession = activeSession || upcomingSession;
  
  let bannerText = '';
  if (activeSession) {
    bannerText = '🟢 Live Now';
  } else if (upcomingSession) {
    const mins = Math.round((new Date(upcomingSession.lecture_start).getTime() - now.getTime()) / 60000);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) {
      bannerText = `🔔 Starts in ${hours}h ${remMins}m`;
    } else {
      bannerText = `🔔 Starts in ${mins}m`;
    }
  }

  const avgAttendance = totalSessions > 0 && rankedStudents.length > 0 
    ? Math.round((rankedStudents.reduce((acc, s) => acc + s.attendanceCount, 0) / (rankedStudents.length * totalSessions)) * 100) 
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      
      <div className="ambient-glow" />
      <div className="ambient-glow-secondary" />
      <div className="noise-overlay" />
      <div className="bg-grid" />
      
      {/* Mobile Header / Menu Button */}
      <div className="menu-btn" style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 100, background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar glass-panel ${sidebarOpen ? 'open' : ''}`} style={{ borderRight: '1px solid var(--border)', borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0, padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '48px', paddingLeft: '12px' }}>
          <div style={{ fontFamily: 'var(--font-grotesk)', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>ARCHON</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button
            onClick={() => { setActiveTab('leaderboard'); setSidebarOpen(false); }}
            style={{
              background: activeTab === 'leaderboard' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === 'leaderboard' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span>🏆</span> Leaderboard
          </button>
          <button
            onClick={() => { setActiveTab('sessions'); setSidebarOpen(false); }}
            style={{
              background: activeTab === 'sessions' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === 'sessions' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span>📚</span> Sessions
          </button>
          <button
            onClick={() => { setActiveTab('assignments'); setSidebarOpen(false); }}
            style={{
              background: activeTab === 'assignments' ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === 'assignments' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span>📝</span> Assignments
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ padding: '0 40px', maxWidth: '1400px', width: '100%' }}>
        
        {/* Session Banner (Top Right, Small) */}
        {relevantSession && (
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '40px',
            zIndex: 100,
            background: 'rgba(17, 17, 20, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            minWidth: '220px'
          }}>
            <div style={{ color: activeSession ? 'var(--success)' : 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
              {bannerText}
            </div>
            <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>{relevantSession.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {new Date(relevantSession.lecture_start).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})} – {new Date(relevantSession.lecture_end).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
            </div>
            {relevantSession.meetLink && (
              <a href={relevantSession.meetLink} target="_blank" rel="noopener noreferrer" style={{ marginTop: '8px', display: 'inline-block', color: 'var(--bg-base)', fontSize: '12px', textDecoration: 'none', fontWeight: 600, padding: '6px 12px', background: activeSession ? 'var(--success)' : 'var(--text-primary)', borderRadius: '6px', textAlign: 'center' }}>
                Join Meeting
              </a>
            )}
          </div>
        )}

        <div style={{ paddingTop: '64px', paddingBottom: '120px', flex: 1, position: 'relative', zIndex: 2 }}>
          <div className="fade-in">
            {activeTab === 'leaderboard' && (
              <>
                {/* Compact Header */}
                <header style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '32px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                    ARCHON
                  </h1>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Dev Club • Crash Course
                  </p>
                </header>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Students</div>
                    <div style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1 }}>{rankedStudents.length}</div>
                  </div>
                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Sessions</div>
                    <div style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1 }}>{totalSessions}</div>
                  </div>
                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Assignments</div>
                    <div style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1 }}>{assignments.length}</div>
                  </div>
                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Avg Attendance</div>
                    <div style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1 }}>
                      {avgAttendance}%
                    </div>
                  </div>
                </div>

                {/* Leaderboard Top 3 Cards */}
                {rankedStudents.length > 0 ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                      {rankedStudents.slice(0, 3).map((s, idx) => (
                        <div key={s.id} className="glass-panel" style={{
                          padding: '24px',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          overflow: 'hidden',
                          border: idx === 0 ? '1px solid rgba(255,255,255,0.12)' : undefined,
                          background: idx === 0 ? 'rgba(255,255,255,0.03)' : undefined
                        }}>
                          {idx === 0 && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'var(--text-primary)' }} />}
                          <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '16px' }}>#{s.rank}</div>
                          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</h3>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                            <div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Attendance</div>
                              <div style={{ fontSize: '16px', fontFamily: 'var(--font-mono)' }}>{s.attendanceCount}/{totalSessions}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Score</div>
                              <div style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{s.score}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Leaderboard Table */}
                    {rankedStudents.length > 3 && (
                      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead style={{ borderBottom: '1px solid var(--border)' }}>
                            <tr>
                              <th style={{ padding: '16px 24px', width: '100px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>Rank</th>
                              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>Name</th>
                              <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>Attendance</th>
                              <th style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rankedStudents.slice(3).map((s, idx) => (
                              <tr key={s.id} style={{ borderBottom: idx < rankedStudents.length - 4 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.2s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#{s.rank}</td>
                                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{s.name}</td>
                                <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                                  {Math.round((s.attendanceCount / (totalSessions || 1)) * 100)}%
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>{s.score}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '64px 24px', maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>👤</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>No Students Yet</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>The leaderboard will populate<br/>after the first session.</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'sessions' && (
              <>
                <header style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '24px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Sessions</h1>
                </header>

                {relevantSession ? (
                  <div className="glass-panel" style={{
                    padding: '32px',
                    maxWidth: '600px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: activeSession ? 'var(--success)' : 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {activeSession ? <><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}/> LIVE NOW</> : <><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)' }}/> UPCOMING</>}
                    </div>
                    <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>{relevantSession.title}</h2>
                    <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '14px', marginBottom: '32px' }}>
                      {formatDt(relevantSession.lecture_start)} — {formatDt(relevantSession.lecture_end)}
                    </div>
                    
                    {relevantSession.meetLink && (
                      <a href={relevantSession.meetLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--text-primary)', color: 'var(--bg-base)', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 500, fontSize: '14px', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.9'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                        Join Meeting ↗
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '64px 24px', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>📚</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>No active sessions.</h3>
                  </div>
                )}
              </>
            )}

            {activeTab === 'assignments' && (
              <>
                <header style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '24px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Assignments</h1>
                </header>

                {assignments.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {assignments.map(a => (
                      <div key={a.id} className="glass-panel" style={{
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>{a.title}</h3>
                        <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, flex: 1 }}>{a.description}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                          <div style={{ color: 'var(--text-muted)' }}>
                            Posted: {new Date(a.posted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                            Due: {new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '64px 24px', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>📝</div>
                    <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>All Caught Up</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>There are no active assignments.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
