import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import EmployeeList from "./Components/EmployeeList/EmployeeList";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1>Employee Scheduling System</h1>

        <Routes>
          <Route path="/employees" element={<EmployeeList />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
