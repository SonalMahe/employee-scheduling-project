--Backend Plan--

Goal
Build a TypeScript backend with Node.js and Express that replaces the current localStorage-based data flow with a real API and persistent storage.

--------
Current frontend status:

The app uses a modular local domain layer in react-vite-app/src/lib/store-*.ts.
UI pages are increasingly funneled through react-vite-app/src/lib/api.ts.
The frontend now uses a GitHub Pages friendly Vite base path (/frontEnd/) and HashRouter for static hosting.
Best migration path is to switch appApi methods from local module calls to HTTP calls, while keeping page components mostly unchanged.

--------
Recommended Structure---
-src/server.ts for starting the server.
-src/app.ts for middleware and route setup.
-src/routes/ for request paths.
-src/controllers/ for request handling.
-src/services/ for business rules.
-src/middleware/ for auth, validation, and errors.
-src/types/ for shared TypeScript types.


--------
Core Features
Login and session handling.
Employee management.
Availability updates.
Schedule assignments and removals.
Open shift requirement controls.
Shift handover request and approval workflow.
Audit history for schedule changes.

-------
Suggested API Endpoints
POST /auth/login
POST /auth/logout
GET /me
GET /employees
POST /employees
PATCH /employees/:id
GET /availability
PUT /availability/:userId
GET /schedule
PUT /schedule
POST /schedule/assign
POST /schedule/remove
PATCH /schedule/requirements/:shift/:day
GET /handover-requests
POST /handover-requests
PATCH /handover-requests/:id
GET /audit


-------
Server and App Setup
Add server start logic in src/server.ts.
Add Express app creation, middleware registration, and route mounting in src/app.ts.

------
Routes
Add route files in src/routes/:
src/routes/auth.routes.ts
src/routes/employee.routes.ts
src/routes/availability.routes.ts
src/routes/schedule.routes.ts
src/routes/audit.routes.ts
Mount all route files from src/app.ts.

-------
Controllers
Add one controller file per domain in src/controllers/:
src/controllers/auth.controller.ts
src/controllers/employee.controller.ts
src/controllers/availability.controller.ts
src/controllers/schedule.controller.ts
Keep controllers thin: parse request, call service, send response.

--------
Services
Add business logic in src/services/:
src/services/auth.service.ts
src/services/employee.service.ts
src/services/availability.service.ts
src/services/schedule.service.ts
Put all validation rules and workflow checks here (not in routes).

------------
Database Layer
If using Prisma:
Schema in prisma/schema.prisma
Migrations in prisma/migrations/

If using another ORM/SQL layer:
Connection in src/db/
Query/repository files in src/db/repositories/ or src/models/.

------
Middleware
Add custom middleware in src/middleware/:
auth.middleware.ts for identity checks.
role.middleware.ts for employer/employee guards.
validate.middleware.ts for request body/query validation.
error.middleware.ts for centralized error handling.

-----
Types--
Add shared TypeScript types in src/types/:
auth.types.ts
employee.types.ts
availability.types.ts
schedule.types.ts
api.types.ts for common response/error shape.


Mapping Endpoints To Files
POST /auth/login, POST /auth/logout, GET /me

Route: src/routes/auth.routes.ts
Controller: src/controllers/auth.controller.ts
Service: src/services/auth.service.ts
GET /employees, POST /employees, PATCH /employees/:id

Route: src/routes/employee.routes.ts
Controller: src/controllers/employee.controller.ts
Service: src/services/employee.service.ts
GET /availability, PUT /availability/:userId

Route: src/routes/availability.routes.ts
Controller: src/controllers/availability.controller.ts
Service: src/services/availability.service.ts
GET /schedule, PUT /schedule, POST /schedule/assign, POST /schedule/remove

Route: src/routes/schedule.routes.ts
Controller: src/controllers/schedule.controller.ts
Service: src/services/schedule.service.ts
PATCH /schedule/requirements/:shift/:day

Route: src/routes/schedule.routes.ts
Controller: src/controllers/schedule.controller.ts
Service: src/services/schedule.service.ts
GET /handover-requests, POST /handover-requests, PATCH /handover-requests/:id

Route: src/routes/handover.routes.ts
Controller: src/controllers/handover.controller.ts
Service: src/services/handover.service.ts
GET /audit

Route: src/routes/audit.routes.ts
Controller: src/controllers/audit.controller.ts
Service: src/services/audit.service.ts
Data Model
users
employees
availability
schedule
shift_requirements
shift_exchange_requests
schedule_audit
Frontend Mapping (Current -> Backend)
Use this to map each current frontend domain module to backend API responsibilities.

----Frontend auth domain:-----

react-vite-app/src/lib/store-auth.ts
Move to: auth routes/controller/service + secure session/token strategy.
Frontend employee domain:

react-vite-app/src/lib/store-employees.ts
Move to: employee routes/controller/service.
Frontend availability domain:

react-vite-app/src/lib/store-availability.ts
Move to: availability routes/controller/service.
Frontend schedule domain:

react-vite-app/src/lib/store-schedule.ts
Move to: schedule routes/controller/service.
Frontend handover domain:

react-vite-app/src/lib/store-handovers.ts
Move to: handover routes/controller/service.
Frontend API adapter:

react-vite-app/src/lib/api.ts
Migration role: replace local function calls with fetch/axios calls endpoint by endpoint.
Build Order
Set up the Express app in TypeScript.
Add authentication and role checks.
Add employee and availability storage.
Add schedule logic including required-slot updates.
Add handover request workflow.
Add audit logging.
Replace frontend appApi local calls with backend API requests in thin slices.
Suggested Incremental Cutover Plan
Keep page components unchanged; refactor appApi first.
Implement /auth endpoints and switch appApi auth methods.
Implement /employees and /availability endpoints and switch those appApi methods.
Implement /schedule and /handover-requests endpoints.
Implement /audit read endpoint.
Remove store persistence from frontend when all appApi methods are server-backed.
Next Step
Create the backend workspace with TypeScript, Express, and a database layer, then implement auth + employees first so appApi can begin the HTTP cutover.