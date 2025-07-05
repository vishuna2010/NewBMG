import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar'; // Sidebar now returns the Sider component
import AdminHeader from './AdminHeader';

const { Content, Footer } = Layout; // Sider is handled by Sidebar.js

const MainLayout = ({ children, pageTitle, actions }) => {
  // The collapsed state and toggle function should ideally live here or in App.js
  // if Sidebar's toggle button is to affect MainLayout's padding.
  // However, Ant Design's Layout with Sider handles this internally if Sider is a direct child of Layout.

  // For the new Sidebar structure, the Sider is fixed.
  // The Layout component from AntD will automatically adjust content padding
  // if the Sider is a direct child of it and not position:fixed itself within the Sider component.
  // Let's adjust Sidebar.js to NOT use position:fixed internally, and let Layout handle it.

  // The Sidebar component has been updated to be a fixed position Sider.
  // So, we need to manually adjust marginLeft for the Content area.
  // This requires knowing the state of the sidebar.
  // For now, we will assume the Sidebar component itself handles its own rendering and fixed positioning,
  // and MainLayout needs to adapt.

  // Let's get the collapsed state from Sidebar if possible, or make it a prop.
  // Simpler: Assume fixed widths for now and adjust if needed.
  // Collapsed width: 80px, Expanded width: 250px (as set in Sidebar.js)
  // This is still not ideal as MainLayout doesn't know about Sidebar's internal state.

  // The BEST approach is to use AntD's Layout structure correctly.
  // Sidebar.js should render an AntD Sider. MainLayout wraps it in AntD Layout.
  // Let's assume Sidebar.js is already doing this.
  // The `position: fixed` inside Sidebar.js might be the issue.
  // If Sidebar.js *only* renders `<Sider>...</Sider>` without its own fixed positioning,
  // then AntD Layout will manage the offset.

  // The Sidebar was made fixed. This means the Antd Layout parent needs to be aware of it.
  // The structure should be:
  // <Layout>
  //   <Sider (from Sidebar.js, but not self-fixed)>
  //   <Layout> // This inner Layout gets the marginLeft automatically
  //     <Header>
  //     <Content>
  //     <Footer>
  //   </Layout>
  // </Layout>

  // Let's assume Sidebar.js exports a Sider that is NOT self-fixed.
  // We will manage collapsed state here for MainLayout to pass to Sidebar
  // and to adjust content margin if we weren't using nested AntD Layout.

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed); // Removed as it's not used

  // These are typical Ant Design Sider widths
  const siderWidth = sidebarCollapsed ? 80 : 250;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      {/* Sidebar needs to accept collapsed and onCollapse props now */}

      <Layout style={{ marginLeft: siderWidth, transition: 'margin-left 0.2s' }}>
      {/* This marginLeft is the key for fixed sidebar */}
        <AdminHeader
          pageTitle={pageTitle}
          actions={actions}
          // Potentially pass sidebar toggle function to header if needed
          // sidebarCollapsed={sidebarCollapsed}
          // toggleSidebar={toggleSidebar}
        />
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div className="content-wrapper" style={{ padding: 24, background: '#fff', minHeight: 'calc(100vh - 64px - 24px - 70px)' }}>
            {/* Adjust minHeight considering header and footer */}
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Insurance Broker Platform ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
