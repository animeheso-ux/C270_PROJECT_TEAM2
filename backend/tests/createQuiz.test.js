const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const { database } = require("../database");

describe("Create Quiz API", () => {
    const jwtSecret = process.env.JWT_SECRET || "YOUR_SECRET_KEY";

    const teacherToken = jwt.sign(
        {
            id: 20,
            username: "teacher1",
            email: "teacher1@rp.edu.sg",
            role: "teacher"
        },
        jwtSecret,
        {
            expiresIn: "1h"
        }
    );

    const studentToken = jwt.sign(
        {
            id: 10,
            username: "student1",
            email: "student1@myrp.edu.sg",
            role: "student"
        },
        jwtSecret,
        {
            expiresIn: "1h"
        }
    );

    let promiseMock;

    beforeEach(() => {
        jest.clearAllMocks();

        promiseMock = {
            beginTransaction: jest.fn(),
            query: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn()
        };

        database.promise = jest.fn(() => promiseMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("POST /CreateQuiz successfully creates a quiz", async () => {
        promiseMock.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([
                {
                    insertId: 5
                }
            ])
            .mockResolvedValueOnce([
                {
                    insertId: 101
                }
            ])
            .mockResolvedValueOnce([
                {
                    insertId: 201
                }
            ])
            .mockResolvedValueOnce([
                {
                    insertId: 202
                }
            ])
            .mockResolvedValueOnce([
                {
                    insertId: 203
                }
            ])
            .mockResolvedValueOnce([
                {
                    insertId: 204
                }
            ]);

        const response = await request(app)
            .post("/CreateQuiz")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({
                Topic: "JavaScript Basics",
                Quiz: [
                    {
                        Question: "What does JS stand for?",
                        Answer: "JavaScript",
                        Options: {
                            A: "JavaScript",
                            B: "Java Source",
                            C: "Just Script",
                            D: "Java Syntax"
                        }
                    }
                ]
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            message: "Quiz created successfully.",
            module_id: 5
        });

        expect(promiseMock.beginTransaction)
            .toHaveBeenCalledTimes(1);

        expect(promiseMock.commit)
            .toHaveBeenCalledTimes(1);

        expect(promiseMock.rollback)
            .not.toHaveBeenCalled();

        const moduleInsertCall = promiseMock.query.mock.calls[1];

        expect(moduleInsertCall[0]).toContain(
            "INSERT INTO modules"
        );

        expect(moduleInsertCall[1]).toEqual([
            "JavaScript Basics",
            "A quiz",
            20
        ]);
    });

    test("POST /CreateQuiz returns 401 when token is missing", async () => {
        const response = await request(app)
            .post("/CreateQuiz")
            .send({
                Topic: "JavaScript Basics",
                Quiz: [
                    {
                        Question: "Question 1",
                        Answer: "Answer 1",
                        Options: {
                            A: "Answer 1"
                        }
                    }
                ]
            });

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "error",
            message: "Authentication token is required.",
        });

        expect(promiseMock.beginTransaction)
            .not.toHaveBeenCalled();
    });

    test("POST /CreateQuiz returns 403 when a student tries to create a quiz", async () => {
        const response = await request(app)
            .post("/CreateQuiz")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                Topic: "JavaScript Basics",
                Quiz: [
                    {
                        Question: "Question 1",
                        Answer: "Answer 1",
                        Options: {
                            A: "Answer 1"
                        }
                    }
                ]
            });

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message: "Only teachers and administrators can create quizzes."
        });

        expect(promiseMock.beginTransaction)
            .not.toHaveBeenCalled();
    });

    test("POST /CreateQuiz returns 400 when topic is missing", async () => {
        const response = await request(app)
            .post("/CreateQuiz")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({
                Quiz: [
                    {
                        Question: "Question 1",
                        Answer: "Answer 1",
                        Options: {
                            A: "Answer 1"
                        }
                    }
                ]
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "Topic and quiz questions are required."
        });

        expect(promiseMock.beginTransaction)
            .not.toHaveBeenCalled();
    });

    test("POST /CreateQuiz returns 400 when quiz array is empty", async () => {
        const response = await request(app)
            .post("/CreateQuiz")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({
                Topic: "JavaScript Basics",
                Quiz: []
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "Topic and quiz questions are required."
        });

        expect(promiseMock.beginTransaction)
            .not.toHaveBeenCalled();
    });

    test("POST /CreateQuiz returns topic exist when module already exists", async () => {
        promiseMock.query.mockResolvedValueOnce([
            [
                {
                    module_id: 5
                }
            ]
        ]);

        const response = await request(app)
            .post("/CreateQuiz")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({
                Topic: "Existing Module",
                Quiz: [
                    {
                        Question: "Question 1",
                        Answer: "Answer 1",
                        Options: {
                            A: "Answer 1"
                        }
                    }
                ]
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "topic exist",
            message: "This module already exists."
        });

        expect(promiseMock.rollback)
            .toHaveBeenCalledTimes(1);

        expect(promiseMock.commit)
            .not.toHaveBeenCalled();
    });

    test("POST /CreateQuiz returns 500 and rolls back when database fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        promiseMock.query.mockRejectedValueOnce(
            new Error("Database Error")
        );

        const response = await request(app)
            .post("/CreateQuiz")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({
                Topic: "JavaScript Basics",
                Quiz: [
                    {
                        Question: "Question 1",
                        Answer: "Answer 1",
                        Options: {
                            A: "Answer 1"
                        }
                    }
                ]
            });

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message: "Unable to create quiz."
        });

        expect(promiseMock.rollback)
            .toHaveBeenCalledTimes(1);

        consoleErrorSpy.mockRestore();
    });
});
