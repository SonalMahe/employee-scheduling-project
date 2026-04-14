# Backend Development Plan

## Goal

Build a **TypeScript backend** using **Node.js** and **Express** to replace the current `localStorage`-based data flow with a **real API** and **persistent database storage**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express v5 |
| ORM | Prisma v6 |
| Database | PostgreSQL |
| Auth | express-session + connect-pg-simple |
| Validation | Zod v4 |
| Security | bcryptjs, CORS |

---

## Project Structure

```
backend/
  src/
    index.ts              # Server entry point
    routes/               # Route definitions
    controllers/          # Request/response handling
    services/             # Business logic
    middleware/           # Auth, error handling
    schema/               # Zod validation schemas + types
    types/                # Shared TypeScript types
    utils/                # Prisma client instance

  prisma/
    schema.prisma         # Database schema
    seed.ts               # Seed data
    migrations/           # Migration history
```

---

## Database Schema

### Enums

| Enum | Values |
|---|---|
| `Role` | EMPLOYER, EMPLOYEE |
| `ShiftType` | MORNING, AFTERNOON, NIGHT |
| `Position` | WAITER, RUNNER, HEAD_WAITER, ADMIN, CHEF |
| `DayOfWeek` | MONDAY – SUNDAY |
| `AvailabilityStatus` | AVAILABLE, UNAVAILABLE, PREFERRED |

### Models

| Model | Key Fields |
|---|---|
| `User` | id, name, email, loginCode, position?, role, photoUrl?, createdAt |
| `Employee` | id, userId (→ User) |
| `Shift` | id, name (ShiftType, unique) |
| `Availability` | id, employeeId, shiftId, dayOfWeek, status — unique(employeeId, shiftId, dayOfWeek) |
| `ScheduleEntry` | id, employeeId, shiftId, date (DATE) — unique(employeeId, date) |

---

## API Endpoints

Base URL: `http://localhost:5050/api/v1`

### Auth

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Login with email + loginCode |
| POST | `/api/v1/auth/logout` | Authenticated | Destroy session |
| GET | `/api/v1/auth/me` | Authenticated | Get current user profile |

### Employees

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/v1/employees` | Employer only | List all employees |
| POST | `/api/v1/employees` | Employer only | Register new employee |
| GET | `/api/v1/employees/:id` | Employer only | Get employee by ID |
| PUT | `/api/v1/employees/:id` | Employer only | Update employee |
| DELETE | `/api/v1/employees/:id` | Employer only | Delete employee |
| GET | `/api/v1/employees/me` | Employee only | Get own profile + availability + schedule |

### Availability

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/v1/availability/:employeeId` | Authenticated | Get employee availability |
| PUT | `/api/v1/availability/:employeeId` | Authenticated | Set/update availability |

**PUT body example:**
```json
{
  "availabilities": [
    { "dayOfWeek": "MONDAY", "shiftName": "MORNING", "status": "PREFERRED" },
    { "dayOfWeek": "MONDAY", "shiftName": "AFTERNOON", "status": "UNAVAILABLE" }
  ]
}
```

**Status values:**
- `AVAILABLE` — willing to work this shift
- `UNAVAILABLE` — cannot work this shift
- `PREFERRED` — specifically wants this shift

### Schedule

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/v1/schedule` | Authenticated | Get schedule (defaults to current week) |
| PUT | `/api/v1/schedule` | Employer only | Assign employees to shifts |
| DELETE | `/api/v1/schedule/:id` | Employer only | Remove a schedule entry |

**GET query params:**
```
?startDate=2026-04-07&endDate=2026-04-13
```

**PUT body example:**
```json
{
  "entries": [
    { "employeeId": 1, "shiftName": "MORNING", "date": "2026-04-14" }
  ]
}
```

---

## Authentication Flow

1. Client sends `POST /api/v1/auth/login` with email + password (loginCode)
2. Server validates credentials, stores user in session (`req.session.user`)
3. Browser receives `connect.sid` cookie (httpOnly, 8hr expiry)
4. All subsequent requests send cookie automatically
5. `authenticate` middleware reads session and attaches user to `req.user`
6. Role middleware (`requireEmployer` / `isEmployee`) enforces access control

> Every frontend request must include `credentials: "include"` for the session cookie to be sent.

---

## Middleware

| Middleware | File | Purpose |
|---|---|---|
| `authenticate` | `auth.ts` | Verify session, attach `req.user` |
| `requireEmployer` | `auth.ts` | Restrict to EMPLOYER role |
| `isEmployee` | `auth.ts` | Restrict to EMPLOYEE role |
| `errorHandler` | `errorHandlerMiddleware.ts` | Centralised error + Zod error formatting |

---

## Architecture Layers

```
Request → Route → Middleware → Controller → Service → Prisma → PostgreSQL
```

- **Routes** — define path, apply middleware, delegate to controller
- **Controllers** — parse request, call service, send response
- **Services** — all business logic and database queries
- **Schema** — Zod validation schemas and inferred TypeScript types

---

## Seed Data

| Role | Name | Email | LoginCode |
|---|---|---|---|
| EMPLOYER | Sonal Maheshwari | sonal.maheshwari@sundsgarden.se | 2010 |
| EMPLOYEE | Hanna Persson | hanna.persson@sundsgarden.se | 2001 |
| EMPLOYEE | Max Olsson | max.olsson@sundsgarden.se | 2002 |
| EMPLOYEE | Alia Lindberg | alia.lindberg@sundsgarden.se | 2003 |
| EMPLOYEE | Isak Norberg | isak.norberg@sundsgarden.se | 2004 |
| EMPLOYEE | Tilda Åberg | tilda.aberg@sundsgarden.se | 2005 |
| EMPLOYEE | Noah Ekström | noah.ekstrom@sundsgarden.se | 2006 |
| EMPLOYEE | Freja Holmberg | freja.holmberg@sundsgarden.se | 2007 |
| EMPLOYEE | Axel Dahl | axel.dahl@sundsgarden.se | 2008 |
| EMPLOYEE | Nora Falk | nora.falk@sundsgarden.se | 2009 |

---

## Build Status

- [x] Express + TypeScript setup
- [x] PostgreSQL + Prisma configured
- [x] Session-based authentication
- [x] Role-based middleware
- [x] Employee CRUD (employer)
- [x] Availability read/write (employee)
- [x] Schedule read/write (employer assigns, both can read)
- [x] API versioning (`/api/v1/`)
- [ ] Photo upload for employees
- [ ] Frontend integration

---
