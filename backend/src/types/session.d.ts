
import "express-session";

export type UserRole = "EMPLOYER" | "EMPLOYEE"

export interface SessionUser {
  id:          number
  role:        UserRole
  name:        string
  employeeId?: number   // only exists if role is EMPLOYEE
}

// This tells TypeScript that req.session.user exists
declare module "express-session" {
  interface SessionData {
    user: SessionUser
  }
}