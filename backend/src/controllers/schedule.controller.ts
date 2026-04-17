import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UpdateScheduleSchema } from '../schema';
import { getSchedule, updateSchedule, deleteScheduleEntry } from '../services/schedule.service';
import logger from '../utils/logger';


//GET /schedule – view full job schedule-
export async function fetchSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    logger.info('Fetching schedule', { startDate, endDate, userRole: req.user?.role });

    // EMPLOYEE sees only their own schedule, EMPLOYER sees all schedules.
    let employeeId: number | undefined;
    if (req.user?.role === 'EMPLOYEE') {
      employeeId = req.user.employeeId;
      if (employeeId === undefined) {
        logger.warn('Employee session missing employee ID');
        res.status(403).json({ error: 'Employee session is missing employee ID' });
        return;
      }
    }

    const schedule = await getSchedule(startDate, endDate, employeeId);
    logger.info('Schedule fetched', { scheduleCount: schedule.length });
    res.status(200).json(schedule);
  } catch (err) {
    logger.error('Schedule fetch error', { error: String(err) });
    next(err);
  }
}
 

//PUT /schedule – employer or employee assigns shifts-
export async function assignSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.info('Updating schedule', { userId: req.user?.id });
    const input = UpdateScheduleSchema.parse(req.body);

    const results = await updateSchedule(input);
    logger.info('Schedule updated', { updateCount: results.length });
    res.status(200).json({ message: 'Schedule updated', count: results.length, results });
  } catch (err) {
    logger.error('Schedule update error', { error: String(err) });
    next(err);
  }
}


//DELETE /schedule/:id – remove a specific schedule entry-
export async function removeScheduleEntry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    logger.info('Deleting schedule entry', { scheduleId: id });
    if (isNaN(id)) { 
      logger.warn('Invalid schedule ID for deletion', { id: req.params.id });
      res.status(400).json({ error: 'Invalid ID' }); 
      return; 
    }
    await deleteScheduleEntry(id);
    logger.info('Schedule entry deleted', { scheduleId: id });
    res.status(200).json({ message: 'Schedule entry removed' });
  } catch (err) {
    logger.error('Schedule deletion error', { scheduleId: req.params.id, error: String(err) });
    next(err);
  }
}
