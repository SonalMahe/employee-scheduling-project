import { z } from "zod";

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

// ── Availability Status ───────────────────
export const AvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "UNAVAILABLE",
  "PREFERRED"
])

// ── Availability ──────────────────────────
export const UpdateAvailabilitySchema = z.object({
  availabilities: z.array(
    z.object({
      dayOfWeek:  DayOfWeekSchema,
      shiftName:  ShiftTypeSchema,
      status:     AvailabilityStatusSchema
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

export const UpdateEmployeeSchema = RegisterEmployeeSchema.pick({
  name: true,
  loginCode: true,
  position: true,
}).partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required"
)
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>

// ── Login ─────────────────────────────────
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .trim()
    .toLowerCase()
    .email("Invalid email format — must look like name@example.com")
    .refine(
      (val) => /\.[a-zA-Z]{2,}$/.test(val),
      "Email must include a valid domain ending (e.g. .com, .net, .org)"
    ),
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