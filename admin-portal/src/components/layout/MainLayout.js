import React from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader'; // Optional Header for the content area

const MainLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="main-content-area">
        <AdminHeader /> {/* This header is part of the scrollable content area */}
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
