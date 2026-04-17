// src/index.ts

//import "dotenv/config"
import express from "express"
import session from "express-session"
import connectPgSimple from "connect-pg-simple"
import cors from "cors"
import authRoutes from "./routes/auth.routes"
import employeeRoutes from "./routes/employees.routes"
import scheduleRoutes from "./routes/schedule.routes"
import availabilityRoutes from "./routes/availability.routes"
import { errorHandler } from "./middleware/errorHandlerMiddleware"
import logger from "./utils/logger"

const app = express()
const PgStore = connectPgSimple(session)
const PORT = process.env.BACKEND_PORT ?? process.env.PORT ?? 5050

// ── Middleware ─────────────────────────────
app.use(express.json())
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

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
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/employees", employeeRoutes)
app.use("/api/v1/schedule", scheduleRoutes)
app.use("/api/v1/availability", availabilityRoutes)

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "Employee Scheduling API is running ✅" })
})

app.use(errorHandler)

// ── Start server ───────────────────────────
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`)
  logger.info("Registered routes:")
  logger.info("  POST   /api/v1/auth/login")
  logger.info("  POST   /api/v1/auth/logout")
  logger.info("  GET    /api/v1/auth/me")
  logger.info("  GET    /api/v1/employees")
  logger.info("  POST   /api/v1/employees")
  logger.info("  GET    /api/v1/employees/:id")
  logger.info("  PUT    /api/v1/employees/:id")
  logger.info("  DELETE /api/v1/employees/:id")
  logger.info("  GET    /api/v1/employees/me")
  logger.info("  GET    /api/v1/availability/:employeeId")
  logger.info("  PUT    /api/v1/availability/:employeeId")
  logger.info("  GET    /api/v1/schedule")
  logger.info("  PUT    /api/v1/schedule")
  logger.info("  DELETE /api/v1/schedule/:id")
})
