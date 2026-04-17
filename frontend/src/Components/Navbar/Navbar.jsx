import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
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
      <Header />
    </nav>
  );
};

export default Navbar;
