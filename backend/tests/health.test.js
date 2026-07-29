const request = require("supertest");
const app = require("../app");

describe("Backend health check", () => {
    test("GET /health returns a successful response", async () => {
        const response = await request(app).get("/health");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            message: "Learning Quest backend is running",
        });
    });
});