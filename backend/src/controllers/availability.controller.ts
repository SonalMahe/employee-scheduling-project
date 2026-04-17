import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UpdateAvailabilitySchema } from '../schema';
import { getAvailability, updateAvailability, getAvailabilityByShiftDay } from '../services/availability.service';
import { AppError } from '../middleware/errorHandlerMiddleware';
import logger from '../utils/logger';

export async function fetchAvailabilityByShiftDay(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { dayOfWeek, shiftName } = req.query as { dayOfWeek?: string; shiftName?: string };
    logger.info('Fetching availability by shift day', { dayOfWeek, shiftName });
    if (!dayOfWeek || !shiftName) {
      logger.warn('Missing required parameters for availability fetch', { dayOfWeek, shiftName });
      res.status(400).json({ error: 'dayOfWeek and shiftName are required' });
      return;
    }
    const data = await getAvailabilityByShiftDay(dayOfWeek, shiftName);
    logger.info('Availability by shift day fetched', { dayOfWeek, shiftName, count: data.length });
    res.status(200).json(data);
  } catch (err) {
    logger.error('Availability fetch error', { error: String(err) });
    next(err);
  }
}

export async function fetchAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const employeeId = parseInt(req.params.employeeId as string);
    logger.info('Fetching availability', { employeeId, requestingUserId: req.user?.id });
    if (isNaN(employeeId)) {
      logger.warn('Invalid employee ID for availability fetch', { employeeId: req.params.employeeId });
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }

    // GET /availability/:id – get employee availability
    if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== employeeId) {
      logger.warn('Unauthorized availability access attempt', { requestingEmployeeId: req.user.employeeId, targetEmployeeId: employeeId });
      throw new AppError('You can only view your own availability', 403);
    }

    const availability = await getAvailability(employeeId);
    logger.info('Availability fetched', { employeeId, count: availability.length });
    res.status(200).json(availability);
  } catch (err) {
    logger.error('Availability fetch error', { error: String(err) });
    next(err);
  }
}

export async function setAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const employeeId = parseInt(req.params.employeeId as string);
    logger.info('Setting availability', { employeeId, requestingUserId: req.user?.id });
    if (isNaN(employeeId)) {
      logger.warn('Invalid employee ID for availability update', { employeeId: req.params.employeeId });
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }

    //PUT /availability/:id – employee sets own availability
    if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== employeeId) {
      logger.warn('Unauthorized availability update attempt', { requestingEmployeeId: req.user.employeeId, targetEmployeeId: employeeId });
      throw new AppError('You can only update your own availability', 403);
    }

    const input = UpdateAvailabilitySchema.parse(req.body);
    const results = await updateAvailability(employeeId, input);
    logger.info('Availability updated', { employeeId, updateCount: results.length });
    res.status(200).json({ message: 'Availability updated', count: results.length, results });
  } catch (err) {
    logger.error('Availability update error', { error: String(err) });
    next(err);
  }
}
