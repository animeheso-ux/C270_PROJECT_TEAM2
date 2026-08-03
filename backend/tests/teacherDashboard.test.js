const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const { database } = require("../database");

describe("Teacher Dashboard Data API", () => {
    const jwtSecret =
        process.env.JWT_SECRET || "YOUR_SECRET_KEY";

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

    test("GET /TeacherDashboardData returns modules created by the teacher", async () => {
        const mockModules = [
            {
                module_id: 5,
                module_name: "JavaScript Basics",
                description: "A quiz",
                teacher_id: 20,
                question_count: 10,
                submission_count: 4
            },
            {
                module_id: 3,
                module_name: "HTML Basics",
                description: "A quiz",
                teacher_id: 20,
                question_count: 5,
                submission_count: 2
            }
        ];

        promiseMock.query.mockResolvedValueOnce([
            mockModules
        ]);

        const response = await request(app)
            .get("/TeacherDashboardData")
            .set(
                "Authorization",
                `Bearer ${teacherToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: mockModules
        });

        expect(promiseMock.query)
            .toHaveBeenCalledTimes(1);

        const [sql, values] =
            promiseMock.query.mock.calls[0];

        expect(sql).toContain("FROM modules m");
        expect(sql).toContain(
            "WHERE m.teacher_id = ?"
        );

        expect(values).toEqual([20]);
    });

    test("GET /TeacherDashboardData allows admin to retrieve all modules", async () => {
        const mockModules = [
            {
                module_id: 8,
                module_name: "Python",
                teacher_id: 22,
                question_count: 8,
                submission_count: 6
            },
            {
                module_id: 5,
                module_name: "JavaScript",
                teacher_id: 20,
                question_count: 10,
                submission_count: 4
            }
        ];

        promiseMock.query.mockResolvedValueOnce([
            mockModules
        ]);

        const response = await request(app)
            .get("/TeacherDashboardData")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: mockModules
        });

        const [sql, values] =
            promiseMock.query.mock.calls[0];

        expect(sql).toContain("FROM modules m");

        expect(sql).not.toContain(
            "WHERE m.teacher_id = ?"
        );

        expect(values).toEqual([]);
    });

    test("GET /TeacherDashboardData returns 401 when token is missing", async () => {
        const response = await request(app)
            .get("/TeacherDashboardData");

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "error",
            message: "Authentication token is required.",
        });

        expect(promiseMock.query)
            .not.toHaveBeenCalled();
    });

    test("GET /TeacherDashboardData returns 403 when student tries to access", async () => {
        const response = await request(app)
            .get("/TeacherDashboardData")
            .set(
                "Authorization",
                `Bearer ${studentToken}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message: "Teacher access is required."
        });

        expect(promiseMock.query)
            .not.toHaveBeenCalled();
    });

    test("GET /TeacherDashboardData returns an empty array when teacher has no modules", async () => {
        promiseMock.query.mockResolvedValueOnce([
            []
        ]);

        const response = await request(app)
            .get("/TeacherDashboardData")
            .set(
                "Authorization",
                `Bearer ${teacherToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: []
        });
    });

    test("GET /TeacherDashboardData returns 500 when database query fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        promiseMock.query.mockRejectedValueOnce(
            new Error("Database Error")
        );

        const response = await request(app)
            .get("/TeacherDashboardData")
            .set(
                "Authorization",
                `Bearer ${teacherToken}`
            );

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Unable to load teacher dashboard.",
            result: []
        });

        consoleErrorSpy.mockRestore();
    });

    test("GET /TeacherDashboardData retrieves question and submission counts", async () => {
        const mockModules = [
            {
                module_id: 5,
                module_name: "JavaScript Basics",
                description: "A quiz",
                teacher_id: 20,
                question_count: 12,
                submission_count: 9
            }
        ];

        promiseMock.query.mockResolvedValueOnce([
            mockModules
        ]);

        const response = await request(app)
            .get("/TeacherDashboardData")
            .set(
                "Authorization",
                `Bearer ${teacherToken}`
            );

        expect(response.statusCode).toBe(200);
        expect(response.body.result[0].question_count)
            .toBe(12);
        expect(
            response.body.result[0].submission_count
        ).toBe(9);
    });
});
