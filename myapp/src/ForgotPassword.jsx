import { useState } from "react";

import {
    ArrowLeft,
    ArrowRight,
    KeyRound,
    Mail,
} from "lucide-react";

import "./AuthStatus.css";

function ForgotPassword({
    ToLogin,
    ToPasswordChanged,
}) {
    const [step, setStep] =
        useState("request");

    const [email, setEmail] =
        useState("");

    const [resetCode, setResetCode] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [messageType, setMessageType] =
        useState("");

    const [demoCode, setDemoCode] =
        useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    function showError(text) {
        setMessageType("error");
        setMessage(text);
    }

    function showSuccess(text) {
        setMessageType("success");
        setMessage(text);
    }

    async function requestResetCode(event) {
        event.preventDefault();

        setMessage("");
        setDemoCode("");

        if (!email.trim()) {
            showError(
                "Please enter your registered email."
            );

            return;
        }

        if (!email.includes("@")) {
            showError(
                "Please enter a valid email address."
            );

            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch(
                "/ForgotPassword",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        email: email
                            .trim()
                            .toLowerCase(),
                    }),
                }
            );

            const data = await response.json();

            if (
                !response.ok ||
                data.status !== "success"
            ) {
                showError(
                    data.message ||
                        "Unable to request a reset code."
                );

                return;
            }

            setDemoCode(data.demoCode || "");

            showSuccess(data.message);

            setStep("reset");
        } catch (error) {
            console.error(
                "Forgot password request failed:",
                error
            );

            showError(
                "Unable to connect to the server."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function resetPassword(event) {
        event.preventDefault();

        setMessage("");

        if (!resetCode.trim()) {
            showError(
                "Please enter the six-digit reset code."
            );

            return;
        }

        if (resetCode.trim().length !== 6) {
            showError(
                "The reset code must contain 6 digits."
            );

            return;
        }

        if (!newPassword) {
            showError(
                "Please enter your new password."
            );

            return;
        }

        if (newPassword.length < 8) {
            showError(
                "The new password must contain at least 8 characters."
            );

            return;
        }

        if (
            newPassword !== confirmPassword
        ) {
            showError(
                "The new passwords do not match."
            );

            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch(
                "/ResetPassword",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        email: email
                            .trim()
                            .toLowerCase(),

                        resetCode:
                            resetCode.trim(),

                        newPassword,
                    }),
                }
            );

            const data = await response.json();

            if (
                !response.ok ||
                data.status !== "success"
            ) {
                showError(
                    data.message ||
                        "Unable to reset the password."
                );

                return;
            }

            ToPasswordChanged();
        } catch (error) {
            console.error(
                "Password reset failed:",
                error
            );

            showError(
                "Unable to connect to the server."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="auth-status-page">
            <section className="auth-form-card">
                <button
                    type="button"
                    className="auth-back-button"
                    onClick={ToLogin}
                >
                    <ArrowLeft size={17} />
                    Back to login
                </button>

                <div className="auth-form-heading">
                    <div className="auth-status-icon auth-small-icon">
                        {step === "request" ? (
                            <Mail size={27} />
                        ) : (
                            <KeyRound size={27} />
                        )}
                    </div>

                    <p className="auth-status-label">
                        Password recovery
                    </p>

                    <h1>
                        {step === "request"
                            ? "Forgot your password?"
                            : "Create a new password"}
                    </h1>

                    <p>
                        {step === "request"
                            ? "Enter the email connected to your Learning Quest account."
                            : `Enter the reset code created for ${email}.`}
                    </p>
                </div>

                {message && (
                    <div
                        className={`auth-message ${
                            messageType ===
                            "success"
                                ? "auth-message-success"
                                : "auth-message-error"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {step === "reset" &&
                    demoCode && (
                        <div className="auth-demo-code">
                            <span>
                                Demonstration reset
                                code
                            </span>

                            <strong>
                                {demoCode}
                            </strong>

                            <small>
                                In production, this
                                code should be sent by
                                email instead of being
                                displayed.
                            </small>
                        </div>
                    )}

                {step === "request" ? (
                    <form
                        onSubmit={
                            requestResetCode
                        }
                    >
                        <div className="auth-field">
                            <label htmlFor="ResetEmail">
                                Registered email
                            </label>

                            <input
                                id="ResetEmail"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target
                                            .value
                                    )
                                }
                                autoComplete="email"
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-status-button auth-full-button"
                            disabled={
                                isSubmitting
                            }
                        >
                            {isSubmitting
                                ? "Checking email..."
                                : "Continue"}

                            {!isSubmitting && (
                                <ArrowRight
                                    size={18}
                                />
                            )}
                        </button>
                    </form>
                ) : (
                    <form
                        onSubmit={resetPassword}
                    >
                        <div className="auth-field">
                            <label htmlFor="ResetCode">
                                Six-digit reset code
                            </label>

                            <input
                                id="ResetCode"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="000000"
                                value={resetCode}
                                onChange={(event) =>
                                    setResetCode(
                                        event.target
                                            .value.replace(
                                                /\D/g,
                                                ""
                                            )
                                    )
                                }
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="NewPassword">
                                New password
                            </label>

                            <div className="auth-password-field">
                                <input
                                    id="NewPassword"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="At least 8 characters"
                                    value={
                                        newPassword
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewPassword(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (
                                                current
                                            ) =>
                                                !current
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="ConfirmNewPassword">
                                Confirm new password
                            </label>

                            <input
                                id="ConfirmNewPassword"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter the new password again"
                                value={
                                    confirmPassword
                                }
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target
                                            .value
                                    )
                                }
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-status-button auth-full-button"
                            disabled={
                                isSubmitting
                            }
                        >
                            {isSubmitting
                                ? "Updating password..."
                                : "Reset password"}

                            {!isSubmitting && (
                                <ArrowRight
                                    size={18}
                                />
                            )}
                        </button>

                        <button
                            type="button"
                            className="auth-secondary-button"
                            onClick={() => {
                                setStep(
                                    "request"
                                );

                                setMessage("");
                                setResetCode("");
                                setDemoCode("");
                            }}
                        >
                            Request another code
                        </button>
                    </form>
                )}
            </section>
        </main>
    );
}

export default ForgotPassword;