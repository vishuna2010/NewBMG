import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser } from '../services/userService';

const UserEditPage = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '', // Email typically not editable by admin directly or needs verification
    role: 'customer',
    isActive: true,
    customerType: 'Individual', // Specific to 'customer' role
    // Add other fields an admin might edit, e.g., phoneNumber, address components
    phoneNumber: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressZipCode: '',
    addressCountry: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const availableRoles = ['customer', 'agent', 'staff', 'admin'];
  const customerTypes = ['Individual', 'Business'];


  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("No user ID provided.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await getUserById(userId);
        if (response.success && response.data) {
          const fetchedUser = response.data;
          setUser(fetchedUser);
          setFormData({
            firstName: fetchedUser.firstName || '',
            lastName: fetchedUser.lastName || '',
            email: fetchedUser.email || '', // Display only
            role: fetchedUser.role || 'customer',
            isActive: fetchedUser.isActive !== undefined ? fetchedUser.isActive : true,
            customerType: fetchedUser.customerType || 'Individual',
            phoneNumber: fetchedUser.phoneNumber || '',
            addressStreet: fetchedUser.address?.street || '',
            addressCity: fetchedUser.address?.city || '',
            addressState: fetchedUser.address?.state || '',
            addressZipCode: fetchedUser.address?.zipCode || '',
            addressCountry: fetchedUser.address?.country || '',
          });
        } else {
          setError(response.error || 'User not found.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { email, ...dataToUpdate } = formData; // Exclude email from update payload by admin

    // Construct address object if fields are present
    const addressFields = ['addressStreet', 'addressCity', 'addressState', 'addressZipCode', 'addressCountry'];
    const addressUpdate = {};
    let hasAddressUpdate = false;
    addressFields.forEach(key => {
        const addressKey = key.replace('address', '').toLowerCase();
        if (dataToUpdate[key] !== undefined && dataToUpdate[key] !== '') { // Check if field is not empty or undefined
            addressUpdate[addressKey === 'street' ? 'street' : addressKey === 'zipcode' ? 'zipCode' : addressKey] = dataToUpdate[key];
            hasAddressUpdate = true;
        }
        delete dataToUpdate[key]; // Remove individual address fields from main payload
    });

    if (hasAddressUpdate) {
        dataToUpdate.address = addressUpdate;
    }

    // Ensure customerType is only sent if role is customer
    if (dataToUpdate.role !== 'customer') {
        delete dataToUpdate.customerType;
    }


    try {
      await updateUser(userId, dataToUpdate);
      alert('User updated successfully!');
      navigate('/admin/users');
    } catch (err) {
      setError(err.message);
      alert(`Error updating user: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading user details...</p>;
  if (error && !user) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!user) return <p>User not found.</p>;

  // Basic form styling (can be moved to a CSS file)
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px' };
  const labelStyle = { fontWeight: 'bold', marginBottom: '5px', display: 'block' };
  const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' };
  const buttonStyle = { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };

  return (
    <div>
      <h1 className="page-title">Edit User: {user.firstName} {user.lastName}</h1>
      <div className="content-wrapper">
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>Submit Error: {error}</p>}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label htmlFor="firstName" style={labelStyle}>First Name:</label>
            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required style={inputStyle} />
          </div>
          <div>
            <label htmlFor="lastName" style={labelStyle}>Last Name:</label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required style={inputStyle} />
          </div>
          <div>
            <label htmlFor="email" style={labelStyle}>Email (Display Only):</label>
            <input type="email" id="email" name="email" value={formData.email} readOnly disabled style={{...inputStyle, backgroundColor: '#e9ecef'}} />
          </div>
          <div>
            <label htmlFor="phoneNumber" style={labelStyle}>Phone Number:</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} style={inputStyle} />
          </div>

          <fieldset style={{border: '1px solid #ccc', padding: '10px', borderRadius: '4px'}}>
            <legend>Address</legend>
            <div>
                <label htmlFor="addressStreet" style={labelStyle}>Street:</label>
                <input type="text" id="addressStreet" name="addressStreet" value={formData.addressStreet} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
                <label htmlFor="addressCity" style={labelStyle}>City:</label>
                <input type="text" id="addressCity" name="addressCity" value={formData.addressCity} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
                <label htmlFor="addressState" style={labelStyle}>State/Province:</label>
                <input type="text" id="addressState" name="addressState" value={formData.addressState} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
                <label htmlFor="addressZipCode" style={labelStyle}>Zip/Postal Code:</label>
                <input type="text" id="addressZipCode" name="addressZipCode" value={formData.addressZipCode} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
                <label htmlFor="addressCountry" style={labelStyle}>Country:</label>
                <input type="text" id="addressCountry" name="addressCountry" value={formData.addressCountry} onChange={handleChange} style={inputStyle} />
            </div>
          </fieldset>

          <div>
            <label htmlFor="role" style={labelStyle}>Role:</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required style={inputStyle}>
              {availableRoles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>

          {formData.role === 'customer' && (
            <div>
              <label htmlFor="customerType" style={labelStyle}>Customer Type:</label>
              <select id="customerType" name="customerType" value={formData.customerType} onChange={handleChange} style={inputStyle}>
                {customerTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ marginRight: '5px' }} />
            <label htmlFor="isActive">Is Active</label>
          </div>

          <button type="submit" style={{...buttonStyle, marginTop: '20px'}} disabled={submitting}>
            {submitting ? 'Updating...' : 'Update User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserEditPage;
