import React, { useState } from 'react';
import { useEffect } from 'react';
import './AdminDashboard.css';
import './Navbar.css';


function AdminDashboard({ user, onLogout = () => { localStorage.clear(); window.location.reload(); } }) {
  const [showUsers, setShowUsers] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [users, SetUsers] = useState([])
  const [quizAnalytics, setQuizAnalytics] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");

  const platformUsers = [
    { id: 1, username: "xr", email: "2540104@myrp.edu.sg", role: "student" },
    { id: 2, username: "teacher_testing", email: "2540104@rp.edu.sg", role: "teacher" },
    { id: 3, username: "admin_testing", email: "2540104@admin.edu.sg", role: "admin" }
  ];

  async function GetUsers() {
    try{
      const response = await fetch("/GetUsers")
      const data = await response.json()
      SetUsers(data.result)

      if (data && data.result) {
        SetUsers(data.result);
      } else {
        throw new Error("No database result data found");
      }
    } catch (error) {
      console.warn("Database fetch failed. Using mock platformUsers fallback data instead.");

      const formattedMockUsers = platformUsers.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role
      }));

      SetUsers(formattedMockUsers);
    }
  }

  useEffect(()=> {
    GetUsers()
  },[])


  async function GetQuizAnalytics() {
    try {
        setAnalyticsLoading(true);
        setAnalyticsError("");

        const token = localStorage.getItem("Token");

        const response = await fetch("/AdminQuizAnalytics", {
            headers: {
                authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || "Unable to load quiz analytics.");
        }

        setQuizAnalytics(data.result || []);
    } catch (error) {
        console.error(error);
        setAnalyticsError(error.message);
    } finally {
        setAnalyticsLoading(false);
    }
}

  async function GetAuditLogs() {
    try {
        setAuditLoading(true);
        setAuditError("");

        const token = localStorage.getItem("Token");

        const response = await fetch("/AuditLogs", {
            headers: {
                authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            throw new Error(
                data.message || "Unable to load audit logs."
            );
        }

        setAuditLogs(data.result || []);
    } catch (error) {
        console.error("AUDIT LOG FETCH ERROR:", error);
        setAuditError(error.message);
    } finally {
        setAuditLoading(false);
    }
}

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif' }}>

      <header className="container bg-dark bg-gradient border border-secondary rounded-3 p-4 mb-4 d-flex justify-content-between align-items-center shadow">
        <div>
          <h1 className="h3 fw-bold mb-1 text-white">Admin Dashboard</h1>
          <p className="mb-0 text-secondary">
            Access Level: <strong className="text-info">Administrator ({user?.username || "Admin"})</strong>
          </p>
        </div>
      </header>

      <div className="container">
        <div className="row g-4">

          <div className="col-12 col-md-6">
            <div className="card h-100 border border-secondary p-4 shadow-sm" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h3 className="h4 fw-bold text-white mb-3">Manage User</h3>
                  <p className="text-secondary mb-4">
                    Elevate students to teachers, manage account terminations, and review logs.
                  </p>
                </div>
                <button className="btn btn-info text-dark fw-bold w-100 mt-auto"
                  onClick={() => setShowUsers(!showUsers)}>
                  {showUsers ? "Hide Access Control": "Manage Access Control"}
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card h-100 border border-secondary p-4 shadow-sm" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h3 className="h4 fw-bold text-white mb-3">Quiz Analytics</h3>
                  <p className="text-secondary mb-4">
                    Monitor performance, review module attempts, and flag low pass rates.
                  </p>
                </div>
                <button className="btn btn-info text-dark fw-bold w-100 mt-auto"
                  onClick={() => {
                      const nextValue = !showLogs;setShowLogs(nextValue);
                      if (nextValue) {GetQuizAnalytics();}
                  }} > {showLogs ? "Hide Platform Metrics": "View Quiz Metrics"}
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card h-100 border border-secondary p-4 shadow-sm"
                style={{backgroundColor: "#1e293b",color: "#f8fafc",}}>
                <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                        <h3 className="h4 fw-bold text-white mb-3">Security Audit Logs</h3>
                        <p className="text-secondary mb-4">Review successful logins, failed login attempts,and other important security events.</p>
                    </div>

                    <button
                        className="btn btn-info text-dark fw-bold w-100 mt-auto"
                        onClick={() => {const nextValue = !showAuditLogs;setShowAuditLogs(nextValue);

                            if (nextValue) {
                                GetAuditLogs();
                            }
                        }}
                    >
                        {showAuditLogs
                            ? "Hide Audit Logs"
                            : "View Audit Logs"}
                    </button>
                </div>
            </div>
          </div>
        </div>

        {showUsers && (
          <div className="card border border-secondary p-4 shadow-sm mt-4" style={{ backgroundColor: '#1e293b' }}>
            <h4 className="h5 fw-bold text-info mb-3">System Registry Dashboard</h4>
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 border-secondary align-middle">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>User Email Address</th>
                    <th>Access Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-bold text-white">{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'teacher' ? 'bg-primary' : 'bg-secondary'}`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showLogs && (
          <div className="card border border-secondary p-4 shadow-sm mt-4" style={{ backgroundColor: '#1e293b' }}>
            <h4 className="h5 fw-bold text-info mb-3">Quiz Performance Hub</h4>
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 border-secondary align-middle">
                <thead>
                  <tr>
                    <th>Module Title</th>
                    <th>Attempts</th>
                    <th>Avg Score</th>
                    <th>Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsLoading ? (
                      <tr>
                          <td colSpan="4" className="text-center text-secondary py-4">
                              Loading quiz analytics...
                          </td>
                      </tr>
                  ) : analyticsError ? (
                      <tr>
                          <td colSpan="4" className="text-center text-danger py-4">
                              {analyticsError}
                          </td>
                      </tr>
                  ) : quizAnalytics.length === 0 ? (
                      <tr>
                          <td colSpan="4" className="text-center text-secondary py-4">
                              No quiz attempts have been submitted.
                          </td>
                      </tr>
                  ) : (
                      quizAnalytics.map((quiz) => (
                          <tr key={quiz.module_id}>
                              <td>{quiz.module_name}</td>

                              <td>{quiz.attempts}</td>

                              <td className="text-info fw-bold">
                                  {Number(quiz.average_score || 0).toFixed(1)}%
                              </td>

                              <td>
                                  <span
                                      className={`badge ${
                                        quiz.difficulty === "Easy"
                                            ? "bg-success"
                                            : quiz.difficulty === "Medium"
                                            ? "bg-primary"
                                            : quiz.difficulty === "Hard"
                                            ? "bg-danger"
                                            : "bg-secondary"
                                    }`}
                                  >
                                      {quiz.difficulty}
                                  </span>
                              </td>
                          </tr>
                      ))
                  )}
              </tbody>
              </table>
            </div>
          </div>
        )}

        {showAuditLogs && (
          <div
              className="card border border-secondary p-4 shadow-sm mt-4"
              style={{ backgroundColor: "#1e293b" }}
          >
              <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="h5 fw-bold text-info mb-0">
                      Security Audit Logs
                  </h4>

                  <button
                      className="btn btn-outline-info btn-sm"
                      onClick={GetAuditLogs}
                      disabled={auditLoading}
                  >
                      {auditLoading ? "Refreshing..." : "Refresh"}
                  </button>
              </div>

              <div className="table-responsive">
                  <table className="table table-dark table-hover mb-0 border-secondary align-middle">
                      <thead>
                          <tr>
                              <th>Date and Time</th>
                              <th>User</th>
                              <th>Role</th>
                              <th>Action</th>
                              <th>Description</th>
                              <th>Status</th>
                              <th>IP Address</th>
                          </tr>
                      </thead>

                      <tbody>
                          {auditLoading ? (
                              <tr>
                                  <td
                                      colSpan="7"
                                      className="text-center text-secondary py-4"
                                  >
                                      Loading audit logs...
                                  </td>
                              </tr>
                          ) : auditError ? (
                              <tr>
                                  <td
                                      colSpan="7"
                                      className="text-center text-danger py-4"
                                  >
                                      {auditError}
                                  </td>
                              </tr>
                          ) : auditLogs.length === 0 ? (
                              <tr>
                                  <td
                                      colSpan="7"
                                      className="text-center text-secondary py-4"
                                  >
                                      No audit logs are available.
                                  </td>
                              </tr>
                          ) : (
                              auditLogs.map((log) => (
                                  <tr key={log.id}>
                                      <td>
                                          {new Date(
                                              log.created_at
                                          ).toLocaleString()}
                                      </td>

                                      <td>
                                          <div className="fw-bold text-white">
                                              {log.username || "Unknown"}
                                          </div>

                                          <small className="text-secondary">
                                              {log.email || "No email"}
                                          </small>
                                      </td>

                                      <td>
                                          <span
                                              className={`badge ${
                                                  log.role === "admin"
                                                      ? "bg-danger"
                                                      : log.role === "teacher"
                                                      ? "bg-primary"
                                                      : log.role === "student"
                                                      ? "bg-secondary"
                                                      : "bg-dark"
                                              }`}
                                          >
                                              {log.role || "Unknown"}
                                          </span>
                                      </td>

                                      <td className="fw-bold">
                                          {log.action}
                                      </td>

                                      <td>{log.description}</td>

                                      <td>
                                          <span
                                              className={`badge ${
                                                  log.status === "SUCCESS"
                                                      ? "bg-success"
                                                      : log.status === "FAILURE"
                                                      ? "bg-danger"
                                                      : "bg-warning text-dark"
                                              }`}
                                          >
                                              {log.status}
                                          </span>
                                      </td>

                                      <td>
                                          <code>{log.ip_address || "N/A"}</code>
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
    </div>
  );
}
export default AdminDashboard