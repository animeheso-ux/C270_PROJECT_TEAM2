import { useEffect,useState } from "react"
import "./SignupPage.css"
import validator from "validator"
import {BookOpen,Brain,Trophy,BarChart3} from "lucide-react"


function SignUpPage({ToLogin}) {

    async function CreateAccount() {
        const EmailText = document.getElementById("Email")?.value
        const UsernameText = document.getElementById("Username")?.value
        const PasswordText = document.getElementById("Password")?.value
        const ConfrimPasswordText = document.getElementById("ConfrimPassword")?.value


        const isvalid = validator.isEmail(EmailText)

        if (!isvalid) {
            alert("Email not found!")
            return
        }

        if (UsernameText.length == 0 || PasswordText.length == 0) {
            alert("username or password cannot be empty")
            return
        }

        if (PasswordText.length < 8) {
            alert("Password must have at least 8 characters and above")
            return
        }

        if (PasswordText != ConfrimPasswordText) {
            alert("Password and confrim password fields do not match!")
            return
        }


        const response = await fetch("/CreateAccount",{
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({email : EmailText, username : UsernameText,password : PasswordText})
        })

        const data = await response.json()


        alert(data.message)

        if (data.message == "success") {
            ToLogin()
        }


    }



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
                </div>
            </div>
        </div>

    )
}


export default SignUpPage