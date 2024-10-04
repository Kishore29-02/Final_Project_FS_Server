// src/Controller/index.js

const {  getAllCourseDetails,
    getCourseStatusCountByCourseId,
    getAllDesignationWithCourseStatus,
    getDesignationCourses,
} = require("../Controller/course");
const {
    getEmployeesByEmail,
    getCoursePerformanceByEmployeeIds,
    getDetailEmployeeCourseReport,
    getTopPerformingEmployeesByCourseAndStatus,
    getTopEmployeesByCompletedCourses,
    getTopPerformingEmployeesWithAvgScores,
    getJobPerformanceByEmployeeIds,
    getAllEmployeeProjectCount,
} = require("../Controller/employees");
const {
    verifyEmail,
    getUserDetails,
} = require("../Controller/login");


module.exports = {
    getAllCourseDetails,
    getCourseStatusCountByCourseId,
    getAllDesignationWithCourseStatus,
    getDesignationCourses,
    getTopPerformingEmployeesByCourseAndStatus,
    getTopEmployeesByCompletedCourses,
    getEmployeesByEmail,
    getCoursePerformanceByEmployeeIds,
    getDetailEmployeeCourseReport,
    getTopPerformingEmployeesWithAvgScores,
    getJobPerformanceByEmployeeIds,
    getAllEmployeeProjectCount,
    verifyEmail,
    getUserDetails,
}