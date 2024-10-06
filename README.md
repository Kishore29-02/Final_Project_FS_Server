
# Project Setup

## 1. Install Dependencies

Start by cloning the repository and navigating into the project directory. Install the necessary dependencies:

```bash
npm install
```

This will install the required packages listed in the `package.json` file, including Prisma.

## 2. Create the `.env` File

Create a `.env` file at the root of the project. This file will store the database connection details.

Example `.env` file:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

- Replace `USER` with your PostgreSQL username.
- Replace `PASSWORD` with your PostgreSQL password.
- Replace `HOST` with your database host (e.g., `localhost`).
- Replace `PORT` with your PostgreSQL port (usually `5432`).
- Replace `DATABASE` with the name of your PostgreSQL database.

## 3. Initialize Prisma

After installing the packages, you need to initialize Prisma in your project.

Run the following command to initialize Prisma and set up the Prisma schema:

```bash
npx prisma init
```

This will create a `prisma/` directory with a default `schema.prisma` file.

## 4. Seed the Database

Make sure your seed script is located in the `prisma/` directory.

Run:

```bash
npm run seed
```

## 8. Test the Database Connection

To verify that Prisma is correctly connected to your database, you can use Prisma Studio, which provides a GUI to interact with your database.

Run:

```bash
npx prisma studio
```

## 9. Start the Project

Once everything is set up, you can start the project using:

```bash
npm start
```

---

That's it! Your project should now be set up with Prisma and connected to your PostgreSQL database.
