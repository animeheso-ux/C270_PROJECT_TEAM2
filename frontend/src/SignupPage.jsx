import { useState } from "react"
import "./SignupPage.css"
import "bootstrap/dist/css/bootstrap.min.css";
import validator from "validator"
import { BookOpen, Brain, Trophy, BarChart3 } from "lucide-react"

import { apiFetch } from "./api"



function SignUpPage({ ToLogin }) {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState({})

    async function CreateAccount() {
        let currentErrors = { username: "", email: "", password: "", confirmPassword: "", agreeTerms: "" }
        let isValid = true

        if (!username.trim()) {
            currentErrors.username = "Username cannot be empty."
            isValid = false
        }

        if (!validator.isEmail(email)) {
            currentErrors.email = "Please enter a valid email address."
            isValid = false
        }

        if (!password) {
            currentErrors.password = "Password cannot be empty."
            isValid = false
        } else if (password.length < 8) {
            currentErrors.password = "Password must be at least 8 characters."
            isValid = false
        }

        if (password !== confirmPassword) {
            currentErrors.confirmPassword = "Passwords do not match."
            isValid = false
        }

        if (!agreeTerms) {
            currentErrors.agreeTerms = "You must agree to the Terms of Service and Privacy Policy."
            isValid = false
        }

        setErrors(currentErrors)
        if (!isValid) return

        try {
            const response = await apiFetch("/CreateAccount", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, username: username, password: password })
            })

            const data = await response.json()
            alert(data.message)

            if (data.message == "success") {
                ToLogin()
            }
        } catch (err) {
            console.error("Signup request failed:", err)
            alert("An error occurred during signup.")
        }
    }


    return (
        <div className="page-container">
            <div className="login-wrapper">
                <div className="row g-0 ">

                    {/* Left Panel */}
                    <div className="col-md-6 left-panel d-none d-md-flex flex-column justify-content-center">
                        <h2>Learning Quest</h2>

                        <h1>
                            Master Your Modules.
                            <br />
                            One Quiz At A Time.
                        </h1>

                        <p>Test your knowledge and challenge yourself with our engaging quizzes.
                            Sign in to access a world of learning and fun!
                        </p>

                        <div className="mt-4">
                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <BookOpen size={22} />
                                </div>

                                <div>
                                    <h5>Practice Quizzes</h5><small>Revise every module with unlimited practice.</small>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <BarChart3 size={22} />
                                </div>
                                <div>
                                    <h5>Track Progress</h5>
                                    <small>View your scores and improve over time.</small>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <Brain size={22} />
                                </div>
                                <div>
                                    <h5>Learn Smart</h5>
                                    <small>Focus on weak topics and master them quickly.</small>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon me-3">
                                    <Trophy size={22} />
                                </div>
                                <div>
                                    <h5>Achieve Better Results</h5>
                                    <small>Build confidence before every exam.</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 bg-white login-card">
                        <h1>Create your account</h1>
                        <p className="text-muted mb-4 ">
                            Sign up to start your Learning Quest journey.
                        </p>

                        <form>

                            <div className="mb-3">
                                <label htmlFor="Username" className="form-label">Username</label>
                                <input id="Username" type="text" className="form-control" placeholder="devopslover" value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                {errors.username && <div className="error-message">{errors.username}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="Email" className="form-label">Email</label>
                                <input
                                    id="Email" type="email" className="form-control" placeholder="ilovedevops@gmail.com" value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="Password" className="form-label">Password</label>
                                <div className="input-group">
                                    <input id="Password" type={showPassword ? "text" : "password"} className="form-control" placeholder="•••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.password && <div className="error-message">{errors.password}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="ConfirmPassword" className="form-label">Confirm Password</label>
                                <div className="input-group">
                                    <input id="ConfirmPassword" type={showConfirmPassword ? "text" : "password"} className="form-control" placeholder="•••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                            </div>

                            <div className="mb-3">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="agreeTerms"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="agreeTerms">
                                        I agree to the Terms of Service and Privacy Policy
                                    </label>
                                </div>
                                {errors.agreeTerms && <div className="error-message">{errors.agreeTerms}</div>}
                            </div>

                            <button type="button" className="login-btn w-100" onClick={CreateAccount}>Create account</button>
                        </form>


                        <p className="signup-line">
                            Already have an account?
                            <span
                                className="signup-link"
                                onClick={ToLogin}
                            >
                                Sign in
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
}


export default SignUpPage