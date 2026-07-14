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



 database.connect((err)=> {
    if (err) {
        throw err
    }

    console.log("MYSQL CONNECTED!")
 })

DatabaseRouter.get("/GetUsers",(req,res)=> {
    database.query("SELECT * FROM users WHERE role != 'admin' ",(err,results)=> {
        if (err) {
            throw err
        }

        res.json({result : results})
    })
})


DatabaseRouter.post("/CreateAccount",(req,res)=> {
    const {email , username , password} = req.body


        let userRole = 'student'; // Default fallback


    if (email.endsWith('@admin.edu.sg') || email.startsWith('admin.')) {
        userRole = 'admin';   // Master Admin domain rule
    } else if (email.endsWith('@rp.edu.sg')) {
        userRole = 'teacher'; // Institutional staff domain rule
    } else if (email.endsWith('@myrp.edu.sg')) {
        userRole = 'student'; // Academic cohort domain rule
    }



    database.query("SELECT * FROM users WHERE username = ?",[username],(err,results)=> {

        if (err) {
            throw err
        }

        if (results.length > 0) {
            res.json({message : "username is taken!"})
            return
        }

        const hashedPassword = bcrypt.hashSync(password,Saltrounds)


        database.query("INSERT INTO users (username,email,password,role) VALUES(?,?,?,?)",[username,email,hashedPassword,userRole],(err,results)=> {
            if (err) {
                throw err
            }


            res.json({message : "success"})
        })




    })
 })

 DatabaseRouter.post("/Login",(req,res)=> {
    const {username,password} = req.body

        database.query("SELECT * FROM users WHERE username = ?",[username],(err,results)=> {

        if (err) {
            throw err
        }

        if (results.length == 0) {
            res.json({message : "user does not exist"})
            return
        }

        const user = results[0]

        const valid = bcrypt.compareSync(password,user.password)

        if (valid) {
            const payload = {
                id : user.id,
                username : user.username,
                role : user.role
            }

            const Token = jsonwebtoken.sign(payload,process.env.JWT_SECRET || "YOUR_SECRET_KEY",{expiresIn : "1hr"})


            res.json({message : "success",token : Token,role : user.role})
        }else {
            res.json({message : "incorrect password"})
        }

    })

 })



 



module.exports = {
    DatabaseRouter,
    database
}