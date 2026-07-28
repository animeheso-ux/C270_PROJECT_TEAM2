import { useEffect, useState } from "react";
import "./LoginSign.css";

import {BookOpen,Brain,Trophy,BarChart3,} from "lucide-react";

function LoginPage({ToQuizPage,ToSignup,ToTeacher,ToAdmin,ToForgotPassword,}) {
    const [loginIdentifier, setLoginIdentifier] = useState("");
    const [password, setPassword] =useState("");
    const [showPassword, setShowPassword] =useState(false);
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerMessage] =useState("");
    const [isSubmitting, setIsSubmitting] =useState(false);
    const handleRedirect = (role) => {
        if (role === "admin") {ToAdmin();
            return;
        }
        if (role === "teacher") {ToTeacher();
            return;
        }
        ToQuizPage();
    };

    async function VerifyToken() {
        const token =localStorage.getItem("Token");
        if (!token) {return;
        }

        try {
            const response = await fetch("/GetToken",
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                        "Content-Type":"application/json",
                    },
                }
            );

            const data = await response.json();

            if (
                response.ok &&
                data.status === "success"
            ) {
                handleRedirect(data.Token.role);
            } else {
                localStorage.removeItem("Token");
            }
        } catch (error) {
            console.error(
                "Token verification failed:",
                error
            );
        }
    }

    async function Login(event) {
        event.preventDefault();

        const currentErrors = {
            loginIdentifier: "",
            password: "",
        };

        let isValid = true;

        setServerMessage("");

        if (!loginIdentifier.trim()) {
            currentErrors.loginIdentifier =
                "Username or email cannot be empty.";

            isValid = false;
        }

        setErrors(currentErrors);
        if (!isValid) {
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch("/Login", {
                method: "POST",
                headers: {"Content-Type":"application/json",},
                body: JSON.stringify({loginIdentifier: loginIdentifier.trim().toLowerCase(),password,
                }),
            });

            const data = await response.json();

            if (
                !response.ok ||
                data.status !== "success"
            ) {
                setServerMessage(
                    data.message ||
                        "Unable to log in."
                );

                return;
            }

            localStorage.setItem(
                "Token",
                data.token
            );

            handleRedirect(data.role);
        } catch (err) {
            console.error(
                "Login request failed:",
                err
            );

            setServerMessage(
                "Unable to connect to the server."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (window.location.port !== "3000") {
            return;
        }

        VerifyToken();
    }, []);

    return (
        <div className="page-container">
            <div className="login-wrapper">
                <div className="row g-0">
                    <div className="col-md-6 left-panel d-none d-md-flex flex-column justify-content-center">
                        <h2>Learning Quest</h2>

                        <h1>Master Your Modules.
                            <br />
                            One Quiz At A Time.
                        </h1>

                        <p>
                            Test your knowledge and
                            challenge yourself with our
                            engaging quizzes.
                        </p>

                        <div className="mt-4">
                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <BookOpen size={22}/>
                                </div>
                                <div>
                                    <h5>
                                        Practice
                                        Quizzes
                                    </h5>

                                    <small>
                                        Revise every
                                        module with
                                        unlimited
                                        practice.
                                    </small>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <BarChart3 size={22}/>
                                </div>

                                <div>
                                    <h5>
                                        Track Progress
                                    </h5>

                                    <small>
                                        View your scores
                                        and improve over
                                        time.
                                    </small>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <Brain size={22}/>
                                </div>

                                <div>
                                    <h5>
                                        Learn Smart
                                    </h5>

                                    <small>
                                        Focus on weak
                                        topics and master
                                        them quickly.
                                    </small>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <Trophy size={22}/>
                                </div>

                                <div>
                                    <h5>
                                        Achieve Better
                                        Results
                                    </h5>

                                    <small>
                                        Build confidence
                                        before every
                                        assessment.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 bg-white login-card">
                        <h1>Welcome back!</h1>
                        <p className="text-muted mb-4">
                            Sign in to continue to Learning Quest.
                        </p>

                        {serverMessage && (
                            <div
                                className="alert alert-danger" role="alert">{serverMessage}
                            </div>
                        )}

                        <form
                            onSubmit={Login} noValidate>
                            <div className="mb-3">
                                <label htmlFor="LoginIdentifier" className="form-label">Username or Email</label>
                                <input id="loginIdentifier" type="text" className="form-control" placeholder="Enter your usernmae or email" value={loginIdentifier} onChange={(event) =>setLoginIdentifier(event.target.value)}autoComplete="username"/>

                                {errors.email && (
                                    <div className="error-message">{errors.email}</div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="Password" className="form-label">Password</label>

                                <div className="input-group">
                                    <input id="Password" type={showPassword? "text": "password"}
                                        className="form-control" placeholder="Enter your password" value={password}
                                        onChange={(event) =>setPassword(event.target.value)}autoComplete="current-password"/>

                                    <button
                                        type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword((current) =>!current)}>
                                        {showPassword? "Hide": "Show"}
                                    </button>
                                </div>

                                {errors.password && (
                                    <div className="error-message">
                                        {
                                            errors.password
                                        }
                                    </div>
                                )}
                            </div>

                            <div className="auth-login-options">
                                <label className="auth-remember">
                                    <input type="checkbox" id="rememberMe"/>
                                    <span>Remember me</span>
                                </label>

                                <button
                                    type="button" className="auth-forgot-button" onClick={ToForgotPassword}>Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit" className="login-btn w-100" disabled={ isSubmitting}>{isSubmitting? "Signing in...": "Sign in"}
                            </button>
                        </form>

                        <p className="signup-line">
                            Don't have an account?{" "}
                            <button type="button" className="signup-link auth-text-button" onClick={ToSignup}> Create account
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;