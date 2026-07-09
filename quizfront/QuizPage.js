import React, { useState, useEffect } from "react";

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Fetch questions from backend
  useEffect(() => {
    fetch("/questions/math/1") // example: module=math, level=1
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error("Error fetching questions:", err));
  }, []);

  const checkAnswer = async () => {
    if (!selectedAnswer) return;

    try {
      const res = await fetch("/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questions[currentIndex].id,
          answer: selectedAnswer,
        }),
      });

      const result = await res.json();
      if (result.correct) {
        setFeedback("Correct!");
        setScore((prev) => prev + 1);
      } else {
        setFeedback("Incorrect!");
      }

      setTimeout(() => {
        setFeedback("");
        setSelectedAnswer(null);
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setFinished(true);
        }
      }, 1000);
    } catch (err) {
      console.error("Error checking answer:", err);
    }
  };

  if (finished) {
    return (
      <div>
        <h2>Quiz Finished!</h2>
        <p>
          Your score: {score}/{questions.length}
        </p>
        <p>Percentage: {((score / questions.length) * 100).toFixed(0)}%</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return <p>Loading questions...</p>;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div>
      <h2>Quiz</h2>
      <p>
        Question {currentIndex + 1}/{questions.length}
      </p>
      <h3>{currentQuestion.text}</h3>

      <div>
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            style={{
              backgroundColor: selectedAnswer === option ? "#ddd" : "#fff",
              margin: "5px",
            }}
            onClick={() => setSelectedAnswer(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <button onClick={checkAnswer} disabled={!selectedAnswer}>
        Submit
      </button>

      {feedback && <p>{feedback}</p>}
    </div>
  );
}

export default QuizPage;
