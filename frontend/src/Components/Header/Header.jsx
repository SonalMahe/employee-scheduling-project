import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearSession, loadSession, logout } from "../../Api/api";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = loadSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearSession();
      navigate("/");
    }
  };

  const navItems =
    session?.role === "EMPLOYER"
      ? [
          { label: "Employee List", path: "/employee-list" },
          { label: "Schedule", path: "/schedule" },
          { label: "Work Schedule", path: "/work-schedule" },
          { label: "Register Employee", path: "/register-employee" },
        ]
      : [
          { label: "My Availability", path: "/availability" },
          { label: "My Schedule", path: "/work-schedule" },
        ];

  return (
    <header className="app-header">

      <div className="header-right">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-menu">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => {
                navigate(item.path);
                setMenuOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
