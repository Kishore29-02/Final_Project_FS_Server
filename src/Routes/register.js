const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient, Role } = require('@prisma/client');

require('dotenv').config();

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
    try {
      const { emp_id, email, password } = req.body;
      
    //   emp_id = parseInt(emp_id);

      // Check if the employee exists
      const employee = await prisma.employees.findUnique({
        where: { id: emp_id },
      });
  
      if (!employee) {
        return res.status(400).json({ error: 'Employee does not exist' });
      }
  
      // Check if the user account already exists
      const existingUser = await prisma.user_Accounts.findFirst({
        where: { 
            OR: [
                { email: email },
                { employee_id: emp_id }
              ]             
        },
      });
  
      if (existingUser) {
        return res.status(400).json({ error: 'User account already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await prisma.user_Accounts.create({
        data: {
          employee_id: emp_id,
          email,
          password: hashedPassword,
        },
      });
  
      return res.status(201).json({ message: 'User account created successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  });

module.exports = router;