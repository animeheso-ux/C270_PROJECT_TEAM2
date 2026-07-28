const request = require("supertest");

const app = require("../app");
const { database } = require("../database");

describe("Get Questions API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        database.query = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("POST /GetQuestions successfully returns questions for one module", async () => {
        const mockQuestions = [
            {
                question_id: 1,
                module_id: 2,
                question_text: "What is JavaScript?",
                answer: "A programming language"
            },
            {
                question_id: 2,
                module_id: 2,
                question_text: "What does CSS stand for?",
                answer: "Cascading Style Sheets"
            }
        ];

        database.query.mockImplementation(
            (sql, values, callback) => {
                callback(null, mockQuestions);
            }
        );

        const response = await request(app)
            .post("/GetQuestions")
            .send({
                id: 2
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: mockQuestions
        });

        expect(database.query).toHaveBeenCalledTimes(1);

        const [sql, values] = database.query.mock.calls[0];

        expect(sql).toContain("FROM questions");
        expect(sql).toContain("WHERE module_id = ?");
        expect(values).toEqual([2]);
    });

    test("POST /GetQuestions returns 400 when module ID is missing", async () => {
        const response = await request(app)
            .post("/GetQuestions")
            .send({});

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "Module ID is required.",
            result: []
        });

        expect(database.query).not.toHaveBeenCalled();
    });

    test("POST /GetQuestions returns an empty array when the module has no questions", async () => {
        database.query.mockImplementation(
            (sql, values, callback) => {
                callback(null, []);
            }
        );

        const response = await request(app)
            .post("/GetQuestions")
            .send({
                id: 50
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            result: []
        });

        expect(database.query).toHaveBeenCalledTimes(1);
    });

    test("POST /GetQuestions returns 500 when database query fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        database.query.mockImplementation(
            (sql, values, callback) => {
                callback(new Error("Database Error"));
            }
        );

        const response = await request(app)
            .post("/GetQuestions")
            .send({
                id: 2
            });

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message: "Unable to retrieve questions.",
            result: []
        });

        consoleErrorSpy.mockRestore();
    });

    test("POST /GetQuestions passes the correct module ID to the query", async () => {
        database.query.mockImplementation(
            (sql, values, callback) => {
                callback(null, []);
            }
        );

        await request(app)
            .post("/GetQuestions")
            .send({
                id: 25
            });

        expect(database.query.mock.calls[0][1]).toEqual([25]);
    });
});