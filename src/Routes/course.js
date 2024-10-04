const express = require('express');
const {
    getAllCourseDetails,
    getCourseStatusCountByCourseId,
    getTopPerformingEmployeesByCourseAndStatus,
    getDesignationCourses,
    getTopPerformingEmployeesWithAvgScores,
} = require('../Controller');

const router = express.Router();

router.get('/performance', async (req, res) => {
    try {
        const courseId = parseInt(req.query.course_id) ;

        const courseStatusCount = await getCourseStatusCountByCourseId(courseId);
        const overAllCoursePerformance = await getTopPerformingEmployeesByCourseAndStatus({count: 10, courseId: courseId, courseStatus: 'completed'});
        const getDesignations = await getDesignationCourses(courseId);
        const departmentPerformance = await getTopPerformingEmployeesWithAvgScores(courseId);
        
        res.json({ overAllCoursePerformance, departmentPerformance, designationDetails: getDesignations[0], courseStatusCount});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get("/", async (req,res) => {
    try {
        const searchCourse = req.query.course || "";
        const courses = await getAllCourseDetails(searchCourse);
        res.json({courses});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;
