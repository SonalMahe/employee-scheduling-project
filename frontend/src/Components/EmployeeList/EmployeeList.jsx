import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEmployees,
  loadSession,
} from "../../Api/api";
import "./EmployeeList.css";

const EmployeeList = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch employees");
      setLoading(false);
    }
  };

  if (loading) return <div className="employee-list-container"><div className="employee-list-card"><p className="loading">Loading...</p></div></div>;
  if (error) return <div className="employee-list-container"><div className="employee-list-card"><div className="error-message">{error}</div></div></div>;

  return (
    <div className="employee-list-container">
      <div className="employee-list-card">
        <h2 className="employee-list-title">Employee List</h2>

        <button className="btn-secondary" onClick={() => navigate("/register-employee")}>
          + Register new Employee
        </button>

        {employees.length === 0 ? (
          <p className="empty">No employees found</p>
        ) : (
          <div className="employee-grid">
            {employees.map((emp) => (
              <div className="emp-card" key={emp.user.id}>
                <div className="emp-avatar">
                  {emp.user.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="emp-name">{emp.user.name}</h3>
                <p className="emp-email">{emp.user.email}</p>
                {emp.user.position && (
                  <span className="emp-role">{emp.user.position}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
