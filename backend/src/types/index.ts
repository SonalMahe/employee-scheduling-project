import "express-session";
import { z } from "zod";

export type UserRole = "ADMIN" | "WAITER" | "RUNNER" | "HEAD_WAITER" | "CHEF";

export interface SessionUser {
  id: string;
  role: UserRole;
  name: string;
}

declare module "express-session" {
  interface SessionData {
    user: SessionUser;
  }
}

// --- Zod schemas ---

export const loginSchema = z.object({
  email: z.email("Invalid email address."),
  code: z.string().min(1, "Code is required."),
});

export const employeeRoleSchema = z.enum(["WAITER", "RUNNER", "HEAD_WAITER", "CHEF"]);

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.email("Invalid email address."),
  code: z.string().check(
    z.regex(/^\d{4}$/, "Login code must be exactly 4 digits."),
  ),
  role: employeeRoleSchema,
  photoBase64: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

// --- Derived types ---

export type LoginBody = z.infer<typeof loginSchema>;
export type CreateEmployeeBody = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeBody = z.infer<typeof updateEmployeeSchema>;
export type EmployeeRole = z.infer<typeof employeeRoleSchema>;

export interface EmployeeRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  photo: string | null;
  createdAt: Date;
}