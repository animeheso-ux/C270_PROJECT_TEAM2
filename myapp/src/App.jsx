import { useState } from 'react'
import './App.css'


import QuizPage from './Quizpage.jsx'
import LoginPage from './LoginPage.jsx'
import SignUpPage from './SignupPage.jsx'
import CreateQuizPage from './Createquiz.jsx'

function App() {
  const [Page,SetPage] = useState("Login")

  return (
    <>
    <div>
      {Page === "Login" && (<LoginPage ToSignup={() => SetPage("Signup")} ToQuizPage={() => SetPage("Quiz")}/>)}
      {Page === "Quiz" && (<QuizPage  ToLogin={() => SetPage("Login")} ToQuizCreation={() => SetPage("CreateQuiz")} />)}
      {Page === "Signup" && (<SignUpPage ToLogin={() => SetPage("Login")} />)}
      {Page === "CreateQuiz" && <CreateQuizPage ToQuizPage={() => SetPage("Quiz")}     />}

    </div>
      </>
  )
}

export default App
