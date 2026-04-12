-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'PREFERRED');

-- DropIndex
DROP INDEX "public"."ScheduleEntry_employeeId_shiftId_date_key";

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "available",
ADD COLUMN     "status" "AvailabilityStatus" NOT NULL DEFAULT 'UNAVAILABLE',
DROP COLUMN "dayOfWeek",
ADD COLUMN     "dayOfWeek" "DayOfWeek" NOT NULL;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "ScheduleEntry" ALTER COLUMN "date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photoUrl" TEXT,
ALTER COLUMN "position" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Availability_employeeId_shiftId_dayOfWeek_key" ON "Availability"("employeeId", "shiftId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleEntry_employeeId_date_key" ON "ScheduleEntry"("employeeId", "date");
