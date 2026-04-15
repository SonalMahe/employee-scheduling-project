import prisma from "../utils/prisma"
import { LoginInput, LoginResult } from "../types/user.types"
import logger from "../utils/logger"

export async function loginService(input: LoginInput): Promise<LoginResult> {

  // 1. Find user by email
  logger.info('Attempting to find user by email', { email: input.email })
  const user = await prisma.user.findUnique({
    where:   { email: input.email },
    include: { employee: true }
  })

  // 2. User not found
  if (!user) {
    logger.warn('Login failed - user not found', { email: input.email })
    throw new Error("Invalid email or password")
  }

  // 3. Compare loginCode directly — it's on User not Employee
  if (user.loginCode !== input.password) {
    logger.warn('Login failed - invalid password', { userId: user.id, email: input.email })
    throw new Error("Invalid email or password")
  }

  // 4. Return user data
  logger.info('User authenticated successfully', { userId: user.id, email: input.email, role: user.role })
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

  logger.info('Fetching user profile', { userId })
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
    logger.warn('User not found', { userId })
    throw new Error("User not found")
  }

  logger.info('User profile fetched successfully', { userId })
  return user
}