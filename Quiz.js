const express = require("express")
const {database} = require("./database")

const QuizRouter = express.Router()




QuizRouter.post("/CreateQuiz",async(req,res)=> {
    const {Quiz,Topic} = req.body


      try {
        await database.promise().beginTransaction();

        const [existing] = await database.promise().query(
            "SELECT * FROM modules WHERE module_name = ?",
            [Topic]
        );

        if (existing.length > 0) {
            await database.promise().rollback();
            return res.json({ status: "topic exist" });
        }

        const [moduleResult] = await database.promise().query(
            "INSERT INTO modules (module_name, description) VALUES (?, ?)",
            [Topic, "A quiz"]
        );

        const moduleId = moduleResult.insertId;

        for (const quiz of Quiz) {
            const [questionResult] = await database.promise().query(
                "INSERT INTO questions (module_id, question_text, answer) VALUES (?, ?, ?)",
                [moduleId, quiz.Question, quiz.Answer]
            );

            const questionId = questionResult.insertId;

            const options = Object.values(quiz.Options);

for (let i = 0; i < options.length; i++) {
    await database.promise().query(
        "INSERT INTO options (question_id, option_text) VALUES (?, ?)",
        [questionId, options[i]]
    );



}
        }

        await database.promise().commit();
        res.json({ status: "success" });

    } catch (err) {
        await database.promise().rollback();
        console.error(err);
        res.status(500).json({ status: "error" });
    }

    
})




QuizRouter.get("/GetTopics",(req,res)=> {
    database.query("SELECT * FROM modules",(err,results)=> {

        if (err) {
            throw err
        }


        res.json({result : results})

    })
})


QuizRouter.post("/GetQuestions",(req,res)=> {
    const {id} = req.body

    database.query("SELECT * FROM questions WHERE module_id = ?",[id],(err,results)=> {

        if (err) {
            throw err
        }


        res.json({result : results})

    })
})

QuizRouter.get("/GetOptions/:id",(req,res)=> {
    const question_id = req.params.id
    console.log(question_id)

     database.query("SELECT * FROM options WHERE question_id = ?",[question_id],(err,results)=> {

        if (err) {
            throw err
        }


        res.json({result : results})

    })

})


module.exports = {
    QuizRouter
}

