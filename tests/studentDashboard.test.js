const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const { database } = require("../database");

describe("Student Dashboard Data API", () => {
    const jwtSecret =
        process.env.JWT_SECRET || "YOUR_SECRET_KEY";

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

    test("GET /StudentDashboardData successfully returns student dashboard data", async () => {
        const mockSummary = [
            {
                quizzes_taken: 5,
                average_score: 82,
                highest_score: 100,
                completed_modules: 4
            }
        ];

        const mockRecentAttempts = [
            {
                attempt_id: 20,
                module_id: 5,
                module_name: "JavaScript Basics",
                score: 9,
                total_questions: 10,
                percentage: 90
            },
            {
                attempt_id: 19,
                module_id: 3,
                module_name: "HTML Basics",
                score: 8,
                total_questions: 10,
                percentage: 80
            }
        ];

        promiseMock.query
            .mockResolvedValueOnce([mockSummary])
            .mockResolvedValueOnce([mockRecentAttempts]);

        const response = await request(app)
            .get("/StudentDashboardData")
            .set(
                "Authorization",
                `Bearer ${studentToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body.status).toBe("success");

        expect(response.body.student).toEqual({
            id: 10,
            username: "student1"
        });

        expect(response.body.summary).toEqual({
            quizzes_taken: 5,
            average_score: 82,
            highest_score: 100,
            completed_modules: 4
        });

        expect(response.body.recent_attempts)
            .toEqual(mockRecentAttempts);

        expect(response.body.achievements).toEqual([
            {
                name: "First Quiz",
                description: "Completed the first quiz",
                icon: "⭐"
            },
            {
                name: "Quiz Explorer",
                description: "Completed at least 5 quizzes",
                icon: "📚"
            },
            {
                name: "High Achiever",
                description:
                    "Maintained an average score of 80% or above",
                icon: "🏆"
            },
            {
                name: "Perfect Score",
                description: "Achieved 100% in a quiz",
                icon: "💯"
            }
        ]);

        expect(promiseMock.query)
            .toHaveBeenCalledTimes(2);

        expect(
            promiseMock.query.mock.calls[0][1]
        ).toEqual([10]);

        expect(
            promiseMock.query.mock.calls[1][1]
        ).toEqual([10]);
    });

    test("GET /StudentDashboardData returns 401 when token is missing", async () => {
        const response = await request(app)
            .get("/StudentDashboardData");

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "Token not found"
        });

        expect(promiseMock.query)
            .not.toHaveBeenCalled();
    });

    test("GET /StudentDashboardData returns 403 when teacher tries to access", async () => {
        const response = await request(app)
            .get("/StudentDashboardData")
            .set(
                "Authorization",
                `Bearer ${teacherToken}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message: "Student access is required."
        });

        expect(promiseMock.query)
            .not.toHaveBeenCalled();
    });

    test("GET /StudentDashboardData returns zero values when student has no quiz attempts", async () => {
        promiseMock.query
            .mockResolvedValueOnce([
                [
                    {
                        quizzes_taken: 0,
                        average_score: 0,
                        highest_score: 0,
                        completed_modules: 0
                    }
                ]
            ])
            .mockResolvedValueOnce([[]]);

        const response = await request(app)
            .get("/StudentDashboardData")
            .set(
                "Authorization",
                `Bearer ${studentToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body.summary).toEqual({
            quizzes_taken: 0,
            average_score: 0,
            highest_score: 0,
            completed_modules: 0
        });

        expect(response.body.recent_attempts)
            .toEqual([]);

        expect(response.body.achievements)
            .toEqual([]);
    });

    test("GET /StudentDashboardData gives First Quiz achievement after one quiz", async () => {
        promiseMock.query
            .mockResolvedValueOnce([
                [
                    {
                        quizzes_taken: 1,
                        average_score: 60,
                        highest_score: 60,
                        completed_modules: 1
                    }
                ]
            ])
            .mockResolvedValueOnce([[]]);

        const response = await request(app)
            .get("/StudentDashboardData")
            .set(
                "Authorization",
                `Bearer ${studentToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body.achievements).toEqual([
            {
                name: "First Quiz",
                description: "Completed the first quiz",
                icon: "⭐"
            }
        ]);
    });

    test("GET /StudentDashboardData gives High Achiever when average score is at least 80", async () => {
        promiseMock.query
            .mockResolvedValueOnce([
                [
                    {
                        quizzes_taken: 3,
                        average_score: 85,
                        highest_score: 95,
                        completed_modules: 3
                    }
                ]
            ])
            .mockResolvedValueOnce([[]]);

        const response = await request(app)
            .get("/StudentDashboardData")
            .set(
                "Authorization",
                `Bearer ${studentToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body.achievements).toContainEqual({
            name: "High Achiever",
            description:
                "Maintained an average score of 80% or above",
            icon: "🏆"
        });
    });

    test("GET /StudentDashboardData returns 500 when database query fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        promiseMock.query.mockRejectedValueOnce(
            new Error("Database Error")
        );

        const response = await request(app)
            .get("/StudentDashboardData")
            .set(
                "Authorization",
                `Bearer ${studentToken}`
            );

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Unable to load student dashboard."
        });

        consoleErrorSpy.mockRestore();
    });
});