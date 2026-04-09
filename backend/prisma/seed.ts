import { PrismaClient, Role, Position } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.createMany({
    data: [
    {
      name: "Hanna Persson",
      email: "hanna.persson@sundsgarden.se",
      loginCode: "2001",
      position: Position.WAITER,
      role: Role.EMPLOYEE,
    },
    {
      name: "Max Olsson",
      email: "max.olsson@sundsgarden.se",
      loginCode: "2002",
      position: Position.RUNNER,
      role: Role.EMPLOYEE,
    },
    {
      name: "Alia Lindberg",
      email: "alia.lindberg@sundsgarden.se",
      loginCode: "2003",
      position: Position.WAITER,
      role: Role.EMPLOYEE,
    },
    {
      name: "Isak Norberg",
      email: "isak.norberg@sundsgarden.se",
      loginCode: "2004",
      position: Position.CHEF,
      role: Role.EMPLOYEE,
    },
    {
      name: "Tilda Åberg",
      email: "tilda.aberg@sundsgarden.se",
      loginCode: "2005",
      position: Position.RUNNER,
      role: Role.EMPLOYEE,
    },
    {
      name: "Noah Ekström",
      email: "noah.ekstrom@sundsgarden.se",
      loginCode: "2006",
      position: Position.WAITER,
      role: Role.EMPLOYEE,
    },
    {
      name: "Freja Holmberg",
      email: "freja.holmberg@sundsgarden.se",
      loginCode: "2007",
      position: Position.RUNNER,
      role: Role.EMPLOYEE,
    },
    {
      name: "Axel Dahl",
      email: "axel.dahl@sundsgarden.se",
      loginCode: "2008",
      position: Position.HEAD_WAITER,
      role: Role.EMPLOYEE,
    },
    {
      name: "Nora Falk",
      email: "nora.falk@sundsgarden.se",
      loginCode: "2009",
      position: Position.WAITER,
      role: Role.EMPLOYEE,
    },
    {
      name: "Sonal Maheshwari",
      email: "sonal.maheshwari@sundsgarden.se",
      loginCode: "2010",
      position: Position.ADMIN,
      role: Role.EMPLOYER,
    },
  ]});

  console.log("Seed successful");
};

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });