import { PrismaClient, Role, ShiftType } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  await prisma.shift.createMany({
    data: [
      { name: ShiftType.MORNING },
      { name: ShiftType.AFTERNOON },
      { name: ShiftType.NIGHT },
    ],
    skipDuplicates: true,
  });


}

seed()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
