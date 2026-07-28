const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const { database } = require("../database");

describe("Admin Quiz Analytics API", () => {
    const jwtSecret =
        process.env.JWT_SECRET || "YOUR_SECRET_KEY";

    const adminToken = jwt.sign(
        {
            id: 1,
            username: "admin1",
            email: "admin@admin.edu.sg",
            role: "admin"
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
            query: jest.fn()
        };

        database.promise = jest.fn(() => promiseMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("GET /AdminQuizAnalytics successfully returns quiz analytics", async () => {
        const mockAnalytics = [
            {
                module_id: 5,
                module_name: "JavaScript Basics",
                attempts: 10,
                average_score: 82.5,
                difficulty: "Easy"
            },
            {
                module_id: 4,
                module_name: "Database Basics",
                attempts: 7,
                average_score: 62,
                difficulty: "Medium"
            },
            {
                module_id: 3,
                module_name: "Advanced Python",
                attempts: 5,
                average_score: 42,
                difficulty: "Hard"
            },
            {
                module_id: 2,
                module_name: "New Module",
                attempts: 0,
                average_score: 0,
                difficulty: "No Data"
            }
        ];

        promiseMock.query.mockResolvedValueOnce([
            mockAnalytics
        ]);

        const response = await request(app)
            .get("/AdminQuizAnalytics")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: mockAnalytics
        });

        expect(promiseMock.query)
            .toHaveBeenCalledTimes(1);

        const [sql] = promiseMock.query.mock.calls[0];

        expect(sql).toContain("FROM modules m");
        expect(sql).toContain(
            "LEFT JOIN quiz_attempts qa"
        );
        expect(sql).toContain(
            "AVG(qa.percentage)"
        );
        expect(sql).toContain(
            "AS difficulty"
        );
    });

    test("GET /AdminQuizAnalytics returns 401 when token is missing", async () => {
        const response = await request(app)
            .get("/AdminQuizAnalytics");

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "Token not found"
        });

        expect(promiseMock.query)
            .not.toHaveBeenCalled();
    });

    test("GET /AdminQuizAnalytics returns 403 when teacher tries to access", async () => {
        const response = await request(app)
            .get("/AdminQuizAnalytics")
            .set(
                "Authorization",
                `Bearer ${teacherToken}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Administrator access is required."
        });

        expect(promiseMock.query)
            .not.toHaveBeenCalled();
    });

    test("GET /AdminQuizAnalytics returns 403 when student tries to access", async () => {
        const response = await request(app)
            .get("/AdminQuizAnalytics")
            .set(
                "Authorization",
                `Bearer ${studentToken}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Administrator access is required."
        });

        expect(promiseMock.query)
            .not.toHaveBeenCalled();
    });

    test("GET /AdminQuizAnalytics returns an empty array when there are no modules", async () => {
        promiseMock.query.mockResolvedValueOnce([
            []
        ]);

        const response = await request(app)
            .get("/AdminQuizAnalytics")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: []
        });
    });

    test("GET /AdminQuizAnalytics returns the difficulty values from the database result", async () => {
        const mockAnalytics = [
            {
                module_id: 1,
                module_name: "Easy Quiz",
                attempts: 4,
                average_score: 80,
                difficulty: "Easy"
            },
            {
                module_id: 2,
                module_name: "Medium Quiz",
                attempts: 4,
                average_score: 60,
                difficulty: "Medium"
            },
            {
                module_id: 3,
                module_name: "Hard Quiz",
                attempts: 4,
                average_score: 40,
                difficulty: "Hard"
            },
            {
                module_id: 4,
                module_name: "Unused Quiz",
                attempts: 0,
                average_score: 0,
                difficulty: "No Data"
            }
        ];

        promiseMock.query.mockResolvedValueOnce([
            mockAnalytics
        ]);

        const response = await request(app)
            .get("/AdminQuizAnalytics")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body.result[0].difficulty)
            .toBe("Easy");

        expect(response.body.result[1].difficulty)
            .toBe("Medium");

        expect(response.body.result[2].difficulty)
            .toBe("Hard");

        expect(response.body.result[3].difficulty)
            .toBe("No Data");
    });

    test("GET /AdminQuizAnalytics returns 500 when database query fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        promiseMock.query.mockRejectedValueOnce(
            new Error("Database Error")
        );

        const response = await request(app)
            .get("/AdminQuizAnalytics")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            );

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Unable to load quiz analytics.",
            result: []
        });

        consoleErrorSpy.mockRestore();
    });
});