import prisma from "../utils/prisma"
import logger from "../utils/logger"

// ─────────────────────────────────────────
// GET ALL EMPLOYEES
// ─────────────────────────────────────────
export async function getAllEmployeesService() {
  logger.info('Fetching all employees from database')
  const employees = await prisma.employee.findMany({
    include: {
      user: {
        select: {
          id:        true,
          name:      true,
          email:     true,
          role:      true,
          position:  true,
          createdAt: true
          // never return loginCode!
        }
      }
    },
    orderBy: { user: { name: "asc" } }
  })
  logger.info('Fetched all employees', { count: employees.length })
  return employees
}

// ─────────────────────────────────────────
// GET SINGLE EMPLOYEE
// ─────────────────────────────────────────
export async function getEmployeeByIdService(id: number) {
  logger.info('Fetching employee by ID', { employeeId: id })
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name:     true,
          email:    true,
          role:     true,
          position: true
        }
      },
      availabilities: {
        include: { shift: true },
        orderBy: { dayOfWeek: "asc" }
      }
    }
  })

  if (!employee) {
    logger.warn('Employee not found', { employeeId: id })
    throw new Error(`Employee with id ${id} not found`)
  }

  logger.info('Employee fetched successfully', { employeeId: id })
  return employee
}

// ─────────────────────────────────────────
// REGISTER NEW EMPLOYEE
// ─────────────────────────────────────────
interface RegisterInput {
  name:      string
  email:     string
  loginCode: string
  position:  string
}

export async function registerEmployeeService(input: RegisterInput) {

  logger.info('Attempting to register new employee', { email: input.email, name: input.name })
  // 1. Check email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email }
  })
  if (existingEmail) {
    logger.warn('Registration failed - email already exists', { email: input.email })
    throw new Error("An account with this email already exists")
  }

  // 2. Check loginCode already exists
  const existingCode = await prisma.user.findUnique({
    where: { loginCode: input.loginCode }
  })
  if (existingCode) {
    logger.warn('Registration failed - login code already taken', { email: input.email })
    throw new Error("This login code is already taken")
  }

  // 3. Create User + Employee together
  const newUser = await prisma.user.create({
    data: {
      name:      input.name,
      email:     input.email,
      loginCode: input.loginCode,
      position:  input.position as any,
      role:      "EMPLOYEE",
      employee: {
        create: {}
      }
    },
    include: {
      employee: true
    }
  })

  logger.info('Employee registered successfully', { employeeId: newUser.employee?.id, email: input.email })
  // 4. Return created employee (never return loginCode!)
  return {
    id:       newUser.employee?.id,
    name:     newUser.name,
    email:    newUser.email,
    position: newUser.position,
    role:     newUser.role
  }
}

// ─────────────────────────────────────────
// UPDATE EMPLOYEE
// ─────────────────────────────────────────
interface UpdateInput {
  name?:      string
  loginCode?: string
  position?:  string
}

export async function updateEmployeeService(id: number, input: UpdateInput) {

  logger.info('Updating employee', { employeeId: id })
  // Check employee exists
  const existing = await prisma.employee.findUnique({ where: { id } })
  if (!existing) {
    logger.warn('Update failed - employee not found', { employeeId: id })
    throw new Error("Employee not found")
  }

  if (input.loginCode) {
    const existingLoginCode = await prisma.user.findFirst({
      where: {
        loginCode: input.loginCode,
        id: { not: existing.userId }
      }
    })

    if (existingLoginCode) {
      logger.warn('Update failed - login code already taken', { employeeId: id })
      throw new Error("This login code is already taken")
    }
  }

  // Update name, loginCode, position on User table
  const updatedUser = await prisma.user.update({
    where: { id: existing.userId },
    data: {
      ...(input.name      && { name:      input.name }),
      ...(input.loginCode && { loginCode: input.loginCode }),
      ...(input.position  && { position:  input.position as any })
    }
  })

  logger.info('Employee updated successfully', { employeeId: id })
  return {
    id:        id,
    name:      updatedUser.name,
    position:  updatedUser.position,
    role:      updatedUser.role
  }
}

// ─────────────────────────────────────────
// DELETE EMPLOYEE
// ─────────────────────────────────────────
export async function deleteEmployeeService(id: number) {

  logger.info('Deleting employee', { employeeId: id })
  const existing = await prisma.employee.findUnique({ where: { id } })
  if (!existing) {
    logger.warn('Deletion failed - employee not found', { employeeId: id })
    throw new Error("Employee not found")
  }

  // Delete Employee first (cascades to Availability + ScheduleEntry),
  // then delete User — FK goes Employee → User, so order matters
  await prisma.employee.delete({ where: { id } })
  await prisma.user.delete({ where: { id: existing.userId } })
  logger.info('Employee deleted successfully', { employeeId: id })
}

// ─────────────────────────────────────────
// GET MY PROFILE
// ─────────────────────────────────────────
export async function getMyProfileService(employeeId: number) {

  logger.info('Fetching employee profile', { employeeId })
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: {
        select: {
          name:     true,
          email:    true,
          role:     true,
          position: true
        }
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
    logger.warn('Profile not found', { employeeId })
    throw new Error("Profile not found")
  }

  logger.info('Profile fetched successfully', { employeeId })
  return employee
}