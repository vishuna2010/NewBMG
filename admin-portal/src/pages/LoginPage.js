import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Row, Col, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login as loginService } from '../services/authService';
// We'll add useNavigate later

const { Title } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm(); // AntD Form hook
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // const navigate = useNavigate();
  // const { login } = useAuth(); // Assuming an AuthContext

  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    try {
      const response = await loginService(values.email, values.password);
      if (response.success && response.token) {
        console.log('Login successful!');
        console.log('Token:', response.token);
        console.log('User data:', response.data);
        alert('Login successful! Token logged to console. User data: ' + JSON.stringify(response.data));
        // navigate('/admin/dashboard'); // Placeholder for future redirect
      } else {
        setError(response.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
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
