import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
  AppstoreOutlined,
  DollarOutlined,
  BarChartOutlined,
  MailOutlined,
  TeamOutlined,
  FileDoneOutlined,
  BellOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

const menuItems = [
  { path: '/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> },
  { path: '/quotes', name: 'Quotes', icon: <FileTextOutlined /> },
  { path: '/policies', name: 'Policies', icon: <FileDoneOutlined /> },
  { path: '/claims', name: 'Claims', icon: <DatabaseOutlined /> },
  { path: '/products', name: 'Products', icon: <AppstoreOutlined /> },
  { path: '/insurers', name: 'Insurers/Carriers', icon: <TeamOutlined /> },
  { path: '/billing', name: 'Billing & Finance', icon: <DollarOutlined /> },
  { path: '/reports', name: 'Reports', icon: <BarChartOutlined /> },
  { path: '/communications', name: 'Communication', icon: <MailOutlined /> },
  { path: '/users', name: 'User Management', icon: <UserOutlined /> },
  { path: '/email-templates', name: 'Email Templates', icon: <MailOutlined /> },
  { path: '/settings', name: 'Settings', icon: <SettingOutlined /> },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}> 
      <div className="sidebar-header">
        <span className="logo">Admin Portal</span>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span>{collapsed ? '»' : '«'}</span>
        </button>
      </div>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!collapsed && <span className="sidebar-label">{item.name}</span>}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink
              to="/rating-factors"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span className="sidebar-icon"><DatabaseOutlined /></span>
              {!collapsed && <span className="sidebar-label">Rating Factors</span>}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/rate-tables"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span className="sidebar-icon"><DatabaseOutlined /></span>
              {!collapsed && <span className="sidebar-label">Rate Tables</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
