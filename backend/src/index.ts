// src/index.ts

import "dotenv/config"
import express from "express"
import session from "express-session"
import connectPgSimple from "connect-pg-simple"
import cors from "cors"

import authRoutes from "./routes/auth.routes"
import employeeRoutes from "./routes/employees.routes"
import scheduleRoutes from "./routes/schedule.routes"
import availabilityRoutes from "./routes/availability.routes"

const app = express()
const PgStore = connectPgSimple(session)
const PORT = process.env.BACKEND_PORT ?? process.env.PORT ?? 5050

// ── Middleware ─────────────────────────────
app.use(express.json())

app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true               // ← required for sessions!
}))

// ── Session setup ──────────────────────────
app.use(
  session({
    // Store sessions in PostgreSQL
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      tableName: "sessions",    // auto created on first run
      createTableIfMissing: true
    }),

    secret: process.env.SESSION_SECRET!,
    resave: false,              // don't save if nothing changed
    saveUninitialized: false,   // don't save empty sessions

    cookie: {
      httpOnly: true,  // JS in browser cannot read cookie (safer)
      secure: false,   // set true in production with HTTPS
      maxAge: 1000 * 60 * 60 * 8  // 8 hours
    }
  })
)

// ── Routes ─────────────────────────────────
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/employees", employeeRoutes)
app.use("/api/v1/schedule", scheduleRoutes)
app.use("/api/v1/availability", availabilityRoutes)

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "Employee Scheduling API is running ✅" })
})

// ── Start server ───────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log("\nRegistered routes:")
  console.log("  POST   /api/v1/auth/login")
  console.log("  POST   /api/v1/auth/logout")
  console.log("  GET    /api/v1/auth/me")
  console.log("  GET    /api/v1/employees")
  console.log("  POST   /api/v1/employees")
  console.log("  GET    /api/v1/employees/:id")
  console.log("  PUT    /api/v1/employees/:id")
  console.log("  DELETE /api/v1/employees/:id")
  console.log("  GET    /api/v1/employees/me")
  console.log("  GET    /api/v1/availability/:employeeId")
  console.log("  PUT    /api/v1/availability/:employeeId")
  console.log("  GET    /api/v1/schedule")
  console.log("  PUT    /api/v1/schedule")
  console.log("  DELETE /api/v1/schedule/:id")
})
