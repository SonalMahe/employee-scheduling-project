import { Request, Response } from "express"
import { z } from "zod"
import { loginService, getMeService } from "../services/auth.service"
import { UserRole } from "../types/user.types"
import { LoginSchema } from "../schema"
import "express-session"
import logger from "../utils/logger"


// ─────────────────────────────────────────
// LOGIN
// POST /auth/login
// ─────────────────────────────────────────
export async function login(
  req: Request,
  res: Response
): Promise<void> {
  try {
    logger.info('Login attempt', { email: req.body?.email })
    const input = LoginSchema.parse(req.body)

    // Call service — all logic lives there
    const user = await loginService(input)

    // Save to session
    req.session.user = {
      id:         user.id,
      role:       user.role as UserRole,
      name:       user.name,
      employeeId: user.employeeId
    }

    logger.info('Login successful', { userId: user.id, role: user.role })
    // Send response
    res.status(200).json({
      message:    "Login successful",
      role:       user.role,
      name:       user.name,
      employeeId: user.employeeId
    })

  } catch (err) {
    // loginService throws "Invalid email or password"
    if (err instanceof z.ZodError) {
      const message = err.issues[0]?.message ?? "Invalid input"
      logger.warn('Login validation failed', { error: message, email: req.body?.email })
      res.status(400).json({ error: message })
      return
    }
    if (err instanceof Error) {
      logger.warn('Login failed', { error: err.message, email: req.body?.email })
      res.status(401).json({ error: err.message })
      return
    }
    logger.error('Unexpected login error')
    res.status(500).json({ error: "Something went wrong" })
  }
}

// ─────────────────────────────────────────
// LOGOUT
// POST /auth/logout
// ─────────────────────────────────────────
export async function logout(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.session?.user?.id
  logger.info('Logout attempt', { userId })
  
  // If no session exists, just clear cookie and return success
  if (!req.session || !req.session.user) {
    logger.info('Logout called with no active session')
    res.clearCookie("connect.sid")
    res.status(200).json({ message: "Logged out successfully" })
    return
  }

  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destroy error', { error: err.message })
      res.status(500).json({ error: "Could not log out" })
      return
    }
    logger.info('Logout successful', { userId })
    res.clearCookie("connect.sid")
    res.status(200).json({ message: "Logged out successfully" })
  })
}

// ─────────────────────────────────────────
// GET CURRENT USER
// GET /auth/me
// ─────────────────────────────────────────
export async function getMe(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.session.user?.id
    logger.info('GetMe request', { userId })

    if (!userId) {
      logger.warn('GetMe failed - not logged in')
      res.status(401).json({ error: "Not logged in" })
      return
    }

    // Call service to get full profile from database
    const user = await getMeService(userId)

    res.status(200).json({ user })

  } catch (err) {
    if (err instanceof Error) {
      logger.error('GetMe error', { error: err.message, userId: req.session.user?.id })
      res.status(404).json({ error: err.message })
      return
    }
    logger.error('Unexpected GetMe error')
    res.status(500).json({ error: "Something went wrong" })
  }
}