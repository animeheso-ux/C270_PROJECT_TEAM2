import { useState } from 'react'
import './App.css'


import QuizPage from './Quizpage.jsx'
import LoginPage from './LoginPage.jsx'

function App() {
  const [Page,SetPage] = useState("Login")

  return (
    <>
    <div>
      {Page === "Login" && (<LoginPage ToQuizPage={() => SetPage("Quiz")}/>)}
      {Page === "Quiz" && (<QuizPage ToLogin={() => SetPage("Login")} />)}

    </div>
      </>
  )
}

export default App
