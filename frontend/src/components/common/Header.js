import React from 'react';
import { Link, NavLink } from 'react-router-dom';
// Styles for Header are in App.css for this basic setup,
// but could be moved to Header.css or Header.module.css

const Header = () => {
  const menuItems = [
    { path: "/", name: "Dashboard" },
    { path: "/profile", name: "My Profile" },
    { path: "/policies", name: "My Policies" },
    { path: "/get-quote", name: "Get Quote" },
    { path: "/claims", name: "My Claims" },
    { path: "/payments", name: "Payments" },
    { path: "/documents", name: "My Documents" },
    { path: "/support", name: "Support" },
    { path: "/notifications", name: "Notifications" },
    // { path: "/login", name: "Login" }, // Example, can be added later
  ];

  return (
    <header className="app-header">
      <Link to="/" className="logo">InsuranceCo</Link>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                end={item.path === "/"} // Ensure "Dashboard" is only active for exact path
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
