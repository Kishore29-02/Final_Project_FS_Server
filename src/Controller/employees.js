/**
 * @module employees
 * @description Handles all operations related to employees
 */
const {PrismaClient, EmploymentStatus} = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get employees by email
 * @param {string} email - Email to search for
 * @returns {Promise<Employee[]>} - List of employees with matching email
 */
const getEmployeesByEmail = async (email) => {
    const res = await prisma.user_Accounts.findMany({
        where: {
            role: 'USER',
            email: {
                contains: email
            },
            employee: {
                employment_status: EmploymentStatus.active
            }
        },
        select: {
            email: true,
            employee: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    department: true,
                    designation_type: true,
                }
            }
        },
        orderBy: {
            employee: {
                id: 'asc'
            }
        }
    });
    return res;
}

/**
 * Get course performance by employee IDs
 * @param {number[]} ids - Array of employee IDs
 * @returns {Promise<CoursePerformance[]>} - List of course performances for the given employee IDs
 */
const getCoursePerformanceByEmployeeIds = async (ids) => {
    const res = await prisma.course_Performances.groupBy({
        by: ['employee_id', 'course_status'],
        _count: {
            course_status: true,
        },
        where: {
            employee_id: {
                in: ids, // Filters for employee IDs within the provided list
            },
        }
    });
    
    return res;
}

/**
 * Get detailed employee course report
 * @param {number} id - Employee ID
 * @returns {Promise<CoursePerformance[]>} - List of course performances for the given employee ID
 */
const getDetailEmployeeCourseReport = async (id) => {
    const res = await prisma.course_Performances.findMany({
        select: {
            employee_id: true,
            course_id: true,
            course_status: true,
            score: true,
            completion_date: true,
            course: {
                select: {
                    course_name: true
                }
            }
        },
        where: {
            employee_id: id
        },
        orderBy: {
            course_id: 'asc'
        }
    });
    
    return res;
}

/**
 * Get top employees by completed courses
 * @returns {Promise<Employee[]>} - List of employees with the most completed courses
 */
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

/**
 * Get top/bottom performing employees by course and status
 * @param {number} [count] - Number of employees to return
 * @param {number} [courseId] - Course ID
 * @param {string} [courseStatus] - Course status
 * @param {string} [order] - 'top' or 'bottom' to get either top or bottom performing employees
 * @returns {Promise<Employee[]>} - List of employees with the highest/lowest score for the given course and status
 */
const getTopPerformingEmployeesByCourseAndStatus = async ({count = 10, courseId, courseStatus, order = 'top'}) => {
    const where = {};

    if (courseId) {
        where.course_id = courseId;
    }

    if (courseStatus) {
        where.course_status = courseStatus;
    }

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
        where,
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
        ...(courseId ? {} : { course_completed: item.course_completed }),
    }));

    
    if (order === 'top') {
        result.sort((a, b) => b.avg_score - a.avg_score);
    } else if (order === 'bottom') {
        result.sort((a, b) => a.avg_score - b.avg_score);
    }
    
    if (!count) {
        return result;
    }
    return result.slice(0, count);
}

/**
 * Get top scorer per course and designation type along with average scores.
 * @param {number} [courseId] - Course ID to filter the results
 * @returns {Promise<Object[]>}
 */
const getTopPerformingEmployeesWithAvgScores = async (courseId) => {
    const where = courseId ? { course_id: courseId } : {};
    // Fetch average scores by course (course_id) and designation type
    const averageScores = await prisma.course_Performances.groupBy({
        by: ['course_id', 'course_status'],
        _avg: {
            score: true,
        },
        where: {
            course_status: 'completed',
            ...where,
        },
    });

    // Fetch top scorer by course and designation type
    const topScores = await prisma.course_Performances.findMany({
        select: {
            course_id: true,
            employee: {
                select: {
                    first_name: true,
                    last_name: true,
                    designation_type: true,
                },
            },
            course_status: true,
            score: true,
        },
        where: {
            course_status: 'completed',
            ...where,
        },
        orderBy: {
            score: 'desc',
        },
    });

    // Group by course_id and designation_type to find the top scorer
    const groupedScores = topScores.reduce((acc, curr) => {
        const key = `${curr.course_id}-${curr.employee.designation_type}`;
        
        if (!acc[key]) {
            acc[key] = {
                course_id: curr.course_id,
                designation_type: curr.employee.designation_type,
                department_topper: `${curr.employee.first_name} ${curr.employee.last_name}`,
                top_score: curr.score,
            };
        }
        return acc;
    }, {});

    // Merge average scores into the top scorer results
    const finalResults = Object.keys(groupedScores).map(key => {
        const topScoreEntry = groupedScores[key];
        const avgScoreEntry = averageScores.find(
            avg => avg.course_id === topScoreEntry.course_id
        );

        return {
            course_id: topScoreEntry.course_id,
            designation_type: topScoreEntry.designation_type,
            department_topper: topScoreEntry.department_topper,
            top_score: topScoreEntry.top_score,
            avg_score: avgScoreEntry ? parseFloat(avgScoreEntry._avg.score.toFixed(2)) : null,
        };
    });

    // Fetch course names and merge with the final results
    const courseIds = finalResults.map(result => result.course_id);
    const courses = await prisma.courses.findMany({
        select: {
            id: true,
            course_name: true,
        },
        where: {
            id: { in: courseIds },
        },
    });

    // Join course names with the final results
    const finalTable = finalResults.map(result => {
        const course = courses.find(c => c.id === result.course_id);
        return {
            ...result,
            course_name: course ? course.course_name : null,
        };
    });

    return finalTable;
};

/**
 * Get job performance by employee IDs
 * @param {number[]} employeeIds - Array of employee IDs
 * @returns {Promise<CoursePerformance[]>} - List of course performances for the given employee IDs
 */
const getJobPerformanceByEmployeeIds = async (employeeIds) => {
    const res = await prisma.project_Performances.findMany({
        select: {
            employee_id: true,
            project_id: true,
            engagement_score: true,
            teamwork_score: true,
            punctuality_score: true,
            overall_performance_score: true,
        },
        where: {
            employee_id: {
                in: employeeIds,
            },
        },
    });
    return res;
}

/**
 * Get count of projects each employee has worked on
 * @returns {Promise<{ employee_id: number; _count: { project_id: number; }; }[]>} - List of objects with employee_id and count of projects
 */
const getAllEmployeeProjectCount = async () => {
    const res = await prisma.project_Performances.groupBy({
        by: ['employee_id'],
        _count: {
            project_id: true,
        },
    });
    return res;
}

module.exports = {
    getEmployeesByEmail,
    getCoursePerformanceByEmployeeIds,
    getDetailEmployeeCourseReport,
    getTopEmployeesByCompletedCourses,
    getTopPerformingEmployeesByCourseAndStatus,
    getTopPerformingEmployeesWithAvgScores,
    getJobPerformanceByEmployeeIds,
    getAllEmployeeProjectCount
};
