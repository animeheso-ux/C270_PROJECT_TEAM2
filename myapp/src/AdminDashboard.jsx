import React, { useState } from 'react';
import { useEffect } from 'react';

// Safe props fallback implementation remains intact
function AdminDashboard({ user, onLogout = () => { localStorage.clear(); window.location.reload(); } }) {
  // Added local states to handle panel toggling
  const [showUsers, setShowUsers] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [users,SetUsers] = useState("")


  async function GetUsers() {
    const response = await fetch("/GetUsers")

    const data = await response.json()

    SetUsers(data.result)
  }


  
  // Mock database entries for the Access Control toggle
  const platformUsers = [
    { id: 1, name: "xr", email: "2540104@myrp.edu.sg", role: "student" },
    { id: 2, name: "teacher_testing", email: "2540104@rp.edu.sg", role: "teacher" },
    { id: 3, name: "admin_testing", email: "2540104@admin.edu.sg", role: "admin" }
  ];


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
        <button 
          className="btn btn-outline-danger fw-semibold px-4" 
          onClick={onLogout}
        >
          Sign Out
        </button>
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

          {/* Card 2: System status */}
          <div className="col-12 col-md-6">
            <div className="card h-100 border border-secondary p-4 shadow-sm" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h3 className="h4 fw-bold text-white mb-3">System Status</h3>
                  <p className="text-secondary mb-4">
                    Monitor token expirations, database load flags, and endpoint latency.
                  </p>
                </div>
                <button className="btn btn-info text-dark fw-bold w-100 mt-auto"
                  onClick={() => setShowLogs(!showLogs)} >
                  {showLogs ? "Hide Logs Overlay": "System Logs"}
                </button>
              </div>
            </div>
          </div>
        
        <div/>  
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
          <div className="card border border-secondary p-4 shadow-sm mt-4" style={{ backgroundColor: '#020617', fontFamily: 'monospace' }}>
            <h4 className="h5 fw-bold text-success mb-3">live_diagnostics_stream:~#</h4>
            <div className="text-secondary small">
              <p className="mb-1 text-success">[OK] MySQL Pool Endpoint Cluster Online: Port 3306</p>
              <p className="mb-1 text-success">[OK] Cryptographic Module: bcrypt Active (10 SaltRounds)</p>
              <p className="mb-1 text-info">[JWT] Verification Handler listening for Authorization: Bearer tokens</p>
              <p className="mb-0 text-warning">[WARN] System latency: 0.02ms. Route paths nominal.</p>
            </div>
          </div>
        )}

        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;