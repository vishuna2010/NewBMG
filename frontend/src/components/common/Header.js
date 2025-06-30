import React from 'react';
import { Link, NavLink } from 'react-router-dom';
// Styles for Header are in App.css for this basic setup,
// but could be moved to Header.css or Header.module.css

const Header = () => {
  return (
    <header className="app-header">
      <Link to="/" className="logo">InsuranceCo</Link>
      <nav>
        <ul>
          <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
          {/* Example Future Links - these would correspond to routes in App.js */}
          {/* <li><NavLink to="/policies" className={({ isActive }) => isActive ? "active" : ""}>My Policies</NavLink></li> */}
          {/* <li><NavLink to="/claims" className={({ isActive }) => isActive ? "active" : ""}>My Claims</NavLink></li> */}
          {/* <li><NavLink to="/quotes" className={({ isActive }) => isActive ? "active" : ""}>Get Quote</NavLink></li> */}
          {/* <li><NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>Profile</NavLink></li> */}
          {/* <li><NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>Login</NavLink></li> */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
