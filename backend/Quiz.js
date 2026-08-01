const express = require("express");
const { database } = require("./database");
const { VerifyToken } = require("./token");

const QuizRouter = express.Router();

QuizRouter.post("/CreateQuiz", VerifyToken, async (req, res) => {
    const { Quiz, Topic } = req.body;

    if (req.Token.role !== "teacher" && req.Token.role !== "admin") {
        return res.status(403).json({
            status: "error",
            message: "Only teachers and administrators can create quizzes."
        });
    }

    if (!Topic || !Array.isArray(Quiz) || Quiz.length === 0) {
        return res.status(400).json({
            status: "error",
            message: "Topic and quiz questions are required."
        });
    }

    const connection = await database.promise().getConnection();

    try {
        await connection.beginTransaction();

        const [existing] = await connection.query(
            "SELECT module_id FROM modules WHERE module_name = ?",
            [Topic]
        );

        if (existing.length > 0) {
            await connection.rollback();
            connection.release();

            return res.json({
                status: "topic exist",
                message: "This module already exists."
            });
        }

        const [moduleResult] = await connection.query(
            `
            INSERT INTO modules (module_name, description, teacher_id)
            VALUES (?, ?, ?)
            `,
            [Topic, "A quiz", req.Token.id]
        );

        const moduleId = moduleResult.insertId;

        for (const quiz of Quiz) {
            const [questionResult] = await connection.query(
                `
                INSERT INTO questions
                (module_id, question_text, answer)
                VALUES (?, ?, ?)
                `,
                [moduleId, quiz.Question, quiz.Answer]
            );

            const questionId = questionResult.insertId;

            const options = Object.values(quiz.Options || {});

            for (const option of options) {
                await connection.query(
                    `
                    INSERT INTO options
                    (question_id, option_text)
                    VALUES (?, ?)
                    `,
                    [questionId, option]
                );
            }
        }

        await connection.commit();
        connection.release();

        return res.json({
            status: "success",
            message: "Quiz created successfully.",
            module_id: moduleId
        });

    } catch (err) {
        await connection.rollback();
        connection.release();

        console.error("Create quiz error:", err);

        return res.status(500).json({
            status: "error",
            message: err.message
        });
    }
});

/*
|--------------------------------------------------------------------------
| Get All Modules
|--------------------------------------------------------------------------
| Student module selection page uses this route.
*/
QuizRouter.get("/GetTopics", (req, res) => {
    database.query(
        `
        SELECT *
        FROM modules
        ORDER BY module_id DESC
        `,
        (err, results) => {
            if (err) {
                console.error("Get topics error:", err);

                return res.status(500).json({
                    status: "error",
                    message: "Unable to retrieve modules.",
                    result: []
                });
            }

            return res.json({
                status: "success",
                result: results
            });
        }
    );
});

/*
|--------------------------------------------------------------------------
| Get Questions for One Module
|--------------------------------------------------------------------------
*/
QuizRouter.post("/GetQuestions", (req, res) => {
    const { id } = req.body;
    console.log("Getting questions...")

    if (!id) {
        return res.status(400).json({
            status: "error",
            message: "Module ID is required.",
            result: []
        });
    }

    database.query(
        `
        SELECT *
        FROM questions
        WHERE module_id = ?
        `,
        [id],
        (err, results) => {
            if (err) {
                console.error("Get questions error:", err);

                return res.status(500).json({
                    status: "error",
                    message: "Unable to retrieve questions.",
                    result: []
                });
            }

            return res.json({
                status: "success",
                result: results
            });
        }
    );
});

/*
|--------------------------------------------------------------------------
| Get Options for One Question
|--------------------------------------------------------------------------
*/
QuizRouter.get("/GetOptions/:id", (req, res) => {
    const questionId = req.params.id;

    database.query(
        `
        SELECT *
        FROM options
        WHERE question_id = ?
        `,
        [questionId],
        (err, results) => {
            if (err) {
                console.error("Get options error:", err);

                return res.status(500).json({
                    status: "error",
                    message: "Unable to retrieve options.",
                    result: []
                });
            }

            return res.json({
                status: "success",
                result: results
            });
        }
    );
});

