import { useEffect, useState } from "react"
import "./LoginSign.css"
import { BookOpen, Brain, Trophy, BarChart3 } from "lucide-react"

import { apiFetch } from "./api"


function LoginPage({ ToQuizPage, ToSignup, ToTeacher, ToAdmin }) {
    const [username, setUsername] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState({})

    const handleRedirect = (role) => {
        console.log("THE DETECTED ROLE IS:", role);
        if (role === "admin") {
            ToAdmin();
        } else if (role === "teacher") {
            ToTeacher();
        } else {
            ToQuizPage(); // Default fallback for student
        }
    }

    async function VerifyToken() {
        const Token = localStorage.getItem("Token")

        if (!Token) {
            return
        }

        const response = await apiFetch("/GetToken", {
            headers: {
                "authorization": `Bearer ${Token}`,
                "Content-Type": "application/json"
            }

        })

        const data = await response.json()

        if (data.status == "success") {
            console.log("TOKEN VALID!")
            console.log(data.Token["role"])
            handleRedirect(data.Token["role"])
        }
    }

    async function Login() {
        let currentErrors = { username: "", password: "" };
        let isValid = true;

        if (!username.trim()) {
            currentErrors.username = "Username or Email cannot be empty.";
            isValid = false;
        }

        if (!password) {
            currentErrors.password = "Password cannot be empty.";
            isValid = false;
        } else if (password.length < 8) {
            currentErrors.password = "Password must be at least 8 characters.";
            isValid = false;
        }

        setErrors(currentErrors);
        if (!isValid) return;

        try {
            const response = await apiFetch("/Login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password })
            });

            const data = await response.json();
            alert(data.message);

            if (data.message == "success") {
                localStorage.setItem("Token", data.token)
                handleRedirect(data.role)
            }
        } catch (err) {
            console.error("Login request failed:", err);
            alert("An error occurred during login.");
        }

    }


    useEffect(() => {
        if (location.port != '3000') { return }
        VerifyToken()
    }, [])



    return (
        <div className="page-container">
            <div className="login-wrapper">
                <div className="row g-0">

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
                        <h1>Welcome back!</h1>
                        <p className="text-muted mb-4 ">
                            Sign in to continue to Learning Quest.
                        </p>

                        <form>

                            <div className="mb-3">
                                <label htmlFor="Username" className="form-label">Username / Email</label>
                                <input id="Username" type="text" className="form-control" placeholder="ilovedevops@gmail.com" value={username} onChange={(e) => setUsername(e.target.value)} />

                                {errors.username && <div className="error-message">{errors.username}</div>}
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
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="rememberMe" />
                                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                                </div>

                                <button type="button" className="btn btn-link">Forgot password?</button>
                            </div>

                            <button type="button" className="login-btn w-100" onClick={Login}>Sign in</button>
                        </form>


                        <p className="signup-line">
                            Don't have an account?
                            <span
                                className="signup-link"
                                onClick={ToSignup}
                            >
                                Create account
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default LoginPage