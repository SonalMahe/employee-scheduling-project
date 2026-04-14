import { z } from "zod"

// ── Day of week ───────────────────────────
export const DayOfWeekSchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
])

// ── Shift type ────────────────────────────
export const ShiftTypeSchema = z.enum([
  "MORNING",
  "AFTERNOON",
  "NIGHT"
])

// ── Availability status ───────────────────
export const AvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "UNAVAILABLE",
  "PREFERRED"
])

// ── Availability ──────────────────────────
export const UpdateAvailabilitySchema = z.object({
  availabilities: z.array(
    z.object({
      dayOfWeek: DayOfWeekSchema,
      shiftName: ShiftTypeSchema,
      status:    AvailabilityStatusSchema
    })
  ).min(1)
})

// ── Auto generate TypeScript types from schemas ──
export type DayOfWeekInput          = z.infer<typeof DayOfWeekSchema>
export type ShiftTypeInput          = z.infer<typeof ShiftTypeSchema>
export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilitySchema>

// ── Register Employee ─────────────────────
export const RegisterEmployeeSchema = z.object({
  name:      z.string().min(1),
  email:     z.email(),
  loginCode: z.string().min(1),
  position:  z.enum(["WAITER", "RUNNER", "HEAD_WAITER", "CHEF", "ADMIN"])
})
export type RegisterEmployeeInput = z.infer<typeof RegisterEmployeeSchema>

// ── Login ─────────────────────────────────
export const LoginSchema = z.object({
  email:    z.email(),
  password: z.string().min(1)
})
export type LoginInput = z.infer<typeof LoginSchema>

// ── Schedule ──────────────────────────────
export const UpdateScheduleSchema = z.object({
  entries: z.array(
    z.object({
      employeeId: z.number().int().positive(),
      shiftName:  ShiftTypeSchema,
      date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })
  ).min(1)
})
export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>
