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

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="container">
      <h2 className="title">Employee List</h2>

      <button className="register-btn" onClick={() => navigate("/register-employee")}>
        Register new Employee
      </button>

      {employees.length === 0 ? (
        <p className="empty">No employees found</p>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr key={emp.user.id}>
                <td>{emp.user.id}</td>
                <td>{emp.user.name}</td>
                <td>{emp.user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeList;
