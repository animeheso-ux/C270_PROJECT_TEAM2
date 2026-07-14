import React, { useState } from 'react';
import './TeacherDashboard.css';

function TeacherDashboard({ ToLogin , ToCreateQuiz }) {
  // Local view management: toggles between 'dashboard' and 'create_quiz'
  const [subView, setSubView] = useState("dashboard");
  // Form Input States
  const [moduleName, setModuleName] = useState("Python");
  const [question, setQuestion] = useState("What is pandas");
  const [opt1, setOpt1] = useState("A panda");
  const [opt2, setOpt2] = useState("pandan cake");
  const [opt3, setOpt3] = useState("A python package");
  const [correctOpt, setCorrectOpt] = useState("Option 3");

  // Dashboard Table Data
  const dynamicQuizzes = [
    { id: 1, name: "Python Basics", questions: 5, responses: 14 },
    { id: 2, name: "JavaScript Arrays", questions: 8, responses: 22 }
  ];

  // --- VIEW 1: MAIN TEACHER DASHBOARD HUB ---
  if (subView === "dashboard") {
    return (
      <div className="teacher-hub-container">
        
        {/* Header Block */}
        <header className="container bg-dark bg-gradient border border-secondary rounded-3 p-4 mb-4 d-flex justify-content-between align-items-center shadow">
          <div>
            <h1 className="h3 fw-bold mb-1 text-white">Teacher Dashboard</h1>
            <p className="mb-0 text-secondary">Academic Management Panel</p>
          </div>
          <button 
            className="btn btn-outline-danger fw-semibold px-4" 
            onClick={() => { localStorage.clear(); ToLogin(); }}
          >
            Log Out
          </button>
        </header>

        {/* Content Workspace Matrix */}
        <div className="container">
          
          {/* Dashboard Summary Cards */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-4">
              <div className="card border border-secondary p-4 h-100 shadow-sm" style={{ backgroundColor: '#1e293b' }}>
                <h6 className="text-uppercase text-muted small fw-bold">Active Modules</h6>
                <p className="display-6 fw-bold my-2 text-info">2</p>
                <small className="text-success">● Module Control</small>
              </div>
            </div>
            <div className="col-12 col-md-8">
              <div className="card border border-secondary p-4 h-100 shadow-sm d-flex flex-column justify-content-center align-items-start" style={{ backgroundColor: '#1e293b' }}>
                <h4 className="h5 fw-bold text-white mb-2">New Quiz</h4>
                <p className="text-secondary small mb-3">Strat a new quiz with rules.</p>
                <button 
                  className="btn btn-info text-dark fw-bold px-4"
                  onClick={ToCreateQuiz}
                >
                  + Create New Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Active Quizzes Registry Table */}
          <div className="card border border-secondary p-4 shadow-sm" style={{ backgroundColor: '#1e293b' }}>
            <h4 className="h5 fw-bold text-white mb-3">Live Active Quizzes</h4>
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 border-secondary align-middle">
                <thead>
                  <tr>
                    <th>Quiz Module Reference</th>
                    <th>Configured Questions</th>
                    <th>Student Submissions</th>
                    <th className="text-end">Context Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicQuizzes.map((quiz) => (
                    <tr key={quiz.id}>
                      <td className="fw-bold text-white">{quiz.name}</td>
                      <td>{quiz.questions} Questions</td>
                      <td>{quiz.responses} Active Submissions</td>
                      <td className="text-end">
                        <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">LIVE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    );
  }

}

export default TeacherDashboard;