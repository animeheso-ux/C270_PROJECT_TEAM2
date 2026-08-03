const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../app");

const {
    database,
    passwordResetCodes,
} = require("../database");

describe("Reset password API", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        database.query = jest.fn();

        // Prevent reset codes from one test affecting another test
        passwordResetCodes.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        passwordResetCodes.clear();
    });

    test("POST /ResetPassword returns 400 when required fields are missing", async () => {
        const response = await request(app)
            .post("/ResetPassword")
            .send({});

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Email, reset code and new password are required.",
        });

        expect(database.query).not.toHaveBeenCalled();
    });

    test("POST /ResetPassword returns 400 when the new password is too short", async () => {
        const response = await request(app)
            .post("/ResetPassword")
            .send({
                email: "student1@myrp.edu.sg",
                resetCode: "123456",
                newPassword: "1234567",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message:
                "The new password must contain at least 8 characters.",
        });

        expect(database.query).not.toHaveBeenCalled();
    });

    test("POST /ResetPassword returns 400 when no reset request exists", async () => {
        const response = await request(app)
            .post("/ResetPassword")
            .send({
                email: "student1@myrp.edu.sg",
                resetCode: "123456",
                newPassword: "newPassword123",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message:
                "No password reset request was found. Request a new code.",
        });

        expect(database.query).not.toHaveBeenCalled();
    });

    test("POST /ResetPassword returns 400 when the reset code has expired", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        passwordResetCodes.set(
            "student1@myrp.edu.sg",
            {
                code: "123456",

                // The expiry time is already in the past
                expiresAt: Date.now() - 1000,
            }
        );

        database.query.mockImplementation(
            (sql, values, callback) => {
                // Mock audit-log insertion
                if (callback) {
                    callback(null, {
                        affectedRows: 1,
                    });
                }
            }
        );

        const response = await request(app)
            .post("/ResetPassword")
            .send({
                email: "student1@myrp.edu.sg",
                resetCode: "123456",
                newPassword: "newPassword123",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message:
                "The password reset code has expired. Request a new code.",
        });

        expect(
            passwordResetCodes.has(
                "student1@myrp.edu.sg"
            )
        ).toBe(false);

        consoleErrorSpy.mockRestore();
    });

    test("POST /ResetPassword returns 400 when the reset code is incorrect", async () => {
        passwordResetCodes.set(
            "student1@myrp.edu.sg",
            {
                code: "123456",
                expiresAt:
                    Date.now() + 10 * 60 * 1000,
            }
        );

        database.query.mockImplementation(
            (sql, values, callback) => {
                // Mock audit-log insertion
                if (callback) {
                    callback(null, {
                        affectedRows: 1,
                    });
                }
            }
        );

        const response = await request(app)
            .post("/ResetPassword")
            .send({
                email: "student1@myrp.edu.sg",
                resetCode: "999999",
                newPassword: "newPassword123",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message:
                "The password reset code is incorrect.",
        });

        // The valid reset request should remain available
        expect(
            passwordResetCodes.has(
                "student1@myrp.edu.sg"
            )
        ).toBe(true);
    });

    test("POST /ResetPassword successfully updates the password", async () => {
        passwordResetCodes.set(
            "student1@myrp.edu.sg",
            {
                code: "123456",
                expiresAt:
                    Date.now() + 10 * 60 * 1000,
            }
        );

        database.query
            .mockImplementationOnce(
                (sql, values, callback) => {
                    // Password UPDATE query
                    callback(null, {
                        affectedRows: 1,
                    });
                }
            )
            .mockImplementationOnce(
                (sql, values, callback) => {
                    // Audit-log INSERT query
                    callback(null, {
                        affectedRows: 1,
                    });
                }
            );

        const response = await request(app)
            .post("/ResetPassword")
            .send({
                email:
                    "  STUDENT1@MYRP.EDU.SG  ",
                resetCode: "123456",
                newPassword: "newPassword123",
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            message:
                "Your password has been changed successfully.",
        });

        expect(database.query).toHaveBeenCalled();

        const updateCall =
            database.query.mock.calls[0];

        const updateSql = updateCall[0];
        const updateValues = updateCall[1];

        expect(updateSql).toContain(
            "UPDATE users SET password"
        );

        // The password saved in the database must be hashed
        expect(updateValues[0]).not.toBe(
            "newPassword123"
        );

        expect(updateValues[0]).toMatch(
            /^\$2[aby]\$/
        );

        // Email should be trimmed and converted to lowercase
        expect(updateValues[1]).toBe(
            "student1@myrp.edu.sg"
        );

        // Reset request should be removed after success
        expect(
            passwordResetCodes.has(
                "student1@myrp.edu.sg"
            )
        ).toBe(false);
    });

    test("POST /ResetPassword returns 500 when the database update fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        passwordResetCodes.set(
            "student1@myrp.edu.sg",
            {
                code: "123456",
                expiresAt:
                    Date.now() + 10 * 60 * 1000,
            }
        );

        database.query.mockImplementationOnce(
            (sql, values, callback) => {
                callback(
                    new Error(
                        "Password update failed"
                    )
                );
            }
        );

        const response = await request(app)
            .post("/ResetPassword")
            .send({
                email: "student1@myrp.edu.sg",
                resetCode: "123456",
                newPassword: "newPassword123",
            });

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Unable to update the password.",
        });

        // Keep the reset request so the user can try again
        expect(
            passwordResetCodes.has(
                "student1@myrp.edu.sg"
            )
        ).toBe(true);

        consoleErrorSpy.mockRestore();
    });

    test("POST /ResetPassword returns 404 when no account is updated", async () => {
        passwordResetCodes.set(
            "missing@myrp.edu.sg",
            {
                code: "123456",
                expiresAt:
                    Date.now() + 10 * 60 * 1000,
            }
        );

        database.query.mockImplementationOnce(
            (sql, values, callback) => {
                callback(null, {
                    affectedRows: 0,
                });
            }
        );

        const response = await request(app)
            .post("/ResetPassword")
            .send({
                email: "missing@myrp.edu.sg",
                resetCode: "123456",
                newPassword: "newPassword123",
            });

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            status: "error",
            message:
                "No account was found with this email.",
        });

        expect(
            passwordResetCodes.has(
                "missing@myrp.edu.sg"
            )
        ).toBe(true);
    });

    test("POST /ResetPassword returns 500 when password hashing fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        passwordResetCodes.set(
            "student1@myrp.edu.sg",
            {
                code: "123456",
                expiresAt:
                    Date.now() + 10 * 60 * 1000,
            }
        );

        jest.spyOn(bcrypt, "hash")
            .mockRejectedValueOnce(
                new Error("Hashing failed")
            );

        const response = await request(app)
            .post("/ResetPassword")
            .send({
                email: "student1@myrp.edu.sg",
                resetCode: "123456",
                newPassword: "newPassword123",
            });

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Unable to secure the new password.",
        });

        expect(database.query).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });
});