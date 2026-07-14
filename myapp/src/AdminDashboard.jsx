import React, { useState } from 'react';
import { useEffect } from 'react';

// Safe props fallback implementation remains intact
function AdminDashboard({ user, onLogout = () => { localStorage.clear(); window.location.reload(); } }) {
  // Added local states to handle panel toggling
  const [showUsers, setShowUsers] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [users,SetUsers] = useState("")

  // Mock database entries for the Access Control toggle
  const platformUsers = [
    { id: 1, name: "xr", email: "2540104@myrp.edu.sg", role: "student" },
    { id: 2, name: "teacher_testing", email: "2540104@rp.edu.sg", role: "teacher" },
    { id: 3, name: "admin_testing", email: "2540104@admin.edu.sg", role: "admin" }
  ];


  async function GetUsers() {
    try{
      const response = await fetch("/GetUsers")
      const data = await response.json()
      SetUsers(data.result)
      
      if (data && data.result) {
        SetUsers(data.result);
      } else {
        // Fallback if data structure is missing the result key
        throw new Error("No database result data found");
      }
    } catch (error) {
      console.warn("Database fetch failed. Using mock platformUsers fallback data instead.");
      
      // Map 'name' from the mock data to 'username' so it works seamlessly with your table layout
      const formattedMockUsers = platformUsers.map(u => ({
        id: u.id,
        username: u.name, // maps 'name' to 'username'
        email: u.email,
        role: u.role
      }));
      
      SetUsers(formattedMockUsers);
    }
  }

  useEffect(()=> {
    GetUsers()
  },[])

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* Header Container */}
      <header className="container bg-dark bg-gradient border border-secondary rounded-3 p-4 mb-4 d-flex justify-content-between align-items-center shadow">
        <div>
          <h1 className="h3 fw-bold mb-1 text-white">Admin Dashboard</h1>
          <p className="mb-0 text-secondary">
            Access Level: <strong className="text-info">Administrator ({user?.username || "Admin"})</strong>
          </p>
        </div>
      </header>

      {/* Grid Layout Container */}
      <div className="container">
        <div className="row g-4">
          
          {/* Card 1:Manage user */}
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

          {/* Card 2: Quiz Analytics Tracker*/}
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
                  onClick={() => setShowLogs(!showLogs)} >
                  {showLogs ? "Hide Platform Metrics": "View Quiz Metrics"}
                </button>
              </div>
            </div>
          </div>
        </div>
          
        {/* --- INTERACTIVE DYNAMIC RENDER BLOCKS --- */}

        {/* Action Toggle Component A: Access Matrix Data Table */}
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
      
        {/* Action Toggle Component B: Diagnostic Status Terminal */}
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
                  <tr>
                    <td>Introduction to JavaScript</td>
                    <td>142</td>
                    <td className="text-info fw-bold">78%</td>
                    <td><span className="badge bg-primary">Medium</span></td>
                  </tr>
                  <tr>
                    <td>Advanced Quantum Physics</td>
                    <td>38</td>
                    <td className="text-danger fw-bold">42%</td>
                    <td><span className="badge bg-warning text-dark">Hard</span></td>
                  </tr>
                  <tr>
                    <td>Basic Algebra Foundations</td>
                    <td>210</td>
                    <td className="text-success fw-bold">89%</td>
                    <td><span className="badge bg-success">Easy</span></td>
                  </tr>
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