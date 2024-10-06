const express = require('express');
const {
    getEmployeesByEmail,
    getCoursePerformanceByEmployeeIds,
    getDetailEmployeeCourseReport,
    getJobPerformanceByEmployeeIds,
    getAllEmployeeProjectCount,
} = require('../Controller');

const router = express.Router();

router.get('/performance', async (req, res) => {
    try {
        const id = parseInt(req.query.id);

        const coursePerformance = await getDetailEmployeeCourseReport(id);

        const coursesAssigned = coursePerformance.map((cp) => ({
            courseName: cp.course.course_name,
            courseStatus: cp.course_status,
            score: cp.score,
            completionDate: cp.completion_date.toISOString().split('T')[0],
        }));

        const completedCourseScores = coursesAssigned
            .filter((cp) => cp.courseStatus === 'completed')
            .map((cp) => ({ name: cp.courseName, score: cp.score }));

        const topScoreAndCourse = coursesAssigned
            .reduce((acc, cp) => {
                if (cp.score > acc.score) {
                    return { score: cp.score, courseName: cp.courseName };
                }
                return acc;
            }, { score: 0, courseName: '' });
        
        const averageScore = completedCourseScores.reduce((acc, cp) => acc + cp.score, 0) / completedCourseScores.length;

        const jobPerformance = await getJobPerformanceByEmployeeIds([id]);

        res.json({
            jobPerformance,
            coursesAssigned,
            completedCourseScores,
            topScoreAndCourse,
            averageScore,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const email = req.query.email || "";

        const employeeDetails = await getEmployeesByEmail(email);
        const coursePerformance = await getCoursePerformanceByEmployeeIds(employeeDetails.map((employee) => employee.employee.id));
        const projectCount = await getAllEmployeeProjectCount();

        const getCourseStatusCount = (coursePerformance, employeeId, courseStatus) => {
            const filteredResult = coursePerformance.filter((cp) => cp.employee_id === employeeId && cp.course_status === courseStatus);
            return filteredResult.length ? filteredResult[0]._count.course_status : 0;
        };

        const employeeDetailsWithCoursePerformance = employeeDetails.map((employee) => ({
            id: employee.employee.id,
            firstName: employee.employee.first_name,
            lastName: employee.employee.last_name,
            dept: employee.employee.department,
            designation: employee.employee.designation_type,
            email: employee.email,
            projectCount: projectCount.find((pc) => pc.employee_id === employee.employee.id)._count.project_id,
            courseCompletedCount: getCourseStatusCount(coursePerformance, employee.employee.id, 'completed'),
            courseFailedCount: getCourseStatusCount(coursePerformance, employee.employee.id, 'failed'),
            courseIncompleteCount: getCourseStatusCount(coursePerformance, employee.employee.id, 'incomplete'),
        }));

        res.json(employeeDetailsWithCoursePerformance);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/job-performance', async (req, res) => {
    try {
        const id = parseInt(req.query.id);
        const jobPerformance = await getJobPerformanceByEmployeeIds([id]);
        res.json(jobPerformance);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
