import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Sidebar = () => {
  // Admin Panel Menu Structure from previous plan
  const menuItems = [
    { path: "/admin/dashboard", name: "Dashboard" },
    { path: "/admin/customers", name: "Customers" },
    { path: "/admin/policies", name: "Policies" },
    { path: "/admin/claims", name: "Claims" },
    { path: "/admin/products", name: "Products" },
    { path: "/admin/insurers", name: "Insurers/Carriers" },
    { path: "/admin/billing", name: "Billing & Finance" },
    { path: "/admin/reports", name: "Reports" },
    { path: "/admin/communications", name: "Communication" },
    { path: "/admin/users", name: "User Management" }, // For staff/brokers
    // { path: "/admin/documents", name: "Documents" }, // General doc repo, might be integrated elsewhere
    { path: "/admin/settings", name: "Settings" },
  ];

  return (
    <aside className="sidebar">
      <Link to="/admin" className="logo">Admin Portal</Link>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
