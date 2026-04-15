import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login/Login.jsx";
import RegisterEmployee from "./Components/RegisterEmployee/RegisterEmployee.jsx";
import EmployeeAvailability from "./Components/EmployeeAvailability/EmployeeAvailability.jsx";
import EmployeeList from "./Components/EmployeeList/EmployeeList.jsx";
import JobSchedule from "./Components/SchedulePage/SchedulePage.jsx";
import WorkSchedule from "./Components/WorkSchedule/WorkSchedule.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/employee-list" element={<EmployeeList />} />
        <Route path="/schedule" element={<JobSchedule />} />
        <Route path="/register-employee" element={<RegisterEmployee />} />
        <Route path="/availability" element={<EmployeeAvailability />} />
        <Route path="/work-schedule" element={<WorkSchedule />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
