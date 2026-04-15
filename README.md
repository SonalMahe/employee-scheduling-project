
# SHIFT & SERVE Food n drinks -

A full-stack web application that allows employers to manage staff schedules 
and employees to set their availability and view assigned shifts.

Built for the course **API database**.
This project helps employee to add/change the shift and employer can adjust the schedule if needed.

---

## Team Members

| Name | GitHub | Role |
|------|--------|------|
| Name 1 | @Sonal | Backend |
| Name 2 | @Priyanka & Navya | Frontend |
| Name 3 | @Sonal | Database + API |


## About the Project

SHIFT & SERVE  allows:

**Employers can:**
- Login with their credentials
- View all employees and their profiles
- Register new employees with a login code
- Assign employees to morning, afternoon or night shifts
- View and manage the full job schedule
- See each employee's work schedule

**Employees can:**
- Login with their personal login code
- Set their availability per shift per day
- View their own personal work schedule
- See when they have been assigned to shifts

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| TypeScript | Type safety |
| Express.js | REST API framework |
| Prisma | Database ORM |
| PostgreSQL | Database |
| Zod | Input validation |
| express-session | Session-based authentication |
| connect-pg-simple | Store sessions in PostgreSQL |
| Winston | Structured logging |(still working)
| ESLint | Code quality |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React | UI framework |
| TypeScript | Type safety |
| ... | ... |

---

### Project Structure
employee-scheduling-project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       ← database blueprint
│   │   ├── seed.ts             ← test data
│   │   └── migrations/         ← database change history
│   ├── src/
│   │   ├── controllers/        ← handle HTTP requests
│   │   │   ├── auth.controller.ts
│   │   │   ├── employee.controller.ts
│   │   │   ├── availability.controller.ts
│   │   │   └── schedule.controller.ts
│   │   ├── services/           ← business logic + database
│   │   │   ├── auth.service.ts
│   │   │   ├── employee.service.ts
│   │   │   ├── availability.service.ts
│   │   │   └── schedule.service.ts
│   │   ├── routes/             ← URL definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── employee.routes.ts
│   │   │   ├── availability.routes.ts
│   │   │   └── schedule.routes.ts
│   │   ├── middleware/
│   │   │   └── auth.ts         ← session verification + role checks
│   │   ├── schemas/
│   │   │   └── index.ts        ← Zod validation schemas
│   │   ├── types/
│   │   │   ├── session.d.ts    ← session type declarations
│   │   │   └── user.types.ts   ← shared TypeScript types
│   │   └── utils/
│   │       ├── prisma.ts       ← shared Prisma client
│   │       └── logger.ts       ← Winston logger (still working)
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   └── ...
├── .gitignore
└── README.md


### Database Schema
User
├── id, name, email, loginCode, position, role
└── has one Employee (if role = EMPLOYEE)
Employee
├── id, name, userId
├── has many Availabilities
└── has many ScheduleEntries
Shift
├── id, name (MORNING | AFTERNOON | NIGHT)
├── has many Availabilities
└── has many ScheduleEntries
Availability
├── id, employeeId, shiftId, dayOfWeek, available
└── unique per employee + shift + day
ScheduleEntry
├── id, employeeId, shiftId, date
└── unique per employee + shift + date


## Team Setup After Cloning

1. Clone and enter the project directory:
	 git clone <repo-url>
	 cd employee-scheduling-project

2. Install dependencies from the project root:
	 npm install

3. Create a local environment file:
	 cp .env.example .env

4. Start backend and frontend together:
	 npm run dev

5. Open services:
	 Frontend: http://localhost:3000
	 Backend: http://localhost:5050
----

### Test Credentials

| Role | Email | Login Code |
|------|-------|-----------|
| Employer | sonal.maheshwari@sundsgarden.se | 2010 |
| Employee | hanna.persson@sundsgarden.se | 2001 |
| Employee | max.olsson@sundsgarden.se | 2002 |
| Employee | axel.dahl@sundsgarden.se | 2008 |

### Role Permissions

| Action | Employer | Employee |
|--------|----------|---------|
| View all employees | ✅ | ❌ |
| Register employees | ✅ | ❌ |
| Assign shifts | ✅ | ❌ |
| View full schedule | ✅ | ✅ |
| Set own availability | ❌ | ✅ |
| View own schedule | ❌ | ✅ |

---

## Notes

- Root install now runs a postinstall setup script that installs backend and frontend dependencies automatically.
- Backend uses nodemon in development and restarts automatically when backend files are saved.
- Frontend reloads automatically on save through react-scripts.
- If backend port 5050 is already in use, run with a different backend port:
	BACKEND_PORT=5001 npm run dev
- If frontend port 3000 is already in use, run with a different frontend port:
	PORT=3001 npm run dev
- If both ports are in use, override both:
	BACKEND_PORT=5001 PORT=3001 npm run dev
- If installation was interrupted, run this from root to reinstall subproject dependencies:
	npm run setup
