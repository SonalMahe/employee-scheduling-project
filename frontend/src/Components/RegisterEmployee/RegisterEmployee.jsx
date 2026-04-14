import React, { useState } from "react";
import { createEmployee, loadSession } from '../../Api/api';
import "./RegisterEmployee.css";

const RegisterEmployee = () => {
  const session = loadSession();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    loginCode: "",
    role: "waiter",
    photo: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (session?.role !== "EMPLOYER") {
    return <p>Access denied</p>;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      // NOTE: If backend doesn't support file upload yet, remove photo
      const payload = {
        name: formData.firstName + " " + formData.lastName,
        email: formData.email,
        loginCode: formData.loginCode,
        password: formData.loginCode,
        position: formData.role,
      };

      await createEmployee(payload);

      setSuccess("Employee registered successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        loginCode: "",
        role: "waiter",
        photo: null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container bg-light">
      <div className="register-card">
        <h2 className="register-title">Register new employee</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

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
                <option value="waiter">Waiter</option>
                <option value="runner">Runner</option>
                <option value="head_waiter">Head Waiter</option>
              </select>
            </div>

            <div className="form-group">
              <label>Upload Photo</label>
              <input
                type="file"
                name="photo"
                className="input-field"
                onChange={handleChange}
              />
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