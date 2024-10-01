const express = require('express');
const loginRouter = require('./login');

const router = express.Router();

router.use("/login",loginRouter);
router.use("/register",require('./register'));

module.exports = router;