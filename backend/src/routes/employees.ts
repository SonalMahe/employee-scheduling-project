// src/routes/employee.routes.ts

import { Router } from "express"
import { verifySession, isEmployer, isEmployee } from "../middleware/auth"
import {
  listEmployees,
  getEmployee,
  registerEmployee,
  updateEmployee,
  deleteEmployee,
  getMyProfile
} from "../controllers/employee.controller"

const router = Router()

// ── Employee only ──────────────────────────
// Must come before /:id so it doesn't get
// confused as an id route
router.get("/me", verifySession, isEmployee, getMyProfile)

// ── Employer only ──────────────────────────
router.get("/",       verifySession, isEmployer, listEmployees)
router.post("/",      verifySession, isEmployer, registerEmployee)
router.get("/:id",    verifySession, isEmployer, getEmployee)
router.put("/:id",    verifySession, isEmployer, updateEmployee)
router.delete("/:id", verifySession, isEmployer, deleteEmployee)

export default router