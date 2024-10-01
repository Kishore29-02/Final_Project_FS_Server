/*
  Warnings:

  - You are about to drop the `CourseDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseForDesignation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CoursePerformance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Employee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectPerformance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Retention` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('active', 'rejected');

-- CreateEnum
CREATE TYPE "DesignationType" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('completed', 'failed', 'incomplete');

-- DropForeignKey
ALTER TABLE "CourseDetails" DROP CONSTRAINT "CourseDetails_designationId_fkey";

-- DropForeignKey
ALTER TABLE "CoursePerformance" DROP CONSTRAINT "CoursePerformance_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CoursePerformance" DROP CONSTRAINT "CoursePerformance_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectPerformance" DROP CONSTRAINT "ProjectPerformance_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Retention" DROP CONSTRAINT "Retention_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_emp_id_fkey";

-- DropTable
DROP TABLE "CourseDetails";

-- DropTable
DROP TABLE "CourseForDesignation";

-- DropTable
DROP TABLE "CoursePerformance";

-- DropTable
DROP TABLE "Employee";

-- DropTable
DROP TABLE "ProjectPerformance";

-- DropTable
DROP TABLE "Retention";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "RetentionStatus";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "Employees" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation_type" "DesignationType" NOT NULL,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "employment_status" "EmploymentStatus" NOT NULL,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Accounts" (
    "employee_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Courses" (
    "id" SERIAL NOT NULL,
    "course_name" TEXT NOT NULL,
    "course_description" TEXT NOT NULL,
    "duration_hours" INTEGER NOT NULL,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designation_Courses" (
    "designation_type" "DesignationType" NOT NULL,
    "course_id" INTEGER NOT NULL,

    CONSTRAINT "Designation_Courses_pkey" PRIMARY KEY ("designation_type","course_id")
);

-- CreateTable
CREATE TABLE "Course_Performances" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "course_status" "CourseStatus" NOT NULL,
    "score" INTEGER NOT NULL,
    "completion_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_Performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project_Performances" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "engagement_score" INTEGER NOT NULL,
    "teamwork_score" INTEGER NOT NULL,
    "punctuality_score" INTEGER NOT NULL,
    "overall_performance_score" INTEGER NOT NULL,

    CONSTRAINT "Project_Performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resignation_Records" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "resignation_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "Resignation_Records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Accounts_employee_id_key" ON "User_Accounts"("employee_id");

-- AddForeignKey
ALTER TABLE "User_Accounts" ADD CONSTRAINT "User_Accounts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Designation_Courses" ADD CONSTRAINT "Designation_Courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Performances" ADD CONSTRAINT "Course_Performances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Performances" ADD CONSTRAINT "Course_Performances_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Performances" ADD CONSTRAINT "Project_Performances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resignation_Records" ADD CONSTRAINT "Resignation_Records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
