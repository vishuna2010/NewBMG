import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import MainLayout from '../components/layout/MainLayout';

const { Title } = Typography;

const AdminProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Simulated admin data
  const adminData = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    phone: '',
  };

  const handleProfileUpdate = (values) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Profile updated successfully!');
    }, 1000);
  };

  const handlePasswordChange = (values) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Password changed successfully!');
      form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
    }, 1000);
  };

  return (
    <MainLayout pageTitle="My Profile">
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <Card title={<Title level={4}>Profile Information</Title>} style={{ marginBottom: 32 }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={adminData}
            onFinish={handleProfileUpdate}
          >
            <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'Please enter your first name' }]}> <Input /> </Form.Item>
            <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: 'Please enter your last name' }]}> <Input /> </Form.Item>
            <Form.Item label="Email" name="email"> <Input disabled /> </Form.Item>
            <Form.Item label="Phone" name="phone"> <Input /> </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>Update Profile</Button>
            </Form.Item>
          </Form>
        </Card>
        <Card title={<Title level={4}>Change Password</Title>}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item label="Current Password" name="currentPassword" rules={[{ required: true, message: 'Please enter your current password' }]}> <Input.Password /> </Form.Item>
            <Form.Item label="New Password" name="newPassword" rules={[{ required: true, message: 'Please enter a new password' }]}> <Input.Password /> </Form.Item>
            <Form.Item label="Confirm New Password" name="confirmPassword" dependencies={["newPassword"]} rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}>
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>Change Password</Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminProfilePage;
