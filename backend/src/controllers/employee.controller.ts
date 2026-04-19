import { Request, Response } from "express"
import { z } from "zod"
import { RegisterEmployeeSchema, UpdateEmployeeSchema } from "../schema"
import {
  getAllEmployeesService,
  getEmployeeByIdService,
  registerEmployeeService,
  updateEmployeeService,
  deleteEmployeeService,
  getMyProfileService
} from "../services/employee.service"
import "express-session"
import logger from "../utils/logger"

// ─────────────────────────────────────────
// GET ALL EMPLOYEES
// GET /employees
// ─────────────────────────────────────────
export async function listEmployees(
  req: Request,
  res: Response
): Promise<void> {
  try {
    logger.info('Fetching all employees')
    const employees = await getAllEmployeesService()
    logger.info('Fetched employees', { count: employees.length })
    res.status(200).json(employees)

  } catch (err) {
    logger.error("listEmployees error", { error: String(err) })
    res.status(500).json({ error: "Could not fetch employees" })
  }
}

// ─────────────────────────────────────────
// GET SINGLE EMPLOYEE
// GET /employees/:id
// ─────────────────────────────────────────
export async function getEmployee(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = parseInt(req.params.id as string)
    logger.info('Fetching employee', { employeeId: id })

    if (isNaN(id)) {
      logger.warn('Invalid employee ID provided', { id: req.params.id })
      res.status(400).json({ error: "Invalid employee ID" })
      return
    }

    const employee = await getEmployeeByIdService(id)
    logger.info('Employee fetched', { employeeId: id })
    res.status(200).json(employee)

  } catch (err) {
    logger.error("getEmployee error", { employeeId: req.params.id, error: String(err) })
    if (err instanceof Error) {
      res.status(404).json({ error: err.message })
      return
    }
    res.status(500).json({ error: "Could not fetch employee" })
  }
}

// ─────────────────────────────────────────
// REGISTER NEW EMPLOYEE
// POST /employees
// ─────────────────────────────────────────
export async function registerEmployee(
  req: Request,
  res: Response
): Promise<void> {
  try {
    logger.info('Employee registration attempt', { email: req.body?.email })
    const input = RegisterEmployeeSchema.parse(req.body)
    const employee = await registerEmployeeService(input)

    logger.info('Employee registered successfully', { employeeId: employee.id, email: employee.email })
    res.status(201).json({
      message: "Employee registered successfully",
      employee
    })

  } catch (err) {
    logger.warn("Employee registration error", { email: req.body?.email, error: String(err) })
    if (err instanceof z.ZodError) {
      const message = err.issues[0]?.message ?? "Invalid input"
      res.status(400).json({ error: message })
      return
    }
    if (err instanceof Error) {
      res.status(409).json({ error: err.message })
      return
    }
    logger.error("Unexpected registration error")
    res.status(500).json({ error: "Could not register employee" })
  }
}

// ─────────────────────────────────────────
// UPDATE EMPLOYEE
// PUT /employees/:id
// ─────────────────────────────────────────
export async function updateEmployee(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseInt(req.params.id as string)
  logger.info('Updating employee', { employeeId: id })

  if (isNaN(id)) {
    logger.warn('Invalid employee ID for update', { id: req.params.id })
    res.status(400).json({ error: "Invalid employee ID" })
    return
  }

  try {
    const input = UpdateEmployeeSchema.parse(req.body)
    const employee = await updateEmployeeService(id, input)

    logger.info('Employee updated successfully', { employeeId: id })
    res.status(200).json({
      message: "Employee updated successfully",
      employee
    })

  } catch (err) {
    logger.warn("updateEmployee error", { employeeId: id, error: String(err) })
    if (err instanceof z.ZodError) {
      const message = err.issues[0]?.message ?? "Invalid input"
      res.status(400).json({ error: message })
      return
    }
    if (err instanceof Error) {
      res.status(404).json({ error: err.message })
      return
    }
    logger.error("Unexpected update error")
    res.status(500).json({ error: "Could not update employee" })
  }
}

// ─────────────────────────────────────────
// DELETE EMPLOYEE
// DELETE /employees/:id
// ─────────────────────────────────────────
export async function deleteEmployee(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseInt(req.params.id as string)
  logger.info('Deleting employee', { employeeId: id })

  if (isNaN(id)) {
    logger.warn('Invalid employee ID for deletion', { id: req.params.id })
    res.status(400).json({ error: "Invalid employee ID" })
    return
  }

  try {
    await deleteEmployeeService(id)
    logger.info('Employee deleted successfully', { employeeId: id })
    res.status(200).json({ message: "Employee deleted successfully" })

  } catch (err) {
    logger.error("deleteEmployee error", { employeeId: id, error: String(err) })
    if (err instanceof Error) {
      res.status(404).json({ error: err.message })
      return
    }
    res.status(500).json({ error: "Could not delete employee" })
  }
}

// ─────────────────────────────────────────
// GET MY PROFILE
// GET /employees/me
// ─────────────────────────────────────────
export async function getMyProfile(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const employeeId = req.session.user?.employeeId
    logger.info('Fetching employee profile', { employeeId })

    if (!employeeId) {
      logger.warn('Employee profile not found - no employee ID in session')
      res.status(404).json({ error: "Employee profile not found" })
      return
    }

    const employee = await getMyProfileService(employeeId)
    logger.info('Profile fetched successfully', { employeeId })
    res.status(200).json(employee)

  } catch (err) {
    logger.error("getMyProfile error", { employeeId: req.session.user?.employeeId, error: String(err) })
    if (err instanceof Error) {
      res.status(404).json({ error: err.message })
      return
    }
    res.status(500).json({ error: "Could not fetch profile" })
  }
}