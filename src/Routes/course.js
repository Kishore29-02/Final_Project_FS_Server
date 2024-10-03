const express = require('express');
const {
    getAllCourseDetails,
} = require('../Controller/course');

const router = express.Router();

router.get("/", async (req,res) => {
    try {
        const courses = await getAllCourseDetails();
        res.json({courses});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;
