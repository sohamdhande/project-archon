import { parseCsv } from './csv-parser';

export async function getStudents() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const gid = process.env.GOOGLE_GID_SUMMARY;

  if (!spreadsheetId || !gid) {
    throw new Error('Missing Google Spreadsheet environment variables.');
  }

  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;

  const res = await fetch(url, {
    cache: 'no-store', // Force check fresh values
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch spreadsheet data: ${res.statusText}`);
  }

  const csvText = await res.text();
  const rows = parseCsv(csvText);

  // Expecting header row: Name,sessions attended,task points,total points
  const students = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 4 || !row[0].trim()) continue;

    const name = row[0].trim();
    const attendanceCount = parseInt(row[1]) || 0;
    const manualPoints = parseInt(row[2]) || 0;
    const score = parseInt(row[3]) || 0;

    // Use Name as the unique identifier since it's unique and stable
    const id = name;

    students.push({
      id,
      name,
      manualPoints,
      attendanceCount,
      score,
    });
  }

  return students;
}

export async function addStudent(name: string) {
  throw new Error('Database is in read-only spreadsheet mode.');
}

export async function removeStudent(id: string) {
  throw new Error('Database is in read-only spreadsheet mode.');
}

export async function updateStudentPoints(id: string, points: number) {
  throw new Error('Database is in read-only spreadsheet mode.');
}

export async function getSessions() {
  return [];
}

export async function addSession(title: string, lecture_start: string, lecture_end: string, meetLink: string) {
  throw new Error('Database is in read-only spreadsheet mode.');
}

export async function updateSession(id: string, title: string, lecture_start: string, lecture_end: string, meetLink: string) {
  throw new Error('Database is in read-only spreadsheet mode.');
}

export async function removeSession(id: string) {
  throw new Error('Database is in read-only spreadsheet mode.');
}

export async function getAttendance() {
  return [];
}

// Dummy prisma mock to prevent compilation issues in API routes / legacy components
export const prisma = {
  student: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  session: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  attendance: {
    findMany: async () => [],
    count: async () => 0,
    deleteMany: async () => ({}),
    createMany: async () => ({}),
  },
  $transaction: async (cb: any) => cb(prisma),
} as any;
