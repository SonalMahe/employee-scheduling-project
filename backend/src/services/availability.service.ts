/**
 * AVAILABILITY SERVICE
 * Handles reading and updating employee shift preferences.
 */
import  prisma  from '../utils/prisma';
import { AppError } from '../middleware/errorHandlerMiddleware';
import { UpdateAvailabilityInput } from "../schema"

export async function getAvailability(employeeId: number): Promise<object[]> {
  // Check employee exists first
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    throw new AppError(`Employee ${employeeId} not found`, 404);
  }

  return prisma.availability.findMany({
    where: { employeeId },
    include: { shift: true },
    orderBy: [{ dayOfWeek: 'asc' }, { shiftId: 'asc' }],
  });
}

export async function updateAvailability(
  employeeId: number,
  input: UpdateAvailabilityInput
): Promise<object[]> {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    throw new AppError(`Employee ${employeeId} not found`, 404);
  }

  // Process each availability entry
  const results = [];
  for (const entry of input.availabilities) {
    // Look up the shift by name
    const shift = await prisma.shift.findUnique({ where: { name: entry.shiftName } });
    if (!shift) {
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
    results.push(availability);
  }

  return results;
}
