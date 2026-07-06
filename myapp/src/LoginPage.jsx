import { useEffect,useState } from "react"
import "./LoginSign.css"
import {BookOpen,Brain,Trophy,BarChart3} from "lucide-react"


function LoginPage({ToQuizPage,ToSignup}) {
    const[showPassword,setShowPassword] = useState(false)


    async function VerifyToken() {
        const Token = localStorage.getItem("Token")

        if (!Token) {
            return
        }

        const response = await fetch("/GetToken",{
            headers : {
                "authorization" : `Bearer ${Token}`,
                "Content-Type" : "application/json"
            }
            
        })

        const data = await response.json()


        if (data.status == "success") {
            console.log("TOKEN VALID!")
            ToQuizPage()
        }
    }



        async function Login() {
            let currentErrors = { username: "", password: "" };
            let isValid = true;

            // 触发表单前端验证逻辑
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
            const response = await fetch("/Login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password })
            });

            const data = await response.json();
            alert(data.message);
    
            if (data.message == "success") {
                localStorage.setItem("Token",data.token)
                ToQuizPage()
            }
        } catch (err) {
            console.error("Login request failed:", err);
            alert("An error occurred during login.");
        }
    
    }


        useEffect(()=> {

            if (location.port != '3000') {return}

            VerifyToken()
        },[])



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
                            <input id="Username" type="text" className="form-control" placeholder="ilovedevops@gmail.com"/>
                            <div className="error-message">Enter a valid username.</div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="Password" className="form-label">Password</label>
                            <div className="input-group">
                                <input id="Password" type={showPassword ? "text" : "password"} className="form-control" placeholder="•••••••"/>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <div className="error-message">
                                Password must be at least 8 characters.
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="rememberMe"/>
                                <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                            </div>

                            <button type="button" className="btn btn-link">Forgot password?</button>                       
                        </div>

                            <button type="button" className="login-btn w-100" onClick={Login}>Sign in</button>
                        </form>

                        <div className="text-center my-3 text-muted">or</div>

                        <button type="button" className="google-btn w-100">
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
                                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
                                <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2c-2.1 1.6-4.6 2.5-7.3 2.5-5.3 0-9.8-3.3-11.4-8l-6.5 5C9.3 39.5 16.1 44 24 44z"/>
                                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.4 5.5-6.3 6.9l6.2 5.2C39.1 36.5 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"/>
                            </svg>
                            Continue with Google
                        </button>

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