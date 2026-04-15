import { Router } from "express"
import { login, logout, getMe } from "../controllers/auth.controller"
import { authenticate } from "../middleware/auth"

const router = Router()

// Public — no session needed
// POST /auth/login
router.post("/login", login)

// Public logout — no auth required (allows users to logout even if session is lost)
// POST /auth/logout
router.post("/logout", logout)

// Protected — get current user profile
// GET /auth/me
router.get("/me", authenticate, getMe)

export default router