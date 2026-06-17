'use client';

import { useState, useEffect } from 'react';
import { AuroraHeroBg } from './AuroraHeroBg';

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
  upcomingSessions: Session[];
  totalSessions: number;
}

export default function PublicClientView({ rankedStudents, activeSession, upcomingSessions, totalSessions }: Props) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'sessions'>('leaderboard');
  const [now, setNow] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Only highlight the NEXT upcoming session in the top nav if it's within 5 hours
  let validUpcoming: Session | null = null;
  if (upcomingSessions.length > 0 && (new Date(upcomingSessions[0].lecture_start).getTime() - now.getTime()) <= 5 * 60 * 60 * 1000) {
    validUpcoming = upcomingSessions[0];
  }

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
    <nav className="top-nav">
      <div className="top-nav-left">
        <div className="top-nav-logo">
          <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <div style={{ fontFamily: 'var(--font-quantico)', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>ARCHON</div>
        </div>

        <div className="top-nav-tabs">
          {[
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'sessions', label: 'Sessions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'leaderboard' | 'sessions')}
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

      <div className="top-nav-right">
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
      <AuroraHeroBg />

      <TopNav />

      <main className="main-container">

        {activeTab === 'leaderboard' && (
          <div className="animate-fade-up">
            <div className="hero-section">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
                NST-SDC
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <span style={{ fontFamily: 'var(--font-quantico)', fontWeight: 700, fontSize: '28px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
                  Project
                </span>
                <h1 style={{ fontFamily: 'var(--font-quantico)', fontWeight: 700, fontSize: 'clamp(48px, 6vw, 80px)', color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.0, margin: 0 }}>
                  ARCHON
                </h1>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--text-muted)' }}>
                Build. Learn. Compete. Repeat.
              </p>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
              {/* Students Card */}
              <div className="stat-card-premium">
                <div className="stat-card-glow" />
                <div className="stat-card-grid-bg" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, position: 'relative' }}>
                  <div className="stat-card-label">
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                    Students
                  </div>
                  <svg className="stat-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div style={{ zIndex: 1, position: 'relative' }}>
                  <div className="stat-card-value">
                    {rankedStudents.length.toString().padStart(2, '0')}
                    <span className="stat-card-value-unit">active</span>
                  </div>
                  <div className="stat-card-footer">
                    <span>Enrolled on leaderboard</span>
                  </div>
                </div>
              </div>

              {/* Sessions Card */}
              <div className="stat-card-premium">
                <div className="stat-card-glow" />
                <div className="stat-card-grid-bg" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, position: 'relative' }}>
                  <div className="stat-card-label">
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#60A5FA' }} />
                    Sessions
                  </div>
                  <svg className="stat-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div style={{ zIndex: 1, position: 'relative' }}>
                  <div className="stat-card-value">
                    {totalSessions.toString().padStart(2, '0')}
                    <span className="stat-card-value-unit">total</span>
                  </div>
                  <div className="stat-card-footer">
                    <span>Curriculum lectures</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: TOP 3 */}
            {rankedStudents.length > 0 && (
              <div style={{ marginBottom: '80px' }}>
                <div className="podium-grid">

                  {/* Rank 2 */}
                  {rankedStudents[1] && (
                    <div className="podium-card-esports podium-height-2 podium-card-2">
                      <div className="podium-medal-glow" />
                      
                      {/* Top medal header */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <div className="podium-badge-medal">
                          {/* Silver Premium Trophy SVG */}
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(203,213,225,0.4))' }}>
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                            <path d="M12 2a4 4 0 0 1 4 4v5a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
                          </svg>
                        </div>
                        
                        {/* Avatar */}
                        <div className="avatar-squircle avatar-squircle-silver" style={{ width: '80px', height: '80px' }}>
                          <div style={{ fontFamily: 'var(--font-space-grotesk), var(--font-grotesk)', fontSize: '22px', fontWeight: 700, color: '#CBD5E1' }}>
                            {getInitials(rankedStudents[1].name)}
                          </div>
                        </div>
                      </div>

                      {/* Participant name and stats */}
                      <div className="podium-info-container">
                        <h3 className="podium-name-esports podium-name-silver">
                          {rankedStudents[1].name}
                        </h3>
                        
                        <div className="podium-chips-row">
                          <span className="stat-chip">
                            {rankedStudents[1].attendanceCount} sessions
                          </span>
                          <span className="stat-chip stat-chip-accent">
                            +{rankedStudents[1].manualPoints} pts
                          </span>
                        </div>
                      </div>

                      {/* Score Focal Point */}
                      <div className="score-focal-pill">
                        <span className="score-focal-label">Score</span>
                        <span className="score-focal-value">{rankedStudents[1].score}</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 1 */}
                  {rankedStudents[0] && (
                    <div className="podium-card-esports podium-height-1 podium-card-1">
                      <div className="podium-height-1-glow" />
                      <div className="podium-medal-glow" />
                      
                      {/* Top medal header */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <div className="podium-badge-medal">
                          {/* Gold Premium Trophy SVG */}
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.6))' }}>
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                            <path d="M12 2a4 4 0 0 1 4 4v5a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
                          </svg>
                        </div>
                        
                        {/* Avatar */}
                        <div className="avatar-squircle avatar-squircle-gold" style={{ width: '96px', height: '96px' }}>
                          <div style={{ fontFamily: 'var(--font-space-grotesk), var(--font-grotesk)', fontSize: '26px', fontWeight: 700, color: '#F59E0B' }}>
                            {getInitials(rankedStudents[0].name)}
                          </div>
                        </div>
                      </div>

                      {/* Participant name and stats */}
                      <div className="podium-info-container" style={{ gap: '10px' }}>
                        <h3 className="podium-name-esports podium-name-gold">
                          {rankedStudents[0].name}
                        </h3>
                        
                        <div className="podium-chips-row">
                          <span className="stat-chip stat-chip-gold">
                            {rankedStudents[0].attendanceCount} sessions
                          </span>
                          <span className="stat-chip stat-chip-accent">
                            +{rankedStudents[0].manualPoints} pts
                          </span>
                        </div>
                      </div>

                      {/* Score Focal Point */}
                      <div className="score-focal-pill score-focal-pill-gold">
                        <span className="score-focal-label">Score</span>
                        <span className="score-focal-value score-focal-value-gold">{rankedStudents[0].score}</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 */}
                  {rankedStudents[2] && (
                    <div className="podium-card-esports podium-height-3 podium-card-3">
                      <div className="podium-medal-glow" />
                      
                      {/* Top medal header */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <div className="podium-badge-medal">
                          {/* Bronze Premium Trophy SVG */}
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CD7F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(205,127,50,0.4))' }}>
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                            <path d="M12 2a4 4 0 0 1 4 4v5a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
                          </svg>
                        </div>
                        
                        {/* Avatar */}
                        <div className="avatar-squircle avatar-squircle-bronze" style={{ width: '80px', height: '80px' }}>
                          <div style={{ fontFamily: 'var(--font-space-grotesk), var(--font-grotesk)', fontSize: '20px', fontWeight: 700, color: '#CD7F32' }}>
                            {getInitials(rankedStudents[2].name)}
                          </div>
                        </div>
                      </div>

                      {/* Participant name and stats */}
                      <div className="podium-info-container">
                        <h3 className="podium-name-esports podium-name-bronze">
                          {rankedStudents[2].name}
                        </h3>
                        
                        <div className="podium-chips-row">
                          <span className="stat-chip">
                            {rankedStudents[2].attendanceCount} sessions
                          </span>
                          <span className="stat-chip stat-chip-accent">
                            +{rankedStudents[2].manualPoints} pts
                          </span>
                        </div>
                      </div>

                      {/* Score Focal Point */}
                      <div className="score-focal-pill">
                        <span className="score-focal-label">Score</span>
                        <span className="score-focal-value">{rankedStudents[2].score}</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* SECTION 3: LEADERBOARD TABLE */}
            {rankedStudents.length > 0 && (
              <div className="glass-card table-container">
                <table className="table-el">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <th className="table-header-cell">Rank</th>
                      <th className="table-header-cell">Student</th>
                      <th className="table-header-cell-right">Attendance</th>
                      <th className="table-header-cell-right">Points</th>
                      <th className="table-header-cell-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedStudents.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td className="table-body-cell">
                          {s.rank.toString().padStart(2, '0')}
                        </td>
                        <td className="table-body-cell-student">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-grotesk)', fontSize: '12px', fontWeight: 600 }}>
                              {getInitials(s.name)}
                            </div>
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</span>
                          </div>
                        </td>
                        <td className="table-body-cell-right">
                          {s.attendanceCount}
                        </td>
                        <td className="table-body-cell-right">
                          {s.manualPoints}
                        </td>
                        <td className="table-body-cell-score">
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
          <div className="animate-fade-up session-container">
            {activeSession && (
              <div className="glass-card session-card" style={{ background: 'rgba(94, 234, 212, 0.05)', border: '1px solid rgba(94, 234, 212, 0.2)', position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
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
            )}

            {upcomingSessions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {upcomingSessions.map((session, index) => {
                  const isNext = index === 0 && (!activeSession); // Highlight as next if it's the very first one and no live session

                  return (
                    <div key={session.id} className="glass-card session-card">
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '24px' }}>
                        {isNext ? 'UPCOMING SESSION' : 'FUTURE SESSION'}
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>{session.title}</h2>

                      {isNext && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent)', marginBottom: '16px', padding: '8px 16px', background: 'rgba(94,234,212,0.1)', display: 'inline-block', borderRadius: '8px' }}>
                          Starts in {getTimerText(new Date(session.lecture_start))}
                        </div>
                      )}

                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--text-primary)' }}>
                        {new Date(session.lecture_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {formatTime(session.lecture_start)} - {formatTime(session.lecture_end)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (!activeSession && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                No upcoming sessions scheduled.
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
