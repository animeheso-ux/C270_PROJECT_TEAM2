import React, { useEffect, useState } from 'react';
import './TeacherDashboard.css';

function TeacherDashboard({ ToLogin , ToCreateQuiz }) {
  const [subView, setSubView] = useState("dashboard");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function LoadTeacherDashboard() {
    try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("Token");

        const response = await fetch("/TeacherDashboardData", {
            headers: {
                authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || "Unable to load teacher dashboard.");
        }

        setQuizzes(data.result || []);
    } catch (error) {
        console.error(error);
        setError(error.message);
    } finally {
        setLoading(false);
    }
}
useEffect(() => {

    LoadTeacherDashboard();

}, []);

  // Handler for target deletion
  const handleDeleteQuiz = (id) => {
    if (window.confirm("Are you sure you want to delete this quiz module?")) {
      setQuizzes(prev => prev.filter(quiz => quiz.module_id !== id));
    }
  };

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
        </header>

        {/* Content Workspace Matrix */}
        <div className="container">
          
          {/* Dashboard Summary Cards */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-4">
              <div className="card border border-secondary p-4 h-100 shadow-sm" style={{ backgroundColor: '#1e293b' }}>
                <h6 className="text-uppercase text-muted small fw-bold">Active Modules</h6>
                <p className="display-6 fw-bold my-2 text-info">{quizzes.length}</p>
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

          {loading && (
              <p className="text-secondary">Loading dashboard data...</p>
          )}

          {error && (
              <div className="alert alert-danger">{error}</div>
          )}

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
                    <th >Module Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">No active quiz modules found.</td>
                    </tr>
                  ) : (
                    quizzes.map((quiz) => (
                      <tr key={quiz.module_id}>
                        <td className="fw-bold text-white">{quiz.module_name}</td>
                        <td>{quiz.question_count} Questions</td>
                        <td>{quiz.submission_count} Submissions</td>
                        <td>
                          <span
                              className={`badge rounded-pill px-3 py-2 ${
                                  quiz.status === "published"
                                      ? "bg-success-subtle text-success"
                                      : "bg-warning-subtle text-warning"
                              }`}>{quiz.submission_count >0  ? "LIVE" : " READY"}
                          </span>
                        </td>
                        <td className="text-end">
                          <button 
                            className="btn btn-sm btn-outline-danger fw-semibold"
                            onClick={() => handleDeleteQuiz(quiz.module_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
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