 const express = require("express")
 const mysql = require("mysql2")

const DatabaseRouter = express.Router()

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



 



module.exports = {
    DatabaseRouter,
    database
}