// /
//  * SCHEDULE SERVICE
//  * Handles reading and writing the job schedule.
//  * Employer assigns employees to shifts; both roles can read.
//  *
import prisma from '../utils/prisma'
import { AppError } from '../middleware/errorHandlerMiddleware'
import { UpdateScheduleInput } from '../schema'
import { ShiftType } from '@prisma/client'

// ─────────────────────────────────────────
// GET SCHEDULE
// Returns all schedule entries within a date range.
// If no dates provided, defaults to the current week (Mon–Sun).
// ─────────────────────────────────────────
export async function getSchedule(startDate?: string, endDate?: string) {
  // Default to current week if no dates given
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sun, 1 = Mon ...
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)) // roll back to Monday
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const from = startDate ? new Date(startDate) : monday
  const to   = endDate   ? new Date(endDate)   : sunday

  return prisma.scheduleEntry.findMany({
    where: {
      date: { gte: from, lte: to }
    },
    include: {
      employee: {
        include: {
          user: {
            select: { name: true, position: true, photoUrl: true }
          }
        }
      },
      shift: true
    },
    orderBy: [{ date: 'asc' }, { shiftId: 'asc' }]
  })
}

// ─────────────────────────────────────────
// UPDATE SCHEDULE
// Employer assigns employees to shifts (upsert).
// One employee can only hold one shift per day.
// ─────────────────────────────────────────
export async function updateSchedule(input: UpdateScheduleInput) {
  const results = []

  for (const entry of input.entries) {
    // Validate shift exists
    const shift = await prisma.shift.findUnique({
      where: { name: entry.shiftName as ShiftType }
    })
    if (!shift) {
      throw new AppError(`Unknown shift: ${entry.shiftName}`, 400)
    }

    // Validate employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: entry.employeeId }
    })
    if (!employee) {
      throw new AppError(`Employee ${entry.employeeId} not found`, 404)
    }

    // Upsert: update shift if already scheduled that day, else create
    const scheduleEntry = await prisma.scheduleEntry.upsert({
      where: {
        employeeId_date: {
          employeeId: entry.employeeId,
          date: new Date(entry.date)
        }
      },
      update: { shiftId: shift.id },
      create: {
        employeeId: entry.employeeId,
        shiftId:    shift.id,
        date:       new Date(entry.date)
      }
    })

    results.push(scheduleEntry)
  }

  return results
}

// ─────────────────────────────────────────
// DELETE SCHEDULE ENTRY
// Removes a single schedule slot by id.
// ─────────────────────────────────────────
export async function deleteScheduleEntry(id: number) {
  const entry = await prisma.scheduleEntry.findUnique({ where: { id } })
  if (!entry) {
    throw new AppError(`Schedule entry ${id} not found`, 404)
  }

  return prisma.scheduleEntry.delete({ where: { id } })
}
