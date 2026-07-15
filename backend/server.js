const express = require("express")
const cors = require("cors")
const http = require("http")

const { DatabaseRouter } = require("./database")
const { QuizRouter } = require("./Quiz")
const { TokenRouter } = require("./token")

const app = express()
const PORT = process.env.PORT || 3000

const server = http.createServer(app)

// CORS must be before the routes
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())

app.use(DatabaseRouter)
app.use(QuizRouter)
app.use(TokenRouter)

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend listening on port ${PORT}`)
})