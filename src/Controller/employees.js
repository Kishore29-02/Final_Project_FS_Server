const {PrismaClient, EmploymentStatus} = require('@prisma/client');
const prisma = new PrismaClient();

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

const getCoursePerformanceByIds = async (ids) => {
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
  };  

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
    })
    
    return res;
  };
  
module.exports = {
    getEmployeesByEmail,
    getCoursePerformanceByIds,
    getDetailEmployeeCourseReport,
};
