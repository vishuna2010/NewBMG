import React, { useState } from 'react';
import { login as loginService } from '../services/authService'; // Renamed to avoid conflict
// We'll add useNavigate later when implementing redirect

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // const navigate = useNavigate(); // For redirecting after login
  // const { login } = useAuth(); // Assuming an AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginService(email, password); // Use the imported loginService
      if (response.success && response.token) {
        console.log('Login successful!');
        console.log('Token:', response.token);
        console.log('User data:', response.data);
        // For now, just log. Token storage and redirect will be handled later with AuthContext.
        // localStorage.setItem('adminToken', response.token); // Example: storing token
        // navigate('/admin/dashboard'); // Example: redirecting
        alert('Login successful! Token logged to console. User data: ' + JSON.stringify(response.data));
      } else {
        // This case might not be reached if handleAuthResponse throws for non-success,
        // but good for robustness if backend sends success:false.
        setError(response.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh', // Changed from 100vh to avoid overlap if there's a global header/footer
    padding: '20px',
    boxSizing: 'border-box',
  };

  const formStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    backgroundColor: '#ffffff',
  };

  const inputGroupStyle = {
    marginBottom: '20px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '1rem',
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  };

  const errorStyle = {
    color: 'red',
    marginBottom: '15px',
    textAlign: 'center',
    fontSize: '0.9rem',
  };

  return (
    <div style={pageStyle}>
      <div style={formStyle}>
        <h1 style={{ textAlign: 'center', marginBottom: '25px', color: '#2c3e50', fontSize: '1.8rem' }}>
          Admin Portal Login
        </h1>
        {error && <p style={errorStyle}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>
          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            style={buttonStyle}
            disabled={loading}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
