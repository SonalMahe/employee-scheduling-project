import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { createEmployee, loadSession } from '../../Api/api';
import Header from "../Header/Header";
import "./RegisterEmployee.css";

const RegisterEmployee = () => {
  const session = loadSession();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    loginCode: "",
    role: "WAITER",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (session?.role !== "EMPLOYER") {
    return <p>Access denied</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email,
        loginCode: formData.loginCode,
        position: formData.role,
      };

      await createEmployee(payload);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        loginCode: "",
        role: "WAITER",
      });
      navigate("/employee-list");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Header />
      <div className="register-card">
        <h2 className="register-title">Register new employee</h2>

        {error && <div className="error-message">{error}</div>}

        <form className="register-grid" onSubmit={handleSubmit}>
          {/* LEFT SIDE */}
          <div>
            <div className="form-group">
              <label>First name</label>
              <input
                name="firstName"
                className="input-field"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last name</label>
              <input
                name="lastName"
                className="input-field"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Login code</label>
              <input
                name="loginCode"
                className="input-field"
                value={formData.loginCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="right-panel">
            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                className="input-field"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="WAITER">Waiter</option>
                <option value="RUNNER">Runner</option>
                <option value="HEAD_WAITER">Head Waiter</option>
                <option value="ADMIN">Admin</option>
                <option value="CHEF">Chef</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterEmployee;