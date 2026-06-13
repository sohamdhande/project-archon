import { prisma } from '@/lib/db';
import PublicClientView from '@/components/public/PublicClientView';

export const revalidate = 30;

export default async function PublicPage() {
  const now = new Date();

  const [students, sessions, attendance] = await Promise.all([
    prisma.student.findMany(),
    prisma.session.findMany({ orderBy: { lecture_start: 'asc' } }),
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
      manualPoints: s.manualPoints,
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

  // Find active and all upcoming sessions
  let activeSession = null;
  const upcomingSessions: typeof sessions = [];

  for (const s of sessions) {
    if (s.lecture_end > now) {
      if (s.lecture_start <= now) {
        activeSession = s;
      } else {
        upcomingSessions.push(s);
      }
    }
  }

  return (
    <PublicClientView 
      rankedStudents={rankedStudents}
      activeSession={activeSession}
      upcomingSessions={upcomingSessions}
      totalSessions={sessions.length}
    />
  );
}
