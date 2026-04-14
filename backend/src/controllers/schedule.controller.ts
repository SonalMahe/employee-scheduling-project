// src/controllers/schedule.controller.ts

import { Router } from 'express'
import { authenticate, requireEmployer, AuthRequest } from '../middleware/auth'
import { UpdateScheduleSchema } from '../schema'
import { getSchedule, updateSchedule, deleteScheduleEntry } from '../services/schedule.service'

const router = Router()

// ─────────────────────────
// GET /schedule
// Both employer and employee can view the schedule
// ─────────────────────────
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string }
    const schedule = await getSchedule(startDate, endDate)
    res.status(200).json(schedule)
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────
// PUT /schedule
// Employer assigns employees to shifts
// ─────────────────────────
router.put('/', authenticate, requireEmployer, async (req: AuthRequest, res, next) => {
  try {
    const input = UpdateScheduleSchema.parse(req.body)
    const results = await updateSchedule(input)
    res.status(200).json({ message: 'Schedule updated', count: results.length, results })
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────
// DELETE /schedule/:id
// Employer removes a specific schedule entry
// ─────────────────────────
router.delete('/:id', authenticate, requireEmployer, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id as string)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID' })
      return
    }
    await deleteScheduleEntry(id)
    res.status(200).json({ message: 'Schedule entry removed' })
  } catch (err) {
    next(err)
  }
})

export default router
