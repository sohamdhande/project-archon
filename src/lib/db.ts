import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function getStudents() {
  return prisma.student.findMany()
}

export async function addStudent(name: string) {
  return prisma.student.create({ data: { name } })
}

export async function removeStudent(id: string) {
  return prisma.student.delete({ where: { id } })
}

export async function updateStudentPoints(id: string, points: number) {
  return prisma.student.update({
    where: { id },
    data: { manualPoints: { increment: points } }
  })
}

export async function getSessions() {
  return prisma.session.findMany()
}

export async function addSession(title: string, lecture_start: string, lecture_end: string, meetLink: string) {
  return prisma.session.create({
    data: { title, lecture_start: new Date(lecture_start), lecture_end: new Date(lecture_end), meetLink }
  })
}

export async function updateSession(id: string, title: string, lecture_start: string, lecture_end: string, meetLink: string) {
  return prisma.session.update({
    where: { id },
    data: { title, lecture_start: new Date(lecture_start), lecture_end: new Date(lecture_end), meetLink }
  })
}

export async function removeSession(id: string) {
  return prisma.session.delete({ where: { id } })
}

export async function getAttendance() {
  return prisma.attendance.findMany()
}
