const express = require("express")
const {exec} = require("node:child_process")

const http = require("http")
const path = require("path")

const {DatabaseRouter,database} = require("./database")
const {QuizRouter} = require("./Quiz")


const app = express()
const PORT = 3000

const server = http.createServer(app)



app.use(express.json())
//NOTE: PLEASE DON'T ADD ANY ROUTES HERE THIS IS FOR SERVER OPENING
//routes

app.use(DatabaseRouter)
app.use(QuizRouter)









app.use(express.static(path.join(__dirname,"myapp/dist")))


app.get("/{*path}",(req,res)=> {
    res.sendFile(path.join(__dirname,"myapp/dist","index.html"))
})


exec("cd myapp && npm run build" ,(err)=> {
    if (err) {
        throw err
    }

    console.log("REACT BUILD : SUCCESS")
})



server.listen(PORT,()=> console.log("localhost connected"),exec(`start http://localhost:${PORT}`))