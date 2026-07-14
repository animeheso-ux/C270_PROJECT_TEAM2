import { useState } from 'react'
import './App.css'


import QuizPage from './Quizpage.jsx'
import LoginPage from './LoginPage.jsx'
import SignUpPage from './SignupPage.jsx'
import CreateQuizPage from './Createquiz.jsx'

import TeacherDashboard from './TeacherDashboard.jsx'
import AdminDashboard from './AdminDashboard.jsx'

import Navbar from './Navbar.jsx';

function App() {
  const [Page,SetPage] = useState("Login")

  // Checks who is clicking "Learning Quest" and handles it contextually
  const handleNavbarBrandClick = () => {
    if (Page === "QuizCreation" || Page === "Teacher") {
      SetPage("Teacher"); // Teachers go back to their dashboard panel
    } else if (Page === "Quiz") {
      SetPage("Quiz"); // Students reset to their base quiz track hub
    }
  };

  return (
    <>
    <div>
      {Page !== "Login" && Page !== "Signup" && (
          <Navbar 
        ToLogin={() => SetPage("Login")} 
        ToSignup={() => SetPage("Signup")}
        ToLogout={() => { SetPage("Login")}}
        OnBrandClick={handleNavbarBrandClick}
      />
      )}
      
    <div>
      {Page === "Login" && (
          <LoginPage 
            ToSignup={() => SetPage("Signup")} 
            ToQuizPage={() => SetPage("Quiz")}
            ToTeacher={() => SetPage("Teacher")} // Hook for Teacher
            ToAdmin={() => SetPage("Admin")}   // Hook for Admin
          />
        )}
        
        {/* STUDENT VIEW */}
        {Page === "Quiz" && (<QuizPage ToLogin={() => SetPage("Login")} />)}
        
        {/* TEACHER VIEW */}
        {Page === "Teacher" && (<TeacherDashboard ToLogin={() => SetPage("Login")}             ToCreateQuiz= {() => SetPage("QuizCreation")}  />)}
        
        {/* ADMIN VIEW */}
        {Page === "Admin" && (<AdminDashboard ToLogin={() => SetPage("Login")} />)}
        
        {/* SIGNUP VIEW */}
        {Page === "Signup" && (<SignUpPage ToLogin={() => SetPage("Login")} />)}

        {Page === "QuizCreation" && <CreateQuizPage 
        ToTeacher={() => SetPage("Teacher")} // Hook for Teacher
        
        
        
        />}
      </div>

    </div>
      </>
  )
}

export default App
