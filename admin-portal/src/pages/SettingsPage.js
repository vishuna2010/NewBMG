import React, { useState } from 'react';
import { Card, Switch, Typography, Checkbox, Divider, message } from 'antd';
import MainLayout from '../components/layout/MainLayout';

const { Title } = Typography;

const SettingsPage = () => {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({ email: true, sms: false, inApp: true });

  const handleThemeChange = (checked) => {
    setTheme(checked ? 'dark' : 'light');
    message.info(`Theme set to ${checked ? 'Dark' : 'Light'} mode`);
  };

  const handleNotificationChange = (type) => (e) => {
    setNotifications({ ...notifications, [type]: e.target.checked });
  };

  return (
    <MainLayout pageTitle="Settings">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Card title={<Title level={4}>System Preferences</Title>} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>Theme:</span>
            <Switch
              checkedChildren="Dark"
              unCheckedChildren="Light"
              checked={theme === 'dark'}
              onChange={handleThemeChange}
            />
            <span style={{ marginLeft: 12 }}>{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
          </div>
        </Card>
        <Card title={<Title level={4}>Notification Preferences</Title>} style={{ marginBottom: 32 }}>
          <Checkbox checked={notifications.email} onChange={handleNotificationChange('email')}>Email Notifications</Checkbox>
          <Divider type="vertical" />
          <Checkbox checked={notifications.sms} onChange={handleNotificationChange('sms')}>SMS Notifications</Checkbox>
          <Divider type="vertical" />
          <Checkbox checked={notifications.inApp} onChange={handleNotificationChange('inApp')}>In-App Notifications</Checkbox>
        </Card>
        <Card title={<Title level={4}>Integrations</Title>}>
          <p>Integrations with third-party services (e.g., payment gateways, email providers) will appear here.</p>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
