import { useEffect } from "react"
import "./LoginSign.css"


function LoginPage({ToQuizPage,ToSignup}) {



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
            const UsernameText = document.getElementById("Username")?.value
            const PasswordText = document.getElementById("Password")?.value

    
            if (UsernameText.length == 0 || PasswordText.length == 0) {
                alert("username or password cannot be empty")
                return
            }
    
            const response = await fetch("/Login",{
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify({ username : UsernameText,password : PasswordText})
            })
    
            const data = await response.json()
    
    
            alert(data.message)
    
            if (data.message == "success") {
                localStorage.setItem("Token",data.token)
                ToQuizPage()
            }
    
    
        }


        useEffect(()=> {

            if (location.port != 3000) {return}

            VerifyToken()
        },[])



        return (
            <div className="Login-container">
                <div className="Login-card  ">
                    <h1>Learning Quest</h1>
                    <p>Login to your account</p>

                    <form>
                        <div className="field">
                            <label htmlFor="Username">Username</label>
                            <input id="Username" type="text" placeholder="ilovedevops@gmail.com"/>
                            <div className="error-message">Enter a valid username.</div>
                        </div>
                        <div className="field">
                            <label htmlFor="Password">Password</label>
                            <input id="Password" type="password" placeholder="●●●●●●●●"/>
                            <div className="error-message">Password must be at least 8 characters.</div>
                        </div>

                        <div className="row-between">
                            <label className="remember">
                                <input type="checkbox"/> Remember me
                            </label>
                        </div>

                        <button type="button" className="login-btn" onClick={Login}>Sign in

                        </button>
                    </form>

                    <p className="signup-line">Don't have an account? 
                        <a onClick={ToSignup} className="signup-link">Create account</a></p>
            </div>
        </div>
    )
}


export default LoginPage