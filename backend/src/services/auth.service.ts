import prisma from "../utils/prisma"
import { LoginInput, LoginResult } from "../types/user.types"

export async function loginService(input: LoginInput): Promise<LoginResult> {

  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where:   { email: input.email },
    include: { employee: true }
  })

  // 2. User not found
  if (!user) {
    throw new Error("Invalid email or password")
  }

  // 3. Compare loginCode directly — it's on User not Employee
  if (user.loginCode !== input.password) {
    throw new Error("Invalid email or password")
  }

  // 4. Return user data
  return {
    id:         user.id,
    role:       user.role,
    name:       user.name,        // ← name is on User
    employeeId: user.employee?.id // ← only exists if EMPLOYEE
  }
}

// ─────────────────────────────────────────
// GET ME SERVICE
// ─────────────────────────────────────────
export async function getMeService(userId: number): Promise<object> {

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id:        true,
      name:      true,
      email:     true,
      role:      true,
      position:  true,
      createdAt: true,
      loginCode: false,  // never return loginCode!
      employee: {
        select: {
          id: true
        }
      }
    }
  })

  if (!user) {
    throw new Error("User not found")
  }

  return user
}