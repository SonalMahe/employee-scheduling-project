import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UpdateScheduleSchema } from '../schema';
import { getSchedule, updateSchedule, deleteScheduleEntry } from '../services/schedule.service';


//GET /schedule – view full job schedule-
export async function fetchSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    // EMPLOYEE sees only their own schedule, EMPLOYER sees all schedules.
    const employeeId = req.user?.role === 'EMPLOYEE' ? req.user.employeeId : undefined

    const schedule = await getSchedule(startDate, endDate, employeeId);
    res.status(200).json(schedule);
  } catch (err) {
    next(err);
  }
}
 

//PUT /schedule – employer or employee assigns shifts-
export async function assignSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = UpdateScheduleSchema.parse(req.body);

    // If logged in as EMPLOYEE, they can only add schedule for themselves
    if (req.user?.role === 'EMPLOYEE') {
      const employeeId = req.user.employeeId;
      if (employeeId === undefined) {
        res.status(403).json({ error: 'Employee session is missing employee ID' });
        return;
      }

      const isOwnOnly = input.entries.every(entry => entry.employeeId === employeeId);
      if (!isOwnOnly) {
        res.status(403).json({ error: 'You can only add schedule entries for yourself' });
        return;
      }
    }

    const results = await updateSchedule(input);
    res.status(200).json({ message: 'Schedule updated', count: results.length, results });
  } catch (err) {
    next(err);
  }
}


//DELETE /schedule/:id – remove a specific schedule entry-
export async function removeScheduleEntry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }
    await deleteScheduleEntry(id);
    res.status(200).json({ message: 'Schedule entry removed' });
  } catch (err) {
    next(err);
  }
}
