import React from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

const MainLayout = ({ children, pageTitle, actions }) => {
  return (
    <div className="admin-layout" style={{ display: 'flex', flexGrow: 1, minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AdminHeader pageTitle={pageTitle} actions={actions} />
        <main className="main-content-area">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
