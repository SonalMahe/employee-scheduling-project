// src/controllers/employee.controller.ts

import { Router } from "express"
import { authenticate, requireEmployer, isEmployee, AuthRequest } from "../middleware/auth"
import {
  getAllEmployeesService,
  getEmployeeByIdService,
  registerEmployeeService,
  updateEmployeeService,
  deleteEmployeeService,
  getMyProfileService
} from "../services/employee.service"

const router = Router()

// ─────────────────────────
// GET /employees/me
// Must come BEFORE /:id so it doesn't get matched as an id
// ─────────────────────────
router.get("/me", authenticate, isEmployee, async (req: AuthRequest, res) => {
  const employeeId = req.user?.employeeId

  if (!employeeId) {
    res.status(401).json({ error: "Not logged in" })
    return
  }

  try {
    const employee = await getMyProfileService(employeeId)
    res.json(employee)
  } catch (err) {
    res.status(404).json({ error: "Profile not found" })
  }
})

// ─────────────────────────
// GET /employees
// ─────────────────────────
router.get("/", authenticate, requireEmployer, async (_req, res) => {
  try {
    const employees = await getAllEmployeesService()
    res.json(employees)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Could not fetch employees" })
  }
})

// ─────────────────────────
// GET /employees/:id
// ─────────────────────────
router.get("/:id", authenticate, requireEmployer, async (req, res) => {
  const id = parseInt(req.params.id as string)

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" })
    return
  }

  try {
    const employee = await getEmployeeByIdService(id)
    res.json(employee)
  } catch (err) {
    res.status(404).json({ error: "Employee not found" })
  }
})

// ─────────────────────────
// POST /employees
// ─────────────────────────
router.post("/", authenticate, requireEmployer, async (req, res) => {
  const { name, email, loginCode, position } = req.body

  if (!name || !email || !loginCode || !position) {
    res.status(400).json({ error: "All fields are required" })
    return
  }

  try {
    const employee = await registerEmployeeService({ name, email, loginCode, position })
    res.status(201).json(employee)
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Could not create employee" })
  }
})

// ─────────────────────────
// PUT /employees/:id
// ─────────────────────────
router.put("/:id", authenticate, requireEmployer, async (req, res) => {
  const id = parseInt(req.params.id as string)
  const { name, loginCode, position } = req.body

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" })
    return
  }

  try {
    const employee = await updateEmployeeService(id, { name, loginCode, position })
    res.json(employee)
  } catch (err) {
    res.status(404).json({ error: "Employee not found" })
  }
})

// ─────────────────────────
// DELETE /employees/:id
// ─────────────────────────
router.delete("/:id", authenticate, requireEmployer, async (req, res) => {
  const id = parseInt(req.params.id as string)

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" })
    return
  }

  try {
    await deleteEmployeeService(id)
    res.json({ message: "Deleted successfully" })
  } catch (err) {
    res.status(404).json({ error: "Employee not found" })
  }
})

export default router
