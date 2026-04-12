import React from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5050/api/v1";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Employee Scheduling System</h1>
        <p>Welcome to the scheduling application</p>
      </header>
    </div>
  );
}

// Login
const login = async () => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",   // ← always needed for sessions!
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
}

// Any protected request
const getEmployees = async () => {
  const res = await fetch(`${API_BASE_URL}/employees`, {
    credentials: "include"    // ← sends cookie automatically
  })
  const data = await res.json()
}

// Logout
const logout = async () => {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  })
}

export default App;
