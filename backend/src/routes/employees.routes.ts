// src/routes/employee.routes.ts

import { Router } from "express"
import { authenticate, requireEmployer, isEmployee } from "../middleware/auth"
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
router.get("/me", authenticate, isEmployee, getMyProfile)

// ── Employer only ──────────────────────────
router.get("/",       authenticate, requireEmployer, listEmployees)
router.post("/",      authenticate, requireEmployer, registerEmployee)
router.get("/:id",    authenticate, requireEmployer, getEmployee)
router.put("/:id",    authenticate, requireEmployer, updateEmployee)
router.delete("/:id", authenticate, requireEmployer, deleteEmployee)

export default router