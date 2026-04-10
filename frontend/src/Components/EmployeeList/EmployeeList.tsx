import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeList.css";

// ✅ Type definition
type Employee = {
  id: number;
  name: string;
  email: string;
};

const EmployeeList = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data: Employee[] = await response.json();

      setEmployees(data);
    } catch (err) {
      setError("Error fetching employees");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="container">
      <h2 className="title">Employee List</h2>

      <button className="schedule-btn" onClick={() => navigate("/schedule")}>
        Go to Schedule
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
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeList;
