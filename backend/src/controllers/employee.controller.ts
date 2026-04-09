import { Request, Response } from "express"
import {
  getAllEmployeesService,
  getEmployeeByIdService,
  registerEmployeeService,
  updateEmployeeService,
  deleteEmployeeService,
  getMyProfileService
} from "../services/employee.service"
import "express-session";

// ─────────────────────────────────────────
// GET ALL EMPLOYEES
// GET /employees
// ─────────────────────────────────────────
export async function listEmployees(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const employees = await getAllEmployeesService()
    res.status(200).json(employees)

  } catch (err) {
    console.error("listEmployees error:", err)
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

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid employee ID" })
      return
    }

    const employee = await getEmployeeByIdService(id)
    res.status(200).json(employee)

  } catch (err) {
    console.error("getEmployee error:", err)
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
  const { name, email, loginCode, position } = req.body

  // Validate required fields
  if (!name || !email || !loginCode || !position) {
    res.status(400).json({
      error: "name, email, loginCode and position are all required"
    })
    return
  }

  try {
    const employee = await registerEmployeeService({
      name,
      email,
      loginCode,
      position
    })

    res.status(201).json({
      message: "Employee registered successfully",
      employee
    })

  } catch (err) {
    console.error("registerEmployee error:", err)
    if (err instanceof Error) {
      res.status(409).json({ error: err.message })
      return
    }
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

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid employee ID" })
    return
  }

  const { name, loginCode, position } = req.body

  try {
    const employee = await updateEmployeeService(id, {
      name,
      loginCode,
      position
    })

    res.status(200).json({
      message: "Employee updated successfully",
      employee
    })

  } catch (err) {
    console.error("updateEmployee error:", err)
    if (err instanceof Error) {
      res.status(404).json({ error: err.message })
      return
    }
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

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid employee ID" })
    return
  }

  try {
    await deleteEmployeeService(id)
    res.status(200).json({ message: "Employee deleted successfully" })

  } catch (err) {
    console.error("deleteEmployee error:", err)
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

    if (!employeeId) {
      res.status(404).json({ error: "Employee profile not found" })
      return
    }

    const employee = await getMyProfileService(employeeId)
    res.status(200).json(employee)

  } catch (err) {
    console.error("getMyProfile error:", err)
    if (err instanceof Error) {
      res.status(404).json({ error: err.message })
      return
    }
    res.status(500).json({ error: "Could not fetch profile" })
  }
}