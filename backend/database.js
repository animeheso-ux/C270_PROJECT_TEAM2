const express = require("express")
const mysql = require("mysql2")
const bcrypt = require("bcrypt")
const jsonwebtoken = require("jsonwebtoken")

const Saltrounds = 10

const DatabaseRouter = express.Router()


require("dotenv").config()

const database = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "RP738964$",
    database: process.env.DB_NAME || "learning_quest",
})

database.connect((err) => {
    if (err) {
        throw err
    }
    console.log("MYSQL CONNECTED!")
})

DatabaseRouter.get("/GetUsers", (req, res) => {
    database.query("SELECT * FROM users WHERE role != 'admin' ", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ result: results })
    })
})


DatabaseRouter.post("/CreateAccount", (req, res) => {
    const { email, username, password } = req.body

    let userRole = 'student'; // Default fallback


    if (email.endsWith('@admin.edu.sg') || email.startsWith('admin.')) {
        userRole = 'admin';   // Master Admin domain rule
    } else if (email.endsWith('@rp.edu.sg')) {
        userRole = 'teacher'; // Institutional staff domain rule
    } else if (email.endsWith('@myrp.edu.sg')) {
        userRole = 'student'; // Academic cohort domain rule
    }

    database.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
            res.json({ message: "username is taken!" })
            return
        }

        const hashedPassword = bcrypt.hashSync(password, Saltrounds)


        database.query("INSERT INTO users (username,email,password,role) VALUES(?,?,?,?)", [username, email, hashedPassword, userRole], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }


            res.json({ message: "success" })
        })
    })
})

DatabaseRouter.post("/Login", (req, res) => {
    const { username, password } = req.body

    console.log(`[LOGIN] Login attempt: ${username}`)

    database.query(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [username, username],
        (err, results) => {
            console.log("[LOGIN] Database callback reached")

            if (err) {
                console.error("[LOGIN] Database error:", err)
                return res.status(500).json({
                    message: "database error",
                    error: err.message
                })
            }

            console.log(`[LOGIN] Number of users found: ${results.length}`)

            if (results.length === 0) {
                console.warn(`[LOGIN] User not found: ${username}`)
                return res.status(401).json({
                    message: "user does not exist"
                })
            }

            const user = results[0]

            console.log(
                `[LOGIN] Found user: id=${user.id}, username=${user.username}, email=${user.email}, role=${user.role}`
            )

            try {
                const valid = bcrypt.compareSync(password, user.password)

                console.log(`[LOGIN] Password valid: ${valid}`)

                if (!valid) {
                    return res.status(401).json({
                        message: "incorrect password"
                    })
                }

                const payload = {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }

                const token = jsonwebtoken.sign(
                    payload,
                    process.env.JWT_SECRET || "YOUR_SECRET_KEY",
                    { expiresIn: "1h" }
                )

                console.log(`[LOGIN] Login successful: ${user.username}`)

                return res.json({
                    message: "success",
                    token,
                    role: user.role
                })
            } catch (error) {
                console.error("[LOGIN] Password comparison failed:", error)

                return res.status(500).json({
                    message: "login processing failed",
                    error: error.message
                })
            }
        }
    )
})


module.exports = {
    DatabaseRouter,
    database
}