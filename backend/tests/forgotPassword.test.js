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

describe("Forgot password API", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        database.query = jest.fn();

        mockSendMail.mockResolvedValue({
            messageId: "test-reset-email",
        });
    });

    test("POST /ForgotPassword returns 400 when email is missing", async () => {
        const response = await request(app)
            .post("/ForgotPassword")
            .send({});

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            status: "error",
            message: "Please enter your registered email.",
        });

        expect(database.query).not.toHaveBeenCalled();
        expect(mockSendMail).not.toHaveBeenCalled();
    });

    test("POST /ForgotPassword returns 404 for an unregistered email", async () => {
        database.query
            .mockImplementationOnce(
                (sql, values, callback) => {
                    // No matching user
                    callback(null, []);
                }
            )
            .mockImplementationOnce(
                (sql, values, callback) => {
                    // Audit log insertion
                    callback(null);
                }
            );

        const response = await request(app)
            .post("/ForgotPassword")
            .send({
                email: "unknown@myrp.edu.sg",
            });

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            status: "error",
            message:
                "No account was found with this email.",
        });

        expect(mockSendMail).not.toHaveBeenCalled();
    });

    test("POST /ForgotPassword sends a reset code successfully", async () => {
        database.query
            .mockImplementationOnce(
                (sql, values, callback) => {
                    // Matching user found
                    callback(null, [
                        {
                            id: 1,
                            username: "student1",
                            email: "student1@myrp.edu.sg",
                        },
                    ]);
                }
            )
            .mockImplementationOnce(
                (sql, values, callback) => {
                    // Audit log insertion
                    callback(null);
                }
            );

        const response = await request(app)
            .post("/ForgotPassword")
            .send({
                email: "student1@myrp.edu.sg",
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "success",
            message:
                "A reset code has been sent to your email.",
        });

        expect(mockSendMail).toHaveBeenCalledTimes(1);

        const emailDetails =
            mockSendMail.mock.calls[0][0];

        expect(emailDetails.to).toBe(
            "student1@myrp.edu.sg"
        );

        expect(emailDetails.subject).toBe(
            "Learning Quest Password Reset Code"
        );

        expect(emailDetails.text).toContain(
            "Hello student1"
        );

        expect(emailDetails.text).toMatch(
            /\b\d{6}\b/
        );
    });

    test("POST /ForgotPassword trims and lowercases the email", async () => {
        database.query
            .mockImplementationOnce(
                (sql, values, callback) => {
                    callback(null, [
                        {
                            id: 2,
                            username: "teacher1",
                            email: "teacher1@rp.edu.sg",
                        },
                    ]);
                }
            )
            .mockImplementationOnce(
                (sql, values, callback) => {
                    callback(null);
                }
            );

        const response = await request(app)
            .post("/ForgotPassword")
            .send({
                email: "  TEACHER1@RP.EDU.SG  ",
            });

        expect(response.statusCode).toBe(200);

        const searchValues =
            database.query.mock.calls[0][1];

        expect(searchValues).toEqual([
            "teacher1@rp.edu.sg",
        ]);

        expect(mockSendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: "teacher1@rp.edu.sg",
            })
        );
    });

    test("POST /ForgotPassword returns 500 when the database query fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        database.query.mockImplementationOnce(
            (sql, values, callback) => {
                callback(
                    new Error("Database unavailable")
                );
            }
        );

        const response = await request(app)
            .post("/ForgotPassword")
            .send({
                email: "student1@myrp.edu.sg",
            });

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message:
                "Unable to process the password reset.",
        });

        expect(mockSendMail).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    test("POST /ForgotPassword returns 500 when the reset email cannot be sent", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        database.query.mockImplementationOnce(
            (sql, values, callback) => {
                callback(null, [
                    {
                        id: 1,
                        username: "student1",
                        email: "student1@myrp.edu.sg",
                    },
                ]);
            }
        );

        mockSendMail.mockRejectedValueOnce(
            new Error("Email service unavailable")
        );

        const response = await request(app)
            .post("/ForgotPassword")
            .send({
                email: "student1@myrp.edu.sg",
            });

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            status: "error",
            message:
                "The account was found, but the reset email could not be sent.",
        });

        expect(mockSendMail).toHaveBeenCalledTimes(1);

        consoleErrorSpy.mockRestore();
    });
});