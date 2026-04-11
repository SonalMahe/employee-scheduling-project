import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { fetchAvailability, setAvailability } from '../controllers/availability.controller';

const router = Router();
router.use(authenticate);

// GET /availability/:employeeId — employer or own employee
router.get('/:employeeId', fetchAvailability);

// PUT /availability/:employeeId — employee sets own (or employer)
router.put('/:employeeId', setAvailability);

export default router;
