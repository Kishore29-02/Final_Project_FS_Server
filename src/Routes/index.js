const express = require('express');
const loginRouter = require('./login');
const authenticateToken = require('../Controller/authenticate');
const router = express.Router();

router.use("/login",loginRouter);
router.use("/register", require('./register'));
router.use("/employee",  require('./employee'));
router.use("/dashboard", require('./dashboard'));
router.use("/courses", require('./course'));

module.exports = router;
