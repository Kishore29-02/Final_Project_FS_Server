const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @typedef {Object} CourseDetail
 * @property {number} id
 * @property {string} course_name
 * @property {string} course_description
 * @property {number} duration_hours
 * @property {number} failed_count
 * @property {number} completed_count
 * @property {number} incomplete_count
 */

/**
 * @typedef {Object} DesignationCourse
 * @property {number} course_id
 * @property {string} course_name
 * @property {string[]} designation_type
 */

/**
 * @typedef {Object} DesignationWithCourseStatus
 * @property {number} course_id
 * @property {string} course_name
 * @property {string} designation_type
 * @property {Object[]} statuses
 * @property {string} statuses.course_status
 * @property {string} statuses.employees_count
 */

/**
 * Get all course details
 * @param {string} [courseName] - filter by course name (case insensitive)
 * @returns {Promise<CourseDetail[]>}
 */
const getAllCourseDetails = async (courseName) => {
    const courses = await prisma.courses.findMany({
        select: {
            id: true,
            course_name: true,
            course_description: true,
            duration_hours: true,
        },
        where: {
            course_name: {
                contains: courseName ? courseName.toLowerCase() : undefined,
                mode: 'insensitive',
            },
        },
        orderBy: {
            id: 'asc',
        },
    });

    if(courses.length === 0){
        return [];
    }
    
    const statusCounts = await prisma.course_Performances.groupBy({
        by: ['course_id', 'course_status'],
        _count: {
            course_status: true,
        },
        where: {
            course_id: {
                in: courses.map(course => course.id),
            }
        },
        orderBy: {
            course_id: 'asc',
        },
    });

    // Map course details to a lookup for easy access
    const courseDetailsLookup = courses.reduce((acc, course) => {
        acc[course.id] = course;
        return acc;
    }, {});

    // Combine status counts with course details
    const formattedResults = statusCounts.reduce((acc, result) => {
        const courseDetails = courseDetailsLookup[result.course_id];

        // Find the course object in the accumulator
        let courseEntry = acc.find(item => item.course_id === result.course_id);

        if (!courseEntry) {
            // If the course doesn't exist, create a new entry
            courseEntry = {
                course_id: result.course_id,
                course_name: courseDetails?.course_name,
                course_description: courseDetails?.course_description,
                duration_hours: courseDetails?.duration_hours,
                // status: [],
            };

            
            acc.push(courseEntry);
        }

        courseEntry[`${result.course_status}_count`] = result._count.course_status;

        return acc;
    }, []);

    return formattedResults;
};

/**
 * Get course status count by course id
 * @param {number} courseId
 * @returns {Promise<DesignationCourse>}
 */
const getCourseStatusCountByCourseId = async (courseId) => {

    const result = await prisma.course_Performances.groupBy({
      by: ['course_id', 'course_status'],
      _count: {
        course_status: true,
      },
      where: {
        course_id: courseId,
      },
      orderBy: {
        course_id: 'asc',
      },
    });

    const finalResult = {
        id: courseId,
        failed_count: result.filter(data => data.course_status === 'failed')[0]._count.course_status,
        completed_count: result.filter(data => data.course_status === 'completed')[0]._count.course_status,
        incomplete_count: result.filter(data => data.course_status === 'incomplete')[0]._count.course_status,
    }
  
    return finalResult;
  };

/**
 * Get designation courses
 * @param {number} [courseId]
 * @returns {Promise<DesignationCourse[]>}
 */
const getDesignationCourses = async (courseId) => {
    const where = courseId ? { course_id: courseId } : {};
    const designationCourses = await prisma.designation_Courses.findMany({
        select: {
            course_id: true,
            designation_type: true,
            course: { // Assuming you have a relation to the courses table
                select: {
                    course_name: true
                }
            }
        },
        where,
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

/**
 * Get all designations with course status
 * @returns {Promise<DesignationWithCourseStatus[]>}
 */
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

module.exports = {
    getAllCourseDetails,
    getCourseStatusCountByCourseId,
    getDesignationCourses,  
    getAllDesignationWithCourseStatus,
}

