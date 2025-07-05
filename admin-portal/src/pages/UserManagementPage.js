import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, deleteUser } from '../services/userService'; // Assuming userService.js is created
import MainLayout from '../components/layout/MainLayout';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers(); // Add query params if needed, e.g., getAllUsers({ role: 'customer' })
      setUsers(response.data || []);
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
        alert('User deleted successfully!');
      } catch (err) {
        setError(err.message); // Display error related to delete
        alert(`Failed to delete user: ${err.message}`);
      }
    }
  };

  if (loading) return <MainLayout pageTitle="User Management"><p>Loading users...</p></MainLayout>;
  // A more sophisticated error display could be a dedicated component
  if (error && users.length === 0) return <MainLayout pageTitle="User Management"><p style={{ color: 'red' }}>Error fetching users: {error}</p></MainLayout>;


  return (
    <MainLayout pageTitle="User Management">
      {/* Optional: Button to create a new user if admin can do this directly */}
      {/* <Link to="/admin/users/new" style={buttonStyle}>+ Create New User</Link> */}

      {error && <p style={{ color: 'red', marginBottom: '10px' }}>Operation failed: {error}</p>}


      {users.length === 0 && !loading ? (
        <p>No users found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{user.firstName} {user.lastName}</td>
                <td style={{ padding: '8px' }}>{user.email}</td>
                <td style={{ padding: '8px' }}>{user.role}</td>
                <td style={{ padding: '8px' }}>{user.isActive ? 'Active' : 'Inactive'}</td>
                <td style={{ padding: '8px' }}>
                  <Link to={`/admin/users/edit/${user._id}`} style={{ marginRight: '10px', color: '#007bff' }}>Edit</Link>
                  <button
                      onClick={() => handleDelete(user._id)}
                      style={{ color: 'red', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      disabled={user.role === 'admin'} // Example: Prevent deleting other admins
                  >
                      Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </MainLayout>
  );
};

// const buttonStyle = {
//   marginBottom: '20px', display: 'inline-block', padding: '10px 15px',
//   backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px'
// };

// Trivial change for re-commit purposes

export default UserManagementPage;
