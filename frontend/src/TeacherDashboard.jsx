import React, { useEffect, useState, useMemo } from 'react';
import {BookOpen,CheckCircle2,ClipboardList,LogOut,Plus,RefreshCw,Trash2,Users,
} from "lucide-react";
import './TeacherDashboard.css';

//kyler

function TeacherDashboard({ ToLogin , ToCreateQuiz }) {
  const [quizzes, setQuizzes] =useState([]);
  const [loading, setLoading] =useState(true);
  const [error, setError] =useState("");
  const teacherName =localStorage.getItem("Username") ||"Teacher";
  const currentHour =new Date().getHours();

  let greeting = "Good Evening";

  if (currentHour < 12) {
      greeting = "Good Morning";
  } else if (currentHour < 18) {
      greeting = "Good Afternoon";
  }

  async function LoadTeacherDashboard() {
      try {
          setLoading(true);
          setError("");

          const token =localStorage.getItem("Token");

          const response = await fetch("/TeacherDashboardData",
                {
                    headers: {authorization:`Bearer ${token}`,"Content-Type":"application/json",},
                }
            );

            const data = await response.json();

            if (
                !response.ok ||
                data.status !== "success"
            ) {
                throw new Error(
                    data.message ||
                        "Unable to load the teacher dashboard."
                );
            }

            setQuizzes(
                data.result || []
            );
        } catch (error) {
            console.error(
                "TEACHER DASHBOARD ERROR:",
                error
            );

            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        LoadTeacherDashboard();
    }, []);

    const dashboardStats =useMemo(() => {const totalQuestions =quizzes.reduce((total,quiz) =>total +Number(quiz.question_count ||0),0);

            const totalSubmissions =quizzes.reduce(
                    (total,quiz) =>total +Number(quiz.submission_count ||0),0
                );

            const publishedQuizzes =quizzes.length;

            return {
                modules: quizzes.length,
                questions: totalQuestions,
                submissions: totalSubmissions,
                published:publishedQuizzes,
            };
        }, [quizzes]);


    async function handleDeleteQuiz(id) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this quiz module?"
    );

    if (!confirmed) {
        return;
    }

    try {
        setError("");

        const token =
            localStorage.getItem("Token");

        const response = await fetch(`/DeleteQuiz/${id}`,
            {
                method: "DELETE",
                headers: {
                    authorization:
                        `Bearer ${token}`,
                    "Content-Type":
                        "application/json",
                },
            }
        );

        const responseText =
            await response.text();

        let data = {};

        if (responseText) {
            try {
                data =
                    JSON.parse(responseText);
            } catch {
                throw new Error(
                    `Server returned an invalid response (${response.status}).`
                );
            }
        }

        if (!response.ok) {
            throw new Error(
                data.message ||
                    `Unable to delete the quiz (${response.status}).`
            );
        }

        setQuizzes(
            (currentQuizzes) =>
                currentQuizzes.filter(
                    (quiz) =>
                        quiz.module_id !== id
                )
        );
    } catch (error) {
        console.error(
            "DELETE QUIZ ERROR:",
            error
        );

        setError(
            error.message ||
                "Unable to delete the quiz."
        );
    }
}

    function handleLogout() {
        localStorage.removeItem("Token");

        if (ToLogin) {ToLogin();}
    }

    return (
        <main className="teacher-dashboard">
            <div className="teacher-dashboard-shell">
                <header className="teacher-dashboard-header">
                    <div className="teacher-header-content">
                        <span className="teacher-eyebrow">
                            Academic Management
                        </span>

                        <h1>
                             {greeting}, {teacherName} 👋
                        </h1>

                        <p>Manage your modules and quizzes.</p>
                    </div>

                    <div className="teacher-header-actions">
                        <button
                            type="button" className="teacher-button teacher-button-light" onClick={ LoadTeacherDashboard } disabled={ loading}>
                            <RefreshCw size={17} className={ loading ? "teacher-spin" : ""}/>Refresh
                        </button>

                        <button
                            type="button" className="teacher-button teacher-button-dark" onClick={ handleLogout }>
                            <LogOut size={17}/>Logout
                        </button>
                    </div>
                </header>

                <section className="teacher-stat-grid">
                    <article className="teacher-stat-card">
                        <div className="teacher-stat-icon">
                            <BookOpen size={21}/>
                        </div>

                        <div>
                            <span>Active Modules</span>
                            <strong>{dashboardStats.modules}</strong>
                            <small>Quiz modules available</small>
                        </div>
                    </article>

                    <article className="teacher-stat-card">
                        <div className="teacher-stat-icon">
                            <ClipboardList size={21}/>
                        </div>

                        <div>
                            <span> Questions </span>
                            <strong> {dashboardStats.questions}</strong>

                            <small> Configured quiz questions
                            </small>
                        </div>
                    </article>

                    <article className="teacher-stat-card">
                        <div className="teacher-stat-icon">
                            <Users size={21} />
                        </div>

                        <div>
                            <span>Submissions</span>
                            <strong>{dashboardStats.submissions}</strong>
                            <small> Student quiz attempts</small>
                        </div>
                    </article>

                    <article className="teacher-stat-card">
                        <div className="teacher-stat-icon">
                            <CheckCircle2 size={21}/>
                        </div>

                        <div>
                            <span>Published</span>
                            <strong>{dashboardStats.published}</strong>
                            <small>Live quizmodules
                            </small>
                        </div>
                    </article>
                </section>

                <section className="teacher-overview-grid">
                    <article className="teacher-panel teacher-create-panel">
                        <div>
                            <span className="teacher-panel-label">Quick Action</span>
                            <h2>Create a new quiz</h2>
                            <p>Build a quiz, configure its questions and publish it for students.</p>
                        </div>

                        <button
                            type="button" className="teacher-create-button" onClick={ ToCreateQuiz}>
                            <Plus size={19} />Create New Quiz
                        </button>
                    </article>

                    <article className="teacher-panel">
                        <div className="teacher-panel-heading">
                            <div>
                                <span className="teacher-panel-label">Overview</span>
                                <h2> Recent module activity</h2>
                            </div>

                            <span className="teacher-activity-count">
                                {quizzes.length}{" "}modules
                            </span>
                        </div>

                        <div className="teacher-activity-list">
                            {quizzes.length ===0 ? (
                                <div className="teacher-empty-activity">
                                    <BookOpen size={22}/>
                                    <p>No module activity available.</p>
                                </div>
                            ) : (
                                quizzes.slice(0, 3).map((quiz) => (
                                            <div
                                                className="teacher-activity-item"
                                                key={quiz.module_id}>
                                                <div className="teacher-activity-dot" />

                                                <div>
                                                    <strong>{quiz.module_name}</strong>

                                                    <span>
                                                        {quiz.question_count}{" "}questions·{" "}
                                                        {quiz.submission_count}{" "}submissions
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    )
                            )}
                        </div>
                    </article>
                </section>

                {error && (
                    <div
                        className="teacher-alert" role="alert">
                        <strong>Something went wrong</strong>
                        <span>{error}</span>
                    </div>
                )}

                <section className="teacher-panel teacher-table-panel">
                    <div className="teacher-panel-heading teacher-table-heading">
                        <div>
                            <span className="teacher-panel-label">Quiz Management </span>

                            <h2>Live Quizzes</h2>
                            <p> Review quiz modules and studen submissions.
                            </p>
                        </div>

                        <button
                            type="button" className="teacher-create-small-button" onClick={ToCreateQuiz}>
                            <Plus size={17} />New Quiz
                        </button>
                    </div>

                    {loading ? (
                        <div className="teacher-loading-state">
                            <RefreshCw size={22} className="teacher-spin"/>

                            <span> Loadin dashboarddata...
                            </span>
                        </div>
                    ) : (
                        <div className="teacher-table-wrapper">
                            <table className="teacher-quiz-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Module
                                        </th>

                                        <th>
                                            Questions
                                        </th>

                                        <th>
                                            Submissions
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th className="teacher-table-action-heading">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {quizzes.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="teacher-table-empty"
                                            >
                                                <BookOpen size={28}/>

                                                <strong> No quiz modules found</strong>

                                                <span>
                                                    Create your first quiz to get started.
                                                </span>
                                            </td>
                                        </tr>
                                    ) : (
                                        quizzes.map(
                                            (quiz) => {
                                                return (
                                                    <tr
                                                        key={quiz.module_id}
                                                    >
                                                        <td>
                                                            <div className="teacher-module-cell">
                                                                <div className="teacher-module-icon">
                                                                    <BookOpen size={17}/>
                                                                </div>

                                                                <div>
                                                                    <strong>{quiz.module_name}</strong>

                                                                    <span>Module ID:{" "}{quiz.module_id}</span>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <strong>{quiz.question_count}</strong>
                                                            <span className="teacher-cell-label">Questions</span>
                                                        </td>

                                                        <td>
                                                            <strong>{quiz.submission_count}</strong>
                                                            <span className="teacher-cell-label">Attempts</span>
                                                        </td>

                                                        <td>
                                                            <span className ="teacher-status-published">Published </span>
                                                        </td>

                                                        <td className="teacher-table-actions">
                                                            <button
                                                                type="button" className="teacher-delete-button"
                                                                onClick={() =>handleDeleteQuiz(quiz.module_id)}
                                                                aria-label={`Delete ${quiz.module_name}`}
                                                            ><Trash2 size={16}/>Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default TeacherDashboard;