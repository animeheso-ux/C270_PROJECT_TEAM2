const express = require("express");
const cors = require("cors");
const path = require("path");

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

// Simple route used for automated testing
app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "success",
        message: "Learning Quest backend is running",
    });
});

// Existing application routes
app.use(DatabaseRouter);
app.use(QuizRouter);
app.use(TokenRouter);

// React production files
app.use(express.static(path.join(__dirname, "myapp/dist")));

app.get("/{*path}", (req, res) => {
    res.sendFile(
        path.join(__dirname, "myapp/dist", "index.html")
    );
});

module.exports = app;