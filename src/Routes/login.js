const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const authenticate = require('../Controller/authenticate');
require('dotenv').config();

const router = express.Router();
const { verifyEmail, getUserDetails } = require('../Controller');

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

        const userDetails = {
            ... await getUserDetails(userInfo.employee_id),
            ... userInfo
        }

        const token = jwt.sign(
            {
                id: userInfo.emp_id,
                email: userInfo.email,
                role: userInfo.role,
            },
            process.env.SECRET_KEY,
            { expiresIn: "24h" }
          );
        
        res.setHeader('Authorization', `Bearer ${token}`);
        res.json({ 
            message: "Authentication successful", 
            token, 
            id: userInfo.employee_id,
            name: `${userDetails.first_name} ${userDetails.last_name}`,
            role: userDetails.role,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
