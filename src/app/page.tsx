import { getLeaderboardData } from '@/lib/cached-queries';
import PublicClientView from '@/components/public/PublicClientView';
import { AuroraHeroBg } from '@/components/public/AuroraHeroBg';

export const dynamic = 'force-dynamic';

export default async function PublicPage() {
  const now = new Date();

  let students: any[] = [];
  let sessions: any[] = [];
  let attendance: any[] = [];
  let dbError = null;

  try {
    const data = await getLeaderboardData();
    students = data.students;
    sessions = data.sessions;
    attendance = data.attendance;
  } catch (error) {
    console.error("Failed to load leaderboard data from database");
    dbError = error instanceof Error ? error : new Error(String(error));
  }

  if (dbError) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AuroraHeroBg />
        <nav className="top-nav">
          <div className="top-nav-left">
            <div className="top-nav-logo">
              <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
              <div style={{ fontFamily: 'var(--font-quantico)', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>ARCHON</div>
            </div>
          </div>
        </nav>
        <main className="main-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '40px 20px', textAlign: 'center', zIndex: 10 }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '40px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)', margin: 'auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-quantico)', fontSize: '24px', color: '#F8FAFC', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Unavailable</h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: '#94A3B8', lineHeight: 1.6 }}>
              We are currently experiencing high database load or connectivity issues. The leaderboard is temporarily offline, but your progress and attendance records are safe.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const sorted = [...students]
    .map((s) => ({
      id: s.id,
      name: s.name,
      manualPoints: s.manualPoints,
      score: s.score,
      attendanceCount: s.attendanceCount
    }))
    .sort((a, b) => b.score - a.score);

  let currentRank = 1;
  const rankedStudents = sorted.map((s, i) => {
    if (i > 0 && s.score < sorted[i - 1].score) {
      currentRank = i + 1;
    }
    return { ...s, rank: currentRank };
  });

  // Find active and all upcoming sessions (always empty in read-only mode)
  let activeSession = null;
  const upcomingSessions: typeof sessions = [];

  // Determine total sessions dynamically as the maximum of all students' attendanceCount
  const totalSessions = Math.max(...students.map((s) => s.attendanceCount), 0);

  return (
    <PublicClientView 
      rankedStudents={rankedStudents}
      activeSession={activeSession}
      upcomingSessions={upcomingSessions}
      totalSessions={totalSessions}
    />
  );
}
