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
import ProfilePage from "./ProfilePage.jsx";

function App() {
    const [Page, SetPage] = useState("Login");
    const [PreviousPage, SetPreviousPage] = useState("Quiz");

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

    const getMainPage = () => {
        const token = localStorage.getItem("Token");

        if (!token) {
            return "Quiz";
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));

            if (payload.role === "admin") {
                return "Admin";
            }

            if (payload.role === "teacher") {
                return "Teacher";
            }
        } catch (err) {
            console.error("Unable to read token role:", err);
        }

        return "Quiz";
    };

    const handleLogout = () => {
        localStorage.removeItem("Token");
        SetPage("Login");
    };

    const handleProfileClick = () => {
        SetPreviousPage(Page);
        SetPage("Profile");
    };

    return (
        <>
            <div>
                {!authenticationPages.includes(Page) && (
                    <Navbar
                        isLoggedIn={true}
                        ToLogout={handleLogout}
                        OnBrandClick={handleNavbarBrandClick}
                        OnProfileClick={handleProfileClick}
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

                    {Page === "Profile" && (
                        <ProfilePage
                            ToBack={() => SetPage(PreviousPage || getMainPage())}
                            ToMain={() => SetPage(getMainPage())}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default App;