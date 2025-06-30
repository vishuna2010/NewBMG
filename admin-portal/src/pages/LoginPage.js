import React from 'react';

const LoginPage = () => {
  // This would typically be outside the MainLayout
  // For now, it's just a placeholder.
  // In a real app, this page would have its own minimal layout.
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Admin Portal Login</h1>
      <form>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" style={{ marginLeft: '10px', marginBottom: '10px' }} />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" style={{ marginLeft: '10px', marginBottom: '10px' }} />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
