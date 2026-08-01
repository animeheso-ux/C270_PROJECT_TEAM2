const request = require("supertest");
const jsonwebtoken = require("jsonwebtoken");

const app = require("../app");
const { database } = require("../database");

describe("Audit Log API", () => {
    const jwtSecret =
        process.env.JWT_SECRET || "YOUR_SECRET_KEY";

    beforeEach(() => {
        jest.clearAllMocks();
        database.query = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("GET /AuditLogs returns 401 when no token is provided", async () => {
        const response = await request(app)
            .get("/AuditLogs");

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "error",
            message: "Authentication token is required.",
        });

        expect(database.query).not.toHaveBeenCalled();
    });

    test("GET /AuditLogs returns 401 when token is invalid", async () => {
        const response = await request(app)
            .get("/AuditLogs")
            .set(
                "Authorization",
                "Bearer invalid-token"
            );

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Invalid or expired authentication token.",
        });

        expect(database.query).not.toHaveBeenCalled();
    });

    test("GET /AuditLogs returns 403 when a student tries to access audit logs", async () => {
        const studentToken = jsonwebtoken.sign(
            {
                id: 2,
                username: "student1",
                email: "student1@myrp.edu.sg",
                role: "student",
            },
            jwtSecret,
            {
                expiresIn: "1h",
            }
        );

        database.query.mockImplementation(
            (sql, values, callback) => {
                /*
                    Non-admin access creates an audit log.

                    createAuditLog calls:
                    database.query(sql, values, callback)
                */
                if (typeof callback === "function") {
                    callback(null, {
                        affectedRows: 1,
                    });
                }
            }
        );

        const response = await request(app)
            .get("/AuditLogs")
            .set(
                "Authorization",
                `Bearer ${studentToken}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Administrator access is required.",
        });

        expect(database.query).toHaveBeenCalledTimes(1);

        const auditCall = database.query.mock.calls[0];
        const auditSql = auditCall[0];
        const auditValues = auditCall[1];

        expect(auditSql).toContain(
            "INSERT INTO audit_logs"
        );

        expect(auditValues).toEqual(
            expect.arrayContaining([
                2,
                "student1",
                "student1@myrp.edu.sg",
                "student",
                "UNAUTHORIZED_ACCESS",
                "DENIED",
            ])
        );
    });

    test("GET /AuditLogs returns 403 when a teacher tries to access audit logs", async () => {
        const teacherToken = jsonwebtoken.sign(
            {
                id: 3,
                username: "teacher1",
                email: "teacher1@rp.edu.sg",
                role: "teacher",
            },
            jwtSecret,
            {
                expiresIn: "1h",
            }
        );

        database.query.mockImplementation(
            (sql, values, callback) => {
                if (typeof callback === "function") {
                    callback(null, {
                        affectedRows: 1,
                    });
                }
            }
        );

        const response = await request(app)
            .get("/AuditLogs")
            .set(
                "Authorization",
                `Bearer ${teacherToken}`
            );

        expect(response.statusCode).toBe(403);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Administrator access is required.",
        });

        expect(database.query).toHaveBeenCalledTimes(1);
    });

    test("GET /AuditLogs allows an admin to retrieve audit logs", async () => {
        const adminToken = jsonwebtoken.sign(
            {
                id: 1,
                username: "admin1",
                email: "admin1@admin.edu.sg",
                role: "admin",
            },
            jwtSecret,
            {
                expiresIn: "1h",
            }
        );

        const mockAuditLogs = [
            {
                id: 10,
                user_id: 2,
                username: "student1",
                email: "student1@myrp.edu.sg",
                role: "student",
                action: "LOGIN_SUCCESS",
                description:
                    "student1 logged in successfully.",
                status: "SUCCESS",
                ip_address: "::1",
                created_at:
                    "2026-07-28T10:00:00.000Z",
            },
            {
                id: 9,
                user_id: 3,
                username: "teacher1",
                email: "teacher1@rp.edu.sg",
                role: "teacher",
                action: "LOGIN_FAILURE",
                description:
                    "Incorrect password entered for teacher1.",
                status: "FAILURE",
                ip_address: "::1",
                created_at:
                    "2026-07-28T09:00:00.000Z",
            },
        ];

        database.query.mockImplementation(
            (sql, callback) => {
                callback(null, mockAuditLogs);
            }
        );

        const response = await request(app)
            .get("/AuditLogs")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: mockAuditLogs,
        });

        expect(database.query).toHaveBeenCalledTimes(1);

        const selectSql =
            database.query.mock.calls[0][0];

        expect(selectSql).toContain(
            "FROM audit_logs"
        );

        expect(selectSql).toContain(
            "ORDER BY created_at DESC"
        );
    });

    test("GET /AuditLogs returns an empty array when there are no audit logs", async () => {
        const adminToken = jsonwebtoken.sign(
            {
                id: 1,
                username: "admin1",
                email: "admin1@admin.edu.sg",
                role: "admin",
            },
            jwtSecret,
            {
                expiresIn: "1h",
            }
        );

        database.query.mockImplementation(
            (sql, callback) => {
                callback(null, []);
            }
        );

        const response = await request(app)
            .get("/AuditLogs")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            );

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: [],
        });
    });

    test("GET /AuditLogs returns 500 when the database query fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const adminToken = jsonwebtoken.sign(
            {
                id: 1,
                username: "admin1",
                email: "admin1@admin.edu.sg",
                role: "admin",
            },
            jwtSecret,
            {
                expiresIn: "1h",
            }
        );

        database.query.mockImplementation(
            (sql, callback) => {
                callback(
                    new Error(
                        "Unable to retrieve audit logs"
                    )
                );
            }
        );

        const response = await request(app)
            .get("/AuditLogs")
            .set(
                "Authorization",
                `Bearer ${adminToken}`
            );

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Unable to retrieve audit logs.",
        });

        expect(database.query).toHaveBeenCalledTimes(1);

        consoleErrorSpy.mockRestore();
    });

    test("GET /AuditLogs returns 401 when the token has expired", async () => {
        const expiredToken = jsonwebtoken.sign(
            {
                id: 1,
                username: "admin1",
                email: "admin1@admin.edu.sg",
                role: "admin",
            },
            jwtSecret,
            {
                expiresIn: -1,
            }
        );

        const response = await request(app)
            .get("/AuditLogs")
            .set(
                "Authorization",
                `Bearer ${expiredToken}`
            );

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Invalid or expired authentication token.",
        });

        expect(database.query).not.toHaveBeenCalled();
    });
});