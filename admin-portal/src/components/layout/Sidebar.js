import React, { useEffect } from 'react'; // Removed useState
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, Layout, Typography, Button } from 'antd';
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
  DatabaseOutlined,
  BookOutlined, // For Catalog
  CalculatorOutlined, // For Rating Engine
  SolutionOutlined, // For Client/User Management
  ToolOutlined, // For general settings/tools
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { SubMenu } = Menu;
const { Title } = Typography;

const menuItemsConfig = [
  { key: 'dashboard', path: '/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> },
  {
    key: 'catalog',
    name: 'Catalog Management',
    icon: <BookOutlined />,
    children: [
      { key: 'products', path: '/products', name: 'Products', icon: <AppstoreOutlined /> },
      { key: 'insurers', path: '/insurers', name: 'Insurers/Carriers', icon: <TeamOutlined /> },
    ]
  },
  {
    key: 'sales',
    name: 'Sales & Servicing',
    icon: <FileTextOutlined />, // Using a general icon for the group
    children: [
      { key: 'quotes', path: '/quotes', name: 'Quotes', icon: <FileTextOutlined /> },
      { key: 'policies', path: '/policies', name: 'Policies', icon: <FileDoneOutlined /> },
      { key: 'claims', path: '/claims', name: 'Claims', icon: <DatabaseOutlined /> }, // Claims can be under servicing
    ]
  },
  {
    key: 'ratingEngine',
    name: 'Rating Engine',
    icon: <CalculatorOutlined />,
    children: [
      { key: 'ratingFactors', path: '/rating-factors', name: 'Rating Factors', icon: <DatabaseOutlined /> },
      { key: 'rateTables', path: '/rate-tables', name: 'Rate Tables', icon: <DatabaseOutlined /> },
    ]
  },
  {
    key: 'clientManagement',
    name: 'User & Client Hub',
    icon: <SolutionOutlined />,
    children: [
      { key: 'users', path: '/users', name: 'User Management', icon: <UserOutlined /> },
      // { key: 'customers', path: '/customers', name: 'Client Profiles', icon: <TeamOutlined /> }, // If distinct from users
    ]
  },
  {
    key: 'operations',
    name: 'Operations',
    icon: <ToolOutlined />,
    children: [
      { key: 'billing', path: '/billing', name: 'Billing & Finance', icon: <DollarOutlined /> },
      { key: 'reports', path: '/reports', name: 'Reports', icon: <BarChartOutlined /> },
      { key: 'communications', path: '/communications', name: 'Communication Logs', icon: <MailOutlined /> },
    ]
  },
  {
    key: 'systemSettings',
    name: 'System Configuration',
    icon: <SettingOutlined />,
    children: [
      { key: 'emailTemplates', path: '/email-templates', name: 'Email Templates', icon: <MailOutlined /> },
      { key: 'generalSettings', path: '/settings', name: 'General Settings', icon: <SettingOutlined /> },
      // Add other specific settings pages here if they exist
    ]
  },
];


const Sidebar = ({ collapsed, onCollapse }) => { // Accept props
  const location = useLocation();
  const [openKeys, setOpenKeys] = React.useState([]); // useState needs React.useState

  // Determine selected keys and open keys based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    let selectedKey = '';
    let parentKey = '';

    for (const item of menuItemsConfig) {
      if (item.path === currentPath) {
        selectedKey = item.key;
        break;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.path === currentPath) {
            selectedKey = child.key;
            parentKey = item.key;
            break;
          }
        }
      }
      if (selectedKey) break;
    }

    // Set open keys for accordion effect
    if (parentKey && !collapsed) {
      setOpenKeys(prevOpenKeys => {
        if (prevOpenKeys.includes(parentKey)) return prevOpenKeys;
        // Ensure only one parent is open if that's the desired accordion style
        const parentExists = menuItemsConfig.find(item => item.key === parentKey && item.children);
        if (parentExists) return [parentKey];
        return prevOpenKeys;
      });
    } else if (collapsed) { // If sidebar is collapsed, close all submenus
        setOpenKeys([]);
    }
    // Note: selectedKey is handled by Menu component's defaultSelectedKeys / selectedKeys
  }, [location.pathname, collapsed]);


  const handleOpenChange = (keys) => { // Renamed to avoid conflict
    // Logic to allow only one submenu to be open at a time for accordion style
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    const rootSubmenuKeys = menuItemsConfig.filter(item => item.children).map(item => item.key);

    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys); // Allow opening items not in root (should not happen with current structure)
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []); // Standard accordion behavior
    }
  };

  const getSelectedKeys = () => {
    const currentPath = location.pathname;
    for (const item of menuItemsConfig) {
        if (item.path === currentPath) return [item.key];
        if (item.children) {
            const childMatch = item.children.find(child => child.path === currentPath);
            if (childMatch) return [childMatch.key];
        }
    }
    return [];
  };


  const renderMenuItems = (items) => {
    return items.map((item) => {
      if (item.children) {
        return (
          <SubMenu key={item.key} icon={item.icon} title={item.name}>
            {renderMenuItems(item.children)}
          </SubMenu>
        );
      }
      return (
        <Menu.Item key={item.key} icon={item.icon}>
          <NavLink to={item.path}>{item.name}</NavLink>
        </Menu.Item>
      );
    });
  };

  return (
    <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse} // Use prop for AntD's built-in trigger if it were visible
        trigger={null} // We use a custom button for toggle, so AntD trigger is hidden
        width={250}
        style={{ background: '#001529', minHeight: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 1000 }}
        className="admin-sidebar"
    >
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center': 'space-between', padding: '0 16px', background: '#002140' }}>
        {!collapsed && <Title level={4} style={{ color: 'white', margin: 0, whiteSpace: 'nowrap' }}>Admin Portal</Title>}
        <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => onCollapse(!collapsed)} // Use onCollapse prop
            style={{ color: 'white', fontSize: '16px' }}
        />
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        openKeys={openKeys} // Controlled by state
        onOpenChange={handleOpenChange} // Use new handler
        style={{ borderRight: 0 }}
      >
        {renderMenuItems(menuItemsConfig)}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
