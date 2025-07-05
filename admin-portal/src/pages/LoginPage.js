import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Form, Input, Button, Typography, Alert, Row, Col, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
// No longer need loginService directly, will use login from useAuth
import { useAuth } from '../context/AuthContext'; // Import useAuth

const { Title } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm();
  const { login: contextLogin } = useAuth(); // Get login function from AuthContext, aliased to avoid name clash
  const navigate = useNavigate(); // Hook for navigation
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    try {
      // Call the login function from AuthContext
      // This function now handles token storage and setting isAuthenticated state
      const response = await contextLogin(values.email, values.password);

      if (response && response.success) { // Check if response itself is defined and successful
        console.log('Login successful via AuthContext!');
        // AuthContext's login function handles token storage and setting user state.
        // Now, navigate to the dashboard. Since Router has basename="/admin",
        // we navigate relative to that.
        navigate('/dashboard');
      } else {
        // This else block might not be strictly necessary if contextLogin always throws on failure.
        // However, it's good for robustness if contextLogin could return a non-error failure.
        setError(response?.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error('Login page error:', err);
      setError(err.message || 'Failed to login. An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {/* Optional: Add a logo here */}
            <Title level={2}>Admin Portal Login</Title>
          </div>

          {error && (
            <Alert
              message="Login Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              style={{ marginBottom: '24px' }}
            />
          )}

          <Form
            form={form}
            name="admin_login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please input your Email!' },
                { type: 'email', message: 'The input is not valid E-mail!' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;
