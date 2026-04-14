// src/controllers/auth.controller.ts

import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { loginService, getMeService } from "../services/auth.service"
import { UserRole } from "../types/user.types"
import "express-session"

const router = Router()

// ─────────────────────────
// POST /auth/login
// Public — no session needed
// ─────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" })
    return
  }

  try {
    const user = await loginService({ email, password })

    req.session.user = {
      id:         user.id,
      role:       user.role as UserRole,
      name:       user.name,
      employeeId: user.employeeId
    }

    res.status(200).json({
      message:    "Login successful",
      role:       user.role,
      name:       user.name,
      employeeId: user.employeeId
    })
  } catch (err) {
    if (err instanceof Error) {
      res.status(401).json({ error: err.message })
      return
    }
    res.status(500).json({ error: "Something went wrong" })
  }
})

// ─────────────────────────
// POST /auth/logout
// Protected — must be logged in
// ─────────────────────────
router.post("/logout", authenticate, async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Could not log out" })
      return
    }
    res.clearCookie("connect.sid")
    res.status(200).json({ message: "Logged out successfully" })
  })
})

// ─────────────────────────
// GET /auth/me
// Protected — get current logged in user
// ─────────────────────────
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.session.user?.id

    if (!userId) {
      res.status(401).json({ error: "Not logged in" })
      return
    }

    const user = await getMeService(userId)
    res.status(200).json({ user })
  } catch (err) {
    if (err instanceof Error) {
      res.status(404).json({ error: err.message })
      return
    }
    res.status(500).json({ error: "Something went wrong" })
  }
})

export default router
