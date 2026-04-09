import { Router } from 'express';
import { authenticate, requireEmployer } from '../middleware/auth';
import { fetchSchedule, assignSchedule, removeScheduleEntry } from '../controllers/schedule.controller';

const router = Router();
router.use(authenticate);

// GET /schedule — both employer and employee
router.get('/', fetchSchedule);

// PUT /schedule — employer only
router.put('/', requireEmployer, assignSchedule);

// DELETE /schedule/:id — employer only
router.delete('/:id', requireEmployer, removeScheduleEntry);

export default router;
