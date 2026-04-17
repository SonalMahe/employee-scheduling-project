/**
 * SCHEDULE SERVICE
 * Handles reading and writing the job schedule.
 * Employer assigns employees to shifts; both roles can read.
 */
import prisma from '../utils/prisma'
import { AppError } from '../middleware/errorHandlerMiddleware'
import { UpdateScheduleInput } from '../schema'
import { ShiftType } from '@prisma/client'
import logger from '../utils/logger'

// ─────────────────────────────────────────
// GET SCHEDULE
// Returns all schedule entries within a date range.
// If no dates provided, defaults to the current week (Mon–Sun).
// ─────────────────────────────────────────
export async function getSchedule(startDate?: string, endDate?: string, employeeId?: number) {
  // Default to current week if no dates given
  logger.info('Fetching schedule', { startDate, endDate, employeeId })
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

  const result = await prisma.scheduleEntry.findMany({
    where: {
      date: { gte: from, lte: to },
      // If employeeId provided, filter to that employee only
      ...(employeeId !== undefined && { employeeId })
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

  logger.info('Schedule fetched', { count: result.length, employeeId })
  return result
}

// ─────────────────────────────────────────
// UPDATE SCHEDULE
// Employer assigns employees to shifts (upsert).
// One employee can only hold one shift per day.
// ─────────────────────────────────────────
export async function updateSchedule(input: UpdateScheduleInput) {
  logger.info('Updating schedule', { entryCount: input.entries.length })
  const results = []

  for (const entry of input.entries) {
    // Validate shift exists
    const shift = await prisma.shift.findUnique({
      where: { name: entry.shiftName as ShiftType }
    })
    if (!shift) {
      logger.warn('Schedule update failed - unknown shift', { shiftName: entry.shiftName })
      throw new AppError(`Unknown shift: ${entry.shiftName}`, 400)
    }

    // Validate employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: entry.employeeId }
    })
    if (!employee) {
      logger.warn('Schedule update failed - employee not found', { employeeId: entry.employeeId })
      throw new AppError(`Employee ${entry.employeeId} not found`, 404)
    }

    const targetDate = new Date(entry.date)

    // Prevent duplicate: same employee + same shift + same date
    const alreadyAssigned = await prisma.scheduleEntry.findFirst({
      where: {
        employeeId: entry.employeeId,
        shiftId: shift.id,
        date: targetDate,
      }
    })

    if (alreadyAssigned) {
      // Already assigned — skip silently
      logger.info('Schedule entry already exists', { employeeId: entry.employeeId, date: targetDate })
      results.push(alreadyAssigned)
      continue
    }

    const scheduleEntry = await prisma.scheduleEntry.create({
      data: {
        employeeId: entry.employeeId,
        shiftId: shift.id,
        date: targetDate
      }
    })

    logger.info('Schedule entry created', { employeeId: entry.employeeId, shiftName: entry.shiftName, date: targetDate })
    results.push(scheduleEntry)
  }

  logger.info('Schedule update completed', { totalEntries: results.length })
  return results
}

// ─────────────────────────────────────────
// DELETE SCHEDULE ENTRY
// Removes a single schedule slot by id.
// ─────────────────────────────────────────
export async function deleteScheduleEntry(id: number) {
  logger.info('Deleting schedule entry', { scheduleId: id })
  const entry = await prisma.scheduleEntry.findUnique({ where: { id } })
  if (!entry) {
    logger.warn('Schedule deletion failed - entry not found', { scheduleId: id })
    throw new AppError(`Schedule entry ${id} not found`, 404)
  }

  await prisma.scheduleEntry.delete({ where: { id } })
  logger.info('Schedule entry deleted', { scheduleId: id })
  return entry
}
