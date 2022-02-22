const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { PORT } = require("./constant/server");
const User = require("./routes/user")

dotenv.config();

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Expose-Headers", "Access-Token, Uid, x-auth");
    next();
});

app.use('/user', User);

mongoose
.connect(process.env.MONGO_URI, {
    useNewUrlParser: true
})
.then(() => console.log("mongodb connected"))
.catch(err => console.log(err));

app.listen(PORT, () => (
    console.log('server is running', PORT)
));  

