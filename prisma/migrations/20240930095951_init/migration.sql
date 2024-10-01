-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'TERMINATED');

-- CreateEnum
CREATE TYPE "RetentionStatus" AS ENUM ('RETAINED', 'TERMINATED');

-- CreateTable
CREATE TABLE "User" (
    "emp_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("emp_id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "date_hired" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseForDesignation" (
    "id" SERIAL NOT NULL,
    "designation" TEXT NOT NULL,

    CONSTRAINT "CourseForDesignation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseDetails" (
    "id" SERIAL NOT NULL,
    "course_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "designationId" INTEGER NOT NULL,

    CONSTRAINT "CourseDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoursePerformance" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "completionDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoursePerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPerformance" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "projectName" TEXT NOT NULL,
    "performanceScore" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "evaluationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retention" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "retentionDate" TIMESTAMP(3) NOT NULL,
    "retentionStatus" "RetentionStatus" NOT NULL,
    "terminationReason" TEXT,

    CONSTRAINT "Retention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDetails" ADD CONSTRAINT "CourseDetails_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "CourseForDesignation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePerformance" ADD CONSTRAINT "CoursePerformance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoursePerformance" ADD CONSTRAINT "CoursePerformance_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CourseDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPerformance" ADD CONSTRAINT "ProjectPerformance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retention" ADD CONSTRAINT "Retention_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
