const mockSendMail = jest.fn();

jest.mock("nodemailer", () => ({
    createTransport: jest.fn(() => ({
        verify: jest.fn(),
        sendMail: mockSendMail,
    })),
}));

const request = require("supertest");
const app = require("../app");
const { database } = require("../database");

describe("Create account API", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Replace the disabled test database query with a Jest mock
        database.query = jest.fn();

        mockSendMail.mockResolvedValue({
            messageId: "test-email-id",
        });
    });

    test("POST /CreateAccount returns 400 when required fields are missing", async () => {
        const response = await request(app)
            .post("/CreateAccount")
            .send({});

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "Username, email and password are required.",
        });

        expect(database.query).not.toHaveBeenCalled();
    });

    test("POST /CreateAccount returns 400 when password is too short", async () => {
        const response = await request(app)
            .post("/CreateAccount")
            .send({
                username: "testuser",
                email: "testuser@myrp.edu.sg",
                password: "1234567",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "Password must contain at least 8 characters.",
        });

        expect(database.query).not.toHaveBeenCalled();
    });

    test("POST /CreateAccount returns 409 when username already exists", async () => {
        database.query.mockImplementationOnce(
            (sql, values, callback) => {
                callback(null, [
                    {
                        id: 1,
                        username: "existinguser",
                        email: "someone@myrp.edu.sg",
                    },
                ]);
            }
        );

        const response = await request(app)
            .post("/CreateAccount")
            .send({
                username: "existinguser",
                email: "newuser@myrp.edu.sg",
                password: "password123",
            });

        expect(response.statusCode).toBe(409);

        expect(response.body).toEqual({
            status: "error",
            message: "This username is already taken.",
        });
    });

    test("POST /CreateAccount returns 409 when email already exists", async () => {
        database.query.mockImplementationOnce(
            (sql, values, callback) => {
                callback(null, [
                    {
                        id: 1,
                        username: "differentuser",
                        email: "existing@myrp.edu.sg",
                    },
                ]);
            }
        );

        const response = await request(app)
            .post("/CreateAccount")
            .send({
                username: "newuser",
                email: "existing@myrp.edu.sg",
                password: "password123",
            });

        expect(response.statusCode).toBe(409);

        expect(response.body).toEqual({
            status: "error",
            message: "An account with this email already exists.",
        });
    });

    test("POST /CreateAccount successfully creates a student account", async () => {
        database.query
            .mockImplementationOnce(
                (sql, values, callback) => {
                    // No duplicate account found
                    callback(null, []);
                }
            )
            .mockImplementationOnce(
                (sql, values, callback) => {
                    // Account inserted successfully
                    callback(null, {
                        insertId: 1,
                    });
                }
            );

        const response = await request(app)
            .post("/CreateAccount")
            .send({
                username: "student1",
                email: "student1@myrp.edu.sg",
                password: "password123",
            });

        expect(response.statusCode).toBe(201);

        expect(response.body).toEqual({
            status: "success",
            message: "Account created successfully.",
        });

        // Second database call is the INSERT query
        const insertValues =
            database.query.mock.calls[1][1];

        expect(insertValues[0]).toBe("student1");
        expect(insertValues[1]).toBe(
            "student1@myrp.edu.sg"
        );

        // Password should be hashed, not stored directly
        expect(insertValues[2]).not.toBe(
            "password123"
        );

        expect(insertValues[3]).toBe("student");

        expect(mockSendMail).toHaveBeenCalledTimes(1);
    });

    test("POST /CreateAccount assigns the teacher role", async () => {
        database.query
            .mockImplementationOnce(
                (sql, values, callback) => {
                    callback(null, []);
                }
            )
            .mockImplementationOnce(
                (sql, values, callback) => {
                    callback(null, {
                        insertId: 2,
                    });
                }
            );

        const response = await request(app)
            .post("/CreateAccount")
            .send({
                username: "teacher1",
                email: "teacher1@rp.edu.sg",
                password: "password123",
            });

        expect(response.statusCode).toBe(201);

        const insertValues =
            database.query.mock.calls[1][1];

        expect(insertValues[3]).toBe("teacher");
    });

    test("POST /CreateAccount assigns the admin role", async () => {
        database.query
            .mockImplementationOnce(
                (sql, values, callback) => {
                    callback(null, []);
                }
            )
            .mockImplementationOnce(
                (sql, values, callback) => {
                    callback(null, {
                        insertId: 3,
                    });
                }
            );

        const response = await request(app)
            .post("/CreateAccount")
            .send({
                username: "admin1",
                email: "admin1@admin.edu.sg",
                password: "password123",
            });

        expect(response.statusCode).toBe(201);

        const insertValues =
            database.query.mock.calls[1][1];

        expect(insertValues[3]).toBe("admin");
    });

    test("POST /CreateAccount returns 500 when account checking fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        database.query.mockImplementationOnce(
            (sql, values, callback) => {
                callback(
                    new Error("Database check failed")
                );
            }
        );

        const response = await request(app)
            .post("/CreateAccount")
            .send({
                username: "testuser",
                email: "testuser@myrp.edu.sg",
                password: "password123",
            });

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message: "Unable to check the account.",
        });

        consoleErrorSpy.mockRestore();
    });

    test("POST /CreateAccount returns 500 when inserting the account fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        database.query
            .mockImplementationOnce(
                (sql, values, callback) => {
                    callback(null, []);
                }
            )
            .mockImplementationOnce(
                (sql, values, callback) => {
                    callback(
                        new Error("Insert failed")
                    );
                }
            );

        const response = await request(app)
            .post("/CreateAccount")
            .send({
                username: "testuser",
                email: "testuser@myrp.edu.sg",
                password: "password123",
            });

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message: "Unable to create the account.",
        });

        consoleErrorSpy.mockRestore();
    });

    test("Account is still created when the welcome email fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        mockSendMail.mockRejectedValueOnce(
            new Error("Email failed")
        );

        database.query
            .mockImplementationOnce(
                (sql, values, callback) => {
                    callback(null, []);
                }
            )
            .mockImplementationOnce(
                (sql, values, callback) => {
                    callback(null, {
                        insertId: 4,
                    });
                }
            );

        const response = await request(app)
            .post("/CreateAccount")
            .send({
                username: "student2",
                email: "student2@myrp.edu.sg",
                password: "password123",
            });

        expect(response.statusCode).toBe(201);

        expect(response.body).toEqual({
            status: "success",
            message: "Account created successfully.",
        });

        consoleErrorSpy.mockRestore();
    });
});