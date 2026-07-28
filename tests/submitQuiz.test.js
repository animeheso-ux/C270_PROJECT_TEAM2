const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const { database } = require("../database");

describe("Submit Quiz API", () => {
    const jwtSecret = process.env.JWT_SECRET || "YOUR_SECRET_KEY";

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

    let promiseMock;

    beforeEach(() => {
        jest.clearAllMocks();

        promiseMock = {
            query: jest.fn()
        };

        database.promise = jest.fn(() => promiseMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("POST /SubmitQuiz successfully submits a valid student quiz attempt", async () => {
        promiseMock.query
            .mockResolvedValueOnce([
                [
                    {
                        module_id: 3
                    }
                ]
            ])
            .mockResolvedValueOnce([
                {
                    insertId: 101
                }
            ]);

        const response = await request(app)
            .post("/SubmitQuiz")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                moduleId: 3,
                score: 8,
                totalQuestions: 10
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            message: "Quiz attempt submitted successfully.",
            attempt_id: 101,
            percentage: 80
        });

        expect(promiseMock.query).toHaveBeenCalledTimes(2);

        const [moduleSql, moduleValues] =
            promiseMock.query.mock.calls[0];

        expect(moduleSql).toContain("FROM modules");
        expect(moduleSql).toContain("WHERE module_id = ?");
        expect(moduleValues).toEqual([3]);

        const [insertSql, insertValues] =
            promiseMock.query.mock.calls[1];

        expect(insertSql).toContain("INSERT INTO quiz_attempts");

        expect(insertValues).toEqual([
            10,
            3,
            8,
            10,
            80
        ]);
    });

    test("POST /SubmitQuiz returns 401 when token is missing", async () => {
        const response = await request(app)
            .post("/SubmitQuiz")
            .send({
                moduleId: 3,
                score: 8,
                totalQuestions: 10
            });

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "Token not found"
        });

        expect(promiseMock.query).not.toHaveBeenCalled();
    });

    test("POST /SubmitQuiz returns 403 when a teacher tries to submit", async () => {
        const response = await request(app)
            .post("/SubmitQuiz")
            .set("Authorization", `Bearer ${teacherToken}`)
            .send({
                moduleId: 3,
                score: 8,
                totalQuestions: 10
            });

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message: "Only students can submit quiz attempts."
        });

        expect(promiseMock.query).not.toHaveBeenCalled();
    });

    test("POST /SubmitQuiz returns 400 for invalid quiz submission data", async () => {
        const response = await request(app)
            .post("/SubmitQuiz")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                moduleId: 3,
                score: 11,
                totalQuestions: 10
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "Invalid quiz submission data."
        });

        expect(promiseMock.query).not.toHaveBeenCalled();
    });

    test("POST /SubmitQuiz returns 404 when module does not exist", async () => {
        promiseMock.query.mockResolvedValueOnce([[]]);

        const response = await request(app)
            .post("/SubmitQuiz")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                moduleId: 999,
                score: 5,
                totalQuestions: 10
            });

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            status: "error",
            message: "Module does not exist."
        });

        expect(promiseMock.query).toHaveBeenCalledTimes(1);
    });

    test("POST /SubmitQuiz returns 500 when database query fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        promiseMock.query.mockRejectedValueOnce(
            new Error("Database Error")
        );

        const response = await request(app)
            .post("/SubmitQuiz")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                moduleId: 3,
                score: 8,
                totalQuestions: 10
            });

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message: "Unable to submit quiz attempt."
        });

        consoleErrorSpy.mockRestore();
    });

    test("POST /SubmitQuiz calculates percentage correctly", async () => {
        promiseMock.query
            .mockResolvedValueOnce([
                [
                    {
                        module_id: 5
                    }
                ]
            ])
            .mockResolvedValueOnce([
                {
                    insertId: 200
                }
            ]);

        const response = await request(app)
            .post("/SubmitQuiz")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                moduleId: 5,
                score: 7,
                totalQuestions: 8
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.percentage).toBe(87.5);
    });
});