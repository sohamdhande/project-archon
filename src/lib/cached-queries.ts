import { unstable_cache } from 'next/cache';
import { getStudents, getSessions, getAttendance } from '@/lib/db';

const getCachedLeaderboardData = unstable_cache(
  async () => {
    // These calls query the Google Spreadsheet.
    // If they fail, they will throw, and the caller can handle the error.
    const [students, sessions, attendance] = await Promise.all([
      getStudents(),
      getSessions(),
      getAttendance()
    ]);

    return {
      students,
      sessions,
      attendance
    };
  },
  ['leaderboard-data'],
  {
    revalidate: 1800, // 30 minutes (1800 seconds)
    tags: ['leaderboard']
  }
);

export async function getLeaderboardData() {
  const data = await getCachedLeaderboardData();

  // Safely parse ISO date strings back to JavaScript Date objects.
  // Next.js unstable_cache serializes objects to JSON, converting Dates to strings.
  const parsedSessions = data.sessions.map((session: any) => ({
    ...session,
    lecture_start: new Date(session.lecture_start),
    lecture_end: new Date(session.lecture_end)
  }));

  return {
    students: data.students,
    sessions: parsedSessions,
    attendance: data.attendance
  };
}
