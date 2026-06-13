'use client';

import { useState, useEffect } from 'react';

type RankedStudent = {
  id: string;
  name: string;
  score: number;
  manualPoints: number;
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

interface Props {
  rankedStudents: RankedStudent[];
  activeSession: Session | null;
  upcomingSession: Session | null;
  totalSessions: number;
}

export default function PublicClientView({ rankedStudents, activeSession, upcomingSession, totalSessions }: Props) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'sessions'>('leaderboard');
  const [now, setNow] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  
  let validUpcoming: Session | null = null;
  if (upcomingSession && (new Date(upcomingSession.lecture_start).getTime() - now.getTime()) <= 5 * 60 * 60 * 1000) {
    validUpcoming = upcomingSession;
  }

  const avgAttendance = totalSessions > 0 && rankedStudents.length > 0 
    ? Math.round((rankedStudents.reduce((acc, s) => acc + s.attendanceCount, 0) / (rankedStudents.length * totalSessions)) * 100) 
    : 0;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getTimerText = (targetDate: Date) => {
    if (!isMounted) return '--h --m';
    const diff = Math.abs(targetDate.getTime() - now.getTime());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const TopNav = () => (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5, 7, 10, 0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-subtle)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <div style={{ fontFamily: 'var(--font-grotesk)', fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>ARCHON</div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'sessions', label: 'Sessions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: activeTab === tab.id ? '#F8FAFC' : '#94A3B8',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
          {rankedStudents.length} students
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />
        {activeSession ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
            <div className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
            LIVE
          </div>
        ) : validUpcoming ? (
          <div style={{ color: '#F8FAFC', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            Upcoming
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            No Session
          </div>
        )}
      </div>
    </nav>
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="aurora-glow" />
      <div className="noise-overlay" />
      <div className="grid-overlay" />
      
      <TopNav />

      <main style={{ flex: 1, padding: '64px 32px', maxWidth: '1100px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {activeTab === 'leaderboard' && (
          <div className="animate-fade-up">
            {/* SECTION 1: HERO */}
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px' }}>
                NST-SDC
              </div>
              <h1 style={{ fontFamily: 'var(--font-grotesk)', fontWeight: 800, fontSize: 'clamp(48px, 6vw, 80px)', color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '24px' }}>
                Project Archon
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--text-muted)' }}>
                Build. Learn. Compete. Repeat.
              </p>
            </div>

            {/* 4 Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '80px' }}>
              {[
                { label: 'Students', value: rankedStudents.length },
                { label: 'Sessions', value: totalSessions },
                { label: 'Average Attendance', value: `${avgAttendance}%` }
              ].map((stat, i) => (
                <div key={i} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--text-muted)' }}>{stat.label}</div>
                  <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* SECTION 2: TOP 3 */}
            {rankedStudents.length > 0 && (
              <div style={{ marginBottom: '80px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: '24px', alignItems: 'end' }}>
                  
                  {/* Rank 2 */}
                  {rankedStudents[1] && (
                    <div className="glass-card" style={{ padding: '32px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ position: 'absolute', top: '-20px', fontSize: '40px' }}>🥈</div>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-grotesk)', fontSize: '24px', fontWeight: 700, marginTop: '16px', marginBottom: '16px' }}>
                        {getInitials(rankedStudents[1].name)}
                      </div>
                      <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '20px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>{rankedStudents[1].name}</div>
                      
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '13px' }}><span style={{ color: 'var(--text-muted)' }}>Attendance</span><span>{rankedStudents[1].attendanceCount}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '13px' }}><span style={{ color: 'var(--text-muted)' }}>Points</span><span>{rankedStudents[1].manualPoints}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--accent)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}><span>Score</span><span>{rankedStudents[1].score}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Rank 1 */}
                  {rankedStudents[0] && (
                    <div className="glass-card" style={{ padding: '40px 32px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)' }}>
                      <div style={{ position: 'absolute', top: '-24px', fontSize: '48px' }}>🥇</div>
                      <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(94, 234, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-grotesk)', fontSize: '32px', fontWeight: 700, color: 'var(--accent)', marginTop: '16px', marginBottom: '20px' }}>
                        {getInitials(rankedStudents[0].name)}
                      </div>
                      <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '24px', fontWeight: 700, marginBottom: '32px', textAlign: 'center' }}>{rankedStudents[0].name}</div>
                      
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '14px' }}><span style={{ color: 'var(--text-muted)' }}>Attendance</span><span>{rankedStudents[0].attendanceCount}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '14px' }}><span style={{ color: 'var(--text-muted)' }}>Points</span><span>{rankedStudents[0].manualPoints}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--accent)', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}><span>Score</span><span>{rankedStudents[0].score}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 */}
                  {rankedStudents[2] && (
                    <div className="glass-card" style={{ padding: '32px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ position: 'absolute', top: '-20px', fontSize: '40px' }}>🥉</div>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-grotesk)', fontSize: '24px', fontWeight: 700, marginTop: '16px', marginBottom: '16px' }}>
                        {getInitials(rankedStudents[2].name)}
                      </div>
                      <div style={{ fontFamily: 'var(--font-grotesk)', fontSize: '20px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>{rankedStudents[2].name}</div>
                      
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '13px' }}><span style={{ color: 'var(--text-muted)' }}>Attendance</span><span>{rankedStudents[2].attendanceCount}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '13px' }}><span style={{ color: 'var(--text-muted)' }}>Points</span><span>{rankedStudents[2].manualPoints}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--accent)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}><span>Score</span><span>{rankedStudents[2].score}</span></div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* SECTION 3: LEADERBOARD TABLE */}
            {rankedStudents.length > 0 && (
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ textAlign: 'left', padding: '20px 24px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Rank</th>
                      <th style={{ textAlign: 'left', padding: '20px 24px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Student</th>
                      <th style={{ textAlign: 'right', padding: '20px 24px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Attendance</th>
                      <th style={{ textAlign: 'right', padding: '20px 24px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Points</th>
                      <th style={{ textAlign: 'right', padding: '20px 24px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedStudents.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '20px 24px', fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>
                          {s.rank.toString().padStart(2, '0')}
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-grotesk)', fontSize: '12px', fontWeight: 600 }}>
                              {getInitials(s.name)}
                            </div>
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-primary)' }}>
                          {s.attendanceCount}
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-primary)' }}>
                          {s.manualPoints}
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {s.score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="animate-fade-up" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px' }}>
            {activeSession ? (
              <div className="glass-card" style={{ padding: '40px', background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em' }}>LIVE SESSION</div>
                </div>
                <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>{activeSession.title}</h2>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {formatTime(activeSession.lecture_start)} - {formatTime(activeSession.lecture_end)}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--text-muted)' }}>
                  Attendance closes at {formatTime(activeSession.lecture_end)}
                </div>
              </div>
            ) : validUpcoming ? (
              <div className="glass-card" style={{ padding: '40px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '24px' }}>UPCOMING SESSION</div>
                <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>{validUpcoming.title}</h2>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent)', marginBottom: '16px', padding: '8px 16px', background: 'rgba(94,234,212,0.1)', display: 'inline-block', borderRadius: '8px' }}>
                  Starts in {getTimerText(new Date(validUpcoming.lecture_start))}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--text-primary)' }}>
                  {formatTime(validUpcoming.lecture_start)} - {formatTime(validUpcoming.lecture_end)}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                No active sessions.
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
