import { useState } from "react";
import "./App.css";

import QuizPage from "./Quizpage.jsx";
import LoginPage from "./LoginPage.jsx";
import SignUpPage from "./SignupPage.jsx";
import CreateQuizPage from "./Createquiz.jsx";

import TeacherDashboard from "./TeacherDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import Navbar from "./Navbar.jsx";

import RegisterSuccess from "./RegisterSuccess.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import PasswordChanged from "./PasswordChanged.jsx";

function App() {
    const [Page, SetPage] = useState("Login");

    const authenticationPages = [
        "Login",
        "Signup",
        "RegisterSuccess",
        "ForgotPassword",
        "PasswordChanged",
    ];

    const handleNavbarBrandClick = () => {
        if (
            Page === "QuizCreation" ||
            Page === "Teacher"
        ) {
            SetPage("Teacher");
            return;
        }

        if (Page === "Admin") {
            SetPage("Admin");
            return;
        }

        if (Page === "Quiz") {
            SetPage("Quiz");
            return;
        }

        SetPage("Login");
    };

    const handleLogout = () => {
        localStorage.removeItem("Token");
        SetPage("Login");
    };

    return (
        <>
            <div>
                {!authenticationPages.includes(Page) && (
                    <Navbar
                        isLoggedIn={true}
                        ToLogout={handleLogout}
                        OnBrandClick={handleNavbarBrandClick}
                    />
                )}

                <div>
                    {Page === "Login" && (
                        <LoginPage
                            ToSignup={() =>
                                SetPage("Signup")
                            }
                            ToForgotPassword={() =>
                                SetPage("ForgotPassword")
                            }
                            ToQuizPage={() =>
                                SetPage("Quiz")
                            }
                            ToTeacher={() =>
                                SetPage("Teacher")
                            }
                            ToAdmin={() =>
                                SetPage("Admin")
                            }
                        />
                    )}

                    {Page === "Signup" && (
                        <SignUpPage
                            ToLogin={() =>
                                SetPage("Login")
                            }
                            ToRegisterSuccess={() =>
                                SetPage("RegisterSuccess")
                            }
                        />
                    )}

                    {Page === "RegisterSuccess" && (
                        <RegisterSuccess
                            ToLogin={() =>
                                SetPage("Login")
                            }
                        />
                    )}

                    {Page === "ForgotPassword" && (
                        <ForgotPassword
                            ToLogin={() =>
                                SetPage("Login")
                            }
                            ToPasswordChanged={() =>
                                SetPage("PasswordChanged")
                            }
                        />
                    )}

                    {Page === "PasswordChanged" && (
                        <PasswordChanged
                            ToLogin={() =>
                                SetPage("Login")
                            }
                        />
                    )}

                    {Page === "Quiz" && (
                        <QuizPage
                            ToLogin={() =>
                                SetPage("Login")
                            }
                        />
                    )}

                    {Page === "Teacher" && (
                        <TeacherDashboard
                            ToLogin={() =>
                                SetPage("Login")
                            }
                            ToCreateQuiz={() =>
                                SetPage("QuizCreation")
                            }
                        />
                    )}

                    {Page === "Admin" && (
                        <AdminDashboard
                            ToLogin={() =>
                                SetPage("Login")
                            }
                        />
                    )}

                    {Page === "QuizCreation" && (
                        <CreateQuizPage
                            ToTeacher={() =>
                                SetPage("Teacher")
                            }
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default App;