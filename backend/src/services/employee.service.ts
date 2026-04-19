import prisma from "../utils/prisma"

// ─────────────────────────────────────────
// GET ALL EMPLOYEES
// ─────────────────────────────────────────
export async function getAllEmployeesService() {
  return prisma.employee.findMany({
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
}

// ─────────────────────────────────────────
// GET SINGLE EMPLOYEE
// ─────────────────────────────────────────
export async function getEmployeeByIdService(id: number) {
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
    throw new Error(`Employee with id ${id} not found`)
  }

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

  // 1. Check email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email }
  })
  if (existingEmail) {
    throw new Error("An account with this email already exists")
  }

  // 2. Check loginCode already exists
  const existingCode = await prisma.user.findUnique({
    where: { loginCode: input.loginCode }
  })
  if (existingCode) {
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

  // Check employee exists
  const existing = await prisma.employee.findUnique({ where: { id } })
  if (!existing) {
    throw new Error("Employee not found")
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

  return {
    id:        id,
    name:      updatedUser.name,
    loginCode: updatedUser.loginCode,
    position:  updatedUser.position,
    role:      updatedUser.role
  }
}

// ─────────────────────────────────────────
// DELETE EMPLOYEE
// ─────────────────────────────────────────
export async function deleteEmployeeService(id: number) {

  const existing = await prisma.employee.findUnique({ where: { id } })
  if (!existing) {
    throw new Error("Employee not found")
  }

  // Delete Employee first (cascades to Availability + ScheduleEntry),
  // then delete User — FK goes Employee → User, so order matters
  await prisma.employee.delete({ where: { id } })
  await prisma.user.delete({ where: { id: existing.userId } })
}

// ─────────────────────────────────────────
// GET MY PROFILE
// ─────────────────────────────────────────
export async function getMyProfileService(employeeId: number) {

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
    throw new Error("Profile not found")
  }

  return employee
}