import React, { useState, useEffect } from 'react';
import { getLoggedInUserProfile, updateUserProfile } from '../services/authService'; // Assuming authService.js is created

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '', // Email is typically not editable by the user directly
    phoneNumber: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    dateOfBirth: '',
    customerType: 'Individual', // Default or from profile
  });
  const [initialProfile, setInitialProfile] = useState(null); // To compare for changes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage('');
      try {
        const response = await getLoggedInUserProfile();
        if (response.success && response.data) {
          const dob = response.data.dateOfBirth ? new Date(response.data.dateOfBirth).toISOString().split('T')[0] : '';
          const fetchedProfile = {
            ...response.data,
            address: response.data.address || { street: '', city: '', state: '', zipCode: '', country: '' },
            dateOfBirth: dob,
          };
          setProfile(fetchedProfile);
          setInitialProfile(fetchedProfile); // Store initial state for "Cancel"
        } else {
          setError(response.error || 'Failed to fetch profile.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    // Only fetch profile if not editing, or if initialProfile hasn't been set yet
    // This prevents re-fetching when toggling edit mode if data is already there.
    if (!initialProfile) {
        fetchProfile();
    } else {
        setLoading(false); // Already have data
    }
  }, [initialProfile]); // Depend on initialProfile to run once after first successful fetch

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfile(prev => ({ ...prev, address: { ...prev.address, [addressField]: value } }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditToggle = () => {
    if (isEditing && initialProfile) {
      // If cancelling edit, revert to initial fetched data
      setProfile(initialProfile);
    }
    setIsEditing(!isEditing);
    setError(null); // Clear errors when toggling edit mode
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage('');

    // Only send fields that are typically updatable by the user
    const { firstName, lastName, phoneNumber, address, dateOfBirth, customerType } = profile;
    const updateData = { firstName, lastName, phoneNumber, address, customerType };
    if(dateOfBirth) updateData.dateOfBirth = dateOfBirth; // Only include if not empty

    try {
      const response = await updateUserProfile(updateData);
      if (response.success && response.data) {
        const dob = response.data.dateOfBirth ? new Date(response.data.dateOfBirth).toISOString().split('T')[0] : '';
        const updatedProfile = {
             ...response.data,
             address: response.data.address || { street: '', city: '', state: '', zipCode: '', country: '' },
             dateOfBirth: dob
            };
        setProfile(updatedProfile);
        setInitialProfile(updatedProfile); // Update initial profile to new saved state
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(response.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Basic form styling
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' };
  const labelStyle = { fontWeight: 'bold', marginBottom: '3px', display: 'block', fontSize: '0.9em' };
  const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' };
  const buttonStyle = { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' };
  const displayTextStyle = { padding: '8px', border: '1px solid transparent', borderRadius: '4px', width: '100%', backgroundColor: '#f8f9fa' };


  if (loading && !initialProfile) return <p>Loading profile...</p>; // Show loading only if no data yet
  if (error && !initialProfile) return <p style={{ color: 'red' }}>Error: {error}</p>; // Show error only if no data yet
  if (!initialProfile && !loading) return <p>Could not load profile data.</p>; // If loading finished but no data

  return (
    <div className="page-content">
      <header className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>My Profile</h1>
        {!isEditing && (
          <button onClick={handleEditToggle} style={{...buttonStyle, backgroundColor: '#17a2b8'}}>Edit Profile</button>
        )}
      </header>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {error && !isEditing && <p style={{ color: 'red' }}>Error: {error}</p>} {/* Show general errors when not editing */}


      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label htmlFor="firstName" style={labelStyle}>First Name:</label>
          {isEditing ? (
            <input type="text" id="firstName" name="firstName" value={profile.firstName} onChange={handleChange} required style={inputStyle} />
          ) : (
            <div style={displayTextStyle}>{profile.firstName}</div>
          )}
        </div>
        <div>
          <label htmlFor="lastName" style={labelStyle}>Last Name:</label>
          {isEditing ? (
            <input type="text" id="lastName" name="lastName" value={profile.lastName} onChange={handleChange} required style={inputStyle} />
          ) : (
            <div style={displayTextStyle}>{profile.lastName}</div>
          )}
        </div>
        <div>
          <label htmlFor="email" style={labelStyle}>Email:</label>
          <div style={{...displayTextStyle, backgroundColor: '#e9ecef'}}>{profile.email}</div> {/* Email not editable */}
        </div>
        <div>
          <label htmlFor="phoneNumber" style={labelStyle}>Phone Number:</label>
          {isEditing ? (
            <input type="tel" id="phoneNumber" name="phoneNumber" value={profile.phoneNumber} onChange={handleChange} style={inputStyle} />
          ) : (
            <div style={displayTextStyle}>{profile.phoneNumber || 'N/A'}</div>
          )}
        </div>
        <div>
          <label htmlFor="dateOfBirth" style={labelStyle}>Date of Birth:</label>
          {isEditing ? (
            <input type="date" id="dateOfBirth" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleChange} style={inputStyle} />
          ) : (
            <div style={displayTextStyle}>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
          )}
        </div>

        <fieldset style={{border: '1px solid #ccc', padding: '10px', borderRadius: '4px', marginTop: '10px'}}>
            <legend>Address</legend>
            <div>
                <label htmlFor="address.street" style={labelStyle}>Street:</label>
                {isEditing ? <input type="text" id="address.street" name="address.street" value={profile.address.street} onChange={handleChange} style={inputStyle} /> : <div style={displayTextStyle}>{profile.address.street || 'N/A'}</div>}
            </div>
            <div>
                <label htmlFor="address.city" style={labelStyle}>City:</label>
                {isEditing ? <input type="text" id="address.city" name="address.city" value={profile.address.city} onChange={handleChange} style={inputStyle} /> : <div style={displayTextStyle}>{profile.address.city || 'N/A'}</div>}
            </div>
            <div>
                <label htmlFor="address.state" style={labelStyle}>State/Province:</label>
                {isEditing ? <input type="text" id="address.state" name="address.state" value={profile.address.state} onChange={handleChange} style={inputStyle} /> : <div style={displayTextStyle}>{profile.address.state || 'N/A'}</div>}
            </div>
            <div>
                <label htmlFor="address.zipCode" style={labelStyle}>Zip/Postal Code:</label>
                {isEditing ? <input type="text" id="address.zipCode" name="address.zipCode" value={profile.address.zipCode} onChange={handleChange} style={inputStyle} /> : <div style={displayTextStyle}>{profile.address.zipCode || 'N/A'}</div>}
            </div>
             <div>
                <label htmlFor="address.country" style={labelStyle}>Country:</label>
                {isEditing ? <input type="text" id="address.country" name="address.country" value={profile.address.country} onChange={handleChange} style={inputStyle} /> : <div style={displayTextStyle}>{profile.address.country || 'N/A'}</div>}
            </div>
        </fieldset>

        {profile.role === 'customer' && ( // Assuming role is part of profile data fetched
            <div>
                <label htmlFor="customerType" style={labelStyle}>Customer Type:</label>
                {isEditing ? (
                    <select id="customerType" name="customerType" value={profile.customerType} onChange={handleChange} style={inputStyle}>
                        <option value="Individual">Individual</option>
                        <option value="Business">Business</option>
                    </select>
                ) : (
                    <div style={displayTextStyle}>{profile.customerType}</div>
                )}
            </div>
        )}

        {isEditing && (
          <div style={{marginTop: '15px'}}>
            <button type="submit" style={buttonStyle} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={handleEditToggle} style={{...buttonStyle, backgroundColor: '#6c757d'}} disabled={submitting}>
              Cancel
            </button>
            {error && isEditing && <p style={{ color: 'red', marginTop: '10px' }}>Submit Error: {error}</p>} {/* Show submit errors while editing */}
          </div>
        )}
      </form>

      <div style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
        <button style={{...buttonStyle, backgroundColor: '#ffc107', color: 'black' }}>Change Password</button>
        <p style={{fontSize: '0.8em', color: '#666', marginTop: '5px'}}> (Password change functionality is not yet implemented)</p>
      </div>
    </div>
  );
};

export default ProfilePage;
