// src/index.ts

import "dotenv/config"
import express from "express"
import session from "express-session"
import connectPgSimple from "connect-pg-simple"
import cors from "cors"

import authRoutes from "./routes/auth"
import employeeRoutes from "./routes/employees"
// import scheduleRoutes from "../routes/schedule"
// import availabilityRoutes from "../routes/availability"

const app = express()
const PgStore = connectPgSimple(session)
const PORT = process.env.PORT ?? 3000

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
app.use("/auth", authRoutes)
app.use("/employees", employeeRoutes)
// app.use("/schedule", scheduleRoutes)
// app.use("/availability", availabilityRoutes)

// ── Start server ───────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})