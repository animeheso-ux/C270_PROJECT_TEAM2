const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../app");
const { database } = require("../database");

describe("Login API Tests", () => {
    beforeEach(() => {
        // Replace the test database query function with a Jest mock
        database.query = jest.fn();
    });

    test("should reject an empty login request", async () => {
        const response = await request(app)
            .post("/Login")
            .send({});

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Username or email and password are required.",
        });

        // Validation should fail before querying the database
        expect(database.query).not.toHaveBeenCalled();
    });

    test("should reject a login request with no password", async () => {
        const response = await request(app)
            .post("/Login")
            .send({
                loginIdentifier: "admin@test.com",
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Username or email and password are required.",
        });

        expect(database.query).not.toHaveBeenCalled();
    });

    test("should reject an unknown account", async () => {
        database.query.mockImplementation(
            (sql, values, callback) => {
                // Simulate SELECT query finding no user
                if (sql.includes("SELECT")) {
                    callback(null, []);
                    return;
                }

                // Simulate successful audit-log insertion
                if (sql.includes("INSERT INTO audit_logs")) {
                    callback(null);
                }
            }
        );

        const response = await request(app)
            .post("/Login")
            .send({
                loginIdentifier: "unknown@test.com",
                password: "Password123",
            });

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "error",
            message:
                "No account was found with that username or email.",
        });

        expect(database.query).toHaveBeenCalled();
    });

    test("should reject an incorrect password", async () => {
        const hashedPassword = await bcrypt.hash(
            "CorrectPassword123",
            10
        );

        const mockUser = {
            id: 1,
            username: "admin",
            email: "admin@test.com",
            password: hashedPassword,
            role: "admin",
        };

        database.query.mockImplementation(
            (sql, values, callback) => {
                // Return a user for the login SELECT query
                if (sql.includes("SELECT")) {
                    callback(null, [mockUser]);
                    return;
                }

                // Simulate successful audit-log insertion
                if (sql.includes("INSERT INTO audit_logs")) {
                    callback(null);
                }
            }
        );

        const response = await request(app)
            .post("/Login")
            .send({
                loginIdentifier: "admin",
                password: "WrongPassword123",
            });

        expect(response.statusCode).toBe(401);

        expect(response.body).toEqual({
            status: "error",
            message: "Incorrect password.",
        });
    });

    test("should log in successfully with correct details", async () => {
        const hashedPassword = await bcrypt.hash(
            "Password123",
            10
        );

        const mockUser = {
            id: 1,
            username: "admin",
            email: "admin@test.com",
            password: hashedPassword,
            role: "admin",
        };

        database.query.mockImplementation(
            (sql, values, callback) => {
                // Return the mock user for the login SELECT query
                if (sql.includes("SELECT")) {
                    callback(null, [mockUser]);
                    return;
                }

                // Simulate successful audit-log insertion
                if (sql.includes("INSERT INTO audit_logs")) {
                    callback(null);
                }
            }
        );

        const response = await request(app)
            .post("/Login")
            .send({
                loginIdentifier: "admin",
                password: "Password123",
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.status).toBe("success");
        expect(response.body.message).toBe(
            "Login successful."
        );

        expect(response.body.token).toBeDefined();
        expect(response.body.role).toBe("admin");
        expect(response.body.username).toBe("admin");
        expect(response.body.email).toBe(
            "admin@test.com"
        );
    });

    test("should return an error when the database query fails", async () => {
    const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

    database.query.mockImplementation((sql, values, callback) => {
        callback(new Error("Test database error"), null);
    });

    const response = await request(app)
        .post("/Login")
        .send({
            loginIdentifier: "admin",
            password: "Password123",
        });

    expect(response.statusCode).toBe(500);

    expect(response.body).toEqual({
        status: "error",
        message: "Unable to log in because of a database error.",
    });

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
});
});