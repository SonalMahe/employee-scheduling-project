import { Router } from 'express';
import { authenticate, requireEmployer } from '../middleware/auth';
import { fetchAvailability, setAvailability, fetchAvailabilityByShiftDay } from '../controllers/availability.controller';

const router = Router();
router.use(authenticate);

// GET /availability?dayOfWeek=WEDNESDAY&shiftName=MORNING — employer sees who's available
router.get('/', requireEmployer, fetchAvailabilityByShiftDay);

// GET /availability/:employeeId — employer or own employee
router.get('/:employeeId', fetchAvailability);

// PUT /availability/:employeeId — employee sets own (or employer)
router.put('/:employeeId', setAvailability);

export default router;
