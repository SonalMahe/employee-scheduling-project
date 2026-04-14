import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './Components/Login/Login.jsx';
import RegisterEmployee from "./Components/RegisterEmployee/RegisterEmployee.jsx";
import EmployeeAvailability from "./Components/EmployeeAvailability/EmployeeAvailability.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register-employee" element={<RegisterEmployee />} />
        <Route path="/availability" element={<EmployeeAvailability />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
