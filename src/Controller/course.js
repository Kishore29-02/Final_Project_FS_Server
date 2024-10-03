const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

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
                status: [],
            };
            acc.push(courseEntry);
        }

        // Add the status to the status array
        courseEntry.status.push({
            course_status: result.course_status,
            status_count: result._count.course_status,
        });

        return acc;
    }, []);

    return formattedResults;
};

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
  
    return result;
  };
  

module.exports = {
    getAllCourseDetails,
    getCourseStatusCountByCourseId,    
}
