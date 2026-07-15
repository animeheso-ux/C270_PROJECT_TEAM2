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


  return (
    <>
    <div>
      {localStorage.getItem("Token") &&
            <Navbar 
        ToLogin={() => SetPage("Login")} 
        ToSignup={() => SetPage("Signup")}
        ToLogout={() => { SetPage("Login")
        }}
      />
      }
      
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
