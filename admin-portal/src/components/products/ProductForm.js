import React, { useState, useEffect } from 'react';

const ProductForm = ({ initialData = {}, onSubmit, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productType: 'Other', // Default value
    basePrice: '',
    currency: 'USD', // Default value
    coverageDetails: [], // [{ feature: '', details: '', isIncluded: true, limit: '' }]
    termsAndConditions: '',
    isActive: true,
    ...initialData, // Spread initialData to pre-fill form for editing
  });

  // If initialData changes (e.g., when data is fetched for edit mode), update formData
  useEffect(() => {
    if (isEditMode && initialData && Object.keys(initialData).length > 0) {
        // Ensure coverageDetails is initialized as an array if not present or null
        const coverage = initialData.coverageDetails && Array.isArray(initialData.coverageDetails)
            ? initialData.coverageDetails
            : [];
        setFormData({
            name: initialData.name || '',
            description: initialData.description || '',
            productType: initialData.productType || 'Other',
            basePrice: initialData.basePrice || '',
            currency: initialData.currency || 'USD',
            coverageDetails: coverage.map(cd => ({
                feature: cd.feature || '',
                details: cd.details || '',
                isIncluded: cd.isIncluded !== undefined ? cd.isIncluded : true,
                limit: cd.limit || ''
            })),
            termsAndConditions: initialData.termsAndConditions || '',
            isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        });
    }
  }, [initialData, isEditMode]);

  const productTypes = ['Auto', 'Home', 'Life', 'Health', 'Travel', 'Business', 'Other'];
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCoverageChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedCoverageDetails = formData.coverageDetails.map((item, i) =>
      i === index ? { ...item, [name]: type === 'checkbox' ? checked : value } : item
    );
    setFormData((prevData) => ({
      ...prevData,
      coverageDetails: updatedCoverageDetails,
    }));
  };

  const addCoverageDetail = () => {
    setFormData((prevData) => ({
      ...prevData,
      coverageDetails: [...prevData.coverageDetails, { feature: '', details: '', isIncluded: true, limit: '' }],
    }));
  };

  const removeCoverageDetail = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      coverageDetails: prevData.coverageDetails.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic type conversion for basePrice and limit
    const dataToSubmit = {
        ...formData,
        basePrice: parseFloat(formData.basePrice) || 0,
        coverageDetails: formData.coverageDetails.map(cd => ({
            ...cd,
            limit: cd.limit ? parseFloat(cd.limit) : undefined,
        })),
    };
    onSubmit(dataToSubmit);
  };

  // Basic form styling (can be moved to a CSS file)
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px' };
  const labelStyle = { fontWeight: 'bold', marginBottom: '5px', display: 'block' };
  const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' };
  const buttonStyle = { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
  const coverageItemStyle = { border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '4px' };


  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div>
        <label htmlFor="name" style={labelStyle}>Product Name:</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
      </div>
      <div>
        <label htmlFor="description" style={labelStyle}>Description:</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} required style={{...inputStyle, height: '80px'}} />
      </div>
      <div>
        <label htmlFor="productType" style={labelStyle}>Product Type:</label>
        <select id="productType" name="productType" value={formData.productType} onChange={handleChange} required style={inputStyle}>
          {productTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="basePrice" style={labelStyle}>Base Price:</label>
        <input type="number" id="basePrice" name="basePrice" value={formData.basePrice} onChange={handleChange} required min="0" step="0.01" style={inputStyle} />
      </div>
      <div>
        <label htmlFor="currency" style={labelStyle}>Currency:</label>
        <select id="currency" name="currency" value={formData.currency} onChange={handleChange} required style={inputStyle}>
          {currencies.map(curr => <option key={curr} value={curr}>{curr}</option>)}
        </select>
      </div>

      <div>
        <h4 style={{marginTop: '20px', marginBottom: '10px'}}>Coverage Details:</h4>
        {formData.coverageDetails.map((detail, index) => (
          <div key={index} style={coverageItemStyle}>
            <div>
              <label htmlFor={`coverageFeature-${index}`} style={labelStyle}>Feature:</label>
              <input type="text" id={`coverageFeature-${index}`} name="feature" value={detail.feature} onChange={(e) => handleCoverageChange(index, e)} required style={inputStyle} />
            </div>
            <div>
              <label htmlFor={`coverageDetails-${index}`} style={labelStyle}>Details (optional):</label>
              <input type="text" id={`coverageDetails-${index}`} name="details" value={detail.details} onChange={(e) => handleCoverageChange(index, e)} style={inputStyle} />
            </div>
            <div>
              <label htmlFor={`coverageLimit-${index}`} style={labelStyle}>Limit (optional, numeric):</label>
              <input type="number" id={`coverageLimit-${index}`} name="limit" value={detail.limit} onChange={(e) => handleCoverageChange(index, e)} style={inputStyle} step="0.01" />
            </div>
            <div style={{marginTop: '5px', display: 'flex', alignItems: 'center'}}>
              <input type="checkbox" id={`coverageIsIncluded-${index}`} name="isIncluded" checked={detail.isIncluded} onChange={(e) => handleCoverageChange(index, e)} style={{marginRight: '5px'}}/>
              <label htmlFor={`coverageIsIncluded-${index}`}>Is Included</label>
            </div>
            <button type="button" onClick={() => removeCoverageDetail(index)} style={{...buttonStyle, backgroundColor: '#dc3545', marginTop: '10px', fontSize: '0.8em', padding: '5px 10px'}}>Remove Coverage</button>
          </div>
        ))}
        <button type="button" onClick={addCoverageDetail} style={{...buttonStyle, backgroundColor: '#28a745', marginTop: '10px'}}>+ Add Coverage Detail</button>
      </div>

      <div>
        <label htmlFor="termsAndConditions" style={labelStyle}>Terms & Conditions (optional):</label>
        <textarea id="termsAndConditions" name="termsAndConditions" value={formData.termsAndConditions} onChange={handleChange} style={{...inputStyle, height: '80px'}} />
      </div>
      <div style={{marginTop: '5px', display: 'flex', alignItems: 'center'}}>
        <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} style={{marginRight: '5px'}} />
        <label htmlFor="isActive">Is Active</label>
      </div>
      <button type="submit" style={{...buttonStyle, marginTop: '20px'}}>{isEditMode ? 'Update Product' : 'Create Product'}</button>
    </form>
  );
};

export default ProductForm;
