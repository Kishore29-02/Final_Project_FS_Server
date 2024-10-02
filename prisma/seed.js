const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');
// const temp = require('empl')
// const employees = require('./data/employees.csv');
const prisma = new PrismaClient();
 
// Function to read CSV data
async function truncateTables() {
  await prisma.course_Performances.deleteMany({});
  await prisma.designation_Courses.deleteMany({});
  await prisma.resignation_Records.deleteMany({});
  await prisma.project_Performances.deleteMany({});
  await prisma.user_Accounts.deleteMany({});
  await prisma.employees.deleteMany({});
  await prisma.courses.deleteMany({});
  // Add more tables if necessary
}

async function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

// Seed employees
async function seedEmployees() {
    const employees = await readCSV('./data/employees.csv');
    for (const employee of employees) {
        await prisma.employees.create({
            data: {
                id: parseInt(employee.id),
                first_name: employee.first_name,
                last_name: employee.last_name,
                department: employee.department,
                designation_type: employee.designation_type,
                hire_date: new Date(employee.hire_date),
                employment_status: employee.employment_status,
            },
        });
    }
}
 
// Seed user accounts
async function seedUserAccounts() {
    const userAccounts = await readCSV('./data/user_accounts.csv');
    for (const account of userAccounts) {
        const hashedPassword = await bcrypt.hash(account.password, 10);
        await prisma.user_Accounts.create({
            data: {
                employee_id: parseInt(account.employee_id),
                email: account.email,
                password: hashedPassword,
                role: account.role,
            },
        });
    }
}
 
// Seed courses
async function seedCourses() {
    const courses = await readCSV('./data/courses.csv');
    for (const course of courses) {
        await prisma.courses.create({
            data: {
                id: parseInt(course.id),
                course_name: course.course_name,
                course_description: course.course_description,
                duration_hours: parseInt(course.duration_hours),
            },
        });
    }
}


// Seed course performances
async function seedCoursePerformances() {
    const performances = await readCSV('./data/course_performance.csv');
    for (const performance of performances) {
        await prisma.course_Performances.create({
            data: {
                employee_id: parseInt(performance.employee_id),
                course_id: parseInt(performance.course_id),
                course_status: performance.course_status,
                score: parseInt(performance.score),
                completion_date: new Date(performance.completion_date),
            },
        });
    }
}
 
// Seed designation courses
async function seedDesignationCourses() {
    const designationCourses = await readCSV('./data/designation_courses.csv');
    for (const designationCourse of designationCourses) {
        await prisma.designation_Courses.create({
            data: {
                designation_type: designationCourse.designation_type,
                course_id: parseInt(designationCourse.course_id),
            },
        });
    }
}
 
// Seed resignation records
async function seedResignations() {
    const resignations = await readCSV('./data/resignations.csv');
    for (const resignation of resignations) {
        await prisma.resignation_Records.create({
            data: {
                employee_id: parseInt(resignation.employee_id),
                resignation_date: new Date(resignation.resignation_date),
                reason: resignation.reason,
            },
        });
    }
}

//Seed Proejct Performances
async function seedProjectPerformances() {
    const projectPerformances = await readCSV('./data/project_performance.csv');
    for (const projectPerformance of projectPerformances) {
        await prisma.project_Performances.create({
            data: {
                employee_id: parseInt(projectPerformance.employee_id),
                project_id: parseInt(projectPerformance.project_id),
                engagement_score: parseInt(projectPerformance.engagement_score),
                teamwork_score: parseInt(projectPerformance.teamwork_score),
                punctuality_score: parseInt(projectPerformance.punctuality_score),
                overall_performance_score: parseInt(projectPerformance.overall_performance_score),
            },
        });
    }
}
 
// Main function to run all seeds
async function main() {
    await truncateTables();
    console.log("All tables truncated.");
    await seedEmployees();
    await seedUserAccounts();
    await seedCourses();
    await seedCoursePerformances();
    await seedDesignationCourses();
    await seedResignations();
    await seedProjectPerformances();
}
 
main()
    .then(() => {
        console.log('Data seeding completed.');
    })
    .catch((e) => {
        console.error('Error seeding data:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
 