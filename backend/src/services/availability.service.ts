/**
 * AVAILABILITY SERVICE
 * Handles reading and updating employee shift preferences.
 */
import  prisma  from '../utils/prisma';
import { AppError } from '../middleware/errorHandlerMiddleware';
import { UpdateAvailabilityInput } from "../schema"
import logger from '../utils/logger';

export async function getAvailability(employeeId: number): Promise<object[]> {
  // Check employee exists first
  logger.info('Fetching availability', { employeeId })
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    logger.warn('Availability fetch failed - employee not found', { employeeId })
    throw new AppError(`Employee ${employeeId} not found`, 404);
  }

  const result = await prisma.availability.findMany({
    where: { employeeId },
    include: { shift: true },
    orderBy: [{ dayOfWeek: 'asc' }, { shiftId: 'asc' }],
  });

  logger.info('Availability fetched', { employeeId, count: result.length })
  return result;
}

export async function updateAvailability(
  employeeId: number,
  input: UpdateAvailabilityInput
): Promise<object[]> {
  logger.info('Updating availability', { employeeId, entryCount: input.availabilities.length })
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    logger.warn('Availability update failed - employee not found', { employeeId })
    throw new AppError(`Employee ${employeeId} not found`, 404);
  }

  // Process each availability entry
  const results = [];
  for (const entry of input.availabilities) {
    // Look up the shift by name
    const shift = await prisma.shift.findUnique({ where: { name: entry.shiftName } });
    if (!shift) {
      logger.warn('Availability update failed - unknown shift', { shiftName: entry.shiftName })
      throw new AppError(`Unknown shift: ${entry.shiftName}`, 400);
    }

    // "upsert" = update if exists, insert if not
    const availability = await prisma.availability.upsert({
      where: {
        // Uses the unique constraint: employeeId + shiftId + dayOfWeek
        employeeId_shiftId_dayOfWeek: {
          employeeId,
          shiftId: shift.id,
          dayOfWeek: entry.dayOfWeek,
        },
      },
      update: { status: entry.status },
      create: {
        employeeId,
        shiftId: shift.id,
        dayOfWeek: entry.dayOfWeek,
        status: entry.status,
      },
    });

    logger.info('Availability upserted', { employeeId, dayOfWeek: entry.dayOfWeek, shiftName: entry.shiftName, status: entry.status })
    results.push(availability);
  }

  logger.info('Availability update completed', { employeeId, updatedCount: results.length })
  return results;
}

/**
 * Get all employees' availability for a specific day+shift (employer use).
 * Returns employees with AVAILABLE or PREFERRED status.
 */
export async function getAvailabilityByShiftDay(
  dayOfWeek: string,
  shiftName: string
): Promise<object[]> {
  logger.info('Fetching availability by shift day', { dayOfWeek, shiftName })
  const shift = await prisma.shift.findUnique({ where: { name: shiftName } });
  if (!shift) {
    logger.warn('Availability fetch failed - unknown shift', { shiftName })
    throw new AppError(`Unknown shift: ${shiftName}`, 400);
  }

  const result = await prisma.availability.findMany({
    where: {
      dayOfWeek: dayOfWeek as any,
      shiftId: shift.id,
      status: { in: ['AVAILABLE', 'PREFERRED'] },
    },
    include: {
      shift: true,
      employee: {
        include: {
          user: { select: { name: true, position: true } },
        },
      },
    },
    orderBy: { status: 'asc' },
  });

  logger.info('Availability by shift day fetched', { dayOfWeek, shiftName, count: result.length })
  return result;
}
