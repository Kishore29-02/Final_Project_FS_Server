const express = require('express');
const {
    getAllDesignationWithCourseStatus,
    getDesignationCourses,
    getTopPerformingEmployeesByCourseAndStatus,
    getTopEmployeesByCompletedCourses,
} = require('../Controller');

const router = express.Router();

router.get("/", async (req,res) => {
    try {
        const courseStatusByDesignation = await getAllDesignationWithCourseStatus();
        const courseByDesignation = await getDesignationCourses();
        const topEmployees = await getTopPerformingEmployeesByCourseAndStatus(100, 1, "completed");
        const topLearners = await getTopEmployeesByCompletedCourses()
        res.json({topLearners, topEmployees, courseByDesignation, courseStatusByDesignation});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;
