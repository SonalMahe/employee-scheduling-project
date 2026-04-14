import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UpdateAvailabilitySchema } from '../schema';
import { getAvailability, updateAvailability } from '../services/availability.service';
import { AppError } from '../middleware/errorHandlerMiddleware';

export async function fetchAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const employeeId = parseInt(req.params.employeeId);
    if (isNaN(employeeId)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }

    // GET /availability/:id – get employee availability
    if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== employeeId) {
      throw new AppError('You can only view your own availability', 403);
    }

    const availability = await getAvailability(employeeId);
    res.status(200).json(availability);
  } catch (err) {
    next(err);
  }
}

export async function setAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const employeeId = parseInt(req.params.employeeId as string);
    if (isNaN(employeeId)) {
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }

    //PUT /availability/:id – employee sets own availability
    if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== employeeId) {
      throw new AppError('You can only update your own availability', 403);
    }

    const input = UpdateAvailabilitySchema.parse(req.body);
    const results = await updateAvailability(employeeId, input);
    res.status(200).json({ message: 'Availability updated', count: results.length, results });
  } catch (err) {
    next(err);
  }
}
