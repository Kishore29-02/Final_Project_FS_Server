const express = require('express');
const {
    getAllCourseDetails,
    getCourseStatusCountByCourseId,
} = require('../Controller/course');

const router = express.Router();

router.get('/performance', async (req, res) => {
    try {
        const id = parseInt(req.query.course_id) ;
        // const coursePerformance = await getCoursePerformanceByIds(id);
        const courseStatusCount = await getCourseStatusCountByCourseId(id);
        res.json({ courseStatusCount});
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
