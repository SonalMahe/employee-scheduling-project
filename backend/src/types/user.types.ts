// src/types/user.types.ts

export type UserRole    = "EMPLOYER" | "EMPLOYEE"
export type ShiftType   = "MORNING"  | "AFTERNOON" | "NIGHT"
export type Position    = "WAITER"   | "RUNNER" | "HEAD_WAITER" | "ADMIN" | "CHEF"
export type DayOfWeek   =
  | "monday" | "tuesday" | "wednesday" | "thursday"
  | "friday" | "saturday" | "sunday"

export interface User {
  id:        number
  name:      string      // ← on User
  email:     string
  loginCode: string      // ← on User
  position:  Position    // ← on User
  role:      UserRole
  createdAt: Date
  employee?: Employee
}

export interface Employee {
  id:     number
  name:   string
  userId: number
  user?:  User
}

export interface LoginInput {
  email:    string
  password: string  // maps to loginCode in database
}

export interface LoginResult {
  id:          number
  role:        UserRole
  name:        string
  employeeId?: number
} 