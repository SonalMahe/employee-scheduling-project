// src/index.ts

import "dotenv/config"
import express from "express"
import session from "express-session"
import connectPgSimple from "connect-pg-simple"
import cors from "cors"

import authRoutes         from "./controllers/auth.controller"
import employeeRoutes     from "./controllers/employee.controller"
import scheduleRoutes     from "./controllers/schedule.controller"
import availabilityRoutes from "./controllers/availability.controller"
import { errorHandler }   from "./middleware/errorHandlerMiddleware"

const app = express()
const PgStore = connectPgSimple(session)
const PORT = process.env.PORT ?? 5050

// ── Middleware ─────────────────────────────
app.use(express.json())

app.use(cors({
  origin: "http://localhost:3000", // your frontend URL
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
app.use("/auth", authRoutes)
app.use("/employees", employeeRoutes)
app.use("/schedule", scheduleRoutes)
app.use("/availability", availabilityRoutes)

<<<<<<< Updated upstream


// Optional: add a root route so browser doesn't show Cannot GET /
app.get("/", (_req, res) => {
  res.json({ message: "Employee Scheduling API is running ✅" })
})

// Prints all registered routes when server starts
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log("\nRegistered routes:")
  console.log("  POST   /auth/login")
  console.log("  POST   /auth/logout")
  console.log("  GET    /auth/me")
  console.log("  GET    /employees")
  console.log("  POST   /employees")
  console.log("  GET    /employees/:id")
  console.log("  PUT    /employees/:id")
  console.log("  DELETE /employees/:id")
  console.log("  GET    /employees/me")
  console.log("  GET    /availability/:employeeId")
  console.log("  PUT    /availability/:employeeId")
  console.log("  GET    /schedule")
  console.log("  PUT    /schedule")
  console.log("  DELETE /schedule/:id")
})
=======
// check
app.get("/", (req, res) => {
  res.json({ message: "Employee Scheduling API is running!" })
})

// ── Error handler ──────────────────────────
// Must be registered AFTER all routes
app.use(errorHandler)
>>>>>>> Stashed changes

// ── Start server ───────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
