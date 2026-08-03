const request = require("supertest");

const app = require("../app");
const { database } = require("../database");

describe("Delete Quiz API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        database.query = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("DELETE /DeleteQuiz/:id successfully deletes a quiz", async () => {
        database.query.mockImplementation((sql, values, callback) => {
            callback(null, {
                affectedRows: 1,
            });
        });

        const response = await request(app)
            .delete("/DeleteQuiz/1");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            message: "Quiz deleted successfully.",
        });

        expect(database.query).toHaveBeenCalledTimes(1);

        expect(database.query.mock.calls[0][0]).toContain(
            "DELETE FROM modules"
        );

        expect(database.query.mock.calls[0][1]).toEqual(["1"]);
    });

    test("DELETE /DeleteQuiz/:id returns 404 when the quiz does not exist", async () => {
        database.query.mockImplementation((sql, values, callback) => {
            callback(null, {
                affectedRows: 0,
            });
        });

        const response = await request(app)
            .delete("/DeleteQuiz/999");

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            status: "error",
            message: "Quiz not found.",
        });
    });

    test("DELETE /DeleteQuiz/:id returns 500 when the database query fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        database.query.mockImplementation((sql, values, callback) => {
            callback(new Error("Database Error"));
        });

        const response = await request(app)
            .delete("/DeleteQuiz/1");

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message: "Unable to delete the quiz.",
        });

        consoleErrorSpy.mockRestore();
    });

    test("DELETE /DeleteQuiz/:id passes the correct quiz ID to the database", async () => {
        database.query.mockImplementation((sql, values, callback) => {
            callback(null, {
                affectedRows: 1,
            });
        });

        await request(app)
            .delete("/DeleteQuiz/25");

        expect(database.query.mock.calls[0][1]).toEqual(["25"]);
    });
});