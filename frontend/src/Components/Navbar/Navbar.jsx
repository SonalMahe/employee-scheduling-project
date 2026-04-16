import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/image/resturantLogo.png";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo-image" />
        </Link>
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        <span className={`bar ${isOpen ? "open" : ""}`}></span>
        <span className={`bar ${isOpen ? "open" : ""}`}></span>
        <span className={`bar ${isOpen ? "open" : ""}`}></span>
      </div>
      <ul className={`navbar-links ${isOpen ? "open" : ""}`}>
        <li>
          <Link to="/employee-list" onClick={() => setIsOpen(false)}>
            Employee List
          </Link>
        </li>
        <li>
          <Link to="/schedule" onClick={() => setIsOpen(false)}>
            Schedule
          </Link>
        </li>
        <li>
          <Link to="/availability" onClick={() => setIsOpen(false)}>
            Availability
          </Link>
        </li>
        <li>
          <Link to="/register-employee" onClick={() => setIsOpen(false)}>
            Register Employee
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
