import bcrypt from "bcryptjs"
import { prisma } from "../utils/prisma"

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
interface LoginInput {
  email:    string
  password: string
}

interface LoginResult {
  id:          number
  role:        string
  name:        string
  employeeId?: number
}

// ─────────────────────────────────────────
// LOGIN SERVICE
// Contains all the business logic for login
// ─────────────────────────────────────────
export async function loginService(
  input: LoginInput
): Promise<LoginResult> {

  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { employee: true }
  })

  // 2. User not found
  // Use generic message — don't reveal if email exists
  if (!user) {
    throw new Error("Invalid email or password")
  }

  // 3. Check password against hashed password in database
  const passwordMatch = await bcrypt.compare(input.password, user.password)
  if (!passwordMatch) {
    throw new Error("Invalid email or password")
  }

  // 4. Return user data to controller
  return {
    id:         user.id,
    role:       user.role,
    name:       user.employee?.name ?? input.email,
    employeeId: user.employee?.id
  }
}

// ─────────────────────────────────────────
// GET ME SERVICE
// Fetch full user profile from database
// ─────────────────────────────────────────
export async function getMeService(userId: number): Promise<object> {

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id:        true,
      email:     true,
      role:      true,
      createdAt: true,
      // Never return password!
      password:  false,
      employee: {
        select: {
          id:        true,
          name:      true,
          loginCode: true,
        }
      }
    }
  })

  if (!user) {
    throw new Error("User not found")
  }

  return user
}