const request = require("supertest");

const app = require("../app");
const { database } = require("../database");

describe("Get Users API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        database.query = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("GET /GetUsers successfully retrieves non-admin users", async () => {
        const mockUsers = [
            {
                id: 2,
                username: "student1",
                email: "student1@myrp.edu.sg",
                role: "student",
            },
            {
                id: 3,
                username: "teacher1",
                email: "teacher1@rp.edu.sg",
                role: "teacher",
            },
        ];

        database.query.mockImplementation(
            (sql, callback) => {
                callback(null, mockUsers);
            }
        );

        const response = await request(app)
            .get("/GetUsers");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: mockUsers,
        });

        expect(database.query).toHaveBeenCalledTimes(1);

        const sql = database.query.mock.calls[0][0];

        expect(sql).toContain(
            "SELECT id, username, email, role FROM users"
        );

        expect(sql).toContain(
            "role != 'admin'"
        );
    });

    test("GET /GetUsers returns an empty array when no non-admin users exist", async () => {
        database.query.mockImplementation(
            (sql, callback) => {
                callback(null, []);
            }
        );

        const response = await request(app)
            .get("/GetUsers");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: [],
        });

        expect(database.query).toHaveBeenCalledTimes(1);
    });

    test("GET /GetUsers returns 500 when the database query fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        database.query.mockImplementation(
            (sql, callback) => {
                callback(
                    new Error("Database query failed")
                );
            }
        );

        const response = await request(app)
            .get("/GetUsers");

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message: "Unable to retrieve users.",
        });

        expect(database.query).toHaveBeenCalledTimes(1);

        consoleErrorSpy.mockRestore();
    });

    test("GET /GetUsers does not return admin accounts", async () => {
        const mockUsers = [
            {
                id: 2,
                username: "student1",
                email: "student1@myrp.edu.sg",
                role: "student",
            },
        ];

        database.query.mockImplementation(
            (sql, callback) => {
                callback(null, mockUsers);
            }
        );

        const response = await request(app)
            .get("/GetUsers");

        expect(response.statusCode).toBe(200);

        expect(
            response.body.result.some(
                (user) => user.role === "admin"
            )
        ).toBe(false);
    });
});