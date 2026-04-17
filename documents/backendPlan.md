#  Backend Development Plan

## Goal

Build a **TypeScript backend** using **Node.js** and **Express** to replace the current `localStorage`-based data flow with a **real API** and **persistent database storage**.

---

## Current Frontend Status

* Uses modular local domain logic:

  * `react-vite-app/src/lib/store-*.ts`
* API layer abstraction:

  * `react-vite-app/src/lib/api.ts`
* Uses:

  * Vite base path: `/frontEnd/`
  * `HashRouter` for static hosting (GitHub Pages)

### Migration Strategy

* Replace `appApi` local functions with **HTTP API calls**
* Keep UI components mostly unchanged

---

## Backend Structure

```
backend/
  src/
    index.ts           # Express app setup + server start
    routes/            # API route definitions
    controllers/       # Request handling
    services/          # Business logic
    middleware/        # Auth, roles, error handling
    types/             # Shared TypeScript types
    schema/            # Zod validation
    utils/             # Prisma client, logger

  prisma/
    schema.prisma
    migrations/
```

---

## Core Features

* Authentication (login/logout/session)
* Employee management
* Availability tracking
* Schedule creation & updates
* Shift handover workflow _(planned)_
* Audit logging _(planned)_

---

## API Endpoints

> Base URL: `/api/v1`

### Auth — `/api/v1/auth`

| Method | Path              | Auth         | Description              |
| ------ | ----------------- | ------------ | ------------------------ |
| POST   | `/auth/login`     | Public       | Login with login code    |
| POST   | `/auth/logout`    | Public       | Clear session            |
| GET    | `/auth/me`        | Authenticated | Get current user profile |

---

### Employees — `/api/v1/employees`

| Method | Path             | Auth             | Description                      |
| ------ | ---------------- | ---------------- | -------------------------------- |
| GET    | `/employees/me`  | Employee only    | Get own profile                  |
| GET    | `/employees`     | Employer only    | List all employees               |
| POST   | `/employees`     | Employer only    | Register a new employee          |
| GET    | `/employees/:id` | Employer only    | Get employee by ID               |
| PUT    | `/employees/:id` | Employer only    | Update employee by ID            |
| DELETE | `/employees/:id` | Employer only    | Delete employee by ID            |

> Note: `GET /employees/me` must be declared before `/:id` to avoid route conflict.

---

### Availability — `/api/v1/availability`

| Method | Path                         | Auth                     | Description                                  |
| ------ | ---------------------------- | ------------------------ | -------------------------------------------- |
| GET    | `/availability?dayOfWeek=&shiftName=` | Employer only | Filter employees available for a shift/day   |
| GET    | `/availability/:employeeId`  | Authenticated            | Get availability for an employee             |
| PUT    | `/availability/:employeeId`  | Authenticated            | Set/update availability for an employee      |

> Query params for `GET /availability`: `dayOfWeek` (e.g. `WEDNESDAY`), `shiftName` (e.g. `MORNING`)

---

### Schedule — `/api/v1/schedule`

| Method | Path              | Auth          | Description                      |
| ------ | ----------------- | ------------- | -------------------------------- |
| GET    | `/schedule`       | Authenticated | View schedule (all roles)        |
| PUT    | `/schedule`       | Employer only | Assign an employee to a shift    |
| DELETE | `/schedule/:id`   | Employer only | Remove a schedule entry by ID    |

---

### Planned (Not Yet Implemented)

* `PATCH /api/v1/schedule/requirements/:shift/:day` — update shift staffing requirements
* Handover routes (`/api/v1/handovers`)
* Audit routes (`/api/v1/audit`)

---

## Architecture Layers

### Routes (`src/routes/`)

Defines API endpoints and applies middleware per route.

| File                       | Prefix                  |
| -------------------------- | ----------------------- |
| `auth.routes.ts`           | `/api/v1/auth`          |
| `employees.routes.ts`      | `/api/v1/employees`     |
| `availability.routes.ts`   | `/api/v1/availability`  |
| `schedule.routes.ts`       | `/api/v1/schedule`      |

---

### Controllers (`src/controllers/`)

* Handle request/response
* Call services
* Keep logic minimal

---

### Services (`src/services/`)

* Core business logic
* Validation rules
* Workflow handling

---

### Middleware (`src/middleware/`)

| File                       | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| `auth.ts`                  | `authenticate` — verifies session            |
| `auth.ts`                  | `requireEmployer` — employer-only access     |
| `auth.ts`                  | `isEmployee` — employee-only access          |
| `errorHandlerMiddleware.ts`| Centralized error handling                   |

---

### Types (`src/types/`)

* `user.types.ts`
* `session.d.ts` — augments `express-session` with `SessionUser`
* `index.ts` — re-exports

---

## Database Layer

### Prisma Setup

* Schema: `prisma/schema.prisma`
* Migrations: `prisma/migrations/`
* Database: **PostgreSQL**
* Sessions: stored in PostgreSQL via `connect-pg-simple` (`sessions` table)

---

## Data Models

### Enums

| Enum                 | Values                                              |
| -------------------- | --------------------------------------------------- |
| `Role`               | `EMPLOYEE`, `EMPLOYER`                              |
| `ShiftType`          | `MORNING`, `AFTERNOON`, `NIGHT`                     |
| `Position`           | `WAITER`, `RUNNER`, `HEAD_WAITER`, `ADMIN`, `CHEF`  |
| `DayOfWeek`          | `MONDAY` … `SUNDAY`                                 |
| `AvailabilityStatus` | `AVAILABLE`, `UNAVAILABLE`, `PREFERRED`             |

### Models

| Model           | Key Fields                                              |
| --------------- | ------------------------------------------------------- |
| `User`          | id, name, email, loginCode (unique), role, position, photoUrl |
| `Employee`      | id, userId → User (1:1)                                 |
| `Shift`         | id, name (ShiftType, unique)                            |
| `Availability`  | employeeId, shiftId, dayOfWeek, status — unique per combo |
| `ScheduleEntry` | employeeId, shiftId, date — unique per combo            |

---

## Authentication

* Session-based via `express-session`
* Sessions stored in PostgreSQL (`connect-pg-simple`)
* Session cookie: `httpOnly`, 8-hour TTL
* Login uses `loginCode` (no password)

---

## Frontend → Backend Mapping

| Frontend Module       | Backend Responsibility        |
| --------------------- | ----------------------------- |
| `store-auth.ts`       | `POST /auth/login`, `GET /auth/me` |
| `store-employees.ts`  | `/employees` CRUD             |
| `store-availability.ts` | `/availability` GET/PUT     |
| `store-schedule.ts`   | `/schedule` GET/PUT/DELETE    |
| `store-handovers.ts`  | `/handovers` _(planned)_      |
| `api.ts`              | HTTP adapter (fetch/axios)    |

---

## Build Order

1.  Setup Express + TypeScript backend
2.  Implement authentication & roles (session-based)
3.  Add employee management (CRUD)
4.  Add availability system
5.  Build scheduling logic (assign/remove)
6.  Add handover workflow
7.  Implement audit logging
8.  Replace frontend local storage with API calls

---

## Incremental Migration Plan

1. Keep UI unchanged
2. Replace `appApi` methods step-by-step:

   * Auth endpoints
   * Employees & availability
   * Schedule & handovers
   * Audit
3. Remove local storage once migration is complete

---

## Next Steps

* Implement handover workflow (`/api/v1/handovers`)
* Implement audit logging (`/api/v1/audit`)
* Add shift requirements endpoint (`PATCH /schedule/requirements/:shift/:day`)
* Wire up frontend to use API calls instead of localStorage

---
