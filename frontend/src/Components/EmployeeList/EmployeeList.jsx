import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEmployees,
  deleteEmployee,
  updateEmployee,
  loadSession,
} from "../../Api/api";
import "./EmployeeList.css";

const EmployeeList = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);

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

  const handleDelete = async (id) => {
    setDeleteEmployeeId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployee(deleteEmployeeId);
      setEmployees(employees.filter((emp) => emp.user.id !== deleteEmployeeId));
      setDeleteModalOpen(false);
      setDeleteEmployeeId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete employee");
      setDeleteModalOpen(false);
      setDeleteEmployeeId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeleteEmployeeId(null);
  };

  const startEdit = (emp) => {
    setEditingId(emp.user.id);
    setEditData({
      name: emp.user.name,
      email: emp.user.email,
      loginCode: emp.user.loginCode,
      position: emp.user.position || "",
    });
  };

  const handleEditSave = async (id) => {
    try {
      await updateEmployee(id, editData);
      setEmployees(
        employees.map((emp) =>
          emp.user.id === id
            ? { ...emp, user: { ...emp.user, ...editData } }
            : emp
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update employee");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
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
                {editingId === emp.user.id ? (
                  <div className="emp-edit-form">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      placeholder="Name"
                      className="edit-input"
                    />
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      placeholder="Email"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={editData.loginCode}
                      onChange={(e) =>
                        setEditData({ ...editData, loginCode: e.target.value })
                      }
                      placeholder="Login Code"
                      className="edit-input"
                    />
                    <select
                      value={editData.position}
                      onChange={(e) =>
                        setEditData({ ...editData, position: e.target.value })
                      }
                      className="edit-input"
                    >
                      <option value="">Select Position</option>
                      <option value="WAITER">Waiter</option>
                      <option value="RUNNER">Runner</option>
                      <option value="HEAD_WAITER">Head Waiter</option>
                      <option value="ADMIN">Admin</option>
                      <option value="CHEF">Chef</option>
                    </select>
                    <div className="edit-buttons">
                      <button
                        className="btn-save"
                        onClick={() => handleEditSave(emp.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={handleEditCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="emp-avatar">
                      {emp.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="emp-name">{emp.user.name}</h3>
                    <p className="emp-email">{emp.user.email}</p>
                    {emp.user.position && (
                      <span className="emp-role">{emp.user.position}</span>
                    )}
                    <div className="emp-actions">
                      <button
                        className="btn-edit"
                        onClick={() => startEdit(emp)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Delete Employee</h2>
            <p className="modal-message">
              Are you sure you want to delete this employee?
            </p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={cancelDelete}
              >
                Cancel
              </button>

              <button
                className="confirm-btn delete-confirm"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
