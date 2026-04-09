import { Request, Response } from "express"
import { loginService, getMeService } from "../services/auth.service"
import { UserRole } from "../types/user.types"
import "express-session";


// ─────────────────────────────────────────
// LOGIN
// POST /auth/login
// ─────────────────────────────────────────
export async function login(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password } = req.body

  // Basic validation
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" })
    return
  }

  try {
    // Call service — all logic lives there
    const user = await loginService({ email, password })

    // Save to session
    req.session.user = {
      id:         user.id,
      role:       user.role as UserRole,
      name:       user.name,
      employeeId: user.employeeId
    }

    // Send response
    res.status(200).json({
      message:    "Login successful",
      role:       user.role,
      name:       user.name,
      employeeId: user.employeeId
    })

  } catch (err) {
    // loginService throws "Invalid email or password"
    if (err instanceof Error) {
      res.status(401).json({ error: err.message })
      return
    }
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
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Could not log out" })
      return
    }
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

    if (!userId) {
      res.status(401).json({ error: "Not logged in" })
      return
    }

    // Call service to get full profile from database
    const user = await getMeService(userId)

    res.status(200).json({ user })

  } catch (err) {
    if (err instanceof Error) {
      res.status(404).json({ error: err.message })
      return
    }
    res.status(500).json({ error: "Something went wrong" })
  }
}