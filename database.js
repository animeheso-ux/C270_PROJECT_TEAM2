const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

require("dotenv").config();

const emailTransporter = nodemailer.createTransport({
        service : "gmail",

        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    emailTransporter.verify((error, success) => {

    if (error) {
        console.log(error);

    } else {
        console.log("Email server is ready!");

    }

});



const SALT_ROUNDS = 10;
const DatabaseRouter = express.Router();

const passwordResetCodes = new Map();

const database = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "RP738964$",
    database: process.env.DB_NAME || "learning_quest",
});

database.connect((err) => {
    if (err) {
        console.error("MYSQL CONNECTION ERROR:", err);
        return;
    }

    console.log("MYSQL CONNECTED!");
});

function createAuditLog({
    userId = null,
    username = null,
    email = null,
    role = null,
    action,
    description,
    status,
    ipAddress = null,
}) {
    const auditSql = `
        INSERT INTO audit_logs
        (
            user_id,
            username,
            email,
            role,
            action,
            description,
            status,
            ip_address
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const auditValues = [
        userId,
        username,
        email,
        role,
        action,
        description,
        status,
        ipAddress,
    ];

    database.query(
        auditSql,
        auditValues,
        (auditError) => {
            if (auditError) {
                console.error(
                    "AUDIT LOG INSERT ERROR:",
                    auditError
                );
            }
        }
    );
}

function VerifyToken(req, res, next) {
    const authorizationHeader = req.headers.authorization;

    if (
        !authorizationHeader ||
        !authorizationHeader.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            status: "error",
            message: "Authentication token is required.",
        });
    }

    const token = authorizationHeader.split(" ")[1];

    try {
        const decodedToken = jsonwebtoken.verify(
            token,
            process.env.JWT_SECRET || "YOUR_SECRET_KEY"
        );

        req.Token = decodedToken;

        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Invalid or expired authentication token.",
        });
    }
}


DatabaseRouter.get("/GetUsers", (req, res) => {
    database.query(
        "SELECT id, username, email, role FROM users WHERE role != 'admin'",
        (err, results) => {
            if (err) {
                console.error("GET USERS ERROR:", err);

                return res.status(500).json({status: "error", message: "Unable to retrieve users.",
                });
            }

            return res.json({status: "success",result: results,});
        }
    );
});

DatabaseRouter.post("/CreateAccount",async (req, res) => {
        const username =req.body.username?.trim();
        const email =req.body.email?.trim().toLowerCase();
        const password =req.body.password;

        if (!username || !email || !password) {
            return res.status(400).json({
                status: "error", message:"Username, email and password are required.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                status: "error", message: "Password must contain at least 8 characters.",
            });
        }

        let userRole = "student";

        if (
            email.endsWith("@admin.edu.sg") ||
            email.startsWith("admin.")
        ) {
            userRole = "admin";
        } else if (
            email.endsWith("@rp.edu.sg")
        ) {
            userRole = "teacher";
        } else if (
            email.endsWith("@myrp.edu.sg")
        ) {
            userRole = "student";
        }

        const checkSql = `
            SELECT id, username, email
            FROM users
            WHERE username = ?
               OR LOWER(email) = ?
            LIMIT 1
        `;

        database.query(
            checkSql,[username, email],
            async (checkError, results) => {
                if (checkError) {
                    console.error( "ACCOUNT CHECK ERROR:", checkError);

                    return res.status(500).json({
                        status: "error",
                        message:
                            "Unable to check the account.",
                    });
                }

                if (results.length > 0) {
                    const existingUser = results[0];

                    if (
                        existingUser.username ===username
                    ) {
                        return res
                            .status(409)
                            .json({
                                status: "error",
                                message:
                                    "This username is already taken.",
                            });
                    }

                    return res.status(409).json({
                        status: "error",
                        message:
                            "An account with this email already exists.",
                    });
                }

                try {
                    const hashedPassword = await bcrypt.hash(password,SALT_ROUNDS);
                    const insertSql = `
                        INSERT INTO users
                            (
                                username,
                                email,
                                password,
                                role
                            )
                        VALUES (?, ?, ?, ?)
                    `;

                    database.query(
                        insertSql,
                        [username,email,hashedPassword,userRole,],
                        async (insertError) => {
                            if (insertError) {console.error("ACCOUNT INSERT ERROR:",insertError);

                                return res.status(500).json({
                                    status: "error",
                                    message:
                                        "Unable to create the account.",
                                });
                            }

                            try {
                                await emailTransporter.sendMail({
                                    from: `"Learning Quest" <${process.env.EMAIL_USER}>`,
                                    to: email,
                                    subject: "Welcome to Learning Quest",

                                    html: `
                                        <h2>Welcome to Learning Quest!</h2>
                                        <p>Hello <b>${username}</b>,</p>

                                        <p>
                                            Your account has been created
                                            successfully.
                                        </p>

                                        <table
                                            border="1"
                                            cellpadding="8"
                                            cellspacing="0"
                                        >
                                            <tr>
                                                <td>
                                                    <b>Username</b>
                                                </td>

                                                <td>${username}</td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <b>Email</b>
                                                </td>

                                                <td>${email}</td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <b>Role</b>
                                                </td>

                                                <td>${userRole}</td>
                                            </tr>
                                        </table>

                                        <br>

                                        <p>You may now log in using your username or email.</p>

                                        <p>Thank you for joining Learning Quest.</p>
                                    `,
                                });

                                console.log(
                                    `Welcome email sent to ${email}`
                                );
                            } catch (emailError) {
                                console.error(
                                    "WELCOME EMAIL ERROR:",
                                    emailError
                                );

                                /*
                                    The account remains successfully
                                    created even if the email fails.
                                */
                            }

                            return res.status(201).json({
                                status: "success",
                                message:
                                    "Account created successfully.",
                            });
                        }
                    );
                } catch (hashError) {
                    console.error(
                        "PASSWORD HASH ERROR:",hashError);

                    return res
                        .status(500)
                        .json({
                            status: "error",
                            message:
                                "Unable to secure the password.",
                        });
                }
            }
        );
    }
);


DatabaseRouter.post("/Login", (req, res) => {
    const loginIdentifier =
        req.body.loginIdentifier?.trim();

    const password = req.body.password;

    if (!loginIdentifier || !password) {
        return res.status(400).json({
            status: "error",
            message:
                "Username or email and password are required.",
        });
    }

    const normalizedEmail =
        loginIdentifier.toLowerCase();

    const loginSql = `
        SELECT
            id,
            username,
            email,
            password,
            role
        FROM users
        WHERE username = ?
           OR LOWER(email) = ?
        LIMIT 1
    `;

    database.query(
        loginSql,
        [loginIdentifier, normalizedEmail],
        async (err, results) => {
            if (err) {
                console.error("LOGIN DATABASE ERROR:",err);

                return res.status(500).json({
                    status: "error",
                    message:
                        "Unable to log in because of a database error.",
                });
            }

            if (results.length === 0) {
                createAuditLog({
                    userId: null,
                    username: loginIdentifier,
                    email: loginIdentifier.includes("@")
                        ? normalizedEmail
                        : null,
                    role: null,
                    action: "LOGIN_FAILURE",
                    description:
                        "Login attempt made using an unknown username or email.",
                    status: "FAILURE",
                    ipAddress: req.ip,
                });

                return res.status(401).json({
                    status: "error",
                    message:
                        "No account was found with that username or email.",
                });
            }

            const user = results[0];

            try {
                const validPassword =
                    await bcrypt.compare(password,user.password);

                if (!validPassword) {
                    createAuditLog({
                        userId: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        action: "LOGIN_FAILURE",
                        description:
                            `Incorrect password entered for ${user.username}.`,
                        status: "FAILURE",
                        ipAddress: req.ip,
                    });

                    return res.status(401).json({
                        status: "error",
                        message:
                            "Incorrect password.",
                    });
                }

                const payload = {id: user.id,username: user.username,email: user.email,role: user.role,};
                const token =
                    jsonwebtoken.sign(payload,process.env.JWT_SECRET ||"YOUR_SECRET_KEY",
                        {
                            expiresIn: "1h",
                        }
                    );

                createAuditLog({
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    action: "LOGIN_SUCCESS",
                    description:
                        `${user.username} logged in successfully.`,
                    status: "SUCCESS",
                    ipAddress: req.ip,
                });

                return res.json({
                    status: "success",
                    message:
                        "Login successful.",
                    token,
                    role: user.role,
                    username: user.username,
                    email: user.email,
                });
            } catch (compareError) {
                console.error(
                    "PASSWORD COMPARISON ERROR:",compareError
                );

                return res.status(500).json({
                    status: "error",
                    message:
                        "Unable to verify the password.",
                });
            }
        }
    );
});

DatabaseRouter.post("/ForgotPassword",(req, res) => {
        console.log("FORGOT PASSWORD ROUTE HIT");

        const email =req.body.email?.trim().toLowerCase()

        if (!email) {
            return res.status(400).json({
                status: "error",
                message:
                    "Please enter your registered email.",
            });
        }

        const findUserSql = `
            SELECT id, username, email
            FROM users
            WHERE LOWER(email) = ?
            LIMIT 1
        `;

        database.query(
            findUserSql,
            [email],
            async (err, results) => {
                if (err) {
                    console.error("FORGOT PASSWORD DATABASE ERROR:",err
                    );

                    return res
                        .status(500).json({
                            status: "error",
                            message:
                                "Unable to process the password reset.",
                        });
                }

                if (results.length === 0) {
                    createAuditLog({
                        userId: null,
                        username: null,
                        email,
                        role: null,
                        action: "PASSWORD_RESET_FAILURE",
                        description:
                            "Password reset requested for an unregistered email address.",
                        status: "FAILURE",
                        ipAddress: req.ip,
                    });

                    return res.status(404).json({
                        status: "error",
                        message: "No account was found with this email.",
                    });
                }

                const user = results[0];

                const resetCode =
                    crypto.randomInt(100000,1000000).toString();

                const expiresAt =
                    Date.now() + 10 * 60 * 1000;

                passwordResetCodes.set(
                    email,
                    {
                        code: resetCode,
                        expiresAt,
                    }
                );

                try {
                    await emailTransporter.sendMail(
                        {
                            from: `"Learning Quest" <${process.env.EMAIL_USER}>`,

                            to: email,

                            subject:
                                "Learning Quest Password Reset Code",

                            text: `
                                    Hello ${user.username},

                                    Your Learning Quest password reset code is:

                                    ${resetCode}

                                    This code expires in 10 minutes.

                                    If you did not request a password reset, you may ignore this email.

                                    Learning Quest
                            `,
                        }
                    );

                    createAuditLog({
                        userId: user.id,
                        username: user.username,
                        email: user.email,
                        role: null,
                        action: "PASSWORD_RESET_REQUEST",
                        description: `${user.username} requested a password reset code.`,
                        status: "SUCCESS",
                        ipAddress: req.ip,
                    });


                    return res.json({
                        status: "success",
                        message:
                            "A reset code has been sent to your email.",
                    });
                } catch (emailError) {
                    console.error("RESET EMAIL ERROR:",emailError);
                    passwordResetCodes.delete(email);

                    return res.status(500).json({
                            status: "error",
                            message:
                                "The account was found, but the reset email could not be sent.",
                        });
                }
            }
        );
    }
);


DatabaseRouter.post("/ResetPassword", async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const resetCode = req.body.resetCode?.trim();
    const newPassword = req.body.newPassword;

    if (!email || !resetCode || !newPassword) {
        return res.status(400).json({
            status: "error",
            message:
                "Email, reset code and new password are required.",
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            status: "error",
            message:
                "The new password must contain at least 8 characters.",
        });
    }

    const savedResetRequest =
        passwordResetCodes.get(email);

    if (!savedResetRequest) {
        return res.status(400).json({
            status: "error",
            message:
                "No password reset request was found. Request a new code.",
        });
    }

    if (Date.now() > savedResetRequest.expiresAt) {
        passwordResetCodes.delete(email);

        createAuditLog({
        userId: null,
        username: null,
        email,
        role: null,
        action: "PASSWORD_RESET_FAILURE",
        description:
            "An expired password reset code was used.",
        status: "FAILURE",
        ipAddress: req.ip,
    });

    return res.status(400).json({
        status: "error",
        message:
            "The password reset code has expired. Request a new code.",
    });
}

    if (savedResetRequest.code !== resetCode) {
        createAuditLog({
        userId: null,
        username: null,
        email,
        role: null,
        action: "PASSWORD_RESET_FAILURE",
        description:
            "An incorrect password reset code was entered.",
        status: "FAILURE",
        ipAddress: req.ip,
    });

    return res.status(400).json({
        status: "error",
        message: "The password reset code is incorrect.",
    });
}

    try {
        const hashedPassword = await bcrypt.hash(newPassword,SALT_ROUNDS);

        database.query(
            "UPDATE users SET password = ? WHERE email = ?",
            [hashedPassword, email],
            (err, results) => {
                if (err) {
                    console.error("PASSWORD UPDATE ERROR:",err
                    );

                    return res.status(500).json({
                        status: "error",
                        message:
                            "Unable to update the password.",
                    });
                }

                if (results.affectedRows === 0) {
                    return res.status(404).json({
                        status: "error",
                        message:
                            "No account was found with this email.",
                    });
                }

                passwordResetCodes.delete(email);
                
                createAuditLog({
                    userId: null,
                    username: null,
                    email,
                    role: null,
                    action: "PASSWORD_RESET_SUCCESS",
                    description:
                        "Password was changed successfully through account recovery.",
                    status: "SUCCESS",
                    ipAddress: req.ip,
                });

                return res.json({
                    status: "success",
                    message:
                        "Your password has been changed successfully.",
                });
            }
        );
    } catch (hashError) {
        console.error("PASSWORD RESET HASH ERROR:", hashError);

        return res.status(500).json({
            status: "error",
            message: "Unable to secure the new password.",
        });
    }
});

DatabaseRouter.delete("/DeleteQuiz/:id",(req, res) => {
        const quizId = req.params.id;
        const sql ="DELETE FROM modules WHERE module_id = ?";

        database.query(
            sql,
            [quizId],
            (error, result) => {
                if (error) {
                    console.error(
                        "DELETE QUIZ ERROR:",
                        error
                    );

                    return res.status(500).json({
                        status: "error",
                        message:
                            "Unable to delete the quiz.",
                    });
                }

                if (
                    result.affectedRows === 0
                ) {
                    return res.status(404).json({
                        status: "error",
                        message:
                            "Quiz not found.",
                    });
                }

                return res.json({
                    status: "success",
                    message:
                        "Quiz deleted successfully.",
                });
            }
        );
    }
);

DatabaseRouter.get(
    "/AuditLogs",
    VerifyToken,
    (req, res) => {
        if (req.Token.role !== "admin") {
            createAuditLog({
                userId: req.Token.id,
                username: req.Token.username,
                email: req.Token.email,
                role: req.Token.role,
                action: "UNAUTHORIZED_ACCESS",
                description:
                    `${req.Token.username} attempted to access the admin audit logs.`,
                status: "DENIED",
                ipAddress: req.ip,
            });

            return res.status(403).json({
                status: "error",
                message:
                    "Administrator access is required.",
            });
        }

        const sql = `
            SELECT
                id,
                user_id,
                username,
                email,
                role,
                action,
                description,
                status,
                ip_address,
                created_at
            FROM audit_logs
            ORDER BY created_at DESC
        `;

        database.query(sql, (error, results) => {
            if (error) {
                console.error(
                    "GET AUDIT LOGS ERROR:",
                    error
                );

                return res.status(500).json({
                    status: "error",
                    message:
                        "Unable to retrieve audit logs.",
                });
            }

            return res.json({
                status: "success",
                result: results,
            });
        });
    }
);

module.exports = {
    DatabaseRouter,
    database,
};