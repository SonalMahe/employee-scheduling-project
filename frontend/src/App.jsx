import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './Components/Login/Login.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Login
const login = async () => {
  const res = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",   // ← always needed for sessions!
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
}

// Any protected request
const getEmployees = async () => {
  const res = await fetch("http://localhost:3000/employees", {
    credentials: "include"    // ← sends cookie automatically
  })
  const data = await res.json()
}

// Logout
const logout = async () => {
  await fetch("http://localhost:3000/auth/logout", {
    method: "POST",
    credentials: "include"
  })
}

export default App;
