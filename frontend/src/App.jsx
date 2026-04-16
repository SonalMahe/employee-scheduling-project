import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Components/Layout/Layout";
import Login from "./Components/Login/Login.jsx";
import RegisterEmployee from "./Components/RegisterEmployee/RegisterEmployee.jsx";
import EmployeeAvailability from "./Components/EmployeeAvailability/EmployeeAvailability.jsx";
import EmployeeList from "./Components/EmployeeList/EmployeeList.jsx";
import JobSchedule from "./Components/SchedulePage/SchedulePage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} />
          <Route path="employee-list" element={<EmployeeList />} />
          <Route path="schedule" element={<JobSchedule />} />
          <Route path="register-employee" element={<RegisterEmployee />} />
          <Route path="availability" element={<EmployeeAvailability />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
