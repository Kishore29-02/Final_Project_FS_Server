const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const authenticate = require('../Controller/authenticate');
require('dotenv').config();

const router = express.Router();
const { verifyEmail, getUserDetails } = require('../Controller/login');

router.post("/", async function(req, res, next) {
    try {
        const { email, password } = req.body;
        const userInfo = await verifyEmail(email);

        if (!userInfo) {
            return res.status(403).json({ message: "Email does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, userInfo.password);

        if (!isPasswordValid) {
            return res.status(403).json({ message: "Invalid password" });
        }

        if (userInfo.role !== 'ADMIN' ){
            return res.status(403).json({ message: "Access Denied" })
        }

        const userDetails = {
            ... await getUserDetails(userInfo.emp_id),
            ... userInfo
        }

        // console.log(userDetails);

        const token = jwt.sign({ email: userInfo.email, id: userInfo.emp_id }, process.env.SECRET_KEY, { expiresIn: '24h' });
        
        res.setHeader('Authorization', `Bearer ${token}`);
        res.json({ message: "Authentication successful", token, name: `${userDetails.first_name} ${userDetails.last_name}` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
