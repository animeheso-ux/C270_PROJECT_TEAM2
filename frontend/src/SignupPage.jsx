import { useState } from "react";
import "./SignupPage.css";
import "bootstrap/dist/css/bootstrap.min.css";
import validator from "validator";

import {BookOpen,Brain,Trophy,BarChart3,} from "lucide-react";

function SignUpPage({ToLogin, ToRegisterSuccess,}) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] =useState("");
    const [confirmPassword,setConfirmPassword,] = useState("");
    const [agreeTerms, setAgreeTerms] =useState(false);
    const [showPassword, setShowPassword] =useState(false);
    const [showConfirmPassword,setShowConfirmPassword, ] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerMessage] =useState("");
    const [isSubmitting, setIsSubmitting] =useState(false);

    async function CreateAccount(event) {
        event.preventDefault();

        const currentErrors = {username: "",email: "",password: "",confirmPassword: "",agreeTerms: "",};
        let isValid = true;

        setServerMessage("");

        if (!username.trim()) {
            currentErrors.username =
                "Username cannot be empty.";

            isValid = false;
        } else if (username.trim().length < 3) {
            currentErrors.username =
                "Username must contain at least 3 characters.";

            isValid = false;
        }

        if (!email.trim()) {
            currentErrors.email =
                "Email cannot be empty.";

            isValid = false;
        } else if (!validator.isEmail(email)) {
            currentErrors.email =
                "Please enter a valid email address.";

            isValid = false;
        }

        if (!password) {
            currentErrors.password =
                "Password cannot be empty.";

            isValid = false;
        } else if (password.length < 8) {
            currentErrors.password =
                "Password must be at least 8 characters.";

            isValid = false;
        }

        if (!confirmPassword) {
            currentErrors.confirmPassword =
                "Please confirm your password.";

            isValid = false;
        } else if (
            password !== confirmPassword
        ) {
            currentErrors.confirmPassword =
                "Passwords do not match.";

            isValid = false;
        }

        if (!agreeTerms) {
            currentErrors.agreeTerms =
                "You must agree to the Terms of Service and Privacy Policy.";

            isValid = false;
        }

        setErrors(currentErrors);

        if (!isValid) {
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch("/CreateAccount",
                {
                    method: "POST", headers: { "Content-Type":"application/json",},
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        username:username.trim(),
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (
                !response.ok || data.status !== "success"
            ) {
                setServerMessage(
                    data.message ||
                        "Unable to create account."
                );

                return;
            }

            ToRegisterSuccess();
        } catch (err) {
            console.error("Signup request failed:",err);

            setServerMessage("Unable to connect to the server.");

        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="page-container">
            <div className="login-wrapper">
                <div className="row g-0">
                    <div className="col-md-6 left-panel d-none d-md-flex flex-column justify-content-center">
                        <h2>Learning Quest</h2>

                        <h1>
                            Master Your Modules.
                            <br />
                            One Quiz At A Time.
                        </h1>

                        <p>Test your knowledge and challenge yourself with engaging quizzes.</p>

                        <div className="mt-4">
                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <BookOpen size={22}/>
                                </div>

                                <div>
                                    <h5>PracticeQuizzes</h5>
                                    <small> Revise every module with unlimited practice.</small>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <BarChart3 size={22}/>
                                </div>

                                <div>
                                    <h5>Track Progress</h5>
                                    <small>View your scores and improve over time.</small>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <Brain size={22}/>
                                </div>

                                <div>
                                    <h5>Learn Smart</h5>

                                    <small>Focus on weak topics and master them quickly.</small>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <Trophy size={22}/>
                                </div>

                                <div>
                                    <h5>Achieve BetterResults</h5>
                                    <small>Build confidence before everyassessment.</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 bg-white login-card">
                        <h1>Create your account</h1>

                        <p className="text-muted mb-4">Sign up to begin your Learning Quest journey.</p>

                        {serverMessage && (
                            <div
                                className="alert alert-danger"role="alert">{serverMessage}
                            </div>
                        )}

                        <form
                            onSubmit={CreateAccount} noValidate>
                            <div className="mb-3">
                                <label htmlFor="Username" className="form-label">Username</label>

                                <input id="Username"type="text" className="form-control" placeholder="Enter a username" value={username}
                                    onChange={(event) =>setUsername(event.target.value)}autoComplete="username"/>

                                {errors.username && (
                                    <div className="error-message">
                                        {
                                            errors.username
                                        }
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="Email" className="form-label">Email</label>

                                <input id="Email" type="email" className="form-control" placeholder="Enter your email" value={email}
                                    onChange={(event) =>setEmail(event.target.value)}autoComplete="email"/>

                                {errors.email && (
                                    <div className="error-message">
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="Password" className="form-label">Password</label>

                                <div className="input-group">
                                    <input id="Password" type={showPassword? "text": "password"} className="form-control" placeholder="At least 8 characters" value={password}
                                        onChange={(event) =>setPassword(event.target.value)}autoComplete="new-password"/>

                                    <button
                                        type="button" className="btn btn-outline-secondary" onClick={() =>setShowPassword((current) =>!current)}>{showPassword? "Hide": "Show"}
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

                            <div className="mb-3">
                                <label htmlFor="ConfirmPassword" className="form-label">Confirm Password</label>

                                <div className="input-group">
                                    <input id="ConfirmPassword" type={ showConfirmPassword? "text": "password"} className="form-control" placeholder="Enter the password again" value={confirmPassword}
                                        onChange={(event) =>setConfirmPassword(event.target.value)}autoComplete="new-password"/>

                                    <button
                                        type="button" className="btn btn-outline-secondary" onClick={() =>setShowConfirmPassword((current) =>!current)}>{showConfirmPassword? "Hide": "Show"}
                                    </button>
                                </div>

                                {errors.confirmPassword && (
                                    <div className="error-message">
                                        {
                                            errors.confirmPassword
                                        }
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="agreeTerms"checked={agreeTerms}
                                        onChange={(event) =>setAgreeTerms(event.target.checked)}/>

                                    <label className="form-check-label" htmlFor="agreeTerms">I agree to the Terms of Service and Privacy Policy</label>
                                </div>

                                {errors.agreeTerms && (
                                    <div className="error-message">
                                        {
                                            errors.agreeTerms
                                        }
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit" className="login-btn w-100" disabled={ isSubmitting}>{isSubmitting? "Creating account...": "Create account"}
                            </button>
                        </form>

                        <p className="signup-line">Already have an account?{" "}
                            <button
                                type="button" className="signup-link auth-text-button" onClick={ToLogin} >Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;