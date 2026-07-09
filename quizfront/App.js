import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import QuizPage from "./pages/QuizPage";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/quiz">Go to Quiz</Link>
      </nav>
      <Routes>
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
