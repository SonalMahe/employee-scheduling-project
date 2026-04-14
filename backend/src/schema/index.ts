import { z } from "zod";

// ── Day of week ───────────────────────────
export const DayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
])

// ── Shift type ────────────────────────────
export const ShiftTypeSchema = z.enum([
  "MORNING",
  "AFTERNOON",
  "NIGHT"
])

// ── Availability ──────────────────────────
export const UpdateAvailabilitySchema = z.object({
  availabilities: z.array(
    z.object({
      dayOfWeek:  DayOfWeekSchema,
      shiftName:  ShiftTypeSchema,
      available:  z.boolean()
    })
  ).min(1, "At least one availability entry required")
})

// ── Auto generate TypeScript types from schemas ──
export type DayOfWeekInput          = z.infer<typeof DayOfWeekSchema>
export type ShiftTypeInput          = z.infer<typeof ShiftTypeSchema>
export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilitySchema>

// ── Register Employee ─────────────────────
export const RegisterEmployeeSchema = z.object({
  name:      z.string().min(1, "Name is required"),
  email:     z.string().email("Invalid email format"),
  loginCode: z.string().min(1, "Login code is required"),
  position:  z.enum(["WAITER", "RUNNER", "HEAD_WAITER", "CHEF", "ADMIN"])
})
export type RegisterEmployeeInput = z.infer<typeof RegisterEmployeeSchema>

// ── Login ─────────────────────────────────
export const LoginSchema = z.object({
  email:    z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
})
export type LoginInput = z.infer<typeof LoginSchema>

// ── Schedule ──────────────────────────────
export const UpdateScheduleSchema = z.object({
  entries: z.array(
    z.object({
      employeeId: z.number().int().positive(),
      shiftName:  ShiftTypeSchema,
      date:       z.string().regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Date must be YYYY-MM-DD format"
      )
    })
  ).min(1, "At least one schedule entry required")
})
export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>