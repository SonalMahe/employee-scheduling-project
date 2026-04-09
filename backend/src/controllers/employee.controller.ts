import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import { prisma } from @prisma/client;

// ─────────────────────────────────────────
// GET ALL EMPLOYEES
// Employer only
// GET /employees
// ─────────────────────────────────────────
export async function listEmployees(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id:        true,
            email:     true,
            role:      true,
            createdAt: true,
            // Never return password!
          }
        }
      },
      orderBy: { name: "asc" }
    })

    res.status(200).json(employees)

  } catch (err) {
    res.status(500).json({ error: "Could not fetch employees" })
  }
}

// ─────────────────────────────────────────
// GET SINGLE EMPLOYEE
// Employer only
// 1--GET /employees/:id
// ─────────────────────────────────────────
export async function getEmployee(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = parseInt(req.params.id as string)

    // Check if id is a valid number
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid employee ID" })
      return
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            role:  true,
          }
        },
        // Also return their availability
        availabilities: {
          include: { shift: true },
          orderBy: { dayOfWeek: "asc" }
        }
      }
    })

    // Employee not found
    if (!employee) {
      res.status(404).json({ error: `Employee with id ${id} not found` })
      return
    }

    res.status(200).json(employee)

  } catch (err) {
    res.status(500).json({ error: "Could not fetch employee" })
  }
}

// ─────────────────────────────────────────
// REGISTER NEW EMPLOYEE
// Employer only
// 2--POST /employees
// ─────────────────────────────────────────
export async function registerEmployee(
  req: Request,
  res: Response
): Promise<void> {
  const { name, email, password, loginCode } = req.body

  // Basic validation
  if (!name || !email || !password || !loginCode) {
    res.status(400).json({
      error: "name, email, password and loginCode are all required"
    })
    return
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" })
    return
  }

  try {
    // 1. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      res.status(409).json({ error: "An account with this email already exists" })
      return
    }

    // 2. Check if loginCode already exists
    const existingCode = await prisma.employee.findUnique({
      where: { loginCode }
    })

    if (existingCode) {
      res.status(409).json({ error: "This login code is already taken" })
      return
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. Create User + Employee together in one transaction
    // Both succeed or both fail — no half created records
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "EMPLOYEE",
        employee: {
          create: {
            name,
            loginCode
          }
        }
      },
      include: {
        employee: true
      }
    })

    // 5. Send back created employee (never send password!)
    res.status(201).json({
      message: "Employee registered successfully",
      employee: {
        id:        newUser.employee?.id,
        name:      newUser.employee?.name,
        loginCode: newUser.employee?.loginCode,
        email:     newUser.email,
        role:      newUser.role,
      }
    })

  } catch (err) {
    res.status(500).json({ error: "Could not register employee" })
  }
}



//------Extra---------(Update,delete,getMyProfile )

// ─────────────────────────────────────────
// UPDATE EMPLOYEE
// Employer only
// PUT /employees/:id
// ─────────────────────────────────────────
export async function updateEmployee(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseInt(req.params.id as string)
  const { name, loginCode } = req.body

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid employee ID" })
    return
  }

  try {
    // Check employee exists
    const existing = await prisma.employee.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: "Employee not found" })
      return
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        // Only update fields that were sent
        ...(name      && { name }),
        ...(loginCode && { loginCode })
      }
    })

    res.status(200).json({
      message:  "Employee updated successfully",
      employee: updated
    })

  } catch (err) {
    res.status(500).json({ error: "Could not update employee" })
  }
}

// ─────────────────────────────────────────
// DELETE EMPLOYEE
// Employer only
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
    // Check employee exists
    const existing = await prisma.employee.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ error: "Employee not found" })
      return
    }

    // onDelete: Cascade in schema means
    // deleting the user also deletes the employee automatically
    await prisma.user.delete({
      where: { id: existing.userId }
    })

    res.status(200).json({ message: "Employee deleted successfully" })

  } catch (err) {
    res.status(500).json({ error: "Could not delete employee" })
  }
}

// ─────────────────────────────────────────
// GET MY PROFILE
// Employee only — sees their own profile
// GET /employees/me
// ─────────────────────────────────────────
export async function getMyProfile(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Get employeeId from session (set during login)
    const employeeId = req.session.user?.employeeId

    if (!employeeId) {
      res.status(404).json({ error: "Employee profile not found" })
      return
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: { email: true, role: true }
        },
        availabilities: {
          include: { shift: true },
          orderBy: { dayOfWeek: "asc" }
        },
        scheduleEntries: {
          include: { shift: true },
          orderBy: { date: "asc" }
        }
      }
    })

    if (!employee) {
      res.status(404).json({ error: "Profile not found" })
      return
    }

    res.status(200).json(employee)

  } catch (err) {
    res.status(500).json({ error: "Could not fetch profile" })
  }
}