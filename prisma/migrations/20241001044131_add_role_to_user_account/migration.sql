-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User_Accounts" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
