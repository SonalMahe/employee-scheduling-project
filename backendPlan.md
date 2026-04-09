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

## Recommended Backend Structure

```
src/
  server.ts        # Start server
  app.ts           # Express app setup

  routes/          # API routes
  controllers/     # Request handling
  services/        # Business logic
  middleware/      # Auth, validation, errors
  types/           # Shared TypeScript types

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
* Shift requirements control
* Shift handover workflow
* Audit logging for changes

---

## API Endpoints

###  Auth

* `POST /auth/login`
* `POST /auth/logout`
* `GET /me`

###  Employees

* `GET /employees`
* `POST /employees`
* `PATCH /employees/:id`

### Availability

* `GET /availability`
* `PUT /availability/:userId`

###  Schedule

* `GET /schedule`
* `PUT /schedule`
* `POST /schedule/assign`
* `POST /schedule/remove`
* `PATCH /schedule/requirements/:shift/:day`


### 📊 Audit

* `GET /audit`

---

## Architecture Layers

### 🔹 Routes (`src/routes/`)

Defines API endpoints.

Examples:

* `auth.routes.ts`
* `employee.routes.ts`
* `availability.routes.ts`
* `schedule.routes.ts`
* `handover.routes.ts`
* `audit.routes.ts`

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

###  Middleware (`src/middleware/`)

* `auth.middleware.ts` → authentication
* `role.middleware.ts` → role-based access
* `validate.middleware.ts` → request validation
* `error.middleware.ts` → centralized error handling

---

### Types (`src/types/`)

* `auth.types.ts`
* `employee.types.ts`
* `availability.types.ts`
* `schedule.types.ts`
* `api.types.ts`

---

## Database Layer

### Prisma Setup

* Schema: `prisma/schema.prisma`
* Migrations: `prisma/migrations/`

---

## Data Model

* users
* employees
* availability
* schedule
* shift_requirements
* shift_exchange_requests
* schedule_audit

---

## Frontend → Backend Mapping

| Frontend Module       | Backend Responsibility     |
| --------------------- | -------------------------- |
| store-auth.ts         | Auth API                   |
| store-employees.ts    | Employee API               |
| store-availability.ts | Availability API           |
| store-schedule.ts     | Schedule API               |
| store-handovers.ts    | Handover API               |
| api.ts                | HTTP adapter (fetch/axios) |

---

## Build Order

1. Setup Express + TypeScript backend
2. Implement authentication & roles
3. Add employee management
4. Add availability system
5. Build scheduling logic
6. Add handover workflow
7. Implement audit logging
8. Replace frontend local storage with API calls

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

## Next Step

* Initialize backend project
* Setup Prisma & database
* Implement:

  * Auth system
  * Employee endpoints

👉 This enables frontend to start switching to API calls.

---
