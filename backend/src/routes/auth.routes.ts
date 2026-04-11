import { Router } from "express"
import { login, logout, getMe } from "../controllers/auth.controller"
import { verifySession } from "../middleware/auth"

const router = Router()

// Public — no session needed
// POST /auth/login
router.post("/login", login)

// Protected — must be logged in
// POST /auth/logout
router.post("/logout", verifySession, logout)

// Protected — get current user profile
// GET /auth/me
router.get("/me", verifySession, getMe)

export default router