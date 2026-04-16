import { PrismaClient, Role, Position } from "@prisma/client"

const prisma = new PrismaClient()

async function seed() {

  // ── Step 1: Create Shifts ──────────────────────
  const shifts = ["MORNING", "AFTERNOON", "NIGHT"]
  for (const name of shifts) {
    await prisma.shift.upsert({
      where:  { name: name as any },
      update: {},
      create: { name: name as any }
    })
  }
  console.log("Shifts created")

  // ── Step 2: Create Employer ────────────────────
  await prisma.user.upsert({
    where:  { email: "sonal.maheshwari@sundsgarden.se" },
    update: {},
    create: {
      name:      "Sonal Maheshwari",
      email:     "sonal.maheshwari@sundsgarden.se",
      loginCode: "2010",
      position:  Position.ADMIN,
      role:      Role.EMPLOYER
      // ← no employee record for employer
    }
  })
  console.log("Employer created — loginCode: 2010")

  // ── Step 3: Create Employees ───────────────────
  // Each one creates a User + linked Employee together
  const employees = [
    { name: "Cool Admin",    email: "cool.admin@sundsgarden.se",    loginCode: "9999", position: Position.ADMIN  },  
    { name: "Hanna Persson",    email: "hanna.persson@sundsgarden.se",    loginCode: "2001", position: Position.WAITER },
    { name: "Max Olsson",       email: "max.olsson@sundsgarden.se",       loginCode: "2002", position: Position.RUNNER   },
    { name: "Alia Lindberg",    email: "alia.lindberg@sundsgarden.se",    loginCode: "2003", position: Position.WAITER    },
    { name: "Isak Norberg",     email: "isak.norberg@sundsgarden.se",     loginCode: "2004", position: Position.CHEF       },
    { name: "Tilda Åberg",      email: "tilda.aberg@sundsgarden.se",      loginCode: "2005", position: Position.RUNNER   },
    { name: "Noah Ekström",     email: "noah.ekstrom@sundsgarden.se",     loginCode: "2006", position: Position.WAITER  },
    { name: "Freja Holmberg",   email: "freja.holmberg@sundsgarden.se",   loginCode: "2007", position: Position.RUNNER    },
    { name: "Axel Dahl",        email: "axel.dahl@sundsgarden.se",        loginCode: "2008", position: Position.HEAD_WAITER },
    { name: "Nora Falk",        email: "nora.falk@sundsgarden.se",        loginCode: "2009", position: Position.WAITER      },
  ]

  for (const emp of employees) {
    await prisma.user.upsert({
      where:  { email: emp.email },
      update: {},
      create: {
        name:      emp.name,
        email:     emp.email,
        loginCode: emp.loginCode,
        position:  emp.position,
        role:      Role.EMPLOYEE,
        employee: {
          create: {}  // ← creates Employee record linked to this User
        }
      }
    })
  }
  console.log("Employees created — loginCodes: 2001 to 2009")

  console.log("Seed complete!")
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })