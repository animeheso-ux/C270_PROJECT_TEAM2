const request = require("supertest");

const app = require("../app");
const { database } = require("../database");

describe("Get Topics API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        database.query = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("GET /GetTopics successfully returns all modules", async () => {
        const mockModules = [
            {
                module_id: 1,
                module_name: "Java",
                description: "Java Quiz"
            },
            {
                module_id: 2,
                module_name: "Python",
                description: "Python Quiz"
            }
        ];

        database.query.mockImplementation((sql, callback) => {
            callback(null, mockModules);
        });

        const response = await request(app)
            .get("/GetTopics");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: mockModules
        });

        expect(database.query).toHaveBeenCalledTimes(1);

        expect(database.query.mock.calls[0][0]).toContain(
            "SELECT *"
        );

        expect(database.query.mock.calls[0][0]).toContain(
            "FROM modules"
        );
    });

    test("GET /GetTopics returns an empty array when there are no modules", async () => {
        database.query.mockImplementation((sql, callback) => {
            callback(null, []);
        });

        const response = await request(app)
            .get("/GetTopics");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: []
        });
    });

    test("GET /GetTopics returns 500 when database query fails", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});

        database.query.mockImplementation((sql, callback) => {
            callback(new Error("Database Error"));
        });

        const response = await request(app)
            .get("/GetTopics");

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message: "Unable to retrieve modules.",
            result: []
        });

        console.error.mockRestore();
    });

    test("GET /GetTopics executes only one database query", async () => {
        database.query.mockImplementation((sql, callback) => {
            callback(null, []);
        });

        await request(app).get("/GetTopics");

        expect(database.query).toHaveBeenCalledTimes(1);
    });
});