const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyEmail(email) {
    const res = await prisma.user_Accounts.findFirst({
        where: {
            email: email,
        }
    });
    
    return res;
}

async function getUserDetails(id) {
    const res = await prisma.employees.findFirst({
        where: {
            id
        }
    })
    return res;
}

module.exports = {
    verifyEmail,
    getUserDetails
}
