import React, { useState, useRef, useEffect } from 'react';
import { BellOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';

const AdminHeader = ({ pageTitle, actions }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Left side - Page title */}
        <div className="topbar-left">
          {pageTitle && (
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>
              {pageTitle}
            </h1>
          )}
        </div>

        {/* Right side - Actions and profile */}
        <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Page actions */}
          {actions && (
            <div className="page-actions">
              {actions}
            </div>
          )}

          {/* Notification bell */}
          <button className="topbar-action-btn" title="Notifications" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem' }}>
            <BellOutlined />
          </button>

          {/* Admin profile dropdown */}
          <div className="topbar-profile" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }} ref={dropdownRef}>
            <UserOutlined style={{ fontSize: '1.5rem', color: '#888' }} />
            <button
              className="topbar-profile-btn"
              style={{ background: 'none', border: 'none', fontWeight: 500, color: '#333', cursor: 'pointer', padding: 0 }}
              onClick={() => setDropdownOpen((open) => !open)}
            >
              Account <span style={{ fontSize: '0.8em', marginLeft: 4 }}>▼</span>
            </button>
            {dropdownOpen && (
              <div className="topbar-dropdown" style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 8, minWidth: 160, zIndex: 10 }}>
                <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                  <li>
                    <a href="/admin/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', color: '#333', textDecoration: 'none', fontWeight: 500 }}>
                      <UserOutlined /> Profile
                    </a>
                  </li>
                  <li>
                    <a href="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', color: '#333', textDecoration: 'none', fontWeight: 500 }}>
                      <SettingOutlined /> Settings
                    </a>
                  </li>
                  <li>
                    <a href="/admin/login" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', color: '#d9534f', textDecoration: 'none', fontWeight: 500 }}>
                      <LogoutOutlined /> Logout
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
