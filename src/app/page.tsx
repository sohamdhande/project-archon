import { prisma } from '@/lib/db';

export const revalidate = 30;

export default async function PublicPage() {
  const [students, sessions, attendance] = await Promise.all([
    prisma.student.findMany(),
    prisma.session.findMany({ orderBy: { datetime: 'asc' } }),
    prisma.attendance.findMany()
  ]);

  const getAttendanceCount = (studentId: string) =>
    attendance.filter((a: { studentId: string }) => a.studentId === studentId).length;

  const getScore = (student: typeof students[0]) =>
    getAttendanceCount(student.id) * 5 + student.manualPoints;

  const sorted = [...students]
    .map((s) => ({
      id: s.id,
      name: s.name,
      score: getScore(s),
      attendanceCount: getAttendanceCount(s.id)
    }))
    .sort((a, b) => b.score - a.score);

  let currentRank = 1;
  const rankedStudents = sorted.map((s, i) => {
    if (i > 0 && s.score < sorted[i - 1].score) {
      currentRank = i + 1;
    }
    return { ...s, rank: currentRank };
  });

  const attendanceSet = new Set(attendance.map((a: { studentId: string, sessionId: string }) => `${a.studentId}-${a.sessionId}`));
  const isPresent = (studentId: string, sessionId: string) =>
    attendanceSet.has(`${studentId}-${sessionId}`);

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-default';
  };

  return (
    <>
      <div className="top-glow-bar" />
      
      {/* Hero Section */}
      <section style={{ 
        minHeight: '60vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative'
      }}>
        <h1 style={{ 
          fontFamily: 'var(--font-grotesk)', 
          fontSize: 'clamp(4rem, 8vw, 8rem)', 
          fontWeight: 700, 
          lineHeight: 1, 
          margin: 0,
          textAlign: 'center'
        }}>
          <span style={{ color: 'var(--text-primary)' }}>Project</span><br />
          <span style={{ 
            color: 'var(--accent)', 
            textShadow: '0 0 40px rgba(45, 212, 191, 0.4), 0 0 10px rgba(45, 212, 191, 0.2)' 
          }}>Archon</span>
        </h1>
        <p style={{ 
          fontFamily: 'var(--font-mono)', 
          color: 'var(--text-muted)', 
          fontSize: '14px', 
          marginTop: '24px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          Dev Club · Crash Course
        </p>
      </section>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--accent)', opacity: 0.2, width: '100%' }} />

      {/* Main Content Area */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px 120px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* Leaderboard Card */}
        <div className="public-card fade-in delay-1">
          <div className="section-label">LEADERBOARD</div>
          
          <table className="public-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Name</th>
                <th style={{ textAlign: 'center' }}>Attendance</th>
                <th style={{ textAlign: 'right' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {rankedStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '48px 0', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No students yet — be the first.
                  </td>
                </tr>
              ) : (
                rankedStudents.map((s) => (
                  <tr key={s.id} className="public-tr">
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      <span className={getRankClass(s.rank)}>#</span> {s.rank}
                    </td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {s.attendanceCount}/{sessions.length}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      {s.score}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


      </main>
    </>
  );
}
