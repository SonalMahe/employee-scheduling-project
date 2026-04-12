import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UpdateScheduleSchema } from '../schema';
import { getSchedule, updateSchedule, deleteScheduleEntry } from '../services/schedule.service';


//GET /schedule – view full job schedule-
export async function fetchSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const schedule = await getSchedule(startDate, endDate);
    res.status(200).json(schedule);
  } catch (err) {
    next(err);
  }
}
 

//PUT /schedule – employer assigns employees to shifts-
export async function assignSchedule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = UpdateScheduleSchema.parse(req.body);
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
