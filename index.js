const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
require('dotenv').config();

const port = process.env.PORT || 3001;

app.use(express.json());

app.use("/",require("./src/Routes"));
// app.use('/',(req, res) => {
    // return "Helon"
// })

app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
})