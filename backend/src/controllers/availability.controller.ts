// src/controllers/availability.controller.ts

import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { UpdateAvailabilitySchema } from '../schema'
import { getAvailability, updateAvailability } from '../services/availability.service'
import { AppError } from '../middleware/errorHandlerMiddleware'

const router = Router()

// ─────────────────────────
// GET /availability/:employeeId
// Employer can view anyone, employee can only view their own
// ─────────────────────────
router.get('/:employeeId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const employeeId = parseInt(req.params.employeeId as string)
    if (isNaN(employeeId)) {
      res.status(400).json({ error: 'Invalid employee ID' })
      return
    }

    if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== employeeId) {
      throw new AppError('You can only view your own availability', 403)
    }

    const availability = await getAvailability(employeeId)
    res.status(200).json(availability)
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────
// PUT /availability/:employeeId
// Employee sets their own availability (employer can also update)
// ─────────────────────────
router.put('/:employeeId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const employeeId = parseInt(req.params.employeeId as string)
    if (isNaN(employeeId)) {
      res.status(400).json({ error: 'Invalid employee ID' })
      return
    }

    if (req.user?.role === 'EMPLOYEE' && req.user.employeeId !== employeeId) {
      throw new AppError('You can only update your own availability', 403)
    }

    const input = UpdateAvailabilitySchema.parse(req.body)
    const results = await updateAvailability(employeeId, input)
    res.status(200).json({ message: 'Availability updated', count: results.length, results })
  } catch (err) {
    next(err)
  }
})

export default router
