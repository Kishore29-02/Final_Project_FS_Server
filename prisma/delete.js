const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function truncateTables() {
  await prisma.course_Performances.deleteMany({});
  await prisma.designation_Courses.deleteMany({});
  await prisma.resignation_Records.deleteMany({});
  await prisma.user_Accounts.deleteMany({});
  await prisma.employees.deleteMany({});
  await prisma.courses.deleteMany({});
  // Add more tables if necessary
}

async function main() {
  await truncateTables();
  console.log("All tables truncated.");

  // You can now call your seed functions here to populate the database again
  // await seedEmployees();
  // await seedUserAccounts();
  // await seedCourses();
  // await seedDesignationCourses();
  // await seedCoursePerformances();
  // await seedResignationRecords();

//   console.log("Database has been seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