/*
|--------------------------------------------------------------------------
| Submit Student Quiz Attempt
|--------------------------------------------------------------------------
| The student ID is retrieved from the JWT.
| Do not trust a student ID sent by the frontend.
*/
QuizRouter.post("/SubmitQuiz", VerifyToken, async (req, res) => {
    const { moduleId, score, totalQuestions } = req.body;

    if (req.Token.role !== "student") {
        return res.status(403).json({
            status: "error",
            message: "Only students can submit quiz attempts."
        });
    }

    const parsedModuleId = Number(moduleId);
    const parsedScore = Number(score);
    const parsedTotalQuestions = Number(totalQuestions);

    if (
        !Number.isInteger(parsedModuleId) ||
        !Number.isInteger(parsedScore) ||
        !Number.isInteger(parsedTotalQuestions) ||
        parsedModuleId <= 0 ||
        parsedTotalQuestions <= 0 ||
        parsedScore < 0 ||
        parsedScore > parsedTotalQuestions
    ) {
        return res.status(400).json({
            status: "error",
            message: "Invalid quiz submission data."
        });
    }

    const studentId = req.Token.id;
    const percentage =
        (parsedScore / parsedTotalQuestions) * 100;

    try {
        const [moduleRows] = await database.promise().query(
            `
            SELECT module_id
            FROM modules
            WHERE module_id = ?
            `,
            [parsedModuleId]
        );

        if (moduleRows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Module does not exist."
            });
        }

        const [result] = await database.promise().query(
            `
            INSERT INTO quiz_attempts
            (
                student_id,
                module_id,
                score,
                total_questions,
                percentage
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                studentId,
                parsedModuleId,
                parsedScore,
                parsedTotalQuestions,
                percentage
            ]
        );

        return res.json({
            status: "success",
            message: "Quiz attempt submitted successfully.",
            attempt_id: result.insertId,
            percentage: Number(percentage.toFixed(2))
        });
    } catch (err) {
        console.error("Submit quiz error:", err);

        return res.status(500).json({
            status: "error",
            message: "Unable to submit quiz attempt."
        });
    }
});

/*
|--------------------------------------------------------------------------
| Teacher Dashboard Data
|--------------------------------------------------------------------------*/
QuizRouter.get("/TeacherDashboardData",VerifyToken,async (req, res) => {

        if (
            req.Token.role !== "teacher" &&
            req.Token.role !== "admin"
        ) {
            return res.status(403).json({
                status: "error",
                message: "Teacher access is required."
            });
        }

        try {
            let sql;
            let values = [];

            if (req.Token.role === "admin") {
                sql = `
                    SELECT
                        m.module_id,
                        m.module_name,
                        m.description,
                        m.teacher_id,

                        COUNT(
                            DISTINCT q.question_id
                        ) AS question_count,

                        COUNT(
                            DISTINCT qa.attempt_id
                        ) AS submission_count

                    FROM modules m

                    LEFT JOIN questions q
                        ON q.module_id = m.module_id

                    LEFT JOIN quiz_attempts qa
                        ON qa.module_id = m.module_id

                    GROUP BY
                        m.module_id,
                        m.module_name,
                        m.description,
                        m.teacher_id

                    ORDER BY m.module_id DESC
                `;
            } else {
                sql = `
                    SELECT
                        m.module_id,
                        m.module_name,
                        m.description,
                        m.teacher_id,

                        COUNT(
                            DISTINCT q.question_id
                        ) AS question_count,

                        COUNT(
                            DISTINCT qa.attempt_id
                        ) AS submission_count

                    FROM modules m

                    LEFT JOIN questions q
                        ON q.module_id = m.module_id

                    LEFT JOIN quiz_attempts qa
                        ON qa.module_id = m.module_id

                    WHERE m.teacher_id = ?

                    GROUP BY
                        m.module_id,
                        m.module_name,
                        m.description,
                        m.teacher_id

                    ORDER BY m.module_id DESC
                `;

                values = [req.Token.id];
            }

            const [results] =
                await database.promise().query(sql,values);

            return res.json({
                status: "success",
                result: results
            });

        } catch (err) {
            console.error(
                "Teacher dashboard error:",err
            );

            return res.status(500).json({
                status: "error",
                message:"Unable to load teacher dashboard.",
                result: []
            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| Admin Quiz Analytics
|--------------------------------------------------------------------------
*/
QuizRouter.get("/AdminQuizAnalytics",VerifyToken,async (req, res) => {
        if (req.Token.role !== "admin") {
            return res.status(403).json({
                status: "error",
                message: "Administrator access is required."
            });
        }

        try {
            const [results] = await database.promise().query(
                `
                SELECT
                    m.module_id,
                    m.module_name,

                    COUNT(
                        qa.attempt_id
                    ) AS attempts,

                    COALESCE(
                        AVG(qa.percentage),
                        0
                    ) AS average_score,

                    CASE
                        WHEN COUNT(qa.attempt_id) = 0
                            THEN 'No Data'

                        WHEN AVG(qa.percentage) >= 75
                            THEN 'Easy'

                        WHEN AVG(qa.percentage) >= 50
                            THEN 'Medium'

                        ELSE 'Hard'
                    END AS difficulty

                FROM modules m

                LEFT JOIN quiz_attempts qa
                    ON qa.module_id = m.module_id

                GROUP BY
                    m.module_id,
                    m.module_name

                ORDER BY m.module_id DESC
                `
            );

            return res.json({
                status: "success",
                result: results
            });
        } catch (err) {
            console.error("Admin analytics error:", err);

            return res.status(500).json({
                status: "error",
                message: "Unable to load quiz analytics.",
                result: []
            });
        }
    }
);


/*
|--------------------------------------------------------------------------
| Student Dashboard Data
|--------------------------------------------------------------------------
*/
QuizRouter.get("/StudentDashboardData",VerifyToken,async (req, res) => {
        if (req.Token.role !== "student") {
            return res.status(403).json({
                status: "error",
                message: "Student access is required."
            });
        }

        const studentId = req.Token.id;

        try {
            const [summaryRows] = await database.promise().query(
                `
                SELECT
                    COUNT(*) AS quizzes_taken,

                    COALESCE(
                        ROUND(AVG(percentage), 0),
                        0
                    ) AS average_score,

                    COALESCE(
                        ROUND(MAX(percentage), 0),
                        0
                    ) AS highest_score,

                    COUNT(
                        DISTINCT module_id
                    ) AS completed_modules

                FROM quiz_attempts
                WHERE student_id = ?
                `,
                [studentId]
            );

            const [recentAttempts] = await database.promise().query(
                `
                SELECT
                    qa.attempt_id,
                    qa.module_id,
                    m.module_name,
                    qa.score,
                    qa.total_questions,
                    ROUND(qa.percentage, 0) AS percentage

                FROM quiz_attempts qa

                INNER JOIN modules m
                    ON m.module_id = qa.module_id

                WHERE qa.student_id = ?

                ORDER BY qa.attempt_id DESC

                LIMIT 5
                `,
                [studentId]
            );

            const summary = summaryRows[0];

            const achievements = [];

            if (Number(summary.quizzes_taken) >= 1) {
                achievements.push({
                    name: "First Quiz",
                    description: "Completed the first quiz",
                    icon: "⭐"
                });
            }

            if (Number(summary.quizzes_taken) >= 5) {
                achievements.push({
                    name: "Quiz Explorer",
                    description: "Completed at least 5 quizzes",
                    icon: "📚"
                });
            }

            if (Number(summary.average_score) >= 80) {
                achievements.push({
                    name: "High Achiever",
                    description: "Maintained an average score of 80% or above",
                    icon: "🏆"
                });
            }

            if (Number(summary.highest_score) === 100) {
                achievements.push({
                    name: "Perfect Score",
                    description: "Achieved 100% in a quiz",
                    icon: "💯"
                });
            }

            return res.json({
                status: "success",

                student: {
                    id: req.Token.id,
                    username: req.Token.username
                },

                summary: {
                    quizzes_taken:
                        Number(summary.quizzes_taken) || 0,

                    average_score:
                        Number(summary.average_score) || 0,

                    highest_score:
                        Number(summary.highest_score) || 0,

                    completed_modules:
                        Number(summary.completed_modules) || 0
                },

                recent_attempts: recentAttempts,

                achievements: achievements
            });
        } catch (err) {
            console.error(
                "Student dashboard error:",
                err
            );

            return res.status(500).json({
                status: "error",
                message:
                    "Unable to load student dashboard."
            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| Delete Quiz Module
|--------------------------------------------------------------------------
*/

QuizRouter.delete("/DeleteQuiz/:id", VerifyToken, async (req, res) => {

    if (
        req.Token.role !== "teacher" &&
        req.Token.role !== "admin"
    ) {
        return res.status(403).json({
            status: "error",
            message: "Teacher access is required."
        });
    }

    const moduleId = req.params.id;

    try {

        await database.promise().beginTransaction();

        // Delete all options
        await database.promise().query(
            `
            DELETE o
            FROM options o
            INNER JOIN questions q
                ON o.question_id = q.question_id
            WHERE q.module_id = ?
            `,
            [moduleId]
        );

        // Delete questions
        await database.promise().query(
            `
            DELETE
            FROM questions
            WHERE module_id = ?
            `,
            [moduleId]
        );

        // Delete quiz attempts
        await database.promise().query(
            `
            DELETE
            FROM quiz_attempts
            WHERE module_id = ?
            `,
            [moduleId]
        );

        // Delete module
        const [result] = await database.promise().query(
            `
            DELETE
            FROM modules
            WHERE module_id = ?
            `,
            [moduleId]
        );

        if (result.affectedRows === 0) {

            await database.promise().rollback();

            return res.status(404).json({
                status: "error",
                message: "Module not found."
            });

        }

        await database.promise().commit();

        return res.json({
            status: "success",
            message: "Quiz module deleted successfully."
        });

    } catch (err) {

        await database.promise().rollback();

        console.error("DELETE QUIZ ERROR:", err);

        return res.status(500).json({
            status: "error",
            message: "Unable to delete quiz module."
            });
        }
    }
);

module.exports = {
    QuizRouter
};