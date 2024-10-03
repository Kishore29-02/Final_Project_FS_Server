const {PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllDesignationWithCourseStatus = async () => {
    const employeeWithDesignation = await prisma.course_Performances.findMany({
        select: {
            course_id: true,
            course_status: true,
            employee_id: true,
            course:{
                select:{
                    course_name: true,
                }
            },
            employee: {
                select: {
                    designation_type: true
                }
            }
        }
    });
    
    const designationCount = employeeWithDesignation.reduce((acc, curr) => {
        const key = `${curr.course_id}-${curr.employee.designation_type}-${curr.course_status}`;
        if (!acc[key]) {
            acc[key] = {
                course_id: curr.course_id,
                course_name: curr.course.course_name,
                designation_type: curr.employee.designation_type,
                course_status: curr.course_status,
                employees_count: 0,
            };
        }
        acc[key].employees_count += 1;
        return acc;
    }, {});
    
    const result = Object.values(designationCount).sort((a, b) => 
        a.course_id - b.course_id || a.designation_type.localeCompare(b.designation_type)
    );
    
    const groupedResult = result.reduce((acc, curr) => {
        const key = `${curr.course_id}-${curr.designation_type}`;
        if (!acc[key]) {
            acc[key] = {
                course_id: curr.course_id,
                course_name: curr.course_name,
                designation_type: curr.designation_type,
                statuses: [],
                total_employees: 0
            };
        }
        acc[key].statuses.push({
            course_status: curr.course_status,
            employees_count: curr.employees_count
        });
        acc[key].total_employees += curr.employees_count; // Sum the counts for percentage calculation
        return acc;
    }, {});
    
    // Calculate percentage for each status
    const finalResult = Object.values(groupedResult).map(group => {
        const statusesWithPercentage = group.statuses.map(status => {
            const percentage = ((status.employees_count / group.total_employees) * 100).toFixed(2);
            return {
                course_status: status.course_status,
                employees_count: percentage + '%'
            };
        });
    
        return {
            course_id: group.course_id,
            course_name: group.course_name,
            designation_type: group.designation_type,
            statuses: statusesWithPercentage
        };
    });
    
    return finalResult;      
    
};

const getDesignationCourses = async () => {
    const designationCourses = await prisma.designation_Courses.findMany({
        select: {
            course_id: true,
            designation_type: true,
            course: { // Assuming you have a relation to the courses table
                select: {
                    course_name: true
                }
            }
        }
    });
      
    const groupedResults = designationCourses.reduce((acc, curr) => {
        // Check if the course_id already exists in the accumulator
        const existing = acc.find(item => item.course_id === curr.course_id);
        
        if (existing) {
            // If it exists, push the designation_type into the existing array
            if (!existing.designation_type.includes(curr.designation_type)) {
                existing.designation_type.push(curr.designation_type);
            }
        } else {
            // If it doesn't exist, create a new entry
            acc.push({
                course_id: curr.course_id,
                course_name: curr.course.course_name, // Get course name from the relation
                designation_type: [curr.designation_type],
            });
        }
        return acc;
    }, []);
    
    const sortedResults = groupedResults.sort((a, b) => a.course_id - b.course_id);

    return sortedResults;
};


const getTopPerformingEmployees = async () => {
        const res = await prisma.course_Performances.findMany({
            select: {
                employee_id: true,
                employee: {
                    select: {
                        first_name: true,
                        last_name: true,
                        designation_type: true,
                        department: true,
                    },
                },
                score: true,
            },
            where: {
                course_status: 'completed',
            },
        });
    
        const designationCount = res.reduce((acc, curr) => {
            const { employee_id } = curr;
            const { first_name, last_name, designation_type, department } = curr.employee;
            const name = `${first_name} ${last_name}`;
    
            if (!acc[employee_id]) {
                acc[employee_id] = {
                    employee_id,
                    name,
                    designation_type,
                    department,
                    totalScore: 0,
                    course_completed: 0,
                };
            }
    
            acc[employee_id].totalScore += curr.score;
            acc[employee_id].course_completed += 1;
    
            return acc;
        }, {});
    
        const result = Object.values(designationCount).map(item => ({
            employee_id: item.employee_id,
            name: item.name,
            designation_type: item.designation_type,
            department: item.department,
            avg_score: item.totalScore / item.course_completed,
            course_completed: item.course_completed,
        })).sort((a, b) => b.avg_score - a.avg_score).slice(0, 10);
    
        return result;
}

const getTopEmployeesByCompletedCourses = async () => {
    const res = await prisma.course_Performances.groupBy({
        by: ['employee_id'],
        _count: {
            course_status: true,
        },
        where: {
            course_status: 'completed',
        },
        orderBy: {
            _count: {
                course_status: 'desc',
            },
        },
        take: 10,
    });

    const employeeIds = res.map((item) => item.employee_id);
    const employees = await prisma.employees.findMany({
        where: {
            id: {
                in: employeeIds,
            },
        },
        select: {
            id: true,
            first_name: true,
            last_name: true,
        },
    });

    const result = res.map((item) => {
        const employee = employees.find((emp) => emp.id === item.employee_id);
        return {
            employee_id: item.employee_id,
            name: `${employee.first_name} ${employee.last_name}`,
            course_completed: item._count.course_status,
        };
    });

    return result;
};

module.exports = {
    getAllDesignationWithCourseStatus,
    getDesignationCourses,
    getTopPerformingEmployees,
    getTopEmployeesByCompletedCourses,
};
