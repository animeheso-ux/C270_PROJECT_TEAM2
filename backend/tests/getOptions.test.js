const request = require("supertest");

const app = require("../app");
const { database } = require("../database");

describe("Get Options API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        database.query = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("GET /GetOptions/:id successfully returns options for one question", async () => {
        const mockOptions = [
            {
                option_id: 1,
                question_id: 5,
                option_text: "HTML"
            },
            {
                option_id: 2,
                question_id: 5,
                option_text: "CSS"
            },
            {
                option_id: 3,
                question_id: 5,
                option_text: "JavaScript"
            },
            {
                option_id: 4,
                question_id: 5,
                option_text: "Python"
            }
        ];

        database.query.mockImplementation(
            (sql, values, callback) => {
                callback(null, mockOptions);
            }
        );

        const response = await request(app)
            .get("/GetOptions/5");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: mockOptions
        });

        expect(database.query).toHaveBeenCalledTimes(1);

        const [sql, values] = database.query.mock.calls[0];

        expect(sql).toContain("FROM options");
        expect(sql).toContain("WHERE question_id = ?");
        expect(values).toEqual(["5"]);
    });

    test("GET /GetOptions/:id returns an empty array when no options exist", async () => {
        database.query.mockImplementation(
            (sql, values, callback) => {
                callback(null, []);
            }
        );

        const response = await request(app)
            .get("/GetOptions/100");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: []
        });

        expect(database.query).toHaveBeenCalledTimes(1);
    });

    test("GET /GetOptions/:id returns 500 when database query fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        database.query.mockImplementation(
            (sql, values, callback) => {
                callback(new Error("Database Error"));
            }
        );

        const response = await request(app)
            .get("/GetOptions/5");

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message: "Unable to retrieve options.",
            result: []
        });

        consoleErrorSpy.mockRestore();
    });

    test("GET /GetOptions/:id passes the correct question ID to the query", async () => {
        database.query.mockImplementation(
            (sql, values, callback) => {
                callback(null, []);
            }
        );

        await request(app)
            .get("/GetOptions/25");

        expect(database.query.mock.calls[0][1]).toEqual(["25"]);
    });
});