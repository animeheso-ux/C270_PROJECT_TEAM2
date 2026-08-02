const express = require("express");
const cors = require("cors");

const { DatabaseRouter } = require("./database");
const { QuizRouter } = require("./Quiz");
const { TokenRouter } = require("./token");

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "success",
        message: "Learning Quest backend is running",
    });
});

app.use(DatabaseRouter);
app.use(QuizRouter);
app.use(TokenRouter);

module.exports = app;

//Yong Jian